// utils/quickClashWinProbabilityHelpers.js
/**
 * Helper utilities for displaying win probability data
 *
 * PURPOSE: Format probability data for user-friendly display
 *
 * WHY SEPARATE FILE?
 * - Keep presentation logic separate from business logic
 * - Reusable across frontend and notifications
 * - Easy to customize messaging without touching calculations
 */

const {
  MIN_WIN_PROBABILITY,
  MAX_WIN_PROBABILITY,
} = require('./quickClashConstants')

/**
 * Format probability for display
 *
 * APPROACH: Round to nearest whole percent
 *
 * WHY? Users don't care about 64.7% vs 65.3% - too precise
 *
 * @param {number} probability - Probability (0.0 to 1.0)
 * @returns {string} Formatted percentage (e.g., "65%")
 */
const formatProbability = probability => {
  return `${Math.round(probability * 100)}%`
}

/**
 * Get contextual message based on probability
 *
 * PSYCHOLOGY: Different messages for different probability ranges
 * - High probability: Confidence boosting
 * - Medium probability: Competitive tension
 * - Low probability: Underdog motivation
 *
 * RANGES:
 * - 95%+: Almost certain (but never say "guaranteed")
 * - 80-95%: Strong lead
 * - 65-80%: Ahead
 * - 55-65%: Slight edge
 * - 45-55%: Toss-up
 * - 35-45%: Uphill battle
 * - 20-35%: Long shot
 * - <20%: Miracle territory
 *
 * @param {number} probability - Probability (0.0 to 1.0)
 * @param {string} teamName - Team/Player name
 * @returns {string} Contextual message
 */
const getProbabilityMessage = (probability, teamName) => {
  if (probability >= 0.95) {
    return `${teamName}: Victory almost certain! 🏆`
  } else if (probability >= 0.8) {
    return `${teamName}: Strong lead - finish it! 💪`
  } else if (probability >= 0.65) {
    return `${teamName}: You're ahead - keep it up! 👍`
  } else if (probability >= 0.55) {
    return `${teamName}: Slight edge - stay focused! 🎯`
  } else if (probability >= 0.45) {
    return 'Neck and neck! Either team can win! ⚡'
  } else if (probability >= 0.35) {
    return `${teamName}: Uphill battle - give it your all! 🔥`
  } else if (probability >= 0.2) {
    return `${teamName}: Big deficit - but not impossible! 💎`
  } else {
    return `${teamName}: Miracle needed - but miracles happen! 🙏`
  }
}

/**
 * Get data quality indicator
 *
 * TRANSPARENCY: Let users know how confident we are in the prediction
 *
 * WHY IT MATTERS:
 * - High quality (10+ matches): Trust the number
 * - Medium quality (5-9 matches): Take with grain of salt
 * - Low quality (<5 matches): Based on trophies only
 *
 * @param {string} dataQuality - Data quality level ('high', 'medium', 'low')
 * @returns {Object} Quality info with label, description, and icon
 */
const getDataQualityInfo = dataQuality => {
  switch (dataQuality) {
    case 'high':
      return {
        label: 'High Confidence',
        description: 'Based on 10+ recent matches',
        icon: '✓✓✓',
        color: 'green',
      }
    case 'medium':
      return {
        label: 'Medium Confidence',
        description: 'Based on 5-9 recent matches',
        icon: '✓✓',
        color: 'yellow',
      }
    case 'low':
    default:
      return {
        label: 'Low Confidence',
        description: 'Based on trophy rating only',
        icon: '✓',
        color: 'gray',
      }
  }
}

/**
 * Calculate expected trophy change based on win probability
 *
 * FORMULA: Underdog bonus
 * - Lower win probability = Higher trophy gain if you win
 * - Higher win probability = Smaller trophy gain if you win
 *
 * WHY? Encourages competitive play:
 * - Underdogs have more to gain
 * - Favorites have more to lose
 * - Standard in ELO systems
 *
 * EXAMPLE (baseTrophies = 30):
 * - 50% probability: +45 on win, -45 on loss (fair fight)
 * - 80% probability: +21 on win, -54 on loss (favorite)
 * - 20% probability: +69 on win, -36 on loss (underdog)
 *
 * @param {number} probability - Win probability (0.0 to 1.0)
 * @param {number} baseTrophies - Base trophy exchange amount
 * @returns {Object} Expected trophy changes
 */
const calculateExpectedTrophyChange = (probability, baseTrophies) => {
  // Underdog bonus: if win probability is low, trophy gain is higher
  // Formula: baseTrophies * (1.5 - probability)
  const winGain = Math.round(baseTrophies * (1.5 - probability))

  // Loss penalty: if win probability is high, trophy loss is higher
  // Formula: -baseTrophies * (0.5 + probability)
  const winLoss = -Math.round(baseTrophies * (0.5 + probability))

  return {
    onWin: winGain,
    onLoss: winLoss,
    swingPotential: winGain - winLoss, // Total trophy swing
  }
}

/**
 * Get trend indicator for UI display
 *
 * VISUAL FEEDBACK: Show how probability is changing
 *
 * TRENDS:
 * - 'up': Probability increasing (show ↑ or green arrow)
 * - 'down': Probability decreasing (show ↓ or red arrow)
 * - 'stable': No significant change (show - or gray)
 *
 * @param {string} trend - Trend identifier
 * @returns {Object} Trend display info
 */
