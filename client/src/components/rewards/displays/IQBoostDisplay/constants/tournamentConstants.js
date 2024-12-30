// src/constants/tournamentConstants.js

export const TOURNAMENT_RANKS = {
  RANK_1: 'RANK_1',
  RANK_2: 'RANK_2',
  RANK_3: 'RANK_3',
}

export const TOURNAMENT_THEMES = {
  [TOURNAMENT_RANKS.RANK_1]: {
    icon: 'Trophy',
    colorScheme: 'yellow',
    bgGradient: 'linear(to-b, purple.900, black)',
    buttonGradient: 'linear(to-r, yellow.400, orange.400)',
    cardGradient:
      'linear(to-r, rgba(88, 28, 135, 0.8), rgba(67, 56, 202, 0.8))',
    titleGradient: 'linear(to-r, yellow.400, yellow.500)',
    glowColor: 'rgba(236, 201, 75, 0.3)',
    iconBg: 'rgba(88, 28, 135, 0.8)',
    iconColor: 'yellow.400',
    shimmerColor: 'rgba(236, 201, 75, 0.15)',
    particleColor: 'yellow.400',
    buttonText: 'yellow.100',
    textColor: 'yellow.400',
  },
  [TOURNAMENT_RANKS.RANK_2]: {
    icon: 'Award',
    colorScheme: 'blue',
    bgGradient: 'linear(to-b, blue.900, black)',
    buttonGradient: 'linear(to-r, blue.400, cyan.400)',
    cardGradient:
      'linear(to-r, rgba(30, 64, 175, 0.8), rgba(56, 189, 248, 0.8))',
    titleGradient: 'linear(to-r, blue.300, cyan.300)',
    glowColor: 'rgba(96, 165, 250, 0.3)',
    iconBg: 'rgba(30, 64, 175, 0.8)',
    iconColor: 'blue.300',
    shimmerColor: 'rgba(96, 165, 250, 0.15)',
    particleColor: 'blue.400',
    buttonText: 'blue.100',
    textColor: 'blue.400',
  },
  [TOURNAMENT_RANKS.RANK_3]: {
    icon: 'Medal',
    colorScheme: 'orange',
    bgGradient: 'linear(to-b, orange.900, black)',
    buttonGradient: 'linear(to-r, orange.400, red.400)',
    cardGradient:
      'linear(to-r, rgba(154, 52, 18, 0.8), rgba(225, 29, 72, 0.8))',
    titleGradient: 'linear(to-r, orange.400, red.400)',
    glowColor: 'rgba(251, 146, 60, 0.3)',
    iconBg: 'rgba(154, 52, 18, 0.8)',
    iconColor: 'orange.300',
    shimmerColor: 'rgba(251, 146, 60, 0.15)',
    particleColor: 'orange.400',
    buttonText: 'orange.100',
    textColor: 'orange.400',
  },
}

export const getRankTheme = rank => TOURNAMENT_THEMES[rank] || null
