// Update to components/quickClashComponents/ui/PlayerStatus.jsx
import React from 'react'
import { Box, HStack, Text, Badge, Avatar, Flex, Icon } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import ScoreDisplay from './ScoreDisplay'
import { Trophy, ChevronUp, ChevronDown } from 'lucide-react'

const MotionBox = motion(Box)
const MotionText = motion(Text)

/**
 * Displays a player's status in a Quick Clash challenge
 */
const PlayerStatus = ({
  player,
  score,
  attempted,
  isUser,
  trophies,
  trophyChange,
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

  // Trophy change animation
  const trophyAnimation =
    trophyChange !== undefined
      ? {
          initial: { scale: 1, opacity: 0 },
          animate: {
            scale: [1, 1.1, 1],
            opacity: 1,
            transition: {
              duration: 1,
              delay: 0.5,
              repeat: 3,
              repeatType: 'reverse',
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

          <Flex justifyContent="space-between" align="center">
            <Badge
              colorScheme={attempted ? 'green' : 'yellow'}
              fontSize="xs"
              variant={attempted ? 'solid' : 'outline'}
              borderRadius="full"
            >
              {attempted ? t('Completed') : t('Pending')}
            </Badge>

            {/* Trophy display with change indicator */}
            {trophies !== undefined && (
              <HStack spacing={1}>
                <MotionBox
                  bg="rgba(255, 215, 0, 0.1)"
                  borderRadius="full"
                  px={2}
                  py={0.5}
                  borderWidth="1px"
                  borderColor="rgba(255, 215, 0, 0.3)"
                  display="flex"
                  alignItems="center"
                  {...(trophyChange !== undefined && trophyAnimation)}
                >
                  <Icon as={Trophy} color="yellow.400" boxSize={3} mr={1} />
                  <Text color="white" fontWeight="semibold" fontSize="xs">
                    {trophies}
                  </Text>

                  {/* Trophy change indicator */}
                  {trophyChange !== undefined && trophyChange !== 0 && (
                    <Flex
                      ml={1}
                      align="center"
                      justify="center"
                      bg={
                        trophyChange > 0
                          ? 'rgba(72, 187, 120, 0.3)'
                          : 'rgba(245, 101, 101, 0.3)'
                      }
                      borderRadius="full"
                      w="18px"
                      h="18px"
                    >
                      {trophyChange > 0 ? (
                        <Icon as={ChevronUp} color="green.400" boxSize="12px" />
                      ) : (
                        <Icon as={ChevronDown} color="red.400" boxSize="12px" />
                      )}
                    </Flex>
                  )}
                </MotionBox>
              </HStack>
            )}
          </Flex>

          {/* Show trophy change text */}
          {trophyChange !== undefined && trophyChange !== 0 && (
            <MotionText
              fontSize="2xs"
              fontWeight="medium"
              color={trophyChange > 0 ? 'green.400' : 'red.400'}
              textAlign="right"
              mt={0.5}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.8 } }}
            >
              {trophyChange > 0 ? `+${trophyChange}` : trophyChange}
            </MotionText>
          )}
        </Box>
      </HStack>
    </MotionBox>
  )
}

export default PlayerStatus