const getTrendIndicator = trend => {
  switch (trend) {
    case 'up':
      return {
        arrow: '↑',
        color: 'green',
        label: 'Rising',
        animation: 'pulse-green',
      }
    case 'down':
      return {
        arrow: '↓',
        color: 'red',
        label: 'Falling',
        animation: 'pulse-red',
      }
    case 'stable':
    default:
      return {
        arrow: '→',
        color: 'gray',
        label: 'Stable',
        animation: 'none',
      }
  }
}

/**
 * Get probability bar style (for progress bars)
 *
 * COLOR CODING:
 * - <30%: Red (big underdog)
 * - 30-45%: Orange (underdog)
 * - 45-55%: Yellow (toss-up)
 * - 55-70%: Light green (advantage)
 * - 70-85%: Green (strong advantage)
 * - 85%+: Dark green (dominant)
 *
 * @param {number} probability - Probability (0.0 to 1.0)
 * @returns {Object} Style info for progress bar
 */
const getProbabilityBarStyle = probability => {
  let color
  let intensity

  if (probability < 0.3) {
    color = 'red'
    intensity = 'high'
  } else if (probability < 0.45) {
    color = 'orange'
    intensity = 'medium'
  } else if (probability < 0.55) {
    color = 'yellow'
    intensity = 'low'
  } else if (probability < 0.7) {
    color = 'green'
    intensity = 'low'
  } else if (probability < 0.85) {
    color = 'green'
    intensity = 'medium'
  } else {
    color = 'green'
    intensity = 'high'
  }

  return {
    color,
    intensity,
    width: `${Math.round(probability * 100)}%`,
    className: `prob-bar-${color}-${intensity}`,
  }
}

/**
 * Format certainty score for display
 *
 * TRANSPARENCY: Show how certain the prediction is
 *
 * SCALE:
 * - 0.0-0.25: Very uncertain (1/4 challenges complete)
 * - 0.25-0.50: Uncertain (2/4 challenges complete)
 * - 0.50-0.75: Moderately certain (3/4 challenges complete)
 * - 0.75-1.0: Very certain (4/4 challenges complete)
 *
 * @param {number} certaintyScore - Certainty (0.0 to 1.0)
 * @returns {Object} Certainty display info
 */
const getCertaintyInfo = certaintyScore => {
  let label
  let description
  let icon

  if (certaintyScore < 0.25) {
    label = 'Very Uncertain'
    description = 'Early in the battle'
    icon = '❓'
  } else if (certaintyScore < 0.5) {
    label = 'Uncertain'
    description = 'Battle is developing'
    icon = '❓❓'
  } else if (certaintyScore < 0.75) {
    label = 'Moderately Certain'
    description = 'Picture is clearer'
    icon = '✓'
  } else {
    label = 'Very Certain'
    description = 'Nearly complete data'
    icon = '✓✓'
  }

  return {
    label,
    description,
    icon,
    percentage: `${Math.round(certaintyScore * 100)}%`,
  }
}

/**
 * Generate probability comparison text
 *
 * EXAMPLE: "You have a 65% chance to win vs their 35%"
 *
 * @param {number} myProbability - My win probability
 * @param {string} myName - My name
 * @param {string} opponentName - Opponent name
 * @returns {string} Comparison text
 */
const getProbabilityComparisonText = (myProbability, myName, opponentName) => {
  const myPercent = formatProbability(myProbability)
  const theirPercent = formatProbability(1 - myProbability)

  return `${myName} has a ${myPercent} chance to win vs ${opponentName}'s ${theirPercent}`
}

/**
 * Get motivational message based on probability and role
 *
 * PSYCHOLOGY: Different messages for favorites vs underdogs
 *
 * @param {number} myProbability - My win probability
 * @param {string} role - Role ('favorite' or 'underdog')
 * @returns {string} Motivational message
 */
const getMotivationalMessage = (myProbability, role) => {
  if (role === 'favorite') {
    if (myProbability > 0.8) {
      return "Don't get complacent - finish strong! 💪"
    } else if (myProbability > 0.6) {
      return "You're in control - stay focused! 🎯"
    } else {
      return 'Slight advantage - make every point count! ⚡'
    }
  } else {
    // Underdog
    if (myProbability < 0.2) {
      return 'Nothing to lose - go for glory! 🔥'
    } else if (myProbability < 0.4) {
      return 'Prove the odds wrong! 💎'
    } else {
      return 'Within striking distance - seize the moment! ⚡'
    }
  }
}

module.exports = {
  formatProbability,
  getProbabilityMessage,
  getDataQualityInfo,
  calculateExpectedTrophyChange,
  getTrendIndicator,
  getProbabilityBarStyle,
  getCertaintyInfo,
  getProbabilityComparisonText,
  getMotivationalMessage,
}

/**
 * USAGE EXAMPLES:
 *
 * 1. Display basic probability:
 *    const prob = 0.647;
 *    const formatted = formatProbability(prob); // "65%"
 *
 * 2. Show contextual message:
 *    const message = getProbabilityMessage(0.75, "Team Alpha");
 *    // "Team Alpha: You're ahead - keep it up! 👍"
 *
 * 3. Display data quality badge:
 *    const quality = getDataQualityInfo('high');
 *    // { label: "High Confidence", icon: "✓✓✓", ... }
 *
 * 4. Calculate trophy stakes:
 *    const stakes = calculateExpectedTrophyChange(0.30, 30);
 *    // { onWin: 69, onLoss: -36, swingPotential: 105 }
 *
 * 5. Show trend indicator:
 *    const trend = getTrendIndicator('up');
 *    // { arrow: "↑", color: "green", ... }
 *
 * These helpers make it easy to display probability data consistently
 * across your UI, notifications, and analysis screens.
 */
