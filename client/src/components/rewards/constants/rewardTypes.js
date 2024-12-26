export const REWARD_TYPES = {
  IQ_BOOST: 'IQ_BOOST',
  QUIN_BOOST: 'RQM_BOOST',
  ACHIEVEMENT: 'ACHIEVEMENT',
  BONUS: 'BONUS',
  STREAK_SURGE: 'STREAK_SURGE',
}

export const REWARD_VARIANTS = {
  [REWARD_TYPES.IQ_BOOST]: {
    icon: 'Brain',
    colorScheme: 'blue',
    bgGradient: 'linear(to-b, rgba(13,14,20,0.97), rgba(9,10,13,0.97))',
  },
  [REWARD_TYPES.QUIN_BOOST]: {
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
  default: {
    icon: 'Gift',
    colorScheme: 'blue',
    bgGradient: 'linear(to-r, blue.400, blue.600)',
  },
}
