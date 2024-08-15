const express = require('express')
const { streakBroken, sendMailsToUsers } = require('../controllers/mail')
const router = express.Router()

router.route('/streakBroken').get(streakBroken)
router.route('/sendMailsToUsers').get(sendMailsToUsers)

module.exports = router
