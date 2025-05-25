// customHooks/useTypewriter.js
import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * Custom hook for typewriter effect with advanced features
 * @param {Object} options - Configuration options
 * @param {string} options.text - Text to type
 * @param {number} options.speed - Typing speed in milliseconds per character
 * @param {number} options.delay - Initial delay before starting
 * @param {boolean} options.loop - Whether to loop the animation
 * @param {Function} options.onComplete - Callback when typing is complete
 * @param {Function} options.onStart - Callback when typing starts
 * @param {boolean} options.startOnMount - Whether to start immediately on mount
 * @param {Array} options.pauseAtIndices - Array of character indices to pause at
 * @param {number} options.pauseDuration - Duration of pause in milliseconds
 * @returns {Object} Typewriter state and controls
 */
const useTypewriter = ({
  text = '',
  speed = 50,
  delay = 0,
  loop = false,
  onComplete,
  onStart,
  startOnMount = true,
  pauseAtIndices = [],
  pauseDuration = 500,
} = {}) => {
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  const timeoutRef = useRef(null)
  const hasStartedRef = useRef(false)
  const isRunningRef = useRef(false)

  const clearCurrentTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  const reset = useCallback(() => {
    clearCurrentTimeout()
    setDisplayedText('')
    setCurrentIndex(0)
    setIsTyping(false)
    setIsComplete(false)
    setIsPaused(false)
    hasStartedRef.current = false
    isRunningRef.current = false
  }, [clearCurrentTimeout])

  const pause = useCallback(() => {
    setIsPaused(true)
    clearCurrentTimeout()
  }, [clearCurrentTimeout])

  const resume = useCallback(() => {
    if (isPaused && !isComplete) {
      setIsPaused(false)
    }
  }, [isPaused, isComplete])

  const skip = useCallback(() => {
    clearCurrentTimeout()
    setDisplayedText(text)
    setCurrentIndex(text.length)
    setIsTyping(false)
    setIsComplete(true)
    setIsPaused(false)
    isRunningRef.current = false

    if (onComplete) {
      onComplete()
    }
  }, [text, onComplete, clearCurrentTimeout])

  const start = useCallback(() => {
    if (hasStartedRef.current || isRunningRef.current || !text) return

    hasStartedRef.current = true
    isRunningRef.current = true
    setIsTyping(true)
    setIsComplete(false)
    setIsPaused(false)

    if (onStart) {
      onStart()
    }

    const typeNextCharacter = (index = 0) => {
      if (!isRunningRef.current) return

      if (index >= text.length) {
        // Typing complete
        setIsTyping(false)
        setIsComplete(true)
        isRunningRef.current = false

        if (onComplete) {
          onComplete()
        }

        if (loop) {
          timeoutRef.current = setTimeout(() => {
            reset()
            // Restart after reset
            setTimeout(start, delay)
          }, 1000)
        }
        return
      }

      // Check if we should pause at this index
      if (pauseAtIndices.includes(index)) {
        setIsPaused(true)
        timeoutRef.current = setTimeout(() => {
          setIsPaused(false)
          const newText = text.substring(0, index + 1)
          setDisplayedText(newText)
          setCurrentIndex(index + 1)
          typeNextCharacter(index + 1)
        }, pauseDuration)
        return
      }

      // Type the next character
      const newText = text.substring(0, index + 1)
      setDisplayedText(newText)
      setCurrentIndex(index + 1)

      // Schedule next character
      timeoutRef.current = setTimeout(() => {
        typeNextCharacter(index + 1)
      }, speed)
    }

    // Start typing after initial delay
    if (delay > 0) {
      timeoutRef.current = setTimeout(() => {
        typeNextCharacter(0)
      }, delay)
    } else {
      typeNextCharacter(0)
    }
  }, [
    text,
    speed,
    delay,
    loop,
    onComplete,
    onStart,
    pauseAtIndices,
    pauseDuration,
    reset,
  ])

  // Auto-start on mount if specified
  useEffect(() => {
    if (startOnMount && text && !hasStartedRef.current) {
      start()
    }

    return () => {
      clearCurrentTimeout()
      isRunningRef.current = false
    }
  }, [startOnMount, text, start, clearCurrentTimeout])

  // Reset when text changes
  useEffect(() => {
    if (text !== displayedText && hasStartedRef.current) {
      reset()
      if (startOnMount) {
        setTimeout(start, 100) // Small delay to ensure reset is complete
      }
    }
  }, [text, displayedText, reset, start, startOnMount])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearCurrentTimeout()
      isRunningRef.current = false
    }
  }, [clearCurrentTimeout])

  return {
    // State
    displayedText,
    isTyping,
    isComplete,
    isPaused,
    currentIndex,
    progress: text.length > 0 ? (currentIndex / text.length) * 100 : 0,

    // Controls
    start,
    pause,
    resume,
    skip,
    reset,

    // Utility functions
    togglePause: isPaused ? resume : pause,

    // Status flags
    canStart:
      !hasStartedRef.current && !isRunningRef.current && text.length > 0,
    canPause: isTyping && !isPaused,
    canResume: isPaused && !isComplete,
    canSkip: isTyping || isPaused,
    canReset: hasStartedRef.current,
  }
}

