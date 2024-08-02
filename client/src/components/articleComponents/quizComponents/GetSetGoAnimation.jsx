// src/components/quizComponents/GetSetGoAnimation.js

import React, { useState, useEffect } from 'react'
import { Box, Text } from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'

const MotionBox = motion(Box)

const GetSetGoAnimation = ({ onComplete }) => {
  const [step, setStep] = useState(0)
  const steps = ['Get', 'Set', 'Go!']

  useEffect(() => {
    const timer = setTimeout(() => {
      if (step < steps.length - 1) {
        setStep(step + 1)
      } else {
        onComplete()
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [step, steps.length, onComplete])

  return (
    <Box
      position="absolute"
      top="0"
      left="0"
      right="0"
      bottom="0"
      alignItems="center"
      justifyContent="center"
      zIndex="overlay"
      backdropFilter="blur(10px)" // Apply blur effect to parent container
      display="flex"
    >
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        bottom="0"
        backdropFilter="blur(10px)" // Apply blur effect to parent container
        pointerEvents="none" // Ensure this box doesn't interfere with user interactions
        alignItems="center"
        justifyContent="center"
        display={'flex'}
      >
        <AnimatePresence mode="wait">
          <MotionBox
            key={step}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Text
              fontSize="7xl"
              fontWeight="bold"
              color="purple.500"
              textShadow="2px 2px 4px rgba(0,0,0,0.5)"
            >
              {steps[step]}
            </Text>
          </MotionBox>
        </AnimatePresence>
      </Box>
    </Box>
  )
}

export default GetSetGoAnimation
