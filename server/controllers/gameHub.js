// controllers/gameHub.js - ENHANCED: Added comprehensive retry logic
const GameData = require('../model/gameDataSchema')
const Article = require('../model/articleSchema')
const QuizAttempt = require('../model/quizAttemptSchema')
const ArticleQuizSession = require('../model/articleQuizSessionSchem')
const asyncHandler = require('express-async-handler')
const {
  generateEnhancedGameData,
  processGameDataWithDifficulties,
  generateNormalQuizData,
  generateTrueFalseData,
  generateWordWeaverData,
  generateConnectionsData,
  GAME_CONFIGS,
} = require('../utils/enhancedQuiz.utils')
const mongoose = require('mongoose')
const globalEmitter = require('../eventEmitter')
const {
  generateHindiWordWeaverUnits,
  containsHindi,
  validateHindiWordAnswer,
  getHindiDisplayLength,
} = require('../utils/hindiText.utils')
const {
  submitAbandonedGame,
  checkAbandonedAttempts,
  getAbandonmentMessage,
} = require('../services/abandonedGameService')

// ADDED: Import retry utilities
const { withRetry, makeRetryable } = require('../utils/retryUtils')

// ADDED: Custom error classifier for game operations
const isGameRetryableError = error => {
  // Network and connection errors
  if (error.name === 'NetworkError') return true
  if (error.name === 'TimeoutError') return true
  if (error.message.includes('network')) return true
  if (error.message.includes('timeout')) return true

  // MongoDB specific errors
  if (error.name === 'MongoNetworkError') return true
  if (error.name === 'MongoTimeoutError') return true
  if (error.errorLabels?.includes('TransientTransactionError')) return true
  if (error.errorLabels?.includes('RetryableWriteError')) return true
  if (error.code === 251) return true // NoSuchTransaction
  if (error.codeName === 'WriteConflict') return true

  // OpenAI API errors that might be temporary
  if (error.status === 429) return true // Rate limit
  if (error.status === 502) return true // Bad Gateway
  if (error.status === 503) return true // Service Unavailable
  if (error.status === 504) return true // Gateway Timeout
  if (error.code === 'ECONNRESET') return true
  if (error.code === 'ETIMEDOUT') return true

  // Game-specific retryable conditions
  if (error.message.includes('session not found') && error.temporary)
    return true
  if (error.message.includes('connection lost')) return true

  return false
}

// ADDED: Retry configuration for different operation types
const RETRY_CONFIGS = {
  database: {
    maxRetries: 3,
    initialDelay: 1000,
    backoffFactor: 2,
    isRetryable: isGameRetryableError,
    operationName: 'Database Operation',
  },
  gameGeneration: {
    maxRetries: 2,
    initialDelay: 2000,
    backoffFactor: 1.5,
    isRetryable: isGameRetryableError,
    operationName: 'Game Generation',
  },
  submission: {
    maxRetries: 4,
    initialDelay: 500,
    backoffFactor: 2,
    isRetryable: isGameRetryableError,
    operationName: 'Game Submission',
  },
  session: {
    maxRetries: 3,
    initialDelay: 800,
    backoffFactor: 1.8,
    isRetryable: isGameRetryableError,
    operationName: 'Session Management',
  },
}

// ADDED: Retryable helper functions
const retryableDatabaseOp = makeRetryable(async operation => {
  return await operation()
}, RETRY_CONFIGS.database)

const retryableGameGeneration = makeRetryable(async operation => {
  return await operation()
}, RETRY_CONFIGS.gameGeneration)

const retryableSessionOp = makeRetryable(async operation => {
  return await operation()
}, RETRY_CONFIGS.session)

// ADDED: Function to generate sanitized/dummy game data for security
const generateSanitizedGameData = gameData => {
  const sanitized = {}

  // Generate dummy normal quiz data
  if (gameData.normal_quiz?.questions?.length > 0) {
    const questionCount = gameData.normal_quiz.questions.length
    sanitized.normal_quiz = {
      questions: Array.from({ length: questionCount }, (_, index) => ({
        _id: `dummy_nq_${index + 1}`,
        question: `Sample multiple choice question ${index + 1}?`,
        options: {
          a: `Option A for question ${index + 1}`,
          b: `Option B for question ${index + 1}`,
          c: `Option C for question ${index + 1}`,
          d: `Option D for question ${index + 1}`,
        },
        // SECURE: No correct answer or explanation included
        difficulty: Math.round((0.3 + Math.random() * 0.4) * 100) / 100, // Random difficulty 0.3-0.7
      })),
      questionCount: questionCount,
      estimatedTime: Math.round(questionCount * 10), // 10 seconds per question estimate
    }
  }

  // Generate dummy true/false data
  if (gameData.true_false?.statements?.length > 0) {
    const statementCount = gameData.true_false.statements.length
    sanitized.true_false = {
      statements: Array.from({ length: statementCount }, (_, index) => ({
        _id: `dummy_tf_${index + 1}`,
        text: `Sample true or false statement number ${index + 1}.`,
        // SECURE: No correct answer or explanation included
        difficulty: Math.round((0.25 + Math.random() * 0.4) * 100) / 100, // Random difficulty 0.25-0.65
      })),
      statementCount: statementCount,
      estimatedTime: Math.round(statementCount * 5), // 5 seconds per statement estimate
    }
  }

  // Generate dummy word weaver data
  if (gameData.word_weaver?.questions?.length > 0) {
    const questionCount = gameData.word_weaver.questions.length
    const sampleBlanks = [
      'The quick brown fox jumps over the lazy _____.',
      'Sample sentence with a missing _____ to fill.',
      'Another example where you need to guess the _____.',
      'Practice sentence for word puzzle game _____.',
      'Fill in the blank to complete this _____.',
    ]

    sanitized.word_weaver = {
      questions: Array.from({ length: questionCount }, (_, index) => ({
        _id: `dummy_ww_${index + 1}`,
        blank: sampleBlanks[index % sampleBlanks.length],
        // SECURE: No actual answer included
        wordLength: 4 + Math.floor(Math.random() * 6), // Random length 4-9
        difficulty: Math.round((0.4 + Math.random() * 0.4) * 100) / 100, // Random difficulty 0.4-0.8
        estimatedSolveTime: 15 + Math.floor(Math.random() * 10), // 15-25 seconds estimate
      })),
      questionCount: questionCount,
      estimatedTime: Math.round(questionCount * 20), // 20 seconds per question estimate
    }
  }

  // Generate dummy connections data
  if (
    gameData.connections?.concepts?.length > 0 &&
    gameData.connections?.validConnections?.length > 0
  ) {
    const conceptCount = gameData.connections.concepts.length
    const sampleConcepts = [
      'Sample Concept A',
      'Sample Concept B',
      'Sample Concept C',
      'Sample Concept D',
      'Example Topic 1',
      'Example Topic 2',
      'Example Topic 3',
      'Example Topic 4',
    ]
    const validConnectionsCount = gameData.connections.validConnections.length

    sanitized.connections = {
      concepts: sampleConcepts.slice(0, conceptCount),
      validConnections: Array.from(
        { length: validConnectionsCount },
        (_, index) => ({
          _id: `dummy_conn_${index + 1}`,
          concept1: sampleConcepts[index % sampleConcepts.length],
          concept2: sampleConcepts[(index + 1) % sampleConcepts.length],
        }),
      ),
      conceptCount: conceptCount,
      // SECURE: No valid connections revealed
      maxConnections: Math.floor(conceptCount / 2), // Hint about max possible connections
      estimatedTime: 90, // 90 seconds estimate for connections game
      difficulty: Math.round((0.5 + Math.random() * 0.3) * 100) / 100, // Random difficulty 0.5-0.8
    }
  }

  // Add general game info (non-sensitive)
  sanitized.gameInfo = {
    availableGameTypes: Object.keys(sanitized),
    totalEstimatedTime: Object.values(sanitized).reduce((total, game) => {
      return total + (game.estimatedTime || 0)
    }, 0),
    language: gameData.language,
    createdAt: gameData.createdAt,
    isActive: gameData.isActive,
  }

  return sanitized
}

