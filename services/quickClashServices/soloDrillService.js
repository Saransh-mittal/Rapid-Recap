const mongoose = require('mongoose')
const cache = require('memory-cache')
const SoloDrillSession = require('../../model/quickClashSchemas/soloDrillSchema')
const SoloDrillLimit = require('../../model/quickClashSchemas/soloDrillLimitSchema')
const ForgeArticle = require('../../model/quickClashSchemas/forgeArticleSchema')
const {
  enqueueWrite,
  waitForQueueDrain,
  clearQueue,
} = require('../../utils/sessionWriteQueue')
const {
  awardCoins,
  getPlayerCoins,
} = require('./quickClashCoinService')

// Configuration
const SOLO_DRILL_CONFIG = {
  DAILY_FREE_DRILLS: 5,
  PURCHASE_COST: 50,
  DRILLS_PER_PURCHASE: 5,
  RESET_HOUR_UTC: 0,
}

const MAX_LOADOUT_HOUSING = 30
const SOLO_DRILL_CACHE_TTL = 8 * 60 * 1000
const SOLO_DRILL_QUEUE_DRAIN_TIMEOUT_MS = 2000

// Solo Drill powerup definitions (must stay aligned with Quick Clash balancing)
const SOLO_DRILL_POWERUPS = {
  TIME_WARP: {
    powerupId: 'TIME_WARP',
    name: 'Time Warp',
    cost: 12,
    type: 'active',
    phase: 'both',
    allowMultiple: true,
  },
  SCORE_SURGE: {
    powerupId: 'SCORE_SURGE',
    name: 'Score Surge',
    cost: 10,
    type: 'active',
    phase: 'both',
    allowMultiple: false,
  },
  ORACLES_EYE: {
    powerupId: 'ORACLES_EYE',
    name: "Oracle's Eye",
    cost: 8,
    type: 'active',
    phase: 'both',
    allowMultiple: true,
  },
  STREAK_SHIELD: {
    powerupId: 'STREAK_SHIELD',
    name: 'Streak Shield',
    cost: 5,
    type: 'passive',
    phase: 'forge',
    allowMultiple: false,
  },
  PRECISION_PROTOCOL: {
    powerupId: 'PRECISION_PROTOCOL',
    name: 'Precision Protocol',
    cost: 12,
    type: 'passive',
    phase: 'quiz',
    allowMultiple: false,
  },
}

const SINGLE_EQUIP_POWERUPS = new Set([
  'SCORE_SURGE',
  'STREAK_SHIELD',
  'PRECISION_PROTOCOL',
])

// Forge constants (reused)
const FORGE_SCORING = {
  BASE_POINTS: 7,
  SPEED_BONUS_MIN: 2,
  SPEED_BONUS_MAX: 4,
  STREAK_BONUS: 2,
  MAX_SECTION_TIME: 15000, // 15s per question
}

const getOrderedSections = (article) =>
  [...(article?.sections || [])].sort((a, b) => a.sectionNumber - b.sectionNumber)

const getForgeCorrectIndex = (section) => {
  if (!section?.mcq) return null
  if (typeof section.mcq.correctIndex === 'number') return section.mcq.correctIndex
  if (typeof section.mcq.correctOptionIndex === 'number') return section.mcq.correctOptionIndex
  return null
}

const getQuizCorrectAnswer = (question) => {
  if (!question) return null
  if (typeof question.answer === 'string') return question.answer
  if (typeof question.correctAnswer === 'string') return question.correctAnswer
  return null
}

const normalizePowerupId = (entry) =>
  String(entry?.powerupId || entry?.id || entry?.type || '')
    .trim()
    .toUpperCase()

const normalizeAndValidateLoadout = (rawLoadout = []) => {
  if (!Array.isArray(rawLoadout)) {
    throw new Error('Invalid loadout format')
  }

  const normalized = []
  const singleEquipSeen = new Set()
  let housingUsed = 0

  for (const entry of rawLoadout) {
    const powerupId = normalizePowerupId(entry)
    const definition = SOLO_DRILL_POWERUPS[powerupId]

    if (!definition) {
      throw new Error(`Invalid powerup in loadout: ${powerupId || 'UNKNOWN'}`)
    }

    if (SINGLE_EQUIP_POWERUPS.has(powerupId)) {
      if (singleEquipSeen.has(powerupId)) {
        throw new Error(`${definition.name} can only be equipped once`)
      }
      singleEquipSeen.add(powerupId)
    }

    if (housingUsed + definition.cost > MAX_LOADOUT_HOUSING) {
      throw new Error('Loadout housing exceeded (max 30)')
    }

    housingUsed += definition.cost
    normalized.push({
      powerupId: definition.powerupId,
      type: definition.type,
      cost: definition.cost,
      phase: definition.phase,
    })
  }

  return {
    loadout: normalized,
    housingUsed,
  }
}

