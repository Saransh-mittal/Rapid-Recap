// useButtonSound.js - Custom hook for adding default click sounds to buttons
// Uses Web Audio API synthetic sounds from quizAudioService

import { quizAudioService } from '../services/quizAudioService'

/**
 * Hook for adding subtle click sounds to buttons without dedicated sound effects
 *
 * Usage:
 * ```jsx
 * const { onClick } = useButtonSound()
 * <button onClick={(e) => onClick(e, handleSubmit)}>Submit</button>
 * ```
 *
 * Or wrap an existing handler:
 * ```jsx
 * const { withSound } = useButtonSound()
 * <button onClick={withSound(handleSubmit)}>Submit</button>
 * ```
 */
export const useButtonSound = () => {
  /**
   * Play click sound and call callback
   * @param {Event} e - The click event
   * @param {Function} callback - Optional callback to execute after sound
   */
  const onClick = (e, callback) => {
    quizAudioService.playButtonClick()
    callback?.(e)
  }

  /**
   * Wrap a handler function with click sound
   * @param {Function} handler - The handler to wrap
   * @returns {Function} Handler that plays sound first
   */
  const withSound = (handler) => (e) => {
    quizAudioService.playButtonClick()
    handler?.(e)
  }

  return { onClick, withSound }
}

export default useButtonSound
