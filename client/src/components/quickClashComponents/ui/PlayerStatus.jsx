import React from 'react'
import { Box, HStack, Text, Badge, Avatar } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import ScoreDisplay from './ScoreDisplay'

const MotionBox = motion(Box)

/**
 * Displays a player's status in a Quick Clash challenge
 */
const PlayerStatus = ({ player, score, attempted, isUser }) => {
  const { t } = useTranslation('QuickClash')
  const bgGradient = isUser
    ? 'linear(to-r, purple.900, purple.800)'
    : 'linear(to-r, gray.800, gray.700)'
  const borderColor = isUser ? 'purple.500' : 'whiteAlpha.200'

  const userAnimation = isUser
    ? {
        initial: { scale: 0.95 },
        animate: {
          scale: 1,
          transition: {
            type: 'spring',
            stiffness: 300,
            damping: 15,
          },
        },
      }
    : {}

  return (
    <MotionBox
      px={3}
      py={2}
      borderRadius="lg"
      bgGradient={bgGradient}
      borderWidth="1px"
      borderColor={borderColor}
      width="100%"
      overflow="hidden"
      position="relative"
      {...userAnimation}
    >
      {isUser && (
        <Box
          position="absolute"
          top={0}
          right={0}
          w="40px"
          h="40px"
          bg="purple.500"
          transform="rotate(45deg) translate(28px, -28px)"
          zIndex={0}
        />
      )}

      <HStack spacing={3} position="relative" zIndex={1}>
        <Avatar
          name={player.name}
          src={player.pic}
          size="sm"
          bg={isUser ? 'purple.400' : 'gray.500'}
          borderWidth={2}
          borderColor={isUser ? 'purple.200' : 'transparent'}
        />

        <Box flex={1}>
          <HStack justifyContent="space-between" mb={1}>
            <Text
              fontSize="sm"
              fontWeight="bold"
              color="white"
              noOfLines={1}
              maxW="150px"
            >
              {player.inGameName || player.name}
              {isUser && (
                <Badge size="sm" ml={1} colorScheme="purple" variant="solid">
                  {t('You')}
                </Badge>
              )}
            </Text>

            {attempted && <ScoreDisplay score={score} size="sm" />}
          </HStack>

          <Badge
            colorScheme={attempted ? 'green' : 'yellow'}
            fontSize="xs"
            variant={attempted ? 'solid' : 'outline'}
            borderRadius="full"
          >
            {attempted ? t('Completed') : t('Pending')}
          </Badge>
        </Box>
      </HStack>
    </MotionBox>
  )
}

export default PlayerStatus
