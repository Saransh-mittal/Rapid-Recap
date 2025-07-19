// utils/bot.utils.js - Updated for GameHub system
const moment = require('moment-timezone')
const mongoose = require('mongoose')
const Article = require('../../model/articleSchema')
const QuizAttempt = require('../../model/quizAttemptSchema')
const GameData = require('../../model/gameDataSchema')
const ArticleQuizSession = require('../../model/articleQuizSessionSchem')
const User = require('../../model/userSchema')
const configService = require('../../configService')
const { calculateEnhancedRQM, GAME_CONFIGS } = require('../enhancedQuiz.utils')
const { containsHindi, validateHindiWordAnswer } = require('../hindiText.utils')

// Utility functions
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

// Helper function to safely extract text from option objects
const getOptionText = option => {
  if (typeof option === 'string') return option
  if (typeof option === 'object' && option?.text) return option.text
  return String(option || '')
}

// Generate realistic bot responses based on game type
const generateBotResponses = ({ gameType, questions, botSkillLevel = 0.6 }) => {
  const responses = []
  let correctCount = 0

  switch (gameType) {
    case 'normal_quiz':
      questions.forEach(question => {
        const isCorrect = Math.random() < botSkillLevel
        if (isCorrect && question.answer) {
          responses.push({
            questionId: question.questionId || question._id,
            userAnswer: question.answer,
            isCorrect: true,
          })
          correctCount++
        } else {
          // Select random incorrect answer
          const options = ['a', 'b', 'c', 'd']
          const incorrectOptions = options.filter(
            opt => opt !== question.answer,
          )
          const randomIncorrect =
            incorrectOptions[
              Math.floor(Math.random() * incorrectOptions.length)
            ]
          responses.push({
            questionId: question.questionId || question._id,
            userAnswer: randomIncorrect,
            isCorrect: false,
          })
        }
      })
      break

    case 'true_false':
      questions.forEach(question => {
        const isCorrect = Math.random() < botSkillLevel
        const userAnswer = isCorrect ? question.correct : !question.correct
        responses.push({
          questionId: question.questionId || question._id,
          userAnswer: userAnswer,
          isCorrect: userAnswer === question.correct,
        })
        if (userAnswer === question.correct) correctCount++
      })
      break

    case 'word_weaver':
      questions.forEach(question => {
        const isCorrect = Math.random() < botSkillLevel
        let userWord = ''

        if (isCorrect && question.answer) {
          userWord = question.answer
        } else {
          // Generate a plausible wrong answer
          const correctAnswer = question.answer || 'ANSWER'
          if (containsHindi(correctAnswer)) {
            // For Hindi, just scramble some characters
            userWord = correctAnswer
              .split('')
              .sort(() => Math.random() - 0.5)
              .join('')
              .substring(0, correctAnswer.length)
          } else {
            // For English, scramble letters
            userWord = correctAnswer
              .split('')
              .sort(() => Math.random() - 0.5)
              .join('')
          }
        }

        const responseIsCorrect =
          question.answer &&
          (containsHindi(question.answer)
            ? validateHindiWordAnswer(userWord, question.answer)
            : userWord.toUpperCase() === question.answer.toUpperCase())

        responses.push({
          questionId: question.questionId || question._id,
          userWord: userWord,
          isCorrect: responseIsCorrect,
        })

        if (responseIsCorrect) correctCount++
      })
      break

    case 'connections':
      const question = questions[0] // Connections has one question with multiple concepts
      const validConnections = question.validConnections || []
      const maxConnections = Math.min(4, validConnections.length)
      const connectionsToMake = Math.floor(Math.random() * maxConnections) + 1

      // Randomly select some valid connections
      const selectedValidConnections = shuffle([...validConnections]).slice(
        0,
        Math.floor(connectionsToMake * botSkillLevel),
      )

      // Add some random incorrect connections
      const allConcepts = question.concepts || []
      const incorrectConnectionsCount =
        connectionsToMake - selectedValidConnections.length
      const incorrectConnections = []

      for (let i = 0; i < incorrectConnectionsCount; i++) {
        const shuffledConcepts = shuffle([...allConcepts])
        const from = shuffledConcepts[0]
        const to = shuffledConcepts[1]

        // Make sure this isn't actually a valid connection
        const isActuallyValid = validConnections.some(
          vc =>
            (vc.from === from && vc.to === to) ||
            (vc.from === to && vc.to === from),
        )

        if (!isActuallyValid && from !== to) {
          incorrectConnections.push({ from, to, isValid: false })
        }
      }

      const allConnections = [
        ...selectedValidConnections.map(vc => ({
          from: vc.from,
          to: vc.to,
          isValid: true,
        })),
        ...incorrectConnections,
      ]

      responses.push({
        questionId: question.questionId || question._id,
        connections: allConnections,
      })

      correctCount = selectedValidConnections.length
      break

    default:
      throw new Error(`Unsupported game type: ${gameType}`)
  }

  return { responses, correctCount }
}

