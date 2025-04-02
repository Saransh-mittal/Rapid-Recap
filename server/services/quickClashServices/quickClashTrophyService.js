// services/quickClashServices/quickClashTrophyService.js
const mongoose = require('mongoose')
const User = require('../../model/userSchema')
const QuickClashTrophyHistory = require('../../model/quickClashSchemas/quickClashTrophyHistorySchema')
const QuickClashChallenge = require('../../model/quickClashSchemas/quickClashChallengeSchema')

// Constants for trophy calculation
const BASE_TROPHIES = 30
const TROPHY_K_FACTOR = 0.8
const DEFAULT_STARTING_TROPHIES = 1000

/**
 * Get a user's current trophy count
 * @param {Object} params - Parameters
 * @param {string} params.userId - User ID
 * @returns {Promise<number>} Trophy count
 */
const getUserTrophies = async ({ userId }) => {
  try {
    const user = await User.findById(userId).select('quickClashTrophies')
    return user?.quickClashTrophies !== undefined ||
      user?.quickClashTrophies !== null
      ? user?.quickClashTrophies
      : DEFAULT_STARTING_TROPHIES
  } catch (error) {
    console.error('Error getting user trophies:', error)
    throw error
  }
}

/**
 * Calculate trophies to exchange based on player ratings
 * @param {Object} params - Parameters
 * @param {number} params.playerTrophies - Player's current trophies
 * @param {number} params.opponentTrophies - Opponent's current trophies
 * @returns {number} Trophies to exchange
 */
const calculateTrophiesToExchange = ({ playerTrophies, opponentTrophies }) => {
  // Formula: BaseTrophies * (1 + K * (OpponentTrophies - PlayerTrophies) / 500)
  const trophiesExchanged =
    BASE_TROPHIES *
    (1 + (TROPHY_K_FACTOR * (opponentTrophies - playerTrophies)) / 500)

  // Round to integer and ensure minimum exchange
  return Math.max(5, Math.round(trophiesExchanged))
}

/**
 * Check if streak protection should be applied
 * @param {Object} params - Parameters
 * @param {Object} params.userData - User data with stats
 * @returns {Boolean} Whether streak protection should be applied
 */
const shouldApplyStreakProtection = ({ userData }) => {
  const { quickClashStats } = userData

  // If user has 3+ win streak and streak protection is available
  return (
    quickClashStats &&
    quickClashStats.currentWinStreak >= 3 &&
    quickClashStats.streakProtectionAvailable
  )
}

/**
 * Check if activity protection should be applied
 * @param {Object} params - Parameters
 * @param {Object} params.userData - User data with stats and creation date
 * @param {Number} params.newTrophies - Potential new trophy count
 * @returns {Boolean} Whether activity protection should be applied
 */
const shouldApplyActivityProtection = ({ userData, newTrophies }) => {
  const { quickClashStats, createdAt, quickClashTrophies } = userData

  // If user is below 1200 trophies
  if (quickClashTrophies < 1200) {
    // Calculate account age in days
    const accountAgeInDays =
      (new Date() - new Date(createdAt)) / (1000 * 60 * 60 * 24)

    // If account is less than 14 days old
    if (accountAgeInDays < 14) {
      // And new trophies would be less than peak trophies
      return quickClashStats && newTrophies < quickClashStats.peakTrophies
    }
  }

  return false
}

/**
 * Update user win streak after a challenge
 * @param {Object} params - Parameters
 * @param {String} params.userId - User ID
 * @param {Boolean} params.isWin - Whether the user won
 * @param {Boolean} params.usedStreakProtection - Whether streak protection was used
 * @param {mongoose.ClientSession} [params.session] - Optional Mongoose session
 * @returns {Promise<void>}
 */
