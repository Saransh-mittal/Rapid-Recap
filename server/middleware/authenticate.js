const jwt = require('jsonwebtoken')
const User = require('../model/userSchema')
const { logActivity } = require('../utils/activity.utils')
const { activityTypes } = require('../data/activityTypes')

const Authenticate = async (req, res, next) => {
  try {
    const token = req.cookies.jwtoken
    jwt.verify(token, process.env.SECRET_KEY, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Token is not valid' })
      }

      // If the token is valid, attach the user data to the request object
      req.user = decoded
      const user = await User.findById(req.user._id).select(
        '_id name email role pic inGameName lastLogin loginStreak',
      )
      const today = new Date()
      today.setUTCHours(0, 0, 0, 0)
      // Initialize loginStreak if it doesn't exist
      if (user.loginStreak === undefined) {
        user.loginStreak = 0
      }

      if (user.lastLogin) {
        const lastLoginDate = new Date(user.lastLogin)
        lastLoginDate.setUTCHours(0, 0, 0, 0)

        const timeDiff = today.getTime() - lastLoginDate.getTime()
        const dayDiff = Math.floor(timeDiff / (24 * 60 * 60 * 1000))

        if (dayDiff === 1) {
          // Consecutive day login
          user.loginStreak++
        } else if (dayDiff > 1) {
          // Missed a day, reset streak
          user.loginStreak = 1
        }
        // If dayDiff === 0, it's the same day, don't change the streak
      } else {
        // First time login
        user.loginStreak = 1
      }

      if (user.loginStreak % 5 === 0 && user.loginStreak > 0) {
        logActivity({
          userInGameName: user.inGameName,
          type: activityTypes.FIVE_DAY_LOGIN_STREAK.type,
          date: today,
        })
      }

      user.lastLogin = today
      await user.save()
      //console.log(req.user);
      // Continue with the next middleware or route handler
      next()
    })
  } catch (error) {
    res.status(401).send('Unauthorized: No Token Provided')
    console.log(error)
  }
}

const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admins only.' })
  }
  next()
}

module.exports = { Authenticate, adminMiddleware }
