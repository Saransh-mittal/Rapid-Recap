const { runForgeScraper } = require('./runForgeScraper')
const { processPendingSeeds } = require('../services/contentProcessingService')
const mongoose = require('mongoose')
require('dotenv').config({ path: './config.env' })
require('../db/conn') // Connect to MongoDB

/**
 * Complete Forge Workflow Orchestrator
 *
 * LEARNING NOTE: This demonstrates the "Orchestrator Pattern"
 * - Coordinates multiple async operations in sequence
 * - Each step waits for previous to complete
 * - Aggregates results from all steps
 * - Provides unified error handling
 *
 * FLOW:
 * 1. Scrape content from RSS feeds → Save to MongoDB
 * 2. Wait for completion
 * 3. Process pending seeds → Generate ForgeArticles
 * 4. Report combined results
 */
async function runCompleteWorkflow(options = {}) {
  const {
    maxSources = null, // Limit sources (null = all 16)
    maxProcessing = 100, // Max seeds to process
    skipScraping = false, // Skip scraping (only process existing)
    skipProcessing = false, // Skip processing (only scrape)
  } = options

  console.log('\n' + '='.repeat(80))
  console.log('🚀 FORGE COMPLETE WORKFLOW')
  console.log('='.repeat(80))
  console.log(`Start time: ${new Date().toLocaleString()}\n`)

  const workflowResults = {
    scraping: null,
    processing: null,
    totalTime: 0,
    success: false,
  }

  const startTime = Date.now()

  try {
    // ========================================================================
    // PHASE 1: SCRAPE CONTENT
    // ========================================================================

    if (!skipScraping) {
      console.log('='.repeat(80))
      console.log('📰 PHASE 1: CONTENT SCRAPING')
      console.log('='.repeat(80))

      if (maxSources) {
        console.log(`Scraping ${maxSources} sources...\n`)
      } else {
        console.log('Scraping all sources (16)...\n')
      }

      const scrapeStartTime = Date.now()
      const scrapeResult = await runForgeScraper(maxSources)
      const scrapeTime = Date.now() - scrapeStartTime

      workflowResults.scraping = {
        ...scrapeResult.stats,
        timeSeconds: Math.round(scrapeTime / 1000),
      }

      console.log('\n' + '-'.repeat(80))
      console.log('✅ SCRAPING COMPLETE')
      console.log('-'.repeat(80))
      console.log(`Sources tested:     ${scrapeResult.stats.sources_tested}`)
      console.log(`Articles fetched:   ${scrapeResult.stats.articles_fetched}`)
      console.log(`Articles saved:     ${scrapeResult.stats.articles_saved}`)
      console.log(`Duplicates skipped: ${scrapeResult.stats.duplicates}`)
      console.log(`Errors:             ${scrapeResult.stats.errors}`)
      console.log(`Time:               ${Math.round(scrapeTime / 1000)}s`)
      console.log('-'.repeat(80))

      // Check if we should proceed to processing
      if (scrapeResult.stats.articles_saved === 0) {
        console.log('\n⚠️  No new articles saved - skipping processing phase')
        workflowResults.success = true
        workflowResults.totalTime = Date.now() - startTime
        return workflowResults
      }

      // Pause between phases
      console.log('\n⏸️  Waiting 3 seconds before processing...\n')
      await new Promise(resolve => setTimeout(resolve, 3000))
    } else {
      console.log('\n⏭️  PHASE 1: SKIPPED (skipScraping = true)\n')
    }

    // ========================================================================
    // PHASE 2: PROCESS SEEDS
    // ========================================================================

    if (!skipProcessing) {
      console.log('='.repeat(80))
      console.log('🔄 PHASE 2: SEED PROCESSING')
      console.log('='.repeat(80))
      console.log(`Processing up to ${maxProcessing} pending seeds...\n`)

      const processStartTime = Date.now()
      const processResult = await processPendingSeeds(maxProcessing)
      const processTime = Date.now() - processStartTime

      workflowResults.processing = {
        ...processResult,
        timeSeconds: Math.round(processTime / 1000),
      }

      console.log('\n' + '-'.repeat(80))
      console.log('✅ PROCESSING COMPLETE')
      console.log('-'.repeat(80))
      console.log(`Total processed:    ${processResult.total}`)
      console.log(`Accepted:           ${processResult.accepted}`)
      console.log(`Rejected:           ${processResult.rejected}`)
      console.log(`Failed:             ${processResult.failed}`)
      console.log(`Time:               ${Math.round(processTime / 1000)}s`)

      if (Object.keys(processResult.reasons).length > 0) {
        console.log('\nTop rejection reasons:')
        Object.entries(processResult.reasons)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .forEach(([reason, count]) => {
            console.log(`  - ${reason}: ${count}`)
          })
      }
      console.log('-'.repeat(80))
    } else {
      console.log('\n⏭️  PHASE 2: SKIPPED (skipProcessing = true)\n')
    }

    // ========================================================================
    // FINAL SUMMARY
    // ========================================================================

    workflowResults.success = true
    workflowResults.totalTime = Date.now() - startTime

    console.log('\n' + '='.repeat(80))
    console.log('🎉 WORKFLOW COMPLETE')
    console.log('='.repeat(80))

    if (workflowResults.scraping) {
      console.log('\n📰 Scraping Results:')
      console.log(
        `   New articles:        ${workflowResults.scraping.articles_saved}`,
      )
      console.log(
        `   Duplicates skipped:  ${workflowResults.scraping.duplicates}`,
      )
    }

    if (workflowResults.processing) {
      console.log('\n🔄 Processing Results:')
      console.log(
        `   Forge articles:      ${workflowResults.processing.accepted}`,
      )
      console.log(
        `   Rejected:            ${workflowResults.processing.rejected}`,
      )
      console.log(
        `   Success rate:        ${(
          (workflowResults.processing.accepted /
            workflowResults.processing.total) *
          100
        ).toFixed(1)}%`,
      )
    }

    console.log(
      `\n⏱️  Total time:          ${Math.round(
        workflowResults.totalTime / 1000,
      )}s`,
    )
    console.log(`📅 Completed:           ${new Date().toLocaleString()}`)
    console.log('='.repeat(80))

    return workflowResults
  } catch (error) {
    console.error('\n❌ WORKFLOW FAILED')
    console.error('='.repeat(80))
    console.error(`Error: ${error.message}`)
    console.error('='.repeat(80))

    workflowResults.success = false
    workflowResults.error = error.message
    workflowResults.totalTime = Date.now() - startTime

    throw error
  }
}

