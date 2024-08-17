const Article = require('../model/articleSchema')
const QuizAttempt = require('../model/quizAttemptSchema')
const {
  getRecommendations,
  getArticlePageRecommendations,
} = require('../services/recommendationService')

const userRecommendations = async (req, res) => {
  try {
    const userId = req.user._id

    const page = parseInt(req.query.page) || 1
    const pageSize = parseInt(req.query.pageSize) || 18

    const recommendations = await getRecommendations(userId, page, pageSize)
    const articles = []
    for (let recommendation of recommendations) {
      const article = await Article.findById(recommendation._id)
      articles.push(article)
    }
    res.status(201).json(articles)
  } catch (error) {
    console.error('Error getting recommendations:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
const articlePageRecommendations = async (req, res) => {
  try {
    const userId = req.user._id
    const { articleId } = req.params
    const page = parseInt(req.query.page) || 1
    const pageSize = parseInt(req.query.pageSize) || 18

    const articles = await getArticlePageRecommendations(
      userId,
      articleId,
      page,
      pageSize,
    )

    res.status(200).json(articles)
  } catch (error) {
    console.error('Error getting no quiz attempt recommendations:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

module.exports = {
  userRecommendations,
  articlePageRecommendations,
}
