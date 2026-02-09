// services/quickClashServices/quickClashSessionService.js
const QuickClashSession = require('../../model/quickClashSchemas/quickClashSessionSchema')
const QuickClashQuiz = require('../../model/quickClashSchemas/quickClashQuizSchema')
const QuickClashChallenge = require('../../model/quickClashSchemas/quickClashChallengeSchema')
const QuickClashTeamBattle = require('../../model/quickClashSchemas/quickClashTeamBattleSchema')
const ForgeArticle = require('../../model/quickClashSchemas/forgeArticleSchema')
const {
  getQuickClashHighlights,
} = require('../../utils/quickClashHighlight.utils')
const { updateChallengeScore } = require('./quickClashChallengeService')
const mongoose = require('mongoose')
const User = require('../../model/userSchema')
const { markUserAsParticipated } = require('./quickClashTeamBattleService')
const cache = require('memory-cache')
const { enqueueWrite } = require('../../utils/sessionWriteQueue')
const CACHE_TTL = 8 * 60 * 1000 // 8 minutes (session duration)

const READING_TIME_LIMIT = 120 // 2 minutes in seconds
const SESSION_EXPIRY = 8 * 60 * 1000 // 8 minutes (increased for 30s forge reading)

// Forge Mode Scoring Configuration
const FORGE_SCORING = {
  BASE_POINTS: 7, // Base points for correct answer (20 × 0.35)
  SPEED_BONUS_MIN: 2, // Minimum speed bonus (5 × 0.35)
  SPEED_BONUS_MAX: 4, // Maximum speed bonus (10 × 0.35)
  STREAK_BONUS: 2, // Bonus per consecutive correct answer (5 × 0.35)
  MAX_SECTION_TIME: 15000, // 15 seconds max per question
  SECTION_READ_TIME: 30000, // 30 seconds reading time per section
}

/**
 * Helper to get cached forge article
 * Avoids heavy DB population on every request
 */
const getCachedForgeArticle = async (forgeArticleId) => {
  if (!forgeArticleId) return null

  const cacheKey = `forge-article-${forgeArticleId}`
  // console.time(`CacheCheck-${forgeArticleId}`)
  let article = cache.get(cacheKey)
  // console.timeEnd(`CacheCheck-${forgeArticleId}`)

  if (!article) {
    const start = Date.now()
    article = await ForgeArticle.findById(forgeArticleId).lean()
    const time = Date.now() - start

    if (article) {
      cache.put(cacheKey, article, CACHE_TTL)
      console.log(`[CACHE] MISS -> DB FETCH (${time}ms) | ID: ${forgeArticleId}`)
    } else {
        console.log(`[CACHE] MISS -> DB NOT FOUND | ID: ${forgeArticleId}`)
    }
  } else {
    // console.log(`[CACHE HIT] ForgeArticle found in memory`)
  }

  return article
}

/**
 * Optimistic save helper with retry
 * Fire-and-forget (run in background)
 */
const saveSessionWithRetry = async (sessionDoc, retries = 3) => {
  try {
    // console.log('[BG SAVE] Saving session...')
    await sessionDoc.save()
  } catch (err) {
    console.error(`[BG SAVE] FAILED: ${err.message}`)
    // For now, no complex retry logic to avoid race conditions on stale docs.
  }
}

/**
 * Helper to get cached session (In-Memory State)
 */
const getCachedSession = async (sessionId) => {
  const cacheKey = `session-${sessionId}`
  let session = cache.get(cacheKey)

  if (!session) {
      // console.log(`[SESSION MISS] Loading from DB...`)
      session = await QuickClashSession.findById(sessionId)
        .populate('challenge', 'forgeArticle')

      if (session) {
        cache.put(cacheKey, session, 600000) // 10 min TTL
      }
  }
  return session
}


/**
 * Create a new session for a challenge with language support
 * @param {Object} params - Parameters
 * @param {string} params.challengeId - Challenge ID
 * @param {string} params.userId - User ID
 * @param {string} [params.language] - Optional explicit language choice (en/hi) - overrides user preference
 * @returns {Promise<Object>} The created session
 */
