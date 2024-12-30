// src/components/rewards/displays/IQBoostDisplay/components/TournamentBadgeIcon.jsx
import React, { memo } from 'react'
import { Box, Image } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { badgeConfig } from '../../../../../models/badgeConfig'

const TournamentBadgeIcon = ({ rank, theme }) => {
  const badgeConfiguration = badgeConfig[rank]

  return (
    <Box
      as={motion.div}
      initial={{ scale: 0 }}
      animate={{
        scale: 1,
      }}
      transition={{
        scale: { duration: 0.5 },
      }}
      style={{
        perspective: '1000px',
        transformStyle: 'preserve-3d',
      }}
    >
      <motion.div
        animate={{
          y: [-10, 10, -10],
          rotateY: [-5, 5, -5],
          rotateX: [2, -2, 2],
        }}
        transition={{
          y: {
            repeat: Infinity,
            duration: 4,
            ease: 'easeInOut',
          },
          rotateY: {
            repeat: Infinity,
            duration: 6,
            ease: 'easeInOut',
          },
          rotateX: {
            repeat: Infinity,
            duration: 5,
            ease: 'easeInOut',
          },
        }}
      >
        <Box
          position="relative"
          width={{ base: '120px', md: '150px' }}
          height={{ base: '120px', md: '150px' }}
        >
          <Image
            src={badgeConfiguration.image}
            alt={`${rank} badge`}
            width="100%"
            height="100%"
            objectFit="contain"
            style={{
              filter: `drop-shadow(0 0 20px ${theme.glowColor})`,
            }}
          />

          {/* Primary Glow */}
          <Box
            position="absolute"
            inset={0}
            borderRadius="full"
            bgGradient={`radial(${theme.buttonGradient})`}
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

          {/* Secondary Glow */}
          <Box
            position="absolute"
            inset={-2}
            borderRadius="full"
            bgGradient={`radial(${theme.titleGradient})`}
            filter="blur(15px)"
            opacity={0.15}
            as={motion.div}
            animate={{
              opacity: [0.1, 0.3, 0.1],
              scale: [1.1, 1.3, 1.1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.5,
            }}
          />
        </Box>
      </motion.div>
    </Box>
  )
}

export default memo(TournamentBadgeIcon)
