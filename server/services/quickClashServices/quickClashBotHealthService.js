// services/quickClashServices/quickClashBotHealthService.js

const mongoose = require('mongoose')
const QuickClashTeamBattle = require('../../model/quickClashSchemas/quickClashTeamBattleSchema')
const QuickClashSession = require('../../model/quickClashSchemas/quickClashSessionSchema')
const QuickClashChallenge = require('../../model/quickClashSchemas/quickClashChallengeSchema')
const User = require('../../model/userSchema')
const globalEmitter = require('../../eventEmitter')

// Constants for bot health monitoring
const BOT_STUCK_TIMEOUT = 12 * 60 * 1000 // 12 minutes timeout
const BOT_COMPLETION_TIMEOUT = 7 * 60 * 1000 // 7 minutes for completion
const MAX_RECOVERY_ATTEMPTS = 3

// In-memory tracking for bot activities
const botActivityTracker = new Map()

/**
 * Bot activity states
 */
const BOT_STATES = {
  JOINING: 'joining',
  SELECTING_CATEGORY: 'selecting_category',
  BEGINNING_CHALLENGE: 'beginning_challenge',
  COMPLETING_CHALLENGE: 'completing_challenge',
  COMPLETED: 'completed',
  STUCK: 'stuck',
  FAILED: 'failed',
}

/**
 * Track bot activity in team battle
 * @param {Object} params - Parameters
 * @param {string} params.botId - Bot user ID
 * @param {string} params.battleId - Team battle ID
 * @param {string} params.state - Current bot state
 * @param {Object} [params.metadata] - Additional metadata
 * @param {boolean} [params.forceUpdate] - Force update even if already tracking
 */
const trackBotActivity = ({
  botId,
  battleId,
  state,
  metadata = {},
  forceUpdate = false,
}) => {
  const key = `${botId}:${battleId}`
  const now = new Date()

  // Check if already tracking this bot for this battle
  const existingActivity = botActivityTracker.get(key)

  // If already tracking and not forcing update, just update the state and timestamp
  if (existingActivity && !forceUpdate) {
    existingActivity.state = state
    existingActivity.lastUpdate = now
    existingActivity.metadata = {
      ...existingActivity.metadata,
      ...metadata,
      stateHistory: [
        ...(existingActivity.metadata.stateHistory || []),
        { state, timestamp: now },
      ].slice(-10), // Keep last 10 state changes
    }

    botActivityTracker.set(key, existingActivity)
    console.log(
      `[BOT_HEALTH] Updated bot ${botId} in battle ${battleId} state: ${state}`,
    )
    return
  }

  // Create new tracking entry
  const activity = {
    botId,
    battleId,
    state,
    lastUpdate: now,
    startTime: existingActivity?.startTime || now, // Preserve original start time if updating
    metadata: {
      ...metadata,
      stateHistory: [
        ...(existingActivity?.metadata?.stateHistory || []),
        { state, timestamp: now },
      ].slice(-10), // Keep last 10 state changes
    },
    recoveryAttempts: existingActivity?.recoveryAttempts || 0,
  }

  botActivityTracker.set(key, activity)

  console.log(
    `[BOT_HEALTH] ${
      existingActivity ? 'Updated' : 'Started tracking'
    } bot ${botId} in battle ${battleId} state: ${state}`,
  )
}

/**
 * Remove bot activity tracking (when completed or battle ends)
 * @param {Object} params - Parameters
 * @param {string} params.botId - Bot user ID
 * @param {string} params.battleId - Team battle ID
 */
const stopTrackingBot = ({ botId, battleId }) => {
  const key = `${botId}:${battleId}`
  if (botActivityTracker.has(key)) {
    botActivityTracker.delete(key)
    console.log(
      `[BOT_HEALTH] Stopped tracking bot ${botId} in battle ${battleId}`,
    )
  }
}

/**
 * Check if a user is a bot (has dummy email)
 * @param {string} userId - User ID to check
 * @returns {Promise<boolean>} Whether the user is a bot
 */
const isBotUser = async userId => {
  try {
    const user = await User.findById(userId).select('email').lean()
    return user && /^dummy\d+@mail\.com$/.test(user.email)
  } catch (error) {
    console.error('Error checking if user is bot:', error)
    return false
  }
}