const createSession = async ({ challengeId, userId, language }) => {
  const session = await mongoose.startSession()
  try {
    return await session.withTransaction(async () => {
      // Check if session already exists
      const existingSession = await QuickClashSession.findOne({
        challenge: challengeId,
        user: userId,
      }).session(session)

      if (existingSession) {
        throw new Error(
          'Session already exists for this challenge user cannot continue further',
        )
      }

      // Get challenge
      const challenge = await QuickClashChallenge.findById(challengeId).session(
        session,
      )

      if (!challenge) {
        throw new Error('Challenge not found')
      }

      // Check if user is the assigned challenger or opponent
      const isChallenger =
        challenge.challenger &&
        challenge.challenger.toString() === userId.toString()
      const isOpponent =
        challenge.opponent &&
        challenge.opponent.toString() === userId.toString()

      if (!isChallenger && !isOpponent) {
        throw new Error('You are not authorized to take this challenge')
      }

      if (challenge.fromTeamBattle && challenge.teamBattle) {
        // Import the team battle service function
        const {
          validateUserChallengeAssignment,
        } = require('./quickClashTeamBattleService')

        const isValidAssignment = await validateUserChallengeAssignment({
          teamBattleId: challenge.teamBattle,
          challengeId: challengeId,
          userId: userId,
          session,
        })

        if (!isValidAssignment) {
          throw new Error(
            'You are not assigned to this challenge in the team battle',
          )
        }
      }

      // Determine the preferred language
      let preferredLanguage = language

      if (!preferredLanguage) {
        // If no explicit language provided, fetch user's preference
        const user = await User.findById(userId, 'userLanguage').session(
          session,
        )
        preferredLanguage = user?.userLanguage || 'en'
      }

      // Default to English if no valid language setting
      if (preferredLanguage !== 'en' && preferredLanguage !== 'hi') {
        preferredLanguage = 'en'
      }

      // Fetch the quiz for selected language
      const quiz = await QuickClashQuiz.findOne({
        challenge: challengeId,
        language: preferredLanguage,
      }).session(session)

      if (!quiz) {
        throw new Error(`Quiz not found for language: ${preferredLanguage}`)
      }

      // Create session
      const quizSession = new QuickClashSession({
        challenge: challengeId,
        user: userId,
        quiz: quiz._id,
        language: preferredLanguage,
        expiresAt: new Date(Date.now() + SESSION_EXPIRY),
      })

      // NEW: Inject Powerups if from Team Battle
      if (challenge.fromTeamBattle && challenge.teamBattle) {
        const teamBattle = await QuickClashTeamBattle.findById(
          challenge.teamBattle,
        ).session(session)

        if (teamBattle) {
          // Helper to check if a member matches the userId (handles both user and sessionPlayer)
          const memberMatchesUser = (m) => {
            if (m.user) return m.user.toString() === userId.toString()
            if (m.sessionPlayer) return m.sessionPlayer.toString() === userId.toString()
            return false
          }

          const teamAMember = teamBattle.teamAMembers.find(memberMatchesUser)
          const teamBMember = teamBattle.teamBMembers.find(memberMatchesUser)
          const member = teamAMember || teamBMember

          if (member && member.loadout && member.loadout.items.length > 0) {
            quizSession.activePowerups = member.loadout.items.map(item => ({
              powerupId: item.powerupId,
              type: item.type,
              cost: item.cost,
              phase: item.phase,
              used: false,
              effectApplied: false,
            }))
          }
        }
      }

      await quizSession.save({ session })

      // Get article highlights (we don't wait for this to avoid transaction timeout)
      getQuickClashHighlights({
        challengeId,
        lang: preferredLanguage,
      }).catch(err => {
        console.error('Error fetching highlights (non-blocking):', err)
      })

      return quizSession
    })
  } finally {
    session.endSession()
  }
}

const startReading = async ({ sessionId, userId }) => {
  const session = await mongoose.startSession()
  try {
    return await session.withTransaction(async () => {
      const quizSession = await QuickClashSession.findById(sessionId).session(
        session,
      )

      if (!quizSession || quizSession.phase !== 'reading') {
        throw new Error('Invalid session or phase')
      }

      const now = new Date()
      quizSession.reading.startTime = now
      quizSession.reading.endTime = new Date(
        now.getTime() + READING_TIME_LIMIT * 1000,
      )
      if (quizSession.challenge) {
        await markUserAsParticipated({
          challengeId: quizSession.challenge,
          userId: userId,
        })
      }
      await quizSession.save({ session })

      return {
        startTime: now,
        endTime: quizSession.reading.endTime,
        timeLimit: READING_TIME_LIMIT,
      }
    })
  } finally {
    session.endSession()
  }
}

