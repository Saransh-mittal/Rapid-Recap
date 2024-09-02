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
        await sendNotification({
          userId: user._id,

          title: "Let's Get Back on Track! 🔄",
          body: `Hey ${
            user.name
          } 👋, your streak was broken, but you can still revive it! Your streak revival period has started — give 6 quizzes on any day during this period to activate and utilize QuinBoost and get your streak back on track. You have ${formatRemainingTime(
            remainingTimeBeforeRevival,
          )} left to revive your streak. Don’t miss out! 🚀📈`,
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
          image:
            'https://res.cloudinary.com/dxstsrnbs/image/upload/v1720262006/dailyStreakBroken-min_v1w1oo.png',
          title: 'Restart Your Rapid Recap Quiz Streak Today!',
          body: `Hey ${user.name}! You've missed your quiz streak for ${streakBrokenDays} days. Life gets busy, but we're here to help you get back on track. Tap to resume your learning journey with Rapid Recap! 🚀`,
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
          image:
            'https://res.cloudinary.com/dxstsrnbs/image/upload/v1720262006/dailyStreakBroken-min_v1w1oo.png',
          title: 'We Miss You! Resume Your Quiz Journey 🚀',
          body: `Hey ${user.name}, it's been 2 days since we saw you on Rapid Recap. Jump back in and restart your learning journey! 🌟📚 Tap to continue.`,
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
          image:
            'https://res.cloudinary.com/dxstsrnbs/image/upload/v1720262006/dailyStreakBroken-min_v1w1oo.png',
          title: "It's Been a While! Restart Your Learning Journey 🚀",
          body: `Hey ${user.name}, it's been ${noLoginDaysSpent} days since we saw you on Rapid Recap. Dive back in and explore our latest quizzes and content! 🌟📚 Tap to continue.`,
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

module.exports = {
  generateOtp,
  mailTransporter,
  mailForStreakBroken,
  mailForMaintainStreakReminder,
}