/**
 * Start tracking all bots in a team battle and trigger their participation
 * @param {Object} params - Parameters
 * @param {string} params.battleId - Team battle ID
 * @param {Array} params.teamAMembers - Team A member objects
 * @param {Array} params.teamBMembers - Team B member objects
 */
const trackAllBotsInBattle = async ({
  battleId,
  teamAMembers,
  teamBMembers,
}) => {
  console.log(
    `[BOT_HEALTH] ===== TRACKING ALL BOTS IN BATTLE ${battleId} =====`,
  )

  const allMembers = [...teamAMembers, ...teamBMembers]
  const botPromises = []
  let totalBots = 0

  console.log(
    `[BOT_HEALTH] Checking ${allMembers.length} total members for bots`,
  )

  for (const member of allMembers) {
    const userId = member.user._id || member.user

    // Add each bot check as a promise to run in parallel
    botPromises.push(
      (async () => {
        try {
          const isBot = await isBotUser(userId.toString())

          if (isBot) {
            totalBots++
            console.log(
              `[BOT_HEALTH] ✓ Bot detected: ${userId} - starting participation`,
            )

            // Start tracking this bot
            trackBotActivity({
              botId: userId.toString(),
              battleId: battleId.toString(),
              state: BOT_STATES.JOINING,
              metadata: {
                startedAt: new Date(),
                teamMember: true,
                autoTracked: true,
              },
            })

            // Start bot participation immediately since battle is now fully ready
            const delay = Math.floor(Math.random() * 15 + 5) * 1000 // 5-20 seconds (reduced since battle is ready)
            setTimeout(() => {
              executeBotParticipation({
                botId: userId.toString(),
                battleId: battleId.toString(),
              })
            }, delay)

            return { userId: userId.toString(), success: true }
          } else {
            console.log(`[BOT_HEALTH] ✗ Real user: ${userId}`)
            return {
              userId: userId.toString(),
              success: false,
              reason: 'not_bot',
            }
          }
        } catch (error) {
          console.error(
            `[BOT_HEALTH] Error processing member ${userId}:`,
            error,
          )
          return {
            userId: userId.toString(),
            success: false,
            reason: error.message,
          }
        }
      })(),
    )
  }

  // Wait for all bot checks to complete
  const results = await Promise.all(botPromises)
  const successfulBots = results.filter(r => r.success)
  const failedBots = results.filter(r => !r.success)

  console.log(`[BOT_HEALTH] ===== BOT TRACKING SUMMARY =====`)
  console.log(`[BOT_HEALTH] Total members checked: ${allMembers.length}`)
  console.log(
    `[BOT_HEALTH] Bots detected and tracked: ${successfulBots.length}`,
  )
  console.log(`[BOT_HEALTH] Non-bots or failed: ${failedBots.length}`)

  if (successfulBots.length > 0) {
    console.log(
      `[BOT_HEALTH] Bot IDs: ${successfulBots.map(b => b.userId).join(', ')}`,
    )
  }

  if (failedBots.length > 0) {
    console.log(
      `[BOT_HEALTH] Failed/Non-bot IDs: ${failedBots
        .map(b => `${b.userId}(${b.reason})`)
        .join(', ')}`,
    )
  }

  console.log(`[BOT_HEALTH] ================================`)
}

/**
 * Execute bot participation flow (UNIFIED FUNCTION for both normal and recovery)
 * @param {Object} params - Parameters
 * @param {string} params.botId - Bot ID
 * @param {string} params.battleId - Team battle ID
 * @param {string} [params.startingState] - State to start from (for recovery)
 */
const executeBotParticipation = async ({
  botId,
  battleId,
  startingState = BOT_STATES.JOINING,
}) => {
  try {
    console.log(
      `[BOT_HEALTH] Starting bot participation flow for ${botId}, starting from: ${startingState}`,
    )

    // Execute the appropriate step based on starting state
    switch (startingState) {
      case BOT_STATES.JOINING:
      case BOT_STATES.SELECTING_CATEGORY:
        await executeCategorySelection({ botId, battleId })
        break

      case BOT_STATES.BEGINNING_CHALLENGE:
        await executeChallengeBegining({ botId, battleId })
        break

      case BOT_STATES.COMPLETING_CHALLENGE:
        await executeChallengeCompletion({ botId, battleId })
        break

      default:
        console.log(`[BOT_HEALTH] No action needed for state: ${startingState}`)
        break
    }
  } catch (error) {
    console.error(
      `[BOT_HEALTH] Error in bot participation flow for ${botId}:`,
      error,
    )
    stopTrackingBot({ botId, battleId })
  }
}

