// services/abandonedGameService.js - Handle abandoned game submissions
const mongoose = require('mongoose')
const QuizAttempt = require('../model/quizAttemptSchema')
const ArticleQuizSession = require('../model/articleQuizSessionSchem')
const Article = require('../model/articleSchema')
const User = require('../model/userSchema')
const { GAME_CONFIGS } = require('../utils/enhancedQuiz.utils')
const configService = require('../configService')
const moment = require('moment-timezone')

/**
 * Handle abandoned game submission with zero score
 * @param {Object} params - Parameters for abandoned game
 * @param {string} params.userId - User ID
 * @param {string} params.sessionId - Game session ID
 * @param {string} params.reason - Reason for abandonment
 * @param {Object} params.session - Database session for transaction
 * @returns {Object} Result with abandoned attempt details
 */
const submitAbandonedGame = async ({
  userId,
  sessionId,
  reason = 'unknown',
  session,
}) => {
  try {
    // Get the game session
    const gameSession = await ArticleQuizSession.findOne({
      _id: sessionId,
      user: userId,
    })
      .populate('gameData')
      .session(session)

    if (!gameSession) {
      throw new Error('Game session not found')
    }

    // Check if already completed or abandoned
    const existingAttempt = await QuizAttempt.findOne({
      user: userId,
      articleQuizSession: sessionId,
    }).session(session)

    if (existingAttempt) {
      if (existingAttempt.abandoned) {
        return {
          message: 'Game was already marked as abandoned',
          existingAbandonedAttempt: existingAttempt,
          alreadyAbandoned: true,
        }
      } else {
        throw new Error('Game was already completed normally')
      }
    }

    const user = await User.findById(userId).session(session)
    const article = await Article.findById(gameSession.article).session(session)

    // Create empty responses based on game type
    let emptyResponses = []
    let totalItems = 0

    switch (gameSession.gameType) {
      case 'normal_quiz':
      case 'true_false':
        totalItems = gameSession.questions.length
        emptyResponses = gameSession.questions.map(question => ({
          questionId: question.questionId || question._id,
          userAnswer: null,
          isCorrect: false,
        }))
        break

      case 'word_weaver':
        totalItems = gameSession.questions.length
        emptyResponses = gameSession.questions.map(question => ({
          questionId: question.questionId || question._id,
          userWord: '',
          isCorrect: false,
          skipped: true,
        }))
        break

      case 'connections':
        // For connections, we need to check how many valid connections exist
        const validConnections =
          gameSession.questions[0]?.validConnections || []
        totalItems = validConnections.length
        emptyResponses = [
          {
            questionId:
              gameSession.questions[0]?.questionId ||
              gameSession.questions[0]?._id,
            connections: [], // No connections made
          },
        ]
        break

      default:
        throw new Error('Invalid game type')
    }

    // Calculate zero performance metrics
    const performance = {
      accuracy: 0,
      difficulty: 0,
      correctCount: 0,
      totalItems: totalItems,
    }

    // Get expected time for the game type
    const expectedTime = GAME_CONFIGS[gameSession.gameType]?.timeLimit || 50

    // Create abandoned quiz attempt with zero score
    const abandonedAttempt = new QuizAttempt({
      user: userId,
      article: gameSession.article,
      articleQuizSession: sessionId,
      gameData: gameSession.gameData,
      gameType: gameSession.gameType,
      responses: emptyResponses,
      performance: performance,
      RQM_score: 0,
      baseRQM_score: 0,
      articleDifficulty: 0.5, // Default difficulty
      timeTaken: 0,
      expectedTime: expectedTime,
      timeFactor: 0,
      performanceBonus: 1.0,
      boost: 1,
      isBoosted: false,

      // Abandoned-specific fields
      abandoned: true,
      abandonedReason: reason,
      abandonedAt: new Date(),

      // Default values for required fields
      pauseRealTimeIQ: user.pauseRealTimeIQ || false,
      season: parseInt(configService.getCurrentSeason(), 10),
      month: moment().month() + 1,
      year: moment().year(),
      xpAwarded: 0, // No XP for abandoned games
    })

    await abandonedAttempt.save({ session })

    // Mark the game session as completed
    gameSession.completed = true
    gameSession.endTime = new Date()
    gameSession.responses = emptyResponses
    await gameSession.save({ session })

    // Don't increment article attempt count for abandoned games
    // article.quizAttemptCnt++ // Commented out intentionally

    console.log(
      `Abandoned game submitted for user ${userId}, session ${sessionId}, reason: ${reason}`,
    )

    return {
      message: 'Abandoned game recorded successfully',
      abandonedAttempt: abandonedAttempt,
      gameType: gameSession.gameType,
      reason: reason,
      abandonedAt: abandonedAttempt.abandonedAt,
      alreadyAbandoned: false,
    }
  } catch (error) {
    console.error('Error submitting abandoned game:', error)
    throw error
  }
}

