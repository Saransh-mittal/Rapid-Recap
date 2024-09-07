const express = require('express')
const {
  registerForTournament,
  getCurrentTournament,
  addCurrentAffairsQuestion,
  getCurrentAffairsQuestions,
  updateCurrentAffairsQuestion,
  deleteCurrentAffairsQuestion,
  startQuiz,
  submitQuiz,
} = require('../controllers/tournamentController')

const { Authenticate, adminMiddleware } = require('../middleware/authenticate')

const router = express.Router()

router.post('/register', Authenticate, registerForTournament)
router.get('/current', getCurrentTournament)
router.post(
  '/questions/current-affairs',
  Authenticate,
  adminMiddleware,
  addCurrentAffairsQuestion,
)
router.get(
  '/questions/current-affairs',
  Authenticate,
  adminMiddleware,
  getCurrentAffairsQuestions,
)
router.put(
  'questions/current-affairs/:id',
  Authenticate,
  adminMiddleware,
  updateCurrentAffairsQuestion,
)
router.delete(
  '/questions/current-affairs/:id',
  Authenticate,
  adminMiddleware,
  deleteCurrentAffairsQuestion,
)
router.post('/start', Authenticate, startQuiz)
router.post('/submit', Authenticate, submitQuiz)

module.exports = router
