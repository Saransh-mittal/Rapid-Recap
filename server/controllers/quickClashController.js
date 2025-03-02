// controllers/quickClashController.js
const asyncHandler = require('express-async-handler')
const {
  createChallenge,
  acceptChallenge,
  rejectChallenge,
  getChallengeDetails,
  getUserChallenges,
} = require('../services/quickClashServices/quickClashChallengeService')
const {
  createSession,
  startReading,
  completeReading,
  completeQuiz,
} = require('../services/quickClashServices/quickClashSessionService')
const QuickClashChallenge = require('../model/quickClashSchemas/quickClashChallengeSchema')
const QuickClashSession = require('../model/quickClashSchemas/quickClashSessionSchema')
const QuickClashQuiz = require('../model/quickClashSchemas/quickClashQuizSchema')
const {
  getQuizQuestions,
  submitQuizAnswersService,
  getQuizReport,
} = require('../services/quickClashServices/quickClashQuizService')
const {
  generateChallengeAnalysis,
  getUserChallengeAnalysis,
  generateChallengeAnalysisWithTranslation,
  getUserChallengeAnalysisLocalized,
} = require('../services/quickClashServices/quickClashAnalysisService')
const {
  getUserStats,
} = require('../services/quickClashServices/quickClashStatsService')
const {
  initiateBackgroundAnalysis,
  isAnalysisInProgress,
} = require('../services/quickClashServices/autoAnalysisService')
const QuickClashAnalysis = require('../model/quickClashSchemas/quickClashAnalysisSchema')

// Create a new challenge
const createNewChallenge = asyncHandler(async (req, res) => {
  const { opponentId, categories } = req.body
  const challengerId = req.user._id

  const challenge = await createChallenge({
    challengerId,
    opponentId,
    categories,
  })

  res.status(201).json({
    success: true,
    message: 'Challenge created successfully',
    challenge,
  })
})

// Accept a challenge
const handleAcceptChallenge = asyncHandler(async (req, res) => {
  const { challengeId } = req.params
  const userId = req.user._id

  const challenge = await acceptChallenge({
    challengeId,
    userId,
  })

  res.status(200).json({
    success: true,
    message: 'Challenge accepted successfully',
    challenge,
  })
})

// Reject a challenge
const handleRejectChallenge = asyncHandler(async (req, res) => {
  const { challengeId } = req.params
  const userId = req.user._id

  const challenge = await rejectChallenge({
    challengeId,
    userId,
  })

  res.status(200).json({
    success: true,
    message: 'Challenge rejected successfully',
    challenge,
  })
})

// Get challenge details
const getChallenge = asyncHandler(async (req, res) => {
  const { challengeId } = req.params

  const challenge = await getChallengeDetails({
    challengeId,
  })

  res.status(200).json({
    success: true,
    challenge,
  })
})

// Get user's challenges
const getMyChallenges = asyncHandler(async (req, res) => {
  const userId = req.user._id
  const { status, limit } = req.query

  const challenges = await getUserChallenges({
    userId,
    status,
    limit: parseInt(limit) || 10,
  })

  res.status(200).json({
    success: true,
    challenges,
  })
})

/**
 * Start a challenge session
 * @route POST /api/quickClash/session/:challengeId
 * @access Private
 */
const startChallengeSession = asyncHandler(async (req, res) => {
  const { challengeId } = req.params
  const { language } = req.body
  const userId = req.user._id

  try {
    // Pass the explicit language if provided, otherwise user's preference will be used
    const session = await createSession({
      challengeId,
      userId,
      language,
    })

    res.status(200).json({
      success: true,
      message: 'Challenge session started',
      session,
    })
  } catch (error) {
    console.error('Error starting challenge session:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Error starting challenge session',
    })
  }
})

// Start reading phase
const startReadingPhase = asyncHandler(async (req, res) => {
  const { sessionId } = req.params

  const readingPhase = await startReading({
    sessionId,
  })

  res.status(200).json({
    success: true,
    message: 'Reading phase started',
    ...readingPhase,
  })
})

