const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../config.env') })

const { runForgeScraper } = require('./runForgeScraper')
const mongoose = require('mongoose')
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
    skipProcessing = false, // Skip content processing
    skipQuiz = false, // Skip quiz generation
  } = options

  console.log('\n' + '='.repeat(80))
  console.log('🚀 FORGE COMPLETE WORKFLOW')
  console.log('='.repeat(80))
  console.log(`Start time: ${new Date().toLocaleString()}\n`)

  const workflowResults = {
    scraping: null,
    processing: null,
    quiz: null,
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
    // PHASE 2: BATCH PROCESSING (OPENAI BATCH API)
    // ========================================================================

    if (!skipProcessing) {
      console.log('='.repeat(80))
      console.log('🔄 PHASE 2: BATCH PROCESSING')
      console.log('='.repeat(80))

      const { prepareBatch, checkAndProcessBatch } = require('../services/batchContentWorkflow')
      const BatchJob = require('../model/batchJobSchema')

      // Check for active batch
      const activeJob = await BatchJob.findOne({
        status: { $in: ['submitted', 'processing'] },
        jobType: { $ne: 'quiz_generation' } // Exclude quiz jobs
      }).sort({ createdAt: -1 })

      if (activeJob) {
        console.log(`\n🔄 Found active batch (ID: ${activeJob.batchId})`)
        console.log(`   Submitted at: ${activeJob.createdAt.toLocaleString()}`)
        console.log('   Checking status with OpenAI...')

        await checkAndProcessBatch()

        // Refetch to see if it completed just now
        const updatedJob = await BatchJob.findById(activeJob._id)
        if (updatedJob.status === 'completed') {
           workflowResults.processing = {
             status: 'completed',
             processed: updatedJob.processedCount,
             batchId: updatedJob.batchId
           }
        } else {
           workflowResults.processing = {
             status: 'in_progress',
             batchId: updatedJob.batchId,
             openaiStatus: updatedJob.openaiStatus
           }
        }

      } else {
        console.log('\n🆕 No active batch. Preparing new batch from pending seeds...')
        const newJob = await prepareBatch()

        if (newJob) {
          workflowResults.processing = {
            status: 'submitted',
            batchId: newJob.batchId,
            requestCount: newJob.requestCount
          }
        } else {
          console.log('   No pending seeds to process.')
          workflowResults.processing = { status: 'skipped', reason: 'no_seeds' }
        }
      }

      console.log('\n' + '-'.repeat(80))
      console.log('✅ BATCH PHASE COMPLETE')
      console.log('-'.repeat(80))
    } else {
      console.log('\n⏭️  PHASE 2: SKIPPED (skipProcessing = true)\n')
    }

    // ========================================================================
    // PHASE 3: QUIZ BATCH PROCESSING
    // ========================================================================

    if (!skipQuiz) {
      console.log('\n' + '='.repeat(80))
      console.log('🔄 PHASE 3: QUIZ BATCH PROCESSING')
      console.log('='.repeat(80))

      const { prepareQuizBatch, checkAndProcessQuizBatch } = require('../services/batchQuizWorkflow')
      const BatchJob = require('../model/batchJobSchema')

      // 1. Check for active quiz batch
      const activeQuizBatch = await BatchJob.findOne({
        status: { $in: ['submitted', 'processing'] },
        jobType: 'quiz_generation'
      })

      if (activeQuizBatch) {
        console.log(`\n🔄 Found active QUIZ batch (ID: ${activeQuizBatch.batchId})`)
        console.log(`   Submitted at: ${activeQuizBatch.createdAt.toLocaleString()}`)
        console.log('   Checking status with OpenAI...')
        await checkAndProcessQuizBatch()
      } else {
        console.log('\n🆕 No active quiz batch. Checking for draft articles...')
        const quizBatchJob = await prepareQuizBatch()

        if (quizBatchJob) {
          console.log(`✅ Quiz Batch Submitted! Job ID: ${quizBatchJob._id}`)
        }
      }

      console.log('\n' + '-'.repeat(80))
      console.log('✅ QUIZ PHASE COMPLETE')
      console.log('-'.repeat(80))
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

      if (workflowResults.processing.status === 'completed') {
        console.log(`   Status:              Completed`)
        console.log(`   Forge articles:      ${workflowResults.processing.processed}`)
        console.log(`   Batch ID:            ${workflowResults.processing.batchId}`)
      } else if (workflowResults.processing.status === 'submitted') {
        console.log(`   Status:              Submitted (Processing in background)`)
        console.log(`   Requests queued:     ${workflowResults.processing.requestCount}`)
        console.log(`   Batch ID:            ${workflowResults.processing.batchId}`)
        console.log(`   Note:                Results will be available in ~24h`)
      } else if (workflowResults.processing.status === 'in_progress') {
        console.log(`   Status:              In Progress (OpenAI is working)`)
        console.log(`   OpenAI Status:       ${workflowResults.processing.openaiStatus}`)
        console.log(`   Batch ID:            ${workflowResults.processing.batchId}`)
      } else if (workflowResults.processing.status === 'skipped') {
        console.log(`   Status:              Skipped`)
        console.log(`   Reason:              ${workflowResults.processing.reason}`)
      }
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
    skipQuiz: false,
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
    } else if (arg === '--skip-quiz') {
      options.skipQuiz = true
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
