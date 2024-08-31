const Article = require('../model/articleSchema')
const QuizAttempt = require('../model/quizAttemptSchema')
const {
  getRecommendations,
  getArticlePageRecommendations,
} = require('../services/recommendationService')

const asyncHandler = require('express-async-handler')
const { breakArticleIntoParagraphs } = require('../utils/article.utils')
const { formatDate } = require('../utils/miscellaneous.utils')
const cache = require('memory-cache')

// @desc    Get user recommendations
// @route   GET /api/recommendation
// @access  Protected
const userRecommendations = asyncHandler(async (req, res) => {
  const userId = req.user._id
  const page = parseInt(req.query.page) || 1
  const pageSize = parseInt(req.query.pageSize) || 18

  const cacheKey = `user_recommendations_${userId}_${page}_${pageSize}`
  const cachedRecommendations = cache.get(cacheKey)

  if (cachedRecommendations) {
    return res.send(cachedRecommendations)
  }

  const recommendations = await getRecommendations(userId, page, pageSize)
  const articles = await Promise.all(
    recommendations.map(async recommendation => {
      return await Article.findById(recommendation._id)
    }),
  )

  const processedArticles = await Promise.all(
    articles.map(async article => {
      const paragraphs = await breakArticleIntoParagraphs(article.mainText)
      return {
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
    }),
  )

  // Cache the processed articles for 1 hour (3600000 milliseconds)
  cache.put(cacheKey, processedArticles, 3600000)

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

  const cacheKey = `article_page_recommendations_${userId}_${articleId}_${page}_${pageSize}`
  const cachedRecommendations = cache.get(cacheKey)

  if (cachedRecommendations) {
    return res.status(200).json(cachedRecommendations)
  }

  const articles = await getArticlePageRecommendations(
    userId,
    articleId,
    page,
    pageSize,
  )

  // Cache the articles for 1 hour (3600000 milliseconds)
  cache.put(cacheKey, articles, 3600000)

  res.status(200).json(articles)
})

module.exports = {
  userRecommendations,
  articlePageRecommendations,
}
