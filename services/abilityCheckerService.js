// services/abilityCheckerService.js

const Ability = require('../model/abilitySchema')
const Inventory = require('../model/inventorySchema')
const QuizAttempt = require('../model/quizAttemptSchema')

/**
 * Check QuinBoost ability status
 */
const checkQuinBoostStatus = async ({ userId, session = null }) => {
  try {
    const today = new Date()
    today.setUTCHours(0, 0, 0, 0)

    // Get today's quiz attempts
    const quizAttempts = await QuizAttempt.find({
      user: userId,
      createdAt: { $gte: today },
    }).session(session)

    const quizLeftToGetQuizBoost = 5 - (quizAttempts.length % 5)

    // Check for unclaimed QuinBoost in inventorys
    const ability = await Ability.findOne({
      name: 'QuinBoost',
      user: userId,
      expiresAt: { $gte: new Date() },
      claimed: false,
    }).session(session)

    const hasUnclaimedBoost = ability ? !ability?.claimed : false

    return {
      quizLeftToGetQuizBoost,
      hasUnclaimedBoost,
      multiplier: hasUnclaimedBoost ? 1.5 : 1,
    }
  } catch (error) {
    throw error
  }
}

/**
 * Generic ability checkers mapping
 */
const abilityCheckers = {
  QuinBoost: checkQuinBoostStatus,
  // Add other ability checkers here
}

/**
 * Universal ability check function
 */
const checkAbilityStatus = async ({ userId, abilityName, session = null }) => {
  try {
    // Get appropriate checker function
    const checkerFunction = abilityCheckers[abilityName]
    if (!checkerFunction) {
      throw new Error(`No checker available for ability: ${abilityName}`)
    }

    // Execute ability-specific check
    const status = await checkerFunction({ userId, session })
    return status
  } catch (error) {
    console.error(`Error checking ${abilityName} status:`, error)
    throw error
  }
}

module.exports = {
  checkAbilityStatus,
}
