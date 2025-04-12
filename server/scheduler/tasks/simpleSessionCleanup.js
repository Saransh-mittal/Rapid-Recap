// scheduler/tasks/simpleSessionCleanup.js
const mongoose = require('mongoose')
const QuickClashSession = require('../../model/quickClashSchemas/quickClashSessionSchema')
const QuickClashChallenge = require('../../model/quickClashSchemas/quickClashChallengeSchema')
const {
  updateChallengeScore,
} = require('../../services/quickClashServices/quickClashChallengeService')
const {
  updateBattleWithQuizResults,
} = require('../../services/quickClashServices/quickClashTeamBattleService')

/**
 * Clean up expired, non-completed QuickClash sessions
 */
const cleanupExpiredSessions = async () => {
  console.log('Running QuickClash expired session cleanup task')
  const now = new Date()

  try {
    // Find only sessions that have expired but aren't completed
    const expiredSessions = await QuickClashSession.find({
      expiresAt: { $lt: now },
      phase: { $ne: 'completed' },
    }).populate('challenge')

    console.log(`Found ${expiredSessions.length} expired sessions to resolve`)

    // Process each expired session
    for (const session of expiredSessions) {
      const sessionId = session._id
      const userId = session.user
      const challengeId = session.challenge._id

      console.log(
        `Processing expired session ${sessionId} for challenge ${challengeId}`,
      )

      // Start a transaction
      const mongoSession = await mongoose.startSession()
      await mongoSession.startTransaction()

      try {
        // Update the session with zero score
        session.phase = 'completed'
        session.score = {
          RQM_score: 0,
          baseRQM_score: 0,
          total: 0,
        }

        await session.save({ session: mongoSession })

        // Update the challenge score
        const challenge = await updateChallengeScore({
          challengeId,
          userId,
          score: 0,
          session: mongoSession,
        })

        // If this is part of a team battle, update the team battle too
        if (challenge.fromTeamBattle && challenge.teamBattle) {
          console.log(
            `Challenge ${challengeId} is part of team battle ${challenge.teamBattle}`,
          )

          await updateBattleWithQuizResults({
            battleId: challenge.teamBattle,
            challengeId,
            userId,
            score: 0,
          })
        }

        await mongoSession.commitTransaction()
        console.log(`Successfully resolved expired session ${sessionId}`)
      } catch (error) {
        console.error(`Error resolving session ${sessionId}:`, error)
        await mongoSession.abortTransaction()
      } finally {
        mongoSession.endSession()
      }
    }
  } catch (error) {
    console.error('Error in cleanup expired sessions task:', error)
  }
}

module.exports = {
  cleanupExpiredSessions,
}
