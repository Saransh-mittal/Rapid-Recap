const Ability = require('../../model/abilitySchema')
const Inventory = require('../../model/inventorySchema')
const moment = require('moment-timezone')

/**
 * Calculate next Friday 10:59 PM IST
 */
const getNextFridayExpiry = () => {
  const today = moment().tz('Asia/Kolkata')
  const friday = today.clone().day(5) // 5 represents Friday

  // If today is past Friday 10:59 PM, get next Friday
  if (
    (today.day() === 5 && today.hour() >= 22 && today.minute() >= 59) ||
    today.day() > 5
  ) {
    friday.add(1, 'week')
  }

  // Set time to 10:59 PM
  friday.set({
    hour: 22,
    minute: 59,
    second: 0,
    millisecond: 0,
  })

  return friday.toDate()
}

/**
 * Create category boost ability
 */
const createCategoryBoost = async ({
  userId,
  category,
  multiplier,
  duration = null,
  expiresAt = null,
  isActive = true,
  isClaimed = true,
  description = null,
  isBadgePowerUp = true,
  session,
}) => {
  const ability = new Ability({
    user: userId,
    name: `${category} Boost`,
    description:
      description ||
      `Increases RQM score by ${multiplier}x for ${category} category quizzes`,
    type: 'BOOST',
    multiplier,
    claimed: isClaimed,
    isActive: isActive,
    stackable: true,
    maxStacks: 5,
    icon: `/images/abilities/${category.toLowerCase()}_boost.webp`,
    duration: duration,
    isBadgePowerUp: isBadgePowerUp,
    expiresAt: expiresAt || getNextFridayExpiry(),
  })

  await ability.save({ session })
  return ability
}

/**
 * Create category radar ability
 */
const createCategoryRadar = async ({
  userId,
  category,
  duration = null,
  expiresAt = null,
  isActive = true,
  isClaimed = true,
  description = null,
  isBadgePowerUp = true,
  session,
}) => {
  const ability = new Ability({
    user: userId,
    name: `${category} Radar`,
    description:
      description || `Reveals difficulty level of ${category} articles`,
    type: 'POWER_UP',
    claimed: isClaimed,
    isActive: isActive,
    stackable: true,
    icon: `/images/abilities/${category.toLowerCase()}_radar.webp`,
    expiresAt: getNextFridayExpiry(),
    duration: duration,
    isBadgePowerUp: isBadgePowerUp,
    expiresAt: expiresAt || getNextFridayExpiry(),
  })

  await ability.save({ session })
  return ability
}

/**
 * Add ability to user's inventory
 */
const addToInventory = async ({ userId, ability, session }) => {
  const inventory = await Inventory.findOne({ user: userId }).session(session)

  if (!inventory) {
    // Create new inventory if it doesn't exist
    const newInventory = new Inventory({
      user: userId,
      abilities: [
        {
          abilityId: ability._id,
          isActive: true,
          expiresAt: ability.expiresAt,
        },
      ],
    })
    await newInventory.save({ session })
  } else {
    // Add to existing inventory
    inventory.abilities.push({
      abilityId: ability._id,
      isActive: true,
      expiresAt: ability.expiresAt,
    })
    await inventory.save({ session })
  }
}

/**
 * Create category abilities based on badge
 */
const createCategoryAbilities = async ({
  userId,
  category,
  badgeName,
  session,
}) => {
  const abilities = []

  switch (badgeName) {
    case 'ACE':
      const boostAbility = await createCategoryBoost({
        userId,
        category,
        multiplier: 1.25,
        session,
      })
      const radarAbility = await createCategoryRadar({
        userId,
        category,
        session,
      })
      abilities.push(boostAbility, radarAbility)
      break

    case 'PRO':
      const proBoost = await createCategoryBoost({
        userId,
        category,
        multiplier: 1.25,
        session,
      })
      abilities.push(proBoost)
      break

    case 'CHAMP':
      const champRadar = await createCategoryRadar({
        userId,
        category,
        session,
      })
      abilities.push(champRadar)
      break
  }

  // Add all abilities to inventory
  for (const ability of abilities) {
    await addToInventory({ userId, ability, session })
  }

  return abilities
}

// Helper function to check if ability name is a category boost
const isCategoryBoost = abilityName => {
  return (
    abilityName.endsWith('Boost') &&
    !['QuinBoost', 'QuizBoost'].includes(abilityName)
  )
}

// Helper function to extract category from ability name
const getCategoryFromBoost = abilityName => {
  return abilityName.replace(' Boost', '')
}
module.exports = {
  createCategoryAbilities,
  getNextFridayExpiry, // Exported for testing purposes
  createCategoryBoost,
  isCategoryBoost,
  getCategoryFromBoost,
  createCategoryRadar,
}
