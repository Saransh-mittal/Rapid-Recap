import React, { memo } from 'react'
import { HStack, Text, useMediaQuery } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { Crown, PartyPopper } from 'lucide-react'

const SuccessMessage = ({ t }) => {
  const isScreenSmallerThan768px = useMediaQuery('(max-width: 768px)')[0]
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
        color="var(--chakra-colors-blue-400)"
      />
      <Text
        color="blue.400"
        fontSize={{ base: 'lg', md: '3xl' }}
        fontWeight="bold"
        textShadow="0 0 10px rgba(66,153,225,0.3)"
      >
        {t('successMessage.text')}
      </Text>
      <PartyPopper
        size={isScreenSmallerThan768px ? 24 : 36}
        color="var(--chakra-colors-blue-400)"
      />
    </HStack>
  )
}

export default memo(SuccessMessage)
