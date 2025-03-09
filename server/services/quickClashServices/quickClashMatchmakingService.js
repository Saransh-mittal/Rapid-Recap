// services/quickClashServices/quickClashMatchmakingService.js
const mongoose = require('mongoose')
const QuickClashMatchmaking = require('../../model/quickClashSchemas/quickClashMatchmakingSchema')
const User = require('../../model/userSchema')
const globalEmitter = require('../../eventEmitter')
const { createChallenge } = require('./quickClashChallengeService')
const { sendNotification } = require('../notificationService')
const {
  notifyChallengerAboutCreation,
} = require('./quickClashNotificationService')

// Constants
const MATCHMAKING_EXPIRY = 30 * 60 * 1000 // 30 minutes
const MAX_DISPLAYED_USERS = 6 // Maximum users to display in matchmaking
const BOT_POOL_SIZE = 15 // Size of bot pool to maintain

/**
 * Join the matchmaking room
 * @param {Object} params - Parameters
 * @param {string} params.userId - User ID
 * @param {Array<string>} params.categories - Selected categories (exactly 2)
 * @returns {Promise<Object>} The matchmaking entry
 */
const joinMatchmaking = async ({ userId, categories }) => {
  // Validate that exactly 2 categories are selected
  if (!categories || !Array.isArray(categories) || categories.length !== 2) {
    throw new Error('Exactly 2 categories must be selected')
  }

  const session = await mongoose.startSession()
  try {
    return await session.withTransaction(async () => {
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
      const userData = await User.findById(userId).select(
        '_id name inGameName pic',
      )
      // Emit event for real-time updates
      globalEmitter.emit('quickClash:userJoinedMatchmaking', {
        userId,
        userData,
        preferredCategories: categories,
      })

      return matchmakingEntry
    })
  } finally {
    session.endSession()
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
      // Emit event for real-time updates
      globalEmitter.emit('quickClash:userLeftMatchmaking', {
        userId,
      })
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
 * Get available users for matchmaking
 * @param {Object} params - Parameters
 * @param {string} params.userId - Current user ID
 * @returns {Promise<Array>} List of available users
 */
const getAvailableUsers = async ({ userId }) => {
  try {
    // First get real users in matchmaking (excluding current user)
    const matchmakingQuery = {
      user: { $ne: userId },
      status: 'available',
    }

    // Find real users in matchmaking and populate user details
    let realUsers = await QuickClashMatchmaking.find(matchmakingQuery)
      .populate('user', 'name inGameName pic userLanguage')
      .sort({ lastActive: -1 })
      .lean()

    // If we have MAX_DISPLAYED_USERS or more real users, return just the real users
    if (realUsers.length >= MAX_DISPLAYED_USERS) {
      // Return only MAX_DISPLAYED_USERS of them, hiding the isBot property
      return realUsers.slice(0, MAX_DISPLAYED_USERS).map(entry => ({
        user: entry.user,
        status: entry.status,
        preferredCategories: entry.preferredCategories,
        lastActive: entry.lastActive,
      }))
    }

    // We need to fill in with bots
    const botsNeeded = MAX_DISPLAYED_USERS - realUsers.length

    // Get available bot entries or create some if needed
    const botEntries = await getOrCreateBotEntries(botsNeeded)

    // Combine real users and bots, hide the isBot property
    const combinedUsers = [
      ...realUsers.map(entry => ({
        user: entry.user,
        status: entry.status,
        preferredCategories: entry.preferredCategories,
        lastActive: entry.lastActive,
      })),
      ...botEntries.map(entry => ({
        user: entry.user,
        status: entry.status,
        preferredCategories: entry.preferredCategories,
        lastActive: entry.lastActive,
      })),
    ]

    // Return combined list, shuffled slightly
    return shuffleArray(combinedUsers).slice(0, MAX_DISPLAYED_USERS)
  } catch (error) {
    console.error('Error getting available users for matchmaking:', error)
    throw error
  }
}

/**
 * Get bot entries from the database or create new ones if needed
 * @param {number} count - Number of bot entries needed
 * @returns {Promise<Array>} Bot entries
 */
const getOrCreateBotEntries = async count => {
  try {
    // First check if we already have bot entries
    const existingBots = await QuickClashMatchmaking.find({
      isBot: true,
      status: 'available',
    })
      .populate('user', 'name inGameName pic userLanguage')
      .lean()

    // If we have enough, return a random subset
    if (existingBots.length >= count) {
      return shuffleArray(existingBots).slice(0, count)
    }

    // We need to create more bot entries
    const botsToCreate = count - existingBots.length

    // Find bot users that are not already in matchmaking
    const existingBotIds = existingBots.map(bot => bot.user._id.toString())

    const botUsers = await User.find({
      email: { $regex: /^dummy\d+@mail\.com$/ },
      _id: { $nin: existingBotIds },
    })
      .select('_id name inGameName pic userLanguage')
      .limit(botsToCreate)

    if (botUsers.length === 0) {
      return existingBots
    }

    // Create new bot entries
    const newBotEntries = []
    const MATCHMAKING_EXPIRY = 60 * 60 * 1000 // 1 hours

    for (const bot of botUsers) {
      // Create 2 random categories for the bot
      const categories = getRandomCategories(2)

      const entry = new QuickClashMatchmaking({
        user: bot._id,
        isBot: true,
        status: 'available',
        preferredCategories: categories,
        lastActive: new Date(),
        expiresAt: new Date(Date.now() + MATCHMAKING_EXPIRY),
      })

      await entry.save()

      // Create populated version for return
      newBotEntries.push({
        user: bot,
        isBot: true,
        status: 'available',
        preferredCategories: categories,
        lastActive: new Date(),
      })
    }

    // Combine existing and new bots
    return [...existingBots, ...newBotEntries]
  } catch (error) {
    console.error('Error getting or creating bot entries:', error)
    return []
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
 * Simulate bot response to a challenge
 * @param {Object} params - Parameters
 * @param {string} params.challengeId - Challenge ID
 * @param {string} params.botId - Bot user ID
 * @returns {Promise<Object>} Simulation result
 */
const simulateBotResponse = async ({ challengeId, botId }) => {
  try {
    // Random delay before bot responds (3-8 seconds)
    const delay = Math.floor(Math.random() * 5000) + 3000

    // 80% chance of accepting the challenge
    const willAccept = Math.random() < 0.8

    return new Promise(resolve => {
      setTimeout(async () => {
        try {
          // Emit response through global event emitter
          globalEmitter.emit('quickClash:botResponse', {
            challengeId,
            botId,
            accepted: willAccept,
          })

          resolve({ success: true, accepted: willAccept })
        } catch (error) {
          console.error('Error in bot response simulation:', error)
          resolve({ success: false, error: error.message })
        }
      }, delay)
    })
  } catch (error) {
    console.error('Error simulating bot response:', error)
    throw error
  }
}

/**
 * Helper function: Get random categories
 * @param {number} count - Number of categories to return
 * @returns {Array<string>} Array of random categories
 */
const getRandomCategories = (count = 2) => {
  const allCategories = [
    'World',
    'Politics',
    'Business',
    'Technology',
    'Sports',
    'Health',
    'Science',
    'Environment',
  ]

  // Shuffle and take the specified number
  const shuffled = [...allCategories].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

/**
 * Helper function: Shuffle array (Fisher-Yates algorithm)
 * @param {Array} array - Array to shuffle
 * @returns {Array} Shuffled array
 */
const shuffleArray = array => {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}

/**
 * Accept a challenge from matchmaking
 * @param {Object} params - Parameters
 * @param {string} params.accepterId - User accepting the challenge
 * @param {string} params.creatorId - User who created the matchmaking entry
 * @param {Array<string>} params.categories - Selected categories (exactly 2)
 * @returns {Promise<Object>} Initial response with user data
 */
const acceptMatchmakingChallengeService = async ({
  accepterId,
  creatorId,
  categories,
}) => {
  // First try to lock the creator
  const locked = await lockUserForChallenge({ userId: creatorId })
  if (!locked) {
    throw new Error('This user is no longer available for challenges')
  }

  try {
    // Get both user details for UI
    const [creatorData, accepterData] = await Promise.all([
      User.findById(creatorId).select('_id name inGameName pic').lean(),
      User.findById(accepterId).select('_id name inGameName pic').lean(),
    ])

    // Remove both users from matchmaking immediately
    await Promise.all([
      QuickClashMatchmaking.findOneAndDelete({ user: creatorId }),
      QuickClashMatchmaking.findOneAndDelete({ user: accepterId }),
    ])

    // Emit events to remove users from matchmaking UI
    globalEmitter.emit('quickClash:userRemoved', { userId: creatorId })
    globalEmitter.emit('quickClash:userRemoved', { userId: accepterId })

    // Generate a temporary ID for the challenge - we'll replace this when it's created
    const tempChallengeId = new mongoose.Types.ObjectId().toString()

    // Emit event with data for the creation modal immediately
    globalEmitter.emit('quickClash:matchChallenge', {
      challengerId: creatorId,
      opponentId: accepterId,
      challengeId: tempChallengeId, // Temporary ID
      categories,
      challengerData: creatorData,
      opponentData: accepterData,
    })

    // Start challenge creation in the background
    setTimeout(async () => {
      try {
        // Create the challenge in the background
        const challengeResult = await createChallenge({
          challengerId: creatorId,
          opponentId: accepterId,
          categories,
          fromMatchMaking: true,
        })

        // Emit event when challenge is actually created
        globalEmitter.emit('quickClash:matchReady', {
          challengeId: challengeResult.challenge._id,
          challengerData: creatorData,
          opponentData: accepterData,
          oldChallengeId: tempChallengeId, // Pass the old ID for reference
        })

        // Notify users of successful challenge creation
        notifyChallengerAboutCreation({
          challenge: challengeResult.challenge,
          challenger: creatorData,
          opponent: accepterData,
          success: true,
        }).catch(error => {
          console.error(
            'Error notifying challenger about challenge creation:',
            error,
          )
        })
      } catch (error) {
        console.error('Error creating challenge in background:', error)

        // Notify users of failure
        globalEmitter.emit('quickClash:matchFailed', {
          challengerId: creatorId,
          opponentId: accepterId,
          error: error.message,
          oldChallengeId: tempChallengeId,
        })
      }
    }, 0) // Start immediately but in the background

    // Return initial response with user data
    return {
      message: 'Challenge acceptance initiated',
      tempChallengeId,
      challenger: creatorData,
      opponent: accepterData,
      categories,
    }
  } catch (error) {
    // If something fails, unlock the user
    await QuickClashMatchmaking.findOneAndUpdate(
      { user: creatorId, status: 'locked' },
      { status: 'available' },
    )
    throw error
  }
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
  getAvailableUsers,
  simulateBotResponse,
  isBot,
  getRandomCategories,
  acceptMatchmakingChallengeService,
}
