// services/quickClashServices/quickClashTeamService.js
const mongoose = require('mongoose')
const QuickClashTeam = require('../../model/quickClashSchemas/quickClashTeamSchema')
const User = require('../../model/userSchema')
const { DEFAULT_STARTING_TROPHIES } = require('./quickClashTrophyService')
const globalEmitter = require('../../eventEmitter')
const {
  createTeamInvitationNotification,
} = require('./quickClashTeamInvitationService')
const {
  notifyTeamMemberJoined,
  notifyTeamInvitationAccepted,
  notifyTeamMemberLeft,
  notifyTeamMemberRemoved,
  notifyTeamInvitationSent,
  notifyTeamInvitationRejected,
} = require('./quickClashNotificationService')

/**
 * Create a new team
 * @param {Object} params - Parameters
 * @param {string} params.name - Team name
 * @param {string} params.creatorId - Creator user ID
 * @returns {Promise<Object>} Created team
 */
const createTeam = async ({ name, creatorId }) => {
  const session = await mongoose.startSession()

  try {
    return await session.withTransaction(async () => {
      // Check if user exists
      const creator = await User.findById(creatorId).session(session)
      if (!creator) {
        throw new Error('User not found')
      }

      // Create a new team
      const team = new QuickClashTeam({
        name,
        creator: creatorId,
        members: [
          {
            user: creatorId,
            role: 'leader',
            status: 'ready',
          },
        ],
      })

      await team.save({ session })

      // Emit event
      setTimeout(() => {
        globalEmitter.emit('quickClash:teamCreated', {
          team: team._id,
          creator: creatorId,
        })
      }, 0)

      return team
    })
  } finally {
    session.endSession()
  }
}

/**
 * Get a team by ID
 * @param {Object} params - Parameters
 * @param {string} params.teamId - Team ID
 * @returns {Promise<Object>} Team details
 */
const getTeamById = async ({ teamId }) => {
  const team = await QuickClashTeam.findById(teamId)
    .populate('creator', '_id name inGameName pic quickClashTrophies')
    .populate('members.user', '_id name inGameName pic quickClashTrophies')
    .populate('members.sessionPlayer', '_id inGameName trophies')

  if (!team) {
    throw new Error('Team not found')
  }

  return team
}

/**
 * Get a team by code
 * @param {Object} params - Parameters
 * @param {string} params.teamCode - Team code
 * @returns {Promise<Object>} Team details
 */
const getTeamByCode = async ({ teamCode }) => {
  const team = await QuickClashTeam.findOne({ teamCode })
    .populate('creator', '_id name inGameName pic quickClashTrophies')
    .populate('members.user', '_id name inGameName pic quickClashTrophies')
    .populate('members.sessionPlayer', '_id inGameName trophies')

  if (!team) {
    throw new Error('Team not found')
  }

  return team
}

/**
 * Join a team using team code
 * @param {Object} params - Parameters
 * @param {string} params.teamCode - Team code
 * @param {string} params.userId - User ID
 * @returns {Promise<Object>} Updated team
 */
