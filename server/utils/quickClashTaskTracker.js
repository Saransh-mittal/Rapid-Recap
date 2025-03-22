// utils/quickClashTaskTracker.js
const {
  updateTaskProgress,
} = require('../services/quickClashServices/quickClashDailyTaskService')

/**
 * Task tracker to automatically update task progress based on user actions
 */
class QuickClashTaskTracker {
  /**
   * Track challenge completion
   * @param {Object} params - Parameters
   * @param {string} params.userId - User ID
   * @param {Object} params.challenge - Challenge object
   * @param {boolean} params.isWinner - Whether the user won
   * @param {string} [params.fromMatchmaking] - Whether the challenge was from matchmaking
   * @param {number} [params.readingTime] - Time spent in reading phase (seconds)
   */
  static async trackChallengeCompletion({
    userId,
    challenge,
    isWinner,
    fromMatchmaking,
    readingTime,
  }) {
    try {
      // Update general challenge completion count
      await updateTaskProgress({
        userId,
        taskType: 'COMPLETE_CHALLENGES',
      })

      // If user won, update win count
      if (isWinner) {
        await updateTaskProgress({
          userId,
          taskType: 'WIN_CHALLENGES',
        })

        // Update win streak task
        await updateTaskProgress({
          userId,
          taskType: 'MAINTAIN_WINSTREAK',
        })
      }

      // If challenge was from matchmaking
      if (fromMatchmaking) {
        await updateTaskProgress({
          userId,
          taskType: 'COMPLETE_MATCHMAKING',
        })
      }

      // If reading time provided and task exists, update reading time task
      if (readingTime) {
        const timeTask = await updateTaskProgress({
          userId,
          taskType: 'IMPROVE_READING_TIME',
          // Only increment if time spent is sufficient
          incrementBy: 0, // Just checking if we should complete the task
        })

        // If task exists and reading time meets the target
        if (timeTask && readingTime >= timeTask.target) {
          await updateTaskProgress({
            userId,
            taskType: 'IMPROVE_READING_TIME',
            incrementBy: 1,
          })
        }
      }

      // Update category usage
      if (challenge && challenge.category) {
        // We'll need to track categories used in a separate process
        // This is just a placeholder
      }
    } catch (error) {
      console.error('Error tracking challenge completion:', error)
    }
  }

  /**
   * Track RQM score achievement
   * @param {Object} params - Parameters
   * @param {string} params.userId - User ID
   * @param {number} params.score - RQM score
   */
  static async trackRQMScore({ userId, score }) {
    try {
      // Get the active task
      const task = await updateTaskProgress({
        userId,
        taskType: 'ACHIEVE_RQM_SCORE',
        incrementBy: 0, // Don't increment yet, just get the task
      })

      // If task exists and score meets the target
      if (task && score >= task.target) {
        await updateTaskProgress({
          userId,
          taskType: 'ACHIEVE_RQM_SCORE',
          incrementBy: 1,
        })
      }
    } catch (error) {
      console.error('Error tracking RQM score:', error)
    }
  }

  /**
   * Track challenge sent to a friend
   * @param {Object} params - Parameters
   * @param {string} params.userId - User ID
   * @param {string} params.friendId - Friend user ID
   */
  static async trackFriendChallenge({ userId, friendId }) {
    try {
      // We'll need to track unique friends challenged in a separate process
      // For now, this is a simplified version
      await updateTaskProgress({
        userId,
        taskType: 'CHALLENGE_FRIEND',
      })
    } catch (error) {
      console.error('Error tracking friend challenge:', error)
    }
  }

  /**
   * Track analysis view
   * @param {Object} params - Parameters
   * @param {string} params.userId - User ID
   * @param {string} params.challengeId - Challenge ID
   */
  static async trackAnalysisView({ userId, challengeId }) {
    try {
      await updateTaskProgress({
        userId,
        taskType: 'VIEW_ANALYSES',
      })
    } catch (error) {
      console.error('Error tracking analysis view:', error)
    }
  }
}

module.exports = QuickClashTaskTracker
