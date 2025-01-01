// utils/article/articleAnalysis.js
const Article = require('../model/articleSchema')

/**
 * Extracts article ID from URL
 * @param {string} url - Article URL
 * @returns {string|null} Article ID or null if invalid URL
 */
const extractArticleId = url => {
  const matches = url.match(/\/article\/([a-f0-9]+)/)
  return matches ? matches[1] : null
}

/**
 * Analyze articles by week
 * @param {Array<Object>} articles - Array of article documents
 * @param {Set<string>} [filterIds] - Optional set of IDs to filter articles
 * @returns {Array} Week-wise statistics
 */
const analyzeArticlesByWeek = (articles, filterIds = null) => {
  try {
    const now = new Date()
    const weekStats = {}
    const msPerWeek = 7 * 24 * 60 * 60 * 1000

    articles.forEach(article => {
      // Skip if filterIds is provided and article is not in the set
      if (filterIds && !filterIds.has(article._id.toString())) {
        return
      }

      const createdAt = new Date(article.createdAt)
      const diffTime = now - createdAt
      const weekNumber = Math.floor(diffTime / msPerWeek)

      const weekLabel =
        weekNumber === 0
          ? 'Current Week'
          : `${weekNumber} ${weekNumber === 1 ? 'Week' : 'Weeks'} Ago`

      weekStats[weekLabel] = (weekStats[weekLabel] || 0) + 1
    })

    return Object.entries(weekStats).sort((a, b) => {
      if (a[0] === 'Current Week') return -1
      if (b[0] === 'Current Week') return 1
      return parseInt(a[0]) - parseInt(b[0])
    })
  } catch (error) {
    console.error('Error analyzing articles by week:', error)
    return []
  }
}

/**
 * Analyzes relationships between provided articles
 * @param {Object} params - Parameters object
 * @param {Array<string>} params.urls - Array of article URLs to analyze
 * @returns {Promise<Object>} Analysis results
 */
const analyzeRelatedArticles = async ({ urls }) => {
  try {
    // Extract article IDs from URLs
    const articleIds = urls
      .map(url => extractArticleId(url))
      .filter(id => id !== null)

    // Fetch articles with their related articles
    const articles = await Article.find({
      _id: { $in: articleIds },
    }).populate('relatedArticles')

    if (!articles || articles.length === 0) {
      throw new Error('No articles found')
    }

    // Create a map of article relationships
    const relationshipMap = new Map()
    const articleGroups = []
    const unrelatedArticles = []
    const validIds = new Set(articleIds)

    articles.forEach(article => {
      // Only include related articles that are in our provided set
      const relatedIds = article.relatedArticles
        .map(related => related._id.toString())
        .filter(id => validIds.has(id))
      relationshipMap.set(article._id.toString(), relatedIds)
    })

    // Function to find all related articles recursively
    const findRelatedGroup = (articleId, group = new Set()) => {
      group.add(articleId)
      const related = relationshipMap.get(articleId) || []

      related.forEach(relatedId => {
        if (!group.has(relatedId)) {
          findRelatedGroup(relatedId, group)
        }
      })

      return group
    }

    // Process each article
    const processed = new Set()
    articles.forEach(article => {
      const articleId = article._id.toString()

      if (!processed.has(articleId)) {
        const group = findRelatedGroup(articleId)

        if (group.size > 1) {
          articleGroups.push(Array.from(group))
        } else {
          unrelatedArticles.push(articleId)
        }

        group.forEach(id => processed.add(id))
      }
    })

    // Get all IDs from article groups
    const relatedIds = new Set(articleGroups.flat().map(id => id.toString()))

    // Prepare statistics
    const stats = {
      totalArticles: articles.length,
      groupedArticles: articleGroups.reduce(
        (sum, group) => sum + group.length,
        0,
      ),
      unrelatedArticles: unrelatedArticles.length,
      groups: articleGroups.length,
    }

    // Analyze distributions
    const weeklyDistribution = analyzeArticlesByWeek(articles)
    const relatedArticlesDistribution = analyzeArticlesByWeek(
      articles,
      relatedIds,
    )

    return {
      stats,
      articleGroups,
      unrelatedArticles,
      weeklyDistribution,
      relatedArticlesDistribution,
      success: true,
    }
  } catch (error) {
    console.error('Error analyzing related articles:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

module.exports = {
  analyzeRelatedArticles,
  extractArticleId,
}