const joinTeamByCode = async ({ teamCode, userId }) => {
  const session = await mongoose.startSession()

  try {
    return await session.withTransaction(async () => {
      // Find the team
      const team = await QuickClashTeam.findOne({ teamCode }).session(session)
      if (!team) {
        throw new Error('Team not found')
      }

      // Check if team is full
      if (team.members.length >= team.maxMembers) {
        throw new Error('Team is full')
      }

      // Verify user exists and retrieve fresh data
      const userDoc = await User.findById(userId).session(session)
      if (!userDoc) {
          throw new Error(`User ${userId} not found in database`)
      }

      console.log(`[TEAM_JOIN] Found team ${team._id}, current members: ${team.members.length}`)

      // Check if already a member
      const existingMember = team.members.find(
        m => (m.user && m.user.toString() === userId.toString())
      )

      if (existingMember) {
        throw new Error('User already in team')
      }

      // Check if user exists
      const user = await User.findById(userId)
        .session(session)
        .select('_id name inGameName ')
      if (!user) {
        throw new Error('User not found')
      }

      // Add user to team
      team.members.push({
        user: userId,
        role: 'member',
        status: 'accepted',
        joinedAt: new Date(),
      })

      // Update last active timestamp
      team.lastActive = new Date()

      await team.save({ session })

      // Emit events
      setTimeout(async () => {
        // 2. Emit team updated event (for real-time list updates)
        try {
          // Re-fetch team with populated members to send full update
          const updatedTeam = await QuickClashTeam.findById(team._id)
            .populate('members.user', '_id name inGameName pic quickClashTrophies')
            .lean()

          if (updatedTeam) {
            // Need to manually populate session players since they are in a different collection
            const PlaySession = require('../../model/quickClashSchemas/playSessionSchema')
            const sessionPlayerIds = updatedTeam.members
              .filter(m => m.sessionPlayer)
              .map(m => m.sessionPlayer)

            const sessionPlayers = await PlaySession.find({ _id: { $in: sessionPlayerIds } })
              .select('_id inGameName trophies sessionId') // Added sessionId
              .lean()

            console.log(`[TEAM_JOIN] Found ${sessionPlayers.length} session players for update`)

            // Filter out nulls
            const publicMembers = updatedTeam.members.map(m => {
              if (m.sessionPlayer) {
                const sp = sessionPlayers.find(sp => sp._id.toString() === m.sessionPlayer.toString())
                return {
                  _id: m.sessionPlayer.toString(), // Match getPublicTeamInfo structure
                  type: 'session',
                  sessionId: sp?.sessionId, // Include sessionId so client recognizes 'me'
                  inGameName: sp?.inGameName || 'Player',
                  trophies: sp?.trophies || 1000,
                  role: m.role,
                  status: m.status
                }
              } else if (m.user) {
                if (!m.user.inGameName && !m.user.name) {
                   console.log('[TEAM_JOIN] Warning: Member user not fully populated', m.user)
                }
                return {
                  _id: m.user._id, // Match getPublicTeamInfo structure
                  type: 'user',
                  userId: m.user._id,
                  inGameName: m.user.inGameName || m.user.name || 'Player',
                  trophies: m.user.quickClashTrophies || 1000,
                  role: m.role,
                  status: m.status,
                  pic: m.user.pic
                }
              }
              return null
            }).filter(Boolean)

            console.log('[TEAM_JOIN] Prepared public members:', JSON.stringify(publicMembers.map(m => ({ type: m.type, name: m.inGameName, id: m._id }))))

            const teamInfo = {
              ...updatedTeam,
              members: publicMembers,
              memberCount: publicMembers.length
            }

            console.log(`[TEAM_JOIN] Emitting teamUpdated for team ${team._id} with ${publicMembers.length} members`)
            globalEmitter.emit('quickClash:teamUpdated', {
              teamId: team._id.toString(),
              team: teamInfo
            })

            // Also emit teamMemberJoined with team info for reliable state sync
            globalEmitter.emit('quickClash:teamMemberJoined', {
              team: team._id,
              user: userId,
              userName: user.name,
              userInGameName: user.inGameName,
              teamInfo: teamInfo
            })
          }
        } catch (updateError) {
          console.error('Error emitting team update:', updateError)
        }

        // Send notifications to existing team members
        try {
          const teamWithMembers = await QuickClashTeam.findById(team._id)
            .populate('members.user', '_id name inGameName')
            .lean()

          if (teamWithMembers && teamWithMembers.members) {
            await notifyTeamMemberJoined({
              teamId: team._id,
              userId: userId.toString(),
              userName: user.name,
              userInGameName: user.inGameName,
              teamName: team.name || 'Your Squad',
              teamMembers: teamWithMembers.members,
            })
          }
        } catch (notificationError) {
          console.error(
            'Error sending team member joined notifications:',
            notificationError,
          )
        }
      }, 500)

      return team
    })
  } finally {
    session.endSession()
  }
}

/**
 * Respond to team invitation
 * @param {Object} params - Parameters
 * @param {string} params.teamId - Team ID
 * @param {string} params.userId - User ID
 * @param {boolean} params.accept - Whether to accept invitation
 * @returns {Promise<Object>} Updated team or null if rejected
 */
