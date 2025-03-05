// components/quickClashComponents/QuickClashBackground.jsx
import React from 'react'
import { Box } from '@chakra-ui/react'
import { motion } from 'framer-motion'

const MotionBox = motion(Box)

const QuickClashBackground = ({ children, withGlow = true }) => {
  return (
    <Box position="relative" zIndex={1}>
      {/* Semi-transparent overlay with subtle glow effects */}
      <MotionBox
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bgGradient="linear(to-b, rgba(26, 21, 39, 0.3), rgba(15, 13, 21, 0.5))"
        backdropFilter="blur(3px)"
        zIndex={-1}
        borderRadius="xl"
        overflow="hidden"
      >
        {/* Animated accent glow at the top */}
        {withGlow && (
          <>
            <MotionBox
              position="absolute"
              top="-20%"
              left="25%"
              width="50%"
              height="40%"
              bgGradient="radial(circle, rgba(138, 43, 226, 0.2), transparent 70%)"
              initial={{ opacity: 0.5 }}
              animate={{
                opacity: [0.5, 0.7, 0.5],
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />

            {/* Subtle edge accent on the left */}
            <MotionBox
              position="absolute"
              left={0}
              top="30%"
              height="40%"
              width="3px"
              bg="purple.500"
              initial={{ opacity: 0.3 }}
              animate={{
                opacity: [0.3, 0.7, 0.3],
                height: ['40%', '50%', '40%'],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />

            {/* Subtle edge accent on the right */}
            <MotionBox
              position="absolute"
              right={0}
              top="20%"
              height="30%"
              width="3px"
              bg="purple.400"
              initial={{ opacity: 0.3 }}
              animate={{
                opacity: [0.3, 0.6, 0.3],
                height: ['30%', '40%', '30%'],
              }}
              transition={{
                duration: 7,
                delay: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </>
        )}
      </MotionBox>

      {/* Content */}
      {children}
    </Box>
  )
}

export default QuickClashBackground