const completeReading = async ({ sessionId, completionType = 'manual' }) => {
  const session = await mongoose.startSession()
  try {
    return await session.withTransaction(async () => {
      const quizSession = await QuickClashSession.findById(sessionId).session(
        session,
      )

      if (!quizSession || quizSession.phase !== 'reading') {
        throw new Error('Invalid session or phase')
      }

      const now = new Date()

      // Fix for NaN timeSpent - Ensure startTime exists before calculating
      let timeSpent = 0
      if (quizSession.reading.startTime) {
        // Calculate time spent and ensure it's valid
        const timeDiff = now - quizSession.reading.startTime
        timeSpent = Math.max(
          0,
          Math.min(Math.floor(timeDiff / 1000), READING_TIME_LIMIT),
        )
      } else {
        // If startTime doesn't exist, use default value
        timeSpent = Math.min(10, READING_TIME_LIMIT) // Default to 10 seconds or max time limit
      }

      // Complete reading phase
      quizSession.reading.completed = true
      quizSession.reading.timeSpent = timeSpent
      quizSession.reading.completionType = completionType

      // Start quiz phase
      quizSession.phase = 'quiz'
      quizSession.quizAttempt.startTime = now

      await quizSession.save({ session })

      return {
        timeSpent,
        completionType,
        nextPhase: 'quiz',
      }
    })
  } finally {
    session.endSession()
  }
}

const checkReadingTimeout = async ({ sessionId }) => {
  const quizSession = await QuickClashSession.findById(sessionId)

  if (
    !quizSession ||
    quizSession.phase !== 'reading' ||
    quizSession.reading.completed
  ) {
    return false
  }

  const now = new Date()
  if (quizSession.reading.endTime && now >= quizSession.reading.endTime) {
    await completeReading({
      sessionId,
      completionType: 'timeout',
    })
    return true
  }

  return false
}

const getSessionDetails = async ({ sessionId }) => {
  const quizSession = await QuickClashSession.findById(sessionId)
    .populate('quiz')
    .populate('challenge')

  if (!quizSession) {
    throw new Error('Session not found')
  }

  // Get highlights for the article
  const highlights = await getQuickClashHighlights({
    challengeId: quizSession.challenge._id,
    lang: quizSession.language,
  }).catch(() => null)

  // Prepare the article content
  const article = {
    title:
      quizSession.language === 'en'
        ? quizSession.challenge.article.title.english
        : quizSession.challenge.article.title.hindi,
    content:
      quizSession.language === 'en'
        ? quizSession.challenge.article.content.english
        : quizSession.challenge.article.content.hindi,
    dictionary: highlights?.dictionary || [],
    importantSentences: highlights?.importantSentences || [],
  }

  // Get questions from the quiz
  const questions = quizSession.quiz.questions || []

  return {
    session: quizSession,
    article,
    questions,
  }
}

const calculateRQMScore = ({
  responses,
  timeSpent,
  difficulty,
  questionCount,
}) => {
  const correctAnswers = responses.filter(r => r.isCorrect).length
  const accuracy = correctAnswers / questionCount

  // Base score from accuracy and difficulty
  let score = accuracy * 100 * (1 + difficulty)

  // Speed bonus (max 50% bonus)
  const expectedTime = questionCount * 15 // 15 seconds per question
  if (timeSpent < expectedTime) {
    const speedBonus = Math.min((expectedTime - timeSpent) / expectedTime, 0.5)
    score *= 1 + speedBonus
  }

  // Accuracy bonuses
  if (accuracy === 1) {
    score *= 1.2 // Perfect score bonus
  } else if (accuracy >= 0.8) {
    score *= 1.1 // High accuracy bonus
  }

  return Math.round(score)
}

