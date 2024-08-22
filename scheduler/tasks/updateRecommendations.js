const {
  updateRecommendations,
} = require('../../services/recommendationService')
const User = require('../../model/userSchema')
const { Recommendation } = require('../../model/recommendationSchema')

async function updateDailyRecommendations() {
  console.log('Running daily recommendation updates')
  try {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const activeUsers = await User.find({ lastLogin: { $gte: thirtyDaysAgo } })
    console.log('Active users found:', activeUsers.length)
    // update many is Updating to false
    await Recommendation.updateMany({ isUpdating: true }, { isUpdating: false })
    for (const user of activeUsers) {
      await updateRecommendations(user._id.toString())
    }
    const usersInRecommendations = await Recommendation.find({}).select(
      'user_id',
    )
    for (const user of usersInRecommendations) {
      const userFound = await User.findById(user.user_id)
      if (!userFound) {
        await Recommendation.findOneAndDelete({ user_id: user.user_id })
      }
    }
    console.log('Daily recommendation updates completed')
  } catch (error) {
    console.error('Error in daily recommendation updates:', error)
  }
}

module.exports = updateDailyRecommendations
