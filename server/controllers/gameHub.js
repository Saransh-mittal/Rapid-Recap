// controllers/gameHub.js - UPDATED: Remove context handling from word_weaver
const GameData = require('../model/gameDataSchema')
const Article = require('../model/articleSchema')
const QuizAttempt = require('../model/quizAttemptSchema')
const ArticleQuizSession = require('../model/articleQuizSessionSchem')
const asyncHandler = require('express-async-handler')
const {
  generateEnhancedGameData,
  processGameDataWithDifficulties,
  GAME_CONFIGS,
} = require('../utils/enhancedQuiz.utils')
const mongoose = require('mongoose')
const globalEmitter = require('../eventEmitter')

// @desc   Get game data for an article
// @route  GET /api/gamehub/data/:articleId/:language
// @access Private
const getGameData = asyncHandler(async (req, res) => {
  const { articleId, language } = req.params
  const userId = req.user._id

  let session

  try {
    session = await mongoose.startSession()
    session.startTransaction()

    const emitProgress = progress => {
      globalEmitter.emit('game_generation_progress', { userId, progress })
    }

    emitProgress(20)

    if (!articleId || articleId === 'undefined') {
      throw new Error('No article provided')
    }

    const article = await Article.findById(articleId).session(session)
    if (!article) {
      throw new Error('Article not found')
    }

    // Check if game data already exists
    let gameData = await GameData.findOne({
      article: articleId,
      language: language,
      isActive: true,
    }).session(session)

    emitProgress(40)

    if (!gameData) {
      // Generate new game data
      const {
        title,
        author,
        mainText,
        hindiTitle,
        hindiAuthor,
        hindiMainText,
      } = article

      if (
        (language === 'en' && (!title || !mainText)) ||
        (language === 'hi' && (!hindiTitle || !hindiMainText || !hindiAuthor))
      ) {
        throw new Error('Game data cannot be generated for this article')
      }

      emitProgress(50)

      gameData = await generateEnhancedGameData({
        title: language === 'en' ? title : hindiTitle,
        author: language === 'en' ? author : hindiAuthor,
        mainText: language === 'en' ? mainText : hindiMainText,
        articleId,
        article,
        emitProgress,
        session,
        language,
      })

      emitProgress(90)
    }

    await session.commitTransaction()
    session.endSession()

    emitProgress(100)

    res.status(200).json({
      message: 'Game data retrieved successfully',
      gameData: {
        _id: gameData._id,
        title: gameData.title,
        description: gameData.description,
        category: gameData.category,
        normal_quiz: gameData.normal_quiz,
        true_false: gameData.true_false,
        word_weaver: gameData.word_weaver,
        connections: gameData.connections,
      },
      status: 'ready',
    })
  } catch (error) {
    if (session) {
      await session.abortTransaction()
      session.endSession()
    }
    console.error('Error in getGameData:', error)
    res.status(400).json({
      error: error.message || 'Something went wrong! Please try again',
    })
  }
})