const updateUserWinStreak = async ({
  userId,
  isWin,
  usedStreakProtection = false,
  session = null,
}) => {
  try {
    const updateObj = isWin
      ? {
          $inc: { 'quickClashStats.currentWinStreak': 1 },
          $set: { 'quickClashStats.streakProtectionAvailable': true },
        }
      : usedStreakProtection
      ? {
          $set: {
            'quickClashStats.currentWinStreak': 0,
            'quickClashStats.streakProtectionAvailable': false,
          },
        }
      : {
          $set: { 'quickClashStats.currentWinStreak': 0 },
        }

    await User.findByIdAndUpdate(userId, updateObj, { session })
  } catch (error) {
    console.error('Error updating user win streak:', error)
    // Non-critical error, don't throw
  }
}

/**
 * Update trophies after a challenge is completed, with protection mechanics
 * @param {Object} params - Parameters
 * @param {string} params.challengeId - Challenge ID
 * @param {string} params.winnerId - Winner user ID (null for tie)
 * @param {string} params.challengerId - Challenger user ID
 * @param {string} params.opponentId - Opponent user ID
 * @param {mongoose.ClientSession} [params.session] - Optional Mongoose session
 * @returns {Promise<Object>} Trophy update results with protection info
 */
const updateTrophiesAfterChallenge = async ({
  challengeId,
  winnerId,
  challengerId,
  opponentId,
  session: providedSession,
}) => {
  // Handle session (use provided or create new)
  const session = providedSession || (await mongoose.startSession())
  let startedTransaction = false

  try {
    if (!providedSession) {
      startedTransaction = true
      await session.startTransaction()
    }

    // Get the challenge with pre-calculated trophy potential
    const challenge = await QuickClashChallenge.findById(challengeId).session(
      session,
    )

    if (!challenge || !challenge.trophyPotential) {
      throw new Error('Challenge or trophy potential data not found')
    }

    // Get full user data for both players to check protection eligibility
    const [challengerData, opponentData] = await Promise.all([
      User.findById(challengerId)
        .select('quickClashTrophies quickClashStats createdAt')
        .session(session),
      User.findById(opponentId)
        .select('quickClashTrophies quickClashStats createdAt')
        .session(session),
    ])

    const challengerTrophies =
      challengerData?.quickClashTrophies !== undefined ||
      challengerData?.quickClashTrophies !== null
        ? challengerData?.quickClashTrophies
        : DEFAULT_STARTING_TROPHIES
    const opponentTrophies =
      opponentData?.quickClashTrophies !== undefined ||
      opponentData?.quickClashTrophies !== null
        ? opponentData?.quickClashTrophies
        : DEFAULT_STARTING_TROPHIES

    // Initialize the protection flags
    let challengerUsedStreakProtection = false
    let opponentUsedStreakProtection = false
    let challengerUsedActivityProtection = false
    let opponentUsedActivityProtection = false
    let challengerUsedFloorProtection = false
    let opponentUsedFloorProtection = false

    // Handle tie
    if (!winnerId) {
      // No trophy exchange for ties
      const trophyUpdates = {
        challenger: {
          previousTrophies: challengerTrophies,
          newTrophies: challengerTrophies,
          change: 0,
        },
        opponent: {
          previousTrophies: opponentTrophies,
          newTrophies: opponentTrophies,
          change: 0,
        },
        isTie: true,
        protectionApplied: {
          challenger: false,
          opponent: false,
        },
      }

      // Reset streaks for both players on tie
      await Promise.all([
        updateUserWinStreak({
          userId: challengerId,
          isWin: false,
          session,
        }),
        updateUserWinStreak({
          userId: opponentId,
          isWin: false,
          session,
        }),
      ])

      // Save trophy updates to the challenge
      challenge.trophyUpdates = trophyUpdates
      await challenge.save({ session })

      // Record history for both players
      await Promise.all([
        new QuickClashTrophyHistory({
          user: challengerId,
          challenge: challengeId,
          trophiesChange: 0,
          trophiesAfter: challengerTrophies,
          opponent: opponentId,
          opponentTrophies,
          result: 'tie',
        }).save({ session }),

        new QuickClashTrophyHistory({
          user: opponentId,
          challenge: challengeId,
          trophiesChange: 0,
          trophiesAfter: opponentTrophies,
          opponent: challengerId,
          opponentTrophies: challengerTrophies,
          result: 'tie',
        }).save({ session }),
      ])

      if (startedTransaction) {
        await session.commitTransaction()
      }

      return trophyUpdates
    }

    // Handle win/loss - use pre-calculated values from the challenge
    const isWinnerChallenger = winnerId.toString() === challengerId.toString()

    // Determine potential trophy changes using pre-calculated values
    let winnerChange = isWinnerChallenger
      ? challenge.trophyPotential.challenger.potentialGain
      : challenge.trophyPotential.opponent.potentialGain

    let loserChange = isWinnerChallenger
      ? -challenge.trophyPotential.opponent.potentialLoss
      : -challenge.trophyPotential.challenger.potentialLoss

    // Get user data for the loser
    const loserData = isWinnerChallenger ? opponentData : challengerData
    const loserId = isWinnerChallenger ? opponentId : challengerId
    const loserTrophies = isWinnerChallenger
      ? opponentTrophies
      : challengerTrophies

    // Check if streak protection should be applied to the loser
    const applyStreakProtection = shouldApplyStreakProtection({
      userData: loserData,
    })

    // Calculate new trophy value after loss
    let newLoserTrophies = loserTrophies + loserChange

    // Check if activity protection should be applied
    const applyActivityProtection = shouldApplyActivityProtection({
      userData: loserData,
      newTrophies: newLoserTrophies,
    })

    // Apply streak protection if applicable
    if (applyStreakProtection) {
      loserChange = 0
      newLoserTrophies = loserTrophies

      // Mark which player used streak protection
      if (isWinnerChallenger) {
        opponentUsedStreakProtection = true
      } else {
        challengerUsedStreakProtection = true
      }
    }
    // Apply activity protection if applicable
    else if (applyActivityProtection) {
      // Set trophies to peak value
      newLoserTrophies = loserData.quickClashStats.peakTrophies
      loserChange = newLoserTrophies - loserTrophies

      // Mark which player used activity protection
      if (isWinnerChallenger) {
        opponentUsedActivityProtection = true
      } else {
        challengerUsedActivityProtection = true
      }
    }

    // Ensure trophies don't go below 0 (absolute floor protection)
    if (newLoserTrophies < 0) {
      // This means floor protection is applied
      newLoserTrophies = 0
      loserChange = -loserTrophies // This will make it 0

      // Mark which player used floor protection
      if (isWinnerChallenger) {
        opponentUsedFloorProtection = true
      } else {
        challengerUsedFloorProtection = true
      }
    }

    // Update trophies in database
    await Promise.all([
      User.findByIdAndUpdate(
        winnerId,
        { $inc: { quickClashTrophies: winnerChange } },
        { session },
      ),
      User.findByIdAndUpdate(
        loserId,
        { $set: { quickClashTrophies: newLoserTrophies } },
        { session },
      ),
    ])

    // Update win streaks
    await Promise.all([
      updateUserWinStreak({
        userId: winnerId,
        isWin: true,
        session,
      }),
      updateUserWinStreak({
        userId: loserId,
        isWin: false,
        usedStreakProtection: applyStreakProtection,
        session,
      }),
    ])

    // Prepare trophy updates object with protection info
    const trophyUpdates = {
      challenger: {
        previousTrophies: challengerTrophies,
        newTrophies: isWinnerChallenger
          ? challengerTrophies + winnerChange
          : newLoserTrophies,
        change: isWinnerChallenger ? winnerChange : loserChange,
      },
      opponent: {
        previousTrophies: opponentTrophies,
        newTrophies: !isWinnerChallenger
          ? opponentTrophies + winnerChange
          : newLoserTrophies,
        change: !isWinnerChallenger ? winnerChange : loserChange,
      },
      isTie: false,
      protectionApplied: {
        challenger:
          challengerUsedStreakProtection ||
          challengerUsedActivityProtection ||
          challengerUsedFloorProtection,
        challenger_type: challengerUsedStreakProtection
          ? 'streak'
          : challengerUsedActivityProtection
          ? 'activity'
          : challengerUsedFloorProtection
          ? 'floor'
          : null,
        opponent:
          opponentUsedStreakProtection ||
          opponentUsedActivityProtection ||
          opponentUsedFloorProtection,
        opponent_type: opponentUsedStreakProtection
          ? 'streak'
          : opponentUsedActivityProtection
          ? 'activity'
          : opponentUsedFloorProtection
          ? 'floor'
          : null,
      },
    }

    // Save trophy updates to the challenge
    challenge.trophyUpdates = trophyUpdates
    await challenge.save({ session })

    // Record trophy history
    await Promise.all([
      new QuickClashTrophyHistory({
        user: winnerId,
        challenge: challengeId,
        trophiesChange: winnerChange,
        trophiesAfter:
          (isWinnerChallenger ? challengerTrophies : opponentTrophies) +
          winnerChange,
        opponent: isWinnerChallenger ? opponentId : challengerId,
        opponentTrophies: isWinnerChallenger
          ? opponentTrophies
          : challengerTrophies,
        result: 'win',
      }).save({ session }),

      new QuickClashTrophyHistory({
        user: loserId,
        challenge: challengeId,
        trophiesChange: loserChange,
        trophiesAfter: newLoserTrophies,
        opponent: winnerId,
        opponentTrophies: isWinnerChallenger
          ? challengerTrophies
          : opponentTrophies,
        result: 'loss',
        protectionUsed: applyStreakProtection
          ? 'streak'
          : applyActivityProtection
          ? 'activity'
          : (
              isWinnerChallenger
                ? opponentUsedFloorProtection
                : challengerUsedFloorProtection
            )
          ? 'floor'
          : null,
      }).save({ session }),
    ])

    if (startedTransaction) {
      await session.commitTransaction()
    }

    return trophyUpdates
  } catch (error) {
    if (startedTransaction) {
      await session.abortTransaction()
    }
    console.error('Error updating trophies after challenge:', error)
    throw error
  } finally {
    if (startedTransaction) {
      await session.endSession()
    }
  }
}

