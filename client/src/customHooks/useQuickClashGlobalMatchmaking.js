// customHooks/useQuickClashGlobalMatchmaking.js
import { useCallback, useEffect, useRef } from 'react'
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
  incrementMatchmakingTime,
  resetMatchmakingTime,
  setBattleReady,
  clearBattleReady,
  setSelectedTeamId,
  setTeamMembers,
  setAllowBots,
  setSocketConnected,
  updateMatchmakingState,
  resetGlobalMatchmakingState,
} from '../redux/quickClashGlobalMatchmakingSlice'

let matchmakingTimerRef = null

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

  // Get global matchmaking state from Redux
  const globalMatchmakingState = useSelector(
    state => state.quickClashGlobalMatchmaking,
  )

  // Initialize timer reference
  const timerRef = useRef(null)

  // Setup socket listeners
  useEffect(() => {
    const socket = getSocket()
    if (!socket) return

    // Inform we're connected
    dispatch(setSocketConnected(true))
    console.log('Global matchmaking socket connected')

    // Join the teams socket room if needed (especially for team matchmaking)
    if (
      globalMatchmakingState.matchmakingType === 'team' &&
      !joinedTeamsRoom.current
    ) {
      socket.emit('quickClash:joinTeamsRoom')
      joinedTeamsRoom.current = true
      console.log('Joined quickClash:teams room for team matchmaking')
    }

    // User matchmaking progress updates
    socket.on('quickClash:userMatchmakingProgress', data => {
      console.log('Received user matchmaking progress:', data)
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
      console.log('Received team matchmaking progress:', data)
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
      console.log('Team dissolved event received:', data)
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
      console.log('Received team battle ready event:', data)

      // For solo players, there won't be selectedTeamId but there will be battleId
      const isSoloPlayer = globalMatchmakingState.matchmakingType === 'solo'

      // Determine if this event is meant for this user
      let isForUser = false

      if (isSoloPlayer && data.battleId) {
        // Solo player should receive all battle ready events
        isForUser = true
        console.log('Solo player receiving battle ready notification')
      } else if (globalMatchmakingState.selectedTeamId) {
        // Team player should receive only events for their team
        isForUser =
          data.teamId === globalMatchmakingState.selectedTeamId ||
          data.teamA === globalMatchmakingState.selectedTeamId ||
          data.teamB === globalMatchmakingState.selectedTeamId

        console.log(
          'Team player, isForUser:',
          isForUser,
          'selectedTeamId:',
          globalMatchmakingState.selectedTeamId,
        )
      }

      if (isForUser) {
        console.log(
          'Battle ready notification is for this user, updating state',
        )

        // Update the state with the battle ready info
        dispatch(setBattleReady(data))
      } else {
        console.log('Battle ready notification is not for this user')
      }
    })

    // Handle notification when user joined matchmaking
    socket.on('quickClash:joinedGlobalMatchmaking', data => {
      console.log('User joined global matchmaking:', data)
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
      console.log('User left global matchmaking:', data)
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
      console.log('Team battle completed:', data)
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

  // Manage matchmaking timer
  useEffect(() => {
    if (globalMatchmakingState.inMatchmaking) {
      // Start timer
      timerRef.current = setInterval(() => {
        dispatch(incrementMatchmakingTime())
      }, 1000)
    } else {
      // Stop and reset timer
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      dispatch(resetMatchmakingTime())
    }

    // Cleanup
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [dispatch, globalMatchmakingState.inMatchmaking])

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
    async (teamId, allowBots = true) => {
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
          console.log('Joined quickClash:teams room for joinWithTeam')
        }

        const result = await dispatch(
          joinTeamMatchmaking({ teamId, allowBots }),
        ).unwrap()

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
          console.log('Joined quickClash:teams room for selectTeam')
        }
      }
    },
    [dispatch, getSocket],
  )

  // Set whether to allow bots in matchmaking
  const toggleAllowBots = useCallback(
    allowBots => {
      dispatch(setAllowBots(allowBots))
    },
    [dispatch],
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
    console.log(
      'Attempting to enter battle with state:',
      globalMatchmakingState,
    )

    if (globalMatchmakingState.battleReady?.battleId) {
      console.log(
        'Navigating to battle:',
        globalMatchmakingState.battleReady.battleId,
      )
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
      console.log('Battle ready but no battleId, redirecting to matchmaking')
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
    matchmakingTime: globalMatchmakingState.matchmakingTime,
    battleReady: globalMatchmakingState.battleReady,
    loading: globalMatchmakingState.loading,
    error: globalMatchmakingState.error,
    allowBots: globalMatchmakingState.allowBots,
    teamMembers: globalMatchmakingState.teamMembers,
    socketConnected: globalMatchmakingState.socketConnected,

    // Actions
    checkMatchmakingStatus,
    joinSoloMatchmaking,
    joinWithTeam,
    leaveMatchmaking,
    selectTeam,
    toggleAllowBots,
    enterBattle,
    clearBattleReady: () => dispatch(clearBattleReady()),

    // Helper functions
    formatMatchmakingTime,
    getStatusDescription,
    getStepColor,
  }
}

export default useQuickClashGlobalMatchmaking
