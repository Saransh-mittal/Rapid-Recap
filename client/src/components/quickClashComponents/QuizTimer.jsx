// components/quickClashComponents/QuizTimer.jsx
import React, { useState, useEffect, useRef, memo, useMemo } from 'react'
import { HStack, Icon, Text, Box } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { Clock } from 'lucide-react'

const MotionBox = motion(Box)

/**
 * Optimized quiz timer component with preserved original logic
 * Provides accurate timing with original timer implementation but optimized rendering
 *
 * @param {Object} props Component props
 * @param {number} props.initialTime Initial time in seconds
 * @param {boolean} props.isPaused Whether the timer is paused
 * @param {boolean} props.isAttention Whether to show attention animation
 * @param {Function} props.onTimeUp Callback for when time runs out
 * @param {string} props.colorScheme Color scheme for the timer
 * @param {Function} props.onTick Callback on each tick (optional)
 */
const QuizTimer = memo(
  ({
    initialTime,
    isPaused = false,
    isAttention = false,
    onTimeUp,
    colorScheme = 'green',
    onTick,
  }) => {
    // ORIGINAL STATE STRUCTURE - PRESERVED
    const [timeLeft, setTimeLeft] = useState(initialTime)
    const timerRef = useRef(null)
    const startTimeRef = useRef(null)
    const pausedAtRef = useRef(null)

    // ORIGINAL FORMAT TIME FUNCTION - PRESERVED
    const formatTime = seconds => {
      const minutes = Math.floor(seconds / 60)
      const remainingSeconds = seconds % 60
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
    }

    // ORIGINAL TIMER INITIALIZATION/RESET LOGIC - PRESERVED
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

    // ORIGINAL PAUSE/RESUME LOGIC - PRESERVED
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

    // Memoized animation props for better performance
    const animationProps = useMemo(() => {
      if (isAttention) {
        return {
          scale: [1, 1.1, 1],
          transition: {
            duration: 0.8,
            repeat: Infinity,
            repeatType: 'reverse',
          },
        }
      }
      return {}
    }, [isAttention])

    // Memoized box shadow for better performance
    const boxShadow = useMemo(() => {
      if (isAttention) {
        return `0 0 8px var(--chakra-colors-${colorScheme}-500)`
      }
      return 'none'
    }, [isAttention, colorScheme])

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
        animate={animationProps}
        boxShadow={boxShadow}
      >
        <Icon as={Clock} />
        <Text fontFamily="mono" fontWeight="bold">
          {formatTime(timeLeft)}
        </Text>
      </MotionBox>
    )
  },
)

QuizTimer.displayName = 'QuizTimer'

export default QuizTimer
