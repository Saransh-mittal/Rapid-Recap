const { scheduleQuizEmails } = require('./emailService')
const { logActivity } = require('../utils/activity.utils')
const { activityTypes } = require('../data/activityTypes')
const {
  currDayStreakCalulator,
  updateUserStats,
} = require('../utils/user.utils')
const {
  fetchTodaysPastRQMs,
  sendMailsForQuizRemainingToReviveStreak,
  calculateRQMScore,
  calcUserPercentile,
} = require('../utils/quiz.utils')
const configService = require('../configService')
const { checkTournamentEligibility } = require('../utils/tournament.utils')
const User = require('../model/userSchema')
const Article = require('../model/articleSchema')
const QuizAttempt = require('../model/quizAttemptSchema')
const QuinBoost = require('../model/quinBoostSchema')
const { calculateRealTimeIQ } = require('./iqCalculationService')
const { streakSurgeTemplate } = require('../data/inboxNotificationsTemplates')
const i18n = require('i18next')
const ApplicationUpdates = require('../model/applicationUpdatesSchema')
const moment = require('moment-timezone')
const {
  createQuinBoostAbility,
  calculateTotalEffect,
  createQuizBoostAbility,
} = require('./abilityService')
const Inventory = require('../model/inventorySchema')
const { calculateTotalMultiplier } = require('../utils/inventory.utils')
const {
  createCategoryBoost,
  isCategoryBoost,
  getCategoryFromBoost,
  createCategoryRadar,
} = require('./abilityServices/tournamentAbilityService')

const handleQuinBoostEarned = async ({ user, session }) => {
  try {
    // Calculate expiry date (5 days from now)
    const expiryDate = new Date()
    expiryDate.setDate(expiryDate.getDate() + 5)

    // Create new QuinBoost ability
    await createQuinBoostAbility({ expiryDate, userId: user._id, session })

    // Create notification about earning QuinBoost
    const notification = new ApplicationUpdates({
      userId: user._id,
      title: 'QuinBoost Available!',
      mainText: `You've earned a QuinBoost! Use it from your inventory to get a 1.5x RQM score boost on your next quiz.`,
      type: 'applicationUpdate',
    })
    await notification.save({ session })

    return true
  } catch (error) {
    console.error('Error handling QuinBoost earned:', error)
    return false
  }
}

const hasStreakSurgeNotificationToday = async user => {
  return user.todaysQuizCnt > 0
}

