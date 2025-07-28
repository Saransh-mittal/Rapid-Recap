const express = require('express')
const router = express.Router()
const {
  allArticles,
  getArticle,
  getQuiz,
  startQuiz,
  getArticleQuizStatus,
  // getTopRankers,
  hindiTranslation,
  getHindiQuiz,
  getWorldNews,
  extractNews,
  testNewsApi,
  getRandomOnBoardingArticle,
  getArticleIds,
  getAvgRQMOnArticle,
  searchArticles,
  getRelatedArticles,
  createStory,
  getStory,
  getBotRelatedArticles,
} = require('../controllers/article')
const {
  getInlineQuizWithStats,
  submitQuizAnswer,
  generateInlineQuizFallback,
  getUserQuizHistory,
} = require('../controllers/inlineQuizController')
const { Authenticate } = require('../middleware/authenticate')
const checkPrivileges = require('../middleware/checkPrivileges')
const { CheckLoggedInOrNot } = require('../middleware/checkLoggedInOrNot')

router.route('/').get(checkPrivileges, allArticles)
router.route('/article/:id').get(checkPrivileges, getArticle)
router.route('/genQuiz/:articleId').put(Authenticate, getQuiz)
router.route('/startQuiz/:articleId').get(Authenticate, startQuiz)
router.route('/quizStatus/:articleId').get(Authenticate, getArticleQuizStatus)
router.route('/hindiTranslation/:articleId').get(hindiTranslation)
router.route('/genHindiQuiz/:articleId').put(Authenticate, getHindiQuiz)
router.route('/worldNews').get(getWorldNews)
router.route('/extractNews').get(extractNews)
router.route('/testNewsApi').get(testNewsApi)
router.route('/getArticleIds').get(getArticleIds)
router.route('/getAvgRQMOnArticle').get(getAvgRQMOnArticle)
router.route('/search').get(searchArticles)
router.route('/related/:articleId').get(Authenticate, getRelatedArticles)
router.route('/story').post(Authenticate, createStory)
router.route('/story/:id').get(Authenticate, getStory)
router.route('/onboarding').get(Authenticate, getRandomOnBoardingArticle)
router.route('/bot-related/:articleId').get(getBotRelatedArticles)

// Inline Quiz Routes
router.route('/inline-quiz/:articleId').get(getInlineQuizWithStats)
router
  .route('/inline-quiz/:articleId/answer')
  .post(CheckLoggedInOrNot, submitQuizAnswer)
router
  .route('/inline-quiz/:articleId/history')
  .get(Authenticate, getUserQuizHistory)
router
  .route('/inline-quiz/generate/:articleId')
  .post(Authenticate, generateInlineQuizFallback)

module.exports = router
