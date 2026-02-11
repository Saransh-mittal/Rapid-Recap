const fs = require('fs')
const path = require('path')
const { zodResponseFormat } = require('openai/helpers/zod')
const Article = require('../model/articleSchema')
const ForgeArticle = require('../model/quickClashSchemas/forgeArticleSchema')
const BatchJob = require('../model/batchJobSchema')
const batchService = require('./batchService')
const { BatchForgeOutputSchema, BATCH_SYSTEM_PROMPT } = require('./forgeBatchAgent')
const { processSeed } = require('./contentProcessingService') // Reuse pre-processing logic if possible, or adapt
const { CostTracker } = require('../utils/costTracker')

const CATEGORY_MAP = {
  'gk-prime': 'GK Prime',
  'science-facts-simplified': 'Science Facts Simplified',
  'everyday-tech': 'Everyday Tech',
  geography: 'Geography',
}

function normalizeCategory(category) {
  const key = String(category || '').trim().toLowerCase()
  return CATEGORY_MAP[key] || category || 'Unknown'
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const BATCH_SIZE_LIMIT = 200 // Max articles per batch file
const TEMP_DIR = path.join(__dirname, '../temp_batch_files')

if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true })
}

// ============================================================================
// STEP 1: PREPARE BATCH
// ============================================================================

/**
 * 1. Find pending seeds
 * 2. Run local filters (quickFilter)
 * 3. Create JSONL file
 * 4. Upload & Submit Batch
 */
async function prepareBatch() {
  console.log('🚀 Starting Batch Preparation...')

  // 1. Find pending seeds
  const seeds = await Article.find({ forgeStatus: 'pending' }).limit(BATCH_SIZE_LIMIT)

  if (seeds.length === 0) {
    console.log('✅ No pending seeds found.')
    return null
  }

  console.log(`Found ${seeds.length} pending seeds.`)
  const validRequests = []
  const seedIds = []

  // 2. Prepare JSONL lines
  for (const seed of seeds) {
    // Skip if body is too short (basic local filter)
    if (!seed.mainText || seed.mainText.length < 500) {
      await Article.findByIdAndUpdate(seed._id, { forgeStatus: 'rejected', 'forgeSeedData.rejectionReason': 'Too short (Local)' })
      continue
    }

    const customId = seed._id.toString()
    seedIds.push(customId)
    const seedCategoryCanonical = normalizeCategory(seed.category)
    const seedSource = seed?.forgeSeedData?.seedSource || 'unknown'

    // Construct the request body for Chat Completions
    const requestLine = {
      custom_id: customId,
      method: 'POST',
      url: '/v1/chat/completions',
      body: {
        model: 'gpt-5-mini', // Supports Structured Outputs
        messages: [
          { role: 'system', content: BATCH_SYSTEM_PROMPT },
          {
            role: 'user',
            content: `SEED_CATEGORY_RAW: ${seed.category || 'unknown'}\nSEED_CATEGORY_CANONICAL: ${seedCategoryCanonical}\nSEED_SOURCE: ${seedSource}\n\nTITLE: ${seed.title}\n\nBODY: ${seed.mainText.substring(0, 3000)}`,
          },
        ],
        response_format: zodResponseFormat(BatchForgeOutputSchema, 'forge_analysis'),
      }
    }

    validRequests.push(requestLine)
  }

  if (validRequests.length === 0) {
    console.log('❌ No valid requests after local filtering.')
    return null
  }

  // 3. Write JSONL file
  const filename = `batch_input_${Date.now()}.jsonl`
  const filePath = path.join(TEMP_DIR, filename)

  const fileStream = fs.createWriteStream(filePath)
  validRequests.forEach(req => fileStream.write(JSON.stringify(req) + '\n'))
  fileStream.end()

  await new Promise(resolve => fileStream.on('finish', resolve))
  console.log(`📝 Created JSONL file: ${filePath}`)

  // 4. Upload & Create Batch
  try {
    const fileId = await batchService.uploadBatchFile(filePath)
    const batch = await batchService.createBatch(fileId)

    // 5. Save Job to DB
    const batchJob = new BatchJob({
      batchId: batch.id,
      status: 'submitted',
      openaiStatus: batch.status,
      inputFileId: fileId,
      requestCount: validRequests.length,
    })
    await batchJob.save()

    // Mark seeds as 'processing'
    await Article.updateMany(
      { _id: { $in: seedIds } },
      { forgeStatus: 'processing', 'forgeSeedData.batchId': batch.id }
    )

    console.log(`✅ Batch Submitted! Job ID: ${batchJob._id}`)

    // Cleanup temp file
    fs.unlinkSync(filePath)

    return batchJob

  } catch (error) {
    console.error('❌ Failed to submit batch:', error)
    throw error
  }
}

