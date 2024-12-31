// services/articleProcessor.js

const { makeGPTRequest } = require('../utils/openai')
const Article = require('../model/articleSchema')
const ArticleHighlight = require('../model/articleHighlightSchema')
const { decode } = require('html-entities')
const asyncHandler = require('express-async-handler')

const processEnglishContent = asyncHandler(async articleData => {
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
    temperature: 0.3,
  })

  return result
})

const processHindiContent = asyncHandler(async articleData => {
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

    CRITICAL: For highlights, copy text exactly as it appears in the Hindi translation.`

  const result = await makeGPTRequest({
    messages: [
      { role: 'system', content: instructions },
      {
        role: 'user',
        content: `Title: ${articleData.processedContent.title}\n Author: ${articleData.author}\n\n MainText: ${articleData.processedContent.mainText}\n\n`,
      },
    ],
    temperature: 0.3,
  })

  return result
})

const processArticle = asyncHandler(async articleId => {
  const article = await Article.findById(articleId)

  if (!article) throw new Error('Article not found')

  // Skip if already processed
  if (
    article.hindiTitle &&
    article.hindiMainText?.length > 0 &&
    article.keywords?.length > 0 &&
    article.description &&
    (await ArticleHighlight.exists({ articleId, language: 'en' })) &&
    (await ArticleHighlight.exists({ articleId, language: 'hi' }))
  ) {
    return { message: 'Article already processed' }
  }

  // Process English content first
  const englishResult = await processEnglishContent(article)

  // Process Hindi content using English results
  const hindiResult = await processHindiContent({
    ...article.toObject(),
    processedContent: englishResult.processedContent,
  })

  // Save all data in parallel
  await Promise.all([
    // Update article with all new data
    Article.findByIdAndUpdate(articleId, {
      title: englishResult.processedContent.title || article.title,
      mainText: englishResult.processedContent.mainText,
      hindiTitle: hindiResult.translation.title,
      hindiAuthor: hindiResult.translation.author,
      hindiMainText: hindiResult.translation.paragraphs,
      keywords: englishResult.seo.keywords,
      description: englishResult.seo.description,
    }),

    // Save English highlights
    ArticleHighlight.findOneAndUpdate(
      { articleId, language: 'en' },
      {
        dictionary: englishResult.highlights.dictionary,
        importantSentences: englishResult.highlights.importantSentences,
        processingStatus: 'completed',
      },
      { upsert: true },
    ),

    // Save Hindi highlights
    ArticleHighlight.findOneAndUpdate(
      { articleId, language: 'hi' },
      {
        dictionary: hindiResult.highlights.dictionary,
        importantSentences: hindiResult.highlights.importantSentences,
        processingStatus: 'completed',
      },
      { upsert: true },
    ),
  ])

  return {
    english: englishResult,
    hindi: hindiResult,
  }
})

module.exports = {
  processArticle,
}
