// src/components/rewards/BaseRewardDisplay.jsx
import React from 'react'
import PropTypes from 'prop-types'
import { Box, Button, Text } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { REWARD_VARIANTS } from './constants/rewardTypes'
import * as LucideIcons from 'lucide-react'

export const BaseRewardDisplay = ({ reward, onClaim, claimed, children }) => {
  const variant = REWARD_VARIANTS[reward.type] || REWARD_VARIANTS.default
  const Icon = LucideIcons[variant.icon]

  return (
    <Box
      position="relative"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      p={8}
      bg="blackAlpha.700"
      backdropFilter="blur(10px)"
      borderRadius="xl"
      border="1px solid"
      borderColor={`${variant.colorScheme}.500`}
    >
      {/* Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      >
        <Icon size={48} className={`text-${variant.colorScheme}-400`} />
      </motion.div>

      {/* Title */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Text
          fontSize="2xl"
          fontWeight="bold"
          textAlign="center"
          my={4}
          bgGradient={variant.bgGradient}
          bgClip="text"
        >
          {reward.title}
        </Text>
      </motion.div>

      {/* Custom Content */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        {children}
      </motion.div>

      {/* Description */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <Text
          fontSize="lg"
          textAlign="center"
          mb={6}
          mt={4}
          color="whiteAlpha.900"
        >
          {reward.description}
        </Text>
      </motion.div>

      {/* Claim Button */}
      {!claimed && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <Button
            bgGradient={variant.bgGradient}
            color="white"
            _hover={{
              bgGradient: variant.bgGradient,
              opacity: 0.9,
              transform: 'scale(1.05)',
            }}
            size="lg"
            onClick={onClaim}
            leftIcon={<Icon size={20} />}
          >
            Claim Reward
          </Button>
        </motion.div>
      )}
    </Box>
  )
}

BaseRewardDisplay.propTypes = {
  reward: PropTypes.shape({
    id: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
  }).isRequired,
  onClaim: PropTypes.func.isRequired,
  claimed: PropTypes.bool.isRequired,
  children: PropTypes.node,
}
