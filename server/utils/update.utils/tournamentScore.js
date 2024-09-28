const { QuizSession } = require('../../model/tournamentRegistrationSchema')
const Tournament = require('../../model/tournamentSchema')

const updateTourScore = async () => {
  try {
    const latestTournament = await Tournament.findOne({ isActive: true })

    const quizSessions = await QuizSession.find({
      tournament: latestTournament._id,
    })
      .populate('questions')
      .populate('user')

    // initialze map to store user score

    const userScoreMap = new Map()
    for (let quizSession of quizSessions) {
      const { questions, score, timeTaken } = quizSession
      const quizDifficulty =
        questions.reduce(
          (acc, question) => acc + parseFloat(question.difficulty),
          0,
        ) / questions.length

      const apparentTimeTaken =
        timeTaken <= 10
          ? Math.ceil((timeTaken * timeTaken) / 2 - 10 * timeTaken + 60)
          : timeTaken
      const apparentScore =
        ((score / questions.length) *
          (score < 3 ? 1 : 1.5) *
          Math.log(score / questions.length + 1)) /
        Math.log(1.3)
      let RQM_score = Math.ceil(
        ((apparentScore * quizDifficulty) / apparentTimeTaken) * 1000,
      )
      // userScoreMap[quizSession.user.inGameName] = RQM_score
      // add user RQM score to map
      userScoreMap.set(
        quizSession.user.inGameName,
        RQM_score + (userScoreMap.get(quizSession.user.inGameName) || 0),
      )

      // console.log('RQM_score', RQM_score, quizSession.user.inGameName)
    }
    console.log('userScoreMap', userScoreMap)
  } catch (error) {
    console.log(error)
  }
}

updateTourScore()
