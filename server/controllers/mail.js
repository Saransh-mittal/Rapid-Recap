const MailTemplates = require('../data/MailTemplates')
const Article = require('../model/articleSchema')
const DailyIQ = require('../model/dailyIQSchema.js')
const QuizAttempt = require('../model/quizAttemptSchema.js')
const { Recommendation } = require('../model/recommendationSchema')
const User = require('../model/userSchema')
const { mailForStreakBroken, mailTransporter } = require('../utils/mail.utils')
const { progressBar } = require('../utils/progress.utils.js')

const streakBroken = async (req, res) => {
  try {
    await mailForStreakBroken()
    res.status(200).json({ message: 'Mails sent successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
    console.error(error)
  }
}

const getSociety = iqScore => {
  if (iqScore < 90) return 'Explorers Society'
  if (iqScore < 110) return 'Strivers Society'
  if (iqScore < 130) return 'Elites Society'
  if (iqScore < 150) return 'Mavericks Society'
  return 'Titans Society'
}
const getCircle = iqScore => {
  if (iqScore >= 90 && iqScore < 97) return 'Progressors Circle'
  if (iqScore >= 97 && iqScore < 104) return 'Achievers Circle'
  if (iqScore >= 104 && iqScore < 110) return 'Enthusiasts Circle'
  if (iqScore >= 110 && iqScore < 120) return 'Masters Circle'
  if (iqScore >= 120 && iqScore < 130) return 'Scholars Circle'
  if (iqScore >= 130 && iqScore < 140) return 'Pioneers Circle'
  if (iqScore >= 140 && iqScore < 150) return 'Visionaries Circle'
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
        // tournamentRank: 7,
        // tournamentScore: 865,
        // topPlayers: [
        //   { name: 'Sarah Johnson', inGameName: 'QuizWhiz', score: 980 },
        //   { name: 'Mike Chen', inGameName: 'BrainiacMC', score: 945 },
        //   { name: 'Emily Patel', inGameName: 'TriviaQueen', score: 920 },
        //   { name: 'Alex Rodriguez', inGameName: 'QuizKing99', score: 905 },
        //   { name: 'Lisa Thompson', inGameName: 'FactMaster', score: 890 },
        // ],
        // categoryPerformance: [
        //   { name: 'World', value: 80, height: 180 },
        //   { name: 'Politics', value: 65, height: 135 },
        //   { name: 'Technology', value: 90, height: 210 },
        //   { name: 'Science', value: 75, height: 165 },
        //   { name: 'Entertainment', value: 70, height: 150 },
        //   { name: 'Current Affairs', value: 85, height: 195 },
        // ],
      }
      const transporter = await mailTransporter()
      await transporter.sendMail({
        from: MailTemplates.userWeeklyReportTemplate.from,
        to: user.email,
        subject: MailTemplates.userWeeklyReportTemplate.subject,
        html: MailTemplates.userWeeklyReportTemplate.html({
          ...userData,
        }),
      })
      updateProgress()
    }
    res.status(200).json({ message: 'Mails sent successfully' })
    console.log('All Updates saved successfully!')
  } catch (error) {
    res.status(500).json({ message: error.message })
    console.error(error)
  }
}

module.exports = { streakBroken, sendMailsToUsers }
