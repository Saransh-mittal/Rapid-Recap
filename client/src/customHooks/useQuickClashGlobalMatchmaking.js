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
  setBattleReady,
  clearBattleReady,
  setSelectedTeamId,
  setSocketConnected,
  resetGlobalMatchmakingState,
  setTeamName,
  updateMatchmakingState,
  setJoinType,
  setOriginalTeam,
} from '../redux/quickClashGlobalMatchmakingSlice'
import axios from 'axios'

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

    // Add new handler for team battle completed
    socket.on('quickClash:teamBattleCompleted', data => {
      // Clear matchmaking state if needed
      if (globalMatchmakingState.inMatchmaking) {
        dispatch(resetGlobalMatchmakingState())
      }
    })

    return () => {
      dispatch(setSocketConnected(false))
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
    // Define condition for when the timer should be stopped
    const shouldStopTimer =
      !globalMatchmakingState.inMatchmaking ||
      globalMatchmakingState.battleReady !== null ||
      globalMatchmakingState.step === 'battleReady' ||
      globalMatchmakingState.step === 'match_found'

    if (globalMatchmakingState.inMatchmaking && !shouldStopTimer) {
      // Clean up any existing intervals first
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }

      // Reset time when starting matchmaking
      if (localMatchmakingTime === 0) {
        lastUpdateRef.current = Date.now()
      }

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
      // Stop timer but don't reset the time if match is found
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }

      // Only reset the time if we're exiting matchmaking completely
      if (!globalMatchmakingState.inMatchmaking) {
        setLocalMatchmakingTime(0)
      }
    }

    // Cleanup
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [
    globalMatchmakingState.inMatchmaking,
    globalMatchmakingState.step,
    globalMatchmakingState.battleReady,
    localMatchmakingTime,
  ])

  // Check matchmaking status on initial load
  const checkMatchmakingStatus = useCallback(async () => {
    try {
      // First check global matchmaking
      const globalStatus = await dispatch(getGlobalMatchmakingStatus()).unwrap()
      let inAnyMatchmaking = false

      // If user is in matchmaking through a team, get the team info
      if (
        globalStatus.inMatchmaking &&
        globalStatus.matchmaking &&
        globalStatus.matchmaking.team
      ) {
        const teamId = globalStatus.matchmaking.team
        inAnyMatchmaking = true

        try {
          // Use the new endpoint to get matchmaking-specific team info
          const teamResponse = await axios.get(
            `/api/quickClash/team/${teamId}/matchmaking-info`,
          )

          if (teamResponse.data && teamResponse.data.success) {
            const teamData = teamResponse.data.team
            const joinType = teamResponse.data.joinType || 'regular'
            const originalTeam = teamResponse.data.originalTeam

            // Update Redux state
            dispatch(setSelectedTeamId(teamId))
            dispatch(setTeamName(teamData.name || 'Team'))
            dispatch(setJoinType(joinType))

            if (originalTeam) {
              dispatch(setOriginalTeam(originalTeam))
            }

            // Determine matchmaking type based on join type
            let effectiveMatchmakingType = 'team'
            if (joinType === 'solo') {
              effectiveMatchmakingType = 'solo'
            }

            // Update matchmaking state
            dispatch(
              updateMatchmakingState({
                inMatchmaking: true,
                matchmakingType: effectiveMatchmakingType,
                teamName:
                  joinType === 'sourceTeam' && originalTeam
                    ? originalTeam.name
                    : teamData.name,
                joinType: joinType,
                originalTeam: originalTeam,
              }),
            )
          }
        } catch (teamError) {
          console.error('Error fetching matchmaking team info:', teamError)
        }
      } else if (globalStatus.inMatchmaking) {
        // If user is in matchmaking but not through a team, they joined individually
        inAnyMatchmaking = true
        dispatch(
          updateMatchmakingState({
            inMatchmaking: true,
            matchmakingType: 'solo',
            joinType: 'solo',
          }),
        )
      }

      // If not in global matchmaking, check if user is in any team that's in matchmaking
      if (!inAnyMatchmaking) {
        try {
          // Get the user's teams
          const teamsResponse = await axios.get('/api/quickClash/teams')

          if (
            teamsResponse.data &&
            teamsResponse.data.teams &&
            teamsResponse.data.teams.length > 0
          ) {
            const userTeams = teamsResponse.data.teams

            // For each team, check if it's in matchmaking
            for (const team of userTeams) {
              const teamMatchmakingResponse = await axios.get(
                `/api/quickClash/team/${team._id}/matchmaking/status`,
              )

              if (
                teamMatchmakingResponse.data &&
                teamMatchmakingResponse.data.inMatchmaking
              ) {
                // Found a team in matchmaking
                inAnyMatchmaking = true

                // Update Redux state
                dispatch(setSelectedTeamId(team._id))
                dispatch(setTeamName(team.name || 'Team'))
                dispatch(setJoinType('regular'))

                // Update matchmaking state
                dispatch(
                  updateMatchmakingState({
                    inMatchmaking: true,
                    matchmakingType: 'team',
                    teamName: team.name || 'Team',
                    joinType: 'regular',
                    step: 'searching', // Partial teams are still in searching step
                  }),
                )

                break // Exit loop after finding first team in matchmaking
              }
            }
          }
        } catch (teamsError) {
          console.error('Error checking user teams matchmaking:', teamsError)
        }
      }
    } catch (error) {
      console.error('Error checking matchmaking status:', error)
    }
  }, [dispatch])

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
      // Check for special error codes
      if (error.code === 'ALREADY_IN_MATCHMAKING') {
        toast({
          title: t('Already in Matchmaking'),
          description:
            error.reason ||
            error.message ||
            error ||
            t('You are already in an active matchmaking queue'),
          status: 'warning',
          duration: 5000, // Longer duration for more detailed messages
          isClosable: true,
        })
      } else {
        toast({
          title: t('Error'),
          description:
            error.reason ||
            error.message ||
            error ||
            t('Failed to join matchmaking'),
          status: 'error',
          duration: 5000, // Longer duration for more detailed messages
          isClosable: true,
        })
      }
      throw error
    }
  }, [dispatch, toast, t])

  // Enhance the joinWithTeam function to handle specific errors
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
        // First get the team details to store the name
        let teamName = 'Team'
        try {
          const teamResponse = await axios.get(`/api/quickClash/team/${teamId}`)
          if (teamResponse.data && teamResponse.data.team) {
            teamName = teamResponse.data.team.name || 'Team'
            dispatch(setTeamName(teamName))
          }
        } catch (teamError) {
          console.error('Error fetching team details:', teamError)
        }

        // Join the teams socket room
        const socket = getSocket()
        if (socket && !joinedTeamsRoom.current) {
          socket.emit('quickClash:joinTeamsRoom')
          joinedTeamsRoom.current = true
        }

        const result = await dispatch(joinTeamMatchmaking({ teamId })).unwrap()

        // Include team name in the response for socket events
        const responseWithTeam = { ...result, teamName }

        toast({
          title: t('Team Joined Matchmaking'),
          description: t('Looking for opponents...'),
          status: 'info',
          duration: 3000,
          isClosable: true,
        })

        return responseWithTeam
      } catch (error) {
        // Error handling code remains the same
        // ...
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
          return t('Team formed! You have 4 teammates.')
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
    } else if (globalMatchmakingState.step === 'battleReady') {
      // If we somehow missed the battleReady but have the battleReady step
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
    step: globalMatchmakingState.step,
    matchmakingTime: localMatchmakingTime, // Use local time state
    teamName: globalMatchmakingState.teamName,
    joinType: globalMatchmakingState.joinType,
    originalTeam: globalMatchmakingState.originalTeam,
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
