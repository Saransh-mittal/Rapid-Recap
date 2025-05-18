const mongoose = require('mongoose')
const QuickClashTeamMatchmaking = require('../model/quickClashSchemas/quickClashTeamMatchmakingSchema')
const QuickClashTeam = require('../model/quickClashSchemas/quickClashTeamSchema')
const QuickClashGlobalMatchmaking = require('../model/quickClashSchemas/quickClashGlobalMatchmakingSchema')
const globalEmitter = require('../eventEmitter')

// Constants
const MATCHMAKING_EXPIRY = 30 * 60 * 1000 // 30 minutes
const MATCHMAKING_LOCKED_EXPIRY = 2 * 60 * 1000 // 2 minutes

/**
 * Lock teams in matchmaking to prevent leaving during battle creation
 * @param {Object} params - Parameters
 * @param {string} params.teamAId - Team A ID
 * @param {string} params.teamBId - Team B ID
 * @param {mongoose.ClientSession} [params.session] - Optional mongoose session
 * @returns {Promise<Object>} Result containing team member IDs
 */
const lockTeamsInMatchmaking = async ({
  teamAId,
  teamBId,
  session: providedSession,
}) => {
  const session = providedSession || (await mongoose.startSession())
  let startedTransaction = false

  try {
    if (!providedSession) {
      startedTransaction = true
      await session.startTransaction()
    }

    console.log(`Locking teams ${teamAId} and ${teamBId} in matchmaking`)

    // Lock both teams
    await Promise.all([
      QuickClashTeamMatchmaking.findOneAndUpdate(
        { team: teamAId },
        {
          status: 'creating_battle',
          lastActive: new Date(),
          expiresAt: new Date(Date.now() + MATCHMAKING_LOCKED_EXPIRY),
        },
        { session },
      ),
      QuickClashTeamMatchmaking.findOneAndUpdate(
        { team: teamBId },
        {
          status: 'creating_battle',
          lastActive: new Date(),
          expiresAt: new Date(Date.now() + MATCHMAKING_LOCKED_EXPIRY),
        },
        { session },
      ),
    ])

    // Get both teams with members
    const [teamA, teamB] = await Promise.all([
      QuickClashTeam.findById(teamAId)
        .select('members name')
        .lean()
        .session(session),
      QuickClashTeam.findById(teamBId)
        .select('members name')
        .lean()
        .session(session),
    ])

    // Extract member IDs
    const teamAMemberIds =
      teamA?.members?.map(m =>
        m.user.toString ? m.user.toString() : m.user,
      ) || []

    const teamBMemberIds =
      teamB?.members?.map(m =>
        m.user.toString ? m.user.toString() : m.user,
      ) || []

    // Also lock individual players
    if (teamA && teamA.members) {
      for (const member of teamA.members) {
        const userId = member.user.toString
          ? member.user.toString()
          : member.user

        await QuickClashGlobalMatchmaking.findOneAndUpdate(
          { user: userId },
          {
            status: 'creating_battle',
            lastActive: new Date(),
            expiresAt: new Date(Date.now() + MATCHMAKING_LOCKED_EXPIRY),
          },
          { session },
        )
      }
    }

    if (teamB && teamB.members) {
      for (const member of teamB.members) {
        const userId = member.user.toString
          ? member.user.toString()
          : member.user

        await QuickClashGlobalMatchmaking.findOneAndUpdate(
          { user: userId },
          {
            status: 'creating_battle',
            lastActive: new Date(),
            expiresAt: new Date(Date.now() + MATCHMAKING_LOCKED_EXPIRY),
          },
          { session },
        )
      }
    }

    if (startedTransaction) {
      await session.commitTransaction()
    }

    // Emit socket events to notify users directly
    setTimeout(() => {
      globalEmitter.emit('quickClash:matchmakingLocked', {
        teamA: teamAId,
        teamB: teamBId,
        teamAName: teamA?.name || 'Team A',
        teamBName: teamB?.name || 'Team B',
        teamAMembers: teamAMemberIds,
        teamBMembers: teamBMemberIds,
        allMembers: [...teamAMemberIds, ...teamBMemberIds],
        status: 'creating_battle',
      })
    }, 0)

    console.log(
      `Successfully locked teams ${teamAId} and ${teamBId} in matchmaking`,
    )

    // Return member IDs for future use
    return {
      teamAMemberIds,
      teamBMemberIds,
      allMemberIds: [...teamAMemberIds, ...teamBMemberIds],
    }
  } catch (error) {
    if (startedTransaction) {
      await session.abortTransaction()
    }
    console.error('Error locking teams in matchmaking:', error)
    throw error
  } finally {
    if (!providedSession) {
      session.endSession()
    }
  }
}

