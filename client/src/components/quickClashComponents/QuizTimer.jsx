// components/quickClashComponents/QuizTimer.jsx
import React, { useState, useEffect, useRef } from 'react'
import { HStack, Icon, Text, Box } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { Clock } from 'lucide-react'

const MotionBox = motion(Box)

/**
 * A standalone quiz timer component that ensures accurate timing
 *
 * @param {Object} props Component props
 * @param {number} props.initialTime Initial time in seconds
 * @param {boolean} props.isPaused Whether the timer is paused
 * @param {boolean} props.isAttention Whether to show attention animation
 * @param {Function} props.onTimeUp Callback for when time runs out
 * @param {string} props.colorScheme Color scheme for the timer
 * @param {Function} props.onTick Callback on each tick (optional)
 */
const QuizTimer = ({
  initialTime,
  isPaused = false,
  isAttention = false,
  onTimeUp,
  colorScheme = 'green',
  onTick,
}) => {
  const [timeLeft, setTimeLeft] = useState(initialTime)
  const timerRef = useRef(null)
  const startTimeRef = useRef(null)
  const pausedAtRef = useRef(null)

  // Format time display as MM:SS
  const formatTime = seconds => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  // Initialize or reset the timer
  useEffect(() => {
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    // Set initial time
    setTimeLeft(initialTime)

    // Don't start if paused
    if (isPaused) {
      pausedAtRef.current = initialTime
      return
    }

    // Start the timer
    startTimeRef.current = Date.now()
    pausedAtRef.current = null

    timerRef.current = setInterval(() => {
      const elapsedSeconds = Math.floor(
        (Date.now() - startTimeRef.current) / 1000,
      )
      const remaining = Math.max(0, initialTime - elapsedSeconds)

      setTimeLeft(remaining)

      if (onTick) {
        onTick(remaining)
      }

      if (remaining <= 0) {
        clearInterval(timerRef.current)
        if (onTimeUp) {
          onTimeUp()
        }
      }
    }, 1000)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [initialTime, isPaused])

  // Handle pause/resume
  useEffect(() => {
    if (isPaused && !pausedAtRef.current) {
      // Pause the timer
      if (timerRef.current) {
        clearInterval(timerRef.current)
        pausedAtRef.current = timeLeft
      }
    } else if (!isPaused && pausedAtRef.current) {
      // Resume the timer with remaining time
      startTimeRef.current =
        Date.now() - (initialTime - pausedAtRef.current) * 1000
      pausedAtRef.current = null

      timerRef.current = setInterval(() => {
        const elapsedSeconds = Math.floor(
          (Date.now() - startTimeRef.current) / 1000,
        )
        const remaining = Math.max(0, initialTime - elapsedSeconds)

        setTimeLeft(remaining)

        if (onTick) {
          onTick(remaining)
        }

        if (remaining <= 0) {
          clearInterval(timerRef.current)
          if (onTimeUp) {
            onTimeUp()
          }
        }
      }, 1000)
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isPaused])

  return (
    <MotionBox
      p={2}
      borderRadius="md"
      display="flex"
      alignItems="center"
      gap={1}
      fontSize="md"
      bg={`${colorScheme}.700`}
      color="white"
      animate={
        isAttention
          ? {
              scale: [1, 1.1, 1],
              transition: {
                duration: 0.8,
                repeat: Infinity,
                repeatType: 'reverse',
              },
            }
          : {}
      }
      boxShadow={
        isAttention ? `0 0 8px var(--chakra-colors-${colorScheme}-500)` : 'none'
      }
    >
      <Icon as={Clock} />
      <Text fontFamily="mono" fontWeight="bold">
        {formatTime(timeLeft)}
      </Text>
    </MotionBox>
  )
}

export default QuizTimer
