// components/gameHub/IntegratedGameHub.jsx - Updated with proper loading states
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
  RotateCcw,
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
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import axios from 'axios'
import i18n from 'i18next'
import { useTranslation } from 'react-i18next'
import GameInstructionsModal from './GameInstructionsModal'
import GameDataGenerationLoader from './GameDataGenerationLoader'
import { useSocket } from '../../customHooks/useSocket'

const MotionBox = motion(Box)

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

// Games Completed Component
const GamesCompletedView = ({
  completionData,
  gameData,
  onViewResults,
  onBackToArticle,
}) => {
  const { t } = useTranslation()

  return (
    <Box minH="100vh" bg="gray.900" color="white" p={8}>
      <VStack spacing={8}>
        <Box textAlign="center">
          <Text fontSize="4xl" fontWeight="bold" mb={4} color="green.400">
            🎉 Games Completed!
          </Text>
          <Text fontSize="xl" color="gray.300">
            You've successfully completed games for this article
          </Text>
          <Text fontSize="sm" color="gray.500" mt={2}>
            Your performance has been recorded and contributes to your overall
            progress
          </Text>
        </Box>

        <Box
          bg="gray.800"
          p={6}
          borderRadius="2xl"
          border="1px solid"
          borderColor="gray.700"
          maxW="500px"
          w="100%"
        >
          <VStack spacing={4}>
            <HStack spacing={4} align="center">
              <Icon as={Trophy} boxSize={8} color="yellow.400" />
              <VStack spacing={0} align="start">
                <Text fontSize="2xl" fontWeight="bold" color="yellow.400">
                  {completionData.bestScore}
                </Text>
                <Text fontSize="sm" color="gray.400">
                  Best RQM Score
                </Text>
              </VStack>
            </HStack>

            <Box w="100%">
              <Text fontSize="sm" color="gray.400" mb={2} textAlign="center">
                Games Completed:
              </Text>
              <HStack justify="center" spacing={2} flexWrap="wrap">
                {completionData.gamesPlayed.map(gameType => {
                  const IconComponent = gameTypeIcons[gameType]
                  const color = gameTypeColors[gameType]
                  const isBest = gameType === completionData.bestGameType

                  return (
                    <Badge
                      key={gameType}
                      colorScheme={color}
                      variant={isBest ? 'solid' : 'outline'}
                      px={3}
                      py={1}
                      borderRadius="full"
                      fontSize="sm"
                    >
                      <HStack spacing={1}>
                        {IconComponent && (
                          <Icon as={IconComponent} boxSize={3} />
                        )}
                        <Text>{gameTypeNames[gameType]}</Text>
                        {isBest && <Trophy size={12} />}
                      </HStack>
                    </Badge>
                  )
                })}
              </HStack>
            </Box>

            <VStack spacing={2} w="100%">
              <HStack justify="space-between" w="100%">
                <Text fontSize="sm" color="gray.400">
                  Total Attempts:
                </Text>
                <Text fontSize="sm" color="white">
                  {completionData.totalAttempts}
                </Text>
              </HStack>
              <HStack justify="space-between" w="100%">
                <Text fontSize="sm" color="gray.400">
                  Percentile:
                </Text>
                <Text fontSize="sm" color="green.400">
                  {Math.round(completionData.percentile)}%
                </Text>
              </HStack>
            </VStack>
          </VStack>
        </Box>

        <VStack spacing={4} w="100%" maxW="400px">
          <Button
            onClick={onBackToArticle}
            colorScheme="purple"
            leftIcon={<ChevronLeft />}
            size="lg"
            width="100%"
            _hover={{
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 25px rgba(139, 92, 246, 0.4)',
            }}
          >
            Back to Article
          </Button>
        </VStack>

        <Box
          bg="gray.800"
          p={4}
          borderRadius="lg"
          border="1px solid"
          borderColor="gray.700"
          maxW="500px"
          textAlign="center"
        >
          <Text fontSize="sm" color="gray.300">
            🌟 Great job completing the games! Your performance helps improve
            your overall knowledge score. Continue reading articles and playing
            games to boost your RQM ranking!
          </Text>
        </Box>
      </VStack>
    </Box>
  )
}

