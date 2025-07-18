// scheduler/tasks/processExpiredChallenges.js
const QuickClashChallenge = require('../../model/quickClashSchemas/quickClashChallengeSchema')
const {
  updateChallengeScore,
} = require('../../services/quickClashServices/quickClashChallengeService')

/**
 * Process expired Quick Clash challenges
 * - For challenges that are expired and one player has attempted but the other hasn't
 * - Mark non-attempting player with score 0 and challenge as completed
 * - Trigger analysis generation via updateChallengeScore
 */
const processExpiredChallenges = async () => {
  try {
    console.log('Starting to process expired challenges')
    const now = new Date()

    // Find expired active challenges where exactly one player has attempted
    const expiredChallenges = await QuickClashChallenge.find({
      status: 'active',
      expiresAt: { $lt: now },
      $or: [
        { challengerAttempted: true, opponentAttempted: false },
        { challengerAttempted: false, opponentAttempted: true },
      ],
    }).populate('challenger opponent')

    console.log(
      `Found ${expiredChallenges.length} expired challenges to process`,
    )

    for (const challenge of expiredChallenges) {
      try {
        // Determine which player attempted and which didn't
        const challengerAttempted = challenge.challengerAttempted
        const opponentAttempted = challenge.opponentAttempted

        // Use updateChallengeScore to set the non-attempting player's score to 0
        if (challengerAttempted && !opponentAttempted) {
          // Opponent didn't attempt, set their score to 0
          await updateChallengeScore({
            challengeId: challenge._id,
            userId: challenge.opponent._id,
            score: 0,
          })
        } else if (!challengerAttempted && opponentAttempted) {
          // Challenger didn't attempt, set their score to 0
          await updateChallengeScore({
            challengeId: challenge._id,
            userId: challenge.challenger._id,
            score: 0,
          })
        }

        console.log(`Processed expired challenge ${challenge._id}`)
      } catch (processingError) {
        console.error(
          `Error processing expired challenge ${challenge._id}:`,
          processingError,
        )
        // Continue with other challenges
      }
    }

    console.log('Completed processing expired challenges')
  } catch (error) {
    console.error('Error in processExpiredChallenges task:', error)
  }
}

module.exports = processExpiredChallenges
