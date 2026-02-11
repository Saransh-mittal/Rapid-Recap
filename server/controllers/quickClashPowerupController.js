// controllers/quickClashPowerupController.js
const asyncHandler = require('express-async-handler')
const mongoose = require('mongoose')
const User = require('../model/userSchema')
const PlaySession = require('../model/quickClashSchemas/playSessionSchema')
const {
  donatePowerup,
  equipPowerup,
  unequipPowerup,
  POWERUPS,
} = require('../services/quickClashServices/quickClashPowerupService')
const {
  claimPowerupReward,
  getUnclaimedBattles,
  markBattleViewed,
  POWERUP_POOL,
} = require('../services/quickClashServices/quickClashPowerupRewardService')
const QuickClashSession = require('../model/quickClashSchemas/quickClashSessionSchema')
const globalEmitter = require('../eventEmitter')
const { getCachedSession } = require('../services/quickClashServices/quickClashSessionService')
const { enqueueWrite } = require('../utils/sessionWriteQueue')


// Helper to resolve player name
const getPlayerName = async userId => {
  if (!userId) return 'Teammate'
  try {
    // Try finding User
    const user = await User.findById(userId).select('name inGameName').lean()
    if (user) return user.inGameName || user.name || 'Teammate'

    // Try finding PlaySession
    const session = await PlaySession.findById(userId)
      .select('inGameName')
      .lean()
    if (session) return session.inGameName || 'Teammate'

    return 'Teammate'
  } catch (err) {
    console.error('Error fetching player name:', err)
    return 'Teammate'
  }
}

/**
 * @desc    Donate a powerup to the team pool
 * @route   POST /api/quickClash/team-battle/:battleId/powerup/donate
 * @access  Private
 */
const donatePowerupController = asyncHandler(async (req, res) => {
  const { battleId } = req.params
  const { teamId, powerupId } = req.body
  const userId = req.user._id

  const session = await mongoose.startSession()
  try {
    await session.withTransaction(async () => {
      const battle = await donatePowerup({
        battleId,
        teamId,
        userId,
        powerupId,
        session,
      })

      const donorName = await getPlayerName(userId)

      res.status(200).json({
        success: true,
        message: 'Powerup donated successfully',
        battle,
      })

      // Emit socket event for real-time updates
      globalEmitter.emit('quickClash:powerupDonated', {
        battleId,
        teamId,
        userId,
        powerupId,
        donatedBy: donorName,
      })
    })
  } catch (error) {
    console.error('Error donating powerup:', error)
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to donate powerup',
    })
  } finally {
    session.endSession()
  }
})

/**
 * @desc    Equip a powerup from the team pool
 * @route   POST /api/quickClash/team-battle/:battleId/powerup/equip
 * @access  Private
 */
const equipPowerupController = asyncHandler(async (req, res) => {
  const { battleId } = req.params
  const { teamId, powerupType } = req.body
  const userId = req.user._id

  const session = await mongoose.startSession()
  try {
    await session.withTransaction(async () => {
      const battle = await equipPowerup({
        battleId,
        teamId,
        userId,
        powerupType,
        session,
      })

      const equipperName = await getPlayerName(userId)

      res.status(200).json({
        success: true,
        message: 'Powerup equipped successfully',
        battle,
      })

      // Emit socket event for real-time updates
      globalEmitter.emit('quickClash:powerupEquipped', {
        battleId,
        teamId,
        userId,
        powerupType,
        equippedBy: equipperName,
      })
    })
  } catch (error) {
    console.error('Error equipping powerup:', error)
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to equip powerup',
    })
  } finally {
    session.endSession()
  }
})

/**
 * @desc    Unequip a powerup back to the team pool
 * @route   POST /api/quickClash/team-battle/:battleId/powerup/unequip
 * @access  Private
 */
const unequipPowerupController = asyncHandler(async (req, res) => {
  const { battleId } = req.params
  const { teamId, powerupType } = req.body
  const userId = req.user._id

  const session = await mongoose.startSession()
  try {
    await session.withTransaction(async () => {
      const battle = await unequipPowerup({
        battleId,
        teamId,
        userId,
        powerupType,
        session,
      })

      const unequipperName = await getPlayerName(userId)

      res.status(200).json({
        success: true,
        message: 'Powerup unequipped successfully',
        battle,
      })

      // Emit socket event for real-time updates
      globalEmitter.emit('quickClash:powerupUnequipped', {
        battleId,
        teamId,
        userId,
        powerupType,
        unequippedBy: unequipperName,
      })
    })
  } catch (error) {
    console.error('Error unequipping powerup:', error)
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to unequip powerup',
    })
  } finally {
    session.endSession()
  }
})

