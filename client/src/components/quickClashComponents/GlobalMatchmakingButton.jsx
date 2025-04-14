// components/quickClashComponents/GlobalMatchmakingButton.jsx
import React, { useState, useEffect, useCallback } from 'react'
import {
  Button,
  Icon,
  Text,
  HStack,
  VStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Spinner,
  Badge,
  Progress,
  Box,
  Flex,
  Divider,
  useToast,
  Tooltip,
  Center,
  Select,
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  Users,
  Search,
  X,
  Activity,
  Clock,
  Zap,
  Shield,
  Target,
  Trophy,
  UserPlus,
  RefreshCw,
  User,
} from 'lucide-react'
import { keyframes } from '@emotion/react'

// Import our custom hook
import useQuickClashGlobalMatchmaking from '../../customHooks/useQuickClashGlobalMatchmaking'

const MotionButton = motion(Button)
const MotionBox = motion(Box)
const MotionFlex = motion(Flex)
const MotionBadge = motion(Badge)

// Pulse animation for active matchmaking
const pulsing = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(92, 219, 149, 0.7); }
  70% { box-shadow: 0 0 0 10px rgba(92, 219, 149, 0); }
  100% { box-shadow: 0 0 0 0 rgba(92, 219, 149, 0); }
`

/**
 * Global Matchmaking Button allows players to join 4v4 matchmaking individually or in teams
 */
const GlobalMatchmakingButton = ({ compact = false }) => {
  const { t } = useTranslation('QuickClash')
  const { user } = useSelector(state => state.auth)
  const navigate = useNavigate()
  const toast = useToast()

  // Local UI state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [myTeams, setMyTeams] = useState([])
  const [loadingTeams, setLoadingTeams] = useState(false)

  // Use our custom hook for global matchmaking
  const {
    inMatchmaking,
    matchmakingType,
    selectedTeamId,
    progress,
    step,
    matchmakingTime,
    battleReady,
    loading,

    // Actions
    checkMatchmakingStatus,
    joinSoloMatchmaking,
    joinWithTeam,
    leaveMatchmaking,
    selectTeam,
    enterBattle,

    // Helper functions
    formatMatchmakingTime,
    getStatusDescription,
    getStepColor,
    clearBattleReady,
  } = useQuickClashGlobalMatchmaking()

  // Check initial status and load teams on mount
  useEffect(() => {
    if (user?._id) {
      checkMatchmakingStatus()
      fetchMyTeams()
    }
  }, [user, checkMatchmakingStatus])

  // Fetch user's teams
  const fetchMyTeams = async () => {
    try {
      setLoadingTeams(true)
      const response = await axios.get('/api/quickClash/teams')
      setMyTeams(response.data.teams || [])
    } catch (error) {
      console.error('Error fetching teams:', error)
    } finally {
      setLoadingTeams(false)
    }
  }

  // Open matchmaking modal
  const openModal = () => {
    setIsModalOpen(true)

    // Refresh teams when opening modal
    fetchMyTeams()
  }

  // Close matchmaking modal
  const closeModal = () => {
    setIsModalOpen(false)
    if (battleReady || progress === 100) {
      clearBattleReady()
    }
  }

  // Handle joining the matchmaking based on selection
  const handleJoinMatchmaking = async () => {
    try {
      if (selectedTeamId) {
        // Join with team
        await joinWithTeam(selectedTeamId)
      } else {
        // Join solo
        await joinSoloMatchmaking()
      }
      // Don't close the modal on error - it will already be handled in the hooks
    } catch (error) {
      console.error('Error joining matchmaking:', error)
      // No need to show additional error messages or close the modal
    }
  }

  // Render team selection list
  const renderTeamSelection = () => {
    if (loadingTeams) {
      return (
        <Center py={4}>
          <Spinner color="purple.400" />
        </Center>
      )
    }

    if (!myTeams || myTeams.length === 0) {
      return (
        <Box textAlign="center" py={4}>
          <Text color="whiteAlpha.700">{t('You have no teams')}</Text>
        </Box>
      )
    }

    return (
      <VStack spacing={2} align="stretch" maxH="200px" overflowY="auto">
        {/* Solo option at the top */}
        <MotionBox
          p={3}
          borderRadius="md"
          bg={
            !selectedTeamId
              ? 'rgba(128, 90, 213, 0.2)'
              : 'rgba(26, 32, 44, 0.6)'
          }
          borderWidth="1px"
          borderColor={!selectedTeamId ? 'purple.500' : 'whiteAlpha.200'}
          cursor="pointer"
          onClick={() => selectTeam(null)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.2 }}
        >
          <HStack justify="space-between">
            <HStack>
              <Icon as={User} color="purple.400" boxSize={5} />
              <Text
                color="white"
                fontWeight={!selectedTeamId ? 'bold' : 'normal'}
              >
                {t('Join Individually')}
              </Text>
            </HStack>
            <Badge colorScheme="green">{t('You')}</Badge>
          </HStack>
        </MotionBox>

        {/* Team options */}
        {myTeams.map(team => (
          <MotionBox
            key={team._id}
            p={3}
            borderRadius="md"
            bg={
              selectedTeamId === team._id
                ? 'rgba(128, 90, 213, 0.2)'
                : 'rgba(26, 32, 44, 0.6)'
            }
            borderWidth="1px"
            borderColor={
              selectedTeamId === team._id ? 'purple.500' : 'whiteAlpha.200'
            }
            cursor="pointer"
            onClick={() => selectTeam(team._id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            <HStack justify="space-between">
              <HStack>
                <Icon as={Users} color="purple.400" boxSize={5} />
                <Text
                  color="white"
                  fontWeight={selectedTeamId === team._id ? 'bold' : 'normal'}
                >
                  {team.name}
                </Text>
              </HStack>
              <Badge colorScheme="blue">
                {team.members.length}/4 {t('Members')}
              </Badge>
            </HStack>
          </MotionBox>
        ))}
      </VStack>
    )
  }

  // Render matchmaking button based on state and compact mode
  const renderButton = () => {
    // If currently in matchmaking
    if (inMatchmaking) {
      return compact ? (
        <Tooltip label={t('View matchmaking status')}>
          <MotionButton
            colorScheme="green"
            onClick={openModal}
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
        <Tooltip label={t('View matchmaking status')}>
          <MotionButton
            colorScheme="green"
            leftIcon={<Icon as={Activity} />}
            rightIcon={<Spinner size="sm" />}
            onClick={openModal}
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
            <Text>{t('4v4 Matchmaking Active')}</Text>
          </MotionButton>
        </Tooltip>
      )
    }

    // If not in matchmaking
    return compact ? (
      <Tooltip label={t('Join 4v4 Matchmaking')}>
        <MotionButton
          colorScheme="blue"
          onClick={openModal}
          isLoading={loading}
          borderRadius="full"
          bgGradient="linear(to-r, blue.500, purple.500)"
          boxShadow="0 4px 10px rgba(0,0,0,0.25)"
          _hover={{ transform: 'translateY(-2px)' }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Icon as={Users} boxSize={5} />
        </MotionButton>
      </Tooltip>
    ) : (
      <MotionButton
        colorScheme="blue"
        size="lg"
        leftIcon={<Icon as={Users} />}
        rightIcon={<Icon as={Zap} />}
        onClick={openModal}
        isLoading={loading}
        loadingText={t('Joining...')}
        borderRadius="full"
        px={8}
        py={7}
        mb={4}
        bgGradient="linear(to-r, blue.600, purple.600)"
        boxShadow="0 4px 20px rgba(66, 153, 225, 0.5)"
        whileHover={{
          scale: 1.05,
          boxShadow: '0 8px 30px rgba(66, 153, 225, 0.7)',
        }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.3 }}
        _hover={{
          bgGradient: 'linear(to-r, blue.500, purple.500)',
        }}
        _active={{
          bgGradient: 'linear(to-r, blue.700, purple.700)',
        }}
      >
        {t('Join 4v4 Matchmaking')}
      </MotionButton>
    )
  }

  // Render the matchmaking modal content
  const renderModalContent = () => {
    if (inMatchmaking) {
      return (
        <VStack spacing={6} align="center">
          {/* Animated Spinner with Orbiting Elements */}
          <MotionFlex
            justify="center"
            align="center"
            w="120px"
            h="120px"
            borderRadius="full"
            bg={`rgba(${
              getStepColor(step) === 'blue'
                ? '66, 153, 225'
                : getStepColor(step) === 'green'
                ? '72, 187, 120'
                : getStepColor(step) === 'purple'
                ? '159, 122, 234'
                : getStepColor(step) === 'orange'
                ? '237, 137, 54'
                : getStepColor(step) === 'teal'
                ? '56, 178, 172'
                : '113, 128, 150'
            }, 0.1)`}
            border="2px solid"
            borderColor={`${getStepColor(step)}.400`}
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
              thickness="4px"
              speed="0.8s"
              color={`${getStepColor(step)}.400`}
            />
            <MotionFlex
              position="absolute"
              justify="center"
              align="center"
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
            >
              {Array.from({ length: 12 }).map((_, i) => (
                <Box
                  key={i}
                  position="absolute"
                  w="8px"
                  h="8px"
                  borderRadius="full"
                  bg={`${getStepColor(step)}.400`}
                  transform={`rotate(${i * 30}deg) translateY(-60px)`}
                  opacity={0.5 + (i % 2) * 0.5}
                />
              ))}
            </MotionFlex>
          </MotionFlex>

          {/* Progress Bar */}
          <VStack spacing={2} w="100%">
            <Flex justify="space-between" w="100%">
              <Text color="whiteAlpha.700" fontSize="sm">
                {t('Progress')}
              </Text>
              <Text color="whiteAlpha.700" fontSize="sm">
                {progress}%
              </Text>
            </Flex>
            <Progress
              value={progress}
              size="sm"
              colorScheme={getStepColor(step)}
              w="100%"
              borderRadius="full"
              hasStripe
              isAnimated
            />
          </VStack>

          {/* Informative Text */}
          <VStack spacing={2} align="center">
            <Text color="white" fontSize="xl" fontWeight="bold">
              {t('Finding Your 4v4 Battle')}
            </Text>
            <Text color="whiteAlpha.700" fontSize="md" textAlign="center">
              {getStatusDescription(step)}
            </Text>
          </VStack>

          {/* Separator */}
          <Divider borderColor="whiteAlpha.300" />

          {/* Time and Status Display */}
          <HStack spacing={8} justify="center">
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
                <Icon
                  as={Clock}
                  color={`${getStepColor(step)}.300`}
                  boxSize={4}
                />
                <Text color="white" fontWeight="bold" fontFamily="mono">
                  {formatMatchmakingTime(matchmakingTime)}
                </Text>
              </HStack>
            </VStack>

            <VStack spacing={1}>
              <Text color="whiteAlpha.600" fontSize="sm">
                {t('Status')}
              </Text>
              <MotionBadge
                colorScheme={getStepColor(step)}
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
                {step || t('Searching')}
              </MotionBadge>
            </VStack>
          </HStack>

          {/* Additional Info */}
          <Box w="100%" pt={4}>
            <Text color="whiteAlpha.600" fontSize="sm" textAlign="center">
              {t(
                'You can close this modal and continue browsing. We will notify you when your battle is ready.',
              )}
            </Text>
          </Box>
        </VStack>
      )
    }

    // Not in matchmaking - show team selection
    return (
      <VStack spacing={6} align="stretch">
        {/* Header section */}
        <VStack spacing={2} align="center">
          <MotionBox
            animate={{
              scale: [1, 1.05, 1],
              rotate: [0, 2, 0, -2, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatType: 'loop',
            }}
          >
            <Icon as={Users} boxSize={12} color="blue.400" />
          </MotionBox>
          <Text color="white" fontSize="xl" fontWeight="bold">
            {t('Join 4v4 Team Battle')}
          </Text>
          <Text color="whiteAlpha.700" textAlign="center">
            {t(
              "Join with your team or as an individual player and we'll match you with others.",
            )}
          </Text>
        </VStack>

        {/* Entry options */}
        <Box>
          <Text color="whiteAlpha.900" fontWeight="bold" mb={3}>
            {t('Choose Your Entry')}
          </Text>

          {renderTeamSelection()}
        </Box>

        {/* Info section */}
        <Box bg="whiteAlpha.100" p={4} borderRadius="md">
          <HStack mb={2}>
            <Icon as={Shield} color="blue.400" boxSize={5} />
            <Text color="white" fontWeight="bold">
              {t('About 4v4 Team Battles')}
            </Text>
          </HStack>
          <VStack spacing={2} align="start">
            <Text color="whiteAlpha.800" fontSize="sm">
              • {t('Compete in 4v4 team battles with friends or new teammates')}
            </Text>
            <Text color="whiteAlpha.800" fontSize="sm">
              • {t('Solo players will be matched with others to form a team')}
            </Text>
            <Text color="whiteAlpha.800" fontSize="sm">
              • {t('Each player battles in one of four different categories')}
            </Text>
            <Text color="whiteAlpha.800" fontSize="sm">
              • {t("Win trophies based on your team's performance")}
            </Text>
          </VStack>
        </Box>
      </VStack>
    )
  }

  return (
    <>
      {/* The matchmaking button */}
      {renderButton()}

      {/* Matchmaking Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        size="lg"
        isCentered
        closeOnOverlayClick={!inMatchmaking}
      >
        <ModalOverlay backdropFilter="blur(3px)" bg="rgba(0, 0, 0, 0.7)" />
        <ModalContent
          bg="rgba(26, 21, 39, 0.95)"
          borderRadius="xl"
          borderWidth="1px"
          borderColor={inMatchmaking ? `${getStepColor(step)}.500` : 'blue.500'}
          boxShadow={`0 0 20px rgba(${
            inMatchmaking && getStepColor(step) === 'green'
              ? '72, 187, 120'
              : inMatchmaking && getStepColor(step) === 'purple'
              ? '159, 122, 234'
              : '66, 153, 225'
          }, 0.4)`}
        >
          <ModalHeader
            color="white"
            borderBottomWidth="1px"
            borderColor="whiteAlpha.200"
          >
            <HStack>
              <Icon
                as={inMatchmaking ? Activity : Users}
                color={inMatchmaking ? `${getStepColor(step)}.400` : 'blue.400'}
                boxSize={5}
              />
              <Text>
                {inMatchmaking
                  ? t('Matchmaking Status')
                  : t('4v4 Team Matchmaking')}
              </Text>

              {inMatchmaking && step === 'battle_ready' && (
                <Badge colorScheme="green" ml={2}>
                  {t('Ready')}
                </Badge>
              )}
            </HStack>
          </ModalHeader>
          <ModalCloseButton color="white" />

          <ModalBody py={6}>{renderModalContent()}</ModalBody>

          <ModalFooter borderTopWidth="1px" borderColor="whiteAlpha.200">
            {inMatchmaking ? (
              <>
                {step === 'battleReady' || progress === 100 ? (
                  <Button
                    colorScheme="green"
                    onClick={enterBattle}
                    leftIcon={<Icon as={Zap} />}
                    as={motion.button}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
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
                  >
                    {t('Enter Battle')}
                  </Button>
                ) : (
                  <Button
                    colorScheme="red"
                    variant="outline"
                    onClick={leaveMatchmaking}
                    isLoading={loading}
                    loadingText={t('Leaving...')}
                    leftIcon={<Icon as={X} />}
                    _hover={{ bg: 'red.900' }}
                  >
                    {t('Leave Queue')}
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  mr={3}
                  onClick={closeModal}
                  color="whiteAlpha.800"
                  _hover={{ bg: 'whiteAlpha.100' }}
                >
                  {t('Cancel')}
                </Button>
                <Button
                  colorScheme="blue"
                  onClick={handleJoinMatchmaking}
                  isLoading={loading}
                  loadingText={t('Joining...')}
                  leftIcon={<Icon as={selectedTeamId ? Users : User} />}
                >
                  {selectedTeamId
                    ? t('Join with Team')
                    : t('Join Individually')}
                </Button>
              </>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default GlobalMatchmakingButton
