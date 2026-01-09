/**
 * Quick Clash Socket - Team Membership Events
 *
 * Handles global emitter events for team invitations and membership.
 * These are active events used in Team Mode.
 */

const globalEmitter = require('../../eventEmitter')
const QuickClashTeam = require('../../model/quickClashSchemas/quickClashTeamSchema')
const { getMemberPlayerId } = require('../sessionPlayerUtils')

/**
 * Setup team membership global event handlers
 * These handle team invitations and membership changes.
 *
 * @param {Object} io - Socket.io instance
 * @param {Function} notifyUser - User notification helper
 */
const setupTeamMembershipEvents = (io, notifyUser) => {
  console.log('[QC_TEAM] Setting up team membership event handlers')

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
        const userId = getMemberPlayerId(member)
        if (!userId) continue // Skip members without valid user/sessionPlayer
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
  // TEAM INVITATION EVENTS
  // ==========================================

  // Team invitation received - notify only the invitee
  globalEmitter.on(
    'quickClash:teamInvitationReceived',
    ({ inviteeId, invitationId, teamName, inviterName }) => {
      if (!inviteeId) {
        console.error('Invalid data in quickClash:teamInvitationReceived event')
        return
      }

      console.log(
        `[QC_TEAM] SOCKET: User ${inviteeId} received team invitation from ${inviterName} for team ${teamName}`
      )

      const success = notifyUser(
        inviteeId,
        'quickClash:teamInvitationReceived',
        {
          invitationId,
          teamName,
          inviterName,
        }
      )
      console.log(
        `[QC_TEAM] Team invitation received notification sent to ${inviteeId}: ${success}`
      )
    }
  )

  // Team invitation accepted - notify team members
  globalEmitter.on(
    'quickClash:teamInvitationAccepted',
    ({ teamId, userId, inviterName, userName, userInGameName }) => {
      if (!teamId || !userId) {
        console.error('Invalid data in quickClash:teamInvitationAccepted event')
        return
      }

      console.log(
        `[QC_TEAM] SOCKET: User ${userId} accepted team invitation for team ${teamId} from ${inviterName}`
      )

      // Notify team members EXCLUDING the user who accepted
      notifyTeamMembers(
        teamId,
        'quickClash:teamInvitationAccepted',
        {
          teamId,
          userId,
          inviterName,
          userName,
          userInGameName,
        },
        [userId]
      )

      // Notify the user who accepted separately
      const success = notifyUser(userId, 'quickClash:teamInvitationAccepted', {
        teamId,
        userId,
        inviterName,
        isCurrentUser: true,
      })
      console.log(
        `[QC_TEAM] Team invitation accepted notification sent to user ${userId}: ${success}`
      )
    }
  )

  // Team invitation rejected - notify team members
  globalEmitter.on(
    'quickClash:teamInvitationRejected',
    ({ teamId, userId, inviterName, userName, userInGameName }) => {
      if (!teamId || !userId) {
        console.error('Invalid data in quickClash:teamInvitationRejected event')
        return
      }

      console.log(
        `[QC_TEAM] SOCKET: User ${userId} rejected team invitation for team ${teamId} from ${inviterName}`
      )

      // Notify team members EXCLUDING the user who rejected
      notifyTeamMembers(
        teamId,
        'quickClash:teamInvitationRejected',
        {
          teamId,
          userId,
          inviterName,
          userName,
          userInGameName,
        },
        [userId]
      )

      // Notify the user who rejected separately
      const success = notifyUser(userId, 'quickClash:teamInvitationRejected', {
        teamId,
        userId,
        inviterName,
        isCurrentUser: true,
      })
      console.log(
        `[QC_TEAM] Team invitation rejected notification sent to user ${userId}: ${success}`
      )
    }
  )

  // ==========================================
  // TEAM MEMBERSHIP CHANGE EVENTS
  // ==========================================

  // Team member joined
  globalEmitter.on(
    'quickClash:teamMemberJoined',
    ({ team, user, userName, userInGameName }) => {
      if (!team || !user) {
        console.error('Invalid data in quickClash:teamMemberJoined event')
        return
      }

      console.log(`[QC_TEAM] SOCKET: User ${user} joined team ${team}`)

      notifyTeamMembers(team, 'quickClash:teamMemberJoined', {
        teamId: team,
        userId: user,
        userName,
        userInGameName,
      })
    }
  )

  // Team member left
  globalEmitter.on(
    'quickClash:teamMemberLeft',
    ({ team, user, userName, userInGameName }) => {
      if (!team || !user) {
        console.error('Invalid data in quickClash:teamMemberLeft event')
        return
      }

      console.log(`[QC_TEAM] SOCKET: User ${user} left team ${team}`)

      notifyTeamMembers(team, 'quickClash:teamMemberLeft', {
        teamId: team,
        userId: user,
        userName,
        userInGameName,
      })
    }
  )

  // Team member removed (kicked)
  globalEmitter.on(
    'quickClash:teamMemberRemoved',
    ({
      team,
      leader,
      removedMember,
      teamName,
      removedMemberName,
      removedMemberInGameName,
    }) => {
      if (!team || !leader || !removedMember) {
        console.error('Invalid data in quickClash:teamMemberRemoved event')
        return
      }

      console.log(
        `[QC_TEAM] SOCKET: User ${removedMember} was removed from team ${team} by ${leader}`
      )

      // Notify team members EXCLUDING the removed member
      notifyTeamMembers(
        team,
        'quickClash:teamMemberRemoved',
        {
          teamId: team,
          leaderId: leader,
          removedMemberId: removedMember,
          teamName,
          removedMemberName,
          removedMemberInGameName,
          isCurrentUser: false,
          isLeader: leader === removedMember,
        },
        [removedMember]
      )

      // Notify the removed member separately
      const success = notifyUser(
        removedMember,
        'quickClash:teamMemberRemoved',
        {
          teamId: team,
          leaderId: leader,
          removedMemberId: removedMember,
          isCurrentUser: true,
          teamName,
          removedMemberName,
          removedMemberInGameName,
        }
      )
      console.log(
        `[QC_TEAM] Team member removed notification sent to ${removedMember}: ${success}`
      )
    }
  )

  // Team member status changed
  globalEmitter.on('quickClash:teamMemberStatusChanged', data => {
    if (!data.teamId || !data.userId) {
      console.error('Invalid data in quickClash:teamMemberStatusChanged event')
      return
    }

    console.log(
      `[QC_TEAM] SOCKET: User ${data.userId} status changed in team ${data.teamId}`
    )

    notifyTeamMembers(data.teamId, 'quickClash:teamMemberStatusChanged', data)
  })
}

module.exports = {
  setupTeamMembershipEvents,
}
