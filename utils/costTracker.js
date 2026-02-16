/**
 * OpenAI Cost Tracker Utility
 *
 * Tracks token usage and calculates costs for batch API operations.
 * Prices are per 1 million tokens (batch pricing).
 */

// ============================================================================
// PRICING CONFIGURATION (per 1M tokens - Batch API pricing)
// ============================================================================

const PRICING = {
  'gpt-5-nano': {
    input: 0.025,      // $0.025 per 1M input tokens
    cached: 0.0025,    // $0.0025 per 1M cached tokens
    output: 0.20,      // $0.20 per 1M output tokens
  },
  'gpt-5-mini': {
    input: 0.125,      // $0.125 per 1M input tokens (Batch)
    cached: 0.0125,    // $0.0125 per 1M cached tokens (Batch)
    output: 1.00,      // $1.00 per 1M output tokens (Batch)
  },
  // Fallback for unknown models (use gpt-5-nano rates)
  'default': {
    input: 0.025,
    cached: 0.0025,
    output: 0.20,
  }
}

// ============================================================================
// COST TRACKER CLASS
// ============================================================================

class CostTracker {
  constructor(batchName = 'unknown') {
    this.batchName = batchName
    this.totalInputTokens = 0
    this.totalCachedTokens = 0
    this.totalOutputTokens = 0
    this.requestCount = 0
    this.modelUsed = null
    this.startTime = Date.now()
  }

  /**
   * Add usage from a single API response
   * @param {Object} usage - The usage object from OpenAI response
   * @param {string} model - The model used (e.g., 'gpt-5-nano')
   */
  addUsage(usage, model = 'gpt-5-nano') {
    if (!usage) return

    this.modelUsed = model
    this.requestCount++

    // Handle different usage formats
    // Standard format
    if (usage.prompt_tokens) {
      this.totalInputTokens += usage.prompt_tokens
    }

    // Cached tokens (if available)
    if (usage.prompt_tokens_details?.cached_tokens) {
      this.totalCachedTokens += usage.prompt_tokens_details.cached_tokens
    }

    // Output tokens
    if (usage.completion_tokens) {
      this.totalOutputTokens += usage.completion_tokens
    }
  }

  /**
   * Calculate the total cost based on accumulated usage
   * @returns {Object} Cost breakdown
   */
  calculateCost() {
    const pricing = PRICING[this.modelUsed] || PRICING['default']

    // Adjust input tokens (subtract cached since they're cheaper)
    const nonCachedInputTokens = this.totalInputTokens - this.totalCachedTokens

    const inputCost = (nonCachedInputTokens / 1_000_000) * pricing.input
    const cachedCost = (this.totalCachedTokens / 1_000_000) * pricing.cached
    const outputCost = (this.totalOutputTokens / 1_000_000) * pricing.output
    const totalCost = inputCost + cachedCost + outputCost

    return {
      model: this.modelUsed,
      batchName: this.batchName,
      requestCount: this.requestCount,
      tokens: {
        input: this.totalInputTokens,
        cached: this.totalCachedTokens,
        output: this.totalOutputTokens,
        total: this.totalInputTokens + this.totalOutputTokens
      },
      costs: {
        input: inputCost,
        cached: cachedCost,
        output: outputCost,
        total: totalCost
      },
      duration: Date.now() - this.startTime
    }
  }

  /**
   * Print a formatted cost summary
   */
  printSummary() {
    const cost = this.calculateCost()

    console.log('\n' + '─'.repeat(50))
    console.log(`💰 COST SUMMARY: ${this.batchName}`)
    console.log('─'.repeat(50))
    console.log(`   Model:           ${cost.model || 'unknown'}`)
    console.log(`   Requests:        ${cost.requestCount}`)
    console.log('')
    console.log(`   📥 Input Tokens:  ${cost.tokens.input.toLocaleString()}`)
    console.log(`   🔄 Cached Tokens: ${cost.tokens.cached.toLocaleString()}`)
    console.log(`   📤 Output Tokens: ${cost.tokens.output.toLocaleString()}`)
    console.log(`   ───────────────────────────────`)
    console.log(`   📊 Total Tokens:  ${cost.tokens.total.toLocaleString()}`)
    console.log('')
    console.log(`   💵 Input Cost:    $${cost.costs.input.toFixed(6)}`)
    console.log(`   💵 Cached Cost:   $${cost.costs.cached.toFixed(6)}`)
    console.log(`   💵 Output Cost:   $${cost.costs.output.toFixed(6)}`)
    console.log(`   ───────────────────────────────`)
    console.log(`   💰 TOTAL COST:    $${cost.costs.total.toFixed(6)}`)
    console.log('─'.repeat(50))

    return cost
  }

  /**
   * Get a compact one-line summary
   */
  getCompactSummary() {
    const cost = this.calculateCost()
    return `${cost.requestCount} requests | ${cost.tokens.total.toLocaleString()} tokens | $${cost.costs.total.toFixed(4)}`
  }
}

// ============================================================================
// WORKFLOW COST AGGREGATOR
// ============================================================================

class WorkflowCostAggregator {
  constructor() {
    this.phases = {}
  }

  /**
   * Add a phase cost tracker
   * @param {string} phaseName
   * @param {CostTracker} tracker
   */
  addPhase(phaseName, tracker) {
    this.phases[phaseName] = tracker.calculateCost()
  }

  /**
   * Print complete workflow cost summary
   */
  printWorkflowSummary() {
    let totalTokens = 0
    let totalCost = 0

    console.log('\n' + '═'.repeat(60))
    console.log('💰 COMPLETE WORKFLOW COST SUMMARY')
    console.log('═'.repeat(60))

    for (const [phaseName, cost] of Object.entries(this.phases)) {
      console.log(`\n   📦 ${phaseName}:`)
      console.log(`      Requests: ${cost.requestCount} | Tokens: ${cost.tokens.total.toLocaleString()} | Cost: $${cost.costs.total.toFixed(4)}`)
      totalTokens += cost.tokens.total
      totalCost += cost.costs.total
    }

    console.log('\n' + '─'.repeat(60))
    console.log(`   📊 TOTAL TOKENS:  ${totalTokens.toLocaleString()}`)
    console.log(`   💰 TOTAL COST:    $${totalCost.toFixed(4)}`)
    console.log('═'.repeat(60))

    return { totalTokens, totalCost }
  }
}

module.exports = {
  CostTracker,
  WorkflowCostAggregator,
  PRICING
}
