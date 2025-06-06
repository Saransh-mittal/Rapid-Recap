// services/quickClashServices/quickClashMatchmakingService.js
const mongoose = require('mongoose')
const QuickClashMatchmaking = require('../../model/quickClashSchemas/quickClashMatchmakingSchema')
const User = require('../../model/userSchema')
const globalEmitter = require('../../eventEmitter')
const { createChallenge } = require('./quickClashChallengeService')
const {
  notifyChallengerAboutCreation,
} = require('./quickClashNotificationService')
const { scheduleBotResponse } = require('./quickClashBotService')
const { getCategories } = require('../../data/categories')

// Constants
const MATCHMAKING_EXPIRY = 30 * 60 * 1000 // 30 minutes
const TRANSACTION_TIMEOUT = 10000 // 10 seconds

/**
 * Join the matchmaking room - Enhanced with better error handling and timeouts
 * @param {Object} params - Parameters
 * @param {string} params.userId - User ID
 * @returns {Promise<Object>} The matchmaking entry or null if immediately matched
 */
const joinMatchmaking = async ({ userId }) => {
  console.log(
    `[MATCHMAKING_SERVICE] User ${userId} attempting to join matchmaking`,
  )

  // Generate two random categories
  const categories = getRandomCategories(2)

  const session = await mongoose.startSession()
  let transactionStarted = false

  try {
    // Set transaction options with timeout
    const transactionOptions = {
      readConcern: { level: 'snapshot' },
      writeConcern: { w: 'majority' },
      maxTimeMS: TRANSACTION_TIMEOUT,
    }

    return await session.withTransaction(async () => {
      transactionStarted = true
      console.log(
        `[MATCHMAKING_SERVICE] Starting transaction for user ${userId}`,
      )

      // First, clean up any existing entries for this user to prevent duplicates
      await QuickClashMatchmaking.deleteMany({ user: userId }).session(session)
      console.log(
        `[MATCHMAKING_SERVICE] Cleaned up existing entries for user ${userId}`,
      )

      // Look for real users who are available (not bots)
      const matchmakingQuery = {
        user: { $ne: userId }, // Not the current user
        status: 'available', // Available for matching
        isBot: false, // Not a bot user
        expiresAt: { $gt: new Date() }, // Not expired
      }

      // Find a real user to match with
      const potentialMatch = await QuickClashMatchmaking.findOne(
        matchmakingQuery,
      )
        .sort({ lastActive: 1 }) // Match with the user waiting the longest
        .session(session)

      if (potentialMatch) {
        console.log(
          `[MATCHMAKING_SERVICE] Found potential match: ${potentialMatch.user} for user ${userId}`,
        )

        // We found a real user to match with!
        // Lock both users to prevent race conditions
        const lockResult = await lockUserForChallenge({
          userId: potentialMatch.user,
          session,
        })

        if (!lockResult) {
          console.log(
            `[MATCHMAKING_SERVICE] Failed to lock user ${potentialMatch.user}, continuing with matchmaking queue`,
          )
          // If we can't lock the potential match, just continue with regular matchmaking
          // Don't throw an error, just fall through to create a matchmaking entry
        } else {
          // Get user details for both users
          const [joiningUser, matchedUser] = await Promise.all([
            User.findById(userId)
              .select('_id name inGameName quickClashTrophies pic')
              .session(session),
            User.findById(potentialMatch.user)
              .select('_id name inGameName quickClashTrophies pic')
              .session(session),
          ])

          // Generate temporary challenge ID
          const tempChallengeId = new mongoose.Types.ObjectId().toString()

          // Use the matched user's categories if available, otherwise use our random ones
          const matchCategories =
            potentialMatch.preferredCategories || categories

          console.log(
            `[MATCHMAKING_SERVICE] Creating challenge between ${userId} and ${potentialMatch.user}`,
          )

          // Remove the matched user from matchmaking first (within transaction)
          await QuickClashMatchmaking.findOneAndDelete({
            user: potentialMatch.user,
          }).session(session)

          // Commit transaction before starting challenge creation
          console.log(
            `[MATCHMAKING_SERVICE] Transaction completed, starting challenge creation`,
          )

          // Start challenge creation outside of transaction (after commit)
          setImmediate(async () => {
            try {
              await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate some processing delay
              // FIXED: Notify users that a match has been found (this is safe to emit early)
              globalEmitter.emit('quickClash:matchFound', {
                challenger: joiningUser,
                opponent: matchedUser,
                tempChallengeId,
              })

              // Start challenge creation
              const challengeResult = await createChallenge({
                challengerId: userId,
                opponentId: potentialMatch.user,
                categories: matchCategories,
                fromMatchMaking: true,
              })

              console.log(
                `[MATCHMAKING_SERVICE] Challenge created successfully: ${challengeResult.challenge._id}`,
              )

              // FIXED: Only emit matchReady AFTER challenge is successfully created and saved
              globalEmitter.emit('quickClash:matchReady', {
                challengeId: challengeResult.challenge._id,
                challengerData: joiningUser,
                opponentData: matchedUser,
                oldChallengeId: tempChallengeId,
              })

              // Notify users of successful challenge creation
              notifyChallengerAboutCreation({
                challenge: challengeResult.challenge,
                challenger: joiningUser,
                opponent: matchedUser,
                success: true,
              }).catch(error => {
                console.error(
                  'Error notifying about challenge creation:',
                  error,
                )
              })
            } catch (error) {
              console.error(
                '[MATCHMAKING_SERVICE] Error in background challenge creation:',
                error,
              )

              // FIXED: Only emit error events if challenge creation fails
              globalEmitter.emit('quickClash:challengeCreationFailed', {
                challengerId: userId,
                opponentId: potentialMatch.user,
                error: error.message,
              })

              // Also emit a more specific error for the frontend to handle
              globalEmitter.emit('quickClash:matchCreationFailed', {
                challengerId: userId,
                opponentId: potentialMatch.user,
                tempChallengeId,
                error: error.message,
              })
            }
          })

          // Return null since this user doesn't need a matchmaking entry (matched immediately)
          return null
        }
      }

      // No match found or couldn't lock potential match, create matchmaking entry
      console.log(
        `[MATCHMAKING_SERVICE] No match found for user ${userId}, creating matchmaking entry`,
      )

      // Create a new matchmaking entry
      const matchmakingEntry = new QuickClashMatchmaking({
        user: userId,
        preferredCategories: categories,
        status: 'available',
        expiresAt: new Date(Date.now() + MATCHMAKING_EXPIRY),
      })
      await matchmakingEntry.save({ session })

      const userData = await User.findById(userId)
        .select('_id name inGameName pic quickClashTrophies')
        .session(session)

      console.log(
        `[MATCHMAKING_SERVICE] User ${userId} (${userData.name}) joined matchmaking queue`,
      )

      // Emit event for real-time updates with proper user data (after transaction commits)
      setImmediate(() => {
        globalEmitter.emit('quickClash:userJoinedMatchmaking', {
          userId,
          userData,
          preferredCategories: categories,
          trophies: userData.quickClashTrophies || 1000,
          userName: userData.name,
        })

        // Schedule a bot to respond after a random delay
        scheduleRandomBotResponse(userId, categories)
      })

      return matchmakingEntry
    }, transactionOptions)
  } catch (error) {
    console.error(
      `[MATCHMAKING_SERVICE] Error in joinMatchmaking for user ${userId}:`,
      error,
    )

    // If transaction fails, make sure to emit an error event
    if (transactionStarted) {
      setImmediate(() => {
        globalEmitter.emit('quickClash:matchmakingError', {
          userId,
          error: error.message,
        })
      })
    }

    throw error
  } finally {
    await session.endSession()
  }
}