/**
 * Execute category selection (UNIFIED - used for both normal flow and recovery)
 * @param {Object} params - Parameters
 * @param {string} params.botId - Bot ID
 * @param {string} params.battleId - Team battle ID
 * @param {number} [params.retryCount=0] - Current retry attempt
 */
const executeCategorySelection = async ({
  botId,
  battleId,
  retryCount = 0,
}) => {
  try {
    console.log(
      `[BOT_HEALTH] Executing category selection for bot ${botId} (attempt ${
        retryCount + 1
      })`,
    )

    // Update tracking state
    trackBotActivity({
      botId,
      battleId,
      state: BOT_STATES.SELECTING_CATEGORY,
      metadata: {
        categorySelectionStarted: new Date(),
        retryCount,
      },
    })

    // Get current battle state with detailed logging
    const battle = await QuickClashTeamBattle.findById(battleId).populate(
      'teamAMembers.user teamBMembers.user',
    )

    console.log(`[BOT_HEALTH] Bot ${botId} - Battle lookup result:`, {
      battleExists: !!battle,
      battleId: battleId,
      status: battle?.status,
      challengesCount: battle?.challenges?.length,
      teamACount: battle?.teamAMembers?.length,
      teamBCount: battle?.teamBMembers?.length,
    })

    if (!battle) {
      console.log(`[BOT_HEALTH] Battle ${battleId} not found for bot ${botId}`)
      stopTrackingBot({ botId, battleId })
      return
    }

    if (battle.status !== 'active') {
      console.log(
        `[BOT_HEALTH] Battle ${battleId} status is '${battle.status}', not 'active' for bot ${botId}`,
      )

      // Retry logic for battle not yet active
      if (retryCount < 5 && (battle.status === 'pending' || !battle.status)) {
        console.log(
          `[BOT_HEALTH] Battle ${battleId} not ready yet, retrying for bot ${botId} in 10 seconds`,
        )
        setTimeout(() => {
          executeCategorySelection({
            botId,
            battleId,
            retryCount: retryCount + 1,
          }).catch(err => {
            console.error(`[BOT_HEALTH] Retry failed for bot ${botId}:`, err)
            stopTrackingBot({ botId, battleId })
          })
        }, 10000) // Wait 10 seconds before retry
        return
      } else {
        console.log(
          `[BOT_HEALTH] Battle ${battleId} status '${battle.status}' - stopping bot ${botId} (max retries: ${retryCount})`,
        )
        stopTrackingBot({ botId, battleId })
        return
      }
    }

    // Find which team the bot is on
    const isTeamABot = battle.teamAMembers.some(
      m => (m.user._id?.toString() || m.user.toString()) === botId.toString(),
    )
    const isTeamBBot = battle.teamBMembers.some(
      m => (m.user._id?.toString() || m.user.toString()) === botId.toString(),
    )

    if (!isTeamABot && !isTeamBBot) {
      console.log(`[BOT_HEALTH] Bot ${botId} not found in battle ${battleId}`)

      // Don't stop tracking immediately - let health check handle it
      if (retryCount < 3) {
        console.log(
          `[BOT_HEALTH] Bot ${botId} not found in teams, retrying in 15 seconds`,
        )
        setTimeout(() => {
          executeCategorySelection({
            botId,
            battleId,
            retryCount: retryCount + 1,
          }).catch(err => {
            console.error(
              `[BOT_HEALTH] Team lookup retry failed for bot ${botId}:`,
              err,
            )
            // Mark as stuck instead of stopping - health check will handle
            trackBotActivity({
              botId,
              battleId,
              state: BOT_STATES.STUCK,
              metadata: {
                stuckReason: 'team_lookup_failed',
                stuckAt: new Date(),
              },
            })
          })
        }, 15000)
        return
      } else {
        // Mark as stuck instead of stopping tracking
        trackBotActivity({
          botId,
          battleId,
          state: BOT_STATES.STUCK,
          metadata: { stuckReason: 'not_found_in_teams', stuckAt: new Date() },
        })
        return
      }
    }

    // SAFETY: Deselect any existing category first
    try {
      const {
        deselectCategoryForUser,
      } = require('./quickClashTeamBattleService')
      await deselectCategoryForUser({ battleId, userId: botId })
      console.log(
        `[BOT_HEALTH] Safety deselected existing category for bot ${botId}`,
      )
    } catch (deselectError) {
      console.log(
        `[BOT_HEALTH] Deselect failed for bot ${botId} (expected if no category): ${deselectError.message}`,
      )
    }

    // Refresh battle state after deselect
    const refreshedBattle = await QuickClashTeamBattle.findById(battleId)

    if (!refreshedBattle || refreshedBattle.status !== 'active') {
      console.log(
        `[BOT_HEALTH] Battle ${battleId} not active after deselect for bot ${botId}`,
      )

      // Mark as stuck instead of stopping - health check will retry
      trackBotActivity({
        botId,
        battleId,
        state: BOT_STATES.STUCK,
        metadata: {
          stuckReason: 'battle_not_active_after_deselect',
          stuckAt: new Date(),
          retryCount,
        },
      })
      return
    }

    // Find available categories
    const availableCategories = refreshedBattle.challenges
      .filter(challenge => {
        if (isTeamABot) {
          return !challenge.teamAPlayer
        } else {
          return !challenge.teamBPlayer
        }
      })
      .map(challenge => challenge.category)

    console.log(
      `[BOT_HEALTH] Bot ${botId} - Available categories: [${availableCategories.join(
        ', ',
      )}]`,
    )

    if (availableCategories.length === 0) {
      console.log(`[BOT_HEALTH] No available categories for bot ${botId}`)

      // Mark as stuck instead of stopping - health check may retry later
      trackBotActivity({
        botId,
        battleId,
        state: BOT_STATES.STUCK,
        metadata: {
          stuckReason: 'no_available_categories',
          stuckAt: new Date(),
          retryCount,
        },
      })
      return
    }

    // Select random category with retry logic
    const selectedCategory =
      availableCategories[
        Math.floor(Math.random() * availableCategories.length)
      ]
    console.log(
      `[BOT_HEALTH] Bot ${botId} attempting to select category: ${selectedCategory}`,
    )

    const { selectCategoryForUser } = require('./quickClashTeamBattleService')

    let success = false
    let attempts = 0
    const maxAttempts = 3

    while (!success && attempts < maxAttempts) {
      attempts++
      try {
        await selectCategoryForUser({
          battleId,
          userId: botId,
          category: selectedCategory,
        })
        success = true
        console.log(
          `[BOT_HEALTH] ✓ Bot ${botId} selected category: ${selectedCategory}`,
        )

        // Update tracking
        trackBotActivity({
          botId,
          battleId,
          state: BOT_STATES.SELECTING_CATEGORY,
          metadata: {
            selectedCategory,
            categorySelectedAt: new Date(),
            attempts,
          },
        })
      } catch (error) {
        console.log(
          `[BOT_HEALTH] Category selection attempt ${attempts}/${maxAttempts} failed: ${error.message}`,
        )
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }
    }

    if (!success) {
      console.error(
        `[BOT_HEALTH] Failed to select category for bot ${botId} after ${maxAttempts} attempts`,
      )

      // Mark as stuck instead of stopping - health check will handle
      trackBotActivity({
        botId,
        battleId,
        state: BOT_STATES.STUCK,
        metadata: {
          stuckReason: 'category_selection_failed',
          stuckAt: new Date(),
          failedCategory: selectedCategory,
          retryCount,
        },
      })
      return
    }

    // Schedule challenge beginning
    const delay = Math.floor(Math.random() * 10 + 1) * 1000 // 1-10 seconds
    setTimeout(() => {
      executeChallengeBegining({ botId, battleId }).catch(err => {
        console.error(
          `[BOT_HEALTH] Error beginning challenge for ${botId}:`,
          err,
        )
        // Mark as stuck instead of stopping
        trackBotActivity({
          botId,
          battleId,
          state: BOT_STATES.STUCK,
          metadata: {
            stuckReason: 'challenge_begin_error',
            stuckAt: new Date(),
            error: err.message,
          },
        })
      })
    }, delay)
  } catch (error) {
    console.error(
      `[BOT_HEALTH] Error in category selection for bot ${botId}:`,
      error,
    )

    // Mark as stuck instead of stopping
    trackBotActivity({
      botId,
      battleId,
      state: BOT_STATES.STUCK,
      metadata: {
        stuckReason: 'category_selection_exception',
        stuckAt: new Date(),
        error: error.message,
        retryCount,
      },
    })
  }
}