const respondToInvitation = async ({ teamId, userId, accept }) => {
  const session = await mongoose.startSession()

  try {
    return await session.withTransaction(async () => {
      // Find the team
      const team = await QuickClashTeam.findById(teamId).session(session)
      if (!team) {
        throw new Error('Team not found')
      }

      // Find the member
      const memberIndex = team.members.findIndex(
        member =>
          member.user.toString() === userId.toString() &&
          member.status === 'pending',
      )

      if (memberIndex === -1) {
        throw new Error('No pending invitation found')
      }

      if (accept) {
        // Accept invitation
        team.members[memberIndex].status = 'ready'
        // Update last active timestamp
        team.lastActive = new Date()

        await team.save({ session })

        setTimeout(async () => {
          globalEmitter.emit('quickClash:teamInviteAccepted', {
            team: team._id,
            user: userId,
          })

          // Send notifications to team members about invitation acceptance
          try {
            const teamWithMembers = await QuickClashTeam.findById(team._id)
              .populate('members.user', '_id name inGameName')
              .lean()

            const acceptingUser = await User.findById(userId)
              .select('_id name inGameName')
              .lean()

            if (teamWithMembers && teamWithMembers.members && acceptingUser) {
              await notifyTeamInvitationAccepted({
                teamId: team._id,
                userId: userId.toString(),
                userName: acceptingUser.name,
                userInGameName: acceptingUser.inGameName,
                teamName: team.name || 'Your Squad',
                inviterName: 'Team Leader', // Could be enhanced to track actual inviter
                teamMembers: teamWithMembers.members,
              })
            }
          } catch (notificationError) {
            console.error(
              'Error sending team invitation accepted notifications:',
              notificationError,
            )
          }
        }, 0)

        return team
      } else {
        // Reject invitation by removing the member
        team.members.splice(memberIndex, 1)
        await team.save({ session })

        // Emit event
        setTimeout(async () => {
          globalEmitter.emit('quickClash:teamInviteRejected', {
            team: team._id,
            user: userId,
          })

          // Send notifications to team members about invitation rejection
          try {
            const teamWithMembers = await QuickClashTeam.findById(team._id)
              .populate('members.user', '_id name inGameName')
              .lean()

            const rejectingUser = await User.findById(userId)
              .select('_id name inGameName')
              .lean()

            if (teamWithMembers && teamWithMembers.members && rejectingUser) {
              await notifyTeamInvitationRejected({
                teamId: team._id,
                userId: userId.toString(),
                userName: rejectingUser.name,
                userInGameName: rejectingUser.inGameName,
                teamName: team.name || 'Your Squad',
                inviterName: 'Team Leader', // Could be enhanced to track actual inviter
                teamMembers: teamWithMembers.members,
              })
            }
          } catch (notificationError) {
            console.error(
              'Error sending team invitation rejected notifications:',
              notificationError,
            )
          }
        }, 0)

        return null
      }
    })
  } finally {
    session.endSession()
  }
}

/**
 * Leave team
 * @param {Object} params - Parameters
 * @param {string} params.teamId - Team ID
 * @param {string} params.playerId - Player ID (user or session player)
 * @param {boolean} params.isSessionPlayer - Whether the player is a session player
 * @returns {Promise<Object>} Updated team or null if dissolved
 */
