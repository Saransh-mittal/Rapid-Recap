// services/quickClashServices/interBotQuickClashService.js
const mongoose = require('mongoose')
const User = require('../../model/userSchema')
const QuickClashChallenge = require('../../model/quickClashSchemas/quickClashChallengeSchema')
const { initiateBotChallenge } = require('./quickClashBotService')
const { createSimulatedChallenge } = require('./simulatedChallengeService')

/**
 * Get a list of available bot users
 * @param {Object} params - Parameters
 * @param {number} [params.count=10] - Number of bots to return
 * @returns {Promise<Array>} List of bot users
 */
const getAvailableBots = async ({ count = 10 } = {}) => {
  try {
    // Find users with emails that match the dummy user pattern
    const bots = await User.find({ email: /^dummy\d+@mail\.com$/ })
      .select('_id name inGameName email')
      .limit(count * 2) // Get more than needed to ensure we have enough unique bots

    if (!bots.length) {
      throw new Error('No bot users found in the system')
    }

    // Shuffle the bots to get a random selection
    const shuffledBots = bots.sort(() => 0.5 - Math.random())

    return shuffledBots.slice(0, count)
  } catch (error) {
    console.error('Error getting available bots:', error)
    throw error
  }
}

/**
 * Simulate a Quick Clash challenge between two bots with retry mechanism
 * @param {Object} params - Parameters
 * @param {string} params.challengerId - Challenger bot ID
 * @param {string} params.opponentId - Opponent bot ID
 * @param {Array<string>} [params.categories] - Optional categories for the challenge
 * @param {Object} [params.options] - Optional configuration for the simulation
 * @returns {Promise<Object>} Challenge result
 */
