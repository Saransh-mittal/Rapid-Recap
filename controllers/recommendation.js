const Article = require('../model/articleSchema')
const QuizAttempt = require('../model/quizAttemptSchema')
const {
  getRecommendations,
  getArticlePageRecommendations,
} = require('../services/recommendationService')

const asyncHandler = require('express-async-handler')
const { breakArticleIntoParagraphs } = require('../utils/article.utils')
const { formatDate } = require('../utils/miscellaneous.utils')

// @desc    Get user recommendations
// @route   GET /api/recommendation
// @access  Protected
const userRecommendations = asyncHandler(async (req, res) => {
  const userId = req.user._id

  const page = parseInt(req.query.page) || 1
  const pageSize = parseInt(req.query.pageSize) || 18

  const recommendations = await getRecommendations(userId, page, pageSize)
  const articles = await Promise.all(
    recommendations.map(async recommendation => {
      return await Article.findById(recommendation._id)
    }),
  )

  const processedArticles = []
  for (let article of articles) {
    const paragraphs = await breakArticleIntoParagraphs(article.mainText)
    const newArticle = {
      category: article.category,
      title: article.title,
      quizAttemptCnt: article.quizAttemptCnt,
      mainText: paragraphs,
      author: article.author,
      imgURL: Array.isArray(article.imgURL) ? article.imgURL[0] : '',
      hindiTitle: article?.hindiTitle,
      hindiMainText: article?.hindiMainText,
      hindiAuthor: article?.hindiAuthor,
      avgReadTime: article?.avgReadTime,
      date: formatDate(article.dateTime),
      dateTime: article.dateTime,
      _id: article._id,
    }
    processedArticles.push(newArticle)
  }
  res.send(processedArticles)
})

// @desc    Get article page recommendations
// @route   GET /api/recommendation/articlePageRecommendations/:articleId
// @access  Protected
const articlePageRecommendations = asyncHandler(async (req, res) => {
  const userId = req.user._id
  const { articleId } = req.params
  const page = parseInt(req.query.page) || 1
  const pageSize = parseInt(req.query.pageSize) || 18

  const articles = await getArticlePageRecommendations(
    userId,
    articleId,
    page,
    pageSize,
  )

  res.status(200).json(articles)
})

module.exports = {
  userRecommendations,
  articlePageRecommendations,
}
