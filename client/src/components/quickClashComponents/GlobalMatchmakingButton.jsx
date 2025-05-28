// components/quickClashComponents/GlobalMatchmakingButton.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react'
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
  Box,
  Flex,
  Divider,
  useToast,
  Tooltip,
  Center,
  // useColorModeValue, // Not strictly needed for this change, but good to have
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  Users,
  Search,
  X,
  Activity,
  Clock,
  Zap, // Keep Zap as it's used
  Shield,
  Target,
  Trophy, // Keep Trophy as it might be used elsewhere, or if user wants to re-add it differently
  UserPlus,
  RefreshCw,
  User,
  Info,
  Sword,
  Globe,
  Loader,
  AlertTriangle,
  FileText,
} from 'lucide-react'
import { keyframes } from '@emotion/react'

// Import our custom hook
import useQuickClashGlobalMatchmaking from '../../customHooks/useQuickClashGlobalMatchmaking'
import { useSocket } from '../../customHooks/useSocket'
import {
  resetGlobalMatchmakingState,
  setBattleReady,
  setJoinType,
  setOriginalTeam,
  setSelectedTeamId,
  setTeamName,
  updateMatchmakingState,
} from '../../redux/quickClashGlobalMatchmakingSlice'

const MotionButton = motion(Button)
const MotionBox = motion(Box)
const MotionFlex = motion(Flex)
const MotionBadge = motion(Badge)
const MotionHStack = motion(HStack)

// Pulse animation for active matchmaking
const pulsing = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(92, 219, 149, 0.7); }
  70% { box-shadow: 0 0 0 10px rgba(92, 219, 149, 0); }
  100% { box-shadow: 0 0 0 0 rgba(92, 219, 149, 0); }
`

// Floating animation for icons
const floating = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`

