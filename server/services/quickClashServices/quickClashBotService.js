// services/quickClashServices/quickClashBotService.js
const mongoose = require('mongoose')
const QuickClashSession = require('../../model/quickClashSchemas/quickClashSessionSchema')
const QuickClashQuiz = require('../../model/quickClashSchemas/quickClashQuizSchema')
const QuickClashChallenge = require('../../model/quickClashSchemas/quickClashChallengeSchema')
const User = require('../../model/userSchema')
const { updateChallengeScore } = require('./quickClashChallengeService')
const { notifyChallengeCompleted } = require('./quickClashNotificationService')

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

module.exports = {
  initiateBotChallenge,
  createBotSession,
  simulateBotReadingPhase,
  simulateBotQuizAnswers,
  scheduleBotResponse,
}
