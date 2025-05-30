// components/quickClashComponents/team/teamBattlePageComponents/battleResultsSection/battleResultsUtils.js

/**
 * Calculate result data for battle results display
 * @param {Object} currentBattle - The battle data
 * @param {string} userTeam - User's team ('teamA' or 'teamB')
 * @returns {Object} Processed result data
 */
export const calculateResultData = (currentBattle, userTeam) => {
  const isUserWinner = currentBattle.winner === userTeam
  const isTie = currentBattle.winner === 'tie'
  const isUserDefeat = !isUserWinner && !isTie

  // Get result color scheme
  const getResultColor = () => {
    if (isUserWinner) return 'green'
    if (isTie) return 'yellow'
    return 'red'
  }

  const resultColor = getResultColor()

  // Get RGB values for the result color
  const getResultColorRgb = () => {
    if (isUserWinner) return '16, 185, 129'
    if (isTie) return '245, 158, 11'
    return '239, 68, 68'
  }

  const resultColorRgb = getResultColorRgb()

  return {
    isUserWinner,
    isTie,
    isUserDefeat,
    resultColor,
    resultColorRgb,
  }
}

/**
 * Calculate trophy change for a team
 * @param {Object} trophyExchange - Trophy exchange data
 * @param {boolean} isWinner - Whether the team won
 * @param {boolean} isTie - Whether it was a tie
 * @returns {number} Trophy change amount
 */
export const calculateTrophyChange = (trophyExchange, isWinner, isTie) => {
  if (!trophyExchange) return 0

  if (isWinner) {
    return Math.round((trophyExchange.finalAmount * 1.25) / 4)
  } else if (isTie) {
    return Math.round(trophyExchange.finalAmount * 0.1)
  } else {
    return -Math.round((trophyExchange.finalAmount * 0.75) / 4)
  }
}

/**
 * Get user team data for display
 * @param {Object} currentBattle - The battle data
 * @param {string} userTeam - User's team ('teamA' or 'teamB')
 * @returns {Object} User team data
 */
export const getUserTeamData = (currentBattle, userTeam) => {
  const isUserTeamA = userTeam === 'teamA'

  return isUserTeamA
    ? {
        wins: currentBattle.teamAWins,
        totalScore: currentBattle.teamATotalScore,
        name: currentBattle.teamA?.name,
      }
    : {
        wins: currentBattle.teamBWins,
        totalScore: currentBattle.teamBTotalScore,
        name: currentBattle.teamB?.name,
      }
}

/**
 * Get opponent team data for display
 * @param {Object} currentBattle - The battle data
 * @param {string} userTeam - User's team ('teamA' or 'teamB')
 * @returns {Object} Opponent team data
 */
export const getOpponentTeamData = (currentBattle, userTeam) => {
  const isUserTeamA = userTeam === 'teamA'

  return isUserTeamA
    ? {
        wins: currentBattle.teamBWins,
        totalScore: currentBattle.teamBTotalScore,
        name: currentBattle.teamB?.name,
      }
    : {
        wins: currentBattle.teamAWins,
        totalScore: currentBattle.teamATotalScore,
        name: currentBattle.teamA?.name,
      }
}

/**
 * Get winner text for display
 * @param {Object} currentBattle - The battle data
 * @param {string} userTeam - User's team ('teamA' or 'teamB')
 * @param {Function} t - Translation function
 * @returns {string} Winner text
 */
export const getWinnerText = (currentBattle, userTeam, t) => {
  if (currentBattle.winner === userTeam) {
    return `${t('Team A')} ${t('WINS')}`
  } else if (currentBattle.winner === 'tie') {
    return t('EPIC DRAW!')
  } else {
    return `${t('Team B')} ${t('WINS')}`
  }
}

/**
 * Get winner color for display
 * @param {Object} currentBattle - The battle data
 * @param {string} userTeam - User's team ('teamA' or 'teamB')
 * @returns {string} Winner color gradient
 */
export const getWinnerColor = (currentBattle, userTeam) => {
  if (currentBattle.winner === userTeam) {
    return '#3B82F6, #1E40AF'
  } else if (currentBattle.winner === 'tie') {
    return '#F59E0B, #D97706'
  } else {
    return '#EF4444, #B91C1C'
  }
}

/**
 * Calculate completed challenges for a team
 * @param {Array} challenges - Array of challenges
 * @param {string} actualTeam - The actual team ('A' or 'B')
 * @returns {number} Number of completed challenges
 */
export const getCompletedChallenges = (challenges, actualTeam) => {
  return challenges.filter(c => c[`team${actualTeam}Completed`]).length
}

/**
 * Filter applicable trophy bonuses
 * @param {Object} trophyExchange - Trophy exchange data
 * @param {Function} t - Translation function
 * @returns {Array} Array of applicable bonuses
 */
export const getApplicableBonuses = (trophyExchange, t) => {
  if (!trophyExchange?.bonuses) return []

  const bonusMap = [
    {
      key: 'firstDaily',
      label: t('First Daily'),
      fullLabel: t('First Daily Battle'),
      ...trophyExchange.bonuses.firstDaily,
    },
    {
      key: 'strongerTeam',
      label: t('vs Stronger'),
      fullLabel: t('vs Stronger Team'),
      ...trophyExchange.bonuses.strongerTeam,
    },
    {
      key: 'comebackWin',
      label: t('Comeback'),
      fullLabel: t('Comeback Win'),
      ...trophyExchange.bonuses.comebackWin,
    },
    {
      key: 'allWins',
      label: t('All Wins'),
      fullLabel: t('All Categories Won'),
      ...trophyExchange.bonuses.allWins,
    },
  ]

  return bonusMap.filter(bonus => bonus.applied)
}

/**
 * Get responsive breakpoints for components
 * @returns {Object} Responsive breakpoints object
 */
export const getResponsiveBreakpoints = () => ({
  // Spacing
  spacing: { base: 3, md: 4, lg: 6 },
  sectionSpacing: { base: 4, md: 6, lg: 8 },

  // Padding
  cardPadding: { base: 3, md: 4, lg: 5 },
  containerPadding: { base: 4, md: 6, lg: 8 },

  // Font sizes
  badgeFontSize: { base: 'sm', md: 'md', lg: 'lg' },
  titleFontSize: { base: 'lg', md: 'xl', lg: '2xl' },
  scoreFontSize: { base: '3xl', md: '4xl', lg: '5xl' },
  textFontSize: { base: 'sm', md: 'md', lg: 'lg' },

  // Icon sizes
  iconSize: { base: 4, md: 5, lg: 6 },
  badgeIconSize: { base: 4, md: 5, lg: 5 },

  // Border radius
  borderRadius: { base: 'lg', md: 'xl', lg: '2xl' },

  // Max widths
  maxWidth: { base: '100%', md: '600px', lg: '800px', xl: '1000px' },
})