/**
 * Execute challenge beginning (UNIFIED - used for both normal flow and recovery)
 * @param {Object} params - Parameters
 * @param {string} params.botId - Bot ID
 * @param {string} params.battleId - Team battle ID
 */
const executeChallengeBegining = async ({ botId, battleId }) => {
  try {
    console.log(`[BOT_HEALTH] Executing challenge beginning for bot ${botId}`)

    // Update tracking state
    trackBotActivity({
      botId,
      battleId,
      state: BOT_STATES.BEGINNING_CHALLENGE,
      metadata: { challengeBeginStarted: new Date() },
    })

    const { beginCategoryChallenge } = require('./quickClashTeamBattleService')

    // Begin the category challenge
    const result = await beginCategoryChallenge({ battleId, userId: botId })

    if (!result || !result.sessionInfo) {
      console.log(`[BOT_HEALTH] Failed to begin challenge for bot ${botId}`)
      stopTrackingBot({ botId, battleId })
      return
    }

    const { challengeId } = result.sessionInfo
    console.log(`[BOT_HEALTH] ✓ Bot ${botId} began challenge: ${challengeId}`)

    // Update tracking with challenge info
    trackBotActivity({
      botId,
      battleId,
      state: BOT_STATES.BEGINNING_CHALLENGE,
      metadata: {
        challengeId,
        challengeBeganAt: new Date(),
      },
    })

    // Schedule challenge completion
    const delay = Math.floor(Math.random() * 90 + 30) * 1000 // 30-120 seconds
    setTimeout(() => {
      executeChallengeCompletion({ botId, battleId, challengeId }).catch(
        err => {
          console.error(
            `[BOT_HEALTH] Error completing challenge for ${botId}:`,
            err,
          )
          stopTrackingBot({ botId, battleId })
        },
      )
    }, delay)
  } catch (error) {
    console.error(
      `[BOT_HEALTH] Error beginning challenge for bot ${botId}:`,
      error,
    )
    stopTrackingBot({ botId, battleId })
  }
}

