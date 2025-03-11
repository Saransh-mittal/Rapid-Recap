// components/quickClashComponents/QuickClashEntrance.jsx
import React, { useEffect } from 'react'
import { Box, Text, Center, Flex, Heading } from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Swords } from 'lucide-react'

const MotionBox = motion(Box)
const MotionFlex = motion(Flex)
const MotionText = motion(Text)
const MotionHeading = motion(Heading)

const QuickClashEntrance = ({ onComplete }) => {
  useEffect(() => {
    // Auto-complete after 2 seconds
    const timer = setTimeout(() => {
      if (onComplete) onComplete()
    }, 2000)

    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <Box
      position="fixed"
      top="0"
      left="0"
      right="0"
      bottom="0"
      zIndex="9999"
      bgGradient="linear(to-b, purple.900, #0D0A14)"
      overflow="hidden"
    >
      {/* Animated particles in background */}
      <AnimatePresence>
        {[...Array(15)].map((_, i) => (
          <MotionBox
            key={i}
            position="absolute"
            w={`${Math.random() * 6 + 2}px`}
            h={`${Math.random() * 6 + 2}px`}
            bg="whiteAlpha.600"
            borderRadius="full"
            initial={{
              x: `${Math.random() * 100}vw`,
              y: `${Math.random() * 100}vh`,
              opacity: 0,
            }}
            animate={{
              y: [`${Math.random() * 100}vh`, `${Math.random() * 100 - 20}vh`],
              opacity: [0, 0.7, 0],
            }}
            transition={{
              duration: Math.random() * 1 + 1.5,
              ease: 'easeInOut',
            }}
          />
        ))}
      </AnimatePresence>

      <Center h="100vh" flexDirection="column">
        {/* Main content */}
        <MotionFlex
          alignItems="center"
          justifyContent="center"
          flexDirection="column"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          {/* Logo/Icon */}
          <MotionFlex
            justify="center"
            alignItems="center"
            p={4}
            borderRadius="full"
            bg="rgba(128, 90, 213, 0.2)"
            boxShadow="0 0 20px rgba(128, 90, 213, 0.4)"
            mb={6}
            initial={{ rotate: -20 }}
            animate={{
              rotate: 0,
              boxShadow: [
                '0 0 20px rgba(128, 90, 213, 0.4)',
                '0 0 40px rgba(128, 90, 213, 0.6)',
                '0 0 20px rgba(128, 90, 213, 0.4)',
              ],
            }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
          >
            <Swords size={40} color="#D6BCFA" style={{ marginRight: '8px' }} />
            <Zap size={40} color="#B794F4" />
          </MotionFlex>

          {/* Title */}
          <MotionHeading
            fontSize="4xl"
            fontWeight="extrabold"
            color="white"
            mb={2}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            textShadow="0 0 10px rgba(128, 90, 213, 0.6)"
          >
            QUICK CLASH
          </MotionHeading>

          {/* Tagline */}
          <MotionText
            color="whiteAlpha.800"
            fontSize="lg"
            fontWeight="medium"
            textAlign="center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            Prepare for battle in the knowledge arena
          </MotionText>
        </MotionFlex>

        {/* Pulsing line at bottom */}
        <MotionBox
          position="absolute"
          bottom="15%"
          left="50%"
          width="120px"
          height="3px"
          bg="purple.400"
          borderRadius="full"
          initial={{ translateX: '-50%', scaleX: 0.3, opacity: 0.3 }}
          animate={{
            scaleX: [0.3, 1, 0.3],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            repeat: 1,
            duration: 1,
            ease: 'easeInOut',
          }}
        />
      </Center>
    </Box>
  )
}

export default QuickClashEntrance
