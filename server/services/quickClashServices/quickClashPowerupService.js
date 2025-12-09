// services/quickClashServices/quickClashPowerupService.js
const mongoose = require('mongoose')
const QuickClashTeamBattle = require('../../model/quickClashSchemas/quickClashTeamBattleSchema')
const Inventory = require('../../model/inventorySchema')
const Ability = require('../../model/abilitySchema')

// Powerup Constants
const POWERUPS = {
  TIME_WARP: {
    id: 'TIME_WARP',
    name: 'Time Warp',
    cost: 10,
    type: 'active', // Forge: Active, Quiz: Passive
    phase: 'both',
    description: 'Forge: +15s Active | Quiz: +15s Passive',
  },
  SCORE_SURGE: {
    id: 'SCORE_SURGE',
    name: 'Score Surge',
    cost: 25,
    type: 'active', // Forge: Active, Quiz: Passive
    phase: 'both',
    description: 'Forge: 2x Points Active | Quiz: 1.1x RQM Passive',
  },
  ORACLES_EYE: {
    id: 'ORACLES_EYE',
    name: "Oracle's Eye",
    cost: 20,
    type: 'active',
    phase: 'both',
    description: 'Remove 2 wrong options',
  },

  STREAK_SHIELD: {
    id: 'STREAK_SHIELD',
    name: 'Streak Shield',
    cost: 15,
    type: 'passive',
    phase: 'forge',
    description: 'Prevent streak reset on error',
  },
  PRECISION_PROTOCOL: {
    id: 'PRECISION_PROTOCOL',
    name: 'Precision Protocol',
    cost: 15,
    type: 'passive',
    phase: 'quiz',
    description: '+50 RQM if 100% Accuracy',
  },
}

const MAX_POOL_HOUSING = 150
const MAX_LOADOUT_HOUSING = 30

/**
 * Donate a powerup from user inventory to team pool
 */
const donatePowerup = async ({
  battleId,
  teamId,
  userId,
  powerupId,
  session,
}) => {
  const battle = await QuickClashTeamBattle.findById(battleId).session(session)
  if (!battle) throw new Error('Battle not found')

  // Determine which pool to use
  const isTeamA = battle.teamA.toString() === teamId.toString()
  const poolKey = isTeamA ? 'teamAPool' : 'teamBPool'
  const pool = battle[poolKey]

  // Validate Powerup
  const powerupDef = POWERUPS[powerupId]
  if (!powerupDef) throw new Error('Invalid powerup ID')

  // Check Pool Capacity
  if (pool.housingUsed + powerupDef.cost > MAX_POOL_HOUSING) {
    throw new Error('Team Pool is full!')
  }

  // Check User Donation Limit (Max 30)
  const userDonatedTotal = pool.items
    .filter(i => i.donatedBy && i.donatedBy.toString() === userId.toString())
    .reduce((sum, i) => sum + i.cost, 0)

  if (userDonatedTotal + powerupDef.cost > 30) {
    throw new Error('You can only donate up to 30 housing worth of powerups!')
  }

  // Remove from User Inventory
  const inventory = await Inventory.findOne({ user: userId }).session(session)
  if (!inventory) throw new Error('Inventory not found')

  // Find Ability Doc
  const abilityDoc = await Ability.findOne({ name: powerupDef.name }).session(session)
  if (!abilityDoc) throw new Error(`Ability ${powerupDef.name} not found in system`)

  const invItemIndex = inventory.abilities.findIndex(
      item => item.abilityId.toString() === abilityDoc._id.toString() && !item.isUsed
  )

  if (invItemIndex === -1) throw new Error('You do not have this powerup')

  // Remove 1 item
  if (inventory.abilities[invItemIndex].quantity > 1) {
      inventory.abilities[invItemIndex].quantity -= 1
  } else {
      inventory.abilities.splice(invItemIndex, 1)
  }

  // Explicitly mark as modified to ensure Mongoose tracks the change
  inventory.markModified('abilities')
  await inventory.save({ session })

  // Add to Team Pool
  pool.items.push({
    powerupId: powerupId,
    type: powerupDef.type,
    cost: powerupDef.cost,
    phase: powerupDef.phase,
    donatedBy: userId,
    donatedAt: new Date(),
  })
  pool.housingUsed += powerupDef.cost

  await battle.save({ session })
  return battle
}

