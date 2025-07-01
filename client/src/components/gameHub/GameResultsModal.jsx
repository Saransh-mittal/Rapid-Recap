// components/gameHub/GameResultsModal.jsx - Optimized Minimal Version
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
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Star, Clock, Target, Award, Zap, Rocket } from 'lucide-react'

const MotionBox = motion(Box)

// Enhanced Confetti Component (lighter version)
const Confetti = ({ active }) => {
  const [particles, setParticles] = useState([])

  useEffect(() => {
    if (active) {
      const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4']
      const shapes = ['●', '★', '♦']

      const newParticles = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        delay: Math.random() * 1000,
        duration: 3000 + Math.random() * 2000,
        size: 8 + Math.random() * 8,
      }))

      setParticles(newParticles)
      setTimeout(() => setParticles([]), 5000)
    }
  }, [active])

  return (
    <>
      {particles.map(particle => (
        <MotionBox
          key={particle.id}
          position="fixed"
          left={`${particle.left}%`}
          top="-20px"
          fontSize={`${particle.size}px`}
          color={particle.color}
          zIndex={9999}
          pointerEvents="none"
          initial={{ y: -20, opacity: 0 }}
          animate={{
            y: '110vh',
            x: Math.random() * 100 - 50,
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: particle.duration / 1000,
            delay: particle.delay / 1000,
            ease: 'easeOut',
          }}
        >
          {particle.shape}
        </MotionBox>
      ))}
    </>
  )
}

// Compact Score Card Component
const CompactScoreCard = ({ icon: Icon, label, value, color, delay = 0 }) => (
  <MotionBox
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay, duration: 0.3 }}
  >
    <Box
      bg="rgba(255, 255, 255, 0.05)"
      border="1px solid rgba(255, 255, 255, 0.1)"
      borderRadius="lg"
      p={3}
      textAlign="center"
      h="80px"
      display="flex"
      flexDir="column"
      justifyContent="center"
    >
      <VStack spacing={1}>
        <HStack spacing={2}>
          <Icon size={16} color={color} />
          <Text fontSize="lg" fontWeight="bold" color={color}>
            {value}
          </Text>
        </HStack>
        <Text fontSize="xs" color="gray.400">
          {label}
        </Text>
      </VStack>
    </Box>
  </MotionBox>
)

