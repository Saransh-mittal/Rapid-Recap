// services/quickClashServices/quickClashBotService.js
const mongoose = require('mongoose')
const QuickClashSession = require('../../model/quickClashSchemas/quickClashSessionSchema')
const QuickClashQuiz = require('../../model/quickClashSchemas/quickClashQuizSchema')
const User = require('../../model/userSchema')
const { updateChallengeScore } = require('./quickClashChallengeService')
const globalEmitter = require('../../eventEmitter')

/**
 * Simulate a bot completing a challenge
 * @param {Object} params - Parameters
 * @param {string} params.challengeId - Challenge ID
 * @param {string} params.botId - Bot user ID
 * @returns {Promise<Object>} Simulation result
 */
const simulateBotChallenge = async ({ challengeId, botId }) => {
  const session = await mongoose.startSession()
  let startedTransaction = false

  try {
    // Start transaction
    await session.startTransaction()
    startedTransaction = true

    // Create a session for the bot
    const botSession = await createBotSession({
      challengeId,
      botId,
      session,
    })

    if (!botSession) {
      throw new Error('Failed to create bot session')
    }

    // Simulate reading phase (between 30-90 seconds)
    const readingTime = Math.floor(Math.random() * 60) + 30

    // Complete reading phase
    await simulateReadingPhase({
      sessionId: botSession._id,
      readingTime,
      session,
    })

    // Generate bot answers with some randomness
    const quizResult = await simulateQuizAnswers({
      sessionId: botSession._id,
      session,
    })

    // Commit transaction
    await session.commitTransaction()
    startedTransaction = false

    // Emit event for real-time updates (after transaction)
    const score = quizResult?.score?.RQM_score || 0
    globalEmitter.emit('quickClash:botCompletedChallenge', {
      challengeId,
      botId,
      score,
    })

    return {
      success: true,
      sessionId: botSession._id,
      score,
      readingTime,
    }
  } catch (error) {
    // Abort transaction on error
    if (startedTransaction) {
      await session.abortTransaction()
    }

    console.error('Error simulating bot challenge:', error)
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
    // Get bot's language preference
    const bot = await User.findById(botId)
      .select('userLanguage')
      .session(session)
    if (!bot) {
      throw new Error('Bot user not found')
    }

    const language = bot.userLanguage || 'en'

    // Find appropriate quiz
    const quiz = await QuickClashQuiz.findOne({
      challenge: challengeId,
      language,
    }).session(session)

    if (!quiz) {
      throw new Error(`Quiz not found for language: ${language}`)
    }

    // Create session for bot
    const EXPIRY_TIME = 24 * 60 * 60 * 1000 // 24 hours

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
const simulateReadingPhase = async ({ sessionId, readingTime, session }) => {
  try {
    const botSession = await QuickClashSession.findById(sessionId).session(
      session,
    )

    if (!botSession) {
      throw new Error('Bot session not found')
    }

    // Simulate reading start and end times
    const startTime = new Date(Date.now() - readingTime * 1000)
    const endTime = new Date()

    // Complete reading phase
    botSession.reading = {
      startTime,
      endTime,
      timeSpent: readingTime,
      completed: true,
      completionType: 'manual',
    }

    // Move to quiz phase
    botSession.phase = 'quiz'
    botSession.quizAttempt.startTime = new Date()

    await botSession.save({ session })
    return botSession
  } catch (error) {
    console.error('Error simulating bot reading phase:', error)
    throw error
  }
}

/**
 * Simulate bot quiz answers with some randomness
 * @param {Object} params - Parameters
 * @param {string} params.sessionId - Session ID
 * @param {mongoose.ClientSession} params.session - Mongoose session
 * @returns {Promise<Object>} Updated session with quiz results
 */
const simulateQuizAnswers = async ({ sessionId, session }) => {
  try {
    // Get session with quiz questions
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

    // Decide bot's skill level (0.0 to 1.0)
    // Higher skill = higher chance of correct answers
    const botSkill = Math.random() * 0.5 + 0.4 // Between 0.4 and 0.9

    // Select 5 random questions like the frontend would
    const selectedQuestions =
      questions.length <= 5 ? questions : getRandomSubset(questions, 5)

    // Record selected question IDs
    botSession.quizAttempt.selectedQuestionIds = selectedQuestions.map(q =>
      q._id.toString(),
    )

    // Generate responses with randomness based on bot skill
    const responses = selectedQuestions.map(question => {
      // Chance of correct answer based on skill and question difficulty
      const difficultyFactor = 1 - (question.difficulty || 0.5)
      const correctChance = botSkill * difficultyFactor

      // Determine if answer is correct
      const isCorrect = Math.random() < correctChance

      // Time spent on question (3-15 seconds, better bots are generally faster)
      const minTime = 3
      const maxTime = 15
      const speedFactor = botSkill // Higher skill = faster
      const timeSpent = Math.floor(
        minTime + (1 - speedFactor) * (maxTime - minTime),
      )

      // If correct, use the right answer
      // If wrong, choose a random wrong answer
      let userAnswer
      if (isCorrect) {
        userAnswer = question.answer
      } else {
        const wrongOptions = Object.keys(question.options).filter(
          key => key !== question.answer,
        )
        userAnswer =
          wrongOptions[Math.floor(Math.random() * wrongOptions.length)]
      }

      return {
        questionId: question._id,
        userAnswer,
        isCorrect,
        timeSpent,
      }
    })

    // Calculate total time (sum of question times + slight randomness)
    const totalTimeSpent = responses.reduce((sum, r) => sum + r.timeSpent, 0)
    const totalTimeWithRandomness = Math.floor(
      totalTimeSpent * (0.9 + Math.random() * 0.2),
    )

    // Complete quiz phase
    const completionTime = new Date()

    botSession.quizAttempt.responses = responses
    botSession.quizAttempt.timeSpent = totalTimeWithRandomness
    botSession.quizAttempt.completed = true
    botSession.quizAttempt.endTime = completionTime
    botSession.phase = 'completed'

    // Calculate score based on correct answers and time (simplified)
    const correctCount = responses.filter(r => r.isCorrect).length
    const accuracy = correctCount / responses.length

    // RQM score calculation (simplified from the main app's algorithm)
    const difficulty = botSession.quiz.overallDifficulty || 0.5
    const timeBonus = Math.max(0, 1 - totalTimeWithRandomness / 50) * 0.5
    const baseScore = accuracy * 100
    const RQM_score = Math.round(baseScore * (1 + difficulty * 0.5 + timeBonus))

    botSession.score = {
      RQM_score,
      baseRQM_score: baseScore,
      speedBonus: timeBonus > 0,
      accuracyBonus: accuracy > 0.8,
      total: RQM_score,
    }

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
  simulateBotChallenge,
  createBotSession,
  simulateReadingPhase,
  simulateQuizAnswers,
}
