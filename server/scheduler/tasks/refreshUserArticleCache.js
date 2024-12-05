// src/tasks/refreshUserArticleCache.js
const Article = require('../../model/articleSchema')
const CACHE_CONFIG = require('../../config/cacheConfig')
const {
  processDetailedArticle,
} = require('../../services/articleServicesForEndUsers/articleDetailService')
const {
  getOrGenerateHighlights,
} = require('../../services/articleServicesForEndUsers/articleHighlightService')
const cache = require('memory-cache')

async function refreshUserArticleCache(
  articleId,
  languages = CACHE_CONFIG.defaults.LANGUAGES,
) {
  try {
    for (const lang of languages) {
      const [article, highlights] = await Promise.all([
        Article.findById(articleId),
        getOrGenerateHighlights(articleId, lang, true),
      ])

      if (!article) continue

      const processedArticle = await processDetailedArticle(
        article,
        highlights,
        lang,
      )

      cache.put(
        CACHE_CONFIG.keys.userArticle(lang, articleId),
        processedArticle,
        CACHE_CONFIG.durations.USER_ARTICLE,
      )
    }
    return true
  } catch (error) {
    console.error(
      `Error refreshing user article cache for ${articleId}:`,
      error,
    )
    return false
  }
}

async function refreshRecentUserArticlesCache() {
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(
    sevenDaysAgo.getDate() - CACHE_CONFIG.defaults.CACHE_DAYS,
  )
  console.log('Refreshing user articles cache for the past 7 days...')
  try {
    const recentArticles = await Article.find({
      dateTime: { $gte: sevenDaysAgo.toISOString() },
    })
      .sort({ dateTime: -1 })
      .select('_id')

    for (const article of recentArticles) {
      await refreshUserArticleCache(article._id)
    }
    console.log('User articles cache refreshed.')
    return true
  } catch (error) {
    console.error('Error refreshing recent user articles cache:', error)
    return false
  }
}

module.exports = {
  refreshUserArticleCache,
  refreshRecentUserArticlesCache,
}
