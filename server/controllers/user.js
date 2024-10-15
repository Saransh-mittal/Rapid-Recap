const User = require('../model/userSchema')
const QuizAttempt = require('../model/quizAttemptSchema')

const bcrypt = require('bcryptjs')
const { generateOtp, mailTransporter } = require('../utils/mail.utils')
const VerificationToken = require('../model/verificationToken')
const { isValidObjectId } = require('mongoose')
const jwt = require('jsonwebtoken')
const {
  getUserIQScoreHistory,
  currentTopPercentOfUser,
  getSolvedQuizzesCount,
  calculateUserRank,
  dailyStreakCalculator,
  longestStreakCalculator,
  currDayStreakCalulator,
  makeFirstLoginFalse,
  getTheRevivalEndDay,
} = require('../utils/user.utils')
const { dailyUserIQCalc } = require('../utils/dailyUserIQCalc.utils')
const ApplicationUpdates = require('../model/applicationUpdatesSchema')
// const { progressBar } = require("../utils/progress.utils");
const QuinBoost = require('../model/quinBoostSchema')
const MailTemplates = require('../data/MailTemplates.js')
const { isValidEmail, formatDate } = require('../utils/miscellaneous.utils.js')
const {
  startSession,
  commitSession,
  abortSession,
} = require('../db/session.js')
const {
  generateRecommendations,
} = require('../services/recommendationService.js')
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
const createIndexesIfNotExist = require('../scripts/createIndexesIfNotExist.js')

