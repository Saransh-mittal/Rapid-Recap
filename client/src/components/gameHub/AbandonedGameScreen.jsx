// components/gameHub/AbandonedGameScreen.jsx - Display abandoned game information
import React from 'react'
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Container,
  Badge,
  Divider,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { ChevronLeft, RotateCcw, FileText, Home } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const MotionBox = motion(Box)

const gameTypeNames = {
  normal_quiz: 'Knowledge Quest',
  true_false: 'Truth Detector',
  word_weaver: 'Word Architect',
  connections: 'Mind Mapper',
}

const gameTypeEmojis = {
  normal_quiz: '🧠',
  true_false: '⚡',
  word_weaver: '🔤',
  connections: '🔗',
}

const AbandonedGameScreen = ({
  abandonmentInfo,
  articleId,
  onRetryGame,
  showRetry = true,
  isSubmitting = false,
}) => {
  const navigate = useNavigate()
  const { t } = useTranslation('GameHub')

  const handleBackToHub = () => {
    navigate(-1)
  }

  const handleBackToArticle = () => {
    navigate(-1)
  }

  const handleViewReport = () => {
    navigate(`/gamehub/${articleId}/report`)
  }

  const getStatusColor = reason => {
    const colorMap = {
      session_expired: 'orange',
      page_refresh: 'blue',
      navigation_away: 'purple',
      connection_lost: 'red',
      unknown: 'gray',
    }
    return colorMap[reason] || 'gray'
  }

  const formatTime = dateString => {
    if (!dateString) return 'Unknown'

    try {
      const date = new Date(dateString)
      return date.toLocaleString()
    } catch (error) {
      return 'Unknown'
    }
  }

  return (
    <Box minH="100vh" bg="gray.900" color="white" position="relative">
      {/* Background Effects */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        opacity={0.1}
        bgGradient="radial(circle at 50% 50%, red.500, transparent 70%)"
      />

      {/* Header */}
      <Box
        bg="rgba(0, 0, 0, 0.8)"
        backdropFilter="blur(10px)"
        borderBottom="1px solid rgba(255, 255, 255, 0.1)"
        position="sticky"
        top={0}
        zIndex={100}
      >
        <Container maxW="4xl">
          <HStack justify="space-between" align="center" py={4}>
            <Button
              leftIcon={<ChevronLeft size={18} />}
              onClick={handleBackToHub}
              variant="ghost"
              color="gray.300"
              size="md"
              _hover={{ color: 'white', bg: 'rgba(255, 255, 255, 0.1)' }}
            >
              {t('navigation.backToHub')}
            </Button>

            <HStack spacing={2} w={'100%'} ml={4}>
              <Text fontSize="2xl">{abandonmentInfo?.icon || '❌'}</Text>
              <Text fontSize="lg" fontWeight="bold" color="red.400">
                Game Abandoned
              </Text>
            </HStack>

            <Box width="120px" />
          </HStack>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxW="4xl" py={8} position="relative" zIndex={1}>
        <VStack spacing={8}>
          {/* Abandonment Alert */}
          <MotionBox
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            w="100%"
            maxW="600px"
          >
            <Alert
              status="error"
              borderRadius="xl"
              bg="rgba(220, 38, 38, 0.1)"
              border="1px solid"
              borderColor="red.500"
              color="white"
              p={6}
            >
              <AlertIcon color="red.400" boxSize={6} />
              <Box flex="1">
                <AlertTitle fontSize="lg" mb={2}>
                  {abandonmentInfo?.title || 'Game Interrupted'}
                </AlertTitle>
                <AlertDescription fontSize="md" lineHeight="1.6">
                  {abandonmentInfo?.description ||
                    'Your game session was interrupted and has been automatically submitted with a score of 0.'}
                </AlertDescription>
              </Box>
            </Alert>
          </MotionBox>

          {/* Game Details Card */}
          <MotionBox
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            w="100%"
            maxW="500px"
          >
            <Box
              bg="rgba(255, 255, 255, 0.05)"
              backdropFilter="blur(20px)"
              border="1px solid rgba(255, 255, 255, 0.1)"
              borderRadius="2xl"
              p={6}
            >
              <VStack spacing={4}>
                {/* Game Type Header */}
                <HStack spacing={3} w="100%">
                  <Text fontSize="3xl">
                    {gameTypeEmojis[abandonmentInfo?.gameType] || '🎮'}
                  </Text>
                  <VStack align="start" flex={1} spacing={0}>
                    <Text fontSize="xl" fontWeight="bold">
                      {gameTypeNames[abandonmentInfo?.gameType] || 'Game'}
                    </Text>
                    <Badge
                      colorScheme={getStatusColor(abandonmentInfo?.reason)}
                      fontSize="xs"
                      fontWeight="bold"
                      px={2}
                      py={1}
                      borderRadius="full"
                    >
                      Abandoned
                    </Badge>
                  </VStack>
                </HStack>

                <Divider borderColor="rgba(255, 255, 255, 0.2)" />

                {/* Details */}
                <VStack spacing={3} w="100%" align="start">
                  <HStack justify="space-between" w="100%">
                    <Text fontSize="sm" color="gray.400">
                      Final Score:
                    </Text>
                    <Text fontSize="sm" fontWeight="bold" color="red.400">
                      0 RQM
                    </Text>
                  </HStack>

                  <HStack justify="space-between" w="100%">
                    <Text fontSize="sm" color="gray.400">
                      Time Taken:
                    </Text>
                    <Text fontSize="sm" color="gray.300">
                      0 seconds
                    </Text>
                  </HStack>

                  <HStack justify="space-between" w="100%">
                    <Text fontSize="sm" color="gray.400">
                      Abandoned At:
                    </Text>
                    <Text fontSize="sm" color="gray.300">
                      {formatTime(abandonmentInfo?.abandonedAt)}
                    </Text>
                  </HStack>

                  {abandonmentInfo?.reason && (
                    <HStack justify="space-between" w="100%">
                      <Text fontSize="sm" color="gray.400">
                        Reason:
                      </Text>
                      <Badge
                        colorScheme={getStatusColor(abandonmentInfo.reason)}
                        fontSize="2xs"
                        px={2}
                        py={0.5}
                        borderRadius="md"
                      >
                        {abandonmentInfo.reason
                          .replace(/_/g, ' ')
                          .toUpperCase()}
                      </Badge>
                    </HStack>
                  )}
                </VStack>
              </VStack>
            </Box>
          </MotionBox>

          {/* Info Box */}
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            w="100%"
            maxW="600px"
          >
            <Box
              bg="rgba(59, 130, 246, 0.1)"
              border="1px solid rgba(59, 130, 246, 0.3)"
              borderRadius="xl"
              p={4}
            >
              <VStack spacing={2} align="start">
                <Text fontSize="sm" fontWeight="bold" color="blue.400">
                  💡 What happened?
                </Text>
                <Text fontSize="sm" color="gray.300" lineHeight="1.6">
                  Your game session was automatically submitted to ensure your
                  progress is recorded. While you received 0 points this time,
                  you can start a new game anytime to try again!
                </Text>
              </VStack>
            </Box>
          </MotionBox>

          {/* Action Buttons */}
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            w="100%"
            maxW="400px"
          >
            <VStack spacing={3}>
              {/* View Report Button */}
              <Button
                leftIcon={<FileText size={18} />}
                onClick={handleViewReport}
                size="lg"
                width="100%"
                height="50px"
                bg="rgba(139, 92, 246, 0.1)"
                border="1px solid rgba(139, 92, 246, 0.3)"
                color="purple.300"
                borderRadius="full"
                fontSize="md"
                fontWeight="medium"
                _hover={{
                  bg: 'rgba(139, 92, 246, 0.2)',
                  borderColor: 'rgba(139, 92, 246, 0.5)',
                  transform: 'translateY(-2px)',
                }}
                _active={{
                  transform: 'translateY(0px)',
                }}
                transition="all 0.2s"
              >
                View Game Report
              </Button>

              {/* Back to Article Button */}
              <Button
                leftIcon={<Home size={18} />}
                onClick={handleBackToArticle}
                variant="ghost"
                size="md"
                color="gray.400"
                _hover={{
                  color: 'gray.200',
                  bg: 'rgba(255, 255, 255, 0.05)',
                }}
                transition="all 0.2s"
              >
                Back to Article
              </Button>
            </VStack>
          </MotionBox>
        </VStack>
      </Container>
    </Box>
  )
}

export default AbandonedGameScreen
