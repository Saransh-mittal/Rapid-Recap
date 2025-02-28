// utils/quickClashHighlight.utils.js
const OpenAI = require('openai')
const QuickClashChallenge = require('../model/quickClashSchemas/quickClashChallengeSchema')
const { decode } = require('html-entities')
const QuickClashHighlight = require('../model/quickClashSchemas/quickClashHighlightSchema')

/**
 * Generate highlights for a QuickClash article content
 * @param {Object} params - Parameters for highlight generation
 * @param {string} params.challengeId - The ID of the challenge
 * @param {string} params.lang - Language of the content (en/hi)
 * @param {mongoose.ClientSession} [params.session] - Optional Mongoose session for transactions
 * @returns {Promise<Object>} The generated highlight document
 */
const generateQuickClashHighlights = async ({
  challengeId,
  lang = 'en',
  session = null,
}) => {
  try {
    const challenge = await QuickClashChallenge.findById(challengeId).session(
      session,
    )
    if (!challenge) {
      console.log('[ERROR] Challenge not found')
      throw new Error('Challenge not found')
    }

    // Check if highlights already exist
    const existingHighlight = await QuickClashHighlight.findOne({
      challengeId,
      language: lang,
    }).session(session)

    if (existingHighlight) {
      return existingHighlight
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    const instructions = `
    Give the output in the ${lang === 'en' ? 'English' : 'Hindi'} language.
    Analyze this news article and create two things:

    1. Important Sentences (4-6):
       - Copy sentences EXACTLY as they appear in the text
       - Maintain exact capitalization and case
       - Include key facts, statistics, or significant quotes
       - Focus on major developments or turning points
       - Do not modify any part of the sentence
       - Use exact punctuation and spacing

    2. Dictionary (5-10 terms):
       - Select terms EXACTLY as they appear in the text
       - Maintain original capitalization
       - Include technical or domain-specific terms
       - Include uncommon or specialized vocabulary or unique phrases or less known names or terms
       - Include hard vocabulary or terms that may be unfamiliar to readers
       - Copy phrases exactly as written
       - Do not modify case or punctuation
       - Verify each term exists exactly in the text

    Return ONLY a JSON object:
    {
      "dictionary": [{ "word": string, "definition": string }],
      "importantSentences": [string]
    }

    CRITICAL: Maintain exact case sensitivity - do not capitalize or modify any text.
    Copy and paste the exact text from the original.
    `

    const content =
      lang === 'en'
        ? challenge.article.content.english
        : challenge.article.content.hindi

    const title =
      lang === 'en'
        ? challenge.article.title.english
        : challenge.article.title.hindi

    const decodedText = decode(content)

    const prompt = {
      title: title,
      mainText: decodedText,
      category: challenge.category,
    }

    const output = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: instructions },
        { role: 'user', content: JSON.stringify(prompt) },
      ],
    })

    const highlightData = JSON.parse(output.choices[0].message.content)

    // Create highlight document
    const highlight = new QuickClashHighlight({
      challengeId: challenge._id,
      dictionary: highlightData.dictionary,
      importantSentences: highlightData.importantSentences,
      createdAt: new Date(),
      lastUpdated: new Date(),
      processingStatus: 'completed',
      language: lang,
      error: null,
    })

    // Save the highlight
    if (session) {
      await highlight.save({ session })
    } else {
      await highlight.save()
    }

    return highlight
  } catch (error) {
    console.error('Error during QuickClash highlight generation:', error)

    // Create a failed highlight record
    const failedHighlight = new QuickClashHighlight({
      challengeId: challengeId,
      dictionary: [],
      importantSentences: [],
      processingStatus: 'failed',
      language: lang,
      error: error.message,
    })

    if (session) {
      await failedHighlight.save({ session })
    } else {
      await failedHighlight.save()
    }

    throw error
  }
}

/**
 * Fetch highlights for a QuickClash challenge
 * @param {Object} params - Parameters
 * @param {string} params.challengeId - Challenge ID
 * @param {string} params.lang - Language (en/hi)
 * @returns {Promise<Object>} The highlight document or null
 */
const getQuickClashHighlights = async ({ challengeId, lang = 'en' }) => {
  try {
    let highlight = await QuickClashHighlight.findOne({
      challengeId,
      language: lang,
      processingStatus: 'completed',
    })

    if (!highlight) {
      // Generate on-demand if not found
      highlight = await generateQuickClashHighlights({
        challengeId,
        lang,
      })
    }

    return highlight
  } catch (error) {
    console.error('Error fetching QuickClash highlights:', error)
    return null
  }
}

module.exports = {
  generateQuickClashHighlights,
  getQuickClashHighlights,
}
