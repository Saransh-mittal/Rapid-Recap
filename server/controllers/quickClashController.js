// controllers/quickClashController.js
const asyncHandler = require('express-async-handler')
const {
  createChallenge,
  acceptChallenge,
  rejectChallenge,
  getChallengeDetails,
  getUserChallenges,
  postChallengeCreation,
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
const {
  notifyChallengerAboutCreation,
} = require('../services/quickClashServices/quickClashNotificationService')
const User = require('../model/userSchema')
const {
  getLeaderboard,
} = require('../services/quickClashServices/quickClashLeaderboardService')
const {
  calculatePotentialTrophyExchange,
  getUserTrophyHistory,
  getUserTrophies,
} = require('../services/quickClashServices/quickClashTrophyService')
const {
  updateBattleWithQuizResults,
} = require('../services/quickClashServices/quickClashTeamBattleService')

// Create a new challenge
const createNewChallenge = asyncHandler(async (req, res) => {
  const { opponentId, categories } = req.body
  const challengerId = req.user._id

  try {
    // Create the challenge
    const challengeResult = await createChallenge({
      challengerId,
      opponentId,
      categories,
    })

    // Handle post-creation tasks (background highlight generation)
    // after sending the response to avoid blocking
    if (challengeResult && challengeResult.challenge) {
      // Notify the challenger about successful creation
      const { challenger, opponent, challenge } = challengeResult.notifyData
      notifyChallengerAboutCreation({
        challenge,
        challenger,
        opponent,
        success: true,
      }).catch(err =>
        console.error(
          'Error notifying challenger about successful creation:',
          err,
        ),
      )

      // Schedule post-creation tasks
      process.nextTick(() => {
        postChallengeCreation(
          challengeResult.challenge._id,
          challengeResult.notifyData,
        ).catch(err =>
          console.error('Error in post-challenge creation tasks:', err),
        )
      })
    }

    res.status(201).json({
      success: true,
      message: 'Challenge created successfully',
      challenge: challengeResult.challenge,
    })
  } catch (error) {
    console.error('Error creating challenge:', error)

    // If we have user data available, notify the challenger about failure
    if (req.user) {
      // We need to fetch the opponent's data since we don't have it yet
      try {
        const opponent = await User.findById(opponentId).select(
          '_id name inGameName',
        )

        notifyChallengerAboutCreation({
          challenge: { category },
          challenger: req.user,
          opponent,
          success: false,
          errorMessage: error.message || 'An unexpected error occurred.',
        }).catch(err =>
          console.error(
            'Error notifying challenger about creation failure:',
            err,
          ),
        )
      } catch (notifyError) {
        console.error(
          'Error preparing challenger notification after creation failure:',
          notifyError,
        )
      }
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create challenge',
    })
  }
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

/**
 * Get user's challenges with pagination
 * @route GET /api/quickClash/challenges
 * @access Private
 */
const getMyChallenges = asyncHandler(async (req, res) => {
  const userId = req.user._id
  const { status, limit = 20, page = 1 } = req.query

  const result = await getUserChallenges({
    userId,
    status,
    page: parseInt(page),
    limit: parseInt(limit),
  })

  res.status(200).json({
    success: true,
    challenges: result.challenges,
    pagination: result.pagination,
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

    if (!session) {
      throw new Error('Session not found')
    }

    // Get the challenge to check if it's from a team battle
    const challenge = await QuickClashChallenge.findById(session.challenge)
      .select(
        'challengerAttempted opponentAttempted status fromTeamBattle teamBattle',
      )
      .lean()

    if (!challenge) {
      throw new Error('Challenge not found')
    }

    // Check if the challenge is from a team battle
    if (challenge.fromTeamBattle && challenge.teamBattle) {
      // Update the team battle with the quiz results
      try {
        const userId = req.user._id
        await updateBattleWithQuizResults({
          battleId: challenge.teamBattle,
          challengeId: challenge._id,
          userId: userId,
          score: result.RQM_score,
        })
      } catch (error) {
        console.error('Error updating team battle with quiz results:', error)
        // We don't want to fail the quiz submission if this update fails
        // Just log the error and continue
      }
    } else {
      // Regular challenge completion logic
      // If both users have submitted their quizzes, the challenge is completed
      if (challenge.challengerAttempted && challenge.opponentAttempted) {
        // Start analysis generation in the background
        initiateBackgroundAnalysis({
          challengeId: session.challenge.toString(),
        })
      }
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
  console.log('Generating analysis for challenge:', challengeId)
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

/**
 * @desc    Get Quick Clash leaderboard
 * @route   GET /api/quickClash/leaderboard
 * @access  Private
 */
const getQuickClashLeaderboard = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search = '' } = req.query

  try {
    const leaderboardData = await getLeaderboard({
      page: parseInt(page),
      limit: parseInt(limit),
      searchQuery: search,
    })

    res.status(200).json({
      success: true,
      ...leaderboardData,
    })
  } catch (error) {
    console.error('Error fetching Quick Clash leaderboard:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch leaderboard data',
    })
  }
})

/**
 * @desc    Mark a challenge as having had revenge taken
 * @route   POST /api/quickClash/challenge/:challengeId/markRevenge
 * @access  Private
 */
const markChallengeRevenge = asyncHandler(async (req, res) => {
  const { challengeId } = req.params
  const userId = req.user._id

  try {
    // Find the challenge
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
        message: 'Not authorized to update this challenge',
      })
    }

    // Update the challenge
    challenge.revengeStatus = true
    await challenge.save()

    res.status(200).json({
      success: true,
      message: 'Challenge marked as revenged',
    })
  } catch (error) {
    console.error('Error marking challenge revenge:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update challenge',
    })
  }
})

