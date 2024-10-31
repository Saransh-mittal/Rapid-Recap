// scripts/generateHighlightForArticle.js

const path = require('path')
const OpenAI = require('openai')
const { decode } = require('html-entities')

// Fix paths
const Article = require(path.join(__dirname, '..', 'model', 'articleSchema'))
const ArticleHighlight = require(path.join(
  __dirname,
  '..',
  'model',
  'articleHighlightSchema',
))

const generateHighlightForArticle = async articleId => {
  try {
    console.log('\n=== Generating Highlights for Article ===\n')

    const article = await Article.findById(articleId)
    if (!article) {
      console.log('[ERROR] Article not found')
      return
    }

    console.log('Processing Article:')
    console.log({
      id: article._id,
      title: article.title,
      category: article.category,
      dateTime: article.dateTime,
    })

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

    console.log('\nSending request to GPT...\n')

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
    const highlight = new ArticleHighlight({
      articleId: article._id,
      dictionary: highlightData.dictionary,
      importantSentences: highlightData.importantSentences,
      createdAt: new Date(),
      lastUpdated: new Date(),
      processingStatus: 'completed',
      error: null,
    })

    // Display stats
    console.log('Content Statistics:')
    console.log(`Original text length: ${decodedText.length} characters`)
    console.log(`Dictionary entries: ${highlightData.dictionary.length}`)
    console.log(
      `Important sentences: ${highlightData.importantSentences.length}`,
    )

    // Display generated data
    console.log('\nGenerated Dictionary:')
    highlightData.dictionary.forEach((entry, index) => {
      console.log(`\n${index + 1}. Term: "${entry.word}"`)
      console.log(`   Definition: ${entry.definition}`)
    })

    console.log('\nGenerated Important Sentences:')
    highlightData.importantSentences.forEach((sentence, index) => {
      console.log(`\n${index + 1}. "${sentence}"`)
    })

    console.log('\nSaving highlight data...')
    await highlight.save()
    console.log('Highlight data saved successfully')

    console.log('\n=== Generation Complete ===\n')
    return highlight
  } catch (error) {
    console.error('\nError during highlight generation:', error)
    throw error
  }
}

// For testing with a specific article ID
if (require.main === module) {
  require('dotenv').config({ path: path.join(__dirname, '..', 'config.env') })
  require(path.join(__dirname, '..', 'db', 'conn'))

  // Replace with your article ID
  const articleId = '672200894f0a09d1033928c9' // Example ID

  console.log('Starting highlight generation...')
  generateHighlightForArticle(articleId)
    .then(() => {
      console.log('Generation completed successfully')
      process.exit(0)
    })
    .catch(err => {
      console.error('Generation failed:', err)
      process.exit(1)
    })
}

module.exports = generateHighlightForArticle
