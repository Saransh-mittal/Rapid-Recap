// services/quickClashServices/quickClashCoinService.js
// Coin system for Quick Clash V2 - rewards players for completing quizzes

const mongoose = require('mongoose')
const PlaySession = require('../../model/quickClashSchemas/playSessionSchema')
const User = require('../../model/userSchema')
const { getStreakTier, STREAK_TIERS } = require('./quickClashStreakService')

// ============================================================================
// COIN CALCULATION CONSTANTS
// ============================================================================

const COIN_CONFIG = {
  BASE_COINS: 15,           // Fixed coins for completing a quiz
  ACCURACY_BONUS_PER_CORRECT: 5,  // Bonus coins per correct answer (0-5 correct = 0-25 bonus)
  MAX_QUESTIONS: 5,         // Total questions per quiz
}

// ============================================================================
// COIN CALCULATION FUNCTIONS
// ============================================================================

/**
 * Calculate coins earned for a quiz completion
 * @param {Object} params
 * @param {number} params.correctAnswers - Number of correct answers (0-5)
 * @param {number} params.totalQuestions - Total questions (usually 5)
 * @param {number} params.streakDays - Current streak days for multiplier
 * @returns {Object} { baseCoins, accuracyBonus, streakMultiplier, totalCoins, breakdown }
 */
const calculateQuizReward = ({ correctAnswers, totalQuestions = COIN_CONFIG.MAX_QUESTIONS, streakDays = 0 }) => {
  // Base coins for completing
  const baseCoins = COIN_CONFIG.BASE_COINS

  // Accuracy bonus (5 coins per correct answer)
  const accuracyBonus = correctAnswers * COIN_CONFIG.ACCURACY_BONUS_PER_CORRECT

  // Streak multiplier from tier
  const tierInfo = getStreakTier(streakDays)
  const streakMultiplier = tierInfo.multiplier

  // Calculate total with multiplier
  const subtotal = baseCoins + accuracyBonus
  const totalCoins = Math.round(subtotal * streakMultiplier)

  return {
    baseCoins,
    accuracyBonus,
    streakMultiplier,
    totalCoins,
    breakdown: {
      base: baseCoins,
      accuracy: accuracyBonus,
      subtotal,
      multiplier: streakMultiplier,
      multiplierLabel: tierInfo.label,
      final: totalCoins,
    }
  }
}

/**
 * Award coins to a player (persisted to database)
 * @param {Object} params
 * @param {string} params.playerId - User ID or Session Player ID
 * @param {boolean} params.isSessionPlayer - Whether this is a session player
 * @param {number} params.amount - Coins to award
 * @param {string} params.reason - Reason for awarding (for logging)
 * @param {mongoose.ClientSession} [params.session] - DB session for transactions
 * @returns {Promise<Object>} { previousCoins, newCoins, awarded }
 */
const awardCoins = async ({
  playerId,
  isSessionPlayer,
  amount,
  reason = 'quiz_completion',
  session = null,
}) => {
  try {
    let previousCoins = 0
    let newCoins = 0

    if (isSessionPlayer) {
      const player = await PlaySession.findById(playerId).session(session)
      if (!player) {
        console.log(`[Coins] Session player ${playerId} not found`)
        return null
      }

      previousCoins = player.coins || 0
      newCoins = previousCoins + amount

      await PlaySession.findByIdAndUpdate(
        playerId,
        { $inc: { coins: amount } },
        { session }
      )
    } else {
      const user = await User.findById(playerId)
        .select('quickClashCoins')
        .session(session)
      if (!user) {
        console.log(`[Coins] User ${playerId} not found`)
        return null
      }

      previousCoins = user.quickClashCoins || 0
      newCoins = previousCoins + amount

      await User.findByIdAndUpdate(
        playerId,
        { $inc: { quickClashCoins: amount } },
        { session }
      )
    }

    console.log(`[Coins] Awarded ${amount} coins to ${isSessionPlayer ? 'session' : 'user'} ${playerId} for ${reason}. New total: ${newCoins}`)

    return {
      previousCoins,
      newCoins,
      awarded: amount,
    }
  } catch (error) {
    console.error(`[Coins] Error awarding coins to ${playerId}:`, error)
    throw error
  }
}

