const QuizAttempt = require('../model/quizAttemptSchema')
const Quiz = require('../model/quizSchema')
const {
  startSession,
  commitSession,
  abortSession,
  endSession,
} = require('../db/session.js')
const { saveQuizAttempt } = require('../services/quizAttemptService.js')
const Article = require('../model/articleSchema.js')
const ArticleQuizSession = require('../model/articleQuizSessionSchem.js')
const {
  findQuizByLanguage,
  generateQuestionsForHindiQuiz,
  genQuiz,
  generateQuestionsForQuiz,
} = require('../utils/quiz.utils.js')
const mongoose = require('mongoose')
const User = require('../model/userSchema.js')
const globalEmitter = require('../eventEmitter')

const requestMap = new Map()

const waitForRequest = key => {
  return new Promise(resolve => {
    const checkCompletion = () => {
      if (!requestMap.has(key)) {
        resolve()
      } else {
        setTimeout(checkCompletion, 100)
      }
    }
    checkCompletion()
  })
}

const getQuiz = async (req, res) => {
  const { articleId, lang } = req.params
  const userId = req.user._id
  const requestKey = `${userId}-${articleId}-${lang}`

  let session
  let cancellationToken = { cancelled: false }

  try {
    session = await mongoose.startSession()
    session.startTransaction()

    const emitProgress = progress => {
      if (cancellationToken.cancelled) {
        return
      }
      globalEmitter.emit('quiz_progress', { userId, progress })
    }
    emitProgress(5)
    if (requestMap.has(requestKey)) {
      // Cancel the previous request
      requestMap.get(requestKey).cancelled = true
      await waitForRequest(requestKey)
    }

    requestMap.set(requestKey, cancellationToken)

    if (!articleId) {
      throw new Error('No article provided')
    }

    const article = await Article.findById(articleId).session(session)
    if (!article) {
      throw new Error('Article not found')
    }

    const { title, author, mainText, hindiTitle, hindiAuthor, hindiMainText } =
      article

    if (
      (lang === 'en' && (!title || !mainText)) ||
      (lang === 'hi' && (!hindiTitle || !hindiMainText || !hindiAuthor))
    ) {
      throw new Error('Quiz cannot be generated for this article')
    }

    // Check if a session already exists for this user and article
    let quizSessions = await ArticleQuizSession.find({
      user: userId,
      article: articleId,
    }).session(session)

    emitProgress(5)

    let quizSession = quizSessions?.find(
      session => session.language === lang && !session.completed,
    )
    const inProgressSession = quizSessions?.find(
      session => session.startTime && !session.completed,
    )
    const completedSession = quizSessions?.find(session => session.completed)

    if (completedSession) {
      emitProgress(100)
      await session.commitTransaction()
      session.endSession()
      return res.status(200).json({
        message: 'Quiz already completed for this article',
        status: 'completed',
      })
    } else if (inProgressSession) {
      emitProgress(100)
      await session.commitTransaction()
      session.endSession()
      return res.status(200).json({
        message: 'Quiz is in progress.',
      })
    } else if (quizSession) {
      emitProgress(100)
      await session.commitTransaction()
      session.endSession()
      return res.status(200).json({
        message: 'Existing quiz session found. You can start the quiz.',
        quizSession,
        status: 'ready',
      })
    }

    emitProgress(20)
    // If no session exists, create a new one
    let fullQuiz = await findQuizByLanguage({
      language: lang,
      articleId,
      session,
    })

    if (!fullQuiz) {
      emitProgress(30)
      fullQuiz =
        lang === 'hi'
          ? await generateQuestionsForHindiQuiz({
              title: hindiTitle,
              author: hindiAuthor,
              mainText: hindiMainText,
              articleId,
              emitProgress,
              session,
            })
          : await generateQuestionsForQuiz({
              title,
              author,
              mainText,
              articleId,
              emitProgress,
              session,
            })

      emitProgress(90)
    }

    const quiz = await genQuiz({ fullQuiz, title, session })
    emitProgress(95)

    if (quiz.questions.length <= 2) {
      throw new Error('Article is too short for a quiz')
    }

    const timer = Math.min(5, quiz.questions.length) * 10

    // Create a new quiz session with original order of options
    quizSession = new ArticleQuizSession({
      quiz: fullQuiz._id,
      user: userId,
      article: articleId,
      questions: quiz.questions.map(q => ({
        question: q.question,
        options: {
          a: { text: q.options.a, _id: new mongoose.Types.ObjectId() },
          b: { text: q.options.b, _id: new mongoose.Types.ObjectId() },
          c: { text: q.options.c, _id: new mongoose.Types.ObjectId() },
          d: { text: q.options.d, _id: new mongoose.Types.ObjectId() },
        },
        answer: q.answer,
        explanation: q.explanation,
        difficulty: parseFloat(q.difficulty) || 0.5,
        questionId: q._id,
      })),
      startTime: null,
      endTime: null,
      completed: false,
      overAllDifficulty: {
        [lang]: parseFloat(fullQuiz.overAllDifficulty) || 0.5,
      },
      RQM_score: { [lang]: null },
      timeTaken: { [lang]: null },
      language: lang,
      responses: [],
    })

    // Improved Fisher-Yates shuffle algorithm
    const shuffle = array => {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[array[i], array[j]] = [array[j], array[i]]
      }
      return array
    }

    // Function to shuffle options and reassign keys
    const shuffleOptions = options => {
      const entries = Object.entries(options)
      const shuffled = shuffle(entries)

      // Reassign keys (a, b, c, d) to shuffled options
      return Object.fromEntries(
        shuffled.map(([_, value], index) => [
          String.fromCharCode(97 + index), // 'a', 'b', 'c', 'd'
          value,
        ]),
      )
    }

    // Shuffle options and update correct answer
    quizSession.questions = quizSession.questions.map(question => {
      const originalAnswer = question.answer
      const originalOptionId = question.options[originalAnswer]._id
      const shuffledOptions = shuffleOptions(question.options)

      // Find new correct answer key
      const newAnswer = Object.keys(shuffledOptions).find(
        key =>
          shuffledOptions[key]._id.toString() === originalOptionId.toString(),
      )

      return {
        ...question,
        options: shuffledOptions,
        answer: newAnswer,
      }
    })

    await quizSession.save({ session })
    emitProgress(100)

    await session.commitTransaction()
    session.endSession()

    return res.status(200).json({
      message: 'New quiz session created successfully',
      quizSession,
      timer,
      status: 'ready',
    })
  } catch (error) {
    if (session) {
      await session.abortTransaction()
      session.endSession()
    }
    console.error('Error in getQuiz:', error)
    if (error.message === 'Request cancelled') {
      return res
        .status(409)
        .json({ error: 'Request cancelled due to a new request' })
    }
    res.status(400).json({ error: 'Something went wrong! Please try again' })
  } finally {
    requestMap.delete(requestKey)
  }
}