const completeQuiz = async ({ sessionId, responses }) => {
  const session = await mongoose.startSession()
  try {
    return await session.withTransaction(async () => {
      const quizSession = await QuickClashSession.findById(sessionId)
        .populate('quiz')
        .session(session)

      if (!quizSession || quizSession.phase !== 'quiz') {
        throw new Error('Invalid session or phase')
      }

      const now = new Date()
      const quizTimeSpent = Math.floor(
        (now - quizSession.quizAttempt.startTime) / 1000,
      )

      // Map and validate responses
      const validatedResponses = responses.map(response => {
        const question = quizSession.quiz.questions.find(
          q => q._id.toString() === response.questionId.toString(),
        )

        if (!question) {
          throw new Error(`Question not found: ${response.questionId}`)
        }

        return {
          questionId: response.questionId,
          answer: response.answer,
          isCorrect: response.answer === question.answer,
          timeSpent: response.timeSpent || 0,
        }
      })

      // Record responses and calculate score
      quizSession.quizAttempt.responses = validatedResponses
      quizSession.quizAttempt.timeSpent = quizTimeSpent
      quizSession.quizAttempt.completed = true
      quizSession.quizAttempt.endTime = now
      quizSession.phase = 'completed'

      const RQM_score_base = calculateRQMScore({
        responses: validatedResponses,
        timeSpent: quizTimeSpent,
        difficulty: quizSession.quiz.overallDifficulty,
        questionCount: quizSession.quiz.questions.length,
      })

      // --- POWERUP BONUSES ---
      let final_RQM_score = RQM_score_base
      let precisionBonus = 0
      let scoreSurgeBonus = 0

      const activePowerups = quizSession.activePowerups || []
      const isPerfectScore = validatedResponses.filter(r => r.isCorrect).length === quizSession.quiz.questions.length

      // 1. Precision Protocol (Quiz): +50 RQM if 100% Accuracy
    const precisionProtocol = activePowerups.find(p => p.powerupId === 'PRECISION_PROTOCOL' && (p.phase?.toLowerCase() === 'quiz' || p.phase?.toLowerCase() === 'both'))
    const isPerfect = validatedResponses.every(r => r.isCorrect)
    if (precisionProtocol && isPerfect) {
      precisionBonus = 50
      final_RQM_score += precisionBonus
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
      const surgedScore = Math.round(final_RQM_score * 1.1)
      scoreSurgeBonus = surgedScore - final_RQM_score
      final_RQM_score = surgedScore
      scoreSurge.used = true
      scoreSurge.effectApplied = true
    }
      quizSession.score = {
        RQM_score: final_RQM_score,
        baseRQM: RQM_score_base, // Store base for breakdown
        speedBonus: quizTimeSpent < quizSession.quiz.questions.length * 15,
        accuracyBonus: isPerfectScore,
        precisionBonus,
        scoreSurgeBonus,
        total: final_RQM_score,
      }

      await quizSession.save({ session })

      // Update challenge scores
      await updateChallengeScore({
        challengeId: quizSession.challenge,
        userId: quizSession.user,
        score: RQM_score,
        session,
      })

      return {
        score: quizSession.score,
        timeSpent: quizTimeSpent,
        completed: true,
      }
    })
  } finally {
    session.endSession()
  }
}

/**
 * Start forge mode session
 * Initializes forge progress and returns first section question
 * @param {Object} params
 * @param {string} params.sessionId - Session ID
 * @returns {Promise<Object>} First section question (without answer)
 */
