// services/quickClashServices/quickClashTeamBattleService.js
const mongoose = require('mongoose')
const QuickClashTeamBattle = require('../../model/quickClashSchemas/quickClashTeamBattleSchema')
const QuickClashTeam = require('../../model/quickClashSchemas/quickClashTeamSchema')
const QuickClashTeamTrophyHistory = require('../../model/quickClashSchemas/quickClashTeamTrophyHistorySchema')
const QuickClashChallenge = require('../../model/quickClashSchemas/quickClashChallengeSchema')
const User = require('../../model/userSchema')
const {
  getSourceArticle,
  generateHindiTranslation,
} = require('./quickClashArticleService')
const {
  generateQuickClashQuiz,
  translateQuizBackground,
} = require('../../utils/quickClashUtils')
const { DEFAULT_STARTING_TROPHIES } = require('./quickClashTrophyService')
const { updateTeamMatchStatus } = require('./quickClashTeamService')
const globalEmitter = require('../../eventEmitter')
const Article = require('../../model/articleSchema')
const QuickClashQuiz = require('../../model/quickClashSchemas/quickClashQuizSchema')
const ArticleHighlight = require('../../model/articleHighlightSchema')
const {
  copyHighlightsToChallenge,
  createPlaceholderHighlight,
} = require('../../utils/quickClashHighlightIntegration.utils')
const QuickClashGlobalMatchmaking = require('../../model/quickClashSchemas/quickClashGlobalMatchmakingSchema')
const QuickClashTeamMatchmaking = require('../../model/quickClashSchemas/quickClashTeamMatchmakingSchema')
const {
  lockTeamsInMatchmaking,
  unlockTeamsInMatchmaking,
  calculateFinalTrophies,
} = require('../../utils/quickClashTeamUtils')
const { makeRetryable } = require('../../utils/retryUtils')
const { createBattleExpiryEvent } = require('./quickClashBattleExpiryService')

// Constants
const TEAM_BATTLE_EXPIRY = 24 * 60 * 60 * 1000 // 24 hours same as regular challenges
const BASE_TROPHIES = 120 // Base trophies for 4v4 mode
const TROPHY_K_FACTOR = 0.8 // From trophy formula

/**
 * Clean up all matchmaking entries when battle creation fails completely
 * @param {Object} params - Parameters
 * @param {string} params.teamAId - Team A ID
 * @param {string} params.teamBId - Team B ID
 * @returns {Promise<void>}
 */
const cleanupFailedBattleMatchmaking = async ({ teamAId, teamBId }) => {
  console.log(`[TeamBattle] Starting cleanup for failed battle creation`)

  try {
    // Get both teams to extract member IDs
    const [teamA, teamB] = await Promise.all([
      QuickClashTeam.findById(teamAId).populate('members.user', '_id').lean(),
      QuickClashTeam.findById(teamBId).populate('members.user', '_id').lean(),
    ])

    // Extract all member IDs
    const allMemberIds = []
    if (teamA && teamA.members) {
      allMemberIds.push(...teamA.members.map(m => m.user._id))
    }
    if (teamB && teamB.members) {
      allMemberIds.push(...teamB.members.map(m => m.user._id))
    }

    console.log(
      `[TeamBattle] Cleaning up matchmaking for ${allMemberIds.length} players`,
    )

    // Remove all team matchmaking entries for both teams
    await Promise.all([
      QuickClashTeamMatchmaking.deleteMany({
        team: { $in: [teamAId, teamBId] },
      }),
      // Remove global matchmaking entries for all team members
      QuickClashGlobalMatchmaking.deleteMany({ user: { $in: allMemberIds } }),
      // Reset team status to not in match
      QuickClashTeam.updateMany(
        { _id: { $in: [teamAId, teamBId] } },
        { isInMatch: false },
      ),
    ])

    console.log(`[TeamBattle] Cleanup completed successfully`)

    // Emit event to notify users about the cleanup
    setTimeout(() => {
      globalEmitter.emit('quickClash:battleCreationCleanedUp', {
        teamA: teamAId,
        teamB: teamBId,
        memberIds: allMemberIds.map(id => id.toString()),
        message:
          'Battle creation failed. Please try joining matchmaking again.',
      })
    }, 0)
  } catch (cleanupError) {
    console.error(`[TeamBattle] Error during cleanup:`, cleanupError)
    // Even if cleanup fails, we should still notify users
    setTimeout(() => {
      globalEmitter.emit('quickClash:battleCreationCleanedUp', {
        teamA: teamAId,
        teamB: teamBId,
        memberIds: [],
        message:
          'Battle creation failed. Please restart the app and try again.',
      })
    }, 0)
  }
}

/**
 * Create a new team battle between two teams
 * @param {Object} params - Parameters
 * @param {string} params.teamAId - Team A ID
 * @param {string} params.teamBId - Team B ID
 * @param {Array<string>} params.categories - Categories for the battle (4 categories)
 * @param {mongoose.ClientSession} [params.session] - Mongoose session for transactions
 * @returns {Promise<Object>} Created team battle
 */
