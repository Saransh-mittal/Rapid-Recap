export const calculateTotalMultiplier = (invMultiplier, rqmBoostAvailable) => {
  // Convert boolean conditions to multipliers
  const multipliers = [invMultiplier || 1, rqmBoostAvailable ? 1.5 : 1]

  // Find the base (highest) multiplier
  const baseMultiplier = Math.max(...multipliers)

  // Count how many additional boosts we have (excluding the base)
  const additionalBoosts = multipliers.filter(m => m > 1).length - 1

  // Calculate final multiplier: base + (0.25 * number of additional boosts)
  const finalMultiplier = Math.min(
    baseMultiplier + additionalBoosts * 0.25,
    2.5,
  )

  // Convert to display format
  if (finalMultiplier <= 1) return null
  return `${finalMultiplier}x`
}

export const checkQuinBoostAvailability = abilities => {
  return abilities.some(ability => ability.name === 'QuinBoost')
}