const leaveTeam = async ({ teamId, playerId, isSessionPlayer = false }) => {
  const session = await mongoose.startSession()

  try {
    return await session.withTransaction(async () => {
      // Find the team
      const team = await QuickClashTeam.findById(teamId).session(session)
      if (!team) {
        throw new Error('Team not found')
      }

      // Prevent leaving if team is in a match
      if (team.isInMatch) {
        throw new Error('Cannot leave team while in a match')
      }

      // Find the member - check both user and sessionPlayer fields
      let memberIndex = -1
      if (isSessionPlayer) {
        memberIndex = team.members.findIndex(
          member => member.sessionPlayer && member.sessionPlayer.toString() === playerId.toString(),
        )
      } else {
        memberIndex = team.members.findIndex(
          member => member.user && member.user.toString() === playerId.toString(),
        )
      }

      if (memberIndex === -1) {
        throw new Error('Not a member of this team')
      }

      const isLeader = team.members[memberIndex].role === 'leader'

      // Remove member
      team.members.splice(memberIndex, 1)

      // If team is empty or leader left, dissolve the team
      if (team.members.length === 0 || isLeader) {
        await QuickClashTeam.findByIdAndDelete(teamId).session(session)

        return null
      }

      // If leader left, promote the oldest member to leader
      if (isLeader) {
        // Sort members by join date
        const oldestMember = [...team.members].sort(
          (a, b) => a.joinedAt - b.joinedAt,
        )[0]

        if (oldestMember) {
          oldestMember.role = 'leader'
        }
      }

      // Update last active timestamp
      team.lastActive = new Date()

      await team.save({ session })

      // Get player info for events/notifications
      let playerName = 'Player'
      let playerInGameName = 'Player'

      if (isSessionPlayer) {
        // For session players, get info from the SessionPlayer model
        const SessionPlayer = require('../../model/quickClashSchemas/sessionPlayerSchema')
        const sessionPlayer = await SessionPlayer.findById(playerId).select('_id inGameName').session(session)
        if (sessionPlayer) {
          playerName = sessionPlayer.inGameName || 'Session Player'
          playerInGameName = sessionPlayer.inGameName || 'Session Player'
        }
      } else {
        const user = await User.findById(playerId).select('_id name inGameName').session(session)
        if (user) {
          playerName = user.name
          playerInGameName = user.inGameName
        }
      }

      // Emit event
      setTimeout(async () => {
        globalEmitter.emit('quickClash:teamMemberLeft', {
          team: team._id,
          user: playerId,
          userName: playerName,
          userInGameName: playerInGameName,
        })

        // Send notifications to remaining team members (only for real users, not session players)
        try {
          const teamWithMembers = await QuickClashTeam.findById(team._id)
            .populate('members.user', '_id name inGameName')
            .lean()

          if (teamWithMembers && teamWithMembers.members) {
            await notifyTeamMemberLeft({
              teamId: team._id,
              userId: playerId.toString(),
              userName: playerName,
              userInGameName: playerInGameName,
              teamName: team.name || 'Your Squad',
              teamMembers: teamWithMembers.members,
            })
          }
        } catch (notificationError) {
          console.error(
            'Error sending team member left notifications:',
            notificationError,
          )
        }
      }, 0)

      return team
    })
  } finally {
    session.endSession()
  }
}

/**
 * Update team member status
 * @param {Object} params - Parameters
 * @param {string} params.teamId - Team ID
 * @param {string} params.userId - User ID
 * @param {string} params.status - New status ('ready' or 'pending')
 * @returns {Promise<Object>} Updated team
 */
const updateMemberStatus = async ({ teamId, userId, status }) => {
  if (!['ready', 'pending'].includes(status)) {
    throw new Error('Invalid status')
  }

  const team = await QuickClashTeam.findById(teamId)
  if (!team) {
    throw new Error('Team not found')
  }

  const memberIndex = team.members.findIndex(
    member => member.user.toString() === userId.toString(),
  )

  if (memberIndex === -1) {
    throw new Error('Not a member of this team')
  }

  team.members[memberIndex].status = status

  // Update last active timestamp
  team.lastActive = new Date()

  await team.save()

  // Emit event
  setTimeout(() => {
    globalEmitter.emit('quickClash:teamMemberStatusChanged', {
      team: team._id,
      user: userId,
      status,
    })
  }, 0)

  return team
}

/**
 * Get user's teams
 * @param {Object} params - Parameters
 * @param {string} params.userId - User ID
 * @returns {Promise<Array>} User's teams
 */
const getUserTeams = async ({ userId }) => {
  const teams = await QuickClashTeam.find({
    'members.user': userId,
    'formationInfo.isAutoFormed': false,
  })
    .populate('creator', '_id name inGameName pic')
    .populate('members.user', '_id name inGameName pic quickClashTrophies')
    .populate('members.sessionPlayer', '_id inGameName trophies')
    .sort({ lastActive: -1 })

  return teams
}

/**
 * Update team match status
 * @param {Object} params - Parameters
 * @param {string} params.teamId - Team ID
 * @param {boolean} params.isInMatch - Whether team is in a match
 * @param {Object} params.session - Database session for transaction
 * @returns {Promise<Object>} Updated team
 */