const createTeamBattle = makeRetryable(
  async ({ teamAId, teamBId, categories, session: providedSession }) => {
    console.log(`[TeamBattle] ===== STARTING TEAM BATTLE CREATION =====`)
    console.log(
      `[TeamBattle] TeamA: ${teamAId}, TeamB: ${teamBId}, Categories: ${categories.join(
        ', ',
      )}`,
    )

    // Use provided session or create a new one
    const session = providedSession || (await mongoose.startSession())
    let startedTransaction = false

    try {
      if (!providedSession) {
        startedTransaction = true
        await session.startTransaction()
        console.log(`[TeamBattle] Started new transaction`)
      } else {
        console.log(`[TeamBattle] Using provided transaction session`)
      }

      // ======= PHASE 0: LOCK TEAMS IN MATCHMAKING (0%) =======
      console.log(`[TeamBattle] PHASE 0: Locking teams in matchmaking`)
      await lockTeamsInMatchmaking({ teamAId, teamBId, session })
      // Get both teams with their members for notifications
      const [teamAData, teamBData] = await Promise.all([
        QuickClashTeam.findById(teamAId)
          .populate('members.user', '_id name inGameName')
          .lean()
          .session(session),
        QuickClashTeam.findById(teamBId)
          .populate('members.user', '_id name inGameName')
          .lean()
          .session(session),
      ])

      // Extract member IDs for each team
      const teamAMemberIds =
        teamAData?.members?.map(m => m.user._id.toString()) || []
      const teamBMemberIds =
        teamBData?.members?.map(m => m.user._id.toString()) || []

      // Combined list of all involved members
      const allMemberIds = [...teamAMemberIds, ...teamBMemberIds]
      // Emit event to notify users that battle creation started with all member IDs
      setTimeout(() => {
        globalEmitter.emit('quickClash:battleCreationStarted', {
          teamA: teamAId,
          teamB: teamBId,
          teamAMembers: teamAMemberIds,
          teamBMembers: teamBMemberIds,
          allMembers: allMemberIds,
        })
      }, 0)

      // ======= PROGRESS: BATTLE INITIALIZATION (5%) =======
      console.log(`[TeamBattle] PHASE 1: Battle initialization (5%)`)

      // ======= PROGRESS: LOADING TEAM DATA (15%) =======
      console.log(`[TeamBattle] PHASE 2: Loading team data (15%)`)

      // Get team data
      let teamA, teamB

      console.log(`[TeamBattle] Fetching Team A (${teamAId}) data`)
      teamA = await QuickClashTeam.findById(teamAId)
        .populate('members.user', '_id name inGameName quickClashTrophies')
        .session(session)

      if (!teamA) {
        console.error(`[TeamBattle] ERROR: Team A (${teamAId}) not found`)
        throw new Error('Team A not found')
      }
      console.log(
        `[TeamBattle] Team A loaded: ${teamA.name}, Members: ${teamA.members.length}`,
      )

      // Get real team B data
      console.log(`[TeamBattle] Fetching Team B (${teamBId}) data`)
      teamB = await QuickClashTeam.findById(teamBId)
        .populate('members.user', '_id name inGameName quickClashTrophies')
        .session(session)

      if (!teamB) {
        console.error(`[TeamBattle] ERROR: Team B (${teamBId}) not found`)
        throw new Error('Team B not found')
      }
      console.log(
        `[TeamBattle] Team B loaded: ${teamB.name}, Members: ${teamB.members.length}`,
      )

      // Set team names if they're empty (matchmaking-created teams)
      if (!teamA.name || teamA.name.trim() === '') {
        teamA.name = 'Team A'
        await teamA.save({ session })
      }

      if (!teamB.name || teamB.name.trim() === '') {
        teamB.name = 'Team B'
        await teamB.save({ session })
      }

      // ======= PROGRESS: TEAMS LOADED (25%) =======
      console.log(`[TeamBattle] PHASE 3: Teams loaded (25%)`)

      // ======= PROGRESS: PREPARING CONTENT (35%) =======
      console.log(`[TeamBattle] PHASE 4: Preparing content (35%)`)

      // Create challenges for each category
      const challengesData = []
      const challengeCreationPromises = []

      // Create placeholder data structure for challenges
      console.log(
        `[TeamBattle] Creating challenge placeholder data for ${categories.length} categories`,
      )
      for (const category of categories) {
        challengesData.push({
          category,
          challenge: null, // Will be filled later
          teamAPlayer: null,
          teamBPlayer: null,
          teamAScore: 0,
          teamBScore: 0,
          winner: null,
          teamACompleted: false,
          teamBCompleted: false,
        })
      }

      // Calculate average trophies for each team
      console.log(`[TeamBattle] Calculating team trophy averages`)
      const teamAAvgTrophies = calculateTeamAverageTrophies(teamA)
      const teamBAvgTrophies = calculateTeamAverageTrophies(teamB)
      console.log(
        `[TeamBattle] Trophy averages - Team A: ${teamAAvgTrophies}, Team B: ${teamBAvgTrophies}`,
      )

      // ======= PROGRESS: PROCESSING ARTICLES (45%) =======
      console.log(`[TeamBattle] PHASE 5: Processing articles (45%)`)

      // Extract team member data
      console.log(`[TeamBattle] Extracting team member data`)
      const teamAMembers = teamA.members.map(member => ({
        user: member.user._id,
        category: null,
        challenge: null,
        participated: false,
        completed: false,
        score: 0,
        previousTrophies:
          member.user.quickClashTrophies || DEFAULT_STARTING_TROPHIES,
        newTrophies: 0,
        trophyChange: 0,
      }))

      const teamBMembers = teamB.members.map(member => ({
        user: member.user._id,
        category: null,
        challenge: null,
        participated: false,
        completed: false,
        score: 0,
        previousTrophies:
          member.user.quickClashTrophies || DEFAULT_STARTING_TROPHIES,
        newTrophies: 0,
        trophyChange: 0,
      }))

      // ======= PROGRESS: BATTLE SETUP (55%) =======
      console.log(`[TeamBattle] PHASE 6: Battle setup (55%)`)

      // Create the team battle
      console.log(`[TeamBattle] Creating team battle object`)
      const teamBattle = new QuickClashTeamBattle({
        teamA: teamAId,
        teamB: teamBId,
        status: 'active',
        categories,
        challenges: challengesData,
        teamAMembers,
        teamBMembers,
        expiresAt: new Date(Date.now() + TEAM_BATTLE_EXPIRY),
        fromMatchmaking: true,
      })

      // Calculate potential trophy exchange
      console.log(`[TeamBattle] Calculating potential trophy exchange`)
      const potentialTrophyExchange = calculatePotentialTrophyExchange(
        teamAAvgTrophies,
        teamBAvgTrophies,
      )
      console.log(
        `[TeamBattle] Potential trophy exchange: ${potentialTrophyExchange}`,
      )

      // Set trophy exchange base info in battle
      teamBattle.trophyExchange = {
        baseAmount: BASE_TROPHIES,
        adjustedAmount: potentialTrophyExchange,
        bonuses: {
          strongerTeam: {
            applied: false, // Will be determined at the end
            amount: 0,
          },
          allWins: {
            applied: false, // Will be determined at the end
            amount: 0,
          },
        },
        finalAmount: potentialTrophyExchange,
        perPlayerAmount: Math.round(potentialTrophyExchange / 4),
      }

      console.log(`[TeamBattle] Saving initial team battle`)
      await teamBattle.save({ session })
      console.log(`[TeamBattle] Team battle saved with ID: ${teamBattle._id}`)

      // ======= PROGRESS: GENERATING CHALLENGES (65%) =======
      console.log(`[TeamBattle] PHASE 7: Generating challenges (65%)`)

      // Store created challenges for quiz generation
      const createdChallenges = []

      // Now fetch articles and create challenges for each category
      console.log(
        `[TeamBattle] Creating challenges for ${categories.length} categories`,
      )
      for (let i = 0; i < categories.length; i++) {
        const category = categories[i]
        console.log(
          `[TeamBattle] Processing category ${i + 1}/${
            categories.length
          }: ${category}`,
        )

        // Get a source article for this category
        console.log(
          `[TeamBattle] Fetching source article for category: ${category}`,
        )
        const article = await getSourceArticle({ category })
        console.log(
          `[TeamBattle] Got article: ${article._id}, Title: ${article.title}`,
        )

        // Check if Hindi translation exists
        const hasHindiTranslation = !!(
          article.hindiTitle &&
          article.hindiMainText &&
          article.hindiMainText.length > 0
        )
        console.log(
          `[TeamBattle] Article has Hindi translation: ${hasHindiTranslation}`,
        )

        // Format article data
        let articleData = {
          title: {
            english: article.title,
            hindi: article.hindiTitle || '',
          },
          content: {
            english: article.mainText,
            hindi: article.hindiMainText ? article.hindiMainText.join(' ') : '',
          },
          sourceArticles: [article._id],
        }

        // Generate Hindi translation if it doesn't exist
        if (!hasHindiTranslation) {
          console.log(
            `[TeamBattle] Generating Hindi translation for article ${article._id}`,
          )
          try {
            const hindiTranslation = await generateHindiTranslation({
              title: article.title,
              content: article.mainText,
            })
            console.log(`[TeamBattle] Hindi translation generated successfully`)

            // Update article data with the new translation
            articleData.title.hindi = hindiTranslation.title
            articleData.content.hindi = hindiTranslation.content

            // Optionally update the original article for future use
            try {
              // Convert content string to array format as expected by schema
              const hindiContentArray = [hindiTranslation.content]

              await Article.findByIdAndUpdate(article._id, {
                hindiTitle: hindiTranslation.title,
                hindiMainText: hindiContentArray,
              })

              console.log(
                `[TeamBattle] Updated article ${article._id} with Hindi translation`,
              )
            } catch (updateError) {
              console.error(
                `[TeamBattle] Error updating article with Hindi translation: ${updateError.message}`,
                updateError,
              )
              // Continue with the challenge creation even if saving to article fails
            }
          } catch (translationError) {
            console.error(
              `[TeamBattle] Error generating Hindi translation for team battle: ${translationError.message}`,
              translationError,
            )
            // Continue with empty Hindi content if translation fails
          }
        }

        // ======= PROGRESS: CHALLENGE CREATION (70% + i*5) =======
        // Update progress as each challenge is created (65% to 85%)
        const progressPercent = 70 + i * 5 // Will increment from 70% to 85% as i goes from 0 to 3
        console.log(
          `[TeamBattle] Creating challenge ${i + 1}/${
            categories.length
          } (${progressPercent}%)`,
        )

        // Create the challenge
        const challenge = new QuickClashChallenge({
          challenger: null, // Will be set when a player selects this category
          opponent: null, // Will be set when a player selects this category
          selectedCategories: [category],
          category,
          status: 'active',
          article: articleData,
          expiresAt: teamBattle.expiresAt,
          fromTeamBattle: true,
          teamBattle: teamBattle._id,
        })

        console.log(`[TeamBattle] Saving challenge for category: ${category}`)
        await challenge.save({ session })
        console.log(`[TeamBattle] Challenge saved with ID: ${challenge._id}`)
        createdChallenges.push({ challenge, article, articleData })

        // Update the team battle with the challenge ID
        teamBattle.challenges[i].challenge = challenge._id
      }

      // ======= PROGRESS: CREATING EXPIRY EVENT (67%) =======
      console.log(`[TeamBattle] PHASE 7.5: Creating battle expiry event (67%)`)

      // Create expiry event for automatic battle completion
      // This happens within the transaction, but failure won't abort battle creation
      await createBattleExpiryEvent({
        battleId: teamBattle._id,
        expiresAt: teamBattle.expiresAt,
        session,
      }).catch(error => {
        // Log error but don't fail battle creation
        console.error(
          `[TeamBattle] Warning: Failed to create expiry event for battle ${teamBattle._id}:`,
          error,
        )
        // The fallback cron job will handle this battle if needed
      })

      // ======= PROGRESS: CHALLENGES READY (85%) =======
      console.log(`[TeamBattle] PHASE 8: Challenges ready (85%)`)

      // Save team battle again with challenge IDs
      console.log(`[TeamBattle] Updating team battle with challenge IDs`)
      await teamBattle.save({ session })
      console.log(`[TeamBattle] Team battle updated with challenge IDs`)

      // ======= PROGRESS: GENERATING QUIZZES (90%) =======
      console.log(`[TeamBattle] PHASE 9: Generating quizzes (90%)`)

      // For each challenge, generate quizzes and highlights in parallel
      console.log(
        `[TeamBattle] Generating quizzes for ${createdChallenges.length} challenges in parallel`,
      )

      // Create an array of promises for quiz generation
      const quizGenerationPromises = createdChallenges.map(
        async ({ challenge, article, articleData }, index) => {
          console.log(
            `[TeamBattle] Starting quiz generation for challenge ${index + 1}/${
              createdChallenges.length
            }: ${challenge._id} (Category: ${challenge.category})`,
          )

          try {
            // Update progress with more granular steps
            const progressStep = 90 + index * (5 / createdChallenges.length)

            // Generate English quiz
            console.log(
              `[TeamBattle] Generating English quiz for challenge: ${challenge._id}`,
            )
            console.log(
              `[TeamBattle] Article title: "${articleData.title.english}"`,
            )
            console.log(
              `[TeamBattle] Article content length: ${articleData.content.english.length} chars`,
            )

            const englishQuiz = await generateQuickClashQuiz({
              title: articleData.title.english,
              author: article.author || 'Rapid Recap Team',
              mainText: articleData.content.english,
              challenge,
              language: 'en',
              session,
            })
            console.log(
              `[TeamBattle] English quiz generated with ID: ${englishQuiz._id}, Questions: ${englishQuiz.questions.length}`,
            )

            // Create Hindi quiz placeholder
            console.log(
              `[TeamBattle] Creating Hindi quiz placeholder for challenge: ${challenge._id}`,
            )
            const hindiQuiz = new QuickClashQuiz({
              challenge: challenge._id,
              language: 'hi',
              questions: [], // Empty initially
              overallDifficulty: englishQuiz.overallDifficulty,
              translationStatus: 'pending',
            })

            await hindiQuiz.save({ session })
            console.log(
              `[TeamBattle] Hindi quiz placeholder created with ID: ${hindiQuiz._id}`,
            )

            // Process highlights in parallel (if applicable)
            const highlightPromises = []

            // English highlights
            highlightPromises.push(
              (async () => {
                console.log(
                  `[TeamBattle] Processing English highlights for article: ${article._id}`,
                )
                let englishHighlight = await ArticleHighlight.findOne({
                  articleId: article._id,
                  language: 'en',
                  processingStatus: 'completed',
                }).session(session)

                if (englishHighlight) {
                  console.log(
                    `[TeamBattle] Found existing English highlights, copying to challenge`,
                  )
                  return copyHighlightsToChallenge({
                    articleHighlight: englishHighlight,
                    challengeId: challenge._id,
                    lang: 'en',
                    session,
                  })
                } else {
                  console.log(
                    `[TeamBattle] No existing English highlights found, creating placeholder`,
                  )
                  return createPlaceholderHighlight({
                    challengeId: challenge._id,
                    lang: 'en',
                    session,
                  })
                }
              })(),
            )

            // Hindi highlights
            highlightPromises.push(
              (async () => {
                console.log(
                  `[TeamBattle] Processing Hindi highlights for article: ${article._id}`,
                )
                let hindiHighlight = await ArticleHighlight.findOne({
                  articleId: article._id,
                  language: 'hi',
                  processingStatus: 'completed',
                }).session(session)

                if (hindiHighlight) {
                  console.log(
                    `[TeamBattle] Found existing Hindi highlights, copying to challenge`,
                  )
                  return copyHighlightsToChallenge({
                    articleHighlight: hindiHighlight,
                    challengeId: challenge._id,
                    lang: 'hi',
                    session,
                  })
                } else {
                  console.log(
                    `[TeamBattle] No existing Hindi highlights found, creating placeholder`,
                  )
                  return createPlaceholderHighlight({
                    challengeId: challenge._id,
                    lang: 'hi',
                    session,
                  })
                }
              })(),
            )

            // Wait for highlights to be processed
            const [englishHighlight, hindiHighlight] = await Promise.all(
              highlightPromises,
            )
            console.log(
              `[TeamBattle] Highlights processing completed for challenge: ${challenge._id}`,
            )

            // Return data needed for translation after transaction completes
            return {
              challengeId: challenge._id,
              hindiQuizId: hindiQuiz._id,
              hindiTitle: articleData.title.hindi,
              hindiMainText: articleData.content.hindi,
              englishQuiz,
            }
          } catch (error) {
            console.error(
              `[TeamBattle] Error processing challenge ${challenge._id}: ${error.message}`,
            )
            console.error(`[TeamBattle] Stack: ${error.stack}`)
            // Rethrow to fail the Promise.all if needed
            throw error
          }
        },
      )

      // Execute all quiz generation promises in parallel
      try {
        console.log(
          `[TeamBattle] Waiting for all ${quizGenerationPromises.length} quiz generation tasks to complete`,
        )
        const quizResults = await Promise.all(quizGenerationPromises)
        console.log(`[TeamBattle] All quizzes generated successfully`)

        // Store translation data for later scheduling
        const translationData = quizResults.map(result => ({
          challengeId: result.challengeId,
          hindiQuizId: result.hindiQuizId,
          hindiTitle: result.hindiTitle,
          hindiMainText: result.hindiMainText,
          englishQuiz: result.englishQuiz,
        }))

        console.log(`[TeamBattle] PHASE 10: Matchmaking cleanup (95%)`)

        // Clean up all matchmaking entries before emitting events
        try {
          await cleanupMatchmakingEntries({
            teamAId,
            teamBId,
            session,
          })
          console.log(`[TeamBattle] Matchmaking cleanup completed successfully`)
        } catch (cleanupError) {
          console.error(
            `[TeamBattle] Error during matchmaking cleanup:`,
            cleanupError,
          )
          // Don't throw here - the battle is created, we just log the error
          // The cleanup is important but shouldn't fail the entire battle creation
        }

        // If we started a transaction, commit it
        if (startedTransaction) {
          console.log(`[TeamBattle] Committing transaction`)
          await session.commitTransaction()
          console.log(`[TeamBattle] Transaction committed successfully`)
        }

        // ======= PROGRESS: BATTLE READY (100%) =======
        console.log(`[TeamBattle] PHASE 11: Battle ready (100%)`)

        // Schedule translations (outside transaction)
        translationData.forEach(
          ({
            challengeId,
            hindiQuizId,
            hindiTitle,
            hindiMainText,
            englishQuiz,
          }) => {
            if (challengeId && hindiQuizId) {
              console.log(
                `[TeamBattle] Scheduling background Hindi translation for challenge: ${challengeId}`,
              )
              setTimeout(() => {
                console.log(
                  `[TeamBattle] Starting background Hindi translation for challenge: ${challengeId}`,
                )
                translateQuizBackground({
                  englishQuiz,
                  challengeId,
                  hindiQuizId,
                  hindiTitle,
                  hindiMainText,
                }).catch(err => {
                  console.error(
                    `[TeamBattle] Background Hindi translation failed for challenge ${challengeId}: ${err.message}`,
                    err,
                  )
                })
              }, 1000)
            }
          },
        )

        // Emit event after transaction is complete
        console.log(`[TeamBattle] Setting up event emission`)

        console.log(
          `[TeamBattle] ===== TEAM BATTLE CREATION COMPLETED SUCCESSFULLY =====`,
        )
        console.log(
          `[TeamBattle] Battle ID: ${teamBattle._id}, Team A: ${teamAId}, Team B: ${teamBId}`,
        )
        return teamBattle
      } catch (quizError) {
        console.error(
          `[TeamBattle] Failed to generate quizzes for all challenges: ${quizError.message}`,
        )
        // Transaction will be aborted in the outer catch block
        throw quizError
      }
    } catch (error) {
      console.error(
        `[TeamBattle] ===== ERROR CREATING TEAM BATTLE =====`,
        error,
      )
      console.error(`[TeamBattle] Error message: ${error.message}`)
      console.error(`[TeamBattle] TeamA: ${teamAId}, TeamB: ${teamBId}`)

      // IMPORTANT: Unlock teams when battle creation fails
      try {
        console.log(`[TeamBattle] Unlocking teams due to error`)
        // Get both teams with their members for notifications
        const [teamAData, teamBData] = await Promise.all([
          QuickClashTeam.findById(teamAId)
            .populate('members.user', '_id name inGameName')
            .lean()
            .session(session),
          QuickClashTeam.findById(teamBId)
            .populate('members.user', '_id name inGameName')
            .lean()
            .session(session),
        ])

        // Extract member IDs for each team
        const teamAMemberIds =
          teamAData?.members?.map(m => m.user._id.toString()) || []
        const teamBMemberIds =
          teamBData?.members?.map(m => m.user._id.toString()) || []

        // Combined list of all involved members
        const allMemberIds = [...teamAMemberIds, ...teamBMemberIds]
        await unlockTeamsInMatchmaking({
          teamAId,
          teamBId,
          teamAMembers: teamAMemberIds,
          teamBMembers: teamBMemberIds,
          allMembers: allMemberIds,
          session,
        })

        // Emit event to notify users that battle creation failed
        setTimeout(() => {
          globalEmitter.emit('quickClash:battleCreationFailed', {
            teamA: teamAId,
            teamB: teamBId,
            teamAMembers: teamAMemberIds || [],
            teamBMembers: teamBMemberIds || [],
            allMembers: allMemberIds || [],
            error: error.message,
          })
        }, 0)
      } catch (unlockError) {
        console.error(`[TeamBattle] Error unlocking teams:`, unlockError)
      }

      if (startedTransaction) {
        console.log(`[TeamBattle] Aborting transaction due to error`)
        await session.abortTransaction()
        console.log(`[TeamBattle] Transaction aborted`)
      }
      throw error
    } finally {
      if (startedTransaction) {
        console.log(`[TeamBattle] Ending session`)
        session.endSession()
      }
    }
  },
  {
    maxRetries: 3,
    operationName: 'CreateTeamBattle',
    initialDelay: 1000,
    maxDelay: 5000,
    onRetry: (error, attempt) => {
      console.log(
        `[TeamBattle] Retry attempt ${attempt}/3 after error: ${error.message}`,
      )
      // Emit retry event for UI feedback
      setTimeout(() => {
        globalEmitter.emit('quickClash:battleCreationRetrying', {
          attempt,
          error: error.message,
          maxRetries: 3,
        })
      }, 0)
    },
    // Custom error handler for when all retries fail
    onAllRetriesFailed: async (error, { teamAId, teamBId }) => {
      console.error(
        `[TeamBattle] All retries failed for teams ${teamAId} and ${teamBId}`,
      )

      // Clean up all matchmaking state
      await cleanupFailedBattleMatchmaking({ teamAId, teamBId })

      // Create a more user-friendly error message
      const finalError = new Error(
        'Battle creation failed after multiple attempts. Please join matchmaking again.',
      )
      finalError.isRetryExhausted = true
      finalError.originalError = error
      throw finalError
    },
  },
)

