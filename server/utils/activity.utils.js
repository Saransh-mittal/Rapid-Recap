const mongoose = require('mongoose')
const Activity = require('../model/activitySchema')
const User = require('../model/userSchema')
const { getXpForActivity, activityTypes } = require('../data/activityTypes')
const NoteMessage = require('../model/noteMessageSchema')

const MAX_RETRIES = 10
const BASE_RETRY_DELAY_MS = 500

const logActivity = async ({
  userInGameName,
  type,
  userIQ,
  previousIQ,
  date = new Date(),
  consecutiveQuizCount = 0,
}) => {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const session = await mongoose.startSession()
    try {
      session.startTransaction()

      const user = await User.findOne({ inGameName: userInGameName }).session(
        session,
      )
      if (!user) throw new Error('User not found')
      const isXpAlreadyAwarded = await Activity.find({
        userId: user._id,
        type,
        timestamp: date,
      })

      if (isXpAlreadyAwarded.length > 0) {
        return 0
      }

      if (type === '5-day login streak') {
        const newNoteMessage = new NoteMessage({
          userId: user._id,
          title: '5-day login streak',
          isMilestone: true,
          milestoneContent: `Congratulations! You have logged in for ${user.loginStreak} days in a row!`,
          messageType: 'xpAward',
          xpAwarded: activityTypes.FIVE_DAY_LOGIN_STREAK.xp,
        })
        await newNoteMessage.save({ session })
      }
      const xpAwarded = getXpForActivity({
        activityType: type,
        userIQ: userIQ || user.IQ_score,
        previousIQ: previousIQ || user.prevIQScore,
        consecutiveQuizCount,
      })

      const activity = new Activity({
        userId: user._id,
        type,
        xpAwarded,
        timestamp: date || new Date(),
      })

      await activity.save({ session })

      user.xp += xpAwarded
      let level = user.level
      const xpBaseAtCurrLevel = (level * (level + 1) * 10) / 2
      let totalXp = user.xp
      let leftXp = totalXp - xpBaseAtCurrLevel

      while (leftXp >= (level + 1) * 10) {
        level++
        leftXp -= level * 10
      }

      user.level = level
      user.activities.push(activity._id)

      await user.save({ session })

      await session.commitTransaction()
      session.endSession()
      return xpAwarded
    } catch (error) {
      await session.abortTransaction()
      session.endSession()

      if (
        error.name === 'MongoServerError' &&
        error.hasErrorLabel('TransientTransactionError')
      ) {
        if (attempt < MAX_RETRIES - 1) {
          const retryDelay =
            BASE_RETRY_DELAY_MS * Math.pow(2, attempt) +
            Math.floor(Math.random() * BASE_RETRY_DELAY_MS)
          await new Promise(resolve => setTimeout(resolve, retryDelay))
          continue
        }
      } else {
        console.error('Error logging activity:', error)
      }

      throw error
    }
  }
  throw new Error('Max retries reached, transaction failed.')
}

module.exports = { logActivity }