/**
 * Unlock teams in matchmaking after battle creation fails
 * @param {Object} params - Parameters
 * @param {string} params.teamAId - Team A ID
 * @param {string} params.teamBId - Team B ID
 * @param {Array} [params.teamAMembers] - Team A member IDs (optional)
 * @param {Array} [params.teamBMembers] - Team B member IDs (optional)
 * @param {Array} [params.allMembers] - All member IDs (optional)
 * @param {mongoose.ClientSession} [params.session] - Optional mongoose session
 * @returns {Promise<void>}
 */
const unlockTeamsInMatchmaking = async ({
  teamAId,
  teamBId,
  teamAMembers = [],
  teamBMembers = [],
  allMembers = [],
  session: providedSession,
}) => {
  const session = providedSession || (await mongoose.startSession())
  let startedTransaction = false

  try {
    if (!providedSession) {
      startedTransaction = true
      await session.startTransaction()
    }

    console.log(`Unlocking teams ${teamAId} and ${teamBId} from matchmaking`)

    // Reset team status back to matching (they were matched before locking)
    await Promise.all([
      QuickClashTeamMatchmaking.findOneAndUpdate(
        { team: teamAId },
        {
          status: 'matching',
          lastActive: new Date(),
          expiresAt: new Date(Date.now() + MATCHMAKING_EXPIRY),
        },
        { session },
      ),
      QuickClashTeamMatchmaking.findOneAndUpdate(
        { team: teamBId },
        {
          status: 'matching',
          lastActive: new Date(),
          expiresAt: new Date(Date.now() + MATCHMAKING_EXPIRY),
        },
        { session },
      ),
    ])

    // If member IDs are provided, use them directly
    const memberIdsToProcess = allMembers.length > 0 ? allMembers : []

    // If no direct members provided, query the database
    if (memberIdsToProcess.length === 0) {
      // Also unlock individual players
      const [teamA, teamB] = await Promise.all([
        QuickClashTeam.findById(teamAId).select('members').session(session),
        QuickClashTeam.findById(teamBId).select('members').session(session),
      ])

      if (teamA && teamA.members) {
        for (const member of teamA.members) {
          const userId = member.user._id || member.user
          memberIdsToProcess.push(userId.toString())

          await QuickClashGlobalMatchmaking.findOneAndUpdate(
            { user: userId },
            {
              status: 'matched',
              lastActive: new Date(),
              expiresAt: new Date(Date.now() + MATCHMAKING_EXPIRY),
            },
            { session },
          )
        }
      }

      if (teamB && teamB.members) {
        for (const member of teamB.members) {
          const userId = member.user._id || member.user
          memberIdsToProcess.push(userId.toString())

          await QuickClashGlobalMatchmaking.findOneAndUpdate(
            { user: userId },
            {
              status: 'matched',
              lastActive: new Date(),
              expiresAt: new Date(Date.now() + MATCHMAKING_EXPIRY),
            },
            { session },
          )
        }
      }
    } else {
      // Use the provided member IDs
      for (const userId of memberIdsToProcess) {
        await QuickClashGlobalMatchmaking.findOneAndUpdate(
          { user: userId },
          {
            status: 'matched',
            lastActive: new Date(),
            expiresAt: new Date(Date.now() + MATCHMAKING_EXPIRY),
          },
          { session },
        )
      }
    }

    if (startedTransaction) {
      await session.commitTransaction()
    }

    // For use with direct member notification
    const finalTeamAMembers =
      teamAMembers.length > 0
        ? teamAMembers
        : memberIdsToProcess.slice(0, memberIdsToProcess.length / 2)

    const finalTeamBMembers =
      teamBMembers.length > 0
        ? teamBMembers
        : memberIdsToProcess.slice(memberIdsToProcess.length / 2)

    // Emit socket events to notify users directly
    setTimeout(() => {
      globalEmitter.emit('quickClash:matchmakingUnlocked', {
        teamA: teamAId,
        teamB: teamBId,
        teamAMembers: finalTeamAMembers,
        teamBMembers: finalTeamBMembers,
        allMembers: [...finalTeamAMembers, ...finalTeamBMembers],
        status: 'matching',
      })
    }, 0)

    console.log(
      `Successfully unlocked teams ${teamAId} and ${teamBId} from matchmaking`,
    )
  } catch (error) {
    if (startedTransaction) {
      await session.abortTransaction()
    }
    console.error('Error unlocking teams in matchmaking:', error)
    throw error
  } finally {
    if (!providedSession) {
      session.endSession()
    }
  }
}

module.exports = {
  lockTeamsInMatchmaking,
  unlockTeamsInMatchmaking,
}