/**
 * Execute challenge completion (UNIFIED - used for both normal flow and recovery)
 * @param {Object} params - Parameters
 * @param {string} params.botId - Bot ID
 * @param {string} params.battleId - Team battle ID
 * @param {string} [params.challengeId] - Challenge ID (will be found if not provided)
 * @param {number} [params.skillLevel] - Bot skill level
 */
const executeChallengeCompletion = async ({
  botId,
  battleId,
  challengeId,
  skillLevel,
}) => {
  try {
    console.log(`[BOT_HEALTH] Executing challenge completion for bot ${botId}`)

    // Update tracking state
    trackBotActivity({
      botId,
      battleId,
      state: BOT_STATES.COMPLETING_CHALLENGE,
      metadata: {
        challengeId,
        skillLevel,
        completionStarted: new Date(),
      },
    })

    // Find challenge ID if not provided
    if (!challengeId) {
      const battle = await QuickClashTeamBattle.findById(battleId)
      const botMember = [...battle.teamAMembers, ...battle.teamBMembers].find(
        member => member.user.toString() === botId,
      )

      if (botMember && botMember.challenge) {
        challengeId = botMember.challenge
      } else {
        console.log(`[BOT_HEALTH] No challenge ID found for bot ${botId}`)
        await markBotAsFailed({ botId, battleId, reason: 'no_challenge_id' })
        return
      }
    }

    // Generate skill level if not provided
    if (!skillLevel) {
      const skillLevels = ['easy', 'medium', 'hard']
      const randomSkillLevel =
        skillLevels[Math.floor(Math.random() * skillLevels.length)]
      const BOT_SKILL_RANGES = {
        easy: { min: 0.3, max: 0.5 },
        medium: { min: 0.5, max: 0.7 },
        hard: { min: 0.7, max: 0.9 },
      }
      const skillRange = BOT_SKILL_RANGES[randomSkillLevel]
      skillLevel =
        Math.random() * (skillRange.max - skillRange.min) + skillRange.min
    }

    console.log(
      `[BOT_HEALTH] Bot ${botId} completing challenge ${challengeId} with skill ${skillLevel.toFixed(
        2,
      )}`,
    )

    // Execute the actual challenge completion using reused bot logic
    await executeBotChallengeCompletion({
      challengeId,
      botId,
      battleId,
      skillLevel,
    })

    // Update tracking to completed
    trackBotActivity({
      botId,
      battleId,
      state: BOT_STATES.COMPLETED,
      metadata: {
        challengeId,
        completedAt: new Date(),
      },
    })

    console.log(`[BOT_HEALTH] ✓ Bot ${botId} completed challenge successfully`)

    // Stop tracking after a delay
    setTimeout(() => {
      stopTrackingBot({ botId, battleId })
    }, 10000)
  } catch (error) {
    console.error(
      `[BOT_HEALTH] Error completing challenge for bot ${botId}:`,
      error,
    )
    await markBotAsFailed({ botId, battleId, reason: error.message })
  }
}

