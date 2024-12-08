// src/tasks/refreshBotArticleCache.js
const cache = require('memory-cache')

const CACHE_CONFIG = require('../../config/cacheConfig')
const ArticleService = require('../../services/articleService')
const Article = require('../../model/articleSchema')

async function refreshBotArticleCache(articleId) {
  try {
    // Get article without related content
    await ArticleService.getArticleContent(articleId, false)

    // Get article with related content
    await ArticleService.getArticleContent(articleId, true)

    // Get related articles
    await ArticleService.getRelatedArticles(articleId)

    return true
  } catch (error) {
    console.error(`Error refreshing bot article cache for ${articleId}:`, error)
    return false
  }
}

async function refreshRecentBotArticlesCache() {
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(
    sevenDaysAgo.getDate() - CACHE_CONFIG.defaults.CACHE_DAYS,
  )

  try {
    const recentArticles = await Article.find({
      dateTime: { $gte: sevenDaysAgo.toISOString() },
    })
      .sort({ dateTime: -1 })
      .select('_id')

    for (const article of recentArticles) {
      await refreshBotArticleCache(article._id)
    }

    return true
  } catch (error) {
    console.error('Error refreshing recent bot articles cache:', error)
    return false
  }
}

module.exports = {
  refreshBotArticleCache,
  refreshRecentBotArticlesCache,
}
