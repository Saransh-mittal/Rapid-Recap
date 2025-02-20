const DailyIQ = require('../model/dailyIQSchema')
const QuizAttempt = require('../model/quizAttemptSchema')
const User = require('../model/userSchema')
const { formatDate } = require('./date.utils')
const {
  binarySearch,
  binarySearchForLeftRange,
  binarySearchForRightRange,
} = require('./miscellaneous.utils')
const configService = require('../configService')
const SeasonData = require('../model/seasonDataSchema')
const mongoose = require('mongoose')
const { makeRetryable } = require('./retryUtils')

const calculateTopPercent = (userIQ, sortedIQScores) => {
  //sortedIQScores.sort((a, b) => b - a);
  // const index = sortedIQScores.findIndex((score) => score === userIQ);
  const index = binarySearch(sortedIQScores, userIQ)
  if (index === -1) {
    throw new Error('User IQ score not found in the list')
  }
  return (100 - ((index + 1) / sortedIQScores.length) * 100).toFixed(2)
}

const calculateLabelsAndData = IQScores => {
  const labels = Array.from({ length: 40 }, (_, i) => (i + 1) * 10)
  const filteredLabels = []
  const filteredIQData = []

  for (let i = 0; i < labels.length; i++) {
    const lowerBound = labels[i] - 10
    const upperBound = labels[i]
    const index_left = binarySearchForLeftRange(IQScores, lowerBound)
    const index_right = binarySearchForRightRange(IQScores, upperBound)

    // // Calculate the count of elements within the current threshold range
    const count =
      index_left == -1 || index_right == -1 || index_left > index_right
        ? 0
        : index_right - index_left + 1

    // // If count is not zero, add the label and count to filteredLabels and filteredIQData respectively
    if (count !== 0) {
      filteredLabels.push(`${lowerBound}-${upperBound}`)
      filteredIQData.push(count)
    }
  }

  return { filteredLabels, filteredIQData }
}

const calculatePercentilesOfEachBar = (
  sortedScores,
  filteredLabels,
  filteredIQData,
) => {
  const percentiles = []

  // Define the function to calculate percentile
  const calculatePercentile = iqScore => {
    //const sortedScores = IQScores.sort((a, b) => a - b);
    //const index = sortedScores.findIndex((score) => score >= iqScore);
    const index = binarySearchForLeftRange(sortedScores, iqScore)
    return index === 0 || index === -1
      ? 100
      : 100 - ((index + 1) / sortedScores.length) * 100
  }

  // Iterate through each data point
  for (let i = 0; i < filteredLabels.length; i++) {
    const [lowerBound, upperBound] = filteredLabels[i].split('-').map(Number)
    const percentile = calculatePercentile(lowerBound).toFixed(2)
    percentiles.push({
      lowerBound,
      upperBound,
      percentile,
      count: filteredIQData[i],
    })
  }

  return percentiles
}

const getUserIQScoreHistory = async ({ userId, season = null }) => {
  const user = await User.findById(userId)
  if (!user) {
    throw new Error('User not found')
  }
  //await user.populate("dailyIQScores");
  const latestIQScores = !season
    ? await DailyIQ.aggregate([
        { $match: { user: user._id } }, // Filter by user
        { $sort: { date: -1 } }, // Sort by date in descending order
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
            latestScore: { $first: '$IQ_score' },
            latestDailyRank: { $first: '$dailyRank' },
            date: { $first: '$date' },
          },
        },
      ])
    : await DailyIQ.aggregate([
        { $match: { user: user._id, season: parseInt(season, 10) } }, // Filter by user
        { $sort: { date: -1 } }, // Sort by date in descending order
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
            latestScore: { $first: '$IQ_score' },
            latestDailyRank: { $first: '$dailyRank' },
            date: { $first: '$date' },
          },
        },
      ])

  // Map the result to the desired format
  const iqScoresHistory = latestIQScores.map(score => ({
    date: formatDate(score.date),
    IQScore: score.latestScore,
    dailyRank: score.latestDailyRank,
  }))

  return iqScoresHistory.sort((a, b) => new Date(a.date) - new Date(b.date))
}

