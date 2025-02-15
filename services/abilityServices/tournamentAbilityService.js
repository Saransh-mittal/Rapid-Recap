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
  session,
}) => {
  const ability = new Ability({
    user: userId,
    name: `${category} Boost`,
    description: `Increases RQM score by ${multiplier}x for ${category} category quizzes`,
    type: 'BOOST',
    multiplier,
    claimed: true,
    isActive: true,
    isUsed: true,
    stackable: true,
    maxStacks: 5,
    icon: `/images/abilities/${category.toLowerCase()}_boost.webp`,
    expiresAt: getNextFridayExpiry(),
  })

  await ability.save({ session })
  return ability
}

/**
 * Create category radar ability
 */
const createCategoryRadar = async ({ userId, category, session }) => {
  const ability = new Ability({
    user: userId,
    name: `${category} Radar`,
    description: `Reveals difficulty level of ${category} articles`,
    type: 'POWER_UP',
    claimed: true,
    isActive: true,
    isUsed: true,
    stackable: false,
    icon: `/images/abilities/${category.toLowerCase()}_radar.webp`,
    expiresAt: getNextFridayExpiry(),
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

module.exports = {
  createCategoryAbilities,
  getNextFridayExpiry, // Exported for testing purposes
}
