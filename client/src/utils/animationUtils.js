// Animation Performance Utilities
// Location: client/src/utils/animationUtils.js
// This is a new file to be created

/**
 * Optimized animation configurations for smooth performance
 */

// Hardware-accelerated transition presets
export const transitionPresets = {
  // Ultra smooth for page transitions
  smooth: {
    type: 'tween',
    ease: [0.25, 0.46, 0.45, 0.94], // Custom easing curve
    duration: 0.4,
  },

  // Spring-based for natural feel
  spring: {
    type: 'spring',
    stiffness: 300,
    damping: 30,
    mass: 0.8,
  },

  // Quick and snappy
  snappy: {
    type: 'tween',
    ease: [0.4, 0, 0.2, 1],
    duration: 0.3,
  },

  // Gentle bounce
  bounce: {
    type: 'spring',
    stiffness: 400,
    damping: 25,
    mass: 1,
  },

  // Slow and smooth for large elements
  heavy: {
    type: 'tween',
    ease: [0.23, 1, 0.32, 1],
    duration: 0.6,
  },
}

// Page transition variants optimized for performance
export const pageVariants = {
  slideUp: {
    enter: (direction = 1) => ({
      y: direction > 0 ? '100vh' : '-100vh',
      opacity: 0,
      scale: 0.98,
      filter: 'blur(2px)',
    }),
    center: {
      y: 0,
      opacity: 1,
      scale: 1,
      filter: 'blur(0px)',
    },
    exit: (direction = 1) => ({
      y: direction < 0 ? '100vh' : '-100vh',
      opacity: 0,
      scale: 0.98,
      filter: 'blur(2px)',
    }),
  },

  fade: {
    enter: {
      opacity: 0,
      scale: 0.95,
    },
    center: {
      opacity: 1,
      scale: 1,
    },
    exit: {
      opacity: 0,
      scale: 1.05,
    },
  },

  slideHorizontal: {
    enter: (direction = 1) => ({
      x: direction > 0 ? '100vw' : '-100vw',
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction = 1) => ({
      x: direction < 0 ? '100vw' : '-100vw',
      opacity: 0,
    }),
  },
}

// Animation utilities for performance optimization
export const animationUtils = {
  /**
   * Creates optimized motion styles for hardware acceleration
   */
  getOptimizedMotionStyles: () => ({
    willChange: 'transform, opacity',
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
    transform: 'translateZ(0)',
    WebkitTransform: 'translateZ(0)',
  }),

  /**
   * Debounced animation trigger to prevent spam
   */
  createDebouncedTrigger: (callback, delay = 100) => {
    let timeoutId
    let lastCall = 0

    return (...args) => {
      const now = Date.now()

      clearTimeout(timeoutId)

      if (now - lastCall >= delay) {
        lastCall = now
        callback(...args)
      } else {
        timeoutId = setTimeout(() => {
          lastCall = Date.now()
          callback(...args)
        }, delay - (now - lastCall))
      }
    }
  },

  /**
   * Smooth scroll with easing
   */
  smoothScrollTo: (
    element,
    targetPosition,
    duration = 400,
    easing = 'easeOutCubic',
  ) => {
    const start = element.scrollTop
    const distance = targetPosition - start
    const startTime = performance.now()

    const easingFunctions = {
      easeOutCubic: t => 1 - Math.pow(1 - t, 3),
      easeInOutCubic: t =>
        t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
      easeOutQuart: t => 1 - Math.pow(1 - t, 4),
    }

    const easingFunc = easingFunctions[easing] || easingFunctions.easeOutCubic

    const scroll = currentTime => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easedProgress = easingFunc(progress)

      element.scrollTop = start + distance * easedProgress

      if (progress < 1) {
        requestAnimationFrame(scroll)
      }
    }

    requestAnimationFrame(scroll)
  },

  /**
   * Creates performance-optimized intersection observer
   */
  createOptimizedObserver: (callback, options = {}) => {
    const defaultOptions = {
      threshold: [0.1, 0.5, 0.9],
      rootMargin: '-10% 0px -10% 0px',
      ...options,
    }

    return new IntersectionObserver(callback, defaultOptions)
  },

  /**
   * RAF-based state updater for smooth animations
   */
  createSmoothStateUpdater: setState => {
    let rafId
    let pendingUpdate

    return newState => {
      pendingUpdate = newState

      if (rafId) return

      rafId = requestAnimationFrame(() => {
        setState(pendingUpdate)
        rafId = null
        pendingUpdate = null
      })
    }
  },

  /**
   * Optimized touch/gesture handler
   */
  createOptimizedGestureHandler: ({
    onStart,
    onMove,
    onEnd,
    threshold = 50,
    timeThreshold = 300,
  }) => {
    let gestureState = {
      isActive: false,
      startX: 0,
      startY: 0,
      startTime: 0,
      velocity: { x: 0, y: 0 },
      lastX: 0,
      lastY: 0,
      lastTime: 0,
    }

    const handleStart = e => {
      const point = e.touches ? e.touches[0] : e
      const now = performance.now()

      gestureState = {
        isActive: true,
        startX: point.clientX,
        startY: point.clientY,
        startTime: now,
        velocity: { x: 0, y: 0 },
        lastX: point.clientX,
        lastY: point.clientY,
        lastTime: now,
      }

      onStart?.(gestureState)
    }

    const handleMove = e => {
      if (!gestureState.isActive) return

      const point = e.touches ? e.touches[0] : e
      const now = performance.now()
      const deltaTime = now - gestureState.lastTime

      if (deltaTime > 0) {
        gestureState.velocity = {
          x: (point.clientX - gestureState.lastX) / deltaTime,
          y: (point.clientY - gestureState.lastY) / deltaTime,
        }
      }

      gestureState.lastX = point.clientX
      gestureState.lastY = point.clientY
      gestureState.lastTime = now

      onMove?.(gestureState, {
        deltaX: point.clientX - gestureState.startX,
        deltaY: point.clientY - gestureState.startY,
      })
    }

    const handleEnd = e => {
      if (!gestureState.isActive) return

      const point = e.changedTouches ? e.changedTouches[0] : e
      const deltaX = point.clientX - gestureState.startX
      const deltaY = point.clientY - gestureState.startY
      const deltaTime = performance.now() - gestureState.startTime
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

      const isValidGesture =
        distance > threshold ||
        Math.abs(gestureState.velocity.x) > 0.3 ||
        Math.abs(gestureState.velocity.y) > 0.3

      gestureState.isActive = false

      onEnd?.(gestureState, {
        deltaX,
        deltaY,
        deltaTime,
        distance,
        isValid: isValidGesture && deltaTime < timeThreshold,
      })
    }

    return {
      handleStart,
      handleMove,
      handleEnd,
      getState: () => gestureState,
    }
  },
}