/**
 * CLI interface with argument parsing
 *
 * USAGE:
 * node scripts/runCompleteForgeWorkflow.js
 * node scripts/runCompleteForgeWorkflow.js --sources=5
 * node scripts/runCompleteForgeWorkflow.js --max-processing=50
 * node scripts/runCompleteForgeWorkflow.js --skip-scraping
 * node scripts/runCompleteForgeWorkflow.js --skip-processing
 */
async function main() {
  // Parse command line arguments
  const args = process.argv.slice(2)
  const options = {
    maxSources: null,
    maxProcessing: 100,
    skipScraping: false,
    skipProcessing: false,
  }

  args.forEach(arg => {
    if (arg.startsWith('--sources=')) {
      options.maxSources = parseInt(arg.split('=')[1])
    } else if (arg.startsWith('--max-processing=')) {
      options.maxProcessing = parseInt(arg.split('=')[1])
    } else if (arg === '--skip-scraping') {
      options.skipScraping = true
    } else if (arg === '--skip-processing') {
      options.skipProcessing = true
    } else if (arg === '--help' || arg === '-h') {
      console.log(`
Forge Complete Workflow Runner

USAGE:
  node scripts/runCompleteForgeWorkflow.js [OPTIONS]

OPTIONS:
  --sources=N             Limit scraping to N sources (default: all 16)
  --max-processing=N      Process max N seeds (default: 100)
  --skip-scraping         Skip scraping phase (only process)
  --skip-processing       Skip processing phase (only scrape)
  --help, -h              Show this help message

EXAMPLES:
  # Run complete workflow (scrape all sources + process)
  node scripts/runCompleteForgeWorkflow.js

  # Scrape only 5 sources, process up to 50 seeds
  node scripts/runCompleteForgeWorkflow.js --sources=5 --max-processing=50

  # Only scrape, don't process
  node scripts/runCompleteForgeWorkflow.js --skip-processing

  # Only process existing pending seeds
  node scripts/runCompleteForgeWorkflow.js --skip-scraping

  # Quick test (scrape 2 sources, process 10 seeds)
  node scripts/runCompleteForgeWorkflow.js --sources=2 --max-processing=10
      `)
      process.exit(0)
    }
  })

  try {
    const results = await runCompleteWorkflow(options)

    // Exit with success
    process.exit(0)
  } catch (error) {
    console.error('\n💥 Fatal error:', error.message)
    process.exit(1)
  }
}

// Run if executed directly
if (require.main === module) {
  main()
}

// Export for use in other scripts/cron jobs
module.exports = { runCompleteWorkflow }
