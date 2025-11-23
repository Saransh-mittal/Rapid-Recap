const Article = require('../model/articleSchema')
const ForgeArticle = require('../model/quickClashSchemas/forgeArticleSchema')
const {
  generateEmbedding,
  cosineSimilarity,
  generateSeedHash,
} = require('./embeddingService')
const { classifyContent, rewriteToForgeFormat } = require('./forgeAgents')

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
// MAIN PIPELINE
// ============================================================================

/**
 * Process a single seed through the full pipeline
 *
 * ARCHITECTURE: Multi-stage pipeline with early exits
 * Each stage can reject the seed, saving downstream costs
 */
async function processSeed(seedArticle) {
  const startTime = Date.now()
  let currentStage = 'init'

  try {
    console.log(`\n🔄 Processing seed: ${seedArticle.title}`)

    // ========================================================================
    // STAGE 1: Quick Filters
    // ========================================================================
    currentStage = 'quick_filter'
    console.log('  Stage 1: Quick filter...')

    const quickFilterResult = quickFilter({
      title: seedArticle.title,
      url: seedArticle.url,
      body: seedArticle.mainText,
      summary: seedArticle.description,
    })

    if (!quickFilterResult.passed) {
      await Article.findByIdAndUpdate(seedArticle._id, {
        forgeStatus: 'rejected',
        'forgeSeedData.rejectionReason': quickFilterResult.reasons.join(', '),
        'forgeSeedData.processedAt': new Date(),
      })
      console.log(`  ❌ Rejected: ${quickFilterResult.reasons.join(', ')}`)
      return {
        success: false,
        stage: currentStage,
        reason: quickFilterResult.reasons[0],
      }
    }

    console.log('  ✅ Quick filter passed')

    // ========================================================================
    // STAGE 2: Exact Dedupe
    // ========================================================================
    currentStage = 'exact_dedupe'
    console.log('  Stage 2: Exact dedupe...')

    const seedHash = generateSeedHash(
      seedArticle.title,
      seedArticle.author || 'unknown',
      seedArticle.dateTime,
    )

    const exactDupeCheck = await checkExactDuplicate(seedHash)

    if (exactDupeCheck.isDuplicate) {
      await Article.findByIdAndUpdate(seedArticle._id, {
        forgeStatus: 'rejected',
        'forgeSeedData.seedHash': seedHash,
        'forgeSeedData.rejectionReason': 'Exact duplicate',
        'forgeSeedData.processedAt': new Date(),
      })
      console.log('  ❌ Rejected: Exact duplicate')
      return { success: false, stage: currentStage, reason: 'Exact duplicate' }
    }

    console.log('  ✅ No exact duplicate')

    // ========================================================================
    // STAGE 3: Generate Embedding
    // ========================================================================
    currentStage = 'embedding'
    console.log('  Stage 3: Generating embedding...')

    const embeddingText = `${seedArticle.title} ${
      seedArticle.description || ''
    } ${seedArticle.mainText.substring(0, 1000)}`
    const embedding = await generateEmbedding(embeddingText)

    console.log('  ✅ Embedding generated')

    // ========================================================================
    // STAGE 4: Semantic Dedupe
    // ========================================================================
    currentStage = 'semantic_dedupe'
    console.log('  Stage 4: Semantic dedupe...')

    const semanticDupeCheck = await checkSemanticDuplicate(embedding)

    if (semanticDupeCheck.isDuplicate) {
      await Article.findByIdAndUpdate(seedArticle._id, {
        forgeStatus: 'rejected',
        'forgeSeedData.seedHash': seedHash,
        'forgeSeedData.seedEmbedding': embedding,
        'forgeSeedData.rejectionReason': `Semantic duplicate (${(
          semanticDupeCheck.similarity * 100
        ).toFixed(1)}% similar)`,
        'forgeSeedData.processedAt': new Date(),
      })
      console.log(
        `  ❌ Rejected: Semantic duplicate (${(
          semanticDupeCheck.similarity * 100
        ).toFixed(1)}%)`,
      )
      return {
        success: false,
        stage: currentStage,
        reason: 'Semantic duplicate',
      }
    }

    console.log('  ✅ No semantic duplicate')

    // ========================================================================
    // STAGE 5: AI Classification
    // ========================================================================
    currentStage = 'classification'
    console.log('  Stage 5: AI classification...')

    const classification = await classifyContent({
      title: seedArticle.title,
      source: seedArticle.author || 'unknown',
      summary: seedArticle.description,
      body: seedArticle.mainText,
    })

    if (!classification.suitable) {
      await Article.findByIdAndUpdate(seedArticle._id, {
        forgeStatus: 'rejected',
        'forgeSeedData.seedHash': seedHash,
        'forgeSeedData.seedEmbedding': embedding,
        'forgeSeedData.rejectionReason': `Not suitable: ${classification.reasoning}`,
        'forgeSeedData.processedAt': new Date(),
      })
      console.log(`  ❌ Rejected: ${classification.reasoning}`)
      return {
        success: false,
        stage: currentStage,
        reason: classification.reasoning,
      }
    }

    console.log(
      `  ✅ Classified as ${classification.category} - ${classification.subtype}`,
    )

    // ========================================================================
    // STAGE 6: LLM Rewrite
    // ========================================================================
    currentStage = 'rewrite'
    console.log('  Stage 6: LLM rewrite...')

    let rewriteResult
    let retries = 0
    const MAX_RETRIES = 1

    while (retries <= MAX_RETRIES) {
      try {
        rewriteResult = await rewriteToForgeFormat(
          {
            title: seedArticle.title,
            body: seedArticle.mainText,
          },
          classification,
        )
        break
      } catch (error) {
        retries++
        if (retries > MAX_RETRIES) {
          throw error
        }
        console.log(
          `  ⚠️  Rewrite failed, retrying (${retries}/${MAX_RETRIES})...`,
        )
      }
    }

    console.log('  ✅ Rewrite complete')

    // ========================================================================
    // STAGE 7: Save Forge Article
    // ========================================================================
    currentStage = 'save'
    console.log('  Stage 7: Saving Forge article...')

    const forgeArticle = new ForgeArticle({
      title: rewriteResult.title,
      seedArticleId: seedArticle._id,
      sections: rewriteResult.sections,
      category: classification.category,
      subtype: classification.subtype,
      difficulty: rewriteResult.difficulty || classification.difficulty,
      tags: rewriteResult.tags || [],
      status: 'draft', // Manual review before publishing
      llmMetadata: {
        model: 'gpt-4o',
        promptVersion: '1.0',
        generatedAt: new Date(),
      },
    })

    await forgeArticle.save()

    // Update seed article
    await Article.findByIdAndUpdate(seedArticle._id, {
      forgeStatus: 'accepted',
      forgeArticleRef: forgeArticle._id,
      'forgeSeedData.seedHash': seedHash,
      'forgeSeedData.seedEmbedding': embedding,
      'forgeSeedData.seedSource': seedArticle.author,
      'forgeSeedData.seedDate': new Date(seedArticle.dateTime),
      'forgeSeedData.seedBody': seedArticle.mainText,
      'forgeSeedData.processedAt': new Date(),
    })

    const processingTime = Date.now() - startTime
    console.log(`  ✅ ACCEPTED - Forge article created (${processingTime}ms)`)

    return {
      success: true,
      forgeArticleId: forgeArticle._id,
      processingTime,
    }
  } catch (error) {
    console.error(`  ❌ Error in stage ${currentStage}:`, error.message)

    await Article.findByIdAndUpdate(seedArticle._id, {
      forgeStatus: 'failed',
      'forgeSeedData.rejectionReason': `Failed at ${currentStage}: ${error.message}`,
      'forgeSeedData.processedAt': new Date(),
    })

    return {
      success: false,
      stage: currentStage,
      error: error.message,
    }
  }
}

