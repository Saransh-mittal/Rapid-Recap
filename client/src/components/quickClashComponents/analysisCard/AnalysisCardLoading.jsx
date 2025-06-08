// components/quickClashComponents/analysisCard/AnalysisCardLoading.jsx
import React, { useState, useEffect, useRef, useMemo } from 'react'
import {
  Box,
  VStack,
  Text,
  Icon,
  Circle,
  useBreakpointValue,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Brain, Sparkles } from 'lucide-react'

const MotionBox = motion(Box)
const MotionText = motion(Text)
const MotionIcon = motion(Icon)
const MotionCircle = motion(Circle)

/**
 * Optimized Premium AI Analysis Loading Component
 * Consistent progress, smooth animations, performance optimized
 */
const AnalysisCardLoading = () => {
  const { t } = useTranslation('QuickClash')
  const [progress, setProgress] = useState(0)
  const intervalRef = useRef(null)
  const isComplete = useRef(false)

  // Responsive values - memoized for performance
  const padding = useBreakpointValue({ base: 4, md: 6 })

  // Memoized animation variants for better performance
  const pulseVariants = useMemo(
    () => ({
      ring1: {
        scale: [0.5, 1.5],
        opacity: [0, 0.7, 0],
        transition: {
          duration: 2.5,
          repeat: Infinity,
          ease: 'easeOut',
        },
      },
      ring2: {
        scale: [0.5, 1.8],
        opacity: [0, 0.5, 0],
        transition: {
          duration: 2.5,
          repeat: Infinity,
          delay: 0.5,
          ease: 'easeOut',
        },
      },
      ring3: {
        scale: [0.5, 2.1],
        opacity: [0, 0.3, 0],
        transition: {
          duration: 2.5,
          repeat: Infinity,
          delay: 1,
          ease: 'easeOut',
        },
      },
    }),
    [],
  )

  const textVariants = useMemo(
    () => ({
      pulse: {
        opacity: [0.9, 1, 0.9],
        transition: {
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      },
      subtitle: {
        opacity: [0.7, 1, 0.7],
        transition: {
          duration: 1.5,
          repeat: Infinity,
          delay: 0.5,
          ease: 'easeInOut',
        },
      },
    }),
    [],
  )

  // Consistent progress increment with smooth completion
  useEffect(() => {
    if (isComplete.current) return

    intervalRef.current = setInterval(() => {
      setProgress(prev => {
        const increment = 2.5 // Consistent 2.5% increment
        const newProgress = prev + increment

        if (newProgress >= 100) {
          isComplete.current = true
          clearInterval(intervalRef.current)
          return 100
        }

        return newProgress
      })
    }, 300) // Every 300ms for smooth animation

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return (
    <MotionBox
      width="100%"
      height="100%"
      minHeight="280px"
      position="relative"
      overflow="hidden"
      borderRadius="xl"
      bg="linear-gradient(135deg, rgba(26, 32, 44, 0.95), rgba(45, 55, 72, 0.9))"
      borderWidth="1px"
      borderColor="rgba(124, 58, 237, 0.3)"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      boxShadow="0 8px 32px rgba(124, 58, 237, 0.15)"
      willChange="transform"
    >
      {/* Optimized background gradient */}
      <MotionBox
        position="absolute"
        top="0"
        left="0"
        right="0"
        bottom="0"
        bgGradient="radial(circle at 70% 30%, rgba(124, 58, 237, 0.1), transparent 60%)"
        animate={{
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Corner accents - using transform for better performance */}
      <Box
        position="absolute"
        top="1"
        left="1"
        width="20px"
        height="20px"
        borderTop="2px solid"
        borderLeft="2px solid"
        borderColor="purple.400"
        borderTopLeftRadius="xl"
      />
      <Box
        position="absolute"
        bottom="1"
        right="1"
        width="20px"
        height="20px"
        borderBottom="2px solid"
        borderRight="2px solid"
        borderColor="purple.400"
        borderBottomRightRadius="xl"
      />

      <VStack
        spacing={6}
        p={padding}
        position="relative"
        zIndex={2}
        height="100%"
        justify="center"
      >
        {/* Optimized AI Brain Icon */}
        <MotionBox
          position="relative"
          display="flex"
          alignItems="center"
          justifyContent="center"
          width="80px"
          height="80px"
        >
          {/* Thinking pulse rings - optimized animations */}
          <MotionCircle
            position="absolute"
            size="60px"
            borderWidth="1px"
            borderColor="purple.400"
            bg="transparent"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={pulseVariants.ring1}
          />

          <MotionCircle
            position="absolute"
            size="60px"
            borderWidth="1px"
            borderColor="purple.300"
            bg="transparent"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={pulseVariants.ring2}
          />

          <MotionCircle
            position="absolute"
            size="60px"
            borderWidth="1px"
            borderColor="purple.200"
            bg="transparent"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={pulseVariants.ring3}
          />

          {/* Main brain container */}
          <MotionCircle
            size="80px"
            bg="rgba(124, 58, 237, 0.1)"
            borderWidth="2px"
            borderColor="purple.400"
            display="flex"
            alignItems="center"
            justifyContent="center"
            animate={{
              borderColor: [
                'rgba(124, 58, 237, 0.4)',
                'rgba(124, 58, 237, 0.8)',
                'rgba(124, 58, 237, 0.4)',
              ],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            {/* Brain icon */}
            <MotionIcon
              as={Brain}
              color="purple.400"
              boxSize={8}
              animate={{
                scale: [1, 1.05, 1],
                opacity: [0.8, 1, 0.8],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </MotionCircle>

          {/* Thinking sparkle */}
          <MotionIcon
            as={Sparkles}
            position="absolute"
            top="-5px"
            right="-5px"
            color="purple.300"
            boxSize={3}
            animate={{
              opacity: [0, 1, 0],
              rotate: [0, 180, 360],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: 1.5,
            }}
          />
        </MotionBox>

        {/* Optimized typography */}
        <VStack spacing={2} textAlign="center">
          <MotionText
            color="white"
            fontWeight="600"
            fontSize={{ base: 'lg', md: 'xl' }}
            letterSpacing="wide"
            variants={textVariants}
            animate="pulse"
          >
            {t('AI Analysis')}
          </MotionText>

          <MotionText
            color="purple.300"
            fontSize={{ base: 'sm', md: 'md' }}
            fontWeight="400"
            variants={textVariants}
            animate="subtitle"
          >
            {t('Processing battle data')}
          </MotionText>
        </VStack>

        {/* Optimized progress bar */}
        <VStack spacing={2} width="100%" maxW="200px">
          <MotionBox
            width="100%"
            height="6px"
            bg="rgba(124, 58, 237, 0.2)"
            borderRadius="full"
            overflow="hidden"
            position="relative"
            boxShadow="inset 0 1px 3px rgba(0, 0, 0, 0.3)"
          >
            <MotionBox
              height="100%"
              bgGradient="linear(to-r, purple.500, blue.400, purple.500)"
              borderRadius="full"
              position="relative"
              initial={{ width: '0%' }}
              animate={{
                width: `${progress}%`,
              }}
              transition={{
                duration: 0.3,
                ease: 'easeOut',
              }}
            >
              {/* Optimized shine effect */}
              {progress > 0 && progress < 100 && (
                <MotionBox
                  position="absolute"
                  top="0"
                  left="0"
                  right="0"
                  bottom="0"
                  bgGradient="linear(to-r, transparent, rgba(255,255,255,0.3), transparent)"
                  animate={{
                    x: ['-100%', '200%'],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                />
              )}
            </MotionBox>
          </MotionBox>

          {/* Progress percentage */}
          <MotionText
            color="purple.300"
            fontSize="xs"
            fontWeight="500"
            animate={
              progress < 100 ? { opacity: [0.6, 1, 0.6] } : { opacity: 1 }
            }
            transition={progress < 100 ? { duration: 1, repeat: Infinity } : {}}
          >
            {Math.floor(progress)}%
          </MotionText>
        </VStack>

        {/* Status dots - only animate while not complete */}
        <MotionBox mt={2}>
          <Box display="flex" gap={2}>
            {Array.from({ length: 3 }).map((_, i) => (
              <MotionCircle
                key={i}
                size="6px"
                bg="purple.400"
                animate={
                  isComplete.current
                    ? { opacity: 1, scale: 1 }
                    : {
                        scale: [0.8, 1.2, 0.8],
                        opacity: [0.4, 1, 0.4],
                      }
                }
                transition={
                  isComplete.current
                    ? {}
                    : {
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.2,
                      }
                }
              />
            ))}
          </Box>
        </MotionBox>
      </VStack>

      {/* Optimized scanning line - stops when complete */}
      {!isComplete.current && (
        <MotionBox
          position="absolute"
          top="0"
          left="0"
          right="0"
          height="1px"
          bgGradient="linear(to-r, transparent, purple.400, transparent)"
          animate={{
            y: [0, 280, 0],
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}
    </MotionBox>
  )
}

export default AnalysisCardLoading