// ADDED: Enhanced session management with retry
const createSessionWithRetry = async ({
  userId,
  articleId,
  gameType,
  userLanguage,
}) => {
  return await withRetry(
    async () => {
      const session = await mongoose.startSession()
      session.startTransaction()

      try {
        // Get game data for user's language
        const gameData = await GameData.findOne({
          article: articleId,
          language: userLanguage,
          isActive: true,
        }).session(session)

        if (!gameData) {
          throw new Error(
            `Game data not found for ${
              userLanguage === 'en' ? 'English' : 'Hindi'
            } language`,
          )
        }

        // Check existing sessions
        let existingSession = await ArticleQuizSession.findOne({
          user: userId,
          article: articleId,
          gameType: gameType,
          completed: false,
        }).session(session)

        if (existingSession) {
          await session.abortTransaction()
          session.endSession()
          return {
            existingSession,
            timer: GAME_CONFIGS[gameType]?.timeLimit || 50,
          }
        }

        // Create questions based on game type
        let questions = []
        const timer = GAME_CONFIGS[gameType]?.timeLimit || 50

        switch (gameType) {
          case 'normal_quiz':
            questions = gameData.normal_quiz.questions.slice(0, 5).map(q => ({
              question: q.question,
              options: {
                a: { text: q.options.a, _id: new mongoose.Types.ObjectId() },
                b: { text: q.options.b, _id: new mongoose.Types.ObjectId() },
                c: { text: q.options.c, _id: new mongoose.Types.ObjectId() },
                d: { text: q.options.d, _id: new mongoose.Types.ObjectId() },
              },
              answer: q.correct,
              explanation: q.explanation,
              difficulty: q.difficulty,
              questionId: q._id,
            }))
            break

          case 'true_false':
            questions = gameData.true_false.statements.slice(0, 7).map(s => ({
              text: s.text,
              correct: s.correct,
              explanation: s.explanation,
              difficulty: s.difficulty,
              questionId: s._id,
            }))
            break

          case 'word_weaver':
            questions = gameData.word_weaver.questions.slice(0, 5).map(q => {
              const correctWordLength = q.answer
                ? q.answer.replace(/\s+/g, '').length
                : 6
              return {
                blank: q.blank,
                answer: q.answer,
                wordLength: correctWordLength,
                difficulty: q.difficulty,
                questionId: q._id,
              }
            })
            break

          case 'connections':
            questions = [
              {
                concepts: gameData.connections.concepts,
                validConnections: gameData.connections.validConnections,
                questionId: new mongoose.Types.ObjectId(),
              },
            ]
            break

          default:
            throw new Error('Invalid game type')
        }

        // Create new session
        const gameSession = new ArticleQuizSession({
          user: userId,
          article: articleId,
          gameData: gameData._id,
          gameType: gameType,
          questions: questions,
          startTime: null,
          endTime: null,
          completed: false,
          language: userLanguage,
          responses: [],
        })

        await gameSession.save({ session })
        await session.commitTransaction()
        session.endSession()

        return { newSession: gameSession, timer }
      } catch (error) {
        await session.abortTransaction()
        session.endSession()
        throw error
      }
    },
    {
      ...RETRY_CONFIGS.session,
      onRetry: (error, attempt) => {
        console.warn(`Session creation retry ${attempt}: ${error.message}`)
      },
      onAllRetriesFailed: async (error, params) => {
        console.error(
          `Session creation failed after all retries for user ${params.userId}, article ${params.articleId}:`,
          error,
        )
      },
      operationParams: { userId, articleId, gameType, userLanguage },
    },
  )
}