const getSoloSessionCacheKey = (sessionId) => `solo-session-${sessionId}`
const getSoloForgeArticleCacheKey = (articleId) => `solo-forge-article-${articleId}`
const getSoloQuizCacheKey = (sessionId) => `solo-quiz-${sessionId}`
const getSoloQueueKey = (sessionId) => `solo-drill:${sessionId}`

const createRecoverableSoloSyncError = (message, details = {}) => {
  const error = new Error(message)
  error.code = 'SOLO_DRILL_BACKEND_SYNC_FAILED'
  error.canRetry = true
  error.details = details
  return error
}

const setCachedSoloSession = (sessionDoc) => {
  if (!sessionDoc?._id) return
  cache.put(
    getSoloSessionCacheKey(sessionDoc._id.toString()),
    sessionDoc,
    SOLO_DRILL_CACHE_TTL
  )
}

const getCachedSoloSession = async (sessionId) => {
  const cacheKey = getSoloSessionCacheKey(sessionId)
  let session = cache.get(cacheKey)

  if (!session) {
    session = await SoloDrillSession.findById(sessionId).populate('forgeArticle')
    if (session) {
      setCachedSoloSession(session)
    }
  }

  return session
}

const getCachedSoloForgeArticle = async (forgeArticleId) => {
  if (!forgeArticleId) return null
  const articleId = forgeArticleId.toString()
  const cacheKey = getSoloForgeArticleCacheKey(articleId)

  let article = cache.get(cacheKey)
  if (!article) {
    article = await ForgeArticle.findById(articleId).lean()
    if (article) {
      cache.put(cacheKey, article, SOLO_DRILL_CACHE_TTL)
    }
  }

  return article
}

const queueSoloSessionSave = (sessionDoc) => {
  if (!sessionDoc?._id) return

  const sessionId = sessionDoc._id.toString()
  const queueKey = getSoloQueueKey(sessionId)

  enqueueWrite(queueKey, async () => {
    await sessionDoc.save()
    setCachedSoloSession(sessionDoc)
  })
}

const ensureSoloQueueSyncedWithFallback = async (sessionId) => {
  const queueKey = getSoloQueueKey(sessionId)
  const queueStatus = await waitForQueueDrain(
    queueKey,
    SOLO_DRILL_QUEUE_DRAIN_TIMEOUT_MS
  )

  if (!queueStatus.failed) {
    return
  }

  const cachedSession = cache.get(getSoloSessionCacheKey(sessionId))

  if (cachedSession) {
    try {
      await cachedSession.save()
      setCachedSoloSession(cachedSession)
      clearQueue(queueKey)
      return
    } catch (error) {
      clearQueue(queueKey)
      throw createRecoverableSoloSyncError(
        'Solo drill session sync failed. Please retry.',
        {
          queueError: queueStatus.error,
          fallbackError: error.message,
        }
      )
    }
  }

  // No in-memory session to recover from. Reset queue state and continue.
  clearQueue(queueKey)
}

// ============================================================================
// LIMIT MANAGEMENT
// ============================================================================

/**
 * Get drill limits for a user, resetting if needed
 */
const getDrillLimits = async ({ userId }) => {
  let limits = await SoloDrillLimit.findOne({ user: userId })

  if (!limits) {
    limits = await SoloDrillLimit.create({
      user: userId,
      dailyDrillsUsed: 0,
      lastResetDate: new Date(),
    })
  }

  // Check for daily reset
  const now = new Date()
  const lastReset = new Date(limits.lastResetDate)

  // simple check: if day/month/year calls diff
  // A robust check: compare dates at midnight UTC
  const todayMidnight = new Date(now)
  todayMidnight.setUTCHours(0, 0, 0, 0)

  const lastResetMidnight = new Date(lastReset)
  lastResetMidnight.setUTCHours(0, 0, 0, 0)

  if (todayMidnight > lastResetMidnight) {
    limits.dailyDrillsUsed = 0
    limits.lastResetDate = now
    await limits.save()
  }

  const dailyRemaining = Math.max(0, SOLO_DRILL_CONFIG.DAILY_FREE_DRILLS - limits.dailyDrillsUsed)
  const totalRemaining = dailyRemaining + limits.purchasedDrillsRemaining

  return {
    dailyDrillsRemaining: dailyRemaining,
    purchasedDrillsRemaining: limits.purchasedDrillsRemaining,
    totalDrillsRemaining: totalRemaining,
    dailyUsed: limits.dailyDrillsUsed,
    nextReset: new Date(todayMidnight.getTime() + 24 * 60 * 60 * 1000),
  }
}

/**
 * Purchase extra drills
 */
