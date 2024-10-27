/**
 * SSR-safe animation hook that works with Framer Motion
 */

import { useEffect, useRef, useCallback } from 'react'
import { isClient } from '../utils/environment'

export const useSafeAnimation = (options = {}) => {
  const {
    duration = 1000,
    enabled = true,
    onStart,
    onComplete,
    onUpdate,
  } = options

  const frameRef = useRef(null)
  const startTimeRef = useRef(null)
  const isAnimatingRef = useRef(false)

  const cancelAnimation = useCallback(() => {
    if (frameRef.current && isClient) {
      cancelAnimationFrame(frameRef.current)
      frameRef.current = null
      isAnimatingRef.current = false
    }
  }, [])

  const animate = useCallback(
    timestamp => {
      if (!isClient || !enabled) return

      if (!startTimeRef.current) {
        startTimeRef.current = timestamp
        onStart?.()
      }

      const elapsed = timestamp - startTimeRef.current
      const progress = Math.min(elapsed / duration, 1)

      onUpdate?.(progress)

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate)
      } else {
        onComplete?.()
        isAnimatingRef.current = false
        startTimeRef.current = null
      }
    },
    [duration, enabled, onStart, onUpdate, onComplete],
  )

  const startAnimation = useCallback(() => {
    if (!isClient || !enabled || isAnimatingRef.current) return

    cancelAnimation()
    isAnimatingRef.current = true
    startTimeRef.current = null
    frameRef.current = requestAnimationFrame(animate)
  }, [enabled, animate, cancelAnimation])

  useEffect(() => {
    return () => {
      cancelAnimation()
    }
  }, [cancelAnimation])

  return {
    startAnimation,
    cancelAnimation,
    isAnimating: isAnimatingRef.current,
  }
}

// Safe variants for Framer Motion
export const getSafeVariants = (variants = {}) => {
  if (!isClient) {
    // Return simplified variants for SSR
    return Object.keys(variants).reduce((acc, key) => {
      acc[key] = { opacity: 1 }
      return acc
    }, {})
  }
  return variants
}

// Safe transition defaults
export const getSafeTransition = (transition = {}) => {
  if (!isClient) {
    return { duration: 0 }
  }
  return transition
}