// @desc   Get game data for an article with retry logic, timer information, and RQM boost detection
// @route  GET /api/gamehub/data/:articleId
// @access Private
const getGameData = asyncHandler(async (req, res) => {
  const { articleId } = req.params
  const userId = req.user._id

  try {
    if (!articleId || articleId === 'undefined') {
      throw new Error('No article provided')
    }

    const result = await withRetry(
      async () => {
        let session = await mongoose.startSession()
        session.startTransaction()

        try {
          // Get user's language preference
          const User = require('../model/userSchema')
          const user = await User.findById(userId)
            .select('userLanguage')
            .session(session)
          const userLanguage = user?.userLanguage || 'en'

          const article = await Article.findById(articleId).session(session)
          if (!article) {
            throw new Error('Article not found')
          }

          // Check if game data already exists
          let gameData = await GameData.findOne({
            article: articleId,
            language: userLanguage,
            isActive: true,
          }).session(session)

          if (!gameData) {
            // Generate new game data with retry
            const {
              title,
              author,
              mainText,
              hindiTitle,
              hindiAuthor,
              hindiMainText,
            } = article

            // Validate content availability
            if (
              (userLanguage === 'en' && (!title || !mainText || !author)) ||
              (userLanguage === 'hi' &&
                (!hindiTitle || !hindiMainText || !hindiAuthor))
            ) {
              throw new Error(
                `Game data cannot be generated for this article in ${
                  userLanguage === 'en' ? 'English' : 'Hindi'
                } language. Content is not available.`,
              )
            }

            gameData = await retryableGameGeneration(async () => {
              return await generateEnhancedGameData({
                title: userLanguage === 'en' ? title : hindiTitle,
                author: userLanguage === 'en' ? author : hindiAuthor,
                mainText: userLanguage === 'en' ? mainText : hindiMainText,
                articleId,
                article,
                session,
                language: userLanguage,
              })
            })
          }

          // Enhanced ability checking with proper boost calculation
          const Inventory = require('../model/inventorySchema')
          const { calculateTotalEffect } = require('../services/abilityService')
          const {
            isCategoryBoost,
            getCategoryFromBoost,
          } = require('../services/abilityServices/tournamentAbilityService')

          const inventory = await Inventory.findOne({ user: userId })
            .populate('abilities.abilityId')
            .session(session)

          let hasTimeDilationAvailable = false
          let timeDilationAdditionalTime = 0
          let activeRQMBoosts = []
          let totalRQMMultiplier = 1
          let availableRQMBoosts = []

          if (inventory) {
            // Check for Time Dilation availability (not active, just available)
            const timeDilationAbility = inventory.abilities.find(
              ability =>
                ability.abilityId?.name === 'TimeDilation' &&
                !ability.isUsed &&
                ability.isActive &&
                (ability.expiresAt > new Date() || ability.expiresAt === null),
            )

            if (timeDilationAbility) {
              hasTimeDilationAvailable = true
              timeDilationAdditionalTime =
                timeDilationAbility.abilityId?.additionalTime || 30
            }

            // Get active boost abilities (using same logic as quizAttemptService)
            const activeBoostAbilities = inventory.abilities
              .filter(ability => {
                // Basic active ability checks
                const isActive =
                  ability.isActive &&
                  ability.abilityId?.type === 'BOOST' &&
                  (ability.expiresAt > new Date() || ability.expiresAt === null)

                if (!isActive) return false

                // Handle category boosts - check if category matches article category
                if (isCategoryBoost(ability.abilityId.name)) {
                  const boostCategory = getCategoryFromBoost(
                    ability.abilityId.name,
                  )
                  return (
                    boostCategory.toLowerCase() ===
                    article.category.toLowerCase()
                  )
                }

                // Include all other types of boosts
                return true
              })
              .map(ability => ({
                id: ability.abilityId._id,
                name: ability.abilityId.name,
                type: ability.abilityId.type,
                multiplier: ability.abilityId.multiplier,
                duration: ability.abilityId.duration,
                expiresAt: ability.expiresAt,
                acquiredAt: ability.acquiredAt,
                quantity: ability.quantity || 1,
                description: ability.abilityId.description,
                category: isCategoryBoost(ability.abilityId.name)
                  ? getCategoryFromBoost(ability.abilityId.name)
                  : null,
              }))

            // Calculate total effect using the same logic as quizAttemptService
            const effects = calculateTotalEffect(activeBoostAbilities, 'BOOST')
            totalRQMMultiplier = effects?.multiplier || 1

            // Process active boosts for display
            activeBoostAbilities.forEach(ability => {
              const abilityData = ability
              const multiplier = abilityData.multiplier || 1

              // Determine boost type for UI
              let boostType = 'general'
              let categoryName = null
              let iconType = 'boost'

              if (abilityData.name.includes('QuinBoost')) {
                boostType = 'quinboost'
                iconType = 'crown'
              } else if (abilityData.name.includes('QuizBoost')) {
                boostType = 'quiz'
                iconType = 'trending'
              } else if (abilityData.name.includes('StreakSurge')) {
                boostType = 'streak'
                iconType = 'flame'
              } else if (isCategoryBoost(abilityData.name)) {
                boostType = 'category'
                categoryName = getCategoryFromBoost(abilityData.name)
                iconType = 'award'
              }

              activeRQMBoosts.push({
                id: ability.id,
                name: abilityData.name,
                type: boostType,
                iconType: iconType,
                category: categoryName,
                multiplier: multiplier,
                description: abilityData.description,
                expiresAt: abilityData.expiresAt,
                quantity: abilityData.quantity,
                isActive: true,
              })
            })

            // Get available (not active) boost abilities for display
            const availableBoostAbilities = inventory.abilities
              .filter(ability => {
                return (
                  !ability.isActive &&
                  !ability.isUsed &&
                  ability.abilityId?.type === 'BOOST' &&
                  (ability.expiresAt > new Date() || ability.expiresAt === null)
                )
              })
              .map(ability => {
                const abilityData = ability.abilityId
                let boostType = 'general'
                let categoryName = null
                let iconType = 'boost'

                if (abilityData.name.includes('QuinBoost')) {
                  boostType = 'quinboost'
                  iconType = 'crown'
                } else if (abilityData.name.includes('QuizBoost')) {
                  boostType = 'quiz'
                  iconType = 'trending'
                } else if (abilityData.name.includes('StreakSurge')) {
                  boostType = 'streak'
                  iconType = 'flame'
                } else if (isCategoryBoost(abilityData.name)) {
                  boostType = 'category'
                  categoryName = getCategoryFromBoost(abilityData.name)
                  iconType = 'award'
                }

                return {
                  id: ability._id,
                  name: abilityData.name,
                  type: boostType,
                  iconType: iconType,
                  category: categoryName,
                  multiplier: abilityData.multiplier || 1,
                  description: abilityData.description,
                  expiresAt: ability.expiresAt,
                  quantity: ability.quantity || 1,
                  isActive: false,
                }
              })

            availableRQMBoosts = availableBoostAbilities
          }

          await session.commitTransaction()
          session.endSession()

          return {
            gameData,
            userLanguage,
            hasTimeDilationAvailable,
            timeDilationAdditionalTime,
            activeRQMBoosts,
            availableRQMBoosts,
            totalRQMMultiplier,
            articleCategory: article.category,
          }
        } catch (error) {
          await session.abortTransaction()
          session.endSession()
          throw error
        }
      },
      {
        ...RETRY_CONFIGS.database,
        onRetry: (error, attempt) => {
          console.warn(
            `Game data retrieval retry ${attempt} for article ${articleId}:`,
            error.message,
          )
        },
        onAllRetriesFailed: async error => {
          console.error(
            `Game data retrieval failed after all retries for article ${articleId}:`,
            error,
          )
        },
      },
    )

    // SECURITY: Generate sanitized/dummy data instead of actual game content
    const sanitizedGameData = generateSanitizedGameData(result.gameData)

    // Enhanced timer information for each game type with time dilation support
    const gameTimers = {
      normal_quiz: {
        baseTime: GAME_CONFIGS.normal_quiz?.timeLimit || 50,
        enhancedTime: result.hasTimeDilationAvailable
          ? (GAME_CONFIGS.normal_quiz?.timeLimit || 50) +
            result.timeDilationAdditionalTime
          : GAME_CONFIGS.normal_quiz?.timeLimit || 50,
        additionalTime: result.hasTimeDilationAvailable
          ? result.timeDilationAdditionalTime
          : 0,
      },
      true_false: {
        baseTime: GAME_CONFIGS.true_false?.timeLimit || 35,
        enhancedTime: result.hasTimeDilationAvailable
          ? (GAME_CONFIGS.true_false?.timeLimit || 35) +
            result.timeDilationAdditionalTime
          : GAME_CONFIGS.true_false?.timeLimit || 35,
        additionalTime: result.hasTimeDilationAvailable
          ? result.timeDilationAdditionalTime
          : 0,
      },
      word_weaver: {
        baseTime: GAME_CONFIGS.word_weaver?.timeLimit || 100,
        enhancedTime: result.hasTimeDilationAvailable
          ? (GAME_CONFIGS.word_weaver?.timeLimit || 100) +
            result.timeDilationAdditionalTime
          : GAME_CONFIGS.word_weaver?.timeLimit || 100,
        additionalTime: result.hasTimeDilationAvailable
          ? result.timeDilationAdditionalTime
          : 0,
      },
      connections: {
        baseTime: GAME_CONFIGS.connections?.timeLimit || 72,
        enhancedTime: result.hasTimeDilationAvailable
          ? (GAME_CONFIGS.connections?.timeLimit || 72) +
            result.timeDilationAdditionalTime
          : GAME_CONFIGS.connections?.timeLimit || 72,
        additionalTime: result.hasTimeDilationAvailable
          ? result.timeDilationAdditionalTime
          : 0,
      },
    }

    res.status(200).json({
      message: 'Game data retrieved successfully',
      gameData: {
        _id: result.gameData._id,
        title: result.gameData.title,
        description: result.gameData.description,
        category: result.gameData.category,
        language: result.gameData.language,
        ...sanitizedGameData,
      },
      gameTimers: gameTimers,
      hasTimeDilationAvailable: result.hasTimeDilationAvailable,
      timeDilationAdditionalTime: result.timeDilationAdditionalTime,
      // Enhanced RQM boost information
      activeRQMBoosts: result.activeRQMBoosts,
      availableRQMBoosts: result.availableRQMBoosts,
      totalRQMMultiplier: result.totalRQMMultiplier,
      hasActiveBoosts: result.activeRQMBoosts.length > 0,
      hasAvailableBoosts: result.availableRQMBoosts.length > 0,
      articleCategory: result.articleCategory,
      status: 'ready',
      userLanguage: result.userLanguage,
    })
  } catch (error) {
    console.error('Error in getGameData:', error)
    // SECURITY: Don't expose detailed error information that might reveal game structure
    const safeErrorMessage =
      error.message?.includes('language') ||
      error.message?.includes('Article not found')
        ? error.message
        : 'Something went wrong! Please try again'

    res.status(400).json({
      error: safeErrorMessage,
    })
  }
})

// @desc   Create a new game session with comprehensive retry logic
// @route  POST /api/gamehub/session/create
// @access Private
const createGameSession = asyncHandler(async (req, res) => {
  const { articleId, gameType } = req.body
  const userId = req.user._id

  try {
    // Get user's language preference with retry
    const User = require('../model/userSchema')
    const user = await retryableDatabaseOp(async () => {
      return await User.findById(userId).select('userLanguage')
    })
    const userLanguage = user?.userLanguage || 'en'

    // Create session with comprehensive retry logic
    const result = await createSessionWithRetry({
      userId,
      articleId,
      gameType,
      userLanguage,
    })

    if (result.existingSession) {
      return res.status(200).json({
        message: 'Existing session found for this game type',
        sessionId: result.existingSession._id,
        timer: result.timer,
        status: 'ready',
        language: userLanguage,
      })
    }

    console.log(
      `Game session created with retry: ${gameType}, Timer: ${result.timer}s, Language: ${userLanguage}`,
    )

    res.status(200).json({
      message: 'Game session created successfully',
      sessionId: result.newSession._id,
      timer: result.timer,
      gameType: gameType,
      totalQuestions: result.newSession.questions.length,
      status: 'ready',
      language: userLanguage,
    })
  } catch (error) {
    console.error('Error creating game session:', error)
    res.status(400).json({
      error: 'Failed to create game session',
      details: error.message,
    })
  }
})

