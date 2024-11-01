const ArticleHighlight = require('../model/articleHighlightSchema')
const Article = require('../model/articleSchema')
const generateHighlightForArticle = require('./generateHighlightForArticle')

// Use it with any article ID
const func = async () => {
  try {
    console.log('Starting highlight generation...')
    const articleIds = await Article.find({})
      .select('_id')
      .sort({
        dateTime: -1,
      })
      .limit(500)
    console.log('Article IDs:', articleIds.length)
    let num = 0
    for (let articleId of articleIds) {
      const highlights = await ArticleHighlight.find({ articleId })
      if (highlights.length > 0) {
        console.log('Highlights already exist for article:', num)
        num++
        continue
      }
      try {
        await generateHighlightForArticle({ articleId, lang: 'hi' })
      } catch (error) {
        console.error('Error:', error)
      }
      try {
        await generateHighlightForArticle({ articleId, lang: 'en' })
      } catch (error) {
        console.error('Error:', error)
      }

      console.log('Generated highlights for article:', num++)
    }
  } catch (error) {
    console.error('Error:', error)
  }
}

func()
