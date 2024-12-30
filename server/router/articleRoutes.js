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
const { Authenticate } = require('../middleware/authenticate')
const checkPrivileges = require('../middleware/checkPrivileges')

router.route('/').get(checkPrivileges, allArticles)
router.route('/article/:id').get(getArticle)
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

module.exports = router
