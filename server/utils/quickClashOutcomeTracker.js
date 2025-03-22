// utils/quickClashOutcomeTracker.js
const {
  updateTaskProgress,
} = require('../services/quickClashServices/quickClashDailyTaskService')
const QuickClashChallenge = require('../model/quickClashSchemas/quickClashChallengeSchema')

/**
 * Utility class to track challenge outcomes for both participants
 * This should be called when both users have completed their parts of a challenge
 */
class QuickClashOutcomeTracker {
  /**
   * Track challenge outcome for both participants
   * @param {Object} params - Parameters
   * @param {string} params.challengeId - Challenge ID
   */
  static async trackOutcome({ challengeId }) {
    try {
      // Get challenge details
      const challenge = await QuickClashChallenge.findById(challengeId)
        .populate('challenger', '_id')
        .populate('opponent', '_id')

      if (!challenge) {
        console.error(`Challenge not found: ${challengeId}`)
        return
      }

      // Only proceed if both users have completed
      if (!challenge.challengerAttempted || !challenge.opponentAttempted) {
        console.log(`Challenge ${challengeId} not completed by both users yet`)
        return
      }

      // Determine outcome
      const challengerScore = challenge.challengerScore
      const opponentScore = challenge.opponentScore
      const isTie = challengerScore === opponentScore

      let winnerUserId = null
      let loserUserId = null
      let tasksDone = null
      if (!isTie) {
        // Determine winner and loser
        if (challengerScore > opponentScore) {
          winnerUserId = challenge.challenger._id
          loserUserId = challenge.opponent._id
        } else {
          winnerUserId = challenge.opponent._id
          loserUserId = challenge.challenger._id
        }

        // Update win-related tasks for the winner
        if (winnerUserId) {
          tasksDone = await this.updateWinRelatedTasks(winnerUserId)
        }
      }

      return {
        challengeId,
        winnerUserId,
        loserUserId,
        tasksDone,
        isTie,
      }
    } catch (error) {
      console.error('Error tracking challenge outcome:', error)
    }
  }

  /**
   * Update win-related tasks for a user
   * @param {string} userId - User ID
   * @private
   */
  static async updateWinRelatedTasks(userId) {
    let WIN_CHALLENGES_task = null
    let MAINTAIN_WINSTREAK_task = null
    try {
      // Update win challenges task
      WIN_CHALLENGES_task = await updateTaskProgress({
        userId,
        taskType: 'WIN_CHALLENGES',
      })

      // Update win streak task
      MAINTAIN_WINSTREAK_task = await updateTaskProgress({
        userId,
        taskType: 'MAINTAIN_WINSTREAK',
      })

      return {
        WIN_CHALLENGES_task,
        MAINTAIN_WINSTREAK_task,
      }
    } catch (error) {
      console.error(
        `Error updating win-related tasks for user ${userId}:`,
        error,
      )
      return {
        WIN_CHALLENGES_task,
        MAINTAIN_WINSTREAK_task,
      }
    }
  }
}

module.exports = QuickClashOutcomeTracker