/**
 * Check if user has any abandoned attempts for an article
 * @param {string} userId - User ID
 * @param {string} articleId - Article ID
 * @returns {Object} Information about abandoned attempts
 */
const checkAbandonedAttempts = async (userId, articleId) => {
  try {
    const abandonedAttempts = await QuizAttempt.find({
      user: userId,
      article: articleId,
      abandoned: true,
    })
      .sort({ createdAt: -1 })
      .limit(5) // Get last 5 abandoned attempts

    const totalAbandoned = await QuizAttempt.countDocuments({
      user: userId,
      article: articleId,
      abandoned: true,
    })

    return {
      hasAbandonedAttempts: abandonedAttempts.length > 0,
      recentAbandonedAttempts: abandonedAttempts,
      totalAbandonedCount: totalAbandoned,
      lastAbandonedAt: abandonedAttempts[0]?.abandonedAt || null,
      lastAbandonedReason: abandonedAttempts[0]?.abandonedReason || null,
    }
  } catch (error) {
    console.error('Error checking abandoned attempts:', error)
    return {
      hasAbandonedAttempts: false,
      recentAbandonedAttempts: [],
      totalAbandonedCount: 0,
      lastAbandonedAt: null,
      lastAbandonedReason: null,
    }
  }
}

/**
 * Get user-friendly message for abandonment reason
 * @param {string} reason - Abandonment reason code
 * @param {string} gameType - Type of game that was abandoned
 * @returns {Object} User-friendly messages
 */
const getAbandonmentMessage = (reason, gameType) => {
  const gameNames = {
    normal_quiz: 'Knowledge Quest',
    true_false: 'Truth Detector',
    word_weaver: 'Word Architect',
    connections: 'Mind Mapper',
  }

  const gameName = gameNames[gameType] || 'Game'

  const messages = {
    session_expired: {
      title: 'Session Expired',
      description: `Your ${gameName} session expired due to inactivity. The game has been automatically submitted with a score of 0.`,
      icon: '⏰',
      color: 'orange',
    },
    page_refresh: {
      title: 'Page Refreshed',
      description: `The page was refreshed during your ${gameName} session. The game has been automatically submitted with a score of 0.`,
      icon: '🔄',
      color: 'blue',
    },
    navigation_away: {
      title: 'Navigation Away',
      description: `You navigated away from the ${gameName} during the session. The game has been automatically submitted with a score of 0.`,
      icon: '🚪',
      color: 'purple',
    },
    connection_lost: {
      title: 'Connection Lost',
      description: `Connection was lost during your ${gameName} session. The game has been automatically submitted with a score of 0.`,
      icon: '📡',
      color: 'red',
    },
    unknown: {
      title: 'Game Interrupted',
      description: `Your ${gameName} session was interrupted unexpectedly. The game has been automatically submitted with a score of 0.`,
      icon: '❌',
      color: 'gray',
    },
  }

  return messages[reason] || messages.unknown
}

module.exports = {
  submitAbandonedGame,
  checkAbandonedAttempts,
  getAbandonmentMessage,
}
