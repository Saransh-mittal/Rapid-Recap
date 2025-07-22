import React, { useState, useEffect, useCallback } from 'react'
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Grid,
  Icon,
  Badge,
  Spinner,
  useToast,
  Tooltip,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import {
  FileText,
  FlipHorizontal2,
  Sparkles,
  Link2,
  Play,
  Clock,
  Zap,
  Plus,
  Crown,
  Timer,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import axios from 'axios'
import { listenForOnboardingGameComplete } from '../../services/onboardingGameService'

const MotionBox = motion(Box)

// Game type configurations
const gameTypeIcons = {
  normal_quiz: FileText,
  true_false: FlipHorizontal2,
  word_weaver: Sparkles,
  connections: Link2,
}

const gameTypeColors = {
  normal_quiz: {
    primary: '#3B82F6',
    shadow: 'rgba(59, 130, 246, 0.4)',
  },
  true_false: {
    primary: '#8B5CF6',
    shadow: 'rgba(139, 92, 246, 0.4)',
  },
  word_weaver: {
    primary: '#10B981',
    shadow: 'rgba(16, 185, 129, 0.4)',
  },
  connections: {
    primary: '#F59E0B',
    shadow: 'rgba(245, 158, 11, 0.4)',
  },
}

const EnhancedTimeDisplay = ({ gameTimer, hasTimeDilationAvailable }) => {
  if (!gameTimer) {
    return (
      <HStack spacing={1}>
        <Clock size={14} color="#6B7280" />
        <Text fontSize="sm" color="gray.500">
          Loading...
        </Text>
      </HStack>
    )
  }

  if (
    hasTimeDilationAvailable &&
    gameTimer.enhancedTime &&
    gameTimer.baseTime &&
    gameTimer.additionalTime > 0
  ) {
    return (
      <Tooltip
        label={`Base time: ${gameTimer.baseTime}s + Time Dilation: +${gameTimer.additionalTime}s`}
        placement="top"
        hasArrow
        bg="rgba(0, 0, 0, 0.9)"
        color="white"
        fontSize="xs"
      >
        <HStack spacing={1}>
          <Clock size={14} color="#10B981" />
          <VStack spacing={0} align="start">
            <HStack spacing={1}>
              <Text fontSize="sm" color="#10B981" fontWeight="bold">
                {gameTimer.enhancedTime}s
              </Text>
              <Timer size={12} color="#10B981" />
            </HStack>
            <Text fontSize="xs" color="gray.400" lineHeight="1">
              +{gameTimer.additionalTime}s bonus
            </Text>
          </VStack>
        </HStack>
      </Tooltip>
    )
  }

  return (
    <HStack spacing={1}>
      <Clock size={14} color="#6B7280" />
      <Text fontSize="sm" color="gray.300">
        {gameTimer.baseTime || gameTimer}s
      </Text>
    </HStack>
  )
}

const OnboardingGameHub = ({ article, onGameComplete }) => {
  const { t } = useTranslation(['GameHub', 'OnboardingProcess'])
  const toast = useToast()
  const { user } = useSelector(state => state.auth)

  const [gameData, setGameData] = useState(null)
  const [gameTimers, setGameTimers] = useState(null)
  const [hasTimeDilationAvailable, setHasTimeDilationAvailable] =
    useState(false)
  const [totalRQMMultiplier, setTotalRQMMultiplier] = useState(1)
  const [loading, setLoading] = useState(true)
  const [regenerating, setRegenerating] = useState({})
  const [selectedGame, setSelectedGame] = useState(null)

  const fetchGameData = useCallback(async () => {
    if (!article?._id) return

    try {
      setLoading(true)
      const response = await axios.get(`/api/gamehub/data/${article._id}`)
      setGameData(response.data.gameData)
      setGameTimers(response.data.gameTimers)
      setHasTimeDilationAvailable(response.data.hasTimeDilationAvailable)
      setTotalRQMMultiplier(response.data.totalRQMMultiplier || 1)
    } catch (error) {
      console.error('Error fetching game data:', error)
      toast({
        title: 'Error',
        description: 'Failed to load games. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }, [article?._id, toast])

  useEffect(() => {
    fetchGameData()

    // Listen for game completion events
    const cleanup = listenForOnboardingGameComplete(gameData => {
      console.log('Game completed in onboarding:', gameData)
      // Call the completion handler
      if (onGameComplete) {
        onGameComplete(gameData)
      }
    })

    return cleanup
  }, [fetchGameData, onGameComplete])

  const handleRegenerateGame = async gameType => {
    setRegenerating(prev => ({ ...prev, [gameType]: true }))

    try {
      await axios.post(`/api/gamehub/regenerate/${article._id}/${gameType}`)
      await fetchGameData()

      toast({
        title: 'Success',
        description: `${t(
          `gameTypes.${gameType}`,
        )} game generated successfully!`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate game. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setRegenerating(prev => ({ ...prev, [gameType]: false }))
    }
  }

  const handleGameSelect = async gameType => {
    try {
      setSelectedGame(gameType)

      // Create game session
      const sessionResponse = await axios.post('/api/gamehub/session/create', {
        articleId: article._id,
        gameType,
      })

      // Start game session
      const startResponse = await axios.post(
        `/api/gamehub/session/start/${sessionResponse.data.sessionId}?onBoarding=true`,
      )

      // Navigate to the game
      window.location.href = `/gamehub/${article._id}/${gameType}?onboarding=true&sessionId=${sessionResponse.data.sessionId}`
    } catch (error) {
      console.error('Error starting game:', error)
      toast({
        title: 'Error',
        description: 'Failed to start game. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      setSelectedGame(null)
    }
  }

  const games = [
    {
      id: 'normal_quiz',
      title: t('gameTypes.normal_quiz', 'Multiple Choice'),
      subtitle: t('gameSubtitles.normal_quiz', 'Test your knowledge'),
      icon: FileText,
      description: t(
        'gameShortDescriptions.normal_quiz',
        'Answer multiple choice questions based on the article',
      ),
      colors: gameTypeColors.normal_quiz,
      difficulty: t('difficulty.balanced', 'Balanced'),
      emoji: '🧠',
      available: gameData?.normal_quiz?.questions?.length === 5,
    },
    {
      id: 'true_false',
      title: t('gameTypes.true_false', 'True or False'),
      subtitle: t('gameSubtitles.true_false', 'Quick decisions'),
      icon: FlipHorizontal2,
      description: t(
        'gameShortDescriptions.true_false',
        'Decide if statements are true or false',
      ),
      colors: gameTypeColors.true_false,
      difficulty: t('difficulty.swift', 'Swift'),
      emoji: '⚡',
      available: gameData?.true_false?.statements?.length === 7,
    },
    {
      id: 'word_weaver',
      title: t('gameTypes.word_weaver', 'Word Weaver'),
      subtitle: t('gameSubtitles.word_weaver', 'Word puzzle'),
      icon: Sparkles,
      description: t(
        'gameShortDescriptions.word_weaver',
        'Unscramble words from the article',
      ),
      colors: gameTypeColors.word_weaver,
      difficulty: t('difficulty.creative', 'Creative'),
      emoji: '🔤',
      available: gameData?.word_weaver?.questions?.length === 5,
    },
    {
      id: 'connections',
      title: t('gameTypes.connections', 'Connections'),
      subtitle: t('gameSubtitles.connections', 'Find relationships'),
      icon: Link2,
      description: t(
        'gameShortDescriptions.connections',
        'Connect related concepts from the article',
      ),
      colors: gameTypeColors.connections,
      difficulty: t('difficulty.strategic', 'Strategic'),
      emoji: '🔗',
      available:
        gameData?.connections?.concepts?.length === 8 &&
        gameData?.connections?.validConnections?.length === 4,
    },
  ]

  if (loading) {
    return (
      <Box textAlign="center" py={8}>
        <Spinner size="xl" color="purple.500" />
        <Text mt={4} fontSize="lg" color="gray.300">
          {t(
            'OnboardingProcess:articleReading.loadingGames',
            'Loading games...',
          )}
        </Text>
      </Box>
    )
  }

  return (
    <Box w="100%" maxW="800px" mx="auto" p={4}>
      <VStack spacing={6}>
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          textAlign="center"
        >
          <Text fontSize="2xl" fontWeight="bold" color="white" mb={2}>
            🎮{' '}
            {t(
              'OnboardingProcess:articleReading.chooseGame',
              'Choose Your Challenge',
            )}
          </Text>
          <Text fontSize="md" color="gray.300" mb={4}>
            {t(
              'OnboardingProcess:articleReading.gameDescription',
              'Test your understanding with interactive games',
            )}
          </Text>

          {totalRQMMultiplier > 1 && (
            <Badge
              bg="rgba(16, 185, 129, 0.2)"
              color="emerald.300"
              px={3}
              py={1}
              borderRadius="full"
              fontSize="sm"
              border="1px solid"
              borderColor="rgba(16, 185, 129, 0.4)"
            >
              <HStack spacing={1}>
                <Crown size={14} />
                <Text>{totalRQMMultiplier}x Boost Active</Text>
              </HStack>
            </Badge>
          )}
        </MotionBox>

        <Grid
          templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }}
          gap={4}
          w="100%"
        >
          {games.map((game, index) => {
            const isNeedsGeneration = !game.available
            const isRegenInProgress = regenerating[game.id]
            const isGameSelected = selectedGame === game.id

            return (
              <MotionBox
                key={game.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={
                  isNeedsGeneration || isRegenInProgress ? {} : { scale: 1.02 }
                }
                whileTap={
                  isNeedsGeneration || isRegenInProgress ? {} : { scale: 0.98 }
                }
                onClick={
                  isNeedsGeneration || isRegenInProgress
                    ? undefined
                    : () => handleGameSelect(game.id)
                }
                cursor={
                  isNeedsGeneration || isRegenInProgress ? 'default' : 'pointer'
                }
              >
                <Box
                  bg={
                    isNeedsGeneration
                      ? 'rgba(245, 158, 11, 0.1)'
                      : 'rgba(255, 255, 255, 0.05)'
                  }
                  backdropFilter="blur(20px)"
                  border="2px solid"
                  borderColor={
                    isNeedsGeneration
                      ? 'rgba(245, 158, 11, 0.4)'
                      : 'rgba(255, 255, 255, 0.1)'
                  }
                  borderRadius="xl"
                  p={4}
                  position="relative"
                  overflow="hidden"
                  height="200px"
                  boxShadow={
                    isNeedsGeneration
                      ? '0 10px 25px -5px rgba(245, 158, 11, 0.3)'
                      : '0 20px 40px -12px rgba(0, 0, 0, 0.25)'
                  }
                  _hover={
                    isNeedsGeneration
                      ? {
                          borderColor: 'rgba(245, 158, 11, 0.6)',
                          boxShadow: '0 15px 35px -5px rgba(245, 158, 11, 0.4)',
                        }
                      : {
                          borderColor: game.colors.primary,
                          boxShadow: `0 20px 40px -12px ${game.colors.shadow}`,
                        }
                  }
                  transition="all 0.3s ease"
                >
                  <Box
                    position="absolute"
                    top={2}
                    right={2}
                    bg={isNeedsGeneration ? 'orange.500' : 'green.500'}
                    borderRadius="full"
                    px={2}
                    py={1}
                    fontSize="xs"
                    fontWeight="bold"
                    color="white"
                  >
                    {isNeedsGeneration ? 'Generate' : 'Ready'}
                  </Box>

                  <VStack spacing={3} align="start" height="100%">
                    <HStack spacing={3} w="100%">
                      <Box
                        bg={
                          isNeedsGeneration ? 'orange.500' : game.colors.primary
                        }
                        borderRadius="lg"
                        p={3}
                        boxShadow={
                          isNeedsGeneration
                            ? '0 8px 25px rgba(245, 158, 11, 0.4)'
                            : `0 8px 25px ${game.colors.shadow}`
                        }
                      >
                        <Icon as={game.icon} size={20} color="white" />
                      </Box>
                      <VStack align="start" spacing={1} flex={1}>
                        <HStack spacing={1}>
                          <Text fontSize="sm" opacity={0.8}>
                            {game.emoji}
                          </Text>
                          <Badge
                            bg={
                              isNeedsGeneration
                                ? 'rgba(245, 158, 11, 0.2)'
                                : 'rgba(255, 255, 255, 0.1)'
                            }
                            color={isNeedsGeneration ? 'orange.300' : 'white'}
                            px={2}
                            py={0.5}
                            borderRadius="full"
                            fontSize="xs"
                            fontWeight="bold"
                          >
                            {game.difficulty}
                          </Badge>
                        </HStack>
                        <Text
                          fontSize="md"
                          fontWeight="bold"
                          color="white"
                          lineHeight="1.2"
                        >
                          {game.title}
                        </Text>
                        <Text
                          fontSize="sm"
                          color="gray.300"
                          fontWeight="medium"
                        >
                          {game.subtitle}
                        </Text>
                      </VStack>
                    </HStack>

                    <Text
                      fontSize="sm"
                      color={isNeedsGeneration ? 'orange.200' : 'gray.300'}
                      lineHeight="1.4"
                      flex={1}
                    >
                      {isNeedsGeneration
                        ? 'Click generate to create this game'
                        : game.description}
                    </Text>

                    <HStack justify="space-between" w="100%" mt="auto">
                      <EnhancedTimeDisplay
                        gameTimer={gameTimers?.[game.id]}
                        hasTimeDilationAvailable={hasTimeDilationAvailable}
                      />

                      {isNeedsGeneration ? (
                        <Button
                          size="sm"
                          leftIcon={
                            isRegenInProgress ? (
                              <Spinner size="xs" />
                            ) : (
                              <Plus size={14} />
                            )
                          }
                          onClick={e => {
                            e.stopPropagation()
                            handleRegenerateGame(game.id)
                          }}
                          bg="linear-gradient(135deg, #F59E0B, #EAB308)"
                          color="white"
                          borderRadius="full"
                          isLoading={isRegenInProgress}
                          loadingText="Generating..."
                          _hover={{
                            bg: 'linear-gradient(135deg, #EAB308, #F59E0B)',
                            transform: 'translateY(-2px)',
                          }}
                          fontWeight="bold"
                          fontSize="sm"
                          px={4}
                        >
                          Generate
                        </Button>
                      ) : (
                        <HStack spacing={1} color={game.colors.primary}>
                          {isGameSelected ? (
                            <Spinner size="sm" />
                          ) : (
                            <>
                              <Play size={14} />
                              <Text fontSize="sm" fontWeight="bold">
                                Play
                              </Text>
                            </>
                          )}
                        </HStack>
                      )}
                    </HStack>
                  </VStack>
                </Box>
              </MotionBox>
            )
          })}
        </Grid>
      </VStack>
    </Box>
  )
}

export default OnboardingGameHub