/**
 * Check if a user has already participated in any challenge in the team battle
 * @param {Object} battle - Team battle object
 * @param {string} userId - User ID to check
 * @returns {Object} Participation status and details
 */
const checkUserParticipationStatus = (battle, userId) => {
  if (!battle || !userId) {
    return {
      hasParticipated: false,
      participatedCategory: null,
      hasCompleted: false,
    }
  }

  // Find user in team A or B
  const teamAMember = battle.teamAMembers.find(
    m => m.user.toString() === userId.toString(),
  )
  const teamBMember = battle.teamBMembers.find(
    m => m.user.toString() === userId.toString(),
  )

  const userMember = teamAMember || teamBMember

  if (!userMember) {
    return {
      hasParticipated: false,
      participatedCategory: null,
      hasCompleted: false,
    }
  }

  return {
    hasParticipated: userMember.participated || userMember.completed,
    participatedCategory: userMember.category,
    hasCompleted: userMember.completed,
    isTeamA: !!teamAMember,
  }
}

// Update selectCategoryForUser function (around line 720)
const selectCategoryForUser = async ({ battleId, userId, category }) => {
  const session = await mongoose.startSession()

  try {
    return await session.withTransaction(async () => {
      // Find the team battle
      const battle = await QuickClashTeamBattle.findById(battleId)
        .populate({
          path: 'challenges.challenge',
          model: 'QUICK_CLASH_CHALLENGE',
        })
        .session(session)

      if (!battle) {
        throw new Error('Team battle not found')
      }

      // Check if battle is active
      if (battle.status !== 'active') {
        throw new Error('Team battle is not active')
      }

      // CRITICAL CHECK: Verify user hasn't already participated in any challenge
      const participationStatus = checkUserParticipationStatus(battle, userId)

      if (participationStatus.hasParticipated) {
        if (participationStatus.hasCompleted) {
          throw new Error(
            'You have already completed a challenge in this battle',
          )
        } else {
          throw new Error(
            'You have already participated in a challenge and cannot select another category',
          )
        }
      }

      // Check if category exists in this battle
      const challengeIndex = battle.challenges.findIndex(
        c => c.category === category,
      )

      if (challengeIndex === -1) {
        throw new Error('Category not found in this battle')
      }

      // Check if user is a member of either team
      const isTeamAUser = battle.teamAMembers.some(
        m => m.user.toString() === userId.toString(),
      )
      const isTeamBUser = battle.teamBMembers.some(
        m => m.user.toString() === userId.toString(),
      )

      if (!isTeamAUser && !isTeamBUser) {
        throw new Error('User is not a member of either team')
      }

      if (isTeamAUser) {
        const memberIndex = battle.teamAMembers.findIndex(
          m => m.user.toString() === userId.toString(),
        )

        // Check if another team member already STARTED this category (not just selected)
        const categoryAlreadyStarted =
          battle.challenges[challengeIndex].teamAPlayer !== null

        if (categoryAlreadyStarted) {
          throw new Error(
            'This category has already been started by a teammate',
          )
        }

        // Check if user already has a different category selected
        if (
          battle.teamAMembers[memberIndex].category &&
          battle.teamAMembers[memberIndex].category !== category
        ) {
          throw new Error(
            'You have already selected a different category. Please deselect it first.',
          )
        }

        // Just mark the category as selected (don't assign to challenge yet)
        battle.teamAMembers[memberIndex].category = category
        battle.teamAMembers[memberIndex].challenge =
          battle.challenges[challengeIndex].challenge._id
        // Don't set participated or assign to challenge yet
      } else {
        const memberIndex = battle.teamBMembers.findIndex(
          m => m.user.toString() === userId.toString(),
        )

        // Check if another team member already STARTED this category (not just selected)
        const categoryAlreadyStarted =
          battle.challenges[challengeIndex].teamBPlayer !== null

        if (categoryAlreadyStarted) {
          throw new Error(
            'This category has already been started by a teammate',
          )
        }

        // Check if user already has a different category selected
        if (
          battle.teamBMembers[memberIndex].category &&
          battle.teamBMembers[memberIndex].category !== category
        ) {
          throw new Error(
            'You have already selected a different category. Please deselect it first.',
          )
        }

        // Just mark the category as selected (don't assign to challenge yet)
        battle.teamBMembers[memberIndex].category = category
        battle.teamBMembers[memberIndex].challenge =
          battle.challenges[challengeIndex].challenge._id
        // Don't set participated or assign to challenge yet
      }

      await battle.save({ session })

      // Emit event for category selection (not start)
      setTimeout(() => {
        globalEmitter.emit('quickClash:teamMemberSelectedCategory', {
          battleId: battle._id,
          userId,
          category,
          team: isTeamAUser ? 'teamA' : 'teamB',
          action: 'selected', // Indicate this is just selection
        })
      }, 0)

      return battle
    })
  } catch (error) {
    console.error('Error selecting category for user:', error)
    throw error
  } finally {
    session.endSession()
  }
}

