// components/quickClashComponents/utils/quickClashColorsV2.js
// V2 Premium Design System for Quick Clash - Enterprise Game Level Aesthetics

// ============================================================================
// V2 COLOR PALETTE - Premium Gaming Theme
// ============================================================================

export const QUICK_CLASH_COLORS_V2 = {
  // Primary Brand Colors with richer tones
  primary: {
    main: '#06B6D4',        // Vibrant cyan
    light: '#22D3EE',       // Light cyan
    lighter: '#67E8F9',     // Very light cyan
    dark: '#0891B2',        // Dark cyan
    darker: '#0E7490',      // Darker cyan
    accent: '#0EA5E9',      // Blue accent
    accentDark: '#0284C7',  // Dark blue accent
  },

  // V2 Premium Gradients - Multi-stop animated
  gradients: {
    // Hero gradients
    hero: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)',
    heroGlow: 'radial-gradient(ellipse at center, rgba(6, 182, 212, 0.15) 0%, transparent 70%)',

    // Card gradients
    cardPremium: 'linear-gradient(145deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.6) 100%)',
    cardHover: 'linear-gradient(145deg, rgba(6, 182, 212, 0.1) 0%, rgba(14, 165, 233, 0.05) 100%)',

    // Button gradients
    buttonPrimary: 'linear-gradient(135deg, #06B6D4 0%, #0891B2 50%, #0E7490 100%)',
    buttonSecondary: 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)',
    buttonSuccess: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    buttonDanger: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
    buttonGold: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 50%, #D97706 100%)',

    // Battle gradients
    victory: 'linear-gradient(135deg, #06B6D4 0%, #0EA5E9 50%, #3B82F6 100%)',
    defeat: 'linear-gradient(135deg, #EF4444 0%, #F97316 100%)',
    draw: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)',
    active: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',

    // Progress gradients
    xpBar: 'linear-gradient(90deg, #06B6D4 0%, #22D3EE 50%, #06B6D4 100%)',
    healthBar: 'linear-gradient(90deg, #10B981 0%, #34D399 100%)',

    // Text gradients
    textPremium: 'linear-gradient(135deg, #67E8F9 0%, #06B6D4 50%, #0EA5E9 100%)',
    textGold: 'linear-gradient(135deg, #FDE68A 0%, #FBBF24 50%, #F59E0B 100%)',
  },

  // V2 Glow Effects
  glows: {
    cyan: '0 0 30px rgba(6, 182, 212, 0.4), 0 0 60px rgba(6, 182, 212, 0.2)',
    cyanIntense: '0 0 20px rgba(6, 182, 212, 0.6), 0 0 40px rgba(6, 182, 212, 0.4), 0 0 80px rgba(6, 182, 212, 0.2)',
    blue: '0 0 30px rgba(14, 165, 233, 0.4), 0 0 60px rgba(14, 165, 233, 0.2)',
    gold: '0 0 30px rgba(251, 191, 36, 0.4), 0 0 60px rgba(251, 191, 36, 0.2)',
    green: '0 0 30px rgba(16, 185, 129, 0.4), 0 0 60px rgba(16, 185, 129, 0.2)',
    red: '0 0 30px rgba(239, 68, 68, 0.4), 0 0 60px rgba(239, 68, 68, 0.2)',
    purple: '0 0 30px rgba(139, 92, 246, 0.4), 0 0 60px rgba(139, 92, 246, 0.2)',
  },

  // V2 Glass Effects - Enhanced
  glass: {
    ultraLight: 'rgba(15, 23, 42, 0.15)',
    light: 'rgba(15, 23, 42, 0.25)',
    medium: 'rgba(15, 23, 42, 0.45)',
    strong: 'rgba(15, 23, 42, 0.65)',
    dark: 'rgba(15, 23, 42, 0.85)',
    blur: {
      light: '12px',
      medium: '20px',
      strong: '32px',
    },
  },

  // V2 Border Colors
  borders: {
    subtle: 'rgba(255, 255, 255, 0.05)',
    light: 'rgba(255, 255, 255, 0.1)',
    medium: 'rgba(255, 255, 255, 0.15)',
    strong: 'rgba(255, 255, 255, 0.25)',
    cyan: 'rgba(6, 182, 212, 0.5)',
    cyanGlow: 'rgba(6, 182, 212, 0.8)',
    gold: 'rgba(251, 191, 36, 0.5)',
  },

  // V2 Shadows
  shadows: {
    card: '0 4px 20px rgba(0, 0, 0, 0.3), 0 8px 40px rgba(0, 0, 0, 0.2)',
    cardHover: '0 8px 30px rgba(0, 0, 0, 0.4), 0 16px 60px rgba(0, 0, 0, 0.3)',
    button: '0 4px 15px rgba(6, 182, 212, 0.3)',
    buttonHover: '0 6px 20px rgba(6, 182, 212, 0.4)',
    modal: '0 25px 50px rgba(0, 0, 0, 0.5)',
  },

  // Status Colors
  status: {
    active: { bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.5)', text: '#10B981' },
    pending: { bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.5)', text: '#F59E0B' },
    completed: { bg: 'rgba(6, 182, 212, 0.15)', border: 'rgba(6, 182, 212, 0.5)', text: '#06B6D4' },
    victory: { bg: 'rgba(6, 182, 212, 0.15)', border: 'rgba(6, 182, 212, 0.5)', text: '#06B6D4' },
    defeat: { bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.5)', text: '#EF4444' },
  },
}