const purchaseDrills = async ({ userId }) => {
  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    // 1. Check coin balance
    const currentCoins = await getPlayerCoins(userId, false)
    if (currentCoins < SOLO_DRILL_CONFIG.PURCHASE_COST) {
      throw new Error('Insufficient coins')
    }

    // 2. Deduct coins via service (negative amount)
    await awardCoins({
      playerId: userId,
      isSessionPlayer: false,
      amount: -SOLO_DRILL_CONFIG.PURCHASE_COST,
      reason: 'solo_drill_purchase',
      session,
    })

    // 3. Add drills
    const limits = await SoloDrillLimit.findOne({ user: userId }).session(session)
    if (!limits) {
      // Should exist if getDrillLimits was called, but safety check
      throw new Error('Limit record not found')
    }

    limits.purchasedDrillsRemaining += SOLO_DRILL_CONFIG.DRILLS_PER_PURCHASE
    limits.totalCoinSpent += SOLO_DRILL_CONFIG.PURCHASE_COST
    limits.purchaseHistory.push({
      purchasedAt: new Date(),
      drillsBought: SOLO_DRILL_CONFIG.DRILLS_PER_PURCHASE,
      coinsCost: SOLO_DRILL_CONFIG.PURCHASE_COST,
    })

    await limits.save({ session })
    await session.commitTransaction()

    return {
      success: true,
      purchasedDrillsRemaining: limits.purchasedDrillsRemaining,
      newCoinBalance: currentCoins - SOLO_DRILL_CONFIG.PURCHASE_COST,
    }
  } catch (error) {
    await session.abortTransaction()
    throw error
  } finally {
    session.endSession()
  }
}

/**
 * Consume a drill credit (Daily first, then purchased)
 */
const consumeDrill = async ({ userId }, session = null) => {
  const limits = await SoloDrillLimit.findOne({ user: userId }).session(session)
  if (!limits) throw new Error('Limit record not found')

  // Re-check reset logic strictly for consumption
  const now = new Date()
  const todayMidnight = new Date(now)
  todayMidnight.setUTCHours(0, 0, 0, 0)
  const lastResetMidnight = new Date(limits.lastResetDate)
  lastResetMidnight.setUTCHours(0, 0, 0, 0)

  if (todayMidnight > lastResetMidnight) {
    limits.dailyDrillsUsed = 0
    limits.lastResetDate = now
  }

  const dailyRemaining = Math.max(0, SOLO_DRILL_CONFIG.DAILY_FREE_DRILLS - limits.dailyDrillsUsed)

  let source = 'daily_free'

  if (dailyRemaining > 0) {
    limits.dailyDrillsUsed += 1
  } else if (limits.purchasedDrillsRemaining > 0) {
    limits.purchasedDrillsRemaining -= 1
    source = 'purchased'
  } else {
    throw new Error('No drills remaining')
  }

  limits.totalDrillsCompleted += 1 // Increment completed count (optimistic, real update on finish?)
  // Actually, better to increment `dailyDrillsUsed` here to prevent starting.
  // `totalDrillsCompleted` might be better updated on actual completion.
  // But let's stick to simple counters here.

  await limits.save({ session })
  return source
}


// ============================================================================
// SESSION MANAGEMENT
// ============================================================================

/**
 * Start a new Solo Drill Session
 */
const startDrillSession = async ({ userId, category, loadout }) => {
  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    const { loadout: sanitizedLoadout, housingUsed } = normalizeAndValidateLoadout(loadout || [])

    // 1. Consume drill credit
    const source = await consumeDrill({ userId }, session)

    // 2. Fetch a random playable article for the selected category.
    // Require both forge sections and quiz questions so the session can always transition to quiz.
    const playableFilter = {
      category,
      'sections.0': { $exists: true },
      'quickClashQuiz.questions.0': { $exists: true },
    }

    const count = await ForgeArticle.countDocuments(playableFilter)
    if (count === 0) throw new Error(`No articles found for category: ${category}`)

    const random = Math.floor(Math.random() * count)
    const article = await ForgeArticle.findOne(playableFilter).skip(random)

    if (!article) throw new Error('Article fetch failed')

    const orderedSections = getOrderedSections(article)
    const playableSections = orderedSections.slice(0, Math.min(orderedSections.length, 5))
    if (playableSections.length === 0) {
      throw new Error('Article has no playable sections')
    }

    // Determine valid start section from ordered playable sections
    const startSectionNum = playableSections[0].sectionNumber

    // 3. Create Session
    const drillSession = new SoloDrillSession({
      user: userId,
      category,
      forgeArticle: article._id,
      source,
      loadout: sanitizedLoadout,
      activePowerups: sanitizedLoadout.map(p => ({
        powerupId: p.powerupId,
        type: p.type,
        cost: p.cost,
        phase: p.phase,
        used: false
      })),
      loadoutHousingUsed: housingUsed,
      // Initialize forge progress
      forgeProgress: {
        currentSection: startSectionNum,
        unlockedSections: [startSectionNum],
        totalTimeAllowed: 100000,
        globalStartTime: new Date(),
        startTime: new Date(),
        oracleUsedSections: [],
      }
    })

    await drillSession.save({ session })
    await session.commitTransaction()

    // populate session
    const populatedSession = await SoloDrillSession.findById(drillSession._id).populate('forgeArticle')
    setCachedSoloSession(populatedSession)
    cache.put(
      getSoloForgeArticleCacheKey(article._id.toString()),
      article.toObject ? article.toObject() : article,
      SOLO_DRILL_CACHE_TTL
    )
    cache.del(getSoloQuizCacheKey(drillSession._id.toString()))

    // Construct initial question payload
    const initialForgeQuestion = constructForgeQuestionPayload(
      populatedSession,
      article,
      playableSections[0]
    )

    // Return session AND initial payload
    return {
      session: populatedSession,
      initialForgeQuestion
    }
  } catch (error) {
    await session.abortTransaction()
    throw error
  } finally {
    session.endSession()
  }
}

