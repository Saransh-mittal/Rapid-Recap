// File: src/components/onboarding/MajesticLoading.jsx

import React from 'react'
import { Box, VStack, Text } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { keyframes } from '@emotion/react'

const pulseAnimation = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.7; }
  100% { transform: scale(1); opacity: 1; }
`

const fadeInOut = keyframes`
  0% { opacity: 0.3; }
  50% { opacity: 1; }
  100% { opacity: 0.3; }
`

const MajesticLoading = () => {
  return (
    <VStack
      spacing={8}
      align="center"
      justify="center"
      height="100%"
      width="100%"
    >
      <Box
        as={motion.div}
        animation={`${pulseAnimation} 2s ease-in-out infinite`}
        width="150px"
        height="150px"
        borderRadius="50%"
        bgGradient="linear(to-r, purple.400, pink.400)"
        boxShadow="0 0 20px rgba(255, 255, 255, 0.5)"
      />
      <Text
        fontSize="2xl"
        fontWeight="bold"
        color="white"
        textShadow="0 0 10px rgba(255, 255, 255, 0.5)"
        as={motion.p}
        animation={`${fadeInOut} 2s ease-in-out infinite`}
      >
        Unveiling Knowledge...
      </Text>
    </VStack>
  )
}

export default MajesticLoading
