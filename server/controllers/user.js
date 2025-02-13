const User = require('../model/userSchema')
const QuizAttempt = require('../model/quizAttemptSchema')

const bcrypt = require('bcryptjs')
const { generateOtp, mailTransporter } = require('../utils/mail.utils')
const VerificationToken = require('../model/verificationToken')
const { isValidObjectId } = require('mongoose')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const {
  getUserIQScoreHistory,
  currentTopPercentOfUser,
  getSolvedQuizzesCount,
  calculateUserRank,
  dailyStreakCalculator,
  longestStreakCalculator,

  makeFirstLoginFalse,
  getTheRevivalEndDay,
  calculateLoginStreak,
  retryableOnboardingUpdate,
} = require('../utils/user.utils')
const { dailyUserIQCalc } = require('../utils/dailyUserIQCalc.utils')
const ApplicationUpdates = require('../model/applicationUpdatesSchema')
// const { progressBar } = require("../utils/progress.utils");
const QuinBoost = require('../model/quinBoostSchema')
const MailTemplates = require('../data/MailTemplates.js')
const { isValidEmail, formatDate } = require('../utils/miscellaneous.utils.js')

const Article = require('../model/articleSchema.js')
const asyncHandler = require('express-async-handler')
const { logActivity } = require('../utils/activity.utils.js')
const { activityTypes } = require('../data/activityTypes.js')
const Activity = require('../model/activitySchema.js')
const cache = require('memory-cache')
const { hindiConverter } = require('../utils/article.utils.js')
const {
  quinBoostUnlockTemplate,
} = require('../data/inboxNotificationsTemplates.js')

const DailyIQ = require('../model/dailyIQSchema.js')
const FriendRequest = require('../model/friendRequestSchema.js')
const {
  Recommendation,
  NotifiedArticles,
} = require('../model/recommendationSchema.js')
const SeasonData = require('../model/seasonDataSchema.js')
const TimeSpent = require('../model/timeSpentSchema.js')
const {
  updateUserWithRetry,
  logActivityWithRetry,
} = require('../utils/dbOperations.js')
const moment = require('moment-timezone')
const { processBadgePrivileges } = require('../utils/tournament.utils.js')
const { getCategories } = require('../data/categories.js')
const Tournament = require('../model/tournamentSchema.js')
const { REWARDS_MODAL_CONFIG } = require('../config/rewardsModalConfig.js')
const Inventory = require('../model/inventorySchema.js')
const Ability = require('../model/abilitySchema.js')
const {
  checkActiveAbilities,
  calculateTotalEffect,
} = require('../services/abilityService.js')
const {
  verifyStreakSurgeEligibility,
  handleStreakSurgeEarned,
} = require('../services/abilityServices/streakSurgeService.js')

const registerUser = async (req, res) => {
  const { name, email, pic, password, cpassword, inGameName } = req.body
  const session = await mongoose.startSession()

  try {
    session.startTransaction()

    if (!name || !email || !pic || !password || !cpassword || !inGameName) {
      return res.status(422).json({ error: 'Please fill the required field' })
    }

    if (!isValidEmail(email)) {
      throw new Error('Invalid Email')
    }

    if (isValidEmail(inGameName)) {
      throw new Error('Email cannot be used as an In-Game Name')
    }

    if (inGameName.length > 16) {
      throw new Error('In Game Name cannot be greater than 16 characters')
    }

    if (name.length > 16) {
      throw new Error('Name cannot be greater than 16 characters')
    }

    if (inGameName.includes(' ')) {
      throw new Error('In Game Name cannot have spaces')
    }

    const existingEmail = await User.findOne({ email }).session(session)
    if (existingEmail) {
      throw new Error('Email already exists')
    }

    const existingInGameName = await User.findOne({ inGameName }).session(
      session,
    )
    if (existingInGameName) {
      throw new Error('This In Game Name is already taken')
    }

    if (password.length < 8) {
      throw new Error('Password should be at least 8 characters')
    }

    if (password !== cpassword) {
      throw new Error('Password and confirm password do not match')
    }

    const user = new User({
      inGameName,
      name,
      email,
      pic,
      password,
      cpassword,
      googleEmail: email,
    })

    const OTP = generateOtp()
    const verificationToken = new VerificationToken({
      owner: user._id,
      token: OTP,
    })

    await verificationToken.save({ session })
    user.resetOtpCnt()
    user.setOtpCntResetTime()
    await user.save({ session })

    const transporter = await mailTransporter()
    await transporter.sendMail({
      from: MailTemplates.OTP.from,
      to: user.email,
      subject: MailTemplates.OTP.subject,
      text: MailTemplates.OTP.text,
      html: MailTemplates.OTP.html(OTP),
    })

    await session.commitTransaction()
    return res.status(201).json({ message: 'Registered Successfully' })
  } catch (err) {
    await session.abortTransaction()
    return res.status(422).json({ error: err.message })
  } finally {
    session.endSession()
  }
}

const getUserIds = asyncHandler(async (req, res) => {
  const { limit = 10, sort = 'active' } = req.query
  try {
    let users = []
    if (sort === 'active') {
      users = await User.find()
        .sort({ lastLogin: -1 })
        .limit(parseInt(limit))
        .select('_id inGameName')
    } else if (sort === 'new') {
      users = await User.find().sort({ createdAt: -1 }).limit(parseInt(limit))
    } else if (sort === 'old') {
      users = await User.find().sort({ createdAt: 1 }).limit(parseInt(limit))
    }
    const userIds = users.map(user => user.inGameName)
    res.status(200).json(userIds)
  } catch (error) {
    throw new Error(error)
  }
})

const loginUser = async (req, res) => {
  // Implement login logic here
  const { emailOrInGameName, password } = req.body.data
  if (!(emailOrInGameName && password)) {
    return res.status(422).json({ error: 'Please fill the required fields' })
  }

  try {
    let findUser
    const email = isValidEmail(emailOrInGameName) ? emailOrInGameName : null
    const inGameName = email ? null : emailOrInGameName
    if (email) {
      findUser = await User.findOne({ email }).populate({
        path: 'previousSeasonData',
        select: 'season',
      })
    } else {
      findUser = await User.findOne({ inGameName }).populate({
        path: 'previousSeasonData',
        select: 'season',
      })
    }
    //console.log(findUser);
    if (!findUser) return res.status(422).json({ error: 'Invalid Credentials' })
    if (findUser.role === 'guest') {
      if (findUser.expiresAt && findUser.expiresAt <= new Date()) {
        await User.findByIdAndDelete(findUser._id)
        return res.status(422).json({ error: 'Guest account expired' })
      }
    }

    const isMatch = await bcrypt.compare(password, findUser.password)
    if (!isMatch) return res.status(401).json({ error: 'Invalid Credentials' })
    const token = await findUser.generateAuthToken()
    // console.log(token);
    if (findUser.verified && findUser.inGameName)
      res.cookie('jwtoken', token, {
        expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      })
    let badges = findUser?.badges || []
    const now = moment().tz('Asia/Kolkata')

    // Get unclaimed valid badges
    let unClaimedValidBadges = badges.filter(
      badge =>
        badge.canBeClaimedUntil &&
        moment(badge.canBeClaimedUntil).isAfter(now) &&
        !badge.claimed,
    )

    // Process category privileges from badges
    const categoryPrivileges = processBadgePrivileges(badges)
    Object.keys(categoryPrivileges).forEach(key => {
      const cacheKey = `privilege_${findUser._id.toString()}_${key}`
      cache.put(cacheKey, categoryPrivileges[key], 5 * 60 * 1000)
    })
    return res.status(201).json({
      message: 'SignIn Successfull',
      user: { ...findUser._doc, unClaimedValidBadges, categoryPrivileges },
      token,
    })
  } catch (err) {
    console.log(err)
  }
}

const logoutUser = async (req, res) => {
  try {
    makeFirstLoginFalse(req.user._id)
    res.clearCookie('jwtoken', { path: '/' })
    res.status(201).send('User Logout')
  } catch (error) {
    console.log(error)
    res.status(422).json({ error: error })
  }
}