/**
 * Helper to construct the standardized question payload for frontend
 */
const constructForgeQuestionPayload = (session, article, section) => {
  const orderedSections = getOrderedSections(article)
  const playableSections = orderedSections.slice(0, Math.min(orderedSections.length, 5))
  const totalSections = playableSections.length

  return {
    sessionId: session._id,
    sectionNumber: section.sectionNumber,
    totalSections,
    title: section.title,
    icon: section.icon || '📖',
    question: section.mcq.question,
    // Keep canonical option order; frontend shuffles with index mapping.
    options: section.mcq.options,
    hint: section.mcq.hint || null,
    contextNugget: section.mcq.contextNugget || null,
    readingTime: 30,
    progress: {
      currentSection: section.sectionNumber,
      unlockedSections: session.forgeProgress?.unlockedSections || [section.sectionNumber],
      correctAnswers: session.forgeProgress?.correctAnswers || 0,
      streak: session.forgeProgress?.streak || 0,
      score: session.forgeScore || 0,
    },
    timing: {
      serverTime: Date.now(),
    },
  }
}

/**
 * Get session state
 */
const getDrillSession = async ({ sessionId, userId }) => {
  const session = await getCachedSoloSession(sessionId)
  if (!session) throw new Error('Session not found')
  if (session.user.toString() !== userId) throw new Error('Unauthorized')
  return session
}

// ============================================================================
// FORGE PHASE (Adapted from quickClashSessionService)
// ============================================================================

const submitForgeAnswer = async ({
  sessionId,
  userId,
  sectionNumber,
  answerIndex,
  timeSpent,
  powerups = {},
}) => {
  const session = await getCachedSoloSession(sessionId)
  if (!session) throw new Error('Session not found')
  if (session.user.toString() !== userId.toString()) throw new Error('Unauthorized')

  if (session.forgeProgress.completed) throw new Error('Forge phase already completed')
  if (session.forgeProgress.currentSection !== sectionNumber) throw new Error('Invalid section order')

  const article =
    session.forgeArticle?.sections
      ? session.forgeArticle
      : await getCachedSoloForgeArticle(session.forgeArticle)
  if (!article?.sections) {
    throw new Error('Forge article not found for session')
  }
  const section = article.sections.find(s => s.sectionNumber === sectionNumber)
  if (!section) throw new Error('Section not found in article')

  const correctIndex = getForgeCorrectIndex(section)
  if (typeof correctIndex !== 'number') {
    throw new Error('Section answer key is missing')
  }

  const safeTimeSpent = Number.isFinite(timeSpent)
    ? Math.max(0, timeSpent)
    : FORGE_SCORING.MAX_SECTION_TIME

  const isCorrect = correctIndex === answerIndex

  // Calculate Score
  let questionScore = 0
  let speedBonus = 0
  let streakBonus = 0

  if (isCorrect) {
    // Base
    questionScore = FORGE_SCORING.BASE_POINTS

    // Speed (max 4, min 2)
    // Map 0-15s to 4-2 pts roughly
    const speedRatio = Math.max(0, 1 - (safeTimeSpent / FORGE_SCORING.MAX_SECTION_TIME))
    speedBonus = Math.round(FORGE_SCORING.SPEED_BONUS_MIN + (speedRatio * (FORGE_SCORING.SPEED_BONUS_MAX - FORGE_SCORING.SPEED_BONUS_MIN)))

    // Streak
    streakBonus = session.forgeProgress.streak * FORGE_SCORING.STREAK_BONUS

    // Total
    questionScore += speedBonus + streakBonus

    // Update Streak
    session.forgeProgress.streak += 1
    session.forgeProgress.maxStreak = Math.max(session.forgeProgress.streak, session.forgeProgress.maxStreak)
    session.forgeProgress.correctAnswers += 1
  } else {
    // Check for Streak Shield powerup
    const shieldPowerup = session.activePowerups?.find(
      p =>
        p.powerupId === 'STREAK_SHIELD' &&
        (p.phase?.toLowerCase() === 'forge' || p.phase?.toLowerCase() === 'both') &&
        !p.used
    )

    if (shieldPowerup) {
      // Consume shield on first wrong answer to preserve streak once.
      shieldPowerup.used = true
      shieldPowerup.usedAt = new Date()
      shieldPowerup.effectApplied = true
    } else {
      session.forgeProgress.streak = 0
    }
  }

  // Apply Score Surge (if active)
  const scoreSurgeAlreadyConsumed = session.activePowerups?.some(
    p => p.powerupId === 'SCORE_SURGE' && p.used
  )
  const scoreSurge = session.activePowerups?.find(
    p => p.powerupId === 'SCORE_SURGE' && !p.used
  )
  if (isCorrect && scoreSurge && !scoreSurgeAlreadyConsumed && powerups?.scoreSurge) {
    questionScore *= 2
    scoreSurge.used = true
    scoreSurge.usedAt = new Date()
  }

  // Record Response
  session.forgeProgress.responses.push({
    sectionNumber,
    userAnswer: answerIndex,
    isCorrect,
    timeSpent: safeTimeSpent,
    scoreBreakdown: {
      base: isCorrect ? FORGE_SCORING.BASE_POINTS : 0,
      speedBonus,
      streakBonus,
      total: questionScore
    }
  })

  session.forgeScore += questionScore

  cache.del(getSoloQuizCacheKey(sessionId))
  setCachedSoloSession(session)
  queueSoloSessionSave(session)

  return {
    isCorrect,
    correct: isCorrect,
    correctAnswer: correctIndex,
    correctOption: correctIndex, // Backward compatibility
    score: questionScore,
    streak: session.forgeProgress.streak,
    totalScore: session.forgeScore,
    newTotalScore: session.forgeScore,
    // Include reading content for the reading phase
    readingContent: {
      title: section.title,
      icon: section.icon || '📖',
      body: section.content,
      keyPoints: section.keyPoints || [],
      relatedTopics: section.relatedTopics || [],
    },
    scoreBreakdown: {
      base: isCorrect ? FORGE_SCORING.BASE_POINTS : 0,
      speedBonus,
      streakBonus,
      total: questionScore
    }
  }
}

