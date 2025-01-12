// services/articleProcessor.js

const { makeGPTRequest } = require('../utils/openai')
const { decode } = require('html-entities')
const asyncHandler = require('express-async-handler')

// Validation helper functions
const validateEnglishResult = result => {
  // Check if all required structures exist
  if (!result.processedContent || !result.highlights || !result.seo) {
    throw new Error('Missing required top-level structures in response')
  }

  // Validate processedContent
  if (!result.processedContent.title || !result.processedContent.mainText) {
    throw new Error('Missing required fields in processedContent')
  }

  // Validate highlights
  if (
    !Array.isArray(result.highlights.dictionary) ||
    !Array.isArray(result.highlights.importantSentences)
  ) {
    throw new Error('Invalid highlights structure')
  }

  if (
    result.highlights.dictionary.length < 5 ||
    result.highlights.importantSentences.length < 4
  ) {
    throw new Error('Insufficient highlights content')
  }

  // Validate dictionary entries
  if (
    !result.highlights.dictionary.every(entry => entry.word && entry.definition)
  ) {
    throw new Error('Invalid dictionary entry structure')
  }

  // Validate SEO
  if (!Array.isArray(result.seo.keywords) || !result.seo.description) {
    throw new Error('Invalid SEO structure')
  }

  if (result.seo.keywords.length < 5 || result.seo.description.length > 150) {
    throw new Error('Invalid SEO content')
  }

  return true
}

const validateHindiResult = result => {
  // Check if all required structures exist
  if (!result.translation || !result.highlights) {
    throw new Error('Missing required top-level structures in response')
  }

  // Validate translation
  if (
    !result.translation.title ||
    !result.translation.author ||
    !Array.isArray(result.translation.paragraphs)
  ) {
    throw new Error('Missing required fields in translation')
  }

  if (result.translation.paragraphs.length !== 3) {
    throw new Error('Translation must have exactly 3 paragraphs')
  }

  // Validate highlights
  if (
    !Array.isArray(result.highlights.dictionary) ||
    !Array.isArray(result.highlights.importantSentences)
  ) {
    throw new Error('Invalid highlights structure')
  }

  if (
    result.highlights.dictionary.length < 5 ||
    result.highlights.importantSentences.length < 4
  ) {
    throw new Error('Insufficient highlights content')
  }

  // Validate dictionary entries
  if (
    !result.highlights.dictionary.every(entry => entry.word && entry.definition)
  ) {
    throw new Error('Invalid dictionary entry structure')
  }

  return true
}

const processEnglishContent = asyncHandler(
  async (articleData, retryCount = 0) => {
    const MAX_RETRIES = 1 // Only retry once

    try {
      const instructions = `You are a professional news analyst and writer.

    Part 1 - Content Processing:
    Key Instructions:
    1. Create original analysis by combining insights from multiple viewpoints:
       - Local implications
       - Industry impact
       - Market trends
       - Historical context
       - Future implications
       - Dont include outdated information or irrelevant information

    2. Content Guidelines:
       - Use only 1-2 short factual quotes from the source (with attribution)
       - Focus on broader context and implications
       - Add relevant statistics or data from public sources
       - Include industry expert perspectives
       - Connect to related industry trends
       - If needed Rewrite a good title according to the content that will also help in SEO

    3. Structure Requirements:
       - Keep content between 800-1800 characters
       - Use unique phrasing and structure
       - Vary sentence patterns
       - Add subsections with unique angles
       - If you want to make a phrase or a word bold, use the markdown syntax ** on both sides of the word or phrase without space in between.
       - If the original content is numbered, then keep the similar numbering in the new content.

    Part 2 - Highlights Extraction:
    After processing the content, analyze the processed text to extract:

    1. Important Sentences (4-6):
       - Copy sentences EXACTLY as they appear in the processed text
       - Maintain exact capitalization and case
       - Include key facts, statistics, or significant quotes
       - Focus on major developments or turning points
       - Do not modify any part of the sentence
       - Use exact punctuation and spacing
       - If any kind of marking is used in the original text, maintain it here also for example if ** is used for bold text, maintain it here also

    2. Dictionary (5-10 terms):
       - Select terms EXACTLY as they appear in the processed text
       - Maintain original capitalization
       - Include technical or domain-specific terms
       - Include uncommon or specialized vocabulary
       - Include unique phrases or less known names or terms
       - Include hard vocabulary terms that may be unfamiliar to readers
       - Copy phrases exactly as written
       - Do not modify case or punctuation
       - Verify each term exists exactly in the text

    Part 3 - SEO:
    Generate SEO optimization data:
    - 5-8 relevant search keywords
    - Meta description under 150 chars

    ${
      retryCount > 0
        ? 'CRITICAL: Previous attempt produced content outside the 800-1800 character limit. Please ensure the content strictly adheres to this requirement.'
        : ''
    }

    Return JSON: {
      "processedContent": {
        "title": "",
        "mainText": ""
      },
      "highlights": {
        "dictionary": [{ "word": string, "definition": string }],
        "importantSentences": [string]
      },
      "seo": {
        "keywords": [],
        "description": ""
      }
    }

    CRITICAL: For highlights, maintain exact case sensitivity and copy text exactly as it appears.`

      const result = await makeGPTRequest({
        messages: [
          { role: 'system', content: instructions },
          {
            role: 'user',
            content: JSON.stringify({
              title: articleData.title,
              mainText: decode(articleData.mainText),
              category: articleData.category,
            }),
          },
        ],
        temperature: retryCount > 0 ? 0.5 : 0.3, // Slightly increase temperature on retry
      })
      validateEnglishResult(result)
      // Validate content length
      const contentLength = result.processedContent.mainText.length
      if (contentLength < 800 || contentLength > 2000) {
        if (retryCount < MAX_RETRIES) {
          console.log(
            `Content length (${contentLength}) outside acceptable range. Retrying...`,
          )
          // Wait briefly before retrying
          await new Promise(resolve => setTimeout(resolve, 1000))
          return processEnglishContent(articleData, retryCount + 1)
        } else {
          throw new Error(
            `Failed to generate content within length requirements after ${
              MAX_RETRIES + 1
            } attempts`,
          )
        }
      }

      return result
    } catch (error) {
      if (retryCount < MAX_RETRIES) {
        console.log(
          `Error in processEnglishContent: ${error.message}. Retrying...`,
        )
        // Wait briefly before retrying
        await new Promise(resolve => setTimeout(resolve, 1000))
        return processEnglishContent(articleData, retryCount + 1)
      }
      throw error
    }
  },
)

