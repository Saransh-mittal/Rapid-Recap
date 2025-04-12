// services/quickClashServices/quickClashSessionService.js
const QuickClashSession = require('../../model/quickClashSchemas/quickClashSessionSchema')
const QuickClashQuiz = require('../../model/quickClashSchemas/quickClashQuizSchema')
const QuickClashChallenge = require('../../model/quickClashSchemas/quickClashChallengeSchema')
const {
  getQuickClashHighlights,
} = require('../../utils/quickClashHighlight.utils')
const { updateChallengeScore } = require('./quickClashChallengeService')
const mongoose = require('mongoose')
const User = require('../../model/userSchema')

const READING_TIME_LIMIT = 120 // 2 minutes in seconds
const SESSION_EXPIRY = 5 * 60 * 1000 // 5 minutes

/**
 * Create a new session for a challenge with language support
 * @param {Object} params - Parameters
 * @param {string} params.challengeId - Challenge ID
 * @param {string} params.userId - User ID
 * @param {string} [params.language] - Optional explicit language choice (en/hi) - overrides user preference
 * @returns {Promise<Object>} The created session
 */
const createSession = async ({ challengeId, userId, language }) => {
  const session = await mongoose.startSession()
  try {
    return await session.withTransaction(async () => {
      // Check if session already exists
      const existingSession = await QuickClashSession.findOne({
        challenge: challengeId,
        user: userId,
      }).session(session)

      if (existingSession) {
        throw new Error(
          'Session already exists for this challenge user cannot continue further',
        )
      }

      // Get challenge
      const challenge = await QuickClashChallenge.findById(challengeId).session(
        session,
      )

      if (!challenge) {
        throw new Error('Challenge not found')
      }

      // Determine the preferred language
      let preferredLanguage = language

      if (!preferredLanguage) {
        // If no explicit language provided, fetch user's preference
        const user = await User.findById(userId, 'userLanguage').session(
          session,
        )
        preferredLanguage = user?.userLanguage || 'en'
      }

      // Default to English if no valid language setting
      if (preferredLanguage !== 'en' && preferredLanguage !== 'hi') {
        preferredLanguage = 'en'
      }

      // Fetch the quiz for selected language
      const quiz = await QuickClashQuiz.findOne({
        challenge: challengeId,
        language: preferredLanguage,
      }).session(session)

      if (!quiz) {
        throw new Error(`Quiz not found for language: ${preferredLanguage}`)
      }

      // Create session
      const quizSession = new QuickClashSession({
        challenge: challengeId,
        user: userId,
        quiz: quiz._id,
        language: preferredLanguage,
        expiresAt: new Date(Date.now() + SESSION_EXPIRY),
      })

      await quizSession.save({ session })

      // Get article highlights (we don't wait for this to avoid transaction timeout)
      getQuickClashHighlights({
        challengeId,
        lang: preferredLanguage,
      }).catch(err => {
        console.error('Error fetching highlights (non-blocking):', err)
      })

      return quizSession
    })
  } finally {
    session.endSession()
  }
}

const startReading = async ({ sessionId }) => {
  const session = await mongoose.startSession()
  try {
    return await session.withTransaction(async () => {
      const quizSession = await QuickClashSession.findById(sessionId).session(
        session,
      )

      if (!quizSession || quizSession.phase !== 'reading') {
        throw new Error('Invalid session or phase')
      }

      const now = new Date()
      quizSession.reading.startTime = now
      quizSession.reading.endTime = new Date(
        now.getTime() + READING_TIME_LIMIT * 1000,
      )
      await quizSession.save({ session })

      return {
        startTime: now,
        endTime: quizSession.reading.endTime,
        timeLimit: READING_TIME_LIMIT,
      }
    })
  } finally {
    session.endSession()
  }
}

const completeReading = async ({ sessionId, completionType = 'manual' }) => {
  const session = await mongoose.startSession()
  try {
    return await session.withTransaction(async () => {
      const quizSession = await QuickClashSession.findById(sessionId).session(
        session,
      )

      if (!quizSession || quizSession.phase !== 'reading') {
        throw new Error('Invalid session or phase')
      }

      const now = new Date()

      // Fix for NaN timeSpent - Ensure startTime exists before calculating
      let timeSpent = 0
      if (quizSession.reading.startTime) {
        // Calculate time spent and ensure it's valid
        const timeDiff = now - quizSession.reading.startTime
        timeSpent = Math.max(
          0,
          Math.min(Math.floor(timeDiff / 1000), READING_TIME_LIMIT),
        )
      } else {
        // If startTime doesn't exist, use default value
        timeSpent = Math.min(10, READING_TIME_LIMIT) // Default to 10 seconds or max time limit
      }

      // Complete reading phase
      quizSession.reading.completed = true
      quizSession.reading.timeSpent = timeSpent
      quizSession.reading.completionType = completionType

      // Start quiz phase
      quizSession.phase = 'quiz'
      quizSession.quizAttempt.startTime = now

      await quizSession.save({ session })

      return {
        timeSpent,
        completionType,
        nextPhase: 'quiz',
      }
    })
  } finally {
    session.endSession()
  }
}

