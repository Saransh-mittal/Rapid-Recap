const express = require('express')
const {
  submitFeedback,
  createStoryFeedback,
  createQuizFeedback,
  createTournamentFeedback,
} = require('../controllers/feedbackController')
const router = express.Router()
const { Authenticate } = require('../middleware/authenticate')

// Define a POST route for submitting feedback
router.post('/submit', submitFeedback)
router.post('/story', Authenticate, createStoryFeedback)
router.post('/quiz', Authenticate, createQuizFeedback)
router.post('/tournament', Authenticate, createTournamentFeedback)

module.exports = router
