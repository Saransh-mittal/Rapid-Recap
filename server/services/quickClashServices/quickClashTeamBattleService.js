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

// Constants
const TEAM_BATTLE_EXPIRY = 24 * 60 * 60 * 1000 // 24 hours same as regular challenges
const BASE_TROPHIES = 120 // Base trophies for 4v4 mode
const TROPHY_K_FACTOR = 0.8 // From trophy formula

/**
 * Helper to emit progress updates to teams
 * @param {string} teamAId - Team A ID
 * @param {string} teamBId - Team B ID (optional, for bot teams)
 * @param {string} step - Progress step
 * @param {number} progress - Progress percentage
 */
const emitTeamBattleProgress = (teamAId, teamBId, step, progress) => {
  // Emit progress event for Team A
  globalEmitter.emit('quickClash:teamBattleProgress', {
    teamId: teamAId,
    step,
    progress,
  })

  // Emit progress event for Team B if it exists
  if (teamBId) {
    globalEmitter.emit('quickClash:teamBattleProgress', {
      teamId: teamBId,
      step,
      progress,
    })
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
const createTeamBattle = async ({
  teamAId,
  teamBId,
  categories,
  session: providedSession,
}) => {
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

    // ======= PROGRESS: BATTLE INITIALIZATION (5%) =======
    console.log(`[TeamBattle] PHASE 1: Battle initialization (5%)`)
    // Initial notification to indicate the process has started
    emitTeamBattleProgress(teamAId, teamBId, 'battleStarted', 5)

    // ======= PROGRESS: LOADING TEAM DATA (15%) =======
    console.log(`[TeamBattle] PHASE 2: Loading team data (15%)`)
    // Notify that we're loading the team data
    emitTeamBattleProgress(teamAId, teamBId, 'teamDataLoading', 15)

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
    // Teams data has been successfully loaded
    emitTeamBattleProgress(teamAId, teamBId, 'teamsLoaded', 25)

    // ======= PROGRESS: PREPARING CONTENT (35%) =======
    console.log(`[TeamBattle] PHASE 4: Preparing content (35%)`)
    // Notify that we're preparing the battle content
    emitTeamBattleProgress(teamAId, teamBId, 'contentPreparing', 35)

    // Create challenges for each category
    const challengesData = []
    const challengeCreationPromises = []

    // Progress update - Starting article processing
    emitTeamBattleProgress(teamAId, teamBId, 'articlesLoading', 40)

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
    // Notify that we're processing the articles
    emitTeamBattleProgress(teamAId, teamBId, 'articlesProcessing', 45)

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

    // Check if this is the first team battle of the day for team A
    console.log(`[TeamBattle] Checking if first daily team battle for Team A`)
    const isFirstDaily = await isFirstDailyTeamBattle(teamAId)
    console.log(`[TeamBattle] Is first daily battle: ${isFirstDaily}`)

    // ======= PROGRESS: BATTLE SETUP (55%) =======
    console.log(`[TeamBattle] PHASE 6: Battle setup (55%)`)
    // Notify that we're setting up the battle details
    emitTeamBattleProgress(teamAId, teamBId, 'battleSetup', 55)

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
      isFirstDailyBattle: isFirstDaily,
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
        firstDaily: {
          applied: isFirstDaily,
          amount: isFirstDaily ? Math.round(potentialTrophyExchange * 0.1) : 0,
        },
        strongerTeam: {
          applied: false, // Will be determined at the end
          amount: 0,
        },
        comebackWin: {
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
    // Notify that we're creating the challenges
    emitTeamBattleProgress(teamAId, teamBId, 'generatingChallenges', 65)

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
      emitTeamBattleProgress(
        teamAId,
        teamBId,
        'creatingChallenge',
        progressPercent,
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

    // ======= PROGRESS: CHALLENGES READY (85%) =======
    console.log(`[TeamBattle] PHASE 8: Challenges ready (85%)`)
    // Notify that all challenges have been created
    emitTeamBattleProgress(teamAId, teamBId, 'challengesReady', 85)

    // Save team battle again with challenge IDs
    console.log(`[TeamBattle] Updating team battle with challenge IDs`)
    await teamBattle.save({ session })
    console.log(`[TeamBattle] Team battle updated with challenge IDs`)

    // ======= PROGRESS: GENERATING QUIZZES (90%) =======
    console.log(`[TeamBattle] PHASE 9: Generating quizzes (90%)`)
    // Notify that we're generating quizzes for challenges
    emitTeamBattleProgress(teamAId, teamBId, 'generatingQuizzes', 90)

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
          emitTeamBattleProgress(
            teamAId,
            teamBId,
            'generatingQuizzes',
            progressStep,
          )

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

      // ======= PROGRESS: BATTLE FINALIZING (95%) =======
      console.log(`[TeamBattle] PHASE 10: Battle finalizing (95%)`)
      // Notify that the battle is being finalized
      emitTeamBattleProgress(teamAId, teamBId, 'battleFinalizing', 95)

      // If we started a transaction, commit it
      if (startedTransaction) {
        console.log(`[TeamBattle] Committing transaction`)
        await session.commitTransaction()
        console.log(`[TeamBattle] Transaction committed successfully`)
      }

      // ======= PROGRESS: BATTLE READY (100%) =======
      console.log(`[TeamBattle] PHASE 11: Battle ready (100%)`)
      // Final notification - battle is ready
      emitTeamBattleProgress(teamAId, teamBId, 'battleReady', 100)

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
      setTimeout(() => {
        console.log(
          `[TeamBattle] Emitting teamBattleCreated event for battle: ${teamBattle._id}`,
        )
        globalEmitter.emit('quickClash:teamBattleCreated', {
          teamBattle: teamBattle._id,
          teamA: teamAId,
          teamB: teamBId,
          categories,
        })

        // Also emit the teamBattleReady event with appropriate information
        // For team A members
        console.log(
          `[TeamBattle] Team A: ${teamA.name} with ${teamA.members.length} members`,
        )
        if (teamA && teamA.members) {
          teamA.members.forEach(member => {
            console.log(
              `[TeamBattle] Emitting teamBattleReady event for Team A member: ${member.user._id}`,
            )
            globalEmitter.emit('quickClash:teamBattleReady', {
              battleId: teamBattle._id,
              teamId: teamAId,
              teamA: teamAId,
              teamB: teamBId,
              userId: member.user._id,
            })
          })
        }

        // For team B members
        console.log(
          `[TeamBattle] Team B: ${teamB.name} with ${teamB.members.length} members`,
        )
        if (teamB && teamB.members) {
          teamB.members.forEach(member => {
            console.log(
              `[TeamBattle] Emitting teamBattleReady event for Team B member: ${member.user._id}`,
            )
            globalEmitter.emit('quickClash:teamBattleReady', {
              battleId: teamBattle._id,
              teamId: teamBId,
              teamA: teamAId,
              teamB: teamBId,
              userId: member.user._id,
            })
          })
        }
      }, 0)

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
    console.error(`[TeamBattle] ===== ERROR CREATING TEAM BATTLE =====`, error)
    console.error(`[TeamBattle] Error message: ${error.message}`)
    console.error(`[TeamBattle] TeamA: ${teamAId}, TeamB: ${teamBId}`)
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
 * Check if this is the first team battle of the day for a team
 * @param {string} teamId - Team ID
 * @returns {Promise<boolean>} Whether this is the first battle of the day
 */
const isFirstDailyTeamBattle = async teamId => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const existingBattles = await QuickClashTeamBattle.countDocuments({
    $or: [{ teamA: teamId }, { teamB: teamId }],
    createdAt: { $gte: today },
  })

  return existingBattles === 0
}

/**
 * Select a category for a team member
 * @param {Object} params - Parameters
 * @param {string} params.battleId - Team battle ID
 * @param {string} params.userId - User ID
 * @param {string} params.category - Selected category
 * @returns {Promise<Object>} Updated battle with session info
 */
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

      // Check if category exists in this battle
      const challengeIndex = battle.challenges.findIndex(
        c => c.category === category,
      )

      if (challengeIndex === -1) {
        throw new Error('Category not found in this battle')
      }

      // Check if challenge already has a player for this user's team
      const isTeamAUser = battle.teamAMembers.some(
        m => m.user.toString() === userId.toString(),
      )
      const isTeamBUser = battle.teamBMembers.some(
        m => m.user.toString() === userId.toString(),
      )

      if (!isTeamAUser && !isTeamBUser) {
        throw new Error('User is not a member of either team')
      }

      // Check if user already selected a category
      if (isTeamAUser) {
        const memberIndex = battle.teamAMembers.findIndex(
          m => m.user.toString() === userId.toString(),
        )

        if (battle.teamAMembers[memberIndex].category) {
          throw new Error('You have already selected a category')
        }

        // Check if another team member already selected this category
        const categoryAlreadySelected = battle.teamAMembers.some(
          m =>
            m.category === category && m.user.toString() !== userId.toString(),
        )

        if (categoryAlreadySelected) {
          throw new Error(
            'This category has already been selected by a teammate',
          )
        }

        // Select the category for this user
        battle.teamAMembers[memberIndex].category = category
        battle.teamAMembers[memberIndex].challenge =
          battle.challenges[challengeIndex].challenge._id
        battle.teamAMembers[memberIndex].participated = true

        // Update the challenge with this user as challenger
        battle.challenges[challengeIndex].teamAPlayer = userId

        // Update the challenge document
        await QuickClashChallenge.findByIdAndUpdate(
          battle.challenges[challengeIndex].challenge._id,
          { challenger: userId },
          { session },
        )
      } else {
        const memberIndex = battle.teamBMembers.findIndex(
          m => m.user.toString() === userId.toString(),
        )

        if (battle.teamBMembers[memberIndex].category) {
          throw new Error('You have already selected a category')
        }

        // Check if another team member already selected this category
        const categoryAlreadySelected = battle.teamBMembers.some(
          m =>
            m.category === category && m.user.toString() !== userId.toString(),
        )

        if (categoryAlreadySelected) {
          throw new Error(
            'This category has already been selected by a teammate',
          )
        }

        // Select the category for this user
        battle.teamBMembers[memberIndex].category = category
        battle.teamBMembers[memberIndex].challenge =
          battle.challenges[challengeIndex].challenge._id
        battle.teamBMembers[memberIndex].participated = true

        // Update the challenge with this user as opponent
        battle.challenges[challengeIndex].teamBPlayer = userId

        // Update the challenge document
        await QuickClashChallenge.findByIdAndUpdate(
          battle.challenges[challengeIndex].challenge._id,
          { opponent: userId },
          { session },
        )
      }

      await battle.save({ session })

      // Find the challenge for the session
      const challenge = battle.challenges.find(
        c => c.category === category,
      ).challenge

      // Create a session for this user
      const sessionInfo = {
        challengeId: challenge._id,
        category,
        battleId: battle._id,
      }

      // Emit event
      setTimeout(() => {
        globalEmitter.emit('quickClash:teamMemberSelectedCategory', {
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
    console.error('Error selecting category for user:', error)
    throw error
  } finally {
    session.endSession()
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

      // Check if battle is completed (all challenges have a winner)
      const allChallengesCompleted = battle.challenges.every(
        c => c.teamACompleted && c.teamBCompleted,
      )

      const allTeamACategoriesSelected = battle.challenges.every(
        c => c.teamAPlayer !== null,
      )

      const allTeamBCategoriesSelected = battle.challenges.every(
        c => c.teamBPlayer !== null,
      )

      // Calculate remaining time
      const now = new Date()
      const timeRemaining = battle.expiresAt - now

      // Mark as completed if:
      // 1. All challenges are completed, OR
      // 2. Time expired AND each team has completed at least one challenge
      const shouldComplete =
        allChallengesCompleted ||
        (timeRemaining <= 0 &&
          battle.challenges.some(c => c.teamACompleted) &&
          battle.challenges.some(c => c.teamBCompleted))

      if (shouldComplete) {
        battle.status = 'completed'

        // Determine overall winner
        if (battle.teamAWins > battle.teamBWins) {
          battle.winner = 'teamA'
        } else if (battle.teamBWins > battle.teamAWins) {
          battle.winner = 'teamB'
        } else if (battle.teamATotalScore > battle.teamBTotalScore) {
          // Tiebreaker 1: Higher total RQM score
          battle.winner = 'teamA'
        } else if (battle.teamBTotalScore > battle.teamATotalScore) {
          battle.winner = 'teamB'
        } else {
          // Tiebreaker 2: Highest individual RQM score
          const teamAHighestScore = Math.max(
            ...battle.teamAMembers.map(m => m.score),
          )
          const teamBHighestScore = Math.max(
            ...battle.teamBMembers.map(m => m.score),
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
        const isTeamAStronger = false // Will be determined in calculateFinalTrophies
        const hasTeamAComeback = determineComeback(battle)
        const didTeamAWinAll = battle.teamAWins === battle.challenges.length

        // Mark bonus flags
        battle.isComeback = hasTeamAComeback
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
 * Determine if this was a comeback win
 * @param {Object} battle - Team battle object
 * @returns {boolean} Whether this was a comeback win
 */
const determineComeback = battle => {
  if (battle.winner !== 'teamA') {
    return false
  }

  // Check if Team A was losing after the first match
  const firstCompletedChallenge = battle.challenges.find(
    c => c.teamACompleted && c.teamBCompleted,
  )

  if (firstCompletedChallenge && firstCompletedChallenge.winner === 'teamB') {
    return true
  }

  return false
}

/**
 * Calculate and apply final trophies for the battle
 * @param {Object} battle - Team battle document
 * @param {mongoose.ClientSession} session - Mongoose session
 * @returns {Promise<void>}
 */
const calculateFinalTrophies = async (battle, session) => {
  // Base amount already set during battle creation
  const baseAmount = battle.trophyExchange.adjustedAmount

  // Apply bonuses if Team A won
  let finalAmount = baseAmount
  const bonuses = battle.trophyExchange.bonuses

  // First daily bonus (already set during creation)
  if (bonuses.firstDaily.applied) {
    finalAmount += bonuses.firstDaily.amount
  }

  // Stronger team bonus (+20% if winning against team with 200+ more trophies)
  let teamAAvgTrophies = 0
  let teamBAvgTrophies = 0

  // Calculate current average trophies
  const teamAMemberCount = battle.teamAMembers.length
  teamAAvgTrophies =
    battle.teamAMembers.reduce((sum, m) => sum + m.previousTrophies, 0) /
    teamAMemberCount

  const teamBMemberCount = battle.teamBMembers.length
  teamBAvgTrophies =
    battle.teamBMembers.reduce((sum, m) => sum + m.previousTrophies, 0) /
    teamBMemberCount

  const teamAIsWeaker = teamAAvgTrophies + 200 <= teamBAvgTrophies

  if (battle.winner === 'teamA' && teamAIsWeaker) {
    const strongerTeamBonus = Math.round(baseAmount * 0.2)
    bonuses.strongerTeam.applied = true
    bonuses.strongerTeam.amount = strongerTeamBonus
    finalAmount += strongerTeamBonus
  }

  // Comeback win bonus (+10%)
  if (battle.isComeback && battle.winner === 'teamA') {
    const comebackBonus = Math.round(baseAmount * 0.1)
    bonuses.comebackWin.applied = true
    bonuses.comebackWin.amount = comebackBonus
    finalAmount += comebackBonus
  }

  // All wins bonus (+15%)
  if (battle.allMatchesWon && battle.winner === 'teamA') {
    const allWinsBonus = Math.round(baseAmount * 0.15)
    bonuses.allWins.applied = true
    bonuses.allWins.amount = allWinsBonus
    finalAmount += allWinsBonus
  }

  // Update trophy exchange data
  battle.trophyExchange.finalAmount = finalAmount

  // Calculate per-player amounts
  let winnerTeamTrophies = 0
  let loserTeamTrophies = 0

  if (battle.winner === 'teamA') {
    // Team A won
    winnerTeamTrophies = Math.round(finalAmount * 1.25)
    loserTeamTrophies = Math.round(finalAmount * 0.75)

    // Per player amount
    const winnerPerPlayer = Math.round(winnerTeamTrophies / teamAMemberCount)
    const loserPerPlayer = Math.round(loserTeamTrophies / teamBMemberCount)

    // Update team A members (winners)
    for (const member of battle.teamAMembers) {
      member.trophyChange = winnerPerPlayer
      member.newTrophies = member.previousTrophies + winnerPerPlayer

      // Update user trophies in database
      await User.findByIdAndUpdate(
        member.user,
        { $inc: { quickClashTrophies: winnerPerPlayer } },
        { session },
      )

      // Create trophy history entry
      await new QuickClashTeamTrophyHistory({
        user: member.user,
        team: battle.teamA,
        teamBattle: battle._id,
        trophiesChange: winnerPerPlayer,
        trophiesAfter: member.newTrophies,
        opponentTeam: battle.teamB,
        opponentTeamAvgTrophies: teamBAvgTrophies,
        result: 'win',
        bonusesApplied: {
          firstDaily: bonuses.firstDaily.applied,
          strongerTeam: bonuses.strongerTeam.applied,
          comebackWin: bonuses.comebackWin.applied,
          allWins: bonuses.allWins.applied,
        },
        userParticipated: member.participated,
        userCompleted: member.completed,
        userScore: member.score,
      }).save({ session })
    }

    // Update team B members (losers)
    for (const member of battle.teamBMembers) {
      member.trophyChange = -loserPerPlayer
      member.newTrophies = Math.max(0, member.previousTrophies - loserPerPlayer)

      // Calculate actual trophy change (in case of floor protection)
      const actualChange = member.newTrophies - member.previousTrophies

      // Update user trophies in database
      await User.findByIdAndUpdate(
        member.user,
        { $set: { quickClashTrophies: member.newTrophies } },
        { session },
      )

      // Create trophy history entry
      await new QuickClashTeamTrophyHistory({
        user: member.user,
        team: battle.teamB,
        teamBattle: battle._id,
        trophiesChange: actualChange,
        trophiesAfter: member.newTrophies,
        opponentTeam: battle.teamA,
        opponentTeamAvgTrophies: teamAAvgTrophies,
        result: 'loss',
        bonusesApplied: {
          firstDaily: false,
          strongerTeam: false,
          comebackWin: false,
          allWins: false,
        },
        userParticipated: member.participated,
        userCompleted: member.completed,
        userScore: member.score,
      }).save({ session })
    }
  } else if (battle.winner === 'teamB') {
    // Team B won
    winnerTeamTrophies = Math.round(finalAmount * 1.25)
    loserTeamTrophies = Math.round(finalAmount * 0.75)

    // Per player amount
    const winnerPerPlayer = Math.round(winnerTeamTrophies / teamBMemberCount)
    const loserPerPlayer = Math.round(loserTeamTrophies / teamAMemberCount)

    // Update team B members (winners)
    for (const member of battle.teamBMembers) {
      member.trophyChange = winnerPerPlayer
      member.newTrophies = member.previousTrophies + winnerPerPlayer

      // Update user trophies in database
      await User.findByIdAndUpdate(
        member.user,
        { $inc: { quickClashTrophies: winnerPerPlayer } },
        { session },
      )

      // Create trophy history entry
      await new QuickClashTeamTrophyHistory({
        user: member.user,
        team: battle.teamB,
        teamBattle: battle._id,
        trophiesChange: winnerPerPlayer,
        trophiesAfter: member.newTrophies,
        opponentTeam: battle.teamA,
        opponentTeamAvgTrophies: teamAAvgTrophies,
        result: 'win',
        bonusesApplied: {
          firstDaily: false, // Bonuses only apply to team A
          strongerTeam: false,
          comebackWin: false,
          allWins: false,
        },
        userParticipated: member.participated,
        userCompleted: member.completed,
        userScore: member.score,
      }).save({ session })
    }

    // Update team A members (losers)
    for (const member of battle.teamAMembers) {
      member.trophyChange = -loserPerPlayer
      member.newTrophies = Math.max(0, member.previousTrophies - loserPerPlayer)

      // Calculate actual trophy change (in case of floor protection)
      const actualChange = member.newTrophies - member.previousTrophies

      // Update user trophies in database
      await User.findByIdAndUpdate(
        member.user,
        { $set: { quickClashTrophies: member.newTrophies } },
        { session },
      )

      // Create trophy history entry
      await new QuickClashTeamTrophyHistory({
        user: member.user,
        team: battle.teamA,
        teamBattle: battle._id,
        trophiesChange: actualChange,
        trophiesAfter: member.newTrophies,
        opponentTeam: battle.teamB,
        opponentTeamAvgTrophies: teamBAvgTrophies,
        result: 'loss',
        bonusesApplied: {
          firstDaily: bonuses.firstDaily.applied,
          strongerTeam: false,
          comebackWin: false,
          allWins: false,
        },
        userParticipated: member.participated,
        userCompleted: member.completed,
        userScore: member.score,
      }).save({ session })
    }
  } else {
    // Tie - distribute trophies evenly
    // For ties, we give a small amount to both teams
    const tieAmount = Math.round(finalAmount * 0.1)

    // Update team A members
    for (const member of battle.teamAMembers) {
      member.trophyChange = tieAmount
      member.newTrophies = member.previousTrophies + tieAmount

      // Update user trophies in database
      await User.findByIdAndUpdate(
        member.user,
        { $inc: { quickClashTrophies: tieAmount } },
        { session },
      )

      // Create trophy history entry
      await new QuickClashTeamTrophyHistory({
        user: member.user,
        team: battle.teamA,
        teamBattle: battle._id,
        trophiesChange: tieAmount,
        trophiesAfter: member.newTrophies,
        opponentTeam: battle.teamB,
        opponentTeamAvgTrophies: teamBAvgTrophies,
        result: 'tie',
        bonusesApplied: {
          firstDaily: bonuses.firstDaily.applied,
          strongerTeam: false,
          comebackWin: false,
          allWins: false,
        },
        userParticipated: member.participated,
        userCompleted: member.completed,
        userScore: member.score,
      }).save({ session })
    }

    // Update team B members
    for (const member of battle.teamBMembers) {
      member.trophyChange = tieAmount
      member.newTrophies = member.previousTrophies + tieAmount

      // Update user trophies in database
      await User.findByIdAndUpdate(
        member.user,
        { $inc: { quickClashTrophies: tieAmount } },
        { session },
      )

      // Create trophy history entry
      await new QuickClashTeamTrophyHistory({
        user: member.user,
        team: battle.teamB,
        teamBattle: battle._id,
        trophiesChange: tieAmount,
        trophiesAfter: member.newTrophies,
        opponentTeam: battle.teamA,
        opponentTeamAvgTrophies: teamAAvgTrophies,
        result: 'tie',
        bonusesApplied: {
          firstDaily: false,
          strongerTeam: false,
          comebackWin: false,
          allWins: false,
        },
        userParticipated: member.participated,
        userCompleted: member.completed,
        userScore: member.score,
      }).save({ session })
    }
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
    .populate('teamA', 'name avgTrophies')
    .populate('teamB', 'name avgTrophies')
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

module.exports = {
  createTeamBattle,
  selectCategoryForUser,
  updateBattleWithQuizResults,
  getUserTeamBattles,
  getTeamBattleDetails,
}
