// services/quickClashServices/quickClashQuizService.js
const mongoose = require('mongoose')
const QuickClashSession = require('../../model/quickClashSchemas/quickClashSessionSchema')
const QuickClashQuiz = require('../../model/quickClashSchemas/quickClashQuizSchema')
const { calculateRQMScore } = require('../../utils/quiz.utils')
const { updateChallengeScore } = require('./quickClashChallengeService')
const { makeRetryable } = require('../../utils/retryUtils') // ADD THIS IMPORT

/**
 * Get quiz questions for a session
 * @param {Object} params - Parameters
 * @param {string} params.sessionId - Session ID
 * @returns {Promise<Array>} Questions for the quiz
 */
const getQuizQuestions = async ({ sessionId }) => {
  let mongoSession

  try {
    mongoSession = await mongoose.startSession()
    await mongoSession.startTransaction()

    const sessionInstance = await QuickClashSession.findById(sessionId)
      .populate('quiz')
      .session(mongoSession)

    if (!sessionInstance) {
      console.error(`[getQuizQuestions] Session not found for ID: ${sessionId}`)
      throw new Error('Session not found')
    }

    const quiz = await QuickClashQuiz.findById(sessionInstance.quiz).session(
      mongoSession,
    )

    if (!quiz) {
      console.error(
        `[getQuizQuestions] Quiz not found for session ID: ${sessionId}`,
      )
      throw new Error('Quiz not found')
    }

    // Select 5 random questions from the total set
    let allQuestions = [...quiz.questions]
    let selectedQuestions = []

    // If we have 5 or fewer questions, use all of them
    if (allQuestions.length <= 5) {
      selectedQuestions = allQuestions
    } else {
      // Randomly select 5 questions
      for (let i = 0; i < 5; i++) {
        const randomIndex = Math.floor(Math.random() * allQuestions.length)
        selectedQuestions.push(allQuestions[randomIndex])
        allQuestions.splice(randomIndex, 1)
      }
    }

    // Initialize quizAttempt structure if needed
    if (!sessionInstance.quizAttempt) {
      sessionInstance.quizAttempt = {
        responses: [],
        answerMappings: {},
        shuffledOptions: {}, // Initialize shuffled options storage
        completed: false,
      }
    }

    // Initialize the answer mappings object if it doesn't exist
    if (!sessionInstance.quizAttempt.answerMappings) {
      sessionInstance.quizAttempt.answerMappings = {}
    }

    // Initialize the shuffled options object if it doesn't exist
    if (!sessionInstance.quizAttempt.shuffledOptions) {
      sessionInstance.quizAttempt.shuffledOptions = {}
    }

    // Create a new answerMappings object to replace the existing one
    const answerMappings = {}
    // Create a new shuffledOptions object to replace the existing one
    const shuffledOptions = {}

    // Store the selected question IDs to know which questions were shown to the user
    const selectedQuestionIds = selectedQuestions.map(q => q._id.toString())
    sessionInstance.quizAttempt.selectedQuestionIds = selectedQuestionIds

    // Shuffle options for each question
    const questionsWithShuffledOptions = selectedQuestions.map(q => {
      // Create an array of option entries
      const optionEntries = Object.entries(q.options)

      // Shuffle the entries
      for (let i = optionEntries.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[optionEntries[i], optionEntries[j]] = [
          optionEntries[j],
          optionEntries[i],
        ]
      }

      // Convert back to an object
      const shuffledOptionsForQuestion = {}
      optionEntries.forEach(([key, value], index) => {
        // Assign new keys (a, b, c, d) based on the shuffled order
        const newKey = String.fromCharCode(97 + index) // 97 is ASCII for 'a'
        shuffledOptionsForQuestion[newKey] = value
      })

      // Store the mapping from original answer to new answer
      const originalAnswer = q.answer
      const originalOptionValue = q.options[originalAnswer]
      let newAnswer = ''

      // Find the new key for the original answer value
      Object.entries(shuffledOptionsForQuestion).forEach(([key, value]) => {
        if (value === originalOptionValue) {
          newAnswer = key
        }
      })

      // Store mapping in our local object
      const questionId = q._id.toString()
      answerMappings[questionId] = {
        originalAnswer,
        newAnswer,
      }

      // Store the shuffled options in our local object
      shuffledOptions[questionId] = shuffledOptionsForQuestion

      // Return the question with shuffled options but without the answer
      return {
        _id: q._id,
        question: q.question,
        options: shuffledOptionsForQuestion,
      }
    })

    // Set the entire answerMappings object at once
    sessionInstance.quizAttempt.answerMappings = answerMappings
    // Set the entire shuffledOptions object at once
    sessionInstance.quizAttempt.shuffledOptions = shuffledOptions

    // Mark the fields as modified to ensure they get saved
    sessionInstance.markModified('quizAttempt.answerMappings')
    sessionInstance.markModified('quizAttempt.shuffledOptions')
    sessionInstance.markModified('quizAttempt.selectedQuestionIds')

    // Save the session with updated mappings
    await sessionInstance.save({ session: mongoSession })

    // Verify the save was successful
    const verifySession = await QuickClashSession.findById(sessionId).session(
      mongoSession,
    )

    // Commit the transaction
    await mongoSession.commitTransaction()

    return questionsWithShuffledOptions
  } catch (error) {
    console.error(`[getQuizQuestions] Error: ${error.message}`, error)
    if (mongoSession) {
      console.log(`[getQuizQuestions] Aborting transaction due to error`)
      await mongoSession.abortTransaction()
    }
    throw error
  } finally {
    if (mongoSession) {
      mongoSession.endSession()
    }
  }
}

