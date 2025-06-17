// utils/testing/testBattleExpirySystem.js
const mongoose = require('mongoose')
const QuickClashTeamBattle = require('../../model/quickClashSchemas/quickClashTeamBattleSchema')
const QuickClashChallenge = require('../../model/quickClashSchemas/quickClashChallengeSchema')
const QuickClashBattleExpiryEvent = require('../../model/quickClashSchemas/quickClashBattleExpiryEventSchema')
const {
  createBattleExpiryEvent,
} = require('../../services/quickClashServices/quickClashBattleExpiryService')
const {
  processPendingExpiryEvents,
} = require('../../services/quickClashServices/quickClashBattleExpiryService')

/**
 * Create a test battle with a short expiry time for testing purposes
 * @param {Object} params - Test parameters
 * @param {number} [params.expiryMinutes=2] - Minutes until battle expires
 * @param {string} [params.teamAId] - Optional team A ID (or will use a dummy ID)
 * @param {string} [params.teamBId] - Optional team B ID (or will use a dummy ID)
 * @returns {Promise<Object>} - Created battle and event
 */
const createTestBattleWithShortExpiry = async ({
  expiryMinutes = 2,
  teamAId = new mongoose.Types.ObjectId(),
  teamBId = new mongoose.Types.ObjectId(),
}) => {
  console.log(`[TEST] Creating test battle with ${expiryMinutes} minute expiry`)

  // Calculate expiry time
  const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000)

  // Create a minimal battle for testing
  const battle = new QuickClashTeamBattle({
    teamA: teamAId,
    teamB: teamBId,
    status: 'active',
    challenges: [
      {
        category: 'test_category',
        challenge: new mongoose.Types.ObjectId(),
        teamAScore: 0,
        teamBScore: 0,
        winner: null,
        teamACompleted: false,
        teamBCompleted: false,
      },
    ],
    teamAMembers: [
      {
        user: new mongoose.Types.ObjectId(),
        previousTrophies: 1000,
      },
    ],
    teamBMembers: [
      {
        user: new mongoose.Types.ObjectId(),
        previousTrophies: 1000,
      },
    ],
    expiresAt,
  })

  await battle.save()
  console.log(`[TEST] Created test battle: ${battle._id}`)

  // Create the expiry event
  const event = await createBattleExpiryEvent({
    battleId: battle._id,
    expiresAt,
  })

  console.log(`[TEST] Created expiry event: ${event?._id || 'failed'}`)

  // Log info for verification
  console.log(`[TEST] Battle will expire at: ${expiresAt}`)
  console.log(`[TEST] Current time: ${new Date()}`)
  console.log(`[TEST] Time remaining: ${expiryMinutes} minutes`)

  return { battle, event }
}

/**
 * Find expiry events for a battle
 * @param {string} battleId - Battle ID
 * @returns {Promise<Array>} - List of expiry events
 */
const findExpiryEventsForBattle = async battleId => {
  const events = await QuickClashBattleExpiryEvent.find({ battleId })
  console.log(
    `[TEST] Found ${events.length} expiry events for battle ${battleId}`,
  )

  // Log detailed info for each event
  events.forEach(event => {
    console.log(`[TEST] Event ${event._id}:`)
    console.log(`  Status: ${event.status}`)
    console.log(`  Executes At: ${event.executeAt}`)
    console.log(`  Created At: ${event.createdAt}`)
    console.log(`  Retry Count: ${event.retryCount}`)
    if (event.lastError) {
      console.log(`  Last Error: ${event.lastError}`)
    }
  })

  return events
}

/**
 * Manually trigger event processing for testing
 * @param {string} [battleId] - Optional battle ID to filter events
 * @returns {Promise<Array>} - Processed events
 */
