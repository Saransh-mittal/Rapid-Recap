// Optimized animated scroll indicator component for GameModeLayout
// Location: client/src/components/articleComponents/AnimatedScrollIndicator.jsx

import React, { memo, useMemo } from 'react'
import { Box, Text, VStack } from '@chakra-ui/react'
import { motion } from 'framer-motion'

const MotionBox = motion(Box)
const MotionText = motion(Text)

const AnimatedScrollIndicator = memo(() => {
  // Memoized animation variants for performance
  const textVariants = useMemo(
    () => ({
      initial: {
        opacity: 0.7,
        y: 0,
        scale: 1,
      },
      animate: {
        opacity: [0.7, 1, 0.7],
        y: [0, -8, 0],
        scale: [1, 1.05, 1],
        transition: {
          duration: 2.5,
          repeat: Infinity,
          ease: [0.4, 0, 0.6, 1],
          times: [0, 0.5, 1],
        },
      },
    }),
    [],
  )

  const lineVariants = useMemo(
    () => ({
      initial: {
        scaleY: 1,
        opacity: 0.7,
        y: 0,
      },
      animate: {
        scaleY: [1, 1.3, 1],
        opacity: [0.7, 1, 0.7],
        y: [0, -4, 0],
        transition: {
          duration: 2.5,
          repeat: Infinity,
          ease: [0.4, 0, 0.6, 1],
          delay: 0.3,
          times: [0, 0.5, 1],
        },
      },
    }),
    [],
  )

  // Removed arrow variants - no longer needed

  const containerVariants = useMemo(
    () => ({
      initial: { opacity: 0 },
      animate: {
        opacity: 1,
        transition: {
          duration: 1,
          staggerChildren: 0.2,
        },
      },
    }),
    [],
  )

  // Memoized styles for performance
  const textStyles = useMemo(
    () => ({
      fontSize: 'sm',
      color: 'whiteAlpha.800',
      fontWeight: '500',
      letterSpacing: '0.5px',
      textAlign: 'center',
      userSelect: 'none',
      WebkitUserSelect: 'none',
    }),
    [],
  )

  const lineStyles = useMemo(
    () => ({
      w: '2px',
      h: '15px',
      bg: 'linear-gradient(180deg, rgba(255,255,255,0.9), rgba(255,255,255,0.3))',
      mx: 'auto',
      borderRadius: 'full',
      boxShadow: '0 0 8px rgba(255,255,255,0.3)',
      transformOrigin: 'center',
    }),
    [],
  )

  // Removed arrow styles - no longer needed

  return (
    <MotionBox
      textAlign="center"
      pb={4}
      variants={containerVariants}
      initial="initial"
      animate="animate"
      px={4}
    >
      <VStack spacing={3} align="center">
        {/* Animated Text */}
        <MotionText
          variants={textVariants}
          initial="initial"
          animate="animate"
          {...textStyles}
        >
          Scroll to start reading
        </MotionText>

        {/* Animated Line */}
        <MotionBox
          variants={lineVariants}
          initial="initial"
          animate="animate"
          {...lineStyles}
        />

        {/* Subtle pulsing dots */}
        <Box display="flex" gap={1} justifyContent="center" mt={2}>
          {[0, 1, 2].map(index => (
            <MotionBox
              key={index}
              w="3px"
              h="3px"
              bg="whiteAlpha.400"
              borderRadius="full"
              initial={{ opacity: 0.3, scale: 1 }}
              animate={{
                opacity: [0.3, 0.8, 0.3],
                scale: [1, 1.2, 1],
                transition: {
                  duration: 1.5,
                  repeat: Infinity,
                  delay: index * 0.2,
                  ease: 'easeInOut',
                },
              }}
            />
          ))}
        </Box>
      </VStack>
    </MotionBox>
  )
})

AnimatedScrollIndicator.displayName = 'AnimatedScrollIndicator'

export default AnimatedScrollIndicator
