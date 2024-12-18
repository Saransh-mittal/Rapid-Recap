// services/newUserRecommendationService.js

const Article = require('../model/articleSchema')
const { formatPreferredCategories } = require('../utils/user.utils')

async function getTrendingArticlesForCategories({ categories, limit = 270 }) {
  try {
    // Get current date minus 48 hours for trending calculation
    const trendingDateThreshold = new Date()
    trendingDateThreshold.setHours(trendingDateThreshold.getHours() - 48)

    // Aggregate pipeline to get trending articles per category
    const pipeline = [
      {
        $match: {
          category: { $in: categories },
          dateTime: {
            $gte: trendingDateThreshold.toISOString(),
          },
        },
      },
      // Lookup quiz attempts
      {
        $lookup: {
          from: 'quiz_attempts',
          localField: '_id',
          foreignField: 'article',
          as: 'attempts',
        },
      },
      // Lookup time spent
      {
        $lookup: {
          from: 'timespents',
          localField: '_id',
          foreignField: 'articleId',
          as: 'timeSpentData',
        },
      },
      {
        $addFields: {
          attemptCount: { $size: '$attempts' },
          totalTimeSpent: {
            $sum: '$timeSpentData.timeSpent',
          },
          // Calculate recency score (1 for newest, decreasing with age)
          recencyScore: {
            $let: {
              vars: {
                maxAge: 48, // hours
                hoursAgo: {
                  $divide: [
                    { $subtract: [new Date(), { $toDate: '$dateTime' }] },
                    1000 * 60 * 60, // convert to hours
                  ],
                },
              },
              in: {
                $subtract: [1, { $divide: ['$$hoursAgo', '$$maxAge'] }],
              },
            },
          },
        },
      },
      {
        $addFields: {
          // Normalize attempt count (0-1)
          normalizedAttempts: {
            $min: [1, { $divide: ['$attemptCount', 10] }],
          },
          // Normalize time spent (0-1)
          normalizedTimeSpent: {
            $min: [1, { $divide: ['$totalTimeSpent', 300] }], // 5 minutes = 300 seconds
          },
        },
      },
      {
        $addFields: {
          // Calculate trending score
          trendingScore: {
            $add: [
              { $multiply: ['$normalizedAttempts', 0.3] }, // 30% weight
              { $multiply: ['$normalizedTimeSpent', 0.3] }, // 30% weight
              { $multiply: ['$recencyScore', 0.4] }, // 40% weight
            ],
          },
        },
      },
      {
        $sort: { trendingScore: -1 },
      },
      // Group by category to ensure distribution
      {
        $group: {
          _id: '$category',
          articles: {
            $push: {
              _id: '$_id',
              trendingScore: '$trendingScore',
              category: '$category',
            },
          },
        },
      },
    ]

    const categorizedArticles = await Article.aggregate(pipeline)

    // Calculate articles per category
    const articlesPerCategory = Math.ceil(limit / categories.length)

    // Collect articles ensuring fair distribution
    let recommendations = []
    categorizedArticles.forEach(categoryGroup => {
      const categoryArticles = categoryGroup.articles
        .slice(0, articlesPerCategory)
        .map(article => article._id.toString())
      recommendations.push(...categoryArticles)
    })

    // If we need more articles, get recent ones from the categories
    if (recommendations.length < limit) {
      const additionalArticles = await Article.find({
        category: { $in: categories },
        _id: { $nin: recommendations },
      })
        .sort({ dateTime: -1 })
        .limit(limit - recommendations.length)
        .select('_id')

      recommendations.push(...additionalArticles.map(a => a._id.toString()))
    }

    // Shuffle recommendations
    recommendations = recommendations.sort(() => Math.random() - 0.5)

    return recommendations.slice(0, limit)
  } catch (error) {
    console.error('Error getting trending articles:', error)
    throw error
  }
}

async function bootstrapNewUserRecommendations({
  userId,
  preferredCategories,
}) {
  try {
    // Format categories for processing
    const formattedCategories = formatPreferredCategories(preferredCategories)
    const categories = formattedCategories.map(cat => cat.category)

    // Get trending articles for preferred categories
    const recommendations = await getTrendingArticlesForCategories({
      categories,
      limit: 270,
    })

    // Create initial category weights (equal distribution)
    const initialCategories = {}
    const weightPerCategory = 1.0 / categories.length

    categories.forEach(category => {
      initialCategories[category] = {
        weight: weightPerCategory,
        isInferred: false,
      }
    })

    return {
      recommendations,
      initialCategories,
    }
  } catch (error) {
    console.error('Error bootstrapping new user recommendations:', error)
    throw error
  }
}

module.exports = {
  getTrendingArticlesForCategories,
  bootstrapNewUserRecommendations,
}
