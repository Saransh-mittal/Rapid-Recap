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
 * Custom hook for managing the global matchmaking state with improved polling
 */
const useQuickClashGlobalMatchmaking = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const toast = useToast()
  const { t } = useTranslation('QuickClash')
  const { getSocket } = useSocket()
  const joinedTeamsRoom = useRef(false)
  const matchmakingStartTimeRef = useRef(null)

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
    }
  }, [])

  useEffect(() => {
    const socket = getSocket()
    if (!socket) return

    dispatch(setSocketConnected(true))

    if (
      globalMatchmakingState.matchmakingType === 'team' &&
      !joinedTeamsRoom.current
    ) {
      socket.emit('quickClash:joinTeamsRoom')
      joinedTeamsRoom.current = true
    }

    socket.on('quickClash:teamBattleReady', data => {
      if (!isComponentMountedRef.current) return
      console.log('Received teamBattleReady event:', data)
      dispatch(setBattleReady(data))
    })

    socket.on('quickClash:battleCreationStarted', data => {
      if (!isComponentMountedRef.current) return
      console.log('Battle creation started:', data)
      dispatch(setBattleCreationStatus('creating'))
    })

    socket.on('quickClash:battleCreationFailed', data => {
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
    })

    socket.on('quickClash:matchmakingLocked', data => {
      if (!isComponentMountedRef.current) return
      console.log('Matchmaking locked:', data)
      dispatch(setBattleCreationStatus('creating'))
    })

    return () => {
      if (socket) {
        // Check if socket exists before trying to turn off listeners
        dispatch(setSocketConnected(false))
        socket.off('quickClash:teamBattleReady')
        socket.off('quickClash:battleCreationStarted')
        socket.off('quickClash:battleCreationFailed')
        socket.off('quickClash:matchmakingLocked')
        // Consider leaving teams room if applicable
        // if (joinedTeamsRoom.current) socket.emit('quickClash:leaveTeamsRoom');
      }
      joinedTeamsRoom.current = false
    }
  }, [
    dispatch,
    getSocket, // getSocket should be stable
    globalMatchmakingState.matchmakingType, // Only re-subscribe if matchmakingType changes (e.g., solo to team)
    t,
    toast,
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
      // Renamed to avoid conflict if exported, and memoized
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
  ) // Empty dependency array as it doesn't depend on hook's scope changing variables

  const pollMatchmakingStatus = useCallback(async () => {
    if (!isComponentMountedRef.current) return null
    // Access current state from globalMatchmakingState (via useSelector) directly here
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
          // No need to dispatch updateMatchmakingState here if the individual setters are enough
          // or if the main pollMatchmakingStatus call in the useEffect will handle it.
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
              // No need to setShouldPoll(false) here, battleReady state change handles it
              if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current)
                pollingIntervalRef.current = null
              }
            }
            // Additional logic for UI updates based on statusData can be here or in component
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
    // ... (no change)
    try {
      const response = await axios.get('/api/quickClash/can-leave-matchmaking')
      return response.data.canLeave
    } catch (error) {
      console.error('Error checking if can leave matchmaking:', error)
      return true // Allow leaving if check fails
    }
  }, [])

  const checkMatchmakingStatus = useCallback(
    async passedTeamId => {
      if (!isComponentMountedRef.current) return null
      // This function reads the latest globalMatchmakingState from the hook's scope when called.
      // `dispatch` is stable.
      console.log('[HOOK] checkMatchmakingStatus called.')
      try {
        const globalStatus = await dispatch(
          getGlobalMatchmakingStatus(),
        ).unwrap()
        let inAnyMatchmaking = false
        let statusDetailPayload = {} // Accumulate updates for a single dispatch if possible

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
                  (teamResponse.data.battleReady ? 'battleReady' : 'searching'), // Get step from matchmaking-info
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
          // Simplified: If getGlobalMatchmakingStatus says not in MM, we trust it for now.
          // The more complex team iteration can be a fallback or separate logic if needed.
          if (globalMatchmakingState.inMatchmaking) {
            // Compare with current Redux state
            dispatch(resetGlobalMatchmakingState())
          }
        } else if (Object.keys(statusDetailPayload).length > 0) {
          // Dispatch a single update based on the gathered details
          dispatch(updateMatchmakingState(statusDetailPayload))
        }

        setShouldPoll(inAnyMatchmaking && !statusDetailPayload.battleReady) // Poll if in MM and battle not ready
        return statusDetailPayload // Return the effective status for callers
      } catch (error) {
        console.error('Error in checkMatchmakingStatus:', error)
        if (globalMatchmakingState.inMatchmaking) {
          // Compare with current Redux state
          // dispatch(resetGlobalMatchmakingState()); // Optionally reset on error
        }
        setShouldPoll(false)
        return null
      }
    },
    [dispatch],
  ) // CRITICAL: Made this stable. It uses globalMatchmakingState from hook scope.

  const joinSoloMatchmaking = useCallback(async () => {
    // ... (logic is mostly fine, ensure it sets shouldPoll)
    try {
      matchmakingStartTimeRef.current = Date.now()
      setLocalMatchmakingTime(0)
      const result = await dispatch(joinGlobalMatchmaking()).unwrap()
      setShouldPoll(true) // Enable polling
      toast({
        title: t('Joined 4v4 Matchmaking'),
        description: t('Looking for team members and opponents...'),
        status: 'info',
        duration: 3000,
        isClosable: true,
      })
      return result
    } catch (error) {
      /* ... error handling ... */ throw error
    }
  }, [dispatch, toast, t])

  const joinWithTeam = useCallback(
    async (teamId, teamName) => {
      // ... (logic is mostly fine, ensure it sets shouldPoll)
      if (!teamId) {
        /* ... */ return
      }
      try {
        matchmakingStartTimeRef.current = Date.now()
        setLocalMatchmakingTime(0)
        // Fetch team name if not provided, or to ensure it's current
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
        dispatch(setTeamName(currentTeamName || 'Team')) // Set in Redux

        const socket = getSocket()
        if (socket && !joinedTeamsRoom.current) {
          socket.emit('quickClash:joinTeamsRoom')
          joinedTeamsRoom.current = true
        }
        const result = await dispatch(
          joinTeamMatchmaking({ teamId, teamName: currentTeamName }),
        ).unwrap()
        setShouldPoll(true) // Enable polling
        toast({
          title: t('Team Joined Matchmaking'),
          description: t('Looking for opponents...'),
          status: 'info',
          duration: 3000,
          isClosable: true,
        })
        return { ...result, teamName: currentTeamName }
      } catch (error) {
        /* ... error handling ... */ throw error
      }
    },
    [dispatch, toast, t, getSocket],
  )

  const leaveMatchmaking = useCallback(async () => {
    // ... (logic is mostly fine, ensure it sets shouldPoll to false)
    try {
      const canLeave = await checkCanLeaveMatchmaking()
      if (!canLeave) {
        /* ... */ return
      }
      matchmakingStartTimeRef.current = null
      setLocalMatchmakingTime(0)
      setShouldPoll(false) // Disable polling

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
      // The thunk's fulfilled reducer should reset inMatchmaking, which stops polling via useEffect.
      toast({
        title: t('Left Matchmaking'),
        status: 'info',
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      /* ... error handling ... */ throw error
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
      if (teamId) {
        const socket = getSocket()
        if (socket && !joinedTeamsRoom.current) {
          socket.emit('quickClash:joinTeamsRoom')
          joinedTeamsRoom.current = true
        }
      }
    },
    [dispatch, getSocket],
  )

  const enterBattle = useCallback(() => {
    // ... (no change)
    if (globalMatchmakingState.battleReady?.battleId) {
      navigate(
        `/quickclash/teamBattle/${globalMatchmakingState.battleReady.battleId}`,
      )
      dispatch(clearBattleReady()) // This should also set inMatchmaking to false, stopping polling.
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
    teamMembers: globalMatchmakingState.teamMembers, // Ensure this is in initialState & slice
    socketConnected: globalMatchmakingState.socketConnected,
    battleCreationStatus: globalMatchmakingState.battleCreationStatus,
    battleCreationError: globalMatchmakingState.battleCreationError,
    step: globalMatchmakingState.step, // Export step

    clearBattleCreationError: () => dispatch(clearBattleCreationError()),
    checkCanLeaveMatchmaking,
    pollMatchmakingStatus, // Export for direct polling if needed by UI
    checkMatchmakingStatus,
    joinSoloMatchmaking,
    joinWithTeam,
    leaveMatchmaking,
    selectTeam,
    enterBattle,
    clearBattleReady: () => dispatch(clearBattleReady()),
    enablePolling, // For modal to explicitly start polling
    disablePolling, // For modal to explicitly stop polling

    formatMatchmakingTime,
    // getSelectedTeamId, // Not strictly needed if selectedTeamId is exported directly
  }
}

export default useQuickClashGlobalMatchmaking