// Game Menu Component
const GameMenu = ({ onSelectGame, gameData, articleId }) => {
  const { t } = useTranslation()

  const games = [
    {
      id: 'normal_quiz',
      title: 'Normal Quiz',
      icon: FileText,
      description: '5 multiple choice questions',
      color: 'from-indigo-600 to-blue-500',
      difficulty: 'Standard',
      time: '50s',
      available: gameData?.normal_quiz?.questions?.length >= 3,
    },
    {
      id: 'true_false',
      title: 'True or False',
      icon: FlipHorizontal2,
      description: '7 challenging statements',
      color: 'from-purple-600 to-pink-500',
      difficulty: 'Quick',
      time: '35s',
      available: gameData?.true_false?.statements?.length >= 5,
    },
    {
      id: 'word_weaver',
      title: 'Word Weaver',
      icon: Sparkles,
      description: '5 fill-in-the-blank puzzles',
      color: 'from-emerald-600 to-teal-500',
      difficulty: 'Challenge',
      time: '100s',
      available: gameData?.word_weaver?.questions?.length >= 3,
    },
    {
      id: 'connections',
      title: 'Connect Concepts',
      icon: Link2,
      description: '6 concepts, find connections',
      color: 'from-violet-600 to-indigo-500',
      difficulty: 'Expert',
      time: '80s',
      available: gameData?.connections?.concepts?.length >= 4,
    },
  ]

  return (
    <Box minH="100vh" bg="gray.900" color="white" p={8}>
      <VStack spacing={8}>
        <Box textAlign="center">
          <Text
            fontSize="5xl"
            fontWeight="bold"
            mb={4}
            bgGradient="linear(to-r, blue.400, purple.400)"
            bgClip="text"
          >
            Game Hub
          </Text>
          <Text fontSize="xl" color="gray.300">
            Challenge yourself with interactive learning games
          </Text>
          <Text fontSize="sm" color="gray.500" mt={2}>
            All games offer equivalent RQM scoring potential
          </Text>
        </Box>

        <Flex wrap="wrap" justify="center" gap={6} maxW="6xl">
          {games.map(game => {
            const Icon = game.icon
            const isDisabled = !game.available

            return (
              <MotionBox
                key={game.id}
                whileHover={isDisabled ? {} : { scale: 1.05 }}
                whileTap={isDisabled ? {} : { scale: 0.95 }}
                onClick={isDisabled ? undefined : () => onSelectGame(game.id)}
                cursor={isDisabled ? 'not-allowed' : 'pointer'}
                opacity={isDisabled ? 0.5 : 1}
                bg="gray.800"
                p={6}
                borderRadius="2xl"
                border="1px solid"
                borderColor={isDisabled ? 'gray.600' : 'gray.700'}
                width="280px"
                position="relative"
                overflow="hidden"
                _hover={
                  isDisabled
                    ? {}
                    : {
                        borderColor: 'purple.500',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                      }
                }
              >
                <Box
                  position="absolute"
                  top={0}
                  left={0}
                  right={0}
                  bottom={0}
                  bgGradient={`linear(to-br, ${game.color})`}
                  opacity={0.1}
                />

                <VStack spacing={4} position="relative">
                  <HStack justify="space-between" w="100%">
                    <Box
                      p={3}
                      borderRadius="lg"
                      bgGradient={`linear(to-br, ${game.color})`}
                    >
                      <Icon size={24} />
                    </Box>
                    <VStack spacing={1} align="end">
                      <Text
                        fontSize="xs"
                        bg={isDisabled ? 'gray.600' : 'gray.700'}
                        px={2}
                        py={1}
                        borderRadius="full"
                        color="gray.300"
                      >
                        {game.difficulty}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {game.time}
                      </Text>
                    </VStack>
                  </HStack>

                  <VStack spacing={2} align="start" w="100%">
                    <Text fontSize="xl" fontWeight="bold">
                      {game.title}
                    </Text>
                    <Text fontSize="sm" color="gray.400">
                      {game.description}
                    </Text>
                    <HStack
                      mt={4}
                      color={isDisabled ? 'gray.600' : 'gray.500'}
                      fontSize="sm"
                    >
                      <Play size={16} />
                      <Text>{isDisabled ? 'Not Available' : 'Play Now'}</Text>
                    </HStack>
                  </VStack>

                  {isDisabled && (
                    <Box
                      position="absolute"
                      top="50%"
                      left="50%"
                      transform="translate(-50%, -50%)"
                      bg="red.600"
                      color="white"
                      px={3}
                      py={1}
                      borderRadius="full"
                      fontSize="xs"
                      fontWeight="bold"
                    >
                      Insufficient Data
                    </Box>
                  )}
                </VStack>
              </MotionBox>
            )
          })}
        </Flex>

        <Box maxW="5xl" w="100%">
          <Box
            bg="gray.800"
            p={6}
            borderRadius="xl"
            border="1px solid"
            borderColor="gray.700"
          >
            <HStack justify="space-between" mb={4}>
              <Text fontSize="xl" fontWeight="bold" color="yellow.400">
                📊 Article Game Data
              </Text>
              <Text fontSize="sm" color="gray.500">
                Category: {gameData?.category || 'general'}
                <Text as="span" color="green.400" ml={2}>
                  ✨ Auto-calculated difficulties
                </Text>
              </Text>
            </HStack>

            <Text color="gray.300" mb={4}>
              <Text as="span" color="green.400" fontWeight="semibold">
                {gameData?.title || 'Loading game data...'}
              </Text>
              {gameData?.description && (
                <Text color="gray.400" fontSize="sm" mt={1}>
                  {gameData.description}
                </Text>
              )}
            </Text>

            <Flex wrap="wrap" gap={4}>
              <Box bg="gray.900" p={3} borderRadius="md" flex="1" minW="200px">
                <Text color="indigo.400" fontWeight="bold">
                  Normal Quiz
                </Text>
                <Text color="gray.400">
                  {gameData?.normal_quiz?.questions?.length || 0} questions
                </Text>
                <Text
                  color={
                    gameData?.normal_quiz?.questions?.length >= 3
                      ? 'green.300'
                      : 'red.300'
                  }
                  fontSize="xs"
                >
                  {gameData?.normal_quiz?.questions?.length >= 3
                    ? '✓ Ready'
                    : '✗ Need 3+ questions'}
                </Text>
              </Box>

              <Box bg="gray.900" p={3} borderRadius="md" flex="1" minW="200px">
                <Text color="purple.400" fontWeight="bold">
                  True/False
                </Text>
                <Text color="gray.400">
                  {gameData?.true_false?.statements?.length || 0} statements
                </Text>
                <Text
                  color={
                    gameData?.true_false?.statements?.length >= 5
                      ? 'green.300'
                      : 'red.300'
                  }
                  fontSize="xs"
                >
                  {gameData?.true_false?.statements?.length >= 5
                    ? '✓ Ready'
                    : '✗ Need 5+ statements'}
                </Text>
              </Box>

              <Box bg="gray.900" p={3} borderRadius="md" flex="1" minW="200px">
                <Text color="emerald.400" fontWeight="bold">
                  Word Weaver
                </Text>
                <Text color="gray.400">
                  {gameData?.word_weaver?.questions?.length || 0} puzzles
                </Text>
                <Text
                  color={
                    gameData?.word_weaver?.questions?.length >= 3
                      ? 'green.300'
                      : 'red.300'
                  }
                  fontSize="xs"
                >
                  {gameData?.word_weaver?.questions?.length >= 3
                    ? '✓ Ready'
                    : '✗ Need 3+ puzzles'}
                </Text>
              </Box>

              <Box bg="gray.900" p={3} borderRadius="md" flex="1" minW="200px">
                <Text color="violet.400" fontWeight="bold">
                  Connections
                </Text>
                <Text color="gray.400">
                  {gameData?.connections?.concepts?.length || 0} concepts
                </Text>
                <Text
                  color={
                    gameData?.connections?.concepts?.length >= 4
                      ? 'green.300'
                      : 'red.300'
                  }
                  fontSize="xs"
                >
                  {gameData?.connections?.concepts?.length >= 4
                    ? '✓ Ready'
                    : '✗ Need 4+ concepts'}
                </Text>
              </Box>
            </Flex>
          </Box>
        </Box>
      </VStack>
    </Box>
  )
}