// @desc   Start a game session with retry logic and time dilation support
// @route  POST /api/gamehub/session/start/:sessionId
// @access Private
const startGameSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.params
  const { onBoarding = false } = req.query
  const userId = req.user._id

  try {
    const result = await withRetry(
      async () => {
        const gameSession = await ArticleQuizSession.findOne({
          _id: sessionId,
          user: userId,
        })

        if (!gameSession) {
          const error = new Error('Game session not found')
          error.temporary = true // Mark as potentially temporary for retry
          throw error
        }

        if (gameSession.completed) {
          throw new Error('Game session already completed')
        }

        if (gameSession.startTime) {
          throw new Error('Game already started')
        }

        // Get base timer from game configuration
        const baseTimer = GAME_CONFIGS[gameSession.gameType]?.timeLimit || 50

        // NEW: Check for active time dilation ability
        let enhancedTimer = baseTimer
        let activeTimeDilation = null

        const Inventory = require('../model/inventorySchema')
        const inventory = await Inventory.findOne({ user: userId }).populate(
          'abilities.abilityId',
        )

        if (inventory) {
          activeTimeDilation = inventory.abilities.find(
            ability =>
              ability.isActive &&
              ability.abilityId?.name === 'TimeDilation' &&
              (ability.expiresAt > new Date() || ability.expiresAt === null),
          )

          // If time dilation is active, add additional time
          if (
            activeTimeDilation &&
            activeTimeDilation.abilityId?.additionalTime
          ) {
            const additionalTime = activeTimeDilation.abilityId.additionalTime
            enhancedTimer = baseTimer + additionalTime
          }
        }

        // Set start and end times only if not onboarding
        if (!onBoarding || onBoarding === 'false') {
          gameSession.startTime = new Date()
          // Use enhanced timer for end time calculation
          gameSession.endTime = new Date(Date.now() + enhancedTimer * 1000)
        }

        await gameSession.save()

        return {
          gameSession,
          timer: enhancedTimer, // Return enhanced timer
          baseTimer, // Also return base timer for reference
          activeTimeDilation: !!activeTimeDilation, // Boolean flag
          additionalTime: activeTimeDilation?.abilityId?.additionalTime || 0,
        }
      },
      {
        ...RETRY_CONFIGS.session,
        onRetry: (error, attempt) => {
          console.warn(
            `Game session start retry ${attempt} for session ${sessionId}:`,
            error.message,
          )
        },
      },
    )

    // Process session data for secure response (existing logic)
    const gameSession = result.gameSession
    const timer = result.timer
    const baseTimer = result.baseTimer
    const activeTimeDilation = result.activeTimeDilation
    const additionalTime = result.additionalTime

    // Helper function to safely extract text from option objects
    const getOptionText = option => {
      if (typeof option === 'string') return option
      if (typeof option === 'object' && option?.text) return option.text
      return String(option || '')
    }

    // Prepare session data for response - SEND ALL QUESTIONS WITHOUT SENSITIVE DATA
    let resultGameSession = gameSession.toObject()

    // SECURE: Clean and transform ALL questions based on game type - NO ANSWERS SENT
    switch (gameSession.gameType) {
      case 'normal_quiz':
        resultGameSession.questions = gameSession.questions.map((q, index) => {
          return {
            question: q.question,
            options: {
              a: getOptionText(q.options?.a),
              b: getOptionText(q.options?.b),
              c: getOptionText(q.options?.c),
              d: getOptionText(q.options?.d),
            },
            questionId: q.questionId,
            _id: q._id,
            difficulty: q.difficulty,
            // SECURE: answer field NOT sent to frontend
          }
        })
        break

      case 'true_false':
        resultGameSession.questions = gameSession.questions.map((q, index) => {
          return {
            text: q.text,
            questionId: q.questionId,
            _id: q._id,
            difficulty: q.difficulty,
            // SECURE: correct field NOT sent to frontend
          }
        })
        break

      case 'word_weaver':
        resultGameSession.questions = gameSession.questions.map((q, index) => {
          let shuffledUnits = []
          let wordLength = 6 // default fallback
          let isHindiWord = false

          // Generate shuffled units from the answer
          if (q.answer && typeof q.answer === 'string') {
            const cleanAnswer = q.answer.replace(/\s+/g, '').trim()
            isHindiWord = containsHindi(cleanAnswer)

            if (isHindiWord) {
              // Handle Hindi words using proper segmentation with EXTRA UNITS for confusion
              try {
                const hindiData = generateHindiWordWeaverUnits(cleanAnswer, {
                  addExtraUnits: true, // CHANGED: Enable extra units for Hindi
                  extraUnitsCount: 3, // CHANGED: Add 3 extra confusing units
                  language: 'hi',
                })

                shuffledUnits = hindiData.shuffledUnits
                wordLength = hindiData.wordLength
              } catch (error) {
                console.error(
                  `Error generating Hindi units for question ${index + 1}:`,
                  error.message,
                )
                // Fallback to character-based approach for Hindi
                wordLength = cleanAnswer.length
                shuffledUnits = cleanAnswer
                  .split('')
                  .sort(() => Math.random() - 0.5)
              }
            } else {
              // Handle English words using existing character-based logic
              const cleanWord = cleanAnswer.toUpperCase()
              const wordLetters = cleanWord.split('')
              wordLength = cleanWord.length

              // Add extra letters for English (existing logic)
              const extraLetters = [
                'K',
                'V',
                'X',
                'Z',
                'Q',
                'J',
                'W',
                'Y',
                'H',
                'B',
                'C',
                'P',
              ]
              const availableExtraLetters = extraLetters.filter(
                letter => !wordLetters.includes(letter),
              )

              const selectedExtraLetters = []
              let extraCount = 0 // No extra letters for now, matching existing logic

              for (let i = 0; i < extraCount; i++) {
                if (availableExtraLetters.length > 0) {
                  const randomIndex = Math.floor(
                    Math.random() * availableExtraLetters.length,
                  )
                  const selectedLetter = availableExtraLetters.splice(
                    randomIndex,
                    1,
                  )[0]
                  selectedExtraLetters.push(selectedLetter)
                }
              }

              // Combine word letters with extra letters and shuffle
              const allLetters = [...wordLetters, ...selectedExtraLetters]
              shuffledUnits = allLetters.sort(() => Math.random() - 0.5)
            }
          } else {
            // Emergency fallback
            console.warn(
              `No answer found for word weaver question ${
                index + 1
              }, using fallback`,
            )
            wordLength = q.wordLength || 6

            if (isHindiWord) {
              // Hindi fallback
              const fallbackHindiUnits = [
                'क',
                'र',
                'त',
                'म',
                'न',
                'ल',
                'स',
                'द',
                'प',
                'व',
              ]
              shuffledUnits = fallbackHindiUnits
                .slice(0, Math.max(wordLength, 6))
                .sort(() => Math.random() - 0.5)
            } else {
              // English fallback
              const fallbackLetters = [
                'A',
                'E',
                'I',
                'O',
                'U',
                'R',
                'T',
                'N',
                'S',
                'L',
                'C',
                'D',
                'M',
                'P',
              ]
              shuffledUnits = fallbackLetters
                .slice(0, Math.max(wordLength, 6))
                .sort(() => Math.random() - 0.5)
            }
          }

          return {
            blank: q.blank,
            shuffledUnits: shuffledUnits, // Updated field name to be more generic
            wordLength: wordLength,
            questionId: q.questionId,
            _id: q._id,
            difficulty: q.difficulty,
            isHindiWord: isHindiWord, // Add language info for frontend
            // SECURE: answer field NOT sent to frontend
          }
        })
        break

      case 'connections':
        // Send the single connections question (usually just one question with multiple concepts)
        resultGameSession.questions = gameSession.questions.map((q, index) => {
          return {
            concepts: q.concepts,
            questionId: q.questionId,
            _id: q._id,
            // SECURE: validConnections NOT sent to frontend
          }
        })
        break

      default:
        // Fallback: remove ALL sensitive fields from all questions
        resultGameSession.questions = gameSession.questions.map((q, index) => {
          const safeQuestion = { ...q.toObject() }
          // Remove all answer-related fields
          delete safeQuestion.answer
          delete safeQuestion.correct
          delete safeQuestion.explanation
          delete safeQuestion.validConnections
          // UPDATED: Remove context field
          delete safeQuestion.context

          // Clean options if they exist
          if (safeQuestion.options) {
            safeQuestion.options = {
              a: getOptionText(safeQuestion.options.a),
              b: getOptionText(safeQuestion.options.b),
              c: getOptionText(safeQuestion.options.c),
              d: getOptionText(safeQuestion.options.d),
            }
          }

          return safeQuestion
        })
    }

    // Remove sensitive fields from the session object
    delete resultGameSession.overAllDifficulty
    delete resultGameSession.RQM_score
    delete resultGameSession.timeTaken

    // Enhanced response with detailed timer information including time dilation data
    const response = {
      message: 'Game started successfully',
      startTime: gameSession.startTime,
      endTime: gameSession.endTime,
      gameSession: resultGameSession,
      timer: timer, // Enhanced timer with time dilation
      baseTimer: baseTimer, // Original base timer
      gameType: gameSession.gameType,
      totalQuestions: gameSession.questions.length,
      timePerQuestion: Math.round(timer / gameSession.questions.length),
      gameConfig: {
        timeLimit: timer, // Use enhanced timer
        baseTimeLimit: baseTimer, // Include base timer for reference
        itemCount:
          GAME_CONFIGS[gameSession.gameType]?.itemCount ||
          gameSession.questions.length,
        difficulty:
          GAME_CONFIGS[gameSession.gameType]?.difficultyMultiplier || 1.0,
      },
      // NEW: Time dilation information
      timeDilation: {
        isActive: activeTimeDilation,
        additionalTime: additionalTime,
        enhancedTimer: timer,
        baseTimer: baseTimer,
      },
    }

    res.status(200).json(response)
  } catch (error) {
    console.error('Error starting game session:', error)
    res.status(400).json({
      error: 'Something went wrong! Please try again',
      details: error.message,
    })
  }
})

