const {
  userWeeklyReportInboxTemplate,
} = require('../data/inboxNotificationsTemplates.js')
const MailTemplates = require('../data/MailTemplates')
const ApplicationUpdates = require('../model/applicationUpdatesSchema.js')
const Article = require('../model/articleSchema')
const DailyIQ = require('../model/dailyIQSchema.js')
const QuizAttempt = require('../model/quizAttemptSchema.js')
const { Recommendation } = require('../model/recommendationSchema')
const {
  TournamentRegistration,
  QuizSession,
} = require('../model/tournamentRegistrationSchema.js')
const Tournament = require('../model/tournamentSchema.js')
const User = require('../model/userSchema')
const { sendDailyReport } = require('../utils/botTracker.js')
const {
  mailForStreakBroken,
  mailTransporter,
  getSociety,
  getCircle,
  calculateWeeklyIQChange,
  calculateWeeklyRQMChange,
  calculateWeeklyQuizCount,
  calculateWeeklyQuizDifficultyDistribution,
} = require('../utils/mail.utils')
const { analyzeMemoryCache } = require('../utils/memoryCacheMonitor.js')
const { progressBar } = require('../utils/progress.utils.js')
const asyncHandler = require('express-async-handler')

const streakBroken = async (req, res) => {
  try {
    await mailForStreakBroken()
    res.status(200).json({ message: 'Mails sent successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
    console.error(error)
  }
}

// @desc Send mails to all users
// @route GET /api/mail/sendMailsToUsers
// @access Public
const sendMailsToUsers = async (req, res) => {
  try {
    // const users = await User.find({
    //   email: { $not: /^dummy\d+@mail\.com$/ },
    //   inGameName: { $exists: true },
    // })
    // get two users for testing saransh_1234 and mmadhavpareek
    const users = await User.find({
      inGameName: {
        $in: ['smash_deV'],
      },
    })

    const latestTournament = await Tournament.findOne({
      status: 'completed',
      isActive: false,
    }).sort({ startDate: -1 })

    let topPlayers = []
    let leaderboardData = []
    if (latestTournament) {
      // Fetch top 5 players for the tournament
      leaderboardData = await TournamentRegistration.aggregate([
        { $match: { tournament: latestTournament._id } },
        {
          $lookup: {
            from: 'Users',
            localField: 'user',
            foreignField: '_id',
            as: 'userDetails',
          },
        },
        { $unwind: '$userDetails' },
        {
          $project: {
            _id: '$userDetails._id',
            inGameName: '$userDetails.inGameName',
            name: '$userDetails.name',
            totalScore: 1,
          },
        },
        { $sort: { totalScore: -1 } },
      ])

      topPlayers = leaderboardData.filter((player, index) => index < 5)
      topPlayers = topPlayers.map((player, index) => {
        return {
          inGameName: player.inGameName,
          name: player.name,
          score: player.totalScore,
          rank: index + 1,
        }
      })
    }

    const updateProgress = progressBar(users.length)
    for (const user of users) {
      const society = getSociety(user.IQ_score)
      const circle = getCircle(user.IQ_score)
      const iqChangeNum = await calculateWeeklyIQChange(user._id)
      const rqmChangeNum = await calculateWeeklyRQMChange(user._id, user.avgRQM)
      const weeklyQuizCount = await calculateWeeklyQuizCount(user._id)
      const quizDistribution = await calculateWeeklyQuizDifficultyDistribution(
        user._id,
      )

      let tournamentScore = null
      let categoryPerformance = []
      let participatedInTournament = false
      let userRank = 0
      const findIndex = leaderboardData.findIndex(
        player => player._id.toString() === user._id.toString(),
      )
      userRank = findIndex + 1
      if (latestTournament) {
        const userTournamentRegistration = await TournamentRegistration.findOne(
          {
            user: user._id,
            tournament: latestTournament._id,
          },
        )

        if (userTournamentRegistration) {
          participatedInTournament = true
          tournamentScore = userTournamentRegistration.totalScore

          // Fetch quiz sessions for this user in the current tournament
          const quizSessions = await QuizSession.find({
            user: user._id,
            tournament: latestTournament._id,
            completed: true,
          })

          // Calculate category performance
          const categoryScores = {}
          quizSessions.forEach(session => {
            if (!categoryScores[session.category]) {
              categoryScores[session.category] = {
                totalScore: 0,
                count: 0,
              }
            }
            categoryScores[session.category].totalScore += session.RQM_score
            categoryScores[session.category].count++
          })

          // Calculate average scores and prepare categoryPerformance array
          const maxScore = Math.max(
            ...Object.values(categoryScores).map(c => c.totalScore / c.count),
          )
          categoryPerformance = Object.entries(categoryScores).map(
            ([name, data]) => {
              const value =
                Math.round((data.totalScore / data.count) * 100) / 100 // Round to 2 decimal places
              const height = Math.round((value / maxScore) * 200) // Scale height to max 200
              return { name, value, height }
            },
          )
        }
      }
      // Create a new update object for the user
      // const { title, mainText, img } = {
      //   title: 'Happy Independence Day! 🇮🇳',
      //   mainText: `As we come together to celebrate the spirit of freedom, let’s take a moment to honor the courage and sacrifice of those who fought for our nation's independence. Wishing you all a very Happy Independence Day! 🇮🇳

      //     This day reminds us of our rich heritage and the unity that binds us as a nation. As proud Indians, it is our collective responsibility to cherish this unity and work towards a brighter, prosperous future for our beloved country. Jai Hind! 🙌

      //     To make this day even more special, we invite you to explore our latest content on Rapid Recap. Stay informed with the latest news, engage in quizzes, and test your knowledge about India's incredible journey to freedom. Let’s celebrate our history and achievements together!

      //     Add to home screen our app from your browser now and dive into the spirit of Independence Day with us. 📲✨

      //     Thank you for being a part of the Rapid Recap family. Together, let’s keep the flame of freedom burning bright. 🇮🇳🔥`,
      //   img: 'https://res.cloudinary.com/dwxls4xsq/image/upload/v1723702093/HappyIndependenceDay_u1gpmr.png',
      // }
      // const userRecommendedArticles = await Recommendation.findOne({
      //   user_id: user._id,
      // }).select('recommendations')

      // let cnt = 4
      // const articlesForMail = []
      // for (const article of userRecommendedArticles.recommendations) {
      //   if (cnt === 0) break
      //   const articleData = await Article.findById(article._id).select(
      //     'title imgURL',
      //   )
      //   if (
      //     !articleData ||
      //     !articleData.imgURL ||
      //     articleData.imgURL[0] === '' ||
      //     articleData.title.length > 100
      //   )
      //     continue
      //   articlesForMail.push({
      //     articleData,
      //     link: `https://www.rapidrecap.co.in/article/${articleData._id.toString()}`,
      //   })
      //   cnt--
      // }
      const userData = {
        name: user.name,
        inGameName: user.inGameName,
        society,
        circle,
        iqScore: user.IQ_score,
        rank: user.rank,
        iqChange:
          iqChangeNum > 0
            ? `+${iqChangeNum} this week`
            : `${iqChangeNum} this week`,
        averageRQM: user.avgRQM.toFixed(1),
        rqmChange:
          rqmChangeNum > 0
            ? `+${rqmChangeNum} this week`
            : `${rqmChangeNum} this week`,
        experienceLevel: user.level,
        ongoingSeason: user.currentSeason,
        totalQuizzesThisWeek: weeklyQuizCount,
        quizDistribution,
        tournamentRank: userRank,
        tournamentScore,
        topPlayers,
        categoryPerformance,
        participatedInTournament,
      }
      // const transporter = await mailTransporter()
      // await transporter.sendMail({
      //   from: MailTemplates.userWeeklyReportTemplate.from,
      //   to: user.email,
      //   subject: MailTemplates.userWeeklyReportTemplate.subject,
      //   html: MailTemplates.userWeeklyReportTemplate.html({
      //     ...userData,
      //   }),
      // })

      const notificationTitle = 'Weekly Report'
      const notificationText = userWeeklyReportInboxTemplate.html({
        ...userData,
      })

      const newNotification = new ApplicationUpdates({
        userId: user._id,
        title: notificationTitle,
        mainText: notificationText, // HTML template for the notification
        img: '', // Optional image if needed
        read: false,
        type: 'weeklyReport',
      })

      await newNotification.save()
      updateProgress()
    }
    res.status(200).json({ message: 'Mails sent successfully' })
    console.log('All Updates saved successfully!')
  } catch (error) {
    res.status(500).json({ message: error.message })
    console.error(error)
  }
}

/**
 * @desc    Get current bot analytics report and send via email
 * @route   GET /api/admin/bot-analytics/report
 * @access  Admin
 */
const sendCurrentBotReport = asyncHandler(async (req, res) => {
  const { email } = await User.findById(req.user._id)
  const reportAvailable = await sendDailyReport(email)

  res.status(200).json({
    success: true,
    message: 'Bot analytics report sent successfully',
    reportAvailable,
  })
})

// @desc   Send cache analysis report via email
// @route  POST /api/admin/cache-analysis/report
// @access Admin
const sendCacheAnalysisReport = asyncHandler(async (req, res) => {
  const { email } = await User.findById(req.user._id)
  const cacheAnalysis = analyzeMemoryCache()

  const transporter = await mailTransporter()

  const emailContent = `
    <h2>Memory Cache Analysis Report</h2>
    <p>Total Keys: ${cacheAnalysis.totalKeys}</p>
    <p>Total Size: ${cacheAnalysis.totalSize}</p>

    <h3>Cache Usage By Key Type:</h3>
    <table border="1">
      <tr>
        <th>Key</th>
        <th>Size</th>
        <th>Type</th>
        <th>Expiry</th>
      </tr>
      ${cacheAnalysis.keysBySize
        .map(
          item => `
        <tr>
          <td>${item.key}</td>
          <td>${item.size}</td>
          <td>${item.type}</td>
          <td>${item.expiryTime || 'No expiry'}</td>
        </tr>
      `,
        )
        .join('')}
    </table>
  `

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: `Memory Cache Analysis Report - ${new Date().toLocaleDateString()}`,
    html: emailContent,
  })

  res.status(200).json({
    success: true,
    message: 'Memory cache analysis report sent successfully',
    data: cacheAnalysis,
  })
})

module.exports = {
  streakBroken,
  sendMailsToUsers,
  sendCurrentBotReport,
  sendCacheAnalysisReport,
}
