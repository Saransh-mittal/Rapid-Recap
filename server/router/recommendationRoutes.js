const express = require('express')
const router = express.Router()

const {
  userRecommendations,
  articlePageRecommendations,
} = require('../controllers/recommendation')
const { Authenticate } = require('../middleware/authenticate')
const checkPrivileges = require('../middleware/checkPrivileges')

// router.route("/").get(Authenticate, userRecommendations);
router.route('/').get(Authenticate, checkPrivileges, userRecommendations)
router
  .route('/articlePageRecommendations/:articleId')
  .get(Authenticate, articlePageRecommendations)

module.exports = router
