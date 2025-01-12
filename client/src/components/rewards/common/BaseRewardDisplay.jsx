// src/components/rewards/common/BaseRewardDisplay.jsx
import React from 'react'
import { Box, VStack } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { REWARD_VARIANTS } from '../constants/rewardTypes'

const BaseRewardDisplay = ({ reward, children, type, theme }) => {
  // Get variant styles
  const variant = theme || REWARD_VARIANTS[type] || REWARD_VARIANTS.default

  return (
    <Box
      position="fixed"
      inset={0}
      bgGradient={variant.bgGradient}
      display="flex"
      alignItems="center"
      justifyContent="center"
      zIndex={9999}
    >
      <VStack
        spacing={10}
        p={{ base: 6, md: 10 }}
        maxW="600px"
        w="92%"
        zIndex={1}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        as={motion.div}
      >
        {children}
      </VStack>
    </Box>
  )
}

export default BaseRewardDisplay
