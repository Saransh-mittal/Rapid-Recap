const asyncHandler = require('express-async-handler')
const DemotionSummary = require('../model/demotionSummarySchema')

const getDemotionSummary = asyncHandler(async (req, res) => {
  const userId = req.user._id

  const summary = await DemotionSummary.findOne({
    userId,
    viewed: false,
    expiryDate: { $gt: new Date() },
  })

  if (!summary) {
    return res.json({
      isVisible: false,
    })
  }

  // Mark as viewed
  summary.viewed = true
  await summary.save()

  res.json({
    isVisible: true,
    prevIQ: summary.prevIQ,
    newIQ: summary.newIQ,
    prevSociety: summary.prevSociety,
    newSociety: summary.newSociety,
    prevCircle: summary.prevCircle,
    newCircle: summary.newCircle,
    prevRank: summary.prevRank,
    newRank: summary.newRank,
    expiryDate: summary.expiryDate,
  })
})

// Create demotion summary for a user after monthly reset
const createDemotionSummary = asyncHandler(
  async ({
    userId,
    prevIQ,
    newIQ,
    prevSociety,
    newSociety,
    prevCircle,
    newCircle,
  }) => {
    const expiryDate = new Date()
    expiryDate.setDate(expiryDate.getDate() + 20) // 20 days expiry

    await DemotionSummary.create({
      userId,
      prevIQ,
      newIQ,
      prevSociety,
      newSociety,
      prevCircle,
      newCircle,
      expiryDate,
    })
  },
)

module.exports = {
  getDemotionSummary,
  createDemotionSummary,
}