// @desc   Submit game attempt with COMPREHENSIVE RETRY logic
// @route  POST /api/gamehub/attempt
// @access Private
const submitGameAttempt = asyncHandler(async (req, res) => {
  const { sessionId, userResponses, timeTaken } = req.body
  const userId = req.user._id

  // Updated emitProgress function to use correct event name for games
  const emitProgress = (stepId, progress) => {
    globalEmitter.emit('game_submission_progress', { userId, stepId, progress })
  }

  try {
    // ENHANCED: Submit game attempt with comprehensive retry logic
    const result = await withRetry(
      async () => {
        let session = await mongoose.startSession()
        session.startTransaction()

        try {
          emitProgress('initializeCalculation', 50)

          const gameSession = await ArticleQuizSession.findOne({
            _id: sessionId,
            user: userId,
          })
            .populate('gameData')
            .session(session)

          if (!gameSession) {
            const error = new Error('Game session not found')
            error.temporary = true // Mark as potentially temporary for retry
            throw error
          }

          if (gameSession.completed) {
            throw new Error('Game session already completed')
          }

          emitProgress('initializeCalculation', 100)
          emitProgress('calculateRQM', 25)

          // SECURE: Process responses based on game type - validate answers on backend
          let processedResponses = []

          switch (gameSession.gameType) {
            case 'normal_quiz':
              processedResponses = gameSession.questions.map(
                (question, index) => ({
                  questionId: question.questionId || question._id,
                  userAnswer: userResponses[index],
                  isCorrect: userResponses[index] === question.answer, // Validate on backend
                }),
              )
              break

            case 'true_false':
              processedResponses = gameSession.questions.map(
                (question, index) => {
                  const userAnswer = userResponses[index]
                  const isCorrect = userAnswer === question.correct // Validate on backend
                  return {
                    questionId: question.questionId || question._id,
                    userAnswer: userAnswer,
                    isCorrect: isCorrect,
                  }
                },
              )
              break

            case 'word_weaver':
              processedResponses = gameSession.questions.map(
                (question, index) => {
                  const response = userResponses[index]
                  let userWord = ''

                  // Handle different response formats from frontend with FIXED nested object handling
                  if (typeof response === 'string') {
                    userWord = response
                  } else if (
                    typeof response === 'object' &&
                    response !== null
                  ) {
                    // Handle nested structure: response.answer.answer
                    if (
                      response.answer &&
                      typeof response.answer === 'object' &&
                      response.answer.answer !== undefined
                    ) {
                      userWord = response.answer.answer // Extract the actual string from nested object
                    } else if (typeof response.answer === 'string') {
                      userWord = response.answer // Direct string answer
                    } else {
                      userWord = response.userWord || '' // Fallback
                    }
                  }

                  // Ensure userWord is a string before processing
                  if (typeof userWord !== 'string') {
                    console.warn(
                      `userWord is not a string for question ${index}:`,
                      {
                        userWord,
                        type: typeof userWord,
                      },
                    )
                    userWord = String(userWord || '')
                  }

                  // SECURE: Validate answer on backend using stored correct answer
                  const correctAnswer = question.answer || ''
                  let isCorrect = false

                  if (
                    userWord &&
                    correctAnswer &&
                    typeof userWord === 'string'
                  ) {
                    // Check if this is a Hindi word
                    const isHindiWord = containsHindi(correctAnswer)

                    if (isHindiWord) {
                      // Use Hindi-specific validation
                      isCorrect = validateHindiWordAnswer(
                        userWord,
                        correctAnswer,
                      )
                    } else {
                      // Use existing English validation (case-insensitive comparison)
                      const normalizedUserWord = userWord
                        .replace(/[^A-Za-z]/g, '')
                        .toUpperCase()
                      const normalizedCorrectAnswer = correctAnswer
                        .replace(/[^A-Za-z]/g, '')
                        .toUpperCase()
                      isCorrect = normalizedUserWord === normalizedCorrectAnswer
                    }
                  } else {
                    console.log('Skipping validation (empty answer):', {
                      questionIndex: index,
                      userWord,
                      correctAnswer,
                      isEmpty: !userWord,
                    })
                  }

                  return {
                    questionId: question.questionId || question._id,
                    userWord: userWord,
                    isCorrect: isCorrect,
                    language: containsHindi(correctAnswer) ? 'hi' : 'en', // Add language info
                    // No skip field needed - empty answers are just worth 0 points
                  }
                },
              )
              break

            case 'connections':
              // Validate connection count limit (maximum 4 connections)
              if (!Array.isArray(userResponses)) {
                throw new Error('Invalid connections data format')
              }

              // Enforce maximum 4 connections limit
              const MAX_CONNECTIONS = 4
              if (userResponses.length > MAX_CONNECTIONS) {
                throw new Error(
                  `Too many connections submitted. Maximum allowed: ${MAX_CONNECTIONS}, received: ${userResponses.length}`,
                )
              }

              // Validate that all connections have required fields
              const invalidConnections = userResponses.filter(
                conn => !conn.from || !conn.to || conn.from === conn.to,
              )

              if (invalidConnections.length > 0) {
                throw new Error(
                  'Invalid connection data: connections must have different "from" and "to" values',
                )
              }

              // Check for duplicate connections (same pair in different order)
              const normalizedConnections = userResponses.map(conn => {
                // Sort to normalize connection pairs (A->B same as B->A)
                const sorted = [conn.from, conn.to].sort()
                return { from: sorted[0], to: sorted[1], original: conn }
              })

              const uniqueConnections = new Set()
              const duplicateConnections = []

              normalizedConnections.forEach(({ from, to, original }) => {
                const connectionKey = `${from}-${to}`
                if (uniqueConnections.has(connectionKey)) {
                  duplicateConnections.push(original)
                } else {
                  uniqueConnections.add(connectionKey)
                }
              })

              if (duplicateConnections.length > 0) {
                throw new Error(
                  'Duplicate connections detected. Each connection can only be made once.',
                )
              }

              // Validate that each node appears in at most one connection (Node Locking for 8 nodes)
              const usedNodes = new Set()
              const nodeConflicts = []

              userResponses.forEach((conn, index) => {
                // Check if either node is already used
                if (usedNodes.has(conn.from)) {
                  nodeConflicts.push({
                    connection: index + 1,
                    node: conn.from,
                    type: 'from',
                  })
                }
                if (usedNodes.has(conn.to)) {
                  nodeConflicts.push({
                    connection: index + 1,
                    node: conn.to,
                    type: 'to',
                  })
                }

                // Add nodes to used set
                usedNodes.add(conn.from)
                usedNodes.add(conn.to)
              })

              if (nodeConflicts.length > 0) {
                const conflictDetails = nodeConflicts
                  .map(
                    conflict =>
                      `"${conflict.node}" in connection ${conflict.connection}`,
                  )
                  .join(', ')

                throw new Error(
                  `Node reuse detected: Each node can only be used in one connection. ` +
                    `Conflicts found: ${conflictDetails}. Please ensure each node appears only once.`,
                )
              }

              // Additional validation - with 8 nodes and max 4 connections, exactly 8 nodes should be used
              const expectedNodesUsed = Math.min(userResponses.length * 2, 8)
              const actualNodesUsed = usedNodes.size

              if (actualNodesUsed !== expectedNodesUsed) {
                console.warn('Unexpected node usage:', {
                  expected: expectedNodesUsed,
                  actual: actualNodesUsed,
                  connections: userResponses.length,
                  usedNodes: Array.from(usedNodes),
                })
              }

              // Validate nodes exist in the game's concept list (8 concepts)
              const validConcepts = new Set(
                gameSession.questions[0].concepts || [],
              )
              const invalidNodes = Array.from(usedNodes).filter(
                node => !validConcepts.has(node),
              )

              if (invalidNodes.length > 0) {
                throw new Error(
                  `Invalid nodes detected: ${invalidNodes.join(', ')}. ` +
                    `Nodes must be from the provided concept list.`,
                )
              }

              // SECURE: Validate connections on backend using stored validConnections
              processedResponses = [
                {
                  questionId:
                    gameSession.questions[0].questionId ||
                    gameSession.questions[0]._id,
                  connections: userResponses.map(connection => {
                    // Validate each connection against stored validConnections
                    const isValid =
                      gameSession.questions[0].validConnections.some(
                        vc =>
                          (vc.from === connection.from &&
                            vc.to === connection.to) ||
                          (vc.from === connection.to &&
                            vc.to === connection.from),
                      )

                    return {
                      from: connection.from,
                      to: connection.to,
                      isValid,
                    }
                  }),
                },
              ]

              // Enhanced validation summary for debugging
              const validConnectionCount =
                processedResponses[0].connections.filter(
                  conn => conn.isValid,
                ).length

              break

            default:
              throw new Error('Invalid game type')
          }

          emitProgress('calculateRQM', 75)

          // Update game session first with retry
          await retryableDatabaseOp(async () => {
            gameSession.responses = processedResponses
            gameSession.completed = true
            gameSession.endTime = new Date()
            return await gameSession.save({ session })
          })

          emitProgress('calculateRQM', 100)
          emitProgress('saveAttempt', 25)

          // Use the comprehensive stats function for ALL game types with retry
          const {
            saveEnhancedQuizAttemptWithStats,
          } = require('../services/quizAttemptService')

          const quizAttemptResult = await withRetry(
            async () => {
              return await saveEnhancedQuizAttemptWithStats(
                userId,
                gameSession.article,
                processedResponses,
                gameSession.questions,
                timeTaken,
                sessionId,
                gameSession,
                session,
                emitProgress,
                gameSession.gameType,
              )
            },
            {
              maxRetries: 2,
              initialDelay: 1000,
              isRetryable: isGameRetryableError,
              operationName: 'Quiz Attempt Stats Calculation',
            },
          )

          emitProgress('saveAttempt', 100)

          await session.commitTransaction()
          session.endSession()

          emitProgress('finalizeAttempt', 100)

          return quizAttemptResult
        } catch (error) {
          await session.abortTransaction()
          session.endSession()
          throw error
        }
      },
      {
        ...RETRY_CONFIGS.submission,
        onRetry: (error, attempt) => {
          console.warn(
            `Game submission retry ${attempt} for session ${sessionId}:`,
            error.message,
          )
          emitProgress('retrying', attempt * 25)
        },
        onAllRetriesFailed: async (error, params) => {
          console.error(
            `Game submission failed after all retries for session ${sessionId}:`,
            error,
          )
          emitProgress('failed', 100)
        },
        operationParams: { sessionId, userId, gameType: req.body.gameType },
      },
    )

    // Return the comprehensive result for all game types
    return res.status(201).json(result)
  } catch (error) {
    console.error('Error in submitGameAttempt:', error)
    res.status(500).json({
      error: error.message || 'Unable to save attempt. Please try again.',
      details: error.message,
    })
  }
})