// @desc   Start a game session with SECURE data (no answers sent to frontend)
// @route  POST /api/gamehub/session/start/:sessionId
// @access Private
const startGameSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.params
  const { onBoarding = false } = req.query
  const userId = req.user._id

  try {
    const gameSession = await ArticleQuizSession.findOne({
      _id: sessionId,
      user: userId,
    })

    if (!gameSession) {
      return res.status(404).json({ error: 'Game session not found' })
    }

    if (gameSession.completed) {
      return res.status(400).json({ error: 'Game session already completed' })
    }

    if (gameSession.startTime) {
      return res.status(400).json({ error: 'Game already started' })
    }

    // Get timer from game configuration
    const timer = GAME_CONFIGS[gameSession.gameType]?.timeLimit || 50

    // Set start and end times only if not onboarding
    if (!onBoarding || onBoarding === 'false') {
      gameSession.startTime = new Date()
      gameSession.endTime = new Date(Date.now() + timer * 1000)
    }

    await gameSession.save()

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
          console.log(
            `Processing normal quiz question ${index + 1}/${
              gameSession.questions.length
            }`,
          )
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
          console.log(
            `Processing true/false question ${index + 1}/${
              gameSession.questions.length
            }`,
          )
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
        // UPDATED: Generate shuffled letters WITHOUT context handling
        resultGameSession.questions = gameSession.questions.map((q, index) => {
          let shuffledLetters = []
          let wordLength = 6 // default fallback

          // Generate shuffled letters from the answer (we have access to it here)
          if (q.answer && typeof q.answer === 'string') {
            const cleanWord = q.answer.replace(/\s+/g, '').toUpperCase()
            const wordLetters = cleanWord.split('')

            // Calculate correct word length
            wordLength = cleanWord.length

            // Add extra letters based on word length
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
            let extraCount = 0

            // Add the determined number of extra letters
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
            shuffledLetters = allLetters.sort(() => Math.random() - 0.5)

            console.log(
              `Generated shuffled letters for question ${index + 1}:`,
              {
                answer: cleanWord,
                correctWordLength: wordLength,
                wordLetters: wordLetters,
                extraLettersCount: selectedExtraLetters.length,
                extraLetters: selectedExtraLetters,
                shuffledLetters: shuffledLetters,
                totalCount: shuffledLetters.length,
                rule: 'No extra letters',
              },
            )
          } else {
            // Emergency fallback if no answer
            console.warn(
              `No answer found for word weaver question ${
                index + 1
              }, using fallback letters`,
            )
            wordLength = q.wordLength || 6 // use stored length or default
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

            // Apply same logic for fallback
            let fallbackExtraCount = 0

            shuffledLetters = fallbackLetters
              .slice(0, Math.max(wordLength, wordLength + fallbackExtraCount))
              .sort(() => Math.random() - 0.5)
          }

          return {
            // UPDATED: Remove context field
            blank: q.blank,
            shuffledLetters: shuffledLetters, // Freshly generated letters with new logic
            wordLength: wordLength, // Correct word length
            questionId: q.questionId,
            _id: q._id,
            difficulty: q.difficulty,
            // SECURE: answer field NOT sent to frontend
          }
        })
        break

      case 'connections':
        // Send the single connections question (usually just one question with multiple concepts)
        resultGameSession.questions = gameSession.questions.map((q, index) => {
          console.log(
            `Processing connections question ${index + 1}/${
              gameSession.questions.length
            }:`,
            {
              conceptsCount: q.concepts?.length,
              questionId: q.questionId,
            },
          )
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
          console.log(
            `Processing fallback question ${index + 1}/${
              gameSession.questions.length
            }`,
          )
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

    // Enhanced response with detailed timer information
    const response = {
      message: 'Game started successfully',
      startTime: gameSession.startTime,
      endTime: gameSession.endTime,
      gameSession: resultGameSession,
      timer: timer,
      gameType: gameSession.gameType,
      totalQuestions: gameSession.questions.length,
      timePerQuestion: Math.round(timer / gameSession.questions.length),
      gameConfig: {
        timeLimit: timer,
        itemCount:
          GAME_CONFIGS[gameSession.gameType]?.itemCount ||
          gameSession.questions.length,
        difficulty:
          GAME_CONFIGS[gameSession.gameType]?.difficultyMultiplier || 1.0,
      },
    }

    console.log(
      `SECURE Game session started: ${gameSession.gameType}, Timer: ${timer}s, Questions: ${gameSession.questions.length}, All questions sent to frontend without answers`,
    )

    res.status(200).json(response)
  } catch (error) {
    console.error('Error starting game session:', error)
    res.status(400).json({
      error: 'Something went wrong! Please try again',
      details: error.message,
    })
  }
})

