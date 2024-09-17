import React from 'react'
import { Box, Text, Image } from '@chakra-ui/react'
import { motion } from 'framer-motion'

const badgeConfig = {
  1: {
    image: '/images/goldTourBadge.webp',
    textPosition: { x: -57, y: 40, bottom: '15%' },
  },
  2: {
    image: '/images/silverTourBadge.webp',
    textPosition: { x: -50, y: 25, bottom: '12%' },
  },
  3: {
    image: '/images/bronzeTourBadge.webp',
    textPosition: { x: -55, y: 85, bottom: '18%' },
  },
}

const TournamentBadges = ({ tournamentNumber, rank }) => {
  const { image, textPosition } = badgeConfig[rank]
  if (!tournamentNumber || !rank) return null
  return (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <Box position="relative" width="80px" height="80px" marginLeft="10px">
        <Image
          src={image}
          alt={`Rank ${rank} Badge`}
          width="100%"
          height="100%"
          objectFit="contain"
        />
        <Text
          position="absolute"
          bottom={textPosition.bottom}
          left="50%"
          transform={`translateX(${textPosition.x}%) translateY(${textPosition.y}%)`}
          color="white"
          fontSize="8px"
          fontWeight="bold"
          textShadow="1px 1px 2px rgba(0,0,0,0.6)"
        >
          #{tournamentNumber.toString().padStart(3, '0')}
        </Text>
      </Box>
    </motion.div>
  )
}

export default TournamentBadges
