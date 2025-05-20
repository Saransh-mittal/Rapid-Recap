const mongoose = require('mongoose')
const QuickClashTeamMatchmaking = require('../model/quickClashSchemas/quickClashTeamMatchmakingSchema')
const QuickClashTeam = require('../model/quickClashSchemas/quickClashTeamSchema')
const QuickClashGlobalMatchmaking = require('../model/quickClashSchemas/quickClashGlobalMatchmakingSchema')
const globalEmitter = require('../eventEmitter')
const User = require('../model/userSchema')
const QuickClashTeamTrophyHistory = require('../model/quickClashSchemas/quickClashTeamTrophyHistorySchema')

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

/**
 * Calculate and apply final trophies for the battle
 * @param {Object} battle - Team battle document
 * @param {mongoose.ClientSession} session - Mongoose session
 * @returns {Promise<void>}
 */
const calculateFinalTrophies = async (battle, session) => {
  // Base amount already set during battle creation
  const baseAmount = battle.trophyExchange.adjustedAmount

  // Apply bonuses if Team A won
  let finalAmount = baseAmount
  const bonuses = battle.trophyExchange.bonuses

  // First daily bonus (already set during creation)
  if (bonuses.firstDaily.applied) {
    finalAmount += bonuses.firstDaily.amount
  }

  // Stronger team bonus (+20% if winning against team with 200+ more trophies)
  let teamAAvgTrophies = 0
  let teamBAvgTrophies = 0

  // Calculate current average trophies
  const teamAMemberCount = battle.teamAMembers.length
  teamAAvgTrophies =
    battle.teamAMembers.reduce((sum, m) => sum + m.previousTrophies, 0) /
    teamAMemberCount

  const teamBMemberCount = battle.teamBMembers.length
  teamBAvgTrophies =
    battle.teamBMembers.reduce((sum, m) => sum + m.previousTrophies, 0) /
    teamBMemberCount

  const teamAIsWeaker = teamAAvgTrophies + 200 <= teamBAvgTrophies

  if (battle.winner === 'teamA' && teamAIsWeaker) {
    const strongerTeamBonus = Math.round(baseAmount * 0.2)
    bonuses.strongerTeam.applied = true
    bonuses.strongerTeam.amount = strongerTeamBonus
    finalAmount += strongerTeamBonus
  }

  // Comeback win bonus (+10%)
  if (battle.isComeback && battle.winner === 'teamA') {
    const comebackBonus = Math.round(baseAmount * 0.1)
    bonuses.comebackWin.applied = true
    bonuses.comebackWin.amount = comebackBonus
    finalAmount += comebackBonus
  }

  // All wins bonus (+15%)
  if (battle.allMatchesWon && battle.winner === 'teamA') {
    const allWinsBonus = Math.round(baseAmount * 0.15)
    bonuses.allWins.applied = true
    bonuses.allWins.amount = allWinsBonus
    finalAmount += allWinsBonus
  }

  // Update trophy exchange data
  battle.trophyExchange.finalAmount = finalAmount

  // Calculate per-player amounts
  let winnerTeamTrophies = 0
  let loserTeamTrophies = 0

  if (battle.winner === 'teamA') {
    // Team A won
    winnerTeamTrophies = Math.round(finalAmount * 1.25)
    loserTeamTrophies = Math.round(finalAmount * 0.75)

    // Per player amount
    const winnerPerPlayer = Math.round(winnerTeamTrophies / teamAMemberCount)
    const loserPerPlayer = Math.round(loserTeamTrophies / teamBMemberCount)

    // Update team A members (winners)
    for (const member of battle.teamAMembers) {
      member.trophyChange = winnerPerPlayer
      member.newTrophies = member.previousTrophies + winnerPerPlayer

      // Update user trophies in database
      await User.findByIdAndUpdate(
        member.user,
        { $inc: { quickClashTrophies: winnerPerPlayer } },
        { session },
      )

      // Create trophy history entry
      await new QuickClashTeamTrophyHistory({
        user: member.user,
        team: battle.teamA,
        teamBattle: battle._id,
        trophiesChange: winnerPerPlayer,
        trophiesAfter: member.newTrophies,
        opponentTeam: battle.teamB,
        opponentTeamAvgTrophies: teamBAvgTrophies,
        result: 'win',
        bonusesApplied: {
          firstDaily: bonuses.firstDaily.applied,
          strongerTeam: bonuses.strongerTeam.applied,
          comebackWin: bonuses.comebackWin.applied,
          allWins: bonuses.allWins.applied,
        },
        userParticipated: member.participated,
        userCompleted: member.completed,
        userScore: member.score,
      }).save({ session })
    }

    // Update team B members (losers)
    for (const member of battle.teamBMembers) {
      member.trophyChange = -loserPerPlayer
      member.newTrophies = Math.max(0, member.previousTrophies - loserPerPlayer)

      // Calculate actual trophy change (in case of floor protection)
      const actualChange = member.newTrophies - member.previousTrophies

      // Update user trophies in database
      await User.findByIdAndUpdate(
        member.user,
        { $set: { quickClashTrophies: member.newTrophies } },
        { session },
      )

      // Create trophy history entry
      await new QuickClashTeamTrophyHistory({
        user: member.user,
        team: battle.teamB,
        teamBattle: battle._id,
        trophiesChange: actualChange,
        trophiesAfter: member.newTrophies,
        opponentTeam: battle.teamA,
        opponentTeamAvgTrophies: teamAAvgTrophies,
        result: 'loss',
        bonusesApplied: {
          firstDaily: false,
          strongerTeam: false,
          comebackWin: false,
          allWins: false,
        },
        userParticipated: member.participated,
        userCompleted: member.completed,
        userScore: member.score,
      }).save({ session })
    }
  } else if (battle.winner === 'teamB') {
    // Team B won
    winnerTeamTrophies = Math.round(finalAmount * 1.25)
    loserTeamTrophies = Math.round(finalAmount * 0.75)

    // Per player amount
    const winnerPerPlayer = Math.round(winnerTeamTrophies / teamBMemberCount)
    const loserPerPlayer = Math.round(loserTeamTrophies / teamAMemberCount)

    // Update team B members (winners)
    for (const member of battle.teamBMembers) {
      member.trophyChange = winnerPerPlayer
      member.newTrophies = member.previousTrophies + winnerPerPlayer

      // Update user trophies in database
      await User.findByIdAndUpdate(
        member.user,
        { $inc: { quickClashTrophies: winnerPerPlayer } },
        { session },
      )

      // Create trophy history entry
      await new QuickClashTeamTrophyHistory({
        user: member.user,
        team: battle.teamB,
        teamBattle: battle._id,
        trophiesChange: winnerPerPlayer,
        trophiesAfter: member.newTrophies,
        opponentTeam: battle.teamA,
        opponentTeamAvgTrophies: teamAAvgTrophies,
        result: 'win',
        bonusesApplied: {
          firstDaily: false, // Bonuses only apply to team A
          strongerTeam: false,
          comebackWin: false,
          allWins: false,
        },
        userParticipated: member.participated,
        userCompleted: member.completed,
        userScore: member.score,
      }).save({ session })
    }

    // Update team A members (losers)
    for (const member of battle.teamAMembers) {
      member.trophyChange = -loserPerPlayer
      member.newTrophies = Math.max(0, member.previousTrophies - loserPerPlayer)

      // Calculate actual trophy change (in case of floor protection)
      const actualChange = member.newTrophies - member.previousTrophies

      // Update user trophies in database
      await User.findByIdAndUpdate(
        member.user,
        { $set: { quickClashTrophies: member.newTrophies } },
        { session },
      )

      // Create trophy history entry
      await new QuickClashTeamTrophyHistory({
        user: member.user,
        team: battle.teamA,
        teamBattle: battle._id,
        trophiesChange: actualChange,
        trophiesAfter: member.newTrophies,
        opponentTeam: battle.teamB,
        opponentTeamAvgTrophies: teamBAvgTrophies,
        result: 'loss',
        bonusesApplied: {
          firstDaily: bonuses.firstDaily.applied,
          strongerTeam: false,
          comebackWin: false,
          allWins: false,
        },
        userParticipated: member.participated,
        userCompleted: member.completed,
        userScore: member.score,
      }).save({ session })
    }
  } else {
    // Tie - distribute trophies evenly
    // For ties, we give a small amount to both teams
    const tieAmount = Math.round(finalAmount * 0.1)

    // Update team A members
    for (const member of battle.teamAMembers) {
      member.trophyChange = tieAmount
      member.newTrophies = member.previousTrophies + tieAmount

      // Update user trophies in database
      await User.findByIdAndUpdate(
        member.user,
        { $inc: { quickClashTrophies: tieAmount } },
        { session },
      )

      // Create trophy history entry
      await new QuickClashTeamTrophyHistory({
        user: member.user,
        team: battle.teamA,
        teamBattle: battle._id,
        trophiesChange: tieAmount,
        trophiesAfter: member.newTrophies,
        opponentTeam: battle.teamB,
        opponentTeamAvgTrophies: teamBAvgTrophies,
        result: 'tie',
        bonusesApplied: {
          firstDaily: bonuses.firstDaily.applied,
          strongerTeam: false,
          comebackWin: false,
          allWins: false,
        },
        userParticipated: member.participated,
        userCompleted: member.completed,
        userScore: member.score,
      }).save({ session })
    }

    // Update team B members
    for (const member of battle.teamBMembers) {
      member.trophyChange = tieAmount
      member.newTrophies = member.previousTrophies + tieAmount

      // Update user trophies in database
      await User.findByIdAndUpdate(
        member.user,
        { $inc: { quickClashTrophies: tieAmount } },
        { session },
      )

      // Create trophy history entry
      await new QuickClashTeamTrophyHistory({
        user: member.user,
        team: battle.teamB,
        teamBattle: battle._id,
        trophiesChange: tieAmount,
        trophiesAfter: member.newTrophies,
        opponentTeam: battle.teamA,
        opponentTeamAvgTrophies: teamAAvgTrophies,
        result: 'tie',
        bonusesApplied: {
          firstDaily: false,
          strongerTeam: false,
          comebackWin: false,
          allWins: false,
        },
        userParticipated: member.participated,
        userCompleted: member.completed,
        userScore: member.score,
      }).save({ session })
    }
  }
}
module.exports = {
  lockTeamsInMatchmaking,
  unlockTeamsInMatchmaking,
  calculateFinalTrophies,
}
