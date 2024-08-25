const mongoose = require('mongoose')
const TimeSpent = require('../model/timeSpentSchema')
const { logActivity } = require('../utils/activity.utils')
const User = require('../model/userSchema')
const { activityTypes } = require('../data/activityTypes')
const Activity = require('../model/activitySchema')

// @desc  Record the time spent by a user on an article
// @route POST /api/timeSpent
// @access Public
const timeSpent = async (req, res) => {
  try {
    // req.on('data', chunk => {
    //   body += chunk.toString() // convert Buffer to string
    // })

    const { userId, articleId, timeSpent } = req.body
    //console.log("Request body:", { userId, articleId, timeSpent });

    // Validate input
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).send({ error: 'Invalid userId' })
    }
    if (!mongoose.Types.ObjectId.isValid(articleId)) {
      return res.status(400).send({ error: 'Invalid articleId' })
    }
    if (typeof timeSpent !== 'number' || timeSpent <= 0) {
      return res.status(400).send({ error: 'Invalid timeSpent' })
    }
    const user = await User.findById(userId).select('inGameName')

    // Get the current date in YYYY-MM-DD format
    const currentDate = new Date().toISOString().split('T')[0]

    // Check if there is an existing entry for the same day
    let timeEntry = await TimeSpent.findOne({
      userId,
      articleId,
      date: currentDate,
    })

    if (timeEntry) {
      // Update the existing entry
      timeEntry.timeSpent += timeSpent
      await timeEntry.save()
    } else {
      // Create a new entry
      timeEntry = new TimeSpent({
        userId,
        articleId,
        timeSpent,
        date: currentDate,
      })
      await timeEntry.save()
    }

    const TodaysTimeEntry = await TimeSpent.find({ userId, date: currentDate })
    let totaltime = 0
    TodaysTimeEntry.forEach(entry => {
      totaltime += entry.timeSpent
    })

    // Award XP if time spent is >= 10 minutes (10 * 60 * 1000 milliseconds)
    let xpAwardedForTimeSpentMoreThan10Min = false
    if (totaltime >= 10 * 60 * 1000) {
      const alreadyActivityIsStored = await Activity.findOne({
        userId: userId,
        type: activityTypes.TIME_SPENT.type,
        timestamp: currentDate,
      })
      if (!alreadyActivityIsStored) {
        await logActivity({
          userInGameName: user.inGameName,
          type: activityTypes.TIME_SPENT.type,
          date: currentDate,
        })
        xpAwardedForTimeSpentMoreThan10Min = true
      }
    }

    res.status(201).json({
      message: 'success',
      xpAwardedForTimeSpentMoreThan10Min,
      ok: true,
    })
  } catch (error) {
    console.error('Error recording time spent:', error)
    res.status(500).send({ error: 'Internal Server Error' })
  }
}

module.exports = { timeSpent }