const startForgeMode = async ({ sessionId }) => {
  const session = await mongoose.startSession()
  try {
    return await session.withTransaction(async () => {
      const quizSession = await QuickClashSession.findById(sessionId)
        .populate('challenge', 'forgeArticle')
        .session(session)

      if (!quizSession || quizSession.phase !== 'reading') {
        throw new Error('Invalid session or phase')
      }

      if (!quizSession.challenge.forgeArticle) {
        throw new Error('This challenge does not have a forge article')
      }

      const now = new Date()

      // Initialize forge progress if not already started
      if (!quizSession.forgeProgress.startTime) {
        quizSession.forgeProgress.active = true // Mark as active
        quizSession.forgeProgress.startTime = now
        quizSession.forgeProgress.currentSection = 0

        // Initialize first section timing
        quizSession.forgeProgress.sectionTimings = [
          {
            sectionNumber: 0,
            questionStartTime: now,
            questionAnsweredTime: null,
            questionTimeSpent: null,
            readingStartTime: null,
            readingEndTime: null,
            readingTimeSpent: null,
          },
        ]

        await quizSession.save({ session })
      } else if (!quizSession.forgeProgress.active) {
        // Fix for sessions that were initialized but missing the active flag
        quizSession.forgeProgress.active = true
        await quizSession.save({ session })
      }

      await quizSession.save({ session })

      // WARM SESSION CACHE
      cache.put(`session-${sessionId}`, quizSession, 600000)

      // Get the forge article (Cache Warming)
      const forgeArticle = await getCachedForgeArticle(quizSession.challenge.forgeArticle)

      // Get current section (should be 0 at start)
      const currentSection = forgeArticle.sections[0]

      // Return question WITHOUT the correct answer
      return {
        sectionNumber: 0,
        totalSections: forgeArticle.sections.length,
        title: currentSection.title,
        icon: currentSection.icon,
        question: currentSection.mcq.question,
        options: currentSection.mcq.options,
        hint: currentSection.mcq.hint || null,
        contextNugget: currentSection.mcq.contextNugget || null,
        readingTime: currentSection.readingTime,
        progress: {
          currentSection: 0,
          unlockedSections: [],
          correctAnswers: 0,
          streak: 0,
        },
        timing: {
          serverTime: now.getTime(),
        },
      }
    })
  } finally {
    session.endSession()
  }
}

/**
 * Submit answer for current section
 * Validates answer, updates progress, and returns next question or reading content
 * @param {Object} params
 * @param {string} params.sessionId - Session ID
 * @param {number} params.sectionNumber - Section number (0-4)
 * @param {number} params.userAnswer - User's answer index (0-3)
 * @param {number} params.timeSpent - Time spent on question (milliseconds)
 * @returns {Promise<Object>} Result with isCorrect flag and next step
 */
