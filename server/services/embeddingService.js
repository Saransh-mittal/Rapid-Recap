const OpenAI = require('openai')
const crypto = require('crypto')

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

/**
 * Generate embedding for text using OpenAI
 *
 * LEARNING NOTE: We use text-embedding-3-small because:
 * - Cheaper than ada-002
 * - 1536 dimensions (good balance)
 * - Fast inference
 * - Sufficient for semantic similarity
 *
 * @param {string} text - Text to embed
 * @returns {Promise<number[]>} - Embedding vector (1536 dimensions)
 */
async function generateEmbedding(text) {
  try {
    if (!text || text.trim().length === 0) {
      throw new Error('Text cannot be empty')
    }

    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text.trim().substring(0, 8000), // Limit to 8k chars
    })

    return response.data[0].embedding
  } catch (error) {
    console.error('Embedding generation error:', error.message)
    throw error
  }
}

/**
 * Calculate cosine similarity between two vectors
 *
 * LEARNING NOTE: Cosine similarity measures angle between vectors (0-1).
 * - 1.0 = identical
 * - > 0.85 = very similar (our threshold for duplicates)
 * - < 0.5 = different topics
 *
 * @param {number[]} vecA
 * @param {number[]} vecB
 * @returns {number} - Similarity score (0-1)
 */
function cosineSimilarity(vecA, vecB) {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must have same length')
  }

  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i]
    normA += vecA[i] * vecA[i]
    normB += vecB[i] * vecB[i]
  }

  const similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
  return similarity
}

/**
 * Generate deterministic hash for deduplication
 *
 * @param {string} title
 * @param {string} source
 * @param {string} date
 * @returns {string} - SHA-256 hash
 */
function generateSeedHash(title, source, date) {
  const content = `${title}|${source}|${date}`
  return crypto.createHash('sha256').update(content).digest('hex')
}

/**
 * Batch embed multiple texts efficiently
 *
 * PERFORMANCE NOTE: Batching reduces API calls and latency
 *
 * @param {string[]} texts
 * @returns {Promise<number[][]>}
 */
async function batchGenerateEmbeddings(texts) {
  try {
    const validTexts = texts.map(t => t.trim().substring(0, 8000))

    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: validTexts,
    })

    return response.data.map(item => item.embedding)
  } catch (error) {
    console.error('Batch embedding error:', error.message)
    throw error
  }
}

module.exports = {
  generateEmbedding,
  cosineSimilarity,
  generateSeedHash,
  batchGenerateEmbeddings,
}
