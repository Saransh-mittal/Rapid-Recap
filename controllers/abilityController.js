// controllers/abilityController.js

const asyncHandler = require('express-async-handler')
const {
  checkActiveAbilities,
  getAvailableAbilities,
  calculateTotalEffect,
  cleanupExpiredAbilities,
  getUnClaimedAbilities,
} = require('../services/abilityService')
const Inventory = require('../model/inventorySchema')
const Ability = require('../model/abilitySchema')
const ApplicationUpdates = require('../model/applicationUpdatesSchema')
const mongoose = require('mongoose')
const { checkAbilityStatus } = require('../services/abilityCheckerService')

/**
 * Get active abilities
 */
const getActiveAbilities = asyncHandler(async (req, res) => {
  const { type, name } = req.query

  try {
    const activeAbilities = await checkActiveAbilities({
      userId: req.user._id,
      type,
      name,
    })

    const effects = calculateTotalEffect(activeAbilities, type)

    res.status(200).json({
      activeAbilities,
      effects,
    })
  } catch (error) {
    console.error('Error getting active abilities:', error)
    res.status(500).json({ error: 'Error fetching active abilities' })
  }
})

/**
 * Get available abilities in inventory
 */
const getAvailableAbilitiesController = asyncHandler(async (req, res) => {
  const { type, name } = req.query

  try {
    const availableAbilities = await getAvailableAbilities({
      userId: req.user._id,
      type,
      name,
    })

    res.status(200).json({ availableAbilities })
  } catch (error) {
    console.error('Error getting available abilities:', error)
    res.status(500).json({ error: 'Error fetching available abilities' })
  }
})

/**
 * Activate an ability
 */
const activateAbility = asyncHandler(async (req, res) => {
  const { abilityId } = req.params
  const userId = req.user._id
  let requiredError = true
  const session = await mongoose.startSession()
  try {
    await session.withTransaction(async () => {
      // Get the ability
      const ability = await Ability.findOne({
        _id: abilityId,
        isActive: false,
        $or: [{ expiresAt: { $gt: new Date() } }, { expiresAt: null }],
      }).session(session)

      if (!ability) {
        throw new Error('Ability not found or expired')
      }

      // Get user's inventory
      const inventory = await Inventory.findOne({ user: userId })
        .populate('abilities.abilityId')
        .session(session)
      if (!inventory) {
        throw new Error('Inventory not found')
      }

      // Find the ability in inventory
      const inventoryAbility = inventory.abilities.find(
        invAbility =>
          invAbility.abilityId.equals(abilityId) &&
          !invAbility.isActive &&
          (invAbility.expiresAt > new Date() || invAbility.expiresAt === null),
      )

      if (!inventoryAbility) {
        requiredError = false
        throw new Error('Ability not available in inventory')
      }
      const sameNameAbilityAlreadyActive = inventory.abilities.find(
        invAbility =>
          invAbility.isActive && invAbility.abilityId.name === ability.name,
      )

      if (sameNameAbilityAlreadyActive) {
        requiredError = false
        throw new Error(`${ability.name} ability is already active`)
      }
      // if (!ability.stackable) {
      //   requiredError = false
      //   throw new Error(`${ability.name} ability is not stackable`)
      // }

      // Activate the ability
      inventoryAbility.isActive = true
      const durationofAbility = ability.duration
      if (durationofAbility) {
        // convert minutes to date from now
        inventoryAbility.expiresAt = new Date(
          Date.now() + durationofAbility * 60000,
        )
        ability.expiresAt = inventoryAbility.expiresAt
      }
      await inventory.save({ session })
      ability.isActive = true
      await ability.save({ session })

      // Create notification
      const notification = new ApplicationUpdates({
        userId,
        title: `${ability.name} Activated!`,
        mainText: `Your ${ability.name} is now active! Effect: ${ability.description}`,
        type: 'applicationUpdate',
      })
      await notification.save({ session })

      // Get updated active abilities
      const activeAbilities = await checkActiveAbilities({
        userId,
        session,
      })
      const availableAbilities = await getAvailableAbilities({
        userId,
        session,
      })

      const boostEffects = calculateTotalEffect(activeAbilities, ability.type)

      res.status(200).json({
        message: `${ability.name} activated successfully`,
        effects: {
          boost: boostEffects,
        },
        activeAbilities,
        availableAbilities,
      })
    })
  } catch (error) {
    if (requiredError) console.error('Error activating ability:', error)
    res.status(400).json({ error: error.message || 'Error activating ability' })
  } finally {
    session.endSession()
  }
})

