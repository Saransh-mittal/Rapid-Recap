// services/quickClashServices/quickClashBotService.js
const mongoose = require('mongoose')
const QuickClashSession = require('../../model/quickClashSchemas/quickClashSessionSchema')
const QuickClashQuiz = require('../../model/quickClashSchemas/quickClashQuizSchema')
const QuickClashChallenge = require('../../model/quickClashSchemas/quickClashChallengeSchema')
const User = require('../../model/userSchema')
const { updateChallengeScore } = require('./quickClashChallengeService')
const { notifyChallengeCompleted } = require('./quickClashNotificationService')
const QuickClashGlobalMatchmaking = require('../../model/quickClashSchemas/quickClashGlobalMatchmakingSchema')
const QuickClashTeamMatchmaking = require('../../model/quickClashSchemas/quickClashTeamMatchmakingSchema')
const QuickClashTeamBattle = require('../../model/quickClashSchemas/quickClashTeamBattleSchema')
const { joinGlobalMatchmaking } = require('./quickClashTeamMatchmakingService')
const {
  updateBattleWithQuizResults,
  markUserAsParticipated,
} = require('./quickClashTeamBattleService')
const { getRandomBotUser } = require('../../utils/quickClashUtils')
const { isBotUser } = require('../../utils/user.utils')
const { donatePowerup } = require('./quickClashPowerupService')
const globalEmitter = require('../../eventEmitter')

/**
 * Initiate full bot challenge process - create session, complete reading and quiz
 * @param {Object} params - Parameters
 * @param {string} params.challengeId - Challenge ID
 * @param {string} params.botId - Bot user ID
 * @param {Object} [params.options] - Optional behavior configuration
 * @param {number} [params.options.skillLevel] - Bot skill level (0.2-0.9, defaults to random)
 * @param {number} [params.options.readingSpeed] - Reading speed (30-200 sec, defaults to random)
 * @param {boolean} [params.options.quickResponse] - If true, bot responds quickly
 * @returns {Promise<Object>} The completed session with score
 */
const initiateBotChallenge = async ({ challengeId, botId, options = {} }) => {
  const session = await mongoose.startSession()
  let result = null

  try {
    await session.startTransaction()

    // 1. Create session for bot
    const botSession = await createBotSession({
      challengeId,
      botId,
      session,
    })

    // 2. Determine bot's skill and reading properties
    const botSkill = options.skillLevel || Math.random() * 0.5 + 0.3 // Between 0.3 and 0.8

    // Determine reading time - slower bots take longer
    const baseReadingTime = options.quickResponse ? 30 : 60
    const randomFactor = 1 - botSkill * 0.5 // Higher skill = less random variance
    const readingTime = Math.floor(
      baseReadingTime + Math.random() * 60 * randomFactor,
    )

    // 3. Simulate reading phase
    await simulateBotReadingPhase({
      userId: botId,
      sessionId: botSession._id,
      readingTime,
      session,
    })

    // 4. Simulate quiz responses
    const completedSession = await simulateBotQuizAnswers({
      sessionId: botSession._id,
      botSkill,
      session,
    })

    // 5. Commit transaction
    await session.commitTransaction()

    // 6. Return result (after transaction to ensure it's committed)
    result = completedSession

    // 7. Trigger notification about bot completing challenge (outside transaction)
    setTimeout(() => {
      triggerCompletionNotification({
        challengeId,
        botId,
        botScore: completedSession.score.RQM_score,
      }).catch(err => {
        console.error('Error sending bot completion notification:', err)
      })
    }, 0)

    return result
  } catch (error) {
    console.error('Error in bot challenge process:', error)
    await session.abortTransaction()
    throw error
  } finally {
    session.endSession()
  }
}

/**
 * Create a session for the bot
 * @param {Object} params - Parameters
 * @param {string} params.challengeId - Challenge ID
 * @param {string} params.botId - Bot user ID
 * @param {mongoose.ClientSession} params.session - Mongoose session
 * @returns {Promise<Object>} Bot session
 */
