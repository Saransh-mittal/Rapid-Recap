const Article = require('../model/articleSchema')
const {
  generateEmbedding,
  cosineSimilarity,
  generateSeedHash,
} = require('./embeddingService')

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  MIN_BODY_LENGTH: 150,
  SEMANTIC_SIMILARITY_THRESHOLD: 0.85,
  DEDUPE_LOOKBACK_DAYS: 90,
  DAILY_TARGET: 30,
  PAYWALLED_SOURCES: ['bloomberg.com', 'wsj.com', 'ft.com'], // Add as needed
  OPINION_KEYWORDS: ['opinion', 'editorial', 'commentary', 'op-ed'],
}

// ============================================================================
// STAGE 1: Normalize & Quick Filter
// ============================================================================

/**
 * Apply fast rule-based filters
 *
 * PERFORMANCE NOTE: These are cheap checks that reject bad seeds
 * before expensive LLM/embedding operations
 */
function quickFilter(seed) {
  const rejectionReasons = []

  // Check body length
  if (!seed.body || seed.body.trim().length < CONFIG.MIN_BODY_LENGTH) {
    rejectionReasons.push('Body too short')
  }

  // Check paywalled sources
  if (
    seed.url &&
    CONFIG.PAYWALLED_SOURCES.some(domain => seed.url.includes(domain))
  ) {
    rejectionReasons.push('Paywalled source')
  }

  // Check opinion content
  const lowerContent = (seed.title + ' ' + seed.summary).toLowerCase()
  if (CONFIG.OPINION_KEYWORDS.some(keyword => lowerContent.includes(keyword))) {
    rejectionReasons.push('Opinion/editorial content')
  }

  // Check for common rejection patterns
  const lowerTitle = (seed.title || '').toLowerCase()
  const rejectPatterns = [
    /\d+\s+best/i, // "10 Best...", "5 Best..."
    /top\s+\d+/i, // "Top 10..."
    /gift\s+guide/i, // Gift guides
    /review:/i, // Reviews
    /nyt\s+(connections|strands|wordle)/i, // Puzzle hints
    /\bhints?\b.*\banswers?\b/i, // Hints and answers
  ]

  if (rejectPatterns.some(pattern => pattern.test(lowerTitle))) {
    rejectionReasons.push('Likely listicle/review/puzzle content')
  }

  return {
    passed: rejectionReasons.length === 0,
    reasons: rejectionReasons,
  }
}

// ============================================================================
// STAGE 2: Exact Deduplication
// ============================================================================

/**
 * Check for exact duplicates using hash
 */
async function checkExactDuplicate(seedHash) {
  const existing = await Article.findOne({
    'forgeSeedData.seedHash': seedHash,
  })

  return {
    isDuplicate: !!existing,
    existingId: existing?._id,
  }
}

// ============================================================================
// STAGE 3: Semantic Deduplication
// ============================================================================

/**
 * Check for semantic duplicates using embeddings
 *
 * LEARNING NOTE: This is expensive (LLM API call) but crucial.
 * We only run it after quick filters pass.
 *
 * Uses MongoDB aggregation with vector similarity
 */
async function checkSemanticDuplicate(embedding) {
  try {
    // Get recent articles with embeddings (last 90 days)
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - CONFIG.DEDUPE_LOOKBACK_DAYS)

    const recentArticles = await Article.find({
      'forgeSeedData.seedEmbedding': { $exists: true, $ne: [] },
      'forgeSeedData.seedDate': { $gte: cutoffDate },
    }).select('forgeSeedData.seedEmbedding title')

    // Check similarity with each
    let maxSimilarity = 0
    let mostSimilarArticle = null

    for (const article of recentArticles) {
      if (!article.forgeSeedData?.seedEmbedding) continue

      const similarity = cosineSimilarity(
        embedding,
        article.forgeSeedData.seedEmbedding,
      )

      if (similarity > maxSimilarity) {
        maxSimilarity = similarity
        mostSimilarArticle = article
      }
    }

    return {
      isDuplicate: maxSimilarity > CONFIG.SEMANTIC_SIMILARITY_THRESHOLD,
      similarity: maxSimilarity,
      similarArticle: mostSimilarArticle,
    }
  } catch (error) {
    console.error('Semantic dedupe error:', error.message)
    return { isDuplicate: false, similarity: 0 }
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  quickFilter,
  checkExactDuplicate,
  checkSemanticDuplicate,
}