// ============================================================================
// V2 TAILWIND CLASS PRESETS - Premium Components
// ============================================================================

export const V2_CLASSES = {
  // ---- Glass Containers ----
  glassCard: `
    bg-slate-900/45 backdrop-blur-[20px]
    border border-white/10
    rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.3)]
    transition-all duration-300
  `.replace(/\s+/g, ' ').trim(),

  glassCardHover: `
    hover:bg-slate-900/55 hover:border-white/15
    hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)]
    hover:-translate-y-1
  `.replace(/\s+/g, ' ').trim(),

  glassModal: `
    bg-slate-900/65 backdrop-blur-[32px]
    border border-white/15
    rounded-3xl shadow-[0_25px_50px_rgba(0,0,0,0.5)]
  `.replace(/\s+/g, ' ').trim(),

  // ---- Premium Buttons ----
  btnPrimary: `
    bg-gradient-to-r from-cyan-500 via-cyan-600 to-cyan-700
    hover:from-cyan-400 hover:via-cyan-500 hover:to-cyan-600
    text-white font-semibold
    px-6 py-3 rounded-xl
    shadow-[0_4px_15px_rgba(6,182,212,0.3)]
    hover:shadow-[0_6px_20px_rgba(6,182,212,0.4)]
    hover:-translate-y-0.5
    active:translate-y-0 active:shadow-[0_2px_10px_rgba(6,182,212,0.3)]
    transition-all duration-200
  `.replace(/\s+/g, ' ').trim(),

  btnSecondary: `
    bg-slate-800/60 hover:bg-slate-700/60
    border border-cyan-500/30 hover:border-cyan-400/50
    text-cyan-400 hover:text-cyan-300 font-medium
    px-5 py-2.5 rounded-xl
    transition-all duration-200
  `.replace(/\s+/g, ' ').trim(),

  btnGhost: `
    bg-transparent hover:bg-white/5
    text-white/80 hover:text-white font-medium
    px-4 py-2 rounded-lg
    transition-all duration-200
  `.replace(/\s+/g, ' ').trim(),

  // ---- Text Styles ----
  textGradientCyan: `
    bg-gradient-to-r from-cyan-300 via-cyan-400 to-blue-400
    bg-clip-text text-transparent
  `.replace(/\s+/g, ' ').trim(),

  textGradientGold: `
    bg-gradient-to-r from-yellow-200 via-yellow-400 to-orange-400
    bg-clip-text text-transparent
  `.replace(/\s+/g, ' ').trim(),

  textPrimary: 'text-white',
  textSecondary: 'text-white/70',
  textMuted: 'text-white/50',
  textGlow: 'drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]',

  // ---- Battle Card V2 ----
  battleCard: `
    bg-gradient-to-br from-slate-900/60 to-slate-800/40
    backdrop-blur-[16px]
    border border-white/10
    rounded-2xl
    shadow-[0_4px_20px_rgba(0,0,0,0.3)]
    overflow-hidden
    transition-all duration-300
    hover:border-cyan-500/30
    hover:shadow-[0_0_30px_rgba(6,182,212,0.15),0_8px_30px_rgba(0,0,0,0.4)]
    hover:-translate-y-1
  `.replace(/\s+/g, ' ').trim(),

  battleCardVictory: `
    border-cyan-500/50
    shadow-[0_0_30px_rgba(6,182,212,0.2)]
  `.replace(/\s+/g, ' ').trim(),

  battleCardDefeat: `
    border-red-500/50
    shadow-[0_0_30px_rgba(239,68,68,0.2)]
  `.replace(/\s+/g, ' ').trim(),

  // ---- Header V2 ----
  headerContainer: `
    bg-gradient-to-br from-slate-900/50 via-slate-800/30 to-slate-900/50
    backdrop-blur-[24px]
    border border-white/10
    rounded-3xl
    shadow-[0_8px_40px_rgba(0,0,0,0.3)]
    overflow-hidden
    relative
  `.replace(/\s+/g, ' ').trim(),

  // ---- Tabs V2 ----
  tabContainer: `
    bg-slate-900/40 backdrop-blur-[16px]
    border border-white/10
    rounded-2xl
    p-1.5
  `.replace(/\s+/g, ' ').trim(),

  tabItem: `
    px-4 py-2.5
    rounded-xl
    font-medium
    text-white/60 hover:text-white/90
    transition-all duration-200
    cursor-pointer
  `.replace(/\s+/g, ' ').trim(),

  tabItemActive: `
    bg-gradient-to-r from-cyan-500/20 to-blue-500/10
    text-cyan-400
    shadow-[0_0_20px_rgba(6,182,212,0.15)]
  `.replace(/\s+/g, ' ').trim(),

  // ---- Progress Bar ----
  progressBar: `
    h-2 bg-slate-800/60 rounded-full overflow-hidden
  `.replace(/\s+/g, ' ').trim(),

  progressFill: `
    h-full bg-gradient-to-r from-cyan-500 to-cyan-400
    rounded-full
    transition-all duration-500 ease-out
    shadow-[0_0_10px_rgba(6,182,212,0.5)]
  `.replace(/\s+/g, ' ').trim(),

  // ---- Avatar ----
  avatar: `
    rounded-full
    border-2 border-white/20
    shadow-lg
  `.replace(/\s+/g, ' ').trim(),

  avatarGlow: `
    ring-2 ring-cyan-400/50
    shadow-[0_0_20px_rgba(6,182,212,0.4)]
  `.replace(/\s+/g, ' ').trim(),

  // ---- Badge ----
  badge: `
    px-2.5 py-1
    rounded-full
    text-xs font-bold
    uppercase tracking-wide
  `.replace(/\s+/g, ' ').trim(),

  badgeSuccess: 'bg-green-500/20 text-green-400 border border-green-500/30',
  badgeWarning: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  badgeDanger: 'bg-red-500/20 text-red-400 border border-red-500/30',
  badgeCyan: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30',

  // ---- Skeleton Loading ----
  skeleton: `
    animate-pulse bg-gradient-to-r from-white/5 via-white/10 to-white/5
    rounded-lg
  `.replace(/\s+/g, ' ').trim(),

  shimmer: `
    relative overflow-hidden
    before:absolute before:inset-0
    before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent
    before:animate-shimmer
  `.replace(/\s+/g, ' ').trim(),

  // ---- Animations ----
  animatePulseGlow: 'animate-pulse-glow',
  animateFloat: 'animate-float',
  animateSlideUp: 'animate-slide-up',
  animateFadeIn: 'animate-fade-in',
}

