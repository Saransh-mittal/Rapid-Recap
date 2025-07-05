// components/gameHub/IntegratedGameHub.jsx - Premium Optimized Version
import React, { useState, useEffect } from 'react'
import {
  ChevronLeft,
  Play,
  FileText,
  FlipHorizontal2,
  Sparkles,
  Link2,
  Clock,
  Star,
  Trophy,
  CheckCircle,
  Zap,
  Crown,
  Gem,
  Target,
  RefreshCw,
} from 'lucide-react'
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  Flex,
  useToast,
  Badge,
  Icon,
  Grid,
  GridItem,
  Container,
  Spinner,
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import axios from 'axios'
import i18n from 'i18next'
import { useTranslation } from 'react-i18next'
import GameInstructionsModal from './GameInstructionsModal'
import GameDataGenerationLoader from './GameDataGenerationLoader'

const MotionBox = motion(Box)

const gameTypeIcons = {
  normal_quiz: FileText,
  true_false: FlipHorizontal2,
  word_weaver: Sparkles,
  connections: Link2,
}

const gameTypeNames = {
  normal_quiz: 'Knowledge Quest',
  true_false: 'Truth Detector',
  word_weaver: 'Word Architect',
  connections: 'Mind Mapper',
}

const gameTypeColors = {
  normal_quiz: {
    primary: '#3B82F6',
    gradient: 'linear(135deg, #667eea 0%, #764ba2 100%)',
    shadow: 'rgba(59, 130, 246, 0.4)',
  },
  true_false: {
    primary: '#8B5CF6',
    gradient: 'linear(135deg, #a8edea 0%, #fed6e3 100%)',
    shadow: 'rgba(139, 92, 246, 0.4)',
  },
  word_weaver: {
    primary: '#10B981',
    gradient: 'linear(135deg, #d299c2 0%, #fef9d7 100%)',
    shadow: 'rgba(16, 185, 129, 0.4)',
  },
  connections: {
    primary: '#8B5CF6',
    gradient: 'linear(135deg, #ffecd2 0%, #fcb69f 100%)',
    shadow: 'rgba(139, 92, 246, 0.4)',
  },
}

