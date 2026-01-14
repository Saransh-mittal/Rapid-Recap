// controllers/quickClashShopController.js
// Shop controller for purchasing powerups with coins

const asyncHandler = require('express-async-handler')
const mongoose = require('mongoose')
const User = require('../model/userSchema')
const PlaySession = require('../model/quickClashSchemas/playSessionSchema')
const Inventory = require('../model/inventorySchema')
const Ability = require('../model/abilitySchema')

// Shop prices for powerups (different from battle donation costs)
const SHOP_POWERUPS = {
  ORACLES_EYE: {
    id: 'ORACLES_EYE',
    name: "Oracle's Eye",
    shopCost: 70,
    description: 'Remove 2 wrong options',
    type: 'active',
    phase: 'both',
  },
  TIME_WARP: {
    id: 'TIME_WARP',
    name: 'Time Warp',
    shopCost: 100,
    description: '+15s extra time',
    type: 'active',
    phase: 'both',
  },
  SCORE_SURGE: {
    id: 'SCORE_SURGE',
    name: 'Score Surge',
    shopCost: 90,
    description: '2x Forge / 1.1x Quiz',
    type: 'active',
    phase: 'both',
  },
  STREAK_SHIELD: {
    id: 'STREAK_SHIELD',
    name: 'Streak Shield',
    shopCost: 50,
    description: 'Protect streak once',
    type: 'passive',
    phase: 'forge',
  },
  PRECISION_PROTOCOL: {
    id: 'PRECISION_PROTOCOL',
    name: 'Precision Protocol',
    shopCost: 110,
    description: '+50 RQM if 100% Accuracy',
    type: 'passive',
    phase: 'quiz',
  },
}

/**
 * @desc    Get shop powerups with prices
 * @route   GET /api/quickClash/shop/powerups
 * @access  Private
 */
const getShopPowerups = asyncHandler(async (req, res) => {
  const userId = req.user._id

  // Get user's current coin balance
  const user = await User.findById(userId).select('quickClashCoins')

  const powerupList = Object.values(SHOP_POWERUPS).map(p => ({
    id: p.id,
    name: p.name,
    price: p.shopCost,
    description: p.description,
    type: p.type,
    phase: p.phase,
    canAfford: (user?.quickClashCoins || 0) >= p.shopCost,
  }))

  res.status(200).json({
    success: true,
    powerups: powerupList,
    coins: user?.quickClashCoins || 0,
  })
})

/**
 * @desc    Purchase a powerup from the shop
 * @route   POST /api/quickClash/shop/purchase
 * @access  Private (authenticated users only, session players cannot purchase)
 */
const purchasePowerupController = asyncHandler(async (req, res) => {
  const { powerupId, quantity = 1 } = req.body
  const userId = req.user._id

  // Validate powerup exists
  const powerup = SHOP_POWERUPS[powerupId]
  if (!powerup) {
    res.status(400)
    throw new Error('Invalid powerup ID')
  }

  // Validate quantity
  if (quantity < 1 || quantity > 10) {
    res.status(400)
    throw new Error('Quantity must be between 1 and 10')
  }

  const totalCost = powerup.shopCost * quantity

  const session = await mongoose.startSession()
  try {
    const result = await session.withTransaction(async () => {
      // Get user and check coins
      const user = await User.findById(userId)
        .select('quickClashCoins')
        .session(session)

      if (!user) {
        throw new Error('User not found')
      }

      if ((user.quickClashCoins || 0) < totalCost) {
        throw new Error(`Insufficient coins. Need ${totalCost}, have ${user.quickClashCoins || 0}`)
      }

      // Deduct coins
      await User.findByIdAndUpdate(
        userId,
        { $inc: { quickClashCoins: -totalCost } },
        { session }
      )

      // Find or create ability document for this powerup
      let ability = await Ability.findOne({ name: powerup.name }).session(session)
      if (!ability) {
        ability = await Ability.create([{
          name: powerup.name,
          description: powerup.description,
          type: powerup.type,
          multiplier: 1,
        }], { session })
        ability = ability[0]
      }

      // Add to user's inventory
      let inventory = await Inventory.findOne({ user: userId }).session(session)
      if (!inventory) {
        inventory = await Inventory.create([{
          user: userId,
          abilities: [{
            abilityId: ability._id,
            quantity: quantity,
          }],
        }], { session })
        inventory = inventory[0]
      } else {
        // Check if ability already exists in inventory
        const existingAbility = inventory.abilities.find(
          a => a.abilityId.toString() === ability._id.toString()
        )

        if (existingAbility) {
          existingAbility.quantity += quantity
          await inventory.save({ session })
        } else {
          inventory.abilities.push({
            abilityId: ability._id,
            quantity: quantity,
          })
          await inventory.save({ session })
        }
      }

      const updatedUser = await User.findById(userId)
        .select('quickClashCoins')
        .session(session)

      return {
        powerupId: powerup.id,
        powerupName: powerup.name,
        quantity,
        totalCost,
        newBalance: updatedUser.quickClashCoins,
      }
    })

    res.status(200).json({
      success: true,
      message: `Successfully purchased ${quantity}x ${powerup.name}`,
      ...result,
    })
  } finally {
    session.endSession()
  }
})

/**
 * @desc    Get user's coin balance
 * @route   GET /api/quickClash/shop/balance
 * @access  Private
 */
const getBalance = asyncHandler(async (req, res) => {
  const userId = req.user._id
  const user = await User.findById(userId).select('quickClashCoins')

  res.status(200).json({
    success: true,
    coins: user?.quickClashCoins || 0,
  })
})

module.exports = {
  SHOP_POWERUPS,
  getShopPowerups,
  purchasePowerupController,
  getBalance,
}
