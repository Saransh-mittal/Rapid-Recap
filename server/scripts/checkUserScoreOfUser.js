const configService = require('../configService')
const QuizAttempt = require('../model/quizAttemptSchema')
const User = require('../model/userSchema')

// const checkUserScoreOfUser = async () => {
//   const user = await User.findOne({ inGameName: 'Simamittal' }).populate(
//     'quizAttempts',
//   )

//   let userScore = user.baseUserScore || 0

//   user.quizAttempts.forEach(attempt => {
//     userScore += attempt.articleDifficulty * attempt.userPercentile
//   })
//   console.log(userScore)
// }

// checkUserScoreOfUser()

const timeTakenToFetchQuizAttempts = async () => {
  try {
    const currSeason = configService.getCurrentSeason()
    console.time('time to fetch user')
    const user = await User.findOne({ inGameName: 'Simamittal' }).select('_id')
    console.timeEnd('time to fetch user')
    console.time('Time taken to fetch quiz attempts')
    const quizAttempts = await QuizAttempt.find({
      user: user._id,
      season: parseInt(currSeason, 10),
    }).populate({
      path: 'article',
      select: '_id', // Only select the _id field from article
      populate: {
        path: 'quiz',
        select: '_id', // Only select the _id field from quiz
      },
    })
    console.log(quizAttempts.length)
    console.timeEnd('Time taken to fetch quiz attempts')
  } catch (error) {
    console.log(error)
  }
}
timeTakenToFetchQuizAttempts()
