const cache = require('memory-cache')

// Cache durations
const VECTOR_CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours
const SEARCH_RESULTS_CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

const generateCacheKey = ({ query, page, limit, category }) => {
  return `search:${query}:${page}:${limit}:${category || 'all'}`
}

const generateVectorCacheKey = query => {
  return `vector:${query}`
}

const getSearchResultsFromCache = ({ query, page, limit, category }) => {
  const cacheKey = generateCacheKey({ query, page, limit, category })
  return cache.get(cacheKey)
}

const cacheSearchResults = ({ query, page, limit, category, results }) => {
  const cacheKey = generateCacheKey({ query, page, limit, category })
  cache.put(cacheKey, results, SEARCH_RESULTS_CACHE_DURATION)
}

const getVectorFromCache = query => {
  const cacheKey = generateVectorCacheKey(query)
  return cache.get(cacheKey)
}

const cacheVector = (query, vector) => {
  const cacheKey = generateVectorCacheKey(query)
  cache.put(cacheKey, vector, VECTOR_CACHE_DURATION)
}

const invalidateSearchCache = () => {
  const keys = cache.keys()
  keys.forEach(key => {
    if (key.startsWith('search:')) {
      cache.del(key)
    }
  })
}

module.exports = {
  getSearchResultsFromCache,
  cacheSearchResults,
  getVectorFromCache,
  cacheVector,
  invalidateSearchCache,
}
