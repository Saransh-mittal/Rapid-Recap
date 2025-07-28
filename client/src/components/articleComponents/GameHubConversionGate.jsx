// GameHub Conversion Gate - Final funnel step to convert engaged users
// Location: client/src/components/articleComponents/GameHubConversionGate.jsx

import React, { useState, useEffect } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  HStack,
  Text,
  Box,
  Badge,
  Flex,
  Grid,
  Icon,
  Avatar,
  Progress,
  Divider,
  useMediaQuery,
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Trophy,
  Users,
  TrendingUp,
  Zap,
  Target,
  Crown,
  Gamepad2,
  Star,
  Clock,
  Award,
  ChevronRight,
} from 'lucide-react'
import { useDispatch } from 'react-redux'
import { setIsSigninOpen } from '../../redux/appSlice'
import { useTranslation } from 'react-i18next'

const MotionBox = motion(Box)
const MotionButton = motion(Button)

// Mock data for demonstration - replace with real data
const mockLeaderboard = [
  { name: 'Arjun K.', score: 2847, trend: '+15', avatar: '🎯' },
  { name: 'Priya S.', score: 2634, trend: '+8', avatar: '🏆' },
  { name: 'Rahul M.', score: 2521, trend: '+23', avatar: '⚡' },
  { name: 'Sneha T.', score: 2415, trend: '+12', avatar: '🌟' },
]

const mockTournaments = [
  {
    name: 'Current Affairs Challenge',
    participants: '2,847',
    timeLeft: '4h 23m',
    prize: '₹5,000',
    category: 'Politics',
  },
  {
    name: 'Sports Knowledge Cup',
    participants: '1,923',
    timeLeft: '1d 12h',
    prize: '₹3,000',
    category: 'Sports',
  },
]

const achievements = [
  { icon: Crown, title: 'Current Affairs Master', rarity: 'Rare' },
  { icon: Zap, title: 'Speed Reader', rarity: 'Epic' },
  { icon: Target, title: 'Perfect Score', rarity: 'Legendary' },
  { icon: Star, title: 'Streak Champion', rarity: 'Rare' },
]

