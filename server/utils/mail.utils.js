const nodemailer = require('nodemailer')
// const { google } = require("googleapis");
const { OAuth2Client } = require('google-auth-library')
const User = require('../model/userSchema')
//const { progressBar } = require("./progress.utils");
const {
  streakBrokenDaysCalculator,
  noLoginDaysSpentCalculator,
  getTheRevivalEndDay,
} = require('./user.utils')
const MailTemplates = require('../data/MailTemplates')
const { getTopThreeRecommendedArticles } = require('./article.utils')
const { sendNotification } = require('../services/notificationService')
const { formatRemainingTime } = require('./miscellaneous.utils')
const i18n = require('i18next')
const QuizAttempt = require('../model/quizAttemptSchema')
const DailyIQ = require('../model/dailyIQSchema')

//These id's and secrets should come from .env file.

const generateOtp = () => {
  let otp = ''
  for (let i = 0; i <= 5; i++) {
    otp += Math.round(Math.random() * 9)
  }
  return otp
}

const mailTransporter = async () => {
  try {
    const CLIENT_ID = process.env.CLIENT_ID
    const CLEINT_SECRET = process.env.CLIENT_SECRET
    const REDIRECT_URI = 'https://developers.google.com/oauthplayground'
    const REFRESH_TOKEN = process.env.REFRESH_TOKEN

    // const oAuth2Client = new google.auth.OAuth2(
    //   CLIENT_ID,
    //   CLEINT_SECRET,
    //   REDIRECT_URI
    // );
    // oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
    // const accessToken = await oAuth2Client.getAccessToken();
    const oAuth2Client = new OAuth2Client(
      CLIENT_ID,
      CLEINT_SECRET,
      REDIRECT_URI,
    )
    oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN })
    const accessToken = await oAuth2Client.getAccessToken()
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: 'rapidrecap2k23@gmail.com',
        clientId: CLIENT_ID,
        clientSecret: CLEINT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken,
      },
    })
  } catch (error) {
    console.log(error)
  }
}

