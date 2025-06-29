// components/articleComponents/GivenQuiz.jsx - Update this component

import React, { useMemo } from 'react'
import {
  Box,
  Text,
  VStack,
  HStack,
  Badge,
  Flex,
  Icon,
  Tooltip,
  Wrap,
  WrapItem,
} from '@chakra-ui/react'
import {
  FileText,
  FlipHorizontal2,
  Sparkles,
  Link2,
  Trophy,
  Target,
  Star,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

const gameTypeIcons = {
  normal_quiz: FileText,
  true_false: FlipHorizontal2,
  word_weaver: Sparkles,
  connections: Link2,
}

const gameTypeNames = {
  normal_quiz: 'Normal Quiz',
  true_false: 'True/False',
  word_weaver: 'Word Weaver',
  connections: 'Connections',
}

const gameTypeColors = {
  normal_quiz: 'blue',
  true_false: 'purple',
  word_weaver: 'green',
  connections: 'violet',
}

const GivenQuiz = ({ articleId, percentile, RQM_score, gameData }) => {
  const { t } = useTranslation()

  // Handle both old format (boolean) and new format (object with game details)
  const isNewFormat =
    gameData && typeof gameData === 'object' && gameData.hasPlayed
  const gamesPlayed = isNewFormat ? gameData.gamesPlayed || [] : ['normal_quiz']
  const bestGameType = isNewFormat ? gameData.bestGameType : 'normal_quiz'
  const totalAttempts = isNewFormat ? gameData.totalAttempts : 1

  const getPerformanceLevel = percentile => {
    if (percentile >= 90)
      return { level: 'Excellent', color: 'green', icon: Trophy }
    if (percentile >= 75) return { level: 'Great', color: 'blue', icon: Star }
    if (percentile >= 50)
      return { level: 'Good', color: 'purple', icon: Target }
    return { level: 'Keep Trying', color: 'orange', icon: Target }
  }

  const performance = useMemo(
    () => getPerformanceLevel(percentile),
    [percentile],
  )
  const PerformanceIcon = performance.icon

  return (
    <Box
      bg="gray.800"
      borderRadius="2xl"
      p={6}
      border="1px solid"
      borderColor="gray.700"
      position="relative"
      overflow="hidden"
    >
      {/* Background gradient */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bgGradient={`linear(to-br, ${performance.color}.600, ${performance.color}.800)`}
        opacity={0.1}
      />

      <VStack spacing={4} position="relative">
        {/* Header */}
        <HStack justify="space-between" w="100%" align="center">
          <VStack spacing={1} align="start">
            <Text fontSize="lg" fontWeight="bold" color="white">
              🎉 Games Completed!
            </Text>
            {isNewFormat && totalAttempts > 1 && (
              <Text fontSize="sm" color="gray.400">
                {totalAttempts} total attempts
              </Text>
            )}
          </VStack>

          <Badge
            colorScheme={performance.color}
            variant="solid"
            px={3}
            py={1}
            borderRadius="full"
            fontSize="sm"
          >
            <HStack spacing={1}>
              <PerformanceIcon size={14} />
              <Text>{performance.level}</Text>
            </HStack>
          </Badge>
        </HStack>

        {/* Score Display */}
        <Box textAlign="center" w="100%">
          <Text
            fontSize="4xl"
            fontWeight="bold"
            color={`${performance.color}.400`}
            lineHeight="1"
          >
            {RQM_score}
          </Text>
          <Text fontSize="sm" color="gray.400" mb={2}>
            Best RQM Score
            {isNewFormat && bestGameType && (
              <Text
                as="span"
                color={`${gameTypeColors[bestGameType]}.400`}
                ml={1}
              >
                ({gameTypeNames[bestGameType]})
              </Text>
            )}
          </Text>

          <HStack justify="center" spacing={4}>
            <VStack spacing={0}>
              <Text
                fontSize="2xl"
                fontWeight="bold"
                color={`${performance.color}.400`}
              >
                {Math.round(percentile)}
              </Text>
              <Text fontSize="xs" color="gray.500">
                Percentile
              </Text>
            </VStack>
          </HStack>
        </Box>

        {/* Games Played */}
        {isNewFormat && gamesPlayed.length > 0 && (
          <Box w="100%">
            <Text fontSize="sm" color="gray.400" mb={2} textAlign="center">
              Games Completed:
            </Text>
            <Wrap justify="center" spacing={2}>
              {gamesPlayed.map(gameType => {
                const IconComponent = gameTypeIcons[gameType]
                const color = gameTypeColors[gameType]
                const isBest = gameType === bestGameType

                return (
                  <WrapItem key={gameType}>
                    <Tooltip
                      label={`${gameTypeNames[gameType]}${
                        isBest ? ' (Best Score)' : ''
                      }`}
                      placement="top"
                    >
                      <Badge
                        colorScheme={color}
                        variant={isBest ? 'solid' : 'outline'}
                        px={2}
                        py={1}
                        borderRadius="full"
                        fontSize="xs"
                        position="relative"
                      >
                        <HStack spacing={1}>
                          {IconComponent && (
                            <Icon as={IconComponent} boxSize={3} />
                          )}
                          <Text>{gameTypeNames[gameType]}</Text>
                          {isBest && <Trophy size={12} />}
                        </HStack>
                      </Badge>
                    </Tooltip>
                  </WrapItem>
                )
              })}
            </Wrap>
          </Box>
        )}

        {/* Encouragement */}
        <Box bg="gray.900" p={3} borderRadius="lg" w="100%" textAlign="center">
          <Text fontSize="sm" color="gray.300">
            {percentile >= 90
              ? "🌟 Outstanding performance! You're in the top 10%!"
              : percentile >= 75
              ? '🎯 Great job! You scored better than most players!'
              : percentile >= 50
              ? '👍 Good work! Try other game types to improve!'
              : '💪 Keep practicing! Each game helps you learn more!'}
          </Text>

          {isNewFormat && gamesPlayed.length < 4 && (
            <Text fontSize="xs" color="gray.500" mt={1}>
              Try the other game types for a complete experience!
            </Text>
          )}
        </Box>
      </VStack>
    </Box>
  )
}

export default GivenQuiz