// Main Integrated Game Hub Component
const IntegratedGameHub = () => {
  const { articleId } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { user } = useSelector(state => state.auth)
  const { getSocket } = useSocket()

  // State management
  const [gameData, setGameData] = useState(null)
  const [completionData, setCompletionData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [articleData, setArticleData] = useState(null)
  const [selectedGameType, setSelectedGameType] = useState(null)
  const [showInstructions, setShowInstructions] = useState(false)

  // Socket setup for progress tracking
  useEffect(() => {
    const currentSocket = getSocket()
    if (currentSocket && user) {
      currentSocket.emit('join game progress', user._id)
      currentSocket.on('game_generation_progress', data => {
        console.log('Game generation progress:', data.progress)
        setGenerationProgress(data.progress || 0)
      })
    }

    return () => {
      if (currentSocket) {
        currentSocket.off('game_generation_progress')
      }
    }
  }, [getSocket, user])

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

      const response = await axios.get(
        `/api/gamehub/data/${articleId}/${i18n.language}`,
      )

      setGameData(response.data.gameData)
      setIsGenerating(false)
      setGenerationProgress(100)
    } catch (error) {
      console.error('Error fetching game data:', error)
      setIsGenerating(false)
      setGenerationProgress(0)

      toast({
        title: 'Error',
        description: 'Failed to load game data. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      })
    } finally {
      setLoading(false)
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
    navigate(`/gamehub/${articleId}/${selectedGameType}`)
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
      >
        <VStack spacing={4}>
          <Box fontSize="6xl">🧠</Box>
          <Text fontSize="xl">Loading Game Hub...</Text>
        </VStack>
      </Box>
    )
  }

  return (
    <>
      <Flex
        justify="space-between"
        align="center"
        p={6}
        bg="gray.900"
        borderBottom="1px solid"
        borderColor="gray.700"
        position="sticky"
        top={0}
        zIndex={10}
      >
        <Button
          leftIcon={<ChevronLeft />}
          onClick={handleBackToArticle}
          variant="ghost"
          color="gray.400"
          _hover={{ color: 'white', bg: 'gray.800' }}
        >
          Back to Article
        </Button>
        <Text fontSize="lg" fontWeight="bold" color="white">
          Game Hub
        </Text>
        <Box width="120px" />
      </Flex>

      {completionData ? (
        <GamesCompletedView
          completionData={completionData}
          gameData={gameData}
          onBackToArticle={handleBackToArticle}
        />
      ) : (
        <GameMenu
          onSelectGame={handleSelectGame}
          gameData={gameData}
          articleId={articleId}
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
