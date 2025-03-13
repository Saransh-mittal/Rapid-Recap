// scheduler/tasks/processExpiredChallenges.js
const QuickClashChallenge = require('../../model/quickClashSchemas/quickClashChallengeSchema')

/**
 * Process expired Quick Clash challenges
 * - For challenges that are expired and one player has attempted but the other hasn't
 * - Mark non-attempting player with score 0 and challenge as completed
 * - Trigger analysis generation
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

        // Set the non-attempting player's score to 0 and mark as attempted
        if (challengerAttempted && !opponentAttempted) {
          challenge.opponentScore = 0
          challenge.opponentAttempted = true
          challenge.winner =
            challenge.challengerScore > 0 ? challenge.challenger._id : null
        } else if (!challengerAttempted && opponentAttempted) {
          challenge.challengerScore = 0
          challenge.challengerAttempted = true
          challenge.winner =
            challenge.opponentScore > 0 ? challenge.opponent._id : null
        }

        // Mark challenge as completed
        challenge.status = 'completed'
        await challenge.save()

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
