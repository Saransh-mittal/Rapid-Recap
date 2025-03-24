// components/quickClashComponents/MatchmakingButton.jsx
import React, {
  useEffect,
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from 'react'
import {
  Button,
  Spinner,
  HStack,
  Text,
  useToast,
  Icon,
  Badge,
  Tooltip,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  VStack,
  Box,
  Flex,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Users, Activity, X, Clock, Shield, Zap } from 'lucide-react'
import useQuickClashMatchmaking from '../../customHooks/useQuickClashMatchmaking'
import { useNavigate } from 'react-router-dom'
import { keyframes } from '@emotion/react'

const MotionButton = motion(Button)
const MotionFlex = motion(Flex)
const MotionBadge = motion(Badge)

// Activity animation for when matchmaking is active
const pulsing = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(92, 219, 149, 0.7); }
  70% { box-shadow: 0 0 0 10px rgba(92, 219, 149, 0); }
  100% { box-shadow: 0 0 0 0 rgba(92, 219, 149, 0); }
`

const MatchmakingButton = forwardRef(({ compact = false }, ref) => {
  const { t } = useTranslation('QuickClash')
  const toast = useToast()
  const navigate = useNavigate()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [matchmakingTime, setMatchmakingTime] = useState(0)

  // Get matchmaking state and functions from our custom hook
  const {
    inMatchmaking,
    matchmakingLoading,
    matchmakingError,
    challengeCreationData,
    challengeReady,

    joinMatchmaking,
    leaveMatchmaking,
    checkMatchmakingStatus,
  } = useQuickClashMatchmaking()

  // Expose handleJoinMatchmaking method to parent components
  useImperativeHandle(ref, () => ({
    handleJoinMatchmaking,
  }))

  // Check status on mount
  useEffect(() => {
    checkMatchmakingStatus()
  }, [checkMatchmakingStatus])

  // Display error toast if matchmaking has an error
  useEffect(() => {
    if (matchmakingError) {
      toast({
        title: t('Error'),
        description: matchmakingError,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }, [matchmakingError, toast, t])

  // Timer for matchmaking
  useEffect(() => {
    let interval
    if (inMatchmaking) {
      interval = setInterval(() => {
        setMatchmakingTime(prev => prev + 1)
      }, 1000)
    } else {
      setMatchmakingTime(0)
    }

    return () => clearInterval(interval)
  }, [inMatchmaking])

  // Handle the ready challenge - navigate to the session
  useEffect(() => {
    if (challengeReady) {
      toast({
        title: t('Match Found!'),
        description: t('Your match is ready, redirecting...'),
        status: 'success',
        duration: 3000,
        isClosable: true,
      })

      // Navigate to the challenge after a short delay
      const timer = setTimeout(() => {
        navigate(`/quickclash/session/${challengeReady.challengeId}`)
      }, 1500)

      return () => clearTimeout(timer)
    }
  }, [challengeReady, navigate, toast, t])

  // Handle join matchmaking
  const handleJoinMatchmaking = useCallback(() => {
    // For now we'll use default categories - this would be customized in a real implementation
    const defaultCategories = ['World', 'Technology']

    joinMatchmaking({ categories: defaultCategories })
      .then(() => {
        setIsModalOpen(true)
        toast({
          title: t('Joined Matchmaking'),
          description: t('Looking for opponents...'),
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
      })
      .catch(error => {
        console.error('Failed to join matchmaking:', error)
      })
  }, [joinMatchmaking, toast, t])

  // Handle leave matchmaking
  const handleLeaveMatchmaking = useCallback(() => {
    leaveMatchmaking()
      .then(() => {
        setIsModalOpen(false)
        toast({
          title: t('Left Matchmaking'),
          description: t('You have left the matchmaking queue'),
          status: 'info',
          duration: 3000,
          isClosable: true,
        })
      })
      .catch(error => {
        console.error('Failed to leave matchmaking:', error)
      })
  }, [leaveMatchmaking, toast, t])

  // Format time display
  const formatTime = seconds => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Close modal without leaving matchmaking
  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  // The waiting modal
  const renderWaitingModal = () => (
    <Modal
      isOpen={isModalOpen && inMatchmaking}
      onClose={handleCloseModal}
      isCentered
      size="md"
    >
      <ModalOverlay bg="rgba(0, 0, 0, 0.8)" backdropFilter="blur(10px)" />
      <ModalContent
        bg="rgba(26, 21, 39, 0.95)"
        borderWidth="1px"
        borderColor="green.400"
        borderRadius="xl"
        boxShadow="0 0 20px rgba(72, 187, 120, 0.4)"
      >
        <ModalHeader color="white" display="flex" alignItems="center" gap={2}>
          <Icon as={Users} color="green.400" />
          {t('Finding Opponents')}
        </ModalHeader>
        <ModalCloseButton color="white" />

        <ModalBody py={6}>
          <VStack spacing={6} align="center">
            <MotionFlex
              justify="center"
              align="center"
              w="100px"
              h="100px"
              borderRadius="full"
              bg="rgba(72, 187, 120, 0.1)"
              border="2px solid"
              borderColor="green.400"
              position="relative"
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
              css={{
                animation: `${pulsing} 2s infinite`,
              }}
            >
              <Spinner
                size="xl"
                thickness="3px"
                speed="0.8s"
                color="green.400"
              />
              <MotionFlex
                position="absolute"
                justify="center"
                align="center"
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
              >
                {Array.from({ length: 8 }).map((_, i) => (
                  <Box
                    key={i}
                    position="absolute"
                    w="6px"
                    h="6px"
                    borderRadius="full"
                    bg="green.400"
                    transform={`rotate(${i * 45}deg) translateY(-50px)`}
                    opacity={0.5 + (i % 2) * 0.5}
                  />
                ))}
              </MotionFlex>
            </MotionFlex>

            <VStack spacing={1}>
              <Text color="white" fontSize="lg" fontWeight="bold">
                {t('Searching for your perfect opponent')}
              </Text>
              <Text color="whiteAlpha.700" fontSize="sm">
                {t('This may take a few moments')}
              </Text>
            </VStack>

            <HStack spacing={4}>
              <VStack spacing={1}>
                <Text color="whiteAlpha.600" fontSize="sm">
                  {t('Time in Queue')}
                </Text>
                <HStack
                  p={2}
                  borderRadius="md"
                  bg="whiteAlpha.100"
                  border="1px solid"
                  borderColor="whiteAlpha.200"
                >
                  <Icon as={Clock} color="green.300" boxSize={4} />
                  <Text color="white" fontWeight="bold" fontFamily="mono">
                    {formatTime(matchmakingTime)}
                  </Text>
                </HStack>
              </VStack>

              <VStack spacing={1}>
                <Text color="whiteAlpha.600" fontSize="sm">
                  {t('Status')}
                </Text>
                <MotionBadge
                  colorScheme="green"
                  px={3}
                  py={1}
                  animate={{
                    opacity: [0.7, 1, 0.7],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: 'reverse',
                  }}
                >
                  {t('Active')}
                </MotionBadge>
              </VStack>
            </HStack>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button
            colorScheme="red"
            variant="outline"
            onClick={handleLeaveMatchmaking}
            leftIcon={<Icon as={X} />}
            _hover={{ bg: 'red.900' }}
          >
            {t('Leave Queue')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )

  // Compact version for floating menu
  if (compact) {
    return (
      <>
        {inMatchmaking ? (
          <Tooltip label={t('View matchmaking status')}>
            <MotionButton
              colorScheme="green"
              onClick={() => setIsModalOpen(true)}
              borderRadius="full"
              bgGradient="linear(to-r, green.500, teal.500)"
              boxShadow="0 4px 10px rgba(0,0,0,0.25)"
              animate={{
                boxShadow: [
                  '0 0 0px rgba(72, 187, 120, 0.4)',
                  '0 0 20px rgba(72, 187, 120, 0.7)',
                  '0 0 0px rgba(72, 187, 120, 0.4)',
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
              _hover={{ transform: 'translateY(-2px)' }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Spinner size="sm" color="white" />
            </MotionButton>
          </Tooltip>
        ) : (
          <Tooltip label={t('Find Match')}>
            <MotionButton
              colorScheme="blue"
              onClick={handleJoinMatchmaking}
              isLoading={matchmakingLoading}
              borderRadius="full"
              bgGradient="linear(to-r, blue.500, purple.500)"
              boxShadow="0 4px 10px rgba(0,0,0,0.25)"
              _hover={{ transform: 'translateY(-2px)' }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Icon as={Zap} boxSize={5} />
            </MotionButton>
          </Tooltip>
        )}

        {renderWaitingModal()}
      </>
    )
  }

  // Full-size version
  return (
    <>
      {inMatchmaking ? (
        <Tooltip label={t('View matchmaking status')}>
          <MotionButton
            colorScheme="green"
            leftIcon={<Icon as={Activity} />}
            onClick={() => setIsModalOpen(true)}
            borderRadius="full"
            px={6}
            py={6}
            mb={4}
            animate={{
              boxShadow: [
                '0 0 0px rgba(72, 187, 120, 0.4)',
                '0 0 20px rgba(72, 187, 120, 0.7)',
                '0 0 0px rgba(72, 187, 120, 0.4)',
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
            _hover={{ transform: 'translateY(-3px)' }}
          >
            <HStack>
              <Spinner size="sm" color="white" mr={1} />
              <Text>{t('Matchmaking Active')}</Text>
            </HStack>
          </MotionButton>
        </Tooltip>
      ) : (
        <MotionButton
          colorScheme="purple"
          size="lg"
          leftIcon={<Icon as={Shield} />}
          rightIcon={<Icon as={Zap} />}
          onClick={handleJoinMatchmaking}
          isLoading={matchmakingLoading}
          loadingText={t('Joining...')}
          borderRadius="full"
          px={8}
          py={7}
          mb={4}
          bgGradient="linear(to-r, purple.600, blue.600)"
          boxShadow="0 4px 20px rgba(124, 58, 237, 0.5)"
          whileHover={{
            scale: 1.05,
            boxShadow: '0 8px 30px rgba(124, 58, 237, 0.7)',
          }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.3 }}
          _hover={{
            bgGradient: 'linear(to-r, purple.500, blue.500)',
          }}
          _active={{
            bgGradient: 'linear(to-r, purple.700, blue.700)',
          }}
        >
          {t('Find Match')}
        </MotionButton>
      )}

      {renderWaitingModal()}
    </>
  )
})

export default MatchmakingButton