// Calculate performance metrics for bot attempts
const calculateBotPerformance = ({ responses, questions, gameType }) => {
  let correctCount = 0
  let totalItems = questions.length

  switch (gameType) {
    case 'normal_quiz':
    case 'true_false':
    case 'word_weaver':
      correctCount = responses.filter(response => response.isCorrect).length
      break

    case 'connections':
      correctCount = responses.reduce((count, response) => {
        return (
          count +
          (response.connections?.filter(conn => conn.isValid).length || 0)
        )
      }, 0)
      totalItems = responses.reduce((total, response) => {
        return total + (response.connections?.length || 0)
      }, 0)
      break
  }

  const accuracy = totalItems > 0 ? correctCount / totalItems : 0
  const avgDifficulty =
    questions.reduce((sum, q) => sum + (q.difficulty || 0.5), 0) /
    questions.length

  return {
    accuracy,
    difficulty: avgDifficulty,
    correctCount,
    totalItems,
  }
}

// Main bot update function
async function updateBots() {
  console.log('Starting GameHub bot simulation...')

  try {
    // Fetch bot users
    const botUsers = await User.find({
      email: { $regex: /^dummy\d+@mail\.com$/ },
    })

    console.log(`Found ${botUsers.length} bot users`)

    // Fetch articles with GameData
    console.log('Fetching articles with GameData...')
    let articlesWithGameData = await Article.find({
      createdAt: { $gte: moment().subtract(30, 'days').toDate() },
    })

    // Filter articles that have GameData (optimized with Promise.all)
    const gameDataChecks = await Promise.all(
      articlesWithGameData.map(async article => {
        const gameData = await GameData.findOne({
          article: article._id,
          isActive: true,
        })
        return { article, hasGameData: gameData !== null }
      }),
    )

    articlesWithGameData = gameDataChecks
      .filter(check => check.hasGameData)
      .map(check => check.article)

    console.log(`Found ${articlesWithGameData.length} articles with GameData`)

    const availableGameTypes = [
      'normal_quiz',
      'true_false',
      'word_weaver',
      'connections',
    ]
    const languages = ['en', 'hi']

    // Generate attempts for recent days (adjust days as needed)
    for (let day = 0; day >= 0; day--) {
      const selectedBotUsers = shuffle([...botUsers]).slice(0, 70)
      const currentDate = moment().subtract(day, 'days').toDate()

      console.log(`\nGenerating bot attempts for ${currentDate.toDateString()}`)
      console.log(`Selected ${selectedBotUsers.length} bot users`)

      for (let i = 0; i < selectedBotUsers.length; i++) {
        const user = selectedBotUsers[i]
        const userLanguage =
          user.userLanguage || (Math.random() > 0.7 ? 'hi' : 'en')

        try {
          // Each bot attempts random number of games
          const attemptCount = Math.floor(Math.random() * 15) + 1
          const selectedArticles = shuffle([...articlesWithGameData]).slice(
            0,
            attemptCount,
          )

          for (const article of selectedArticles) {
            // Skip if bot already attempted this article
            const existingAttempt = await QuizAttempt.findOne({
              article: article._id,
              user: user._id,
            })
            if (existingAttempt) continue

            // Get GameData for user's language
            const gameData = await GameData.findOne({
              article: article._id,
              language: userLanguage,
              isActive: true,
            })

            if (!gameData) continue

            // Select random game type that has data
            const availableTypes = availableGameTypes.filter(type => {
              switch (type) {
                case 'normal_quiz':
                  return gameData.normal_quiz?.questions?.length >= 3
                case 'true_false':
                  return gameData.true_false?.statements?.length >= 5
                case 'word_weaver':
                  return gameData.word_weaver?.questions?.length >= 3
                case 'connections':
                  return (
                    gameData.connections?.concepts?.length >= 6 &&
                    gameData.connections?.validConnections?.length >= 2
                  )
                default:
                  return false
              }
            })

            if (availableTypes.length === 0) continue

            const gameType =
              availableTypes[Math.floor(Math.random() * availableTypes.length)]
            const gameConfig = GAME_CONFIGS[gameType]

            if (!gameConfig) continue

            // Prepare questions based on game type with proper schema format
            let questions = []
            switch (gameType) {
              case 'normal_quiz':
                questions = gameData.normal_quiz.questions
                  .slice(0, gameConfig.itemCount)
                  .map(q => ({
                    questionId: q._id,
                    question: q.question,
                    options: {
                      a: {
                        text: q.options.a,
                        _id: new mongoose.Types.ObjectId(),
                      },
                      b: {
                        text: q.options.b,
                        _id: new mongoose.Types.ObjectId(),
                      },
                      c: {
                        text: q.options.c,
                        _id: new mongoose.Types.ObjectId(),
                      },
                      d: {
                        text: q.options.d,
                        _id: new mongoose.Types.ObjectId(),
                      },
                    },
                    answer: q.correct, // This should be a string like 'a', 'b', 'c', 'd'
                    explanation: q.explanation,
                    difficulty: q.difficulty,
                    _id: q._id,
                  }))
                break
              case 'true_false':
                questions = gameData.true_false.statements
                  .slice(0, gameConfig.itemCount)
                  .map(s => ({
                    questionId: s._id,
                    text: s.text,
                    correct: s.correct, // This should be a boolean
                    explanation: s.explanation,
                    difficulty: s.difficulty,
                    _id: s._id,
                  }))
                break
              case 'word_weaver':
                questions = gameData.word_weaver.questions
                  .slice(0, gameConfig.itemCount)
                  .map(q => ({
                    questionId: q._id,
                    blank: q.blank,
                    answer: q.answer,
                    wordLength:
                      q.wordLength || q.answer.replace(/\s+/g, '').length,
                    difficulty: q.difficulty,
                    _id: q._id,
                  }))
                break
              case 'connections':
                questions = [
                  {
                    questionId: new mongoose.Types.ObjectId(),
                    concepts: gameData.connections.concepts,
                    validConnections: gameData.connections.validConnections,
                    _id: new mongoose.Types.ObjectId(),
                  },
                ]
                break
            }

            if (questions.length === 0) continue

            // Start database transaction
            const session = await mongoose.startSession()
            session.startTransaction()

            try {
              // Create ArticleQuizSession
              const quizSession = new ArticleQuizSession({
                user: user._id,
                article: article._id,
                gameData: gameData._id,
                gameType: gameType,
                questions: questions,
                startTime: new Date(
                  currentDate.getTime() - Math.random() * 3600000,
                ), // Random start within hour
                endTime: currentDate,
                completed: true,
                language: userLanguage,
                responses: [], // Will be filled below
              })

              await quizSession.save({ session })

              // Generate bot skill level (between 0.3 and 0.8)
              const botSkillLevel = 0.3 + Math.random() * 0.5

              // Generate responses
              const { responses, correctCount } = generateBotResponses({
                gameType,
                questions,
                botSkillLevel,
              })

              // Update session with responses
              quizSession.responses = responses
              await quizSession.save({ session })

              // Calculate performance metrics
              const performance = calculateBotPerformance({
                responses,
                questions,
                gameType,
              })

              // Generate realistic time taken
              const baseTime = gameConfig.timeLimit || 50
              const skillTimeFactor = 1.5 - botSkillLevel // Higher skill = faster completion
              const timeTaken = Math.floor(
                (baseTime * 0.3 + Math.random() * baseTime * 0.6) *
                  skillTimeFactor,
              )

              // Calculate enhanced RQM score
              const rqmResult = calculateEnhancedRQM(
                gameType,
                performance,
                timeTaken,
                performance.totalItems,
                null, // No time dilation for bots
              )

              // Create enhanced QuizAttempt
              const newQuizAttempt = new QuizAttempt({
                user: user._id,
                article: article._id,
                articleQuizSession: quizSession._id,
                gameData: gameData._id,
                gameType: gameType,
                responses: responses,
                performance: performance,
                RQM_score: rqmResult.rqmScore,
                baseRQM_score: rqmResult.rqmScore, // No boosts for bots
                articleDifficulty: performance.difficulty,
                timeTaken: timeTaken,
                expectedTime: gameConfig.timeLimit,
                timeFactor: rqmResult.timeFactor,
                performanceBonus: rqmResult.performanceBonus,
                boost: 1, // No boosts for bots
                isBoosted: false,
                season: parseInt(configService.getCurrentSeason(), 10),
                month: moment().month() + 1,
                year: moment().year(),
                createdAt: currentDate,
              })

              await newQuizAttempt.save({ session })

              // Update user stats
              const userToUpdate = await User.findById(user._id).session(
                session,
              )
              userToUpdate.quizAttempts.push(newQuizAttempt._id)

              // Update difficulty counters
              if (performance.difficulty < 0.5) userToUpdate.easyQuizCount++
              else if (performance.difficulty < 0.7)
                userToUpdate.mediumQuizCount++
              else userToUpdate.hardQuizCount++

              userToUpdate.rankedInCurrentSeason = true

              // Update average RQM
              const currentAttemptCount = userToUpdate.quizAttempts.length
              let sumOfRQM = userToUpdate.avgRQM * (currentAttemptCount - 1)
              sumOfRQM += rqmResult.rqmScore
              userToUpdate.avgRQM = sumOfRQM / currentAttemptCount

              await userToUpdate.save({ session })

              // Update article attempt count
              article.quizAttemptCnt++
              await article.save({ session })

              await session.commitTransaction()
              session.endSession()
            } catch (error) {
              await session.abortTransaction()
              session.endSession()
              throw error
            }
          }
        } catch (err) {
          console.error(`Error processing bot user ${user._id}:`, err.message)
          // Continue with next user instead of stopping entire process
        }
      }

      console.log(`Completed bot simulation for ${currentDate.toDateString()}`)
    }

    console.log('GameHub bot simulation completed successfully!')
  } catch (err) {
    console.error('Error in updateBots:', err.message)
    console.error('Stack trace:', err.stack)
    throw err
  }
}

module.exports = {
  updateBots,
  generateBotResponses,
  calculateBotPerformance,
}