const currentTopPercentOfUser = async ({ userId, season = null }) => {
  //console.log(userId, season);
  //console.log(configService.getCurrentSeason());
  const user =
    !season || season == configService.getCurrentSeason()
      ? await User.findById(userId).select('IQ_score')
      : await SeasonData.findOne({
          userId: userId,
          season: parseInt(season, 10),
        }).select('IQ_score')
  if (!user) {
    throw new Error('User not found')
  }
  const USER_IQ = user.IQ_score
  let users

  if (!season || season == configService.getCurrentSeason()) {
    users = await User.find({ IQ_score: { $gt: 0 } }).select('IQ_score')
  } else {
    users = await SeasonData.find({ season: parseInt(season, 10) }).select(
      'IQ_score',
    )
  }

  const IQScores = users.map(u => u.IQ_score)

  const sortedIQScores = IQScores.sort((a, b) => a - b)
  const Top_Percentage =
    USER_IQ === 0 ? 100 : calculateTopPercent(USER_IQ, sortedIQScores)
  const { filteredLabels, filteredIQData } =
    calculateLabelsAndData(sortedIQScores)

  return {
    Top_Percentage,
    percentileData: calculatePercentilesOfEachBar(
      sortedIQScores,
      filteredLabels,
      filteredIQData,
    ),
    filteredLabels,
    filteredIQData,
    USER_IQ,
  }
}

