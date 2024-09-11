import React, { useState, useEffect } from 'react'
import { Box, Flex, Text, useTheme } from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'

const MotionBox = motion(Box)

const ShutterAnimation = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true)
  const theme = useTheme()

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
    }, 3000) // Show for 3 seconds before starting to close

    return () => clearTimeout(timer)
  }, [])

  const shutterColor =
    theme.colors.yellow?.[600] || theme.colors.yellow || '#B7791F'

  return (
    <AnimatePresence onExitComplete={onComplete}>
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
              Rapid Recap Tournament
            </Text>
            <Text
              fontSize="xl"
              color="white"
              textShadow="0 0 5px rgba(255,215,0,0.3)"
            >
              Get ready to begin!
            </Text>
          </Flex>

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