/**
 * Execute bot challenge completion using reused core bot logic
 * @param {Object} params - Parameters
 * @param {string} params.challengeId - Challenge ID
 * @param {string} params.botId - Bot ID
 * @param {string} params.battleId - Team battle ID
 * @param {number} params.skillLevel - Bot skill level
 */
const executeBotChallengeCompletion = async ({
  challengeId,
  botId,
  battleId,
  skillLevel,
}) => {
  const session = await mongoose.startSession()

  try {
    await session.withTransaction(async () => {
      const {
        createBotSession,
        simulateBotReadingPhase,
        simulateBotQuizAnswers,
      } = require('./quickClashBotService')
      // REUSE: Create bot session
      const botSession = await createBotSession({ challengeId, botId, session })

      // REUSE: Simulate reading phase
      const readingTime = Math.floor(Math.random() * 60 + 30) // 30-90 seconds
      await simulateBotReadingPhase({
        userId: botId,
        sessionId: botSession._id,
        readingTime,
        session,
      })

      // REUSE: Simulate quiz answers
      const completedSession = await simulateBotQuizAnswers({
        sessionId: botSession._id,
        botSkill: skillLevel,
        session,
      })

      console.log(
        `[BOT_HEALTH] Bot ${botId} completed with score: ${completedSession.score.RQM_score}`,
      )
      return completedSession
    })

    // Update team battle with results
    const completedSession = await QuickClashSession.findOne({
      challenge: challengeId,
      user: botId,
      phase: 'completed',
    }).select('score')

    if (completedSession) {
      const {
        updateBattleWithQuizResults,
      } = require('./quickClashTeamBattleService')
      await updateBattleWithQuizResults({
        battleId,
        challengeId,
        userId: botId,
        score: completedSession.score.RQM_score,
      })
      console.log(
        `[BOT_HEALTH] Updated battle ${battleId} with bot ${botId} score: ${completedSession.score.RQM_score}`,
      )
    } else {
      throw new Error('Could not find completed session')
    }
  } catch (error) {
    console.error(
      `[BOT_HEALTH] Error in bot challenge completion transaction:`,
      error,
    )
    throw error
  } finally {
    session.endSession()
  }
}

/**
 * Mark bot as failed and simulate completion with low score
 * @param {Object} params - Parameters
 * @param {string} params.botId - Bot ID
 * @param {string} params.battleId - Team battle ID
 * @param {string} [params.reason] - Failure reason
 */