// Update beginCategoryChallenge function (around line 850)
const beginCategoryChallenge = async ({ battleId, userId }) => {
  const session = await mongoose.startSession()

  try {
    return await session.withTransaction(async () => {
      // Find the team battle
      const battle = await QuickClashTeamBattle.findById(battleId)
        .populate({
          path: 'challenges.challenge',
          model: 'QUICK_CLASH_CHALLENGE',
        })
        .session(session)

      if (!battle) {
        throw new Error('Team battle not found')
      }

      // Check if battle is active
      if (battle.status !== 'active') {
        throw new Error('Team battle is not active')
      }

      // CRITICAL CHECK: Verify user hasn't already participated in any challenge
      const participationStatus = checkUserParticipationStatus(battle, userId)

      if (participationStatus.hasParticipated) {
        if (participationStatus.hasCompleted) {
          throw new Error(
            'You have already completed a challenge in this battle',
          )
        } else {
          throw new Error(
            'You have already participated in a challenge and cannot begin another',
          )
        }
      }

      // Find the user in team A or B
      const isTeamAUser = battle.teamAMembers.some(
        m => m.user.toString() === userId.toString(),
      )
      const isTeamBUser = battle.teamBMembers.some(
        m => m.user.toString() === userId.toString(),
      )

      if (!isTeamAUser && !isTeamBUser) {
        throw new Error('User is not a member of either team')
      }

      let category = null
      let challengeIndex = -1

      if (isTeamAUser) {
        const memberIndex = battle.teamAMembers.findIndex(
          m => m.user.toString() === userId.toString(),
        )

        category = battle.teamAMembers[memberIndex].category

        if (!category) {
          throw new Error(
            'No category selected. Please select a category first.',
          )
        }

        // Check if user has already started this challenge
        if (battle.teamAMembers[memberIndex].participated) {
          throw new Error('You have already started this challenge')
        }

        // Find the challenge for this category
        challengeIndex = battle.challenges.findIndex(
          c => c.category === category,
        )

        if (challengeIndex === -1) {
          throw new Error('Challenge not found for selected category')
        }

        // Check if another teammate has already been assigned to this challenge
        if (battle.challenges[challengeIndex].teamAPlayer !== null) {
          throw new Error('Another teammate has already started this category')
        }

        // Assign the player to the challenge
        battle.challenges[challengeIndex].teamAPlayer = userId

        // Update the challenge document to assign challenger
        await QuickClashChallenge.findByIdAndUpdate(
          battle.challenges[challengeIndex].challenge._id,
          { challenger: userId },
          { session },
        )
      } else {
        const memberIndex = battle.teamBMembers.findIndex(
          m => m.user.toString() === userId.toString(),
        )

        category = battle.teamBMembers[memberIndex].category

        if (!category) {
          throw new Error(
            'No category selected. Please select a category first.',
          )
        }

        // Check if user has already started this challenge
        if (battle.teamBMembers[memberIndex].participated) {
          throw new Error('You have already started this challenge')
        }

        // Find the challenge for this category
        challengeIndex = battle.challenges.findIndex(
          c => c.category === category,
        )

        if (challengeIndex === -1) {
          throw new Error('Challenge not found for selected category')
        }

        // Check if another teammate has already been assigned to this challenge
        if (battle.challenges[challengeIndex].teamBPlayer !== null) {
          throw new Error('Another teammate has already started this category')
        }

        // Assign the player to the challenge
        battle.challenges[challengeIndex].teamBPlayer = userId

        // Update the challenge document to assign opponent
        await QuickClashChallenge.findByIdAndUpdate(
          battle.challenges[challengeIndex].challenge._id,
          { opponent: userId },
          { session },
        )
      }

      await battle.save({ session })

      // Create session info for navigation
      const challenge = battle.challenges[challengeIndex].challenge
      const sessionInfo = {
        challengeId: challenge._id,
        category,
        battleId: battle._id,
      }

      // Emit event for challenge beginning
      setTimeout(() => {
        globalEmitter.emit('quickClash:teamMemberBeganChallenge', {
          battleId: battle._id,
          userId,
          category,
          team: isTeamAUser ? 'teamA' : 'teamB',
        })
      }, 0)

      return {
        battle,
        sessionInfo,
      }
    })
  } catch (error) {
    console.error('Error beginning challenge for user:', error)
    throw error
  } finally {
    session.endSession()
  }
}