const submitForgeAnswer = async ({
  sessionId,
  sectionNumber,
  userAnswer,
  timeSpent,
  powerups = {}, // { scoreSurge: boolean }
}) => {
  // REMOVED TRANSACTION FOR OPTIMISTIC WRITE
  // const mongoSession = await mongoose.startSession()
  try {
    // return await mongoSession.withTransaction(async () => {
      // OPTIMIZATION: Use In-Memory Cached Session
      const quizSession = await getCachedSession(sessionId)

      if (!quizSession || quizSession.phase !== 'reading') {
        throw new Error('Invalid session or phase')
      }
      if (!quizSession.challenge.forgeArticle) {
        throw new Error('This challenge does not have a forge article')
      }

      // 1. Validate Session State
      if (!quizSession.forgeProgress || !quizSession.forgeProgress.active) {
        throw new Error('Forge mode not active')
      }

      // Find current section timing
      const currentTiming = quizSession.forgeProgress.sectionTimings.find(
        t => t.sectionNumber === sectionNumber && !t.questionAnsweredTime,
      )

      if (!currentTiming) {
        throw new Error('Invalid section timing state')
      }



      const now = Date.now()

      // Calculate server-side time spent (authoritative)
      const serverTimeSpent = now - currentTiming.questionStartTime

      // Use server time, but allow small client drift (±1s)
      const validatedTimeSpent =
        Math.abs(serverTimeSpent - timeSpent) < 1000 ? timeSpent : serverTimeSpent

      // Update timing
      currentTiming.questionAnsweredTime = now
      currentTiming.questionTimeSpent = validatedTimeSpent



      // Get the forge article and current section
      let forgeArticle = await getCachedForgeArticle(quizSession.challenge.forgeArticle)

      // Fallback
      if (!forgeArticle) {
          const populatedChallenge = await QuickClashChallenge.findById(quizSession.challenge._id)
            .populate('forgeArticle')
            .lean()
            .session(mongoSession)
          forgeArticle = populatedChallenge.forgeArticle
      }
      const section = forgeArticle.sections[sectionNumber]

      if (!section) {
        throw new Error('Section not found')
      }

      // Validate answer
      const isCorrect = userAnswer === section.mcq.correctIndex

      // Update streak
      let currentStreak = quizSession.forgeProgress.streak || 0
      if (isCorrect) {
        currentStreak++
        quizSession.forgeProgress.correctAnswers =
          (quizSession.forgeProgress.correctAnswers || 0) + 1
      } else {
        // Apply Powerup: Streak Shield (Passive - auto-check from activePowerups)
        const activePowerups = quizSession.activePowerups || []
        const streakShield = activePowerups.find(
          p => p.powerupId === 'STREAK_SHIELD' &&
          (p.phase?.toLowerCase() === 'forge' || p.phase?.toLowerCase() === 'both') &&
          !p.used
        )

        if (streakShield) {
          // Do not reset streak - Streak Shield protects it
          currentStreak = currentStreak // Keep existing streak
          // Mark the powerup as used
          streakShield.used = true
          streakShield.effectApplied = true
        } else {
          currentStreak = 0
        }
      }
      quizSession.forgeProgress.streak = currentStreak
      quizSession.forgeProgress.maxStreak = Math.max(
        quizSession.forgeProgress.maxStreak || 0,
        currentStreak,
      )

      // CALCULATE SCORE WITH NEW FORMULA
      let questionScore = 0
      let speedBonus = 0
      let streakBonus = 0

      if (isCorrect) {
        // Base score
        questionScore = FORGE_SCORING.BASE_POINTS

        // Speed bonus (5-10 points based on how fast)
        const timeRatio = validatedTimeSpent / FORGE_SCORING.MAX_SECTION_TIME
        if (timeRatio <= 0.5) {
          speedBonus = FORGE_SCORING.SPEED_BONUS_MAX // 10 pts for very fast
        } else if (timeRatio <= 1.0) {
          // Linear scale from 10 to 5
          speedBonus = Math.floor(
            FORGE_SCORING.SPEED_BONUS_MAX - (timeRatio - 0.5) * 10,
          )
        } else {
          speedBonus = FORGE_SCORING.SPEED_BONUS_MIN // 5 pts for slow but correct
        }

        // Streak bonus
        streakBonus = currentStreak * FORGE_SCORING.STREAK_BONUS

        questionScore += speedBonus + streakBonus

        // Apply Powerup: Score Surge
        if (powerups.scoreSurge) {
          questionScore *= 2

          // Mark the SCORE_SURGE powerup as used to prevent double application in quiz phase
          const scoreSurgePowerup = activePowerups.find(
            p => p.powerupId === 'SCORE_SURGE' && !p.used
          )
          if (scoreSurgePowerup) {
            scoreSurgePowerup.used = true
            scoreSurgePowerup.effectApplied = true
          }
        }
      }

      // Update score tracking
      quizSession.forgeProgress.baseScore += isCorrect
        ? FORGE_SCORING.BASE_POINTS
        : 0
      quizSession.forgeProgress.speedBonusTotal += speedBonus
      quizSession.forgeProgress.streakBonusTotal += streakBonus
      quizSession.forgeProgress.score += questionScore

      // Add response with detailed breakdown
      quizSession.forgeProgress.responses.push({
        sectionNumber,
        userAnswer,
        isCorrect,
        timeSpent: validatedTimeSpent,
        answeredAt: new Date(),
        scoreBreakdown: {
          base: isCorrect ? FORGE_SCORING.BASE_POINTS : 0,
          speedBonus,
          streakBonus,
          total: questionScore,
        },
      })

      // If correct, unlock this section for reading
      if (isCorrect) {
        if (
          !quizSession.forgeProgress.unlockedSections.includes(sectionNumber)
        ) {
          quizSession.forgeProgress.unlockedSections.push(sectionNumber)
        }

        // Start reading timer
        currentTiming.readingStartTime = now
      }

      // console.time('SessionSave')
      // await quizSession.save({ session: mongoSession })
      // console.timeEnd('SessionSave')

      // Prepare response
      const response = {
        isCorrect,
        correctAnswer: section.mcq.correctIndex,
        streak: currentStreak,
        scoreBreakdown: {
          base: isCorrect ? FORGE_SCORING.BASE_POINTS : 0,
          speedBonus,
          streakBonus,
          total: questionScore,
        },
        totalScore: quizSession.forgeProgress.score,
        timing: {
          serverTime: now,
        },
      }

      // ALWAYS return reading content (correct OR incorrect OR timeout)
      response.readingContent = {
        sectionNumber,
        title: section.title,
        icon: section.icon,
        content: section.content,
        readingTime: FORGE_SCORING.SECTION_READ_TIME,
      }

      // Check if this was the last section
      if (sectionNumber === forgeArticle.sections.length - 1) {
        response.isLastSection = true
      }



      // QUEUED SAVE - Sequential processing to prevent race conditions
      enqueueWrite(sessionId, async () => {
        await quizSession.save()
      })

      return response
    // }) // End transaction
  } catch (err) {
      throw err
  }
  // finally {
  //   mongoSession.endSession()
  // }
}

