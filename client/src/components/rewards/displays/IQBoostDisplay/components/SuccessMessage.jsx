// src/components/rewards/displays/IQBoostDisplay/components/SuccessMessage.jsx
import React, { memo } from 'react'
import { HStack, Text, useMediaQuery } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { Crown, PartyPopper } from 'lucide-react'

const SuccessMessage = ({ theme }) => {
  const isScreenSmallerThan768px = useMediaQuery('(max-width: 768px)')[0]
  const textColor = theme?.textColor || 'blue.400'
  const glowColor = theme?.glowColor || 'rgba(66,153,225,0.3)'
  const iconColor = theme?.iconColor || 'blue.400'

  return (
    <HStack
      as={motion.div}
      initial={{ scale: 0 }}
      animate={{
        scale: 1,
        y: [0, -10, 0],
      }}
      transition={{
        y: {
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      }}
      exit={{ scale: 0, opacity: 0 }}
      justify="center"
      align="center"
      spacing={4}
    >
      <Crown
        size={isScreenSmallerThan768px ? 24 : 36}
        color={`var(--chakra-colors-${iconColor})`}
      />
      <Text
        color={textColor}
        fontSize={{ base: 'lg', md: '3xl' }}
        fontWeight="bold"
        textShadow={`0 0 10px ${glowColor}`}
      >
        Intelligence Amplified!
      </Text>
      <PartyPopper
        size={isScreenSmallerThan768px ? 24 : 36}
        color={`var(--chakra-colors-${iconColor})`}
      />
    </HStack>
  )
}

export default memo(SuccessMessage)
