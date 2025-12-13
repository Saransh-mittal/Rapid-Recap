// client/src/utils/haptics.js
// Global Haptic Feedback Utility - Works across all mobile devices
// Supports: Vibration API (Android), WebKit Taptic Engine (iOS)

/**
 * Haptic feedback patterns for different interaction types
 * Values are in milliseconds for vibration duration or pattern arrays
 */
const HAPTIC_PATTERNS = {
  // Light interactions - button taps, selections
  light: [10],

  // Medium interactions - toggle switches, card taps
  medium: [25],

  // Heavy interactions - important confirmations, dropped items
  heavy: [40],

  // Success - winning a battle, achievement unlocked
  success: [10, 50, 20, 50, 30],

  // Error - failed action, validation error
  error: [50, 30, 50, 30, 50],

  // Warning - important alert, low time warning
  warning: [30, 50, 30],

  // Selection - quick selection feedback
  selection: [8],

  // Notification - message received, update available
  notification: [15, 100, 15],

  // Impact - collision, merge, snap into place
  impact: [35, 20, 15],

  // Score - points earned, trophy change
  score: [10, 30, 10, 50, 10],

  // ═══════════════════════════════════════════════════════
  // GAME-SPECIFIC PATTERNS (for Quick Clash / Team Battle)
  // ═══════════════════════════════════════════════════════

  // Quiz/Battle start - energetic triple pulse
  quizStart: [20, 30, 20],

  // Time running out - urgent rhythm
  timeWarning: [50, 50, 50, 50],

  // Correct answer revealed - rising confirmation
  correctAnswer: [15, 50, 30],

  // Wrong answer - gentle acknowledgment (not punishing)
  wrongAnswer: [40, 30],

  // Battle victory - celebratory pattern
  battleVictory: [10, 30, 10, 50, 20, 70],
}

/**
 * Check if haptic feedback is supported on this device
 */
const isHapticSupported = () => {
  // Check for Vibration API (Android + some iOS)
  if ('vibrate' in navigator) {
    return true
  }

  // Check for WebKit Taptic Engine (iOS Safari 10+)
  // @ts-ignore
  if (window.webkit?.messageHandlers?.haptic) {
    return true
  }

  return false
}

/**
 * Check if user prefers reduced motion (accessibility)
 */
const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return false
  return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false
}

/**
 * Internal function to trigger vibration
 */
const triggerVibration = (pattern) => {
  try {
    if (navigator.vibrate) {
      // Ensure pattern is an array of numbers
      const vibrationPattern = Array.isArray(pattern) ? pattern : [pattern]
      return navigator.vibrate(vibrationPattern)
    }
    return false
  } catch (error) {
    // Silently fail - haptics are enhancement, not critical
    console.debug('[Haptics] Vibration failed:', error)
    return false
  }
}

/**
 * Create a debounced haptic trigger to prevent spam
 */
const createDebouncedHaptic = (minInterval = 50) => {
  let lastTrigger = 0

  return (pattern) => {
    const now = Date.now()
    if (now - lastTrigger < minInterval) {
      return false
    }
    lastTrigger = now
    return triggerVibration(pattern)
  }
}

// Debounced trigger instance (prevents spam, 50ms minimum between triggers)
const debouncedTrigger = createDebouncedHaptic(50)

/**
 * Main haptics API - use these methods throughout the app
 *
 * @example
 * import { haptics } from '@/utils/haptics'
 *
 * // On button tap
 * haptics.light()
 *
 * // On battle win
 * haptics.success()
 *
 * // On error
 * haptics.error()
 */
export const haptics = {
  /**
   * Light tap - for buttons, minor selections
   */
  light: () => {
    if (prefersReducedMotion()) return false
    return debouncedTrigger(HAPTIC_PATTERNS.light)
  },

  /**
   * Medium tap - for toggle switches, card interactions
   */
  medium: () => {
    if (prefersReducedMotion()) return false
    return debouncedTrigger(HAPTIC_PATTERNS.medium)
  },

  /**
   * Heavy tap - for important confirmations
   */
  heavy: () => {
    if (prefersReducedMotion()) return false
    return debouncedTrigger(HAPTIC_PATTERNS.heavy)
  },

  /**
   * Success pattern - for wins, achievements
   */
  success: () => {
    if (prefersReducedMotion()) return false
    return debouncedTrigger(HAPTIC_PATTERNS.success)
  },

  /**
   * Error pattern - for failed actions
   */
  error: () => {
    if (prefersReducedMotion()) return false
    return debouncedTrigger(HAPTIC_PATTERNS.error)
  },

  /**
   * Warning pattern - for alerts
   */
  warning: () => {
    if (prefersReducedMotion()) return false
    return debouncedTrigger(HAPTIC_PATTERNS.warning)
  },

  /**
   * Selection feedback - for quick selections
   */
  selection: () => {
    if (prefersReducedMotion()) return false
    return debouncedTrigger(HAPTIC_PATTERNS.selection)
  },

  /**
   * Notification pattern - for messages, updates
   */
  notification: () => {
    if (prefersReducedMotion()) return false
    return debouncedTrigger(HAPTIC_PATTERNS.notification)
  },

  /**
   * Impact pattern - for collisions, snaps
   */
  impact: () => {
    if (prefersReducedMotion()) return false
    return debouncedTrigger(HAPTIC_PATTERNS.impact)
  },

  /**
   * Score pattern - for points, trophies
   */
  score: () => {
    if (prefersReducedMotion()) return false
    return debouncedTrigger(HAPTIC_PATTERNS.score)
  },

  /**
   * Custom pattern - for specific needs
   * @param {number|number[]} pattern - Vibration pattern in ms
   */
  custom: (pattern) => {
    if (prefersReducedMotion()) return false
    return debouncedTrigger(pattern)
  },

  /**
   * Check if haptics are supported
   */
  isSupported: isHapticSupported,

  /**
   * Check if user prefers reduced motion
   */
  prefersReducedMotion,

  // ═══════════════════════════════════════════════════════
  // GAME-SPECIFIC HAPTICS (for Quick Clash / Team Battle)
  // ═══════════════════════════════════════════════════════

  /**
   * Quiz/Battle start - energetic pulse
   */
  quizStart: () => {
    if (prefersReducedMotion()) return false
    return debouncedTrigger(HAPTIC_PATTERNS.quizStart)
  },

  /**
   * Time warning - urgent rhythm for low timer
   */
  timeWarning: () => {
    if (prefersReducedMotion()) return false
    return debouncedTrigger(HAPTIC_PATTERNS.timeWarning)
  },

  /**
   * Correct answer revealed - celebratory confirmation
   */
  correctAnswer: () => {
    if (prefersReducedMotion()) return false
    return debouncedTrigger(HAPTIC_PATTERNS.correctAnswer)
  },

  /**
   * Wrong answer - gentle acknowledgment
   */
  wrongAnswer: () => {
    if (prefersReducedMotion()) return false
    return debouncedTrigger(HAPTIC_PATTERNS.wrongAnswer)
  },

  /**
   * Battle victory - celebration pattern
   */
  battleVictory: () => {
    if (prefersReducedMotion()) return false
    return debouncedTrigger(HAPTIC_PATTERNS.battleVictory)
  },
}

export default haptics