/**
 * Calculate potential trophy exchange based on team average trophies
 * @param {number} teamATrophies - Team A average trophies
 * @param {number} teamBTrophies - Team B average trophies
 * @returns {number} Potential trophy exchange amount
 */
const calculatePotentialTrophyExchange = (teamATrophies, teamBTrophies) => {
  // Formula: BaseTrophies * (1 + K * (OpponentTrophies - PlayerTrophies) / 500)
  const trophiesExchanged =
    BASE_TROPHIES *
    (1 + (TROPHY_K_FACTOR * (teamBTrophies - teamATrophies)) / 500)

  // Round to integer and ensure minimum exchange
  return Math.max(60, Math.round(trophiesExchanged))
}

/**
 * Calculate average trophies for a team
 * @param {Object} team - Team object with members
 * @returns {number} Average trophies
 */
const calculateTeamAverageTrophies = team => {
  let totalTrophies = 0
  let count = 0

  team.members.forEach(member => {
    const trophies = member.user.quickClashTrophies || DEFAULT_STARTING_TROPHIES
    totalTrophies += trophies
    count++
  })

  return count > 0
    ? Math.round(totalTrophies / count)
    : DEFAULT_STARTING_TROPHIES
}

/**
 * Mark a user as participated in a team battle when they actually start reading
 * @param {Object} params - Parameters
 * @param {string} params.challengeId - Challenge ID
 * @param {string} params.userId - User ID
 * @returns {Promise<Object>} Updated team battle
 */
