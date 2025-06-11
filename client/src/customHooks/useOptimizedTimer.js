// customHooks/useOptimizedTimer.js
import { useState, useEffect, useRef, useCallback } from 'react'

/**
 * Optimized timer hook for QuickClash components
 * Provides accurate timing with minimal re-renders and proper cleanup
 *
 * @param {Object} options Timer configuration
 * @param {number} options.initialTime Initial time in seconds
 * @param {boolean} options.autoStart Whether to start timer immediately
 * @param {boolean} options.isPaused Whether timer is paused
 * @param {Function} options.onTick Callback fired on each tick (throttled)
 * @param {Function} options.onTimeUp Callback fired when timer reaches 0
 * @param {number} options.tickInterval Interval between ticks in milliseconds (default: 1000)
 * @param {boolean} options.preciseTiming Use high precision timing (default: true)
 *
 * @returns {Object} Timer state and controls
 */
const useOptimizedTimer = ({
  initialTime,
  autoStart = true,
  isPaused = false,
  onTick,
  onTimeUp,
  tickInterval = 1000,
  preciseTiming = true,
}) => {
  const [timeLeft, setTimeLeft] = useState(initialTime)
  const [isRunning, setIsRunning] = useState(autoStart && !isPaused)
  const [isCompleted, setIsCompleted] = useState(false)

  // Refs for precise timing
  const timerRef = useRef(null)
  const startTimeRef = useRef(null)
  const pausedAtRef = useRef(null)
  const lastTickRef = useRef(0)

  // Memoized tick handler to prevent unnecessary re-renders
  const handleTick = useCallback(() => {
    if (!startTimeRef.current) return

    const now = Date.now()
    const elapsed = Math.floor((now - startTimeRef.current) / 1000)
    const remaining = Math.max(0, initialTime - elapsed)

    // Only update state if time has actually changed (prevents unnecessary re-renders)
    setTimeLeft(prevTime => {
      if (prevTime !== remaining) {
        // Throttled onTick callback to prevent performance issues
        if (onTick && now - lastTickRef.current >= tickInterval) {
          onTick(remaining)
          lastTickRef.current = now
        }
        return remaining
      }
      return prevTime
    })

    // Check if timer completed
    if (remaining <= 0) {
      setIsCompleted(true)
      setIsRunning(false)
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      if (onTimeUp) {
        onTimeUp()
      }
    }
  }, [initialTime, onTick, onTimeUp, tickInterval])

  // Start timer function
  const start = useCallback(() => {
    if (isCompleted) return

    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    // Calculate start time based on current progress
    const currentProgress = initialTime - timeLeft
    startTimeRef.current = Date.now() - currentProgress * 1000
    pausedAtRef.current = null
    setIsRunning(true)

    if (preciseTiming) {
      // Use requestAnimationFrame for more precise timing
      const tick = () => {
        handleTick()
        if (isRunning && !isCompleted) {
          timerRef.current = requestAnimationFrame(tick)
        }
      }
      timerRef.current = requestAnimationFrame(tick)
    } else {
      // Use setInterval for standard timing
      timerRef.current = setInterval(handleTick, tickInterval)
    }
  }, [
    timeLeft,
    initialTime,
    isRunning,
    isCompleted,
    handleTick,
    preciseTiming,
    tickInterval,
  ])

  // Pause timer function
  const pause = useCallback(() => {
    if (timerRef.current) {
      if (preciseTiming) {
        cancelAnimationFrame(timerRef.current)
      } else {
        clearInterval(timerRef.current)
      }
      timerRef.current = null
    }
    pausedAtRef.current = timeLeft
    setIsRunning(false)
  }, [timeLeft, preciseTiming])

  // Resume timer function
  const resume = useCallback(() => {
    if (!isCompleted && pausedAtRef.current !== null) {
      start()
    }
  }, [isCompleted, start])

  // Reset timer function
  const reset = useCallback(
    (newTime = initialTime) => {
      if (timerRef.current) {
        if (preciseTiming) {
          cancelAnimationFrame(timerRef.current)
        } else {
          clearInterval(timerRef.current)
        }
        timerRef.current = null
      }

      setTimeLeft(newTime)
      setIsRunning(false)
      setIsCompleted(false)
      startTimeRef.current = null
      pausedAtRef.current = null
      lastTickRef.current = 0
    },
    [initialTime, preciseTiming],
  )

  // Add time function
  const addTime = useCallback(seconds => {
    setTimeLeft(prev => Math.max(0, prev + seconds))
    if (startTimeRef.current) {
      startTimeRef.current -= seconds * 1000
    }
  }, [])

  // Format time helper
  const formatTime = useCallback(
    (time = timeLeft, format = 'mm:ss') => {
      const minutes = Math.floor(time / 60)
      const seconds = time % 60

      switch (format) {
        case 'mm:ss':
          return `${minutes}:${seconds.toString().padStart(2, '0')}`
        case 'm:ss':
          return `${minutes}:${seconds.toString().padStart(2, '0')}`
        case 'seconds':
          return time.toString()
        case 'verbose':
          return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`
        default:
          return `${minutes}:${seconds.toString().padStart(2, '0')}`
      }
    },
    [timeLeft],
  )

  // Get progress percentage
  const getProgress = useCallback(() => {
    return ((initialTime - timeLeft) / initialTime) * 100
  }, [initialTime, timeLeft])

  // Handle pause/resume based on isPaused prop
  useEffect(() => {
    if (isPaused && isRunning) {
      pause()
    } else if (!isPaused && !isRunning && !isCompleted) {
      start()
    }
  }, [isPaused, isRunning, isCompleted, pause, start])

  // Auto-start effect
  useEffect(() => {
    if (autoStart && !isPaused && !isRunning && !isCompleted) {
      start()
    }
  }, [autoStart, isPaused, isRunning, isCompleted, start])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        if (preciseTiming) {
          cancelAnimationFrame(timerRef.current)
        } else {
          clearInterval(timerRef.current)
        }
      }
    }
  }, [preciseTiming])

  return {
    // State
    timeLeft,
    isRunning,
    isPaused: !isRunning && !isCompleted,
    isCompleted,

    // Controls
    start,
    pause,
    resume,
    reset,
    addTime,

    // Helpers
    formatTime,
    getProgress,

    // Computed values
    percentage: getProgress(),
    isLow: timeLeft <= 30,
    isCritical: timeLeft <= 10,
    isUrgent: timeLeft <= 5,
  }
}

export default useOptimizedTimer
