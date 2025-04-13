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
  getTeamMatchmakingStatus,
  setMatchmakingProgress,
  setMatchmakingStep,
  setBattleReady,
  clearBattleReady,
  setSelectedTeamId,
  setTeamMembers,
  setSocketConnected,
  updateMatchmakingState,
  resetGlobalMatchmakingState,
} from '../redux/quickClashGlobalMatchmakingSlice'

/**
 * Custom hook for managing the global matchmaking state for Quick Clash
 * Handles both solo players and team-based matchmaking
 */
const useQuickClashGlobalMatchmaking = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const toast = useToast()
  const { t } = useTranslation('QuickClash')
  const { getSocket } = useSocket()
  const joinedTeamsRoom = useRef(false)

  // Local timer state instead of Redux to prevent unnecessary re-renders
  const [localMatchmakingTime, setLocalMatchmakingTime] = useState(0)

  // Get global matchmaking state from Redux
  const globalMatchmakingState = useSelector(
    state => state.quickClashGlobalMatchmaking,
  )

  // Timer reference
  const timerRef = useRef(null)
  // Track last update timestamp to ensure consistent timing
  const lastUpdateRef = useRef(Date.now())

  // Setup socket listeners
  useEffect(() => {
    const socket = getSocket()
    if (!socket) return

    // Inform we're connected
    dispatch(setSocketConnected(true))

    // Join the teams socket room if needed (especially for team matchmaking)
    if (
      globalMatchmakingState.matchmakingType === 'team' &&
      !joinedTeamsRoom.current
    ) {
      socket.emit('quickClash:joinTeamsRoom')
      joinedTeamsRoom.current = true
    }

    // User matchmaking progress updates
    socket.on('quickClash:userMatchmakingProgress', data => {
      if (data.progress) {
        dispatch(setMatchmakingProgress(data.progress))
      }
      if (data.step) {
        dispatch(setMatchmakingStep(data.step))

        // Special handling for battle ready step
        if (data.step === 'battleReady') {
          dispatch(setMatchmakingProgress(100)) // Ensure 100% progress
        }
      }
    })

    // Team matchmaking progress updates
    socket.on('quickClash:teamMatchmakingProgress', data => {
      if (
        globalMatchmakingState.selectedTeamId &&
        data.teamId === globalMatchmakingState.selectedTeamId
      ) {
        dispatch(setMatchmakingProgress(data.progress))
        dispatch(setMatchmakingStep(data.step))

        // Special handling for battle ready step
        if (data.step === 'battleReady') {
          dispatch(setMatchmakingProgress(100)) // Ensure 100% progress
        }
      }
    })

    // Team dissolved notification
    socket.on('quickClash:teamDissolved', data => {
      toast({
        title: t('Team Dissolved'),
        description: t(
          'A player left matchmaking. Looking for new teammates...',
        ),
        status: 'info',
        duration: 5000,
        isClosable: true,
      })

      // Update state to indicate we're back to solo searching
      dispatch(
        updateMatchmakingState({
          inMatchmaking: true,
          progress: 10,
          step: 'searching',
          matchmakingType: 'solo',
        }),
      )
    })

    // Battle ready notification
    socket.on('quickClash:teamBattleReady', data => {
      // For solo players, there won't be selectedTeamId but there will be battleId
      const isSoloPlayer = globalMatchmakingState.matchmakingType === 'solo'

      // Determine if this event is meant for this user
      let isForUser = false

      if (isSoloPlayer && data.battleId) {
        // Solo player should receive all battle ready events
        isForUser = true
      } else if (globalMatchmakingState.selectedTeamId) {
        // Team player should receive only events for their team
        isForUser =
          data.teamId === globalMatchmakingState.selectedTeamId ||
          data.teamA === globalMatchmakingState.selectedTeamId ||
          data.teamB === globalMatchmakingState.selectedTeamId
      }

      if (isForUser) {
        // Update the state with the battle ready info
        dispatch(setBattleReady(data))
      }
    })

    // Handle notification when user joined matchmaking
    socket.on('quickClash:joinedGlobalMatchmaking', data => {
      dispatch(
        updateMatchmakingState({
          inMatchmaking: true,
          progress: 10,
          step: 'searching',
          matchmakingType: 'solo',
        }),
      )
    })

    // Handle notification when user left matchmaking
    socket.on('quickClash:leftGlobalMatchmaking', data => {
      dispatch(
        updateMatchmakingState({
          inMatchmaking: false,
          progress: 0,
          step: null,
        }),
      )
    })

    // Add new handler for team battle completed
    socket.on('quickClash:teamBattleCompleted', data => {
      // Clear matchmaking state if needed
      if (globalMatchmakingState.inMatchmaking) {
        dispatch(resetGlobalMatchmakingState())
      }
    })

    return () => {
      dispatch(setSocketConnected(false))
      socket.off('quickClash:userMatchmakingProgress')
      socket.off('quickClash:teamMatchmakingProgress')
      socket.off('quickClash:teamDissolved')
      socket.off('quickClash:teamBattleReady')
      socket.off('quickClash:joinedGlobalMatchmaking')
      socket.off('quickClash:leftGlobalMatchmaking')
      socket.off('quickClash:teamBattleCompleted')

      // Reset joined teams room flag
      joinedTeamsRoom.current = false
    }
  }, [
    dispatch,
    getSocket,
    toast,
    t,
    navigate,
    globalMatchmakingState.selectedTeamId,
    globalMatchmakingState.matchmakingType,
    globalMatchmakingState.inMatchmaking,
  ])

  // Manage matchmaking timer with local state for better performance
  useEffect(() => {
    if (globalMatchmakingState.inMatchmaking) {
      // Clean up any existing intervals first
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }

      // Reset time when starting matchmaking
      setLocalMatchmakingTime(0)
      lastUpdateRef.current = Date.now()

      // Start a new interval timer at exactly 1-second increments
      timerRef.current = setInterval(() => {
        const now = Date.now()
        const elapsed = now - lastUpdateRef.current

        // We only want to increment if at least 1 second has passed
        if (elapsed >= 1000) {
          // Calculate how many seconds have passed
          const secondsToAdd = Math.floor(elapsed / 1000)
          setLocalMatchmakingTime(prev => prev + secondsToAdd)

          // Update the last time we incremented
          lastUpdateRef.current = now - (elapsed % 1000)
        }
      }, 1000)
    } else {
      // Stop and reset timer
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      setLocalMatchmakingTime(0)
    }

    // Cleanup
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [globalMatchmakingState.inMatchmaking])

  // Check matchmaking status on initial load
  const checkMatchmakingStatus = useCallback(async () => {
    try {
      // First check global matchmaking
      await dispatch(getGlobalMatchmakingStatus()).unwrap()

      // If we have a selected team, check team matchmaking too
      if (globalMatchmakingState.selectedTeamId) {
        await dispatch(
          getTeamMatchmakingStatus(globalMatchmakingState.selectedTeamId),
        ).unwrap()
      }
    } catch (error) {
      console.error('Error checking matchmaking status:', error)
    }
  }, [dispatch, globalMatchmakingState.selectedTeamId])

  // Join global matchmaking as solo player
  const joinSoloMatchmaking = useCallback(async () => {
    try {
      const result = await dispatch(joinGlobalMatchmaking()).unwrap()

      toast({
        title: t('Joined 4v4 Matchmaking'),
        description: t('Looking for team members and opponents...'),
        status: 'info',
        duration: 3000,
        isClosable: true,
      })

      return result
    } catch (error) {
      toast({
        title: t('Error'),
        description: error || t('Failed to join matchmaking'),
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      throw error
    }
  }, [dispatch, toast, t])

  // Join matchmaking with a team
  const joinWithTeam = useCallback(
    async teamId => {
      if (!teamId) {
        toast({
          title: t('No Team Selected'),
          description: t('Please select a team to join matchmaking'),
          status: 'warning',
          duration: 3000,
          isClosable: true,
        })
        return
      }

      try {
        // Join the teams socket room
        const socket = getSocket()
        if (socket && !joinedTeamsRoom.current) {
          socket.emit('quickClash:joinTeamsRoom')
          joinedTeamsRoom.current = true
        }

        const result = await dispatch(joinTeamMatchmaking({ teamId })).unwrap()

        toast({
          title: t('Team Joined Matchmaking'),
          description: t('Looking for opponents...'),
          status: 'info',
          duration: 3000,
          isClosable: true,
        })

        return result
      } catch (error) {
        toast({
          title: t('Error'),
          description: error || t('Failed to join team matchmaking'),
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
        throw error
      }
    },
    [dispatch, toast, t, getSocket],
  )

  // Leave matchmaking
  const leaveMatchmaking = useCallback(async () => {
    try {
      // Determine if we're in solo or team matchmaking
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
      toast({
        title: t('Error'),
        description: error || t('Failed to leave matchmaking'),
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      throw error
    }
  }, [
    dispatch,
    toast,
    t,
    globalMatchmakingState.matchmakingType,
    globalMatchmakingState.selectedTeamId,
  ])

  // Select team ID for team matchmaking
  const selectTeam = useCallback(
    teamId => {
      dispatch(setSelectedTeamId(teamId))

      // Join teams room if selecting a team
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

  // Helper to format time display (MM:SS)
  const formatMatchmakingTime = useCallback(seconds => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }, [])

  // Get status description based on current step
  const getStatusDescription = useCallback(
    step => {
      switch (step) {
        case 'searching':
          return t('Searching for players...')
        case 'forming_team':
          return t('Forming your team of 4 players...')
        case 'team_formed':
          return t('Team formed! You have 3 teammates.')
        case 'searching_opponents':
          return t('Searching for an opponent team...')
        case 'match_found':
          return t('Opponent team found! Preparing battle...')
        case 'preparing_battle':
          return t('Setting up battle materials...')
        case 'generating_challenges':
          return t('Creating challenges for all players...')
        case 'battleReady':
          return t('Battle ready! Redirecting...')
        default:
          return t('Waiting in matchmaking queue...')
      }
    },
    [t],
  )

  // Get color for current step
  const getStepColor = useCallback(step => {
    switch (step) {
      case 'searching':
        return 'blue'
      case 'forming_team':
        return 'teal'
      case 'team_formed':
        return 'green'
      case 'match_found':
        return 'purple'
      case 'preparing_battle':
        return 'orange'
      case 'battleReady':
        return 'green'
      default:
        return 'gray'
    }
  }, [])

  // Navigate to battle when ready
  const enterBattle = useCallback(() => {
    if (globalMatchmakingState.battleReady?.battleId) {
      navigate(
        `/quickclash/teamBattle/${globalMatchmakingState.battleReady.battleId}`,
      )
      dispatch(clearBattleReady())
    } else if (
      globalMatchmakingState.step === 'battleReady' &&
      globalMatchmakingState.progress === 100
    ) {
      // If we somehow missed the battleReady but have the battleReady step and 100% progress,
      // redirect to the matchmaking screen
      navigate('/quickclash')
      toast({
        title: t('Battle Ready'),
        description: t('Please join your battle from the matchmaking screen'),
        status: 'info',
        duration: 3000,
        isClosable: true,
      })
      dispatch(clearBattleReady())
    }
  }, [navigate, dispatch, globalMatchmakingState, toast, t])

  return {
    // State
    inMatchmaking: globalMatchmakingState.inMatchmaking,
    matchmakingType: globalMatchmakingState.matchmakingType,
    selectedTeamId: globalMatchmakingState.selectedTeamId,
    progress: globalMatchmakingState.progress,
    step: globalMatchmakingState.step,
    matchmakingTime: localMatchmakingTime, // Use local time state
    battleReady: globalMatchmakingState.battleReady,
    loading: globalMatchmakingState.loading,
    error: globalMatchmakingState.error,
    teamMembers: globalMatchmakingState.teamMembers,
    socketConnected: globalMatchmakingState.socketConnected,

    // Actions
    checkMatchmakingStatus,
    joinSoloMatchmaking,
    joinWithTeam,
    leaveMatchmaking,
    selectTeam,
    enterBattle,
    clearBattleReady: () => dispatch(clearBattleReady()),

    // Helper functions
    formatMatchmakingTime,
    getStatusDescription,
    getStepColor,
  }
}

export default useQuickClashGlobalMatchmaking
