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
const Quiz = require('../model/quizSchema')
const QuinBoost = require('../model/quinBoostSchema')
const { calculateRealTimeIQ } = require('./iqCalculationService')

const saveQuizAttempt = async (
  userId,
  articleId,
  userResponses,
  quizData,
  timeTaken,
  quizId,
  session,
) => {
  if (!userId || !articleId || !userResponses || !quizData) {
    throw new Error('Please provide all the details')
  }

  const user = await User.findById(userId)
    .populate({
      path: 'quizAttempts',
      select: '_id createdAt',
      match: { season: parseInt(configService.getCurrentSeason(), 10) },
    })
    .session(session)

  const article = await Article.findById(articleId).session(session)
  if (!article) {
    throw new Error('Article not found')
  }

  if (!article.userQuizStatus) {
    throw new Error('No quiz status found for this article')
  }

  const foundStatus = article.userQuizStatus.find(
    status => status.userId.toString() === userId,
  )
  if (foundStatus) {
    foundStatus.status = false
  } else {
    throw new Error('User never started the quiz')
  }
  await article.save({ session })

  const quiz = await Quiz.findById(quizId)
  const existingAttempt = await QuizAttempt.findOne({
    user: userId,
    article: articleId,
    quiz: quizId,
  }).session(session)

  if (existingAttempt) {
    throw new Error('User has already attempted the quiz for the article.')
  }

  const questions = quizData.questions
  const correctAnswers = questions.map(question => question.answer)
  const score = calculateScore(userResponses, correctAnswers)
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

  const articleDifficulty = quiz.overAllDifficulty

  const newQuizAttempt = new QuizAttempt({
    user: userId,
    article: articleId,
    quiz: quizId,
    responses: userResponses.map((userAnswer, index) => ({
      questionId: questions[index]._id,
      userAnswer,
      isCorrect: userAnswer === correctAnswers[index],
    })),
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

  article.quizAttemptCnt++
  await article.save({ session })

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

  const scoreString = `${score * quizData.questions.length}/${
    quizData.questions.length
  }`

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
