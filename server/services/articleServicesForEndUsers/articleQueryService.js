const Article = require('../../model/articleSchema')

async function queryArticles({ category, page, pageSize, dateFilter = null }) {
  const query = {
    category: { $regex: new RegExp('^' + category, 'i') },
  }

  if (dateFilter) {
    query.dateTime = { $gte: dateFilter.toISOString() }
  }

  const articles = await Article.find(query)
    .sort({
      dateTime: -1,
      'sentiments.compound': -1,
    })
    .skip((page - 1) * pageSize)
    .limit(pageSize)

  if (!articles || articles.length === 0) {
    console.log('No articles found for query:', query)
    return null
  }

  return articles
}

module.exports = { queryArticles }
