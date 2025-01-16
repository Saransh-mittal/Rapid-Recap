const Article = require('../model/articleSchema')
const { calculateArticleDifficulty } = require('../utils/article.utils')

const checkArticleDifficulty = async () => {
  try {
    const articles = await Article.find({
      createdAt: {
        $gte: '2025-01-01T00:00:00.000Z',
        $lt: '2025-01-05T00:00:00.000Z',
      },
    }).lean()
    let difficulties = []
    for (let article of articles) {
      difficulties.push(
        calculateArticleDifficulty({ mainText: article.mainText }),
      )
    }

    const categorize = difficulty => {
      if (difficulty < 0.5) return 'Easy'
      if (difficulty < 0.7) return 'Medium'
      return 'Hard'
    }

    const categorizedDifficulties = difficulties.map(categorize)
    const categoryCounts = categorizedDifficulties.reduce((acc, category) => {
      acc[category] = (acc[category] || 0) + 1
      return acc
    }, {})

    console.log('Difficulty Distribution:')
    console.log(categoryCounts)

    const totalDifficulties = difficulties.length
    const percentages = Object.keys(categoryCounts).reduce((acc, category) => {
      acc[category] =
        ((categoryCounts[category] / totalDifficulties) * 100).toFixed(2) + '%'
      return acc
    }, {})

    console.log('\nPercentage Distribution:')
    console.log(percentages)

    // Additional Statistical Analysis
    const mean =
      difficulties.reduce((sum, diff) => sum + diff, 0) / difficulties.length
    const median = difficulties.sort((a, b) => a - b)[
      Math.floor(difficulties.length / 2)
    ]
    const min = Math.min(...difficulties)
    const max = Math.max(...difficulties)

    console.log('\nStatistical Summary:')
    console.log({
      mean: mean.toFixed(2),
      median: median.toFixed(2),
      min: min.toFixed(2),
      max: max.toFixed(2),
    })
  } catch (error) {
    console.error('Error in checkArticleDifficulty:', error)
  }
}
checkArticleDifficulty()
