// src/components/rewards/displays/TournamentWinnerDisplay/components/CategoryBadge.jsx
import React from 'react'
import { Box, HStack, Text } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { Medal } from 'lucide-react'

const CategoryBadge = ({ category }) => {
  return (
    <Box position="relative" zIndex={1}>
      <Box
        position="absolute"
        inset={0}
        bgGradient="linear(to-r, yellow.400/20, orange.400/20)"
        filter="blur(16px)"
        as={motion.div}
        animate={{
          opacity: [0.2, 0.4, 0.2],
          scale: [0.95, 1.05, 0.95],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <HStack
        justify="center"
        align="center"
        spacing={2}
        mb={4}
        position="relative"
      >
        <Box
          as={motion.div}
          animate={{
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <Medal size={24} color="var(--chakra-colors-yellow-400)" />
        </Box>

        <Text
          fontSize="lg"
          fontWeight="medium"
          color="yellow.100"
          opacity={0.9}
          textShadow="0 2px 10px rgba(0,0,0,0.3)"
          letterSpacing="wide"
        >
          {category}
        </Text>
      </HStack>
    </Box>
  )
}

export default CategoryBadge