const simulateInterBotChallenge = async ({
  challengerId,
  opponentId,
  categories = ['Technology', 'Science'],
  options = {},
}) => {
  const session = await mongoose.startSession()
  try {
    await session.startTransaction()

    // 1. Create the simulated challenge (no AI resources)
    const challengeResult = await createSimulatedChallenge({
      challengerId,
      opponentId,
      categories,
      fromMatchMaking: false,
    })

    const challengeId = challengeResult.challenge._id.toString()

    // Prepare options for each bot
    const challengerOptions = {
      // skillLevel: options.challengerSkill || Math.random() * 0.5 + 0.3, // 0.3-0.8
      // readingSpeed: options.challengerReadingSpeed,
      // quickResponse: options.quickResponse || false,
    }

    const opponentOptions = {
      // skillLevel: options.opponentSkill || Math.random() * 0.5 + 0.3, // 0.3-0.8
      // readingSpeed: options.opponentReadingSpeed,
      // quickResponse: options.quickResponse || false,
    }

    // 2. Simulate challenger's attempt
    let challengerResult
    try {
      challengerResult = await initiateBotChallenge({
        challengeId,
        botId: challengerId,
        options: challengerOptions,
      })
    } catch (error) {
      console.error('Error in challenger simulation:', error)
      throw error
    }

    // Add a significant delay between challenger and opponent simulations
    // This helps prevent MongoDB write conflicts
    await new Promise(resolve => setTimeout(resolve, 3000))

    // 3. Simulate opponent's attempt with retry mechanism
    let opponentResult
    let retries = 3

    while (retries > 0) {
      try {
        opponentResult = await initiateBotChallenge({
          challengeId,
          botId: opponentId,
          options: opponentOptions,
        })
        break // Success, exit retry loop
      } catch (error) {
        retries--
        if (retries === 0) {
          console.error('All retries failed for opponent simulation:', error)
          throw error
        }

        // Check if this is a transient error worth retrying
        const isTransientError =
          error.name === 'MongoServerError' &&
          (error.code === 112 ||
            error.errorLabels?.includes('TransientTransactionError'))

        if (!isTransientError) {
          console.error('Non-transient error in opponent simulation:', error)
          throw error
        }

        // Add exponential backoff between retries
        const delay = 2000 * Math.pow(2, 3 - retries)
        console.log(
          `Retrying opponent simulation in ${delay}ms, ${retries} retries left`,
        )
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

    await session.commitTransaction()

    // 5. Return complete challenge with scores
    const completedChallenge = await QuickClashChallenge.findById(challengeId)
      .populate('challenger', '_id name inGameName')
      .populate('opponent', '_id name inGameName')

    return {
      challenge: completedChallenge,
      challengerScore: challengerResult.score?.RQM_score || 0,
      opponentScore: opponentResult.score?.RQM_score || 0,
    }
  } catch (error) {
    await session.abortTransaction()
    console.error('Error simulating inter-bot challenge:', error)
    throw error
  } finally {
    session.endSession()
  }
}

/**
 * Simulate multiple inter-bot challenges
 * @param {Object} params - Parameters
 * @param {number} [params.count=5] - Number of challenges to simulate
 * @param {Array<string>} [params.categories] - Optional categories to use
 * @param {Object} [params.options] - Optional configuration
 * @returns {Promise<Array>} Results of the challenges
 */
const simulateMultipleInterBotChallenges = async ({
  count = 5,
  categories = [],
  options = {},
}) => {
  try {
    // Get available category pairs
    const categoryPairs =
      categories.length >= 2
        ? [categories.slice(0, 2)]
        : [
            ['Technology', 'Science'],
            ['Politics', 'World'],
            ['Health', 'Environment'],
            ['Business', 'Sports'],
            ['Technology', 'Business'],
          ]

    // Get available bots (we need twice the number of challenges)
    const bots = await getAvailableBots({ count: count * 2 })

    if (bots.length < count * 2) {
      throw new Error(
        `Not enough bots available. Need ${count * 2} bots, found ${
          bots.length
        }`,
      )
    }

    const results = []
    const challengePairs = []

    // Create unique bot pairs
    for (let i = 0; i < count; i++) {
      const challenger = bots[i * 2]
      const opponent = bots[i * 2 + 1]

      if (!challenger || !opponent) {
        throw new Error(`Could not create pair ${i + 1}. Not enough bots.`)
      }

      challengePairs.push({
        challenger,
        opponent,
        categories: categoryPairs[i % categoryPairs.length],
      })
    }

    // Create and simulate all challenges sequentially to avoid overloading
    for (const pair of challengePairs) {
      try {
        // Each challenge is independent, use retry mechanism if needed
        let retries = 2
        let result

        while (retries >= 0) {
          try {
            result = await simulateInterBotChallenge({
              challengerId: pair.challenger._id,
              opponentId: pair.opponent._id,
              categories: pair.categories,
              options,
            })
            break // Success, exit retry loop
          } catch (error) {
            if (retries === 0) {
              console.error(
                `Failed to simulate challenge after retries:`,
                error,
              )
              throw error
            }

            // Check if this is a transient error worth retrying
            const isTransientError =
              error.name === 'MongoServerError' &&
              (error.code === 112 ||
                error.errorLabels?.includes('TransientTransactionError'))

            if (!isTransientError) {
              console.error(
                'Non-transient error in challenge simulation:',
                error,
              )
              throw error
            }

            retries--
            const delay = 3000 * (3 - retries)
            console.log(
              `Retrying challenge simulation in ${delay}ms, ${retries} retries left`,
            )
            await new Promise(resolve => setTimeout(resolve, delay))
          }
        }

        results.push({
          ...result,
          challengerName: pair.challenger.inGameName || pair.challenger.name,
          opponentName: pair.opponent.inGameName || pair.opponent.name,
          categories: pair.categories,
        })

        // Add delay between challenge simulations to avoid DB contention
        await new Promise(resolve => setTimeout(resolve, 5000))
      } catch (error) {
        console.error(`Error simulating challenge for pair:`, pair, error)
        // Continue with next pair instead of failing the entire batch
      }
    }

    return results
  } catch (error) {
    console.error('Error simulating multiple inter-bot challenges:', error)
    throw error
  }
}

module.exports = {
  getAvailableBots,
  simulateInterBotChallenge,
  simulateMultipleInterBotChallenges,
}