const markUserAsParticipated = async ({ challengeId, userId }) => {
  const session = await mongoose.startSession()

  try {
    return await session.withTransaction(async () => {
      // Find the challenge to get the team battle ID
      const challenge = await QuickClashChallenge.findById(challengeId)
        .select('teamBattle')
        .session(session)

      if (!challenge || !challenge.teamBattle) {
        // Not a team battle challenge, just return
        return null
      }

      // Find the team battle
      const battle = await QuickClashTeamBattle.findById(
        challenge.teamBattle,
      ).session(session)

      if (!battle) {
        throw new Error('Team battle not found')
      }

      // Find the user in team A or B and mark as participated
      const teamAMemberIndex = battle.teamAMembers.findIndex(
        m => m.user.toString() === userId.toString(),
      )

      const teamBMemberIndex = battle.teamBMembers.findIndex(
        m => m.user.toString() === userId.toString(),
      )

      let updated = false

      if (teamAMemberIndex !== -1) {
        battle.teamAMembers[teamAMemberIndex].participated = true
        updated = true
      } else if (teamBMemberIndex !== -1) {
        battle.teamBMembers[teamBMemberIndex].participated = true
        updated = true
      }

      if (updated) {
        await battle.save({ session })

        // Emit event to notify that user started the challenge
        setTimeout(() => {
          globalEmitter.emit('quickClash:teamMemberStartedChallenge', {
            battleId: battle._id,
            userId,
            team: teamAMemberIndex !== -1 ? 'teamA' : 'teamB',
          })
        }, 0)
      }

      return battle
    })
  } catch (error) {
    console.error('Error marking user as participated:', error)
    throw error
  } finally {
    session.endSession()
  }
}

/**
 * Deselect a category for a team member
 * @param {Object} params - Parameters
 * @param {string} params.battleId - Team battle ID
 * @param {string} params.userId - User ID
 * @returns {Promise<Object>} Updated battle
 */
const deselectCategoryForUser = async ({ battleId, userId }) => {
  const session = await mongoose.startSession()

  try {
    return await session.withTransaction(async () => {
      // Find the team battle
      const battle = await QuickClashTeamBattle.findById(battleId).session(
        session,
      )

      if (!battle) {
        throw new Error('Team battle not found')
      }

      // Check if battle is active
      if (battle.status !== 'active') {
        throw new Error('Team battle is not active')
      }

      // Find the user in team A or B
      const isTeamAUser = battle.teamAMembers.some(
        m => m.user.toString() === userId.toString(),
      )
      const isTeamBUser = battle.teamBMembers.some(
        m => m.user.toString() === userId.toString(),
      )

      if (!isTeamAUser && !isTeamBUser) {
        throw new Error('User is not a member of either team')
      }

      let oldCategory = null

      if (isTeamAUser) {
        const memberIndex = battle.teamAMembers.findIndex(
          m => m.user.toString() === userId.toString(),
        )

        // Check if user has already started (participated in) their challenge
        if (battle.teamAMembers[memberIndex].participated) {
          throw new Error(
            'Cannot deselect category after starting the challenge',
          )
        }

        oldCategory = battle.teamAMembers[memberIndex].category

        // Clear the selection
        battle.teamAMembers[memberIndex].category = null
        battle.teamAMembers[memberIndex].challenge = null
      } else {
        const memberIndex = battle.teamBMembers.findIndex(
          m => m.user.toString() === userId.toString(),
        )

        // Check if user has already started (participated in) their challenge
        if (battle.teamBMembers[memberIndex].participated) {
          throw new Error(
            'Cannot deselect category after starting the challenge',
          )
        }

        oldCategory = battle.teamBMembers[memberIndex].category

        // Clear the selection
        battle.teamBMembers[memberIndex].category = null
        battle.teamBMembers[memberIndex].challenge = null
      }

      if (!oldCategory) {
        throw new Error('No category selected to deselect')
      }

      await battle.save({ session })

      // Emit event for category deselection
      setTimeout(() => {
        globalEmitter.emit('quickClash:teamMemberDeselectedCategory', {
          battleId: battle._id,
          userId,
          category: oldCategory,
          team: isTeamAUser ? 'teamA' : 'teamB',
        })
      }, 0)

      return battle
    })
  } catch (error) {
    console.error('Error deselecting category for user:', error)
    throw error
  } finally {
    session.endSession()
  }
}

/**
 * Validate that a user is properly assigned to a specific challenge in a team battle
 * @param {Object} params - Parameters
 * @param {string} params.teamBattleId - Team battle ID
 * @param {string} params.challengeId - Challenge ID
 * @param {string} params.userId - User ID to validate
 * @param {mongoose.ClientSession} [params.session] - Optional mongoose session
 * @returns {Promise<boolean>} Whether user is validly assigned
 */
