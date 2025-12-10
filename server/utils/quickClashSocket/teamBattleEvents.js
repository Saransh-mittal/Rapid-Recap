/**
 * Quick Clash Socket - Team Battle Events
 *
 * Handles global emitter events for team battles.
 * These are active events used in Team Mode.
 */

const globalEmitter = require('../../eventEmitter')
const QuickClashTeam = require('../../model/quickClashSchemas/quickClashTeamSchema')

/**
 * Setup team battle global event handlers
 * These handle team battle creation, progress, and completion events.
 *
 * @param {Object} io - Socket.io instance
 * @param {Function} notifyUser - User notification helper
 */
const setupTeamBattleEvents = (io, notifyUser) => {
  console.log('[QC_BATTLE] Setting up team battle event handlers')

  // Helper function to notify all team members
  async function notifyTeamMembers(teamId, event, data, excludeUserIds = []) {
    try {
      if (!teamId) {
        console.error('notifyTeamMembers: teamId is required')
        return
      }

      const team = await QuickClashTeam.findById(teamId)
        .select('members name')
        .lean()

      if (!team || !team.members || !Array.isArray(team.members)) {
        console.error(
          `Cannot notify team members: Team ${teamId} not found or has no members`
        )
        return
      }

      let notifiedCount = 0
      const excludeSet = new Set(excludeUserIds.map(id => id.toString()))

      for (const member of team.members) {
        const userId = member.user.toString()
        if (excludeSet.has(userId)) continue

        const success = notifyUser(userId, event, {
          ...data,
          teamName: team.name,
        })
        if (success) notifiedCount++
      }
    } catch (error) {
      console.error(`Error notifying team members for team ${teamId}:`, error)
    }
  }

  // ==========================================
  // TEAM BATTLE READY EVENTS
  // ==========================================

  // Listen for team battle ready
  globalEmitter.on(
    'quickClash:teamBattleReady',
    ({
      battleId,
      teamId,
      teamA,
      teamB,
      categories,
      teamAMembers,
      teamBMembers,
      userId,
    }) => {
      console.log(
        `[QC_BATTLE] SOCKET: Team battle ${battleId} ready between teams ${
          teamA || 'auto-formed'
        } and ${teamB || 'auto-formed'}`
      )

      // Solo player notification
      if (userId) {
        console.log(
          `[QC_BATTLE] SOCKET: Sending battle ready notification to solo player ${userId}`
        )
        const success = notifyUser(userId, 'quickClash:teamBattleReady', {
          battleId,
          teamId: teamId || teamA,
          teamA,
          teamB,
          isSoloPlayer: true,
        })
        console.log(
          `[QC_BATTLE] Team battle ready sent to solo player ${userId}: ${success}`
        )
        return
      }

      // Regular team notifications
      if (teamA) {
        console.log(
          `[QC_BATTLE] SOCKET: Notifying Team A members about battle ready`
        )
        notifyTeamMembers(teamA, 'quickClash:teamBattleReady', {
          battleId,
          teamId: teamA,
          teamA,
          teamB,
        })
      }

      if (teamB) {
        console.log(
          `[QC_BATTLE] SOCKET: Notifying Team B members about battle ready`
        )
        notifyTeamMembers(teamB, 'quickClash:teamBattleReady', {
          battleId,
          teamId: teamB,
          teamA,
          teamB,
        })
      }
    }
  )

  // ==========================================
  // BATTLE CREATION EVENTS
  // ==========================================

  globalEmitter.on('quickClash:battleCreationStarted', data => {
    if (!data.teamA || !data.teamB) {
      console.error('Invalid data in quickClash:battleCreationStarted event')
      return
    }

    console.log(
      `[QC_BATTLE] SOCKET: Battle creation started for teams ${data.teamA} and ${data.teamB}`
    )

    if (data.allMembers && data.allMembers.length > 0) {
      let notifiedCount = 0
      data.allMembers.forEach(userId => {
        const userTeamId = data.teamAMembers.includes(userId)
          ? data.teamA
          : data.teamB
        const opponentTeamId = data.teamAMembers.includes(userId)
          ? data.teamB
          : data.teamA

        const success = notifyUser(userId, 'quickClash:battleCreationStarted', {
          teamId: userTeamId,
          opponentTeam: opponentTeamId,
        })
        if (success) notifiedCount++
      })
      console.log(
        `[QC_BATTLE] Battle creation started notification sent to ${notifiedCount}/${data.allMembers.length} members`
      )
    } else {
      try {
        notifyTeamMembers(data.teamA, 'quickClash:battleCreationStarted', {
          teamId: data.teamA,
          opponentTeam: data.teamB,
        })
        notifyTeamMembers(data.teamB, 'quickClash:battleCreationStarted', {
          teamId: data.teamB,
          opponentTeam: data.teamA,
        })
      } catch (err) {
        console.error(
          'Error notifying team members about battle creation:',
          err
        )
      }
    }
  })

  globalEmitter.on('quickClash:battleCreationFailed', data => {
    if (!data.teamA || !data.teamB) {
      console.error('Invalid data in quickClash:battleCreationFailed event')
      return
    }

    console.log(
      `[QC_BATTLE] SOCKET: Battle creation failed for teams ${data.teamA} and ${data.teamB}`
    )

    if (data.allMembers && data.allMembers.length > 0) {
      let notifiedCount = 0
      data.allMembers.forEach(userId => {
        const userTeamId = data.teamAMembers.includes(userId)
          ? data.teamA
          : data.teamB

        const success = notifyUser(userId, 'quickClash:battleCreationFailed', {
          teamId: userTeamId,
          error: data.error,
        })
        if (success) notifiedCount++
      })
      console.log(
        `[QC_BATTLE] Battle creation failed notification sent to ${notifiedCount}/${data.allMembers.length} members`
      )
    } else {
      try {
        notifyTeamMembers(data.teamA, 'quickClash:battleCreationFailed', {
          teamId: data.teamA,
          error: data.error,
        })
        notifyTeamMembers(data.teamB, 'quickClash:battleCreationFailed', {
          teamId: data.teamB,
          error: data.error,
        })
      } catch (err) {
        console.error(
          'Error notifying team members about battle creation failure:',
          err
        )
      }
    }
  })

  globalEmitter.on('quickClash:battleCreationCleanedUp', data => {
    console.log(
      `[QC_BATTLE] SOCKET: Battle creation cleaned up for teams ${data.teamA} and ${data.teamB}`
    )

    if (data.memberIds && data.memberIds.length > 0) {
      let notifiedCount = 0
      data.memberIds.forEach(memberId => {
        const success = notifyUser(
          memberId,
          'quickClash:battleCreationCleanedUp',
          {
            message: data.message,
            teamA: data.teamA,
            teamB: data.teamB,
          }
        )
        if (success) notifiedCount++
      })
      console.log(
        `[QC_BATTLE] Battle creation cleanup notification sent to ${notifiedCount}/${data.memberIds.length} members`
      )
    }

    if (data.teamA && data.teamB) {
      const roomId = `battle_creation_${data.teamA}_${data.teamB}`
      io.to(roomId).emit('quickClash:battleCreationCleanedUp', {
        message: data.message,
        teamA: data.teamA,
        teamB: data.teamB,
      })
    }
  })

  globalEmitter.on('quickClash:battleCreationRetrying', data => {
    if (!data.teamA || !data.teamB) {
      console.error('Invalid data in quickClash:battleCreationRetrying event')
      return
    }

    console.log(
      `[QC_BATTLE] SOCKET: Battle creation retrying for teams ${data.teamA} and ${data.teamB}`
    )

    if (data.allMembers && data.allMembers.length > 0) {
      data.allMembers.forEach(userId => {
        notifyUser(userId, 'quickClash:battleCreationRetrying', {
          attempt: data.attempt,
          maxAttempts: data.maxAttempts,
        })
      })
    }
  })

  // ==========================================
  // CATEGORY SELECTION EVENTS
  // ==========================================

  globalEmitter.on(
    'quickClash:teamMemberSelectedCategory',
    ({ battleId, userId, category, team, opponentTeam }) => {
      if (!battleId || !userId || !category) {
        console.error(
          'Invalid data in quickClash:teamMemberSelectedCategory event'
        )
        return
      }

      console.log(
        `[QC_BATTLE] SOCKET: User ${userId} selected category ${category} for team ${team} in battle ${battleId}`
      )

      if (team) {
        notifyTeamMembers(team, 'quickClash:teamMemberSelectedCategory', {
          battleId,
          userId,
          category,
          team,
          isOwnTeam: true,
        })
      }

      if (opponentTeam) {
        notifyTeamMembers(
          opponentTeam,
          'quickClash:teamMemberSelectedCategory',
          {
            battleId,
            userId,
            category,
            team,
            isOwnTeam: false,
          }
        )
      }
    }
  )

  globalEmitter.on(
    'quickClash:teamMemberDeselectedCategory',
    ({ battleId, userId, category, team, opponentTeam }) => {
      if (!battleId || !userId || !category) {
        console.error(
          'Invalid data in quickClash:teamMemberDeselectedCategory event'
        )
        return
      }

      console.log(
        `[QC_BATTLE] SOCKET: User ${userId} deselected category ${category} for team ${team} in battle ${battleId}`
      )

      if (team) {
        notifyTeamMembers(team, 'quickClash:teamMemberDeselectedCategory', {
          battleId,
          userId,
          category,
          team,
          isOwnTeam: true,
        })
      }

      if (opponentTeam) {
        notifyTeamMembers(
          opponentTeam,
          'quickClash:teamMemberDeselectedCategory',
          {
            battleId,
            userId,
            category,
            team,
            isOwnTeam: false,
          }
        )
      }
    }
  )

  // ==========================================
  // QUIZ COMPLETION EVENTS
  // ==========================================

  globalEmitter.on(
    'quickClash:teamBattleQuizCompleted',
    ({ battleId, userId, score, challengeId, allTeamMembers }) => {
      if (!battleId || !userId || !allTeamMembers) {
        console.error(
          'Invalid data in quickClash:teamBattleQuizCompleted event'
        )
        return
      }

      console.log(
        `[QC_BATTLE] SOCKET: User ${userId} completed quiz for battle ${battleId} with score ${score}`
      )

      let notifiedCount = 0
      allTeamMembers.forEach(memberId => {
        const success = notifyUser(
          memberId,
          'quickClash:teamBattleQuizCompleted',
          {
            battleId,
            userId,
            score,
            challengeId,
            completedByCurrentUser: memberId === userId.toString(),
          }
        )
        if (success) notifiedCount++
      })

      console.log(
        `[QC_BATTLE] Team battle quiz completion notification sent to ${notifiedCount}/${allTeamMembers.length} members`
      )
    }
  )

  // ==========================================
  // BATTLE COMPLETION EVENTS
  // ==========================================

  globalEmitter.on(
    'quickClash:teamBattleCompleted',
    ({ battleId, winner, teamA, teamB }) => {
      console.log(
        `[QC_BATTLE] SOCKET: Team battle ${battleId} completed. Winner: ${winner}`
      )

      if (teamA) {
        notifyTeamMembers(teamA, 'quickClash:teamBattleCompleted', {
          battleId,
          winner,
          teamA,
          teamB,
          isTeamA: true,
        })
      }

      if (teamB) {
        notifyTeamMembers(teamB, 'quickClash:teamBattleCompleted', {
          battleId,
          winner,
          teamA,
          teamB,
          isTeamA: false,
        })
      }
    }
  )

  // Team member began/started challenge events
  globalEmitter.on('quickClash:teamMemberBeganChallenge', data => {
    if (!data.battleId || !data.userId) {
      console.error('Invalid data in quickClash:teamMemberBeganChallenge event')
      return
    }

    if (data.teamId) {
      notifyTeamMembers(data.teamId, 'quickClash:teamMemberBeganChallenge', data)
    }
    if (data.opponentTeamId) {
      notifyTeamMembers(data.opponentTeamId, 'quickClash:teamMemberBeganChallenge', data)
    }
  })

  globalEmitter.on('quickClash:teamMemberStartedChallenge', data => {
    if (!data.battleId || !data.userId) {
      console.error('Invalid data in quickClash:teamMemberStartedChallenge event')
      return
    }

    if (data.teamId) {
      notifyTeamMembers(data.teamId, 'quickClash:teamMemberStartedChallenge', data)
    }
    if (data.opponentTeamId) {
      notifyTeamMembers(data.opponentTeamId, 'quickClash:teamMemberStartedChallenge', data)
    }
  })

  // Team battle update failed
  globalEmitter.on('quickClash:teamBattleUpdateFailed', data => {
    if (!data.battleId) {
      console.error('Invalid data in quickClash:teamBattleUpdateFailed event')
      return
    }

    console.log(
      `[QC_BATTLE] SOCKET: Team battle ${data.battleId} update failed`
    )

    if (data.teamA) {
      notifyTeamMembers(data.teamA, 'quickClash:teamBattleUpdateFailed', data)
    }
    if (data.teamB) {
      notifyTeamMembers(data.teamB, 'quickClash:teamBattleUpdateFailed', data)
    }
  })
}

module.exports = {
  setupTeamBattleEvents,
}
