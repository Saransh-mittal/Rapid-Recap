const QuizAttempt = require('../model/quizAttemptSchema')
const Quiz = require('../model/quizSchema')
const {
  startSession,
  commitSession,
  abortSession,
  endSession,
} = require('../db/session.js')
const { saveQuizAttempt } = require('../services/quizAttemptService.js')

// @desc Save the quiz attempt
// @route POST /api/quiz/saveAttempt
// @access Private
const saveAttempt = async (req, res) => {
  const { articleId, userResponses, quizData, timeTaken, quizId } = req.body
  const userId = req.user._id
  const MAX_RETRIES = 10
  const BASE_RETRY_DELAY_MS = 500

  const executeWithRetry = async operation => {
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        return await operation()
      } catch (error) {
        if (
          error.name === 'MongoServerError' &&
          error.hasErrorLabel('TransientTransactionError')
        ) {
          if (attempt < MAX_RETRIES - 1) {
            const retryDelay =
              BASE_RETRY_DELAY_MS * Math.pow(2, attempt) +
              Math.floor(Math.random() * BASE_RETRY_DELAY_MS)
            console.log(
              `Retrying transaction (attempt ${
                attempt + 1
              }) after ${retryDelay}ms...`,
            )
            await new Promise(resolve => setTimeout(resolve, retryDelay))
            continue
          }
        }
        throw error
      }
    }
    throw new Error('Max retries reached, operation failed.')
  }

  try {
    const result = await executeWithRetry(async () => {
      const session = await startSession()
      try {
        const quizAttemptResult = await saveQuizAttempt(
          userId,
          articleId,
          userResponses,
          quizData,
          timeTaken,
          quizId,
          session,
        )

        await commitSession(session)
        return quizAttemptResult
      } catch (error) {
        await abortSession(session)
        throw error
      } finally {
        await endSession(session)
      }
    })

    res.status(201).json(result)
  } catch (error) {
    console.error('Error in saveAttempt:', error)
    res.status(500).json({ error: 'Unable to save attempt. Please try again.' })
  }
}

const getPercentile = async (req, res) => {
  const { userId, articleId } = req.params

  try {
    const quizAttempts = await QuizAttempt.find({ article: articleId })
    const sortedQuizAttempts = quizAttempts.sort(
      (a, b) => b.RQM_score - a.RQM_score,
    )
    const userAttempt = sortedQuizAttempts.find(
      attempt => attempt.user.toString() === userId,
    )
    if (!userAttempt) {
      throw new Error('User has not attempted the quiz for the article.')
    }
    const userPosition = sortedQuizAttempts.indexOf(userAttempt)

    const totalAttempts = sortedQuizAttempts.length
    const userPercentile =
      ((totalAttempts - userPosition) / totalAttempts) * 100
    userAttempt.userPercentile = userPercentile
    await userAttempt.save()

    res.status(200).json({ percentile: userPercentile })
  } catch (error) {
    console.log(error)
    res.status(400).json({
      error: error || 'Error Calculating percentile. Please try again Later',
    })
  }
}

const givenQuiz = async (req, res) => {
  const { userId, articleId } = req.params
  try {
    const quizAttempt = await QuizAttempt.findOne({
      user: userId,
      article: articleId,
    })
    if (quizAttempt) {
      const quizAttempts = await QuizAttempt.find({ article: articleId })
      const sortedQuizAttempts = quizAttempts.sort(
        (a, b) => b.RQM_score - a.RQM_score,
      )
      const userAttempt = sortedQuizAttempts.find(
        attempt => attempt.user && attempt.user.toString() === userId,
      )
      if (!userAttempt) {
        throw new Error('User has not attempted the quiz for the article.')
      }
      const userPosition = sortedQuizAttempts.indexOf(userAttempt)

      const totalAttempts = sortedQuizAttempts.length
      const userPercentile =
        ((totalAttempts - userPosition) / totalAttempts) * 100
      userAttempt.userPercentile = userPercentile
      await userAttempt.save()
      res.status(200).json({
        given: true,
        percentile: userPercentile,
        RQM_score: quizAttempt.RQM_score,
      })
    } else {
      res.status(200).json({ given: false })
    }
  } catch (error) {
    console.log(error)
    res.status(422).json({ error: error })
  }
}

const getQuizSummary = async (req, res) => {
  //console.log("getQuizSummary");
  const articleId = req.params.articleId
  const userId = req.user._id
  try {
    const quizAttempt = await QuizAttempt.findOne({
      user: userId,
      article: articleId,
    })
    const quiz = await Quiz.findById(quizAttempt.quiz)
    if (!quizAttempt) {
      throw new Error('User has not attempted the quiz for the article.')
    }
    const { responses } = quizAttempt
    const result = []
    let score = 0
    for (let i = 0; i < responses.length; i++) {
      const question = responses[i]

      const { questionId, userAnswer } = question

      // find question in the model Quiz in para1, para2 and para3 of the questionId
      let found = false
      let para = 1
      let questionIndex = 0
      let fullQuestion = {}
      while (!found && para <= 3) {
        const paraQuestions = quiz[`para${para}`].questions
        //console.log(paraQuestions[0]._id.toString());
        questionIndex = paraQuestions.findIndex(q => {
          //console.log(questionId.toString());
          //console.log(q._id.toString());

          return q._id.toString() === questionId.toString()
        })
        if (questionIndex !== -1) {
          fullQuestion = paraQuestions[questionIndex]
          found = true
        } else {
          para++
        }
      }
      const { options, answer, explanation } = fullQuestion
      // console.log(userAnswer);
      // console.log(question.isCorrect);
      // console.log(fullQuestion);
      if (question.isCorrect) score++
      result.push({
        question: fullQuestion.question,
        options,
        answer,
        explanation,
        userAnswer,
        isCorrect: question.isCorrect,
      })
    }
    const articleDifficulty = quizAttempt.articleDifficulty
    const articleDifficultyLevel =
      articleDifficulty < 0.5
        ? 'easy'
        : articleDifficulty >= 0.5 && articleDifficulty < 0.7
        ? 'medium'
        : 'hard'
    const scoreString = `${score}/${result.length}`
    res.status(200).json({
      result,
      timeTaken: quizAttempt.timeTaken,
      RQM_score: quizAttempt.RQM_score,
      quizDifficulty: articleDifficultyLevel,
      score: scoreString,
    })
  } catch (error) {
    res.status(400).json({ error: error || 'Something went wrong' })
    console.error(error)
  }
}

module.exports = { saveAttempt, getPercentile, givenQuiz, getQuizSummary }
