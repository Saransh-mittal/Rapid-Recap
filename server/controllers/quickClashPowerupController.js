// controllers/quickClashPowerupController.js
const asyncHandler = require('express-async-handler')
const mongoose = require('mongoose')
const {
  donatePowerup,
  equipPowerup,
  unequipPowerup,
  POWERUPS,
} = require('../services/quickClashServices/quickClashPowerupService')
const QuickClashSession = require('../model/quickClashSchemas/quickClashSessionSchema')

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

      res.status(200).json({
        success: true,
        message: 'Powerup donated successfully',
        battle,
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

      res.status(200).json({
        success: true,
        message: 'Powerup equipped successfully',
        battle,
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

      res.status(200).json({
        success: true,
        message: 'Powerup unequipped successfully',
        battle,
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
 */
const usePowerupController = asyncHandler(async (req, res) => {
  const { sessionId } = req.params
  const { powerupId, questionId } = req.body
  const userId = req.user._id

  // 1. Validate Session
  const session = await QuickClashSession.findById(sessionId).populate('quiz')
  if (!session || session.user.toString() !== userId.toString()) {
    res.status(404)
    throw new Error('Session not found or unauthorized')
  }

  // 2. Validate Powerup
  const powerup = session.activePowerups.find(p => p.powerupId === powerupId && !p.used)
  if (!powerup) {
    res.status(400)
    throw new Error('Powerup not available or already used')
  }

  // 3. Apply Logic
  let effect = {}
  if (session.phase === 'reading') {
    // --- FORGE MODE LOGIC ---
    // Ensure forgeArticle is populated
    if (!session.challenge.forgeArticle) {
       await session.populate({ path: 'challenge', populate: { path: 'forgeArticle' } })
    }
    const forgeArticle = session.challenge.forgeArticle
    if (!forgeArticle) {
      res.status(404)
      throw new Error('Forge article not found')
    }

    const currentSectionIndex = session.forgeProgress.currentSection
    const section = forgeArticle.sections[currentSectionIndex]

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
    }
  } else {
    // --- QUIZ MODE LOGIC ---
    if (powerupId === 'ORACLES_EYE') {
      if (!questionId) {
        res.status(400)
        throw new Error('Question ID required for Oracles Eye')
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
    }
  }

  // 4. Mark as Used
  powerup.used = true
  await session.save()

  res.status(200).json({
    success: true,
    effect
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

module.exports = {
  donatePowerupController,
  equipPowerupController,
  unequipPowerupController,
  getPowerupDefinitions,
  usePowerupController,
  getUserInventory,
}


