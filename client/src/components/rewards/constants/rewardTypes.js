export const REWARD_TYPES = {
  IQ_BOOST: 'IQ_BOOST',
  RQM_BOOST: 'RQM_BOOST',
  ACHIEVEMENT: 'ACHIEVEMENT',
  BONUS: 'BONUS',
  STREAK_SURGE: 'STREAK_SURGE',
  TOURNAMENT_ACE: 'TOURNAMENT_ACE',
  TOURNAMENT_PRO: 'TOURNAMENT_PRO',
  TOURNAMENT_CHAMP: 'TOURNAMENT_CHAMP',
}

export const REWARD_VARIANTS = {
  [REWARD_TYPES.IQ_BOOST]: {
    icon: 'Brain',
    colorScheme: 'blue',
    bgGradient: 'linear(to-b, rgba(13,14,20,0.97), rgba(9,10,13,0.97))',
  },
  [REWARD_TYPES.RQM_BOOST]: {
    icon: 'Rocket',
    colorScheme: 'purple',
    bgGradient:
      'linear(167deg, rgba(88,51,167,0.15) 0%, rgba(128,90,213,0.15) 100%)',
    accentGradient: 'linear(to-r, purple.400, pink.400)',
  },
  [REWARD_TYPES.ACHIEVEMENT]: {
    icon: 'Trophy',
    colorScheme: 'yellow',
    bgGradient: 'linear(to-r, yellow.400, yellow.600)',
  },
  [REWARD_TYPES.BONUS]: {
    icon: 'Star',
    colorScheme: 'green',
    bgGradient: 'linear(to-r, green.400, green.600)',
  },
  [REWARD_TYPES.STREAK_SURGE]: {
    icon: 'Trophy',
    colorScheme: 'yellow',
    bgGradient: 'linear(140deg, #0A0F1D 0%, #1E1B4B 100%)',
    accentGradient: 'linear(135deg, #FDB813, #FEDD77)',
  },
  [REWARD_TYPES.IQ_BOOST]: {
    icon: 'Brain',
    colorScheme: 'blue',
    bgGradient: 'linear(to-b, rgba(13,14,20,0.97), rgba(9,10,13,0.97))',
    buttonGradient: 'linear(to-r, blue.400, blue.500)',
    glowColor: 'rgba(66, 153, 225, 0.3)', // blue.400 with opacity
    cardBg: 'rgba(43, 108, 176, 0.2)', // blue.700 with opacity
    titleGradient: 'linear(to-r, blue.300, blue.400)',
    iconBg: 'rgba(43, 108, 176, 0.4)',
    shimmerColor: 'rgba(66, 153, 225, 0.15)',
    particleColor: 'blue.400',
  },
  [REWARD_TYPES.TOURNAMENT_ACE]: {
    icon: 'Trophy',
    colorScheme: 'yellow',
    bgGradient: 'linear(to-b, purple.900, black)',
    buttonGradient: 'linear(to-r, yellow.400, orange.400)',
    cardGradient:
      'linear(to-r, rgba(88, 28, 135, 0.8), rgba(67, 56, 202, 0.8))',
    titleGradient: 'linear(to-r, yellow.400, yellow.500)',
    glowColor: 'rgba(236, 201, 75, 0.3)', // yellow.400 with opacity
    cardBg: 'rgba(88, 28, 135, 0.4)', // purple.800 with opacity
    iconBg: 'rgba(88, 28, 135, 0.8)',
    iconColor: 'yellow.400',
    boostIconColor: 'yellow.400',
    shimmerColor: 'rgba(236, 201, 75, 0.15)',
    particleColor: 'yellow.400',
    buttonText: 'yellow.100',
    buttonBorderColor: 'yellow.400',
    buttonBg: 'rgba(236, 201, 75, 0.1)',
  },
  [REWARD_TYPES.TOURNAMENT_PRO]: {
    icon: 'Award',
    colorScheme: 'blue',
    bgGradient: 'linear(to-b, blue.900, black)',
    buttonGradient: 'linear(to-r, blue.400, cyan.400)',
    cardGradient:
      'linear(to-r, rgba(30, 64, 175, 0.8), rgba(56, 189, 248, 0.8))',
    titleGradient: 'linear(to-r, blue.300, cyan.300)',
    glowColor: 'rgba(96, 165, 250, 0.3)', // blue.400 with opacity
    cardBg: 'rgba(30, 64, 175, 0.4)', // blue.800 with opacity
    iconBg: 'rgba(30, 64, 175, 0.8)',
    iconColor: 'blue.300',
    boostIconColor: 'cyan.400',
    shimmerColor: 'rgba(96, 165, 250, 0.15)',
    particleColor: 'blue.400',
    buttonText: 'blue.100',
    buttonBorderColor: 'blue.400',
    buttonBg: 'rgba(96, 165, 250, 0.1)',
  },
  [REWARD_TYPES.TOURNAMENT_CHAMP]: {
    icon: 'Crown',
    colorScheme: 'orange',
    bgGradient: 'linear(to-b, orange.900, black)',
    buttonGradient: 'linear(to-r, orange.400, red.400)',
    cardGradient:
      'linear(to-r, rgba(154, 52, 18, 0.8), rgba(225, 29, 72, 0.8))',
    titleGradient: 'linear(to-r, orange.400, red.400)',
    glowColor: 'rgba(251, 146, 60, 0.3)', // orange.400 with opacity
    cardBg: 'rgba(154, 52, 18, 0.4)', // orange.800 with opacity
    iconBg: 'rgba(154, 52, 18, 0.8)',
    iconColor: 'orange.300',
    boostIconColor: 'red.400',
    shimmerColor: 'rgba(251, 146, 60, 0.15)',
    particleColor: 'orange.400',
    buttonText: 'orange.100',
    buttonBorderColor: 'orange.400',
    buttonBg: 'rgba(251, 146, 60, 0.1)',
  },
  default: {
    icon: 'Gift',
    colorScheme: 'blue',
    bgGradient: 'linear(to-r, blue.400, blue.600)',
  },
}
