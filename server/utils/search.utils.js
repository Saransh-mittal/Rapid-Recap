// Enhanced search utilities with enterprise helper functions
// File: utils/search.utils.js

const { generateEmbedding } = require('../services/legacy/embeddingService')
const cache = require('memory-cache')

const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // 1 second

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

// ===== CORE SEARCH FUNCTIONS =====

const generateSearchVector = async ({ searchQuery }) => {
  let retries = 0

  while (retries < MAX_RETRIES) {
    try {
      console.log(
        `🔄 Generating search vector (attempt ${retries + 1}/${MAX_RETRIES})`,
      )

      if (
        !searchQuery ||
        typeof searchQuery !== 'string' ||
        searchQuery.trim() === ''
      ) {
        throw new Error('Invalid search query provided')
      }

      const cleanQuery = searchQuery.trim().toLowerCase()

      const searchVector = await Promise.race([
        generateEmbedding(cleanQuery),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error('Embedding generation timeout')),
            30000,
          ),
        ),
      ])

      if (
        !searchVector ||
        !Array.isArray(searchVector) ||
        searchVector.length === 0
      ) {
        throw new Error('Invalid vector generated')
      }

      return searchVector
    } catch (error) {
      retries++
      console.error(
        `❌ Search vector generation attempt ${retries} failed:`,
        error.message,
      )

      if (retries === MAX_RETRIES) {
        console.error('💥 All search vector generation attempts failed')
        throw new Error(
          `Failed to generate search vector after ${MAX_RETRIES} attempts: ${error.message}`,
        )
      }

      await sleep(RETRY_DELAY * retries)
    }
  }
}

// ===== ENTERPRISE HELPER FUNCTIONS =====

// Advanced query normalization and analysis
const normalizeQuery = query => {
  return query
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .substring(0, 200) // Security: limit query length
}

const analyzeQueryIntent = query => {
  const timeKeywords = [
    'latest',
    'recent',
    'today',
    'yesterday',
    'breaking',
    'new',
  ]
  const topicKeywords = [
    'politics',
    'business',
    'technology',
    'sports',
    'health',
    'entertainment',
  ]
  const locationKeywords = [
    'india',
    'delhi',
    'mumbai',
    'bangalore',
    'international',
    'global',
  ]

  const intent = {
    type: 'general',
    entities: [],
    timePreference: 'any',
    topicHints: [],
    locationHints: [],
  }

  // Detect time-sensitive queries
  if (timeKeywords.some(keyword => query.includes(keyword))) {
    intent.type = 'breaking'
    intent.timePreference = 'recent'
  }

  // Extract topic hints
  intent.topicHints = topicKeywords.filter(topic => query.includes(topic))

  // Extract location hints
  intent.locationHints = locationKeywords.filter(loc => query.includes(loc))

  // Extract potential entities (simple approach)
  const words = query.split(' ').filter(word => word.length > 3)
  intent.entities = words.slice(0, 3) // Top 3 meaningful words

  return intent
}

// Enhanced text search for fallback
const buildTextSearchQuery = searchQuery => {
  // Split query into individual terms
  const terms = searchQuery
    .toLowerCase()
    .split(/\s+/)
    .filter(term => term.length > 2)

  if (terms.length === 0) {
    return {
      $or: [
        { title: { $regex: searchQuery, $options: 'i' } },
        { mainText: { $regex: searchQuery, $options: 'i' } },
      ],
    }
  }

  // Create search conditions for each term
  const termConditions = terms.map(term => ({
    $or: [
      { title: { $regex: term, $options: 'i' } },
      { mainText: { $regex: term, $options: 'i' } },
      { keywords: { $in: [new RegExp(term, 'i')] } },
      { description: { $regex: term, $options: 'i' } },
    ],
  }))

  // Require at least one term to match
  return {
    $or: [
      // Exact phrase match (higher priority)
      {
        $or: [
          { title: { $regex: searchQuery, $options: 'i' } },
          { mainText: { $regex: searchQuery, $options: 'i' } },
        ],
      },
      // Individual terms match
      { $and: termConditions },
    ],
  }
}

// Analytics tracking for search optimization
const trackSearchAnalytics = async ({
  query,
  resultsCount,
  duration,
  userId,
  category,
}) => {
  try {
    // Store search analytics in cache for batch processing
    const analyticsData = {
      query: query.substring(0, 100), // Limit query length for storage
      resultsCount,
      duration,
      userId,
      category,
      timestamp: new Date().toISOString(),
    }

    // Add to analytics queue (implement your preferred analytics service)
    const analyticsQueue = cache.get('search_analytics_queue') || []
    analyticsQueue.push(analyticsData)

    // Keep only last 1000 entries to prevent memory issues
    if (analyticsQueue.length > 1000) {
      analyticsQueue.splice(0, analyticsQueue.length - 1000)
    }

    cache.put('search_analytics_queue', analyticsQueue, 60 * 60 * 1000) // 1 hour
  } catch (error) {
    console.error('Analytics tracking failed:', error.message)
  }
}

