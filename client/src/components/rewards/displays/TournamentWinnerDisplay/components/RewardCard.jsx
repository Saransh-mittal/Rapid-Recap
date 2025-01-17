import React from 'react'
import { Box, Text, HStack } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import * as LucideIcons from 'lucide-react'
import {
  cardAnimation,
  glowAnimation,
  pulseAnimation,
} from '../constants/animations'

const RewardCard = ({ icon, title, description, variant, delay = 0 }) => {
  const Icon = LucideIcons[icon] || LucideIcons[variant.icon]

  return (
    <Box
      as={motion.div}
      variants={cardAnimation}
      initial="initial"
      animate="animate"
      whileHover="hover"
      custom={delay}
      position="relative"
      w="full"
      maxH="120px"
    >
      {/* Background Glow */}
      <Box
        as={motion.div}
        position="absolute"
        inset={0}
        borderRadius="2xl"
        bg={variant.cardGradient}
        opacity={0.1}
        variants={glowAnimation}
        animate="animate"
        filter="blur(20px)"
      />

      {/* Card Content */}
      <Box
        p={4}
        bg={variant.cardBg || 'rgba(88, 28, 135, 0.4)'}
        backdropFilter="blur(10px)"
        borderRadius="2xl"
        border="1px solid"
        borderColor="whiteAlpha.200"
        position="relative"
        overflow="hidden"
        _hover={{
          borderColor: 'whiteAlpha.300',
          transform: 'translateY(-2px)',
          boxShadow: `0 0 30px ${variant.glowColor}`,
        }}
        transition="all 0.3s"
      >
        {/* Shimmer Effect */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bgGradient={`linear(to-r, transparent, ${variant.shimmerColor}, transparent)`}
          transform="translateX(-100%)"
          animation="shimmer 2.5s infinite"
          sx={{
            '@keyframes shimmer': {
              '100%': {
                transform: 'translateX(100%)',
              },
            },
          }}
        />

        <HStack spacing={3} align="center">
          {/* Icon Container */}
          <Box
            as={motion.div}
            variants={pulseAnimation}
            animate="animate"
            p={3}
            borderRadius="xl"
            bg={variant.iconBg}
            boxShadow={`0 0 20px ${variant.glowColor}`}
          >
            <Icon
              size={20}
              color={`var(--chakra-colors-${variant.iconColor
                .split('.')
                .join('-')})`}
            />
          </Box>

          <Box flex={1}>
            <Text
              fontSize={{ base: 'lg', md: 'xl' }}
              fontWeight="bold"
              bgGradient={variant.titleGradient}
              bgClip="text"
              mb={1}
            >
              {title}
            </Text>

            <Text
              fontSize={{ base: 'sm', md: 'md' }}
              color="whiteAlpha.900"
              lineHeight="short"
              opacity={0.9}
            >
              {description}
            </Text>
          </Box>
        </HStack>
      </Box>
    </Box>
  )
}

export default React.memo(RewardCard)
