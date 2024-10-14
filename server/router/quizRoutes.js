const express = require('express')
const router = express.Router()
const {
  saveAttempt,
  getPercentile,
  givenQuiz,
  getQuizSummary,
  getQuiz,
  startQuiz,
} = require('../controllers/quiz')
const { Authenticate } = require('../middleware/authenticate')

router.route('/attempt').post(Authenticate, saveAttempt)
router.route('/getQuiz/:articleId/:lang').get(Authenticate, getQuiz)
router.route('/start/:sessionId').post(Authenticate, startQuiz)

router.route('/given/:articleId/:userId').get(Authenticate, givenQuiz)
router.route('/summary/:articleId').get(Authenticate, getQuizSummary)
router.route('/:articleId/:userId').get(Authenticate, getPercentile)

module.exports = router
