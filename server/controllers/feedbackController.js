const Feedback = require('../model/feedbackSchema')
const asyncHandler = require('express-async-handler')
const Story = require('../model/storySchema')
const StoryFeedback = require('../model/storyFeedbackSchema')

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

  // Update story's average rating
  story.totalRatings += 1
  story.averageRating =
    (story.averageRating * (story.totalRatings - 1) + rating) /
    story.totalRatings
  await story.save()

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

module.exports = {
  submitFeedback,
  createStoryFeedback,
  getStoryFeedbackStats,
  getStoryFeedback,
}
