// components/quickClashComponents/globalmatchmaking/GlobalMatchmakingModal.jsx
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  HStack,
  Text,
  Badge,
  Button,
  Icon,
  useToast,
} from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { Users, Activity, Zap, RefreshCw, X } from 'lucide-react'
import axios from 'axios'

// Import custom hook and actions
import useQuickClashGlobalMatchmaking from '../../../customHooks/useQuickClashGlobalMatchmaking'
import {
  resetGlobalMatchmakingState,
  setBattleReady,
  handleBattleCreationCleanup as handleBattleCreationCleanupAction,
  clearBattleCreationState,
  addStatusUpdate,
  clearStatusUpdates,
  setShouldRefetchTeams,
  setToastNotification,
  clearToastNotification,
} from '../../../redux/quickClashGlobalMatchmakingSlice'

// Import sub-components
import MatchmakingStatusDisplay from './components/MatchmakingStatusDisplay'
import TeamSelectionPanel from './components/TeamSelectionPanel'

/**
 * Main modal component that handles all matchmaking logic and state
 */
const GlobalMatchmakingModal = React.memo(
  ({ isOpen, onClose, isEmbedded = false }) => {
    const { t } = useTranslation('QuickClash')
    const { user } = useSelector(state => state.auth)
    const toast = useToast()
    const dispatch = useDispatch()

    const [myTeams, setMyTeams] = useState([])
    const [loadingTeams, setLoadingTeams] = useState(false)

    const pollingIntervalRef = useRef(null)
    const mountTimeRef = useRef(Date.now())

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
      statusUpdates, // Now from Redux
      shouldRefetchTeams, // Now from Redux
      showToast, // Now from Redux

      // Actions
      checkMatchmakingStatus,
      pollMatchmakingStatus,
      joinSoloMatchmaking,
      joinWithTeam,
      leaveMatchmaking,
      selectTeam,
      enterBattle,
      clearBattleReady,
      formatMatchmakingTime,
      checkCanLeaveMatchmaking,
      retryAfterFailure,
    } = useQuickClashGlobalMatchmaking()

    // Handle toast notifications from Redux
    useEffect(() => {
      if (showToast) {
        toast({
          title: t(showToast.title),
          description: t(showToast.description),
          status: showToast.type,
          duration: 3000,
          isClosable: true,
        })

        // Clear the toast notification
        dispatch(clearToastNotification())
      }
    }, [showToast, toast, t, dispatch])

    // Handle team refetching from Redux
    useEffect(() => {
      if (shouldRefetchTeams) {
        fetchMyTeams()
        dispatch(setShouldRefetchTeams(false))
      }
    }, [shouldRefetchTeams, dispatch])

    // Fetch user's teams
    const fetchMyTeams = useCallback(async () => {
      if (!user?._id) return
      try {
        setLoadingTeams(true)
        const response = await axios.get('/api/quickClash/teams')
        setMyTeams(response.data?.teams || [])
      } catch (error) {
        console.error('Error fetching teams:', error)
        toast({
          title: t('Error Fetching Teams'),
          description: error.message,
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
      } finally {
        setLoadingTeams(false)
      }
    }, [user?._id, t, toast])

    useEffect(() => {
      if (isOpen) {
        mountTimeRef.current = Date.now()
        dispatch(clearStatusUpdates())
        checkMatchmakingStatus()
        fetchMyTeams()
      }
    }, [isOpen, user, checkMatchmakingStatus, fetchMyTeams, dispatch])

    useEffect(() => {
      if (inMatchmaking && isOpen) {
        const startPolling = () => {
          pollingIntervalRef.current = setInterval(async () => {
            try {
              const statusData = await pollMatchmakingStatus()
              if (statusData?.status === 'battleReady') {
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
                dispatch(
                  addStatusUpdate({
                    message: t(
                      'Battle is ready! You can now enter the battle.',
                    ),
                    time: timeElapsed,
                  }),
                )
                return
              }

              // Add status update based on current status
              let updateMessage = t('Checking for updates...')
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

              const timeElapsed = Math.floor(
                (Date.now() - mountTimeRef.current) / 1000,
              )
              dispatch(
                addStatusUpdate({
                  message: updateMessage,
                  time: timeElapsed,
                }),
              )
            } catch (error) {
              console.error('Error polling matchmaking status:', error)
              const timeElapsed = Math.floor(
                (Date.now() - mountTimeRef.current) / 1000,
              )
              dispatch(
                addStatusUpdate({
                  message: t('Connection issue, retrying...'),
                  time: timeElapsed,
                }),
              )
            }
          }, 15000)
        }

        pollingIntervalRef.current = setInterval(pollMatchmakingStatus, 15000)
        return () => {
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current)
            pollingIntervalRef.current = null
          }
        }
      }
    }, [inMatchmaking, isOpen, pollMatchmakingStatus, t, dispatch])

    const handleJoinMatchmaking = useCallback(async () => {
      try {
        mountTimeRef.current = Date.now()
        dispatch(
          addStatusUpdate({
            message: t('Joining matchmaking...'),
            time: 0,
          }),
        )

        if (selectedTeamId) {
          await joinWithTeam(selectedTeamId)
        } else {
          await joinSoloMatchmaking()
        }

        dispatch(
          addStatusUpdate({
            message: t('Successfully joined matchmaking'),
            time: Math.floor((Date.now() - mountTimeRef.current) / 1000),
          }),
        )
      } catch (error) {
        toast({
          title: t('Error Joining Matchmaking'),
          description:
            error || t('Failed to join matchmaking. Please try again.'),
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
        console.error('Error joining matchmaking:', error)
        dispatch(
          addStatusUpdate({
            message: t('Failed to join matchmaking'),
            time: Math.floor((Date.now() - mountTimeRef.current) / 1000),
          }),
        )
      }
    }, [selectedTeamId, joinWithTeam, joinSoloMatchmaking, t, toast, dispatch])

    const handleLeaveMatchmaking = useCallback(async () => {
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
      try {
        await leaveMatchmaking()
        dispatch(clearStatusUpdates())
        onClose()
      } catch (error) {
        console.error('Error leaving matchmaking:', error)
      }
    }, [
      checkCanLeaveMatchmaking,
      leaveMatchmaking,
      onClose,
      toast,
      t,
      dispatch,
    ])

    // Handle retry after failure
    const handleRetryAfterFailure = useCallback(async () => {
      try {
        if (retryAfterFailure) {
          await retryAfterFailure()
        } else {
          // Fallback if retryAfterFailure is not available
          dispatch(clearBattleCreationState())
        }

        dispatch(clearStatusUpdates())
        mountTimeRef.current = Date.now()

        toast({
          title: t('Ready to Try Again'),
          description: t('You can now join matchmaking again.'),
          status: 'info',
          duration: 3000,
          isClosable: true,
        })
      } catch (error) {
        console.error('Error during retry:', error)
        toast({
          title: t('Error'),
          description: t('Please close and try again.'),
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
      }
    }, [retryAfterFailure, dispatch, toast, t])

    const handleClose = useCallback(() => {
      if (battleReady) clearBattleReady()
      if (battleCreationStatus === 'failed')
        dispatch(clearBattleCreationState())
      onClose()
    }, [battleReady, battleCreationStatus, clearBattleReady, dispatch, onClose])

    const modalStyles = useMemo(() => {
      const bgColor = 'rgba(26, 21, 39, 0.95)'
      let borderColor = 'purple.600'
      let glowColor = '128, 90, 213, 0.4'

      if (battleReady) {
        borderColor = 'green.500'
        glowColor = '72, 187, 120, 0.5'
      } else if (inMatchmaking) {
        borderColor = 'blue.500'
        glowColor = '66, 153, 225, 0.5'
      } else if (battleCreationStatus === 'failed') {
        borderColor = 'red.500'
        glowColor = '229, 62, 62, 0.5'
      }
      return {
        bg: bgColor,
        borderColor,
        boxShadow: `0 0 20px rgba(${glowColor})`,
      }
    }, [battleReady, inMatchmaking, battleCreationStatus])

    const content = (
      <>
        {!isEmbedded && (
          <ModalHeader
            color="white"
            borderBottomWidth="1px"
            borderColor="whiteAlpha.200"
          >
            <HStack>
              <Icon
                as={
                  battleReady
                    ? Zap
                    : battleCreationStatus === 'failed'
                    ? X
                    : inMatchmaking
                    ? Activity
                    : Users
                }
                color={
                  battleReady
                    ? 'green.400'
                    : battleCreationStatus === 'failed'
                    ? 'red.400'
                    : 'blue.400'
                }
                boxSize={5}
              />
              <Text>
                {battleReady
                  ? t('Battle Ready!')
                  : battleCreationStatus === 'failed'
                  ? t('Battle Creation Failed')
                  : inMatchmaking
                  ? t('4v4 Matchmaking Active')
                  : t('Join 4v4 Matchmaking')}
              </Text>
              {inMatchmaking &&
                !battleReady &&
                battleCreationStatus !== 'failed' && (
                  <Badge colorScheme="blue" ml={2}>
                    {t('Finding Battle')}
                  </Badge>
                )}
              {battleCreationStatus === 'failed' && (
                <Badge colorScheme="red" ml={2}>
                  {t('Error')}
                </Badge>
              )}
            </HStack>
          </ModalHeader>
        )}
        {!isEmbedded && <ModalCloseButton color="white" />}
        <ModalBody py={6} px={{ base: 4, md: 6 }}>
          <MatchmakingStatusDisplay
            inMatchmaking={inMatchmaking}
            battleReady={battleReady}
            battleCreationStatus={battleCreationStatus}
            battleCreationError={battleCreationError}
            matchmakingTime={matchmakingTime}
            teamName={teamName}
            joinType={joinType}
            originalTeam={originalTeam}
            statusUpdates={statusUpdates}
            formatMatchmakingTime={formatMatchmakingTime}
          />
          {!inMatchmaking &&
            !battleReady &&
            battleCreationStatus !== 'failed' && (
              <TeamSelectionPanel
                myTeams={myTeams}
                loadingTeams={loadingTeams}
                selectedTeamId={selectedTeamId}
                onSelectTeam={selectTeam}
              />
            )}
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
                onClick={handleClose}
                color="whiteAlpha.800"
                _hover={{ bg: 'whiteAlpha.100' }}
              >
                {t('Close')}
              </Button>
              <Button
                colorScheme="blue"
                onClick={handleRetryAfterFailure}
                leftIcon={<Icon as={RefreshCw} />}
                _hover={{
                  bgGradient: 'linear(to-r, blue.400, purple.400)',
                  transform: 'translateY(-1px)',
                }}
              >
                {t('Try Again')}
              </Button>
            </>
          ) : battleReady ? (
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
              transition="all 0.2s"
            >
              {t('Enter Battle')}
            </Button>
          ) : inMatchmaking ? (
            <Button
              colorScheme="red"
              variant="outline"
              onClick={handleLeaveMatchmaking}
              isLoading={loading}
              loadingText={t('Leaving...')}
              leftIcon={<Icon as={X} />}
              _hover={{ bg: 'rgba(229, 62, 62, 0.1)' }}
              borderColor="red.500"
              color="red.300"
            >
              {t('Leave Queue')}
            </Button>
          ) : (
            <>
              <Button
                variant="ghost"
                mr={3}
                onClick={handleClose}
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
                leftIcon={<Icon as={Users} />}
                bgGradient="linear(to-r, blue.500, purple.500)"
                _hover={{
                  bgGradient: 'linear(to-r, blue.400, purple.400)',
                  transform: 'translateY(-1px)',
                }}
                transition="all 0.2s"
              >
                {selectedTeamId ? t('Join with Team') : t('Join Individually')}
              </Button>
            </>
          )}
        </ModalFooter>
      </>
    )

    if (isEmbedded) return content

    return (
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        size="lg"
        isCentered
        closeOnOverlayClick={
          !(inMatchmaking && !battleReady) &&
          battleCreationStatus !== 'creating'
        }
      >
        <ModalOverlay backdropFilter="blur(3px)" bg="rgba(0, 0, 0, 0.7)" />
        <ModalContent {...modalStyles} borderRadius="xl" borderWidth="1px">
          {content}
        </ModalContent>
      </Modal>
    )
  },
)

GlobalMatchmakingModal.displayName = 'GlobalMatchmakingModal'

export default GlobalMatchmakingModal
