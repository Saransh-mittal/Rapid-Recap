const { generateEmbedding } = require('../services/embeddingService')

const generateSearchVector = async ({ searchQuery }) => {
  try {
    const searchVector = await generateEmbedding(searchQuery)
    return searchVector
  } catch (error) {
    console.error('Error generating search vector:', error)
    throw error
  }
}

module.exports = { generateSearchVector }