const createBotSession = async ({ challengeId, botId, session }) => {
  try {
    // Check if bot exists
    const bot = await User.findById(botId)
      .select('userLanguage')
      .session(session)

    if (!bot) {
      throw new Error('Bot user not found')
    }

    // Check if challenge exists
    const challenge = await QuickClashChallenge.findById(challengeId).session(
      session,
    )

    if (!challenge) {
      throw new Error('Challenge not found')
    }

    // Check if session already exists (avoid duplicates)
    const existingSession = await QuickClashSession.findOne({
      challenge: challengeId,
      user: botId,
    }).session(session)

    if (existingSession) {
      return existingSession
    }

    // Determine bot's preferred language
    const language = bot.userLanguage || 'en'

    // Find appropriate quiz
    const quiz = await QuickClashQuiz.findOne({
      challenge: challengeId,
      language,
    }).session(session)

    if (!quiz) {
      throw new Error(`Quiz not found for language: ${language}`)
    }

    // Create session with 24 hour expiry
    const EXPIRY_TIME = 24 * 60 * 60 * 1000

    const botSession = new QuickClashSession({
      challenge: challengeId,
      user: botId,
      quiz: quiz._id,
      language,
      expiresAt: new Date(Date.now() + EXPIRY_TIME),
    })

    await botSession.save({ session })
    return botSession
  } catch (error) {
    console.error('Error creating bot session:', error)
    throw error
  }
}

/**
 * Simulate bot completing reading phase
 * @param {Object} params - Parameters
 * @param {string} params.sessionId - Session ID
 * @param {number} params.readingTime - Simulated reading time in seconds
 * @param {mongoose.ClientSession} params.session - Mongoose session
 * @returns {Promise<Object>} Updated session
 */
const simulateBotReadingPhase = async ({
  userId,
  sessionId,
  readingTime,
  session,
}) => {
  try {
    const botSession = await QuickClashSession.findById(sessionId).session(
      session,
    )

    if (!botSession) {
      throw new Error('Bot session not found')
    }

    // Calculate start and end times to simulate realistic reading
    const now = new Date()
    const startTime = new Date(now.getTime() - readingTime * 1000)

    if (botSession.challenge) {
      await markUserAsParticipated({
        challengeId: botSession.challenge,
        userId: userId,
      })
    }

    // Update reading properties
    botSession.reading = {
      startTime,
      endTime: now,
      timeSpent: readingTime,
      completed: true,
      completionType: 'manual',
    }

    // Move to quiz phase
    botSession.phase = 'quiz'

    // Initialize quiz attempt
    if (!botSession.quizAttempt) {
      botSession.quizAttempt = {}
    }

    botSession.quizAttempt.startTime = now

    await botSession.save({ session })
    return botSession
  } catch (error) {
    console.error('Error simulating bot reading phase:', error)
    throw error
  }
}

/**
 * Simulate bot answering quiz questions
 * @param {Object} params - Parameters
 * @param {string} params.sessionId - Session ID
 * @param {number} params.botSkill - Bot skill level (0.0-1.0)
 * @param {mongoose.ClientSession} params.session - Mongoose session
 * @returns {Promise<Object>} Updated session with quiz results
 */
