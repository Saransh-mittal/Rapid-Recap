// services/quickClashServices/quickClashTrophyService.js
const mongoose = require('mongoose')
const User = require('../../model/userSchema')
const QuickClashTrophyHistory = require('../../model/quickClashSchemas/quickClashTrophyHistorySchema')
const QuickClashChallenge = require('../../model/quickClashSchemas/quickClashChallengeSchema')
const QuickClashTeamTrophyHistory = require('../../model/quickClashSchemas/quickClashTeamTrophyHistorySchema')

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
      // --- BETTING LOGIC FOR TIE ---
      let challengerBetReturn = 0
      let opponentBetReturn = 0
      let bettingUpdates = null

      if (challenge.betting && challenge.betting.enabled) {
        const challengerBet = challenge.betting.challenger.betAmount || 0
        const opponentBet = challenge.betting.opponent.betAmount || 0

        // Mark bets as settled
        challenge.betting.settled = true
        challenge.betting.settledAt = new Date()

        // Return bets
        challengerBetReturn = challengerBet
        opponentBetReturn = opponentBet

        // Update challenge betting results
        challenge.betting.challenger.betResult = 'returned'
        challenge.betting.challenger.trophiesGained = 0

        challenge.betting.opponent.betResult = 'returned'
        challenge.betting.opponent.trophiesGained = 0

        bettingUpdates = {
          challenger: {
            betAmount: challengerBet,
            result: 'returned',
            change: 0
          },
          opponent: {
            betAmount: opponentBet,
            result: 'returned',
            change: 0
          }
        }

        // Refund bets to users
        if (challengerBetReturn > 0 || opponentBetReturn > 0) {
          await Promise.all([
            User.findByIdAndUpdate(
              challengerId,
              { $inc: { quickClashTrophies: challengerBetReturn } },
              { session },
            ),
            User.findByIdAndUpdate(
              opponentId,
              { $inc: { quickClashTrophies: opponentBetReturn } },
              { session },
            ),
          ])
        }
      }
      // --- BETTING LOGIC END ---

      // No trophy exchange for ties (except bet returns)
      const trophyUpdates = {
        challenger: {
          previousTrophies: challengerTrophies,
          newTrophies: challengerTrophies + challengerBetReturn, // Add returned bet
          change: 0,
          betting: bettingUpdates ? bettingUpdates.challenger : null
        },
        opponent: {
          previousTrophies: opponentTrophies,
          newTrophies: opponentTrophies + opponentBetReturn, // Add returned bet
          change: 0,
          betting: bettingUpdates ? bettingUpdates.opponent : null
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
          trophiesAfter: challengerTrophies + challengerBetReturn,
          opponent: opponentId,
          opponentTrophies,
          result: 'tie',
        }).save({ session }),

        new QuickClashTrophyHistory({
          user: opponentId,
          challenge: challengeId,
          trophiesChange: 0,
          trophiesAfter: opponentTrophies + opponentBetReturn,
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

    // --- BETTING LOGIC START ---
    let winnerBetChange = 0
    let loserBetChange = 0
    let bettingUpdates = null

    if (challenge.betting && challenge.betting.enabled) {
      const challengerBet = challenge.betting.challenger.betAmount || 0
      const opponentBet = challenge.betting.opponent.betAmount || 0

      // Mark bets as settled
      challenge.betting.settled = true
      challenge.betting.settledAt = new Date()

      if (isWinnerChallenger) {
        // Challenger won
        // Winner gets opponent's bet (added to their balance)
        // Winner also gets their own bet back (implicitly, as it was deducted) -> wait, logic check:
        // "Winner takes the loser's bet amount"
        // "The loser loses their own bet amount"
        // "Trophy exchange = loser's bet amount only"

        // Implementation:
        // Bets were deducted from user.quickClashTrophies at placement (escrow)
        // So winner needs: +OwnBet +OpponentBet
        // Loser needs: +0 (already deducted)

        winnerBetChange = challengerBet + opponentBet
        loserBetChange = 0 // Already deducted

        // Update challenge betting results
        challenge.betting.challenger.betResult = 'won'
        challenge.betting.challenger.trophiesGained = opponentBet

        challenge.betting.opponent.betResult = 'lost'
        challenge.betting.opponent.trophiesGained = -opponentBet
      } else {
        // Opponent won
        winnerBetChange = opponentBet + challengerBet
        loserBetChange = 0 // Already deducted

        // Update challenge betting results
        challenge.betting.opponent.betResult = 'won'
        challenge.betting.opponent.trophiesGained = challengerBet

        challenge.betting.challenger.betResult = 'lost'
        challenge.betting.challenger.trophiesGained = -challengerBet
      }

      bettingUpdates = {
        challenger: {
          betAmount: challengerBet,
          result: isWinnerChallenger ? 'won' : 'lost',
          change: isWinnerChallenger ? opponentBet : -challengerBet
        },
        opponent: {
          betAmount: opponentBet,
          result: !isWinnerChallenger ? 'won' : 'lost',
          change: !isWinnerChallenger ? challengerBet : -opponentBet
        }
      }
    }
    // --- BETTING LOGIC END ---

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
    // Note: Betting losses are separate from battle result and already deducted if lost
    // But we need to check floor protection for the battle result part

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
    // Winner gets: Battle Win + Bet Winnings
    // Loser gets: Battle Loss (already calculated newLoserTrophies)

    await Promise.all([
      User.findByIdAndUpdate(
        winnerId,
        { $inc: { quickClashTrophies: winnerChange + winnerBetChange } },
        { session },
      ),
      User.findByIdAndUpdate(
        loserId,
        { $set: { quickClashTrophies: newLoserTrophies } }, // Betting loss already deducted
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
          ? challengerTrophies + winnerChange + winnerBetChange
          : newLoserTrophies,
        change: isWinnerChallenger ? winnerChange + winnerBetChange : loserChange, // Includes bet winnings for winner
        betting: bettingUpdates ? bettingUpdates.challenger : null
      },
      opponent: {
        previousTrophies: opponentTrophies,
        newTrophies: !isWinnerChallenger
          ? opponentTrophies + winnerChange + winnerBetChange
          : newLoserTrophies,
        change: !isWinnerChallenger ? winnerChange + winnerBetChange : loserChange, // Includes bet winnings for winner
        betting: bettingUpdates ? bettingUpdates.opponent : null
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
        trophiesChange: winnerChange + winnerBetChange,
        trophiesAfter:
          (isWinnerChallenger ? challengerTrophies : opponentTrophies) +
          winnerChange + winnerBetChange,
        opponent: isWinnerChallenger ? opponentId : challengerId,
        opponentTrophies: isWinnerChallenger
          ? opponentTrophies
          : challengerTrophies,
        result: 'win',
      }).save({ session }),

      new QuickClashTrophyHistory({
        user: loserId,
        challenge: challengeId,
        trophiesChange: loserChange - (isWinnerChallenger ? (bettingUpdates?.challenger?.betAmount || 0) : (bettingUpdates?.opponent?.betAmount || 0)), // Include bet loss in history record?
        // Wait, loserChange is battle result. Bet was already deducted.
        // If we want history to reflect total change from this battle event:
        // It should be BattleChange + BetChange (which is 0 for loser at this point, but -BetAmount overall)
        // However, the bet was deducted earlier.
        // Let's stick to recording the change that happened *now*.
        // Actually, for clarity, the history should probably reflect the net result of the battle.
        // But since deduction happened earlier, the *balance change* now is just the battle result.
        // Let's keep it consistent with the balance update.
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

/**
 * Get combined trophy history for a user (both individual and team battles)
 * @param {Object} params - Parameters
 * @param {string} params.userId - User ID
 * @param {number} [params.limit=10] - Number of entries to fetch
 * @returns {Promise<Array>} Combined trophy history entries
 */
const getUserCombinedTrophyHistory = async ({ userId, limit = 10 }) => {
  try {
    // Fetch individual trophy history
    const individualHistory = await QuickClashTrophyHistory.find({
      user: userId,
    })
      .sort({ createdAt: -1 })
      .limit(limit * 2) // Fetch more to ensure we have enough after combining
      .populate('opponent', 'name inGameName pic')
      .populate('challenge', 'category status')
      .lean()

    // Fetch team trophy history
    const teamHistory = await QuickClashTeamTrophyHistory.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(limit * 2) // Fetch more to ensure we have enough after combining
      .populate('opponentTeam', 'name')
      .populate('team', 'name')
      .populate('teamBattle', 'teamA teamB')
      .lean()

    // Transform individual history to common format
    const transformedIndividualHistory = individualHistory.map(entry => ({
      _id: entry._id,
      type: 'individual', // 1v1 mode
      trophiesChange: entry.trophiesChange,
      trophiesAfter: entry.trophiesAfter,
      result: entry.result,
      opponent: entry.opponent,
      category: entry.challenge?.category || 'Unknown',
      mode: '1v1',
      createdAt: entry.createdAt,
      protectionUsed: entry.protectionUsed,
    }))

    // Transform team history to common format
    const transformedTeamHistory = teamHistory.map(entry => ({
      _id: entry._id,
      type: 'team', // 4v4 mode
      trophiesChange: entry.trophiesChange,
      trophiesAfter: entry.trophiesAfter,
      result: entry.result,
      opponent: {
        name: entry.opponentTeam?.name || 'Unknown Team',
        inGameName: entry.opponentTeam?.name || 'Unknown Team',
        pic: null, // Teams don't have profile pics
      },
      category: 'Team Battle',
      mode: '4v4',
      createdAt: entry.createdAt,
      userParticipated: entry.userParticipated,
      userCompleted: entry.userCompleted,
      userScore: entry.userScore,
      bonusesApplied: entry.bonusesApplied,
    }))

    // Combine and sort by creation date
    const combinedHistory = [
      ...transformedIndividualHistory,
      ...transformedTeamHistory,
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    // Return limited results
    return combinedHistory.slice(0, limit)
  } catch (error) {
    console.error('Error getting combined trophy history:', error)
    throw error
  }
}

module.exports = {
  getUserTrophies,
  calculateTrophiesToExchange,
  updateTrophiesAfterChallenge,
  getUserTrophyHistory,
  calculatePotentialTrophyExchange,
  getUserCombinedTrophyHistory,
  DEFAULT_STARTING_TROPHIES,
}
