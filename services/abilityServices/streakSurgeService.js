// services/streakSurgeService.js

const { activityTypes } = require('../../data/activityTypes')
const { logActivity } = require('../../utils/activity.utils')
const Activity = require('../../model/activitySchema')
const Inventory = require('../../model/inventorySchema')
const ApplicationUpdates = require('../../model/applicationUpdatesSchema')
const Ability = require('../../model/abilitySchema')

const createStreakSurgeAbility = async ({ userId, session }) => {
  try {
    // Set expiry to end of current day
    const expiryDate = new Date()
    expiryDate.setHours(23, 59, 59, 999)

    // Create the streak surge ability
    const streakSurgeAbility = new Ability({
      user: userId,
      name: 'StreakSurge',
      description: '1.5x RQM score boost for all quizzes today',
      type: 'BOOST',
      multiplier: 1.25,
      duration: null, // Lasts until end of day
      cooldown: 0,
      stackable: true,
      maxStacks: 5,
      icon: '/images/abilities/streakSurge.webp',
      isActive: false,
      claimed: true,
      expiresAt: expiryDate,
    })

    await streakSurgeAbility.save({ session })

    // Add ability to user's inventory
    let inventory = await Inventory.findOne({ user: userId }).session(session)

    if (!inventory) {
      inventory = new Inventory({
        user: userId,
        abilities: [],
      })
    }

    inventory.abilities.push({
      abilityId: streakSurgeAbility._id,
      isUsed: true,
      expiresAt: expiryDate,
    })

    await inventory.save({ session })

    return streakSurgeAbility
  } catch (error) {
    console.error('Error creating streak surge ability:', error)
    throw error
  }
}

const handleStreakSurgeEarned = async ({ user, session }) => {
  try {
    // Create streak surge ability
    const ability = await createStreakSurgeAbility({
      userId: user._id,
      session,
    })

    // Create notification
    const notification = new ApplicationUpdates({
      userId: user._id,
      title: 'Streak Surge Available!',
      mainText:
        'Congratulations on your 7-day streak! Claim your 1.5x RQM score boost for all quizzes today.',
      type: 'applicationUpdate',
    })
    await notification.save({ session })

    // Log activity for XP
    const xpAwarded = await logActivity({
      userInGameName: user.inGameName,
      type: activityTypes.SEVEN_DAY_STREAK.type,
      session,
    })

    return {
      ability,
      xpAwarded,
    }
  } catch (error) {
    console.error('Error handling streak surge earned:', error)
    throw error
  }
}

const verifyStreakSurgeEligibility = async ({ user, session }) => {
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)

  // Check if there's an unclaimed streak surge ability for today
  const existingAbility = await Ability.findOne({
    user: user._id,
    name: 'StreakSurge',
    claimed: true,
    expiresAt: {
      $gte: today,
      $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
    },
  }).session(session)

  // Check if eligible for streak surge (7-day streak) and no unclaimed ability exists
  const isEligible =
    user.streak > 0 &&
    user.streak % 7 === 0 &&
    !existingAbility &&
    user.streakExpiry.getTime() > today.getTime()

  return {
    isEligible,
    alreadyClaimed: !!existingAbility,
  }
}

module.exports = {
  createStreakSurgeAbility,
  handleStreakSurgeEarned,
  verifyStreakSurgeEligibility,
}