const simulateBotQuizAnswers = async ({
  sessionId,
  botSkill = 0.6,
  session,
}) => {
  try {
    // Get session with quiz
    const botSession = await QuickClashSession.findById(sessionId)
      .populate('quiz')
      .session(session)

    if (!botSession || !botSession.quiz) {
      throw new Error('Bot session or quiz not found')
    }

    const questions = botSession.quiz.questions
    if (!questions || !questions.length) {
      throw new Error('No questions found in quiz')
    }

    // Select 5 random questions like the frontend would
    const selectedQuestions =
      questions.length <= 5 ? questions : getRandomSubset(questions, 5)

    // Store selected question IDs
    botSession.quizAttempt.selectedQuestionIds = selectedQuestions.map(q =>
      q._id.toString(),
    )

    // Initialize answer mappings and shuffled options
    const answerMappings = {}
    const shuffledOptions = {}

    // Shuffle options for each question (similar to frontend)
    selectedQuestions.forEach(q => {
      // Create shuffled options
      const optionEntries = Object.entries(q.options)

      // Shuffle the entries
      for (let i = optionEntries.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[optionEntries[i], optionEntries[j]] = [
          optionEntries[j],
          optionEntries[i],
        ]
      }

      // Convert back to an object with new keys
      const shuffledOptionsForQuestion = {}
      optionEntries.forEach(([key, value], index) => {
        const newKey = String.fromCharCode(97 + index) // 97 is ASCII for 'a'
        shuffledOptionsForQuestion[newKey] = value
      })

      // Store mapping from original answer to new answer
      const originalAnswer = q.answer
      const originalOptionValue = q.options[originalAnswer]
      let newAnswer = ''

      Object.entries(shuffledOptionsForQuestion).forEach(([key, value]) => {
        if (value === originalOptionValue) {
          newAnswer = key
        }
      })

      // Store in our mapping objects
      const questionId = q._id.toString()
      answerMappings[questionId] = {
        originalAnswer,
        newAnswer,
      }

      shuffledOptions[questionId] = shuffledOptionsForQuestion
    })

    // Store mappings in session (like frontend would)
    botSession.quizAttempt.answerMappings = answerMappings
    botSession.quizAttempt.shuffledOptions = shuffledOptions

    // Generate bot responses
    const responses = []
    let totalTimeSpent = 0

    for (const question of selectedQuestions) {
      // Determine if answer is correct based on bot skill and question difficulty
      const questionDifficulty = question.difficulty || 0.5
      const difficultyFactor = 1 - questionDifficulty
      const correctChance = botSkill * difficultyFactor

      const isCorrect = Math.random() < correctChance

      // Determine question response time (between 3-15 seconds)
      const speedFactor = botSkill
      const minTime = 3
      const maxTime = 15
      const timeSpent = Math.floor(
        minTime + (1 - speedFactor) * (maxTime - minTime),
      )

      totalTimeSpent += timeSpent

      // Determine answer
      const questionId = question._id.toString()
      const mapping = answerMappings[questionId]

      let userAnswer
      if (isCorrect) {
        userAnswer = mapping.newAnswer
      } else {
        // Choose a random incorrect answer
        const possibleAnswers = Object.keys(shuffledOptions[questionId])
        const wrongOptions = possibleAnswers.filter(
          key => key !== mapping.newAnswer,
        )
        userAnswer =
          wrongOptions[Math.floor(Math.random() * wrongOptions.length)]
      }

      responses.push({
        questionId: question._id,
        userAnswer,
        isCorrect,
        timeSpent,
      })
    }

    // Add slight randomness to total time
    const totalTimeWithRandomness = Math.floor(
      totalTimeSpent * (0.9 + Math.random() * 0.2),
    )

    // Mark quiz as completed
    const now = new Date()
    const quizStartTime =
      botSession.quizAttempt.startTime ||
      new Date(now.getTime() - totalTimeWithRandomness * 1000)

    botSession.quizAttempt.responses = responses
    botSession.quizAttempt.timeSpent = totalTimeWithRandomness
    botSession.quizAttempt.completed = true
    botSession.quizAttempt.endTime = now
    botSession.phase = 'completed'

    // Calculate RQM score
    const correctCount = responses.filter(r => r.isCorrect).length
    const accuracy = correctCount / responses.length

    // Calculate score using difficulty and time factors
    const difficulty = botSession.quiz.overallDifficulty || 0.5
    const baseScore = accuracy * 100
    const timeBonus = Math.max(0, 1 - totalTimeWithRandomness / 50) * 0.5
    const RQM_score = Math.round(baseScore * (1 + difficulty * 0.5 + timeBonus))

    botSession.score = {
      RQM_score,
      baseRQM_score: baseScore,
      speedBonus: timeBonus > 0,
      accuracyBonus: accuracy > 0.8,
      total: RQM_score,
    }

    // Save session
    await botSession.save({ session })

    // Update challenge score
    await updateChallengeScore({
      challengeId: botSession.challenge,
      userId: botSession.user,
      score: RQM_score,
      session,
    })

    return botSession
  } catch (error) {
    console.error('Error simulating bot quiz answers:', error)
    throw error
  }
}

/**
 * Trigger notification about bot completing challenge
 * @param {Object} params - Parameters
 * @param {string} params.challengeId - Challenge ID
 * @param {string} params.botId - Bot user ID
 * @param {number} params.botScore - Bot's score
 * @returns {Promise<void>}
 */
const triggerCompletionNotification = async ({
  challengeId,
  botId,
  botScore,
}) => {
  try {
    const challenge = await QuickClashChallenge.findById(challengeId)
      .populate('challenger', '_id name inGameName')
      .populate('opponent', '_id name inGameName')

    if (!challenge) {
      throw new Error('Challenge not found for notification')
    }

    await notifyChallengeCompleted({
      challenge,
      completedByUserId: botId,
    })

    console.log(`Bot completion notification sent for challenge ${challengeId}`)
  } catch (error) {
    console.error('Error sending bot completion notification:', error)
    throw error
  }
}

