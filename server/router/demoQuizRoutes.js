// router/demoQuizRoutes.js - Updated routes with multilingual support

const express = require('express')
const {
  getDemoQuestion,
  submitDemoAnswer,
  getAllDemoQuestions,
} = require('../controllers/demoQuizController')

const router = express.Router()

// Get demo question for homepage (returns both Hindi and English)
router.get('/question', getDemoQuestion)

// Submit demo answer (for analytics with language tracking)
router.post('/answer', submitDemoAnswer)

// Get all demo questions (for admin/testing purposes)
router.get('/all-questions', getAllDemoQuestions)

module.exports = router
