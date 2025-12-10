/**
 * Quick Clash Socket - Legacy Challenge Events
 *
 * @deprecated This module handles solo challenge events which are deprecated with 1v1 mode.
 * These events are kept for backward compatibility but should not be used for new features.
 *
 * Note: Some events like challengeCompletedByBothPlayers still apply to team battles,
 * but the 1v1 matchmaking flow is deprecated.
 */

const globalEmitter = require('../../eventEmitter')

/**
 * @deprecated Setup legacy challenge global event handlers
 * These handle solo/1v1 challenge events which are now deprecated in favor of Team Mode.
 *
 * @param {Object} io - Socket.io instance
 * @param {Function} notifyUser - User notification helper
 */
const setupLegacyChallengeEvents = (io, notifyUser) => {
  console.log('[QC_LEGACY] [LEGACY] Setting up legacy challenge event handlers')

  // ==========================================
  // 1V1 MATCHMAKING EVENTS (LEGACY)
  // ==========================================

  // Listen for user joined 1v1 matchmaking
  globalEmitter.on(
    'quickClash:userJoinedMatchmaking',
    ({ userId, userData, preferredCategories, trophies, userName }) => {
      if (!userId) {
        console.error(
          'Invalid userId in quickClash:userJoinedMatchmaking event'
        )
        return
      }

      console.log(
        `[QC_1V1] [LEGACY] SOCKET: User ${userId} (${userData?.name || userName}) joined 1v1 matchmaking`
      )

      // Emit to the user's room to confirm joining
      const success = notifyUser(userId, 'quickClash:joinedMatchmaking', {
        userId,
        preferredCategories,
        trophies,
        status: 'joined',
      })
      console.log(
        `[QC_1V1] [LEGACY] Joined 1v1 matchmaking notification sent to ${userId}: ${success}`
      )
    }
  )

  // Listen for user left 1v1 matchmaking
  globalEmitter.on('quickClash:userLeftMatchmaking', ({ userId }) => {
    if (!userId) {
      console.error('Invalid userId in quickClash:userLeftMatchmaking event')
      return
    }

    console.log(`[QC_1V1] [LEGACY] SOCKET: User ${userId} left 1v1 matchmaking`)

    // Emit to the user's room to confirm leaving
    const success = notifyUser(userId, 'quickClash:leftMatchmaking', {
      userId,
      status: 'left',
    })
    console.log(
      `[QC_1V1] [LEGACY] Left 1v1 matchmaking notification sent to ${userId}: ${success}`
    )
  })

  // ==========================================
  // CHALLENGE LIFECYCLE EVENTS (LEGACY)
  // ==========================================

  // Listen for challenge created event from controller
  globalEmitter.on(
    'quickClash:challengeCreated',
    ({ challenge, challenger, opponent }) => {
      if (!opponent || !opponent._id) {
        console.error(
          'Invalid opponent object in quickClash:challengeCreated event'
        )
        return
      }

      // Add a small delay to avoid race conditions
      setTimeout(() => {
        const success = notifyUser(opponent._id, 'quickClash:newChallenge', {
          challenge,
          challenger,
        })
        console.log(
          `[QC_EVENT] [LEGACY] Challenge created notification sent to ${opponent._id}: ${success}`
        )
      }, 100)
    }
  )

  // Listen for challenge progress updates and relay to clients
  globalEmitter.on(
    'quickClash:challengeProgress',
    ({ userId, step, progress }) => {
      if (!userId) {
        console.error('Invalid userId in quickClash:challengeProgress event')
        return
      }

      // Emit to the user with a small delay to avoid race conditions
      setTimeout(() => {
        const success = notifyUser(userId, 'quickClash:challengeProgress', {
          step,
          progress,
        })
        console.log(
          `[QC_EVENT] [LEGACY] Challenge progress sent to ${userId}: ${success}`
        )
      }, 50)
    }
  )

  globalEmitter.on(
    'quickClash:challengerNotified',
    ({ challenge, challenger, opponent, success, errorMessage }) => {
      if (!challenger || !challenger._id) {
        console.error(
          'Invalid challenger object in quickClash:challengerNotified event'
        )
        return
      }

      // Add a small delay to avoid race conditions
      setTimeout(() => {
        const notifySuccess = notifyUser(
          challenger._id,
          'quickClash:challengerNotified',
          {
            challenge,
            opponent,
            success,
            errorMessage,
          }
        )
        console.log(
          `[QC_EVENT] [LEGACY] Challenger notified sent to ${challenger._id}: ${notifySuccess}`
        )
      }, 100)
    }
  )

  // ==========================================
  // 1V1 MATCH FOUND EVENTS (LEGACY)
  // ==========================================

  // New event for 1v1 match preparation notification
  globalEmitter.on(
    'quickClash:matchFound',
    ({ challenger, opponent, tempChallengeId }) => {
      // Send match found notification to both users
      if (challenger && challenger._id) {
        const challengerSuccess = notifyUser(
          challenger._id,
          'quickClash:matchFound',
          {
            opponent: {
              name: opponent.name,
              inGameName: opponent.inGameName,
              pic: opponent.pic,
              _id: opponent._id,
              quickClashTrophies: opponent.quickClashTrophies,
            },
            tempChallengeId,
            isChallenger: true,
          }
        )
        console.log(
          `[QC_EVENT] [LEGACY] Match found sent to challenger ${challenger._id}: ${challengerSuccess}`
        )
      }

      if (opponent && opponent._id) {
        const opponentSuccess = notifyUser(
          opponent._id,
          'quickClash:matchFound',
          {
            opponent: {
              name: challenger.name,
              inGameName: challenger.inGameName,
              pic: challenger.pic,
              _id: challenger._id,
              quickClashTrophies: challenger.quickClashTrophies,
            },
            tempChallengeId,
            isChallenger: false,
          }
        )
        console.log(
          `[QC_EVENT] [LEGACY] Match found sent to opponent ${opponent._id}: ${opponentSuccess}`
        )
      }
    }
  )

  globalEmitter.on('quickClash:challengeRaceCondition', ({ accepterId }) => {
    // Notify user who tried to accept a challenge that was already taken
    const success = notifyUser(accepterId, 'quickClash:acceptFailed', {
      message: 'This user is no longer available for challenges',
    })
    console.log(
      `[QC_EVENT] [LEGACY] Challenge race condition sent to ${accepterId}: ${success}`
    )
  })

  globalEmitter.on(
    'quickClash:matchReady',
    ({ challengeId, challengerData, opponentData, oldChallengeId }) => {
      // Send the real challenge ID to both users
      const challengerSuccess = notifyUser(
        challengerData._id,
        'quickClash:matchChallengeReady',
        {
          challengeId,
          oldChallengeId, // Include the temp ID so client can match it
        }
      )
      console.log(
        `[QC_EVENT] [LEGACY] Match challenge ready sent to challenger ${challengerData._id}: ${challengerSuccess}`
      )

      const opponentSuccess = notifyUser(
        opponentData._id,
        'quickClash:matchChallengeReady',
        {
          challengeId,
          oldChallengeId, // Include the temp ID so client can match it
        }
      )
      console.log(
        `[QC_EVENT] [LEGACY] Match challenge ready sent to opponent ${opponentData._id}: ${opponentSuccess}`
      )
    }
  )

  // ==========================================
  // MATCH/CHALLENGE CREATION FAILED EVENTS
  // ==========================================

  globalEmitter.on(
    'quickClash:matchCreationFailed',
    ({ challengerId, opponentId, tempChallengeId, error }) => {
      if (!challengerId || !opponentId) {
        console.error(
          'Invalid user IDs in quickClash:matchCreationFailed event'
        )
        return
      }

      console.log(
        `[QC_EVENT] [LEGACY] Match creation failed between ${challengerId} and ${opponentId}: ${error}`
      )

      // Notify both users about the failure
      const challengerSuccess = notifyUser(
        challengerId,
        'quickClash:matchCreationFailed',
        {
          error,
          tempChallengeId,
          opponentId,
        }
      )
      console.log(
        `[QC_EVENT] [LEGACY] Match creation failed notification sent to challenger ${challengerId}: ${challengerSuccess}`
      )

      const opponentSuccess = notifyUser(
        opponentId,
        'quickClash:matchCreationFailed',
        {
          error,
          tempChallengeId,
          challengerId,
        }
      )
      console.log(
        `[QC_EVENT] [LEGACY] Match creation failed notification sent to opponent ${opponentId}: ${opponentSuccess}`
      )
    }
  )

  globalEmitter.on(
    'quickClash:challengeCreationFailed',
    ({ challengerId, opponentId, error }) => {
      if (!challengerId || !opponentId) {
        console.error(
          'Invalid user IDs in quickClash:challengeCreationFailed event'
        )
        return
      }

      console.log(
        `[QC_EVENT] [LEGACY] Challenge creation failed between ${challengerId} and ${opponentId}: ${error}`
      )

      // Notify both users about the failure
      const challengerSuccess = notifyUser(
        challengerId,
        'quickClash:challengeCreationFailed',
        {
          error,
          opponentId,
        }
      )
      console.log(
        `[QC_EVENT] [LEGACY] Challenge creation failed notification sent to challenger ${challengerId}: ${challengerSuccess}`
      )

      const opponentSuccess = notifyUser(
        opponentId,
        'quickClash:challengeCreationFailed',
        {
          error,
          challengerId,
        }
      )
      console.log(
        `[QC_EVENT] [LEGACY] Challenge creation failed notification sent to opponent ${opponentId}: ${opponentSuccess}`
      )
    }
  )

  // ==========================================
  // CHALLENGE RESPONSE EVENTS
  // ==========================================

  // Listen for challenge accepted event from controller
  globalEmitter.on(
    'quickClash:challengeAccepted',
    ({ challengeId, category, challenger, opponent }) => {
      if (!challenger || !challenger._id) {
        console.error(
          'Invalid challenger object in quickClash:challengeAccepted event'
        )
        return
      }

      // Add a small delay to avoid race conditions
      setTimeout(() => {
        const success = notifyUser(
          challenger._id,
          'quickClash:challengeAccepted',
          {
            challengeId,
            category,
            opponent,
          }
        )
        console.log(
          `[QC_EVENT] [LEGACY] Challenge accepted sent to ${challenger._id}: ${success}`
        )
      }, 100)
    }
  )

  // Listen for challenge rejected event from controller
  globalEmitter.on(
    'quickClash:challengeRejected',
    ({ challengeId, category, challenger, opponent }) => {
      if (!challenger || !challenger._id) {
        console.error(
          'Invalid challenger object in quickClash:challengeRejected event'
        )
        return
      }

      // Add a small delay to avoid race conditions
      setTimeout(() => {
        const success = notifyUser(
          challenger._id,
          'quickClash:challengeRejected',
          {
            challengeId,
            category,
            opponent,
          }
        )
        console.log(
          `[QC_EVENT] [LEGACY] Challenge rejected sent to ${challenger._id}: ${success}`
        )
      }, 100)
    }
  )

  // ==========================================
  // CHALLENGE COMPLETION EVENTS
  // Note: These also support team battles, not just 1v1
  // ==========================================

  globalEmitter.on(
    'quickClash:challengeCompletedByBothPlayers',
    ({
      challenge,
      trackWinnerOutcomeResult,
      completedByUserId,
      teamBattleParticipantIds,
    }) => {
      if (!challenge) {
        console.error(
          'Invalid challenge object in quickClash:challengeCompletedByBothPlayers event'
        )
        return
      }

      // Team battle path - notify all team participants
      if (teamBattleParticipantIds && teamBattleParticipantIds.length > 0) {
        setTimeout(() => {
          let notifiedCount = 0
          for (let id of teamBattleParticipantIds) {
            const success = notifyUser(
              id.toString(),
              'quickClash:teamBattleRefetch',
              {
                battleId: challenge.teamBattle.toString(),
              }
            )
            if (success) notifiedCount++
          }
          console.log(
            `[QC_EVENT] Team battle refetch sent to ${notifiedCount}/${teamBattleParticipantIds.length} participants`
          )
        }, 300)
      } else {
        // Legacy 1v1 path
        if (!challenge || !challenge.challenger || !challenge.opponent) {
          console.error(
            'Invalid challenge object in quickClash:challengeCompleted event'
          )
          return
        }

        // Create detailed data objects for both players
        const challengerData = {
          userId: challenge.challenger._id,
          user: {
            _id: challenge.challenger._id,
            name: challenge.challenger.name,
            inGameName: challenge.challenger.inGameName,
            pic: challenge.challenger.pic,
          },
          opponent: {
            _id: challenge.opponent._id,
            name: challenge.opponent.name,
            inGameName: challenge.opponent.inGameName,
            pic: challenge.opponent.pic,
          },
          userScore: challenge.challengerScore,
          opponentScore: challenge.opponentScore,
          category: challenge.category,
          challengeId: challenge._id.toString(),
          trackWinnerOutcomeResult,
          completedByUserId,
        }

        const opponentData = {
          userId: challenge.opponent._id,
          user: {
            _id: challenge.opponent._id,
            name: challenge.opponent.name,
            inGameName: challenge.opponent.inGameName,
            pic: challenge.opponent.pic,
          },
          opponent: {
            _id: challenge.challenger._id,
            name: challenge.challenger.name,
            inGameName: challenge.challenger.inGameName,
            pic: challenge.challenger.pic,
          },
          userScore: challenge.opponentScore,
          opponentScore: challenge.challengerScore,
          category: challenge.category,
          challengeId: challenge._id.toString(),
          trackWinnerOutcomeResult,
          completedByUserId,
        }

        // Add a small delay to avoid race conditions
        setTimeout(() => {
          const challengerSuccess = notifyUser(
            challenge.challenger._id.toString(),
            'quickClash:challengeCompletedByBothPlayers',
            challengerData
          )
          console.log(
            `[QC_EVENT] [LEGACY] Challenge completed sent to challenger ${challenge.challenger._id}: ${challengerSuccess}`
          )
        }, 100)

        setTimeout(() => {
          const opponentSuccess = notifyUser(
            challenge.opponent._id.toString(),
            'quickClash:challengeCompletedByBothPlayers',
            opponentData
          )
          console.log(
            `[QC_EVENT] [LEGACY] Challenge completed sent to opponent ${challenge.opponent._id}: ${opponentSuccess}`
          )
        }, 200)
      }
    }
  )

  // Listen for challenge completed event from controller
  globalEmitter.on(
    'quickClash:challengeCompleted',
    ({ challenge, completedByUserId, teamBattleParticipantIds }) => {
      if (!challenge) {
        console.error(
          'Invalid challenge object in quickClash:challengeCompleted event'
        )
        return
      }

      // Team battle path - notify all team participants
      if (teamBattleParticipantIds && teamBattleParticipantIds.length > 0) {
        setTimeout(() => {
          let notifiedCount = 0
          for (let id of teamBattleParticipantIds) {
            const success = notifyUser(
              id.toString(),
              'quickClash:teamBattleRefetch',
              {
                battleId: challenge.teamBattle.toString(),
              }
            )
            if (success) notifiedCount++
          }
          console.log(
            `[QC_EVENT] Team battle refetch sent to ${notifiedCount}/${teamBattleParticipantIds.length} participants`
          )
        }, 300)
      } else {
        // Legacy 1v1 path
        if (!challenge || !challenge.challenger || !challenge.opponent) {
          console.error(
            'Invalid challenge object in quickClash:challengeCompleted event'
          )
          return
        }

        // Determine recipient
        const recipientId =
          completedByUserId.toString() === challenge.challenger._id.toString()
            ? challenge.opponent._id.toString()
            : challenge.challenger._id.toString()

        // Add a small delay to avoid race conditions
        setTimeout(() => {
          const success = notifyUser(
            recipientId,
            'quickClash:challengeCompleted',
            {
              challengeId: challenge._id,
              completedByUserId,
            }
          )
          console.log(
            `[QC_EVENT] [LEGACY] Challenge completed sent to ${recipientId}: ${success}`
          )
        }, 100)
      }
    }
  )

  // Listen for analysis ready event from controller
  globalEmitter.on('quickClash:analysisReady', ({ challengeId, userId }) => {
    if (!userId) {
      console.error('Invalid userId in quickClash:analysisReady event')
      return
    }

    // Add a small delay to avoid race conditions
    setTimeout(() => {
      const success = notifyUser(userId, 'quickClash:analysisReady', {
        challengeId,
      })
      console.log(`[QC_EVENT] Analysis ready sent to ${userId}: ${success}`)
    }, 100)
  })
}

module.exports = {
  setupLegacyChallengeEvents,
}