/**
 * Submit quiz answers and calculate score - WITH RETRY LOGIC
 * @param {Object} params - Parameters
 * @param {string} params.sessionId - Session ID
 * @param {Array} params.responses - User responses
 * @param {mongoose.ClientSession} [params.session] - Optional Mongoose session
 * @returns {Promise<Object>} Quiz submission result
 */
const submitQuizAnswersService = makeRetryable(
  async ({ sessionId, responses, session: mongoSession }) => {
    const session = mongoSession || (await mongoose.startSession())
    let startedTransaction = false

    try {
      if (!mongoSession) {
        await session.startTransaction()
        startedTransaction = true
      }

      console.log(
        `[submitQuizAnswersService] Processing quiz submission for session: ${sessionId}`,
      )

      const quizSession = await QuickClashSession.findById(sessionId)
        .populate('quiz')
        .session(session)

      if (!quizSession) {
        console.error(
          `[submitQuizAnswersService] Quiz session not found for ID: ${sessionId}`,
        )
        throw new Error('Quiz session not found')
      }

      if (quizSession.phase !== 'quiz') {
        console.error(
          `[submitQuizAnswersService] Invalid session phase: ${quizSession.phase}`,
        )
        throw new Error(`Invalid session phase: ${quizSession.phase}`)
      }

      // CRITICAL: Only process the questions that were actually shown to the user
      const selectedQuestionIds =
        quizSession.quizAttempt.selectedQuestionIds || []
      if (!selectedQuestionIds.length) {
        throw new Error('No selected questions found for this session')
      }

      // Filter responses to only include selected questions
      const filteredResponses = responses.filter(response =>
        selectedQuestionIds.includes(response.questionId.toString()),
      )

      // Validate responses against the correct answers from the quiz
      const validatedResponses = filteredResponses.map(response => {
        const question = quizSession.quiz.questions.find(
          q => q._id.toString() === response.questionId.toString(),
        )

        if (!question) {
          console.error(
            `[submitQuizAnswersService] Question not found: ${response.questionId}`,
          )
          throw new Error(`Question not found: ${response.questionId}`)
        }

        // Check answer against the answer key, considering shuffled options
        const mapping =
          quizSession.quizAttempt.answerMappings?.[
            response.questionId.toString()
          ]

        // If there's a mapping and the answer matches the new answer, it's correct
        // This handles the option shuffling we did when sending questions
        const isCorrect = mapping
          ? response.answer === mapping.newAnswer
          : response.answer === question.answer

        return {
          questionId: response.questionId,
          userAnswer: response.answer,
          isCorrect,
          timeSpent: response.timeSpent || 0,
        }
      })

      // Calculate time taken
      const now = new Date()
      const quizTimeSpent =
        validatedResponses.reduce(
          (total, response) => total + response.timeSpent,
          0,
        ) ||
        (quizSession.quizAttempt.startTime
          ? Math.floor((now - quizSession.quizAttempt.startTime) / 1000)
          : 0)

      // Get only the selected questions for RQM calculation
      const selectedQuestions = quizSession.quiz.questions.filter(question =>
        selectedQuestionIds.includes(question._id.toString()),
      )

      // Calculate RQM score using the same function as regular quizzes
      // IMPORTANT: Only pass the selected questions and their responses
      const rqmResult = calculateRQMScore(
        validatedResponses,
        selectedQuestions,
        quizTimeSpent,
        null, // No boosts in QuickClash
      )

      let RQM_score = rqmResult.RQM_score
      const baseRQM_score = rqmResult.baseRQM_score || RQM_score

      // --- Apply Powerups ---
      const activePowerups = quizSession.activePowerups || []
      let precisionBonus = 0
      let scoreSurgeBonus = 0

      // 1. Precision Protocol (Quiz): +50 RQM if 100% Accuracy
      const precisionProtocol = activePowerups.find(p => p.powerupId === 'PRECISION_PROTOCOL' && (p.phase?.toLowerCase() === 'quiz' || p.phase?.toLowerCase() === 'both'))
      const isPerfect = validatedResponses.every(r => r.isCorrect)
      if (precisionProtocol && isPerfect) {
        precisionBonus = 50
        RQM_score += precisionBonus
        precisionProtocol.used = true
        precisionProtocol.effectApplied = true
      }

      // 2. Score Surge (Quiz): 1.1x Multiplier - only if not already used in Forge phase
      const scoreSurge = activePowerups.find(p =>
        p.powerupId === 'SCORE_SURGE' &&
        !p.used && // Only apply if not already used in Forge
        (p.phase?.toLowerCase() === 'quiz' || p.phase?.toLowerCase() === 'both')
      )
      if (scoreSurge) {
        const surgedScore = Math.round(RQM_score * 1.1)
        scoreSurgeBonus = surgedScore - RQM_score
        RQM_score = surgedScore
        scoreSurge.used = true
        scoreSurge.effectApplied = true
      }

      // Get Forge Mode score if applicable
      const forgeScore = quizSession.forgeProgress?.score || 0
      const totalScore = RQM_score + forgeScore

      // Update session
      quizSession.quizAttempt.responses = validatedResponses
      quizSession.quizAttempt.timeSpent = quizTimeSpent
      quizSession.quizAttempt.completed = true
      quizSession.quizAttempt.endTime = now
      quizSession.phase = 'completed'
      quizSession.score = {
        RQM_score,
        baseRQM_score,
        forgeScore, // Store forge score separately
        precisionBonus,
        scoreSurgeBonus,
        total: totalScore, // Total is sum of Quiz + Forge
      }

      await quizSession.save({ session })

      // Update challenge score along with attempted status, regardless of score value
      await updateChallengeScore({
        challengeId: quizSession.challenge,
        userId: quizSession.user,
        score: totalScore, // Use TOTAL score for the challenge
        session,
      })

      if (startedTransaction) {
        await session.commitTransaction()
      }

      console.log(
        `[submitQuizAnswersService] Successfully processed quiz submission for session: ${sessionId}`,
      )

      // Calculate accuracy score as a string (e.g., "3/5")
      const correctCount = validatedResponses.filter(r => r.isCorrect).length
      const totalCount = validatedResponses.length
      const scoreString = `${correctCount}/${totalCount}`

      // Calculate Forge accuracy from forge progress responses
      const forgeResponses = quizSession.forgeProgress?.responses || []
      const forgeCorrectCount = forgeResponses.filter(r => r.isCorrect).length
      const forgeTotalCount = forgeResponses.length || 5 // Default to 5 if no responses

      // Calculate difficulty level based on the quiz's overall difficulty
      const difficulty =
        quizSession.quiz.overallDifficulty < 0.5
          ? 'easy'
          : quizSession.quiz.overallDifficulty >= 0.5 &&
            quizSession.quiz.overallDifficulty < 0.7
          ? 'medium'
          : 'hard'

      const result = {
        message: 'Attempt saved successfully',
        RQM_score: totalScore, // Return TOTAL score as the main score for display
        quizScore: RQM_score, // Original quiz score
        forgeScore,
        // Dual-phase accuracy breakdown for PostSessionRewardScreen
        forgeAccuracy: {
          correct: forgeCorrectCount,
          total: forgeTotalCount,
          percentage: forgeTotalCount > 0 ? Math.round((forgeCorrectCount / forgeTotalCount) * 100) : 0
        },
        quizAccuracy: {
          correct: correctCount,
          total: totalCount,
          percentage: totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0
        },
        nonBoostedRQM: totalScore, // Use total score
        baseRQM_score,
        precisionBonus,
        scoreSurgeBonus,
        boost: 1, // No boosts applied
        isBoosted: false,
        quizDifficulty: difficulty,
        timeTaken: quizTimeSpent,
        score: scoreString,
        pastRQMs: [], // No past RQMs in QuickClash context
        xpAwarded: 5, // Basic XP for completion
        quinBoostUtilized: false,
        messageForTournamentEligibility: '',
        userEligibleForTournament: false,
        performanceBonus: 1,
        timeDilationBoosted: false,
        pauseRealTimeIQ: true, // Don't affect real-time IQ in QuickClash
        completed: true,
        responses: validatedResponses,
        activePowerups: activePowerups, // Return active powerups for breakdown
      }

      return result
    } catch (error) {
      console.error(`[submitQuizAnswersService] Error: ${error.message}`, error)
      if (startedTransaction) {
        console.log(
          `[submitQuizAnswersService] Aborting transaction due to error`,
        )
        await session.abortTransaction()
      }
      throw error
    } finally {
      if (!mongoSession && startedTransaction) {
        session.endSession()
      }
    }
  },
  {
    maxRetries: 3,
    operationName: 'SubmitQuizAnswers',
    initialDelay: 1000,
    maxDelay: 5000,
    onRetry: (error, attempt) => {
      console.warn(
        `[submitQuizAnswersService] Retry attempt ${attempt}/3 after error: ${error.message}`,
      )
    },
    onAllRetriesFailed: async (error, { sessionId, responses }) => {
      console.error(
        `[submitQuizAnswersService] All retries failed for session ${sessionId}`,
      )

      // Log the failed submission for manual recovery if needed
      console.error(`[submitQuizAnswersService] Failed submission data:`, {
        sessionId,
        responseCount: responses?.length || 0,
        timestamp: new Date().toISOString(),
        finalError: error.message,
      })

      // Create a more user-friendly error message
      const finalError = new Error(
        'Quiz submission failed after multiple attempts. Please try again or contact support if the issue persists.',
      )
      finalError.isRetryExhausted = true
      finalError.originalError = error
      finalError.sessionId = sessionId
      throw finalError
    },
    // Custom retry condition
    isRetryable: error => {
      // Don't retry validation errors
      if (
        error.message.includes('Quiz session not found') ||
        error.message.includes('Invalid session phase') ||
        error.message.includes('Question not found')
      ) {
        return false
      }

      // Use default retry logic for other errors
      return true
    },
  },
)