const updateTeamMatchStatus = async ({
  teamId,
  isInMatch,
  session: providedSession,
}) => {
  const session = providedSession || (await mongoose.startSession())
  const sessionWasProvided = !!providedSession

  try {
    if (!sessionWasProvided) {
      session.startTransaction()
    }

    const team = await QuickClashTeam.findById(teamId).session(session)
    if (!team) {
      throw new Error('Team not found')
    }

    team.isInMatch = isInMatch

    // If setting to not in match, clear all category selections
    if (!isInMatch) {
      team.members.forEach(member => {
        member.selectedCategory = null
      })
    }

    // Update last active timestamp
    team.lastActive = new Date()

    await team.save({ session })

    if (!sessionWasProvided) {
      await session.commitTransaction()
    }

    return team
  } catch (error) {
    if (!sessionWasProvided && session.inTransaction()) {
      await session.abortTransaction()
    }
    throw error
  } finally {
    if (!sessionWasProvided) {
      session.endSession()
    }
  }
}

/**
 * Remove a member from team (admin action)
 * @param {Object} params - Parameters
 * @param {string} params.teamId - Team ID
 * @param {string} params.leaderId - Leader user ID
 * @param {string} params.memberId - Member to remove
 * @returns {Promise<Object>} Updated team
 */
const removeMember = async ({ teamId, leaderId, memberId }) => {
  const session = await mongoose.startSession()

  try {
    return await session.withTransaction(async () => {
      // Find the team
      const team = await QuickClashTeam.findById(teamId).session(session)
      if (!team) {
        throw new Error('Team not found')
      }

      // Verify user is team leader
      const isLeader = team.members.some(
        member =>
          member.user.toString() === leaderId.toString() &&
          member.role === 'leader',
      )

      if (!isLeader) {
        throw new Error('Only the team leader can remove members')
      }

      // Prevent removing self (use leaveTeam instead)
      if (leaderId.toString() === memberId.toString()) {
        throw new Error('Cannot remove yourself, use leave team instead')
      }

      // Prevent removing members if team is in a match
      if (team.isInMatch) {
        throw new Error('Cannot remove members while in a match')
      }

      // Find the member to remove
      const memberIndex = team.members.findIndex(
        member => member.user.toString() === memberId.toString(),
      )

      if (memberIndex === -1) {
        throw new Error('Member not found in team')
      }

      // Remove member
      team.members.splice(memberIndex, 1)

      // Update last active timestamp
      team.lastActive = new Date()

      await team.save({ session })
      const removedMember = await User.findById(memberId)
        .session(session)
        .select('_id name inGameName')
      if (!removedMember) {
        throw new Error('Removed member not found')
      }
      // Emit event
      setTimeout(async () => {
        globalEmitter.emit('quickClash:teamMemberRemoved', {
          team: team._id,
          leader: leaderId,
          removedMember: memberId,
          teamName: team.name,
          removedMemberName: removedMember.name,
          removedMemberInGameName: removedMember.inGameName,
        })

        // Send notifications about member removal
        try {
          const teamWithMembers = await QuickClashTeam.findById(team._id)
            .populate('members.user', '_id name inGameName')
            .lean()

          const leader = await User.findById(leaderId)
            .select('_id name inGameName')
            .lean()

          if (teamWithMembers && teamWithMembers.members && leader) {
            await notifyTeamMemberRemoved({
              teamId: team._id,
              leaderId: leaderId.toString(),
              removedMemberId: memberId.toString(),
              teamName: team.name || 'Your Squad',
              removedMemberName: removedMember.name,
              removedMemberInGameName: removedMember.inGameName,
              leaderName: leader.inGameName || leader.name,
              teamMembers: teamWithMembers.members,
            })
          }
        } catch (notificationError) {
          console.error(
            'Error sending team member removed notifications:',
            notificationError,
          )
        }
      }, 0)

      return team
    })
  } finally {
    session.endSession()
  }
}

/**
 * Invite user to team (creates notification instead of direct addition)
 * @param {Object} params - Parameters
 * @param {string} params.teamId - Team ID
 * @param {string} params.inviterId - Inviter user ID
 * @param {string} params.inviteeId - Invitee user ID
 * @returns {Promise<Object>} Created invitation notification
 */