const validateUserChallengeAssignment = async ({
  teamBattleId,
  challengeId,
  userId,
  session: providedSession,
}) => {
  const session = providedSession || (await mongoose.startSession())
  let startedTransaction = false

  try {
    if (!providedSession) {
      startedTransaction = true
      await session.startTransaction()
    }

    // Get the team battle
    const teamBattle = await QuickClashTeamBattle.findById(
      teamBattleId,
    ).session(session)

    if (!teamBattle) {
      return false
    }

    // Find the challenge in the team battle
    const challengeIndex = teamBattle.challenges.findIndex(
      c => c.challenge && c.challenge.toString() === challengeId.toString(),
    )

    if (challengeIndex === -1) {
      return false
    }

    const battleChallenge = teamBattle.challenges[challengeIndex]

    // Check if user is assigned as teamAPlayer or teamBPlayer for this challenge
    const isTeamAPlayer =
      battleChallenge.teamAPlayer &&
      battleChallenge.teamAPlayer.toString() === userId.toString()
    const isTeamBPlayer =
      battleChallenge.teamBPlayer &&
      battleChallenge.teamBPlayer.toString() === userId.toString()

    if (!isTeamAPlayer && !isTeamBPlayer) {
      return false
    }

    // Additional check: verify user is actually a member of the corresponding team
    const isTeamAMember = teamBattle.teamAMembers.some(
      m => m.user.toString() === userId.toString(),
    )
    const isTeamBMember = teamBattle.teamBMembers.some(
      m => m.user.toString() === userId.toString(),
    )

    // User must be teamAPlayer AND teamAMember, OR teamBPlayer AND teamBMember
    const validAssignment =
      (isTeamAPlayer && isTeamAMember) || (isTeamBPlayer && isTeamBMember)

    if (startedTransaction) {
      await session.commitTransaction()
    }

    return validAssignment
  } catch (error) {
    if (startedTransaction) {
      await session.abortTransaction()
    }
    console.error('Error validating user challenge assignment:', error)
    return false
  } finally {
    if (!providedSession) {
      session.endSession()
    }
  }
}

/**
 * Update team battle with quiz results
 * @param {Object} params - Parameters
 * @param {string} params.battleId - Team battle ID
 * @param {string} params.challengeId - Challenge ID
 * @param {string} params.userId - User ID who completed the quiz
 * @param {number} params.score - User's score
 * @returns {Promise<Object>} Updated team battle
 */
const updateBattleWithQuizResults = async ({
  battleId,
  challengeId,
  userId,
  score,
}) => {
  const session = await mongoose.startSession()

  try {
    return await session.withTransaction(async () => {
      // Find the team battle
      const battle = await QuickClashTeamBattle.findById(battleId).session(
        session,
      )

      if (!battle) {
        throw new Error('Team battle not found')
      }

      // Find the challenge
      const challengeIndex = battle.challenges.findIndex(
        c => c.challenge && c.challenge.toString() === challengeId.toString(),
      )

      if (challengeIndex === -1) {
        throw new Error('Challenge not found in this battle')
      }

      // Find if user is in team A or B
      const isTeamAUser = battle.teamAMembers.some(
        m => m.user.toString() === userId.toString(),
      )
      const isTeamBUser = battle.teamBMembers.some(
        m => m.user.toString() === userId.toString(),
      )

      if (!isTeamAUser && !isTeamBUser) {
        throw new Error('User is not a member of either team')
      }

      // Update the member and challenge data
      if (isTeamAUser) {
        // Update team A member
        const memberIndex = battle.teamAMembers.findIndex(
          m => m.user.toString() === userId.toString(),
        )

        if (memberIndex !== -1) {
          battle.teamAMembers[memberIndex].completed = true
          battle.teamAMembers[memberIndex].score = score
        }

        // Update challenge
        battle.challenges[challengeIndex].teamAScore = score
        battle.challenges[challengeIndex].teamACompleted = true
      } else {
        // Update team B member
        const memberIndex = battle.teamBMembers.findIndex(
          m => m.user.toString() === userId.toString(),
        )

        if (memberIndex !== -1) {
          battle.teamBMembers[memberIndex].completed = true
          battle.teamBMembers[memberIndex].score = score
        }

        // Update challenge
        battle.challenges[challengeIndex].teamBScore = score
        battle.challenges[challengeIndex].teamBCompleted = true
      }

      // If both teams completed this challenge, determine the winner
      if (
        battle.challenges[challengeIndex].teamACompleted &&
        battle.challenges[challengeIndex].teamBCompleted
      ) {
        const teamAScore = battle.challenges[challengeIndex].teamAScore
        const teamBScore = battle.challenges[challengeIndex].teamBScore

        if (teamAScore > teamBScore) {
          battle.challenges[challengeIndex].winner = 'teamA'
          battle.teamAWins += 1
        } else if (teamBScore > teamAScore) {
          battle.challenges[challengeIndex].winner = 'teamB'
          battle.teamBWins += 1
        } else {
          battle.challenges[challengeIndex].winner = 'tie'
          battle.ties += 1
        }
      }

      // Update total scores
      battle.teamATotalScore = battle.teamAMembers.reduce(
        (sum, member) => sum + member.score,
        0,
      )

      battle.teamBTotalScore = battle.teamBMembers.reduce(
        (sum, member) => sum + member.score,
        0,
      )

      // Check if battle is completed (all challenges have a winner or time expired)
      const allChallengesCompleted = battle.challenges.every(
        c => c.teamACompleted && c.teamBCompleted,
      )

      // Calculate remaining time
      const now = new Date()
      const timeRemaining = battle.expiresAt - now

      // Mark as completed if:
      // 1. All challenges are completed, OR
      // 2. Time expired AND at least one team has completed one challenge
      const shouldComplete =
        allChallengesCompleted ||
        (timeRemaining <= 0 &&
          (battle.challenges.some(c => c.teamACompleted) ||
            battle.challenges.some(c => c.teamBCompleted)))

      if (shouldComplete) {
        battle.status = 'completed'

        // UPDATED: Count wins for challenges with only one team completed
        let teamAWins = 0
        let teamBWins = 0
        let ties = 0

        // Recalculate wins/losses for all challenges using corrected logic
        battle.challenges.forEach(challenge => {
          if (challenge.teamACompleted && challenge.teamBCompleted) {
            // Both teams completed - compare scores
            if (challenge.teamAScore > challenge.teamBScore) {
              teamAWins++
              challenge.winner = 'teamA'
            } else if (challenge.teamBScore > challenge.teamAScore) {
              teamBWins++
              challenge.winner = 'teamB'
            } else {
              ties++
              challenge.winner = 'tie'
            }
          } else if (challenge.teamACompleted && !challenge.teamBCompleted) {
            // Only team A completed - they win
            teamAWins++
            challenge.winner = 'teamA'
          } else if (!challenge.teamACompleted && challenge.teamBCompleted) {
            // Only team B completed - they win
            teamBWins++
            challenge.winner = 'teamB'
          } else {
            // Neither team completed - count as tie
            ties++
            challenge.winner = 'tie'
          }
        })

        // Update the counters in battle
        battle.teamAWins = teamAWins
        battle.teamBWins = teamBWins
        battle.ties = ties

        // Determine overall winner
        if (teamAWins > teamBWins) {
          battle.winner = 'teamA'
        } else if (teamBWins > teamAWins) {
          battle.winner = 'teamB'
        } else if (battle.teamATotalScore > battle.teamBTotalScore) {
          // Tiebreaker 1: Higher total RQM score
          battle.winner = 'teamA'
        } else if (battle.teamBTotalScore > battle.teamATotalScore) {
          battle.winner = 'teamB'
        } else {
          // Tiebreaker 2: Highest individual RQM score
          const teamAHighestScore = Math.max(
            ...battle.teamAMembers.map(m => m.score || 0),
            0, // Default to 0 if no scores
          )
          const teamBHighestScore = Math.max(
            ...battle.teamBMembers.map(m => m.score || 0),
            0, // Default to 0 if no scores
          )

          if (teamAHighestScore > teamBHighestScore) {
            battle.winner = 'teamA'
          } else if (teamBHighestScore > teamAHighestScore) {
            battle.winner = 'teamB'
          } else {
            battle.winner = 'tie'
          }
        }

        // Calculate and apply trophy bonuses
        const didTeamAWinAll = battle.teamAWins === battle.challenges.length

        // Mark bonus flags
        battle.allMatchesWon = didTeamAWinAll

        // Calculate final trophies
        await calculateFinalTrophies(battle, session)

        // Mark teams as no longer in match
        if (battle.teamA) {
          await updateTeamMatchStatus({
            teamId: battle.teamA,
            isInMatch: false,
            session,
          })
        }

        if (battle.teamB) {
          await updateTeamMatchStatus({
            teamId: battle.teamB,
            isInMatch: false,
            session,
          })
        }

        // Emit event after all processing
        setTimeout(() => {
          globalEmitter.emit('quickClash:teamBattleCompleted', {
            battleId: battle._id,
            winner: battle.winner,
            teamA: battle.teamA,
            teamB: battle.teamB,
          })
        }, 0)
      }

      await battle.save({ session })

      return battle
    })
  } catch (error) {
    console.error('Error updating battle with quiz results:', error)
    throw error
  } finally {
    session.endSession()
  }
}