const GameHubConversionGate = ({
  isOpen,
  onClose,
  articleCategory,
  userQuizScore,
  totalQuestions,
}) => {
  const { t } = useTranslation('GameHub')
  const dispatch = useDispatch()
  const [isMobile] = useMediaQuery('(max-width: 480px)')
  const [currentView, setCurrentView] = useState('main')
  const [animationKey, setAnimationKey] = useState(0)

  // Calculate user's potential ranking based on quiz score
  const scorePercentage = userQuizScore
    ? (userQuizScore / totalQuestions) * 100
    : 85
  const estimatedRank = Math.floor((100 - scorePercentage) * 50) + 150

  useEffect(() => {
    if (isOpen) {
      setAnimationKey(prev => prev + 1)
    }
  }, [isOpen])

  const handleSignIn = () => {
    onClose()
    dispatch(setIsSigninOpen(true))
  }

  const handleClose = () => {
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size={{ base: 'full', md: '6xl' }}
      motionPreset="slideInBottom"
    >
      <ModalOverlay bg="blackAlpha.800" backdropFilter="blur(10px)" />
      <ModalContent
        bg="linear-gradient(135deg, #1a1035 0%, #0f0a1f 50%, #1e1642 100%)"
        borderRadius={{ base: 'none', md: '2xl' }}
        border="1px solid"
        borderColor="purple.500"
        boxShadow="0 0 40px rgba(138, 43, 226, 0.3)"
        maxH="95vh"
        overflow="hidden"
      >
        {/* Animated Header Background */}
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          h="6px"
          bgGradient="linear(to-r, purple.500, pink.500, orange.500, purple.500)"
          backgroundSize="300% 100%"
          animation="rainbow 3s ease-in-out infinite"
          sx={{
            '@keyframes rainbow': {
              '0%, 100%': { backgroundPosition: '0% 50%' },
              '50%': { backgroundPosition: '100% 50%' },
            },
          }}
        />

        <ModalHeader pt={8} pb={4} textAlign="center">
          <VStack spacing={3}>
            <MotionBox
              key={`header-${animationKey}`}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, type: 'spring', stiffness: 100 }}
            >
              <Box
                p={4}
                bg="linear-gradient(135deg, purple.600, pink.600)"
                borderRadius="full"
                boxShadow="0 0 30px rgba(138, 43, 226, 0.5)"
              >
                <Icon as={Gamepad2} boxSize={10} color="white" />
              </Box>
            </MotionBox>

            <VStack spacing={1}>
              <Text
                fontSize={{ base: '2xl', md: '4xl' }}
                fontWeight="bold"
                bgGradient="linear(to-r, purple.400, pink.400, orange.400)"
                bgClip="text"
                textAlign="center"
              >
                Ready to Compete?
              </Text>
              <Text fontSize="lg" color="whiteAlpha.700" fontWeight="500">
                Join 50,000+ players in India's smartest quiz community
              </Text>
            </VStack>
          </VStack>
        </ModalHeader>

        <ModalCloseButton
          color="white"
          size="lg"
          bg="whiteAlpha.100"
          borderRadius="full"
          _hover={{ bg: 'whiteAlpha.200' }}
        />

        <ModalBody pb={8} px={{ base: 4, md: 8 }}>
          <VStack spacing={8} w="100%">
            {/* User's Achievement Teaser */}
            {userQuizScore && (
              <MotionBox
                key={`score-${animationKey}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                w="100%"
              >
                <Box
                  bg="rgba(34, 197, 94, 0.1)"
                  border="2px solid"
                  borderColor="green.500"
                  borderRadius="xl"
                  p={6}
                  textAlign="center"
                >
                  <VStack spacing={3}>
                    <Icon as={Trophy} boxSize={8} color="green.400" />
                    <Text fontSize="xl" fontWeight="bold" color="green.400">
                      Your Article Score: {userQuizScore}/{totalQuestions}
                    </Text>
                    <Text color="whiteAlpha.700">
                      You'd rank approximately #{estimatedRank} on today's{' '}
                      {articleCategory} leaderboard!
                    </Text>
                    <Badge
                      colorScheme="green"
                      variant="solid"
                      fontSize="sm"
                      px={3}
                      py={1}
                      borderRadius="full"
                    >
                      Better than {Math.floor(scorePercentage)}% of players
                    </Badge>
                  </VStack>
                </Box>
              </MotionBox>
            )}

            <Grid
              templateColumns={{ base: '1fr', lg: '1fr 1fr' }}
              gap={8}
              w="100%"
            >
              {/* Live Leaderboard */}
              <MotionBox
                key={`leaderboard-${animationKey}`}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Box
                  bg="rgba(255, 255, 255, 0.05)"
                  borderRadius="xl"
                  border="1px solid"
                  borderColor="whiteAlpha.200"
                  p={6}
                  h="100%"
                >
                  <VStack spacing={4} align="stretch">
                    <HStack spacing={2}>
                      <Icon as={TrendingUp} color="purple.400" boxSize={5} />
                      <Text fontSize="lg" fontWeight="bold" color="white">
                        Live Rankings
                      </Text>
                      <Box
                        w={2}
                        h={2}
                        bg="green.400"
                        borderRadius="full"
                        animation="pulse 2s infinite"
                      />
                    </HStack>

                    <VStack spacing={3} align="stretch">
                      {mockLeaderboard.map((player, index) => (
                        <MotionBox
                          key={player.name}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + index * 0.1 }}
                        >
                          <Flex
                            justify="space-between"
                            align="center"
                            p={3}
                            bg={
                              index === 0
                                ? 'rgba(255, 215, 0, 0.1)'
                                : 'whiteAlpha.50'
                            }
                            borderRadius="lg"
                            border={index === 0 ? '1px solid' : 'none'}
                            borderColor={
                              index === 0 ? 'yellow.500' : 'transparent'
                            }
                          >
                            <HStack spacing={3}>
                              <Text
                                fontSize="lg"
                                fontWeight="bold"
                                color={
                                  index === 0 ? 'yellow.400' : 'purple.400'
                                }
                              >
                                #{index + 1}
                              </Text>
                              <Text fontSize="xl">{player.avatar}</Text>
                              <Text color="white" fontWeight="500">
                                {player.name}
                              </Text>
                            </HStack>
                            <VStack spacing={0} align="end">
                              <Text color="white" fontWeight="bold">
                                {player.score}
                              </Text>
                              <Text
                                fontSize="xs"
                                color="green.400"
                                fontWeight="600"
                              >
                                {player.trend}
                              </Text>
                            </VStack>
                          </Flex>
                        </MotionBox>
                      ))}
                    </VStack>

                    <Box textAlign="center" pt={2}>
                      <Text fontSize="sm" color="whiteAlpha.600">
                        Where will you rank?
                      </Text>
                    </Box>
                  </VStack>
                </Box>
              </MotionBox>

              {/* Active Tournaments & Features */}
              <MotionBox
                key={`tournaments-${animationKey}`}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <VStack spacing={6} h="100%">
                  {/* Active Tournaments */}
                  <Box
                    bg="rgba(255, 255, 255, 0.05)"
                    borderRadius="xl"
                    border="1px solid"
                    borderColor="whiteAlpha.200"
                    p={6}
                    w="100%"
                  >
                    <VStack spacing={4} align="stretch">
                      <HStack spacing={2}>
                        <Icon as={Users} color="orange.400" boxSize={5} />
                        <Text fontSize="lg" fontWeight="bold" color="white">
                          Live Tournaments
                        </Text>
                      </HStack>

                      {mockTournaments.map((tournament, index) => (
                        <MotionBox
                          key={tournament.name}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.6 + index * 0.1 }}
                        >
                          <Box
                            p={4}
                            bg="rgba(255, 165, 0, 0.1)"
                            borderRadius="lg"
                            border="1px solid"
                            borderColor="orange.500"
                          >
                            <VStack spacing={2} align="stretch">
                              <Flex justify="space-between" align="center">
                                <Text
                                  color="white"
                                  fontWeight="600"
                                  fontSize="sm"
                                >
                                  {tournament.name}
                                </Text>
                                <Badge
                                  colorScheme="orange"
                                  variant="solid"
                                  fontSize="xs"
                                >
                                  {tournament.category}
                                </Badge>
                              </Flex>
                              <HStack justify="space-between">
                                <HStack spacing={1}>
                                  <Icon
                                    as={Users}
                                    boxSize={3}
                                    color="orange.400"
                                  />
                                  <Text fontSize="xs" color="whiteAlpha.700">
                                    {tournament.participants}
                                  </Text>
                                </HStack>
                                <HStack spacing={1}>
                                  <Icon
                                    as={Clock}
                                    boxSize={3}
                                    color="orange.400"
                                  />
                                  <Text fontSize="xs" color="whiteAlpha.700">
                                    {tournament.timeLeft}
                                  </Text>
                                </HStack>
                                <Text
                                  fontSize="xs"
                                  color="green.400"
                                  fontWeight="bold"
                                >
                                  {tournament.prize}
                                </Text>
                              </HStack>
                            </VStack>
                          </Box>
                        </MotionBox>
                      ))}
                    </VStack>
                  </Box>

                  {/* Achievement Preview */}
                  <Box
                    bg="rgba(255, 255, 255, 0.05)"
                    borderRadius="xl"
                    border="1px solid"
                    borderColor="whiteAlpha.200"
                    p={6}
                    w="100%"
                  >
                    <VStack spacing={4}>
                      <HStack spacing={2}>
                        <Icon as={Award} color="pink.400" boxSize={5} />
                        <Text fontSize="lg" fontWeight="bold" color="white">
                          Unlock Achievements
                        </Text>
                      </HStack>

                      <Grid templateColumns="1fr 1fr" gap={3} w="100%">
                        {achievements.map((achievement, index) => (
                          <MotionBox
                            key={achievement.title}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.7 + index * 0.1 }}
                          >
                            <VStack
                              spacing={2}
                              p={3}
                              bg="whiteAlpha.50"
                              borderRadius="lg"
                              border="1px solid"
                              borderColor="whiteAlpha.200"
                              opacity={0.7}
                              filter="grayscale(1)"
                            >
                              <Icon
                                as={achievement.icon}
                                boxSize={6}
                                color="whiteAlpha.600"
                              />
                              <Text
                                fontSize="xs"
                                color="whiteAlpha.600"
                                textAlign="center"
                                fontWeight="500"
                              >
                                {achievement.title}
                              </Text>
                              <Badge
                                size="sm"
                                colorScheme="gray"
                                variant="outline"
                                fontSize="2xs"
                              >
                                {achievement.rarity}
                              </Badge>
                            </VStack>
                          </MotionBox>
                        ))}
                      </Grid>
                    </VStack>
                  </Box>
                </VStack>
              </MotionBox>
            </Grid>

            {/* Main CTA Section */}
            <MotionBox
              key={`cta-${animationKey}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              w="100%"
            >
              <Box
                bg="linear-gradient(135deg, rgba(138, 43, 226, 0.2), rgba(219, 39, 119, 0.2))"
                border="2px solid"
                borderColor="purple.500"
                borderRadius="2xl"
                p={8}
                textAlign="center"
                position="relative"
                overflow="hidden"
              >
                {/* Animated background effect */}
                <Box
                  position="absolute"
                  top="0"
                  left="-100%"
                  width="100%"
                  height="100%"
                  bg="linear-gradient(45deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%)"
                  animation="shimmer 3s ease-in-out infinite"
                  sx={{
                    '@keyframes shimmer': {
                      '0%': { left: '-100%' },
                      '100%': { left: '100%' },
                    },
                  }}
                />

                <VStack spacing={6} position="relative" zIndex={1}>
                  <VStack spacing={2}>
                    <Text
                      fontSize={{ base: 'xl', md: '2xl' }}
                      fontWeight="bold"
                      color="white"
                    >
                      Join the Elite Quiz Community
                    </Text>
                    <Text color="whiteAlpha.700" fontSize="md" maxW="600px">
                      Compete with thousands of players, track your IQ growth,
                      earn achievements, and win real prizes. Your knowledge
                      journey starts here.
                    </Text>
                  </VStack>

                  <HStack
                    spacing={4}
                    flexWrap="wrap"
                    justify="center"
                    fontSize="sm"
                    color="whiteAlpha.800"
                  >
                    <HStack spacing={1}>
                      <Icon as={Trophy} boxSize={4} color="yellow.400" />
                      <Text>Win Prizes</Text>
                    </HStack>
                    <HStack spacing={1}>
                      <Icon as={TrendingUp} boxSize={4} color="green.400" />
                      <Text>Track IQ</Text>
                    </HStack>
                    <HStack spacing={1}>
                      <Icon as={Users} boxSize={4} color="blue.400" />
                      <Text>50K+ Players</Text>
                    </HStack>
                    <HStack spacing={1}>
                      <Icon as={Zap} boxSize={4} color="purple.400" />
                      <Text>Daily Challenges</Text>
                    </HStack>
                  </HStack>

                  <VStack spacing={3} w="100%">
                    <MotionButton
                      onClick={handleSignIn}
                      size="lg"
                      fontSize="lg"
                      fontWeight="bold"
                      w={{ base: '100%', md: 'auto' }}
                      minW="300px"
                      h="60px"
                      rightIcon={<ChevronRight />}
                      bgGradient="linear(to-r, purple.600, pink.600)"
                      color="white"
                      border="2px solid transparent"
                      borderRadius="xl"
                      whileHover={{
                        scale: 1.05,
                        boxShadow: '0 0 30px rgba(138, 43, 226, 0.6)',
                      }}
                      whileTap={{ scale: 0.95 }}
                      _hover={{
                        bgGradient: 'linear(to-r, purple.700, pink.700)',
                        transform: 'translateY(-2px)',
                      }}
                      _active={{
                        bgGradient: 'linear(to-r, purple.800, pink.800)',
                      }}
                      transition="all 0.2s ease"
                      boxShadow="0 8px 25px rgba(138, 43, 226, 0.4)"
                    >
                      Start Competing Now
                    </MotionButton>

                    <Text fontSize="xs" color="whiteAlpha.500">
                      🔒 Secure signup • 📱 Works on all devices • ⚡ Instant
                      access
                    </Text>
                  </VStack>
                </VStack>
              </Box>
            </MotionBox>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default GameHubConversionGate
