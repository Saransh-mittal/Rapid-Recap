// components/quickClashComponents/utils/quickClashColors.js - Enhanced Blue-Cyan Harmony Color Scheme
// Enhanced with team battle specific colors and patterns

export const QUICK_CLASH_COLORS = {
  // Primary Blue-Cyan Scheme (main brand colors)
  primary: {
    500: '#06B6D4', // Main cyan
    600: '#0891B2', // Darker cyan
    700: '#0E7490', // Even darker cyan
    400: '#22D3EE', // Lighter cyan
    300: '#67E8F9', // Very light cyan
    blue: '#0EA5E9', // Blue accent
    darkBlue: '#0284C7', // Darker blue
  },

  // Glass/Background Colors (transparent for app background)
  glass: {
    light: 'rgba(15, 23, 42, 0.2)', // Very transparent
    medium: 'rgba(15, 23, 42, 0.4)', // Medium transparency
    strong: 'rgba(15, 23, 42, 0.6)', // More opaque
    dark: 'rgba(15, 23, 42, 0.8)', // Very opaque
    soft: 'rgba(15, 23, 42, 0.25)', // Between light and medium
    intense: 'rgba(15, 23, 42, 0.7)', // Between strong and dark
    ultra: 'rgba(15, 23, 42, 0.9)', // Almost opaque
    // NEW: Additional transparency levels for team battles
    veryLight: 'rgba(15, 23, 42, 0.15)', // Extra transparent
    subtle: 'rgba(15, 23, 42, 0.3)', // Subtle background
    none: 'transparent', // Fully transparent
  },

  // Border Colors (cyan-tinted)
  border: {
    light: 'rgba(255, 255, 255, 0.05)', // Very subtle
    medium: 'rgba(255, 255, 255, 0.1)', // Standard
    strong: 'rgba(255, 255, 255, 0.15)', // More visible
    accent: 'rgba(6, 182, 212, 0.3)', // Cyan tinted
    blue: 'rgba(14, 165, 233, 0.3)', // Blue tinted
    subtle: 'rgba(255, 255, 255, 0.03)', // Ultra subtle
    bright: 'rgba(255, 255, 255, 0.2)', // More visible
    // NEW: Team battle borders
    cyan: 'rgba(6, 182, 212, 0.4)', // Stronger cyan
    cyanBright: 'rgba(6, 182, 212, 0.5)', // Bright cyan border
    red: 'rgba(239, 68, 68, 0.4)', // Red border
    redBright: 'rgba(239, 68, 68, 0.5)', // Bright red border
    green: 'rgba(16, 185, 129, 0.4)', // Green border
    yellow: 'rgba(245, 158, 11, 0.4)', // Yellow border
    purple: 'rgba(139, 92, 246, 0.4)', // Purple border
  },

  // Text Colors
  text: {
    primary: '#FFFFFF', // Pure white
    secondary: 'rgba(255, 255, 255, 0.7)', // 70% opacity
    muted: 'rgba(255, 255, 255, 0.5)', // 50% opacity
    disabled: 'rgba(255, 255, 255, 0.3)', // 30% opacity
    ghost: 'rgba(255, 255, 255, 0.6)', // 60% opacity
    bright: 'rgba(255, 255, 255, 0.9)', // 90% opacity
  },

  // Accent Colors (complementary to blue-cyan)
  accent: {
    yellow: '#FBBF24', // Trophies/rewards (warm contrast)
    orange: '#F59E0B', // Daily tasks (warm contrast)
    cyan: '#06B6D4', // Main brand color
    blue: '#0EA5E9', // Secondary brand color
    green: '#10B981', // Success states
    red: '#EF4444', // Errors/rejections
    purple: '#8B5CF6', // Special elements (minimal use)
    teal: '#14B8A6', // Additional accent
    emerald: '#059669', // Dark green
    indigo: '#6366F1', // Deep blue
  },

  // Button Gradients (blue-cyan focused)
  gradients: {
    primary: 'linear-gradient(135deg, #06B6D4, #0891B2)', // Cyan gradient
    secondary: 'linear-gradient(135deg, #0EA5E9, #0284C7)', // Blue gradient
    success: 'linear-gradient(135deg, #10B981, #059669)', // Green
    warning: 'linear-gradient(135deg, #F59E0B, #D97706)', // Orange
    error: 'linear-gradient(135deg, #EF4444, #DC2626)', // Red
    accent: 'linear-gradient(135deg, #22D3EE, #06B6D4)', // Light cyan
    blueGrad: 'linear-gradient(135deg, #0EA5E9, #06B6D4)', // Blue to cyan
    subtle: 'linear-gradient(135deg, #67E8F9, #22D3EE)', // Very light
    intense: 'linear-gradient(135deg, #0E7490, #0891B2)', // Darker
    victory: 'linear-gradient(135deg, #06B6D4, #0EA5E9)', // Victory gradient
    defeat: 'linear-gradient(135deg, #EF4444, #F59E0B)', // Defeat gradient
  },

  // Status Colors
  status: {
    active: '#10B981', // Green for ready to play
    pending: '#F59E0B', // Orange for waiting
    completed: '#06B6D4', // Cyan for finished
    rejected: '#EF4444', // Red for declined
    neutral: '#6B7280', // Gray for other states
    info: '#0EA5E9', // Blue for information
    victory: '#06B6D4', // Cyan for wins
    defeat: '#EF4444', // Red for losses
    draw: '#FBBF24', // Yellow for ties
  },

  // Animation Colors
  animation: {
    glow: 'rgba(6, 182, 212, 0.4)', // Cyan glow
    pulse: 'rgba(34, 211, 238, 0.6)', // Light cyan pulse
    shimmer: 'rgba(255, 255, 255, 0.1)', // Shimmer effect
    float: 'rgba(6, 182, 212, 0.3)', // Floating animation
  },

  // Team Battle Specific Colors (EXISTING)
  teamBattle: {
    userTeam: '#0EA5E9', // Blue for user's team
    opponentTeam: '#EF4444', // Red for opponent team
    progress: '#10B981', // Green for progress
    expired: '#6B7280', // Gray for expired
    header: {
      active: '#10B981',
      completed: '#06B6D4',
      victory: '#06B6D4',
      defeat: '#EF4444',
      draw: '#FBBF24',
    },
    // NEW: Extended team battle colors for transparent backgrounds
    cards: {
      userTeamBg: 'rgba(6, 182, 212, 0.05)', // Very subtle cyan bg
      userTeamBorder: 'rgba(6, 182, 212, 0.5)', // Cyan border
      userTeamGlow: 'rgba(6, 182, 212, 0.3)', // Cyan glow
      opponentTeamBg: 'rgba(239, 68, 68, 0.05)', // Very subtle red bg
      opponentTeamBorder: 'rgba(239, 68, 68, 0.5)', // Red border
      opponentTeamGlow: 'rgba(239, 68, 68, 0.3)', // Red glow
      defaultBg: 'rgba(15, 23, 42, 0.4)', // Default card bg
      defaultBorder: 'rgba(255, 255, 255, 0.1)', // Default border
    },
    states: {
      victory: {
        primary: '#06B6D4',
        border: 'rgba(6, 182, 212, 0.5)',
        glow: 'rgba(6, 182, 212, 0.4)',
        bg: 'rgba(6, 182, 212, 0.08)',
      },
      defeat: {
        primary: '#EF4444',
        border: 'rgba(239, 68, 68, 0.5)',
        glow: 'rgba(239, 68, 68, 0.4)',
        bg: 'rgba(239, 68, 68, 0.08)',
      },
      tie: {
        primary: '#F59E0B',
        border: 'rgba(245, 158, 11, 0.5)',
        glow: 'rgba(245, 158, 11, 0.4)',
        bg: 'rgba(245, 158, 11, 0.08)',
      },
    },
    category: {
      available: {
        border: 'rgba(6, 182, 212, 0.3)',
        hover: 'rgba(6, 182, 212, 0.1)',
        glow: 'rgba(6, 182, 212, 0.2)',
        bg: 'rgba(15, 23, 42, 0.2)',
      },
      selected: {
        border: 'rgba(6, 182, 212, 0.5)',
        bg: 'rgba(6, 182, 212, 0.1)',
        glow: 'rgba(6, 182, 212, 0.3)',
      },
      completed: {
        border: 'rgba(16, 185, 129, 0.5)',
        bg: 'rgba(16, 185, 129, 0.1)',
        glow: 'rgba(16, 185, 129, 0.3)',
      },
      inProgress: {
        border: 'rgba(245, 158, 11, 0.5)',
        bg: 'rgba(245, 158, 11, 0.1)',
        glow: 'rgba(245, 158, 11, 0.3)',
      },
      locked: {
        border: 'rgba(107, 114, 128, 0.3)',
        bg: 'rgba(107, 114, 128, 0.05)',
        glow: 'rgba(107, 114, 128, 0.1)',
      },
      exited: {
        border: 'rgba(239, 68, 68, 0.5)',
        bg: 'rgba(239, 68, 68, 0.1)',
        glow: 'rgba(239, 68, 68, 0.2)',
      },
      teammate: {
        border: 'rgba(139, 92, 246, 0.5)',
        bg: 'rgba(139, 92, 246, 0.1)',
        glow: 'rgba(139, 92, 246, 0.3)',
      },
    },
  },

  // Shadow Colors (for glows and depth)
  shadows: {
    cyan: 'rgba(6, 182, 212, 0.3)',
    blue: 'rgba(14, 165, 233, 0.3)',
    green: 'rgba(16, 185, 129, 0.3)',
    red: 'rgba(239, 68, 68, 0.3)',
    yellow: 'rgba(245, 158, 11, 0.3)',
    purple: 'rgba(139, 92, 246, 0.3)',
    black: 'rgba(0, 0, 0, 0.5)',
  },
}

