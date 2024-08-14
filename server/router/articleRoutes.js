const express = require('express')
const router = express.Router()
const {
  allArticles,
  getArticle,
  getQuiz,
  startQuiz,
  getArticleQuizStatus,
  getTopRankers,
  hindiTranslation,
  getHindiQuiz,
  getWorldNews,
  extractNews,
  testNewsApi,
  getQuizTitan,
  getArticleIds,
  getAvgRQMOnArticle,
  searchArticles,
} = require('../controllers/article')
const { Authenticate } = require('../middleware/authenticate')

router.route('/').get(allArticles)
router.route('/article/:id').get(getArticle)
router.route('/quizTitan/:id').get(getQuizTitan)
router.route('/genQuiz/:articleId').put(Authenticate, getQuiz)
router.route('/startQuiz/:articleId').get(Authenticate, startQuiz)
router.route('/quizStatus/:articleId').get(Authenticate, getArticleQuizStatus)
router.route('/topRankers').get(getTopRankers)
router.route('/hindiTranslation/:articleId').get(hindiTranslation)
router.route('/genHindiQuiz/:articleId').put(Authenticate, getHindiQuiz)
router.route('/worldNews').get(getWorldNews)
router.route('/extractNews').get(extractNews)
router.route('/testNewsApi').get(testNewsApi)
router.route('/getArticleIds').get(getArticleIds)
router.route('/getAvgRQMOnArticle').get(getAvgRQMOnArticle)
router.route('/search').get(searchArticles)

module.exports = router
