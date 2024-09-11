const express = require('express')
const {
  registerForTournament,
  addCurrentAffairsQuestion,
  updateCurrentAffairsQuestion,
  deleteCurrentAffairsQuestion,
  startQuiz,
  submitQuiz,
  getLatestTournament,
  getPreviousTournament,
  getCurrentTournamentLeaderboard,
  searchTournamentLeaderboard,
  getCurrentTournamentCurrentAffairsQuestions,
} = require('../controllers/tournamentController')

const { Authenticate, adminMiddleware } = require('../middleware/authenticate')

const router = express.Router()

router.get('/previous', getPreviousTournament)
router.get('/latest', getLatestTournament)
router.post('/register', Authenticate, registerForTournament)
router.get('/leaderboard', getCurrentTournamentLeaderboard)
router.get('/leaderboard/search', searchTournamentLeaderboard)
router.get(
  '/questions/current-affairs/current',
  Authenticate,
  adminMiddleware,
  getCurrentTournamentCurrentAffairsQuestions,
)
router.post(
  '/questions/current-affairs',
  Authenticate,
  adminMiddleware,
  addCurrentAffairsQuestion,
)
router.put(
  '/questions/current-affairs/:id',
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
router.post('/quiz/start', Authenticate, startQuiz)
router.post('/quiz/submit', Authenticate, submitQuiz)

module.exports = router
