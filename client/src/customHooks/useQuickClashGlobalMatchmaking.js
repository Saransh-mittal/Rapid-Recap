// customHooks/useQuickClashGlobalMatchmaking.js
import { useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useToast } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { useSocket } from './useSocket'
import {
  joinGlobalMatchmaking,
  leaveGlobalMatchmaking,
  getGlobalMatchmakingStatus,
  joinTeamMatchmaking,
  leaveTeamMatchmaking,
  getTeamMatchmakingStatus, // This was missing from imports in your provided slice but used in thunks
  setBattleReady,
  clearBattleReady,
  setSelectedTeamId,
  setSocketConnected,
  resetGlobalMatchmakingState,
  setTeamName,
  updateMatchmakingState,
  setJoinType,
  setOriginalTeam,
  setBattleCreationError,
  setBattleCreationStatus,
  clearBattleCreationError,
} from '../redux/quickClashGlobalMatchmakingSlice'
import axios from 'axios'

/**
 * Custom hook for managing the global matchmaking state with improved device-aware socket integration
 */
const useQuickClashGlobalMatchmaking = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const toast = useToast()
  const { t } = useTranslation('QuickClash')
  const {
    getSocket,
    emitWithDeviceContext,
    addEventListener,
    deviceFingerprint,
    isSocketReady,
  } = useSocket()

  const joinedTeamsRoom = useRef(false)
  const matchmakingStartTimeRef = useRef(null)
  const eventCleanupFunctions = useRef([])
  const { user } = useSelector(state => state.auth)

  const [localMatchmakingTime, setLocalMatchmakingTime] = useState(0)

  const globalMatchmakingState = useSelector(
    state => state.quickClashGlobalMatchmaking,
  )

  const timerRef = useRef(null)
  const pollingIntervalRef = useRef(null)
  const isComponentMountedRef = useRef(true)

  const [shouldPoll, setShouldPoll] = useState(false)

  useEffect(() => {
    isComponentMountedRef.current = true
    return () => {
      isComponentMountedRef.current = false
      if (timerRef.current) clearInterval(timerRef.current)
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current)
      cleanupSocketListeners()
    }
  }, [])

  // Enhanced socket listeners setup with device awareness
  const setupSocketListeners = useCallback(() => {
    if (!isSocketReady()) {
      console.warn('Socket not ready for global matchmaking listeners setup')
      return
    }

    // Clean up any existing listeners first
    cleanupSocketListeners()

    const cleanupFunctions = []

    // Join the teams room first to receive team battle events
    if (
      globalMatchmakingState.matchmakingType === 'team' &&
      !joinedTeamsRoom.current
    ) {
      emitWithDeviceContext('quickClash:joinTeamsRoom')
      joinedTeamsRoom.current = true
    }

    dispatch(setSocketConnected(true))

    // Battle ready notification
    const cleanupBattleReady = addEventListener(
      'quickClash:teamBattleReady',
      data => {
        if (!isComponentMountedRef.current) return
        console.log('Received teamBattleReady event:', data)
        dispatch(setBattleReady(data))
      },
    )
    cleanupFunctions.push(cleanupBattleReady)

    // Battle creation started
    const cleanupBattleCreationStarted = addEventListener(
      'quickClash:battleCreationStarted',
      data => {
        if (!isComponentMountedRef.current) return
        console.log('Battle creation started:', data)
        dispatch(setBattleCreationStatus('creating'))
      },
    )
    cleanupFunctions.push(cleanupBattleCreationStarted)

    // Battle creation failed
    const cleanupBattleCreationFailed = addEventListener(
      'quickClash:battleCreationFailed',
      data => {
        if (!isComponentMountedRef.current) return
        console.log('Battle creation failed:', data)
        dispatch(setBattleCreationError(data.error || 'Battle creation failed'))
        toast({
          title: t('Battle Creation Failed'),
          description: t('Something went wrong. Please try again.'),
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      },
    )
    cleanupFunctions.push(cleanupBattleCreationFailed)

    // Matchmaking locked
    const cleanupMatchmakingLocked = addEventListener(
      'quickClash:matchmakingLocked',
      data => {
        if (!isComponentMountedRef.current) return
        console.log('Matchmaking locked:', data)
        dispatch(setBattleCreationStatus('creating'))
      },
    )
    cleanupFunctions.push(cleanupMatchmakingLocked)

    // Team invitation received
    const cleanupTeamInvitationReceived = addEventListener(
      'quickClash:teamInvitationReceived',
      data => {
        if (!isComponentMountedRef.current) return
        toast({
          title: t('Team Invitation Received'),
          description: t(
            '{{inviterName}} has invited you to join their team "{{teamName}}". Check your inbox to accept or decline.',
            {
              inviterName: data.inviterName,
              teamName: data.teamName,
            },
          ),
          status: 'info',
          duration: 7000,
          isClosable: true,
        })
      },
    )
    cleanupFunctions.push(cleanupTeamInvitationReceived)

    // Team invitation accepted
    const cleanupTeamInvitationAccepted = addEventListener(
      'quickClash:teamInvitationAccepted',
      data => {
        if (!isComponentMountedRef.current) return
        if (data.userId === user?._id) {
          return
        } else {
          toast({
            title: t('A new member has joined!'),
            description: `${data.userName} (@${data.userInGameName}) has joined the team`,
            status: 'success',
            duration: 5000,
            isClosable: true,
            position: 'top',
          })
        }
      },
    )
    cleanupFunctions.push(cleanupTeamInvitationAccepted)

    // Team invitation rejected
    const cleanupTeamInvitationRejected = addEventListener(
      'quickClash:teamInvitationRejected',
      data => {
        if (!isComponentMountedRef.current) return
        if (data.userId === user?._id) {
          return
        } else {
          toast({
            title: t('Invitation Declined'),
            description: `${data.userName} (@${data.userInGameName}) has declined the invitation`,
            status: 'warning',
            duration: 5000,
            isClosable: true,
            position: 'top',
          })
        }
      },
    )
    cleanupFunctions.push(cleanupTeamInvitationRejected)

    // Team member joined
    const cleanupTeamMemberJoined = addEventListener(
      'quickClash:teamMemberJoined',
      data => {
        if (!isComponentMountedRef.current) return
        if (data.userId === user?._id) {
          return
        }
        toast({
          title: t('New Team Member'),
          description: `${data.userName} (@${data.userInGameName}) has joined your team`,
          status: 'info',
          duration: 3000,
          isClosable: true,
        })
      },
    )
    cleanupFunctions.push(cleanupTeamMemberJoined)

    // Team member left
    const cleanupTeamMemberLeft = addEventListener(
      'quickClash:teamMemberLeft',
      data => {
        if (!isComponentMountedRef.current) return
        if (data.userId === user?._id) {
          return
        }
        toast({
          title: t('Team Member Left'),
          description: `${data.userName} (@${data.userInGameName}) has left the team`,
          status: 'warning',
          duration: 3000,
          isClosable: true,
        })
      },
    )
    cleanupFunctions.push(cleanupTeamMemberLeft)

    // Team member removed
    const cleanupTeamMemberRemoved = addEventListener(
      'quickClash:teamMemberRemoved',
      data => {
        if (!isComponentMountedRef.current) return
        console.log('Team member removed:', data)
        if (data.removedMemberId === user?._id) {
          toast({
            title: `You have been removed from the team ${data.teamName}`,
            description: t('You can join another team or create your own.'),
            status: 'error',
            duration: 5000,
            isClosable: true,
            position: 'top',
          })
          return
        }
        toast({
          title: t('Team Member Removed'),
          description: `${data.removedMemberName} (@${data.removedMemberInGameName}) has been removed from the team`,
          status: 'warning',
          duration: 5000,
          isClosable: true,
          position: 'top',
        })
      },
    )
    cleanupFunctions.push(cleanupTeamMemberRemoved)

    // Store cleanup functions
    eventCleanupFunctions.current = cleanupFunctions

    return () => cleanupSocketListeners()
  }, [
    isSocketReady,
    emitWithDeviceContext,
    addEventListener,
    dispatch,
    toast,
    t,
    navigate,
    globalMatchmakingState.matchmakingType,
    user?._id,
  ])

  // Clean up socket listeners with device awareness
  const cleanupSocketListeners = useCallback(() => {
    // Clean up all registered event listeners
    eventCleanupFunctions.current.forEach(cleanup => {
      if (typeof cleanup === 'function') {
        cleanup()
      }
    })
    eventCleanupFunctions.current = []

    // Reset joined room flag
    joinedTeamsRoom.current = false
    dispatch(setSocketConnected(false))
  }, [dispatch])

  // Setup socket listeners when needed
  useEffect(() => {
    if (
      globalMatchmakingState.inMatchmaking ||
      globalMatchmakingState.matchmakingType === 'team'
    ) {
      setupSocketListeners()
    }

    return () => {
      cleanupSocketListeners()
    }
  }, [
    setupSocketListeners,
    cleanupSocketListeners,
    globalMatchmakingState.inMatchmaking,
    globalMatchmakingState.matchmakingType,
  ])

  useEffect(() => {
    if (
      globalMatchmakingState.inMatchmaking &&
      !globalMatchmakingState.battleReady
    ) {
      if (!timerRef.current) {
        if (!matchmakingStartTimeRef.current) {
          matchmakingStartTimeRef.current = Date.now()
          setLocalMatchmakingTime(0)
        }
        timerRef.current = setInterval(() => {
          if (!isComponentMountedRef.current) {
            clearInterval(timerRef.current)
            timerRef.current = null
            return
          }
          const elapsed = Math.floor(
            (Date.now() - matchmakingStartTimeRef.current) / 1000,
          )
          setLocalMatchmakingTime(elapsed)
        }, 1000)
      }
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      if (
        !globalMatchmakingState.inMatchmaking &&
        !globalMatchmakingState.battleReady
      ) {
        matchmakingStartTimeRef.current = null
        setLocalMatchmakingTime(0)
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [globalMatchmakingState.inMatchmaking, globalMatchmakingState.battleReady])

  const getDetailedMatchmakingStatusInternal = useCallback(
    async (teamId, type) => {
      if (!isComponentMountedRef.current) return null
      try {
        const endpoint =
          type === 'team' && teamId
            ? `/api/quickClash/team/${teamId}/matchmaking-status-detailed`
            : '/api/quickClash/global-matchmaking-status-detailed'
        const response = await axios.get(endpoint)
        return response.data || null
      } catch (error) {
        console.error('Error getting detailed matchmaking status:', error)
        return null
      }
    },
    [],
  )

  const pollMatchmakingStatus = useCallback(async () => {
    if (!isComponentMountedRef.current) return null
    const currentSelectedTeamId = globalMatchmakingState.selectedTeamId
    const currentMatchmakingType = globalMatchmakingState.matchmakingType

    try {
      let statusData = null
      if (currentMatchmakingType === 'team' && currentSelectedTeamId) {
        statusData = await getDetailedMatchmakingStatusInternal(
          currentSelectedTeamId,
          'team',
        )
        if (
          statusData?.isAutoFormed &&
          statusData?.status === 'team_formation_in_progress'
        ) {
          dispatch(setJoinType('sourceTeam'))
          if (statusData.originalTeam)
            dispatch(setOriginalTeam(statusData.originalTeam))
          dispatch(
            setTeamName(statusData.autoFormedTeam?.name || 'Auto-formed Team'),
          )
          if (statusData.autoFormedTeam?._id)
            dispatch(setSelectedTeamId(statusData.autoFormedTeam._id))
        }
      } else if (currentMatchmakingType === 'solo') {
        statusData = await getDetailedMatchmakingStatusInternal(null, 'solo')
      }
      return statusData
    } catch (error) {
      console.error('Error polling matchmaking status:', error)
      return null
    }
  }, [
    dispatch,
    globalMatchmakingState.selectedTeamId,
    globalMatchmakingState.matchmakingType,
    getDetailedMatchmakingStatusInternal,
  ])

  useEffect(() => {
    if (
      globalMatchmakingState.inMatchmaking &&
      shouldPoll &&
      !globalMatchmakingState.battleReady
    ) {
      const startPolling = () => {
        if (pollingIntervalRef.current)
          clearInterval(pollingIntervalRef.current)

        pollingIntervalRef.current = setInterval(async () => {
          if (
            !isComponentMountedRef.current ||
            !globalMatchmakingState.inMatchmaking ||
            globalMatchmakingState.battleReady
          ) {
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current)
              pollingIntervalRef.current = null
            }
            return
          }
          try {
            const statusData = await pollMatchmakingStatus()
            if (statusData?.status === 'battleReady') {
              console.log(
                'Battle ready detected via HTTP polling (hook):',
                statusData,
              )
              dispatch(
                setBattleReady({
                  battleId: statusData.battleId,
                  teamId: statusData.teamId,
                  teamA: statusData.teamA,
                  teamB: statusData.teamB,
                }),
              )
              if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current)
                pollingIntervalRef.current = null
              }
            }
          } catch (error) {
            console.error('Error in polling interval (hook):', error)
          }
        }, 15000)
      }
      startPolling()
    } else {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
        pollingIntervalRef.current = null
      }
    }
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
        pollingIntervalRef.current = null
      }
    }
  }, [
    globalMatchmakingState.inMatchmaking,
    globalMatchmakingState.battleReady,
    shouldPoll,
    pollMatchmakingStatus,
    dispatch,
  ])

  const checkCanLeaveMatchmaking = useCallback(async () => {
    try {
      const response = await axios.get('/api/quickClash/can-leave-matchmaking')
      return response.data.canLeave
    } catch (error) {
      console.error('Error checking if can leave matchmaking:', error)
      return true
    }
  }, [])

  const checkMatchmakingStatus = useCallback(
    async passedTeamId => {
      if (!isComponentMountedRef.current) return null
      console.log('[HOOK] checkMatchmakingStatus called.')
      try {
        const globalStatus = await dispatch(
          getGlobalMatchmakingStatus(),
        ).unwrap()
        let inAnyMatchmaking = false
        let statusDetailPayload = {}

        if (globalStatus.inMatchmaking && globalStatus.matchmaking?.team) {
          const teamId = passedTeamId || globalStatus.matchmaking.team
          inAnyMatchmaking = true
          try {
            const teamResponse = await axios.get(
              `/api/quickClash/team/${teamId}/matchmaking-info`,
            )
            if (teamResponse.data?.success) {
              const teamData = teamResponse.data.team
              const joinType = teamResponse.data.joinType || 'regular'
              const originalTeam = teamResponse.data.originalTeam

              statusDetailPayload = {
                inMatchmaking: true,
                matchmakingType: joinType === 'solo' ? 'solo' : 'team',
                selectedTeamId: teamId,
                teamName:
                  joinType === 'sourceTeam' && originalTeam
                    ? originalTeam.name
                    : teamData.name,
                joinType: joinType,
                originalTeam: originalTeam || null,
                step:
                  teamResponse.data.step ||
                  (teamResponse.data.battleReady ? 'battleReady' : 'searching'),
                battleReady: teamResponse.data.battleReady || null,
              }
            }
          } catch (teamError) {
            console.error('Error fetching matchmaking team info:', teamError)
          }
        } else if (globalStatus.inMatchmaking) {
          inAnyMatchmaking = true
          statusDetailPayload = {
            inMatchmaking: true,
            matchmakingType: 'solo',
            joinType: 'solo',
            step:
              globalStatus.step ||
              (globalStatus.battleReady ? 'battleReady' : 'searching'),
            battleReady: globalStatus.battleReady || null,
          }
        }

        if (!inAnyMatchmaking) {
          if (globalMatchmakingState.inMatchmaking) {
            dispatch(resetGlobalMatchmakingState())
          }
        } else if (Object.keys(statusDetailPayload).length > 0) {
          dispatch(updateMatchmakingState(statusDetailPayload))
        }

        setShouldPoll(inAnyMatchmaking && !statusDetailPayload.battleReady)
        return statusDetailPayload
      } catch (error) {
        console.error('Error in checkMatchmakingStatus:', error)
        setShouldPoll(false)
        return null
      }
    },
    [dispatch, globalMatchmakingState.inMatchmaking],
  )

  const joinSoloMatchmaking = useCallback(async () => {
    try {
      matchmakingStartTimeRef.current = Date.now()
      setLocalMatchmakingTime(0)
      const result = await dispatch(joinGlobalMatchmaking()).unwrap()
      setShouldPoll(true)
      toast({
        title: t('Joined 4v4 Matchmaking'),
        description: t('Looking for team members and opponents...'),
        status: 'info',
        duration: 3000,
        isClosable: true,
      })
      return result
    } catch (error) {
      console.error('Error joining solo matchmaking:', error)
      throw error
    }
  }, [dispatch, toast, t])

  const joinWithTeam = useCallback(
    async (teamId, teamName) => {
      if (!teamId) {
        throw new Error('Team ID is required')
      }
      try {
        matchmakingStartTimeRef.current = Date.now()
        setLocalMatchmakingTime(0)

        let currentTeamName = teamName
        if (!currentTeamName) {
          try {
            const teamResponse = await axios.get(
              `/api/quickClash/team/${teamId}`,
            )
            if (teamResponse.data?.team)
              currentTeamName = teamResponse.data.team.name || 'Team'
          } catch (e) {
            console.error('Error fetching team name for join', e)
          }
        }
        dispatch(setTeamName(currentTeamName || 'Team'))

        // Ensure we're in the teams socket room when joining team matchmaking
        if (isSocketReady() && !joinedTeamsRoom.current) {
          emitWithDeviceContext('quickClash:joinTeamsRoom')
          joinedTeamsRoom.current = true
        }

        const result = await dispatch(
          joinTeamMatchmaking({ teamId, teamName: currentTeamName }),
        ).unwrap()
        setShouldPoll(true)
        toast({
          title: t('Team Joined Matchmaking'),
          description: t('Looking for opponents...'),
          status: 'info',
          duration: 3000,
          isClosable: true,
        })
        return { ...result, teamName: currentTeamName }
      } catch (error) {
        console.error('Error joining with team:', error)
        throw error
      }
    },
    [dispatch, toast, t, isSocketReady, emitWithDeviceContext],
  )

  const leaveMatchmaking = useCallback(async () => {
    try {
      const canLeave = await checkCanLeaveMatchmaking()
      if (!canLeave) {
        throw new Error('Cannot leave matchmaking at this time')
      }
      matchmakingStartTimeRef.current = null
      setLocalMatchmakingTime(0)
      setShouldPoll(false)

      if (
        globalMatchmakingState.matchmakingType === 'team' &&
        globalMatchmakingState.selectedTeamId
      ) {
        await dispatch(
          leaveTeamMatchmaking(globalMatchmakingState.selectedTeamId),
        ).unwrap()
      } else {
        await dispatch(leaveGlobalMatchmaking()).unwrap()
      }
      toast({
        title: t('Left Matchmaking'),
        status: 'info',
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      console.error('Error leaving matchmaking:', error)
      throw error
    }
  }, [
    dispatch,
    toast,
    t,
    globalMatchmakingState.matchmakingType,
    globalMatchmakingState.selectedTeamId,
    checkCanLeaveMatchmaking,
  ])

  const selectTeam = useCallback(
    teamId => {
      dispatch(setSelectedTeamId(teamId))
      if (teamId && isSocketReady() && !joinedTeamsRoom.current) {
        emitWithDeviceContext('quickClash:joinTeamsRoom')
        joinedTeamsRoom.current = true
      }
    },
    [dispatch, isSocketReady, emitWithDeviceContext],
  )

  const enterBattle = useCallback(() => {
    if (globalMatchmakingState.battleReady?.battleId) {
      navigate(
        `/quickclash/teamBattle/${globalMatchmakingState.battleReady.battleId}`,
      )
      dispatch(clearBattleReady())
    } else {
      console.warn('Enter battle called but no battleId found')
      toast({
        title: t('Battle Not Ready'),
        description: t('The battle is not ready or an error occurred.'),
        status: 'warning',
        duration: 3000,
        isClosable: true,
      })
    }
  }, [navigate, dispatch, globalMatchmakingState.battleReady, toast, t])

  const enablePolling = useCallback(() => {
    if (
      globalMatchmakingState.inMatchmaking &&
      !globalMatchmakingState.battleReady
    ) {
      setShouldPoll(true)
    }
  }, [globalMatchmakingState.inMatchmaking, globalMatchmakingState.battleReady])

  const disablePolling = useCallback(() => {
    setShouldPoll(false)
  }, [])

  const formatMatchmakingTime = useCallback(seconds => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }, [])

  return {
    // State
    inMatchmaking: globalMatchmakingState.inMatchmaking,
    matchmakingType: globalMatchmakingState.matchmakingType,
    selectedTeamId: globalMatchmakingState.selectedTeamId,
    matchmakingTime: localMatchmakingTime,
    teamName: globalMatchmakingState.teamName,
    joinType: globalMatchmakingState.joinType,
    originalTeam: globalMatchmakingState.originalTeam,
    battleReady: globalMatchmakingState.battleReady,
    loading: globalMatchmakingState.loading,
    error: globalMatchmakingState.error,
    teamMembers: globalMatchmakingState.teamMembers,
    socketConnected: globalMatchmakingState.socketConnected,
    battleCreationStatus: globalMatchmakingState.battleCreationStatus,
    battleCreationError: globalMatchmakingState.battleCreationError,
    step: globalMatchmakingState.step,

    // Device information
    deviceFingerprint,
    isSocketReady: isSocketReady(),

    // Actions
    clearBattleCreationError: () => dispatch(clearBattleCreationError()),
    checkCanLeaveMatchmaking,
    pollMatchmakingStatus,
    checkMatchmakingStatus,
    joinSoloMatchmaking,
    joinWithTeam,
    leaveMatchmaking,
    selectTeam,
    enterBattle,
    clearBattleReady: () => dispatch(clearBattleReady()),
    enablePolling,
    disablePolling,
    formatMatchmakingTime,
    setupSocketListeners,
    cleanupSocketListeners,
  }
}

export default useQuickClashGlobalMatchmaking