const saveQuizAttempt = async (
  userId,
  articleId,
  userResponses,
  questions,
  timeTaken,
  sessionId,
  quizSession,
  session,
  emitProgress,
) => {
  if (!userId || !articleId || !userResponses || !questions) {
    throw new Error('Please provide all the details')
  }

  emitProgress('calculateRQM', 50)
  const user = await User.findById(userId)
    .populate({
      path: 'quizAttempts',
      select: '_id createdAt',
      match: {
        $and: [
          { season: parseInt(configService.getCurrentSeason(), 10) },
          { month: new Date().getMonth() + 1 }, // JavaScript months are 0-based, so add 1
          { year: new Date().getFullYear() },
        ],
      },
    })
    .session(session)

  if (
    (!user.quizAttempts || user.quizAttempts.length === 0) &&
    user.referredBy
  ) {
    const referrer = await User.findById(user.referredBy).session(session)

    // Find the referral and update its status
    const referralIndex = referrer.referrals.findIndex(
      referral => referral.user.toString() === user._id.toString(),
    )

    if (referralIndex !== -1) {
      referrer.referrals[referralIndex].status = 'complete'
      await referrer.save({ session })

      const referralCount = referrer.referralCount

      if (referralCount === 1)
        await createQuizBoostAbility({
          userId: referrer._id,
          session,
          quantity: 3,
          multiplier: 1.5,
        })
      else if (referralCount === 3) {
        await createCategoryBoost({
          userId: referrer._id,
          category: 'category',
          multiplier: 1.5,
          duration: 3 * 24 * 60, // 3 days
          expiresAt: moment().add(1, 'month').toDate(),
          isClaimed: false,
          isActive: false,
          description: `Increases RQM score by 1.5x for your chozen category as you referred 3 friends`,
          isBadgePowerUp: false,
          session,
        })
      } else if (referralCount === 5) {
        await createCategoryBoost({
          userId: referrer._id,
          category: 'category',
          multiplier: 1.5,
          duration: 5 * 24 * 60, // 3 days
          expiresAt: moment().add(1, 'month').toDate(),
          isClaimed: false,
          isActive: false,
          description: `Increases RQM score by 1.5x for your chozen category as you referred 5 friends`,
          isBadgePowerUp: false,
          session,
        })
        await createCategoryRadar({
          userId: referrer._id,
          category: 'category',
          duration: 5 * 24 * 60, // 3 days
          expiresAt: moment().add(1, 'month').toDate(),
          isClaimed: false,
          isActive: false,
          description: `You can view difficulty of each articles for your chozen category as you referred 5 friends`,
          isBadgePowerUp: false,
          session,
        })
      }
    }
  }

  const article = await Article.findById(articleId)
    .select('_id category quizAttemptCnt')
    .session(session)

  const localizedI18n = i18n.cloneInstance({ initImmediate: false })

  // Switch to user's language
  await localizedI18n.changeLanguage(
    user?.userLanguage ? user.userLanguage : 'en',
  )

  const existingAttempt = await QuizAttempt.findOne({
    user: userId,
    article: articleId,
    quiz: sessionId,
  }).session(session)

  if (existingAttempt) {
    throw new Error('User has already attempted the quiz for the article.')
  }

  let { baseRQM_score, RQM_score, score, expectedTime, performanceBonus } =
    calculateRQMScore(userResponses, questions, timeTaken)

  let quinBoostUtilized = false
  const nonBoostedRQM = RQM_score

  // Check active ability boosts
  const inventory = await Inventory.findOne({ user: userId })
    .populate('abilities.abilityId')
    .session(session)

  let totalBoostMultiplier = 1
  if (inventory) {
    const activeQuinBoost = inventory.abilities.find(
      ability =>
        ability.isActive &&
        ability.abilityId?.name === 'QuinBoost' &&
        ability.expiresAt > new Date(),
    )
    const activeStreakSurge = inventory.abilities.find(
      ability =>
        ability.isActive &&
        ability.abilityId?.name === 'StreakSurge' &&
        ability.expiresAt > new Date(),
    )
    const activeQuizBoost = inventory.abilities.find(
      ability =>
        ability.isActive &&
        ability.abilityId?.name === 'QuizBoost' &&
        (ability.expiresAt > new Date() || ability.expiresAt === null),
    )
    const activeAbilities = inventory.abilities
      .filter(ability => {
        // Basic active ability checks
        const isActive =
          ability.isActive &&
          ability.abilityId?.type === 'BOOST' &&
          (ability.expiresAt > new Date() || ability.expiresAt === null)

        if (!isActive) return false

        // Handle category boosts
        if (isCategoryBoost(ability.abilityId.name)) {
          const boostCategory = getCategoryFromBoost(ability.abilityId.name)
          return boostCategory.toLowerCase() === article.category.toLowerCase()
        }

        // Include all other types of boosts
        return true
      })
      .map(ability => ({
        id: ability.abilityId._id,
        name: ability.abilityId.name,
        type: ability.abilityId.type,
        multiplier: ability.abilityId.multiplier,
        duration: ability.abilityId.duration,
        expiresAt: ability.expiresAt,
        acquiredAt: ability.acquiredAt,
      }))
    const effects = calculateTotalEffect(activeAbilities, 'BOOST')
    totalBoostMultiplier = effects?.multiplier

    RQM_score = Math.ceil(RQM_score * totalBoostMultiplier)
    if (activeQuinBoost) {
      activeQuinBoost.isActive = false
      activeQuinBoost.isUsed = true
      await inventory.save({ session })
      quinBoostUtilized = true
      user.eligibleForTournament = true
    }
    if (activeStreakSurge) {
      // Check if notification has already been sent today
      const hasNotification = await hasStreakSurgeNotificationToday(user)

      if (!hasNotification) {
        const notificationTitle = localizedI18n.t('Streak Surge day!')
        const notificationMainText = streakSurgeTemplate(user.streak)

        const newNotification = new ApplicationUpdates({
          title: notificationTitle,
          mainText: notificationMainText,
          userId: userId,
          type: 'applicationUpdate',
        })
        await newNotification.save()
      }
    }
    if (activeQuizBoost) {
      if (activeQuizBoost.quantity <= 1) {
        activeQuizBoost.isActive = false
        activeQuizBoost.isUsed = true
        activeQuizBoost.quantity -= 1
      } else {
        activeQuizBoost.quantity -= 1
      }
      await inventory.save({ session })
    }
  }

  emitProgress('calculateRQM', 100)
  emitProgress('saveAttempt', 50)
  const articleDifficulty = quizSession.overAllDifficulty[user.userLanguage]
  const boost = totalBoostMultiplier
  const isBoosted = totalBoostMultiplier > 1

  // Create and save the quiz attempt
  const newQuizAttempt = new QuizAttempt({
    user: userId,
    article: articleId,
    quiz: sessionId,
    responses: userResponses,
    RQM_score,
    articleDifficulty,
    timeTaken,
    expectedTime,
    boost,
    isBoosted,
    season: parseInt(configService.getCurrentSeason(), 10),
    month: moment().month() + 1,
    year: moment().year(),
  })
  await newQuizAttempt.save({ session })
  quizSession.RQM_score = {
    [user.userLanguage]: RQM_score,
  }
  quizSession.timeTaken = {
    [user.userLanguage]: timeTaken,
  }
  await quizSession.save({ session })
  article.quizAttemptCnt++
  await article.save({ session })

  emitProgress('saveAttempt', 100)
  emitProgress('updateStats', 25)
  const currentDate = new Date()
  currentDate.setUTCHours(0, 0, 0, 0)
  const todayAttemptsCount = await QuizAttempt.countDocuments({
    user: userId,
    createdAt: { $gte: currentDate },
  }).session(session)
  if (todayAttemptsCount % 5 === 0 && todayAttemptsCount > 0)
    await handleQuinBoostEarned({ user, session })
  const lastQuizAttempt = user.quizAttempts[user.quizAttempts.length - 1]
  await updateUserStats({
    user,
    RQM_score,
    articleDifficulty,
    todayAttemptsCount,
    session,
    newQuizAttempt,
  })

  emitProgress('updateStats', 50)
  let resultOfIQCalc = {}
  if (!user.pauseRealTimeIQ) {
    const userPercentile = await calcUserPercentile({
      userId,
      articleId,
      session,
    })
    const prevUserScore = user.userScore
    const newUserScore = user.userScore + articleDifficulty * userPercentile

    user.userScore = newUserScore
    await user.save({ session })
    const {
      newIQScore,
      prevIQScore,
      hasSocietyOrCircleChanged,
      changedSocietyOrCircle,
      isUpgrade,
      newSociety,
      newCircle,
      societyUpgradeMessage,
      globalMeanUserScore,
      globalStandardDeviation,
      finalUserScore,
      boostMultiplier,
      originalIncrement,
      boostedIncrement,
      additionalScore,
    } = await calculateRealTimeIQ(userId, newUserScore, RQM_score, session)
    newQuizAttempt.globalMeanUserScore = globalMeanUserScore
    newQuizAttempt.globalStandardDeviation = globalStandardDeviation
    newQuizAttempt.prevIQScore = prevIQScore
    newQuizAttempt.newIQScore = newIQScore
    newQuizAttempt.prevUserScore = prevUserScore
    newQuizAttempt.newUserScore = finalUserScore
    await newQuizAttempt.save({ session })

    resultOfIQCalc = {
      newIQScore,
      prevIQScore,
      hasSocietyOrCircleChanged,
      changedSocietyOrCircle,
      isUpgrade,
      newSociety,
      newCircle,
      societyUpgradeMessage,
      boostMultiplier,
      originalIncrement,
      boostedIncrement,
      additionalScore,
    }
  }

  emitProgress('updateStats', 100)
  emitProgress('checkTournament', 50)
  const { messageForTournamentEligibility, userEligibleForTournament } =
    await checkTournamentEligibility(user, RQM_score, lastQuizAttempt, session)

  const xpAwarded = await logActivity({
    userInGameName: user.inGameName,
    type: activityTypes.RANDOM_QUIZ.type,
    consecutiveQuizCount: todayAttemptsCount,
    session,
  })

  if (quinBoostUtilized) {
    await logActivity({
      userInGameName: user.inGameName,
      type: activityTypes.QUINBOOST_UTILIZED.type,
      session,
    })
  }

  emitProgress('checkTournament', 100)
  emitProgress('finalizeAttempt', 50)
  const quizzesToday = await currDayStreakCalulator(user._id)

  if (quizzesToday < 6) {
    sendMailsForQuizRemainingToReviveStreak(
      user._id.toString(),
      6 - quizzesToday,
    )
  }

  await scheduleQuizEmails(user, quizzesToday)

  const pastRQMs = await fetchTodaysPastRQMs({ userId, session })

  const articleDifficultyLevel =
    articleDifficulty < 0.5
      ? 'easy'
      : articleDifficulty >= 0.5 && articleDifficulty < 0.7
      ? 'medium'
      : 'hard'

  const scoreString = `${score * questions.length}/${questions.length}`

  emitProgress('finalizeAttempt', 90)
  return {
    message: 'Attempt saved successfully',
    RQM_score,
    nonBoostedRQM,
    baseRQM_score,
    boost,
    isBoosted,
    quizDifficulty: articleDifficultyLevel,
    timeTaken,
    score: scoreString,
    pastRQMs,
    xpAwarded,
    quinBoostUtilized,
    messageForTournamentEligibility,
    userEligibleForTournament,
    performanceBonus,
    pauseRealTimeIQ: user.pauseRealTimeIQ,
    ...resultOfIQCalc,
  }
}

module.exports = { saveQuizAttempt }
