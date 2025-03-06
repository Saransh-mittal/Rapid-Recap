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

    // Create a placeholder record to indicate processing has started
    const processingHighlight = new QuickClashHighlight({
      challengeId: challenge._id,
      dictionary: [],
      importantSentences: [],
      createdAt: new Date(),
      lastUpdated: new Date(),
      processingStatus: 'pending',
      language: lang,
      error: null,
    })

    // Save the processing placeholder
    if (session) {
      await processingHighlight.save({ session })
    } else {
      await processingHighlight.save()
    }

    // OpenAI call is moved outside of the transaction in scheduleHighlightGeneration
    // We'll return the processing placeholder for now
    return processingHighlight
  } catch (error) {
    console.error('Error during QuickClash highlight generation:', error)

    // Create a failed highlight record
    try {
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
    } catch (saveError) {
      console.error('Error saving failed highlight record:', saveError)
    }

    throw error
  }
}

/**
 * Schedule the actual highlight generation to happen outside of the transaction
 * @param {Object} params - Parameters
 * @param {string} params.challengeId - Challenge ID
 * @param {string} params.lang - Language (en/hi)
 */
const scheduleHighlightGeneration = async ({ challengeId, lang = 'en' }) => {
  try {
    // Find challenge to ensure it exists
    const challenge = await QuickClashChallenge.findById(challengeId)
    if (!challenge) {
      console.log('[ERROR] Challenge not found for scheduled generation')
      return null
    }

    // Check if a record exists already
    const existingHighlight = await QuickClashHighlight.findOne({
      challengeId,
      language: lang,
    })

    // If already completed or doesn't exist, don't proceed
    if (
      !existingHighlight ||
      existingHighlight.processingStatus === 'completed'
    ) {
      return existingHighlight || null
    }

    // Here we perform the actual OpenAI call outside of any transaction
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

    // Make the OpenAI API call
    const output = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: instructions },
        { role: 'user', content: JSON.stringify(prompt) },
      ],
    })

    const highlightData = JSON.parse(output.choices[0].message.content)

    // Update the existing highlight record with the actual data
    await QuickClashHighlight.findOneAndUpdate(
      { challengeId, language: lang },
      {
        dictionary: highlightData.dictionary,
        importantSentences: highlightData.importantSentences,
        lastUpdated: new Date(),
        processingStatus: 'completed',
        error: null,
      },
      { new: true },
    )

    // Fetch and return the updated record
    return await QuickClashHighlight.findOne({
      challengeId,
      language: lang,
    })
  } catch (error) {
    console.error(`Error in scheduled highlight generation (${lang}):`, error)

    // Update the record to mark as failed
    try {
      await QuickClashHighlight.findOneAndUpdate(
        { challengeId, language: lang },
        {
          lastUpdated: new Date(),
          processingStatus: 'failed',
          error: error.message,
        },
      )
    } catch (updateError) {
      console.error('Error updating failed highlight status:', updateError)
    }

    return null
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
    // First check if we have a completed highlight
    let highlight = await QuickClashHighlight.findOne({
      challengeId,
      language: lang,
      processingStatus: 'completed',
    })

    if (highlight) {
      return highlight
    }

    // Check if we have a pending or failed highlight
    const pendingHighlight = await QuickClashHighlight.findOne({
      challengeId,
      language: lang,
    })

    // If we have a pending highlight that's old, retry generation
    if (pendingHighlight) {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)

      if (
        pendingHighlight.processingStatus === 'pending' &&
        pendingHighlight.lastUpdated < fiveMinutesAgo
      ) {
        // Retry generation if it's been pending for more than 5 minutes
        console.log(
          `Retrying highlight generation for challenge ${challengeId} (${lang})`,
        )
        return await scheduleHighlightGeneration({ challengeId, lang })
      }

      if (pendingHighlight.processingStatus === 'failed') {
        // Retry generation if previous attempt failed
        console.log(
          `Retrying failed highlight generation for challenge ${challengeId} (${lang})`,
        )
        return await scheduleHighlightGeneration({ challengeId, lang })
      }

      // Otherwise return the pending highlight
      return pendingHighlight
    }

    // If no highlight exists at all, create a placeholder and schedule generation
    const newHighlight = await generateQuickClashHighlights({
      challengeId,
      lang,
    })

    // Schedule the actual generation to happen in the background
    scheduleHighlightGeneration({ challengeId, lang }).catch(err =>
      console.error(
        `Background highlight generation error for ${challengeId} (${lang}):`,
        err,
      ),
    )

    return newHighlight
  } catch (error) {
    console.error('Error fetching QuickClash highlights:', error)
    return null
  }
}

module.exports = {
  generateQuickClashHighlights,
  getQuickClashHighlights,
  scheduleHighlightGeneration,
}