// Helper functions for suggestions and trending
const getTrendingSearchQueries = async () => {
  // Get from cache or return defaults
  const trending = cache.get('trending_searches') || [
    'latest news',
    'technology',
    'politics',
    'business',
    'sports',
    'health',
  ]
  return trending.slice(0, 5)
}

const generateSearchSuggestions = async query => {
  // Generate smart suggestions based on failed query
  const baseSuggestions = [
    `${query} news`,
    `latest ${query}`,
    `${query} updates`,
    `${query} india`,
    `breaking ${query}`,
  ]

  // Add trending topics as suggestions
  const trending = await getTrendingSearchQueries()
  const suggestions = [...baseSuggestions.slice(0, 3), ...trending.slice(0, 2)]

  return [...new Set(suggestions)] // Remove duplicates
}

// Validation functions
const validateSearchParams = ({ query, page, limit, category }) => {
  const errors = []

  if (!query || typeof query !== 'string' || query.trim() === '') {
    errors.push('Search query is required and must be a non-empty string')
  }

  if (query && query.length > 500) {
    errors.push('Search query is too long (max 500 characters)')
  }

  const pageNum = parseInt(page)
  if (isNaN(pageNum) || pageNum < 1) {
    errors.push('Page must be a positive integer')
  }

  const limitNum = parseInt(limit)
  if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
    errors.push('Limit must be between 1 and 100')
  }

  if (category && typeof category !== 'string') {
    errors.push('Category must be a string')
  }

  return {
    isValid: errors.length === 0,
    errors,
    cleanQuery: query?.trim(),
    pageNumber: Math.max(1, parseInt(page) || 1),
    limitNumber: Math.min(100, Math.max(1, parseInt(limit) || 10)),
  }
}

// Check if MongoDB Atlas Search is available
const checkAtlasSearchAvailability = async ArticleModel => {
  try {
    // Try a simple Atlas Search query
    await ArticleModel.aggregate([
      {
        $search: {
          index: 'default',
          text: {
            query: 'test',
            path: 'title',
          },
        },
      },
      { $limit: 1 },
    ])
    return true
  } catch (error) {
    console.log('📝 Atlas Search not available, using regex search')
    return false
  }
}

// Enhanced Atlas text search
const performAtlasTextSearch = async (
  ArticleModel,
  { searchQuery, pageNumber, limitNumber, category },
) => {
  const matchStage = {
    category: { $ne: 'onBoardingArticle' },
    ...(category && { category }),
  }

  const pipeline = [
    {
      $search: {
        index: 'default',
        compound: {
          should: [
            {
              text: {
                query: searchQuery,
                path: 'title',
                score: { boost: { value: 3 } },
              },
            },
            {
              text: {
                query: searchQuery,
                path: 'mainText',
                score: { boost: { value: 2 } },
              },
            },
            {
              text: {
                query: searchQuery,
                path: 'keywords',
                score: { boost: { value: 2.5 } },
              },
            },
            {
              text: {
                query: searchQuery,
                path: 'description',
                score: { boost: { value: 1.5 } },
              },
            },
          ],
        },
      },
    },
    { $match: matchStage },
    {
      $addFields: {
        searchScore: { $meta: 'searchScore' },
      },
    },
    { $sort: { searchScore: -1, dateTime: -1 } },
  ]

  const [totalResults, articles] = await Promise.all([
    ArticleModel.aggregate([...pipeline, { $count: 'total' }]),
    ArticleModel.aggregate([
      ...pipeline,
      { $skip: (pageNumber - 1) * limitNumber },
      { $limit: limitNumber },
      {
        $project: {
          url: 1,
          dateTime: 1,
          author: 1,
          hindiAuthor: 1,
          title: 1,
          hindiTitle: 1,
          mainText: 1,
          hindiMainText: 1,
          imgURL: 1,
          quiz: 1,
          userQuizStatus: 1,
          category: 1,
          relatedArticles: 1,
          avgReadTime: 1,
          quizAttemptCnt: 1,
          _id: 1,
          searchScore: 1,
        },
      },
    ]),
  ])

  return { totalResults, articles }
}

module.exports = {
  // Core functions
  generateSearchVector,

  // Enterprise helpers
  normalizeQuery,
  analyzeQueryIntent,
  buildTextSearchQuery,
  trackSearchAnalytics,
  getTrendingSearchQueries,
  generateSearchSuggestions,
  validateSearchParams,
  checkAtlasSearchAvailability,
  performAtlasTextSearch,
}
