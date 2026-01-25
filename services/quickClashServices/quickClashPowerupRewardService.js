// services/quickClashServices/quickClashPowerupRewardService.js
// Handles powerup reward calculation and distribution for team battles

const mongoose = require('mongoose')
const QuickClashTeamBattle = require('../../model/quickClashSchemas/quickClashTeamBattleSchema')
const Inventory = require('../../model/inventorySchema')
const Ability = require('../../model/abilitySchema')
const { findMemberByUserId } = require('../../utils/sessionPlayerUtils')

// ============================================================================
// CONSTANTS
// ============================================================================

// Housing space rewards based on team and individual outcomes
const REWARD_HOUSING_SPACE = {
  TEAM_WIN_INDIVIDUAL_WIN: 30,
  TEAM_WIN_INDIVIDUAL_TIE: 15,
  TEAM_WIN_INDIVIDUAL_LOST: 10,
  TEAM_LOST_INDIVIDUAL_WIN: 10,
  TEAM_LOST_INDIVIDUAL_TIE: 0,
  TEAM_LOST_INDIVIDUAL_LOST: 0,
  TEAM_TIE_INDIVIDUAL_WIN: 15,
  TEAM_TIE_NOT_INDIVIDUAL_WIN: 0,
}

// Powerup definitions with rarity weights (lower = rarer)
const POWERUP_POOL = {
  TIME_WARP: {
    id: 'TIME_WARP',
    name: 'Time Warp',
    cost: 12,
    rarity: 0.15, // Rare - 15%
  },
  PRECISION_PROTOCOL: {
    id: 'PRECISION_PROTOCOL',
    name: 'Precision Protocol',
    cost: 12,
    rarity: 0.15, // Rare - 15%
  },
  SCORE_SURGE: {
    id: 'SCORE_SURGE',
    name: 'Score Surge',
    cost: 10,
    rarity: 0.25, // Uncommon - 25%
  },
  ORACLES_EYE: {
    id: 'ORACLES_EYE',
    name: "Oracle's Eye",
    cost: 8,
    rarity: 0.25, // Uncommon - 25%
  },
  STREAK_SHIELD: {
    id: 'STREAK_SHIELD',
    name: 'Streak Shield',
    cost: 5,
    rarity: 0.20, // Common - 20%
  },
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Count individual category wins and ties for a player
 * Compares player's score vs opponent in same challenge slot
 * @param {Object} battle - Team battle document
 * @param {string} userId - User ID
 * @param {string} teamKey - 'teamA' or 'teamB'
 * @returns {Object} { wins: number, ties: number }
 */
const countIndividualResults = (battle, userId, teamKey) => {
  const userIdStr = userId.toString()
  let wins = 0
  let ties = 0

  for (const challenge of battle.challenges) {
    const playerKey = teamKey === 'teamA' ? 'teamAPlayer' : 'teamBPlayer'
    const playerIdField = challenge[playerKey]

    // Check if this user played this challenge
    if (!playerIdField) continue
    const playerId = playerIdField._id?.toString() || playerIdField.toString()

    if (playerId !== userIdStr) continue

    // Compare scores - user won this category if their team's score is higher
    const userScore = teamKey === 'teamA' ? challenge.teamAScore : challenge.teamBScore
    const opponentScore = teamKey === 'teamA' ? challenge.teamBScore : challenge.teamAScore

    if (userScore > opponentScore) {
      wins++
    } else if (userScore === opponentScore) {
      ties++
    }
  }

  return { wins, ties }
}

// Backward compatibility wrapper
const countIndividualWins = (battle, userId, teamKey) => {
  const { wins } = countIndividualResults(battle, userId, teamKey)
  return wins
}

/**
 * Calculate housing space reward based on team and individual outcomes
 * Handles wins, losses, and ties for both team and individual results
 * @param {string} teamResult - 'win', 'lost', or 'tie'
 * @param {Object} individualResult - { wins: number, ties: number }
 * @returns {number} Housing space earned
 */
const calculateHousingReward = (teamResult, individualResult) => {
  const { wins: individualWins, ties: individualTies } = individualResult
  const individualWon = individualWins > 0
  const individualTied = !individualWon && individualTies > 0 // Only tie if no wins

  // Team Tie scenarios
  if (teamResult === 'tie') {
    if (individualWon) {
      return REWARD_HOUSING_SPACE.TEAM_TIE_INDIVIDUAL_WIN
    } else {
      return REWARD_HOUSING_SPACE.TEAM_TIE_NOT_INDIVIDUAL_WIN
    }
  }

  // Team Win scenarios
  if (teamResult === 'win') {
    if (individualWon) {
      return REWARD_HOUSING_SPACE.TEAM_WIN_INDIVIDUAL_WIN
    } else if (individualTied) {
      return REWARD_HOUSING_SPACE.TEAM_WIN_INDIVIDUAL_TIE
    } else {
      return REWARD_HOUSING_SPACE.TEAM_WIN_INDIVIDUAL_LOST
    }
  }

  // Team Lost scenarios
  if (teamResult === 'lost') {
    if (individualWon) {
      return REWARD_HOUSING_SPACE.TEAM_LOST_INDIVIDUAL_WIN
    } else if (individualTied) {
      return REWARD_HOUSING_SPACE.TEAM_LOST_INDIVIDUAL_TIE
    } else {
      return REWARD_HOUSING_SPACE.TEAM_LOST_INDIVIDUAL_LOST
    }
  }

  // Fallback
  return 0
}

/**
 * Select powerups using weighted random selection based on rarity
 * Better powerups (higher cost) have lower probability
 * @param {number} housingSpace - Available housing space to fill
 * @returns {Array} Array of selected powerup objects
 */
const selectPowerupsWithRarity = (housingSpace) => {
  if (housingSpace <= 0) return []

  const selected = []
  let remainingSpace = housingSpace

  // Create weighted pool
  const powerupEntries = Object.values(POWERUP_POOL)

  // Keep selecting until we can't fit any more powerups
  while (remainingSpace >= 5) { // Minimum powerup cost is 5 (Streak Shield)
    // Filter powerups that fit in remaining space
    const eligible = powerupEntries.filter(p => p.cost <= remainingSpace)
    if (eligible.length === 0) break

    // Calculate total weight for eligible powerups
    const totalWeight = eligible.reduce((sum, p) => sum + p.rarity, 0)

    // Random selection based on weights
    let random = Math.random() * totalWeight
    let selectedPowerup = null

    for (const powerup of eligible) {
      random -= powerup.rarity
      if (random <= 0) {
        selectedPowerup = powerup
        break
      }
    }

    // Fallback to last eligible if rounding issues
    if (!selectedPowerup) {
      selectedPowerup = eligible[eligible.length - 1]
    }

    selected.push({
      powerupId: selectedPowerup.id,
      cost: selectedPowerup.cost,
      awardedAt: new Date(),
    })

    remainingSpace -= selectedPowerup.cost
  }

  return selected
}

// ============================================================================
// MAIN FUNCTIONS
// ============================================================================

/**
 * Award powerups to a team member based on battle outcome
 * Called during battle completion
 * @param {Object} battle - Team battle document (mutated in place)
 * @param {string} memberId - User ID of the team member
 * @param {string} teamKey - 'teamA' or 'teamB'
 * @param {mongoose.ClientSession} session - Mongoose session
 */
const awardPowerupsToMember = async (battle, memberId, teamKey, session) => {
  const memberIdStr = memberId.toString()
  const membersKey = teamKey === 'teamA' ? 'teamAMembers' : 'teamBMembers'

  // Find the member in the battle
  const member = findMemberByUserId(battle[membersKey], memberId)

  if (!member) {
    console.error(`[POWERUP_REWARD] Member ${memberId} not found in ${teamKey}`)
    return
  }

  // Determine team result (win/lost/tie)
  let teamResult = 'lost'
  if (battle.winner === teamKey) {
    teamResult = 'win'
  } else if (battle.winner === 'tie') {
    teamResult = 'tie'
  }

  // Count individual category wins and ties
  const individualResult = countIndividualResults(battle, memberId, teamKey)

  // Calculate housing space reward
  const housingSpaceEarned = calculateHousingReward(teamResult, individualResult)

  console.log(
    `[POWERUP_REWARD] User ${memberId}: teamResult=${teamResult}, individualWins=${individualResult.wins}, individualTies=${individualResult.ties}, housing=${housingSpaceEarned}`
  )

  // Select powerups if any earned
  const powerupsAwarded = selectPowerupsWithRarity(housingSpaceEarned)

  // Update member's powerupReward
  member.powerupReward = {
    housingSpaceEarned,
    individualWins: individualResult.wins,
    powerupsAwarded,
    claimed: false,
    claimedAt: null,
    viewedAt: null,
  }

  console.log(
    `[POWERUP_REWARD] Awarded ${powerupsAwarded.length} powerups (${housingSpaceEarned} space) to user ${memberId}`
  )
}

/**
 * Claim powerup reward for a user from a completed battle
 * Adds powerups to user's inventory
 * @param {Object} params - Parameters
 * @param {string} params.battleId - Battle ID
 * @param {string} params.userId - User ID
 * @returns {Promise<Object>} Claim result with powerups added
 */
const claimPowerupReward = async ({ battleId, userId }) => {
  const session = await mongoose.startSession()

  try {
    session.startTransaction()

    const battle = await QuickClashTeamBattle.findById(battleId).session(session)
    if (!battle) {
      throw new Error('Battle not found')
    }

    if (battle.status !== 'completed') {
      throw new Error('Battle is not completed')
    }

    const userIdStr = userId.toString()

    // Find user's membership
    let member = null
    let teamKey = null

    const teamAMember = findMemberByUserId(battle.teamAMembers, userId)
    if (teamAMember) {
      member = teamAMember
      teamKey = 'teamA'
    } else {
      const teamBMember = findMemberByUserId(battle.teamBMembers, userId)
      if (teamBMember) {
        member = teamBMember
        teamKey = 'teamB'
      }
    }

    if (!member) {
      throw new Error('User is not a member of this battle')
    }

    if (!member.powerupReward) {
      throw new Error('No powerup reward available')
    }

    if (member.powerupReward.claimed) {
      throw new Error('Reward already claimed')
    }

    const powerupsToAdd = member.powerupReward.powerupsAwarded || []

    if (powerupsToAdd.length === 0) {
      // No powerups to claim, just mark as claimed
      member.powerupReward.claimed = true
      member.powerupReward.claimedAt = new Date()
      await battle.save({ session })
      await session.commitTransaction()

      return {
        success: true,
        message: 'No powerups to claim',
        powerupsAdded: [],
        housingSpaceEarned: member.powerupReward.housingSpaceEarned,
      }
    }

    // Get or create user inventory
    let inventory = await Inventory.findOne({ user: userId }).session(session)
    if (!inventory) {
      inventory = new Inventory({ user: userId, abilities: [] })
    }

    const addedPowerups = []

    // Add each powerup to inventory
    for (const powerup of powerupsToAdd) {
      const powerupDef = POWERUP_POOL[powerup.powerupId]
      if (!powerupDef) {
        console.error(`[POWERUP_REWARD] Unknown powerup: ${powerup.powerupId}`)
        continue
      }

      // Find ability in database
      const abilityDoc = await Ability.findOne({ name: powerupDef.name }).session(session)
      if (!abilityDoc) {
        console.error(`[POWERUP_REWARD] Ability not found: ${powerupDef.name}`)
        continue
      }

      // Check if user already has this ability
      const existingIndex = inventory.abilities.findIndex(
        item => item.abilityId.toString() === abilityDoc._id.toString() && !item.isUsed
      )

      if (existingIndex >= 0) {
        // Increment quantity
        inventory.abilities[existingIndex].quantity += 1
      } else {
        // Add new ability
        inventory.abilities.push({
          abilityId: abilityDoc._id,
          quantity: 1,
          isUsed: false,
          isActive: false,
          acquiredAt: new Date(),
        })
      }

      addedPowerups.push({
        powerupId: powerup.powerupId,
        name: powerupDef.name,
        cost: powerup.cost,
      })
    }

    inventory.markModified('abilities')
    inventory.lastUpdated = new Date()
    await inventory.save({ session })

    // Mark reward as claimed
    member.powerupReward.claimed = true
    member.powerupReward.claimedAt = new Date()
    await battle.save({ session })

    await session.commitTransaction()

    console.log(
      `[POWERUP_REWARD] User ${userId} claimed ${addedPowerups.length} powerups from battle ${battleId}`
    )

    return {
      success: true,
      message: 'Powerups claimed successfully',
      powerupsAdded: addedPowerups,
      housingSpaceEarned: member.powerupReward.housingSpaceEarned,
      individualWins: member.powerupReward.individualWins,
    }
  } catch (error) {
    await session.abortTransaction()
    console.error('[POWERUP_REWARD] Error claiming reward:', error)
    throw error
  } finally {
    session.endSession()
  }
}

/**
 * Get unclaimed/unviewed battles for a user
 * Used for homescreen popup
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Battles with unclaimed rewards
 */
const getUnclaimedBattles = async (userId) => {
  const userIdObj = new mongoose.Types.ObjectId(userId)

  const battles = await QuickClashTeamBattle.find({
    status: 'completed',
    $or: [
      {
        'teamAMembers': {
          $elemMatch: {
            user: userIdObj,
            'powerupReward.claimed': false,
            'powerupReward.housingSpaceEarned': { $gt: 0 },
          },
        },
      },
      {
        'teamBMembers': {
          $elemMatch: {
            user: userIdObj,
            'powerupReward.claimed': false,
            'powerupReward.housingSpaceEarned': { $gt: 0 },
          },
        },
      },
    ],
  })
    .populate('teamA', 'name')
    .populate('teamB', 'name')
    .sort({ updatedAt: -1 })
    .limit(10)
    .lean()

  // Map to include user-specific reward info
  return battles.map(battle => {
    const userIdStr = userId.toString()

    let teamKey = null
    let member = null

    const teamAMember = findMemberByUserId(battle.teamAMembers, userId)
    if (teamAMember) {
      member = teamAMember
      teamKey = 'teamA'
    } else {
      const teamBMember = findMemberByUserId(battle.teamBMembers, userId)
      if (teamBMember) {
        member = teamBMember
        teamKey = 'teamB'
      }
    }

    const isViewed = member?.powerupReward?.viewedAt != null

    return {
      _id: battle._id,
      teamA: battle.teamA,
      teamB: battle.teamB,
      winner: battle.winner,
      userTeamKey: teamKey,
      teamWon: battle.winner === teamKey,
      trophyChange: member?.trophyChange || 0,
      powerupReward: member?.powerupReward || null,
      isViewed,
      updatedAt: battle.updatedAt,
    }
  })
}

/**
 * Mark a battle as viewed by a user
 * Used when user sees the popup but doesn't claim
 * @param {Object} params - Parameters
 * @param {string} params.battleId - Battle ID
 * @param {string} params.userId - User ID
 * @returns {Promise<Object>} Update result
 */
const markBattleViewed = async ({ battleId, userId }) => {
  const userIdStr = userId.toString()
  const now = new Date()

  // Try updating teamAMembers first
  let result = await QuickClashTeamBattle.findOneAndUpdate(
    {
      _id: battleId,
      'teamAMembers.user': userId,
    },
    {
      $set: { 'teamAMembers.$.powerupReward.viewedAt': now },
    },
    { new: true }
  )

  if (!result) {
    // Try teamBMembers
    result = await QuickClashTeamBattle.findOneAndUpdate(
      {
        _id: battleId,
        'teamBMembers.user': userId,
      },
      {
        $set: { 'teamBMembers.$.powerupReward.viewedAt': now },
      },
      { new: true }
    )
  }

  if (!result) {
    throw new Error('Battle or user membership not found')
  }

  return { success: true, viewedAt: now }
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  // Constants
  REWARD_HOUSING_SPACE,
  POWERUP_POOL,

  // Functions
  countIndividualWins,
  countIndividualResults,
  calculateHousingReward,
  selectPowerupsWithRarity,
  awardPowerupsToMember,
  claimPowerupReward,
  getUnclaimedBattles,
  markBattleViewed,
}