// @desc   Create a new game session with proper timer setup
// @route  POST /api/gamehub/session/create
// @access Private
const createGameSession = asyncHandler(async (req, res) => {
  const { articleId, gameType, language } = req.body
  const userId = req.user._id

  try {
    // Get game data
    const gameData = await GameData.findOne({
      article: articleId,
      language: language || 'en',
      isActive: true,
    })

    if (!gameData) {
      return res.status(404).json({ error: 'Game data not found' })
    }

    // Check if user already has an active session for this specific game type
    let existingSession = await ArticleQuizSession.findOne({
      user: userId,
      article: articleId,
      gameType: gameType,
      completed: false,
    })

    if (existingSession) {
      const timer = GAME_CONFIGS[gameType]?.timeLimit || 50
      return res.status(200).json({
        message: 'Existing session found for this game type',
        sessionId: existingSession._id,
        timer: timer,
        status: 'ready',
      })
    }

    // Check if there's any incomplete session for this user-article (any game type)
    const anyIncompleteSession = await ArticleQuizSession.findOne({
      user: userId,
      article: articleId,
      completed: false,
    })

    if (anyIncompleteSession && anyIncompleteSession.gameType !== gameType) {
      return res.status(400).json({
        error: `You have an incomplete ${anyIncompleteSession.gameType.replace(
          '_',
          ' ',
        )} session. Please complete it first or wait for it to expire.`,
        existingGameType: anyIncompleteSession.gameType,
      })
    }

    // Create questions based on game type with proper data transformation
    let questions = []
    let timer = GAME_CONFIGS[gameType]?.timeLimit || 50

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
          answer: q.correct, // Use 'answer' field for normal quiz
          explanation: q.explanation,
          difficulty: q.difficulty,
          questionId: q._id,
        }))
        break

      case 'true_false':
        questions = gameData.true_false.statements.slice(0, 7).map(s => ({
          text: s.text,
          correct: s.correct, // Boolean for true/false
          explanation: s.explanation,
          difficulty: s.difficulty,
          questionId: s._id,
        }))
        break

      case 'word_weaver':
        // UPDATED: Remove context handling, just store basic question data
        questions = gameData.word_weaver.questions.slice(0, 5).map(q => {
          // Calculate correct word length from the actual answer
          const correctWordLength = q.answer
            ? q.answer.replace(/\s+/g, '').length
            : 6

          return {
            // UPDATED: Remove context field
            blank: q.blank,
            answer: q.answer, // Keep answer for validation (not sent to frontend)
            wordLength: correctWordLength, // Use correct word length
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
        return res.status(400).json({ error: 'Invalid game type' })
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
      language: language || 'en',
      responses: [],
    })

    await gameSession.save()

    console.log(
      `Game session created: ${gameType}, Timer: ${timer}s, Questions: ${questions.length}`,
    )

    res.status(200).json({
      message: 'Game session created successfully',
      sessionId: gameSession._id,
      timer: timer,
      gameType: gameType,
      totalQuestions: questions.length,
      status: 'ready',
    })
  } catch (error) {
    console.error('Error creating game session:', error)
    res.status(400).json({
      error: 'Failed to create game session',
      details: error.message,
    })
  }
})

