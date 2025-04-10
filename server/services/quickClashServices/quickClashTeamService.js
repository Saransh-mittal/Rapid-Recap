// services/quickClashServices/quickClashTeamService.js
const mongoose = require('mongoose')
const QuickClashTeam = require('../../model/quickClashSchemas/quickClashTeamSchema')
const User = require('../../model/userSchema')
const { DEFAULT_STARTING_TROPHIES } = require('./quickClashTrophyService')
const globalEmitter = require('../../eventEmitter')

/**
 * Create a new team
 * @param {Object} params - Parameters
 * @param {string} params.name - Team name
 * @param {string} params.creatorId - Creator user ID
 * @param {boolean} [params.isPersistent=false] - Whether team persists after battles
 * @returns {Promise<Object>} Created team
 */
const createTeam = async ({ name, creatorId, isPersistent = false }) => {
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
        isPersistent,
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

      // Check if user is already in the team
      const existingMember = team.members.find(
        member => member.user.toString() === userId.toString(),
      )
      if (existingMember) {
        throw new Error('You are already a member of this team')
      }

      // Check if user exists
      const user = await User.findById(userId).session(session)
      if (!user) {
        throw new Error('User not found')
      }

      // Add user to team
      team.members.push({
        user: userId,
        role: 'member',
        status: 'ready', // Auto-ready since they're explicitly joining
      })

      // Update last active timestamp
      team.lastActive = new Date()

      await team.save({ session })

      // Emit event
      setTimeout(() => {
        globalEmitter.emit('quickClash:teamMemberJoined', {
          team: team._id,
          user: userId,
        })
      }, 0)

      return team
    })
  } finally {
    session.endSession()
  }
}

/**
 * Invite user to team
 * @param {Object} params - Parameters
 * @param {string} params.teamId - Team ID
 * @param {string} params.inviterId - Inviter user ID
 * @param {string} params.inviteeId - Invitee user ID
 * @returns {Promise<Object>} Updated team
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

      // Check if invitee is already in the team
      const existingMember = team.members.find(
        member => member.user.toString() === inviteeId.toString(),
      )
      if (existingMember) {
        throw new Error('User is already a member of this team')
      }

      // Check if invitee exists
      const invitee = await User.findById(inviteeId).session(session)
      if (!invitee) {
        throw new Error('Invitee not found')
      }

      // Add invitee to team as pending
      team.members.push({
        user: inviteeId,
        role: 'member',
        status: 'pending',
      })

      // Update last active timestamp
      team.lastActive = new Date()

      await team.save({ session })

      // Emit event for notifications
      setTimeout(() => {
        globalEmitter.emit('quickClash:teamInviteSent', {
          team: team._id,
          inviter: inviterId,
          invitee: inviteeId,
        })
      }, 0)

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

        // Emit event
        setTimeout(() => {
          globalEmitter.emit('quickClash:teamInviteAccepted', {
            team: team._id,
            user: userId,
          })
        }, 0)

        return team
      } else {
        // Reject invitation by removing the member
        team.members.splice(memberIndex, 1)
        await team.save({ session })

        // Emit event
        setTimeout(() => {
          globalEmitter.emit('quickClash:teamInviteRejected', {
            team: team._id,
            user: userId,
          })
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
 * @param {string} params.userId - User ID
 * @returns {Promise<Object>} Updated team or null if dissolved
 */
