// utils/cacheInvalidation.utils.js
const cache = require('memory-cache')

const updateRecommendationCache = (userId, articleIdsToRemove) => {
  const cacheKeys = cache.keys()
  const relevantCacheKeys = cacheKeys.filter(key =>
    key.startsWith(`user_recommendations_${userId}_`),
  )

  let updatedCacheCount = 0

  relevantCacheKeys.forEach(key => {
    const cachedData = cache.get(key)

    if (Array.isArray(cachedData)) {
      // Filter out articles with IDs to remove
      const filteredData = cachedData.filter(
        article => !articleIdsToRemove.includes(article._id.toString()),
      )

      // If the filtered data is different from original, update cache
      if (filteredData.length !== cachedData.length) {
        cache.put(key, filteredData, 600000) // Reuse original cache duration
        updatedCacheCount++
      }
    }
  })

  return {
    totalKeysUpdated: updatedCacheCount,
    removedArticleCount: articleIdsToRemove.length,
  }
}

module.exports = {
  updateRecommendationCache,
}
