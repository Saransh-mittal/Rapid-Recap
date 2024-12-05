const cache = require('memory-cache')
const CACHE_CONFIG = require('../../config/cacheConfig')

async function getOrSetCache(
  key,
  fetchData,
  duration = CACHE_CONFIG.durations.ARTICLE_LIST,
) {
  const cachedData = cache.get(key)
  if (cachedData) {
    return cachedData
  }

  const freshData = await fetchData()
  cache.put(key, freshData, duration)
  return freshData
}

module.exports = { getOrSetCache }
