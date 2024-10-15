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
  getQuestions,
  editQuestion,
  getTournamentParticipants,
  createTestTournament,
  getTestTournament,
  updateTestTournament,
  getLatestTestTournament,
} = require('../controllers/tournamentController')
const {
  getStoryFeedback,
  getStoryFeedbackStats,
  getQuizFeedback,
  getQuizFeedbackStats,
  getTournamentFeedback,
  getTournamentFeedbackStats,
} = require('../controllers/feedbackController')
const router = express.Router()

router.post(
  '/tournament/test',
  Authenticate,
  adminMiddleware,
  createTestTournament,
)
router.get('/tournament/test', Authenticate, adminMiddleware, getTestTournament)
router.put(
  '/tournament/test/:id',
  Authenticate,
  adminMiddleware,
  updateTestTournament,
)
router.get(
  '/tournament/test/latest',
  Authenticate,
  adminMiddleware,
  getLatestTestTournament,
)
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

router.get(
  '/feedback/singleStory/:storyId',
  Authenticate,
  adminMiddleware,
  getStoryFeedback,
)
router.get(
  '/feedback/story/stats',
  Authenticate,
  adminMiddleware,
  getStoryFeedbackStats,
)

router.get(
  'feedback/quiz/:quizId',
  Authenticate,
  adminMiddleware,
  getQuizFeedback,
)
router.get(
  '/feedback/quiz/stats',
  Authenticate,
  adminMiddleware,
  getQuizFeedbackStats,
)

router.get(
  '/feedback/tournamentQuiz/:tournamentId',
  Authenticate,
  adminMiddleware,
  getTournamentFeedback,
)
router.get(
  '/feedback/tournamentQuiz/stats',
  Authenticate,
  adminMiddleware,
  getTournamentFeedbackStats,
)
router.get('/tournament/questions', Authenticate, adminMiddleware, getQuestions)
router.put(
  '/tournament/questions/:id',
  Authenticate,
  adminMiddleware,
  editQuestion,
)
router.get(
  '/tournament/participants',
  Authenticate,
  adminMiddleware,
  getTournamentParticipants,
)

module.exports = router
