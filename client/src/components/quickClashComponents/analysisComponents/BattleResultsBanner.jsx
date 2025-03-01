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
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

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
            : 'linear-gradient(to right, rgba(160, 174, 192, 0.25), rgba(160, 174, 192, 0.1))'
        }
        borderRadius="lg"
        p={3}
        textAlign="center"
        position="relative"
        mb={4}
      >
        <MotionText
          fontSize="lg"
          fontWeight="bold"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {resultEmoji} {resultText}
        </MotionText>
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
            bgClip="text"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            {userScore}
          </MotionText>
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
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            {opponentScore}
          </MotionText>
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
