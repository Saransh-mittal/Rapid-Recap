// routes/quickClashDailyTaskRoutes.js
const express = require('express')
const { Authenticate } = require('../middleware/authenticate')
const {
  getDailyTasks,
  refreshDailyTasks,
  updateTaskProgressController,
  claimTaskRewardController,
  getTaskStatisticsController,
} = require('../controllers/quickClashDailyTaskController')

const router = express.Router()

// All routes need authentication
router.use(Authenticate)

// Get daily tasks for the current user
router.get('/', getDailyTasks)

// Force refresh daily tasks
router.post('/refresh', refreshDailyTasks)

// Update progress for a specific task type
router.post('/:taskType/progress', updateTaskProgressController)

// Claim reward for a completed task
router.post('/:taskId/claim', claimTaskRewardController)

// Get task completion statistics
router.get('/statistics', getTaskStatisticsController)

module.exports = router
