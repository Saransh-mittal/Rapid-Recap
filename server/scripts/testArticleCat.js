const newsClassifierService = require('../ml/services/newsClassifierService')
const Article = require('../model/articleSchema')

const test = async () => {
  const articles = await Article.find({
    category: { $ne: 'top' },
  })
    .sort({ dateTime: -1 })
    .limit(500)
  for (let article of articles) {
    const predictedCategory = await newsClassifierService.classifyNews(
      article.mainText,
    )
    console.log(
      'Predicted category:',
      predictedCategory,
      'Actual category:',
      article.category,
    )
    console.log('\n')
  }
}

test()
