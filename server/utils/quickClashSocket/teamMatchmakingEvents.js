/**
 * Quick Clash Socket - Team Matchmaking Events
 *
 * Handles global emitter events for team matchmaking.
 * These are active events used in Team Mode.
 */

const globalEmitter = require('../../eventEmitter')
const QuickClashTeam = require('../../model/quickClashSchemas/quickClashTeamSchema')
const { getMemberPlayerId } = require('../sessionPlayerUtils')

/**
 * Setup team matchmaking global event handlers
 * These handle active team mode matchmaking events.
 *
 * @param {Object} io - Socket.io instance
 * @param {Function} notifyUser - User notification helper
 * @param {Function} notifyUserAllDevices - Device-aware notification (optional)
 */
const setupTeamMatchmakingEvents = (io, notifyUser, notifyUserAllDevices = null) => {
  console.log('[QC_MM] Setting up team matchmaking event handlers')

  // Helper function to notify all team members
  async function notifyTeamMembers(teamId, event, data, excludeUserIds = []) {
    try {
      if (!teamId) return

      const team = await QuickClashTeam.findById(teamId)
        .select('members name')
        .lean()

      if (!team?.members?.length) return

      const excludeSet = new Set(excludeUserIds.map(id => id.toString()))

      for (const member of team.members) {
        const userId = getMemberPlayerId(member)
        if (!userId || excludeSet.has(userId)) continue

        console.log(`[QC_MM] Sending ${event} to member ${userId}`)
        notifyUser(userId, event, {
          ...data,
          teamName: team.name,
        })
      }
    } catch (error) {
      console.error(`Error notifying team members for team ${teamId}:`, error)
    }
  }

  // ==========================================
  // GLOBAL MATCHMAKING EVENTS
  // ==========================================

  // Listen for user joined global matchmaking
  globalEmitter.on(
    'quickClash:userJoinedMatchmaking',
    ({ userId, trophies, userName }) => {
      if (!userId) {
        console.error(
          'Invalid userId in quickClash:userJoinedMatchmaking event'
        )
        return
      }

      console.log(
        `[QC_MM] SOCKET: User ${userId} (${userName}) joined global matchmaking with ${trophies} trophies`
      )

      const success = notifyUser(userId, 'quickClash:joinedGlobalMatchmaking', {
        userId,
        trophies,
      })
      console.log(
        `[QC_MM] Joined global matchmaking notification sent to ${userId}: ${success}`
      )
    }
  )

  // Listen for user left global matchmaking
  globalEmitter.on('quickClash:userLeftMatchmaking', ({ userId }) => {
    if (!userId) {
      console.error('Invalid userId in quickClash:userLeftMatchmaking event')
      return
    }

    console.log(`[QC_MM] SOCKET: User ${userId} left global matchmaking`)

    const success = notifyUser(userId, 'quickClash:leftGlobalMatchmaking', {
      userId,
    })
    console.log(
      `[QC_MM] Left global matchmaking notification sent to ${userId}: ${success}`
    )
  })

  // ==========================================
  // TEAM MATCHMAKING EVENTS
  // ==========================================

  // Listen for team joined matchmaking
  globalEmitter.on('quickClash:teamJoinedMatchmaking', data => {
    if (!data.teamId) {
      console.error('Invalid teamId in quickClash:teamJoinedMatchmaking event')
      return
    }

    console.log(
      `[QC_MM] SOCKET: Team ${data?.teamId} (${data?.teamName}) joined matchmaking with ${data?.avgTrophies} avg trophies`
    )

    notifyTeamMembers(data?.teamId, 'quickClash:teamJoinedMatchmaking', data)
  })

  globalEmitter.on('quickClash:teamLeftMatchmaking', data => {
    if (!data.teamId) {
      console.error('Invalid teamId in quickClash:teamLeftMatchmaking event')
      return
    }

    console.log(
      `[QC_MM] SOCKET: Team ${data.teamId} left matchmaking` +
        (data.reason ? ` (Reason: ${data.reason})` : '') +
        (data.initiator ? ` (Initiated by: ${data.initiator})` : '')
    )

    // If there's a specific userId target, send directly to that user ONLY
    if (data.userId) {
      console.log(
        `[QC_MM] Sending team left matchmaking notification to specific user ${data.userId}`
      )

      let success = false
      if (notifyUserAllDevices) {
        success = notifyUserAllDevices(
          data.userId,
          'quickClash:teamLeftMatchmaking',
          data
        )
        console.log(
          `[QC_MM] Device-aware notification result for user ${data.userId}: ${success}`
        )
      }

      if (!success) {
        console.log(
          `[QC_MM] Device-aware notification failed for user ${data.userId}, trying room-based fallback`
        )

        const quickClashRoom = `quickClash:${data.userId}`
        const qcRoom = io.sockets.adapter.rooms.get(quickClashRoom)

        if (qcRoom && qcRoom.size > 0) {
          console.log(
            `[QC_MM] Fallback: Using QuickClash room ${quickClashRoom} with ${qcRoom.size} socket(s)`
          )
          io.to(quickClashRoom).emit('quickClash:teamLeftMatchmaking', data)
          success = true
        } else {
          const basicRoom = io.sockets.adapter.rooms.get(data.userId)
          if (basicRoom && basicRoom.size > 0) {
            console.log(
              `[QC_MM] Fallback: Using basic room ${data.userId} with ${basicRoom.size} socket(s)`
            )
            io.to(data.userId).emit('quickClash:teamLeftMatchmaking', data)
            success = true
          }
        }
      }

      console.log(
        `[QC_MM] Team left matchmaking notification sent to specific user ${data.userId}: ${success}`
      )
      return
    }

    // For team-wide notifications
    console.log(
      `[QC_MM] Sending team left matchmaking notification to all members of team ${data.teamId}`
    )
    notifyTeamMembers(data.teamId, 'quickClash:teamLeftMatchmaking', data)
  })

  // Team returned to matchmaking
  globalEmitter.on('quickClash:teamReturnedToMatchmaking', data => {
    if (!data.teamId) {
      console.error(
        'Invalid teamId in quickClash:teamReturnedToMatchmaking event'
      )
      return
    }

    console.log(
      `[QC_MM] SOCKET: Team ${data.teamId} returned to matchmaking` +
        (data.reason ? ` (Reason: ${data.reason})` : '')
    )

    notifyTeamMembers(data.teamId, 'quickClash:teamReturnedToMatchmaking', data)
  })

  // ==========================================
  // MATCHMAKING LOCK EVENTS
  // ==========================================

  globalEmitter.on('quickClash:matchmakingLocked', data => {
    if (!data.teamA || !data.teamB) {
      console.error('Invalid data in quickClash:matchmakingLocked event')
      return
    }

    console.log(
      `[QC_MM] SOCKET: Teams ${data.teamA} and ${data.teamB} locked in matchmaking`
    )

    if (data.allMembers && data.allMembers.length > 0) {
      let notifiedCount = 0
      data.allMembers.forEach(userId => {
        const userTeamId = data.teamAMembers.includes(userId)
          ? data.teamA
          : data.teamB
        const teamName = data.teamAMembers.includes(userId)
          ? data.teamAName
          : data.teamBName

        const success = notifyUser(userId, 'quickClash:matchmakingLocked', {
          status: data.status,
          teamId: userTeamId,
          teamName: teamName,
        })
        if (success) notifiedCount++
      })
      console.log(
        `[QC_MM] Matchmaking locked notification sent to ${notifiedCount}/${data.allMembers.length} members`
      )
    } else {
      try {
        notifyTeamMembers(data.teamA, 'quickClash:matchmakingLocked', {
          status: data.status,
          teamId: data.teamA,
        })
        notifyTeamMembers(data.teamB, 'quickClash:matchmakingLocked', {
          status: data.status,
          teamId: data.teamB,
        })
      } catch (err) {
        console.error(
          'Error notifying team members about matchmaking lock:',
          err
        )
      }
    }
  })

  globalEmitter.on('quickClash:matchmakingUnlocked', data => {
    if (!data.teamA || !data.teamB) {
      console.error('Invalid data in quickClash:matchmakingUnlocked event')
      return
    }

    console.log(
      `[QC_MM] SOCKET: Teams ${data.teamA} and ${data.teamB} unlocked from matchmaking`
    )

    if (data.allMembers && data.allMembers.length > 0) {
      let notifiedCount = 0
      data.allMembers.forEach(userId => {
        const userTeamId = data.teamAMembers.includes(userId)
          ? data.teamA
          : data.teamB

        const success = notifyUser(userId, 'quickClash:matchmakingUnlocked', {
          status: data.status,
          teamId: userTeamId,
        })
        if (success) notifiedCount++
      })
      console.log(
        `[QC_MM] Matchmaking unlocked notification sent to ${notifiedCount}/${data.allMembers.length} members`
      )
    } else {
      try {
        notifyTeamMembers(data.teamA, 'quickClash:matchmakingUnlocked', {
          status: data.status,
          teamId: data.teamA,
        })
        notifyTeamMembers(data.teamB, 'quickClash:matchmakingUnlocked', {
          status: data.status,
          teamId: data.teamB,
        })
      } catch (err) {
        console.error(
          'Error notifying team members about matchmaking unlock:',
          err
        )
      }
    }
  })

  // ==========================================
  // BATTLE EVENTS
  // ==========================================

  // Listen for team battle ready events
  globalEmitter.on('quickClash:teamBattleReady', (data) => {
    const { battleId, teamA, teamB, teamAMembers, teamBMembers, categories, winProbability } = data

    console.log(`[QC_MM] Battle ready: ${battleId}, Team A: ${teamA}, Team B: ${teamB}`)

    // Notify Team A
    notifyTeamMembers(teamA, 'quickClash:matchFound', {
      battleId,
      team: { _id: teamA, members: teamAMembers },
      opponent: { _id: teamB, members: teamBMembers },
      categories,
      winProbability,
    })

    // Notify Team B
    notifyTeamMembers(teamB, 'quickClash:matchFound', {
      battleId,
      team: { _id: teamB, members: teamBMembers },
      opponent: { _id: teamA, members: teamAMembers },
      categories,
      winProbability,
    })
  })

  // Listen for battle creation failed events
  globalEmitter.on('quickClash:battleCreationFailed', (data) => {
    const { teamA, teamB, error } = data
    const payload = { error: error || 'Battle creation failed. Please try again.' }

    if (teamA) notifyTeamMembers(teamA, 'quickClash:matchmakingError', payload)
    if (teamB) notifyTeamMembers(teamB, 'quickClash:matchmakingError', payload)
  })

  // Listen for team updates (joins/leaves)
  globalEmitter.on('quickClash:teamUpdated', data => {
    if (!data.teamId) {
       return
    }
    notifyTeamMembers(data.teamId, 'quickClash:teamUpdated', data)
  })
}

module.exports = {
  setupTeamMatchmakingEvents,
}