const getSolvedQuizzesCount = async ({ userId, season = null }) => {
  const user = await User.findById(userId)
  if (!user) {
    throw new Error('User not found')
  }

  let totalSolvedQuiz
  let easyQuizzesCount
  let mediumQuizzesCount
  let hardQuizzesCount
  if (!season) {
    totalSolvedQuiz = user.quizAttempts.length
    easyQuizzesCount = user.easyQuizCount
    mediumQuizzesCount = user.mediumQuizCount
    hardQuizzesCount = user.hardQuizCount
  } else if (season == configService.getCurrentSeason()) {
    const quizAttempts = await QuizAttempt.find({
      user: userId,
      season: parseInt(season, 10),
    })
    totalSolvedQuiz = quizAttempts.length
    easyQuizzesCount = quizAttempts.filter(
      quiz => quiz.articleDifficulty < 0.5,
    ).length
    mediumQuizzesCount = quizAttempts.filter(
      quiz => quiz.articleDifficulty >= 0.5 && quiz.articleDifficulty < 0.7,
    ).length
    hardQuizzesCount = quizAttempts.filter(
      quiz => quiz.articleDifficulty >= 0.7,
    ).length
  } else {
    const seasonData = await SeasonData.findOne({
      userId: userId,
      season: parseInt(season, 10),
    })
    totalSolvedQuiz =
      seasonData.easyQuizCount +
      seasonData.mediumQuizCount +
      seasonData.hardQuizCount
    easyQuizzesCount = seasonData.easyQuizCount
    mediumQuizzesCount = seasonData.mediumQuizCount
    hardQuizzesCount = seasonData.hardQuizCount
  }
  // Calculate the number of users with fewer easy, medium, and hard quizzes
  let usersCount
  if (!season) {
    usersCount = await User.countDocuments()
  } else if (season == configService.getCurrentSeason()) {
    const uniqueUserCounts = await QuizAttempt.aggregate([
      { $match: { season: parseInt(season, 10) } },
      { $group: { _id: '$user' } },
      { $count: 'uniqueUserCount' },
    ])
    usersCount =
      uniqueUserCounts.length > 0 ? uniqueUserCounts[0].uniqueUserCount : 0
  } else {
    usersCount = await SeasonData.countDocuments({
      season: parseInt(season, 10),
    })
  }

  let easyBeatsPercentage, medBeatsPercentage, hardBeatsPercentage
  if (!season) {
    easyBeatsPercentage =
      ((await User.countDocuments({
        easyQuizCount: { $lt: easyQuizzesCount },
      })) /
        usersCount) *
      100
    medBeatsPercentage =
      ((await User.countDocuments({
        mediumQuizCount: { $lt: mediumQuizzesCount },
      })) /
        usersCount) *
      100
    hardBeatsPercentage =
      ((await User.countDocuments({
        hardQuizCount: { $lt: hardQuizzesCount },
      })) /
        usersCount) *
      100
  } else if (season == configService.getCurrentSeason()) {
    const easyQuizCountUsers = await QuizAttempt.aggregate([
      { $match: { season: parseInt(season, 10) } },
      {
        $group: {
          _id: '$user',
          easyQuizCount: {
            $sum: { $cond: [{ $lt: ['$articleDifficulty', 0.5] }, 1, 0] },
          },
        },
      },
      { $match: { easyQuizCount: { $lt: easyQuizzesCount } } },
      { $count: 'count' },
    ])
    easyBeatsPercentage =
      easyQuizCountUsers.length > 0
        ? (easyQuizCountUsers[0].count / usersCount) * 100
        : 0

    const mediumQuizCountUsers = await QuizAttempt.aggregate([
      { $match: { season: parseInt(season, 10) } },
      {
        $group: {
          _id: '$user',
          mediumQuizCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gte: ['$articleDifficulty', 0.5] },
                    { $lt: ['$articleDifficulty', 0.7] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      { $match: { mediumQuizCount: { $lt: mediumQuizzesCount } } },
      { $count: 'count' },
    ])
    medBeatsPercentage =
      mediumQuizCountUsers.length > 0
        ? (mediumQuizCountUsers[0].count / usersCount) * 100
        : 0

    const hardQuizCountUsers = await QuizAttempt.aggregate([
      { $match: { season: parseInt(season, 10) } },
      {
        $group: {
          _id: '$user',
          hardQuizCount: {
            $sum: { $cond: [{ $gte: ['$articleDifficulty', 0.7] }, 1, 0] },
          },
        },
      },
      { $match: { hardQuizCount: { $lt: hardQuizzesCount } } },
      { $count: 'count' },
    ])
    hardBeatsPercentage =
      hardQuizCountUsers.length > 0
        ? (hardQuizCountUsers[0].count / usersCount) * 100
        : 0
  } else {
    easyBeatsPercentage =
      ((await SeasonData.countDocuments({
        season: parseInt(season, 10),
        easyQuizCount: { $lt: easyQuizzesCount },
      })) /
        usersCount) *
      100
    medBeatsPercentage =
      ((await SeasonData.countDocuments({
        season: parseInt(season, 10),
        mediumQuizCount: { $lt: mediumQuizzesCount },
      })) /
        usersCount) *
      100
    hardBeatsPercentage =
      ((await SeasonData.countDocuments({
        season: parseInt(season, 10),
        hardQuizCount: { $lt: hardQuizzesCount },
      })) /
        usersCount) *
      100
  }

  return {
    solvedQuizzesCount: totalSolvedQuiz,
    easy: { easyQuizzesCount, easyBeatsPercentage },
    medium: { mediumQuizzesCount, medBeatsPercentage },
    hard: { hardQuizzesCount, hardBeatsPercentage },
  }
}

const calculateUserRank = async ({ userId }) => {
  const user = await User.findById(userId)
  return user.rank
}

const dailyStreakCalculator = async userId => {
  try {
    // Find the user by ID
    const user = await User.findById(userId)

    // If user not found, return error
    if (!user) {
      throw new Error('User not found')
    }

    // Use aggregation pipeline to group quiz attempts by day
    const streakData = await QuizAttempt.aggregate([
      {
        $match: {
          user: user._id,
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: -1 }, // Sort by date in descending order
      },
    ])
    if (streakData.length === 0) {
      return 0 // No streak
    }

    // const yesterday = new Date(streakData[1]._id);
    const latestAttemptDate = new Date(streakData[0]._id)
    const today = new Date()
    today.setUTCHours(0, 0, 0, 0) // Set time to start of the day

    // const isDiffDay = Math.floor(
    //   (yesterday.getTime() - latestAttemptDate.getTime()) / (1000 * 3600 * 24)
    // );
    // //console.log(isDiffDay, yesterday, latestAttemptDate, streakData[0]._id);
    // if (isDiffDay) {
    //   user.streak = 0;
    //   latestAttemptDate.setUTCDate(latestAttemptDate.getUTCDate() + 1);
    //   latestAttemptDate.setHours(0, 0, 0, 0);
    //   user.streakExpiry = latestAttemptDate;
    //   return 0; // No streak
    // }

    // Iterate through quiz attempts to find streak
    let streak = 1
    for (let i = 1; i < streakData.length; i++) {
      // Check if consecutive days
      const currentDay = new Date(streakData[i]._id)
      const prevDay = new Date(streakData[i - 1]._id)
      const diffInTime = currentDay.getTime() - prevDay.getTime()
      const diffInDays = diffInTime / (1000 * 3600 * 24)
      //console.log(currentDay, prevDay);
      if (Math.abs(diffInDays) === 1) {
        streak++
      } else {
        if (i == 1) {
          const yesterday = new Date()
          yesterday.setUTCDate(yesterday.getUTCDate() - 1)
          yesterday.setUTCHours(0, 0, 0, 0)
          const today = new Date()
          today.setUTCHours(0, 0, 0, 0)
          latestAttemptDate.setUTCHours(0, 0, 0, 0)
          if (
            yesterday.getTime() !== latestAttemptDate.getTime() &&
            today.getTime() !== latestAttemptDate.getTime()
          ) {
            streak = 0
          }
        }
        // Streak broken, exit loop
        break
      }
    }
    latestAttemptDate.setUTCDate(latestAttemptDate.getUTCDate() + 1)
    latestAttemptDate.setUTCHours(0, 0, 0, 0)
    if (today.getTime() > user.streakExpiry.getTime()) {
      // Reset streak
      user.streak = 0
      user.streakExpiry = new Date(today.getTime() + 24 * 60 * 60 * 1000)
      await user.save()
      return 0
    }
    user.streak = streak
    user.streakExpiry = latestAttemptDate
    await user.save()
    return streak
  } catch (error) {
    console.error(error)
  }
}

const longestStreakCalculator = async userId => {
  try {
    // Find the user by ID
    const user = await User.findById(userId)

    // If user not found, return error
    if (!user) {
      throw new Error('User not found')
    }

    // Use aggregation pipeline to group quiz attempts by day
    const streakData = await QuizAttempt.aggregate([
      {
        $match: {
          user: user._id,
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: -1 }, // Sort by date in descending order
      },
    ])
    if (streakData.length === 0) {
      user.longestStreak = 0
      await user.save()
      return 0 // No streak
    }

    // Iterate through streakData to find longest streak
    let longestStreak = 0

    for (let i = 0; i < streakData.length; i++) {
      let streak = 1
      for (let j = i + 1; j < streakData.length; j++) {
        const currentDay = new Date(streakData[j]._id)
        const prevDay = new Date(streakData[j - 1]._id)
        const diffInTime = currentDay.getTime() - prevDay.getTime()
        const diffInDays = diffInTime / (1000 * 3600 * 24)
        if (Math.abs(diffInDays) === 1) {
          streak++
        } else {
          break
        }
      }
      longestStreak = Math.max(longestStreak, streak)
    }
    user.longestStreak = longestStreak
    await user.save()
    return longestStreak
  } catch (error) {
    console.error(error)
  }
}

const streakBrokenDaysCalculator = async userId => {
  try {
    const user = await User.findById(userId)
    if (!user) {
      throw new Error('User not found')
    }

    // last quiz attempt dateTime in UTC
    const lastAttempt = await QuizAttempt.findOne({ user: userId }).sort({
      createdAt: -1,
    })
    if (!lastAttempt) {
      return -1
    }
    const lastAttemptDate = lastAttempt.createdAt
    lastAttemptDate.setUTCHours(0, 0, 0, 0)

    const today = new Date()
    today.setUTCHours(0, 0, 0, 0)

    // If last attempt was today, no streak broken
    if (lastAttemptDate.getTime() === today.getTime()) {
      return 0
    }
    // If last attempt was day before yesterday then streak broken recently i.e total days = 2 = today - lastAttemptDate
    const diffInTime = today.getTime() - lastAttemptDate.getTime()
    const diffInDays = diffInTime / (1000 * 3600 * 24)
    return diffInDays
  } catch (error) {
    console.error(error)
  }
}

const noLoginDaysSpentCalculator = async userId => {
  try {
    const user = await User.findById(userId)
    const lastLogin = user.lastLogin
    lastLogin.setUTCHours(0, 0, 0, 0)
    const today = new Date()
    today.setUTCHours(0, 0, 0, 0)

    return Math.floor(
      (today.getTime() - lastLogin.getTime()) / (1000 * 3600 * 24),
    )
  } catch (error) {
    console.log(error)
  }
}
// write a logic for calculating the number of the quizes given by the user for curent day
const currDayStreakCalulator = async userId => {
  try {
    const user = await User.findById(userId)
    if (!user) {
      throw new Error('User not found')
    }
    const today = new Date()
    today.setUTCHours(0, 0, 0, 0)
    const quizAttempts = await QuizAttempt.find({
      user: userId,
      createdAt: { $gte: today },
    })
    return quizAttempts.length
  } catch (error) {
    console.error(error)
  }
}

const makeFirstLoginFalse = async userId => {
  try {
    await User.findByIdAndUpdate(userId, { firstLogin: false })
  } catch (error) {
    console.log(error)
  }
}

const getTheRevivalEndDay = (streak, streakExpireAt) => {
  let i = 0
  if (streak < 5) return null
  while (1) {
    const lowerBound = (((i - 1) * (i + 2)) / 2 + 1) * 7
    const upperBound = ((i * (i + 3)) / 2 + 1) * 7 - 1

    if (streak >= lowerBound && streak <= upperBound) {
      i++
      break
    }
    i++
  }
  const revivalEndDay = new Date(
    streakExpireAt.getTime() + i * 24 * 60 * 60 * 1000,
  )
  return revivalEndDay
}

const updateUserStats = async ({
  user,
  RQM_score,
  articleDifficulty,
  todayAttemptsCount,
  session,
  newQuizAttempt,
}) => {
  let sumOfRQM = user.avgRQM * user.quizAttempts.length
  sumOfRQM += RQM_score
  user.avgRQM = sumOfRQM / (user.quizAttempts.length + 1)
  user.quizAttempts.push(newQuizAttempt._id)
  const expiry = new Date()
  expiry.setUTCDate(expiry.getUTCDate() + 1)
  expiry.setUTCHours(0, 0, 0, 0)
  user.streakExpiry = expiry

  if (todayAttemptsCount === 1) {
    if (user.streak + 1 > user.longestStreak) {
      user.longestStreak = user.streak + 1
    }
    user.streak++
  }

  if (articleDifficulty < 0.5) user.easyQuizCount++
  else if (articleDifficulty < 0.7) user.mediumQuizCount++
  else user.hardQuizCount++

  user.rankedInCurrentSeason = true
  user.todaysQuizCnt++

  await user.save({ session })
}

const formatPreferredCategories = preferences => {
  if (!preferences || !Array.isArray(preferences)) return []

  return preferences
    .filter(pref => !pref.isInferred)
    .map(pref => ({
      category: pref.category,
      weight: pref.weight,
      isInferred: !!pref.isInferred,
      lastUpdated: pref.lastUpdated
        ? pref.lastUpdated.toISOString()
        : new Date().toISOString(),
    }))
}

function calculateLoginStreak(user, today) {
  // Default streak for first login
  if (!user.lastLogin) {
    return { streak: 1 }
  }

  const lastLoginDate = new Date(user.lastLogin)
  lastLoginDate.setUTCHours(0, 0, 0, 0)

  const dayDiff = Math.floor(
    (today.getTime() - lastLoginDate.getTime()) / (24 * 60 * 60 * 1000),
  )

  // Initialize streak if undefined
  const currentStreak = user.loginStreak || 0

  if (dayDiff === 0) {
    return { streak: currentStreak } // Same day login
  }
  if (dayDiff === 1) {
    return { streak: currentStreak + 1 } // Consecutive day
  }
  return { streak: 1 } // Reset streak
}

// Helper function to prepare data
function prepareOnboardingData(body) {
  const {
    step,
    stepId,
    language,
    categories,
    quizResult,
    currentStep,
    nextStep,
    currentStepId,
    nextStepId,
    ...restData
  } = body

  // Handle the old format (using step number)
  const isOldFormat = step !== undefined && !currentStep

  function getStepId(step) {
    const stepMap = {
      1: 'language',
      2: 'referral',
      3: 'welcome',
      4: 'categories',
      5: 'article_selection',
      6: 'quiz_question',
      7: 'quiz_result',
      8: 'article_reading',
      9: 'leaderboard',
    }
    return stepMap[step] || 'language'
  }

  // Normalize the data format
  const normalizedData = {
    currentStep: currentStep || step || 0,
    nextStep: isOldFormat ? step + 1 : nextStep || currentStep + 1,
    currentStepId: currentStepId || stepId || getStepId(step),
    nextStepId: nextStepId || getStepId(isOldFormat ? step + 1 : nextStep),
    data: {
      language: language || restData.language,
      categories: categories || restData.categories,
      quizResult: quizResult || restData.quizResult,
    },
  }

  return { normalizedData }
}

const executeOnboardingUpdate = async req => {
  const { normalizedData } = prepareOnboardingData(req.body)
  const userId = req.user._id

  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    const user = await User.findById(userId).session(session)
    if (!user) {
      await session.abortTransaction()
      session.endSession()
      return { status: 404, data: { message: 'User not found' } }
    }

    // Update user data
    user.onboardingStep = normalizedData.nextStep

    // Process data based on the current step
    switch (normalizedData.currentStepId) {
      case 'language':
        if (normalizedData.data.language) {
          user.userLanguage = normalizedData.data.language
        }
        break

      case 'referral':
        // Referral step, no data to save
        break

      case 'welcome':
        if (normalizedData.data.language) {
          user.userLanguage = normalizedData.data.language
        }
        break

      case 'categories':
        if (
          normalizedData.data.categories &&
          Array.isArray(normalizedData.data.categories)
        ) {
          user.preferredCategories = normalizedData.data.categories.map(
            category => ({
              category,
              weight: 1 / normalizedData.data.categories.length,
              isInferred: false,
            }),
          )
        }
        break

      case 'quiz_question':
        // Quiz question step, no data to save
        break

      case 'quiz_result':
        if (normalizedData.data.quizResult !== undefined) {
          user.initialQuizResult = normalizedData.data.quizResult
        }
        break

      case 'article_reading':
        // Article reading step, no data to save
        break

      case 'leaderboard':
        user.needsOnboarding = false
        break
    }

    await user.save({ session })
    await session.commitTransaction()
    session.endSession()

    return {
      status: 200,
      data: {
        message: 'Onboarding progress updated',
        currentStep: normalizedData.currentStep,
        nextStep: normalizedData.nextStep,
        currentStepId: normalizedData.currentStepId,
        nextStepId: normalizedData.nextStepId,
      },
    }
  } catch (error) {
    await session.abortTransaction()
    session.endSession()
    throw error // This will be caught by the retry mechanism
  }
}

// Create a retryable version of the function
const retryableOnboardingUpdate = makeRetryable(executeOnboardingUpdate, {
  operationName: 'UpdateOnboardingProgress',
  maxRetries: 5,
  initialDelay: 100,
  isRetryable: error => {
    // Add specific MongoDB transaction error handling
    if (error.codeName === 'WriteConflict') return true
    if (error.errorLabels?.includes('TransientTransactionError')) return true
    return defaultIsRetryableError(error)
  },
  onRetry: (error, attempt) => {
    console.warn(
      `Retrying transaction attempt ${attempt} due to write conflict`,
    )
  },
})

module.exports = {
  calculateTopPercent,
  calculateLabelsAndData,
  calculatePercentilesOfEachBar,
  getUserIQScoreHistory,
  currentTopPercentOfUser,
  getSolvedQuizzesCount,
  updateUserStats,
  calculateUserRank,
  dailyStreakCalculator,
  longestStreakCalculator,
  streakBrokenDaysCalculator,
  noLoginDaysSpentCalculator,
  currDayStreakCalulator,
  makeFirstLoginFalse,
  getTheRevivalEndDay,
  formatPreferredCategories,
  calculateLoginStreak,
  retryableOnboardingUpdate,
}
