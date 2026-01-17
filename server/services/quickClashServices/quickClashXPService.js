// services/quickClashServices/quickClashXPService.js
// XP system for Quick Clash V2 - rewards players for completing sessions

const mongoose = require('mongoose')
const User = require('../../model/userSchema')

// ============================================================================
// XP CALCULATION CONSTANTS
// ============================================================================

const XP_CONFIG = {
  BASE_XP: 10,                      // Base XP for completing a session
  FORGE_ACCURACY_PER_CORRECT: 1,    // +1 XP per correct forge answer (max +5)
  QUIZ_ACCURACY_PER_CORRECT: 2,     // +2 XP per correct quiz answer (max +10)
  WIN_BONUS: 5,                     // +5 XP when battle result is WIN
  MAX_QUESTIONS: 5,
}

// ============================================================================
// XP CALCULATION FUNCTIONS
// ============================================================================

/**
 * Calculate XP earned for a session completion (two-phase: Forge + Quiz)
 * @param {Object} params
 * @param {number} params.forgeCorrect - Number of correct forge answers (0-5)
 * @param {number} params.quizCorrect - Number of correct quiz answers (0-5)
 * @param {boolean} params.isWin - Whether the player's team won the battle
 * @returns {Object} Complete breakdown of XP calculation
 */
const calculateSessionXP = ({ forgeCorrect = 0, quizCorrect = 0, isWin = false }) => {
  // Base XP for completing session
  const baseXP = XP_CONFIG.BASE_XP

  // Two-phase accuracy bonuses
  const forgeAccuracyBonus = Math.min(5, Math.max(0, forgeCorrect)) * XP_CONFIG.FORGE_ACCURACY_PER_CORRECT
  const quizAccuracyBonus = Math.min(5, Math.max(0, quizCorrect)) * XP_CONFIG.QUIZ_ACCURACY_PER_CORRECT

  // Win bonus
  const winBonus = isWin ? XP_CONFIG.WIN_BONUS : 0

  // Calculate total
  const totalXP = baseXP + forgeAccuracyBonus + quizAccuracyBonus + winBonus

  return {
    baseXP,
    forgeAccuracyBonus,
    quizAccuracyBonus,
    winBonus,
    totalXP,
    breakdown: {
      base: baseXP,
      forge: forgeAccuracyBonus,
      quiz: quizAccuracyBonus,
      win: winBonus,
      total: totalXP,
    }
  }
}

/**
 * Calculate level from total XP
 * Level formula: XP required to reach level L = L * (L + 1) * 10 / 2
 * @param {number} totalXP - Total XP
 * @returns {Object} { level, xpProgress, xpForNextLevel, xpProgressPercentage }
 */
const calculateLevelFromXP = (totalXP) => {
  let level = 0
  let xpBaseAtCurrLevel = (level * (level + 1) * 10) / 2
  let leftXp = totalXP - xpBaseAtCurrLevel

  while (leftXp >= (level + 1) * 10) {
    level++
    leftXp -= level * 10
  }

  const xpForNextLevel = (level + 1) * 10
  const xpProgress = leftXp
  const xpProgressPercentage = Math.floor((xpProgress / xpForNextLevel) * 100)

  return {
    level,
    xpProgress,
    xpForNextLevel,
    xpProgressPercentage,
  }
}

/**
 * Award XP to a user (persisted to database)
 * @param {Object} params
 * @param {string} params.userId - User ID
 * @param {number} params.amount - XP to award
 * @param {string} params.reason - Reason for awarding (for logging)
 * @param {mongoose.ClientSession} [params.session] - DB session for transactions
 * @returns {Promise<Object>} { previousXP, newXP, awarded, levelInfo }
 */
const awardXP = async ({
  userId,
  amount,
  reason = 'quick_clash_session',
  session = null,
}) => {
  try {
    const user = await User.findById(userId)
      .select('xp level')
      .session(session)

    if (!user) {
      console.log(`[XP] User ${userId} not found`)
      return null
    }

    const previousXP = user.xp || 0
    const previousLevel = user.level || 0
    const newXP = previousXP + amount

    // Calculate new level
    const levelInfo = calculateLevelFromXP(newXP)
    const levelUp = levelInfo.level > previousLevel

    // Update user
    await User.findByIdAndUpdate(
      userId,
      {
        $inc: { xp: amount },
        $set: { level: levelInfo.level }
      },
      { session }
    )

    console.log(`[XP] Awarded ${amount} XP to user ${userId} for ${reason}. New total: ${newXP}, Level: ${levelInfo.level}${levelUp ? ' (LEVEL UP!)' : ''}`)

    return {
      previousXP,
      newXP,
      awarded: amount,
      previousLevel,
      currentLevel: levelInfo.level,
      levelUp,
      xpProgress: levelInfo.xpProgress,
      xpForNextLevel: levelInfo.xpForNextLevel,
      xpProgressPercentage: levelInfo.xpProgressPercentage,
    }
  } catch (error) {
    console.error(`[XP] Error awarding XP to ${userId}:`, error)
    throw error
  }
}

/**
 * Get current XP progress for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} XP progress info
 */
const getXPProgress = async (userId) => {
  try {
    const user = await User.findById(userId).select('xp level').lean()

    if (!user) {
      return null
    }

    const totalXP = user.xp || 0
    const levelInfo = calculateLevelFromXP(totalXP)

    return {
      totalXP,
      currentLevel: levelInfo.level,
      xpProgress: levelInfo.xpProgress,
      xpForNextLevel: levelInfo.xpForNextLevel,
      xpProgressPercentage: levelInfo.xpProgressPercentage,
    }
  } catch (error) {
    console.error(`[XP] Error getting XP progress for ${userId}:`, error)
    return null
  }
}

module.exports = {
  XP_CONFIG,
  calculateSessionXP,
  calculateLevelFromXP,
  awardXP,
  getXPProgress,
}