const markBotAsFailed = async ({ botId, battleId, reason = 'unknown' }) => {
  console.log(`[BOT_HEALTH] Marking bot ${botId} as failed (reason: ${reason})`)

  try {
    trackBotActivity({
      botId,
      battleId,
      state: BOT_STATES.FAILED,
      metadata: {
        failureReason: reason,
        failedAt: new Date(),
      },
    })

    const battle = await QuickClashTeamBattle.findById(battleId)

    if (!battle || battle.status !== 'active') {
      console.log(`[BOT_HEALTH] Battle ${battleId} no longer active`)
      stopTrackingBot({ botId, battleId })
      return
    }

    const botMember = [...battle.teamAMembers, ...battle.teamBMembers].find(
      member => member.user.toString() === botId,
    )

    if (botMember && botMember.challenge) {
      const failureScore = Math.floor(Math.random() * 21) // 0-20 low score

      console.log(
        `[BOT_HEALTH] Simulating bot failure with score ${failureScore}`,
      )

      const {
        updateBattleWithQuizResults,
      } = require('./quickClashTeamBattleService')
      await updateBattleWithQuizResults({
        battleId,
        challengeId: botMember.challenge,
        userId: botId,
        score: failureScore,
      })

      setTimeout(() => {
        globalEmitter.emit('quickClash:botFailed', {
          botId,
          battleId,
          reason,
          finalScore: failureScore,
        })
      }, 0)
    }

    stopTrackingBot({ botId, battleId })
  } catch (error) {
    console.error(`[BOT_HEALTH] Error marking bot as failed:`, error)
    stopTrackingBot({ botId, battleId })
  }
}

/**
 * Check for stuck bots and attempt recovery
 */
const checkBotHealth = async () => {
  try {
    console.log(
      `[BOT_HEALTH] Starting bot health check for ${botActivityTracker.size} tracked bots`,
    )

    if (botActivityTracker.size === 0) {
      console.log(`[BOT_HEALTH] No bots to check`)
      return
    }

    const now = new Date()
    const stuckBots = []
    const recoveryPromises = []

    for (const [key, activity] of botActivityTracker.entries()) {
      const timeSinceLastUpdate = now - activity.lastUpdate
      const totalTime = now - activity.startTime

      console.log(
        `[BOT_HEALTH] Checking bot ${activity.botId}: state=${
          activity.state
        }, timeSinceUpdate=${Math.round(
          timeSinceLastUpdate / 1000,
        )}s, totalTime=${Math.round(totalTime / 1000)}s`,
      )

      // More aggressive stuck detection:
      // 1. Already marked as stuck
      // 2. No progress for 2 minutes (reduced from 7 minutes)
      // 3. Total time exceeds 12 minutes
      // 4. Bot in selecting_category for more than 3 minutes
      const isStuck =
        activity.state === BOT_STATES.STUCK ||
        (timeSinceLastUpdate > 2 * 60 * 1000 &&
          activity.state !== BOT_STATES.COMPLETED) ||
        totalTime > BOT_STUCK_TIMEOUT ||
        (activity.state === BOT_STATES.SELECTING_CATEGORY &&
          timeSinceLastUpdate > 3 * 60 * 1000)

      if (isStuck && activity.state !== BOT_STATES.FAILED) {
        console.log(
          `[BOT_HEALTH] 🔴 Bot ${activity.botId} is stuck in battle ${activity.battleId}`,
        )
        console.log(
          `[BOT_HEALTH] State: ${
            activity.state
          }, Time since update: ${Math.round(
            timeSinceLastUpdate / 1000,
          )}s, Total time: ${Math.round(totalTime / 1000)}s`,
        )

        stuckBots.push(activity)

        // Update state to stuck if not already
        if (activity.state !== BOT_STATES.STUCK) {
          trackBotActivity({
            botId: activity.botId,
            battleId: activity.battleId,
            state: BOT_STATES.STUCK,
            metadata: {
              ...activity.metadata,
              stuckReason:
                timeSinceLastUpdate > BOT_COMPLETION_TIMEOUT
                  ? 'completion_timeout'
                  : totalTime > BOT_STUCK_TIMEOUT
                  ? 'total_timeout'
                  : 'health_check_detection',
              stuckDetectedAt: new Date(),
            },
          })
        }

        if (activity.recoveryAttempts < MAX_RECOVERY_ATTEMPTS) {
          console.log(
            `[BOT_HEALTH] 🔄 Attempting recovery for bot ${
              activity.botId
            } (attempt ${
              activity.recoveryAttempts + 1
            }/${MAX_RECOVERY_ATTEMPTS})`,
          )

          const updatedActivity = {
            ...activity,
            recoveryAttempts: activity.recoveryAttempts + 1,
          }
          botActivityTracker.set(key, updatedActivity)

          // Determine recovery starting point based on current state
          let recoveryStartState = activity.state
          if (activity.state === BOT_STATES.STUCK) {
            // If stuck, restart from category selection
            recoveryStartState = BOT_STATES.SELECTING_CATEGORY
          }

          recoveryPromises.push(
            executeBotParticipation({
              botId: activity.botId,
              battleId: activity.battleId,
              startingState: recoveryStartState,
            }).catch(err => {
              console.error(
                `[BOT_HEALTH] Recovery failed for bot ${activity.botId}:`,
                err,
              )
              return markBotAsFailed({
                botId: activity.botId,
                battleId: activity.battleId,
                reason: `recovery_failed: ${err.message}`,
              })
            }),
          )
        } else {
          console.log(
            `[BOT_HEALTH] ❌ Bot ${activity.botId} exceeded max recovery attempts`,
          )
          recoveryPromises.push(
            markBotAsFailed({
              botId: activity.botId,
              battleId: activity.battleId,
              reason: 'max_recovery_exceeded',
            }),
          )
        }
      } else {
        console.log(
          `[BOT_HEALTH] ✅ Bot ${activity.botId} is healthy (state: ${activity.state})`,
        )
      }
    }

    // Execute recovery attempts
    if (recoveryPromises.length > 0) {
      console.log(
        `[BOT_HEALTH] Executing ${recoveryPromises.length} recovery operations`,
      )
      const results = await Promise.allSettled(recoveryPromises)
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.error(
            `[BOT_HEALTH] Recovery operation ${index + 1} failed:`,
            result.reason,
          )
        } else {
          console.log(`[BOT_HEALTH] Recovery operation ${index + 1} completed`)
        }
      })
    }

    console.log(
      `[BOT_HEALTH] Health check completed. Found ${stuckBots.length} stuck bots, executed ${recoveryPromises.length} recovery operations`,
    )
  } catch (error) {
    console.error('[BOT_HEALTH] Error during bot health check:', error)
  }
}

