const express = require('express')
const {
  registerForTournament,
  getCurrentTournament,
} = require('../controllers/tournamentController')

const { Authenticate } = require('../middleware/authenticate')

const router = express.Router()

router.post('/register', Authenticate, registerForTournament)
router.get('/current', getCurrentTournament)

module.exports = router