const manuallyTriggerEventProcessing = async battleId => {
  console.log(
    `[TEST] Manually triggering event processing${
      battleId ? ` for battle ${battleId}` : ''
    }`,
  )

  // Override executeAt to process events immediately
  let query = { status: 'pending' }
  if (battleId) {
    query.battleId = battleId
  }

  // Make events eligible for processing by setting executeAt to the past
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
  const updatedEvents = await QuickClashBattleExpiryEvent.updateMany(query, {
    executeAt: fiveMinutesAgo,
  })

  console.log(
    `[TEST] Updated ${updatedEvents.modifiedCount} events to be eligible for processing`,
  )

  // Trigger processing
  await processPendingExpiryEvents()

  // Find processed events
  const query2 = battleId ? { battleId } : {}
  const events = await QuickClashBattleExpiryEvent.find(query2)

  console.log(`[TEST] After processing, found ${events.length} events`)
  events.forEach(event => {
    console.log(`[TEST] Event ${event._id}: status=${event.status}`)
  })

  return events
}

/**
 * Check if a battle has been completed
 * @param {string} battleId - Battle ID to check
 * @returns {Promise<Object>} - Battle details
 */
const checkBattleCompletion = async battleId => {
  const battle = await QuickClashTeamBattle.findById(battleId)

  if (!battle) {
    console.log(`[TEST] Battle ${battleId} not found!`)
    return null
  }

  console.log(`[TEST] Battle ${battleId} status: ${battle.status}`)
  console.log(`[TEST] Winner: ${battle.winner || 'none'}`)
  console.log(`[TEST] Team A wins: ${battle.teamAWins}`)
  console.log(`[TEST] Team B wins: ${battle.teamBWins}`)
  console.log(`[TEST] Ties: ${battle.ties}`)

  return battle
}

/**
 * Find and process already expired battles in the database
 * @param {Object} params - Parameters
 * @param {number} [params.limit=10] - Maximum number of battles to process
 * @param {boolean} [params.createEventsOnly=false] - If true, only create events without processing
 * @param {boolean} [params.processOnly=false] - If true, only process existing events without creating new ones
 * @returns {Promise<Array>} - List of processed battle IDs
 */
const processExistingExpiredBattles = async ({
  limit = 10,
  createEventsOnly = false,
  processOnly = false,
} = {}) => {
  console.log(`[TEST] Finding existing expired battles (limit: ${limit})`)

  // 1. Find active battles that have expired
  const expiredBattles = await QuickClashTeamBattle.find({
    status: 'active',
    expiresAt: { $lte: new Date() },
  })
    .limit(limit)
    .select('_id expiresAt createdAt')

  console.log(`[TEST] Found ${expiredBattles.length} expired active battles`)

  const processedBattleIds = []

  if (expiredBattles.length === 0) {
    console.log(`[TEST] No expired battles found to process`)
    return processedBattleIds
  }

  // Display info about found battles
  expiredBattles.forEach((battle, i) => {
    const expiryTime = new Date(battle.expiresAt).toLocaleString()
    const creationTime = new Date(battle.createdAt).toLocaleString()
    const expiredFor = Math.round(
      (Date.now() - battle.expiresAt) / (60 * 60 * 1000),
    ) // in hours

    console.log(`[TEST] ${i + 1}. Battle ${battle._id}:`)
    console.log(`   Created: ${creationTime}`)
    console.log(`   Expired: ${expiryTime} (${expiredFor} hours ago)`)
  })

  if (!processOnly) {
    // 2. Create expiry events for battles that don't have them
    console.log(`[TEST] Creating missing expiry events...`)

    for (const battle of expiredBattles) {
      // Check if event already exists
      const existingEvent = await QuickClashBattleExpiryEvent.findOne({
        battleId: battle._id,
      })

      if (!existingEvent) {
        console.log(`[TEST] Creating expiry event for battle ${battle._id}`)

        // Create event for immediate processing (5 minutes ago)
        const executeAt = new Date(Date.now() - 5 * 60 * 1000)

        await createBattleExpiryEvent({
          battleId: battle._id,
          expiresAt: executeAt,
        })

        processedBattleIds.push(battle._id.toString())
      } else {
        console.log(
          `[TEST] Battle ${battle._id} already has an event (status: ${existingEvent.status})`,
        )

        // If event failed, reset it
        if (existingEvent.status === 'failed') {
          console.log(`[TEST] Resetting failed event for battle ${battle._id}`)
          await QuickClashBattleExpiryEvent.findByIdAndUpdate(
            existingEvent._id,
            {
              status: 'pending',
              executeAt: new Date(Date.now() - 5 * 60 * 1000),
              retryCount: 0,
              lastError: null,
            },
          )
        }

        processedBattleIds.push(battle._id.toString())
      }
    }
  } else {
    // Just add all found battle IDs to the tracking array
    processedBattleIds.push(...expiredBattles.map(b => b._id.toString()))
  }

  // 3. Process the events if not createEventsOnly
  if (!createEventsOnly) {
    console.log(
      `[TEST] Processing expiry events for ${processedBattleIds.length} battles...`,
    )
    await processPendingExpiryEvents()

    // 4. Check completion status
    console.log(`[TEST] Checking completion status...`)
    for (const battleId of processedBattleIds) {
      const battle = await checkBattleCompletion(battleId)

      if (battle && battle.status === 'completed') {
        console.log(`[TEST] ✅ Battle ${battleId} completed successfully!`)
      } else if (battle) {
        console.log(
          `[TEST] ⚠️ Battle ${battleId} still active after processing!`,
        )
      } else {
        console.log(`[TEST] ❌ Battle ${battleId} not found after processing!`)
      }
    }
  } else {
    console.log(`[TEST] Skipped processing (createEventsOnly=true)`)
  }

  return processedBattleIds
}

