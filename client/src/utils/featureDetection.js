import { isClient } from './environment'
import React from 'react'

export const detectFeatures = () => {
  if (!isClient) {
    return {
      hasAudioSupport: false,
      hasAnimationSupport: false,
      hasWebGL: false,
      hasMotionReduction: false,
    }
  }

  return {
    // Audio API Support
    hasAudioSupport:
      typeof (window.AudioContext || window.webkitAudioContext) !== 'undefined',

    // Animation Support
    hasAnimationSupport:
      typeof document.createElement('div').animate === 'function',

    // WebGL Support for advanced animations
    hasWebGL: (() => {
      try {
        const canvas = document.createElement('canvas')
        return !!(
          window.WebGLRenderingContext &&
          (canvas.getContext('webgl') ||
            canvas.getContext('experimental-webgl'))
        )
      } catch (e) {
        return false
      }
    })(),

    // Check for reduced motion preference
    hasMotionReduction:
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  }
}

// Hook for feature detection
export const useFeatureDetection = () => {
  const [features, setFeatures] = React.useState(() => detectFeatures())

  React.useEffect(() => {
    if (isClient) {
      setFeatures(detectFeatures())
    }
  }, [])

  return features
}
