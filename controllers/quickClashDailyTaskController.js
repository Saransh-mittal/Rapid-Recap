// controllers/quickClashDailyTaskController.js
const asyncHandler = require('express-async-handler')
const {
  getUserDailyTasks,
  generateDailyTasks,
  updateTaskProgress,
  claimTaskReward,
  getTaskStatistics,
} = require('../services/quickClashServices/quickClashDailyTaskService')

/**
 * @desc    Get daily tasks for the logged-in user
 * @route   GET /api/quickClash/dailyTasks
 * @access  Private
 */
const getDailyTasks = asyncHandler(async (req, res) => {
  const userId = req.user._id

  try {
    const tasks = await getUserDailyTasks({ userId })

    res.status(200).json({
      success: true,
      tasks,
    })
  } catch (error) {
    console.error('Error fetching daily tasks:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch daily tasks',
    })
  }
})

/**
 * @desc    Force refresh daily tasks for the user
 * @route   POST /api/quickClash/dailyTasks/refresh
 * @access  Private
 */
const refreshDailyTasks = asyncHandler(async (req, res) => {
  const userId = req.user._id

  try {
    // Generate new tasks
    const tasks = await generateDailyTasks({ userId })

    res.status(200).json({
      success: true,
      message: 'Daily tasks refreshed successfully',
      tasks,
    })
  } catch (error) {
    console.error('Error refreshing daily tasks:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to refresh daily tasks',
    })
  }
})

/**
 * @desc    Update progress for a specific task
 * @route   POST /api/quickClash/dailyTasks/:taskType/progress
 * @access  Private
 */
const updateTaskProgressController = asyncHandler(async (req, res) => {
  const userId = req.user._id
  const { taskType } = req.params
  const { incrementBy = 1, metadata } = req.body

  try {
    const updatedTask = await updateTaskProgress({
      userId,
      taskType,
      incrementBy: Number(incrementBy),
      metadata,
    })

    if (!updatedTask) {
      return res.status(404).json({
        success: false,
        message: 'No active task found of this type',
      })
    }

    // Check if task was completed with this update
    const wasJustCompleted =
      updatedTask.completed &&
      updatedTask.completedAt &&
      Date.now() - updatedTask.completedAt < 60000 // Completed in the last minute

    res.status(200).json({
      success: true,
      task: updatedTask,
      justCompleted: wasJustCompleted,
    })
  } catch (error) {
    console.error('Error updating task progress:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update task progress',
    })
  }
})

/**
 * @desc    Claim reward for a completed task
 * @route   POST /api/quickClash/dailyTasks/:taskId/claim
 * @access  Private
 */
const claimTaskRewardController = asyncHandler(async (req, res) => {
  const userId = req.user._id
  const { taskId } = req.params

  try {
    const result = await claimTaskReward({ taskId, userId })

    res.status(200).json({
      success: true,
      message: 'Reward claimed successfully',
      reward: result.reward,
      newTotals: result.newTotals,
      levelInfo: result.levelInfo,
    })
  } catch (error) {
    console.error('Error claiming task reward:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to claim task reward',
    })
  }
})

/**
 * @desc    Get task completion statistics
 * @route   GET /api/quickClash/dailyTasks/statistics
 * @access  Private
 */
const getTaskStatisticsController = asyncHandler(async (req, res) => {
  const userId = req.user._id

  try {
    const statistics = await getTaskStatistics({ userId })

    res.status(200).json({
      success: true,
      statistics,
    })
  } catch (error) {
    console.error('Error fetching task statistics:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch task statistics',
    })
  }
})

module.exports = {
  getDailyTasks,
  refreshDailyTasks,
  updateTaskProgressController,
  claimTaskRewardController,
  getTaskStatisticsController,
}
