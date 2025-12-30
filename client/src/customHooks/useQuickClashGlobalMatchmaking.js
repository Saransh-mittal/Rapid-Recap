// customHooks/useQuickClashGlobalMatchmaking.js - COMPLETE SIMPLIFIED VERSION
import { useCallback, useState, useRef, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { notificationManager } from '../utils/notifications'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import {
  joinGlobalMatchmaking,
  leaveGlobalMatchmaking,
  getGlobalMatchmakingStatus,
  joinTeamMatchmaking,
  leaveTeamMatchmaking,
  getTeamMatchmakingStatus,
  clearBattleReady,
  setSelectedTeamId,
  clearBattleCreationError,
  clearBattleCreationState,
  resetGlobalMatchmakingState,
  updateMatchmakingState,
  setShouldCheckStatus,
} from '../redux/quickClashGlobalMatchmakingSlice'
import axios from 'axios'

/**
 * Complete simplified hook for Global/Team Matchmaking
 * No socket management - that's handled by useQuickClashSocket
 */
const useQuickClashGlobalMatchmaking = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { t } = useTranslation('QuickClash')

  const socketState = useSelector(state => state.quickClashSocket)
  const globalMatchmakingState = useSelector(
    state => state.quickClashGlobalMatchmaking,
  )

  // Refs for cleanup and timing
  const matchmakingStartTimeRef = useRef(null)
  const timerRef = useRef(null)
  const isComponentMountedRef = useRef(true)

  // Local state for matchmaking time
  const [localMatchmakingTime, setLocalMatchmakingTime] = useState(0)

  // Component lifecycle
  useEffect(() => {
    isComponentMountedRef.current = true
    return () => {
      isComponentMountedRef.current = false
    }
  }, [])

  // Timer for matchmaking duration
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

  // Check matchmaking status - Enhanced version without polling
  const checkMatchmakingStatus = useCallback(
    async passedTeamId => {
      if (!isComponentMountedRef.current) return null
      console.log('[GM_HOOK] checkMatchmakingStatus called.')
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

        return statusDetailPayload
      } catch (error) {
        console.error('Error in checkMatchmakingStatus:', error)
        return null
      }
    },
    [dispatch, globalMatchmakingState.inMatchmaking],
  )

  // Effect to handle status check triggers from socket events
  useEffect(() => {
    if (globalMatchmakingState.shouldCheckStatus) {
      console.log('[GM_HOOK] Triggered status check from Redux flag')
      checkMatchmakingStatus()
      // Clear the flag after triggering the check
      dispatch(setShouldCheckStatus(false))
    }
  }, [globalMatchmakingState.shouldCheckStatus, dispatch])

  // Check if can leave matchmaking
  const checkCanLeaveMatchmaking = useCallback(async () => {
    try {
      const response = await axios.get('/api/quickClash/can-leave-matchmaking')
      return response.data.canLeave
    } catch (error) {
      console.error('Error checking if can leave matchmaking:', error)
      return true
    }
  }, [])

  // HTTP polling for matchmaking status (used by modal for detailed status updates)
  const pollMatchmakingStatus = useCallback(async () => {
    try {
      const response = await axios.get(
        '/api/quickClash/global-matchmaking-status-detailed',
      )
      return response.data
    } catch (error) {
      console.error('Error polling matchmaking status:', error)
      return null
    }
  }, [])

  // Join solo matchmaking
  const joinSoloMatchmaking = useCallback(async () => {
    try {
      matchmakingStartTimeRef.current = Date.now()
      setLocalMatchmakingTime(0)
      const result = await dispatch(joinGlobalMatchmaking()).unwrap()
      notificationManager.matchmaking(t('Joined 4v4 Matchmaking'), t('Looking for team members and opponents...'))
      return result
    } catch (error) {
      console.error('Error joining solo matchmaking:', error)
      throw error
    }
  }, [dispatch, t])

  // Join with team
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

        const result = await dispatch(
          joinTeamMatchmaking({ teamId, teamName: currentTeamName }),
        ).unwrap()
        notificationManager.matchmaking(t('Team Joined Matchmaking'), t('Looking for opponents...'))
        return { ...result, teamName: currentTeamName }
      } catch (error) {
        console.error('Error joining with team:', error)
        throw error
      }
    },
    [dispatch, t],
  )

  // Leave matchmaking
  const leaveMatchmaking = useCallback(async () => {
    try {
      const canLeave = await checkCanLeaveMatchmaking()
      if (!canLeave) {
        throw new Error('Cannot leave matchmaking at this time')
      }
      matchmakingStartTimeRef.current = null
      setLocalMatchmakingTime(0)

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

      notificationManager.info(t('Left Matchmaking'))
    } catch (error) {
      console.error('Error leaving matchmaking:', error)
      throw error
    }
  }, [
    dispatch,
    t,
    globalMatchmakingState.matchmakingType,
    globalMatchmakingState.selectedTeamId,
    checkCanLeaveMatchmaking,
  ])

  // Select team
  const selectTeam = useCallback(
    teamId => {
      dispatch(setSelectedTeamId(teamId))
    },
    [dispatch],
  )

  // Enter battle
  const enterBattle = useCallback(() => {
    if (globalMatchmakingState.battleReady?.battleId) {
      navigate(
        `/quickclash/teamBattle/${globalMatchmakingState.battleReady.battleId}`,
      )
      dispatch(clearBattleReady())
    } else {
      console.warn('Enter battle called but no battleId found')
      notificationManager.warning(t('Battle Not Ready'), t('The battle is not ready or an error occurred.'))
    }
  }, [navigate, dispatch, globalMatchmakingState.battleReady, t])

  // Format matchmaking time
  const formatMatchmakingTime = useCallback(seconds => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }, [])

  // Retry after failure
  const retryAfterFailure = useCallback(async () => {
    try {
      dispatch(clearBattleCreationState())
      notificationManager.info(t('Ready to Try Again'), t('You can now join matchmaking again.'))
    } catch (error) {
      console.error('Error resetting after failure:', error)
    }
  }, [dispatch, t])

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
    socketConnected: socketState.isConnected,
    battleCreationStatus: globalMatchmakingState.battleCreationStatus,
    battleCreationError: globalMatchmakingState.battleCreationError,
    step: globalMatchmakingState.step,

    // Redux state for UI
    statusUpdates: globalMatchmakingState.statusUpdates,
    shouldRefetchTeams: globalMatchmakingState.shouldRefetchTeams,
    showToast: globalMatchmakingState.showToast,
    shouldCheckStatus: globalMatchmakingState.shouldCheckStatus,

    // Device information
    deviceFingerprint: socketState.deviceFingerprint,
    isSocketReady: socketState.isConnected,
    autoInitialize: true,
    socketListenersSetup: socketState.isInitialized,

    // Socket state
    isSocketConnected: socketState.isConnected,
    isInTeamsRoom: socketState.rooms.teams,

    // Actions
    clearBattleCreationError: () => dispatch(clearBattleCreationError()),
    checkCanLeaveMatchmaking,
    checkMatchmakingStatus,
    pollMatchmakingStatus, // Specific for modal polling
    joinSoloMatchmaking,
    joinWithTeam,
    leaveMatchmaking,
    selectTeam,
    enterBattle,
    retryAfterFailure,
    clearBattleCreationState: () => dispatch(clearBattleCreationState()),
    clearBattleReady: () => dispatch(clearBattleReady()),
    formatMatchmakingTime,

    // Dummy socket management functions for backward compatibility
    setupSocketListeners: () => true,
    cleanupSocketListeners: () => {},
    reinitialize: () => true,
    joinTeamsRoom: () => socketState.rooms.teams,
    enablePolling: () => {},
    disablePolling: () => {},

    // Status checks
    isReady: () => socketState.isConnected && socketState.rooms.teams,
    isInitialized: () => socketState.isInitialized,
    isRoomJoined: () => socketState.rooms.teams,
  }
}

export default useQuickClashGlobalMatchmaking
