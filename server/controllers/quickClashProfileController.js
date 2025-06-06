// controllers/quickClashProfileController.js
const asyncHandler = require('express-async-handler')
const {
  getQuickClashProfile,
  getQuickClashAchievements,
  getQuickClashRecentMatches,
  getQuickClashStatistics,
} = require('../services/quickClashServices/quickClashProfileService')

/**
 * @desc    Get Quick Clash profile data for current user
 * @route   GET /api/quickClash/profile
 * @access  Private
 */
const getCurrentUserProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id

  try {
    const profile = await getQuickClashProfile({ userId })

    res.status(200).json({
      success: true,
      profile,
    })
  } catch (error) {
    console.error('Error fetching current user Quick Clash profile:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch Quick Clash profile',
    })
  }
})

/**
 * @desc    Get Quick Clash profile data for specific user
 * @route   GET /api/quickClash/profile/:userId
 * @access  Private
 */
const getUserProfile = asyncHandler(async (req, res) => {
  const { userId } = req.params

  try {
    const profile = await getQuickClashProfile({ userId })

    res.status(200).json({
      success: true,
      profile,
    })
  } catch (error) {
    console.error('Error fetching user Quick Clash profile:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch Quick Clash profile',
    })
  }
})

/**
 * @desc    Get Quick Clash achievements for user
 * @route   GET /api/quickClash/profile/:userId/achievements
 * @access  Private
 */
const getUserAchievements = asyncHandler(async (req, res) => {
  const { userId } = req.params

  try {
    const achievements = await getQuickClashAchievements({ userId })

    res.status(200).json({
      success: true,
      achievements,
    })
  } catch (error) {
    console.error('Error fetching Quick Clash achievements:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch achievements',
    })
  }
})

/**
 * @desc    Get Quick Clash recent matches for user
 * @route   GET /api/quickClash/profile/:userId/matches
 * @access  Private
 */
const getUserRecentMatches = asyncHandler(async (req, res) => {
  const { userId } = req.params
  const { limit = 10 } = req.query

  try {
    const matches = await getQuickClashRecentMatches({
      userId,
      limit: parseInt(limit),
    })

    res.status(200).json({
      success: true,
      matches,
    })
  } catch (error) {
    console.error('Error fetching Quick Clash recent matches:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch recent matches',
    })
  }
})

/**
 * @desc    Get Quick Clash detailed statistics for user
 * @route   GET /api/quickClash/profile/:userId/statistics
 * @access  Private
 */
const getUserStatistics = asyncHandler(async (req, res) => {
  const { userId } = req.params

  try {
    const statistics = await getQuickClashStatistics({ userId })

    res.status(200).json({
      success: true,
      statistics,
    })
  } catch (error) {
    console.error('Error fetching Quick Clash statistics:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch statistics',
    })
  }
})

module.exports = {
  getCurrentUserProfile,
  getUserProfile,
  getUserAchievements,
  getUserRecentMatches,
  getUserStatistics,
}