const leaveTeam = async ({ teamId, userId }) => {
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

      // Find the member
      const memberIndex = team.members.findIndex(
        member => member.user.toString() === userId.toString(),
      )

      if (memberIndex === -1) {
        throw new Error('Not a member of this team')
      }

      const isLeader = team.members[memberIndex].role === 'leader'

      // Remove member
      team.members.splice(memberIndex, 1)

      // If team is empty or leader left, dissolve the team
      if (team.members.length === 0 || isLeader) {
        await QuickClashTeam.findByIdAndDelete(teamId).session(session)

        // Emit event
        setTimeout(() => {
          globalEmitter.emit('quickClash:teamDissolved', {
            team: teamId,
            user: userId,
          })
        }, 0)

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

      // Emit event
      setTimeout(() => {
        globalEmitter.emit('quickClash:teamMemberLeft', {
          team: team._id,
          user: userId,
        })
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
    isPersistent: true,
  })
    .populate('creator', '_id name inGameName pic')
    .populate('members.user', '_id name inGameName pic quickClashTrophies')
    .sort({ lastActive: -1 })

  return teams
}

/**
 * Toggle team persistence
 * @param {Object} params - Parameters
 * @param {string} params.teamId - Team ID
 * @param {string} params.userId - User ID (must be leader)
 * @returns {Promise<Object>} Updated team
 */
const toggleTeamPersistence = async ({ teamId, userId }) => {
  const team = await QuickClashTeam.findById(teamId)
  if (!team) {
    throw new Error('Team not found')
  }

  // Verify user is team leader
  const member = team.members.find(
    member => member.user.toString() === userId.toString(),
  )

  if (!member || member.role !== 'leader') {
    throw new Error('Only the team leader can change persistence settings')
  }

  team.isPersistent = !team.isPersistent

  await team.save()

  return team
}

/**
 * Add bot member to team
 * @param {Object} params - Parameters
 * @param {string} params.teamId - Team ID
 * @param {string} params.leaderId - Leader user ID
 * @returns {Promise<Object>} Updated team with bot
 */
const addBotToTeam = async ({ teamId, leaderId }) => {
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
        throw new Error('Only the team leader can add bots')
      }

      // Check if team is full
      if (team.members.length >= team.maxMembers) {
        throw new Error('Team is full')
      }

      // Find bot users
      const botUsers = await User.find({
        email: { $regex: /^dummy\d+@mail\.com$/ },
      })
        .select('_id')
        .limit(10)
        .lean()

      if (!botUsers || botUsers.length === 0) {
        throw new Error('No bot users available')
      }

      // Find a bot that isn't already in the team
      const existingBotIds = team.members.map(member => member.user.toString())

      const availableBots = botUsers.filter(
        bot => !existingBotIds.includes(bot._id.toString()),
      )

      if (availableBots.length === 0) {
        throw new Error('No available bots to add')
      }

      // Select a random bot
      const randomBot =
        availableBots[Math.floor(Math.random() * availableBots.length)]

      // Add bot to team
      team.members.push({
        user: randomBot._id,
        role: 'member',
        status: 'ready',
      })

      // Update last active timestamp
      team.lastActive = new Date()

      await team.save({ session })

      // Return populated team
      const populatedTeam = await QuickClashTeam.findById(team._id)
        .populate('creator', '_id name inGameName pic quickClashTrophies')
        .populate('members.user', '_id name inGameName pic quickClashTrophies')
        .session(session)

      // Emit event
      setTimeout(() => {
        globalEmitter.emit('quickClash:botAddedToTeam', {
          team: team._id,
          bot: randomBot._id,
        })
      }, 0)

      return populatedTeam
    })
  } finally {
    session.endSession()
  }
}

/**
 * Fill team with bots to reach maxMembers
 * @param {Object} params - Parameters
 * @param {string} params.teamId - Team ID
 * @param {number} [params.targetCount=4] - Target member count
 * @returns {Promise<Object>} Updated team with bots
 */
const fillTeamWithBots = async ({ teamId, targetCount = 4 }) => {
  const session = await mongoose.startSession()

  try {
    return await session.withTransaction(async () => {
      // Find the team
      const team = await QuickClashTeam.findById(teamId).session(session)
      if (!team) {
        throw new Error('Team not found')
      }

      // Check if team already has enough members
      if (team.members.length >= targetCount) {
        return team
      }

      // Find bot users
      const botUsers = await User.find({
        email: { $regex: /^dummy\d+@mail\.com$/ },
      })
        .select('_id')
        .limit(30)
        .lean()

      if (!botUsers || botUsers.length === 0) {
        throw new Error('No bot users available')
      }

      // Get existing bot IDs
      const existingMemberIds = team.members.map(m => m.user.toString())

      // Filter out bots already in the team
      const availableBots = botUsers.filter(
        bot => !existingMemberIds.includes(bot._id.toString()),
      )

      if (availableBots.length === 0) {
        throw new Error('No available bots to add')
      }

      // Shuffle available bots for random selection
      const shuffledBots = [...availableBots].sort(() => 0.5 - Math.random())

      // Determine how many bots to add
      const botsNeeded = targetCount - team.members.length
      const botsToAdd = shuffledBots.slice(0, botsNeeded)

      // Add bots to team
      for (const bot of botsToAdd) {
        team.members.push({
          user: bot._id,
          role: 'member',
          status: 'ready',
        })
      }

      // Update last active timestamp
      team.lastActive = new Date()

      await team.save({ session })

      // Return populated team
      const populatedTeam = await QuickClashTeam.findById(team._id)
        .populate('creator', '_id name inGameName pic quickClashTrophies')
        .populate('members.user', '_id name inGameName pic quickClashTrophies')
        .session(session)

      // Emit event
      setTimeout(() => {
        globalEmitter.emit('quickClash:teamFilledWithBots', {
          team: team._id,
          botsAdded: botsToAdd.length,
        })
      }, 0)

      return populatedTeam
    })
  } finally {
    session.endSession()
  }
}

