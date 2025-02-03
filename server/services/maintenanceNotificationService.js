const User = require('../model/userSchema')
const { sendNotification } = require('./notificationService')

const sendMaintenanceCompletionNotification = async ({
  maintenanceId,
  reason,
}) => {
  try {
    // Get all active users
    const users = await User.find({
      role: { $ne: 'guest' },
    }).select('_id')

    // Create notifications in batches
    const batchSize = 100
    for (let i = 0; i < users.length; i += batchSize) {
      const userBatch = users.slice(i, i + batchSize)

      // Send push notifications
      for (const user of userBatch) {
        await sendNotification({
          userId: user._id,
          title: 'Maintenance Complete',
          body: `Maintenance for ${reason} has been completed. You can now resume playing.`,
          url: '/',
        })
      }
    }

    console.log(
      `Maintenance completion notifications sent to ${users.length} users`,
    )
    return { success: true, notifiedUsers: users.length }
  } catch (error) {
    console.error('Error sending maintenance completion notifications:', error)
    throw error
  }
}

module.exports = {
  sendMaintenanceCompletionNotification,
}
