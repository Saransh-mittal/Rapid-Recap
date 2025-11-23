/**
 * Manual Trigger for Forge Quiz Generation (Simplified)
 *
 * USAGE:
 * Run this script manually to process draft Forge Articles
 *
 * From terminal:
 * node scripts/generateForgeQuizzes.js
 *
 * Or uncomment in app.js during development
 *
 * NOTE: This ONLY generates quizzes and stores them in ForgeArticle.
 * QuickClashChallenges and QuickClashQuizzes are created later during team battle matchmaking.
 */

const {
  processDraftForgeArticles,
  processForgeArticle,
} = require('../services/forgeQuizGenerationService')
const ForgeArticle = require('../model/quickClashSchemas/forgeArticleSchema')
/**
 * Process all draft articles
 */
async function processAll() {
  try {
    console.log('🎯 Starting Forge Quiz Generation...\n')

    // Process draft articles (limit: 10 by default)
    const results = await processDraftForgeArticles(100)

    console.log('\n📈 Final Results:')
    console.log(JSON.stringify(results, null, 2))
  } catch (error) {
    console.error('\n❌ Fatal error:', error)
    process.exit(1)
  }
}

/**
 * Process a single article by ID (for testing)
 */
async function processSingle(articleId) {
  try {
    console.log(`🎯 Processing single article: ${articleId}\n`)
    console.log('✅ Connected to database\n')

    // Fetch article
    const article = await ForgeArticle.findById(articleId)
    if (!article) {
      throw new Error(`Article not found: ${articleId}`)
    }

    // Process it
    const result = await processForgeArticle(article)

    console.log('\n📈 Result:')
    console.log(JSON.stringify(result, null, 2))

    // Show the generated quiz
    if (result.success) {
      console.log('\n📚 Generated Quiz:')
      const updatedArticle = await ForgeArticle.findById(articleId)
      console.log(JSON.stringify(updatedArticle.quickClashQuiz, null, 2))
    }
  } catch (error) {
    console.error('\n❌ Fatal error:', error)
    process.exit(1)
  }
}

// Check command line arguments
const args = process.argv.slice(2)

if (args.length === 0) {
  // No arguments - process all
  processAll()
} else if (args[0] === '--single' && args[1]) {
  // --single <articleId>
  processSingle(args[1])
} else {
  console.log('Usage:')
  console.log('  Process all: node scripts/generateForgeQuizzes.js')
  console.log(
    '  Process one: node scripts/generateForgeQuizzes.js --single <articleId>',
  )
  process.exit(1)
}