// Complete reading phase
const completeReadingPhase = asyncHandler(async (req, res) => {
  const { sessionId } = req.params
  const { completionType } = req.body

  const result = await completeReading({
    sessionId,
    completionType,
  })

  res.status(200).json({
    success: true,
    message: 'Reading phase completed',
    ...result,
  })
})

// Submit quiz answers
const submitQuizAnswers = asyncHandler(async (req, res) => {
  const { sessionId } = req.params
  const { responses } = req.body

  try {
    const result = await submitQuizAnswersService({
      sessionId,
      responses,
    })

    // Get the session with challenge ID
    const session = await QuickClashSession.findById(sessionId)
      .select('challenge')
      .lean()

    // Get the challenge to check if it's now completed
    const challenge = await QuickClashChallenge.findById(session.challenge)
      .select('challengerScore opponentScore status')
      .lean()

    // If both users have submitted their quizzes, the challenge is completed
    if (
      challenge &&
      challenge.challengerScore > 0 &&
      challenge.opponentScore > 0
    ) {
      // Start analysis generation in the background
      initiateBackgroundAnalysis({
        challengeId: session.challenge.toString(),
      })
    }

    res.status(200).json({
      success: true,
      message: 'Quiz completed successfully',
      challengeId: session.challenge.toString(), // Include the challenge ID for redirection
      ...result,
    })
  } catch (error) {
    console.error('Error submitting quiz answers:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Error submitting quiz answers',
    })
  }
})

// Socket event handlers for real-time updates
const handleQuickClashEvents = (io, socket) => {
  // When user starts reading phase
  socket.on('quickClash:startReading', async data => {
    try {
      const { sessionId } = data
      const readingPhase = await startReading({ sessionId })

      // Notify both players
      io.to(sessionId).emit('quickClash:readingStarted', readingPhase)

      // Set timeout for reading phase
      setTimeout(async () => {
        const result = await completeReading({
          sessionId,
          completionType: 'timeout',
        })
        io.to(sessionId).emit('quickClash:readingCompleted', result)
      }, readingPhase.timeLimit * 1000)
    } catch (error) {
      socket.emit('quickClash:error', {
        message: error.message,
      })
    }
  })

  // When user completes reading phase manually
  socket.on('quickClash:completeReading', async data => {
    try {
      const { sessionId } = data
      const result = await completeReading({
        sessionId,
        completionType: 'manual',
      })
      // controllers/quickClashController.js (continued)
      io.to(sessionId).emit('quickClash:readingCompleted', result)
    } catch (error) {
      socket.emit('quickClash:error', {
        message: error.message,
      })
    }
  })

  // When challenge is created
  socket.on('quickClash:challenge', async data => {
    try {
      const { opponentId, categories } = data
      const challenge = await createChallenge({
        challengerId: socket.user._id,
        opponentId,
        categories,
      })

      // Notify the opponent
      io.to(opponentId).emit('quickClash:challengeReceived', {
        challenge,
      })

      socket.emit('quickClash:challengeCreated', {
        challenge,
      })
    } catch (error) {
      socket.emit('quickClash:error', {
        message: error.message,
      })
    }
  })

  // When opponent responds to challenge
  socket.on('quickClash:challengeResponse', async data => {
    try {
      const { challengeId, accepted } = data

      if (accepted) {
        const challenge = await acceptChallenge({
          challengeId,
          userId: socket.user._id,
        })

        // Notify both players
        io.to(challenge.challenger).emit('quickClash:challengeAccepted', {
          challenge,
        })
        io.to(challenge.opponent).emit('quickClash:challengeAccepted', {
          challenge,
        })
      } else {
        const challenge = await rejectChallenge({
          challengeId,
          userId: socket.user._id,
        })

        // Notify challenger
        io.to(challenge.challenger).emit('quickClash:challengeRejected', {
          challenge,
        })
      }
    } catch (error) {
      socket.emit('quickClash:error', {
        message: error.message,
      })
    }
  })

  // When user submits quiz
  socket.on('quickClash:submitQuiz', async data => {
    try {
      const { sessionId, responses } = data
      const result = await completeQuiz({
        sessionId,
        responses,
      })

      // Notify both players about completion
      const session = await QuickClashSession.findById(sessionId).populate(
        'challenge',
      )
      io.to(session.challenge.challenger).emit(
        'quickClash:quizCompleted',
        result,
      )
      io.to(session.challenge.opponent).emit('quickClash:quizCompleted', result)

      // If both players have completed, determine winner
      if (
        session.challenge.challengerScore > 0 &&
        session.challenge.opponentScore > 0
      ) {
        io.to(session.challenge.challenger).emit(
          'quickClash:challengeCompleted',
          {
            challenge: session.challenge,
          },
        )
        io.to(session.challenge.opponent).emit(
          'quickClash:challengeCompleted',
          {
            challenge: session.challenge,
          },
        )
      }
    } catch (error) {
      socket.emit('quickClash:error', {
        message: error.message,
      })
    }
  })
}

