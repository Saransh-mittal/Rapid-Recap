// services/quickClashSessionService.js
const QuickClashSession = require('../../model/quickClashSchemas/quickClashSessionSchema')
const QuickClashQuiz = require('../../model/quickClashSchemas/quickClashQuizSchema')
const { generateQuestionsForQuiz } = require('../../utils/quiz.utils')
const mongoose = require('mongoose')
const QuickClashChallenge = require('../../model/quickClashSchemas/quickClashChallengeSchema')

const READING_TIME_LIMIT = 120 // 2 minutes in seconds
const SESSION_EXPIRY = 24 * 60 * 60 * 1000 // 24 hours

// Inside quickClashSessionService.js

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
        throw new Error('Session already exists for this challenge')
      }

      // Get challenge and corresponding quiz
      const challenge = await QuickClashChallenge.findById(challengeId).session(
        session,
      )

      if (!challenge) {
        throw new Error('Challenge not found')
      }

      // Fetch the quiz for selected language
      const quiz = await QuickClashQuiz.findOne({
        challenge: challengeId,
        language,
      }).session(session)

      if (!quiz) {
        throw new Error(`Quiz not found for language: ${language}`)
      }

      // Create session
      const quizSession = new QuickClashSession({
        challenge: challengeId,
        user: userId,
        quiz: quiz._id,
        language,
        expiresAt: new Date(Date.now() + SESSION_EXPIRY),
      })

      await quizSession.save({ session })
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
      const timeSpent = Math.min(
        Math.floor((now - quizSession.reading.startTime) / 1000),
        READING_TIME_LIMIT,
      )

      // Complete reading phase
      quizSession.reading.completed = true
      quizSession.reading.timeSpent = timeSpent
      quizSession.reading.completionType = completionType

      // Start quiz phase
      quizSession.phase = 'quiz'
      quizSession.quiz.startTime = now

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
        (now - quizSession.quiz.startTime) / 1000,
      )

      // Record responses and calculate score
      quizSession.quiz.responses = responses
      quizSession.quiz.timeSpent = quizTimeSpent
      quizSession.quiz.completed = true
      quizSession.phase = 'completed'

      const RQM_score = calculateRQMScore({
        responses,
        timeSpent: quizTimeSpent,
        difficulty: quizSession.quiz.overallDifficulty,
        questionCount: quizSession.quiz.questions.length,
      })

      quizSession.score = {
        RQM_score,
        speedBonus: quizTimeSpent < quizSession.quiz.questions.length * 15,
        accuracyBonus:
          responses.filter(r => r.isCorrect).length ===
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
  completeQuiz,
}
