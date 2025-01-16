// src/components/rewards/TournamentBadge.jsx
import React from 'react'
import { Box, Image } from '@chakra-ui/react'
import { motion } from 'framer-motion'

const TournamentBadge = ({ badge, size = 'md', delay = 0 }) => {
  const sizeValues = badge?.sizeValues?.[size] || badge?.sizeValues?.md

  return (
    <Box
      as={motion.div}
      initial={{ scale: 0, opacity: 0 }}
      animate={{
        scale: 1,
        opacity: 1,
        y: [0, -4, 0],
      }}
      transition={{
        duration: 2,
        delay: delay,
        y: {
          repeat: Infinity,
          duration: 3,
          ease: 'easeInOut',
        },
      }}
      position="relative"
    >
      {/* Badge Image with Glow */}
      <Box position="relative">
        <Image
          src={badge.image}
          alt={badge.name}
          w={sizeValues?.width || '60px'}
          h={sizeValues?.height || '60px'}
          objectFit="contain"
          filter={`drop-shadow(0 0 15px ${badge.style.color}80)`}
          loading="lazy"
          as={motion.img}
          animate={{
            filter: [
              `drop-shadow(0 0 15px ${badge.style.color}80)`,
              `drop-shadow(0 0 25px ${badge.style.color}90)`,
              `drop-shadow(0 0 15px ${badge.style.color}80)`,
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Rotating glow effect */}
        <Box
          as={motion.div}
          position="absolute"
          inset={-4}
          borderRadius="full"
          bgGradient={`conic-gradient(from 0deg, ${badge.style.color}00, ${badge.style.color}40, ${badge.style.color}00)`}
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'linear',
          }}
          opacity={0.6}
          filter="blur(8px)"
          zIndex={-1}
        />

        {/* Pulsing background */}
        <Box
          as={motion.div}
          position="absolute"
          inset={-2}
          borderRadius="full"
          bg={badge.style.background}
          opacity={0.15}
          filter="blur(15px)"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          zIndex={-2}
        />
      </Box>
    </Box>
  )
}

export default TournamentBadge