const registerUser = async (req, res) => {
  // console.log(req.body);
  const { name, email, pic, password, cpassword, inGameName } = req.body

  if (!name || !email || !pic || !password || !cpassword || !inGameName) {
    return res.status(422).json({ error: 'Please fill the required field' })
  }

  if (!isValidEmail(email)) {
    return res.status(422).json({ error: 'Invalid Email' })
  }

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
  if (name.length > 16) {
    return res
      .status(422)
      .json({ error: 'Name cannot be greater than 16 characters' })
  }

  if (inGameName.includes(' ')) {
    return res.status(422).json({ error: 'In Game Name cannot have spaces' })
  }

  const session = await startSession()
  try {
    const response = await User.findOne({ email }).session(session)
    const response2 = await User.findOne({ inGameName }).session(session)

    if (response) {
      return res.status(422).json({ error: 'Email already exists' })
    }
    if (response2) {
      return res
        .status(422)
        .json({ error: 'This In Game Name is already taken' })
    }

    if (password.length < 8) {
      throw new Error('Password should be at least 8 characters')
    }

    if (password !== cpassword) {
      return res
        .status(422)
        .json({ error: 'Password and confirm password do not match' })
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

    await commitSession()
    generateRecommendations(user._id.toString())
    return res.status(201).json({ message: 'Registered Successfully' })
  } catch (err) {
    await abortSession(session)
    res.status(500).send('Internal Server Error')
    console.log(err)
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
        expires: new Date(Date.now() + 2592000000),
        httpOnly: true,
      })

    return res
      .status(201)
      .json({ message: 'SignIn Successfull', user: findUser, token })
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

const loginCheck = async (req, res) => {
  const user = await User.findById(req.user._id)
  res.status(201).send(user)
}

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
    res.status(201).json({ message: 'Google Login Successfull', user, token })
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

  // Try to get the cached result
  const cachedResult = cache.get(cacheKey)
  if (cachedResult) {
    return res.status(200).json(cachedResult)
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
      .sort({ IQ_score: -1, avgRQM: -1 })
      .skip(skipNumber)
      .limit(limitNumber)
      .lean()

    // Step 3: Fetch quiz attempts for paginated users
    const userIds = paginatedUsers.map(user => user._id)
    const quizAttempts = await QuizAttempt.aggregate([
      { $match: { user: { $in: userIds }, season: 2 } },
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

    await User.bulkWrite(bulkOps)

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

    // Step 7: Get current user data
    let currUserData = {}
    if (currUserId) {
      const currUser = await User.findById(currUserId)
        .select('avgRQM quizAttempts rank')
        .populate({
          path: 'quizAttempts',
          match: { season: 2 },
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
      return res.status(404).json({ error: 'User not found' })
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

// Get all application updates
const getUpdates = async (req, res) => {
  const userId = req.user._id
  //console.log(userId);
  try {
    const updates = await ApplicationUpdates.find({ userId: userId }).sort({
      date: -1,
    })
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
const streakChecker = async (req, res) => {
  const userId = req.user._id
  try {
    const user = await User.findById(userId)

    // Check if the latest attempt is from yesterday
    const today = new Date()
    today.setUTCHours(0, 0, 0, 0) // Set time to start of the day
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)
    const pastStreak = user.streak
    let isRevivalPeriod = false
    let streakBeforeBreak = 0
    let remainingTimeBeforeRevival = null

    if (
      user.revivalPeriodEnd &&
      new Date().getTime() > user.revivalPeriodEnd.getTime()
    ) {
      // Revival period ended without success
      user.revivalPeriodEnd = null
    }
    if (user.streakExpiry.getTime() < tomorrow.getTime()) {
      user.todaysQuizCnt = 0
    }
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
      // Reset streak
      user.streak = 0
      user.streakExpiry = new Date(today.getTime() + 24 * 60 * 60 * 1000)
      user.todayBoost = false
      await user.save()
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
    const isBoosted =
      user.streak > 0 &&
      user.streak % 7 === 0 &&
      user.streakExpiry.getTime() === tomorrow.getTime()
    user.todayBoost = isBoosted
    let xpAwarded = 0
    let seven_day_streak = false
    const checkIfAlreadyAwarded = await Activity.find({
      userId: user._id,
      type: activityTypes.SEVEN_DAY_STREAK.type,
      timestamp: { $gte: today },
    })

    if (
      isBoosted &&
      user.todaysQuizCnt === 1 &&
      checkIfAlreadyAwarded.length === 0
    ) {
      xpAwarded = await logActivity({
        userInGameName: user.inGameName,
        type: activityTypes.SEVEN_DAY_STREAK.type,
        date: today,
      })
      seven_day_streak = true
    }
    if (user.streak > user.longestStreak) {
      user.longestStreak = user.streak
    }
    if (user.streak >= 2) {
      user.eligibleForTournament = true
    }
    await user.save()

    res.status(200).json({
      streak: user.streak,
      longestStreak: user.longestStreak,
      isBoosted,
      isRevivalPeriod,
      streakBeforeBreak,
      remainingTimeBeforeRevival,
      todaysQuizAttemptsCount: user.todaysQuizCnt,
      seven_day_streak,
      xpAwarded,
    })
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
    console.log(error)
  }
}

const quinBoostChecker = async (req, res) => {
  const userId = req.user._id
  try {
    const user = await User.findById(userId).populate({
      path: 'quinBoosts.quinBoost',
      select: 'createdAt',
    })
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const today = new Date()
    today.setUTCHours(0, 0, 0, 0)
    const quinBoostsToReset = user.quinBoosts.filter(quinBoost => {
      return quinBoost.quinBoost ? quinBoost.quinBoost.createdAt < today : false
    })

    // Set boosted to false for filtered quinBoosts
    for (const quinBoost of quinBoostsToReset) {
      quinBoost.boosted = false
    }
    await user.save()
    const quizAttempts = await QuizAttempt.find({
      user: userId,
      createdAt: { $gte: today }, // Find documents created today or later
    })
    const quizLeftToGetQuizBoost = 5 - (quizAttempts.length % 6)
    const isQuinBoostAvailable =
      quizLeftToGetQuizBoost === 0 && quizAttempts.length > 0

    if (isQuinBoostAvailable) {
      const existingQuinBoost = await QuinBoost.findOne({
        user: userId,
        createdAt: { $gte: today },
        quizCount: quizAttempts.length,
      })
      if (!existingQuinBoost) {
        const quinBoost = new QuinBoost({
          user: user._id,
          quizCount: quizAttempts.length,
          createdAt: new Date(),
        })
        await quinBoost.save()
        user.quinBoosts.push({
          quinBoost: quinBoost._id,
          boosted: true,
        })
        await user.save()
        const notificationTitle = 'Quin Boost Activated!'
        const notificationText = quinBoostUnlockTemplate(
          user.todayBoost ? 1.75 : 1.5,
        ) // Using template for inbox notification

        const newNotification = new ApplicationUpdates({
          userId: user._id,
          title: notificationTitle,
          mainText: notificationText, // HTML template for the notification
          img: '', // Optional image if needed
          read: false,
        })

        await newNotification.save()
      }
    }
    res.status(200).json({
      quizLeftToGetQuizBoost,
      isQuinBoostAvailable,
    })
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
    console.log(error)
  }
}

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
  quinBoostChecker,
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
}
