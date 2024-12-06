// src/tasks/refreshArticlesListCache.js
const {
  processArticles,
} = require('../../services/articleServicesForEndUsers/articleProcessingService')
const {
  getOrSetCache,
} = require('../../services/articleServicesForEndUsers/articleCacheService')
const {
  queryArticles,
} = require('../../services/articleServicesForEndUsers/articleQueryService')
const CACHE_CONFIG = require('../../config/cacheConfig')

async function refreshArticlesListCache() {
  const categories = CACHE_CONFIG.defaults.CATEGORIES
  const languages = CACHE_CONFIG.defaults.LANGUAGES
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(
    sevenDaysAgo.getDate() - CACHE_CONFIG.defaults.CACHE_DAYS,
  )
  try {
    for (const category of categories) {
      for (const lang of languages) {
        for (let page = 1; page <= CACHE_CONFIG.defaults.MAX_PAGES; page++) {
          const cacheKey = CACHE_CONFIG.keys.articlesList(
            category,
            lang,
            page,
            CACHE_CONFIG.defaults.PAGE_SIZE,
          )

          await getOrSetCache(
            cacheKey,
            async () => {
              const articles = await queryArticles({
                category,
                page,
                pageSize: CACHE_CONFIG.defaults.PAGE_SIZE,
                dateFilter: sevenDaysAgo,
              })
              return processArticles(articles, lang)
            },
            CACHE_CONFIG.durations.ARTICLE_LIST,
          )
        }
      }
    }
    return true
  } catch (error) {
    console.error('Error refreshing articles list cache:', error)
    return false
  }
}

module.exports = refreshArticlesListCache
