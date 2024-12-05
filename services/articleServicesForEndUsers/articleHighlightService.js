const ArticleHighlight = require('../../model/articleHighlightSchema')
const {
  generateHighlightForArticle,
} = require('../../utils/article.highlight.utils')

async function getOrGenerateHighlights(articleId, lang, fromCache = false) {
  try {
    let highlights = await ArticleHighlight.findOne({
      articleId,
      processingStatus: 'completed',
      language: lang || 'en',
    })

    // Handle empty highlights
    if (
      highlights?.dictionary?.length === 0 &&
      highlights?.importantSentences?.length === 0
    ) {
      await ArticleHighlight.deleteOne({
        articleId,
        processingStatus: 'completed',
        language: lang || 'en',
      })
      highlights = null
    }

    // Generate new highlights if needed
    if (
      !highlights ||
      highlights.processingStatus !== 'completed' ||
      (highlights.dictionary.length === 0 &&
        highlights.importantSentences.length === 0)
    ) {
      if (fromCache) return highlights
      try {
        highlights = await generateHighlightForArticle({
          articleId,
          lang: lang || 'en',
        })
      } catch (error) {
        console.error('Error generating highlights:', error)
        highlights = { dictionary: [], importantSentences: [] }
      }
    }

    return highlights
  } catch (error) {
    console.error('Error in getOrGenerateHighlights:', error)
    return { dictionary: [], importantSentences: [] }
  }
}

module.exports = { getOrGenerateHighlights }
