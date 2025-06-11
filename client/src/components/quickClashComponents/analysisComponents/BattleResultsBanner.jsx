// components/quickClashComponents/analysisComponents/BattleResultsBanner.jsx
import React from 'react'
import {
  Box,
  HStack,
  Text,
  Badge,
  Avatar,
  SimpleGrid,
  Flex,
  useBreakpointValue,
  Tooltip,
  Icon,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Trophy, Shield } from 'lucide-react'
import EnhancedTrophyChangeDisplay from '../ui/EnhancedTrophyChangeDisplay'

const MotionBox = motion(Box)
const MotionBadge = motion(Badge)
const MotionText = motion(Text)

const BattleResultsBanner = ({ analysis, userIsWinner, isTie, userId }) => {
  const { t } = useTranslation('QuickClash')
  const isChallenger = analysis.challenger?.userId === userId

  // Get user and opponent details
  const userScore = analysis.userAnalysis.performance?.finalScore || 0
  const opponentScore = analysis.opponentAnalysis.performance?.finalScore || 0

  // Opponent name logic
  const opponentUsername = isChallenger
    ? analysis.opponent?.username || 'Opponent'
    : analysis.challenger?.username || 'Opponent'

  // Result text and colors
  const resultText = userIsWinner
    ? t('Victory!')
    : isTie
    ? t('Draw')
    : t('Defeat')
  const resultColor = userIsWinner ? 'green' : isTie ? 'blue' : 'red'

  // Adjust animations for mobile
  const animationDuration = useBreakpointValue({ base: 0.3, md: 0.4 })

  // Result emoji
  const resultEmoji = userIsWinner ? '🏆' : isTie ? '🤝' : '📊'

  // Trophy data
  const userTrophyData = analysis.userAnalysis.trophyData
  const opponentTrophyData = analysis.opponentAnalysis.trophyData

  // Protection info
  const hasProtection =
    userTrophyData &&
    !userIsWinner &&
    !isTie &&
    userTrophyData.protectionApplied
  const protectionType = hasProtection ? userTrophyData.protectionType : null

  const protectionText =
    protectionType === 'streak'
      ? t('Streak Protection')
      : protectionType === 'activity'
      ? t('Beginner Protection')
      : t('Protection')

  return (
    <MotionBox
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: animationDuration }}
      mb={4}
    >
      {/* Simple, elegant result header */}
      <MotionBox
        bg={
          userIsWinner
            ? 'linear-gradient(to right, rgba(72, 187, 120, 0.25), rgba(72, 187, 120, 0.1))'
            : isTie
            ? 'linear-gradient(to right, rgba(90, 103, 216, 0.25), rgba(90, 103, 216, 0.1))'
            : 'linear-gradient(to right, rgba(194, 26, 17, 0.25), rgba(235, 98, 80, 0.1))'
        }
        borderRadius="lg"
        p={3}
        textAlign="center"
        position="relative"
        mb={4}
      >
        <Flex justify="center" align="center">
          <MotionText
            fontSize="lg"
            fontWeight="bold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            {resultEmoji} {resultText}
          </MotionText>

          {/* Protection badge */}
          {hasProtection && (
            <Tooltip
              label={
                userTrophyData.protectionType === 'streak'
                  ? t('Your win streak protected you from trophy loss')
                  : t('As a newer player, your trophies were protected')
              }
              placement="top"
            >
              <MotionBadge
                ml={2}
                colorScheme="yellow"
                display="flex"
                alignItems="center"
                gap={1}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.3 }}
              >
                <Icon as={Shield} boxSize={3} />
                {protectionText}
              </MotionBadge>
            </Tooltip>
          )}
        </Flex>
      </MotionBox>

      {/* Score comparison */}
      <SimpleGrid columns={2} spacing={4}>
        <Box
          p={3}
          bg="rgba(255, 255, 255, 0.03)"
          borderRadius="md"
          textAlign="center"
        >
          <HStack spacing={2} justifyContent="center" mb={2}>
            <Avatar size="xs" name="You" />
            <Text fontSize="sm">You</Text>
          </HStack>
          <MotionText
            fontSize="3xl"
            fontWeight="bold"
            bgGradient={
              userIsWinner || isTie
                ? 'linear(to-r, purple.200, purple.400)'
                : 'whiteAlpha.800'
            }
            bgClip={userIsWinner || isTie ? 'text' : 'none'}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            {userScore}
          </MotionText>

          {/* Trophy change indicator */}
          {userTrophyData && !isTie && (
            <Box mt={2}>
              <EnhancedTrophyChangeDisplay
                trophyChange={userTrophyData.change}
                showAnimation={true}
              />
            </Box>
          )}
        </Box>

        <Box
          p={3}
          bg="rgba(255, 255, 255, 0.03)"
          borderRadius="md"
          textAlign="center"
        >
          <HStack spacing={2} justifyContent="center" mb={2}>
            <Avatar size="xs" name={opponentUsername} />
            <Text fontSize="sm">{opponentUsername}</Text>
          </HStack>
          <MotionText
            fontSize="3xl"
            fontWeight="bold"
            bgGradient={
              !userIsWinner && !isTie
                ? 'linear(to-r, blue.200, blue.400)'
                : 'whiteAlpha.800'
            }
            bgClip={!userIsWinner && !isTie ? 'text' : 'none'}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            {opponentScore}
          </MotionText>

          {/* Trophy change indicator */}
          {opponentTrophyData && !isTie && (
            <Box mt={2}>
              <EnhancedTrophyChangeDisplay
                trophyChange={opponentTrophyData.change}
                showAnimation={false}
              />
            </Box>
          )}
        </Box>
      </SimpleGrid>

      {/* Simple battle stats */}
      <Flex mt={3} justify="space-between" fontSize="xs" color="whiteAlpha.700">
        <Text>
          {t('Category')}:{' '}
          <Text as="span" color="white">
            {analysis.battleMetrics.category}
          </Text>
        </Text>
        <Text>
          {t('Difficulty')}:{' '}
          <Text as="span" color="white" textTransform="capitalize">
            {analysis.battleMetrics.difficulty}
          </Text>
        </Text>
      </Flex>
    </MotionBox>
  )
}

export default BattleResultsBanner
