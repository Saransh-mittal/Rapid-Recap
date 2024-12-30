const Article = require('../model/articleSchema')
const QuizAttempt = require('../model/quizAttemptSchema')
const {
  getRecommendations,
  getArticlePageRecommendations,
  processRecommendationArticleElimination,
} = require('../services/recommendationService')

const asyncHandler = require('express-async-handler')
const {
  hindiConverter,
  breakArticleIntoParagraphs,
  processArticlesWithPrivileges,
} = require('../utils/article.utils')

const { formatDate } = require('../utils/miscellaneous.utils')
const cache = require('memory-cache')
const ArticleHighlight = require('../model/articleHighlightSchema')

// @desc    Get user recommendations
// @route   GET /api/recommendation
// @access  Protected
const userRecommendations = asyncHandler(async (req, res) => {
  const userId = req.user._id
  const page = parseInt(req.query.page) || 1
  const pageSize = parseInt(req.query.pageSize) || 18
  const { lang } = req.query

  // Include privileges in cache key if they exist
  const privilegeKey = req.privileges?.hasAnyPrivilege ? '_privileged' : ''
  const cacheKey = `user_recommendations_${userId}_${lang}_${page}_${pageSize}${privilegeKey}`
  const cachedRecommendations = cache.get(cacheKey)

  if (
    cachedRecommendations &&
    Array.isArray(cachedRecommendations) &&
    cachedRecommendations.length > 0
  ) {
    // Trigger elimination in background without awaiting
    processRecommendationArticleElimination(userId, {
      eliminationThreshold: 20,
      logElimination: false,
    }).catch(error => {
      console.error('Background recommendation elimination failed:', error)
    })
    return res.send(cachedRecommendations)
  }

  const recommendations = await getRecommendations(userId, page, pageSize)
  const articles = await Promise.all(
    recommendations.map(async recommendation => {
      return await Article.findById(recommendation._id)
    }),
  )

  // Process Hindi translations if needed
  if (lang === 'hi') {
    await Promise.all(
      articles.map(async article => {
        if (
          !article.hindiTitle ||
          !article.hindiMainText ||
          !article.hindiAuthor
        ) {
          const response = await hindiConverter(article._id)
          if (!article.hindiMainText) {
            article.hindiMainText = []
          }
          article.hindiTitle = response.hindiTitle

          for (let key in response.hindiMainText) {
            if (!response.hindiMainText[key]) continue
            article.hindiMainText.push(response.hindiMainText[key])
          }
          article.hindiAuthor = response.hindiAuthor
        }
      }),
    )
  }

  let processedArticles = await Promise.all(
    articles
      .filter(article => article.category !== 'onBoardingArticle')
      .map(async article => {
        const paragraphs = await breakArticleIntoParagraphs(article.mainText)
        const highlights = await ArticleHighlight.findOne({
          articleId: article._id,
          processingStatus: 'completed',
          language: lang ? lang : 'en',
        })

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
          dictionary: highlights?.dictionary || [],
          importantSentences: highlights?.importantSentences || [],
          articleDifficulty: article?.articleDifficulty || 0.5,
        }
      }),
  )

  // Process articles with privileges if available
  if (req.privileges) {
    processedArticles = await processArticlesWithPrivileges(
      processedArticles,
      req.privileges,
    )
  }

  // Cache the processed articles
  cache.put(cacheKey, processedArticles, 3600000) // 1 hour cache

  // Trigger background elimination
  processRecommendationArticleElimination(userId, {
    eliminationThreshold: 20,
    logElimination: false,
  }).catch(error => {
    console.error('Background recommendation elimination failed:', error)
  })

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
  const { lang } = req.query

  const cacheKey = `article_page_recommendations_${userId}_${lang}_${articleId}_${page}_${pageSize}`
  const cachedRecommendations = cache.get(cacheKey)

  if (cachedRecommendations) {
    return res.status(200).json(cachedRecommendations)
  }

  const articles = await getArticlePageRecommendations(
    userId,
    articleId,
    page,
    pageSize,
    lang,
  )

  // Cache the articles for 1 hour (3600000 milliseconds)
  cache.put(cacheKey, articles, 3600000)

  res.status(200).json(articles)
})

module.exports = {
  userRecommendations,
  articlePageRecommendations,
}