/**
 * Schedule a bot to respond to a challenge after a delay
 * @param {Object} params - Parameters
 * @param {string} params.challengeId - Challenge ID
 * @param {string} params.botId - Bot user ID
 * @param {number} [params.delayMinutes=5] - Delay in minutes
 * @returns {Promise<Object>} Scheduling result
 */
const scheduleBotResponse = async ({
  challengeId,
  botId,
  delayMinutes = 5,
}) => {
  try {
    // Generate a random delay within range
    const actualDelayMs = delayMinutes * 60 * 1000 * (0.8 + Math.random() * 0.4)

    // Schedule the bot to respond after the delay
    setTimeout(() => {
      initiateBotChallenge({ challengeId, botId }).catch(err => {
        console.error(`Scheduled bot challenge failed: ${err.message}`)
      })
    }, actualDelayMs)

    return {
      scheduled: true,
      botId,
      challengeId,
      estimatedResponseTime: new Date(Date.now() + actualDelayMs),
    }
  } catch (error) {
    console.error('Error scheduling bot response:', error)
    throw error
  }
}

/**
 * Helper function to get a random subset of an array
 * @param {Array} array - Original array
 * @param {number} size - Size of subset
 * @returns {Array} Random subset
 */
const getRandomSubset = (array, size) => {
  const shuffled = [...array].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, size)
}

// Constants for bot management
const MAX_BOTS_IN_MATCHMAKING = 12 // Maximum bots to have in matchmaking at once
const BOT_SKILL_RANGES = {
  easy: { min: 0.3, max: 0.5 },
  medium: { min: 0.5, max: 0.7 },
  hard: { min: 0.7, max: 0.9 },
}

/**
 * Add bots to global matchmaking if real players are present
 * This is called by the cron job every 25 seconds
 * @returns {Promise<void>}
 */
const addBotsToMatchmaking = async () => {
  try {
    console.log(
      '[BOT_MATCHMAKING] Checking if bots should be added to matchmaking',
    )

    // Get all users currently in global matchmaking
    const globalMatchmakingUsers = await QuickClashGlobalMatchmaking.find({
      status: { $in: ['available', 'processing'] },
    })
      .select('user')
      .lean()

    if (!globalMatchmakingUsers.length) {
      console.log('[BOT_MATCHMAKING] No users in global matchmaking')
    }

    // Check which ones are real players (not bots)
    let realPlayersInGlobal = 0
    let currentBots = 0

    for (const entry of globalMatchmakingUsers) {
      const isBot = await isBotUser(entry.user)
      if (isBot) {
        currentBots++
      } else {
        realPlayersInGlobal++
      }
    }

    // Check if there are real players in team matchmaking
    const teamMatchmakingEntries = await QuickClashTeamMatchmaking.find({
      status: 'available',
    })
      .populate('team', 'members')
      .lean()

    let realPlayersInTeams = 0
    for (const entry of teamMatchmakingEntries) {
      if (entry.team && entry.team.members) {
        for (const member of entry.team.members) {
          const isBot = await isBotUser(member.user)
          if (!isBot) {
            realPlayersInTeams++
            break // Count team once if it has any real player
          }
        }
      }
    }

    console.log(
      `[BOT_MATCHMAKING] Real players - Global: ${realPlayersInGlobal}, Teams: ${realPlayersInTeams}`,
    )
    console.log(
      `[BOT_MATCHMAKING] Current bots in global matchmaking: ${currentBots}`,
    )

    // Only add bots if there are real players somewhere in matchmaking
    if (realPlayersInGlobal === 0 && realPlayersInTeams === 0) {
      console.log(
        '[BOT_MATCHMAKING] No real players in matchmaking, skipping bot addition',
      )
      return
    }

    // Don't add more bots if we already have enough
    if (currentBots >= MAX_BOTS_IN_MATCHMAKING) {
      console.log('[BOT_MATCHMAKING] Maximum bot limit reached, skipping')
      return
    }

    // Calculate how many bots to add (up to 2, but don't exceed max)
    const botsToAdd = Math.min(2, MAX_BOTS_IN_MATCHMAKING - currentBots)

    console.log(`[BOT_MATCHMAKING] Adding ${botsToAdd} bots to matchmaking`)

    // Add bots SEQUENTIALLY (not in parallel) to avoid transaction conflicts
    // Each bot join triggers database operations, so we serialize them
    let successfulAdds = 0
    for (let i = 0; i < botsToAdd; i++) {
      try {
        await addSingleBotToMatchmaking()
        successfulAdds++

        // Add a small delay between bot additions to reduce contention
        if (i < botsToAdd - 1) {
          await new Promise(resolve => setTimeout(resolve, 500))
        }
      } catch (err) {
        console.error(`[BOT_MATCHMAKING] Failed to add bot ${i + 1}:`, err.message)
      }
    }

    console.log(
      `[BOT_MATCHMAKING] Successfully added ${successfulAdds}/${botsToAdd} bots to matchmaking`,
    )
  } catch (error) {
    console.error('[BOT_MATCHMAKING] Error adding bots to matchmaking:', error)
  }
}