const advanceForge = async ({ sessionId, userId }) => {
  const session = await getCachedSoloSession(sessionId)
  if (!session) throw new Error('Session not found')
  if (session.user.toString() !== userId.toString()) throw new Error('Unauthorized')

  const article =
    session.forgeArticle?.sections
      ? session.forgeArticle
      : await getCachedSoloForgeArticle(session.forgeArticle)
  if (!article?.sections) {
    throw new Error('Forge article not found for session')
  }
  const orderedSections = getOrderedSections(article)
  const playableSections = orderedSections.slice(0, Math.min(orderedSections.length, 5))
  const currentSectionNum = session.forgeProgress.currentSection
  const currentSectionIndex = playableSections.findIndex(
    s => s.sectionNumber === currentSectionNum
  )

  if (currentSectionIndex === -1) {
    throw new Error('Current section is invalid')
  }

  const isLastPlayableSection = currentSectionIndex >= playableSections.length - 1

  if (isLastPlayableSection) {
    // Complete Forge - no more sections
    session.forgeProgress.completed = true
    session.forgeProgress.endTime = new Date()
    session.forgeProgress.totalTimeSpent = session.forgeProgress.endTime - session.forgeProgress.startTime
    // Start Quiz Phase
    session.quizAttempt.startTime = new Date()
    cache.del(getSoloQuizCacheKey(sessionId))
    setCachedSoloSession(session)
    queueSoloSessionSave(session)

    return {
      completed: true,
      totalScore: session.forgeScore,
      scoreBreakdown: {
        base: session.forgeProgress.correctAnswers * FORGE_SCORING.BASE_POINTS,
        speedBonus: 0,
        streakBonus: (session.forgeProgress.maxStreak || 0) * FORGE_SCORING.STREAK_BONUS,
      },
      correctAnswers: session.forgeProgress.correctAnswers || 0,
      totalSections: playableSections.length,
      maxStreak: session.forgeProgress.maxStreak || 0,
      nextPhase: 'quiz',
    }
  } else {
    const nextSection = playableSections[currentSectionIndex + 1]
    const nextSectionNum = nextSection.sectionNumber

    // Move to next section
    session.forgeProgress.currentSection = nextSectionNum
    if (!session.forgeProgress.unlockedSections.includes(nextSectionNum)) {
      session.forgeProgress.unlockedSections.push(nextSectionNum)
    }
    cache.del(getSoloQuizCacheKey(sessionId))
    setCachedSoloSession(session)
    queueSoloSessionSave(session)

    // Return next question WITHOUT the correct answer
    return {
      completed: false,
      sectionNumber: nextSectionNum,
      totalSections: playableSections.length,
      title: nextSection.title,
      icon: nextSection.icon || '📖',
      question: nextSection.mcq.question,
      options: nextSection.mcq.options,
      hint: nextSection.mcq.hint || null,
      contextNugget: nextSection.mcq.contextNugget || null,
      readingTime: 30,
      progress: {
        currentSection: nextSectionNum,
        unlockedSections: session.forgeProgress.unlockedSections,
        correctAnswers: session.forgeProgress.correctAnswers || 0,
        streak: session.forgeProgress.streak || 0,
        score: session.forgeScore || 0,
      },
      timing: {
        serverTime: Date.now(),
      }
    }
  }
}

