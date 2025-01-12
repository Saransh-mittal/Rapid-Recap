// src/components/rewards/displays/TournamentWinnerDisplay/constants/animations.js

export const trophyAnimation = {
  initial: { scale: 0 },
  animate: {
    scale: 1,
    y: [0, -15, 0],
    transition: {
      scale: { duration: 0.5 },
      y: {
        repeat: Infinity,
        duration: 3,
        ease: 'easeInOut',
      },
    },
  },
}

export const cardAnimation = {
  initial: { opacity: 0, x: -50 },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      type: 'spring',
      duration: 0.8,
    },
  },
  hover: {
    scale: 1.02,
    transition: {
      duration: 0.3,
    },
  },
}

export const claimButtonAnimation = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      duration: 0.8,
    },
  },
  hover: {
    scale: 1.05,
    boxShadow: '0 0 30px rgba(147, 51, 234, 0.5)',
    transition: {
      duration: 0.3,
      repeat: Infinity,
      repeatType: 'reverse',
    },
  },
  tap: {
    scale: 0.95,
  },
}

export const successMessageAnimation = {
  initial: { scale: 0, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring',
      duration: 0.8,
      bounce: 0.5,
    },
  },
  exit: {
    scale: 0,
    opacity: 0,
    transition: {
      duration: 0.3,
    },
  },
}

export const particleEffect = {
  initial: { scale: 0, opacity: 0 },
  animate: {
    scale: [0, 1, 0],
    opacity: [0, 1, 0],
    y: [-20, -40],
    x: [-20, 20],
    transition: {
      duration: 2,
      ease: 'easeOut',
    },
  },
}

export const glowAnimation = {
  animate: {
    opacity: [0.5, 0.8],
    scale: [1, 1.2],
    transition: {
      duration: 2,
      repeat: Infinity,
      repeatType: 'reverse',
      ease: 'easeInOut',
    },
  },
}

export const pulseAnimation = {
  animate: {
    scale: [1, 1.05],
    filter: ['brightness(1)', 'brightness(1.2)'],
    transition: {
      duration: 2,
      repeat: Infinity,
      repeatType: 'reverse',
      ease: 'easeInOut',
    },
  },
}
