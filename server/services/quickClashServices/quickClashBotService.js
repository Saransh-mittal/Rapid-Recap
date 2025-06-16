// services/quickClashServices/quickClashBotService.js
const mongoose = require('mongoose')
const QuickClashSession = require('../../model/quickClashSchemas/quickClashSessionSchema')
const QuickClashQuiz = require('../../model/quickClashSchemas/quickClashQuizSchema')
const QuickClashChallenge = require('../../model/quickClashSchemas/quickClashChallengeSchema')
const User = require('../../model/userSchema')
const { updateChallengeScore } = require('./quickClashChallengeService')
const { notifyChallengeCompleted } = require('./quickClashNotificationService')
const { getRandomBotUser } = require('./quickClashMatchmakingService')
const QuickClashGlobalMatchmaking = require('../../model/quickClashSchemas/quickClashGlobalMatchmakingSchema')
const QuickClashTeamMatchmaking = require('../../model/quickClashSchemas/quickClashTeamMatchmakingSchema')
const QuickClashTeamBattle = require('../../model/quickClashSchemas/quickClashTeamBattleSchema')
const { joinGlobalMatchmaking } = require('./quickClashTeamMatchmakingService')
const {
  selectCategoryForUser,
  beginCategoryChallenge,
  updateBattleWithQuizResults,
} = require('./quickClashTeamBattleService')

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
const simulateBotReadingPhase = async ({ sessionId, readingTime, session }) => {
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
 * Check if a user is a bot (has dummy email)
 * @param {string} userId - User ID to check
 * @returns {Promise<boolean>} Whether the user is a bot
 */
const isBotUser = async userId => {
  try {
    const user = await User.findById(userId).select('email').lean()
    return user && /^dummy\d+@mail\.com$/.test(user.email)
  } catch (error) {
    console.error('Error checking if user is bot:', error)
    return false
  }
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

    // Add bots
    const addBotPromises = []
    for (let i = 0; i < botsToAdd; i++) {
      addBotPromises.push(addSingleBotToMatchmaking())
    }

    const results = await Promise.allSettled(addBotPromises)
    const successful = results.filter(r => r.status === 'fulfilled').length

    console.log(
      `[BOT_MATCHMAKING] Successfully added ${successful}/${botsToAdd} bots to matchmaking`,
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

    // Listen for when this bot gets into a team battle
    setTimeout(() => {
      monitorBotForTeamBattle({ botId: botUser._id }).catch(err => {
        console.error(
          `Error monitoring bot ${botUser._id} for team battles:`,
          err,
        )
      })
    }, 1000)
  } catch (error) {
    console.error(
      '[BOT_MATCHMAKING] Error adding single bot to matchmaking:',
      error,
    )
  }
}

/**
 * Monitor a bot for team battle participation
 * @param {Object} params - Parameters
 * @param {string} params.botId - Bot ID to monitor
 * @returns {Promise<void>}
 */
const monitorBotForTeamBattle = async ({ botId }) => {
  try {
    // Check periodically if the bot is in a team battle
    const checkInterval = setInterval(async () => {
      try {
        // Find if bot is in any active team battle
        const activeBattle = await QuickClashTeamBattle.findOne({
          $or: [{ 'teamAMembers.user': botId }, { 'teamBMembers.user': botId }],
          status: 'active',
        })

        if (activeBattle) {
          console.log(
            `[BOT_TEAM_BATTLE] Bot ${botId} found in team battle ${activeBattle._id}`,
          )

          // Clear the interval
          clearInterval(checkInterval)

          // Start bot team battle participation
          await handleBotTeamBattleParticipation({
            battleId: activeBattle._id,
            botId,
          })
        }
      } catch (error) {
        console.error(`Error checking bot ${botId} for team battles:`, error)
      }
    }, 5000) // Check every 5 seconds

    // Stop monitoring after 10 minutes (battle should be created by then)
    setTimeout(() => {
      clearInterval(checkInterval)
      console.log(`[BOT_TEAM_BATTLE] Stopped monitoring bot ${botId} (timeout)`)
    }, 10 * 60 * 1000)
  } catch (error) {
    console.error(`Error setting up monitoring for bot ${botId}:`, error)
  }
}

/**
 * Handle bot participation in team battle
 * @param {Object} params - Parameters
 * @param {string} params.battleId - Team battle ID
 * @param {string} params.botId - Bot ID
 * @returns {Promise<void>}
 */
const handleBotTeamBattleParticipation = async ({ battleId, botId }) => {
  try {
    console.log(
      `[BOT_TEAM_BATTLE] Starting participation for bot ${botId} in battle ${battleId}`,
    )

    // Wait a random delay before selecting category (1-30 seconds)
    const categorySelectionDelay = Math.floor(Math.random() * 30 + 1) * 1000

    setTimeout(() => {
      selectCategoryForBot({ battleId, botId }).catch(err => {
        console.error(`Error in bot category selection for ${botId}:`, err)
      })
    }, categorySelectionDelay)
  } catch (error) {
    console.error(`Error handling bot team battle participation:`, error)
  }
}

/**
 * Select a category for bot in team battle
 * @param {Object} params - Parameters
 * @param {string} params.battleId - Team battle ID
 * @param {string} params.botId - Bot ID
 * @returns {Promise<void>}
 */
const selectCategoryForBot = async ({ battleId, botId }) => {
  try {
    console.log(
      `[BOT_TEAM_BATTLE] Bot ${botId} selecting category for battle ${battleId}`,
    )

    // Get current battle state
    const battle = await QuickClashTeamBattle.findById(battleId).populate(
      'teamAMembers.user teamBMembers.user',
    )

    if (!battle || battle.status !== 'active') {
      console.log(
        `[BOT_TEAM_BATTLE] Battle ${battleId} not active, skipping category selection`,
      )
      return
    }

    // Find which team the bot is on
    const isTeamABot = battle.teamAMembers.some(
      m => (m.user._id?.toString() || m.user.toString()) === botId.toString(),
    )
    const isTeamBBot = battle.teamBMembers.some(
      m => (m.user._id?.toString() || m.user.toString()) === botId.toString(),
    )

    if (!isTeamABot && !isTeamBBot) {
      console.log(
        `[BOT_TEAM_BATTLE] Bot ${botId} not found in battle ${battleId}`,
      )
      return
    }

    // Find available categories (not yet started by team members)
    const availableCategories = battle.challenges
      .filter(challenge => {
        if (isTeamABot) {
          return !challenge.teamAPlayer // No team A player assigned
        } else {
          return !challenge.teamBPlayer // No team B player assigned
        }
      })
      .map(challenge => challenge.category)

    if (availableCategories.length === 0) {
      console.log(
        `[BOT_TEAM_BATTLE] No available categories for bot ${botId} in battle ${battleId}`,
      )
      return
    }

    // Select a random available category
    const selectedCategory =
      availableCategories[
        Math.floor(Math.random() * availableCategories.length)
      ]

    console.log(
      `[BOT_TEAM_BATTLE] Bot ${botId} selected category: ${selectedCategory}`,
    )

    // Select the category
    await selectCategoryForUser({
      battleId,
      userId: botId,
      category: selectedCategory,
    })

    // Wait a bit before beginning the challenge (1-10 seconds)
    const challengeBeginDelay = Math.floor(Math.random() * 90 + 1) * 1000

    setTimeout(() => {
      beginBotChallenge({ battleId, botId }).catch(err => {
        console.error(`Error beginning bot challenge for ${botId}:`, err)
      })
    }, challengeBeginDelay)
  } catch (error) {
    console.error(`Error selecting category for bot ${botId}:`, error)
  }
}

/**
 * Begin challenge for bot
 * @param {Object} params - Parameters
 * @param {string} params.battleId - Team battle ID
 * @param {string} params.botId - Bot ID
 * @returns {Promise<void>}
 */
const beginBotChallenge = async ({ battleId, botId }) => {
  try {
    console.log(
      `[BOT_TEAM_BATTLE] Bot ${botId} beginning challenge for battle ${battleId}`,
    )

    // Begin the category challenge
    const result = await beginCategoryChallenge({
      battleId,
      userId: botId,
    })

    if (!result || !result.sessionInfo) {
      console.log(
        `[BOT_TEAM_BATTLE] Failed to begin challenge for bot ${botId}`,
      )
      return
    }

    const { challengeId } = result.sessionInfo

    // Generate random skill level for this bot challenge
    const skillLevels = ['easy', 'medium', 'hard']
    const randomSkillLevel =
      skillLevels[Math.floor(Math.random() * skillLevels.length)]
    const skillRange = BOT_SKILL_RANGES[randomSkillLevel]
    const skillValue =
      Math.random() * (skillRange.max - skillRange.min) + skillRange.min

    // Wait a bit before completing the challenge (30-120 seconds)
    const challengeCompletionDelay = Math.floor(Math.random() * 90 + 30) * 1000

    setTimeout(() => {
      initiateBotTeamChallenge({
        challengeId,
        botId,
        battleId,
        skillLevel: skillValue,
      }).catch(err => {
        console.error(`Error completing bot team challenge for ${botId}:`, err)
      })
    }, challengeCompletionDelay)
  } catch (error) {
    console.error(`Error beginning bot challenge:`, error)
  }
}

/**
 * Complete bot team challenge (reuses 1v1 logic)
 * @param {Object} params - Parameters
 * @param {string} params.challengeId - Challenge ID
 * @param {string} params.botId - Bot ID
 * @param {string} params.battleId - Team battle ID
 * @param {number} [params.skillLevel=0.6] - Bot skill level
 * @returns {Promise<void>}
 */
const initiateBotTeamChallenge = async ({
  challengeId,
  botId,
  battleId,
  skillLevel = 0.6,
}) => {
  try {
    console.log(
      `[BOT_TEAM_BATTLE] Bot ${botId} completing challenge ${challengeId}`,
    )

    // Reuse the existing bot challenge logic but adapt for team battle
    const session = await mongoose.startSession()

    try {
      await session.withTransaction(async () => {
        // Create session for bot (reuse existing function)
        const botSession = await createBotSession({
          challengeId,
          botId,
          session,
        })

        // Simulate reading phase (reuse existing function)
        const readingTime = Math.floor(Math.random() * 60 + 30) // 30-90 seconds
        await simulateBotReadingPhase({
          sessionId: botSession._id,
          readingTime,
          session,
        })

        // Simulate quiz answers (reuse existing function)
        const completedSession = await simulateBotQuizAnswers({
          sessionId: botSession._id,
          botSkill: skillLevel,
          session,
        })

        console.log(
          `[BOT_TEAM_BATTLE] Bot ${botId} completed team challenge with score: ${completedSession.score.RQM_score}`,
        )

        // Update team battle with quiz results (outside of this transaction)
        return completedSession
      })

      // Update team battle with quiz results after the session transaction
      const completedSession = await QuickClashSession.findOne({
        challenge: challengeId,
        user: botId,
        phase: 'completed',
      }).select('score')

      if (completedSession) {
        await updateBattleWithQuizResults({
          battleId,
          challengeId,
          userId: botId,
          score: completedSession.score.RQM_score,
        })

        console.log(
          `[BOT_TEAM_BATTLE] Updated team battle ${battleId} with bot ${botId} score: ${completedSession.score.RQM_score}`,
        )
      }
    } catch (error) {
      console.error(`Error in bot team challenge:`, error)
      throw error
    } finally {
      session.endSession()
    }
  } catch (error) {
    console.error(`Error completing bot team challenge:`, error)
  }
}

/**
 * Recover stuck bots in team battles - main fallback function
 * This runs periodically to catch bots that missed their monitoring intervals
 * @returns {Promise<void>}
 */
const recoverStuckBots = async () => {
  try {
    console.log('[BOT_FALLBACK] Starting bot recovery check')

    // Find all active team battles
    const activeBattles = await QuickClashTeamBattle.find({
      status: 'active',
      createdAt: { $gte: new Date(Date.now() - 12 * 60 * 60 * 1000) }, // Only battles created in last 2 hours
    }).populate('teamAMembers.user teamBMembers.user')

    if (!activeBattles.length) {
      console.log('[BOT_FALLBACK] No active team battles found')
      return
    }

    console.log(
      `[BOT_FALLBACK] Checking ${activeBattles.length} active team battles`,
    )

    // Process each battle
    for (const battle of activeBattles) {
      await recoverBotsInBattle(battle)
    }

    console.log('[BOT_FALLBACK] Bot recovery check completed')
  } catch (error) {
    console.error('[BOT_FALLBACK] Error in recoverStuckBots:', error)
  }
}

/**
 * Recover bots in a specific team battle
 * @param {Object} battle - Team battle document
 * @returns {Promise<void>}
 */
const recoverBotsInBattle = async battle => {
  try {
    const battleAge = Date.now() - new Date(battle.createdAt).getTime()
    const battleAgeMinutes = Math.floor(battleAge / (1000 * 60))

    console.log(
      `[BOT_FALLBACK] Checking battle ${battle._id} (age: ${battleAgeMinutes} minutes, status: ${battle.status})`,
    )

    // Skip battles that are not active (completed, expired, etc.)
    if (battle.status !== 'active') {
      console.log(`[BOT_FALLBACK] Skipping non-active battle ${battle._id}`)
      return
    }

    // Only process battles that are at least 2 minutes old (give initial flow time to work)
    if (battleAgeMinutes < 2) {
      console.log(
        `[BOT_FALLBACK] Skipping young battle ${battle._id} (${battleAgeMinutes} minutes old)`,
      )
      return
    }

    let totalBots = 0
    let completedBots = 0
    let botsNeedingRecovery = 0

    // Check team A members
    for (const member of battle.teamAMembers) {
      const userId = member.user._id || member.user
      const isBot = await isBotUser(userId)

      if (isBot) {
        totalBots++
        if (member.completed) {
          completedBots++
        } else {
          botsNeedingRecovery++
          await recoverBotMember({
            battleId: battle._id,
            botId: userId,
            member,
            battle,
            battleAgeMinutes,
          })
        }
      }
    }

    // Check team B members
    for (const member of battle.teamBMembers) {
      const userId = member.user._id || member.user
      const isBot = await isBotUser(userId)

      if (isBot) {
        totalBots++
        if (member.completed) {
          completedBots++
        } else {
          botsNeedingRecovery++
          await recoverBotMember({
            battleId: battle._id,
            botId: userId,
            member,
            battle,
            battleAgeMinutes,
          })
        }
      }
    }

    console.log(
      `[BOT_FALLBACK] Battle ${battle._id} summary - Total bots: ${totalBots}, Completed: ${completedBots}, Needing recovery: ${botsNeedingRecovery}`,
    )
  } catch (error) {
    console.error(
      `[BOT_FALLBACK] Error recovering bots in battle ${battle._id}:`,
      error,
    )
  }
}

/**
 * Recover a specific bot member based on their current state
 * @param {Object} params - Parameters
 * @param {string} params.battleId - Battle ID
 * @param {string} params.botId - Bot ID
 * @param {Object} params.member - Member data from battle
 * @param {Object} params.battle - Full battle object
 * @param {number} params.battleAgeMinutes - Age of battle in minutes
 * @returns {Promise<void>}
 */
const recoverBotMember = async ({
  battleId,
  botId,
  member,
  battle,
  battleAgeMinutes,
}) => {
  try {
    // Determine bot's current state
    const hasSelectedCategory = member.category !== null
    const hasParticipated = member.participated
    const hasCompleted = member.completed

    console.log(
      `[BOT_FALLBACK] Bot ${botId} state - Category: ${
        hasSelectedCategory ? member.category : 'none'
      }, Participated: ${hasParticipated}, Completed: ${hasCompleted}`,
    )

    // IMPORTANT: If bot has already completed, no recovery needed
    if (hasCompleted) {
      console.log(
        `[BOT_FALLBACK] Bot ${botId} already completed - no recovery needed`,
      )
      return
    }

    // For any incomplete bot after 5 minutes, just restart the entire participation process
    // This is much simpler and reuses the existing tested logic!
    if (battleAgeMinutes >= 5) {
      console.log(
        `[BOT_FALLBACK] Restarting participation process for stuck bot ${botId}`,
      )

      // Add some randomness to avoid all bots acting at the same time
      const delay = Math.floor(Math.random() * 30 + 5) * 1000 // 5-35 seconds

      setTimeout(() => {
        handleBotTeamBattleParticipation({ battleId, botId }).catch(err => {
          console.error(
            `[BOT_FALLBACK] Error restarting participation for ${botId}:`,
            err,
          )
        })
      }, delay)

      return
    }

    // For really old battles (15+ minutes), force complete any remaining bots
    if (battleAgeMinutes >= 15) {
      console.log(
        `[BOT_FALLBACK] Force completing bot ${botId} after 15 minutes`,
      )

      await forceCompleteBotChallenge({
        battleId,
        botId,
        member,
        battle,
      })
    }
  } catch (error) {
    console.error(`[BOT_FALLBACK] Error recovering bot member ${botId}:`, error)
  }
}

/**
 * Complete a stuck bot challenge by finding existing session or creating result
 * @param {Object} params - Parameters
 * @param {string} params.challengeId - Challenge ID
 * @param {string} params.botId - Bot ID
 * @param {string} params.battleId - Battle ID
 * @returns {Promise<void>}
 */
const completeStuckBotChallenge = async ({ challengeId, botId, battleId }) => {
  try {
    console.log(
      `[BOT_FALLBACK] Attempting to complete stuck challenge ${challengeId} for bot ${botId}`,
    )

    // Check if there's already a session for this bot and challenge
    const existingSession = await QuickClashSession.findOne({
      challenge: challengeId,
      user: botId,
    })

    if (existingSession) {
      if (existingSession.phase === 'completed') {
        console.log(
          `[BOT_FALLBACK] Bot ${botId} challenge already completed, updating battle`,
        )

        // Just update the battle with existing score
        await updateBattleWithQuizResults({
          battleId,
          challengeId,
          userId: botId,
          score: existingSession.score?.RQM_score || 0,
        })
      } else {
        console.log(
          `[BOT_FALLBACK] Completing existing session for bot ${botId}`,
        )

        // Complete the existing session
        const skillLevel = Math.random() * 0.4 + 0.4 // 0.4 to 0.8

        // If session is in reading phase, complete reading first
        if (existingSession.phase === 'reading') {
          await simulateBotReadingPhase({
            sessionId: existingSession._id,
            readingTime: 60,
            session: null,
          })
        }

        // Complete the quiz
        if (
          existingSession.phase === 'quiz' ||
          existingSession.phase === 'reading'
        ) {
          const completedSession = await simulateBotQuizAnswers({
            sessionId: existingSession._id,
            botSkill: skillLevel,
            session: null,
          })

          await updateBattleWithQuizResults({
            battleId,
            challengeId,
            userId: botId,
            score: completedSession.score.RQM_score,
          })
        }
      }
    } else {
      console.log(
        `[BOT_FALLBACK] No session found, starting fresh challenge for bot ${botId}`,
      )

      // Start a fresh challenge completion
      const skillLevel = Math.random() * 0.4 + 0.4 // 0.4 to 0.8

      await initiateBotTeamChallenge({
        challengeId,
        botId,
        battleId,
        skillLevel,
      })
    }
  } catch (error) {
    console.error(`[BOT_FALLBACK] Error completing stuck bot challenge:`, error)
  }
}

/**
 * Force complete a bot challenge when all else fails
 * @param {Object} params - Parameters
 * @param {string} params.battleId - Battle ID
 * @param {string} params.botId - Bot ID
 * @param {Object} params.member - Member data
 * @param {Object} params.battle - Battle object
 * @returns {Promise<void>}
 */
const forceCompleteBotChallenge = async ({
  battleId,
  botId,
  member,
  battle,
}) => {
  try {
    console.log(`[BOT_FALLBACK] Force completing bot ${botId} challenge`)

    // Generate a random score based on bot skill
    const randomScore = Math.floor(Math.random() * 80 + 20) // 20-100 points

    // Find the challenge
    const challenge = battle.challenges.find(
      c => c.category === member.category,
    )

    if (challenge && challenge.challenge) {
      // Directly update the battle with the score
      await updateBattleWithQuizResults({
        battleId,
        challengeId: challenge.challenge,
        userId: botId,
        score: randomScore,
      })

      console.log(
        `[BOT_FALLBACK] Force completed bot ${botId} with score ${randomScore}`,
      )
    } else {
      console.log(
        `[BOT_FALLBACK] No challenge found for bot ${botId} to force complete`,
      )
    }
  } catch (error) {
    console.error(`[BOT_FALLBACK] Error force completing bot challenge:`, error)
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
  isBotUser,
  handleBotTeamBattleParticipation,
  selectCategoryForBot,
  initiateBotTeamChallenge,

  // New fallback exports
  recoverStuckBots,
  recoverBotsInBattle,
  completeStuckBotChallenge,
  forceCompleteBotChallenge,
}
