// client/src/components/articleComponents/hooks/useContentPagesCalculator.js
// PRODUCTION-OPTIMIZED VERSION: Enhanced communication between components

import { useEffect, useRef, useCallback } from 'react'
import { debounce } from 'lodash'

// Constants for optimization
const EMIT_DEBOUNCE_MS = 100
const EVENT_NAME = 'contentPagesCalculated'

export const useContentPagesCalculator = () => {
  const hasEmittedRef = useRef(false)
  const lastEmittedPagesRef = useRef(0)
  const eventListenerRef = useRef(null)
  const timeoutRef = useRef(null)

  // Debounced emit function to prevent spam
  const debouncedEmit = useRef(
    debounce(totalPages => {
      try {
        // Only emit if pages changed and is valid
        if (
          totalPages > 0 &&
          totalPages !== lastEmittedPagesRef.current &&
          !hasEmittedRef.current
        ) {
          const event = new CustomEvent(EVENT_NAME, {
            detail: { totalPages },
            bubbles: false,
            cancelable: false,
          })

          window.dispatchEvent(event)
          hasEmittedRef.current = true
          lastEmittedPagesRef.current = totalPages
        }
      } catch (error) {
        // Silently handle any emission errors
      }
    }, EMIT_DEBOUNCE_MS),
  ).current

  const emitContentPagesCalculated = useCallback(
    totalPages => {
      // Validate input
      if (typeof totalPages !== 'number' || totalPages <= 0) {
        return
      }

      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // Debounce the emission
      debouncedEmit(totalPages)

      // Auto-reset after a reasonable time to allow for new content
      timeoutRef.current = setTimeout(() => {
        resetCalculation()
      }, 5000)
    },
    [debouncedEmit],
  )

  const resetCalculation = useCallback(() => {
    try {
      hasEmittedRef.current = false
      lastEmittedPagesRef.current = 0

      // Cancel any pending debounced emissions
      debouncedEmit.cancel()

      // Clear timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    } catch (error) {
      // Silently handle reset errors
    }
  }, [debouncedEmit])

  // Enhanced cleanup on unmount
  useEffect(() => {
    return () => {
      try {
        // Cancel debounced function
        debouncedEmit.cancel()

        // Clear timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }

        // Remove any event listeners if they exist
        if (eventListenerRef.current) {
          window.removeEventListener(EVENT_NAME, eventListenerRef.current)
        }

        // Reset refs
        hasEmittedRef.current = false
        lastEmittedPagesRef.current = 0
      } catch (error) {
        // Silently handle cleanup errors
      }
    }
  }, [debouncedEmit])

  return {
    emitContentPagesCalculated,
    resetCalculation,
  }
}