// Get quiz questions for a session
const getSessionQuiz = asyncHandler(async (req, res) => {
  const { sessionId } = req.params

  try {
    // Get questions without answers for the frontend
    const questions = await getQuizQuestions({ sessionId })

    // Start the timer for the quiz attempt
    const session = await QuickClashSession.findById(sessionId)
    if (session && session.phase === 'quiz' && !session.quizAttempt.startTime) {
      session.quizAttempt.startTime = new Date()
      await session.save()
    }

    res.status(200).json({
      success: true,
      questions,
      quizDuration: 50, // Send quiz duration to frontend (50 seconds)
    })
  } catch (error) {
    console.error('Error fetching session quiz:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching quiz questions',
    })
  }
})

// Get completed challenges
const getCompletedChallenges = asyncHandler(async (req, res) => {
  const userId = req.user._id
  const { page = 1, limit = 10 } = req.query

  try {
    const skip = (parseInt(page) - 1) * parseInt(limit)

    const query = {
      $or: [{ challenger: userId }, { opponent: userId }],
      status: 'completed',
    }

    const challenges = await QuickClashChallenge.find(query)
      .populate('challenger opponent')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))

    const totalCount = await QuickClashChallenge.countDocuments(query)
    const hasMore = skip + challenges.length < totalCount

    res.status(200).json({
      success: true,
      challenges,
      hasMore,
      total: totalCount,
    })
  } catch (error) {
    console.error('Error fetching completed challenges:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching completed challenges',
    })
  }
})

/**
 * @desc    Get quiz report for a completed challenge session
 * @route   GET /api/quickClash/session/:sessionId/report
 * @access  Private
 */
const getSessionQuizReport = asyncHandler(async (req, res) => {
  const { sessionId } = req.params
  const userId = req.user._id

  try {
    const report = await getQuizReport({
      sessionId,
      userId,
    })

    res.status(200).json({
      success: true,
      report,
    })
  } catch (error) {
    console.error('Error fetching session quiz report:', error)
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to fetch quiz report',
    })
  }
})

const getSessionIdFromChallenge = asyncHandler(async (req, res) => {
  const { challengeId } = req.params
  const { userId } = req.query

  try {
    // Find the session for this challenge and user
    const session = await QuickClashSession.findOne({
      challenge: challengeId,
      user: userId,
      phase: 'completed',
    })

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'No completed session found for this challenge',
      })
    }

    res.status(200).json({
      success: true,
      sessionId: session._id,
    })
  } catch (error) {
    console.error('Error finding challenge session:', error)
    res.status(500).json({
      success: false,
      message: 'Error finding challenge session',
    })
  }
})

/**
 * Generate analysis for a challenge
 * @route POST /api/quickClash/analysis/:challengeId/generate
 * @access Private
 */