/**
 * Add a single bot to global matchmaking
 * @returns {Promise<void>}
 */
const addSingleBotToMatchmaking = async () => {
  try {
    // Get a random bot user from database
    const botUser = await getRandomBotUser()

    if (!botUser) {
      console.log('[BOT_MATCHMAKING] No bot users available in database')
      return
    }

    // Check if this bot is already in matchmaking (safety check)
    const existingEntry = await QuickClashGlobalMatchmaking.findOne({
      user: botUser._id,
    })

    if (existingEntry) {
      console.log(`[BOT_MATCHMAKING] Bot ${botUser._id} already in matchmaking`)
      return
    }

    // Add bot to global matchmaking
    await joinGlobalMatchmaking({ userId: botUser._id })

    console.log(
      `[BOT_MATCHMAKING] Added bot ${botUser._id} to global matchmaking`,
    )
  } catch (error) {
    console.error(
      '[BOT_MATCHMAKING] Error adding single bot to matchmaking:',
      error,
    )
  }
}


// --- NEW TEAM BATTLE BOT LOGIC ---

// Bot Archetypes definitions
const BOT_ARCHETYPES = {
  ROOKIE: {
    id: 'ROOKIE',
    skillLevel: { min: 0.3, max: 0.5 },
    accuracy: { min: 0.3, max: 0.6 }, // 30-60% accuracy (widened slightly for variance)
    reactionTime: { min: 10, max: 20 }, // Slow: 10-20s startup
    avgScore: { min: 30, max: 60 },
  },
  REGULAR: {
    id: 'REGULAR',
    skillLevel: { min: 0.5, max: 0.75 },
    accuracy: { min: 0.5, max: 0.8 }, // 50-80% accuracy
    reactionTime: { min: 5, max: 12 }, // Normal: 5-12s startup
    avgScore: { min: 60, max: 120 },
  },
  ELITE: {
    id: 'ELITE',
    skillLevel: { min: 0.75, max: 0.95 },
    accuracy: { min: 0.75, max: 0.95 }, // 75-95% accuracy
    reactionTime: { min: 3, max: 8 }, // Fast: 3-8s startup
    avgScore: { min: 120, max: 200 },
  },
}

/**
 * Start the bot reflection process for a newly created team battle.
 * Identifies all bots in the battle and schedules their lifecycle.
 * @param {string} battleId - The ID of the team battle
 */