// @desc   Start the quiz
// @route  POST /api/quiz/start/:sessionId
// @access Private
const startQuiz = async (req, res) => {
  const { sessionId } = req.params
  const userId = req.user._id
  try {
    const quizSession = await ArticleQuizSession.findOne({
      _id: sessionId,
      user: userId,
    })

    if (!quizSession) {
      return res.status(404).json({ error: 'Quiz session not found' })
    }

    if (quizSession.completed) {
      return res.status(400).json({ error: 'Quiz session already completed' })
    }

    if (quizSession.startTime) {
      return res.status(400).json({ error: 'Quiz already started.' })
    }

    const timer = Math.min(5, quizSession.questions.length) * 10

    quizSession.startTime = new Date()
    quizSession.endTime = new Date(Date.now() + timer * 1000)
    await quizSession.save()

    res.status(200).json({
      message: 'Quiz started successfully',
      startTime: quizSession.startTime,
      endTime: quizSession.endTime,
      timer,
    })
  } catch (error) {
    res.status(400).json({ error: 'Something went wrong! Please try again' })
    console.log(error)
  }
}

// @desc   Save the quiz attempt
// @route  POST /api/quiz/saveAttempt
// @access Private
const saveAttempt = async (req, res) => {
  const { articleId, userResponses, quizData, timeTaken, sessionId } = req.body
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
        const quizSession = await ArticleQuizSession.findOne({
          _id: sessionId,
          user: userId,
          article: articleId,
        }).session(session)

        if (!quizSession) {
          throw new Error('Quiz session not found')
        }

        if (quizSession.completed) {
          throw new Error('Quiz session already completed')
        }
        const mappedResponses = quizSession.questions.map((question, index) => {
          return {
            questionId: question.questionId,
            userAnswer: userResponses[index],
            isCorrect: userResponses[index] === question.answer,
          }
        })

        // Update the quiz session
        quizSession.responses = mappedResponses
        quizSession.completed = true
        quizSession.endTime = new Date()
        await quizSession.save({ session })

        // Call the existing saveQuizAttempt function with mapped responses
        const quizAttemptResult = await saveQuizAttempt(
          userId,
          articleId,
          mappedResponses,
          quizSession.questions,
          timeTaken,
          quizSession._id,
          quizSession,
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
    // Delete the quiz session if the attempt fails
    await ArticleQuizSession.deleteOne({ _id: sessionId, user: userId })

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
      attempt => attempt?.user?.toString() === userId,
    )
    if (!userAttempt) {
      return res.status(404).json({ error: 'User has not attempted the quiz' })
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
  const articleId = req.params.articleId
  const userId = req.user._id

  try {
    const user = await User.findById(userId).select('userLanguage')
    if (!user) {
      throw new Error('User not found')
    }
    const lang = user.userLanguage

    const quizSession = await ArticleQuizSession.findOne({
      user: userId,
      article: articleId,
      language: lang,
    })

    if (!quizSession) {
      throw new Error('User has not attempted the quiz for the article.')
    }

    const result = quizSession.questions.map((question, index) => {
      const response = quizSession.responses[index]
      return {
        question: question.question,
        options: {
          a: question.options.a.text,
          b: question.options.b.text,
          c: question.options.c.text,
          d: question.options.d.text,
        },
        answer: question.answer,
        explanation: question.explanation,
        userAnswer: response.userAnswer,
        isCorrect: response.isCorrect,
      }
    })

    const score = quizSession.responses.filter(r => r.isCorrect).length
    const totalQuestions = quizSession.questions.length
    const articleDifficulty = quizSession.overAllDifficulty[lang]
    const articleDifficultyLevel =
      articleDifficulty < 0.5
        ? 'easy'
        : articleDifficulty >= 0.5 && articleDifficulty < 0.7
        ? 'medium'
        : 'hard'
    const scoreString = `${score}/${totalQuestions}`

    res.status(200).json({
      result,
      timeTaken: quizSession.timeTaken[lang],
      RQM_score: quizSession.RQM_score[lang],
      quizDifficulty: articleDifficultyLevel,
      score: scoreString,
    })
  } catch (error) {
    res.status(400).json({ error: error.message || 'Something went wrong' })
    console.error(error)
  }
}

module.exports = {
  saveAttempt,
  getPercentile,
  givenQuiz,
  getQuizSummary,
  getQuiz,
  startQuiz,
}
