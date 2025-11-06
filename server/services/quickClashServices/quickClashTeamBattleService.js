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
const {
  withScopedLock,
  cleanupBattleMutexes,
} = require('../../utils/scopedMutex.utils')
const {
  trackAllBotsInBattle,
  stopTrackingAllBotsInBattle,
} = require('./quickClashBotHealthService')
const {
  calculateTeamWinProbability,
  calculateLiveTeamWinProbability,
} = require('./quickClashWinProbabilityService')

// Constants
const TEAM_BATTLE_EXPIRY = 24 * 60 * 60 * 1000 // 24 hours same as regular challenges
const BASE_TROPHIES = 120 // Base trophies for 4v4 mode
const TROPHY_K_FACTOR = 0.8 // From trophy formula

/**
 * Clean up all matchmaking entries when battle creation fails completely
 * @param {Object} params - Parameters
 * @param {string} params.teamAId - Team A ID
 * @param {string} params.teamBId - Team B ID
 * @param {string} [params.battleId] - Battle ID (if available)
 * @returns {Promise<void>}
 */
const cleanupFailedBattleMatchmaking = async ({
  teamAId,
  teamBId,
  battleId = null,
}) => {
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

    // Clean up any mutexes that might have been created
    if (battleId) {
      console.log(
        `[TeamBattle] Cleaning up mutexes for failed battle ${battleId}`,
      )
      try {
        const cleanedMutexes = cleanupBattleMutexes(battleId)
        console.log(
          `[TeamBattle] Cleaned up ${cleanedMutexes} mutexes for failed battle`,
        )
      } catch (mutexCleanupError) {
        console.error(
          `[TeamBattle] Error during mutex cleanup:`,
          mutexCleanupError,
        )
        // Don't throw - cleanup errors shouldn't fail the main cleanup
      }
    } else {
      console.log(`[TeamBattle] No battleId provided, skipping mutex cleanup`)
      // Note: In cases where battle creation fails very early, there might not be
      // any mutexes created yet, so this is expected behavior
    }

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

    // Clean up mutexes even if other cleanup failed (best effort)
    if (battleId) {
      try {
        const cleanedMutexes = cleanupBattleMutexes(battleId)
        console.log(
          `[TeamBattle] Emergency mutex cleanup: ${cleanedMutexes} mutexes cleaned`,
        )
      } catch (emergencyCleanupError) {
        console.error(
          `[TeamBattle] Emergency mutex cleanup also failed:`,
          emergencyCleanupError,
        )
      }
    }

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
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate some processing delay
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
      // Calculate initial win probability
      let winProbability = null
      try {
        console.log('[WIN_PROB] Calculating team win probability')
        winProbability = await calculateTeamWinProbability({
          teamAId,
          teamBId,
          session,
        })
        console.log('[WIN_PROB] Team battle probability calculated:', {
          teamA: winProbability.teamA.initial,
          teamB: winProbability.teamB.initial,
        })
      } catch (probError) {
        // Non-blocking: battle continues even if probability fails
        console.error(
          '[WIN_PROB] Error calculating team probability:',
          probError,
        )
      }
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
        winProbability: winProbability,
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

        // ======= PROGRESS: BATTLE READY, STARTING BOT TRACKING (97%) =======
        console.log(
          `[TeamBattle] PHASE 11: Battle ready, starting bot tracking (97%)`,
        )

        // NOW start bot tracking after battle is fully created and committed
        try {
          console.log(
            `[TeamBattle] Starting bot tracking for completed battle ${teamBattle._id}`,
          )

          await trackAllBotsInBattle({
            battleId: teamBattle._id.toString(),
            teamAMembers: teamA.members,
            teamBMembers: teamB.members,
          })

          console.log(
            `[TeamBattle] ✅ Bot health tracking successfully initialized for battle ${teamBattle._id}`,
          )
        } catch (trackingError) {
          console.error(
            `[TeamBattle] ⚠️ Failed to initialize bot tracking for battle ${teamBattle._id}:`,
            trackingError,
          )
          // Battle is created successfully, tracking failure doesn't affect battle
          // Health check will eventually pick up any bots that need recovery
        }

        // ======= PROGRESS: BATTLE READY (100%) =======
        console.log(`[TeamBattle] PHASE 12: Battle ready (100%)`)

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
 * Select a category for a user in a team battle with scoped locking
 * @param {Object} params - Parameters
 * @param {string} params.battleId - Team battle ID
 * @param {string} params.userId - User ID
 * @param {string} params.category - Category to select
 * @returns {Promise<Object>} Updated battle
 */
const selectCategoryForUser = async ({ battleId, userId, category }) => {
  console.log(
    `[CATEGORY_SELECT] User ${userId} requesting to select category ${category} for battle ${battleId}`,
  )

  // STEP 1: Pre-lock validation - determine team membership
  let teamId = null
  let isTeamAUser = false
  let isTeamBUser = false

  try {
    // Get battle data to determine team membership (read-only operation)
    const battle = await QuickClashTeamBattle.findById(battleId).lean()

    if (!battle) {
      throw new Error('Team battle not found')
    }

    if (battle.status !== 'active') {
      throw new Error('Team battle is not active')
    }

    // Determine team membership
    isTeamAUser = battle.teamAMembers.some(
      m => m.user.toString() === userId.toString(),
    )
    isTeamBUser = battle.teamBMembers.some(
      m => m.user.toString() === userId.toString(),
    )

    if (!isTeamAUser && !isTeamBUser) {
      throw new Error('User is not a member of either team')
    }

    // Set team ID for locking
    teamId = isTeamAUser ? 'teamA' : 'teamB'

    console.log(
      `[CATEGORY_SELECT] User ${userId} belongs to ${teamId} in battle ${battleId}`,
    )
  } catch (error) {
    console.error(`[CATEGORY_SELECT] Pre-lock validation failed:`, error)
    throw error
  }

  // STEP 2: Execute category selection with scoped lock
  return await withScopedLock({
    battleId,
    teamId,
    userId,
    operation: `selectCategory:${category}`,
    fn: async () => {
      // This is the critical section that's now protected by the scoped mutex
      return await performCategorySelection({
        battleId,
        userId,
        category,
        teamId,
        isTeamAUser,
        isTeamBUser,
      })
    },
  })
}

/**
 * Internal function to perform the actual category selection (protected by mutex)
 * @param {Object} params - Parameters
 * @param {string} params.battleId - Battle ID
 * @param {string} params.userId - User ID
 * @param {string} params.category - Category to select
 * @param {string} params.teamId - Team ID (teamA or teamB)
 * @param {boolean} params.isTeamAUser - Whether user is in team A
 * @param {boolean} params.isTeamBUser - Whether user is in team B
 * @returns {Promise<Object>} Updated battle
 */
const performCategorySelection = async ({
  battleId,
  userId,
  category,
  teamId,
  isTeamAUser,
  isTeamBUser,
}) => {
  const session = await mongoose.startSession()
  let attempts = 0
  const maxAttempts = 3

  try {
    while (attempts < maxAttempts) {
      attempts++

      try {
        return await session.withTransaction(
          async () => {
            console.log(
              `[CATEGORY_SELECT] [LOCKED] Attempt ${attempts}/${maxAttempts} for user ${userId}, category ${category}`,
            )

            // STEP 1: Get current battle state (fresh read under lock)
            const battle = await QuickClashTeamBattle.findById(
              battleId,
            ).session(session)

            if (!battle) {
              throw new Error('Team battle not found')
            }

            if (battle.status !== 'active') {
              throw new Error('Team battle is not active')
            }

            // STEP 2: Find challenge index and validate category exists
            const challengeIndex = battle.challenges.findIndex(
              c => c.category === category,
            )
            if (challengeIndex === -1) {
              throw new Error('Category not found in this battle')
            }

            // STEP 3: Get member info based on pre-determined team membership
            const memberIndex = isTeamAUser
              ? battle.teamAMembers.findIndex(
                  m => m.user.toString() === userId.toString(),
                )
              : battle.teamBMembers.findIndex(
                  m => m.user.toString() === userId.toString(),
                )

            if (memberIndex === -1) {
              throw new Error('User not found in expected team')
            }

            const member = isTeamAUser
              ? battle.teamAMembers[memberIndex]
              : battle.teamBMembers[memberIndex]

            // STEP 4: Check if user has already participated/completed
            if (member.participated || member.completed) {
              throw new Error(
                'You have already participated in a challenge in this battle',
              )
            }

            // STEP 5: Check if user already has this category selected
            if (member.category === category) {
              console.log(
                `[CATEGORY_SELECT] [LOCKED] User ${userId} already has category ${category} selected`,
              )
              // Return current battle state if already selected
              return await QuickClashTeamBattle.findById(battleId)
                .populate('teamA', 'name avgTrophies formationInfo')
                .populate('teamB', 'name avgTrophies formationInfo')
                .populate(
                  'teamAMembers.user',
                  '_id name inGameName pic quickClashTrophies',
                )
                .populate(
                  'teamBMembers.user',
                  '_id name inGameName pic quickClashTrophies',
                )
                .populate({
                  path: 'challenges.challenge',
                  select: 'category article status expiresAt',
                })
                .session(session)
            }

            // STEP 6: Check if user has a different category selected
            if (member.category && member.category !== category) {
              throw new Error(
                'You have already selected a different category. Please deselect it first.',
              )
            }

            // STEP 7: Check if any teammate has already selected this category
            const teamMembers = isTeamAUser
              ? battle.teamAMembers
              : battle.teamBMembers
            const categoryAlreadySelected = teamMembers.some(
              (teamMember, index) =>
                index !== memberIndex && // Don't check against self
                teamMember.category === category,
            )

            if (categoryAlreadySelected) {
              throw new Error(
                `Category "${category}" has already been selected by another teammate.`,
              )
            }

            // STEP 8: THE ENHANCED ATOMIC OPERATION (now protected by mutex)
            const atomicQuery = {
              _id: battleId,
              status: 'active',
              // Ensure the specific challenge slot is still available
              [`challenges.${challengeIndex}.${
                isTeamAUser ? 'teamAPlayer' : 'teamBPlayer'
              }`]: null,
              // Ensure user hasn't participated in ANY challenge
              [`${
                isTeamAUser ? 'teamAMembers' : 'teamBMembers'
              }.${memberIndex}.participated`]: false,
              [`${
                isTeamAUser ? 'teamAMembers' : 'teamBMembers'
              }.${memberIndex}.completed`]: false,
              // Ensure no other team member has this category selected
              [`${isTeamAUser ? 'teamAMembers' : 'teamBMembers'}.category`]: {
                $ne: category,
              },
            }

            const atomicUpdate = {
              $set: {
                [`${
                  isTeamAUser ? 'teamAMembers' : 'teamBMembers'
                }.${memberIndex}.category`]: category,
                [`${
                  isTeamAUser ? 'teamAMembers' : 'teamBMembers'
                }.${memberIndex}.challenge`]:
                  battle.challenges[challengeIndex].challenge,
              },
            }

            console.log(
              `[CATEGORY_SELECT] [LOCKED] Executing atomic update for user ${userId}, category ${category}`,
            )

            const result = await QuickClashTeamBattle.findOneAndUpdate(
              atomicQuery,
              atomicUpdate,
              {
                new: true,
                session,
              },
            )

            if (!result) {
              // This means the atomic condition failed
              console.log(
                `[CATEGORY_SELECT] [LOCKED] Atomic operation failed for user ${userId}, category ${category}`,
              )
              throw new Error(
                `Category "${category}" is no longer available or conditions changed.`,
              )
            }

            console.log(
              `[CATEGORY_SELECT] [LOCKED] SUCCESS! User ${userId} secured category ${category}`,
            )

            // STEP 9: Return populated result
            const populatedBattle = await QuickClashTeamBattle.findById(
              battleId,
            )
              .populate('teamA', 'name avgTrophies formationInfo')
              .populate('teamB', 'name avgTrophies formationInfo')
              .populate(
                'teamAMembers.user',
                '_id name inGameName pic quickClashTrophies',
              )
              .populate(
                'teamBMembers.user',
                '_id name inGameName pic quickClashTrophies',
              )
              .populate({
                path: 'challenges.challenge',
                select: 'category article status expiresAt',
              })
              .session(session)

            // STEP 10: Emit success event
            setTimeout(() => {
              globalEmitter.emit('quickClash:teamMemberSelectedCategory', {
                battleId: populatedBattle._id,
                userId,
                category,
                team: isTeamAUser
                  ? populatedBattle.teamA
                  : populatedBattle.teamB,
                opponentTeam: isTeamAUser
                  ? populatedBattle.teamB
                  : populatedBattle.teamA,
                action: 'selected',
              })
            }, 0)

            return populatedBattle
          },
          {
            readConcern: { level: 'majority' },
            writeConcern: { w: 'majority' },
            maxCommitTimeMS: 5000,
          },
        )
      } catch (error) {
        console.log(
          `[CATEGORY_SELECT] [LOCKED] Attempt ${attempts} failed for user ${userId}:`,
          error.message,
        )

        // Check if this is a retryable error
        const isRetryable =
          error.message.includes('no longer available') ||
          error.message.includes('conditions changed') ||
          error.message.includes('TransientTransactionError') ||
          error.message.includes('WriteConflict') ||
          error.message.includes('writeConcern') ||
          (error.name &&
            (error.name.includes('Mongo') ||
              error.name.includes('Transaction')))

        if (!isRetryable || attempts >= maxAttempts) {
          // Don't retry for validation errors that users should see
          if (
            error.message.includes('not a member') ||
            error.message.includes('already participated') ||
            error.message.includes('already selected') ||
            error.message.includes('not found') ||
            error.message.includes('not active') ||
            error.message.includes('already been selected by another teammate')
          ) {
            throw error
          }

          // For technical errors after max attempts, give user-friendly message
          if (attempts >= maxAttempts) {
            throw new Error(
              'Unable to select category at this time. Please try again.',
            )
          }

          throw error
        }

        // Small delay before retry (no need for exponential backoff since we're under mutex)
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }

    throw new Error(
      'Unable to select category after multiple attempts. Please try again.',
    )
  } finally {
    session.endSession()
  }
}

/**
 * FIXED: Begin category challenge with proper transaction handling
 */
const beginCategoryChallenge = async ({ battleId, userId }) => {
  console.log(
    `[BEGIN_CHALLENGE] User ${userId} beginning challenge for battle ${battleId}`,
  )

  const session = await mongoose.startSession()

  try {
    return await session.withTransaction(
      async () => {
        // STEP 1: Get battle and validate
        const battle = await QuickClashTeamBattle.findById(battleId)
          .populate({
            path: 'challenges.challenge',
            model: 'QUICK_CLASH_CHALLENGE',
          })
          .session(session)

        if (!battle || battle.status !== 'active') {
          throw new Error('Team battle not found or not active')
        }

        // STEP 2: Find user and their category
        const teamAMemberIndex = battle.teamAMembers.findIndex(
          m => m.user.toString() === userId.toString(),
        )
        const teamBMemberIndex = battle.teamBMembers.findIndex(
          m => m.user.toString() === userId.toString(),
        )

        if (teamAMemberIndex === -1 && teamBMemberIndex === -1) {
          throw new Error('User is not a member of either team')
        }

        const isTeamAUser = teamAMemberIndex !== -1
        const memberIndex = isTeamAUser ? teamAMemberIndex : teamBMemberIndex
        const member = isTeamAUser
          ? battle.teamAMembers[memberIndex]
          : battle.teamBMembers[memberIndex]

        // STEP 3: Validate category selection and participation status
        if (!member.category) {
          throw new Error(
            'No category selected. Please select a category first.',
          )
        }

        if (member.participated || member.completed) {
          throw new Error('You have already participated in a challenge')
        }

        const challengeIndex = battle.challenges.findIndex(
          c => c.category === member.category,
        )
        if (challengeIndex === -1) {
          throw new Error('Challenge not found for selected category')
        }

        // STEP 4: THE CRITICAL ATOMIC ASSIGNMENT (FIXED - No writeConcern)
        const atomicQuery = {
          _id: battleId,
          status: 'active',
          // Ensure challenge slot is still available
          [`challenges.${challengeIndex}.${
            isTeamAUser ? 'teamAPlayer' : 'teamBPlayer'
          }`]: null,
          // Ensure user hasn't started yet
          [`${
            isTeamAUser ? 'teamAMembers' : 'teamBMembers'
          }.${memberIndex}.participated`]: false,
          [`${
            isTeamAUser ? 'teamAMembers' : 'teamBMembers'
          }.${memberIndex}.completed`]: false,
          // Ensure user has the expected category selected
          [`${
            isTeamAUser ? 'teamAMembers' : 'teamBMembers'
          }.${memberIndex}.category`]: member.category,
        }

        const atomicUpdate = {
          $set: {
            [`challenges.${challengeIndex}.${
              isTeamAUser ? 'teamAPlayer' : 'teamBPlayer'
            }`]: userId,
          },
        }

        console.log(
          `[BEGIN_CHALLENGE] Executing atomic challenge assignment for user ${userId}`,
        )

        // FIXED: Removed writeConcern from individual operation
        const result = await QuickClashTeamBattle.findOneAndUpdate(
          atomicQuery,
          atomicUpdate,
          {
            new: true,
            session,
            // Removed writeConcern - transaction handles this
          },
        )

        if (!result) {
          throw new Error(
            'Another teammate has already started this category or your status has changed',
          )
        }

        // STEP 5: Update the challenge document
        const challengeId = battle.challenges[challengeIndex].challenge._id
        await QuickClashChallenge.findByIdAndUpdate(
          challengeId,
          { [isTeamAUser ? 'challenger' : 'opponent']: userId },
          { session },
        )

        // STEP 6: Get populated result
        const updatedBattle = await QuickClashTeamBattle.findById(battleId)
          .populate('teamA', 'name avgTrophies formationInfo')
          .populate('teamB', 'name avgTrophies formationInfo')
          .populate(
            'teamAMembers.user',
            '_id name inGameName pic quickClashTrophies',
          )
          .populate(
            'teamBMembers.user',
            '_id name inGameName pic quickClashTrophies',
          )
          .populate({
            path: 'challenges.challenge',
            select: 'category article status expiresAt',
          })
          .session(session)

        const sessionInfo = {
          challengeId,
          category: member.category,
          battleId: updatedBattle._id,
        }

        console.log(
          `[BEGIN_CHALLENGE] SUCCESS! User ${userId} assigned to challenge ${challengeId}`,
        )

        // STEP 7: Emit success event
        setTimeout(() => {
          globalEmitter.emit('quickClash:teamMemberBeganChallenge', {
            battleId: updatedBattle._id,
            userId,
            category: member.category,
            team: isTeamAUser ? updatedBattle.teamA : updatedBattle.teamB,
            opponentTeam: isTeamAUser
              ? updatedBattle.teamB
              : updatedBattle.teamA,
          })
        }, 0)

        return {
          battle: updatedBattle,
          sessionInfo,
        }
      },
      {
        // FIXED: Proper transaction-level options
        readConcern: { level: 'majority' },
        writeConcern: { w: 'majority' }, // Transaction-level only
        maxCommitTimeMS: 5000,
      },
    )
  } catch (error) {
    console.error(`[BEGIN_CHALLENGE] Error for user ${userId}:`, error)

    // Give user-friendly error messages
    if (error.message.includes('writeConcern')) {
      throw new Error(
        'Unable to start challenge at this time. Please try again.',
      )
    }

    throw error
  } finally {
    session.endSession()
  }
}

/**
 * Helper function to check user participation status (unchanged)
 */
const checkUserParticipationStatus = (battle, userId) => {
  if (!battle || !userId) {
    return {
      hasParticipated: false,
      participatedCategory: null,
      hasCompleted: false,
    }
  }

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
            team: teamAMemberIndex !== -1 ? battle.teamA : battle.teamB,
            opponentTeam: teamAMemberIndex !== -1 ? battle.teamB : battle.teamA,
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

      // IMPORTANT: Fetch the updated battle with populated fields to ensure consistency
      const updatedBattle = await QuickClashTeamBattle.findById(battleId)
        .populate('teamA', 'name avgTrophies formationInfo')
        .populate('teamB', 'name avgTrophies formationInfo')
        .populate(
          'teamAMembers.user',
          '_id name inGameName pic quickClashTrophies',
        )
        .populate(
          'teamBMembers.user',
          '_id name inGameName pic quickClashTrophies',
        )
        .populate({
          path: 'challenges.challenge',
          select: 'category article status expiresAt',
        })
        .session(session)

      // Emit socket event after database is updated
      setTimeout(() => {
        globalEmitter.emit('quickClash:teamMemberDeselectedCategory', {
          battleId: updatedBattle._id,
          userId,
          category: oldCategory,
          team: isTeamAUser ? updatedBattle.teamA : updatedBattle.teamB,
          opponentTeam: isTeamAUser ? updatedBattle.teamB : updatedBattle.teamA,
        })
      }, 0)

      return updatedBattle
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
 * Update team battle with quiz results - WITH RETRY LOGIC
 * @param {Object} params - Parameters
 * @param {string} params.battleId - Team battle ID
 * @param {string} params.challengeId - Challenge ID
 * @param {string} params.userId - User ID who completed the quiz
 * @param {number} params.score - User's score
 * @returns {Promise<Object>} Updated team battle
 */
const updateBattleWithQuizResults = makeRetryable(
  async ({ battleId, challengeId, userId, score }) => {
    const session = await mongoose.startSession()

    try {
      return await session.withTransaction(async () => {
        console.log(
          `[updateBattleWithQuizResults] Processing quiz results - Battle: ${battleId}, Challenge: ${challengeId}, User: ${userId}, Score: ${score}`,
        )

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

        // Calculate live win probability after each player completion
        if (battle.winProbability) {
          try {
            console.log('[WIN_PROB] Calculating live probability update')
            const updatedProbability = calculateLiveTeamWinProbability(battle)

            // Update current probabilities
            battle.winProbability.teamA.current = updatedProbability.teamA
            battle.winProbability.teamB.current = updatedProbability.teamB

            // Track in history
            battle.winProbability.teamA.history.push({
              afterUserId: userId,
              afterChallenge: challengeId,
              probability: updatedProbability.teamA,
              timestamp: new Date(),
              certaintyScore: updatedProbability.certaintyScore,
              projectedWins: updatedProbability.projection.teamAWins,
            })

            battle.winProbability.lastUpdatedAt = new Date()
            battle.winProbability.totalUpdates =
              (battle.winProbability.totalUpdates || 0) + 1

            console.log('[WIN_PROB] Live probability updated:', {
              teamA: updatedProbability.teamA,
              teamB: updatedProbability.teamB,
              certainty: updatedProbability.certaintyScore,
              trend: updatedProbability.trend,
            })
          } catch (probError) {
            // Non-blocking: battle continues even if probability update fails
            console.error(
              '[WIN_PROB] Error updating live probability:',
              probError,
            )
          }
        }

        // Check if battle is completed (all challenges have a winner or time expired)
        const allChallengesCompleted = battle.challenges.every(
          c => c.teamACompleted && c.teamBCompleted,
        )

        // Calculate remaining time
        const now = new Date()
        const timeRemaining = battle.expiresAt - now

        // Mark as completed if:
        // 1. All challenges are completed, OR
        // 2. Time expired
        const shouldComplete = allChallengesCompleted || timeRemaining <= 0

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

          console.log(
            `[updateBattleWithQuizResults] Battle completed - Winner: ${battle.winner}`,
          )

          // Clean up bot health tracking for this completed battle
          setTimeout(() => {
            stopTrackingAllBotsInBattle(battle._id.toString())
          }, 5000) // Wait 5 seconds to ensure all final operations complete

          // Emit event after all processing
          setTimeout(() => {
            globalEmitter.emit('quickClash:teamBattleCompleted', {
              battleId: battle._id,
              winner: battle.winner,
              teamA: battle.teamA,
              teamB: battle.teamB,
            })

            // Clean up mutex resources for completed battle
            try {
              const cleanedMutexes = cleanupBattleMutexes(battle._id.toString())
              console.log(
                `[BATTLE_CLEANUP] Cleaned up ${cleanedMutexes} mutexes for completed battle ${battle._id}`,
              )
            } catch (error) {
              console.error(
                `[BATTLE_CLEANUP] Error cleaning up mutexes for battle ${battle._id}:`,
                error,
              )
            }
          }, 0)
        } else {
          console.log(
            `[updateBattleWithQuizResults] Quiz completed but battle continues`,
          )

          setTimeout(() => {
            globalEmitter.emit('quickClash:teamBattleQuizCompleted', {
              battleId: battle._id,
              userId: userId,
              score: score,
              challengeId: challengeId,
              allTeamMembers: [
                ...battle.teamAMembers.map(member => member.user.toString()),
                ...battle.teamBMembers.map(member => member.user.toString()),
              ],
            })
          }, 100)
        }

        await battle.save({ session })

        console.log(
          `[updateBattleWithQuizResults] Successfully updated battle with quiz results`,
        )
        return battle
      })
    } catch (error) {
      console.error('Error updating battle with quiz results:', error)
      throw error
    } finally {
      session.endSession()
    }
  },
  {
    maxRetries: 3,
    operationName: 'UpdateBattleWithQuizResults',
    initialDelay: 1000,
    maxDelay: 5000,
    onRetry: (error, attempt) => {
      console.warn(
        `[updateBattleWithQuizResults] Retry attempt ${attempt}/3 after error: ${error.message}`,
      )
    },
    onAllRetriesFailed: async (
      error,
      { battleId, challengeId, userId, score },
    ) => {
      console.error(
        `[updateBattleWithQuizResults] All retries failed for battle ${battleId}, challenge ${challengeId}, user ${userId}`,
      )

      // Log the failed update for manual recovery if needed
      console.error(`[updateBattleWithQuizResults] Failed update data:`, {
        battleId,
        challengeId,
        userId,
        score,
        timestamp: new Date().toISOString(),
        finalError: error.message,
      })

      // Try to emit a failure notification to users
      try {
        setTimeout(() => {
          globalEmitter.emit('quickClash:teamBattleUpdateFailed', {
            battleId,
            userId,
            challengeId,
            error: 'Quiz results could not be saved after multiple attempts',
          })
        }, 0)
      } catch (emitError) {
        console.error(
          `[updateBattleWithQuizResults] Failed to emit error notification:`,
          emitError,
        )
      }

      // Create a more user-friendly error message
      const finalError = new Error(
        'Your quiz results could not be saved after multiple attempts. Please contact support to ensure your progress is recorded.',
      )
      finalError.isRetryExhausted = true
      finalError.originalError = error
      finalError.battleId = battleId
      finalError.challengeId = challengeId
      finalError.userId = userId
      throw finalError
    },
    // Custom retry condition
    isRetryable: error => {
      // Don't retry validation errors
      if (
        error.message.includes('Team battle not found') ||
        error.message.includes('Challenge not found in this battle') ||
        error.message.includes('User is not a member of either team')
      ) {
        return false
      }

      // Use default retry logic for other errors (database errors, network issues, etc.)
      return true
    },
  },
)

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
