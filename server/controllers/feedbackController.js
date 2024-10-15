const Feedback = require('../model/feedbackSchema')
const asyncHandler = require('express-async-handler')
const Story = require('../model/storySchema')
const StoryFeedback = require('../model/storyFeedbackSchema')
const QuizFeedback = require('../model/quizFeedbackSchema')
const Quiz = require('../model/quizSchema')
const TournamentQuizFeedback = require('../model/tournamentQuizFeedbackSchema')
const Tournament = require('../model/tournamentSchema')

const submitFeedback = async (req, res) => {
  try {
    const { email, answers } = req.body

    // Create a new feedback document
    const feedback = new Feedback({
      email,
      answers,
    })

    // Save the feedback document to the database
    await feedback.save()

    res.status(201).json({ message: 'Feedback submitted successfully' })
  } catch (error) {
    console.error('Error submitting feedback:', error)
    res.status(500).json({ message: 'Failed to submit feedback' })
  }
}

// @desc   Create a new feedback for a story
// @route  POST /api/contact/feedback/story
// @access Private
const createStoryFeedback = asyncHandler(async (req, res) => {
  const { storyId, rating, message } = req.body
  const userId = req.user._id // Assuming you have user authentication middleware

  const story = await Story.findById(storyId).populate('originalArticle')
  if (!story) {
    res.status(404)
    throw new Error('Story not found')
  }
  const existingFeedback = await StoryFeedback.findOne({
    story: storyId,
    user: userId,
  })
  if (existingFeedback) {
    return res.status(400).json({ message: 'Feedback already submitted' })
  }
  const newFeedback = new StoryFeedback({
    story: storyId,
    user: userId,
    rating,
    message,
    category: story.originalArticle.category,
    theme: story.theme,
  })

  await newFeedback.save()

  res.status(201).json(newFeedback)
})

// @desc   Get feedback for a story
// @route  GET /api/admin/feedback/singleStory/:storyId
// @access Admin
const getStoryFeedback = asyncHandler(async (req, res) => {
  const { storyId } = req.params
  if (!storyId) {
    res.status(400)
    throw new Error('Story ID is required')
  }
  console.log('storyId', storyId)
  const feedback = await StoryFeedback.find({ story: storyId })

  res.json(feedback)
})

// @desc   Get average rating and total feedback count for stories
// @route  GET /api/admin/feedback/story/stats
// @access Admin
const getStoryFeedbackStats = asyncHandler(async (req, res) => {
  const { category, theme } = req.query

  const matchCriteria = {}
  if (category) matchCriteria.category = category
  if (theme) matchCriteria.theme = theme

  const stats = await StoryFeedback.aggregate([
    { $match: matchCriteria },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalFeedback: { $sum: 1 },
      },
    },
  ])

  res.json(stats[0] || { averageRating: 0, totalFeedback: 0 })
})

// @desc  Create a new feedback for a quiz
// @route POST /api/contact/feedback/quiz
// @access Private
const createQuizFeedback = asyncHandler(async (req, res) => {
  const { quizId, rating, message } = req.body
  const userId = req.user._id // Assuming you have user authentication middleware

  const quiz = await Quiz.findById(quizId).populate('article')
  if (!quiz) {
    res.status(404)
    throw new Error('Quiz not found')
  }

  const existingFeedback = await QuizFeedback.findOne({
    quiz: quizId,
    user: userId,
  })
  if (existingFeedback) {
    return res.status(400).json({ message: 'Feedback already submitted' })
  }
  const newFeedback = new QuizFeedback({
    quiz: quizId,
    user: userId,
    rating,
    message,
    category: quiz.article.category,
  })

  await newFeedback.save()

  // Update quiz's average rating
  quiz.totalRatings += 1
  quiz.averageRating =
    (quiz.averageRating * (quiz.totalRatings - 1) + rating) / quiz.totalRatings
  await quiz.save()

  res.status(201).json(newFeedback)
})
// @desc   Get average rating and total feedback count for quizzes
// @route  GET /api/admin/feedback/quiz/stats
// @access Admin
const getQuizFeedbackStats = asyncHandler(async (req, res) => {
  const { category } = req.query

  const matchCriteria = {}
  if (category) matchCriteria.category = category

  const stats = await QuizFeedback.aggregate([
    { $match: matchCriteria },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalFeedback: { $sum: 1 },
      },
    },
  ])

  res.json(stats[0] || { averageRating: 0, totalFeedback: 0 })
})

// @desc   Get feedback for a quiz
// @route  GET /api/admin/feedback/quiz/:quizId
// @access Admin
const getQuizFeedback = async (req, res) => {
  try {
    const { quizId } = req.query

    // Find all feedback for the quiz
    const feedback = await QuizFeedback.find({ quiz: quizId })

    res.json(feedback)
  } catch (error) {
    console.error('Error getting quiz feedback:', error)
    res.status(500).json({ message: 'Failed to get quiz feedback' })
  }
}

// @desc  Create a new feedback for a Tournament
// @route POST /api/contact/feedback/tournament
// @access Private
const createTournamentFeedback = asyncHandler(async (req, res) => {
  const { tournamentId, rating, message, category } = req.body
  const userId = req.user._id // Assuming you have user authentication middleware

  const tournament = await Tournament.findById(tournamentId)
  if (!tournament) {
    res.status(404)
    throw new Error('Tournament not found')
  }

  const existingFeedback = await TournamentQuizFeedback.findOne({
    tournament: tournamentId,
    user: userId,
  })
  if (existingFeedback) {
    return res.status(400).json({ message: 'Feedback already submitted' })
  }

  const newFeedback = new TournamentQuizFeedback({
    tournament: tournamentId,
    user: userId,
    rating,
    message,
    category,
  })

  await newFeedback.save()

  res.status(201).json(newFeedback)
})

// @desc   Get feedback for a Tournament
// @route  GET /api/admin/feedback/tournament/:tournamentId
// @access Admin
const getTournamentFeedback = async (req, res) => {
  try {
    const { tournamentId } = req.params

    // Find all feedback for the tournament
    const feedback = await TournamentQuizFeedback.find({
      tournament: tournamentId,
    })

    res.json(feedback)
  } catch (error) {
    console.error('Error getting tournament feedback:', error)
    res.status(500).json({ message: 'Failed to get tournament feedback' })
  }
}

// @desc   Get average rating and total feedback count for Tournaments
// @route  GET /api/admin/feedback/tournament/stats
// @access Admin
const getTournamentFeedbackStats = asyncHandler(async (req, res) => {
  const stats = await TournamentQuizFeedback.aggregate([
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalFeedback: { $sum: 1 },
      },
    },
  ])

  res.json(stats[0] || { averageRating: 0, totalFeedback: 0 })
})

module.exports = {
  submitFeedback,
  createStoryFeedback,
  getStoryFeedbackStats,
  getStoryFeedback,
  createQuizFeedback,
  getQuizFeedbackStats,
  getQuizFeedback,
  createTournamentFeedback,
  getTournamentFeedback,
  getTournamentFeedbackStats,
}