/**
 * Get detailed quiz report for a completed session
 * @param {Object} params - Parameters
 * @param {string} params.sessionId - Session ID
 * @param {string} params.userId - User ID
 * @returns {Promise<Object>} Detailed quiz report formatted for the UI
 */
const getQuizReport = async ({ sessionId, userId }) => {
  try {
    // Get session with populated quiz
    const quizSession = await QuickClashSession.findOne({
      _id: sessionId,
      user: userId,
    })
      .populate({
        path: 'quiz',
        select: 'questions overallDifficulty',
      })
      .populate('challenge')

    if (!quizSession) {
      console.error(`[getQuizReport] Session not found for ID: ${sessionId}`)
      throw new Error('Quiz session not found or access denied')
    }

    if (quizSession.phase !== 'completed') {
      console.error(
        `[getQuizReport] Session not completed: ${quizSession.phase}`,
      )
      throw new Error('Quiz has not been completed yet')
    }

    // Calculate score fraction (e.g., "3/5")
    const correctCount = quizSession.quizAttempt.responses.filter(
      r => r.isCorrect,
    ).length
    const totalCount = quizSession.quizAttempt.responses.length
    const scoreString = `${correctCount}/${totalCount}`

    // Calculate difficulty level based on the quiz's overall difficulty
    const difficulty =
      quizSession.quiz.overallDifficulty < 0.5
        ? 'easy'
        : quizSession.quiz.overallDifficulty >= 0.5 &&
          quizSession.quiz.overallDifficulty < 0.7
        ? 'medium'
        : 'hard'

    // Get the questions that were actually shown to the user using selectedQuestionIds
    const questionsShown = quizSession.quizAttempt.selectedQuestionIds
      ? quizSession.quiz.questions.filter(q =>
          quizSession.quizAttempt.selectedQuestionIds.includes(
            q._id.toString(),
          ),
        )
      : quizSession.quiz.questions

    // Construct the report questions including user responses and using the actual option order
    const questions = quizSession.quizAttempt.responses.map(response => {
      // Find the original question from the quiz
      const questionId = response.questionId.toString()
      const originalQuestion = questionsShown.find(
        q => q._id.toString() === questionId,
      )

      if (!originalQuestion) {
        console.warn(`Question not found for response ${questionId}`)
        return {
          question: 'Question unavailable',
          options: { a: '', b: '', c: '', d: '' },
          answer: response.userAnswer || '',
          explanation: 'Explanation unavailable',
          userAnswer: response.userAnswer || '',
          isCorrect: response.isCorrect || false,
        }
      }

      // Get the answer mapping for this question
      const mapping = quizSession.quizAttempt.answerMappings?.[questionId]
      const correctAnswer = mapping?.newAnswer || originalQuestion.answer

      // Use the stored shuffled options if available, otherwise fall back to original options
      const options =
        quizSession.quizAttempt.shuffledOptions?.[questionId] ||
        originalQuestion.options

      return {
        question: originalQuestion.question,
        options: options,
        answer: correctAnswer, // Use the mapped answer (as it was shown to the user)
        explanation: originalQuestion.explanation,
        userAnswer: response.userAnswer || '',
        isCorrect: response.isCorrect || false,
      }
    })

    // Format the result to match what SubmittedQuizInterface expects
    // Format the result to match what SubmittedQuizInterface expects
    const quizScore = quizSession.score?.RQM_score || 0
    const forgeScore = quizSession.score?.forgeScore || 0
    const precisionBonus = quizSession.score?.precisionBonus || 0
    const scoreSurgeBonus = quizSession.score?.scoreSurgeBonus || 0

    // Calculate total score.
    // If RQM_score in DB is smaller than forgeScore (and forgeScore is significant),
    // it likely means RQM_score only contains the quiz part.
    // We want to display the TOTAL score.
    let totalScore = quizScore
    if (quizScore < forgeScore && forgeScore > 0) {
       totalScore = quizScore + forgeScore
    } else if (quizSession.score?.total) {
       totalScore = quizSession.score.total
    }


    // Populate forgeArticle to get the questions
    await quizSession.populate({
      path: 'challenge',
      populate: {
        path: 'forgeArticle',
        model: 'FORGE_ARTICLE',
      },
    })

    // Construct Forge questions report
    let forgeQuestions = []
    if (quizSession.challenge?.forgeArticle?.sections && quizSession.forgeProgress?.responses) {
      const forgeArticle = quizSession.challenge.forgeArticle
      const forgeResponses = quizSession.forgeProgress.responses

      forgeQuestions = forgeResponses.map(response => {
        // Find the section corresponding to the response
        // Note: sectionNumber in response is 0-4 (index based on previous logic) or 1-5?
        // Let's check the schema. forgeArticleSchema says sectionNumber is 1-5.
        // quickClashSessionSchema says sectionNumber is Number.
        // In ForgeReadingPhase.jsx, currentSection is 0-4.
        // Let's assume response.sectionNumber matches the index in sections array if 0-based, or find by sectionNumber.

        // Actually, looking at ForgeReadingPhase.jsx, it sends the index (0-4).
        // But forgeArticle.sections might be ordered.
        // Let's safely find the section.
        const section = forgeArticle.sections[response.sectionNumber]

        if (!section) return null

        const options = section.mcq.options
        const userAnswerText = options[response.userAnswer]
        const correctAnswerText = options[section.mcq.correctIndex]

        return {
          question: section.mcq.question,
          options: options, // Array of strings
          userAnswer: userAnswerText,
          answer: correctAnswerText,
          isCorrect: response.isCorrect,
          score: response.scoreBreakdown?.total || 0,
          explanation: section.mcq.contextNugget || section.mcq.hint || 'No explanation available',
          type: 'forge'
        }
      }).filter(Boolean)
    }

    const result = {
      message: 'Quiz report loaded successfully',
      RQM_score: totalScore,
      nonBoostedRQM: totalScore, // Same in QuickClash
      baseRQM_score:
        quizSession.score?.baseRQM_score || quizScore,
      boost: 1, // No boost in QuickClash
      isBoosted: false,
      quizDifficulty: difficulty,
      timeTaken: quizSession.quizAttempt?.timeSpent || 0,
      score: scoreString,
      pastRQMs: [], // No past RQMs concept in QuickClash
      xpAwarded: 5, // Basic XP for completion
      quinBoostUtilized: false,
      messageForTournamentEligibility: '',
      userEligibleForTournament: false,
      performanceBonus: 1,
      timeDilationBoosted: false,
      pauseRealTimeIQ: true,
      // Formatted questions with user answers
      questions: questions,
      forgeQuestions: forgeQuestions, // NEW: Forge questions
      // Additional stats for display
      category: quizSession.challenge.category,
      forgeScore: forgeScore,
      precisionBonus: precisionBonus,
      scoreSurgeBonus: scoreSurgeBonus,
      activePowerups: quizSession.activePowerups || [],
    }

    return result
  } catch (error) {
    console.error(`[getQuizReport] Error: ${error.message}`, error)
    throw error
  }
}

module.exports = {
  getQuizQuestions,
  submitQuizAnswersService,
  getQuizReport,
}
