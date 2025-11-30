const fs = require('fs')
const path = require('path')
const { zodResponseFormat } = require('openai/helpers/zod')
const ForgeArticle = require('../model/quickClashSchemas/forgeArticleSchema')
const BatchJob = require('../model/batchJobSchema')
const batchService = require('./batchService')
const { BatchQuizOutputSchema, BATCH_QUIZ_SYSTEM_PROMPT } = require('./forgeBatchQuizAgent')

// ============================================================================
// CONFIGURATION
// ============================================================================

const BATCH_SIZE_LIMIT = 100
const TEMP_DIR = path.join(__dirname, '../temp_batch_files')

if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true })
}

// ============================================================================
// STEP 1: PREPARE BATCH
// ============================================================================

async function prepareQuizBatch() {
  console.log('🚀 Starting Quiz Batch Preparation...')

  // Find draft articles (created by Content Batch)
  // We only process articles that have content but NO quiz yet (or status is draft)
  const articles = await ForgeArticle.find({ status: 'draft' }).limit(BATCH_SIZE_LIMIT)

  if (articles.length === 0) {
    console.log('✅ No draft articles found for quiz generation.')
    return null
  }

  console.log(`Found ${articles.length} draft articles.`)
  const validRequests = []
  const articleIds = []

  for (const article of articles) {
    const customId = article._id.toString()
    articleIds.push(customId)

    // Format content for prompt
    const articleContent = article.sections.map((s, i) => `[Section ${i+1}] ${s.title}\n${s.content}`).join('\n\n')

    // Extract existing MCQs for deduplication
    const existingMCQs = article.sections
      .filter(s => s.mcq)
      .map((s, i) => `Q${i+1}: ${s.mcq.question}`)
      .join('\n')

    const userPrompt = `TITLE: ${article.title}
CATEGORY: ${article.category}

CONTENT:
${articleContent}

EXISTING MCQS (AVOID THESE):
${existingMCQs}`

    const requestLine = {
      custom_id: customId,
      method: 'POST',
      url: '/v1/chat/completions',
      body: {
        model: 'gpt-5-nano',
        messages: [
          { role: 'system', content: BATCH_QUIZ_SYSTEM_PROMPT },
          { role: 'user', content: userPrompt }
        ],
        response_format: zodResponseFormat(BatchQuizOutputSchema, 'quiz_generation'),
      }
    }

    validRequests.push(requestLine)
  }

  // Write JSONL
  const filename = `batch_quiz_input_${Date.now()}.jsonl`
  const filePath = path.join(TEMP_DIR, filename)
  const fileStream = fs.createWriteStream(filePath)
  validRequests.forEach(req => fileStream.write(JSON.stringify(req) + '\n'))
  fileStream.end()

  await new Promise(resolve => fileStream.on('finish', resolve))
  console.log(`📝 Created Quiz JSONL: ${filePath}`)

  // Upload & Submit
  try {
    const fileId = await batchService.uploadBatchFile(filePath)
    const batch = await batchService.createBatch(fileId)

    const batchJob = new BatchJob({
      batchId: batch.id,
      status: 'submitted',
      openaiStatus: batch.status,
      inputFileId: fileId,
      requestCount: validRequests.length,
      jobType: 'quiz_generation' // Distinguish from content generation
    })
    await batchJob.save()

    // Mark articles as 'processing_quiz' (optional, or just leave as draft)
    // We'll leave them as 'draft' but maybe add a flag if needed.
    // For simplicity, we won't change status yet, relying on BatchJob to track progress.

    console.log(`✅ Quiz Batch Submitted! Job ID: ${batchJob._id}`)
    fs.unlinkSync(filePath)
    return batchJob

  } catch (error) {
    console.error('❌ Failed to submit quiz batch:', error)
    throw error
  }
}

// ============================================================================
// STEP 2: PROCESS RESULTS
// ============================================================================

async function checkAndProcessQuizBatch() {
  console.log('🔍 Checking active QUIZ batches...')

  const activeJob = await BatchJob.findOne({
    status: { $in: ['submitted', 'processing'] },
    jobType: 'quiz_generation'
  }).sort({ createdAt: -1 })

  if (!activeJob) {
    console.log('No active quiz batch jobs.')
    return
  }

  console.log(`Checking Quiz Batch ID: ${activeJob.batchId}`)
  const batchStatus = await batchService.getBatchStatus(activeJob.batchId)

  activeJob.openaiStatus = batchStatus.status
  await activeJob.save()

  if (batchStatus.status === 'completed') {
    console.log('🎉 Quiz Batch Completed! Processing results...')
    await processQuizResults(activeJob, batchStatus.output_file_id)
  } else if (['failed', 'expired', 'cancelled'].includes(batchStatus.status)) {
    console.error(`❌ Quiz Batch Failed: ${batchStatus.status}`)
    activeJob.status = 'failed'
    await activeJob.save()
  } else {
    console.log(`⏳ Quiz Batch running: ${batchStatus.status}`)
  }
}

async function processQuizResults(job, outputFileId) {
  try {
    const jsonlContent = await batchService.downloadBatchResults(outputFileId)
    const lines = jsonlContent.trim().split('\n')
    console.log(`Processing ${lines.length} quiz results...`)

    let processedCount = 0

    for (const line of lines) {
      const result = JSON.parse(line)
      const articleId = result.custom_id
      const responseBody = result.response.body
      const content = JSON.parse(responseBody.choices[0].message.content)

      if (content.questions) {
        await ForgeArticle.findByIdAndUpdate(articleId, {
          quickClashQuiz: {
            questions: content.questions,
            overallDifficulty: content.overallDifficulty,
            generatedAt: new Date()
          },
          status: 'published', // NOW we publish it
          publishedAt: new Date()
        })
        processedCount++
      }
    }

    job.status = 'completed'
    job.outputFileId = outputFileId
    job.processedCount = processedCount
    job.completedAt = new Date()
    await job.save()

    console.log('✅ Quiz Batch Results Processed!')

  } catch (error) {
    console.error('❌ Error processing quiz results:', error)
    job.status = 'failed'
    job.error = error.message
    await job.save()
  }
}

module.exports = {
  prepareQuizBatch,
  checkAndProcessQuizBatch
}