// ============================================================================
// QUIZ PHASE & COMPLETION
// ============================================================================

const getSessionQuizQuestions = async ({ sessionId, userId }) => {
  // No queue drain needed here – quiz questions come from the cached article,
  // not from queued session writes. Removing the wait eliminates the 5-10s
  // delay on the "Preparing quiz phase…" screen.

  const cachedQuestions = cache.get(getSoloQuizCacheKey(sessionId))
  if (cachedQuestions) {
    return {
      success: true,
      questions: cachedQuestions,
      quizDuration: 50,
    }
  }

  const session = await getCachedSoloSession(sessionId)
  if (!session) throw new Error('Session not found')
  if (session.user.toString() !== userId.toString()) throw new Error('Unauthorized')

  const forgeArticle =
    session.forgeArticle?.quickClashQuiz
      ? session.forgeArticle
      : await getCachedSoloForgeArticle(session.forgeArticle)
  if (!forgeArticle?.quickClashQuiz?.questions) {
    throw new Error('Quiz not found for article')
  }

  const questions = forgeArticle?.quickClashQuiz?.questions || []
  if (!Array.isArray(questions) || questions.length === 0) {
    throw new Error('Quiz not found for article')
  }

  cache.put(getSoloQuizCacheKey(sessionId), questions, SOLO_DRILL_CACHE_TTL)

  if (!session.quizAttempt.startTime && session.status !== 'completed') {
    session.quizAttempt.startTime = new Date()
    setCachedSoloSession(session)
    queueSoloSessionSave(session)
  }

  return {
    success: true,
    questions,
    quizDuration: 50,
  }
}

const submitQuizAnswers = async ({ sessionId, userId, responses }) => {
  await ensureSoloQueueSyncedWithFallback(sessionId)

  const session = await getCachedSoloSession(sessionId)
  if (!session) throw new Error('Session not found')
  if (session.user.toString() !== userId.toString()) throw new Error('Unauthorized')

  if (session.status === 'completed') throw new Error('Session already completed')
  if (!Array.isArray(responses) || responses.length === 0) {
    throw new Error('Invalid quiz responses')
  }

  const forgeArticle =
    session.forgeArticle?.quickClashQuiz
      ? session.forgeArticle
      : await getCachedSoloForgeArticle(session.forgeArticle)
  const quiz = forgeArticle?.quickClashQuiz
  if (!quiz || !quiz.questions) throw new Error('Quiz not found for article')

  // Calculate Quiz Score (simplified RQM logic)
  let quizScore = 0
  let correctCount = 0

  responses.forEach(resp => {
    const question = quiz.questions.find(q => q._id.toString() === resp.questionId)
    const userAnswer = resp.userAnswer ?? resp.answer ?? ''
    const correctAnswer = getQuizCorrectAnswer(question)
    if (question && correctAnswer === userAnswer) {
      // 20 pts per correct answer (total 200 max)
      quizScore += 20
      correctCount += 1
    }
  })

  // Precision Protocol (Perfect Score Bonus)
  if (correctCount === quiz.questions.length) {
     const hasPerc = session.activePowerups?.find(p => p.powerupId === 'PRECISION_PROTOCOL' && !p.used)
     if (hasPerc) {
       quizScore += 50
       hasPerc.used = true
     }
  }

  // Score Surge (Quiz Passive): apply 1.1x only if no Surge was consumed in Forge.
  const scoreSurgeConsumedEarlier = session.activePowerups?.some(
    p => p.powerupId === 'SCORE_SURGE' && p.used
  )
  const scoreSurgeForQuiz = session.activePowerups?.find(
    p =>
      p.powerupId === 'SCORE_SURGE' &&
      !p.used &&
      (p.phase?.toLowerCase() === 'quiz' || p.phase?.toLowerCase() === 'both')
  )
  if (!scoreSurgeConsumedEarlier && scoreSurgeForQuiz) {
    quizScore = Math.round(quizScore * 1.1)
    scoreSurgeForQuiz.used = true
    scoreSurgeForQuiz.usedAt = new Date()
  }

  // Save Quiz Attempt
  session.quizAttempt.responses = responses.map(r => ({
    questionId: r.questionId,
    userAnswer: r.userAnswer ?? r.answer ?? '',
    isCorrect: getQuizCorrectAnswer(
      quiz.questions.find(q => q._id.toString() === r.questionId)
    ) === (r.userAnswer ?? r.answer ?? ''),
    timeSpent: Number.isFinite(r.timeSpent) ? r.timeSpent : 0,
  }))
  session.quizAttempt.completed = true
  session.quizAttempt.endTime = new Date()

  session.quizScore = quizScore
  session.totalScore = session.forgeScore + session.quizScore

  // Benchmark
  if (session.totalScore >= 200) session.benchmark = 'diamond'
  else if (session.totalScore >= 150) session.benchmark = 'gold'
  else if (session.totalScore >= 100) session.benchmark = 'silver'
  else if (session.totalScore >= 50) session.benchmark = 'bronze'
  else session.benchmark = 'rookie'

  session.status = 'completed'
  session.completedAt = new Date()

  await session.save()
  setCachedSoloSession(session)
  cache.del(getSoloQuizCacheKey(sessionId))
  clearQueue(getSoloQueueKey(sessionId))

  return {
    totalScore: session.totalScore,
    benchmark: session.benchmark,
    forgeScore: session.forgeScore,
    quizScore: session.quizScore,
  }
}