const startBotReflectingForBattle = async (battleId) => {
  try {
    // Retry logic to handle transaction commit delay
    let battle = null
    let attempts = 0
    const maxAttempts = 5

    while (!battle && attempts < maxAttempts) {
      battle = await QuickClashTeamBattle.findById(battleId)
        .populate('teamAMembers.user')
        .populate('teamBMembers.user')

      if (!battle) {
        attempts++
        if (attempts < maxAttempts) {
          console.log(`[BOT_SIM] Battle ${battleId} not found, retrying (${attempts}/${maxAttempts})...`)
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }
    }

    if (!battle) {
      console.error(`[BOT_SIM] Battle ${battleId} not found after ${maxAttempts} attempts`)
      return
    }

    console.log(`[BOT_SIM] Starting bot reflection for battle ${battleId}`)

    const botTasks = []

    // Helper to process a team's bots
    const processTeamBots = async (members, teamId) => {
      let botsInTeam = 0
      for (const member of members) {
        if (member.user && await isBotUser(member.user._id || member.user)) {
          botsInTeam++
          const botId = (member.user._id || member.user).toString()

          // 1. Assign Archetype randomly
          const rand = Math.random()
          let archetype = BOT_ARCHETYPES.REGULAR // Default
          if (rand < 0.3) archetype = BOT_ARCHETYPES.ROOKIE
          else if (rand > 0.8) archetype = BOT_ARCHETYPES.ELITE

          // 2. Schedule Lifecycle
          botTasks.push(
            simulateBotTeamBattleLifecycle({
              battleId,
              botId,
              teamId: teamId.toString(),
              archetype,
              botIndexInTeam: botsInTeam, // Used for powerup limiting
            })
          )
        }
      }
    }

    await processTeamBots(battle.teamAMembers, battle.teamA)
    await processTeamBots(battle.teamBMembers, battle.teamB)

    console.log(`[BOT_SIM] Scheduled ${botTasks.length} bots for battle ${battleId}`)
  } catch (error) {
    console.error(`[BOT_SIM] Error starting bot reflection for battle ${battleId}:`, error)
  }
}

/**
 * Orchestrates the full lifecycle of a bot in a team battle
 */
const simulateBotTeamBattleLifecycle = async ({
  battleId,
  botId,
  teamId,
  archetype,
  botIndexInTeam
}) => {
  // 1. Initial Reaction Delay
  const reactionDelay = (Math.random() * (archetype.reactionTime.max - archetype.reactionTime.min) + archetype.reactionTime.min) * 1000

  // Stagger launch
  setTimeout(async () => {
    try {
      console.log(`[BOT_SIM] Bot ${botId} (${archetype.id}) waking up for battle ${battleId}`)

      // Powerup delay
      // Delay range: 6-15 seconds before deciding to donate
      const powerupDelay = 6000 + Math.random() * 9000
      await new Promise(r => setTimeout(r, powerupDelay))

      // 2. Powerup Donation (80% chance - High engagement mode)
      // Removed strict team limits to ensure the pool feels active.
      // With 80% chance, 3 bots will average ~2.4 donations which is ideal.
      if (Math.random() < 0.8) {
        await simulateBotPowerupDonation(battleId, teamId, botId, archetype)
      }

      // Increased delay after powerup before category selection
      // Delay range: 8-20 seconds to give real players a head start
      const selectionDelay = 8000 + Math.random() * 12000
      await new Promise(r => setTimeout(r, selectionDelay))

      // 3. Category Selection
      // Need to require service here to ensure it's loaded and avoid circular dependency issues if any
      const { selectCategoryForUser, beginCategoryChallenge, updateBattleWithQuizResults } = require('./quickClashTeamBattleService')


      // 3. Category Selection Loop

      let categorySelected = false
      let selectedCategory = null
      let attempts = 0
      const MAX_SELECT_ATTEMPTS = 10 // Increased from 3 to 10 for better robustness
      const failedCategories = new Set() // Track categories we failed to get

      while (!categorySelected && attempts < MAX_SELECT_ATTEMPTS) {
        // Refresh battle data to see what is currently available
        const battle = await QuickClashTeamBattle.findById(battleId)
        if (!battle || battle.status !== 'active') return

        // Filter available categories, EXCLUDING ones we already failed on
        const availableCategories = battle.challenges
          .filter(c => !c.teamACompleted && !c.teamBCompleted)
          .map(c => c.category)
          .filter(cat => !failedCategories.has(cat))

        if (availableCategories.length === 0) {
          // If we ran out of options (either truly none left, or we failed on all of them)
          console.log(`[BOT_SIM] Bot ${botId} found no available categories (checked/failed all options).`)
          return
        }

        selectedCategory = availableCategories[Math.floor(Math.random() * availableCategories.length)]

        try {
          await selectCategoryForUser({
            battleId,
            userId: botId,
            category: selectedCategory
          })
          console.log(`[BOT_SIM] Bot ${botId} selected category ${selectedCategory}`)
          categorySelected = true
        } catch (err) {
          attempts++
          // Mark this category as failed for this bot so we don't try it again immediately
          failedCategories.add(selectedCategory)

          console.log(`[BOT_SIM] Bot ${botId} failed to select ${selectedCategory} (Attempt ${attempts}): ${err.message}`)

          if (attempts < MAX_SELECT_ATTEMPTS) {
            // Wait before retry to let other transactions settle
            await new Promise(r => setTimeout(r, 1500 + Math.random() * 2000))
          }
        }
      }

      // If we couldn't select a category after retries, we must stop here
      if (!categorySelected) {
         console.warn(`[BOT_SIM] Bot ${botId} aborted - failed to select category after ${MAX_SELECT_ATTEMPTS} attempts`)
         return
      }


      // 4. Reading Phase
      // Simulate reading time: Forge (30s) + Variance
      const variance = Math.random() * 30 // 0-30s extra
      const readingTimeMs = (30 + variance) * 1000

      // Mark as challenge begun (In Progress status)
      await beginCategoryChallenge({ battleId, userId: botId })

      console.log(`[BOT_SIM] Bot ${botId} reading for ${readingTimeMs}ms`)
      await new Promise(r => setTimeout(r, readingTimeMs))

      // 5. Quiz Phase
      // Simulate quiz time: 5 questions * 3-15s
      const quizTimeMs = (5 * (Math.random() * 12 + 3)) * 1000
      console.log(`[BOT_SIM] Bot ${botId} taking quiz for ${quizTimeMs}ms`)
      await new Promise(r => setTimeout(r, quizTimeMs))

      // 6. Complete & Submit Score
      // Calculate score based on Archetype
      const minScore = archetype.avgScore.min
      const maxScore = archetype.avgScore.max
      const score = Math.floor(Math.random() * (maxScore - minScore + 1)) + minScore

      // Find the challenge ID for the selected category
      // We need to fetch battle again to be sure
      const updatedBattle = await QuickClashTeamBattle.findById(battleId)
      const challenge = updatedBattle.challenges.find(c => c.category === selectedCategory)

      if (challenge) {
         await updateBattleWithQuizResults({
           battleId,
           challengeId: challenge.challenge, // The reference ID
           userId: botId,
           score
         })
         console.log(`[BOT_SIM] Bot ${botId} finished with score ${score}`)
      }

    } catch (err) {
      console.error(`[BOT_SIM] Error in bot lifecycle for ${botId}:`, err)
    }
  }, reactionDelay)
}

/**
 * Simulate a bot donating a powerup to the team.
 */
const simulateBotPowerupDonation = async (battleId, teamId, botId, archetype) => {
  try {
    // 1. Decide Powerup
    const rand = Math.random()
    let powerupId = 'ORACLES_EYE' // 50%
    if (rand > 0.9) powerupId = 'TIME_WARP' // 10%
    else if (rand > 0.5) powerupId = 'SCORE_SURGE' // 40%

    // 2. Donate (We need a special internal method or just mock the inventory check)
    // Since `donatePowerup` checks real inventory, we can't use it directly for bots
    // unless we give bots inventory.
    // ALTERNATIVE: Direct DB push for bots to bypass inventory check.

    // We will do a direct DB operation to simulate donation without inventory requirement
    const battle = await QuickClashTeamBattle.findById(battleId)
    if (!battle) return

    const isTeamA = battle.teamA.toString() === teamId.toString()
    const poolKey = isTeamA ? 'teamAPool' : 'teamBPool'
    const pool = battle[poolKey]

    // Constants from powerup service (duplicated here or exported)
    const POWERUP_COSTS = { 'TIME_WARP': 12, 'SCORE_SURGE': 10, 'ORACLES_EYE': 8 }
    const cost = POWERUP_COSTS[powerupId]
    const type = 'active' // Simplified
    const phase = 'both'

    pool.items.push({
      powerupId,
      type,
      cost,
      phase,
      donatedBy: botId,
      donatedAt: new Date()
    })
    pool.housingUsed += cost

    await battle.save()

    // 3. Emit Socket Event
    // We need to fetch bot name for the toast
    const botUser = await User.findById(botId).select('name inGameName')
    const donorName = botUser ? (botUser.inGameName || botUser.name) : 'Teammate'

    // Find powerup name for toast
    const powerupNames = { 'TIME_WARP': 'Time Warp', 'SCORE_SURGE': 'Score Surge', 'ORACLES_EYE': "Oracle's Eye" }

    globalEmitter.emit('quickClash:powerupDonated', {
      battleId,
      teamId,
      powerupName: powerupNames[powerupId] || powerupId,
      poolState: pool, // Simplified
      donatedBy: donorName
    })

    console.log(`[BOT_SIM] Bot ${botId} donated ${powerupId}`)

  } catch (err) {
    console.error(`[BOT_SIM] Error donating powerup for bot ${botId}:`, err)
  }
}

module.exports = {
  initiateBotChallenge,
  createBotSession,
  simulateBotReadingPhase,
  simulateBotQuizAnswers,
  scheduleBotResponse,

  // New team battle exports
  addBotsToMatchmaking,
  startBotReflectingForBattle
}
