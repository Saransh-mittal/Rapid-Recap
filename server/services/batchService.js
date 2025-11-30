const OpenAI = require('openai')
const fs = require('fs')
const path = require('path')

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

/**
 * Upload a JSONL file for Batch processing
 * @param {string} filePath - Absolute path to the .jsonl file
 * @returns {Promise<string>} - File ID
 */
async function uploadBatchFile(filePath) {
  try {
    console.log(`Uploading batch file: ${path.basename(filePath)}`)
    const file = await openai.files.create({
      file: fs.createReadStream(filePath),
      purpose: 'batch',
    })
    console.log(`File uploaded successfully. ID: ${file.id}`)
    return file.id
  } catch (error) {
    console.error('Error uploading batch file:', error)
    throw error
  }
}

/**
 * Create a Batch job
 * @param {string} inputFileId - ID of the uploaded file
 * @param {string} endpoint - API endpoint (e.g., '/v1/chat/completions')
 * @returns {Promise<Object>} - Batch object
 */
async function createBatch(inputFileId, endpoint = '/v1/chat/completions') {
  try {
    console.log(`Creating batch for file: ${inputFileId}`)
    const batch = await openai.batches.create({
      input_file_id: inputFileId,
      endpoint: endpoint,
      completion_window: '24h', // Currently the only option
    })
    console.log(`Batch created. ID: ${batch.id}`)
    return batch
  } catch (error) {
    console.error('Error creating batch:', error)
    throw error
  }
}

/**
 * Retrieve Batch status
 * @param {string} batchId
 * @returns {Promise<Object>}
 */
async function getBatchStatus(batchId) {
  try {
    const batch = await openai.batches.retrieve(batchId)
    return batch
  } catch (error) {
    console.error(`Error retrieving batch ${batchId}:`, error)
    throw error
  }
}

/**
 * Download Batch results (output or error file)
 * @param {string} fileId
 * @returns {Promise<string>} - File content (JSONL string)
 */
async function downloadBatchResults(fileId) {
  try {
    console.log(`Downloading results file: ${fileId}`)
    const fileResponse = await openai.files.content(fileId)
    const fileContents = await fileResponse.text()
    return fileContents
  } catch (error) {
    console.error(`Error downloading file ${fileId}:`, error)
    throw error
  }
}

/**
 * List active batches
 */
async function listBatches(limit = 10) {
  try {
    const list = await openai.batches.list({ limit })
    return list.data
  } catch (error) {
    console.error('Error listing batches:', error)
    throw error
  }
}

/**
 * Cancel a batch
 */
async function cancelBatch(batchId) {
  try {
    const batch = await openai.batches.cancel(batchId)
    console.log(`Batch ${batchId} cancelled`)
    return batch
  } catch (error) {
    console.error(`Error cancelling batch ${batchId}:`, error)
    throw error
  }
}

module.exports = {
  uploadBatchFile,
  createBatch,
  getBatchStatus,
  downloadBatchResults,
  listBatches,
  cancelBatch,
}
