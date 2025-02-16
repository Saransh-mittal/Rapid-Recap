// services/abilityService.js

const Ability = require('../model/abilitySchema')
const Inventory = require('../model/inventorySchema')

/**
 * Check active abilities for a user
 */
const checkActiveAbilities = async ({
  userId,
  type = null,
  name = null,
  session = null,
}) => {
  try {
    const query = { user: userId }
    const inventory = await Inventory.findOne(query)
      .populate({
        path: 'abilities.abilityId',
        match: {
          isActive: true,
          ...(type && { type }),
          ...(name && { name }),
        },
      })
      .session(session)

    if (!inventory) {
      return []
    }

    const activeAbilities = inventory.abilities
      .filter(
        ability =>
          ability.isActive &&
          ability.abilityId &&
          ability.expiresAt > new Date(),
      )
      .map(ability => ({
        id: ability.abilityId._id,
        name: ability.abilityId.name,
        type: ability.abilityId.type,
        multiplier: ability.abilityId.multiplier,
        duration: ability.abilityId.duration,
        expiresAt: ability.expiresAt,
        acquiredAt: ability.acquiredAt,
      }))

    return activeAbilities
  } catch (error) {
    console.error('Error checking active abilities:', error)
    throw error
  }
}

/**
 * Get available abilities from inventory
 */
const getAvailableAbilities = async ({
  userId,
  type = null,
  name = null,
  session = null,
}) => {
  try {
    const query = { user: userId }
    const inventory = await Inventory.findOne(query)
      .populate({
        path: 'abilities.abilityId',
        match: {
          ...(type && { type }),
          ...(name && { name }),
        },
      })
      .session(session)

    if (!inventory) {
      return []
    }

    const availableAbilities = inventory.abilities
      .filter(
        ability =>
          !ability.isUsed &&
          !ability.isActive &&
          ability.abilityId &&
          ability.expiresAt > new Date(),
      )
      .map(ability => ({
        id: ability.abilityId._id,
        name: ability.abilityId.name,
        type: ability.abilityId.type,
        multiplier: ability.abilityId.multiplier,
        duration: ability.abilityId.duration,
        expiresAt: ability.expiresAt,
        acquiredAt: ability.acquiredAt,
      }))

    return availableAbilities
  } catch (error) {
    console.error('Error getting available abilities:', error)
    throw error
  }
}

/**
 * Calculate total effect of active abilities
 * Uses max multiplier as base and stacks additional boosts with 0.25x increment up to 2x maximum
 */
const calculateTotalEffect = (activeAbilities, type = 'BOOST') => {
  const effects = {
    multiplier: 1,
  }

  if (!Array.isArray(activeAbilities)) {
    return effects
  }

  const typeAbilities = activeAbilities.filter(ability => ability.type === type)

  if (typeAbilities.length > 0) {
    // Find the highest multiplier from active abilities
    const baseBoost = Math.max(
      ...typeAbilities.map(ability => ability.multiplier || 1),
    )

    // Add 0.25x for each additional boost after the first
    const additionalBoosts = (typeAbilities.length - 1) * 0.25

    // Calculate total and cap at 2x
    effects.multiplier = Math.min(baseBoost + additionalBoosts, 2)
  }

  return effects
}

/**
 * Clean up expired abilities
 */
const cleanupExpiredAbilities = async (userId, session = null) => {
  try {
    const inventory = await Inventory.findOne({ user: userId }).session(session)
    if (!inventory) return

    const now = new Date()
    inventory.abilities = inventory.abilities.filter(
      ability => ability.expiresAt > now || ability.expiresAt === null,
    )

    await inventory.save({ session })
  } catch (error) {
    console.error('Error cleaning up expired abilities:', error)
    throw error
  }
}

/**
 * Create a QuinBoost ability instance
 */
const createQuinBoostAbility = async ({ expiryDate, userId, session }) => {
  try {
    const quinBoostAbility = new Ability({
      user: userId,
      name: 'QuinBoost',
      description: 'Boost your RQM score by 1.5x for one quiz attempt',
      type: 'BOOST',
      multiplier: 1.5,
      duration: null, // One-time use
      cooldown: 0,
      stackable: true,
      maxStacks: 4,
      icon: '/images/abilities/quinboost.webp',
      isActive: false,
      claimed: false,
      expiresAt: expiryDate,
    })

    await quinBoostAbility.save({ session })
    return quinBoostAbility
  } catch (error) {
    console.error('Error creating QuinBoost ability:', error)
    throw error
  }
}

const createQuizBoostAbility = async ({
  expiryDate,
  userId,
  quantity = 1,
  multiplier = 1.5,
  session,
}) => {
  try {
    const quizBoostAbility = new Ability({
      user: userId,
      name: 'QuizBoost',
      description: `Boost your RQM score by ${multiplier}x for one quiz attempt`,
      type: 'BOOST',
      multiplier: multiplier,
      duration: null, // One-time use
      cooldown: 0,
      stackable: true,
      maxStacks: 5,
      icon: '/images/abilities/quizboost.webp',
      isActive: false,
      claimed: false,
      expiresAt: expiryDate,
      quantity: quantity,
    })

    await quizBoostAbility.save({ session })
    return quizBoostAbility
  } catch (error) {
    console.error('Error creating QuizBoost ability:', error)
    throw error
  }
}

module.exports = {
  checkActiveAbilities,
  getAvailableAbilities,
  calculateTotalEffect,
  cleanupExpiredAbilities,
  createQuinBoostAbility,
  createQuizBoostAbility,
}