/**
 * Update team member category selection
 * @param {Object} params - Parameters
 * @param {string} params.teamId - Team ID
 * @param {string} params.userId - User ID
 * @param {string} params.category - Selected category
 * @returns {Promise<Object>} Updated team
 */
const updateMemberCategory = async ({ teamId, userId, category }) => {
  const session = await mongoose.startSession()

  try {
    return await session.withTransaction(async () => {
      // Find the team
      const team = await QuickClashTeam.findById(teamId).session(session)
      if (!team) {
        throw new Error('Team not found')
      }

      // Check if team is in a match
      if (!team.isInMatch) {
        throw new Error('Team is not in a match')
      }

      // Find the member
      const memberIndex = team.members.findIndex(
        member => member.user.toString() === userId.toString(),
      )

      if (memberIndex === -1) {
        throw new Error('Not a member of this team')
      }

      // Check if category is already selected by another team member
      const categoryAlreadySelected = team.members.some(
        member =>
          member.user.toString() !== userId.toString() &&
          member.selectedCategory === category,
      )

      if (categoryAlreadySelected) {
        throw new Error('Category already selected by another team member')
      }

      // Update member's selected category
      team.members[memberIndex].selectedCategory = category

      // Update last active timestamp
      team.lastActive = new Date()

      await team.save({ session })

      // Emit event
      setTimeout(() => {
        globalEmitter.emit('quickClash:memberCategoryUpdated', {
          team: team._id,
          user: userId,
          category,
        })
      }, 0)

      return team
    })
  } finally {
    session.endSession()
  }
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

      // Emit event
      setTimeout(() => {
        globalEmitter.emit('quickClash:teamMemberRemoved', {
          team: team._id,
          leader: leaderId,
          removedMember: memberId,
        })
      }, 0)

      return team
    })
  } finally {
    session.endSession()
  }
}

/**
 * Get all valid bot teams with 4 members for matchmaking
 * @returns {Promise<Array>} Bot teams
 */
const getBotTeams = async () => {
  // This is a simplified implementation - in a real app, you'd have pre-created bot teams
  // For now, we'll create some bot teams on-the-fly

  // Get bot users
  const botUsers = await User.find({
    email: { $regex: /^dummy\d+@mail\.com$/ },
  })
    .select('_id name inGameName pic quickClashTrophies')
    .limit(40)
    .lean()

  if (!botUsers || botUsers.length < 8) {
    // Need at least 8 bots to make 2 teams
    return []
  }

  // Create two teams by grouping bots
  const botTeams = []

  // Create Team 1
  const team1Members = botUsers.slice(0, 4).map(bot => ({
    user: bot._id,
    userData: bot,
    role: 'member',
    status: 'ready',
  }))

  const team1 = {
    _id: new mongoose.Types.ObjectId(),
    name: 'Bot Squad Alpha',
    creator: team1Members[0].user,
    members: team1Members,
    teamType: 'auto',
    isBot: true,
    avgTrophies: Math.round(
      team1Members.reduce(
        (acc, member) =>
          acc +
          (member.userData.quickClashTrophies || DEFAULT_STARTING_TROPHIES),
        0,
      ) / team1Members.length,
    ),
  }

  botTeams.push(team1)

  // Create Team 2
  const team2Members = botUsers.slice(4, 8).map(bot => ({
    user: bot._id,
    userData: bot,
    role: 'member',
    status: 'ready',
  }))

  const team2 = {
    _id: new mongoose.Types.ObjectId(),
    name: 'Bot Squad Beta',
    creator: team2Members[0].user,
    members: team2Members,
    teamType: 'auto',
    isBot: true,
    avgTrophies: Math.round(
      team2Members.reduce(
        (acc, member) =>
          acc +
          (member.userData.quickClashTrophies || DEFAULT_STARTING_TROPHIES),
        0,
      ) / team2Members.length,
    ),
  }

  botTeams.push(team2)

  return botTeams
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
  toggleTeamPersistence,
  addBotToTeam,
  fillTeamWithBots,
  updateMemberCategory,
  updateTeamMatchStatus,
  removeMember,
  getBotTeams,
}
