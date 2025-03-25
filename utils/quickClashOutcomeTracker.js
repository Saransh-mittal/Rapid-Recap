// utils/quickClashOutcomeTracker.js
const {
  updateTaskProgress,
} = require('../services/quickClashServices/quickClashDailyTaskService')
const QuickClashChallenge = require('../model/quickClashSchemas/quickClashChallengeSchema')
const QuickClashDailyTask = require('../model/quickClashSchemas/quickClashDailyTaskSchema')

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
      let winnerTasksDone = null
      let loserTaskResult = null
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
          winnerTasksDone = await this.updateWinRelatedTasks(winnerUserId)
        }

        if (loserUserId) {
          loserTaskResult = await this.resetWinStreakTask(loserUserId)
        }
      }

      return {
        challengeId,
        winnerUserId,
        loserUserId,
        tasksDone: {
          ...winnerTasksDone,
          ...loserTaskResult,
        },
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
    let winChallengesTask = null
    let winStreakTask = null

    try {
      // Update win challenges task
      winChallengesTask = await updateTaskProgress({
        userId,
        taskType: 'WIN_CHALLENGES',
      })

      // For win streak, we need to handle it differently
      // First, find the active win streak task
      const streakTask = await QuickClashDailyTask.findOne({
        user: userId,
        taskType: 'MAINTAIN_WINSTREAK',
        expiresAt: { $gt: new Date() },
        completed: false,
      })

      if (streakTask) {
        // Initialize metadata if it doesn't exist
        if (!streakTask.metadata) {
          streakTask.metadata = {
            currentStreak: 0,
            maxStreak: 0,
            winDates: [],
          }
        }

        // Increment the current streak
        if (!streakTask.metadata.currentStreak) {
          streakTask.metadata.currentStreak = 0
        }
        streakTask.metadata.currentStreak += 1

        // Add this win date to the tracking
        if (!streakTask.metadata.winDates) {
          streakTask.metadata.winDates = []
        }
        streakTask.metadata.winDates.push(new Date())

        // Update max streak if current streak is higher
        if (
          !streakTask.metadata.maxStreak ||
          streakTask.metadata.currentStreak > streakTask.metadata.maxStreak
        ) {
          streakTask.metadata.maxStreak = streakTask.metadata.currentStreak
        }

        // Update progress (target is the required streak length)
        streakTask.progress = Math.min(
          streakTask.metadata.currentStreak,
          streakTask.target,
        )

        // Check if task is now completed
        if (streakTask.progress >= streakTask.target && !streakTask.completed) {
          streakTask.completed = true
          streakTask.completedAt = new Date()
        }

        await streakTask.save()
        winStreakTask = streakTask
      }

      return {
        WIN_CHALLENGES_task: winChallengesTask,
        MAINTAIN_WINSTREAK_task: winStreakTask,
      }
    } catch (error) {
      console.error(
        `Error updating win-related tasks for user ${userId}:`,
        error,
      )
      return {
        WIN_CHALLENGES_task: winChallengesTask,
        MAINTAIN_WINSTREAK_task: winStreakTask,
      }
    }
  }

  /**
   * Reset the win streak task for a user when they lose
   * @param {string} userId - User ID
   * @returns {Promise<Object|null>} The updated task or null
   */
  static async resetWinStreakTask(userId) {
    try {
      // Find the win streak task for this user
      const streakTask = await QuickClashDailyTask.findOne({
        user: userId,
        taskType: 'MAINTAIN_WINSTREAK',
        expiresAt: { $gt: new Date() },
      })

      if (streakTask) {
        // Initialize metadata if it doesn't exist
        if (!streakTask.metadata) {
          streakTask.metadata = {
            currentStreak: 0,
            maxStreak: 0,
            winDates: [],
            lossEvents: [],
          }
        }

        // Track the loss event
        if (!streakTask.metadata.lossEvents) {
          streakTask.metadata.lossEvents = []
        }
        streakTask.metadata.lossEvents.push({
          date: new Date(),
          previousStreak: streakTask.metadata.currentStreak || 0,
        })

        // Reset current streak to 0
        streakTask.metadata.currentStreak = 0

        // Don't change progress if the task is already completed
        if (!streakTask.completed) {
          streakTask.progress = 0
        }

        await streakTask.save()
        return streakTask
      }

      return null
    } catch (error) {
      console.error(`Error resetting win streak for user ${userId}:`, error)
      return null
    }
  }
}

module.exports = QuickClashOutcomeTracker
