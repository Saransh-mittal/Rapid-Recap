import React from 'react'
import { Box, VStack, Text } from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { REWARD_VARIANTS } from '../constants/rewardTypes'

const BaseRewardDisplay = ({
  title,
  description,
  icon: Icon,
  children,
  claimed,
  onClaim,
  type,
  ...props
}) => {
  return (
    <Box
      position="fixed"
      inset={0}
      bgGradient={REWARD_VARIANTS[type].bgGradient}
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
        {...props}
      >
        {Icon && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Icon />
          </motion.div>
        )}

        <Text
          fontSize={{ base: '3xl', md: '4xl' }}
          fontWeight="extrabold"
          bgGradient={`linear(to-r, ${REWARD_VARIANTS[type].colorScheme}.300, ${REWARD_VARIANTS[type].colorScheme}.500)`}
          bgClip="text"
          textAlign="center"
          textShadow={`0 0 20px rgba(66,153,225,0.2)`}
        >
          {title}
        </Text>

        <AnimatePresence mode="wait">{children}</AnimatePresence>

        <Text
          fontSize={{ base: 'xl', md: '2xl' }}
          bgGradient={`linear(to-r, ${REWARD_VARIANTS[type].colorScheme}.300, cyan.300)`}
          bgClip="text"
          textShadow="0 2px 12px rgba(104,211,245,0.5)"
          textAlign="center"
          lineHeight="1.6"
          letterSpacing="wide"
          fontWeight="medium"
        >
          {description}
        </Text>
      </VStack>
    </Box>
  )
}

export default BaseRewardDisplay
