// controllers/referralController.js

const asyncHandler = require('express-async-handler')
const User = require('../model/userSchema')
const {
  assignReferralCode,
  applyReferralCode,
} = require('../services/referralService')
const { validateReferralCode } = require('../utils/referral.utils')

// @desc    Get user's referral code
// @route   GET /api/user/referral-code
// @access  Private
const getReferralCode = asyncHandler(async (req, res) => {
  try {
    const code = await assignReferralCode(req.user._id)
    res.status(200).json({
      referralCode: code,
      referralLink: `https://rapidrecap.ai/#signin?ref=${code}`,
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// @desc    Apply referral code
// @route   POST /api/user/apply-referral
// @access  Private
const applyReferralCodeHandler = asyncHandler(async (req, res) => {
  try {
    const { referralCode } = req.body

    await applyReferralCode({
      referralCode,
      refereeId: req.user._id,
    })

    res.status(200).json({
      message: 'Referral code applied successfully',
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// @desc    Get user's referral stats
// @route   GET /api/user/referral-stats
// @access  Private
const getReferralStats = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('referralCode referralCount referrals')
      .populate('referrals.user', 'inGameName')

    res.status(200).json({
      referralCode: user.referralCode,
      referralCount: user.referralCount,
      referrals: user.referrals,
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// @desc    Check referral code
// @route   GET /api/user/check-referral
// @access  Private
const checkReferralCode = asyncHandler(async (req, res) => {
  const { referralCode } = req.query

  try {
    // Validate code format
    if (!validateReferralCode(referralCode)) {
      return res.status(400).json({ error: 'Invalid referral code format' })
    }

    // Find referrer
    const referrer = await User.findOne({ referralCode }).select(
      'name inGameName pic',
    )

    if (!referrer) {
      return res.status(404).json({ error: 'Invalid referral code' })
    }

    // Prevent self-referral
    if (req.user && referrer._id.toString() === req.user._id.toString()) {
      return res
        .status(400)
        .json({ error: 'Cannot use your own referral code' })
    }

    res.status(200).json({
      name: referrer.name,
      inGameName: referrer.inGameName,
      pic: referrer.pic,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = {
  getReferralCode,
  applyReferralCodeHandler,
  getReferralStats,
  checkReferralCode,
}
