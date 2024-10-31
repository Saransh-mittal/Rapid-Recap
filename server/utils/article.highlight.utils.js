// utils/article.highlight.utils.js

const OpenAI = require('openai')
const Article = require('../model/articleSchema')
const ArticleHighlight = require('../model/articleHighlightSchema')
const { decode } = require('html-entities')

const generateHighlights = async articleId => {
  try {
    const [article, existingHighlights] = await Promise.all([
      Article.findById(articleId),
      ArticleHighlight.findOne({ articleId }),
    ])

    if (!article) {
      throw new Error('Article not found')
    }

    if (
      existingHighlights &&
      existingHighlights.processingStatus === 'completed'
    ) {
      console.log(`Highlights already exist for article ${articleId}`)
      return existingHighlights
    }

    let highlights =
      existingHighlights ||
      new ArticleHighlight({
        articleId,
        processingStatus: 'pending',
      })

    if (existingHighlights) {
      highlights.processingStatus = 'pending'
      highlights.lastUpdated = new Date()
      await highlights.save()
    } else {
      await highlights.save()
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    const instructions = `
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

    const decodedText = decode(article.mainText)
    const prompt = {
      title: article.title,
      mainText: decodedText,
      category: article.category,
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

    // Verify the data
    const verifyHighlights = (text, highlights) => {
      return highlights.every(sentence => text.includes(sentence))
    }

    const verifyDictionary = (text, dictionary) => {
      return dictionary.every(entry => text.includes(entry.word))
    }

    if (!verifyHighlights(decodedText, highlightData.importantSentences)) {
      throw new Error('Generated sentences not found in original text')
    }

    if (!verifyDictionary(decodedText, highlightData.dictionary)) {
      throw new Error('Generated dictionary terms not found in original text')
    }

    highlights.dictionary = highlightData.dictionary
    highlights.importantSentences = highlightData.importantSentences
    highlights.processingStatus = 'completed'
    highlights.lastUpdated = new Date()
    highlights.error = null

    await highlights.save()
    return highlights
  } catch (error) {
    console.error(
      `Error generating highlights for article ${articleId}:`,
      error,
    )

    if (highlights) {
      highlights.processingStatus = 'failed'
      highlights.error = error.message
      highlights.lastUpdated = new Date()
      await highlights.save()
    }

    throw error
  }
}

const processArticlesForHighlights = async (batchSize = 10) => {
  try {
    const articles = await Article.find({
      $or: [
        { _id: { $nin: await ArticleHighlight.distinct('articleId') } },
        {
          _id: {
            $in: await ArticleHighlight.distinct('articleId', {
              $or: [
                { processingStatus: 'failed' },
                {
                  processingStatus: 'pending',
                  lastUpdated: { $lt: new Date(Date.now() - 1800000) },
                },
              ],
            }),
          },
        },
      ],
    })
      .select('_id')
      .limit(batchSize)

    console.log(`Processing highlights for ${articles.length} articles`)

    const results = await Promise.allSettled(
      articles.map(article => generateHighlights(article._id)),
    )

    return {
      total: articles.length,
      successful: results.filter(r => r.status === 'fulfilled').length,
      failed: results.filter(r => r.status === 'rejected').length,
      details: results.map((result, index) => ({
        articleId: articles[index]._id,
        status: result.status,
        error: result.status === 'rejected' ? result.reason.message : null,
      })),
    }
  } catch (error) {
    console.error('Error in batch processing highlights:', error)
    throw error
  }
}

module.exports = {
  generateHighlights,
  processArticlesForHighlights,
}
