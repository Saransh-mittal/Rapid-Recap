const Article = require('../../model/articleSchema')

const removeArticle = async () => {
  try {
    const thresholdDate = '2024-04-01'
    await Article.deleteMany({ dateTime: { $lt: thresholdDate } })
    console.log('Articles removed successfully')
  } catch (error) {
    console.error(error)
  }
}

removeArticle()
