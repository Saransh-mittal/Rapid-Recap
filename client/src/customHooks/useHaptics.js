// client/src/customHooks/useHaptics.js
// React hook wrapper for haptic feedback with enhanced features

import { useCallback, useMemo } from 'react'
import { haptics } from '../utils/haptics'

/**
 * React hook for haptic feedback with memoization and easy-to-use API
 *
 * @example
 * const { triggerHaptic, isSupported } = useHaptics()
 *
 * // In onClick handler
 * const handleClick = () => {
 *   triggerHaptic('light')
 *   // ... rest of handler
 * }
 *
 * @returns {Object} Haptic feedback methods and status
 */
export const useHaptics = () => {
  // Memoized haptic triggers to prevent unnecessary re-renders
  const triggerLight = useCallback(() => haptics.light(), [])
  const triggerMedium = useCallback(() => haptics.medium(), [])
  const triggerHeavy = useCallback(() => haptics.heavy(), [])
  const triggerSuccess = useCallback(() => haptics.success(), [])
  const triggerError = useCallback(() => haptics.error(), [])
  const triggerWarning = useCallback(() => haptics.warning(), [])
  const triggerSelection = useCallback(() => haptics.selection(), [])
  const triggerNotification = useCallback(() => haptics.notification(), [])
  const triggerImpact = useCallback(() => haptics.impact(), [])
  const triggerScore = useCallback(() => haptics.score(), [])

  /**
   * Trigger haptic by type name
   * @param {'light'|'medium'|'heavy'|'success'|'error'|'warning'|'selection'|'notification'|'impact'|'score'} type
   */
  const triggerHaptic = useCallback((type = 'light') => {
    switch (type) {
      case 'light':
        return haptics.light()
      case 'medium':
        return haptics.medium()
      case 'heavy':
        return haptics.heavy()
      case 'success':
        return haptics.success()
      case 'error':
        return haptics.error()
      case 'warning':
        return haptics.warning()
      case 'selection':
        return haptics.selection()
      case 'notification':
        return haptics.notification()
      case 'impact':
        return haptics.impact()
      case 'score':
        return haptics.score()
      default:
        return haptics.light()
    }
  }, [])

  // Memoized return value
  return useMemo(() => ({
    // Individual triggers for optimal performance
    triggerLight,
    triggerMedium,
    triggerHeavy,
    triggerSuccess,
    triggerError,
    triggerWarning,
    triggerSelection,
    triggerNotification,
    triggerImpact,
    triggerScore,

    // Generic trigger by type name
    triggerHaptic,

    // Status checks
    isSupported: haptics.isSupported(),
    prefersReducedMotion: haptics.prefersReducedMotion(),

    // Direct access to haptics utility
    haptics,
  }), [
    triggerLight,
    triggerMedium,
    triggerHeavy,
    triggerSuccess,
    triggerError,
    triggerWarning,
    triggerSelection,
    triggerNotification,
    triggerImpact,
    triggerScore,
    triggerHaptic,
  ])
}

export default useHaptics
