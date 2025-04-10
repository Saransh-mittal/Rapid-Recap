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

/**
 * Join the matchmaking room - now with automatic category selection and real user matching
 * @param {Object} params - Parameters
 * @param {string} params.userId - User ID
 * @returns {Promise<Object>} The matchmaking entry or null if immediately matched
 */
const joinMatchmaking = async ({ userId }) => {
  // Generate two random categories
  const categories = getRandomCategories(2)

  // await checkChallengeLimits({ userId })
  const session = await mongoose.startSession()
  try {
    return await session.withTransaction(async () => {
      // If the user is not a bot, check for other real users to match with first

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
        // We found a real user to match with!
        // Lock both users to prevent race conditions
        await lockUserForChallenge({ userId: potentialMatch.user })
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
        const matchCategories = potentialMatch.preferredCategories || categories

        // NEW: Notify users that a match has been found before starting challenge creation
        globalEmitter.emit('quickClash:matchFound', {
          challenger: joiningUser,
          opponent: matchedUser,
          tempChallengeId,
        })

        // Start challenge creation in the background
        const challengeResult = await createChallenge({
          challengerId: userId,
          opponentId: potentialMatch.user,
          categories: matchCategories,
          fromMatchMaking: true,
        })
        // Remove the matched user from matchmaking
        await QuickClashMatchmaking.findOneAndDelete({
          user: potentialMatch.user,
        })

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
          console.error('Error notifying about challenge creation:', error)
        })

        // Return null since this user doesn't need a matchmaking entry (matched immediately)
        return null
      }

      // Check if user is already in matchmaking
      let matchmakingEntry = await QuickClashMatchmaking.findOne({
        user: userId,
      }).session(session)

      if (matchmakingEntry) {
        // Update the existing entry
        matchmakingEntry.status = 'available'
        matchmakingEntry.preferredCategories = categories
        matchmakingEntry.lastActive = new Date()
        matchmakingEntry.expiresAt = new Date(Date.now() + MATCHMAKING_EXPIRY)
        await matchmakingEntry.save({ session })
      } else {
        // Create a new entry
        matchmakingEntry = new QuickClashMatchmaking({
          user: userId,
          preferredCategories: categories,
          status: 'available',
          expiresAt: new Date(Date.now() + MATCHMAKING_EXPIRY),
        })
        await matchmakingEntry.save({ session })
      }

      const userData = await User.findById(userId)
        .select('_id name inGameName pic')
        .session(session)

      // Emit event for real-time updates
      globalEmitter.emit('quickClash:userJoinedMatchmaking', {
        userId,
        userData,
        preferredCategories: categories,
      })

      // Schedule a bot to respond after a random delay
      scheduleRandomBotResponse(userId, categories)

      return matchmakingEntry
    })
  } finally {
    session.endSession()
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
      console.log('No bot users available for matchmaking response')
      return
    }

    // Calculate a random delay between 0 and 30 minutes (in milliseconds)
    const minDelay = 0
    const maxDelay = 30 * 60 * 1000
    const randomDelay =
      Math.floor(Math.random() * (maxDelay - minDelay)) + minDelay

    console.log(
      `Scheduling bot ${botUser._id} to respond to user ${userId} in ${
        randomDelay / 1000
      } seconds`,
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
          console.log('User no longer in matchmaking, cancelling bot response')
          return
        }

        // Lock both users for the challenge
        await lockUserForChallenge({ userId })
        await lockUserForChallenge({ userId: botUser._id })

        // Create a challenge between them
        console.log(
          `Creating challenge between real user ${userId} and bot ${botUser._id}`,
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

        // NEW: Notify users that a match has been found
        globalEmitter.emit('quickClash:matchFound', {
          challenger: creatorData,
          opponent: accepterData,
          tempChallengeId: challengeId,
        })

        // Create the challenge in the background
        const challengeResult = await createChallenge({
          challengerId: userId,
          opponentId: botUser._id,
          categories,
          fromMatchMaking: true,
        })

        // Emit event when challenge is actually created
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
      } catch (error) {
        console.error('Error in bot matchmaking response:', error)
      }
    }, randomDelay)

    // Store the timer for potential cancellation
    // Note: In a production app, you'd store this in a more persistent way
    // such as Redis or a database to survive server restarts
    botResponseTimers[userId] = botResponseTimer
  } catch (error) {
    console.error('Error scheduling bot response:', error)
  }
}

// In-memory store for bot response timers
// NOTE: In production, you would use Redis or similar for persistence
const botResponseTimers = {}

/**
 * Cancel any pending bot response timers for a user
 * @param {string} userId - User ID to cancel timers for
 */
const cancelBotResponseTimer = userId => {
  if (botResponseTimers[userId]) {
    clearTimeout(botResponseTimers[userId])
    delete botResponseTimers[userId]
    console.log(`Cancelled bot response timer for user ${userId}`)
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
    console.error('Error getting random bot user:', error)
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
    const result = await QuickClashMatchmaking.findOneAndDelete({
      user: userId,
    })

    if (result) {
      // Cancel any pending bot response timer
      cancelBotResponseTimer(userId)
    }

    return !!result
  } catch (error) {
    console.error('Error leaving matchmaking:', error)
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
    console.error('Error updating matchmaking status:', error)
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
    console.error('Error checking if user is bot:', error)
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
 * @param {Object} params - Parameters
 * @param {string} params.userId - User to lock
 * @returns {Promise<boolean>} Success status
 */
const lockUserForChallenge = async ({ userId }) => {
  try {
    // Attempt to update the user's status to 'locked'
    const result = await QuickClashMatchmaking.findOneAndUpdate(
      {
        user: userId,
        status: 'available', // Only lock if currently available
      },
      {
        status: 'locked',
        lastActive: new Date(),
      },
      { new: true },
    )

    if (!result) {
      return false // User was not available or doesn't exist
    }

    // Cancel any pending bot response timer
    cancelBotResponseTimer(userId)

    // Broadcast that this user is now locked/unavailable
    globalEmitter.emit('quickClash:userLocked', {
      userId,
    })

    return true
  } catch (error) {
    console.error('Error locking user for challenge:', error)
    return false
  }
}

module.exports = {
  joinMatchmaking,
  leaveMatchmaking,
  updateMatchmakingStatus,
  isBot,
  getRandomCategories,
  lockUserForChallenge,
}