// @desc   Submit abandoned game attempt with retry
// @route  POST /api/gamehub/abandon
// @access Private
const submitAbandonedGameAttempt = asyncHandler(async (req, res) => {
  const { sessionId, reason = 'unknown' } = req.body
  const userId = req.user._id

  try {
    const result = await withRetry(
      async () => {
        let session = await mongoose.startSession()
        session.startTransaction()

        try {
          if (!sessionId) {
            throw new Error('Session ID is required')
          }

          const result = await submitAbandonedGame({
            userId,
            sessionId,
            reason,
            session,
          })

          await session.commitTransaction()
          session.endSession()

          return result
        } catch (error) {
          await session.abortTransaction()
          session.endSession()
          throw error
        }
      },
      {
        ...RETRY_CONFIGS.database,
        onRetry: (error, attempt) => {
          console.warn(
            `Abandoned game submission retry ${attempt} for session ${sessionId}:`,
            error.message,
          )
        },
      },
    )

    // Get user-friendly message
    const abandonmentMessage = getAbandonmentMessage(
      result.abandonedAttempt?.abandonedReason || reason,
      result.gameType,
    )

    res.status(200).json({
      success: true,
      message: result.message,
      abandonmentInfo: {
        ...abandonmentMessage,
        gameType: result.gameType,
        abandonedAt: result.abandonedAt,
        sessionId: sessionId,
      },
      alreadyAbandoned: result.alreadyAbandoned,
      // Don't send the full attempt data to frontend for security
    })
  } catch (error) {
    console.error('Error submitting abandoned game:', error)
    res.status(400).json({
      error: error.message || 'Failed to process abandoned game',
      details: error.message,
    })
  }
})

// @desc   Check abandoned attempts for an article with retry
// @route  GET /api/gamehub/abandoned/:articleId
// @access Private
const getAbandonedAttempts = asyncHandler(async (req, res) => {
  const { articleId } = req.params
  const userId = req.user._id

  try {
    const abandonedInfo = await retryableDatabaseOp(async () => {
      return await checkAbandonedAttempts(userId, articleId)
    })

    res.status(200).json({
      success: true,
      ...abandonedInfo,
    })
  } catch (error) {
    console.error('Error checking abandoned attempts:', error)
    res.status(500).json({
      error: 'Failed to check abandoned attempts',
      details: error.message,
    })
  }
})

// @desc   Get game session status with abandonment check and retry
// @route  GET /api/gamehub/session/status/:sessionId
// @access Private
const getGameSessionStatus = asyncHandler(async (req, res) => {
  const { sessionId } = req.params
  const userId = req.user._id

  try {
    const result = await retryableDatabaseOp(async () => {
      const gameSession = await ArticleQuizSession.findOne({
        _id: sessionId,
        user: userId,
      })

      if (!gameSession) {
        return {
          error: 'Game session not found',
          shouldAbandon: false,
        }
      }

      // Check if there's already an attempt (either completed or abandoned)
      const existingAttempt = await QuizAttempt.findOne({
        user: userId,
        articleQuizSession: sessionId,
      })

      let status = 'not_started'
      let shouldAbandon = false
      let abandonmentReason = null

      if (existingAttempt) {
        if (existingAttempt.abandoned) {
          status = 'abandoned'
          abandonmentReason = existingAttempt.abandonedReason
        } else {
          status = 'completed'
        }
      } else if (gameSession.completed) {
        // Session marked as completed but no attempt found - data inconsistency
        status = 'inconsistent'
        shouldAbandon = true
        abandonmentReason = 'session_expired'
      } else if (gameSession.startTime) {
        // Check if session has expired based on game timer
        const gameConfig = GAME_CONFIGS[gameSession.gameType]
        const timeLimit = gameConfig ? gameConfig.timeLimit : 50

        const now = new Date()
        const sessionStart = new Date(gameSession.startTime)
        const timeElapsed = Math.floor((now - sessionStart) / 1000)

        if (timeElapsed > timeLimit + 30) {
          // 30 second grace period
          status = 'expired'
          shouldAbandon = true
          abandonmentReason = 'session_expired'
        } else {
          status = 'in_progress'
        }
      } else {
        status = 'ready_to_start'
      }

      return {
        success: true,
        sessionId: sessionId,
        status: status,
        shouldAbandon: shouldAbandon,
        abandonmentReason: abandonmentReason,
        gameType: gameSession.gameType,
        startTime: gameSession.startTime,
        endTime: gameSession.endTime,
        completed: gameSession.completed,
        existingAttempt: existingAttempt
          ? {
              id: existingAttempt._id,
              abandoned: existingAttempt.abandoned,
              createdAt: existingAttempt.createdAt,
              RQM_score: existingAttempt.RQM_score,
            }
          : null,
      }
    })

    if (result.error) {
      return res.status(404).json(result)
    }

    res.status(200).json(result)
  } catch (error) {
    console.error('Error checking game session status:', error)
    res.status(500).json({
      error: 'Failed to check session status',
      details: error.message,
    })
  }
})

