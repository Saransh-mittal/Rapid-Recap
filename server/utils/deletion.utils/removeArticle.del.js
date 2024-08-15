const Article = require('../../model/articleSchema')

const removeArticle = async () => {
  try {
    const batchSize = 200
    let processed = 0
    let hasMore = true
    console.log('Removing tfidfVector from articles')
    while (hasMore) {
      // console.log(`Fetching ${batchSize} articles`)
      const articles = await Article.find({ tfidfVector: { $exists: true } })
        .limit(batchSize)
        .select('_id')

      if (articles.length === 0) {
        hasMore = false
        break
      }
      console.log(`Fetched ${articles.length} articles`)
      const ids = articles.map(article => article._id)
      await Article.updateMany(
        { _id: { $in: ids } },
        { $unset: { tfidfVector: '' } },
      )
      console.log(`Processed ${processed} documents`)
    }
    console.log('Articles removed successfully')
  } catch (error) {
    console.error(error)
  }
}

removeArticle()
