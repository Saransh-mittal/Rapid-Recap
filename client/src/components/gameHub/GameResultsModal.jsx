// components/gameHub/GameResultsModal.jsx
import React, { useState, useEffect } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  HStack,
  Text,
  Button,
  Grid,
  Box,
  Progress,
  Badge,
  Flex,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Divider,
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Trophy,
  ArrowLeft,
  Star,
  Clock,
  Target,
  TrendingUp,
  Award,
  Zap,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

const MotionBox = motion(Box)

// Confetti effect for perfect scores
const Confetti = ({ active }) => {
  const [particles, setParticles] = useState([])

  useEffect(() => {
    if (active) {
      const colors = [
        '#FFD700',
        '#FF6B6B',
        '#4ECDC4',
        '#45B7D1',
        '#96CEB4',
        '#FFEAA7',
      ]
      const newParticles = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 1000,
        duration: 3000 + Math.random() * 2000,
      }))

      setParticles(newParticles)
      setTimeout(() => setParticles([]), 5000)
    }
  }, [active])

  return (
    <>
      {particles.map(particle => (
        <Box
          key={particle.id}
          position="fixed"
          left={`${particle.left}%`}
          top="-10px"
          width="10px"
          height="10px"
          bg={particle.color}
          borderRadius="50%"
          style={{
            animation: `fall 3s linear forwards`,
            animationDelay: `${particle.delay}ms`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </>
  )
}

const ScoreCard = ({ icon: Icon, label, value, color, delay = 0 }) => (
  <MotionBox
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
  >
    <Box
      bg="gray.700"
      p={4}
      borderRadius="xl"
      border="1px solid"
      borderColor="gray.600"
      textAlign="center"
      _hover={{ borderColor: color, transform: 'translateY(-2px)' }}
      transition="all 0.3s"
    >
      <VStack spacing={2}>
        <Icon size={24} color={color} />
        <Text fontSize="2xl" fontWeight="bold" color={color}>
          {value}
        </Text>
        <Text fontSize="sm" color="gray.400">
          {label}
        </Text>
      </VStack>
    </Box>
  </MotionBox>
)

const PerformanceBreakdown = ({ results, gameType }) => {
  const getPerformanceLevel = accuracy => {
    if (accuracy >= 0.9)
      return { level: 'Excellent', color: 'green.400', icon: Trophy }
    if (accuracy >= 0.7) return { level: 'Good', color: 'blue.400', icon: Star }
    if (accuracy >= 0.5)
      return { level: 'Average', color: 'yellow.400', icon: Target }
    return { level: 'Needs Work', color: 'red.400', icon: TrendingUp }
  }

  const performance = getPerformanceLevel(results.performance?.accuracy || 0)
  const Icon = performance.icon

  return (
    <Box
      bg="gray.800"
      p={4}
      borderRadius="lg"
      border="1px solid"
      borderColor="gray.700"
    >
      <HStack justify="space-between" mb={3}>
        <Text fontSize="lg" fontWeight="bold" color="white">
          Performance Analysis
        </Text>
        <Badge colorScheme={performance.color.split('.')[0]} variant="solid">
          <HStack spacing={1}>
            <Icon size={14} />
            <Text>{performance.level}</Text>
          </HStack>
        </Badge>
      </HStack>

      <VStack spacing={3} align="stretch">
        <Box>
          <HStack justify="space-between" mb={1}>
            <Text fontSize="sm" color="gray.400">
              Accuracy
            </Text>
            <Text fontSize="sm" color={performance.color}>
              {Math.round((results.performance?.accuracy || 0) * 100)}%
            </Text>
          </HStack>
          <Progress
            value={(results.performance?.accuracy || 0) * 100}
            colorScheme={performance.color.split('.')[0]}
            borderRadius="full"
          />
        </Box>

        <Box>
          <HStack justify="space-between" mb={1}>
            <Text fontSize="sm" color="gray.400">
              Difficulty
            </Text>
            <Text fontSize="sm" color="purple.400">
              {Math.round((results.performance?.difficulty || 0) * 100)}%
            </Text>
          </HStack>
          <Progress
            value={(results.performance?.difficulty || 0) * 100}
            colorScheme="purple"
            borderRadius="full"
          />
        </Box>

        <HStack justify="space-between">
          <Text fontSize="sm" color="gray.400">
            Time Efficiency
          </Text>
          <Text fontSize="sm" color="cyan.400">
            {results.timeFactor}x
          </Text>
        </HStack>
      </VStack>
    </Box>
  )
}

const GameResultsModal = ({
  isOpen,
  onClose,
  results,
  gameType,
  onBackToMenu, // Removed onPlayAgain prop
}) => {
  const { t } = useTranslation()
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    if (isOpen && results?.performance?.accuracy === 1) {
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 5000)
    }
  }, [isOpen, results])

  if (!results) return null

  const isPerfectScore = results.performance?.accuracy === 1
  const scoreColor = isPerfectScore ? '#FFD700' : '#A855F7'

  const getGameTypeDisplayName = type => {
    const names = {
      normal_quiz: 'Normal Quiz',
      true_false: 'True or False',
      word_weaver: 'Word Weaver',
      connections: 'Connections',
    }
    return names[type] || type
  }

  const getScoreDescription = score => {
    if (score >= 80) return 'Outstanding! 🏆'
    if (score >= 60) return 'Great job! 🌟'
    if (score >= 40) return 'Good effort! 👍'
    return 'Keep practicing! 💪'
  }

  return (
    <>
      <Confetti active={showConfetti} />
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="xl"
        closeOnOverlayClick={false}
      >
        <ModalOverlay bg="blackAlpha.800" />
        <ModalContent bg="gray.900" color="white" mx={4}>
          <ModalHeader textAlign="center" pb={2}>
            <VStack spacing={3}>
              <MotionBox
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', duration: 0.8 }}
              >
                {isPerfectScore ? (
                  <Text fontSize="4xl">🏆</Text>
                ) : (
                  <Text fontSize="4xl">🎮</Text>
                )}
              </MotionBox>

              <VStack spacing={1}>
                <Text fontSize="2xl" fontWeight="bold">
                  {isPerfectScore ? 'Perfect Score!' : 'Game Complete!'}
                </Text>
                <Badge colorScheme="purple" fontSize="sm" px={3} py={1}>
                  {getGameTypeDisplayName(gameType)}
                </Badge>
              </VStack>
            </VStack>
          </ModalHeader>

          <ModalCloseButton />

          <ModalBody pb={6}>
            <VStack spacing={6}>
              {/* Main Score Display */}
              <MotionBox
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                textAlign="center"
              >
                <Text
                  fontSize="6xl"
                  fontWeight="bold"
                  color={scoreColor}
                  lineHeight="1"
                >
                  {results.RQM_score}
                </Text>
                <Text fontSize="xl" color="gray.400" mb={2}>
                  RQM Score
                </Text>
                <Text fontSize="md" color="gray.300">
                  {getScoreDescription(results.RQM_score)}
                </Text>
              </MotionBox>

              {/* Score Breakdown */}
              <Grid templateColumns="repeat(2, 1fr)" gap={4} w="100%">
                <ScoreCard
                  icon={Target}
                  label="Correct"
                  value={`${results.performance?.correctCount || 0}/${
                    results.performance?.totalItems || 0
                  }`}
                  color="#10B981"
                  delay={0.3}
                />
                <ScoreCard
                  icon={Clock}
                  label="Time"
                  value={`${results.timeTaken}s`}
                  color="#3B82F6"
                  delay={0.4}
                />
                <ScoreCard
                  icon={Zap}
                  label="Time Factor"
                  value={`${results.timeFactor}x`}
                  color="#F59E0B"
                  delay={0.5}
                />
                <ScoreCard
                  icon={Award}
                  label="Bonus"
                  value={`${results.performanceBonus}x`}
                  color="#EF4444"
                  delay={0.6}
                />
              </Grid>

              {/* Performance Analysis */}
              <MotionBox
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.5 }}
                w="100%"
              >
                <PerformanceBreakdown results={results} gameType={gameType} />
              </MotionBox>

              {/* Additional Stats */}
              <MotionBox
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                w="100%"
              >
                <Accordion allowToggle>
                  <AccordionItem
                    border="1px solid"
                    borderColor="gray.700"
                    borderRadius="lg"
                  >
                    <AccordionButton>
                      <Box flex="1" textAlign="left">
                        <Text fontWeight="semibold">Detailed Statistics</Text>
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel pb={4}>
                      <VStack spacing={3} align="stretch">
                        <HStack justify="space-between">
                          <Text color="gray.400">Base RQM Score:</Text>
                          <Text color="white">
                            {results.baseRQM_score || results.RQM_score}
                          </Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text color="gray.400">Difficulty Bonus:</Text>
                          <Text color="purple.400">
                            {Math.round(
                              (results.performance?.difficulty || 0) * 100,
                            )}
                            %
                          </Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text color="gray.400">Time Bonus:</Text>
                          <Text color="cyan.400">{results.timeFactor}x</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text color="gray.400">Performance Bonus:</Text>
                          <Text color="green.400">
                            {results.performanceBonus}x
                          </Text>
                        </HStack>
                        {results.boost && results.boost > 1 && (
                          <HStack justify="space-between">
                            <Text color="gray.400">Power-up Bonus:</Text>
                            <Text color="yellow.400">{results.boost}x</Text>
                          </HStack>
                        )}
                      </VStack>
                    </AccordionPanel>
                  </AccordionItem>
                </Accordion>
              </MotionBox>

              <Divider borderColor="gray.700" />

              {/* Action Button - Only Back to Menu */}
              <MotionBox
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.5 }}
                w="100%"
              >
                <Button
                  onClick={onBackToMenu}
                  colorScheme="purple"
                  leftIcon={<ArrowLeft />}
                  size="lg"
                  width="100%"
                  _hover={{
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(139, 92, 246, 0.4)',
                  }}
                >
                  Back to Game Hub
                </Button>
              </MotionBox>

              {/* Encouragement Message */}
              <MotionBox
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.0, duration: 0.5 }}
                textAlign="center"
              >
                <Text fontSize="sm" color="gray.500" fontStyle="italic">
                  {isPerfectScore
                    ? "🌟 Amazing! You've mastered this content!"
                    : '🚀 Great job! Your performance helps improve your RQM score!'}
                </Text>
              </MotionBox>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}

export default GameResultsModal