const getCategories = async () => {
   // Dynamically fetch unique categories from ForgeArticle collection
   const categories = await ForgeArticle.distinct('category')
   return categories.filter(cat => cat) // Filter out any null/undefined
}

const getUserDrillStats = async ({ userId }) => {
  const sessions = await SoloDrillSession.find({
    user: userId,
    status: 'completed'
  }).select('category totalScore benchmark')

  const stats = {
    totalDrills: sessions.length,
    byBenchmark: {
      diamond: 0,
      gold: 0,
      silver: 0,
      bronze: 0,
      rookie: 0
    },
    byCategory: {}
  }

  sessions.forEach(s => {
    if (s.benchmark) stats.byBenchmark[s.benchmark] = (stats.byBenchmark[s.benchmark] || 0) + 1

    if (!stats.byCategory[s.category]) {
      stats.byCategory[s.category] = { count: 0, bestScore: 0 }
    }
    stats.byCategory[s.category].count += 1
    stats.byCategory[s.category].bestScore = Math.max(stats.byCategory[s.category].bestScore, s.totalScore)
  })

  return stats
}

const startForge = async ({ sessionId, userId }) => {
  const session = await getCachedSoloSession(sessionId)
  if (!session) throw new Error('Session not found')
  if (session.user.toString() !== userId.toString()) throw new Error('Unauthorized')

  const article =
    session.forgeArticle?.sections
      ? session.forgeArticle
      : await getCachedSoloForgeArticle(session.forgeArticle)
  if (!article || !article.sections || article.sections.length === 0) {
    throw new Error('Article not found or has no sections')
  }

  const orderedSections = getOrderedSections(article)
  const playableSections = orderedSections.slice(0, Math.min(orderedSections.length, 5))
  const currentSectionNum = session.forgeProgress.currentSection
  let currentSection = playableSections.find(s => s.sectionNumber === currentSectionNum)
  let shouldPersistSession = false

  if (!currentSection) {
    currentSection = playableSections[0]
    session.forgeProgress.currentSection = currentSection.sectionNumber
    shouldPersistSession = true
    if (!session.forgeProgress.unlockedSections?.length) {
      session.forgeProgress.unlockedSections = [currentSection.sectionNumber]
    } else if (!session.forgeProgress.unlockedSections.includes(currentSection.sectionNumber)) {
      session.forgeProgress.unlockedSections.push(currentSection.sectionNumber)
    }
  }

  if (!currentSection) {
    throw new Error(`Section ${currentSectionNum} not found in article`)
  }

  // Initialize timing if not already set
  if (!session.forgeProgress.startTime) {
    session.forgeProgress.startTime = new Date()
    shouldPersistSession = true
  }

  if (shouldPersistSession) {
    await session.save()
    setCachedSoloSession(session)
  }

  return {
    sectionNumber: currentSection.sectionNumber,
    totalSections: playableSections.length,
    title: currentSection.title,
    icon: currentSection.icon || '📖',
    question: currentSection.mcq.question,
    options: currentSection.mcq.options,
    hint: currentSection.mcq.hint || null,
    contextNugget: currentSection.mcq.contextNugget || null,
    readingTime: 30,
    progress: {
      currentSection: currentSection.sectionNumber,
      unlockedSections: session.forgeProgress.unlockedSections || [currentSection.sectionNumber],
      correctAnswers: session.forgeProgress.correctAnswers || 0,
      streak: session.forgeProgress.streak || 0,
      score: session.forgeScore || 0,
    },
    timing: {
      serverTime: Date.now(),
    }
  }
}