/**
 * @desc    Get all available powerup definitions
 * @route   GET /api/quickClash/powerups/definitions
 * @access  Private
 */
const getPowerupDefinitions = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    powerups: POWERUPS,
  })
})

/**
 * @desc    Use a powerup during a session
 * @route   POST /api/quickClash/session/:sessionId/powerup/use
 * @access  Private
 *
 * OPTIMISTIC UPDATE: Returns immediately with effect, persistence is queued
 */
const usePowerupController = asyncHandler(async (req, res) => {
  const { sessionId } = req.params
  const { powerupId, questionId } = req.body
  const userId = req.user?._id || req.player?._id

  // 1. Get session from cache (fast) or DB
  const session = await getCachedSession(sessionId)
  if (!session) {
    res.status(404)
    throw new Error('Session not found')
  }

  // Validate user owns this session
  if (session.user.toString() !== userId.toString()) {
    res.status(403)
    throw new Error('Unauthorized session access')
  }

  const isReadingPhase = session.phase === 'reading'
  const isOracleEye = powerupId === 'ORACLES_EYE'
  const isScoreSurgeInReading = isReadingPhase && powerupId === 'SCORE_SURGE'
  let oracleUsageKey = null

  // Guardrail: only allow powerups that have an explicit effect path for this phase.
  // Prevents passive/unhandled powerups from being consumed by direct API calls.
  const allowedInReading = new Set(['ORACLES_EYE', 'TIME_WARP', 'SCORE_SURGE'])
  const allowedOutsideReading = new Set(['ORACLES_EYE', 'TIME_WARP'])
  const isAllowedForPhase = isReadingPhase
    ? allowedInReading.has(powerupId)
    : allowedOutsideReading.has(powerupId)

  if (!isAllowedForPhase) {
    return res.status(400).json({
      success: false,
      message: isReadingPhase
        ? `${powerupId} cannot be manually used in Forge phase`
        : `${powerupId} is passive in Quiz phase and applies automatically when conditions are met`,
    })
  }

  // Oracle's Eye rule: max once per question in BOTH forge and quiz phases
  if (isOracleEye) {
    if (!isReadingPhase && !questionId) {
      res.status(400)
      throw new Error('Question ID required for Oracles Eye')
    }

    // Forge tracks usage by section; Quiz tracks usage by questionId
    oracleUsageKey = isReadingPhase
      ? `forge_${session.forgeProgress?.currentSection ?? 0}`
      : questionId

    const powerupUsage = session.quizAttempt?.powerupUsage || {}
    const questionUsage = powerupUsage[oracleUsageKey] || {}
    if (questionUsage.ORACLES_EYE) {
      return res.status(200).json({
        success: true,
        alreadyUsed: true,
        message: "Oracle's Eye can only be used once per question",
        effect: null,
      })
    }
  }

  // 2. Validate powerup exists and not used (in-memory check)
  const activePowerups = session.activePowerups || []
  const powerup = activePowerups.find(p => p.powerupId === powerupId && !p.used)
  if (!powerup) {
    // Return graceful response for duplicate attempts (handles double-clicks)
    return res.status(200).json({
      success: true,
      alreadyUsed: true,
      message: 'Powerup already used',
      effect: null
    })
  }

  // 3. Calculate effect synchronously (before any async operations)
  let effect = {}

  if (isReadingPhase) {
    // --- FORGE MODE LOGIC ---
    // Need to get the full forgeArticle with sections
    if (!session.challenge) {
      await session.populate('challenge')
    }

    // Get forgeArticle - check cache first, DB as fallback
    let forgeArticle = null
    const forgeArticleId = session.challenge?.forgeArticle?._id || session.challenge?.forgeArticle

    if (forgeArticleId) {
      const cache = require('memory-cache')
      const forgeArticleCacheKey = `forge-article-${forgeArticleId}`

      if (session.challenge.forgeArticle?.sections) {
        forgeArticle = session.challenge.forgeArticle
      } else if (cache.get(forgeArticleCacheKey)) {
        forgeArticle = cache.get(forgeArticleCacheKey)
      }
      else {
        const ForgeArticle = require('../model/quickClashSchemas/forgeArticleSchema')
        forgeArticle = await ForgeArticle.findById(forgeArticleId).lean()
        if (forgeArticle) {
          cache.put(forgeArticleCacheKey, forgeArticle, 600000)
        }
      }
    }


    if (!forgeArticle || !forgeArticle.sections) {
      res.status(404)
      throw new Error('Forge article not found')
    }

    const currentSectionIndex = session.forgeProgress?.currentSection || 0
    const section = forgeArticle.sections[currentSectionIndex]

    if (!section) {
      res.status(400)
      throw new Error('Current section not found')
    }

    if (powerupId === 'ORACLES_EYE') {
      const correctIndex = section.mcq.correctIndex
      const allIndices = [0, 1, 2, 3]
      const incorrectIndices = allIndices.filter(i => i !== correctIndex)
      const shuffledIncorrect = incorrectIndices.sort(() => 0.5 - Math.random())
      const indicesToRemove = shuffledIncorrect.slice(0, 2)

      effect = {
        type: 'REMOVE_OPTIONS',
        optionsToRemove: indicesToRemove
      }
    } else if (powerupId === 'TIME_WARP') {
      effect = {
        type: 'TIME_EXTENSION',
        extraTime: 15000 // 15 seconds
      }
    } else if (powerupId === 'SCORE_SURGE') {
      effect = {
        type: 'SCORE_SURGE_READY',
        multiplier: 2,
      }
    }
  } else {
    // --- QUIZ MODE LOGIC ---
    if (powerupId === 'ORACLES_EYE') {
      if (!questionId) {
        res.status(400)
        throw new Error('Question ID required for Oracles Eye')
      }

      if (!session.quiz) {
        await session.populate('quiz')
      }

      // Find correct answer (using mapping)
      const mapping = session.quizAttempt?.answerMappings?.[questionId]
      const originalQuestion = session.quiz.questions.find(q => q._id.toString() === questionId)

      if (!originalQuestion) {
        res.status(404)
        throw new Error('Question not found')
      }

      const correctAnswerKey = mapping ? mapping.newAnswer : originalQuestion.answer

      // Get all options (shuffled)
      const options = session.quizAttempt?.shuffledOptions?.[questionId] || originalQuestion.options
      const allKeys = Object.keys(options)

      // Filter incorrect keys
      const incorrectKeys = allKeys.filter(k => k !== correctAnswerKey)

      // Randomly pick 2 to remove
      const shuffledIncorrect = incorrectKeys.sort(() => 0.5 - Math.random())
      const keysToRemove = shuffledIncorrect.slice(0, 2)

      effect = {
        type: 'REMOVE_OPTIONS',
        optionsToRemove: keysToRemove
      }
    } else if (powerupId === 'TIME_WARP') {
      effect = {
        type: 'TIME_EXTENSION',
        extraTime: 15000 // 15 seconds
      }
    }
  }

  // Score Surge in Forge is consumed on answer submit (authoritative scoring path)
  // to avoid losing the multiplier before score calculation.
  const shouldDeferUsageMark = isScoreSurgeInReading

  if (!shouldDeferUsageMark) {
    // 4. Mark as used IN MEMORY immediately (prevents double-click race)
    powerup.used = true
    powerup.usedAt = new Date()

    if (isOracleEye && oracleUsageKey) {
      if (!session.quizAttempt) session.quizAttempt = {}
      if (!session.quizAttempt.powerupUsage) session.quizAttempt.powerupUsage = {}
      const existingUsage = session.quizAttempt.powerupUsage[oracleUsageKey] || {}
      session.quizAttempt.powerupUsage[oracleUsageKey] = {
        ...existingUsage,
        ORACLES_EYE: true,
        usedAt: new Date(),
      }
    }

    // 5. Queue persistence (fire and forget)
    enqueueWrite(sessionId, async () => {
      try {
        // Fetch fresh session from DB
        const freshSession = await QuickClashSession.findById(sessionId)
        if (freshSession) {
          const targetPowerup = freshSession.activePowerups.find(
            p => p.powerupId === powerupId && !p.used
          )
          if (targetPowerup) {
            targetPowerup.used = true
            targetPowerup.usedAt = new Date()

            if (isOracleEye && oracleUsageKey) {
              if (!freshSession.quizAttempt) freshSession.quizAttempt = {}
              if (!freshSession.quizAttempt.powerupUsage) {
                freshSession.quizAttempt.powerupUsage = {}
              }
              const existingUsage =
                freshSession.quizAttempt.powerupUsage[oracleUsageKey] || {}
              freshSession.quizAttempt.powerupUsage[oracleUsageKey] = {
                ...existingUsage,
                ORACLES_EYE: true,
                usedAt: new Date(),
              }
              freshSession.markModified('quizAttempt.powerupUsage')
            }

            await freshSession.save()
          }
        }
      } catch (err) {
        console.error(`[Powerup] Failed to persist ${powerupId} usage:`, err.message)
      }
    })
  }

  // 6. Respond immediately with effect
  res.status(200).json({
    success: true,
    effect,
    powerupId,
    message: 'Powerup applied successfully'
  })
})




