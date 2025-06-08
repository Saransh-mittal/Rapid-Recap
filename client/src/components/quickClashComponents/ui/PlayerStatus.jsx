// components/quickClashComponents/ui/PlayerStatus.jsx
import React from 'react'
import {
  Box,
  HStack,
  Text,
  Badge,
  Avatar,
  Flex,
  Icon,
  VStack,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import ScoreDisplay from './ScoreDisplay'
import EnhancedTrophyChangeDisplay from './EnhancedTrophyChangeDisplay'
import { Trophy } from 'lucide-react'

const MotionBox = motion(Box)
const MotionText = motion(Text)

/**
 * Displays a player's status in a Quick Clash challenge with trophy change display
 */
const PlayerStatus = ({
  player,
  score,
  attempted,
  isUser,
  trophies,
  trophyChange,
  showTrophyAnimation = false,
  protectionApplied = false,
  isTie = false,
}) => {
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

      {/* Main layout */}
      <Flex
        position="relative"
        zIndex={1}
        align="center"
        justify="space-between"
        direction="row"
      >
        {/* Left section: Avatar and player info */}
        <HStack spacing={3} flex={1}>
          <Avatar
            name={player?.name}
            src={player?.pic}
            size="sm"
            bg={isUser ? 'purple.400' : 'gray.500'}
            borderWidth={2}
            borderColor={isUser ? 'purple.200' : 'transparent'}
          />

          <VStack spacing={1} align="flex-start" flex={1}>
            <HStack spacing={1} align="center">
              <Text
                fontSize="sm"
                fontWeight="bold"
                color="white"
                noOfLines={1}
                maxW="120px"
              >
                {player?.inGameName || player?.name}
              </Text>
              {isUser && (
                <Badge size="sm" colorScheme="purple" variant="solid">
                  {t('You')}
                </Badge>
              )}
            </HStack>

            {/* Trophy change display - positioned below the name for current user */}
            {isUser && trophyChange !== undefined && (
              <Box mt={1}>
                <EnhancedTrophyChangeDisplay
                  trophyChange={trophyChange}
                  showAnimation={showTrophyAnimation}
                  size="sm"
                  protectionApplied={protectionApplied}
                  isTie={isTie}
                />
              </Box>
            )}

            {/* Trophy display */}
            {trophies !== undefined && (
              <MotionBox
                bg="rgba(255, 215, 0, 0.1)"
                borderRadius="full"
                px={2}
                py={0.5}
                borderWidth="1px"
                borderColor="rgba(255, 215, 0, 0.3)"
                display="flex"
                alignItems="center"
                mt={isUser && trophyChange !== undefined ? 1 : 0}
              >
                <Icon as={Trophy} color="yellow.400" boxSize={3} mr={1} />
                <Text color="white" fontWeight="semibold" fontSize="xs">
                  {trophies}
                </Text>
              </MotionBox>
            )}
          </VStack>
        </HStack>

        {/* Right section: Score display */}
        {attempted && (
          <Flex align="center" justify="center">
            <ScoreDisplay score={score} size="sm" />
          </Flex>
        )}
      </Flex>
    </MotionBox>
  )
}

export default PlayerStatus
