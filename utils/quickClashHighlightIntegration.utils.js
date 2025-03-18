// utils/quickClashHighlightIntegration.utils.js
const QuickClashHighlight = require('../model/quickClashSchemas/quickClashHighlightSchema')
const ArticleHighlight = require('../model/articleHighlightSchema')

/**
 * Copy highlights from an article to a QuickClash challenge
 * @param {Object} params - Parameters for the operation
 * @param {Object} params.articleHighlight - Article highlight document
 * @param {string} params.challengeId - The challenge ID
 * @param {string} params.lang - Language code (en/hi)
 * @param {mongoose.ClientSession} [params.session] - Optional mongoose session
 * @returns {Promise<Object>} The QuickClash highlight document
 */
const copyHighlightsToChallenge = async ({
  articleHighlight,
  challengeId,
  lang = 'en',
  session = null,
}) => {
  try {
    // Create a new QuickClash highlight using the article highlight data
    const quickClashHighlight = new QuickClashHighlight({
      challengeId,
      dictionary: articleHighlight.dictionary || [],
      importantSentences: articleHighlight.importantSentences || [],
      createdAt: new Date(),
      lastUpdated: new Date(),
      processingStatus: articleHighlight.processingStatus || 'pending',
      language: lang,
      error: articleHighlight.error || null,
    })

    // Save with or without session
    if (session) {
      await quickClashHighlight.save({ session })
    } else {
      await quickClashHighlight.save()
    }

    return quickClashHighlight
  } catch (error) {
    console.error('Error copying highlights to challenge:', error)
    throw error
  }
}

const createPlaceholderHighlight = async ({ challengeId, lang, session }) => {
  const placeholder = new QuickClashHighlight({
    challengeId,
    dictionary: [],
    importantSentences: [],
    createdAt: new Date(),
    lastUpdated: new Date(),
    processingStatus: 'pending',
    language: lang,
    error: null,
  })

  await placeholder.save({ session })
  return placeholder
}

/**
 * Create QuickClash highlights from article highlights
 * @param {Object} params - Parameters for the operation
 * @param {string} params.articleId - Source article ID
 * @param {string} params.challengeId - QuickClash challenge ID
 * @param {string} params.lang - Language code (en/hi)
 * @param {mongoose.ClientSession} [params.session] - Optional mongoose session
 * @returns {Promise<Object>} Created QuickClash highlight
 */
const createChallengeHighlightsFromArticle = async ({
  articleId,
  challengeId,
  lang = 'en',
  session = null,
}) => {
  try {
    // Check if a highlight already exists for this challenge
    const existingHighlight = await QuickClashHighlight.findOne({
      challengeId,
      language: lang,
    }).session(session)

    if (existingHighlight) {
      return existingHighlight
    }

    // Look for article highlights
    const articleHighlight = await ArticleHighlight.findOne({
      articleId,
      language: lang,
    }).session(session)

    // If no article highlight exists, or it's not completed, create a placeholder
    if (
      !articleHighlight ||
      articleHighlight.processingStatus !== 'completed'
    ) {
      const placeholderHighlight = new QuickClashHighlight({
        challengeId,
        dictionary: [],
        importantSentences: [],
        createdAt: new Date(),
        lastUpdated: new Date(),
        processingStatus: 'pending',
        language: lang,
        error: null,
      })

      if (session) {
        await placeholderHighlight.save({ session })
      } else {
        await placeholderHighlight.save()
      }

      return placeholderHighlight
    }

    // If article highlight is completed, copy it to the challenge
    return await copyHighlightsToChallenge({
      articleHighlight,
      challengeId,
      lang,
      session,
    })
  } catch (error) {
    console.error('Error creating challenge highlights from article:', error)

    // Create a placeholder in case of error
    try {
      const failedHighlight = new QuickClashHighlight({
        challengeId,
        dictionary: [],
        importantSentences: [],
        processingStatus: 'failed',
        language: lang,
        error: error.message,
        createdAt: new Date(),
        lastUpdated: new Date(),
      })

      if (session) {
        await failedHighlight.save({ session })
      } else {
        await failedHighlight.save()
      }

      return failedHighlight
    } catch (saveError) {
      console.error('Error saving failed highlight record:', saveError)
      throw error
    }
  }
}

module.exports = {
  copyHighlightsToChallenge,
  createPlaceholderHighlight,
  createChallengeHighlightsFromArticle,
}