/**
 * Run a full test of the battle expiry system
 * @param {Object} [params] - Optional parameters
 * @param {number} [params.expiryMinutes=1] - Minutes until expiry
 * @param {boolean} [params.skipManualProcessing=false] - If true, won't trigger manual processing
 * @param {boolean} [params.checkOnly=false] - If true, will only check without creating
 * @param {string} [params.battleId] - Existing battle ID for checking
 */
const runFullTest = async ({
  expiryMinutes = 1,
  skipManualProcessing = false,
  checkOnly = false,
  battleId,
} = {}) => {
  console.log(`[TEST] Starting full battle expiry system test`)
  let testBattleId = battleId

  if (!checkOnly) {
    // Step 1: Create a test battle with short expiry
    const { battle } = await createTestBattleWithShortExpiry({ expiryMinutes })
    testBattleId = battle._id

    // Step 2: Verify expiry event was created
    await findExpiryEventsForBattle(testBattleId)

    console.log(`[TEST] 👍 Test battle and event created successfully`)
    console.log(`[TEST] Battle ID: ${testBattleId}`)
    console.log(`[TEST] Now you can either:`)
    console.log(`[TEST] 1. Wait ${expiryMinutes} minutes for natural expiry,`)
    console.log(
      `[TEST] 2. Run manuallyTriggerEventProcessing('${testBattleId}') to force processing,`,
    )
    console.log(
      `[TEST] 3. Or rerun this with checkOnly=true and battleId='${testBattleId}' to check status`,
    )
  }

  if (testBattleId && checkOnly) {
    // Step 3: Check events and battle status
    await findExpiryEventsForBattle(testBattleId)
    const battle = await checkBattleCompletion(testBattleId)

    if (battle && battle.status === 'completed') {
      console.log(`[TEST] ✅ Battle was completed successfully!`)
    } else if (battle) {
      console.log(`[TEST] ⏳ Battle is still active, waiting for expiry...`)
    } else {
      console.log(`[TEST] ❌ Battle not found or other error occurred`)
    }
  }

  // Optional step: Manually trigger processing
  if (!checkOnly && !skipManualProcessing) {
    console.log(`[TEST] Waiting 5 seconds before manual processing...`)
    await new Promise(resolve => setTimeout(resolve, 5000))

    await manuallyTriggerEventProcessing(testBattleId)
    const battle = await checkBattleCompletion(testBattleId)

    if (battle && battle.status === 'completed') {
      console.log(
        `[TEST] ✅ Battle was completed successfully after manual processing!`,
      )
    } else {
      console.log(`[TEST] ⚠️ Battle not completed after manual processing`)
    }
  }

  console.log(`[TEST] Test complete`)
  return testBattleId
}

module.exports = {
  createTestBattleWithShortExpiry,
  findExpiryEventsForBattle,
  manuallyTriggerEventProcessing,
  checkBattleCompletion,
  runFullTest,
  processExistingExpiredBattles,
}
