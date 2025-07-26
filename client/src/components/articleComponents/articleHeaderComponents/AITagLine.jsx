// Final polished AITagLine component with perfect sizing and alignment
// Location: client/src/components/articleComponents/articleHeaderComponents/AITagLine.jsx

import React from 'react'
import {
  Box,
  Text,
  HStack,
  useBreakpointValue,
  useMediaQuery,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { Sparkles, Zap } from 'lucide-react'

const MotionBox = motion(Box)
const MotionHStack = motion(HStack)

const AITagLine = ({ t }) => {
  const [isMobile] = useMediaQuery('(max-width: 480px)')

  // Final polished responsive configuration
  const responsiveConfig = useBreakpointValue({
    base: {
      fontSize: '3xs',
      iconSize: 9,
      padding: 1.5,
      spacing: 0.5,
      borderRadius: 'md',
      height: '20px',
    },
    sm: {
      fontSize: '2xs',
      iconSize: 10,
      padding: 1.5,
      spacing: 1,
      borderRadius: 'md',
      height: '22px',
    },
    md: {
      fontSize: 'xs',
      iconSize: 11,
      padding: 2,
      spacing: 1,
      borderRadius: 'lg',
      height: '24px',
    },
    lg: {
      fontSize: 'xs',
      iconSize: 12,
      padding: 2,
      spacing: 1.5,
      borderRadius: 'lg',
      height: '26px',
    },
  })

  return (
    <MotionBox
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <MotionHStack
        spacing={responsiveConfig.spacing}
        bg="linear-gradient(135deg, rgba(159, 122, 234, 0.12), rgba(236, 201, 75, 0.12))"
        backdropFilter="blur(6px)"
        border="1px solid rgba(255, 255, 255, 0.18)"
        borderRadius={responsiveConfig.borderRadius}
        px={responsiveConfig.padding}
        py={1}
        color="white"
        fontWeight="600"
        fontSize={responsiveConfig.fontSize}
        boxShadow="0 2px 6px rgba(0,0,0,0.12)"
        position="relative"
        overflow="hidden"
        height={responsiveConfig.height}
        whileHover={{
          scale: 1.02,
          borderColor: 'rgba(255, 255, 255, 0.25)',
          boxShadow: '0 3px 8px rgba(0,0,0,0.15)',
        }}
        transition={{ duration: 0.2 }}
      >
        {/* Refined background shimmer effect */}
        <MotionBox
          position="absolute"
          top="0"
          left="-100%"
          width="100%"
          height="100%"
          bg="linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)"
          animate={{ x: ['0%', '200%'] }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: 'linear',
          }}
          zIndex={0}
        />

        {/* Refined sparkles icon with animation */}
        <motion.div
          animate={{
            rotate: [0, 2, -2, 0],
            scale: [1, 1.03, 1],
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{ zIndex: 1 }}
        >
          <Sparkles size={responsiveConfig.iconSize} />
        </motion.div>

        {/* Refined text content */}
        <Text
          textTransform="uppercase"
          letterSpacing="wider"
          lineHeight="1"
          zIndex={1}
          position="relative"
          textShadow="0 1px 2px rgba(0,0,0,0.2)"
        >
          {isMobile ? 'AI Enhanced' : 'Enhanced by Rapid Recap AI'}
        </Text>

        {/* Refined zap icon with animation */}
        <motion.div
          animate={{
            opacity: [0.7, 1, 0.7],
            scale: [1, 1.08, 1],
          }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.6,
          }}
          style={{ zIndex: 1 }}
        >
          <Zap size={responsiveConfig.iconSize} />
        </motion.div>

        {/* Single refined particle effect */}
        <Box
          position="absolute"
          w="0.5px"
          h="0.5px"
          bg="rgba(255, 255, 255, 0.6)"
          borderRadius="full"
          top="40%"
          left="25%"
          animation="final-float-ai 2.5s ease-in-out infinite"
          sx={{
            '@keyframes final-float-ai': {
              '0%, 100%': {
                transform: 'translateY(0px)',
                opacity: 0.3,
              },
              '50%': {
                transform: 'translateY(-1.5px)',
                opacity: 1,
              },
            },
          }}
          style={{ zIndex: 1 }}
        />
      </MotionHStack>
    </MotionBox>
  )
}

export default AITagLine
