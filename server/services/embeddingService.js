// services/embeddingService.js

const { OpenAI } = require('openai')

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

/**
 * Generates embedding vector for given text using OpenAI's API
 * @param {string} text Text to generate embedding for
 * @returns {Promise<number[]>} Array of vector embeddings
 */
const generateEmbedding = async text => {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
      encoding_format: 'float',
    })

    return response.data[0].embedding
  } catch (error) {
    console.error('Error generating embedding:', error)
    throw error
  }
}

module.exports = {
  generateEmbedding,
}