/**
 * Process batch of pending seeds
 *
 * USAGE: Called by cron job or manual trigger
 */
async function processPendingSeeds(limit = 50) {
  console.log(`\n🚀 Starting batch processing (limit: ${limit})`)

  const pendingSeeds = await Article.find({
    forgeStatus: 'pending',
  })
    .sort({ createdAt: 1 })
    .limit(limit)

  console.log(`Found ${pendingSeeds.length} pending seeds`)

  const results = {
    total: pendingSeeds.length,
    accepted: 0,
    rejected: 0,
    failed: 0,
    reasons: {},
  }

  for (const seed of pendingSeeds) {
    const result = await processSeed(seed)

    if (result.success) {
      results.accepted++
    } else if (result.stage === 'save') {
      results.failed++
    } else {
      results.rejected++
      results.reasons[result.reason] = (results.reasons[result.reason] || 0) + 1
    }

    // Stop if we hit daily target
    if (results.accepted >= CONFIG.DAILY_TARGET) {
      console.log(`\n✅ Daily target reached (${CONFIG.DAILY_TARGET} articles)`)
      break
    }
  }

  console.log('\n📊 Batch processing complete:')
  console.log(`   Total processed: ${results.total}`)
  console.log(`   Accepted: ${results.accepted}`)
  console.log(`   Rejected: ${results.rejected}`)
  console.log(`   Failed: ${results.failed}`)
  console.log('\n📈 Rejection reasons:')
  Object.entries(results.reasons).forEach(([reason, count]) => {
    console.log(`   - ${reason}: ${count}`)
  })

  return results
}

module.exports = {
  processSeed,
  processPendingSeeds,
}