/**
 * @desc    Get a user's current trophy count
 * @route   GET /api/quickClash/trophies
 * @access  Private
 */
const getUserTrophiesController = asyncHandler(async (req, res) => {
  const userId = req.user._id

  try {
    const trophies = await getUserTrophies({ userId })

    res.status(200).json({
      success: true,
      trophies,
    })
  } catch (error) {
    console.error('Error getting user trophies:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get trophies',
    })
  }
})

/**
 * @desc    Get a user's trophy history
 * @route   GET /api/quickClash/trophies/history
 * @access  Private
 */
const getUserTrophyHistoryController = asyncHandler(async (req, res) => {
  const userId = req.user._id
  const { limit = 10 } = req.query

  try {
    const history = await getUserTrophyHistory({
      userId,
      limit: parseInt(limit),
    })

    res.status(200).json({
      success: true,
      history,
    })
  } catch (error) {
    console.error('Error getting trophy history:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get trophy history',
    })
  }
})

/**
 * @desc    Calculate potential trophy exchange for a match
 * @route   GET /api/quickClash/trophies/exchange/:opponentId
 * @access  Private
 */
const calculatePotentialTrophyExchangeController = asyncHandler(
  async (req, res) => {
    const userId = req.user._id
    const { opponentId } = req.params

    try {
      const exchange = await calculatePotentialTrophyExchange({
        userId,
        opponentId,
      })

      res.status(200).json({
        success: true,
        ...exchange,
      })
    } catch (error) {
      console.error('Error calculating potential trophy exchange:', error)
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to calculate trophy exchange',
      })
    }
  },
)

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
  getSessionQuiz,
  getCompletedChallenges,
  getSessionQuizReport,
  getSessionIdFromChallenge,
  generateAnalysis,
  getChallengeAnalysis,
  getUserClashStats,
  getAnalysisStatus,
  getQuickClashLeaderboard,
  markChallengeRevenge,
  getUserTrophiesController,
  getUserTrophyHistoryController,
  calculatePotentialTrophyExchangeController,
}