const loginCheck = asyncHandler(async (req, res) => {
  // Use projection for better query performance
  const user = await User.findById(req.user._id)
    .select('-password -cpassword -googleId')
    .lean()
    .exec()

  if (!user) {
    return res.status(404).json({ message: 'User not found' })
  }

  // Get today's date at UTC midnight once
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)

  // Calculate new login streak
  const newStreakData = calculateLoginStreak(user, today)

  let badges = user?.badges || []
  const now = moment().tz('Asia/Kolkata')

  // Get unclaimed valid badges
  let unClaimedValidBadges = badges.filter(
    badge =>
      badge.canBeClaimedUntil &&
      moment(badge.canBeClaimedUntil).isAfter(now) &&
      !badge.claimed,
  )

  // Process category privileges from badges
  const categoryPrivileges = processBadgePrivileges(badges)

  Object.keys(categoryPrivileges).forEach(key => {
    const cacheKey = `privilege_${req.user._id}_${key}`
    cache.put(cacheKey, categoryPrivileges[key], 5 * 60 * 1000)
  })
  // Create optimistically updated user object for immediate response
  const optimisticUser = {
    ...user,
    unClaimedValidBadges,
    categoryPrivileges,
    loginStreak: newStreakData.streak,
    lastLogin: today,
  }

  // Send immediate response to frontend
  res.status(200).json(optimisticUser)

  // Perform background operations with retries
  Promise.all([
    // Update user data
    updateUserWithRetry(req.user._id, {
      loginStreak: newStreakData.streak,
      lastLogin: today,
    }),

    // Log activity if needed
    newStreakData.streak % 5 === 0 && newStreakData.streak > 0
      ? logActivityWithRetry({
          userInGameName: user.inGameName,
          type: activityTypes.FIVE_DAY_LOGIN_STREAK.type,
          date: today,
        })
      : Promise.resolve(),
  ]).catch(error => {
    // Log error for monitoring
    console.error('Background operations failed after all retries:', {
      userId: req.user._id,
      error: error.message,
      stack: error.stack,
    })
  })
})

const verifyUser = async (req, res) => {
  const { otp, email } = req.body
  // type of forgotPassword is string
  const forgotPassword = req.query.forgotPassword

  try {
    if (!email) throw new Error('No email provided')
    const validEmail = isValidEmail(email)
    if (!validEmail) throw new Error('Invalid Email')
    const user = await User.findOne({ email: email })
    if (!user) throw new Error('No user found')
    const userid = user._id
    if (!userid || !otp.trim()) throw new Error('No user or otp provided')
    if (!isValidObjectId(userid)) throw new Error('Invalid user')

    if (user.verified && forgotPassword === 'false')
      throw new Error('User already verified')

    const token = await VerificationToken.findOne({ owner: userid })
    if (!token) throw new Error('No token found')

    const isMatch = await token.compareToken(otp)

    if (!isMatch) throw new Error('Invalid OTP')

    user.verified = true
    await VerificationToken.findByIdAndDelete(token._id)
    await user.save()
    //console.log("Email verified successfully");

    if (forgotPassword === 'false') {
      //console.log("Sending email");
      const transporter = await mailTransporter()
      await transporter.sendMail({
        from: 'rapidrecap2k23@gmail.com',
        to: user.email,
        subject: 'Welcom to Rapid Recap',
        html: '<h1>Welcome to Rapid Recap. Your account has been verified successfully</h1>',
      })
      //console.log("Email sent");
    }
    res.status(201).json({ message: 'Email verified successfully', user })
  } catch (error) {
    console.log(error)
    return res.status(422).json({ error: error.message })
  }
}

const resendOTP = async (req, res) => {
  try {
    const { email } = req.body
    if (!email)
      throw new Error('No email provided : Write the Email in the email field')
    const validEmail = isValidEmail(email)
    if (!validEmail) throw new Error('Invalid Email')
    const user = await User.findOne({ email: email })
    const user_id = user._id
    if (!user_id) throw new Error('No user found')
    const otpCnt = user.otpCnt
    if (!user.otpCntResetTime || new Date() > user.otpCntResetTime) {
      user.resetOtpCnt()
      user.setOtpCntResetTime()
      await user.save()
    }
    if (otpCnt >= 3) {
      throw new Error(
        'OTP limit exceeded, Try again after ' +
          user.otpCntResetTime.toLocalString,
      )
    }
    const OTP = generateOtp()
    user.incrementOtpCnt()
    await user.save()
    const prevToken = await VerificationToken.findOne({ owner: user_id })
    if (prevToken) await VerificationToken.findByIdAndDelete(prevToken._id)
    const verificationToken = new VerificationToken({
      owner: user._id,
      token: OTP,
    })
    await verificationToken.save()
    const transporter = await mailTransporter()
    await transporter.sendMail({
      from: MailTemplates.OTP.from,
      to: user.email,
      subject: MailTemplates.OTP.subject,
      text: MailTemplates.OTP.text,
      html: MailTemplates.OTP.html(OTP),
    })
    return res.status(201).json({ message: 'OTP send Successfully' })
  } catch (error) {
    console.log(error)
    return res.status(422).json({ error: error.message })
  }
}

const forgotPassword = async (req, res) => {
  const { email, newPassword } = req.body
  try {
    const validEmail = isValidEmail(email)
    if (!validEmail) throw new Error('Invalid Email')
    const user = await User.findOne({ email: email })
    if (!user) throw new Error('No user found')

    const isSamePassword = await bcrypt.compare(newPassword, user.password)

    if (isSamePassword)
      throw new Error('New password should be different from old password')
    if (newPassword.length < 8)
      throw new Error('Password should be of atleast 8 characters')

    user.password = newPassword
    user.cpassword = newPassword
    user.guestTempPassword = undefined

    await user.save()
    res.status(201).json({ message: 'Password changed successfully' })
  } catch (error) {
    console.log(error)
    res.status(422).json({ error: error.message })
  }
}

const handleGoogleLogin = async (req, res) => {
  const { credentialResponse, inGameName } = req.body
  const credential = credentialResponse.credential

  try {
    const userInfo = jwt.decode(credential)
    let user = await User.findOne({
      $or: [
        { email: userInfo.email },
        { googleEmail: userInfo.email },
        { googleId: userInfo.sub },
      ],
    }).populate({
      path: 'previousSeasonData',
      select: 'season',
    })
    //console.log(userInfo);
    if (user) {
      if (!user.inGameName) {
        if (!inGameName)
          return res.status(200).json({
            EnterInGameName: true,
            error:
              'Please provide your chosen In-Game Name for your initial login.',
          })

        const u = await User.findOne({ inGameName })
        if (u)
          return res.status(422).json({
            error: 'This In Game Name is already Taken',
          })
        // inGameName cannot have spaces
        if (inGameName.includes(' '))
          return res
            .status(422)
            .json({ error: 'In Game Name cannot have spaces' })

        if (isValidEmail(inGameName)) {
          return res
            .status(422)
            .json({ error: 'Email cannot be used as an In-Game Name' })
        }

        if (inGameName.length > 16) {
          return res.status(422).json({
            error: 'In Game Name cannot be greater than 16 characters',
          })
        }
        user.inGameName = inGameName
      }

      user.googleEmail = userInfo.email
      user.googleId = userInfo.sub
      user.verified = true
      await user.save()
    } else {
      if (!inGameName)
        return res.status(200).json({
          EnterInGameName: true,
          error:
            'Please provide your chosen In-Game Name for your initial login.',
        })

      const u = await User.findOne({ inGameName })
      if (u)
        return res.status(422).json({
          error: 'This In Game Name is already Taken',
        })
      // inGameName cannot have spaces
      if (inGameName.includes(' '))
        return res
          .status(422)
          .json({ error: 'In Game Name cannot have spaces' })

      if (isValidEmail(inGameName)) {
        return res
          .status(422)
          .json({ error: 'Email cannot be used as an In-Game Name' })
      }

      if (inGameName.length > 16) {
        return res.status(422).json({
          error: 'In Game Name cannot be greater than 16 characters',
        })
      }
      // If not, create a new user with Google data
      const name = userInfo.name.split(' ')
      user = new User({
        name: name[0] + ' ' + name[name.length - 1],
        email: userInfo.email,
        inGameName,
        // Add other necessary Google fields
        googleId: userInfo.sub,
        googleEmail: userInfo.email,
        verified: true,
      })
      await user.save()
    }

    const token = await user.generateAuthToken()
    res.cookie('jwtoken', token, {
      expires: new Date(Date.now() + 2592000000),
      httpOnly: true,
    })

    let badges = user?.badges || []
    const now = moment().tz('Asia/Kolkata')

    // Get unclaimed valid badges
    let unClaimedValidBadges = badges.filter(
      badge =>
        badge.canBeClaimedUntil &&
        moment(badge.canBeClaimedUntil).isAfter(now) &&
        !badge.claimed,
    )

    // Process category privileges from badges
    const categoryPrivileges = processBadgePrivileges(badges)

    Object.keys(categoryPrivileges).forEach(key => {
      const cacheKey = `privilege_${user._id.toString()}_${key}`
      cache.put(cacheKey, categoryPrivileges[key], 5 * 60 * 1000)
    })
    res.status(201).json({
      message: 'Google Login Successfull',
      user: { ...user._doc, unClaimedValidBadges, categoryPrivileges },
      token,
    })
  } catch (error) {
    console.log(error)
    res.status(422).json({ error: error })
  }
}