/**
 * Schedule a random bot to respond to a user's matchmaking request
 * @param {string} userId - Real user's ID
 * @param {Array<string>} categories - Selected categories
 */
const scheduleRandomBotResponse = async (userId, categories) => {
  try {
    // Get a random bot user
    const botUser = await getRandomBotUser()

    if (!botUser) {
      console.log(
        '[MATCHMAKING_SERVICE] No bot users available for matchmaking response',
      )
      return
    }

    // Calculate a random delay between 5 seconds and 5 minutes (for testing)
    const minDelay = 5000 // 5 seconds
    const maxDelay = 5 * 60 * 1000 // 5 minutes
    const randomDelay =
      Math.floor(Math.random() * (maxDelay - minDelay)) + minDelay

    console.log(
      `[MATCHMAKING_SERVICE] Scheduling bot ${
        botUser._id
      } to respond to user ${userId} in ${randomDelay / 1000} seconds`,
    )

    // Create a botResponseTimer object to allow cancellation
    const botResponseTimer = setTimeout(async () => {
      try {
        // Check if the user is still in matchmaking
        const userEntry = await QuickClashMatchmaking.findOne({
          user: userId,
          status: 'available',
        })

        if (!userEntry) {
          console.log(
            '[MATCHMAKING_SERVICE] User no longer in matchmaking, cancelling bot response',
          )
          return
        }

        console.log(
          `[MATCHMAKING_SERVICE] Bot ${botUser._id} responding to user ${userId}`,
        )

        // Lock both users for the challenge
        await lockUserForChallenge({ userId })
        await lockUserForChallenge({ userId: botUser._id })

        // Create a challenge between them
        console.log(
          `[MATCHMAKING_SERVICE] Creating challenge between real user ${userId} and bot ${botUser._id}`,
        )

        // Start creating the challenge in the background
        const challengeId = new mongoose.Types.ObjectId().toString()

        // Get both user details for UI
        const [creatorData, accepterData] = await Promise.all([
          User.findById(userId)
            .select('_id name inGameName quickClashTrophies pic')
            .lean(),
          User.findById(botUser._id)
            .select('_id name inGameName quickClashTrophies pic')
            .lean(),
        ])

        // FIXED: Notify users that a match has been found (safe to emit early)
        globalEmitter.emit('quickClash:matchFound', {
          challenger: creatorData,
          opponent: accepterData,
          tempChallengeId: challengeId,
        })

        try {
          // Create the challenge
          const challengeResult = await createChallenge({
            challengerId: userId,
            opponentId: botUser._id,
            categories,
            fromMatchMaking: true,
          })

          console.log(
            `[MATCHMAKING_SERVICE] Bot challenge created successfully: ${challengeResult.challenge._id}`,
          )

          // FIXED: Only emit matchReady AFTER challenge is successfully created and saved
          globalEmitter.emit('quickClash:matchReady', {
            challengeId: challengeResult.challenge._id,
            challengerData: creatorData,
            opponentData: accepterData,
            oldChallengeId: challengeId, // Pass the old ID for reference
          })

          // Schedule the bot to complete the challenge later
          await scheduleBotResponse({
            challengeId: challengeResult.challenge._id,
            botId: botUser._id,
            delayMinutes: Math.floor(Math.random() * 25),
          })

          // Clean up matchmaking entries
          await QuickClashMatchmaking.deleteMany({
            user: { $in: [userId, botUser._id] },
          })
        } catch (challengeError) {
          console.error(
            '[MATCHMAKING_SERVICE] Error creating bot challenge:',
            challengeError,
          )

          // FIXED: Only emit error events if challenge creation fails
          globalEmitter.emit('quickClash:challengeCreationFailed', {
            challengerId: userId,
            opponentId: botUser._id,
            error: challengeError.message,
          })

          globalEmitter.emit('quickClash:matchCreationFailed', {
            challengerId: userId,
            opponentId: botUser._id,
            tempChallengeId: challengeId,
            error: challengeError.message,
          })
        }
      } catch (error) {
        console.error(
          '[MATCHMAKING_SERVICE] Error in bot matchmaking response:',
          error,
        )
      }
    }, randomDelay)

    // Store the timer for potential cancellation
    botResponseTimers[userId] = botResponseTimer
  } catch (error) {
    console.error('[MATCHMAKING_SERVICE] Error scheduling bot response:', error)
  }
}