/**
 * Hook for multi-section typewriter effect
 * Useful for typing multiple sections sequentially
 */
export const useMultiTypewriter = ({
  sections = [],
  sectionDelay = 300,
  onSectionComplete,
  onAllComplete,
  ...typewriterOptions
} = {}) => {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0)
  const [completedSections, setCompletedSections] = useState([])
  const [allComplete, setAllComplete] = useState(false)

  const currentSection = sections[currentSectionIndex]

  const typewriter = useTypewriter({
    ...typewriterOptions,
    text: currentSection?.text || '',
    startOnMount: false,
    onComplete: () => {
      const newCompleted = [...completedSections, currentSectionIndex]
      setCompletedSections(newCompleted)

      if (onSectionComplete) {
        onSectionComplete(currentSectionIndex, currentSection)
      }

      // Move to next section
      if (currentSectionIndex < sections.length - 1) {
        setTimeout(() => {
          setCurrentSectionIndex(prev => prev + 1)
        }, sectionDelay)
      } else {
        // All sections complete
        setAllComplete(true)
        if (onAllComplete) {
          onAllComplete()
        }
      }
    },
  })

  const start = useCallback(() => {
    if (sections.length === 0) return
    setCurrentSectionIndex(0)
    setCompletedSections([])
    setAllComplete(false)

    // Start first section
    setTimeout(() => {
      typewriter.start()
    }, 100)
  }, [sections.length, typewriter])

  const reset = useCallback(() => {
    setCurrentSectionIndex(0)
    setCompletedSections([])
    setAllComplete(false)
    typewriter.reset()
  }, [typewriter])

  const skipToSection = useCallback(
    sectionIndex => {
      if (sectionIndex >= 0 && sectionIndex < sections.length) {
        setCurrentSectionIndex(sectionIndex)
        setCompletedSections(Array.from({ length: sectionIndex }, (_, i) => i))
        typewriter.reset()
      }
    },
    [sections.length, typewriter],
  )

  const skipAll = useCallback(() => {
    setCurrentSectionIndex(sections.length - 1)
    setCompletedSections(Array.from({ length: sections.length }, (_, i) => i))
    setAllComplete(true)
    typewriter.skip()
    if (onAllComplete) {
      onAllComplete()
    }
  }, [sections.length, typewriter, onAllComplete])

  // Auto-start when sections change
  useEffect(() => {
    if (sections.length > 0 && !typewriter.isTyping && !allComplete) {
      typewriter.start()
    }
  }, [currentSectionIndex, sections, typewriter, allComplete])

  return {
    ...typewriter,
    currentSectionIndex,
    currentSection,
    completedSections,
    allComplete,
    totalSections: sections.length,
    progress:
      sections.length > 0
        ? (completedSections.length / sections.length) * 100
        : 0,

    // Multi-section controls
    start,
    reset,
    skipToSection,
    skipAll,
  }
}

export default useTypewriter