const calculateUserIQScores = async (req, res) => {
  try {
    // Fetch all users
    await dailyUserIQCalc()

    // Send success response
    res.status(200).json({ message: 'IQ scores calculated successfully.' })
  } catch (error) {
    // Handle errors
    console.error('Error calculating IQ score:', error)
    res.status(500).json({ error: 'Internal server error.' })
  }
}

// @desc  Get leaderboard for the current season
// @route GET /api/user/leaderboard
// @access Public
const leaderBoard = async (req, res) => {
  const currUserId = req.user ? req.user._id : null
  const { society, page = 1, limit = 10 } = req.query
  const cacheKey = `leaderboard_${society}_${page}_${limit}`
  // Calculate time until next refresh
  const now = moment.utc()
  const nextRefresh = moment.utc().startOf('month').add(1, 'month')
  if (now.date() === 1 && now.hour() === 0) {
    // If it's the first of the month at exactly midnight UTC (00:00)
    nextRefresh.subtract(1, 'month')
  }
  const timeUntilRefresh = {
    days: nextRefresh.diff(now, 'days'),
    hours: nextRefresh.diff(now, 'hours') % 24,
    minutes: nextRefresh.diff(now, 'minutes') % 60,
    seconds: nextRefresh.diff(now, 'seconds') % 60,
    totalSeconds: nextRefresh.diff(now, 'seconds'),
  }
  // Try to get the cached result
  const cachedResult = cache.get(cacheKey)
  if (cachedResult) {
    return res.status(200).json({
      ...cachedResult,
      nextRefresh: timeUntilRefresh,
    })
  }

  const societyConditions = {
    titans: { IQ_score: { $gte: 150 } },
    mavericks: { IQ_score: { $gte: 130, $lt: 150 } },
    elites: { IQ_score: { $gte: 110, $lt: 130 } },
    strivers: { IQ_score: { $gte: 90, $lt: 110 } },
    explorers: { IQ_score: { $gte: 0, $lt: 90 } },
  }

  const condition = {
    ...societyConditions[society?.toLowerCase()],
    inGameName: { $exists: true, $ne: '' },
    IQ_score: { $ne: 0 },
  }

  const pageNumber = parseInt(page, 10)
  const limitNumber = parseInt(limit, 10)
  const skipNumber = (pageNumber - 1) * limitNumber

  try {
    const totalDocuments = await User.countDocuments(condition)

    const maxUsers = Math.min(totalDocuments, 500)
    const totalPages = Math.ceil(maxUsers / limitNumber)

    if (skipNumber >= maxUsers) {
      return res.status(200).json({
        users: [],
        currUser: {},
        totalPages,
        currentPage: pageNumber,
      })
    }

    // Step 1: Get all users sorted by IQ_score (for rank calculation)
    const allUsers = await User.find(condition)
      .sort({ IQ_score: -1, avgRQM: -1 })
      .select('_id')
      .lean()

    // Step 2: Get paginated users with full details

    const paginatedUsers = await User.find(condition)
      .select(
        '_id name inGameName IQ_score pic avgRQM maxIQScore level xp displayedBadge',
      )
      .sort({ IQ_score: -1, avgRQM: -1 })
      .skip(skipNumber)
      .limit(limitNumber)
      .lean()

    // Step 3: Fetch quiz attempts for paginated users with date condition
    const userIds = paginatedUsers.map(user => user._id)
    const currentDate = moment()

    const quizAttemptsQuery =
      currentDate.year() >= 2025 && currentDate.month() > 0
        ? {
            user: { $in: userIds },
            season: 2,
            year: moment().year(),
            month: moment().month() + 1,
          }
        : { user: { $in: userIds }, season: 2 }

    const quizAttempts = await QuizAttempt.aggregate([
      { $match: quizAttemptsQuery },
      { $group: { _id: '$user', count: { $sum: 1 } } },
    ])

    // Step 4: Process and enrich user data
    const enrichedUsers = paginatedUsers.map(user => {
      const attempts = quizAttempts.find(a => a._id.equals(user._id))
      const rank = allUsers.findIndex(u => u._id.equals(user._id)) + 1
      return {
        ...user,
        quizAttemptsLength: attempts ? attempts.count : 0,
        rankedInCurrentSeason: attempts ? attempts.count >= 1 : false,
        rank: rank,
      }
    })

    // Step 5: Update ranks in the database
    const bulkOps = enrichedUsers.map(user => ({
      updateOne: {
        filter: { _id: user._id },
        update: { $set: { rank: user.rank } },
      },
    }))

    User.bulkWrite(bulkOps).catch(error => {
      console.error('Error updating ranks:', error)
    })

    // Step 6: Format result for response
    const result = enrichedUsers.map(user => ({
      _id: user._id,
      RQM_avg: user.avgRQM?.toFixed(0),
      name: user.name,
      inGameName: user.inGameName,
      IQ_score: user.IQ_score,
      pic: user.pic,
      quizSubmissions: user.quizAttemptsLength,
      maxIQScore: user.maxIQScore,
      level: user.level,
      xp: user.xp,
      rankedInCurrentSeason: user.rankedInCurrentSeason,
      displayedBadge: user.displayedBadge,
      rank: user.rank,
    }))

    // Step 7: Get current user data with date condition
    let currUserData = {}

    if (currUserId) {
      const quizMatchQuery =
        currentDate.year() >= 2025 && currentDate.month() > 0
          ? {
              season: 2,
              year: moment().year(),
              month: moment().month() + 1,
            }
          : { season: 2 }

      const currUser = await User.findById(currUserId)
        .select('avgRQM quizAttempts rank')
        .populate({
          path: 'quizAttempts',
          match: quizMatchQuery,
          select: '_id',
        })
        .lean()

      currUserData = {
        RQM_avg: currUser?.avgRQM?.toFixed(0),
        quizSubmissions: currUser?.quizAttempts?.length || 0,
        rank: currUser?.rank,
      }
    }

    const responseData = {
      users: result,
      currUser: currUserData,
      totalPages,
      currentPage: pageNumber,
      nextRefresh: timeUntilRefresh,
    }

    // Cache the result
    cache.put(cacheKey, responseData, 3600000)

    res.status(200).json(responseData)
  } catch (error) {
    console.error('Error fetching the Leaderboard:', error)
    res.status(500).json({ error: 'Error fetching the Leaderboard' })
  }
}