// @desc   Submit game attempt with SECURE answer validation
// @route  POST /api/gamehub/attempt
// @access Private
const submitGameAttempt = asyncHandler(async (req, res) => {
  const { sessionId, userResponses, timeTaken } = req.body
  const userId = req.user._id

  const emitProgress = (stepId, progress) => {
    globalEmitter.emit('game_submission_progress', { userId, stepId, progress })
  }

  let session

  try {
    session = await mongoose.startSession()
    session.startTransaction()

    emitProgress('initializeCalculation', 50)

    const gameSession = await ArticleQuizSession.findOne({
      _id: sessionId,
      user: userId,
    })
      .populate('gameData')
      .session(session)

    if (!gameSession) {
      throw new Error('Game session not found')
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
        processedResponses = gameSession.questions.map((question, index) => ({
          questionId: question.questionId || question._id,
          userAnswer: userResponses[index],
          isCorrect: userResponses[index] === question.answer, // Validate on backend
        }))
        break

      case 'true_false':
        processedResponses = gameSession.questions.map((question, index) => {
          const userAnswer = userResponses[index]
          const isCorrect = userAnswer === question.correct // Validate on backend
          return {
            questionId: question.questionId || question._id,
            userAnswer: userAnswer,
            isCorrect: isCorrect,
          }
        })
        break

      case 'word_weaver':
        processedResponses = gameSession.questions.map((question, index) => {
          const response = userResponses[index]
          let userWord = ''

          console.log('Processing word weaver response:', {
            questionIndex: index,
            responseType: typeof response,
            response: response,
          })

          // Handle different response formats from frontend with FIXED nested object handling
          if (typeof response === 'string') {
            userWord = response
          } else if (typeof response === 'object' && response !== null) {
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
            console.warn(`userWord is not a string for question ${index}:`, {
              userWord,
              type: typeof userWord,
            })
            userWord = String(userWord || '')
          }

          // SECURE: Validate answer on backend using stored correct answer
          const correctAnswer = question.answer || ''
          let isCorrect = false

          if (userWord && correctAnswer && typeof userWord === 'string') {
            // Case-insensitive comparison, remove spaces and special characters
            const normalizedUserWord = userWord
              .replace(/[^A-Za-z]/g, '')
              .toUpperCase()
            const normalizedCorrectAnswer = correctAnswer
              .replace(/[^A-Za-z]/g, '')
              .toUpperCase()
            isCorrect = normalizedUserWord === normalizedCorrectAnswer

            console.log('Word validation:', {
              questionIndex: index,
              userWord,
              normalizedUserWord,
              correctAnswer,
              normalizedCorrectAnswer,
              isCorrect,
            })
          } else {
            console.log('Skipping validation (empty answer):', {
              questionIndex: index,
              userWord,
              correctAnswer,
              isEmpty: !userWord,
            })
          }

          console.log('Word Weaver validation result:', {
            questionIndex: index,
            userWord,
            correctAnswer,
            isCorrect,
            isEmpty: !userWord,
          })

          return {
            questionId: question.questionId || question._id,
            userWord: userWord,
            isCorrect: isCorrect,
            // No skip field needed - empty answers are just worth 0 points
          }
        })
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
        const validConcepts = new Set(gameSession.questions[0].concepts || [])
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
              const isValid = gameSession.questions[0].validConnections.some(
                vc =>
                  (vc.from === connection.from && vc.to === connection.to) ||
                  (vc.from === connection.to && vc.to === connection.from),
              )

              console.log('Connection validation:', {
                from: connection.from,
                to: connection.to,
                isValid,
                totalValidConnections:
                  gameSession.questions[0].validConnections.length,
              })

              return {
                from: connection.from,
                to: connection.to,
                isValid,
              }
            }),
          },
        ]

        // Enhanced validation summary for debugging
        const validConnectionCount = processedResponses[0].connections.filter(
          conn => conn.isValid,
        ).length
        console.log('Enhanced connections validation summary:', {
          submittedCount: userResponses.length,
          maxAllowed: MAX_CONNECTIONS,
          validCount: validConnectionCount,
          uniqueNodesUsed: actualNodesUsed,
          expectedNodesUsed: expectedNodesUsed,
          nodeUtilizationRate: ((actualNodesUsed / 8) * 100).toFixed(1) + '%',
          allConnections: processedResponses[0].connections,
          usedNodes: Array.from(usedNodes).sort(),
        })

        break

      default:
        throw new Error('Invalid game type')
    }

    emitProgress('calculateRQM', 75)

    // Update game session first
    gameSession.responses = processedResponses
    gameSession.completed = true
    gameSession.endTime = new Date()
    await gameSession.save({ session })

    emitProgress('calculateRQM', 100)
    emitProgress('saveAttempt', 25)

    // Use the comprehensive stats function for ALL game types
    const {
      saveEnhancedQuizAttemptWithStats,
    } = require('../services/quizAttemptService')

    const quizAttemptResult = await saveEnhancedQuizAttemptWithStats(
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

    emitProgress('saveAttempt', 100)

    await session.commitTransaction()
    session.endSession()

    emitProgress('finalizeAttempt', 100)

    // Return the comprehensive result for all game types
    return res.status(201).json(quizAttemptResult)
  } catch (error) {
    if (session) {
      await session.abortTransaction()
      session.endSession()
    }
    console.error('Error in submitGameAttempt:', error)
    res.status(500).json({
      error: error.message || 'Unable to save attempt. Please try again.',
      details: error.message,
    })
  }
})

