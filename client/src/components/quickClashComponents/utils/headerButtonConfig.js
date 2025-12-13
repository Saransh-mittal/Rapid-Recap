// components/quickClashComponents/utils/headerButtonConfig.js
// Centralized configuration for all header buttons to ensure uniformity

/**
 * Header button size configurations
 * All buttons in the header should use these standardized sizes
 */
export const HEADER_BUTTON_CONFIG = {
  // Size variants for different contexts
  mobile: {
    // Circular buttons (icon-only like friends, notification, leaderboard)
    circular: {
      size: 'w-9 h-9',        // 36px
      iconSize: 'w-4 h-4',    // 16px
    },
    // Pill buttons (icon + text like trophy, level)
    pill: {
      padding: 'py-1 px-2.5',
      iconSize: 'w-3.5 h-3.5', // 14px
      fontSize: 'text-sm',
      gap: 'gap-1',
    },
    // Circular progress buttons (like task indicator)
    progress: {
      outerSize: 36,
      innerSize: 32,
      thickness: 3,
      iconSize: 14,
      badgeSize: 14,
      badgeFont: 9,
    },
  },

  desktop: {
    circular: {
      size: 'w-10 h-10',      // 40px
      iconSize: 'w-5 h-5',    // 20px
    },
    pill: {
      padding: 'py-1.5 px-3',
      iconSize: 'w-4 h-4',
      fontSize: 'text-base',
      gap: 'gap-1.5',
    },
    progress: {
      outerSize: 48,
      innerSize: 42,
      thickness: 4,
      iconSize: 18,
      badgeSize: 18,
      badgeFont: 11,
    },
  },
}

/**
 * Common button base classes for consistency
 */
export const HEADER_BUTTON_CLASSES = {
  // Base glass effect for all header buttons
  base: `
    flex items-center justify-center
    backdrop-blur-[8px] rounded-full
    cursor-pointer transition-all duration-200
    shadow-lg shadow-black/20
  `,

  // Hover effect shared by all buttons
  hoverEffect: {
    scale: 1.05,
  },

  tapEffect: {
    scale: 0.95,
  },
}

/**
 * Get responsive size based on window width
 */
export const getHeaderButtonSize = (isMobile = false) => {
  return isMobile ? HEADER_BUTTON_CONFIG.mobile : HEADER_BUTTON_CONFIG.desktop
}

export default HEADER_BUTTON_CONFIG