/**
 * Advance to next section
 * Called after user finishes reading current section
 * @param {Object} params
 * @param {string} params.sessionId - Session ID
 * @returns {Promise<Object>} Next section question or completion status
 */
const advanceToNextSection = async ({ sessionId }) => {
  // const session = await mongoose.startSession() // REMOVED
  try {
    // return await session.withTransaction(async () => { // REMOVED
      // OPTIMIZATION: Use In-Memory Cached Session
      const quizSession = await getCachedSession(sessionId)
        // .session(session) // REMOVED

      if (!quizSession || quizSession.phase !== 'reading') {
        throw new Error('Invalid session or phase')
      }

      // Get article from cache
      let forgeArticle = await getCachedForgeArticle(quizSession.challenge.forgeArticle)

      // Fallback
      if (!forgeArticle) {
          const populatedChallenge = await QuickClashChallenge.findById(quizSession.challenge._id)
            .populate('forgeArticle')
            .lean()
            .session(session)
          forgeArticle = populatedChallenge.forgeArticle
      }
      const currentSectionIndex = quizSession.forgeProgress.currentSection

      const now = Date.now()

      // Update reading end time for current section
      const currentTiming = quizSession.forgeProgress.sectionTimings.find(
        t =>
          t.sectionNumber === currentSectionIndex &&
          t.readingStartTime &&
          !t.readingEndTime,
      )

      if (currentTiming) {
        currentTiming.readingEndTime = now
        currentTiming.readingTimeSpent = now - currentTiming.readingStartTime
      }

      // Check if we've completed all sections
      if (currentSectionIndex >= forgeArticle.sections.length - 1) {
        // Complete forge mode
        quizSession.forgeProgress.completed = true
        quizSession.forgeProgress.endTime = now

        // QUEUED SAVE - Sequential processing to prevent race conditions
        enqueueWrite(sessionId, async () => {
          await quizSession.save()
        })




        return {
          completed: true,
          totalScore: quizSession.forgeProgress.score,
          scoreBreakdown: {
            base: quizSession.forgeProgress.baseScore,
            speedBonus: quizSession.forgeProgress.speedBonusTotal,
            streakBonus: quizSession.forgeProgress.streakBonusTotal,
          },
          correctAnswers: quizSession.forgeProgress.correctAnswers,
          totalSections: forgeArticle.sections.length,
          maxStreak: quizSession.forgeProgress.maxStreak,
          nextPhase: 'quiz',
        }
      } else {
        // Move to next section
        const nextSectionNumber = currentSectionIndex + 1
        quizSession.forgeProgress.currentSection = nextSectionNumber

        // Initialize next section timing
        quizSession.forgeProgress.sectionTimings.push({
          sectionNumber: nextSectionNumber,
          questionStartTime: now,
          questionAnsweredTime: null,
          questionTimeSpent: null,
          readingStartTime: null,
          readingEndTime: null,
          readingTimeSpent: null,
        })

        // QUEUED SAVE - Sequential processing to prevent race conditions
        enqueueWrite(sessionId, async () => {
          await quizSession.save()
        })

        const nextSection = forgeArticle.sections[nextSectionNumber]



        // Return next question WITHOUT the correct answer

        return {
          completed: false,
          sectionNumber: nextSectionNumber,
          totalSections: forgeArticle.sections.length,
          title: nextSection.title,
          icon: nextSection.icon,
          question: nextSection.mcq.question,
          options: nextSection.mcq.options,
          hint: nextSection.mcq.hint || null,
          contextNugget: nextSection.mcq.contextNugget || null,
          readingTime: FORGE_SCORING.SECTION_READ_TIME,
          progress: {
            currentSection: nextSectionNumber,
            unlockedSections: quizSession.forgeProgress.unlockedSections,
            correctAnswers: quizSession.forgeProgress.correctAnswers,
            streak: quizSession.forgeProgress.streak,
            score: quizSession.forgeProgress.score,
          },
          timing: {
            serverTime: now,
          },
        }
        }
    // }) // End transaction
  } catch (err) {
      throw err
  }
  // finally {
  //   session.endSession()
  // }
}