/**
 * Get user's active team battles
 * @param {Object} params - Parameters
 * @param {string} params.userId - User ID
 * @param {string} [params.status='active'] - Battle status to filter by
 * @param {number} [params.page=1] - Page number
 * @param {number} [params.limit=10] - Results per page
 * @returns {Promise<Object>} Battles with pagination
 */
const getUserTeamBattles = async ({
  userId,
  status = 'active',
  page = 1,
  limit = 10,
}) => {
  // Calculate skip value for pagination
  const skip = (page - 1) * limit

  // Build query based on user membership in either team
  const query = {
    $or: [{ 'teamAMembers.user': userId }, { 'teamBMembers.user': userId }],
  }

  // Add status filter if provided
  if (status) {
    query.status = status
  }

  // Get total count for pagination
  const total = await QuickClashTeamBattle.countDocuments(query)

  // Fetch paginated results
  const battles = await QuickClashTeamBattle.find(query)
    .populate('teamA', 'name avgTrophies')
    .populate('teamB', 'name avgTrophies')
    .populate('teamAMembers.user', '_id name inGameName pic')
    .populate('teamBMembers.user', '_id name inGameName pic')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)

  return {
    battles,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    },
  }
}

/**
 * Get team battle details by ID
 * @param {Object} params - Parameters
 * @param {string} params.battleId - Team battle ID
 * @returns {Promise<Object>} Detailed battle info
 */
const getTeamBattleDetails = async ({ battleId }) => {
  const battle = await QuickClashTeamBattle.findById(battleId)
    .populate('teamA', 'name avgTrophies formationInfo')
    .populate('teamB', 'name avgTrophies formationInfo')
    .populate('teamAMembers.user', '_id name inGameName pic quickClashTrophies')
    .populate('teamBMembers.user', '_id name inGameName pic quickClashTrophies')
    .populate({
      path: 'challenges.challenge',
      select: 'category article status expiresAt',
    })
  if (!battle) {
    throw new Error('Team battle not found')
  }

  return battle
}

/**
 * Clean up all matchmaking entries for teams and their members when a battle is created
 * @param {Object} params - Parameters
 * @param {string} params.teamAId - Team A ID
 * @param {string} params.teamBId - Team B ID
 * @param {mongoose.ClientSession} params.session - Database session
 * @returns {Promise<void>}
 */
const cleanupMatchmakingEntries = async ({ teamAId, teamBId, session }) => {
  console.log(
    `[TeamBattle] Starting matchmaking cleanup for teams ${teamAId} and ${teamBId}`,
  )

  try {
    // Get both teams with their formation info
    const teams = await QuickClashTeam.find({
      _id: { $in: [teamAId, teamBId] },
    })
      .populate('members.user', '_id')
      .session(session)

    const teamsToProcess = []
    const usersToCleanup = new Set()
    const sourceTeamsToCleanup = new Set()

    // Process each team
    for (const team of teams) {
      console.log(`[TeamBattle] Processing team ${team._id}`)

      // Add team to cleanup list
      teamsToProcess.push(team._id)

      // Add all team members to user cleanup list
      team.members.forEach(member => {
        const userId = member.user._id || member.user
        usersToCleanup.add(userId.toString())
      })

      // If this is an auto-formed team, also cleanup source teams
      if (team.formationInfo && team.formationInfo.isAutoFormed) {
        console.log(
          `[TeamBattle] Team ${team._id} is auto-formed, adding source teams to cleanup`,
        )

        // Add source teams to cleanup
        if (team.formationInfo.sourceTeams) {
          team.formationInfo.sourceTeams.forEach(sourceTeamId => {
            sourceTeamsToCleanup.add(sourceTeamId.toString())
          })
        }

        // Add solo players to cleanup
        if (team.formationInfo.soloPlayers) {
          team.formationInfo.soloPlayers.forEach(playerId => {
            usersToCleanup.add(playerId.toString())
          })
        }
      }
    }

    // 1. Remove all team matchmaking entries
    console.log(
      `[TeamBattle] Removing team matchmaking entries for ${teamsToProcess.length} teams`,
    )
    const teamCleanupResult = await QuickClashTeamMatchmaking.deleteMany({
      team: { $in: [...teamsToProcess, ...Array.from(sourceTeamsToCleanup)] },
    }).session(session)
    console.log(
      `[TeamBattle] Removed ${teamCleanupResult.deletedCount} team matchmaking entries`,
    )

    // 2. Remove all global matchmaking entries for users
    console.log(
      `[TeamBattle] Removing global matchmaking entries for ${usersToCleanup.size} users`,
    )
    const userCleanupResult = await QuickClashGlobalMatchmaking.deleteMany({
      user: { $in: Array.from(usersToCleanup) },
    }).session(session)
    console.log(
      `[TeamBattle] Removed ${userCleanupResult.deletedCount} global matchmaking entries`,
    )

    // 3. Clean up any remaining processed teams that might be lingering
    console.log(`[TeamBattle] Cleaning up any processed teams`)
    const processedCleanupResult = await QuickClashTeamMatchmaking.deleteMany({
      status: 'processed',
      team: { $in: [...teamsToProcess, ...Array.from(sourceTeamsToCleanup)] },
    }).session(session)
    console.log(
      `[TeamBattle] Removed ${processedCleanupResult.deletedCount} processed team entries`,
    )

    console.log(`[TeamBattle] Matchmaking cleanup completed successfully`)
  } catch (error) {
    console.error(`[TeamBattle] Error during matchmaking cleanup:`, error)
    throw error
  }
}

module.exports = {
  createTeamBattle,
  cleanupFailedBattleMatchmaking,
  selectCategoryForUser,
  deselectCategoryForUser,
  beginCategoryChallenge,
  markUserAsParticipated,
  updateBattleWithQuizResults,
  getUserTeamBattles,
  getTeamBattleDetails,
  validateUserChallengeAssignment,
  checkUserParticipationStatus,
}