// In-memory store for bot response timers
const botResponseTimers = {}

/**
 * Cancel any pending bot response timers for a user
 * @param {string} userId - User ID to cancel timers for
 */
const cancelBotResponseTimer = userId => {
  if (botResponseTimers[userId]) {
    clearTimeout(botResponseTimers[userId])
    delete botResponseTimers[userId]
    console.log(
      `[MATCHMAKING_SERVICE] Cancelled bot response timer for user ${userId}`,
    )
  }
}

/**
 * Get a random bot user from the database
 * @returns {Promise<Object|null>} A random bot user or null if none found
 */
const getRandomBotUser = async () => {
  try {
    // Find users with emails matching the dummy pattern
    const botUsers = await User.find({
      email: { $regex: /^dummy\d+@mail\.com$/ },
    })
      .select('_id')
      .lean()

    if (!botUsers || botUsers.length === 0) {
      return null
    }

    // Select a random bot
    const randomIndex = Math.floor(Math.random() * botUsers.length)
    return botUsers[randomIndex]
  } catch (error) {
    console.error('[MATCHMAKING_SERVICE] Error getting random bot user:', error)
    return null
  }
}

/**
 * Leave the matchmaking room
 * @param {Object} params - Parameters
 * @param {string} params.userId - User ID
 * @returns {Promise<boolean>} Success status
 */