// ============================================================================
// V2 ANIMATION KEYFRAMES (to be added to tailwind.config.js or global CSS)
// ============================================================================

export const V2_KEYFRAMES = `
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }

  @keyframes pulse-glow {
    0%, 100% {
      box-shadow: 0 0 20px rgba(6, 182, 212, 0.3);
      opacity: 1;
    }
    50% {
      box-shadow: 0 0 40px rgba(6, 182, 212, 0.6);
      opacity: 0.8;
    }
  }

  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-5px); }
  }

  @keyframes slide-up {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes glow-pulse {
    0%, 100% { filter: drop-shadow(0 0 10px rgba(6, 182, 212, 0.5)); }
    50% { filter: drop-shadow(0 0 20px rgba(6, 182, 212, 0.8)); }
  }

  @keyframes trophy-bounce {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  }

  @keyframes streak-flame {
    0%, 100% {
      transform: scaleY(1) translateY(0);
      opacity: 1;
    }
    50% {
      transform: scaleY(1.2) translateY(-2px);
      opacity: 0.8;
    }
  }

  @keyframes xp-shine {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
  }

  @keyframes entrance {
    from {
      opacity: 0;
      transform: scale(0.95) translateY(10px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }
`

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get V2 glass style object for inline styles
 */
export const getV2GlassStyle = (variant = 'medium') => {
  const variants = {
    light: { bg: QUICK_CLASH_COLORS_V2.glass.light, blur: '12px' },
    medium: { bg: QUICK_CLASH_COLORS_V2.glass.medium, blur: '20px' },
    strong: { bg: QUICK_CLASH_COLORS_V2.glass.strong, blur: '32px' },
  }
  const { bg, blur } = variants[variant] || variants.medium
  return {
    backgroundColor: bg,
    backdropFilter: `blur(${blur})`,
    WebkitBackdropFilter: `blur(${blur})`,
    border: `1px solid ${QUICK_CLASH_COLORS_V2.borders.light}`,
  }
}

/**
 * Get battle status styling
 */
export const getBattleStatusStyle = (status) => {
  const styles = QUICK_CLASH_COLORS_V2.status[status] || QUICK_CLASH_COLORS_V2.status.active
  return {
    backgroundColor: styles.bg,
    borderColor: styles.border,
    color: styles.text,
  }
}

/**
 * Combine class strings and filter empty
 */
export const cx = (...classes) => classes.filter(Boolean).join(' ')

export default QUICK_CLASH_COLORS_V2
