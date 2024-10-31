// scripts/generateHighlightForArticle.js

const path = require('path')
const OpenAI = require('openai')
const { decode } = require('html-entities')
const {
  generateHighlightForArticle,
} = require('../utils/article.highlight.utils')

// Fix paths
const Article = require(path.join(__dirname, '..', 'model', 'articleSchema'))
const ArticleHighlight = require(path.join(
  __dirname,
  '..',
  'model',
  'articleHighlightSchema',
))

// For testing with a specific article ID
if (require.main === module) {
  require('dotenv').config({ path: path.join(__dirname, '..', 'config.env') })
  require(path.join(__dirname, '..', 'db', 'conn'))

  // Replace with your article ID
  const articleId = '66fcbf446ccd34b83e245177' // Example ID

  console.log('Starting highlight generation...')
  generateHighlightForArticle({ articleId, lang: 'hi' })
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