// Rotation animation
const rotate = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`

/**
 * Simplified Global Matchmaking Button with HTTP polling
 */
const GlobalMatchmakingButton = ({ compact = false }) => {
  const { t } = useTranslation('QuickClash')
  const { user } = useSelector(state => state.auth)
  const navigate = useNavigate()
  const toast = useToast()

  // Local state for UI
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [myTeams, setMyTeams] = useState([])
  const [loadingTeams, setLoadingTeams] = useState(false)
  const [statusUpdates, setStatusUpdates] = useState([])
  const [lastUpdateTime, setLastUpdateTime] = useState(Date.now())

  // HTTP polling refs
  const pollingIntervalRef = useRef(null)
  const mountTimeRef = useRef(Date.now())

  const { getSocket } = useSocket()
  const dispatch = useDispatch()

  // Color values for consistent dark theming
  const bgColor = 'rgba(26, 21, 39, 0.95)' // This matches the modal's dark background
  const borderColor = 'purple.600'
  const textColor = 'white'

  // Use polling function for status updates
  const {
    inMatchmaking,
    matchmakingType,
    selectedTeamId,
    teamName,
    joinType,
    originalTeam,
    battleReady,
    loading,
    matchmakingTime,
    battleCreationStatus,
    battleCreationError,

    // Actions
    checkMatchmakingStatus,
    pollMatchmakingStatus, // New polling-specific function
    joinSoloMatchmaking,
    joinWithTeam,
    leaveMatchmaking,
    selectTeam,
    enterBattle,
    clearBattleReady,
    formatMatchmakingTime,
    clearBattleCreationError,
    checkCanLeaveMatchmaking,
  } = useQuickClashGlobalMatchmaking()

  // Fetch user's teams
  const fetchMyTeams = useCallback(async () => {
    try {
      setLoadingTeams(true)
      const response = await axios.get('/api/quickClash/teams')
      setMyTeams(response.data?.teams || [])
    } catch (error) {
      console.error('Error fetching teams:', error)
    } finally {
      setLoadingTeams(false)
    }
  }, [])

  // Initialize and fetch data on mount
  useEffect(() => {
    if (user?._id) {
      checkMatchmakingStatus()
      fetchMyTeams()
    }
  }, [user, checkMatchmakingStatus, fetchMyTeams]) // Added dependencies

  // Setup HTTP polling for matchmaking status when in matchmaking
  useEffect(() => {
    if (inMatchmaking && isModalOpen) {
      const startPolling = () => {
        pollingIntervalRef.current = setInterval(async () => {
          try {
            const statusData = await pollMatchmakingStatus()
            if (statusData) {
              let updateMessage = t('Checking for updates...')
              if (statusData?.status === 'battleReady') {
                console.log(
                  'Battle ready detected via HTTP polling:',
                  statusData,
                )
                dispatch(
                  setBattleReady({
                    battleId: statusData?.battleId,
                    teamId: statusData?.teamId,
                    teamA: statusData?.teamA,
                    teamB: statusData?.teamB,
                  }),
                )
                if (pollingIntervalRef.current) {
                  clearInterval(pollingIntervalRef.current)
                  pollingIntervalRef.current = null
                }
                const timeElapsed = Math.floor(
                  (Date.now() - mountTimeRef.current) / 1000,
                )
                setStatusUpdates(prev => [
                  {
                    id: Date.now(),
                    message: t(
                      'Battle is ready! You can now enter the battle.',
                    ),
                    time: timeElapsed,
                  },
                  ...prev.slice(0, 2),
                ])
                return
              }
              // ... (rest of status update logic remains the same)
              if (statusData?.status === 'searching_players') {
                updateMessage = t(
                  'Searching for players with similar skill level...',
                )
              } else if (statusData?.status === 'forming_team') {
                updateMessage = t('Found players! Forming your team...')
              } else if (statusData?.status === 'team_completed') {
                updateMessage = t(
                  'Team formed successfully! Looking for opponents...',
                )
              } else if (statusData?.status === 'matching_teams') {
                updateMessage = t(
                  'Finding an opponent team to battle against...',
                )
              } else if (statusData?.status === 'preparing_battle') {
                updateMessage = t(
                  'Match found! Setting up your battle arena...',
                )
              } else if (statusData?.teamMembersCount) {
                updateMessage = t('Team has {{count}} of 4 players', {
                  count: statusData?.teamMembersCount,
                })
              } else if (statusData?.soloPlayersInQueue) {
                updateMessage = t('{{count}} players searching globally', {
                  count: statusData?.soloPlayersInQueue,
                })
              } else if (statusData?.status === 'team_formation_in_progress') {
                updateMessage = t(
                  'Your team is being merged with other players...',
                )
              }
              // Removed duplicate 'matching_teams'
              // else if (statusData?.status === 'matching_teams') {
              //   updateMessage = t('Looking for an opponent team to battle...')
              // }

              const timeElapsed = Math.floor(
                (Date.now() - mountTimeRef.current) / 1000,
              )
              setStatusUpdates(prev => [
                {
                  id: Date.now(),
                  message: updateMessage,
                  time: timeElapsed,
                },
                ...prev.slice(0, 2),
              ])
            } else {
              const timeElapsed = Math.floor(
                (Date.now() - mountTimeRef.current) / 1000,
              )
              setStatusUpdates(prev => [
                {
                  id: Date.now(),
                  message: t('Still searching for the perfect match...'),
                  time: timeElapsed,
                },
                ...prev.slice(0, 2),
              ])
            }
            setLastUpdateTime(Date.now())
          } catch (error) {
            console.error('Error polling matchmaking status:', error)
            const timeElapsed = Math.floor(
              (Date.now() - mountTimeRef.current) / 1000,
            )
            setStatusUpdates(prev => [
              {
                id: Date.now(),
                message: t('Connection issue, retrying...'),
                time: timeElapsed,
              },
              ...prev.slice(0, 2),
            ])
          }
        }, 15000)
      }
      startPolling()
      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current)
          pollingIntervalRef.current = null
        }
      }
    }
  }, [
    inMatchmaking,
    isModalOpen,
    pollMatchmakingStatus,
    t,
    dispatch,
    // setBattleReady, // Already part of dispatch
  ])

  // Socket listeners for team events
  useEffect(() => {
    const socket = getSocket()
    if (!socket) return

    socket.on('quickClash:teamLeftMatchmaking', data => {
      console.log('Received teamLeftMatchmaking event:', data)
      // ... (toast logic remains the same)
      if (inMatchmaking) {
        dispatch(resetGlobalMatchmakingState())
        setStatusUpdates([])
        mountTimeRef.current = Date.now()
      }
    })

    socket.on('quickClash:teamReturnedToMatchmaking', data => {
      console.log('Received teamReturnedToMatchmaking event:', data)
      if (user?._id) {
        checkMatchmakingStatus()
        fetchMyTeams()
        setStatusUpdates(prev => [
          {
            id: Date.now(),
            message: t('Team returned to matchmaking'),
            time: Math.floor((Date.now() - mountTimeRef.current) / 1000),
          },
          ...prev.slice(0, 2),
        ])
      }
    })

    socket.on('quickClash:teamJoinedMatchmaking', data => {
      console.log('Received teamJoinedMatchmaking event:', data)
      if (user?._id) {
        // ... (state update logic remains the same)
        fetchMyTeams()
        setStatusUpdates(prev => [
          {
            id: Date.now(),
            message: t('Team joined matchmaking successfully'),
            time: Math.floor((Date.now() - mountTimeRef.current) / 1000),
          },
          ...prev.slice(0, 2),
        ])
        // ... (toast logic remains the same)
      }
    })

    return () => {
      socket.off('quickClash:teamLeftMatchmaking')
      socket.off('quickClash:teamReturnedToMatchmaking')
      socket.off('quickClash:teamJoinedMatchmaking')
    }
  }, [
    getSocket,
    toast,
    t,
    inMatchmaking,
    dispatch,
    selectedTeamId,
    user?._id,
    checkMatchmakingStatus,
    fetchMyTeams,
  ])

  // Open modal and setup
  const openModal = () => {
    setIsModalOpen(true)
    mountTimeRef.current = Date.now()
    setStatusUpdates([])
    fetchMyTeams() // Fetch teams when modal opens
  }

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false)
    if (battleReady) {
      clearBattleReady()
    }
  }

  // Handle joining matchmaking
  const handleJoinMatchmaking = async () => {
    // ... (logic remains the same)
    try {
      mountTimeRef.current = Date.now()
      setStatusUpdates([
        {
          id: Date.now(),
          message: t('Joining matchmaking...'),
          time: 0,
        },
      ])

      if (selectedTeamId) {
        try {
          const teamResponse = await axios.get(
            `/api/quickClash/team/${selectedTeamId}`,
          )
          if (teamResponse.data && teamResponse.data?.team) {
            const teamName = teamResponse.data?.team.name || 'Team'
            await joinWithTeam(selectedTeamId, teamName)
          } else {
            await joinWithTeam(selectedTeamId)
          }
        } catch (teamError) {
          console.error('Error fetching team details:', teamError)
          await joinWithTeam(selectedTeamId)
        }
      } else {
        await joinSoloMatchmaking()
      }

      setStatusUpdates(prev => [
        {
          id: Date.now(),
          message: t('Successfully joined matchmaking'),
          time: Math.floor((Date.now() - mountTimeRef.current) / 1000),
        },
        ...prev.slice(0, 2),
      ])
    } catch (error) {
      console.error('Error joining matchmaking:', error)
      setStatusUpdates(prev => [
        {
          id: Date.now(),
          message: t('Failed to join matchmaking'),
          time: Math.floor((Date.now() - mountTimeRef.current) / 1000),
        },
        ...prev.slice(0, 2),
      ])
    }
  }

  // Handle leaving matchmaking
  const handleLeaveMatchmaking = async () => {
    // ... (logic remains the same)
    try {
      const canLeave = await checkCanLeaveMatchmaking()
      if (!canLeave) {
        toast({
          title: t('Cannot Leave'),
          description: t('Your battle is being created. Please wait.'),
          status: 'warning',
          duration: 3000,
          isClosable: true,
        })
        return
      }
      await leaveMatchmaking()
      setStatusUpdates([])
      closeModal()
    } catch (error) {
      console.error('Error leaving matchmaking:', error)
    }
  }

  // Render team selection
  const renderTeamSelection = () => {
    // ... (logic remains the same)
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
            <Badge colorScheme="green">{t('Solo')}</Badge>
          </HStack>
        </MotionBox>

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
              <Badge colorScheme="blue">{team.members.length}/4</Badge>
            </HStack>
          </MotionBox>
        ))}
      </VStack>
    )
  }

  // Get badge info for matchmaking type
  const getBadgeInfo = () => {
    // ... (logic remains the same)
    if (joinType === 'solo' && matchmakingType === 'solo') {
      return {
        icon: User,
        color: 'blue', // Example, might be different based on your theme
        text: t('Solo Player'),
        tooltip: t('You joined matchmaking as an individual player'),
      }
    }
    if (joinType === 'solo' && matchmakingType === 'team') {
      return {
        icon: UserPlus,
        color: 'teal',
        text: t('Auto-Team Member'),
        tooltip: t('You were assigned to an auto-formed team'),
      }
    }
    if (joinType === 'sourceTeam' && originalTeam) {
      // This could be the "HELLO 6" case if originalTeam.name is "HELLO 6"
      // and icon is Users
      return {
        icon: Users, // Assuming user group icon for teams
        color: 'purple', // Color for the "HELLO 6" badge in the image
        text: originalTeam.name || t('Team Member'),
        tooltip: t('Your original team was merged into a larger team'),
      }
    }
    if (joinType === 'regular' && matchmakingType === 'team') {
      return {
        icon: Users,
        color: 'purple',
        text: teamName || t('Team Member'),
        tooltip: t('You joined matchmaking with your team'),
      }
    }
    // Fallback, adjust as needed. The "HELLO 6" badge is likely from one of the above.
    return {
      icon: Users, // Default icon
      color: 'gray', // Default color
      text: teamName || t('Player'),
      tooltip: t('Matchmaking information'),
    }
  }

  // Render the matchmaking button
  const renderButton = () => {
    // ... (logic remains the same)
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
            <MotionBox
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              <Icon as={Globe} boxSize={5} />
            </MotionBox>
          </MotionButton>
        </Tooltip>
      ) : (
        <Tooltip label={t('View matchmaking status')}>
          <MotionButton
            colorScheme="green"
            leftIcon={<Icon as={Activity} />}
            rightIcon={
              <MotionBox
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              >
                <Icon as={Globe} />
              </MotionBox>
            }
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
        className={'global-matchmaking-button'}
      >
        {t('Join 4v4 Matchmaking')}
      </MotionButton>
    )
  }

  // Render modal content
  const renderModalContent = () => {
    // Handle battle creation status
    if (battleCreationStatus === 'creating') {
      // ... (logic remains the same)
      return (
        <VStack spacing={6} align="center">
          <MotionFlex
            justify="center"
            align="center"
            w="120px"
            h="120px"
            borderRadius="full"
            bg="rgba(128, 90, 213, 0.1)"
            border="2px solid"
            borderColor="purple.400"
            position="relative"
            animate={{
              scale: [1, 1.05, 1],
              rotate: [0, 360],
            }}
            transition={{
              scale: {
                duration: 2,
                repeat: Infinity,
                repeatType: 'reverse',
              },
              rotate: {
                duration: 3,
                repeat: Infinity,
                ease: 'linear',
              },
            }}
          >
            <Icon as={Loader} color="purple.400" boxSize={12} />
            <MotionBox
              position="absolute"
              animate={{
                y: [0, -10, 0],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
            >
              <Icon as={Shield} color="purple.200" boxSize={6} />
            </MotionBox>
          </MotionFlex>

          <VStack spacing={2} align="center">
            <Text color="purple.400" fontSize="2xl" fontWeight="bold">
              {t('Creating Your Battle')}
            </Text>
            <Text color="whiteAlpha.800" fontSize="md" textAlign="center">
              {t('Please wait while we set up your 4v4 team battle')}
            </Text>
          </VStack>

          <Box
            w="100%"
            bg="rgba(128, 90, 213, 0.1)"
            borderRadius="md"
            p={4}
            borderWidth="1px"
            borderColor="purple.500"
          >
            <VStack spacing={3}>
              <Text color="purple.400" fontWeight="bold" fontSize="md">
                {t('Setting Up Battle')}
              </Text>
              <VStack spacing={2} w="100%">
                <HStack justify="space-between" w="100%">
                  <HStack>
                    <Icon as={Users} color="purple.300" boxSize={4} />
                    <Text color="whiteAlpha.800" fontSize="sm">
                      {t('Preparing teams')}
                    </Text>
                  </HStack>
                  <Spinner size="sm" color="purple.400" />
                </HStack>
                <HStack justify="space-between" w="100%">
                  <HStack>
                    <Icon as={FileText} color="purple.300" boxSize={4} />
                    <Text color="whiteAlpha.800" fontSize="sm">
                      {t('Generating questions')}
                    </Text>
                  </HStack>
                  <Spinner size="sm" color="purple.400" />
                </HStack>
                <HStack justify="space-between" w="100%">
                  <HStack>
                    <Icon as={Zap} color="purple.300" boxSize={4} />
                    <Text color="whiteAlpha.800" fontSize="sm">
                      {t('Almost ready')}
                    </Text>
                  </HStack>
                  <Spinner size="sm" color="purple.400" />
                </HStack>
              </VStack>
            </VStack>
          </Box>

          <Box
            w="100%"
            bg="rgba(245, 166, 35, 0.1)"
            borderRadius="md"
            p={3}
            borderWidth="1px"
            borderColor="orange.400"
          >
            <HStack>
              <Icon as={AlertTriangle} color="orange.400" boxSize={5} />
              <Text color="orange.300" fontSize="sm" fontWeight="bold">
                {t('Cannot leave during battle creation')}
              </Text>
            </HStack>
            <Text color="whiteAlpha.700" fontSize="xs" mt={1}>
              {t('Your battle will be ready shortly')}
            </Text>
          </Box>
        </VStack>
      )
    }

    // Handle battle creation failure
    if (battleCreationStatus === 'failed') {
      // ... (logic remains the same)
      return (
        <VStack spacing={6} align="center">
          <MotionFlex
            justify="center"
            align="center"
            w="120px"
            h="120px"
            borderRadius="full"
            bg="rgba(245, 101, 101, 0.1)"
            border="2px solid"
            borderColor="red.400"
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          >
            <Icon as={AlertTriangle} color="red.400" boxSize={12} />
          </MotionFlex>

          <VStack spacing={2} align="center">
            <Text color="red.400" fontSize="2xl" fontWeight="bold">
              {t('Battle Creation Failed')}
            </Text>
            <Text color="whiteAlpha.800" fontSize="md" textAlign="center">
              {battleCreationError ||
                t('Something went wrong while creating your battle')}
            </Text>
          </VStack>

          <Box
            w="100%"
            bg="rgba(245, 101, 101, 0.1)"
            borderRadius="md"
            p={4}
            borderWidth="1px"
            borderColor="red.500"
          >
            <Text color="red.300" fontWeight="bold" fontSize="sm" mb={2}>
              {t('What happened?')}
            </Text>
            <Text color="whiteAlpha.700" fontSize="sm">
              {t(
                'We encountered an issue while setting up your battle. You can try joining matchmaking again.',
              )}
            </Text>
          </Box>
        </VStack>
      )
    }

    // If battle is ready, show the battle ready UI
    if (battleReady) {
      const badgeInfo = getBadgeInfo() // This will provide data for the "HELLO 6" like badge

      return (
        <VStack spacing={4} align="center" w="100%">
          {' '}
          {/* Main container for battle ready */}
          {/* Central Animated Element (mimicking the 'M' logo in the image) */}
          <MotionFlex
            justify="center"
            align="center"
            w="120px" // Size of the circular logo area
            h="120px"
            borderRadius="full"
            bg="rgba(20, 25, 35, 0.6)" // Darker background for the circle, similar to prompt
            border="2px solid"
            borderColor="green.400" // Green border as in prompt
            animate={{
              // Animation for the glow and subtle scale
              scale: [1, 1.02, 1],
              boxShadow: [
                '0 0 8px rgba(72, 187, 120, 0.5)', // Softer glow
                '0 0 25px rgba(72, 187, 120, 0.9)', // Peak intense glow
                '0 0 8px rgba(72, 187, 120, 0.5)', // Back to softer glow
              ],
            }}
            transition={{
              duration: 1.8, // Slower, more pronounced pulse for the glow
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          >
            {/* Icon inside the circle. The prompt has an 'M' logo. We use Zap here.
                If you have a custom 'M' icon component, you can replace `Zap` with it.
            */}
            <Icon as={Zap} color="green.300" boxSize={16} />
            {/*
              REMOVED the overlapping Trophy icon to fix the mixing issue and match the reference image.
              The original reference image does not show a trophy here.
              If a trophy is desired, it should be a separate element.
            */}
          </MotionFlex>
          {/* Battle Ready Status Text */}
          <VStack spacing={1} align="center" mt={2}>
            <Text
              color="green.300"
              fontSize="3xl"
              fontWeight="bold"
              letterSpacing="tight"
            >
              {t('Battle Ready!')}
            </Text>
            <Text
              color="whiteAlpha.800"
              fontSize="lg"
              textAlign="center"
              px={{ base: 2, md: 4 }}
            >
              {t('Your 4v4 team battle is ready to begin')}
            </Text>
          </VStack>
          {/* Matchmaking Type Badge (e.g., "HELLO 6") */}
          {/* This uses the existing MotionBadge styling which should work well.
              The color and icon come from getBadgeInfo()
              The prompt image's "HELLO 6" badge is light purple with a user group icon.
              Ensure getBadgeInfo returns appropriate `color` (e.g., 'purple'), `icon` (e.g., Users), and `text`.
          */}
          <Tooltip label={badgeInfo.tooltip} hasArrow placement="top">
            <MotionBadge
              colorScheme={badgeInfo.color} // This will be 'purple' for the "HELLO 6" example
              px={4}
              py={2}
              borderRadius="full"
              fontSize="md"
              display="flex"
              alignItems="center"
              // Example of direct styling if colorScheme isn't enough for the exact purple:
              // bg="rgba(128, 90, 213, 0.2)"
              // borderColor="purple.500"
              // borderWidth="1px"
              // color="purple.100" // Or white, depending on desired contrast with the light purple bg
              animate={{
                y: [0, -3, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
            >
              <Icon as={badgeInfo.icon} mr={2} boxSize={5} />{' '}
              {/* User group icon */}
              {badgeInfo.text} {/* "HELLO 6" or similar */}
            </MotionBadge>
          </Tooltip>
          {/* Battle Information Box */}
          {battleReady && (
            <Box
              w={{ base: '95%', md: '90%' }} // Responsive width
              bg="rgba(15, 20, 30, 0.75)" // Dark, slightly transparent background for the info box
              borderRadius="lg" // Matches prompt image's rounded box
              p={4}
              borderWidth="1px"
              borderColor="rgba(72, 187, 120, 0.4)" // Softer green border for the box
              mt={3} // Margin top for spacing
            >
              <VStack
                spacing={3}
                divider={<Divider borderColor="rgba(255,255,255,0.1)" />}
              >
                <HStack justify="space-between" w="100%">
                  <Text color="whiteAlpha.700" fontSize="sm">
                    {t('Total Time in Queue')}
                  </Text>
                  <Text
                    color="white"
                    fontWeight="bold"
                    fontFamily="mono"
                    fontSize="md"
                  >
                    {formatMatchmakingTime(matchmakingTime)}
                  </Text>
                </HStack>

                {battleReady.teamA && battleReady.teamB && (
                  <VStack spacing={2} w="100%" pt={2}>
                    <Text
                      color="green.300"
                      fontWeight="bold"
                      fontSize="md"
                      mb={2}
                      textAlign="center"
                    >
                      {t('Match Details')}
                    </Text>
                    <HStack justify="space-around" w="100%" alignItems="center">
                      <HStack
                        spacing={2}
                        alignItems="center"
                        direction="column"
                      >
                        {' '}
                        {/* Aligned better with icon above text */}
                        <Icon as={Users} color="blue.300" boxSize={5} />
                        <Text color="whiteAlpha.800" fontSize="sm">
                          {t('Your Team')}
                        </Text>
                      </HStack>
                      <Text
                        color="whiteAlpha.700"
                        fontSize="md"
                        fontWeight="medium"
                      >
                        vs
                      </Text>
                      <HStack
                        spacing={2}
                        alignItems="center"
                        direction="column"
                      >
                        {' '}
                        {/* Aligned better with icon above text */}
                        <Icon as={Users} color="purple.300" boxSize={5} />{' '}
                        {/* Opponent icon color */}
                        <Text color="whiteAlpha.800" fontSize="sm">
                          {t('Opponent Team')}
                        </Text>
                      </HStack>
                    </HStack>
                  </VStack>
                )}
              </VStack>
            </Box>
          )}
          {/* Instructions Text */}
          <Box w="100%" textAlign="center" pt={3} pb={1}>
            {' '}
            {/* Adjusted padding */}
            <Text color="whiteAlpha.600" fontSize="xs">
              {t(
                'Click "Enter Battle" to join your team and select your category',
              )}
            </Text>
          </Box>
        </VStack>
      )
    }

    if (inMatchmaking) {
      const badgeInfo = getBadgeInfo()
      // ... (rest of the existing "inMatchmaking" UI, ensure it's not affected negatively)
      return (
        <VStack spacing={6} align="center">
          {/* Animated Matchmaking Status */}
          <MotionFlex
            justify="center"
            align="center"
            w="120px"
            h="120px"
            borderRadius="full"
            bg="rgba(66, 153, 225, 0.1)"
            border="2px solid"
            borderColor="blue.400"
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
              animation: `${pulsing} 2s infinite`, // This was a different pulsing, maybe keep original or remove if redundant with boxShadow
            }}
          >
            <MotionBox
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            >
              <Icon as={Globe} color="blue.400" boxSize={12} />
            </MotionBox>
            <MotionBox
              position="absolute"
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
            >
              <Icon as={Search} color="blue.200" boxSize={6} opacity={0.7} />
            </MotionBox>
          </MotionFlex>

          {/* Matchmaking Type Badge */}
          <Tooltip label={badgeInfo.tooltip} hasArrow placement="top">
            <MotionBadge
              colorScheme={badgeInfo.color}
              px={3}
              py={2}
              borderRadius="full"
              fontSize="sm"
              display="flex"
              alignItems="center"
              animate={{
                y: [0, -2, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
            >
              <Icon as={badgeInfo.icon} mr={2} boxSize={4} />
              {badgeInfo.text}
              {joinType !== 'regular' && (
                <Icon as={Info} ml={2} boxSize={3} opacity={0.7} />
              )}
            </MotionBadge>
          </Tooltip>

          {/* Auto-team formation info */}
          {joinType === 'sourceTeam' && originalTeam && (
            <Box
              bg="rgba(121, 80, 242, 0.1)"
              borderWidth="1px"
              borderColor="purple.500"
              borderRadius="md"
              p={3}
              mx={4} // Ensure this doesn't cause overflow if modal is narrower
              w={{ base: '95%', md: '90%' }}
            >
              <HStack mb={1}>
                <Icon as={Info} color="purple.300" boxSize={4} />
                <Text color="white" fontWeight="bold" fontSize="sm">
                  {t('Auto-Team Formation')}
                </Text>
              </HStack>
              <Text color="whiteAlpha.800" fontSize="sm">
                {t(
                  'Your team "{{originalTeam}}" has been merged with other players to form a 4v4 battle team.',
                  { originalTeam: originalTeam.name || t('Original Team') },
                )}
              </Text>
            </Box>
          )}

          {joinType === 'solo' && matchmakingType === 'team' && (
            <Box
              bg="rgba(49, 151, 149, 0.1)"
              borderWidth="1px"
              borderColor="teal.500"
              borderRadius="md"
              p={3}
              mx={4} // Ensure this doesn't cause overflow
              w={{ base: '95%', md: '90%' }}
            >
              <HStack mb={1}>
                <Icon as={Info} color="teal.300" boxSize={4} />
                <Text color="white" fontWeight="bold" fontSize="sm">
                  {t('Auto-Team Formation')}
                </Text>
              </HStack>
              <Text color="whiteAlpha.800" fontSize="sm">
                {t(
                  'You joined individually and have been assigned to a team with other players for a 4v4 battle.',
                )}
              </Text>
            </Box>
          )}

          {/* Main Status */}
          <VStack spacing={3} align="center">
            <Text color="white" fontSize="2xl" fontWeight="bold">
              {t('Finding Your 4v4 Battle')}
            </Text>
            <Text
              color="whiteAlpha.700"
              fontSize="md"
              textAlign="center"
              px={{ base: 2, md: 4 }}
            >
              {t('We are matching you with players of similar skill level...')}
            </Text>
          </VStack>

          <Divider borderColor="whiteAlpha.300" w="80%" />

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
                <Icon as={Clock} color="blue.300" boxSize={4} />
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
                colorScheme="blue"
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
                {t('Searching')}
              </MotionBadge>
            </VStack>
          </HStack>

          {/* Status Updates Box */}
          {statusUpdates.length > 0 && (
            <Box
              w={{ base: '95%', md: '90%' }}
              bg="rgba(0, 0, 0, 0.3)"
              borderRadius="md"
              p={3}
              borderWidth="1px"
              borderColor="whiteAlpha.200"
            >
              <Text color="whiteAlpha.600" fontSize="xs" mb={2}>
                {t('Recent Updates')}
              </Text>
              <VStack spacing={1} align="stretch" maxH="100px" overflowY="auto">
                <AnimatePresence>
                  {statusUpdates.map(update => (
                    <MotionBox
                      key={update.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <HStack justify="space-between">
                        <Text
                          color="whiteAlpha.900"
                          fontSize="sm"
                          noOfLines={1}
                        >
                          {update.message}
                        </Text>
                        <Text
                          color="whiteAlpha.500"
                          fontSize="xs"
                          fontFamily="mono"
                        >
                          {update.time}s
                        </Text>
                      </HStack>
                    </MotionBox>
                  ))}
                </AnimatePresence>
              </VStack>
            </Box>
          )}

          {/* Info */}
          <Box w="100%" pt={4}>
            <Text
              color="whiteAlpha.600"
              fontSize="sm"
              textAlign="center"
              px={{ base: 2, md: 4 }}
            >
              {t(
                'You can close this modal and continue using the app. We will notify you when your battle is ready.',
              )}
            </Text>
          </Box>
        </VStack>
      )
    }

    // Default: Not in matchmaking, selection screen
    return (
      <VStack spacing={6} align="stretch">
        {/* Header */}
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
          <Text
            color="whiteAlpha.700"
            textAlign="center"
            px={{ base: 2, md: 4 }}
          >
            {t(
              "Choose to join with your team or as an individual player. We'll handle the rest!",
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

        {/* How it works */}
        <Box bg="rgba(255, 255, 255, 0.05)" p={4} borderRadius="md">
          {' '}
          {/* Slightly lighter dark bg */}
          <HStack mb={2}>
            <Icon as={Shield} color="blue.400" boxSize={5} />
            <Text color="white" fontWeight="bold">
              {t('How It Works')}
            </Text>
          </HStack>
          <VStack spacing={2} align="start">
            {[1, 2, 3, 4].map(
              (
                step, // Simplified mapping for steps
              ) => (
                <HStack key={step}>
                  <Box
                    w="20px"
                    h="20px"
                    bg="blue.400"
                    borderRadius="full"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Text color="white" fontSize="xs" fontWeight="bold">
                      {step}
                    </Text>
                  </Box>
                  <Text color="whiteAlpha.800" fontSize="sm">
                    {step === 1 &&
                      t(
                        'We find 3 other players or complete your team to 4 members',
                      )}
                    {step === 2 &&
                      t(
                        'We match your team with another team of similar skill',
                      )}
                    {step === 3 &&
                      t(
                        'Each player battles in one of four different categories',
                      )}
                    {step === 4 &&
                      t("Win trophies based on your team's performance!")}
                  </Text>
                </HStack>
              ),
            )}
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
        size="lg" // Can be 'md' if content fits better
        isCentered
        // Prevent closing if in matchmaking and not battle ready, or if battle is creating
        closeOnOverlayClick={
          !(inMatchmaking && !battleReady) &&
          battleCreationStatus !== 'creating'
        }
      >
        <ModalOverlay backdropFilter="blur(3px)" bg="rgba(0, 0, 0, 0.7)" />
        <ModalContent
          bg={bgColor} // Main modal dark background
          borderRadius="xl"
          borderWidth="1px"
          // Dynamic border color based on state
          borderColor={
            battleReady
              ? 'green.500'
              : inMatchmaking
              ? 'blue.500' // Changed from green to blue for "searching" state
              : borderColor // Default purple
          }
          boxShadow={`0 0 20px rgba(${
            battleReady
              ? '72, 187, 120, 0.5' // Green glow for ready
              : inMatchmaking
              ? '66, 153, 225, 0.5' // Blue glow for searching
              : '128, 90, 213, 0.4' // Purple glow default
          })`}
        >
          <ModalHeader
            color={textColor}
            borderBottomWidth="1px"
            borderColor="whiteAlpha.200"
          >
            <HStack>
              <Icon
                as={battleReady ? Zap : inMatchmaking ? Activity : Users}
                color={
                  battleReady
                    ? 'green.400'
                    : inMatchmaking
                    ? 'blue.400'
                    : 'blue.400'
                }
                boxSize={5}
              />
              <Text>
                {battleReady
                  ? t('Battle Ready!')
                  : inMatchmaking
                  ? t('4v4 Matchmaking Active')
                  : t('Join 4v4 Matchmaking')}
              </Text>
              {inMatchmaking &&
                !battleReady && ( // Show "Finding Battle" only when actively searching
                  <Badge colorScheme="blue" ml={2}>
                    {t('Finding Battle')}
                  </Badge>
                )}
              {/* Removed the redundant "Finding Battle" badge if battle is ready */}
            </HStack>
          </ModalHeader>
          {/* Allow closing unless battle is creating */}
          <ModalCloseButton
            color={textColor}
            isDisabled={battleCreationStatus === 'creating'}
          />

          <ModalBody py={6} px={{ base: 4, md: 6 }}>
            {' '}
            {/* Added responsive padding */}
            {renderModalContent()}
          </ModalBody>

          <ModalFooter borderTopWidth="1px" borderColor="whiteAlpha.200">
            {battleCreationStatus === 'creating' ? (
              <Text
                color="whiteAlpha.700"
                fontSize="sm"
                textAlign="center"
                w="100%"
              >
                {t('Please wait while your battle is being created...')}
              </Text>
            ) : battleCreationStatus === 'failed' ? (
              <>
                <Button
                  variant="ghost"
                  mr={3}
                  onClick={() => {
                    clearBattleCreationError()
                    closeModal()
                  }}
                  color="whiteAlpha.800"
                  _hover={{ bg: 'whiteAlpha.100' }}
                >
                  {t('Close')}
                </Button>
                <Button
                  colorScheme="blue"
                  onClick={() => {
                    clearBattleCreationError()
                    handleJoinMatchmaking() // Re-initiates the join process
                  }}
                  leftIcon={<Icon as={RefreshCw} />}
                >
                  {t('Try Again')}
                </Button>
              </>
            ) : battleReady ? (
              <Button
                colorScheme="green"
                size="lg"
                leftIcon={<Icon as={Zap} />} // Zap icon for entering battle
                onClick={enterBattle}
                w="100%"
                fontSize="lg"
                py={6}
                bgGradient="linear(to-r, green.500, teal.500)"
                _hover={{
                  bgGradient: 'linear(to-r, green.400, teal.400)',
                  transform: 'translateY(-2px)',
                }}
                _active={{
                  bgGradient: 'linear(to-r, green.600, teal.600)',
                }}
                as={motion.button} // Use MotionButton for animations
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                animate={{
                  // Pulsing shadow for emphasis
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
            ) : inMatchmaking ? (
              // Leave Queue button
              <Button
                colorScheme="red"
                variant="outline"
                onClick={handleLeaveMatchmaking}
                isLoading={loading}
                loadingText={t('Leaving...')}
                leftIcon={<Icon as={X} />}
                _hover={{ bg: 'rgba(229, 62, 62, 0.1)' }} // More subtle hover for outline
              >
                {t('Leave Queue')}
              </Button>
            ) : (
              // Join options
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