/**
 * Get forge session summary
 * Returns overview of user's progress and all unlocked sections
 * @param {Object} params
 * @param {string} params.sessionId - Session ID
 * @returns {Promise<Object>} Session summary with all unlocked content
 */
const getForgeSummary = async ({ sessionId }) => {
  const quizSession = await QuickClashSession.findById(sessionId).populate({
    path: 'challenge',
    populate: {
      path: 'forgeArticle',
    },
  })

  if (!quizSession) {
    throw new Error('Session not found')
  }

  if (!quizSession.challenge.forgeArticle) {
    throw new Error('This challenge does not have a forge article')
  }

  const forgeArticle = quizSession.challenge.forgeArticle

  // Get all unlocked sections with their content
  const unlockedContent = quizSession.forgeProgress.unlockedSections.map(
    sectionNum => {
      const section = forgeArticle.sections[sectionNum]
      return {
        sectionNumber: sectionNum,
        title: section.title,
        icon: section.icon,
        content: section.content,
      }
    },
  )

  return {
    articleTitle: forgeArticle.title,
    progress: {
      currentSection: quizSession.forgeProgress.currentSection,
      totalSections: forgeArticle.sections.length,
      correctAnswers: quizSession.forgeProgress.correctAnswers,
      streak: quizSession.forgeProgress.streak,
      maxStreak: quizSession.forgeProgress.maxStreak,
      score: quizSession.forgeProgress.score,
    },
    unlockedSections: unlockedContent,
    responses: quizSession.forgeProgress.responses,
    completed: quizSession.forgeProgress.completed,
  }
}

/**
 * Get forge review - Full article with all sections for post-completion review
 * @param {Object} params
 * @param {string} params.sessionId - Session ID
 * @returns {Promise<Object>} Full article with completion stats
 */
const getForgeReview = async ({ sessionId }) => {
  const quizSession = await QuickClashSession.findById(sessionId).populate({
    path: 'challenge',
    populate: {
      path: 'forgeArticle',
    },
  })

  if (!quizSession) {
    throw new Error('Session not found')
  }

  if (!quizSession.challenge.forgeArticle) {
    throw new Error('This challenge does not have a forge article')
  }

  if (!quizSession.forgeProgress.completed) {
    throw new Error('Forge mode not completed yet')
  }

  const forgeArticle = quizSession.challenge.forgeArticle

  // Return ALL sections (unlocked + locked) for review
  const allSections = forgeArticle.sections.map((section, idx) => ({
    sectionNumber: idx,
    title: section.title,
    icon: section.icon,
    content: section.content,
    wasUnlocked: quizSession.forgeProgress.unlockedSections.includes(idx),
    response: quizSession.forgeProgress.responses.find(
      r => r.sectionNumber === idx,
    ),
  }))

  return {
    articleTitle: forgeArticle.title,
    sections: allSections,
    finalScore: quizSession.forgeProgress.score,
    scoreBreakdown: {
      base: quizSession.forgeProgress.baseScore || 0,
      speedBonus: quizSession.forgeProgress.speedBonusTotal || 0,
      streakBonus: quizSession.forgeProgress.streakBonusTotal || 0,
    },
    stats: {
      correctAnswers: quizSession.forgeProgress.correctAnswers,
      totalSections: forgeArticle.sections.length,
      maxStreak: quizSession.forgeProgress.maxStreak,
      totalTimeSpent: quizSession.forgeProgress.totalTimeSpent,
    },
  }
}

module.exports = {
  createSession,
  startReading,
  completeReading,
  checkReadingTimeout,
  getSessionDetails,
  completeQuiz,
  startForgeMode,
  submitForgeAnswer,
  advanceToNextSection,
  getForgeSummary,
  getForgeReview,
  getCachedSession, // Exported for powerup controller
}