const leaveMatchmaking = async ({ userId }) => {
  try {
    console.log(`[MATCHMAKING_SERVICE] User ${userId} leaving matchmaking`)

    const result = await QuickClashMatchmaking.findOneAndDelete({
      user: userId,
    })

    if (result) {
      // Cancel any pending bot response timer
      cancelBotResponseTimer(userId)

      console.log(
        `[MATCHMAKING_SERVICE] User ${userId} successfully left matchmaking`,
      )

      // Emit event for real-time updates
      globalEmitter.emit('quickClash:userLeftMatchmaking', {
        userId,
      })
    } else {
      console.log(`[MATCHMAKING_SERVICE] User ${userId} was not in matchmaking`)
    }

    return !!result
  } catch (error) {
    console.error('[MATCHMAKING_SERVICE] Error leaving matchmaking:', error)
    throw error
  }
}

/**
 * Update user status in matchmaking
 * @param {Object} params - Parameters
 * @param {string} params.userId - User ID
 * @param {string} params.status - New status ('available', 'in_challenge', 'offline')
 * @returns {Promise<Object|null>} Updated matchmaking entry or null
 */
const updateMatchmakingStatus = async ({ userId, status }) => {
  try {
    const entry = await QuickClashMatchmaking.findOne({ user: userId })

    if (!entry) return null

    entry.status = status
    entry.lastActive = new Date()
    await entry.save()

    // Emit event for real-time updates
    globalEmitter.emit('quickClash:matchmakingStatusUpdated', {
      userId,
      status,
    })

    return entry
  } catch (error) {
    console.error(
      '[MATCHMAKING_SERVICE] Error updating matchmaking status:',
      error,
    )
    throw error
  }
}

/**
 * Check if a user is a bot
 * @param {Object} params - Parameters
 * @param {string} params.userId - User ID
 * @returns {Promise<boolean>} Whether the user is a bot
 */
const isBot = async ({ userId }) => {
  try {
    const user = await User.findById(userId).select('email')
    return user ? /^dummy\d+@mail\.com$/.test(user.email) : false
  } catch (error) {
    console.error('[MATCHMAKING_SERVICE] Error checking if user is bot:', error)
    return false
  }
}

/**
 * Helper function: Get random categories
 * @param {number} count - Number of categories to return
 * @returns {Array<string>} Array of random categories
 */
const getRandomCategories = (count = 2) => {
  const allCategories = getCategories()

  // Shuffle and take the specified number
  const shuffled = [...allCategories].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

/**
 * Lock a user in matchmaking to prevent multiple accepts
 * Enhanced with better error handling and session support
 * @param {Object} params - Parameters
 * @param {string} params.userId - User to lock
 * @param {Object} [params.session] - MongoDB session for transaction
 * @returns {Promise<boolean>} Success status
 */
const lockUserForChallenge = async ({ userId, session }) => {
  try {
    console.log(`[MATCHMAKING_SERVICE] Attempting to lock user ${userId}`)

    // Attempt to update the user's status to 'locked'
    const query = {
      user: userId,
      status: 'available', // Only lock if currently available
    }

    const update = {
      status: 'locked',
      lastActive: new Date(),
    }

    const options = { new: true }
    if (session) {
      options.session = session
    }

    const result = await QuickClashMatchmaking.findOneAndUpdate(
      query,
      update,
      options,
    )

    if (!result) {
      console.log(
        `[MATCHMAKING_SERVICE] Failed to lock user ${userId} - not available or doesn't exist`,
      )
      return false // User was not available or doesn't exist
    }

    console.log(`[MATCHMAKING_SERVICE] Successfully locked user ${userId}`)

    // Cancel any pending bot response timer
    cancelBotResponseTimer(userId)

    // Broadcast that this user is now locked/unavailable
    setImmediate(() => {
      globalEmitter.emit('quickClash:userLocked', {
        userId,
      })
    })

    return true
  } catch (error) {
    console.error(
      `[MATCHMAKING_SERVICE] Error locking user ${userId} for challenge:`,
      error,
    )
    return false
  }
}

/**
 * Clean up expired matchmaking entries
 * @returns {Promise<number>} Number of entries cleaned up
 */
const cleanupExpiredEntries = async () => {
  try {
    const result = await QuickClashMatchmaking.deleteMany({
      expiresAt: { $lt: new Date() },
    })

    if (result.deletedCount > 0) {
      console.log(
        `[MATCHMAKING_SERVICE] Cleaned up ${result.deletedCount} expired matchmaking entries`,
      )
    }

    return result.deletedCount
  } catch (error) {
    console.error(
      '[MATCHMAKING_SERVICE] Error cleaning up expired entries:',
      error,
    )
    return 0
  }
}

// Run cleanup every 5 minutes
setInterval(cleanupExpiredEntries, 5 * 60 * 1000)

module.exports = {
  joinMatchmaking,
  leaveMatchmaking,
  updateMatchmakingStatus,
  isBot,
  getRandomCategories,
  lockUserForChallenge,
  cleanupExpiredEntries,
}