const processHindiContent = asyncHandler(
  async (articleData, retryCount = 0) => {
    const MAX_RETRIES = 1

    try {
      const instructions = `You are a professional Hindi translator and news analyst.

    Part 1 - Translation:
    Instructions:
    1. Translate to daily speaking Hindi used by common Indians
    2. Author name to be transliterated to Hindi, not translated
    3. Break maintext into exactly 3 paragraphs
    4. Ensure all information from original text is retained
    5. Do not summarize or modify content
    6. Preserve original meaning perfectly
    7. Don't cut sentences in between
    8. Translate complete sentences

    Part 2 - Hindi Highlights:
    After translation, analyze the Hindi text to extract:

    1. Important Sentences (4-6):
       - Copy sentences EXACTLY as they appear in the Hindi text
       - Maintain exact formatting and punctuation
       - Include key facts, statistics, or significant quotes
       - Focus on major developments or turning points
       - Do not modify the copied text in any way
       - If any kind of marking is used in the original text, maintain it here also for example if ** is used for bold text, maintain it here also

    2. Dictionary (5-10 terms):
       - Select terms EXACTLY as they appear in the Hindi text
       - Include technical or domain-specific terms
       - Include uncommon or specialized Hindi vocabulary
       - Include unique phrases or less known terms
       - Include difficult vocabulary terms
       - Copy phrases exactly as written
       - Verify each term exists in the translated text

    Return JSON: {
      "translation": {
        "title": "hindi title",
        "author": "hindi author",
        "paragraphs": ["para1", "para2", "para3"]
      },
      "highlights": {
        "dictionary": [{ "word": string, "definition": string }],
        "importantSentences": [string]
      }
    }

    CRITICAL: For highlights, copy text exactly as it appears in the Hindi translation.
    ${
      retryCount > 0
        ? 'CRITICAL: Previous attempt failed validation. Please ensure all required fields are present and content is properly structured.'
        : ''
    }
    `

      const result = await makeGPTRequest({
        messages: [
          { role: 'system', content: instructions },
          {
            role: 'user',
            content: `Title: ${articleData.processedContent.title}\n Author: ${articleData.author}\n\n MainText: ${articleData.processedContent.mainText}\n\n`,
          },
        ],
        temperature: retryCount > 0 ? 0.5 : 0.3,
      })

      validateHindiResult(result)

      return result
    } catch (error) {
      if (retryCount < MAX_RETRIES) {
        console.log(
          `Error in processHindiContent: ${error.message}. Retrying...`,
        )
        await new Promise(resolve => setTimeout(resolve, 1000))
        return processHindiContent(articleData, retryCount + 1)
      }
      throw error
    }
  },
)

const processArticle = asyncHandler(async newsItem => {
  if (!newsItem || !newsItem.title || !newsItem.text) {
    throw new Error('Invalid news item structure')
  }

  const decodedText = decode(newsItem.text)
  const decodedTitle = decode(newsItem.title)

  const englishResult = await processEnglishContent({
    title: decodedTitle,
    mainText: decodedText,
    category: newsItem.category,
  })

  // Process Hindi content using English results
  const hindiResult = await processHindiContent({
    processedContent: englishResult.processedContent,
    author: Array.isArray(newsItem.author)
      ? newsItem.author[0]
      : newsItem.author,
  })

  // Return processed data
  return {
    url: newsItem.url,
    dateTime: newsItem.publish_date,
    author: Array.isArray(newsItem.author)
      ? newsItem.author[0]
      : newsItem.author,
    title: englishResult.processedContent.title,
    mainText: englishResult.processedContent.mainText,
    hindiTitle: hindiResult.translation.title,
    hindiAuthor: hindiResult.translation.author,
    hindiMainText: hindiResult.translation.paragraphs,
    imgURL: [newsItem.image],
    category: newsItem.category,
    keywords: englishResult.seo.keywords,
    description: englishResult.seo.description,
    highlights: {
      en: {
        dictionary: englishResult.highlights.dictionary,
        importantSentences: englishResult.highlights.importantSentences,
      },
      hi: {
        dictionary: hindiResult.highlights.dictionary,
        importantSentences: hindiResult.highlights.importantSentences,
      },
    },
  }
})

module.exports = {
  processArticle,
}
