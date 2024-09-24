const MailTemplates = require('../data/MailTemplates')
const Article = require('../model/articleSchema')
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
        $in: ['saransh_1234'],
      },
    })
    const updateProgress = progressBar(users.length)
    for (const user of users) {
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
        name: 'John Doe',
        inGameName: 'RapidMaster42',
        society: 'Quiz Masters',
        circle: 'Trivia Enthusiasts',
        iqScore: 125,
        rank: 10,
        iqChange: 3,
        averageRQM: 78.5,
        rqmChange: 1.2,
        experienceLevel: 'Advanced',
        ongoingSeason: 2,
        totalQuizzesThisWeek: 50,
        quizDistribution: [
          { label: 'Easy', value: 30, height: 120 },
          { label: 'Medium', value: 15, height: 60 },
          { label: 'Hard', value: 5, height: 20 },
        ],
        tournamentRank: 7,
        tournamentScore: 865,
        topPlayers: [
          { name: 'Sarah Johnson', inGameName: 'QuizWhiz', score: 980 },
          { name: 'Mike Chen', inGameName: 'BrainiacMC', score: 945 },
          { name: 'Emily Patel', inGameName: 'TriviaQueen', score: 920 },
          { name: 'Alex Rodriguez', inGameName: 'QuizKing99', score: 905 },
          { name: 'Lisa Thompson', inGameName: 'FactMaster', score: 890 },
        ],
        categoryPerformance: [
          { name: 'World', value: 80, height: 180 },
          { name: 'Politics', value: 65, height: 135 },
          { name: 'Technology', value: 90, height: 210 },
          { name: 'Science', value: 75, height: 165 },
          { name: 'Entertainment', value: 70, height: 150 },
          { name: 'Current Affairs', value: 85, height: 195 },
        ],
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