/**
 * @desc    Check user's abilities status
 * @route   GET /api/abilities/check
 * @access  Private
 */
const checkAbilities = asyncHandler(async (req, res) => {
  const userId = req.user._id

  try {
    // Clean up expired abilities first
    await cleanupExpiredAbilities(userId)
    // Get active and available abilities
    const [activeAbilities, availableAbilities, unclaimedAbilities] =
      await Promise.all([
        checkActiveAbilities({ userId }),
        getAvailableAbilities({ userId }),
        getUnClaimedAbilities({ userId }),
      ])

    // Calculate effects of active abilities
    const boostEffects = calculateTotalEffect(activeAbilities, 'BOOST')

    res.status(200).json({
      activeAbilities,
      availableAbilities,
      unclaimedAbilities,
      effects: {
        boost: boostEffects,
      },
    })
  } catch (error) {
    console.error('Error checking abilities:', error)
    res.status(500).json({ error: 'Error checking abilities status' })
  }
})

/**
 * @desc    Check status of a specific ability
 * @route   GET /api/abilities/check/:abilityName
 * @access  Private
 */
const checkAbility = asyncHandler(async (req, res) => {
  const { abilityName } = req.params
  const userId = req.user._id
  const session = await mongoose.startSession()
  try {
    await session.withTransaction(async () => {
      const status = await checkAbilityStatus({
        userId,
        abilityName,
        session,
      })
      res.status(200).json(status)
    })
  } catch (error) {
    console.error('Error in ability check:', error)
    res.status(400).json({
      error: error.message || 'Error checking ability status',
    })
  } finally {
    session.endSession()
  }
})

/**
 * @desc    Claim an ability and add it to user's inventory
 * @route   POST /api/abilities/claim/:abilityId
 * @access  Private
 */
const claimAbility = asyncHandler(async (req, res) => {
  const { abilityId } = req.params
  const { category } = req.body
  const userId = req.user._id
  let requiredError = true
  const session = await mongoose.startSession()

  try {
    await session.withTransaction(async () => {
      // Get the ability
      const ability = await Ability.findOne({
        _id: abilityId,
        claimed: false,
        $or: [{ expiresAt: { $gt: new Date() } }, { expiresAt: null }],
      }).session(session)

      if (!ability) {
        requiredError = false
        throw new Error('Ability not found or already claimed')
      }

      // Get user's inventory
      let inventory = await Inventory.findOne({ user: userId })
        .populate('abilities.abilityId')
        .session(session)

      if (!inventory) {
        // Create inventory if it doesn't exist
        inventory = new Inventory({
          user: userId,
          abilities: [],
        })
      }

      // Handle category boost case
      if (category) {
        // change the name of the ability to category boost
        ability.name = `${category} ${ability.name.split(' ')[1]}`
      }

      // Add ability to inventory
      inventory.abilities.push({
        abilityId: abilityId,
        isUsed: false,
        quantity: ability.quantity || 1,
        expiresAt: ability.expiresAt,
      })
      await inventory.save({ session })

      // Mark ability as claimed
      ability.claimed = true
      await ability.save({ session })

      // Create notification with appropriate message
      const notificationText = category
        ? `You've successfully claimed a Category Boost for ${category}! Your RQM scores in ${category} will be boosted by ${ability.multiplier}x.`
        : `You've successfully claimed a ${ability.name}! Effect: ${ability.description}`

      const notification = new ApplicationUpdates({
        userId,
        title: category
          ? `${category} Boost Claimed!`
          : `${ability.name} Claimed!`,
        mainText: notificationText,
        type: 'applicationUpdate',
      })
      await notification.save({ session })

      // Get updated abilities lists
      const [activeAbilities, availableAbilities] = await Promise.all([
        checkActiveAbilities({ userId, session }),
        getAvailableAbilities({ userId, session }),
      ])

      // Calculate effects
      const boostEffects = calculateTotalEffect(activeAbilities, ability.type)

      res.status(200).json({
        message: `${ability.name} claimed successfully`,
        ability: {
          id: ability._id,
          name: ability.name,
          type: ability.type,
          description: ability.description,
          expiresAt: ability.expiresAt,
        },
        effects: {
          boost: boostEffects,
        },
        activeAbilities,
        availableAbilities,
      })
    })
  } catch (error) {
    if (requiredError) console.error('Error claiming ability:', error)
    res.status(400).json({
      error: error.message || 'Error claiming ability',
      success: false,
    })
  } finally {
    session.endSession()
  }
})

module.exports = {
  getActiveAbilities,
  getAvailableAbilitiesController,
  activateAbility,
  checkAbilities,
  checkAbility,
  claimAbility,
}