// Utility functions for applying colors consistently
export const getGlassStyle = (intensity = 'medium') => ({
  backgroundColor: QUICK_CLASH_COLORS.glass[intensity],
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)', // Safari support
  border: `1px solid ${QUICK_CLASH_COLORS.border.medium}`,
})

export const getButtonStyle = (variant = 'primary', size = 'medium') => {
  const baseStyle = {
    background: QUICK_CLASH_COLORS.gradients[variant],
    border: `1px solid ${QUICK_CLASH_COLORS.border.light}`,
    color: QUICK_CLASH_COLORS.text.primary,
    transition: 'all 0.2s ease-in-out',
  }

  const sizeStyles = {
    small: { padding: '8px 16px', fontSize: '14px' },
    medium: { padding: '12px 24px', fontSize: '16px' },
    large: { padding: '16px 32px', fontSize: '18px' },
  }

  return { ...baseStyle, ...sizeStyles[size] }
}

// NEW: Utility for team battle card styling (transparent backgrounds)
export const getTeamBattleCardStyle = (variant = 'default') => {
  const variants = {
    default: {
      backgroundColor: QUICK_CLASH_COLORS.teamBattle.cards.defaultBg,
      border: `1px solid ${QUICK_CLASH_COLORS.teamBattle.cards.defaultBorder}`,
    },
    userTeam: {
      backgroundColor: QUICK_CLASH_COLORS.teamBattle.cards.defaultBg,
      border: `2px solid ${QUICK_CLASH_COLORS.teamBattle.cards.userTeamBorder}`,
      boxShadow: `0 0 30px ${QUICK_CLASH_COLORS.teamBattle.cards.userTeamGlow}`,
    },
    opponentTeam: {
      backgroundColor: QUICK_CLASH_COLORS.teamBattle.cards.defaultBg,
      border: `2px solid ${QUICK_CLASH_COLORS.teamBattle.cards.opponentTeamBorder}`,
      boxShadow: `0 0 20px ${QUICK_CLASH_COLORS.teamBattle.cards.opponentTeamGlow}`,
    },
    victory: {
      backgroundColor: QUICK_CLASH_COLORS.glass.strong,
      border: `2px solid ${QUICK_CLASH_COLORS.teamBattle.states.victory.border}`,
      boxShadow: `0 0 40px ${QUICK_CLASH_COLORS.teamBattle.states.victory.glow}`,
    },
    defeat: {
      backgroundColor: QUICK_CLASH_COLORS.glass.strong,
      border: `2px solid ${QUICK_CLASH_COLORS.teamBattle.states.defeat.border}`,
      boxShadow: `0 0 30px ${QUICK_CLASH_COLORS.teamBattle.states.defeat.glow}`,
    },
  }

  return {
    ...variants[variant],
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
  }
}

