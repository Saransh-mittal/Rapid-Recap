// services/quickClashServices/quickClashTeamInvitationService.js
const mongoose = require('mongoose')
const ApplicationUpdates = require('../../model/applicationUpdatesSchema')
const QuickClashTeam = require('../../model/quickClashSchemas/quickClashTeamSchema')
const User = require('../../model/userSchema')
const globalEmitter = require('../../eventEmitter')

/**
 * Create a team invitation notification
 * @param {Object} params - Parameters
 * @param {string} params.teamId - Team ID
 * @param {string} params.inviterId - Inviter user ID
 * @param {string} params.inviteeId - Invitee user ID
 * @param {mongoose.ClientSession} [params.session] - Optional mongoose session
 * @returns {Promise<Object>} Created invitation notification
 */
const createTeamInvitationNotification = async ({
  teamId,
  inviterId,
  inviteeId,
  session: providedSession,
}) => {
  const session = providedSession || (await mongoose.startSession())
  let startedTransaction = false

  try {
    if (!providedSession) {
      startedTransaction = true
      await session.startTransaction()
    }

    // Get team and inviter information
    const [team, inviter] = await Promise.all([
      QuickClashTeam.findById(teamId)
        .select('name members maxMembers')
        .session(session),
      User.findById(inviterId).select('name inGameName').session(session),
    ])

    if (!team) {
      throw new Error('Team not found')
    }

    if (!inviter) {
      throw new Error('Inviter not found')
    }

    // Check if team is full
    if (team.members.length >= team.maxMembers) {
      throw new Error('Team is full')
    }

    // Check if user is already in the team
    const existingMember = team.members.find(
      member => member.user.toString() === inviteeId.toString(),
    )
    if (existingMember) {
      throw new Error('User is already a member of this team')
    }

    // Check if there's already a pending invitation
    const existingInvitation = await ApplicationUpdates.findOne({
      userId: inviteeId,
      type: 'teamInvitation',
      'invitationData.teamId': teamId,
      'invitationData.status': 'pending',
    }).session(session)

    if (existingInvitation) {
      throw new Error('Invitation already sent to this user')
    }

    // Create the invitation notification
    const invitation = new ApplicationUpdates({
      userId: inviteeId,
      type: 'teamInvitation',
      title: `Team Invitation from ${team.name}`,
      mainText: `${
        inviter.name || inviter.inGameName
      } has invited you to join their QuickClash team "${
        team.name
      }". Accept the invitation to start battling together!`,
      img: '/images/team-invitation-icon.png', // You can customize this
      invitationData: {
        teamId,
        teamName: team.name,
        inviterName: inviter.name || inviter.inGameName,
        inviterId,
        status: 'pending',
      },
    })

    await invitation.save({ session })

    if (startedTransaction) {
      await session.commitTransaction()
    }

    // Emit socket event to notify the invitee
    setTimeout(() => {
      globalEmitter.emit('quickClash:teamInvitationReceived', {
        inviteeId,
        invitationId: invitation._id,
        teamName: team.name,
        inviterName: inviter.name || inviter.inGameName,
        teamId,
      })
    }, 0)

    return invitation
  } catch (error) {
    if (startedTransaction) {
      await session.abortTransaction()
    }
    throw error
  } finally {
    if (!providedSession) {
      session.endSession()
    }
  }
}

/**
 * Accept a team invitation
 * @param {Object} params - Parameters
 * @param {string} params.invitationId - Invitation notification ID
 * @param {string} params.userId - User ID accepting the invitation
 * @returns {Promise<Object>} Updated team
 */
const acceptTeamInvitation = async ({ invitationId, userId }) => {
  const session = await mongoose.startSession()

  try {
    return await session.withTransaction(async () => {
      // Find the invitation
      const invitation = await ApplicationUpdates.findById(
        invitationId,
      ).session(session)

      if (!invitation || invitation.type !== 'teamInvitation') {
        throw new Error('Invitation not found')
      }

      if (invitation.userId.toString() !== userId.toString()) {
        throw new Error('Not authorized to accept this invitation')
      }

      if (invitation.invitationData.status !== 'pending') {
        throw new Error('Invitation is no longer pending')
      }

      // Get the team
      const team = await QuickClashTeam.findById(
        invitation.invitationData.teamId,
      ).session(session)

      if (!team) {
        throw new Error('Team not found')
      }

      // Check if team is full
      if (team.members.length >= team.maxMembers) {
        throw new Error('Team is now full')
      }

      // Check if user is already in the team
      const existingMember = team.members.find(
        member => member.user.toString() === userId.toString(),
      )
      if (existingMember) {
        throw new Error('You are already a member of this team')
      }

      // Add user to team
      team.members.push({
        user: userId,
        role: 'member',
        status: 'ready',
      })

      // Update last active timestamp
      team.lastActive = new Date()

      await team.save({ session })

      // Update invitation status
      invitation.invitationData.status = 'accepted'
      invitation.read = true
      await invitation.save({ session })

      const user = await User.findById(userId)
        .select('name inGameName')
        .session(session)
      if (!user) {
        throw new Error('User not found')
      }

      // Emit socket events
      setTimeout(() => {
        globalEmitter.emit('quickClash:teamInvitationAccepted', {
          teamId: team._id,
          userId,
          inviterName: invitation.invitationData.inviterName,
          userName: user.name,
          userInGameName: user.inGameName,
        })
      }, 0)

      return team
    })
  } finally {
    session.endSession()
  }
}

/**
 * Reject a team invitation
 * @param {Object} params - Parameters
 * @param {string} params.invitationId - Invitation notification ID
 * @param {string} params.userId - User ID rejecting the invitation
 * @returns {Promise<void>}
 */
const rejectTeamInvitation = async ({ invitationId, userId }) => {
  const session = await mongoose.startSession()

  try {
    return await session.withTransaction(async () => {
      // Find the invitation
      const invitation = await ApplicationUpdates.findById(
        invitationId,
      ).session(session)

      if (!invitation || invitation.type !== 'teamInvitation') {
        throw new Error('Invitation not found')
      }

      if (invitation.userId.toString() !== userId.toString()) {
        throw new Error('Not authorized to reject this invitation')
      }

      if (invitation.invitationData.status !== 'pending') {
        throw new Error('Invitation is no longer pending')
      }

      // Update invitation status
      invitation.invitationData.status = 'rejected'
      invitation.read = true
      await invitation.save({ session })
      const user = await User.findById(userId)
        .select('name inGameName')
        .session(session)
      if (!user) {
        throw new Error('User not found')
      }
      // Emit socket events
      setTimeout(() => {
        globalEmitter.emit('quickClash:teamInvitationRejected', {
          teamId: invitation.invitationData.teamId,
          userId,
          inviterName: invitation.invitationData.inviterName,
          userName: user.name,
          userInGameName: user.inGameName,
        })
      }, 0)
    })
  } finally {
    session.endSession()
  }
}

/**
 * Get pending team invitations for a user
 * @param {Object} params - Parameters
 * @param {string} params.userId - User ID
 * @returns {Promise<Array>} Pending invitations
 */
const getUserPendingInvitations = async ({ userId }) => {
  const invitations = await ApplicationUpdates.find({
    userId,
    type: 'teamInvitation',
    'invitationData.status': 'pending',
  })
    .populate('invitationData.teamId', 'name members')
    .sort({ date: -1 })

  return invitations
}

module.exports = {
  createTeamInvitationNotification,
  acceptTeamInvitation,
  rejectTeamInvitation,
  getUserPendingInvitations,
}