const profile = async (req, res) => {
  try {
    const user = await User.findOne({
      inGameName: req.params.inGameName,
    })
      .populate('dailyIQScores')
      .populate({
        path: 'previousSeasonData',
        select: 'season',
      })

    if (!user) {
      return res.status(410).json({ error: 'User not found' })
    }
    const seasons = user.previousSeasonData.map(season => season.season)
    const {
      Top_Percentage,
      percentileData,
      filteredLabels,
      filteredIQData,
      USER_IQ,
    } = await currentTopPercentOfUser({ userId: user._id })
    const [solvedQuizzes, rank, iqScoresHistory] = await Promise.all([
      getSolvedQuizzesCount({ userId: user._id }),

      calculateUserRank({ userId: user._id }),
      getUserIQScoreHistory({ userId: user._id }),
    ])

    const profilePrivacy = user.profilePrivacy || {
      fullProfile: false,
      lineGraph: false,
      barGraph: false,
      solvedQuizzes: false,
      society: false,
      tournamentAnalytics: false,
    }

    res.status(200).json({
      userId: user._id,
      inGameName: user.inGameName,
      pic: user.pic,
      lineGraph: iqScoresHistory,
      barGraph: {
        Top_Percentage,
        percentileData,
        filteredLabels,
        filteredIQData,
        USER_IQ,
      },
      solvedQuizzes,
      leftProfileView: {
        rank,
        name: user.name,
        inGameName: user.inGameName,
        pic: user.pic,
        bio: user.bio,
        _id: user._id.toString(),
        tournamentPerformance: user.tournamentPerformance,
        displayedBadge: user.displayedBadge,
        badges: user.badges,
        avgRQM: user.avgRQM,
        UserIQ: user.IQ_score,
      },
      experience: {
        level: user.level,
        xp: user.xp,
      },
      USER_IQ,
      maxIQScore: user.maxIQScore,
      profilePrivacy,
      currentSeason: user.currentSeason,
      seasons,
    })
  } catch (error) {
    console.error('Error fetching user profile:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

const editProfile = async (req, res) => {
  const { name, bio, pic, inGameName } = req.body
  try {
    if (inGameName) {
      if (isValidEmail(inGameName)) {
        return res
          .status(422)
          .json({ error: 'Email cannot be used as an In-Game Name' })
      }

      // InGameName cannot be greater than 16 characters
      if (inGameName.length > 16) {
        return res
          .status(422)
          .json({ error: 'In Game Name cannot be greater than 16 characters' })
      }

      if (inGameName.includes(' ')) {
        return res
          .status(422)
          .json({ error: 'In Game Name cannot have spaces' })
      }
    }
    const user = await User.findById(req.user._id)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    if (inGameName && inGameName !== user.inGameName) {
      const lastChangeDate = user.lastInGameNameChange || new Date(0)
      const daysSinceLastChange = Math.floor(
        (new Date() - lastChangeDate) / (1000 * 60 * 60 * 24),
      )

      if (daysSinceLastChange < 15) {
        return res.status(400).json({
          error: `You can change your in-game name after ${
            15 - daysSinceLastChange
          } days`,
        })
      }
      user.inGameName = inGameName
      user.lastInGameNameChange = new Date()
    }
    // user.inGameName = inGameName
    user.name = name
    user.bio = bio
    user.pic = pic
    await user.save()
    res.status(200).json({ message: 'Profile updated successfully' })
  } catch (error) {
    console.error('Error editing user profile:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

const expectedIQScore = async (req, res) => {
  try {
    const userId = req.user._id
    const quizAttempts = await QuizAttempt.find({ user: userId }).populate({
      path: 'article',
      populate: { path: 'quiz' },
    })
    let userScore = 0
    const cntOfQuizAttempts = quizAttempts.length
    for (const attempt of quizAttempts) {
      if (
        !attempt ||
        !attempt.article ||
        !attempt.article.quiz ||
        !attempt.articleDifficulty
      ) {
        //console.error("Invalid quiz attempt data.");
        continue
      }
      let percentile = attempt.userPercentile
      if (!percentile) {
        // calculate percentile
        const quizAttempts = await QuizAttempt.find({
          article: attempt.article._id,
        })
        const sortedQuizAttempts = quizAttempts.sort(
          (a, b) => b.RQM_score - a.RQM_score,
        )
        const userAttempt = sortedQuizAttempts.find(
          attempt => attempt.user && attempt?.user?.toString() === userId,
        )
        if (!userAttempt) {
          throw new Error('User has not attempted the quiz for the article.')
        }
        const userPosition = sortedQuizAttempts.indexOf(userAttempt)
        const totalAttempts = sortedQuizAttempts.length
        const userPercentile =
          ((totalAttempts - userPosition) / totalAttempts) * 100
        userAttempt.userPercentile = userPercentile
        percentile = userPercentile
        await userAttempt.save()
      }
      const quizScore = attempt.articleDifficulty * percentile
      userScore += quizScore
    }
    userScore = (userScore / cntOfQuizAttempts) * 10
    // IQscore > 0 users
    const users = await User.find({
      userScore: { $gt: 0 },
    })
    let sumOfUserScores = users.reduce((acc, user) => acc + user.userScore, 0)
    sumOfUserScores += userScore
    const meanOfUserScores = sumOfUserScores / users.length
    let sumOfSquares = users.reduce(
      (acc, user) => acc + Math.pow(user.userScore - meanOfUserScores, 2),
      0,
    )
    sumOfSquares += Math.pow(userScore - meanOfUserScores, 2)
    const standardDeviation = Math.sqrt(sumOfSquares / users.length)
    const normalizedScore = (userScore - meanOfUserScores) / standardDeviation
    const ExpectedIQScore = Math.round(100 + 15 * normalizedScore)
    res
      .status(200)
      .json({ ExpectedIQScore: ExpectedIQScore ? ExpectedIQScore : 0 })
  } catch (error) {
    console.error('Error calculating user IQ expected score:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

const solvedQuizHistory = async (req, res) => {
  const { inGameName, lang } = req.query
  const page = parseInt(req.query.page) || 1
  const pageSize = 14

  try {
    const user = await User.findOne({ inGameName })
    if (!user) {
      throw new Error('User not found')
    }

    const totalAttempts = await QuizAttempt.countDocuments({ user: user._id })
    const totalPages = Math.ceil(totalAttempts / pageSize)

    const quizAttempts = await QuizAttempt.find({ user: user._id })
      .populate({
        path: 'article',
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
    if (lang === 'hi')
      for (let attempt of quizAttempts) {
        const article = attempt.article
        if (
          !article.hindiTitle ||
          !article.hindiMainText ||
          !article.hindiAuthor
        ) {
          const response = await hindiConverter(article._id)
          if (!article.hindiMainText) {
            article.hindiMainText = []
          }
          article.hindiTitle = response.hindiTitle

          for (let key in response.hindiMainText) {
            if (!response.hindiMainText[key]) continue
            article.hindiMainText.push(response.hindiMainText[key])
          }
          article.hindiAuthor = response.hindiAuthor
        }
      }

    const history = quizAttempts
      .map(attempt => {
        const { article, RQM_score, userPercentile, articleDifficulty } =
          attempt
        if (
          !article ||
          isNaN(RQM_score) ||
          isNaN(userPercentile) ||
          isNaN(articleDifficulty)
        )
          return null

        const { title } = article
        let diff =
          articleDifficulty < 0.5
            ? 'Easy'
            : articleDifficulty < 0.7
            ? 'Medium'
            : 'Hard'

        return {
          newsArticle: article,
          _id: attempt._id,
          article: article._id,
          title,
          hindiTitle: article.hindiTitle,
          RQM_score,
          userPercentile,
          articleDifficulty: diff,
        }
      })
      .filter(Boolean)

    res.status(200).json({ history, currentPage: page, totalPages })
  } catch (error) {
    console.error('Error in fetching solved quiz history:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

const userSearch = async (req, res) => {
  try {
    const { query } = req.query

    // Construct MongoDB query to search by inGameName, name, or email
    const searchQuery = {
      $or: [
        { inGameName: query }, // Full match for inGameName
        { name: query }, // Full match for name
        { email: query }, // Full match for email
        { inGameName: { $regex: query, $options: 'i' } }, // Partial match for inGameName
        { name: { $regex: query, $options: 'i' } }, // Partial match for name
        { email: { $regex: query, $options: 'i' } }, // Partial match for email
      ],
      inGameName: { $ne: null, $exists: true },
    }

    // Execute the query and retrieve the matching users
    let users = await User.find(searchQuery).populate({
      path: 'quizAttempts',
      match: { season: 2 },
    })
    users = users.filter(user => user.role !== 'guest')
    // Prioritize results with full query match
    const prioritizedUsers = users.sort((a, b) => {
      const aFullMatch =
        a.inGameName === query || a.name === query || a.email === query
      const bFullMatch =
        b.inGameName === query || b.name === query || b.email === query

      if (aFullMatch && !bFullMatch) return -1
      if (!aFullMatch && bFullMatch) return 1
      return 0
    })

    const result = []

    prioritizedUsers.forEach(user => {
      let sum = 0
      const {
        name,
        inGameName,
        IQ_score,
        email,
        pic,
        _id,
        maxIQScore,
        rank,
        xp,
        level,
        rankedInCurrentSeason,
        displayedBadge,
      } = user
      for (let i = 0; i < user.quizAttempts.length; i++) {
        sum += user.quizAttempts[i].RQM_score
      }
      const RQM_avg =
        user.quizAttempts.length > 0
          ? (sum / user.quizAttempts.length).toFixed(0)
          : 0
      const quizSubmissions = user.quizAttempts.length
      result.push({
        _id,
        RQM_avg,
        name,
        email,
        inGameName,
        IQ_score,
        pic,
        quizSubmissions,
        maxIQScore,
        rank,
        xp,
        level,
        rankedInCurrentSeason,
        displayedBadge,
      })
    })

    res.status(201).json(result) // Return the prioritized users as JSON response
  } catch (error) {
    console.error('Error searching users:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

const profilePrivacy = async (req, res) => {
  const userId = req.user._id
  const {
    fullProfile,
    lineGraph,
    barGraph,
    solvedQuizzes,
    society,
    seasonAnalytics,
    tournamentAnalytics,
  } = req.body
  try {
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    user.profilePrivacy = {
      fullProfile,
      lineGraph,
      barGraph,
      solvedQuizzes,
      society,
      seasonAnalytics,
      tournamentAnalytics,
    }
    await user.save()
    res.status(200).json({ message: 'Profile privacy settings updated' })
  } catch (error) {
    console.error('Error in fetching solved quiz history:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

// @desc   GET all application updates
// @route  GET /api/user/getUpdates
// @access Private
const getUpdates = async (req, res) => {
  const userId = req.user._id
  try {
    const updates = await ApplicationUpdates.find({ userId: userId })
      .sort({
        date: -1,
      })
      .lean()
      .exec()
    res.status(200).json({ updates })
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
    console.log(error)
  }
}

const readUpdates = async (req, res) => {
  const { updateId } = req.query
  //console.log(userId);
  try {
    const update = await ApplicationUpdates.findById(updateId)
    if (!update) {
      return res.status(404).json({ error: 'Update not found' })
    }
    update.read = true
    await update.save()
    res.status(200).json({ message: 'Update read' })
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
    console.log(error)
  }
}

const trashUpdate = async (req, res) => {
  const { updateId } = req.params
  try {
    const deletedUpdate = await ApplicationUpdates.findByIdAndDelete(updateId)

    if (!deletedUpdate) {
      return res.status(404).json({ error: 'Update not found' })
    }

    res.status(200).json({ message: 'Update deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
    console.log(error)
  }
}

const trashAllUpdate = async (req, res) => {
  const userId = req.user._id // Assuming user ID is available in req.user._id

  try {
    // Delete all updates associated with the user ID
    await ApplicationUpdates.deleteMany({ userId })

    res.status(200).json({ message: 'All updates deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
    console.log(error)
  }
}

const sendMailForNotifySubscribe = async (req, res) => {
  try {
    const users = await User.find({
      email: { $not: /^dummy\d+@mail\.com$/ },
    })
    //const users = await User.find({ inGameName: "saransh_1234" });
    const transporter = await mailTransporter()
    // const updateProgress = progressBar(users.length);
    for (const user of users) {
      await transporter.sendMail({
        from: MailTemplates.NotifySubscribe.from,
        to: user.email,
        subject: MailTemplates.NotifySubscribe.subject,
        html: MailTemplates.NotifySubscribe.html(user.name.split(' ')[0]),
      })
      // updateProgress();
    }
    res
      .status(200)
      .json({ message: `Email send successfully to ${users.length} users` })
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
    console.log(error)
  }
}

const upgradeMessageClose = async (req, res) => {
  const userId = req.user._id
  try {
    const user = await User.findById(userId)
    user.societyUpgradeMessage = ''
    await user.save()
    res.status(200).json({ ok: 'Success' })
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
    console.log(error)
  }
}

const quizDailyStreakUpdator = async (req, res) => {
  try {
    const users = await User.find({ inGameName: { $exists: true, $ne: '' } })
    console.log(users.length)
    // const updateProgress = progressBar(users.length);
    for (let user of users) {
      await dailyStreakCalculator(user._id)
      // updateProgress();
    }
    res.status(200).json({ message: 'Daily streak updated successfully' })
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
    console.log(error)
  }
}
const longestStreakCalculatorOfAllUsers = async (req, res) => {
  try {
    const users = await User.find({ inGameName: { $exists: true, $ne: '' } })
    console.log(users.length)
    // const updateProgress = progressBar(users.length);
    for (let user of users) {
      await longestStreakCalculator(user._id)
      // updateProgress();
    }
    res.status(200).json({ message: 'Longest streak updated successfully' })
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
    console.log(error)
  }
}

// @desc  Get user streak on every refresh of the page
// @route GET /api/user/streakChecker
// @access Private
const streakChecker = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession()
  try {
    await session.withTransaction(async () => {
      const userId = req.user._id
      const user = await User.findById(userId).session(session)

      const today = new Date()
      today.setUTCHours(0, 0, 0, 0)
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)
      const pastStreak = user.streak
      let isRevivalPeriod = false
      let streakBeforeBreak = 0
      let remainingTimeBeforeRevival = null

      // Check and handle revival period
      if (
        user.revivalPeriodEnd &&
        new Date().getTime() > user.revivalPeriodEnd.getTime()
      ) {
        user.revivalPeriodEnd = null
      }

      if (user.streakExpiry.getTime() < tomorrow.getTime()) {
        user.todaysQuizCnt = 0
      }

      // Handle streak expiry
      if (today.getTime() > user.streakExpiry.getTime()) {
        if (user.streak >= 5 && user.revivalPeriodEnd === null) {
          user.streakBeforeBreak = user.streak
          streakBeforeBreak = user.streak
          user.revivalPeriodEnd = getTheRevivalEndDay(
            user.streak,
            user.streakExpiry,
          )
          remainingTimeBeforeRevival =
            user.revivalPeriodEnd.getTime() - today.getTime()
          isRevivalPeriod = remainingTimeBeforeRevival <= 0 ? false : true

          if (remainingTimeBeforeRevival < 0) {
            user.revivalPeriodEnd = null
            user.streakBeforeBreak = 0
          }
        }

        user.streak = 0
        user.streakExpiry = new Date(today.getTime() + 24 * 60 * 60 * 1000)
        user.todayBoost = false
        await user.save({ session })

        return res.status(200).json({
          streak: 0,
          pastStreak,
          isRevivalPeriod,
          streakBeforeBreak,
          remainingTimeBeforeRevival,
          todaysQuizAttemptsCount: 0,
        })
      }

      if (user.revivalPeriodEnd) {
        remainingTimeBeforeRevival =
          user.revivalPeriodEnd.getTime() - new Date().getTime()
        isRevivalPeriod = true
        streakBeforeBreak = user.streakBeforeBreak
      }

      // Check streak surge eligibility
      const { isEligible: hasUnclaimedStreakSurge } =
        await verifyStreakSurgeEligibility({
          user,
          session,
        })

      // Update user stats
      if (user.streak > user.longestStreak) {
        user.longestStreak = user.streak
      }
      if (user.streak >= 2) {
        user.eligibleForTournament = true
      }
      await user.save({ session })

      // Get active abilities to check boost status
      const activeAbilities = await checkActiveAbilities({
        userId: user._id,
        type: 'BOOST',
        name: 'StreakSurge',
        session,
      })

      const effects = calculateTotalEffect(activeAbilities, 'BOOST')
      // Send response
      res.status(200).json({
        streak: user.streak,
        longestStreak: user.longestStreak,
        isBoosted: effects.multiplier > 1,
        isRevivalPeriod,
        streakBeforeBreak,
        remainingTimeBeforeRevival,
        todaysQuizAttemptsCount: user.todaysQuizCnt,
        hasUnclaimedStreakSurge,
        multiplier: hasUnclaimedStreakSurge ? 1.25 : effects.multiplier,
        xpAward: activityTypes.SEVEN_DAY_STREAK.xp,
      })
    })
  } catch (error) {
    console.error('Streak checker error:', error)
    res.status(500).json({ error: 'Internal server error' })
  } finally {
    session.endSession()
  }
})

// @desc   Claim the streak surge
// @route  GET /api/user/claim-streak-surge
// @access Private
const claimStreakSurge = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession()
  try {
    await session.withTransaction(async () => {
      const userId = req.user._id
      const user = await User.findById(userId).session(session)

      // Verify eligibility
      const { isEligible, alreadyClaimed } = await verifyStreakSurgeEligibility(
        {
          user,
          session,
        },
      )

      if (!isEligible) {
        throw new Error('No valid streak surge available')
      }

      if (alreadyClaimed) {
        throw new Error('Streak surge already claimed today')
      }

      // Create and activate streak surge ability
      const { ability, xpAwarded } = await handleStreakSurgeEarned({
        user,
        session,
      })

      // Auto-activate the ability
      const inventory = await Inventory.findOne({ user: userId })
        .populate('abilities.abilityId')
        .session(session)

      const inventoryAbility = inventory.abilities.find(invAbility =>
        invAbility.abilityId._id.equals(ability._id),
      )

      if (inventoryAbility) {
        inventoryAbility.isActive = true
        await inventory.save({ session })

        ability.isActive = true
        await ability.save({ session })
      }

      res.status(200).json({
        message: 'Streak surge claimed and activated successfully',
        xpAwarded,
      })
    })
  } catch (error) {
    console.error('Error claiming streak surge:', error)
    res
      .status(400)
      .json({ error: error.message || 'Error claiming streak surge' })
  } finally {
    session.endSession()
  }
})

// @desc   Claim the quinBoost
// @route  GET /api/user/claim-quinboost
// @access Private
const claimQuinBoost = asyncHandler(async (req, res) => {
  const userId = req.user._id

  try {
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const today = new Date()
    today.setUTCHours(0, 0, 0, 0)

    const quinBoostAbility = await Ability.findOne({
      name: 'QuinBoost',
      user: userId,
      claimed: false,
      expiresAt: { $gte: new Date() },
    })
    if (!quinBoostAbility || quinBoostAbility.claimed) {
      return res.status(400).json({ error: 'No QuinBoost available to claim' })
    }

    // Get or create user's inventory
    let inventory = await Inventory.findOne({ user: userId })
    if (!inventory) {
      inventory = new Inventory({ user: userId })
    }

    // Calculate expiry date (5 days from now)
    const expiryDate = quinBoostAbility.expiresAt

    // Add QuinBoost to inventory
    inventory.abilities.push({
      abilityId: quinBoostAbility._id,
      quantity: 1,
      expiresAt: expiryDate,
      isActive: false,
      acquiredAt: new Date(),
    })

    await inventory.save()
    quinBoostAbility.claimed = true
    await quinBoostAbility.save()
    // Create notification
    const notification = new ApplicationUpdates({
      userId,
      title: 'QuinBoost Added to Inventory!',
      mainText: `You've earned a QuinBoost! Use it from your inventory to get a 1.5x RQM score boost on your next quiz.`,
      type: 'applicationUpdate',
    })

    await notification.save()

    res.status(200).json({
      message: 'QuinBoost successfully added to inventory',
      expiresAt: expiryDate,
    })
  } catch (error) {
    console.error('Error claiming QuinBoost:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

const updateNewSeasonModal = async (req, res) => {
  try {
    const userId = req.user._id // Assuming user ID is stored in req.user after authentication
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    if (
      user.newSeasonModalUpdateAt.getTime() + 7 * 24 * 60 * 60 * 1000 <
        new Date().getTime() ||
      req.query.newSeasonModal === 'false'
    ) {
      user.newSeasonModal = false
      await user.save()
    }

    res.status(200).json({
      message: 'New season modal updated successfully',
      show: user.newSeasonModal,
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
}

const seasonHistory = async (req, res) => {
  try {
    const user = await User.findOne({
      inGameName: req.params.inGameName,
    }).select('_id')

    const season = req.query.season

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const {
      Top_Percentage,
      percentileData,
      filteredLabels,
      filteredIQData,
      USER_IQ,
    } = await currentTopPercentOfUser({ userId: user._id, season })

    const [solvedQuizzes, iqScoresHistory] = await Promise.all([
      getSolvedQuizzesCount({ userId: user._id, season }),
      getUserIQScoreHistory({ userId: user._id, season }),
    ])

    res.status(200).json({
      lineGraph: iqScoresHistory,
      barGraph: {
        Top_Percentage,
        percentileData,
        filteredLabels,
        filteredIQData,
        USER_IQ,
      },
      solvedQuizzes,
      USER_IQ,
    })
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' })
    console.log(err)
  }
}

const bookmark = async (req, res) => {
  const { articleId, view, update } = req.query
  const userId = req.user._id

  try {
    const user = await User.findById(userId)
    const article = await Article.findById(articleId).select('_id')
    if (!article) {
      return res.status(404).json({ error: 'Article not found' })
    }
    const isBookmarked = user.bookmarks.includes(article._id)

    if (view === 'true' && update === 'false') {
      return res.status(200).json({ bookmarkStatus: isBookmarked })
    }
    if (isBookmarked) {
      user.bookmarks = user.bookmarks.filter(
        bookmark => bookmark.toString() !== article._id.toString(),
      )
    } else {
      user.bookmarks.push(article._id)
    }
    await user.save()
    res.status(200).json({
      message: 'Bookmark updated successfully',
      bookmarkStatus: !isBookmarked,
    })
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
    console.log(error)
  }
}

const getBookmarks = async (req, res) => {
  const userId = req.user._id
  const { lang } = req.query
  try {
    const user = await User.findById(userId).select('bookmarks').populate({
      path: 'bookmarks',
      select:
        '_id title category dateTime imgURL hindiTitle hindiMainText hindiAuthor',
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    const Bookmarks = user.bookmarks
    if (lang === 'hi')
      for (let bookmark of Bookmarks) {
        if (
          !bookmark.hindiTitle ||
          !bookmark.hindiMainText ||
          !bookmark.hindiAuthor
        ) {
          const response = await hindiConverter(bookmark._id)
          if (!bookmark.hindiMainText) {
            bookmark.hindiMainText = []
          }
          bookmark.hindiTitle = response.hindiTitle

          for (let key in response.hindiMainText) {
            if (!response.hindiMainText[key]) continue
            bookmark.hindiMainText.push(response.hindiMainText[key])
          }
          bookmark.hindiAuthor = response.hindiAuthor
        }
      }

    const bookmarks = user.bookmarks.map(bookmark => {
      return {
        _id: bookmark._id,
        title: bookmark.title,
        category: bookmark.category,
        date: formatDate(bookmark.dateTime),
        image: bookmark.imgURL[0],
        hindiTitle: bookmark.hindiTitle,
        dateTime: bookmark.dateTime,
        dateTimestamp: new Date(bookmark.dateTime).getTime(),
      }
    })
    bookmarks.sort((a, b) => b.dateTimestamp - a.dateTimestamp)
    res.status(200).json({ bookmarks })
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
    console.log(error)
  }
}

const removeBookmark = async (req, res) => {
  const { articleId } = req.query
  const userId = req.user._id
  try {
    const user = await User.findById(userId)
    const article = await Article.findById(articleId).select('_id')
    if (!article) {
      return res.status(404).json({ error: 'Article not found' })
    }
    user.bookmarks = user.bookmarks.filter(
      bookmark => bookmark.toString() !== article._id.toString(),
    )
    await user.save()
    res.status(200).json({ message: 'Bookmark removed successfully' })
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
    console.log(error)
  }
}

const NavLineGraph = async (req, res) => {
  const userId = req.user._id
  try {
    const user = await User.findById(userId)

    // console.log('User found:', userId)

    const iqScoresHistory = await getUserIQScoreHistory({ userId })

    res.status(200).json({
      lineGraph: iqScoresHistory,
      inGameName: user.inGameName,
    })
  } catch (error) {
    console.error('Error fetching user profile line graph:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

// @desc  Controls the sound effects of application for the user
// @route POST /api/user/soundController
// @access Private
const soundController = asyncHandler(async (req, res) => {
  const userId = req.user._id
  const { sound } = req.body

  const user = await User.findById(userId)
  user.soundSettings = sound
  await user.save()

  res.status(200).json({ message: 'Sound settings updated successfully' })
})

// @desc  Update user language
// @route PUT /api/user/language
// @access Private
const updateUserLanguage = async (req, res) => {
  try {
    const userId = req.user._id // Assuming you have middleware to extract user ID from the token
    const { language } = req.body

    // Update the user's language in the database
    await User.findByIdAndUpdate(userId, { userLanguage: language })

    res.status(200).json({ message: 'Language updated successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Failed to update language', error })
  }
}

const getUserTournamentData = async (req, res) => {
  try {
    const userId = req.params.userId // Fetch the userId from the route parameters

    const user = await User.findById(userId)
      .select('tournamentPerformance') // Only fetch the tournamentPerformance field
      .populate({
        path: 'tournamentPerformance.tournament', // Populate tournament references
        select: 'tournamentNumber', // Select specific fields from the tournament model
      })

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    res.status(200).json({
      tournamentPerformance: user.tournamentPerformance,
    })
  } catch (error) {
    console.error('Error fetching tournament performance:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

//@desc   Update displayed badge
//@route  POST /api/user/update-displayed-badge
//@access Private
const updateDisplayedBadge = async (req, res) => {
  try {
    const { badgeName, tournamentNumber, text } = req.body
    const userId = req.user._id // Assuming you have authentication middleware

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const validTournament = user.tournamentPerformance.find(
      t => t.tournamentNumber === tournamentNumber,
    )
    if (!validTournament) {
      return res.status(400).json({ error: 'Invalid tournament number' })
    }

    const rankInTournament = validTournament.rank

    user.displayedBadge = {
      tournamentNumber,
      rank: rankInTournament,
      participantCnt: validTournament.participantCnt,
      badgeName,
      text,
    }
    await user.save()

    res.status(200).json({
      message: 'Displayed badge updated successfully',
      badge: user.displayedBadge,
    })
  } catch (error) {
    console.error('Error updating displayed badge:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

const deleteAccount = async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' })
    }

    // Generate a token for email confirmation
    const token = jwt.sign(
      { userId: user._id },
      process.env.DELETE_ACCOUNT_SECRET,
      { expiresIn: '1h' },
    )

    // Send confirmation email
    const transporter = await mailTransporter()
    await transporter.sendMail({
      from: 'noreply@rapidrecap.com',
      to: user.email,
      subject: 'Confirm Account Deletion',
      html: `
        <p>Please click the link below to confirm your account deletion:</p>
        <a href="${process.env.FRONTEND_URL}/confirmDeleteAccount/${token}">Confirm Account Deletion</a>
        <p>This link will expire in 1 hour.</p>
      `,
    })

    res
      .status(200)
      .json({ message: 'Confirmation email sent. Please check your inbox.' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'An error occurred. Please try again.' })
  }
}

const confirmDeleteAccount = async (req, res) => {
  try {
    const { token } = req.params
    const decoded = jwt.verify(token, process.env.DELETE_ACCOUNT_SECRET)
    const userId = decoded.userId

    // Delete user and related data
    await User.findByIdAndDelete(userId)
    // Delete related data (adjust based on your data models)
    await QuizAttempt.deleteMany({ user: userId })
    await DailyIQ.deleteMany({ user: userId })
    await Activity.deleteMany({ userId: userId })
    await ApplicationUpdates.deleteMany({ userId: userId })
    await FriendRequest.deleteMany({ $or: [{ from: userId }, { to: userId }] })
    await QuinBoost.deleteMany({ user: userId })
    await Recommendation.deleteMany({ user_id: userId })
    await NotifiedArticles.deleteMany({ user_id: userId })
    await SeasonData.deleteMany({ userId: userId })
    await TimeSpent.deleteMany({ userId: userId })

    res
      .status(200)
      .json({ message: 'Your account has been successfully deleted.' })
  } catch (error) {
    console.error(error)
    res.status(400).json({
      message:
        'Invalid or expired token. Please try the deletion process again.',
    })
  }
}

// @desc   Update onboarding progress
// @route  POST /api/user/onboarding-progress
// @access Private
const updateOnboardingProgress = asyncHandler(async (req, res) => {
  try {
    // Add validation
    if (!req.user?._id) {
      return res.status(401).json({ message: 'User not authenticated' })
    }
    const result = await retryableOnboardingUpdate(req)
    res.status(result.status).json(result.data)
  } catch (error) {
    console.error('Error updating onboarding progress:', error)
    res.status(500).json({
      message: 'Error updating onboarding progress',
      error: error.message,
    })
  }
})

// @desc  Get onboarding progress
// @route GET /api/user/onboarding-progress
// @access Private
const getOnboardingProgress = asyncHandler(async (req, res) => {
  const userId = req.user._id

  try {
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.status(200).json({
      step: user.onboardingStep,
      language: user.userLanguage,
      categories: user.preferredCategories
        .filter(cat => !cat?.isInferred)
        .map(cat => cat?.category),
    })
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching onboarding progress',
      error: error.message,
    })
  }
})

const claimTournamentBadge = asyncHandler(async (req, res) => {
  const { tournamentNumber, badgeName } = req.body
  const userId = req.user._id

  try {
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Find the badge and mark it as claimed
    const badgeIndex = user.badges.findIndex(
      badge =>
        badge.tournamentNumber === tournamentNumber &&
        badge.badgeName === badgeName &&
        !badge.claimed,
    )

    if (badgeIndex === -1) {
      return res
        .status(404)
        .json({ message: 'Badge not found or already claimed' })
    }

    user.badges[badgeIndex].claimed = true
    await user.save()

    cache.keys().forEach(key => {
      if (key.startsWith('privilege_')) {
        cache.del(key)
      }
    })

    res.status(200).json({ message: 'Badge claimed successfully' })
  } catch (error) {
    console.error('Error claiming badge:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

const getValidCategories = asyncHandler(async (req, res) => {
  const userId = req.user._id

  try {
    // Get user's current badges for the tournament
    const user = await User.findById(userId)
    // get latest completed tournament
    const latestTournament = await Tournament.findOne({ status: 'completed' })
      .select('tournamentNumber')
      .sort({ tournamentNumber: -1 })

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    let badges = user?.badges || []
    const now = moment().tz('Asia/Kolkata')
    let currentBadges = badges.filter(
      badge =>
        badge.canBeClaimedUntil &&
        moment(badge.canBeClaimedUntil).isAfter(now) &&
        badge.tournamentNumber === latestTournament.tournamentNumber,
    )
    // Get all categories that have badges for this tournament
    const usedCategories = currentBadges.map(badge => badge.text)

    // Get all available categories (you'll need to import or define this)
    const allCategories = getCategories()

    // Filter out categories that already have badges
    const validCategories = allCategories.filter(
      category => !usedCategories.includes(category),
    )

    res.status(200).json({ validCategories })
  } catch (error) {
    console.error('Error getting valid categories:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

const updateBadgeCategory = asyncHandler(async (req, res) => {
  const { badgeName, selectedCategory } = req.body
  const userId = req.user._id

  try {
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    // get latest completed tournament
    const latestTournament = await Tournament.findOne({ status: 'completed' })
      .select('tournamentNumber')
      .sort({ tournamentNumber: -1 })

    // Find the badge
    const badgeIndex = user.badges.findIndex(
      badge =>
        badge.tournamentNumber === latestTournament.tournamentNumber &&
        badge.badgeName === badgeName &&
        !badge.text, // Must be unnamed
    )

    if (badgeIndex === -1) {
      return res
        .status(404)
        .json({ message: 'Badge not found or already has category' })
    }
    const allCategories = getCategories()

    // Validate if category is allowed
    const usedCategories = user.badges
      .filter(
        badge => badge.tournamentNumber === latestTournament.tournamentNumber,
      )
      .map(badge => badge.text)
    // Filter out categories that already have badges
    const validCategories = allCategories.filter(
      category => !usedCategories.includes(category),
    )
    if (!validCategories.includes(selectedCategory)) {
      return res.status(400).json({
        message: 'Category already has a badge for this tournament',
        invalidCategory: true,
      })
    }

    // Update badge
    user.badges[badgeIndex].text = selectedCategory
    await user.save()

    res.status(200).json({
      message: 'Badge category updated successfully',
      updatedBadge: user.badges[badgeIndex],
    })
  } catch (error) {
    console.error('Error updating badge category:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

const checkRewardsModalStatus = asyncHandler(async (req, res) => {
  const userId = req.user._id

  try {
    const user = await User.findById(userId)

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // For existing users (created before feature start date)
    const isExistingUser =
      user.createdAt < REWARDS_MODAL_CONFIG.FEATURE_START_DATE

    // Check if modal should be shown
    let shouldShowModal = false
    if (isExistingUser && !user.hasSeenRewardsModal) {
      // Set expiry date if not set
      if (!user.rewardsModalExpiryDate) {
        user.rewardsModalExpiryDate = REWARDS_MODAL_CONFIG.EXPIRY_DATE
        await user.save()
      }

      // Check if within expiry period
      if (new Date() <= user.rewardsModalExpiryDate) {
        shouldShowModal = true
        // Mark as seen
        user.hasSeenRewardsModal = true
        await user.save()
      }
    }

    res.status(200).json({ shouldShowModal })
  } catch (error) {
    console.error('Error checking rewards modal status:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

const getUserAchievements = asyncHandler(async (req, res) => {
  const userId = req.user._id

  const user = await User.findById(userId)
    .populate('badges')
    .populate('tournamentPerformance')
    .populate({
      path: 'quizAttempts',
      populate: {
        path: 'article',
        select: 'category articleDifficulty',
      },
    })

  // Get all timeSpent records for this user
  const timeSpentRecords = await TimeSpent.find({ userId })
    .populate('articleId', 'category')
    .lean()

  // Progress Stats
  const progressStats = {
    level: user.level,
    totalXP: user.xp,
    quizzesSolved: user.quizAttempts.length,
    globalRank: user.rank,
    society: user.society,
    IQScore: user.IQ_score,
    averageRQM: user.avgRQM,
  }

  // Tournament Achievements
  const tournamentStats = {
    totalBadges: user.badges.length,
    aceBadges: user.badges.filter(b => b.badgeName === 'ACE').length,
    proBadges: user.badges.filter(b => b.badgeName === 'PRO').length,
    champBadges: user.badges.filter(b => b.badgeName === 'CHAMP').length,
    tournamentWins: user.tournamentPerformance.filter(t => t.rank === 1).length,
    top3Finishes: user.tournamentPerformance.filter(t => t.rank <= 3).length,
  }

  // Calculate perfect quiz days
  const quizAttemptsByDay = user.quizAttempts.reduce((acc, attempt) => {
    const date = new Date(attempt.createdAt).toDateString()
    if (!acc[date]) {
      acc[date] = {
        attempts: [],
        totalRQM: 0,
        count: 0,
      }
    }
    acc[date].attempts.push(attempt)
    acc[date].totalRQM += attempt.RQM_score
    acc[date].count += 1
    return acc
  }, {})

  const perfectQuizDays = Object.values(quizAttemptsByDay).filter(day => {
    // A perfect day is when average RQM score is above 90 with at least 3 attempts
    return day.count >= 3 && day.totalRQM / day.count >= 90
  }).length

  // Streak Achievements
  const streakStats = {
    currentStreak: user.streak,
    longestStreak: user.longestStreak,
    totalDaysActive: user.loginStreak,
    perfectQuizDays,
  }

  // Calculate preferred categories using both quiz attempts and time spent
  const categoryStats = {}

  // Process quiz attempts for categories
  user.quizAttempts.forEach(attempt => {
    const category = attempt.article?.category
    if (!category) return

    if (!categoryStats[category]) {
      categoryStats[category] = {
        quizCount: 0,
        totalRQM: 0,
        timeSpent: 0,
        score: 0,
      }
    }
    categoryStats[category].quizCount += 1
    categoryStats[category].totalRQM += attempt.RQM_score
  })

  // Process time spent for categories
  timeSpentRecords.forEach(record => {
    const category = record.articleId?.category
    if (!category) return

    if (!categoryStats[category]) {
      categoryStats[category] = {
        quizCount: 0,
        totalRQM: 0,
        timeSpent: 0,
        score: 0,
      }
    }
    categoryStats[category].timeSpent += record.timeSpent
  })

  // Calculate final scores for categories
  Object.keys(categoryStats).forEach(category => {
    const stats = categoryStats[category]
    // Weight calculation:
    // 50% - Number of quizzes attempted
    // 30% - Average RQM score
    // 20% - Time spent
    const quizWeight = (stats.quizCount / user.quizAttempts.length) * 50
    const rqmWeight =
      stats.quizCount > 0 ? (stats.totalRQM / stats.quizCount / 100) * 30 : 0
    const timeWeight =
      (stats.timeSpent /
        Object.values(categoryStats).reduce(
          (sum, cat) => sum + cat.timeSpent,
          0,
        )) *
      20

    stats.score = quizWeight + rqmWeight + timeWeight
  })

  // Get top 3 categories
  const topCategories = Object.entries(categoryStats)
    .sort(([, a], [, b]) => b.score - a.score)
    .slice(0, 3)
    .map(([category, stats]) => ({
      category,
      score: Math.round(stats.score),
      quizCount: stats.quizCount,
      avgRQM:
        stats.quizCount > 0 ? Math.round(stats.totalRQM / stats.quizCount) : 0,
    }))

  // Category Expertise
  const expertise = {
    easyMastery: user.easyQuizCount,
    mediumMastery: user.mediumQuizCount,
    hardMastery: user.hardQuizCount,
    preferredCategories: topCategories,
  }

  res.json({
    progressStats,
    tournamentStats,
    streakStats,
    categoryStats: expertise,
  })
})

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  loginCheck,
  verifyUser,
  resendOTP,
  forgotPassword,
  handleGoogleLogin,
  calculateUserIQScores,
  editProfile,
  leaderBoard,
  profile,
  expectedIQScore,
  solvedQuizHistory,
  userSearch,
  profilePrivacy,
  getUpdates,
  readUpdates,
  trashUpdate,
  trashAllUpdate,
  sendMailForNotifySubscribe,
  upgradeMessageClose,
  quizDailyStreakUpdator,
  longestStreakCalculatorOfAllUsers,
  streakChecker,
  updateNewSeasonModal,
  seasonHistory,
  bookmark,
  getBookmarks,
  removeBookmark,
  NavLineGraph,
  getUserIds,
  soundController,
  updateUserLanguage,
  updateDisplayedBadge,
  getUserTournamentData,
  deleteAccount,
  confirmDeleteAccount,
  updateOnboardingProgress,
  getOnboardingProgress,
  claimQuinBoost,
  claimStreakSurge,
  claimTournamentBadge,
  getValidCategories,
  updateBadgeCategory,
  checkRewardsModalStatus,
  getUserAchievements,
}
