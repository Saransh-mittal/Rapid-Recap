const express = require('express')
const router = express.Router()

const { userRecommendations } = require('../controllers/recommendation')
const { Authenticate } = require('../middleware/authenticate')

// router.route("/").get(Authenticate, userRecommendations);
router.route('/').get(Authenticate, userRecommendations)

module.exports = router
