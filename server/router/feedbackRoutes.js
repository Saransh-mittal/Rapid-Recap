const express = require('express')
const {
  submitFeedback,
  createStoryFeedback,
  getStoryFeedbackStats,
  getStoryFeedback,
} = require('../controllers/feedbackController')
const router = express.Router()
const { Authenticate } = require('../middleware/authenticate')

// Define a POST route for submitting feedback
router.post('/submit', submitFeedback)
router.post('/story', Authenticate, createStoryFeedback)
router.get('/story/:storyId', getStoryFeedback)
router.get('/story/stats', getStoryFeedbackStats)

module.exports = router
