const moment = require('moment')
const Article = require('../../model/articleSchema')
const QuizAttempt = require('../../model/quizAttemptSchema')
const Quiz = require('../../model/quizSchema')
const User = require('../../model/userSchema')
const { genQuiz } = require('../quiz.utils')
const configService = require('../../configService')

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}
async function asyncFilter(arr, predicate) {
  const results = []
  for (const item of arr) {
    if (await predicate(item)) {
      results.push(item)
    }
  }
  return results
}
async function updateBots() {
  try {
    const botUsers = await User.find({
      email: { $regex: /^dummy\d+@mail\.com$/ },
    })

    console.log('\nBot users fetched successfully\n')

    console.log('Generating fake quiz attempts...')

    console.log('Fetching articles with quiz...')
    let articlesWithQuiz = await Article.find({
      quiz: { $exists: true },
    })
    // articlesWithQuiz = await Promise.all(
    //   articlesWithQuiz.filter(async article => {
    //     const quiz = await Quiz.findById(article.quiz)
    //     return quiz ? true : false
    //   }),
    // )
    articlesWithQuiz = await asyncFilter(articlesWithQuiz, async article => {
      const quiz = await Quiz.findById(article.quiz)
      return quiz !== null
    })
    console.log('Articles with quiz fetched successfully')

    console.log('Generating fake quiz attempts...')
    for (let day = 0; day >= 0; day--) {
      const selectedBotUsers = shuffle(botUsers).slice(0, 70)
      console.log('\nSelected 70 bot users\n')
      const currentDate = moment().subtract(day, 'days').toDate()
      console.log(`\nGenerating fake quiz attempts for ${currentDate}\n`)

      for (let i = 0; i < selectedBotUsers.length; i++) {
        const user = selectedBotUsers[i]
        try {
          const cnt = Math.floor(Math.random() * 20)
          const newArticlesWithQuiz = shuffle(articlesWithQuiz).slice(0, cnt)

          for (const article of newArticlesWithQuiz) {
            const checkQuizAttempt = await QuizAttempt.findOne({
              article: article._id,
              user: user._id,
            })
            if (checkQuizAttempt) continue
            const quizId = Array.isArray(article.quiz)
              ? article.quiz[0]
              : article.quiz
            const fullQuiz = await Quiz.findById(quizId)
            if (!fullQuiz) {
              article.quiz = null
              await article.save()
              continue
            }
            const title = article.title
            const quiz = await genQuiz({ fullQuiz, title })
            if (quiz.questions.length <= 2) {
              continue
            }

            const questions = quiz.questions
            const userResponses = []
            let correctCount = 0
            let flag = false
            questions.forEach(question => {
              if (flag) return
              if (
                !question ||
                !question.answer ||
                !question.options ||
                !question._id
              ) {
                flag = true
                return
              }
              const isCorrect = Math.random() > 0.5
              if (isCorrect) {
                userResponses.push(question.answer)
                correctCount++
              } else {
                const incorrectOptionKeys = Object.keys(
                  question.options,
                ).filter(key => key !== question.answer)
                const randomIncorrectOptionKey =
                  incorrectOptionKeys[
                    Math.floor(Math.random() * incorrectOptionKeys.length)
                  ]
                userResponses.push(randomIncorrectOptionKey)
              }
            })
            if (flag) continue
            const quizDifficulty =
              questions.reduce((acc, question) => {
                return acc + parseFloat(question.difficulty)
              }, 0) / questions.length
            const timeTaken =
              Math.floor(Math.random() * questions.length * 10) + 1
            const apparentTimeTaken =
              timeTaken <= 10
                ? Math.ceil((timeTaken * timeTaken) / 2 - 10 * timeTaken + 60)
                : timeTaken
            const userId = user._id
            const articleId = article._id
            let score = correctCount / questions.length
            const apparentScore = (score * Math.log(score + 1)) / Math.log(1.3)
            const RQM_score = Math.ceil(
              ((apparentScore * quizDifficulty) / apparentTimeTaken) * 1000,
            )

            const newQuizAttempt = new QuizAttempt({
              user: userId,
              article: articleId,
              quiz: quizId,
              responses: userResponses.map((userAnswer, index) => {
                return {
                  questionId: questions[index]._id, // Assuming each question has a unique ID
                  userAnswer,
                  isCorrect: userAnswer === questions[index].answer,
                }
              }),
              RQM_score,
              articleDifficulty: fullQuiz.overAllDifficulty,
              timeTaken,
              season: parseInt(configService.getCurrentSeason(), 10),
            })

            await newQuizAttempt.save()
            newQuizAttempt.createdAt = currentDate
            await newQuizAttempt.save()
            const u = await User.findById(userId).populate({
              path: 'quizAttempts',
              select: '_id',
              match: { season: parseInt(configService.getCurrentSeason(), 10) },
            })
            u.quizAttempts.push(newQuizAttempt._id)
            if (fullQuiz.overAllDifficulty < 0.5) u.easyQuizCount++
            else if (fullQuiz.overAllDifficulty < 0.7) u.mediumQuizCount++
            else u.hardQuizCount++
            u.rankedInCurrentSeason = true
            let sumOfRQM = u.avgRQM * u.quizAttempts.length
            sumOfRQM += RQM_score
            u.avgRQM = sumOfRQM / (u.quizAttempts.length + 1)
            await u.save()
          }
        } catch (err) {
          console.error(`Error processing user ${user._id}: ${err.message}`)
          console.error(`Stack trace: ${err.stack}`)
        }
      }
      console.log(`\nGenerated fake quiz attempts for ${currentDate}\n`)
    }
  } catch (err) {
    console.error(`Error in updateBots: ${err.message}`)
    console.error(`Stack trace: ${err.stack}`)
  }
}

module.exports = updateBots
