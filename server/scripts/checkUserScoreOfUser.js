const User = require('../model/userSchema')

const checkUserScoreOfUser = async () => {
  const user = await User.findOne({ inGameName: 'Simamittal' }).populate(
    'quizAttempts',
  )

  let userScore = user.baseUserScore || 0

  user.quizAttempts.forEach(attempt => {
    userScore += attempt.articleDifficulty * attempt.userPercentile
  })
  console.log(userScore)
}

checkUserScoreOfUser()
