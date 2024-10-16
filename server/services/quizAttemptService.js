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
  calculateScore,
  calculateQuizDifficulty,
  calculateApparentTimeTaken,
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
      match: { season: parseInt(configService.getCurrentSeason(), 10) },
    })
    .session(session)

  const article = await Article.findById(articleId).session(session)

  const existingAttempt = await QuizAttempt.findOne({
    user: userId,
    article: articleId,
    quiz: sessionId,
  }).session(session)

  if (existingAttempt) {
    throw new Error('User has already attempted the quiz for the article.')
  }

  const score = calculateScore(userResponses)
  const quizDifficulty = calculateQuizDifficulty(questions)
  const apparentTimeTaken = calculateApparentTimeTaken(timeTaken)
  let RQM_score = calculateRQMScore(score, quizDifficulty, apparentTimeTaken)

  let boosted = false
  let quinBoostUtilized = false

  if (
    user.quinBoosts.length > 0 &&
    user.quinBoosts[user.quinBoosts.length - 1]?.boosted
  ) {
    const quinBoost = user.quinBoosts[user.quinBoosts.length - 1]
    if (quinBoost.boosted) {
      RQM_score = Math.ceil(RQM_score * (user.todayBoost ? 1.75 : 1.5))
      quinBoost.boosted = false
      const qBoost = await QuinBoost.findById(quinBoost.quinBoost)
      qBoost.article = article._id
      await qBoost.save({ session })
      if (user.revivalPeriodEnd) {
        user.streak = user.streakBeforeBreak + 1
        user.streakBeforeBreak = 0
        user.revivalPeriodEnd = null
        await user.save({ session })
      }
      quinBoostUtilized = true
      user.eligibleForTournament = true
    }
  } else if (user.todayBoost) {
    RQM_score = Math.ceil(RQM_score * 1.5)
    boosted = true
  }

  emitProgress('calculateRQM', 100)
  emitProgress('saveAttempt', 50)
  const articleDifficulty = quizSession.overAllDifficulty[user.userLanguage]

  const newQuizAttempt = new QuizAttempt({
    user: userId,
    article: articleId,
    quiz: sessionId,
    responses: userResponses,
    RQM_score,
    articleDifficulty,
    timeTaken,
    boost:
      quinBoostUtilized && user.todayBoost
        ? 1.75
        : boosted || quinBoostUtilized
        ? 1.5
        : 1,
    isBoosted: boosted || quinBoostUtilized,
    season: parseInt(configService.getCurrentSeason(), 10),
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
    } = await calculateRealTimeIQ(userId, newUserScore, session)
    resultOfIQCalc = {
      newIQScore,
      prevIQScore,
      hasSocietyOrCircleChanged,
      changedSocietyOrCircle,
      isUpgrade,
      newSociety,
      newCircle,
      societyUpgradeMessage,
    }
  }

  emitProgress('updateStats', 100)
  emitProgress('checkTournament', 50)
  const { messageForTournamentEligibility, userEligibleForTournament } =
    await checkTournamentEligibility(user, RQM_score, session)

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
    quizDifficulty: articleDifficultyLevel,
    timeTaken,
    score: scoreString,
    pastRQMs,
    xpAwarded,
    quinBoostUtilized,
    messageForTournamentEligibility,
    userEligibleForTournament,
    ...resultOfIQCalc,
  }
}

module.exports = { saveQuizAttempt }