const GameResultsModal = ({
  isOpen,
  onClose,
  results,
  gameType,
  onBackToMenu,
}) => {
  const [showConfetti, setShowConfetti] = useState(false)
  const [displayScore, setDisplayScore] = useState(0)

  useEffect(() => {
    if (isOpen && results?.performance?.accuracy === 1) {
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 5000)
    }
  }, [isOpen, results])

  // Animated score counter
  useEffect(() => {
    if (isOpen && results?.RQM_score) {
      const targetScore = results.RQM_score
      const duration = 1500
      const steps = 30
      const increment = targetScore / steps

      let current = 0
      const timer = setInterval(() => {
        current += increment
        if (current >= targetScore) {
          setDisplayScore(targetScore)
          clearInterval(timer)
        } else {
          setDisplayScore(Math.floor(current))
        }
      }, duration / steps)

      return () => clearInterval(timer)
    }
  }, [isOpen, results])

  if (!results) return null

  const isPerfectScore = results.performance?.accuracy === 1
  const isExcellent = results.performance?.accuracy >= 0.8
  const scoreColor = isPerfectScore
    ? '#FFD700'
    : isExcellent
    ? '#10B981'
    : '#8B5CF6'

  const getGameTypeDisplayName = type => {
    const names = {
      normal_quiz: 'Quiz',
      true_false: 'T/F',
      word_weaver: 'Words',
      connections: 'Connect',
    }
    return names[type] || type
  }

  const getScoreDescription = score => {
    if (score >= 90) return 'Legendary!'
    if (score >= 80) return 'Outstanding!'
    if (score >= 70) return 'Excellent!'
    if (score >= 60) return 'Great job!'
    if (score >= 40) return 'Good effort!'
    return 'Keep practicing!'
  }

  const getScoreEmoji = score => {
    if (score >= 90) return '👑'
    if (score >= 80) return '🏆'
    if (score >= 70) return '🌟'
    if (score >= 60) return '🎯'
    if (score >= 40) return '💪'
    return '🚀'
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <Confetti active={showConfetti} />
          <Modal
            isOpen={isOpen}
            onClose={onClose}
            size={{ base: 'full', md: 'xl' }}
            closeOnOverlayClick={false}
            isCentered
          >
            <ModalOverlay bg="blackAlpha.900" backdropFilter="blur(10px)" />
            <MotionBox
              as={ModalContent}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              bg="gray.900"
              color="white"
              mx={4}
              borderRadius="2xl"
              border="1px solid rgba(255, 255, 255, 0.1)"
              maxH="90vh"
              overflow="hidden"
            >
              <ModalHeader textAlign="center" pb={2}>
                <MotionBox
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <VStack spacing={3}>
                    {/* Hero Icon */}
                    <Text fontSize="4xl">
                      {isPerfectScore ? '👑' : isExcellent ? '🏆' : '🎮'}
                    </Text>

                    {/* Title */}
                    <VStack spacing={1}>
                      <Text fontSize="xl" fontWeight="bold" color={scoreColor}>
                        {isPerfectScore
                          ? 'Perfect Score!'
                          : isExcellent
                          ? 'Excellent!'
                          : 'Complete!'}
                      </Text>
                      <Badge
                        bg="rgba(139, 92, 246, 0.2)"
                        color="purple.400"
                        px={2}
                        py={1}
                        borderRadius="full"
                      >
                        {getGameTypeDisplayName(gameType)}
                      </Badge>
                    </VStack>
                  </VStack>
                </MotionBox>
              </ModalHeader>

              <ModalCloseButton size="sm" borderRadius="full" />

              <ModalBody pb={6} overflow="auto">
                <VStack spacing={6}>
                  {/* Main Score Display */}
                  <MotionBox
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    textAlign="center"
                  >
                    <VStack spacing={2}>
                      <Text
                        fontSize="4xl"
                        fontWeight="bold"
                        color={scoreColor}
                        lineHeight="1"
                      >
                        {displayScore}
                      </Text>
                      <VStack spacing={1}>
                        <Text fontSize="sm" color="gray.400">
                          RQM Score
                        </Text>
                        <HStack spacing={2}>
                          <Text fontSize="lg">
                            {getScoreEmoji(results.RQM_score)}
                          </Text>
                          <Text
                            fontSize="sm"
                            color="gray.300"
                            fontWeight="bold"
                          >
                            {getScoreDescription(results.RQM_score)}
                          </Text>
                        </HStack>
                      </VStack>
                    </VStack>
                  </MotionBox>

                  {/* Score Breakdown Cards */}
                  <Grid templateColumns="repeat(2, 1fr)" gap={3} w="100%">
                    <CompactScoreCard
                      icon={Target}
                      label="Correct"
                      value={`${results.performance?.correctCount || 0}/${
                        results.performance?.totalItems || 0
                      }`}
                      color="#10B981"
                      delay={0.3}
                    />
                    <CompactScoreCard
                      icon={Clock}
                      label="Time"
                      value={`${results.timeTaken}s`}
                      color="#3B82F6"
                      delay={0.4}
                    />
                    <CompactScoreCard
                      icon={Zap}
                      label="Speed Bonus"
                      value={`${results.timeFactor}x`}
                      color="#F59E0B"
                      delay={0.5}
                    />
                    <CompactScoreCard
                      icon={Award}
                      label="Performance"
                      value={`${results.performanceBonus}x`}
                      color="#EF4444"
                      delay={0.6}
                    />
                  </Grid>

                  {/* Performance Analysis */}
                  <MotionBox
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.7 }}
                    w="100%"
                  >
                    <Box
                      bg="rgba(255, 255, 255, 0.05)"
                      border="1px solid rgba(255, 255, 255, 0.1)"
                      borderRadius="xl"
                      p={4}
                    >
                      <VStack spacing={3}>
                        <HStack justify="space-between" w="100%">
                          <Text fontSize="sm" fontWeight="bold">
                            Performance
                          </Text>
                          <Badge
                            bg={scoreColor}
                            color="white"
                            px={2}
                            py={1}
                            borderRadius="full"
                            fontSize="xs"
                          >
                            {Math.round(
                              (results.performance?.accuracy || 0) * 100,
                            )}
                            % Accuracy
                          </Badge>
                        </HStack>

                        <Box w="100%">
                          <Progress
                            value={(results.performance?.accuracy || 0) * 100}
                            size="sm"
                            borderRadius="full"
                            bg="rgba(255, 255, 255, 0.1)"
                            colorScheme={
                              scoreColor.includes('#10B981')
                                ? 'green'
                                : scoreColor.includes('#3B82F6')
                                ? 'blue'
                                : 'yellow'
                            }
                          />
                        </Box>

                        <Grid
                          templateColumns="repeat(3, 1fr)"
                          gap={3}
                          w="100%"
                          fontSize="xs"
                        >
                          <VStack spacing={1}>
                            <Text color="blue.400" fontWeight="bold">
                              Time Efficiency
                            </Text>
                            <Text color="white">{results.timeFactor}x</Text>
                          </VStack>
                          <VStack spacing={1}>
                            <Text color="purple.400" fontWeight="bold">
                              Difficulty
                            </Text>
                            <Text color="white">
                              {Math.round(
                                (results.performance?.difficulty || 0) * 100,
                              )}
                              %
                            </Text>
                          </VStack>
                          <VStack spacing={1}>
                            <Text color="green.400" fontWeight="bold">
                              Questions
                            </Text>
                            <Text color="white">
                              {results.performance?.totalItems || 0}
                            </Text>
                          </VStack>
                        </Grid>
                      </VStack>
                    </Box>
                  </MotionBox>

                  {/* Action Button */}
                  <MotionBox
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.8 }}
                    w="100%"
                  >
                    <Button
                      onClick={onBackToMenu}
                      size="md"
                      width="100%"
                      h="50px"
                      bg="linear-gradient(45deg, #667eea, #764ba2)"
                      color="white"
                      leftIcon={<Rocket size={18} />}
                      borderRadius="full"
                      fontSize="md"
                      fontWeight="bold"
                      _hover={{ opacity: 0.8 }}
                      transition="all 0.2s"
                    >
                      Return to Game Universe
                    </Button>
                  </MotionBox>

                  {/* Encouragement Message */}
                  <MotionBox
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.9 }}
                    textAlign="center"
                  >
                    <Box
                      bg="rgba(16, 185, 129, 0.1)"
                      border="1px solid rgba(16, 185, 129, 0.3)"
                      borderRadius="xl"
                      p={3}
                    >
                      <VStack spacing={2}>
                        <HStack spacing={2}>
                          <Star size={16} color="#10B981" />
                          <Text
                            fontSize="sm"
                            fontWeight="bold"
                            color="emerald.400"
                          >
                            {isPerfectScore
                              ? 'Perfect Master!'
                              : isExcellent
                              ? 'Knowledge Champion!'
                              : 'Learning Hero!'}
                          </Text>
                          <Star size={16} color="#10B981" />
                        </HStack>
                        <Text fontSize="xs" color="gray.300" lineHeight="1.4">
                          {isPerfectScore
                            ? "Flawless execution! You've achieved mastery!"
                            : isExcellent
                            ? 'Outstanding performance! Your dedication shows!'
                            : 'Great progress! Keep building your knowledge!'}
                        </Text>
                      </VStack>
                    </Box>
                  </MotionBox>
                </VStack>
              </ModalBody>
            </MotionBox>
          </Modal>
        </>
      )}
    </AnimatePresence>
  )
}

export default GameResultsModal