// Minimalist Background Component
const PremiumBackground = () => {
  return (
    <Box
      position="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
      overflow="hidden"
      zIndex={0}
    >
      {/* Subtle gradient overlay */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bgGradient="radial(circle at 30% 20%, rgba(59, 130, 246, 0.05), transparent 70%),
                   radial(circle at 70% 80%, rgba(139, 92, 246, 0.03), transparent 70%)"
      />
    </Box>
  )
}

// Premium Games Completed Component - Optimized
const GamesCompletedView = ({
  completionData,
  gameData,
  onViewResults,
  onBackToArticle,
  articleId,
}) => {
  const { t } = useTranslation('GameHub')
  const navigate = useNavigate()

  return (
    <Box minH="100vh" bg="gray.900" color="white" position="relative">
      <PremiumBackground />

      <Container maxW="4xl" py={8} position="relative" zIndex={1}>
        <VStack spacing={6}>
          {/* Compact Hero Section */}
          <MotionBox
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            textAlign="center"
          >
            <Text fontSize="4xl" mb={4}>
              🏆
            </Text>

            <Text
              fontSize={{ base: '2xl', md: '4xl' }}
              fontWeight="900"
              bgGradient="linear(45deg, #FFD700, #FFA500)"
              bgClip="text"
              mb={3}
              letterSpacing="tight"
            >
              {t('headers.missionAccomplished')}
            </Text>

            <Text fontSize="lg" color="gray.300" maxW="500px" lineHeight="1.6">
              {t('descriptions.masteredChallenges')}
            </Text>
          </MotionBox>

          {/* Compact Stats Card */}
          <MotionBox
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            bg="rgba(255, 255, 255, 0.05)"
            backdropFilter="blur(20px)"
            border="1px solid"
            borderColor="rgba(255, 255, 255, 0.1)"
            borderRadius="2xl"
            p={6}
            maxW="500px"
            w="100%"
            boxShadow="0 20px 40px -12px rgba(0, 0, 0, 0.4)"
          >
            <VStack spacing={4}>
              {/* Best Score */}
              <HStack spacing={3} align="center">
                <Crown size={32} color="#FFD700" />
                <VStack spacing={0} align="center">
                  <Text
                    fontSize="3xl"
                    fontWeight="900"
                    bgGradient="linear(45deg, #FFD700, #FFA500)"
                    bgClip="text"
                  >
                    {completionData.bestScore}
                  </Text>
                  <Text fontSize="sm" color="gray.400" fontWeight="600">
                    {t('stats.bestScore')}
                  </Text>
                </VStack>
              </HStack>

              {/* Compact Games Grid */}
              <Grid templateColumns="repeat(2, 1fr)" gap={3} w="100%">
                {completionData.gamesPlayed.map(gameType => {
                  const IconComponent = gameTypeIcons[gameType]
                  const colors = gameTypeColors[gameType]
                  const isBest = gameType === completionData.bestGameType

                  return (
                    <Box
                      key={gameType}
                      bg={
                        isBest
                          ? 'rgba(255, 215, 0, 0.1)'
                          : 'rgba(255, 255, 255, 0.05)'
                      }
                      border="1px solid"
                      borderColor={isBest ? 'gold' : 'rgba(255, 255, 255, 0.1)'}
                      borderRadius="xl"
                      p={3}
                      textAlign="center"
                      position="relative"
                    >
                      {isBest && (
                        <Box
                          position="absolute"
                          top={1}
                          right={1}
                          bg="gold"
                          borderRadius="full"
                          p={1}
                        >
                          <Crown size={12} color="black" />
                        </Box>
                      )}

                      <VStack spacing={2}>
                        <Box
                          bg={colors.primary}
                          borderRadius="lg"
                          p={2}
                          boxShadow={`0 0 15px ${colors.shadow}`}
                        >
                          {IconComponent && (
                            <Icon
                              as={IconComponent}
                              boxSize={5}
                              color="white"
                            />
                          )}
                        </Box>
                        <Text fontSize="xs" fontWeight="bold" color="white">
                          {t(`gameTypes.${gameType}`).split(' ')[0]}
                        </Text>
                      </VStack>
                    </Box>
                  )
                })}
              </Grid>

              {/* Stats Row */}
              <Grid templateColumns="repeat(2, 1fr)" gap={4} w="100%">
                <VStack spacing={1}>
                  <Text fontSize="xl" fontWeight="bold" color="cyan.400">
                    {completionData.totalAttempts}
                  </Text>
                  <Text fontSize="xs" color="gray.400" textAlign="center">
                    {t('stats.totalAttempts')}
                  </Text>
                </VStack>
                <VStack spacing={1}>
                  <Text fontSize="xl" fontWeight="bold" color="green.400">
                    {Math.round(completionData.percentile)}%
                  </Text>
                  <Text fontSize="xs" color="gray.400" textAlign="center">
                    {t('stats.percentileRank')}
                  </Text>
                </VStack>
              </Grid>
            </VStack>
          </MotionBox>

          {/* NEW: View Latest Report Button */}
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            w="100%"
            maxW="400px"
          >
            <Button
              onClick={() => navigate(`/gamehub/${articleId}/report`)}
              size="lg"
              height="60px"
              width="100%"
              bg="rgba(139, 92, 246, 0.1)"
              border="1px solid"
              borderColor="rgba(139, 92, 246, 0.3)"
              color="purple.300"
              borderRadius="xl"
              leftIcon={<FileText size={20} />}
              _hover={{
                bg: 'rgba(139, 92, 246, 0.2)',
                borderColor: 'rgba(139, 92, 246, 0.5)',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(139, 92, 246, 0.3)',
              }}
              _active={{
                transform: 'translateY(0px)',
              }}
              transition="all 0.2s"
              fontWeight="medium"
              fontSize="md"
              boxShadow="0 4px 15px rgba(139, 92, 246, 0.2)"
            >
              {t('actions.viewLatestReport')}
            </Button>
            <Text
              fontSize="xs"
              color="gray.500"
              textAlign="center"
              mt={2}
              fontStyle="italic"
            >
              {t('actions.reviewPerformance')}
            </Text>
          </MotionBox>

          {/* Action Button */}
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              onClick={onBackToArticle}
              size="lg"
              height="50px"
              px={8}
              bgGradient="linear(45deg, #667eea, #764ba2)"
              color="white"
              leftIcon={<ChevronLeft size={20} />}
              borderRadius="full"
              fontSize="md"
              fontWeight="bold"
              boxShadow="0 8px 25px rgba(102, 126, 234, 0.4)"
              _hover={{
                boxShadow: '0 12px 30px rgba(102, 126, 234, 0.6)',
              }}
              transition="all 0.2s"
            >
              {t('navigation.returnToArticle')}
            </Button>
          </MotionBox>
        </VStack>
      </Container>
    </Box>
  )
}

// Premium Game Menu Component - Optimized
const GameMenu = ({ onSelectGame, gameData, articleId, onRegenerate }) => {
  const { t } = useTranslation('GameHub')

  const [regenerating, setRegenerating] = useState({
    normal_quiz: false,
    true_false: false,
    word_weaver: false,
    connections: false,
  })

  const handleRegenerate = async (e, gameType) => {
    e.stopPropagation() // Prevent card click
    setRegenerating(prev => ({ ...prev, [gameType]: true }))
    await onRegenerate(gameType)
    setRegenerating(prev => ({ ...prev, [gameType]: false }))
  }

  const games = [
    {
      id: 'normal_quiz',
      title: t('gameTypes.normal_quiz'),
      subtitle: t('gameSubtitles.normal_quiz'),
      icon: FileText,
      description: t('gameShortDescriptions.normal_quiz'),
      colors: gameTypeColors.normal_quiz,
      difficulty: t('difficulty.balanced'),
      time: '50s',
      emoji: '🧠',
      available: gameData?.normal_quiz?.questions?.length === 5,
    },
    {
      id: 'true_false',
      title: t('gameTypes.true_false'),
      subtitle: t('gameSubtitles.true_false'),
      icon: FlipHorizontal2,
      description: t('gameShortDescriptions.true_false'),
      colors: gameTypeColors.true_false,
      difficulty: t('difficulty.swift'),
      time: '35s',
      emoji: '⚡',
      available: gameData?.true_false?.statements?.length === 7,
    },
    {
      id: 'word_weaver',
      title: t('gameTypes.word_weaver'),
      subtitle: t('gameSubtitles.word_weaver'),
      icon: Sparkles,
      description: t('gameShortDescriptions.word_weaver'),
      colors: gameTypeColors.word_weaver,
      difficulty: t('difficulty.creative'),
      time: '100s',
      emoji: '🔤',
      available: gameData?.word_weaver?.questions?.length === 5,
    },
    {
      id: 'connections',
      title: t('gameTypes.connections'),
      subtitle: t('gameSubtitles.connections'),
      icon: Link2,
      description: t('gameShortDescriptions.connections'),
      colors: gameTypeColors.connections,
      difficulty: t('difficulty.strategic'),
      time: '72s',
      emoji: '🔗',
      available:
        gameData?.connections?.concepts?.length === 8 &&
        gameData?.connections?.validConnections?.length === 4,
    },
  ]

  return (
    <Box minH="100vh" bg="gray.900" color="white" position="relative">
      <PremiumBackground />

      <Container maxW="6xl" py={6} position="relative" zIndex={1}>
        <VStack spacing={8}>
          {/* Enhanced Hero Header */}
          <MotionBox
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            textAlign="center"
          >
            <VStack spacing={6}>
              {/* Main Title Section */}
              <VStack spacing={3}>
                <HStack spacing={3} justify="center" align="center">
                  <Text fontSize={{ base: '4xl', md: '5xl' }}>🚀</Text>
                  <Text
                    fontSize={{ base: '2xl', md: '4xl' }}
                    fontWeight="900"
                    bgGradient="linear(45deg, #667eea, #764ba2, #f093fb)"
                    bgClip="text"
                    letterSpacing="tight"
                  >
                    {t('headers.chooseChallenge')}
                  </Text>
                  <Text fontSize={{ base: '4xl', md: '5xl' }}>🎯</Text>
                </HStack>

                <Text
                  fontSize={{ base: 'lg', md: 'xl' }}
                  color="gray.300"
                  maxW="700px"
                  lineHeight="1.6"
                  fontWeight="500"
                >
                  {t('descriptions.transformLearning')}
                </Text>
              </VStack>

              {/* Feature Highlights */}
              <Grid
                templateColumns={{
                  base: 'repeat(2, 1fr)',
                  md: 'repeat(4, 1fr)',
                }}
                gap={4}
                maxW="600px"
              >
                <VStack
                  spacing={2}
                  p={3}
                  bg="rgba(16, 185, 129, 0.1)"
                  borderRadius="xl"
                  border="1px solid"
                  borderColor="rgba(16, 185, 129, 0.3)"
                >
                  <Target size={20} color="#10B981" />
                  <Text
                    fontSize="xs"
                    color="emerald.400"
                    fontWeight="bold"
                    textAlign="center"
                  >
                    {t('features.equalScoring')}
                  </Text>
                </VStack>

                <VStack
                  spacing={2}
                  p={3}
                  bg="rgba(139, 92, 246, 0.1)"
                  borderRadius="xl"
                  border="1px solid"
                  borderColor="rgba(139, 92, 246, 0.3)"
                >
                  <Zap size={20} color="#8B5CF6" />
                  <Text
                    fontSize="xs"
                    color="purple.400"
                    fontWeight="bold"
                    textAlign="center"
                  >
                    {t('features.aiPowered')}
                  </Text>
                </VStack>

                <VStack
                  spacing={2}
                  p={3}
                  bg="rgba(59, 130, 246, 0.1)"
                  borderRadius="xl"
                  border="1px solid"
                  borderColor="rgba(59, 130, 246, 0.3)"
                >
                  <Trophy size={20} color="#3B82F6" />
                  <Text
                    fontSize="xs"
                    color="blue.400"
                    fontWeight="bold"
                    textAlign="center"
                  >
                    {t('features.competitive')}
                  </Text>
                </VStack>

                <VStack
                  spacing={2}
                  p={3}
                  bg="rgba(245, 158, 11, 0.1)"
                  borderRadius="xl"
                  border="1px solid"
                  borderColor="rgba(245, 158, 11, 0.3)"
                >
                  <Star size={20} color="#F59E0B" />
                  <Text
                    fontSize="xs"
                    color="yellow.400"
                    fontWeight="bold"
                    textAlign="center"
                  >
                    {t('features.adaptive')}
                  </Text>
                </VStack>
              </Grid>
            </VStack>
          </MotionBox>

          {/* Premium Games Grid */}
          <Grid
            templateColumns={{
              base: '1fr',
              md: 'repeat(2, 1fr)',
              lg: 'repeat(2, 1fr)',
            }}
            gap={{ base: 4, md: 5 }}
            w="100%"
            maxW="800px"
          >
            {games.map((game, index) => {
              const Icon = game.icon
              const isDisabled = !game.available
              const isRegenInProgress = regenerating[game.id]

              return (
                <MotionBox
                  key={game.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={
                    isDisabled || isRegenInProgress
                      ? {}
                      : { scale: 1.02, y: -5 }
                  }
                  whileTap={
                    isDisabled || isRegenInProgress ? {} : { scale: 0.98 }
                  }
                  onClick={
                    isDisabled || isRegenInProgress
                      ? undefined
                      : () => onSelectGame(game.id)
                  }
                  cursor={
                    isDisabled || isRegenInProgress ? 'default' : 'pointer'
                  }
                >
                  <Box
                    bg={
                      isDisabled
                        ? 'rgba(75, 85, 99, 0.2)'
                        : 'rgba(255, 255, 255, 0.05)'
                    }
                    backdropFilter="blur(20px)"
                    border="1px solid"
                    borderColor={
                      isDisabled
                        ? 'rgba(75, 85, 99, 0.4)'
                        : 'rgba(255, 255, 255, 0.1)'
                    }
                    borderRadius="2xl"
                    p={{ base: 4, md: 6 }}
                    position="relative"
                    overflow="hidden"
                    // REMOVED: opacity={isDisabled ? 0.6 : 1} - this was making everything faded
                    height={{ base: '200px', md: '220px' }}
                    boxShadow={
                      isDisabled
                        ? '0 10px 25px -5px rgba(239, 68, 68, 0.2)' // Red shadow for disabled
                        : '0 20px 40px -12px rgba(0, 0, 0, 0.25)'
                    }
                    _hover={
                      isDisabled
                        ? {}
                        : {
                            borderColor: game.colors.primary,
                            boxShadow: `0 20px 40px -12px ${game.colors.shadow}`,
                          }
                    }
                    transition="all 0.3s ease"
                  >
                    {/* Enhanced Status Indicator */}
                    <Box
                      position="absolute"
                      top={3}
                      right={3}
                      bg={isDisabled ? 'red.500' : 'green.500'}
                      borderRadius="full"
                      px={2}
                      py={1}
                      fontSize="2xs"
                      fontWeight="bold"
                      color="white"
                      boxShadow={
                        isDisabled
                          ? '0 0 10px rgba(239, 68, 68, 0.5)'
                          : '0 0 10px rgba(34, 197, 94, 0.5)'
                      }
                    >
                      {isDisabled ? t('status.locked') : t('status.ready')}
                    </Box>

                    <VStack spacing={3} align="start" height="100%">
                      {/* Header - Apply fading to content when disabled */}
                      <HStack
                        spacing={3}
                        w="100%"
                        opacity={isDisabled ? 0.5 : 1}
                      >
                        <Box
                          bg={isDisabled ? 'gray.600' : game.colors.primary}
                          borderRadius="xl"
                          p={3}
                          boxShadow={
                            isDisabled
                              ? 'none'
                              : `0 8px 25px ${game.colors.shadow}`
                          }
                        >
                          <Icon size={24} color="white" />
                        </Box>

                        <VStack align="start" spacing={0} flex={1}>
                          <HStack spacing={1}>
                            <Text fontSize="sm" opacity={0.8}>
                              {game.emoji}
                            </Text>
                            <Badge
                              bg={
                                isDisabled
                                  ? 'gray.700'
                                  : 'rgba(255, 255, 255, 0.1)'
                              }
                              color={isDisabled ? 'gray.400' : 'white'}
                              px={2}
                              py={0.5}
                              borderRadius="full"
                              fontSize="2xs"
                              fontWeight="bold"
                            >
                              {game.difficulty}
                            </Badge>
                          </HStack>

                          <Text
                            fontSize={{ base: 'md', md: 'lg' }}
                            fontWeight="900"
                            color={isDisabled ? 'gray.400' : 'white'}
                            lineHeight="1.2"
                          >
                            {game.title}
                          </Text>

                          <Text
                            fontSize="sm"
                            color={isDisabled ? 'gray.500' : 'gray.300'}
                            fontWeight="600"
                          >
                            {game.subtitle}
                          </Text>
                        </VStack>
                      </HStack>

                      {/* Description - Apply fading when disabled */}
                      <Text
                        fontSize="sm"
                        color={isDisabled ? 'gray.500' : 'gray.300'}
                        lineHeight="1.5"
                        flex={1}
                        opacity={isDisabled ? 0.5 : 1}
                      >
                        {isDisabled
                          ? t('errors.insufficientData')
                          : game.description}
                      </Text>

                      {/* Footer - Different treatment for disabled/enabled */}
                      <HStack justify="space-between" w="100%" mt="auto">
                        {/* Time indicator - faded when disabled */}
                        <HStack spacing={1} opacity={isDisabled ? 0.4 : 1}>
                          <Clock
                            size={14}
                            color={isDisabled ? '#6B7280' : game.colors.primary}
                          />
                          <Text
                            fontSize="sm"
                            color={isDisabled ? 'gray.500' : 'gray.300'}
                          >
                            {game.time}
                          </Text>
                        </HStack>

                        {/* Action Button - HIGHLIGHTED when disabled */}
                        {isDisabled ? (
                          <Button
                            size="sm"
                            leftIcon={
                              isRegenInProgress ? (
                                <Spinner size="xs" />
                              ) : (
                                <RefreshCw size={14} />
                              )
                            }
                            onClick={e => handleRegenerate(e, game.id)}
                            // ENHANCED STYLING FOR PROMINENCE
                            bg="linear-gradient(135deg, #F59E0B, #EAB308)"
                            color="white"
                            borderRadius="full"
                            isLoading={isRegenInProgress}
                            loadingText={t('actions.generating')}
                            _hover={{
                              bg: 'linear-gradient(135deg, #EAB308, #F59E0B)',
                              transform: 'translateY(-2px)',
                              boxShadow: '0 8px 25px rgba(245, 158, 11, 0.4)',
                            }}
                            _active={{
                              transform: 'translateY(0px)',
                            }}
                            fontWeight="bold"
                            fontSize="sm"
                            px={4}
                            // GLOWING EFFECT
                            boxShadow="0 0 20px rgba(245, 158, 11, 0.3)"
                            border="1px solid"
                            borderColor="yellow.400"
                            transition="all 0.2s ease"
                            // PULSING ANIMATION
                            animation={
                              !isRegenInProgress ? 'pulse 2s infinite' : 'none'
                            }
                            sx={{
                              '@keyframes pulse': {
                                '0%, 100%': {
                                  boxShadow: '0 0 20px rgba(245, 158, 11, 0.3)',
                                },
                                '50%': {
                                  boxShadow: '0 0 30px rgba(245, 158, 11, 0.6)',
                                },
                              },
                            }}
                          >
                            {t('actions.retryGeneration')}
                          </Button>
                        ) : (
                          <HStack spacing={1} color={game.colors.primary}>
                            <Play size={16} />
                            <Text fontSize="sm" fontWeight="bold">
                              {t('navigation.startGame')}
                            </Text>
                          </HStack>
                        )}
                      </HStack>

                      {/* Enhanced Disabled Overlay - More subtle */}
                      {isDisabled && (
                        <Box
                          position="absolute"
                          top="20px"
                          left="20px"
                          bg="rgba(239, 68, 68, 0.8)"
                          color="white"
                          px={3}
                          py={1}
                          borderRadius="full"
                          fontSize="xs"
                          fontWeight="bold"
                          backdropFilter="blur(10px)"
                          boxShadow="0 4px 15px rgba(239, 68, 68, 0.3)"
                        >
                          🔒 {t('errors.needsGeneration')}
                        </Box>
                      )}
                    </VStack>
                  </Box>
                </MotionBox>
              )
            })}
          </Grid>
        </VStack>
      </Container>
    </Box>
  )
}

// Main Integrated Game Hub Component
const IntegratedGameHub = () => {
  const { articleId } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { user } = useSelector(state => state.auth)
  const { t } = useTranslation('GameHub')

  // State management
  const [gameData, setGameData] = useState(null)
  const [completionData, setCompletionData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [articleData, setArticleData] = useState(null)
  const [selectedGameType, setSelectedGameType] = useState(null)
  const [showInstructions, setShowInstructions] = useState(false)

  useEffect(() => {
    if (articleId && user?._id) {
      fetchGameData()
      checkGameCompletion()
    }
  }, [articleId, user])

  const fetchGameData = async () => {
    try {
      setLoading(true)
      setIsGenerating(true)
      setGenerationProgress(0)

      // First, get article data for the loader
      try {
        const articleResponse = await axios.get(
          `/api/articles/article/${articleId}`,
        )
        setArticleData(articleResponse.data.newArticle)
      } catch (err) {
        console.warn('Could not fetch article data:', err)
      }

      const response = await axios.get(`/api/gamehub/data/${articleId}`)

      setGameData(response.data.gameData)
      setIsGenerating(false)
      setGenerationProgress(100)
    } catch (error) {
      console.error('Error fetching game data:', error)
      setIsGenerating(false)
      setGenerationProgress(0)

      toast({
        title: 'Connection Error',
        description:
          'Unable to load game data. Please check your connection and try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRegenerateGame = async gameType => {
    toast({
      title: t('toasts.generationStarted.title'),
      description: t('toasts.generationStarted.description', {
        game: t(`gameTypes.${gameType}`),
      }),
      status: 'info',
      duration: 3000,
      isClosable: true,
      position: 'top',
    })

    try {
      const response = await axios.post(
        `/api/gamehub/regenerate/${articleId}/${gameType}`,
      )
      // Update the state with the complete, new game data object
      setGameData(response.data.gameData)
      toast({
        title: t('toasts.generationSuccess.title'),
        description: t('toasts.generationSuccess.description', {
          game: t(`gameTypes.${gameType}`),
        }),
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'top',
      })
    } catch (error) {
      console.error(`Error regenerating ${gameType}:`, error)
      toast({
        title: t('toasts.generationFailed.title'),
        description:
          error.response?.data?.error ||
          t('toasts.generationFailed.description'),
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      })
    }
  }

  const checkGameCompletion = async () => {
    try {
      const response = await axios.get(
        `/api/gamehub/completion/${articleId}/${user._id}`,
      )

      if (response.data.hasPlayed) {
        setCompletionData(response.data)
      }
    } catch (error) {
      console.error('Error checking game completion:', error)
    }
  }

  const handleSelectGame = gameType => {
    setSelectedGameType(gameType)
    setShowInstructions(true)
  }

  const handleStartGame = () => {
    setShowInstructions(false)
    navigate(`/gamehub/${articleId}/${selectedGameType}`, { replace: true })
  }

  const handleBackToArticle = () => {
    navigate(-1)
  }

  const handleCloseInstructions = () => {
    setShowInstructions(false)
    setSelectedGameType(null)
  }

  // Show generation loading screen if generating
  if (isGenerating || (loading && !gameData)) {
    return (
      <GameDataGenerationLoader
        progress={generationProgress}
        articleTitle={
          articleData?.title || articleData?.hindiTitle || 'Article'
        }
      />
    )
  }

  // Show basic loading if no game data yet
  if (loading) {
    return (
      <Box
        minH="100vh"
        bg="gray.900"
        color="white"
        display="flex"
        alignItems="center"
        justifyContent="center"
        position="relative"
      >
        <PremiumBackground />
        <VStack spacing={4} position="relative" zIndex={1}>
          <Text fontSize="6xl">🧠</Text>
          <Text fontSize="xl" fontWeight="bold">
            Loading Game Hub...
          </Text>
          <Text fontSize="md" color="gray.400">
            Preparing your learning adventure
          </Text>
        </VStack>
      </Box>
    )
  }

  return (
    <>
      {/* Premium Header */}
      <Box
        bg="rgba(0, 0, 0, 0.9)"
        backdropFilter="blur(20px)"
        borderBottom="1px solid"
        borderColor="rgba(255, 255, 255, 0.1)"
        position="sticky"
        top={0}
        zIndex={100}
      >
        <Container maxW="6xl">
          <Flex justify="space-between" align="center" py={3}>
            <MotionBox whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                leftIcon={<ChevronLeft size={18} />}
                onClick={handleBackToArticle}
                variant="ghost"
                color="gray.300"
                size="md"
                borderRadius="full"
                px={2}
                _hover={{
                  color: 'white',
                  bg: 'rgba(255, 255, 255, 0.1)',
                }}
                transition="all 0.2s"
              >
                {t('navigation.back')}
              </Button>
            </MotionBox>

            <HStack spacing={2}>
              <Box bg="rgba(139, 92, 246, 0.1)" borderRadius="full" p={2}>
                <Sparkles size={18} color="#8B5CF6" />
              </Box>
              <Text
                fontSize="lg"
                fontWeight="900"
                bgGradient="linear(45deg, #667eea, #764ba2)"
                bgClip="text"
              >
                {t('headers.gameHub')}
              </Text>
            </HStack>

            <Box width={{ base: '80px', md: '120px' }} />
          </Flex>
        </Container>
      </Box>

      {completionData ? (
        <GamesCompletedView
          completionData={completionData}
          gameData={gameData}
          onBackToArticle={handleBackToArticle}
          articleId={articleId}
        />
      ) : (
        <GameMenu
          onSelectGame={handleSelectGame}
          gameData={gameData}
          articleId={articleId}
          onRegenerate={handleRegenerateGame} // <-- Pass the new handler
        />
      )}

      <GameInstructionsModal
        isOpen={showInstructions}
        onClose={handleCloseInstructions}
        gameType={selectedGameType}
        onStartGame={handleStartGame}
      />
    </>
  )
}

export default IntegratedGameHub