const mailForStreakBroken = async () => {
  try {
    const users = await User.find({
      email: { $not: /^dummy\d+@mail\.com$/ },
      name: { $not: /^undefined\sundefined$/ },
    })
    const transporter = await mailTransporter()
    // Translation function for specific namespace
    const t = (key, options) =>
      localizedI18n.t(key, { ns: 'mail.utils', ...options })
    //const updateProgress = progressBar(users.length);
    for (let user of users) {
      const streakBrokenDays = await streakBrokenDaysCalculator(user._id)
      const noLoginDaysSpent = await noLoginDaysSpentCalculator(user._id)
      const articlesForMail = await getTopThreeRecommendedArticles(
        user._id.toString(),
      )
      if (streakBrokenDays === 2) {
        let remainingTimeBeforeRevival = null
        if (user.streak >= 5) {
          user.streakBeforeBreak = user.streak
          streakBeforeBreak = user.streak
          user.revivalPeriodEnd = getTheRevivalEndDay(
            user.streak,
            user.streakExpiry,
          )
          remainingTimeBeforeRevival =
            user.revivalPeriodEnd.getTime() - today.getTime()

          if (remainingTimeBeforeRevival < 0) {
            user.revivalPeriodEnd = null
            user.streakBeforeBreak = 0
          }
          await user.save()
        }
        const localizedI18n = i18n.cloneInstance()

        // Switch to user's language
        await localizedI18n.changeLanguage(user.userLanguage)

        await sendNotification({
          userId: user._id,
          url: '/home/all',
          title: t('streak_broken_notification_title'),
          body: t('streak_broken_notification_body', {
            name: user.name.split(' ')[0],
            remainingTime: formatRemainingTime(remainingTimeBeforeRevival),
          }),
          image:
            'https://res.cloudinary.com/dxstsrnbs/image/upload/v1720262006/dailyStreakBroken-min_v1w1oo.png',
        })
        await transporter.sendMail({
          from: MailTemplates.StreakJustBroken.from,
          to: user.email,
          subject: MailTemplates.StreakJustBroken.subject,
          html: MailTemplates.StreakJustBroken.html({
            name: user.name.split(' ')[0],
            articlesForMail,
            remainingTimeBeforeRevival,
          }),
        })
      } else if (streakBrokenDays % 7 === 0 && streakBrokenDays > 2) {
        await sendNotification({
          userId: user._id,
          url: '/home/all',
          image:
            'https://res.cloudinary.com/dxstsrnbs/image/upload/v1720262006/dailyStreakBroken-min_v1w1oo.png',
          title: t('streak_seven_periodic_notification_title'),
          body: t('streak_seven_periodic_notification_body', {
            name: user.name.split(' ')[0],
            streak_days: streakBrokenDays,
          }),
        })
        await transporter.sendMail({
          from: MailTemplates.StreakSevenPeriodic.from,
          to: user.email,
          subject: MailTemplates.StreakSevenPeriodic.subject,
          html: MailTemplates.StreakSevenPeriodic.html({
            name: user.name.split(' ')[0],
            streak_days: streakBrokenDays,
            articlesForMail,
          }),
        })
      }

      if (noLoginDaysSpent === 2) {
        await sendNotification({
          userId: user._id,
          url: '/home/all',
          image:
            'https://res.cloudinary.com/dxstsrnbs/image/upload/v1720262006/dailyStreakBroken-min_v1w1oo.png',
          title: t('no_login_two_days_notification_title'),
          body: t('no_login_two_days_notification_body', {
            name: user.name.split(' ')[0],
          }),
        })
        await transporter.sendMail({
          from: MailTemplates.noLoginFor2Days.from,
          to: user.email,
          subject: MailTemplates.noLoginFor2Days.subject,
          html: MailTemplates.noLoginFor2Days.html({
            name: user.name.split(' ')[0],
            articlesForMail,
          }),
        })
      } else if (noLoginDaysSpent % 7 === 0 && noLoginDaysSpent > 2) {
        await sendNotification({
          userId: user._id,
          url: '/home/all',
          image:
            'https://res.cloudinary.com/dxstsrnbs/image/upload/v1720262006/dailyStreakBroken-min_v1w1oo.png',
          title: t('no_login_seven_days_notification_title'),
          body: t('no_login_seven_days_notification_body', {
            name: user.name.split(' ')[0],
            inactive_days: noLoginDaysSpent,
          }),
        })
        await transporter.sendMail({
          from: MailTemplates.noLoginForSevenPeriodic.from,
          to: user.email,
          subject: MailTemplates.noLoginForSevenPeriodic.subject,
          html: MailTemplates.noLoginForSevenPeriodic.html({
            name: user.name.split(' ')[0],
            inactive_days: noLoginDaysSpent,
            articlesForMail,
          }),
        })
      }
      //updateProgress();
    }
    console.log('\nMails sent successfully\n')
  } catch (error) {
    console.error(error)
  }
}

const mailForMaintainStreakReminder = async ({ template }) => {
  try {
    const users = await User.find({
      email: { $not: /^dummy\d+@mail\.com$/ },
      name: { $not: /^undefined\sundefined$/ },
    })
    const transporter = await mailTransporter()
    //const updateProgress = progressBar(users.length);
    for (let user of users) {
      const streakBrokenDays = await streakBrokenDaysCalculator(user._id)
      const articlesForMail = await getTopThreeRecommendedArticles(
        user._id.toString(),
      )
      if (streakBrokenDays === 1) {
        await sendNotification({
          userId: user._id,
          url: '/home/all',
          ...template.notif({ name: user.name.split(' ')[0] }),
        })
        await transporter.sendMail({
          from: template.from,
          to: user.email,
          subject: template.subject,
          html: template.html({
            name: user.name.split(' ')[0],
            articlesForMail,
          }),
        })
      }
      //updateProgress();
    }
    console.log('\nMails sent successfully\n')
  } catch (error) {
    console.error(error)
  }
}

