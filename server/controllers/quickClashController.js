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

// Start a challenge session
const startChallengeSession = asyncHandler(async (req, res) => {
  const { challengeId } = req.params
  const { language } = req.body
  const userId = req.user._id

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

  const result = await completeQuiz({
    sessionId,
    responses,
  })

  res.status(200).json({
    success: true,
    message: 'Quiz completed successfully',
    ...result,
  })
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
}