/**
 * Get current coin balance for a player
 * @param {string} playerId - User ID or Session Player ID
 * @param {boolean} isSessionPlayer - Whether this is a session player
 * @returns {Promise<number>} Current coin balance
 */
const getPlayerCoins = async (playerId, isSessionPlayer) => {
  try {
    if (isSessionPlayer) {
      const player = await PlaySession.findById(playerId).select('coins').lean()
      return player?.coins || 0
    } else {
      const user = await User.findById(playerId).select('quickClashCoins').lean()
      return user?.quickClashCoins || 0
    }
  } catch (error) {
    console.error(`[Coins] Error getting coins for ${playerId}:`, error)
    return 0
  }
}

/**
 * Transfer coins from session player to user during account conversion
 * @param {string} sessionPlayerId - Session player ID
 * @param {string} userId - User ID
 * @param {mongoose.ClientSession} [session] - DB session
 * @returns {Promise<Object>} { transferred, newUserBalance }
 */
const transferCoinsToUser = async (sessionPlayerId, userId, session = null) => {
  try {
    const sessionPlayer = await PlaySession.findById(sessionPlayerId)
      .select('coins')
      .session(session)

    if (!sessionPlayer) {
      console.log(`[Coins] No session player found for transfer: ${sessionPlayerId}`)
      return { transferred: 0, newUserBalance: 0 }
    }

    const coinsToTransfer = sessionPlayer.coins || 0
    if (coinsToTransfer === 0) {
      console.log(`[Coins] No coins to transfer from session ${sessionPlayerId}`)
      const user = await User.findById(userId).select('quickClashCoins').session(session)
      return { transferred: 0, newUserBalance: user?.quickClashCoins || 0 }
    }

    // Add coins to user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $inc: { quickClashCoins: coinsToTransfer } },
      { new: true, session }
    )

    // Clear coins from session player (optional - they'll likely not be used again)
    await PlaySession.findByIdAndUpdate(
      sessionPlayerId,
      { $set: { coins: 0 } },
      { session }
    )

    console.log(
      `[Coins] Transferred ${coinsToTransfer} coins from session ${sessionPlayerId} to user ${userId}. New balance: ${updatedUser.quickClashCoins}`
    )

    return {
      transferred: coinsToTransfer,
      newUserBalance: updatedUser.quickClashCoins,
    }
  } catch (error) {
    console.error(`[Coins] Error transferring coins:`, error)
    throw error
  }
}

/**
 * Generate a mock percentile rank for MVP (encouraging display)
 * Score-based tiers for perceived competition
 * @param {number} score - Quiz score (0-100)
 * @returns {number} Percentile rank (1-50, lower is better)
 */
const getMockPercentile = (score) => {
  if (score >= 95) return Math.floor(Math.random() * 5) + 1   // TOP 1-5%
  if (score >= 85) return Math.floor(Math.random() * 10) + 5  // TOP 5-15%
  if (score >= 70) return Math.floor(Math.random() * 15) + 15 // TOP 15-30%
  if (score >= 50) return Math.floor(Math.random() * 20) + 25 // TOP 25-45%
  return Math.floor(Math.random() * 15) + 35                   // TOP 35-50%
}

/**
 * Calculate estimated time until battle result
 * @param {Date} battleCreatedAt - When the battle was created
 * @param {number} battleDurationMinutes - Battle duration in minutes (default 45)
 * @returns {number} Minutes until result (minimum 0)
 */
const getEstimatedResultTime = (battleCreatedAt, battleDurationMinutes = 45) => {
  if (!battleCreatedAt) return 25 // Default estimate

  const created = new Date(battleCreatedAt)
  const expiresAt = new Date(created.getTime() + battleDurationMinutes * 60 * 1000)
  const now = new Date()

  const minutesRemaining = Math.max(0, Math.round((expiresAt - now) / (1000 * 60)))
  return minutesRemaining
}

module.exports = {
  COIN_CONFIG,
  calculateQuizReward,
  awardCoins,
  getPlayerCoins,
  transferCoinsToUser,
  getMockPercentile,
  getEstimatedResultTime,
}