/**
 * @desc    Get user's powerup inventory
 * @route   GET /api/quickClash/powerups/inventory
 * @access  Private
 */
const getUserInventory = asyncHandler(async (req, res) => {
  const userId = req.user._id
  const Inventory = require('../model/inventorySchema')

  const inventory = await Inventory.findOne({ user: userId }).populate('abilities.abilityId')

  if (!inventory) {
    return res.status(200).json({
      success: true,
      inventory: []
    })
  }

  // Format for frontend
  const formattedInventory = inventory.abilities.map(item => {
      if (!item.abilityId) return null
      // Map Ability type to Powerup ID if possible, or use name
      // We need a way to map "Time Warp" -> "TIME_WARP"
      // Let's reverse map from POWERUPS constant
      const powerupEntry = Object.entries(POWERUPS).find(([key, val]) => val.name === item.abilityId.name)
      const powerupId = powerupEntry ? powerupEntry[0] : null

      if (!powerupId) return null // Skip non-powerup abilities

      return {
          powerupId: powerupId,
          name: item.abilityId.name,
          description: item.abilityId.description,
          cost: POWERUPS[powerupId].cost,
          count: item.quantity
      }
  }).filter(Boolean)

  res.status(200).json({
    success: true,
    inventory: formattedInventory
  })
})

