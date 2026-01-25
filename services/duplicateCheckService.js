const Article = require('../model/articleSchema')
const embeddingService = require('./legacy/embeddingService')
const DUPLICACY_SETTINGS = require('../config/duplicacyConstants')

const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // 1 second

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

const findDuplicateArticles = async ({ title, mainText, keywords = [] }) => {
  try {
    // Generate embedding with retry logic
    let contentVector
    let retries = 0
    while (retries < MAX_RETRIES) {
      try {
        const textToEmbed = `${title} ${mainText} ${keywords.join(' ')}`
        contentVector = await embeddingService.generateEmbedding(textToEmbed)
        break
      } catch (error) {
        retries++
        console.error(
          `Embedding generation attempt ${retries} failed:`,
          error.message,
        )
        if (retries === MAX_RETRIES) throw error
        await sleep(RETRY_DELAY)
      }
    }

    // Set time window for checking duplicates
    const timeWindow = new Date()
    timeWindow.setHours(timeWindow.getHours() - DUPLICACY_SETTINGS.TIME_WINDOW)

    // Find similar articles within time window using vector search
    const similarArticles = await Article.aggregate([
      {
        $vectorSearch: {
          index: 'vector_index',
          path: 'contentVector',
          queryVector: contentVector,
          numCandidates: 100,
          limit: 5,
        },
      },
      {
        $match: {
          dateTime: { $gte: timeWindow.toISOString() },
        },
      },
      {
        $project: {
          _id: 1,
          title: 1,
          dateTime: 1,
          score: { $meta: 'vectorSearchScore' },
        },
      },
    ])

    // Check if any article exceeds similarity threshold
    const duplicates = similarArticles.filter(
      article => article.score >= DUPLICACY_SETTINGS.SIMILARITY_THRESHOLD,
    )

    return {
      isDuplicate: duplicates.length > 0,
      contentVector,
      duplicateArticles: duplicates,
    }
  } catch (error) {
    console.error('Error checking for duplicates:', {
      error: error.message,
      title: title.substring(0, 50),
      stack: error.stack,
    })
    throw error
  }
}

module.exports = { findDuplicateArticles }