// @desc   Get game summary/report
// @route  GET /api/gamehub/summary/:sessionId
// @access Private
const getGameSummary = asyncHandler(async (req, res) => {
  const { sessionId } = req.params
  const userId = req.user._id

  try {
    const gameSession = await ArticleQuizSession.findOne({
      _id: sessionId,
      user: userId,
    }).populate('gameData')

    if (!gameSession) {
      return res.status(404).json({ error: 'Game session not found' })
    }

    if (!gameSession.completed) {
      return res.status(400).json({ error: 'Game session not completed yet' })
    }

    // Get the enhanced quiz attempt
    const enhancedAttempt = await QuizAttempt.findOne({
      user: userId,
      articleQuizSession: sessionId,
      gameType: gameSession.gameType,
    }).sort({ createdAt: -1 })

    // Prepare summary based on game type
    let summary = {
      gameType: gameSession.gameType,
      timeTaken: enhancedAttempt?.timeTaken || 0,
      RQM_score: enhancedAttempt?.RQM_score || 0,
      performance: enhancedAttempt?.performance || {},
      questions: [],
      responses: gameSession.responses,
    }

    // Add game-specific summary data
    switch (gameSession.gameType) {
      case 'normal_quiz':
      case 'true_false':
        summary.questions = gameSession.questions.map((question, index) => {
          const response = gameSession.responses[index]
          return {
            question: question.question || question.text,
            options: question.options,
            correctAnswer: question.answer || question.correct,
            userAnswer: response?.userAnswer,
            isCorrect: response?.isCorrect,
            explanation: question.explanation,
          }
        })
        break

      case 'word_weaver':
        // UPDATED: Remove context from summary
        summary.questions = gameSession.questions.map((question, index) => {
          const response = gameSession.responses[index]
          return {
            // UPDATED: Remove context field
            blank: question.blank,
            correctAnswer: question.answer,
            userAnswer: response?.userWord,
            isCorrect: response?.isCorrect,
          }
        })
        break

      case 'connections':
        summary.questions = [
          {
            concepts: gameSession.questions[0].concepts,
            validConnections: gameSession.questions[0].validConnections,
            userConnections: gameSession.responses[0]?.connections || [],
          },
        ]
        break
    }

    res.status(200).json(summary)
  } catch (error) {
    console.error('Error getting game summary:', error)
    res.status(400).json({ error: 'Something went wrong' })
  }
})

// @desc   Import custom game data
// @route  POST /api/gamehub/import
// @access Private
const importGameData = asyncHandler(async (req, res) => {
  const { gameData } = req.body
  const userId = req.user._id

  try {
    // Validate game data structure
    const requiredFields = [
      'title',
      'normal_quiz',
      'true_false',
      'word_weaver',
      'connections',
    ]
    const missing = requiredFields.filter(field => !gameData[field])

    if (missing.length > 0) {
      return res.status(400).json({
        error: `Missing required fields: ${missing.join(', ')}`,
      })
    }

    // Process and add automatic difficulty calculations
    const processedData = processGameDataWithDifficulties(gameData)

    // Create new game data
    const newGameData = new GameData({
      title: processedData.title,
      description: processedData.description || '',
      category: processedData.category || 'general',
      normal_quiz: processedData.normal_quiz,
      true_false: processedData.true_false,
      word_weaver: processedData.word_weaver,
      connections: processedData.connections,
      language: 'en', // Default to English for imported data
    })

    await newGameData.save()

    res.status(201).json({
      message: 'Game data imported successfully',
      gameDataId: newGameData._id,
    })
  } catch (error) {
    console.error('Error importing game data:', error)
    res
      .status(400)
      .json({ error: error.message || 'Failed to import game data' })
  }
})

// @desc   Export game data
// @route  GET /api/gamehub/export/:articleId
// @access Private
const exportGameData = asyncHandler(async (req, res) => {
  const { articleId } = req.params
  const { language = 'en' } = req.query

  try {
    const gameData = await GameData.findOne({
      article: articleId,
      language: language,
      isActive: true,
    })

    if (!gameData) {
      return res.status(404).json({ error: 'Game data not found' })
    }

    // Remove internal fields for export
    const exportData = {
      title: gameData.title,
      description: gameData.description,
      category: gameData.category,
      normal_quiz: gameData.normal_quiz,
      true_false: gameData.true_false,
      word_weaver: gameData.word_weaver,
      connections: gameData.connections,
    }

    res.status(200).json(exportData)
  } catch (error) {
    console.error('Error exporting game data:', error)
    res.status(400).json({ error: 'Failed to export game data' })
  }
})

// @desc   Check if user has completed any game for an article
// @route  GET /api/gamehub/completion/:articleId/:userId
// @access Private
const checkGameCompletion = asyncHandler(async (req, res) => {
  const { userId, articleId } = req.params

  try {
    // Find any quiz attempt for this user and article (any game type)
    const userAttempts = await QuizAttempt.find({
      user: userId,
      article: articleId,
    }).sort({ RQM_score: -1 }) // Sort by RQM score descending to get best score first

    if (userAttempts.length === 0) {
      return res.status(200).json({
        hasPlayed: false,
        gamesPlayed: [],
        bestScore: null,
        percentile: null,
      })
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

    res.status(200).json({
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
    })
  } catch (error) {
    console.error('Error checking game completion:', error)
    res.status(500).json({
      error: 'Error checking game completion',
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
  importGameData,
  exportGameData,
  checkGameCompletion,
}