const getSociety = iqScore => {
  if (iqScore < 90) return 'Explorers'
  if (iqScore < 110) return 'Strivers'
  if (iqScore < 130) return 'Elites'
  if (iqScore < 150) return 'Mavericks'
  return 'Titans'
}

const getCircle = iqScore => {
  if (iqScore >= 90 && iqScore < 97) return 'Progressors'
  if (iqScore >= 97 && iqScore < 104) return 'Achievers'
  if (iqScore >= 104 && iqScore < 110) return 'Enthusiasts'
  if (iqScore >= 110 && iqScore < 120) return 'Masters'
  if (iqScore >= 120 && iqScore < 130) return 'Scholars'
  if (iqScore >= 130 && iqScore < 140) return 'Pioneers'
  if (iqScore >= 140 && iqScore < 150) return 'Visionaries'
  return 'None' // If iqScore is outside these ranges
}

const calculateWeeklyIQChange = async userId => {
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

  const dailyIQScores = await DailyIQ.find({
    user: userId,
    date: { $gte: oneWeekAgo },
  }).sort({ date: 1 })

  if (dailyIQScores.length < 2) {
    return 0 // Not enough data to calculate change
  }

  const oldestScore = dailyIQScores[0].IQ_score
  const newestScore = dailyIQScores[dailyIQScores.length - 1].IQ_score

  return (newestScore - oldestScore).toFixed(1)
}

const calculateWeeklyRQMChange = async (userId, currAvgRQM) => {
  if (!currAvgRQM) {
    return 0
  }
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
  const quizAttemptsBeforeOneWeek = await QuizAttempt.find({
    user: userId,
    createdAt: { $lt: oneWeekAgo },
  }).select('RQM_score')
  const avgRQMBeforeOneWeek =
    quizAttemptsBeforeOneWeek.reduce((acc, curr) => acc + curr.RQM_score, 0) /
    quizAttemptsBeforeOneWeek.length
  if (avgRQMBeforeOneWeek === 0) {
    return 0
  }
  return (currAvgRQM - avgRQMBeforeOneWeek).toFixed(1)
}

const calculateWeeklyQuizCount = async userId => {
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

  const quizCount = await QuizAttempt.countDocuments({
    user: userId,
    createdAt: { $gte: oneWeekAgo },
  })

  return quizCount
}

const calculateWeeklyQuizDifficultyDistribution = async userId => {
  try {
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    const quizAttempts = await QuizAttempt.find({
      user: userId,
      createdAt: { $gte: oneWeekAgo },
    }).select('articleDifficulty')

    const quizDistribution = [
      { label: 'Easy', value: 0, height: 0 },
      { label: 'Medium', value: 0, height: 0 },
      { label: 'Hard', value: 0, height: 0 },
    ]
    quizAttempts.forEach(quizAttempt => {
      const articleDifficulty = parseFloat(quizAttempt.articleDifficulty)

      if (articleDifficulty < 0.5) quizDistribution[0].value++
      else if (articleDifficulty < 0.7) quizDistribution[1].value++
      else quizDistribution[2].value++
    })
    quizDistribution[0].height =
      (quizDistribution[0].value / quizAttempts.length) * 100
    quizDistribution[1].height =
      (quizDistribution[1].value / quizAttempts.length) * 100
    quizDistribution[2].height =
      (quizDistribution[2].value / quizAttempts.length) * 100

    return quizDistribution
  } catch (error) {
    console.log(error)
  }
}

module.exports = {
  generateOtp,
  mailTransporter,
  mailForStreakBroken,
  mailForMaintainStreakReminder,
  getSociety,
  getCircle,
  calculateWeeklyIQChange,
  calculateWeeklyRQMChange,
  calculateWeeklyQuizCount,
  calculateWeeklyQuizDifficultyDistribution,
}