/**
 * @desc    Claim powerup reward from a completed battle
 * @route   POST /api/quickClash/powerup/claim-reward
 * @access  Private
 */
const claimRewardController = asyncHandler(async (req, res) => {
  const { battleId } = req.body
  const userId = req.user._id

  if (!battleId) {
    res.status(400)
    throw new Error('Battle ID is required')
  }

  try {
    const result = await claimPowerupReward({ battleId, userId })

    res.status(200).json({
      success: true,
      message: result.message,
      powerupsAdded: result.powerupsAdded,
      housingSpaceEarned: result.housingSpaceEarned,
      individualWins: result.individualWins,
    })
  } catch (error) {
    console.error('Error claiming powerup reward:', error)
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to claim reward',
    })
  }
})

/**
 * @desc    Get unclaimed battles with powerup rewards
 * @route   GET /api/quickClash/powerup/unclaimed-battles
 * @access  Private
 */
const getUnclaimedBattlesController = asyncHandler(async (req, res) => {
  const userId = req.user._id

  try {
    const battles = await getUnclaimedBattles(userId)

    res.status(200).json({
      success: true,
      count: battles.length,
      battles,
    })
  } catch (error) {
    console.error('Error getting unclaimed battles:', error)
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to get unclaimed battles',
    })
  }
})

/**
 * @desc    Mark a battle as viewed (for popup dismissal)
 * @route   POST /api/quickClash/powerup/mark-viewed
 * @access  Private
 */
const markBattleViewedController = asyncHandler(async (req, res) => {
  const { battleId } = req.body
  const userId = req.user._id

  if (!battleId) {
    res.status(400)
    throw new Error('Battle ID is required')
  }

  try {
    const result = await markBattleViewed({ battleId, userId })

    res.status(200).json({
      success: true,
      viewedAt: result.viewedAt,
    })
  } catch (error) {
    console.error('Error marking battle as viewed:', error)
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to mark battle as viewed',
    })
  }
})

module.exports = {
  donatePowerupController,
  equipPowerupController,
  unequipPowerupController,
  getPowerupDefinitions,
  usePowerupController,
  getUserInventory,
  claimRewardController,
  getUnclaimedBattlesController,
  markBattleViewedController,
}