// @desc   Get enhanced game summary/report with detailed analysis and retry
// @route  GET /api/gamehub/summary/:sessionId
// @access Private
const getGameSummary = asyncHandler(async (req, res) => {
  const { sessionId } = req.params
  const userId = req.user._id

  try {
    const result = await retryableDatabaseOp(async () => {
      const gameSession = await ArticleQuizSession.findOne({
        _id: sessionId,
        user: userId,
      })
        .populate('gameData')
        .populate('article', 'title hindiTitle category')

      if (!gameSession) {
        throw new Error('Game session not found')
      }

      if (!gameSession.completed) {
        throw new Error('Game session not completed yet')
      }

      // Get the enhanced quiz attempt for additional data
      const enhancedAttempt = await QuizAttempt.findOne({
        user: userId,
        articleQuizSession: sessionId,
        gameType: gameSession.gameType,
      }).sort({ createdAt: -1 })

      return { gameSession, enhancedAttempt }
    })

    const { gameSession, enhancedAttempt } = result

    // Prepare enhanced summary based on game type
    let enhancedSummary = {
      gameType: gameSession.gameType,
      articleTitle:
        gameSession.article?.title || gameSession.article?.hindiTitle,
      articleCategory: gameSession.article?.category,
      timeTaken: enhancedAttempt?.timeTaken || 0,
      RQM_score: enhancedAttempt?.RQM_score || 0,
      baseRQM_score: enhancedAttempt?.baseRQM_score || 0,
      performance: enhancedAttempt?.performance || {},
      isBoosted: enhancedAttempt?.isBoosted || false,
      boost: enhancedAttempt?.boost || 1,
      timeDilationBoosted: enhancedAttempt?.timeDilationBoosted || false,
      completedAt: gameSession.endTime,
      language: gameSession.language,
      questions: [],
      responses: gameSession.responses,
      overallStats: {
        totalQuestions: gameSession.questions.length,
        correctAnswers: 0,
        accuracy: 0,
        difficultyLevel: enhancedAttempt?.articleDifficulty || 0.5,
      },
    }

    // Process questions and responses based on game type
    // [Rest of the existing processing logic remains the same - word_weaver, normal_quiz, true_false, connections cases]

    switch (gameSession.gameType) {
      case 'normal_quiz':
        enhancedSummary.questions = gameSession.questions.map(
          (question, index) => {
            const response = gameSession.responses[index]
            const isCorrect = response?.isCorrect || false

            if (isCorrect) enhancedSummary.overallStats.correctAnswers++

            return {
              questionNumber: index + 1,
              questionId: question.questionId || question._id,
              questionText: question.question,
              questionType: 'multiple_choice',
              options: {
                a: question.options?.a?.text || question.options?.a,
                b: question.options?.b?.text || question.options?.b,
                c: question.options?.c?.text || question.options?.c,
                d: question.options?.d?.text || question.options?.d,
              },
              correctAnswer: question.answer,
              correctAnswerText:
                question.options?.[question.answer]?.text ||
                question.options?.[question.answer],
              userAnswer: response?.userAnswer,
              userAnswerText: response?.userAnswer
                ? question.options?.[response.userAnswer]?.text ||
                  question.options?.[response.userAnswer]
                : 'No Answer',
              isCorrect: isCorrect,
              explanation: question.explanation || 'No explanation provided',
              difficulty: question.difficulty || 0.5,
              timeTaken: null, // Individual question time not tracked
            }
          },
        )
        break

      case 'true_false':
        enhancedSummary.questions = gameSession.questions.map(
          (question, index) => {
            const response = gameSession.responses[index]
            const isCorrect = response?.isCorrect || false

            if (isCorrect) enhancedSummary.overallStats.correctAnswers++

            return {
              questionNumber: index + 1,
              questionId: question.questionId || question._id,
              questionText: question.text,
              questionType: 'true_false',
              correctAnswer: question.correct,
              correctAnswerText: question.correct ? 'True' : 'False',
              userAnswer: response?.userAnswer,
              userAnswerText:
                response?.userAnswer !== undefined
                  ? response.userAnswer
                    ? 'True'
                    : 'False'
                  : 'No Answer',
              isCorrect: isCorrect,
              explanation: question.explanation || 'No explanation provided',
              difficulty: question.difficulty || 0.5,
              timeTaken: null,
            }
          },
        )
        break

      case 'word_weaver':
        enhancedSummary.questions = gameSession.questions.map(
          (question, index) => {
            const response = gameSession.responses[index]
            const isCorrect = response?.isCorrect || false

            if (isCorrect) enhancedSummary.overallStats.correctAnswers++

            return {
              questionNumber: index + 1,
              questionId: question.questionId || question._id,
              questionText: question.blank,
              questionType: 'word_weaver',
              correctAnswer: question.answer,
              correctAnswerText: question.answer,
              userAnswer: response?.userWord || '',
              userAnswerText: response?.userWord || 'No Answer',
              isCorrect: isCorrect,
              explanation: `The correct word is "${question.answer}". ${
                isCorrect
                  ? 'Well done!'
                  : 'Try to think about the context and meaning of the sentence.'
              }`,
              difficulty: question.difficulty || 0.5,
              timeTaken: null,
              wordLength: question.answer?.length || 0,
              wasSkipped: !response?.userWord,
            }
          },
        )
        break

      case 'connections':
        const connectionsQuestion = gameSession.questions[0]
        const connectionsResponse = gameSession.responses[0]

        // Calculate correct connections
        const correctConnections =
          connectionsResponse?.connections?.filter(conn => conn.isValid)
            .length || 0
        const totalPossibleConnections =
          connectionsQuestion?.validConnections?.length || 0

        enhancedSummary.overallStats.correctAnswers = correctConnections
        enhancedSummary.overallStats.totalQuestions = totalPossibleConnections

        enhancedSummary.questions = [
          {
            questionNumber: 1,
            questionId:
              connectionsQuestion.questionId || connectionsQuestion._id,
            questionText: 'Connect related concepts',
            questionType: 'connections',
            concepts: connectionsQuestion.concepts,
            validConnections: connectionsQuestion.validConnections.map(vc => ({
              from: vc.from,
              to: vc.to,
              reasoning: vc.reasoning,
              difficulty: vc.difficulty || 0.5,
              connectionType: vc.connectionType || 'conceptual',
            })),
            userConnections: connectionsResponse?.connections || [],
            correctConnectionsCount: correctConnections,
            totalPossibleConnections: totalPossibleConnections,
            isCorrect: correctConnections === totalPossibleConnections,
            explanation: `You found ${correctConnections} out of ${totalPossibleConnections} valid connections. ${
              correctConnections === totalPossibleConnections
                ? 'Perfect! You identified all the relationships.'
                : 'Try to think about different types of relationships: cause-effect, category-example, opposites, etc.'
            }`,
            difficulty: connectionsQuestion.difficulty || 0.5,
            timeTaken: enhancedAttempt?.timeTaken || 0,
          },
        ]
        break

      default:
        return res.status(400).json({ error: 'Unsupported game type' })
    }

    // Calculate overall accuracy
    const totalQuestions = enhancedSummary.overallStats.totalQuestions
    enhancedSummary.overallStats.accuracy =
      totalQuestions > 0
        ? (enhancedSummary.overallStats.correctAnswers / totalQuestions) * 100
        : 0

    res.status(200).json({
      success: true,
      summary: enhancedSummary,
    })
  } catch (error) {
    console.error('Error getting enhanced game summary:', error)
    res.status(500).json({
      error: 'Failed to retrieve game summary',
      details: error.message,
    })
  }
})

// @desc   Check if user has completed any game for an article with retry
// @route  GET /api/gamehub/completion/:articleId/:userId
// @access Private
const checkGameCompletion = asyncHandler(async (req, res) => {
  const { userId, articleId } = req.params

  try {
    const result = await retryableDatabaseOp(async () => {
      // Find any quiz attempt for this user and article (any game type)
      const userAttempts = await QuizAttempt.find({
        user: userId,
        article: articleId,
      }).sort({ RQM_score: -1 }) // Sort by RQM score descending to get best score first

      if (userAttempts.length === 0) {
        return {
          hasPlayed: false,
          gamesPlayed: [],
          bestScore: null,
          percentile: null,
        }
      }

      // Get all attempts for this article to calculate percentile
      const allAttempts = await QuizAttempt.find({
        article: articleId,
      }).sort({ RQM_score: -1 })

      // Find user's best attempt
      const bestUserAttempt = userAttempts[0]

      // Calculate percentile based on best score
      const userPosition = allAttempts.findIndex(
        attempt => attempt._id.toString() === bestUserAttempt._id.toString(),
      )

      const totalAttempts = allAttempts.length
      const userPercentile =
        ((totalAttempts - userPosition) / totalAttempts) * 100

      // Update percentile for the best attempt
      bestUserAttempt.userPercentile = userPercentile
      await bestUserAttempt.save()

      // Get list of game types played
      const gamesPlayed = [
        ...new Set(userAttempts.map(attempt => attempt.gameType)),
      ]

      return {
        hasPlayed: true,
        gamesPlayed,
        bestScore: bestUserAttempt.RQM_score,
        bestGameType: bestUserAttempt.gameType,
        percentile: userPercentile,
        totalAttempts: userAttempts.length,
        allScores: userAttempts.map(attempt => ({
          gameType: attempt.gameType,
          score: attempt.RQM_score,
          date: attempt.createdAt,
        })),
      }
    })

    res.status(200).json(result)
  } catch (error) {
    console.error('Error checking game completion:', error)
    res.status(500).json({
      error: 'Error checking game completion',
      details: error.message,
    })
  }
})