const checkReadingTimeout = async ({ sessionId }) => {
  const quizSession = await QuickClashSession.findById(sessionId)

  if (
    !quizSession ||
    quizSession.phase !== 'reading' ||
    quizSession.reading.completed
  ) {
    return false
  }

  const now = new Date()
  if (quizSession.reading.endTime && now >= quizSession.reading.endTime) {
    await completeReading({
      sessionId,
      completionType: 'timeout',
    })
    return true
  }

  return false
}

const getSessionDetails = async ({ sessionId }) => {
  const quizSession = await QuickClashSession.findById(sessionId)
    .populate('quiz')
    .populate('challenge')

  if (!quizSession) {
    throw new Error('Session not found')
  }

  // Get highlights for the article
  const highlights = await getQuickClashHighlights({
    challengeId: quizSession.challenge._id,
    lang: quizSession.language,
  }).catch(() => null)

  // Prepare the article content
  const article = {
    title:
      quizSession.language === 'en'
        ? quizSession.challenge.article.title.english
        : quizSession.challenge.article.title.hindi,
    content:
      quizSession.language === 'en'
        ? quizSession.challenge.article.content.english
        : quizSession.challenge.article.content.hindi,
    dictionary: highlights?.dictionary || [],
    importantSentences: highlights?.importantSentences || [],
  }

  // Get questions from the quiz
  const questions = quizSession.quiz.questions || []

  return {
    session: quizSession,
    article,
    questions,
  }
}

const calculateRQMScore = ({
  responses,
  timeSpent,
  difficulty,
  questionCount,
}) => {
  const correctAnswers = responses.filter(r => r.isCorrect).length
  const accuracy = correctAnswers / questionCount

  // Base score from accuracy and difficulty
  let score = accuracy * 100 * (1 + difficulty)

  // Speed bonus (max 50% bonus)
  const expectedTime = questionCount * 15 // 15 seconds per question
  if (timeSpent < expectedTime) {
    const speedBonus = Math.min((expectedTime - timeSpent) / expectedTime, 0.5)
    score *= 1 + speedBonus
  }

  // Accuracy bonuses
  if (accuracy === 1) {
    score *= 1.2 // Perfect score bonus
  } else if (accuracy >= 0.8) {
    score *= 1.1 // High accuracy bonus
  }

  return Math.round(score)
}

const completeQuiz = async ({ sessionId, responses }) => {
  const session = await mongoose.startSession()
  try {
    return await session.withTransaction(async () => {
      const quizSession = await QuickClashSession.findById(sessionId)
        .populate('quiz')
        .session(session)

      if (!quizSession || quizSession.phase !== 'quiz') {
        throw new Error('Invalid session or phase')
      }

      const now = new Date()
      const quizTimeSpent = Math.floor(
        (now - quizSession.quizAttempt.startTime) / 1000,
      )

      // Map and validate responses
      const validatedResponses = responses.map(response => {
        const question = quizSession.quiz.questions.find(
          q => q._id.toString() === response.questionId.toString(),
        )

        if (!question) {
          throw new Error(`Question not found: ${response.questionId}`)
        }

        return {
          questionId: response.questionId,
          answer: response.answer,
          isCorrect: response.answer === question.answer,
          timeSpent: response.timeSpent || 0,
        }
      })

      // Record responses and calculate score
      quizSession.quizAttempt.responses = validatedResponses
      quizSession.quizAttempt.timeSpent = quizTimeSpent
      quizSession.quizAttempt.completed = true
      quizSession.quizAttempt.endTime = now
      quizSession.phase = 'completed'

      const RQM_score = calculateRQMScore({
        responses: validatedResponses,
        timeSpent: quizTimeSpent,
        difficulty: quizSession.quiz.overallDifficulty,
        questionCount: quizSession.quiz.questions.length,
      })

      quizSession.score = {
        RQM_score,
        speedBonus: quizTimeSpent < quizSession.quiz.questions.length * 15,
        accuracyBonus:
          validatedResponses.filter(r => r.isCorrect).length ===
          quizSession.quiz.questions.length,
        total: RQM_score,
      }

      await quizSession.save({ session })

      // Update challenge scores
      await updateChallengeScore({
        challengeId: quizSession.challenge,
        userId: quizSession.user,
        score: RQM_score,
        session,
      })

      return {
        score: quizSession.score,
        timeSpent: quizTimeSpent,
        completed: true,
      }
    })
  } finally {
    session.endSession()
  }
}

module.exports = {
  createSession,
  startReading,
  completeReading,
  checkReadingTimeout,
  getSessionDetails,
  completeQuiz,
}