// ============================================================================
// STEP 2: CHECK & PROCESS RESULTS
// ============================================================================

/**
 * 1. Find active batch jobs
 * 2. Check status via OpenAI
 * 3. If completed, download results
 * 4. Process results & Save ForgeArticles
 */
async function checkAndProcessBatch() {
  console.log('🔍 Checking active batches...')

  const activeJob = await BatchJob.findOne({
    status: { $in: ['submitted', 'processing'] }
  }).sort({ createdAt: -1 })

  if (!activeJob) {
    console.log('No active batch jobs.')
    return
  }

  console.log(`Checking Batch ID: ${activeJob.batchId}`)
  const batchStatus = await batchService.getBatchStatus(activeJob.batchId)

  // Update DB status
  activeJob.openaiStatus = batchStatus.status
  await activeJob.save()

  if (batchStatus.status === 'completed') {
    console.log('🎉 Batch Completed! Processing results...')
    const costData = await processBatchResults(activeJob, batchStatus.output_file_id)
    return costData // Return cost data for aggregation
  } else if (batchStatus.status === 'failed' || batchStatus.status === 'expired' || batchStatus.status === 'cancelled') {
    console.error(`❌ Batch Failed/Expired: ${batchStatus.status}`)
    activeJob.status = 'failed'
    await activeJob.save()
  } else {
    console.log(`⏳ Batch still running: ${batchStatus.status}`)
  }
}

async function processBatchResults(job, outputFileId) {
  const costTracker = new CostTracker('Content Batch')

  try {
    const jsonlContent = await batchService.downloadBatchResults(outputFileId)
    const lines = jsonlContent.trim().split('\n')

    console.log(`Processing ${lines.length} result lines...`)

    let processedCount = 0

    for (const line of lines) {
      const result = JSON.parse(line)
      const customId = result.custom_id // This is the Seed Article ID
      const responseBody = result.response.body

      // Track token usage from this response
      if (responseBody.usage) {
        costTracker.addUsage(responseBody.usage, responseBody.model || 'gpt-5-mini')
      }

      // Parse the structured output
      const content = JSON.parse(responseBody.choices[0].message.content)

      if (content.suitable && content.article) {
        // Create ForgeArticle
        const forgeArticle = new ForgeArticle({
          title: content.article.title,
          seedArticleId: customId,
          sections: content.article.sections,
          category: content.category,
          subtype: content.subtype || content.category || 'General',
          difficulty: content.estimatedDifficulty,
          tags: content.article.tags,
          status: 'draft', // Wait for Quiz Generation
          // publishedAt: new Date(), // Set in Quiz Phase
          llmMetadata: {
            model: 'gpt-5-mini',
            promptVersion: 'batch-v2',
            generatedAt: new Date()
          }
        })

        await forgeArticle.save()

        // Update Seed
        await Article.findByIdAndUpdate(customId, {
          forgeStatus: 'accepted',
          forgeArticleRef: forgeArticle._id,
          'forgeSeedData.processedAt': new Date()
        })

      } else {
        // Mark as rejected
        await Article.findByIdAndUpdate(customId, {
          forgeStatus: 'rejected',
          'forgeSeedData.rejectionReason': content.reasoning || 'Unsuitable (Batch)',
          'forgeSeedData.processedAt': new Date()
        })
      }
      processedCount++
    }

    job.status = 'completed'
    job.outputFileId = outputFileId
    job.processedCount = processedCount
    job.completedAt = new Date()
    await job.save()

    // Print cost summary
    const costData = costTracker.printSummary()

    console.log('✅ Batch Results Processed Successfully!')

    return costData

  } catch (error) {
    console.error('❌ Error processing batch results:', error)
    job.status = 'failed'
    job.error = error.message
    await job.save()
  }
}

module.exports = {
  prepareBatch,
  checkAndProcessBatch
}
