const mongoose = require('mongoose')
const QuickClashTeamMatchmaking = require('../model/quickClashSchemas/quickClashTeamMatchmakingSchema')
const QuickClashTeam = require('../model/quickClashSchemas/quickClashTeamSchema')
const QuickClashGlobalMatchmaking = require('../model/quickClashSchemas/quickClashGlobalMatchmakingSchema')
const globalEmitter = require('../eventEmitter')
const User = require('../model/userSchema')
const SessionPlayer = require('../model/quickClashSchemas/playSessionSchema')
const QuickClashTeamTrophyHistory = require('../model/quickClashSchemas/quickClashTeamTrophyHistorySchema')
const {
  notifyTeamBattleCompleted,
} = require('../services/quickClashServices/quickClashNotificationService')
const {
  awardPowerupsToMember,
} = require('../services/quickClashServices/quickClashPowerupRewardService')


// Constants
const MATCHMAKING_EXPIRY = 30 * 60 * 1000 // 30 minutes
const MATCHMAKING_LOCKED_EXPIRY = 2 * 60 * 1000 // 2 minutes

/**
 * Helper to get member ID for both user and session player members
 * @param {Object} member - Team member object
 * @returns {string|null} Member ID as string or null if not found
 */
const getMemberId = (member) => {
  if (!member) return null
  if (member.user) {
    return member.user._id ? member.user._id.toString() : member.user.toString()
  }
  if (member.sessionPlayer) {
    return member.sessionPlayer._id
      ? member.sessionPlayer._id.toString()
      : member.sessionPlayer.toString()
  }
  return null
}

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

    // Extract member IDs - handle both users and session players
    const teamAMemberIds =
      teamA?.members?.map(m => getMemberId(m)).filter(Boolean) || []

    const teamBMemberIds =
      teamB?.members?.map(m => getMemberId(m)).filter(Boolean) || []

    // Also lock individual players (only for users, not session players)
    if (teamA && teamA.members) {
      for (const member of teamA.members) {
        if (!member.user) continue // Skip session players
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
        if (!member.user) continue // Skip session players
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
          if (!member.user) continue // Skip session players
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
          if (!member.user) continue // Skip session players
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
  // Use the base adjusted amount (no bonuses applied)
  const finalAmount = battle.trophyExchange.adjustedAmount

  // Calculate current average trophies for record keeping
  const teamAMemberCount = battle.teamAMembers.length
  const teamAAvgTrophies =
    battle.teamAMembers.reduce((sum, m) => sum + m.previousTrophies, 0) /
    teamAMemberCount

  const teamBMemberCount = battle.teamBMembers.length
  const teamBAvgTrophies =
    battle.teamBMembers.reduce((sum, m) => sum + m.previousTrophies, 0) /
    teamBMemberCount

  // Apply stronger team bonus only (if applicable)
  let adjustedFinalAmount = finalAmount
  const bonuses = battle.trophyExchange.bonuses

  // Stronger team bonus (+20% if weaker team wins against team with 200+ more trophies)
  const teamAIsWeaker = teamAAvgTrophies + 200 <= teamBAvgTrophies
  if (battle.winner === 'teamA' && teamAIsWeaker) {
    const strongerTeamBonus = Math.round(finalAmount * 0.2)
    bonuses.strongerTeam.applied = true
    bonuses.strongerTeam.amount = strongerTeamBonus
    adjustedFinalAmount += strongerTeamBonus
  }

  // All wins bonus (+15% if team wins all challenges)
  if (battle.allMatchesWon && battle.winner === 'teamA') {
    const allWinsBonus = Math.round(finalAmount * 0.15)
    bonuses.allWins.applied = true
    bonuses.allWins.amount = allWinsBonus
    adjustedFinalAmount += allWinsBonus
  }

  // Update trophy exchange data
  battle.trophyExchange.finalAmount = adjustedFinalAmount

  // Calculate per-player amounts (NO MULTIPLIERS)
  const perPlayerAmount = Math.round(adjustedFinalAmount / 4) // Divide by 4 players per team

  /**
   * Helper to check if member is a session player
   */
  const isSessionPlayer = (member) => {
    return !member.user && member.sessionPlayer
  }

  /**
   * Helper to get member identifier (user ID or session player ID)
   */
  const getMemberIdentifier = (member) => {
    if (member.user) {
      return member.user._id || member.user
    }
    if (member.sessionPlayer) {
      return member.sessionPlayer._id || member.sessionPlayer
    }
    return null
  }

  /**
   * Update trophies for a winning member (user or session player)
   */
  const processWinningMember = async (member, teamId, opponentTeamId, opponentAvgTrophies, bonusesApplied) => {
    member.trophyChange = perPlayerAmount
    member.newTrophies = member.previousTrophies + perPlayerAmount

    if (isSessionPlayer(member)) {
      // Session player - update SessionPlayer model
      const sessionPlayerId = getMemberIdentifier(member)
      await SessionPlayer.findByIdAndUpdate(
        sessionPlayerId,
        { $inc: { trophies: perPlayerAmount } },
        { session }
      )

      // Create trophy history entry for session player
      await new QuickClashTeamTrophyHistory({
        sessionPlayer: sessionPlayerId,
        team: teamId,
        teamBattle: battle._id,
        trophiesChange: perPlayerAmount,
        trophiesAfter: member.newTrophies,
        opponentTeam: opponentTeamId,
        opponentTeamAvgTrophies: opponentAvgTrophies,
        result: 'win',
        bonusesApplied: bonusesApplied,
        userParticipated: member.participated,
        userCompleted: member.completed,
        userScore: member.score,
      }).save({ session })
    } else {
      // Regular user - update User model
      const currentUser = await User.findById(member.user)
        .select('quickClashStats')
        .session(session)
        .lean()

      const currentPeak = currentUser?.quickClashStats?.peakTrophies || member.previousTrophies

      // Update user trophies in database
      const updateObj = { $inc: { quickClashTrophies: perPlayerAmount } }

      // Update peakTrophies if new trophies exceed current peak
      if (member.newTrophies > currentPeak) {
        updateObj.$set = { 'quickClashStats.peakTrophies': member.newTrophies }
      }

      await User.findByIdAndUpdate(member.user, updateObj, { session })

      // Create trophy history entry for user
      await new QuickClashTeamTrophyHistory({
        user: member.user,
        team: teamId,
        teamBattle: battle._id,
        trophiesChange: perPlayerAmount,
        trophiesAfter: member.newTrophies,
        opponentTeam: opponentTeamId,
        opponentTeamAvgTrophies: opponentAvgTrophies,
        result: 'win',
        bonusesApplied: bonusesApplied,
        userParticipated: member.participated,
        userCompleted: member.completed,
        userScore: member.score,
      }).save({ session })
    }
  }

  /**
   * Update trophies for a losing member (user or session player)
   */
  const processLosingMember = async (member, teamId, opponentTeamId, opponentAvgTrophies, bonusesApplied) => {
    member.trophyChange = -perPlayerAmount
    member.newTrophies = Math.max(0, member.previousTrophies - perPlayerAmount)

    // Calculate actual trophy change (in case of floor protection)
    const actualChange = member.newTrophies - member.previousTrophies

    if (isSessionPlayer(member)) {
      // Session player - update SessionPlayer model
      const sessionPlayerId = getMemberIdentifier(member)
      await SessionPlayer.findByIdAndUpdate(
        sessionPlayerId,
        { $set: { trophies: member.newTrophies } },
        { session }
      )

      // Create trophy history entry for session player
      await new QuickClashTeamTrophyHistory({
        sessionPlayer: sessionPlayerId,
        team: teamId,
        teamBattle: battle._id,
        trophiesChange: actualChange,
        trophiesAfter: member.newTrophies,
        opponentTeam: opponentTeamId,
        opponentTeamAvgTrophies: opponentAvgTrophies,
        result: 'loss',
        bonusesApplied: bonusesApplied,
        userParticipated: member.participated,
        userCompleted: member.completed,
        userScore: member.score,
      }).save({ session })
    } else {
      // Regular user - update User model
      await User.findByIdAndUpdate(
        member.user,
        { $set: { quickClashTrophies: member.newTrophies } },
        { session }
      )

      // Create trophy history entry for user
      await new QuickClashTeamTrophyHistory({
        user: member.user,
        team: teamId,
        teamBattle: battle._id,
        trophiesChange: actualChange,
        trophiesAfter: member.newTrophies,
        opponentTeam: opponentTeamId,
        opponentTeamAvgTrophies: opponentAvgTrophies,
        result: 'loss',
        bonusesApplied: bonusesApplied,
        userParticipated: member.participated,
        userCompleted: member.completed,
        userScore: member.score,
      }).save({ session })
    }
  }

  /**
   * Create tie trophy history for a member (no trophy change)
   */
  const processTieMember = async (member, teamId, opponentTeamId, opponentAvgTrophies, bonusesApplied) => {
    member.trophyChange = 0
    member.newTrophies = member.previousTrophies

    if (isSessionPlayer(member)) {
      // Session player
      const sessionPlayerId = getMemberIdentifier(member)
      await new QuickClashTeamTrophyHistory({
        sessionPlayer: sessionPlayerId,
        team: teamId,
        teamBattle: battle._id,
        trophiesChange: 0,
        trophiesAfter: member.newTrophies,
        opponentTeam: opponentTeamId,
        opponentTeamAvgTrophies: opponentAvgTrophies,
        result: 'tie',
        bonusesApplied: bonusesApplied,
        userParticipated: member.participated,
        userCompleted: member.completed,
        userScore: member.score,
      }).save({ session })
    } else {
      // Regular user
      await new QuickClashTeamTrophyHistory({
        user: member.user,
        team: teamId,
        teamBattle: battle._id,
        trophiesChange: 0,
        trophiesAfter: member.newTrophies,
        opponentTeam: opponentTeamId,
        opponentTeamAvgTrophies: opponentAvgTrophies,
        result: 'tie',
        bonusesApplied: bonusesApplied,
        userParticipated: member.participated,
        userCompleted: member.completed,
        userScore: member.score,
      }).save({ session })
    }
  }

  if (battle.winner === 'teamA') {
    // Team A won - they gain trophies, Team B loses trophies

    // Update team A members (winners)
    for (const member of battle.teamAMembers) {
      await processWinningMember(
        member,
        battle.teamA,
        battle.teamB,
        teamBAvgTrophies,
        { strongerTeam: bonuses.strongerTeam.applied, allWins: bonuses.allWins.applied }
      )
    }

    // Update team B members (losers)
    for (const member of battle.teamBMembers) {
      await processLosingMember(
        member,
        battle.teamB,
        battle.teamA,
        teamAAvgTrophies,
        { strongerTeam: false, allWins: false }
      )
    }
  } else if (battle.winner === 'teamB') {
    // Team B won - they gain trophies, Team A loses trophies

    // Update team B members (winners)
    for (const member of battle.teamBMembers) {
      await processWinningMember(
        member,
        battle.teamB,
        battle.teamA,
        teamAAvgTrophies,
        { strongerTeam: false, allWins: false }
      )
    }

    // Update team A members (losers)
    for (const member of battle.teamAMembers) {
      await processLosingMember(
        member,
        battle.teamA,
        battle.teamB,
        teamBAvgTrophies,
        { strongerTeam: bonuses.strongerTeam.applied, allWins: bonuses.allWins.applied }
      )
    }
  } else {
    // Tie - no trophies awarded (as per previous change)

    // Update team A members - no trophy change
    for (const member of battle.teamAMembers) {
      await processTieMember(
        member,
        battle.teamA,
        battle.teamB,
        teamBAvgTrophies,
        { strongerTeam: bonuses.strongerTeam.applied, allWins: bonuses.allWins.applied }
      )
    }

    // Update team B members - no trophy change
    for (const member of battle.teamBMembers) {
      await processTieMember(
        member,
        battle.teamB,
        battle.teamA,
        teamAAvgTrophies,
        { strongerTeam: false, allWins: false }
      )
    }
  }

  // Award powerup rewards based on team and individual performance
  // NOTE: Only authenticated users receive powerup rewards, session players are skipped
  console.log(`[POWERUP_REWARD] Awarding powerup rewards for battle ${battle._id}`)
  try {
    for (const member of battle.teamAMembers) {
      // Skip session players - they don't get powerup rewards
      if (isSessionPlayer(member)) {
        console.log(`[POWERUP_REWARD] Skipping session player in teamA - powerups only for registered users`)
        continue
      }
      const memberId = getMemberIdentifier(member)
      if (memberId) {
        await awardPowerupsToMember(battle, memberId, 'teamA', session)
      }
    }
    for (const member of battle.teamBMembers) {
      // Skip session players - they don't get powerup rewards
      if (isSessionPlayer(member)) {
        console.log(`[POWERUP_REWARD] Skipping session player in teamB - powerups only for registered users`)
        continue
      }
      const memberId = getMemberIdentifier(member)
      if (memberId) {
        await awardPowerupsToMember(battle, memberId, 'teamB', session)
      }
    }
    console.log(`[POWERUP_REWARD] Completed awarding powerup rewards for battle ${battle._id}`)
  } catch (rewardError) {
    // Don't fail trophy calculation if reward fails
    console.error(`[POWERUP_REWARD] Error awarding powerups for battle ${battle._id}:`, rewardError)
  }

  // NOTE: Streak updates were moved to updateBattleWithQuizResults in quickClashTeamBattleService.js
  // to provide instant feedback when user completes their quiz, instead of waiting for battle to end

  // Send battle completion notifications to all participants
  try {
    // Fetch team details from database to get team names
    const [teamADetails, teamBDetails] = await Promise.all([
      QuickClashTeam.findById(battle.teamA)
        .select('_id name')
        .lean()
        .session(session),
      QuickClashTeam.findById(battle.teamB)
        .select('_id name')
        .lean()
        .session(session),
    ])

    // Prepare team info with fallback names
    const teamAInfo = {
      _id: battle.teamA,
      name: teamADetails?.name || 'Team A',
    }

    const teamBInfo = {
      _id: battle.teamB,
      name: teamBDetails?.name || 'Team B',
    }

    console.log(
      `[TEAM_BATTLE_COMPLETED] Sending notifications for battle ${battle._id}: "${teamAInfo.name}" vs "${teamBInfo.name}"`,
    )

    const notificationsSent = await notifyTeamBattleCompleted({
      battle,
      teamAMembers: battle.teamAMembers,
      teamBMembers: battle.teamBMembers,
      teamA: teamAInfo,
      teamB: teamBInfo,
    })

    console.log(
      `[TEAM_BATTLE_COMPLETED] Sent completion notifications for battle ${
        battle._id
      } to ${notificationsSent}/${
        battle.teamAMembers.length + battle.teamBMembers.length
      } players`,
    )
  } catch (notificationError) {
    // Don't fail the trophy calculation if notifications fail
    console.error(
      `[TEAM_BATTLE_COMPLETED] Error sending completion notifications for battle ${battle._id}:`,
      notificationError,
    )
  }
}
module.exports = {
  lockTeamsInMatchmaking,
  unlockTeamsInMatchmaking,
  calculateFinalTrophies,
}
