const generateHighlightForArticle = require('./generateHighlightForArticle')

// Use it with any article ID
const articleId = '66fcbf446ccd34b83e245177'
generateHighlightForArticle(articleId)
  .then(highlight => {
    console.log('Generated highlight:', highlight)
  })
  .catch(error => {
    console.error('Generation failed:', error)
  })