// CSS-in-JS optimization helpers
export const cssOptimizations = {
  /**
   * Hardware acceleration styles
   */
  hardwareAccelerated: {
    willChange: 'transform, opacity',
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
    transform: 'translateZ(0)',
    WebkitTransform: 'translateZ(0)',
  },

  /**
   * Smooth scrolling container
   */
  smoothScrollContainer: {
    scrollBehavior: 'smooth',
    WebkitOverflowScrolling: 'touch',
    overscrollBehavior: 'contain',
    // Custom scrollbar for better UX
    '&::-webkit-scrollbar': {
      width: '6px',
    },
    '&::-webkit-scrollbar-track': {
      background: 'rgba(255,255,255,0.1)',
      borderRadius: '3px',
    },
    '&::-webkit-scrollbar-thumb': {
      background:
        'linear-gradient(180deg, rgba(159, 122, 234, 0.8), rgba(214, 158, 46, 0.8))',
      borderRadius: '3px',
      transition: 'background 0.3s ease',
    },
    '&::-webkit-scrollbar-thumb:hover': {
      background:
        'linear-gradient(180deg, rgba(159, 122, 234, 1), rgba(214, 158, 46, 1))',
    },
  },

  /**
   * Optimized backdrop filter
   */
  optimizedBackdrop: {
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    // Fallback for older browsers
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
}

// Performance monitoring utilities
export const performanceUtils = {
  /**
   * Measures animation performance
   */
  measureAnimationPerformance: (name, animationFn) => {
    return async (...args) => {
      const startTime = performance.now()

      try {
        const result = await animationFn(...args)
        const endTime = performance.now()

        console.log(`Animation "${name}" took ${endTime - startTime}ms`)

        return result
      } catch (error) {
        console.error(`Animation "${name}" failed:`, error)
        throw error
      }
    }
  },

  /**
   * FPS monitor for development
   */
  createFPSMonitor: () => {
    let frames = 0
    let lastTime = performance.now()
    let fps = 60

    const updateFPS = currentTime => {
      frames++

      if (currentTime >= lastTime + 1000) {
        fps = Math.round((frames * 1000) / (currentTime - lastTime))
        frames = 0
        lastTime = currentTime

        // Log if FPS drops below 45
        if (fps < 45) {
          console.warn(`Low FPS detected: ${fps}`)
        }
      }

      requestAnimationFrame(updateFPS)
    }

    requestAnimationFrame(updateFPS)

    return () => fps
  },

  /**
   * Memory usage monitor for animations
   */
  monitorMemoryUsage: () => {
    if ('memory' in performance) {
      const memory = performance.memory
      return {
        used: Math.round(memory.usedJSHeapSize / 1048576), // MB
        total: Math.round(memory.totalJSHeapSize / 1048576), // MB
        limit: Math.round(memory.jsHeapSizeLimit / 1048576), // MB
      }
    }
    return null
  },
}

export default {
  transitionPresets,
  pageVariants,
  animationUtils,
  cssOptimizations,
  performanceUtils,
}
