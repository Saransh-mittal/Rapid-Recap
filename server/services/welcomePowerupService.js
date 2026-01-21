// services/welcomePowerupService.js
// Service to grant welcome powerups (TIME_WARP + ORACLES_EYE) to new users

const Inventory = require('../model/inventorySchema')
const Ability = require('../model/abilitySchema')
const User = require('../model/userSchema')
const mongoose = require('mongoose')

// Powerup definitions matching quickClashPowerupService.js
const WELCOME_POWERUPS = {
  TIME_WARP: {
    name: 'Time Warp',
    type: 'POWER_UP',
    description: 'Forge: +15s Active | Quiz: +15s Passive',
  },
  ORACLES_EYE: {
    name: "Oracle's Eye",
    type: 'POWER_UP',
    description: 'Remove 2 wrong options',
  },
}

/**
 * Ensure ability template exists in database
 * @param {Object} powerupDef - Powerup definition object
 * @returns {Promise<Object>} - Ability document
 */
const ensureAbilityTemplate = async (powerupDef) => {
  let ability = await Ability.findOne({ name: powerupDef.name, user: null })

  if (!ability) {
    console.log(`[WelcomePowerups] Creating template for ${powerupDef.name}...`)
    ability = await Ability.create({
      name: powerupDef.name,
      description: powerupDef.description,
      type: powerupDef.type,
      user: null, // Template ability (no specific user)
      icon: null,
    })
  }

  return ability
}

/**
 * Add powerup to user's inventory
 * @param {string} userId - User ObjectId
 * @param {string} abilityId - Ability ObjectId
 * @param {number} quantity - Quantity to add
 * @param {mongoose.ClientSession} [session] - Optional MongoDB session for transactions
 */
const addToInventory = async (userId, abilityId, quantity = 1, session = null) => {
  const queryOptions = session ? { session } : {}

  let inventory = await Inventory.findOne({ user: userId }, null, queryOptions)

  if (!inventory) {
    console.log(`[WelcomePowerups] Creating new inventory for user ${userId}`)
    inventory = await Inventory.create([{ user: userId, abilities: [] }], queryOptions)
    inventory = inventory[0] // create returns array when using session
  }

  // Check if user already has this ability
  const existingItemIndex = inventory.abilities.findIndex(
    item => item.abilityId.toString() === abilityId.toString()
  )

  if (existingItemIndex > -1) {
    // Update quantity
    inventory.abilities[existingItemIndex].quantity += quantity
  } else {
    // Add new item
    inventory.abilities.push({
      abilityId: abilityId,
      quantity: quantity,
      acquiredAt: new Date(),
    })
  }

  inventory.markModified('abilities')
  inventory.lastUpdated = new Date()
  await inventory.save(queryOptions)

  return inventory
}

/**
 * Grant welcome powerups (TIME_WARP + ORACLES_EYE) to a new user
 * This is called after successful Google login/conversion for new users
 *
 * @param {string} userId - User ObjectId
 * @param {mongoose.ClientSession} [session] - Optional MongoDB session for transactions
 * @returns {Promise<{success: boolean, powerups: string[], error?: string}>}
 */
const grantWelcomePowerups = async (userId, session = null) => {
  try {
    const queryOptions = session ? { session } : {}

    // Check if user already received welcome powerups
    const user = await User.findById(userId, null, queryOptions)
    if (!user) {
      console.error(`[WelcomePowerups] User not found: ${userId}`)
      return { success: false, error: 'User not found', powerups: [] }
    }

    if (user.receivedWelcomePowerups) {
      console.log(`[WelcomePowerups] User ${userId} already received welcome powerups, skipping`)
      return { success: false, error: 'Already received', powerups: [] }
    }

    const grantedPowerups = []

    // Grant each welcome powerup
    for (const [key, powerupDef] of Object.entries(WELCOME_POWERUPS)) {
      try {
        // Ensure ability template exists
        const abilityDoc = await ensureAbilityTemplate(powerupDef)

        // Add to user's inventory
        await addToInventory(userId, abilityDoc._id, 1, session)

        grantedPowerups.push(key)
        console.log(`[WelcomePowerups] Granted ${key} to user ${userId}`)
      } catch (err) {
        console.error(`[WelcomePowerups] Failed to grant ${key} to user ${userId}:`, err.message)
        // Continue with other powerups even if one fails
      }
    }

    // Mark user as having received welcome powerups
    if (grantedPowerups.length > 0) {
      user.receivedWelcomePowerups = true
      await user.save(queryOptions)
      console.log(`[WelcomePowerups] Successfully granted ${grantedPowerups.length} powerups to user ${userId}`)
    }

    return {
      success: grantedPowerups.length > 0,
      powerups: grantedPowerups,
    }
  } catch (error) {
    console.error(`[WelcomePowerups] Error granting welcome powerups to user ${userId}:`, error)
    return {
      success: false,
      error: error.message,
      powerups: [],
    }
  }
}

module.exports = {
  grantWelcomePowerups,
  addToInventory,
  ensureAbilityTemplate,
  WELCOME_POWERUPS,
}
