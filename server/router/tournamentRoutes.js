const express = require('express')
const {
  registerForTournament,
  addCurrentAffairsQuestion,
  getCurrentAffairsQuestions,
  updateCurrentAffairsQuestion,
  deleteCurrentAffairsQuestion,
  startQuiz,
  submitQuiz,
  getLatestTournament,
  getPreviousTournament,
  getCurrentTournamentLeaderboard,
} = require('../controllers/tournamentController')

const { Authenticate, adminMiddleware } = require('../middleware/authenticate')

const router = express.Router()

router.get('/previous', getPreviousTournament)
router.get('/latest', getLatestTournament)
router.post('/register', Authenticate, registerForTournament)
router.get('/leaderboard', getCurrentTournamentLeaderboard)
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