/**
 * Equip a powerup from Team Pool to User Loadout
 */
const equipPowerup = async ({
  battleId,
  teamId,
  userId,
  powerupId, // The specific item ID in the pool array, OR just the type?
  // Plan says FCFS. So we should probably target a specific index or type.
  // Let's target by Type for simplicity, finding the first available.
  powerupType,
  session,
}) => {
  const battle = await QuickClashTeamBattle.findById(battleId).session(session)
  if (!battle) throw new Error('Battle not found')

  const isTeamA = battle.teamA.toString() === teamId.toString()
  const poolKey = isTeamA ? 'teamAPool' : 'teamBPool'
  const membersKey = isTeamA ? 'teamAMembers' : 'teamBMembers'

  const pool = battle[poolKey]
  const member = battle[membersKey].find(m => m.user.toString() === userId.toString())

  if (!member) throw new Error('User not in team')

  // Find item in pool
  const itemIndex = pool.items.findIndex(item => item.powerupId === powerupType)
  if (itemIndex === -1) throw new Error('Powerup not available in pool')

  const item = pool.items[itemIndex]

  // Check Loadout Capacity
  if (member.loadout.housingUsed + item.cost > MAX_LOADOUT_HOUSING) {
      throw new Error('Loadout capacity exceeded')
  }

  // Prevent duplicate passive powerups - passive powerups should only be equipped once
  const powerupDef = POWERUPS[powerupType]
  if (powerupDef && powerupDef.type === 'passive') {
    const alreadyEquipped = member.loadout.items.some(
      loadoutItem => loadoutItem.powerupId === powerupType
    )
    if (alreadyEquipped) {
      throw new Error(`You already have ${powerupDef.name} equipped. Passive powerups can only be equipped once per session.`)
    }
  }

  // Move Item: Pool -> Loadout
  pool.items.splice(itemIndex, 1)
  pool.housingUsed -= item.cost

  member.loadout.items.push({
      powerupId: item.powerupId,
      type: item.type,
      cost: item.cost,
      phase: item.phase
  })
  member.loadout.housingUsed += item.cost

  await battle.save({ session })
  return battle
}

/**
 * Unequip a powerup from User Loadout to Team Pool
 */
const unequipPowerup = async ({
    battleId,
    teamId,
    userId,
    powerupType,
    session
}) => {
    const battle = await QuickClashTeamBattle.findById(battleId).session(session)
    if (!battle) throw new Error('Battle not found')

    const isTeamA = battle.teamA.toString() === teamId.toString()
    const poolKey = isTeamA ? 'teamAPool' : 'teamBPool'
    const membersKey = isTeamA ? 'teamAMembers' : 'teamBMembers'

    const pool = battle[poolKey]
    const member = battle[membersKey].find(m => m.user.toString() === userId.toString())

    // Find item in loadout
    const itemIndex = member.loadout.items.findIndex(item => item.powerupId === powerupType)
    if (itemIndex === -1) throw new Error('Powerup not equipped')

    const item = member.loadout.items[itemIndex]

    // Check Pool Capacity (It should fit since it came from there, but good to check)
    if (pool.housingUsed + item.cost > MAX_POOL_HOUSING) {
        throw new Error('Team Pool is full (How did this happen?)')
    }

    // Move Item: Loadout -> Pool
    member.loadout.items.splice(itemIndex, 1)
    member.loadout.housingUsed -= item.cost

    pool.items.push({
        powerupId: item.powerupId,
        type: item.type,
        cost: item.cost,
        phase: item.phase,
        donatedBy: userId, // We lose original donor info here if we don't track it in loadout.
        // For now, assume the unequipper "donates" it back.
        // Or we should persist donor info in loadout.
        donatedAt: new Date()
    })
    pool.housingUsed += item.cost

    await battle.save({ session })
    return battle
}

module.exports = {
    POWERUPS,
    donatePowerup,
    equipPowerup,
    unequipPowerup
}