// Powerup handling for Solo Drill
const usePowerup = async ({ sessionId, userId, powerupId, questionId }) => {
  const session = await getCachedSoloSession(sessionId)
  if (!session) throw new Error('Session not found')
  if (session.user.toString() !== userId.toString()) throw new Error('Unauthorized')

  const normalizedPowerupId = String(powerupId || '').toUpperCase()
  const forgeArticle =
    session.forgeArticle?.sections
      ? session.forgeArticle
      : await getCachedSoloForgeArticle(session.forgeArticle)
  if (!forgeArticle?.sections) {
    throw new Error('Forge article not found for session')
  }
  let shouldPersist = false

  // Find the first unused active powerup instance
  const powerup = session.activePowerups?.find(
    p => p.powerupId === normalizedPowerupId && !p.used
  )
  if (!powerup) throw new Error('Powerup not found or already used')

  let effect = { type: 'NONE' }

  switch (normalizedPowerupId) {
    case 'ORACLES_EYE':
      // Quiz phase: eliminate 2 incorrect option keys ('a', 'b', ...)
      if (questionId) {
        const questionIdStr = questionId.toString()
        const usedQuestionIds = session.quizAttempt?.oracleUsedQuestionIds || []
        if (usedQuestionIds.includes(questionIdStr)) {
          return { success: true, alreadyUsed: true, effect: null }
        }

        const quizQuestions = forgeArticle?.quickClashQuiz?.questions || []
        const question = quizQuestions.find(q => q._id.toString() === questionId.toString())
        if (!question) {
          throw new Error('Question not found')
        }

        const correctAnswer = getQuizCorrectAnswer(question)
        const optionKeys = Object.keys(question.options || {})
        const incorrectKeys = optionKeys.filter(key => key !== correctAnswer)
        const shuffled = incorrectKeys.sort(() => Math.random() - 0.5)

        effect = {
          type: 'REMOVE_OPTIONS',
          optionsToRemove: shuffled.slice(0, 2),
        }

        if (!session.quizAttempt.oracleUsedQuestionIds) {
          session.quizAttempt.oracleUsedQuestionIds = []
        }
        session.quizAttempt.oracleUsedQuestionIds.push(questionIdStr)
        shouldPersist = true
      } else {
        // Forge phase: eliminate 2 incorrect option indexes (0-3)
        const currentSectionNum = session.forgeProgress.currentSection
        const usedSections = session.forgeProgress?.oracleUsedSections || []
        if (usedSections.includes(currentSectionNum)) {
          return { success: true, alreadyUsed: true, effect: null }
        }

        const section = forgeArticle.sections.find(
          s => s.sectionNumber === currentSectionNum
        )
        if (!section) {
          throw new Error('Section not found')
        }

        const correctIndex = getForgeCorrectIndex(section)
        if (typeof correctIndex !== 'number') {
          throw new Error('Section answer key is missing')
        }
        const incorrectIndices = [0, 1, 2, 3].filter(i => i !== correctIndex)
        const shuffled = incorrectIndices.sort(() => Math.random() - 0.5)
        effect = {
          type: 'REMOVE_OPTIONS',
          optionsToRemove: shuffled.slice(0, 2),
        }

        if (!session.forgeProgress.oracleUsedSections) {
          session.forgeProgress.oracleUsedSections = []
        }
        session.forgeProgress.oracleUsedSections.push(currentSectionNum)
        shouldPersist = true
      }
      powerup.used = true
      powerup.usedAt = new Date()
      shouldPersist = true
      break

    case 'TIME_WARP':
      effect = { type: 'TIME_EXTENSION', seconds: 15 }
      powerup.used = true
      powerup.usedAt = new Date()
      shouldPersist = true
      break

    case 'SCORE_SURGE':
      // Enforce single-consumption per session path, even on legacy sessions
      if (session.activePowerups?.some(p => p.powerupId === 'SCORE_SURGE' && p.used)) {
        return { success: true, alreadyUsed: true, effect: null }
      }
      // Already handled in submitForgeAnswer via req.body.powerups
      effect = { type: 'SCORE_MULTIPLIER', multiplier: 2 }
      // Don't mark as used here - submitForgeAnswer does that
      break

    default:
      effect = { type: 'UNKNOWN' }
  }

  if (shouldPersist) {
    setCachedSoloSession(session)
    queueSoloSessionSave(session)
  }

  return { success: true, effect }
}

/**
 * Get paginated drill history for a user (completed sessions only)
 */
const getDrillHistory = async ({ userId, page = 1, limit = 10 }) => {
  const skip = (page - 1) * limit
  const safeLimit = Math.min(Math.max(1, limit), 50)

  const [sessions, total] = await Promise.all([
    SoloDrillSession.find({
      user: userId,
      status: 'completed',
    })
      .select(
        'category totalScore forgeScore quizScore benchmark completedAt ' +
        'forgeProgress.responses forgeProgress.correctAnswers forgeProgress.maxStreak ' +
        'quizAttempt.responses forgeArticle'
      )
      .populate('forgeArticle', 'title sections quickClashQuiz')
      .sort({ completedAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .lean(),
    SoloDrillSession.countDocuments({
      user: userId,
      status: 'completed',
    }),
  ])

  return {
    sessions,
    page,
    limit: safeLimit,
    total,
    hasMore: skip + sessions.length < total,
  }
}

module.exports = {
  getDrillLimits,
  purchaseDrills,
  startDrillSession,
  getDrillSession,
  startForge,
  submitForgeAnswer,
  advanceForge,
  getSessionQuizQuestions,
  submitQuizAnswers,
  getCategories,
  getUserDrillStats,
  usePowerup,
  getDrillHistory,
}
