const User = require('../model/userSchema')
const Article = require('../model/articleSchema')
const QuizAttempt = require('../model/quizAttemptSchema')
const Quiz = require('../model/quizSchema')
const QuinBoost = require('../model/quinBoostSchema')
const { currDayStreakCalulator } = require('../utils/user.utils')
const {
  scheduleEmail,
  cancelScheduledEmails,
  scheduleDayEndEmail,
} = require('../scheduler/mail')
const MailTemplates = require('../data/MailTemplates')
const { logActivity } = require('../utils/activity.utils')
const { activityTypes } = require('../data/activityTypes')
const configService = require('../configService')
const {
  fetchTodaysPastRQMs,
  sendMailsForQuizRemainingToReviveStreak,
} = require('../utils/quiz.utils')
const {
  startSession,
  commitSession,
  abortSession,
  endSession,
} = require('../db/session.js')
const { getTopThreeRecommendedArticles } = require('../utils/article.utils.js')

// @desc Save the quiz attempt
// @route POST /api/quiz/saveAttempt
// @access Private
const saveAttempt = async (req, res) => {
  const { articleId, userResponses, quizData, timeTaken, quizId } = req.body
  const userId = req.user._id
  const maxRetries = 3
  let retryCount = 0
  let success = false

  while (retryCount < maxRetries && !success) {
    const session = await startSession()
    //console.log(userId);
    try {
      if (!userId || !articleId || !userResponses || !quizData) {
        throw new Error('Please provide all the details')
      }

      const attempt = await QuizAttempt.findOne({
        user: userId,
        article: articleId,
      }).session(session)

      const currentDate = new Date() // Get current date
      currentDate.setUTCHours(0, 0, 0, 0) // Set time to start of the day

      // Check if there's any attempt saved for the current user and article for today
      const todayAttemptsCount = await QuizAttempt.countDocuments({
        user: userId,
        createdAt: { $gte: currentDate },
      }).session(session)
      if (attempt) {
        throw new Error('User has already attempted the quiz for the article.')
      }
      const article = await Article.findById(articleId).session(session)
      if (!article) {
        throw new Error('Article not found')
      }

      if (!article.userQuizStatus) {
        throw new Error('No quiz status found for this article')
      }
      const foundStatus = article.userQuizStatus.find(
        status => status.userId.toString() === userId,
      )

      if (foundStatus) {
        foundStatus.status = false
      } else {
        throw new Error('User never started the quiz')
      }
      await article.save({ session })

      const quiz = await Quiz.findById(quizId)
      const quizAttempt = await QuizAttempt.findOne({
        user: userId,
        article: articleId,
        quiz: quizId,
      }).session(session)
      if (quizAttempt) {
        throw new Error('User has already attempted the quiz for the article.')
      }

      const questions = quizData.questions
      const correctAnswers = questions.map(question => question.answer)
      let score = correctAnswers.reduce((acc, answer, index) => {
        if (userResponses.length > index && answer === userResponses[index]) {
          //console.log(acc);
          return acc + 1
        }
        return acc
      }, 0)
      //console.log(score);
      score = score / quizData.questions.length
      const quizDifficulty =
        questions.reduce((acc, question, index) => {
          //console.log(acc, question.difficulty);
          return acc + parseFloat(question.difficulty)
        }, 0) / questions.length

      const apparentTimeTaken =
        timeTaken <= 10
          ? Math.ceil((timeTaken * timeTaken) / 2 - 10 * timeTaken + 60)
          : timeTaken

      const apparentScore = (score * Math.log(score + 1)) / Math.log(1.3)
      let RQM_score = Math.ceil(
        ((apparentScore * quizDifficulty) / apparentTimeTaken) * 1000,
      )
      const user = await User.findById(userId)
        .populate({
          path: 'quizAttempts',
          select: '_id',
          match: { season: parseInt(configService.getCurrentSeason(), 10) },
        })
        .session(session)
      let boosted = false
      let quinBoostUtilized = false

      if (user.quinBoosts.length > 0) {
        const quinBoost = user.quinBoosts[user.quinBoosts.length - 1]
        if (quinBoost.boosted) {
          RQM_score = Math.ceil(RQM_score * (user.todayBoost ? 1.75 : 1.5))
          quinBoost.boosted = false
          const qBoost = await QuinBoost.findById(quinBoost.quinBoost)
          // console.log(qBoost);
          // console.log(article._id);
          qBoost.article = article._id
          await qBoost.save({ session })
          if (user.revivalPeriodEnd) {
            user.streak = user.streakBeforeBreak + 1
            user.streakBeforeBreak = 0
            user.revivalPeriodEnd = null
            await user.save({ session })
          }
          quinBoostUtilized = true
        }
      } else if (user.todayBoost) {
        RQM_score = Math.ceil(RQM_score * 1.5)
        boosted = true
      }
      const articleDifficulty = quiz.overAllDifficulty
      const newQuizAttempt = new QuizAttempt({
        user: userId,
        article: articleId,
        quiz: quizId,
        responses: userResponses.map((userAnswer, index) => {
          return {
            questionId: questions[index]._id, // Assuming each question has a unique ID
            userAnswer,
            isCorrect: userAnswer === correctAnswers[index],
          }
        }),
        RQM_score,
        articleDifficulty,
        timeTaken,
        boost:
          quinBoostUtilized && user.todayBoost
            ? 1.75
            : boosted || quinBoostUtilized
            ? 1.5
            : 1,
        isBoosted: boosted || quinBoostUtilized,
        season: parseInt(configService.getCurrentSeason(), 10),
      })
      await newQuizAttempt.save({ session })

      article.quizAttemptCnt++
      await article.save({ session })

      let sumOfRQM = user.avgRQM * user.quizAttempts.length
      sumOfRQM += RQM_score
      user.avgRQM = sumOfRQM / (user.quizAttempts.length + 1)
      user.quizAttempts.push(newQuizAttempt._id)
      const expiry = new Date()
      const today = new Date()
      today.setUTCHours(0, 0, 0, 0)
      // if (user.streakExpiry < today) {
      //   user.streak = 0
      //   await user.save({ session })
      // }
      expiry.setUTCDate(expiry.getUTCDate() + 1) // Set date to one day from now
      expiry.setUTCHours(0, 0, 0, 0)
      user.streakExpiry = expiry
      if (todayAttemptsCount === 0) {
        if (user.streak + 1 > user.longestStreak)
          user.longestStreak = user.streak + 1
        user.streak++
      }
      if (articleDifficulty < 0.5) user.easyQuizCount++
      else if (articleDifficulty < 0.7) user.mediumQuizCount++
      else user.hardQuizCount++

      user.rankedInCurrentSeason = true
      user.todaysQuizCnt++
      await user.save({ session })
      success = true // Move this line here
      await commitSession()
      const xpAwarded = await logActivity({
        userInGameName: user.inGameName,
        type: activityTypes.RANDOM_QUIZ.type,
        consecutiveQuizCount: todayAttemptsCount,
      })
      if (quinBoostUtilized)
        await logActivity({
          userInGameName: user.inGameName,
          type: activityTypes.QUINBOOST_UTILIZED.type,
        })
      const quizzesToday = await currDayStreakCalulator(user._id)
      const articlesForMail = await getTopThreeRecommendedArticles(
        user._id.toString(),
      )
      quizzesToday < 6 &&
        sendMailsForQuizRemainingToReviveStreak(
          user._id.toString(),
          6 - quizzesToday,
        )
      if (quizzesToday % 7 === 4) {
        cancelScheduledEmails(user._id.toString())
        scheduleEmail({
          userId: user._id.toString(),
          userEmail: user.email,
          delayMinutes: 30,
          mailHtml: MailTemplates.preQuinBoost.html({
            name: user.name.split(' ')[0],
            noOfQuiz: quizzesToday,
            QuinQuizNumber: quizzesToday + 2,
            articlesForMail,
          }),
          subject: MailTemplates.preQuinBoost.subject,
        })
        scheduleEmail({
          userId: user._id.toString(),
          userEmail: user.email,
          delayMinutes: 120,
          mailHtml: MailTemplates.preQuinBoost.html({
            name: user.name.split(' ')[0],
            noOfQuiz: quizzesToday,
            QuinQuizNumber: quizzesToday + 2,
            articlesForMail,
          }),
          subject: `Reminder: ${MailTemplates.preQuinBoost.subject}`,
        })
      } else if (quizzesToday % 7 === 5) {
        cancelScheduledEmails(user._id.toString())
        scheduleEmail({
          userId: user._id.toString(),
          userEmail: user.email,
          delayMinutes: 30,
          mailHtml: MailTemplates.onQuinBoost.html1({
            name: user.name.split(' ')[0],
            noOfQuiz: quizzesToday,
            QuinQuizNumber: quizzesToday + 1,
            articlesForMail,
          }),
          subject: MailTemplates.onQuinBoost.subject,
        })
        scheduleEmail({
          userId: user._id.toString(),
          userEmail: user.email,
          delayMinutes: 120,
          mailHtml: MailTemplates.onQuinBoost.html1({
            name: user.name.split(' ')[0],
            noOfQuiz: quizzesToday,
            QuinQuizNumber: quizzesToday + 1,
            articlesForMail,
          }),
          subject: `Reminder: ${MailTemplates.onQuinBoost.subject}`,
        })
        scheduleDayEndEmail({
          userId: user._id.toString(),
          userEmail: user.email,
          beforeMin: 60,
          mailHtml: MailTemplates.onQuinBoost.html2({
            name: user.name.split(' ')[0],
            QuinQuizNumber: quizzesToday + 1,
            articlesForMail,
          }),
          subject: 'Hurry Up 1 hour Left! Your Quin Boost is Active! 🌟',
        })
      } else if (quizzesToday % 7 === 6) {
        cancelScheduledEmails(user._id.toString())
        scheduleEmail({
          userId: user._id.toString(),
          userEmail: user.email,
          delayMinutes: 30,
          mailHtml: MailTemplates.postQuinBoost.html({
            name: user.name.split(' ')[0],
            noOfQuiz: quizzesToday,
            articlesForMail,
          }),
          subject: MailTemplates.postQuinBoost.subject,
        })
      }
      const pastRQMs = await fetchTodaysPastRQMs({ userId })
      const articleDifficultyLevel =
        articleDifficulty < 0.5
          ? 'easy'
          : articleDifficulty >= 0.5 && articleDifficulty < 0.7
          ? 'medium'
          : 'hard'
      const scoreString = `${score * quizData.questions.length}/${
        quizData.questions.length
      }`
      res.status(201).json({
        message: 'Attempt saved successfully',
        RQM_score,
        quizDifficulty: articleDifficultyLevel,
        timeTaken,
        score: scoreString,
        pastRQMs,
        xpAwarded,
        quinBoostUtilized,
      })
    } catch (error) {
      await abortSession()

      if (
        error.name === 'MongoError' &&
        (error.code === 112 || error.code === 251)
      ) {
        // These error codes typically indicate transient errors
        retryCount++
        if (retryCount < maxRetries) {
          console.log(`Retrying transaction (attempt ${retryCount + 1})...`)
          await new Promise(resolve =>
            setTimeout(resolve, 2 ** retryCount * 100),
          ) // Exponential backoff
        }
      } else {
        console.error('Non-transient error:', error)
        res.status(400).json({ error: error.message || 'Error saving attempt' })
        break
      }
    } finally {
      await endSession()
    }
  }

  if (!success && retryCount === maxRetries) {
    res
      .status(500)
      .json({ error: 'Max retries reached. Unable to save attempt.' })
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
    console.log(userPercentile)
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
