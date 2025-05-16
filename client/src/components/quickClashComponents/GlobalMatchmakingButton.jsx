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
  useColorModeValue,
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
  Zap,
  Shield,
  Target,
  Trophy,
  UserPlus,
  RefreshCw,
  User,
  Info,
  Sword,
  Globe,
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
  const bgColor = 'rgba(26, 21, 39, 0.95)'
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
  } = useQuickClashGlobalMatchmaking()

  // Fetch user's teams
  const fetchMyTeams = useCallback(async () => {
    try {
      setLoadingTeams(true)
      const response = await axios.get('/api/quickClash/teams')
      setMyTeams(response.data.teams || [])
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
  }, [user])

  // Setup HTTP polling for matchmaking status when in matchmaking
  useEffect(() => {
    if (inMatchmaking && isModalOpen) {
      // Start polling every 15 seconds - use the polling-specific function
      const startPolling = () => {
        pollingIntervalRef.current = setInterval(async () => {
          try {
            // Use polling function that doesn't update Redux state
            const statusData = await pollMatchmakingStatus()

            // Process the status data to create informative updates
            if (statusData) {
              let updateMessage = t('Checking for updates...')

              // CRITICAL FIX: Check if battle is ready
              if (statusData.status === 'battleReady') {
                console.log(
                  'Battle ready detected via HTTP polling:',
                  statusData,
                )

                // Set battle ready state in Redux
                dispatch(
                  setBattleReady({
                    battleId: statusData.battleId,
                    teamId: statusData.teamId,
                    teamA: statusData.teamA,
                    teamB: statusData.teamB,
                  }),
                )

                // Stop polling since battle is ready
                if (pollingIntervalRef.current) {
                  clearInterval(pollingIntervalRef.current)
                  pollingIntervalRef.current = null
                }

                // Add final status update
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

                return // Exit early since battle is ready
              }

              // Interpret other status data to create meaningful messages
              if (statusData.status === 'searching_players') {
                updateMessage = t(
                  'Searching for players with similar skill level...',
                )
              } else if (statusData.status === 'forming_team') {
                updateMessage = t('Found players! Forming your team...')
              } else if (statusData.status === 'team_completed') {
                updateMessage = t(
                  'Team formed successfully! Looking for opponents...',
                )
              } else if (statusData.status === 'matching_teams') {
                updateMessage = t(
                  'Finding an opponent team to battle against...',
                )
              } else if (statusData.status === 'preparing_battle') {
                updateMessage = t(
                  'Match found! Setting up your battle arena...',
                )
              } else if (statusData.teamMembersCount) {
                updateMessage = t('Team has {{count}} of 4 players', {
                  count: statusData.teamMembersCount,
                })
              } else if (statusData.soloPlayersInQueue) {
                updateMessage = t('{{count}} players searching globally', {
                  count: statusData.soloPlayersInQueue,
                })
              } else if (statusData.status === 'team_formation_in_progress') {
                updateMessage = t(
                  'Your team is being merged with other players...',
                )
              } else if (statusData.status === 'matching_teams') {
                updateMessage = t('Looking for an opponent team to battle...')
              }

              // Add the status update
              const timeElapsed = Math.floor(
                (Date.now() - mountTimeRef.current) / 1000,
              )
              setStatusUpdates(prev => [
                {
                  id: Date.now(),
                  message: updateMessage,
                  time: timeElapsed,
                },
                ...prev.slice(0, 2), // Keep only the last 3 updates
              ])
            } else {
              // Fallback message if no detailed status available
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

            // Add error status update
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
        }, 15000) // 15 second polling
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
    setBattleReady,
  ])

  // Socket listeners for team events (keep existing ones)
  useEffect(() => {
    const socket = getSocket()
    if (!socket) return

    // Team left matchmaking notification
    socket.on('quickClash:teamLeftMatchmaking', data => {
      console.log('Received teamLeftMatchmaking event:', data)

      if (data.reason === 'memberLeft' && data.memberName) {
        toast({
          title: t('Team Left Matchmaking'),
          description: t(
            '{{memberName}} left matchmaking. Your team has been removed from the queue.',
            { memberName: data.memberName },
          ),
          status: 'info',
          duration: 5000,
          isClosable: true,
        })
      } else {
        toast({
          title: t('Team Left Matchmaking'),
          description: t(
            'Your team has been removed from the matchmaking queue.',
          ),
          status: 'info',
          duration: 5000,
          isClosable: true,
        })
      }

      // Reset matchmaking state
      if (inMatchmaking) {
        dispatch(resetGlobalMatchmakingState())
        setStatusUpdates([])
        mountTimeRef.current = Date.now()
      }
    })

    // Team returned to matchmaking
    socket.on('quickClash:teamReturnedToMatchmaking', data => {
      console.log('Received teamReturnedToMatchmaking event:', data)
      if (user?._id) {
        checkMatchmakingStatus()
        fetchMyTeams()

        // Add status update
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

    // Team joined matchmaking
    socket.on('quickClash:teamJoinedMatchmaking', data => {
      console.log('Received teamJoinedMatchmaking event:', data)
      if (user?._id) {
        // Update Redux state based on socket data
        const userIsInThisTeam =
          data.teamMembers &&
          data.teamMembers.some(member => member.userId === user._id)

        if (userIsInThisTeam || data.teamId === selectedTeamId) {
          dispatch(setSelectedTeamId(data.teamId))
          dispatch(setTeamName(data.teamName || 'Team'))

          let joinType = 'regular'
          let effectiveMatchmakingType = 'team'

          if (data.isAutoFormed) {
            const currentUserMember = data.teamMembers?.find(
              member => member.userId === user._id,
            )

            if (currentUserMember) {
              if (currentUserMember.sourceTeam) {
                joinType = 'sourceTeam'
                if (currentUserMember.originalTeam) {
                  dispatch(setOriginalTeam(currentUserMember.originalTeam))
                }
              } else {
                joinType = 'solo'
                effectiveMatchmakingType = 'solo'
              }
            }
          }

          dispatch(setJoinType(joinType))
          dispatch(
            updateMatchmakingState({
              inMatchmaking: true,
              matchmakingType: effectiveMatchmakingType,
              teamName:
                joinType === 'sourceTeam' && data.originalTeam
                  ? data.originalTeam.name
                  : data.teamName,
              joinType: joinType,
              originalTeam:
                joinType === 'sourceTeam' ? data.originalTeam : null,
            }),
          )
        }

        fetchMyTeams()

        // Add status update
        setStatusUpdates(prev => [
          {
            id: Date.now(),
            message: t('Team joined matchmaking successfully'),
            time: Math.floor((Date.now() - mountTimeRef.current) / 1000),
          },
          ...prev.slice(0, 2),
        ])

        toast({
          title: t('Team Joined Matchmaking'),
          description: t(
            'Your team has successfully joined the matchmaking queue.',
          ),
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
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
    fetchMyTeams()
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
          if (teamResponse.data && teamResponse.data.team) {
            const teamName = teamResponse.data.team.name || 'Team'
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

      // Don't close modal, keep it open to show progress
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
    try {
      await leaveMatchmaking()
      setStatusUpdates([])
      closeModal()
    } catch (error) {
      console.error('Error leaving matchmaking:', error)
    }
  }

  // Render team selection
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
        {/* Solo option */}
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
              <Badge colorScheme="blue">{team.members.length}/4</Badge>
            </HStack>
          </MotionBox>
        ))}
      </VStack>
    )
  }

  // Get badge info for matchmaking type
  const getBadgeInfo = () => {
    if (joinType === 'solo' && matchmakingType === 'solo') {
      return {
        icon: User,
        color: 'blue',
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
      return {
        icon: Users,
        color: 'purple',
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

    return {
      icon: Users,
      color: 'blue',
      text:
        matchmakingType === 'team'
          ? teamName || t('Team Member')
          : t('Solo Player'),
      tooltip: t('Matchmaking information'),
    }
  }

  // Render the matchmaking button
  const renderButton = () => {
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
      >
        {t('Join 4v4 Matchmaking')}
      </MotionButton>
    )
  }

  // Render modal content
  const renderModalContent = () => {
    // If battle is ready, show the battle ready UI
    if (battleReady) {
      const badgeInfo = getBadgeInfo()

      return (
        <VStack spacing={6} align="center">
          {/* Battle Ready Animation */}
          <MotionFlex
            justify="center"
            align="center"
            w="120px"
            h="120px"
            borderRadius="full"
            bg="rgba(72, 187, 120, 0.1)"
            border="2px solid"
            borderColor="green.400"
            position="relative"
            animate={{
              scale: [1, 1.05, 1],
              boxShadow: [
                '0 0 0px rgba(72, 187, 120, 0.4)',
                '0 0 30px rgba(72, 187, 120, 0.8)',
                '0 0 0px rgba(72, 187, 120, 0.4)',
              ],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          >
            <Icon as={Zap} color="green.400" boxSize={16} />
            <MotionBox
              position="absolute"
              animate={{
                y: [0, -20, 0],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
            >
              <Icon as={Trophy} color="green.200" boxSize={8} />
            </MotionBox>
          </MotionFlex>

          {/* Battle Ready Status */}
          <VStack spacing={2} align="center">
            <Text color="green.400" fontSize="3xl" fontWeight="bold">
              {t('Battle Ready!')}
            </Text>
            <Text color="whiteAlpha.800" fontSize="lg" textAlign="center">
              {t('Your 4v4 team battle is ready to begin')}
            </Text>
          </VStack>

          {/* Matchmaking Type Badge */}
          <Tooltip label={badgeInfo.tooltip} hasArrow placement="top">
            <MotionBadge
              colorScheme={badgeInfo.color}
              px={4}
              py={2}
              borderRadius="full"
              fontSize="md"
              display="flex"
              alignItems="center"
              animate={{
                y: [0, -3, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
            >
              <Icon as={badgeInfo.icon} mr={2} boxSize={5} />
              {badgeInfo.text}
            </MotionBadge>
          </Tooltip>

          {/* Battle Information */}
          {battleReady && (
            <Box
              w="100%"
              bg="rgba(72, 187, 120, 0.1)"
              borderRadius="md"
              p={4}
              borderWidth="1px"
              borderColor="green.500"
            >
              <VStack spacing={3}>
                <HStack justify="space-between" w="100%">
                  <Text color="whiteAlpha.700" fontSize="sm">
                    {t('Total Time in Queue')}
                  </Text>
                  <Text color="white" fontWeight="bold" fontFamily="mono">
                    {formatMatchmakingTime(matchmakingTime)}
                  </Text>
                </HStack>

                {battleReady.teamA && battleReady.teamB && (
                  <VStack spacing={2} w="100%">
                    <Text color="green.400" fontWeight="bold" fontSize="sm">
                      {t('Match Details')}
                    </Text>
                    <HStack justify="space-between" w="100%">
                      <HStack>
                        <Icon as={Users} color="blue.400" boxSize={4} />
                        <Text color="whiteAlpha.800" fontSize="sm">
                          {t('Your Team')}
                        </Text>
                      </HStack>
                      <Text color="white" fontSize="sm">
                        vs
                      </Text>
                      <HStack>
                        <Icon as={Users} color="purple.400" boxSize={4} />
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

          {/* Instructions */}
          <Box w="100%" textAlign="center">
            <Text color="whiteAlpha.600" fontSize="sm">
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

      return (
        <VStack spacing={6} align="center">
          {/* Rest of the existing matchmaking UI... */}
          {/* (Keep the existing matchmaking content as is) */}

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
              animation: `${pulsing} 2s infinite`,
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
              mx={4}
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
              mx={4}
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
            <Text color="whiteAlpha.700" fontSize="md" textAlign="center">
              {t('We are matching you with players of similar skill level...')}
            </Text>
          </VStack>

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
              w="100%"
              bg="rgba(0, 0, 0, 0.3)"
              borderRadius="md"
              p={3}
              borderWidth="1px"
              borderColor="whiteAlpha.200"
            >
              <Text color="whiteAlpha.600" fontSize="xs" mb={2}>
                {t('Recent Updates')}
              </Text>
              <VStack spacing={1} align="stretch">
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
                        <Text color="whiteAlpha.900" fontSize="sm">
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
            <Text color="whiteAlpha.600" fontSize="sm" textAlign="center">
              {t(
                'You can close this modal and continue using the app. We will notify you when your battle is ready.',
              )}
            </Text>
          </Box>
        </VStack>
      )
    }

    // Rest of the function (not in matchmaking case) remains the same...
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
          <Text color="whiteAlpha.700" textAlign="center">
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
        <Box bg="whiteAlpha.100" p={4} borderRadius="md">
          <HStack mb={2}>
            <Icon as={Shield} color="blue.400" boxSize={5} />
            <Text color="white" fontWeight="bold">
              {t('How It Works')}
            </Text>
          </HStack>
          <VStack spacing={2} align="start">
            <HStack>
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
                  1
                </Text>
              </Box>
              <Text color="whiteAlpha.800" fontSize="sm">
                {t(
                  'We find 3 other players or complete your team to 4 members',
                )}
              </Text>
            </HStack>
            <HStack>
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
                  2
                </Text>
              </Box>
              <Text color="whiteAlpha.800" fontSize="sm">
                {t('We match your team with another team of similar skill')}
              </Text>
            </HStack>
            <HStack>
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
                  3
                </Text>
              </Box>
              <Text color="whiteAlpha.800" fontSize="sm">
                {t('Each player battles in one of four different categories')}
              </Text>
            </HStack>
            <HStack>
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
                  4
                </Text>
              </Box>
              <Text color="whiteAlpha.800" fontSize="sm">
                {t("Win trophies based on your team's performance!")}
              </Text>
            </HStack>
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
          bg={bgColor}
          borderRadius="xl"
          borderWidth="1px"
          borderColor={inMatchmaking ? 'green.500' : borderColor}
          boxShadow={`0 0 20px rgba(${
            inMatchmaking ? '72, 187, 120, 0.4' : '66, 153, 225, 0.4'
          })`}
        >
          <ModalHeader
            color={textColor}
            borderBottomWidth="1px"
            borderColor="whiteAlpha.200"
          >
            <HStack>
              <Icon
                as={inMatchmaking ? Activity : Users}
                color={inMatchmaking ? 'green.400' : 'blue.400'}
                boxSize={5}
              />
              <Text>
                {inMatchmaking
                  ? t('4v4 Matchmaking Active')
                  : t('Join 4v4 Matchmaking')}
              </Text>
              {inMatchmaking && (
                <Badge colorScheme="green" ml={2}>
                  {t('Finding Battle')}
                </Badge>
              )}
            </HStack>
          </ModalHeader>
          <ModalCloseButton color={textColor} />

          <ModalBody py={6}>{renderModalContent()}</ModalBody>

          <ModalFooter borderTopWidth="1px" borderColor="whiteAlpha.200">
            {battleReady ? (
              // Battle is ready - show Enter Battle button
              <Button
                colorScheme="green"
                size="lg"
                leftIcon={<Icon as={Zap} />}
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
                as={motion.button}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
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
            ) : inMatchmaking ? (
              // Currently in matchmaking - show Leave Queue button
              <Button
                colorScheme="red"
                variant="outline"
                onClick={handleLeaveMatchmaking}
                isLoading={loading}
                loadingText={t('Leaving...')}
                leftIcon={<Icon as={X} />}
                _hover={{ bg: 'red.900' }}
              >
                {t('Leave Queue')}
              </Button>
            ) : (
              // Not in matchmaking - show Join/Cancel buttons
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