// NEW: Utility for category card styling (transparent backgrounds)
export const getCategoryCardStyle = (state = 'available') => {
  const config =
    QUICK_CLASH_COLORS.teamBattle.category[state] ||
    QUICK_CLASH_COLORS.teamBattle.category.available

  return {
    backgroundColor: config.bg || QUICK_CLASH_COLORS.glass.veryLight,
    border: `2px solid ${config.border}`,
    boxShadow: `0 0 20px ${config.glow}`,
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
  }
}

// Enhanced Tailwind CSS classes for consistent usage (Updated for Team Battles)
export const QUICK_CLASH_CLASSES = {
  // Glass containers with enhanced variations
  glassLight: 'bg-slate-900/20 backdrop-blur-[16px] border border-white/5',
  glassMedium: 'bg-slate-900/40 backdrop-blur-[16px] border border-white/10',
  glassStrong: 'bg-slate-900/60 backdrop-blur-[16px] border border-white/15',
  glassSoft:
    'bg-slate-900/25 backdrop-blur-[12px] border border-white/5 backdrop-brightness-105',
  glassIntense:
    'bg-slate-900/70 backdrop-blur-[20px] border border-white/20 backdrop-brightness-115',
  glassDark: 'bg-slate-900/80 backdrop-blur-[16px] border border-white/15',
  glassUltra: 'bg-slate-900/90 backdrop-blur-[24px] border border-white/25',
  // NEW: Team battle specific glass styles
  glassTeamBattle:
    'bg-slate-900/40 backdrop-blur-[12px] border border-white/10',
  glassTeamBattleLight:
    'bg-slate-900/30 backdrop-blur-[12px] border border-white/10',
  glassTeamBattleStrong:
    'bg-slate-900/50 backdrop-blur-[12px] border border-white/15',

  // NEW: Quiz specific glass styles
  glassQuiz:
    'bg-slate-900/40 backdrop-blur-[20px] border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]',
  glassQuizCard:
    'bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-[20px] border border-white/20 shadow-2xl',

  // Text classes with enhanced variations
  textPrimary: 'text-white',
  textSecondary: 'text-white/70',
  textMuted: 'text-white/50',
  textDisabled: 'text-white/30',
  textGhost: 'text-white/60',
  textBright: 'text-white/90',

  // Button classes (Updated to blue-cyan)
  btnPrimary:
    'bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white border border-white/10',
  btnSecondary:
    'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border border-white/10',
  btnSuccess:
    'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border border-white/10',
  btnWarning:
    'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border border-white/10',
  btnAccent:
    'bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-500 hover:to-cyan-600 text-white border border-white/10',
  btnDanger:
    'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border border-white/10',
  btnVictory:
    'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white border border-white/10',

  // Ghost button variations
  btnGhost:
    'bg-transparent hover:bg-white/10 text-white/90 hover:text-white border border-transparent hover:border-white/20 transition-all duration-200',
  btnSecondaryBlue:
    'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border border-white/10 transition-all duration-200',

  // Status classes (Updated with team battle colors)
  statusActive: 'text-green-400 bg-green-500/10 border-green-500/20',
  statusPending: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
  statusCompleted: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  statusRejected: 'text-red-400 bg-red-500/10 border-red-500/20',
  statusInfo: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  statusVictory: 'text-cyan-400 bg-cyan-500/20 border-cyan-400/40',
  statusDefeat: 'text-red-400 bg-red-500/20 border-red-400/40',
  statusDraw: 'text-yellow-400 bg-yellow-500/20 border-yellow-400/40',

  // Interactive elements focus states
  focusRing: 'focus:ring-2 focus:ring-cyan-400/50 focus:outline-none',
  focusRingCyan:
    'focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:ring-offset-2 focus:ring-offset-slate-900',
  focusRingBlue:
    'focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:ring-offset-2 focus:ring-offset-slate-900',
  focusRingGreen:
    'focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:ring-offset-2 focus:ring-offset-slate-900',

  // Tab-specific color classes
  tabCyan: 'text-cyan-400 hover:text-cyan-300',
  tabBlue: 'text-blue-400 hover:text-blue-300',
  tabOrange: 'text-orange-400 hover:text-orange-300',
  tabGreen: 'text-green-400 hover:text-green-300',
  tabRed: 'text-red-400 hover:text-red-300',
  tabYellow: 'text-yellow-400 hover:text-yellow-300',

  // Enhanced hover and interaction states
  hoverCyan:
    'hover:bg-cyan-500/10 hover:border-cyan-400/40 hover:text-cyan-300 transition-all duration-200',
  hoverBlue:
    'hover:bg-blue-500/10 hover:border-blue-400/40 hover:text-blue-300 transition-all duration-200',
  hoverGreen:
    'hover:bg-green-500/10 hover:border-green-400/40 hover:text-green-300 transition-all duration-200',
  hoverRed:
    'hover:bg-red-500/10 hover:border-red-400/40 hover:text-red-300 transition-all duration-200',

  // Badge styles with variations
  badgeRed:
    'bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold',
  badgeNotification:
    'bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center font-bold border-2',
  badgeSuccess:
    'bg-green-500 text-white text-xs rounded-full px-2 py-1 font-medium',
  badgeCyan:
    'bg-cyan-500 text-white text-xs rounded-full px-2 py-1 font-medium',
  badgeWarning:
    'bg-orange-500 text-white text-xs rounded-full px-2 py-1 font-medium',
  badgeInfo:
    'bg-blue-500 text-white text-xs rounded-full px-2 py-1 font-medium',

  // Enhanced shadow utilities
  shadowCyan: 'shadow-lg shadow-cyan-500/25',
  shadowBlue: 'shadow-lg shadow-blue-500/25',
  shadowGlow: 'shadow-xl hover:shadow-cyan-500/40',
  shadowSoft: 'shadow-md shadow-black/10',
  shadowStrong: 'shadow-2xl shadow-black/25',
  shadowVictory: 'shadow-lg shadow-cyan-500/30',
  shadowDefeat: 'shadow-lg shadow-red-500/30',

  // Text gradient utilities for headers
  textGradientCyan:
    'bg-gradient-to-r from-cyan-300 to-blue-200 bg-clip-text text-transparent',
  textGradientBlue:
    'bg-gradient-to-r from-blue-300 to-cyan-200 bg-clip-text text-transparent',
  textGradientSuccess:
    'bg-gradient-to-r from-green-300 to-emerald-200 bg-clip-text text-transparent',
  textGradientVictory:
    'bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent',

  // Animation utilities
  transformHover: 'hover:-translate-y-0.5 transition-transform duration-200',
  scaleHover: 'hover:scale-105 transition-transform duration-200',
  pulseGlow: 'animate-pulse hover:animate-none',
  floatAnimation: 'animate-bounce hover:animate-none',

  // Layout and container utilities
  containerFluid: 'w-full max-w-full px-4',
  containerFixed: 'max-w-7xl mx-auto px-4',
  containerTeamBattle: 'max-w-6xl mx-auto px-2 md:px-4',

  // Responsive utilities
  mobileContainer: 'px-4 py-2 max-w-full',
  desktopContainer: 'px-6 py-4 max-w-none',
  tabletContainer: 'px-4 py-3 max-w-4xl',

  // Spacing utilities
  spacingXs: 'space-y-2',
  spacingSm: 'space-y-3',
  spacingMd: 'space-y-4',
  spacingLg: 'space-y-6',
  spacingXl: 'space-y-8',

  // Enhanced glassmorphic container for special components
  tabContainer:
    'bg-slate-900/40 backdrop-blur-[16px] border border-white/10 backdrop-brightness-110 rounded-2xl shadow-2xl',
  modalContainer:
    'bg-slate-900/50 backdrop-blur-[20px] border border-white/15 backdrop-brightness-115 rounded-2xl shadow-2xl',
  cardContainer:
    'bg-slate-900/30 backdrop-blur-[12px] border border-white/8 backdrop-brightness-108 rounded-xl shadow-lg',
  battleContainer:
    'bg-slate-900/35 backdrop-blur-[14px] border border-white/12 backdrop-brightness-110 rounded-xl shadow-xl',

  // Team Battle Specific Classes
  teamUserSide: 'border-blue-400 text-blue-400',
  teamOpponentSide: 'border-red-400 text-red-400',
  teamBattleHeader: 'bg-gradient-to-r from-cyan-600/20 to-blue-600/20',
  teamBattleProgress: 'bg-green-500 text-green-50',
  teamBattleVictory: 'border-cyan-500/60 bg-cyan-500/5',
  teamBattleDefeat: 'border-red-500/60 bg-red-500/5',
  teamBattleDraw: 'border-yellow-500/60 bg-yellow-500/5',

  // NEW: Team Battle Card Classes (transparent backgrounds)
  teamBattleCard:
    'bg-slate-900/40 backdrop-blur-[12px] border border-white/10 rounded-2xl',
  teamBattleCardUserTeam:
    'bg-slate-900/40 backdrop-blur-[12px] border-2 border-cyan-500/50 rounded-2xl shadow-[0_0_30px_rgba(6,182,212,0.3)]',
  teamBattleCardOpponent:
    'bg-slate-900/40 backdrop-blur-[12px] border-2 border-red-500/50 rounded-2xl shadow-[0_0_20px_rgba(239,68,68,0.3)]',

  // NEW: Category card state classes
  categoryAvailable:
    'bg-slate-900/20 backdrop-blur-[8px] border-2 border-cyan-500/30 hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)] active:scale-95',
  categorySelected:
    'bg-cyan-500/10 backdrop-blur-[8px] border-2 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.3)]',
  categoryCompleted:
    'bg-green-500/10 backdrop-blur-[8px] border-2 border-green-500/50 shadow-[0_0_20px_rgba(16,185,129,0.3)]',
  categoryInProgress:
    'bg-yellow-500/10 backdrop-blur-[8px] border-2 border-yellow-500/50 shadow-[0_0_20px_rgba(245,158,11,0.3)]',
  categoryLocked:
    'bg-slate-900/30 backdrop-blur-[8px] border-2 border-slate-700/30 opacity-50',
  categoryExited:
    'bg-red-500/10 backdrop-blur-[8px] border-2 border-red-500/50 opacity-60',
  categoryTeammate:
    'bg-purple-500/10 backdrop-blur-[8px] border-2 border-purple-500/50',

  // Avatar Group Classes
  avatarBorderUser: 'border-cyan-400 ring-2 ring-cyan-400/50',
  avatarBorderOpponent: 'border-red-400 ring-2 ring-red-400/50',
  avatarBorderNeutral: 'border-white/40 ring-2 ring-white/20',

  // Empty state specific styles
  emptyStateContainer:
    'flex flex-col items-center justify-center text-center space-y-4',
  emptyStateIcon: 'w-16 h-16 md:w-24 md:h-24 text-cyan-300 opacity-80',

  // Loading and skeleton styles
  skeletonBase: 'animate-pulse bg-white/20 rounded',
  skeletonCyan: 'animate-pulse bg-cyan-400/30 rounded',
  skeletonBlue: 'animate-pulse bg-blue-400/30 rounded',
  skeletonGreen: 'animate-pulse bg-green-400/30 rounded',
  skeletonYellow: 'animate-pulse bg-yellow-400/30 rounded',
  skeletonRed: 'animate-pulse bg-red-400/30 rounded',

  // Transition utilities
  transitionFast: 'transition-all duration-150 ease-out',
  transitionNormal: 'transition-all duration-200 ease-out',
  transitionSlow: 'transition-all duration-300 ease-out',
  transitionSmooth: 'transition-all duration-500 ease-in-out',

  // Progress bar utilities
  progressBase: 'w-full bg-white/10 rounded-full overflow-hidden',
  progressFill:
    'h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-500',
  progressCyan:
    'h-full bg-gradient-to-r from-cyan-500 to-cyan-400 transition-all duration-500',
  progressBlue:
    'h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-500',

  // Section specific styling
  sectionHeaderActive:
    'bg-green-500/10 hover:bg-green-500/20 border-green-500/30',
  sectionHeaderCompleted:
    'bg-cyan-500/10 hover:bg-cyan-500/20 border-cyan-500/30',
  sectionIconActive: 'text-green-400',
  sectionIconCompleted: 'text-cyan-400',
}