/**
 * Get trophy history for a user
 * @param {Object} params - Parameters
 * @param {string} params.userId - User ID
 * @param {number} [params.limit=10] - Number of entries to fetch
 * @returns {Promise<Array>} Trophy history entries
 */
const getUserTrophyHistory = async ({ userId, limit = 10 }) => {
  try {
    const history = await QuickClashTrophyHistory.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('opponent', 'name inGameName pic')
      .populate('challenge', 'category status')
      .lean()

    return history
  } catch (error) {
    console.error('Error getting trophy history:', error)
    throw error
  }
}

/**
 * Calculate potential trophy exchange for a possible match
 * @param {Object} params - Parameters
 * @param {string} params.userId - User ID
 * @param {string} params.opponentId - Potential opponent ID
 * @returns {Promise<Object>} Potential trophy exchange
 */
const calculatePotentialTrophyExchange = async ({ userId, opponentId }) => {
  try {
    // Get current trophies for both players
    const [userData, opponentData] = await Promise.all([
      User.findById(userId).select('quickClashTrophies'),
      User.findById(opponentId).select('quickClashTrophies'),
    ])

    const userTrophies =
      userData?.quickClashTrophies || DEFAULT_STARTING_TROPHIES
    const opponentTrophies =
      opponentData?.quickClashTrophies || DEFAULT_STARTING_TROPHIES

    // Calculate potential trophy exchange
    const trophiesToExchange = calculateTrophiesToExchange({
      playerTrophies: userTrophies,
      opponentTrophies,
    })

    return {
      userTrophies,
      opponentTrophies,
      potentialGain: trophiesToExchange,
      potentialLoss: Math.min(trophiesToExchange, userTrophies - 100),
    }
  } catch (error) {
    console.error('Error calculating potential trophy exchange:', error)
    throw error
  }
}

module.exports = {
  getUserTrophies,
  calculateTrophiesToExchange,
  updateTrophiesAfterChallenge,
  getUserTrophyHistory,
  calculatePotentialTrophyExchange,
  DEFAULT_STARTING_TROPHIES,
}