/**
 * Clean up tracking for completed battles
 */
const cleanupCompletedBattles = async () => {
  try {
    const trackedBattleIds = [
      ...new Set(
        Array.from(botActivityTracker.values()).map(
          activity => activity.battleId,
        ),
      ),
    ]

    if (trackedBattleIds.length === 0) return

    const activeBattles = await QuickClashTeamBattle.find({
      _id: { $in: trackedBattleIds },
      status: 'active',
    }).select('_id')

    const activeBattleIds = new Set(activeBattles.map(b => b._id.toString()))

    const keysToRemove = []
    for (const [key, activity] of botActivityTracker.entries()) {
      if (!activeBattleIds.has(activity.battleId)) {
        keysToRemove.push(key)
      }
    }

    keysToRemove.forEach(key => {
      botActivityTracker.delete(key)
    })

    if (keysToRemove.length > 0) {
      console.log(
        `[BOT_HEALTH] Cleaned up tracking for ${keysToRemove.length} inactive battles`,
      )
    }
  } catch (error) {
    console.error('[BOT_HEALTH] Error during cleanup:', error)
  }
}

/**
 * Stop tracking all bots for a completed battle
 */
const stopTrackingAllBotsInBattle = battleId => {
  console.log(
    `[BOT_HEALTH] Stopping tracking for all bots in completed battle ${battleId}`,
  )

  let removedCount = 0
  const keysToRemove = []

  for (const [key, activity] of botActivityTracker.entries()) {
    if (activity.battleId === battleId.toString()) {
      keysToRemove.push(key)
    }
  }

  keysToRemove.forEach(key => {
    botActivityTracker.delete(key)
    removedCount++
  })

  if (removedCount > 0) {
    console.log(
      `[BOT_HEALTH] Stopped tracking ${removedCount} bots for completed battle ${battleId}`,
    )
  }
}

module.exports = {
  trackBotActivity,
  stopTrackingBot,
  checkBotHealth,
  cleanupCompletedBattles,
  trackAllBotsInBattle,
  stopTrackingAllBotsInBattle,
  executeBotParticipation,
  BOT_STATES,
}
