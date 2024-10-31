const Article = require('../model/articleSchema')
const generateHighlightForArticle = require('./generateHighlightForArticle')

// Use it with any article ID
const articleIds = await Article.find().select('_id').limit(500)
let num = 0
for (let articleId of articleIds) {
  generateHighlightForArticle({ articleId, lang: 'hi' }).catch(error => {
    console.error('Generation failed:', error)
  })
  generateHighlightForArticle({ articleId, lang: 'en' }).catch(error => {
    console.error('Generation failed:', error)
  })
  console.log('Generated highlights for article:', num++)
}
