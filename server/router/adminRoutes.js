const express = require('express')
const { Authenticate, adminMiddleware } = require('../middleware/authenticate')
const {
  getQuizAttemptsByUsers,
  getUsersWithLastLoginAfter,
  getTimeSpentByUsers,
  getNotificationStatus,
} = require('../controllers/stats')
const {
  updateArticle,
  adminSearchArticles,
  getAdminArticleDetails,
  addAdminArticleDetails,
  deleteAdminArticleDetails,
} = require('../controllers/article')

const {
  getAllTournaments,
  updateMaintenanceStatus,
} = require('../controllers/tournamentController')
const router = express.Router()

router.get('/verify-admin', Authenticate, adminMiddleware, (req, res) => {
  res.json({ isAdmin: true })
})
router.get('/tournament/all', Authenticate, adminMiddleware, getAllTournaments)
router.put(
  '/tournament/:id/maintenance',
  Authenticate,
  adminMiddleware,
  updateMaintenanceStatus,
)
router.get(
  '/quiz-attempts',
  Authenticate,
  adminMiddleware,
  getQuizAttemptsByUsers,
)
router.get(
  '/last-login',
  Authenticate,
  adminMiddleware,
  getUsersWithLastLoginAfter,
)
router.get('/time-spent', Authenticate, adminMiddleware, getTimeSpentByUsers)
router.get(
  '/notification-status',
  Authenticate,
  adminMiddleware,
  getNotificationStatus,
)
router.put(`/articles/:id`, Authenticate, adminMiddleware, updateArticle)
router.get(
  '/articles/search',
  Authenticate,
  adminMiddleware,
  adminSearchArticles,
)
router.get(
  '/articles/:articleId',
  Authenticate,
  adminMiddleware,
  getAdminArticleDetails,
)
router.post('/articles', Authenticate, adminMiddleware, addAdminArticleDetails)
router.delete(
  '/articles/:id',
  Authenticate,
  adminMiddleware,
  deleteAdminArticleDetails,
)

module.exports = router