const generateAnalysis = asyncHandler(async (req, res) => {
  const { challengeId } = req.params
  const userId = req.user._id

  try {
    // Check if user is part of the challenge
    const challenge = await QuickClashChallenge.findById(challengeId)

    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found',
      })
    }

    // Verify user is part of this challenge
    const isChallenger = challenge.challenger.toString() === userId.toString()
    const isOpponent = challenge.opponent.toString() === userId.toString()

    if (!isChallenger && !isOpponent) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to access this challenge',
      })
    }

    // Check if challenge is completed
    if (challenge.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Challenge must be completed before generating analysis',
      })
    }

    // Generate the analysis with translation support
    const analysis = await generateChallengeAnalysisWithTranslation({
      challengeId,
    })

    res.status(200).json({
      success: true,
      analysis,
    })
  } catch (error) {
    console.error('Error generating challenge analysis:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate analysis',
    })
  }
})

/**
 * Get challenge analysis for current user
 * @route GET /api/quickClash/analysis/:challengeId
 * @access Private
 */
const getChallengeAnalysis = asyncHandler(async (req, res) => {
  const { challengeId } = req.params
  const userId = req.user._id

  try {
    // Check if user is part of the challenge
    const challenge = await QuickClashChallenge.findById(challengeId)

    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found',
      })
    }

    // Verify user is part of this challenge
    const isChallenger = challenge.challenger.toString() === userId.toString()
    const isOpponent = challenge.opponent.toString() === userId.toString()

    if (!isChallenger && !isOpponent) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to access this challenge',
      })
    }

    // Get the user's analysis with localization support
    const analysis = await getUserChallengeAnalysisLocalized({
      challengeId,
      userId,
    })

    res.status(200).json({
      success: true,
      analysis,
    })
  } catch (error) {
    console.error('Error fetching challenge analysis:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch analysis',
    })
  }
})

/**
 * @desc    Get user Quick Clash statistics
 * @route   GET /api/quickClash/stats
 * @access  Private
 */
const getUserClashStats = asyncHandler(async (req, res) => {
  const userId = req.user._id

  try {
    const stats = await getUserStats({ userId })

    res.status(200).json({
      success: true,
      stats,
    })
  } catch (error) {
    console.error('Error fetching Quick Clash stats:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch Quick Clash statistics',
    })
  }
})

/**
 * Get analysis status for a challenge
 * @route GET /api/quickClash/analysis/:challengeId/status
 * @access Private
 */
const getAnalysisStatus = asyncHandler(async (req, res) => {
  const { challengeId } = req.params
  const userId = req.user._id

  try {
    // Check if user is part of the challenge
    const challenge = await QuickClashChallenge.findById(challengeId)

    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found',
      })
    }

    // Verify user is part of this challenge
    const isChallenger = challenge.challenger.toString() === userId.toString()
    const isOpponent = challenge.opponent.toString() === userId.toString()

    if (!isChallenger && !isOpponent) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to access this challenge',
      })
    }

    // Check if analysis exists
    const existingAnalysis = await QuickClashAnalysis.findOne({
      challenge: challengeId,
    })

    // Check if analysis is in progress (using our in-memory tracker)
    const inProgress = isAnalysisInProgress({ challengeId })

    res.status(200).json({
      success: true,
      status: existingAnalysis
        ? 'completed'
        : inProgress
        ? 'in_progress'
        : 'not_started',
      analysisId: existingAnalysis ? existingAnalysis._id : null,
    })
  } catch (error) {
    console.error('Error checking analysis status:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to check analysis status',
    })
  }
})

module.exports = {
  createNewChallenge,
  handleAcceptChallenge,
  handleRejectChallenge,
  getChallenge,
  getMyChallenges,
  startChallengeSession,
  startReadingPhase,
  completeReadingPhase,
  submitQuizAnswers,
  handleQuickClashEvents,
  getSessionQuiz,
  getCompletedChallenges,
  getSessionQuizReport,
  getSessionIdFromChallenge,
  generateAnalysis,
  getChallengeAnalysis,
  getUserClashStats,
  getAnalysisStatus,
}