// @desc   Get game report for an article (latest attempt by user) with retry
// @route  GET /api/gamehub/report/:articleId
// @access Private
const getGameReport = asyncHandler(async (req, res) => {
  const { articleId } = req.params
  const userId = req.user._id

  try {
    const result = await retryableDatabaseOp(async () => {
      // Find the latest completed quiz attempt for this user and article
      const latestAttempt = await QuizAttempt.findOne({
        user: userId,
        article: articleId,
      })
        .sort({ createdAt: -1 })
        .populate('articleQuizSession')
        .populate('article', 'title hindiTitle category')
        .populate('user', 'userLanguage pauseRealTimeIQ')

      if (!latestAttempt) {
        throw new Error('No completed games found for this article')
      }

      // Get the associated quiz session for additional data
      const quizSession = latestAttempt.articleQuizSession

      if (!quizSession || !quizSession.completed) {
        throw new Error('Game session not found or not completed')
      }

      return { latestAttempt, quizSession }
    })

    const { latestAttempt, quizSession } = result

    // Calculate score string (correct/total)
    const scoreString = `${latestAttempt.performance?.correctCount || 0}/${
      latestAttempt.performance?.totalItems || 0
    }`

    // Get past RQMs for progress tracking with retry
    const pastRQMs = await retryableDatabaseOp(async () => {
      return await QuizAttempt.find({
        user: userId,
        createdAt: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          $lt: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      })
        .sort({ createdAt: 1 })
        .select('RQM_score createdAt')
        .limit(20)
    })

    // Determine quiz difficulty level
    const quizDifficulty =
      latestAttempt.articleDifficulty < 0.5
        ? 'easy'
        : latestAttempt.articleDifficulty >= 0.5 &&
          latestAttempt.articleDifficulty < 0.7
        ? 'medium'
        : 'hard'

    // Format the response to match exactly what saveEnhancedQuizAttemptWithStats returns
    const reportData = {
      message: 'Game report retrieved successfully',

      // Core scoring data
      RQM_score: latestAttempt.RQM_score,
      nonBoostedRQM: latestAttempt.baseRQM_score,
      baseRQM_score: latestAttempt.baseRQM_score,
      boost: latestAttempt.boost,
      isBoosted: latestAttempt.isBoosted,
      quizDifficulty,
      timeTaken: latestAttempt.timeTaken,
      score: scoreString,
      pastRQMs: pastRQMs.map(attempt => ({
        score: attempt.RQM_score,
        timestamp: attempt.createdAt,
      })),

      // Activity and Achievement data
      xpAwarded: latestAttempt.xpAwarded || 0,
      quinBoostUtilized: latestAttempt.quinBoostUtilized || false,

      // Performance metrics
      performanceBonus: latestAttempt.performanceBonus || 1.0,
      timeDilationBoosted: latestAttempt.timeDilationBoosted || false,
      streakRevived: latestAttempt.streakRevived || false,
      pauseRealTimeIQ:
        latestAttempt.pauseRealTimeIQ ||
        latestAttempt.user?.pauseRealTimeIQ ||
        false,
      gameType: latestAttempt.gameType,
      performance: latestAttempt.performance,
      timeFactor: latestAttempt.timeFactor,

      // IQ Calculation results (spreading like in saveEnhancedQuizAttemptWithStats)
      newIQScore: latestAttempt.newIQScore,
      prevIQScore: latestAttempt.prevIQScore,
      hasSocietyOrCircleChanged:
        latestAttempt.hasSocietyOrCircleChanged || false,
      changedSocietyOrCircle: latestAttempt.changedSocietyOrCircle,
      isUpgrade: latestAttempt.isUpgrade || false,
      newSociety: latestAttempt.newSociety,
      newCircle: latestAttempt.newCircle,
      societyUpgradeMessage: latestAttempt.societyUpgradeMessage,
      boostMultiplier: latestAttempt.boostMultiplier,
      originalIncrement: latestAttempt.originalIncrement,
      boostedIncrement: latestAttempt.boostedIncrement,
      additionalScore: latestAttempt.additionalScore,

      // Additional context for UI
      sessionId: quizSession._id,
      articleTitle:
        latestAttempt.article?.title || latestAttempt.article?.hindiTitle,
      articleCategory: latestAttempt.article?.category,
      completedAt: latestAttempt.createdAt,

      // Flags for UI behavior
      fromReport: true, // Flag to indicate this is from report route
    }

    res.status(200).json({
      success: true,
      report: reportData,
    })
  } catch (error) {
    console.error('Error fetching game report:', error)
    res.status(500).json({
      error: 'Failed to fetch game report',
      details: error.message,
    })
  }
})

// @desc   Regenerate data for a single failed game type with retry (ADMIN: Returns actual data for verification)
// @route  POST /api/gamehub/regenerate/:articleId/:gameType
// @access Private
const regenerateSingleGame = asyncHandler(async (req, res) => {
  const { articleId, gameType } = req.params
  const userId = req.user._id

  try {
    console.log(
      `Regenerating game data with retry for article ${articleId}, game type: ${gameType}`,
    )

    const result = await withRetry(
      async () => {
        const User = require('../model/userSchema')
        const user = await User.findById(userId).select('userLanguage')
        const userLanguage = user?.userLanguage || 'en'

        const article = await Article.findById(articleId)
        if (!article) {
          throw new Error('Article not found')
        }

        const gameData = await GameData.findOne({
          article: articleId,
          language: userLanguage,
        })
        if (!gameData) {
          throw new Error(`Game data for article in ${userLanguage} not found.`)
        }

        const {
          title,
          author,
          mainText,
          hindiTitle,
          hindiAuthor,
          hindiMainText,
        } = article
        const promptData = {
          title: userLanguage === 'en' ? title : hindiTitle,
          author: userLanguage === 'en' ? author : hindiAuthor,
          mainText: userLanguage === 'en' ? mainText : hindiMainText,
          language: userLanguage,
        }

        let newGameContent
        console.log(
          `Attempting to regenerate [${gameType}] for article ${articleId}...`,
        )

        switch (gameType) {
          case 'normal_quiz':
            newGameContent = await generateNormalQuizData(promptData)
            gameData.normal_quiz = newGameContent
            break
          case 'true_false':
            newGameContent = await generateTrueFalseData(promptData)
            gameData.true_false = newGameContent
            break
          case 'word_weaver':
            newGameContent = await generateWordWeaverData(promptData)
            // Add wordLength after generation
            newGameContent.questions = newGameContent.questions.map(q => ({
              ...q,
              wordLength: q.answer.replace(/\s+/g, '').length,
            }))
            gameData.word_weaver = newGameContent
            break
          case 'connections':
            newGameContent = await generateConnectionsData(promptData)
            gameData.connections = newGameContent
            break
          default:
            throw new Error('Invalid game type for regeneration.')
        }

        await gameData.save()
        console.log(
          `✓ Successfully regenerated and saved [${gameType}] with retry.`,
        )

        return { gameData, gameType }
      },
      {
        ...RETRY_CONFIGS.gameGeneration,
        onRetry: (error, attempt) => {
          console.warn(
            `Game regeneration retry ${attempt} for ${gameType}:`,
            error.message,
          )
        },
        onAllRetriesFailed: async (error, params) => {
          console.error(
            `Game regeneration failed after all retries for ${gameType}:`,
            error,
          )
        },
        operationParams: { articleId, gameType, userId },
      },
    )

    res.status(200).json({
      message: `${gameType} data regenerated successfully with retry!`,
      gameData: result.gameData, // Send back the full, updated gameData
    })
  } catch (error) {
    console.error(`Error regenerating ${gameType}:`, error)
    res.status(500).json({
      error: `Failed to regenerate data for ${gameType}. Please try again.`,
      details: error.message,
    })
  }
})

module.exports = {
  getGameData,
  createGameSession,
  startGameSession,
  submitGameAttempt,
  getGameSummary,
  checkGameCompletion,
  getGameReport,
  regenerateSingleGame,
  getAbandonedAttempts,
  submitAbandonedGameAttempt,
  getGameSessionStatus,
}