const inviteToTeam = async ({ teamId, inviterId, inviteeId }) => {
  const session = await mongoose.startSession()

  try {
    return await session.withTransaction(async () => {
      // Find the team
      const team = await QuickClashTeam.findById(teamId).session(session)
      if (!team) {
        throw new Error('Team not found')
      }

      // Verify inviter is a team member with appropriate permissions
      const inviter = team.members.find(
        member => member.user.toString() === inviterId.toString(),
      )
      if (!inviter || inviter.role !== 'leader') {
        throw new Error('Not authorized to invite members')
      }

      // Check if team is full
      if (team.members.length >= team.maxMembers) {
        throw new Error('Team is full')
      }

      // Check if invitee exists
      const invitee = await User.findById(inviteeId).session(session)
      if (!invitee) {
        throw new Error('Invitee not found')
      }

      // Create invitation notification
      const invitation = await createTeamInvitationNotification({
        teamId,
        inviterId,
        inviteeId,
        session,
      })

      try {
        const inviter = await User.findById(inviterId)
          .select('_id name inGameName')
          .lean()
          .session(session)

        if (inviter) {
          setTimeout(async () => {
            await notifyTeamInvitationSent({
              teamId: teamId.toString(),
              inviterId: inviterId.toString(),
              inviteeId: inviteeId.toString(),
              teamName: team.name || 'Squad',
              inviterName: inviter.inGameName || inviter.name,
            })
          }, 0)
        }
      } catch (notificationError) {
        console.error(
          'Error sending team invitation notification:',
          notificationError,
        )
      }

      return invitation
    })
  } finally {
    session.endSession()
  }
}

/**
 * Transfer team leadership to another member
 * @param {Object} params - Parameters
 * @param {string} params.teamId - Team ID
 * @param {string} params.currentLeaderId - Current leader user ID
 * @param {string} params.newLeaderId - New leader user ID
 * @returns {Promise<Object>} Updated team
 */
const transferLeadership = async ({ teamId, currentLeaderId, newLeaderId }) => {
  const session = await mongoose.startSession()

  try {
    return await session.withTransaction(async () => {
      // Find the team
      const team = await QuickClashTeam.findById(teamId).session(session)
      if (!team) {
        throw new Error('Team not found')
      }

      // Verify current user is team leader
      const currentLeaderMember = team.members.find(
        member =>
          member.user.toString() === currentLeaderId.toString() &&
          member.role === 'leader',
      )

      if (!currentLeaderMember) {
        throw new Error('Only the team leader can transfer leadership')
      }

      // Prevent transferring to self
      if (currentLeaderId.toString() === newLeaderId.toString()) {
        throw new Error('Cannot transfer leadership to yourself')
      }

      // Prevent transferring while in a match
      if (team.isInMatch) {
        throw new Error('Cannot transfer leadership while in a match')
      }

      // Find the new leader
      const newLeaderMember = team.members.find(
        member => member.user.toString() === newLeaderId.toString(),
      )

      if (!newLeaderMember) {
        throw new Error('New leader is not a member of this team')
      }

      // Swap roles
      currentLeaderMember.role = 'member'
      newLeaderMember.role = 'leader'

      // Update last active timestamp
      team.lastActive = new Date()

      await team.save({ session })

      // Get user details for notifications
      const [oldLeader, newLeader] = await Promise.all([
        User.findById(currentLeaderId).session(session).select('_id name inGameName'),
        User.findById(newLeaderId).session(session).select('_id name inGameName'),
      ])

      // Emit event for real-time updates
      setTimeout(async () => {
        globalEmitter.emit('quickClash:teamLeadershipTransferred', {
          team: team._id,
          teamName: team.name,
          oldLeaderId: currentLeaderId,
          newLeaderId: newLeaderId,
          oldLeaderName: oldLeader?.inGameName || oldLeader?.name,
          newLeaderName: newLeader?.inGameName || newLeader?.name,
        })

        // Notify team members
        try {
          const teamWithMembers = await QuickClashTeam.findById(team._id)
            .populate('members.user', '_id name inGameName')
            .lean()

          if (teamWithMembers && teamWithMembers.members) {
            // Notification logic can be added here if needed
            console.log(
              `[TEAM] Leadership transferred in ${team.name}: ${oldLeader?.name} → ${newLeader?.name}`,
            )
          }
        } catch (notificationError) {
          console.error(
            'Error sending leadership transfer notifications:',
            notificationError,
          )
        }
      }, 0)

      return team
    })
  } finally {
    session.endSession()
  }
}

module.exports = {
  createTeam,
  getTeamById,
  getTeamByCode,
  joinTeamByCode,
  inviteToTeam,
  respondToInvitation,
  leaveTeam,
  updateMemberStatus,
  getUserTeams,
  updateTeamMatchStatus,
  removeMember,
  transferLeadership,
}
