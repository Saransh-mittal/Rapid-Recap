import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { Box, Flex, Text, useTheme } from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'

// MotionBox component using motion from framer-motion
const MotionBox = motion(Box)

const ShutterAnimation = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true)
  const theme = useTheme()
  const { t } = useTranslation('ShutterAnimation')

  // Memoizing the shutter color to prevent recalculating on each render
  const shutterColor = useMemo(() => {
    return theme.colors.yellow?.[600] || theme.colors.yellow || '#B7791F'
  }, [theme])

  // Callback to trigger when the animation completes
  const handleComplete = useCallback(() => {
    if (onComplete) {
      onComplete()
    }
  }, [onComplete])

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false) // Hide the animation after 3 seconds
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <AnimatePresence onExitComplete={handleComplete}>
      {isVisible && (
        <Flex
          position="fixed"
          top="0"
          left="0"
          right="0"
          bottom="0"
          alignItems="center"
          justifyContent="center"
          bg="gray.900"
          zIndex={9999}
        >
          {/* MotionBox for left and right shutters */}
          <MotionBox
            position="absolute"
            inset="0"
            display="flex"
            initial="closed"
            animate="open"
            exit="closed"
          >
            <MotionBox
              w="50%"
              h="100%"
              bg={shutterColor}
              variants={{
                open: { x: 0 },
                closed: { x: '-100%' },
              }}
              transition={{ duration: 1.5, ease: [0.6, 0.05, -0.01, 0.9] }}
            />
            <MotionBox
              w="50%"
              h="100%"
              bg={shutterColor}
              variants={{
                open: { x: 0 },
                closed: { x: '100%' },
              }}
              transition={{ duration: 1.5, ease: [0.6, 0.05, -0.01, 0.9] }}
            />
          </MotionBox>

          {/* Centered text content */}
          <Flex
            zIndex={10}
            flexDirection="column"
            alignItems="center"
            textAlign="center"
          >
            <Text
              fontSize="4xl"
              fontWeight="bold"
              color="white"
              mb={4}
              textShadow="0 0 10px rgba(255,215,0,0.5)"
            >
              {t('Rapid Recap Tournament')}
            </Text>
            <Text
              fontSize="xl"
              color="white"
              textShadow="0 0 5px rgba(255,215,0,0.3)"
            >
              {t('Get ready to begin!')}
            </Text>
          </Flex>

          {/* Subtle background gradient effect */}
          <Box
            position="absolute"
            inset="0"
            pointerEvents="none"
            bgGradient={`linear(to-br, ${shutterColor}, yellow.400)`}
            opacity={0.2}
          />
        </Flex>
      )}
    </AnimatePresence>
  )
}

export default ShutterAnimation
