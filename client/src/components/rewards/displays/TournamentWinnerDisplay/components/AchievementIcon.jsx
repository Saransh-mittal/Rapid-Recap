import React from 'react'
import { Box, Image } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { trophyAnimation } from '../constants/animations'
import { badgeConfig } from '../../../../../models/badgeConfig'

const AchievementIcon = ({ variant, type }) => {
  // Map tournament types to badge configurations
  const badgeMappings = {
    TOURNAMENT_ACE: 'ACE',
    TOURNAMENT_PRO: 'PRO',
    TOURNAMENT_CHAMP: 'CHAMP',
  }

  // Get the corresponding badge configuration
  const badgeKey = badgeMappings[type] || 'PRO' // Default to PRO if type is not found
  const badgeConfiguration = badgeConfig[badgeKey]

  return (
    <Box
      as={motion.div}
      variants={trophyAnimation}
      initial="initial"
      animate="animate"
      style={{
        perspective: '1000px',
        transformStyle: 'preserve-3d',
      }}
    >
      <Box
        position="relative"
        width={{ base: '120px', md: '150px' }}
        height={{ base: '120px', md: '150px' }}
      >
        {/* Dynamic Image */}
        <Image
          src={badgeConfiguration.image}
          alt={`${type} badge`}
          width="100%"
          height="100%"
          objectFit="contain"
          style={{
            filter: 'drop-shadow(0 0 20px rgba(234, 179, 8, 0.3))',
          }}
        />

        {/* Glow effect */}
        <Box
          position="absolute"
          inset={0}
          borderRadius="full"
          bgGradient={`radial(${badgeConfiguration.style.background})`}
          filter="blur(20px)"
          opacity={0.3}
          as={motion.div}
          animate={{
            opacity: [0.2, 0.4, 0.2],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </Box>
    </Box>
  )
}

export default AchievementIcon
