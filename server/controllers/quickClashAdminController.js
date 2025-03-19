// controllers/quickClashAdminController.js
const asyncHandler = require('express-async-handler')
const {
  getAvailableBots,
  simulateInterBotChallenge,
  simulateMultipleInterBotChallenges,
} = require('../services/quickClashServices/interBotQuickClashService')
const QuickClashChallenge = require('../model/quickClashSchemas/quickClashChallengeSchema')

/**
 * @desc    Get available bot users for Quick Clash
 * @route   GET /api/admin/quickclash/bots
 * @access  Private/Admin
 */
const getQuickClashBots = asyncHandler(async (req, res) => {
  const { count } = req.query

  try {
    const bots = await getAvailableBots({
      count: count ? parseInt(count) : 10,
    })

    res.status(200).json({
      success: true,
      count: bots.length,
      bots,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get bot users',
    })
  }
})

/**
 * @desc    Simulate a single inter-bot challenge
 * @route   POST /api/admin/quickclash/simulate
 * @access  Private/Admin
 */
const simulateInterBotQuickClash = asyncHandler(async (req, res) => {
  const { challengerId, opponentId, categories, options } = req.body

  if (!challengerId || !opponentId) {
    return res.status(400).json({
      success: false,
      message: 'Challenger ID and opponent ID are required',
    })
  }

  try {
    const result = await simulateInterBotChallenge({
      challengerId,
      opponentId,
      categories,
      options,
    })

    res.status(200).json({
      success: true,
      result,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to simulate inter-bot challenge',
    })
  }
})

/**
 * @desc    Simulate multiple inter-bot challenges
 * @route   POST /api/admin/quickclash/simulate-multiple
 * @access  Private/Admin
 */
const simulateMultipleInterBotQuickClashes = asyncHandler(async (req, res) => {
  const { count, categories, options } = req.body

  try {
    const results = await simulateMultipleInterBotChallenges({
      count: count || 5,
      categories,
      options,
    })

    res.status(200).json({
      success: true,
      count: results.length,
      results,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        error.message || 'Failed to simulate multiple inter-bot challenges',
    })
  }
})

/**
 * @desc    Get recent inter-bot Quick Clash results
 * @route   GET /api/admin/quickclash/results
 * @access  Private/Admin
 */
const getInterBotResults = asyncHandler(async (req, res) => {
  const { limit = 20 } = req.query

  try {
    // Modified query to properly find challenges between bot users
    // This uses a simpler approach that's more reliable
    const challenges = await QuickClashChallenge.find({
      status: 'completed',
      // Only look at completed challenges with scores
      challengerAttempted: true,
      opponentAttempted: true,
    })
      .populate({
        path: 'challenger',
        select: 'name inGameName email',
        match: { email: { $regex: /^dummy\d+@mail\.com$/ } },
      })
      .populate({
        path: 'opponent',
        select: 'name inGameName email',
        match: { email: { $regex: /^dummy\d+@mail\.com$/ } },
      })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))

    // Filter out challenges where either challenger or opponent is null (not a bot)
    const botChallenges = challenges.filter(
      challenge => challenge.challenger && challenge.opponent,
    )

    res.status(200).json({
      success: true,
      count: botChallenges.length,
      results: botChallenges,
    })
  } catch (error) {
    console.error('Error fetching inter-bot results:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch inter-bot results',
    })
  }
})

module.exports = {
  getQuickClashBots,
  simulateInterBotQuickClash,
  simulateMultipleInterBotQuickClashes,
  getInterBotResults,
}
