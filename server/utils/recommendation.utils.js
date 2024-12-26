// utils/recommendation.utils.js
const TimeSpent = require('../model/timeSpentSchema')
const { Recommendation } = require('../model/recommendationSchema')
const mongoose = require('mongoose')
//mongoose.Types.ObjectId.createFromHexString(userId)

// utils/recommendation.utils.js
const eliminateArticlesWithLongTimeSpent = async ({
  userId,
  eliminationThreshold = 20,
}) => {
  try {
    // console.log('\nStarting article elimination process...')
    // console.log('User ID:', userId)

    // Find articles with long time spent
    const longTimeSpentArticles = await TimeSpent.aggregate([
      {
        $match: {
          userId: mongoose.Types.ObjectId.createFromHexString(userId),
          timeSpent: { $gt: eliminationThreshold * 1000 },
        },
      },
      {
        $project: {
          articleId: 1,
          timeSpent: 1,
        },
      },
    ])

    // Get current recommendations
    const recommendations = await Recommendation.findOne({
      user_id: mongoose.Types.ObjectId.createFromHexString(userId),
    })

    if (!recommendations?.recommendations) {
      console.log('No recommendations found for user')
      return { eliminated: 0, matchingIds: [] }
    }

    // Convert article IDs to strings for comparison
    const timeSpentIds = new Set(
      longTimeSpentArticles.map(item => item.articleId.toString()),
    )

    // Find recommendations that match the time spent articles
    const initialCount = recommendations.recommendations.length
    const matchingIds = recommendations.recommendations
      .filter(rec => timeSpentIds.has(rec._id.toString()))
      .map(rec => rec._id.toString())

    // console.log('\nMatching Details:')
    // console.log('Time Spent Articles:', longTimeSpentArticles.length)
    // console.log('Current Recommendations:', initialCount)
    // console.log('Matching articles found:', matchingIds.length)

    if (matchingIds.length > 0) {
      // Log sample recommendation structure
      // console.log('\nSample recommendation structure:')
      if (recommendations.recommendations.length > 0) {
        // console.log(JSON.stringify(recommendations.recommendations[0], null, 2))
      }

      // console.log('\nAttempting to remove the following IDs:', matchingIds)

      // Filter out the matching recommendations
      const updatedRecommendations = recommendations.recommendations.filter(
        rec => !matchingIds.includes(rec._id.toString()),
      )

      // Perform the update
      const updateResult = await Recommendation.updateOne(
        { user_id: mongoose.Types.ObjectId.createFromHexString(userId) },
        { $set: { recommendations: updatedRecommendations } },
      )

      // Verify the update
      const verificationResult = await Recommendation.findOne({
        user_id: mongoose.Types.ObjectId.createFromHexString(userId),
      })

      const finalCount = verificationResult.recommendations.length

      // console.log('\nUpdate Results:')
      // console.log('Initial count:', initialCount)
      // console.log('Articles removed:', matchingIds.length)
      // console.log('Final count:', finalCount)
      // console.log('Update successful:', updateResult.modifiedCount > 0)

      return {
        eliminated: matchingIds.length,
        matchingIds,
        updateResult: {
          originalCount: initialCount,
          newCount: finalCount,
          difference: initialCount - finalCount,
          success: updateResult.modifiedCount > 0,
          operationResult: updateResult,
        },
      }
    }

    // console.log('No matching articles found to eliminate')
    return {
      eliminated: 0,
      matchingIds: [],
      updateResult: {
        originalCount: initialCount,
        newCount: initialCount,
        difference: 0,
        success: false,
      },
    }
  } catch (error) {
    console.error('Error in article elimination process:', error)
    throw error
  }
}

module.exports = {
  eliminateArticlesWithLongTimeSpent,
}
