// routes/abilityRoutes.js

const express = require('express')
const router = express.Router()
const { Authenticate } = require('../middleware/authenticate')
const {
  getActiveAbilities,
  getAvailableAbilitiesController,
  activateAbility,
  checkAbilities,
  checkAbility,
  claimAbility,
} = require('../controllers/abilityController')

router.route('/active').get(Authenticate, getActiveAbilities)
router.route('/available').get(Authenticate, getAvailableAbilitiesController)
router.route('/activate/:abilityId').post(Authenticate, activateAbility)
router.route('/check/:abilityName').get(Authenticate, checkAbility)
router.route('/check').get(Authenticate, checkAbilities)
router.route('/claim/:abilityId').post(Authenticate, claimAbility)

module.exports = router
