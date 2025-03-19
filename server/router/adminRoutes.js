const express = require('express')
const { Authenticate, adminMiddleware } = require('../middleware/authenticate')
const {
  getQuizAttemptsByUsers,
  getUsersWithLastLoginAfter,
  getTimeSpentByUsers,
  getNotificationStatus,
  getNewUsers,
} = require('../controllers/stats')
const {
  updateArticle,
  adminSearchArticles,
  getAdminArticleDetails,
  addAdminArticleDetails,
  deleteAdminArticleDetails,
  addOnBoardingArticle,
  getOnBoardingArticles,
  // getOnBoardingArticle,
  updateOnBoardingArticle,
  deleteOnBoardingArticle,
} = require('../controllers/article')
const {
  sendCurrentBotReport,
  sendCacheAnalysisReport,
} = require('../controllers/mail')

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
const {
  scheduleMaintenanceWindow,
  startMaintenanceWindow,
  endMaintenanceWindow,
  cancelMaintenanceWindow,
  getMaintenanceWindows,
} = require('../controllers/maintenanceController')
const { createAnnouncement } = require('../controllers/notification')
const {
  getQuickClashStats,
  getQuickClashUserActivity,
} = require('../controllers/quickClashAnalyticsController')
const {
  getQuickClashBots,
  simulateInterBotQuickClash,
  simulateMultipleInterBotQuickClashes,
  getInterBotResults,
} = require('../controllers/quickClashAdminController')
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
router.post(
  '/onboarding-article',
  Authenticate,
  adminMiddleware,
  addOnBoardingArticle,
)

router.get(
  '/onboarding-articles',
  Authenticate,
  adminMiddleware,
  getOnBoardingArticles,
)

// router.get(
//   '/onboarding-article/:id',
//   Authenticate,
//   adminMiddleware,
//   getOnBoardingArticle,
// )

router.put(
  '/onboarding-article/:id',
  Authenticate,
  adminMiddleware,
  updateOnBoardingArticle,
)

router.delete(
  '/onboarding-article/:id',
  Authenticate,
  adminMiddleware,
  deleteOnBoardingArticle,
)
router.get('/new-users', Authenticate, adminMiddleware, getNewUsers)
router.get(
  '/bot-analytics/report',
  Authenticate,
  adminMiddleware,
  sendCurrentBotReport,
)
router.get(
  '/cache-analysis/report',
  Authenticate,
  adminMiddleware,
  sendCacheAnalysisReport,
)

// Maintenance routes
router.post(
  '/maintenance',
  Authenticate,
  adminMiddleware,
  scheduleMaintenanceWindow,
)
router.post(
  '/maintenance/:maintenanceId/start',
  Authenticate,
  adminMiddleware,
  startMaintenanceWindow,
)
router.post(
  '/maintenance/:maintenanceId/end',
  Authenticate,
  adminMiddleware,
  endMaintenanceWindow,
)
router.post(
  '/maintenance/:maintenanceId/cancel',
  Authenticate,
  adminMiddleware,
  cancelMaintenanceWindow,
)
router.get('/maintenance', Authenticate, adminMiddleware, getMaintenanceWindows)

router.post('/announcement', Authenticate, adminMiddleware, createAnnouncement)

router.get(
  '/quick-clash/stats',
  Authenticate,
  adminMiddleware,
  getQuickClashStats,
)
router.get(
  '/quick-clash/user-activity',
  Authenticate,
  adminMiddleware,
  getQuickClashUserActivity,
)

router.get('/quickclash/bots', getQuickClashBots)

// Simulation routes
router.post('/quickclash/simulate', simulateInterBotQuickClash)
router.post(
  '/quickclash/simulate-multiple',
  simulateMultipleInterBotQuickClashes,
)

// Results routes
router.get('/quickclash/results', getInterBotResults)
module.exports = router
