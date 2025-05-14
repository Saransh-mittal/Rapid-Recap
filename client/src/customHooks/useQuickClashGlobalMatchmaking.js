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
 * Custom hook for managing the global matchmaking state with HTTP polling
 */
const useQuickClashGlobalMatchmaking = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const toast = useToast()
  const { t } = useTranslation('QuickClash')
  const { getSocket } = useSocket()
  const joinedTeamsRoom = useRef(false)
  const matchmakingStartTimeRef = useRef(null)

  // Local timer state for better performance
  const [localMatchmakingTime, setLocalMatchmakingTime] = useState(0)

  // Get global matchmaking state from Redux
  const globalMatchmakingState = useSelector(
    state => state.quickClashGlobalMatchmaking,
  )

  // Timer references
  const timerRef = useRef(null)

  // Setup socket listeners (only for battle ready and team events)
  useEffect(() => {
    const socket = getSocket()
    if (!socket) return

    // Inform we're connected
    dispatch(setSocketConnected(true))

    // Join the teams socket room if needed
    if (
      globalMatchmakingState.matchmakingType === 'team' &&
      !joinedTeamsRoom.current
    ) {
      socket.emit('quickClash:joinTeamsRoom')
      joinedTeamsRoom.current = true
    }

    // Battle ready notification - the main important socket event we keep
    socket.on('quickClash:teamBattleReady', data => {
      const isSoloPlayer = globalMatchmakingState.matchmakingType === 'solo'
      let isForUser = false

      if (isSoloPlayer && data.battleId) {
        isForUser = true
      } else if (globalMatchmakingState.selectedTeamId) {
        isForUser =
          data.teamId === globalMatchmakingState.selectedTeamId ||
          data.teamA === globalMatchmakingState.selectedTeamId ||
          data.teamB === globalMatchmakingState.selectedTeamId
      }

      if (isForUser) {
        dispatch(setBattleReady(data))
      }
    })

    return () => {
      dispatch(setSocketConnected(false))
      socket.off('quickClash:teamBattleReady')
      joinedTeamsRoom.current = false
    }
  }, [
    dispatch,
    getSocket,
    globalMatchmakingState.selectedTeamId,
    globalMatchmakingState.matchmakingType,
  ])

  // Manage matchmaking timer - fixed to not restart during polling
  useEffect(() => {
    if (
      globalMatchmakingState.inMatchmaking &&
      !globalMatchmakingState.battleReady
    ) {
      // Start timer only if it's not already running
      if (!timerRef.current) {
        // Set the start time if not already set
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
      // Stop timer and reset start time when not in matchmaking
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }

      if (!globalMatchmakingState.inMatchmaking) {
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

  // Separate function for polling that doesn't update Redux state unnecessarily
  const pollMatchmakingStatus = useCallback(async () => {
    try {
      // Only check detailed status without updating Redux state
      let statusData = null

      if (
        globalMatchmakingState.matchmakingType === 'team' &&
        globalMatchmakingState.selectedTeamId
      ) {
        // Get detailed status for team matchmaking
        statusData = await getDetailedMatchmakingStatus(
          globalMatchmakingState.selectedTeamId,
          'team',
        )

        // Handle auto-team formation status
        if (
          statusData &&
          statusData.isAutoFormed &&
          statusData.status === 'team_formation_in_progress'
        ) {
          // Update Redux state with auto-team information
          dispatch(setJoinType('sourceTeam'))
          dispatch(setOriginalTeam(statusData.originalTeam))
          dispatch(
            setTeamName(statusData.autoFormedTeam?.name || 'Auto-formed Team'),
          )
          dispatch(setSelectedTeamId(statusData.autoFormedTeam?._id))

          dispatch(
            updateMatchmakingState({
              matchmakingType: 'team',
              joinType: 'sourceTeam',
              originalTeam: statusData.originalTeam,
              teamName: statusData.autoFormedTeam?.name || 'Auto-formed Team',
            }),
          )
        }
      } else if (globalMatchmakingState.matchmakingType === 'solo') {
        // Get detailed status for solo matchmaking
        statusData = await getDetailedMatchmakingStatus(null, 'solo')
      }

      return statusData
    } catch (error) {
      console.error('Error polling matchmaking status:', error)
      return null
    }
  }, [
    globalMatchmakingState.matchmakingType,
    globalMatchmakingState.selectedTeamId,
    dispatch,
  ])

  // Check matchmaking status - only for initial checks and major state changes
  const checkMatchmakingStatus = useCallback(
    async passedTeamId => {
      try {
        // Check global matchmaking first
        const globalStatus = await dispatch(
          getGlobalMatchmakingStatus(),
        ).unwrap()
        let inAnyMatchmaking = false
        let statusData = null

        // If user is in matchmaking through a team, get the team info
        if (
          globalStatus.inMatchmaking &&
          globalStatus.matchmaking &&
          globalStatus.matchmaking.team
        ) {
          const teamId = passedTeamId || globalStatus.matchmaking.team
          inAnyMatchmaking = true

          try {
            // Get detailed team matchmaking info
            const teamResponse = await axios.get(
              `/api/quickClash/team/${teamId}/matchmaking-info`,
            )

            if (teamResponse.data && teamResponse.data.success) {
              const teamData = teamResponse.data.team
              const joinType = teamResponse.data.joinType || 'regular'
              const originalTeam = teamResponse.data.originalTeam

              dispatch(setSelectedTeamId(teamId))
              dispatch(setTeamName(teamData.name || 'Team'))
              dispatch(setJoinType(joinType))

              if (originalTeam) {
                dispatch(setOriginalTeam(originalTeam))
              }

              let effectiveMatchmakingType = 'team'
              if (joinType === 'solo') {
                effectiveMatchmakingType = 'solo'
              }

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

              // Get detailed status for team matchmaking
              statusData = await getDetailedMatchmakingStatus(teamId, 'team')
            }
          } catch (teamError) {
            console.error('Error fetching matchmaking team info:', teamError)
          }
        } else if (globalStatus.inMatchmaking) {
          inAnyMatchmaking = true
          dispatch(
            updateMatchmakingState({
              inMatchmaking: true,
              matchmakingType: 'solo',
              joinType: 'solo',
            }),
          )

          // Get detailed status for solo matchmaking
          statusData = await getDetailedMatchmakingStatus(null, 'solo')
        }

        // If not in global matchmaking, check team matchmaking
        if (!inAnyMatchmaking) {
          try {
            const teamsResponse = await axios.get('/api/quickClash/teams')

            if (
              teamsResponse.data &&
              teamsResponse.data.teams &&
              teamsResponse.data.teams.length > 0
            ) {
              const userTeams = teamsResponse.data.teams

              for (const team of userTeams) {
                const teamMatchmakingResponse = await axios.get(
                  `/api/quickClash/team/${team._id}/matchmaking/status`,
                )

                if (
                  teamMatchmakingResponse.data &&
                  teamMatchmakingResponse.data.inMatchmaking
                ) {
                  inAnyMatchmaking = true

                  dispatch(setSelectedTeamId(team._id))
                  dispatch(setTeamName(team.name || 'Team'))
                  dispatch(setJoinType('regular'))

                  dispatch(
                    updateMatchmakingState({
                      inMatchmaking: true,
                      matchmakingType: 'team',
                      teamName: team.name || 'Team',
                      joinType: 'regular',
                    }),
                  )

                  // Get detailed status
                  statusData = await getDetailedMatchmakingStatus(
                    team._id,
                    'team',
                  )
                  break
                }
              }
            }
          } catch (teamsError) {
            console.error('Error checking user teams matchmaking:', teamsError)
          }
        }

        // If not in any matchmaking, make sure Redux state reflects this
        if (!inAnyMatchmaking && globalMatchmakingState.inMatchmaking) {
          dispatch(resetGlobalMatchmakingState())
        }

        return statusData
      } catch (error) {
        console.error('Error checking matchmaking status:', error)
        return null
      }
    },
    [dispatch, globalMatchmakingState.inMatchmaking],
  )

  // Get detailed matchmaking status from backend
  const getDetailedMatchmakingStatus = async (teamId, type) => {
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
  }

  // Join global matchmaking as solo player
  const joinSoloMatchmaking = useCallback(async () => {
    try {
      // Reset and start timer
      matchmakingStartTimeRef.current = Date.now()
      setLocalMatchmakingTime(0)

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
      if (error.code === 'ALREADY_IN_MATCHMAKING') {
        toast({
          title: t('Already in Matchmaking'),
          description:
            error.reason ||
            error.message ||
            error ||
            t('You are already in an active matchmaking queue'),
          status: 'warning',
          duration: 5000,
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
          duration: 5000,
          isClosable: true,
        })
      }
      throw error
    }
  }, [dispatch, toast, t])

  // Join with team
  const joinWithTeam = useCallback(
    async (teamId, teamName) => {
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
        // Reset and start timer
        matchmakingStartTimeRef.current = Date.now()
        setLocalMatchmakingTime(0)

        if (!teamName) {
          try {
            const teamResponse = await axios.get(
              `/api/quickClash/team/${teamId}`,
            )
            if (teamResponse.data && teamResponse.data.team) {
              teamName = teamResponse.data.team.name || 'Team'
              dispatch(setTeamName(teamName))
            }
          } catch (teamError) {
            console.error('Error fetching team details:', teamError)
          }
        } else {
          dispatch(setTeamName(teamName))
        }

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

        return { ...result, teamName }
      } catch (error) {
        if (error.code === 'ALREADY_IN_MATCHMAKING') {
          let title = t('Already in Matchmaking')
          if (error.memberName) {
            title = t(`${error.memberName} Already in Matchmaking`)
          }

          toast({
            title: title,
            description:
              error.reason ||
              error.message ||
              t('A team member is already in an active matchmaking queue'),
            status: 'warning',
            duration: 5000,
            isClosable: true,
          })
        } else if (error.code === 'NOT_LEADER') {
          toast({
            title: t('Permission Denied'),
            description: t('Only team leaders can start matchmaking'),
            status: 'warning',
            duration: 5000,
            isClosable: true,
          })
        } else {
          toast({
            title: t('Error'),
            description:
              error.reason || error.message || t('Failed to join matchmaking'),
            status: 'error',
            duration: 5000,
            isClosable: true,
          })
        }
        throw error
      }
    },
    [dispatch, toast, t, getSocket],
  )

  // Leave matchmaking
  const leaveMatchmaking = useCallback(async () => {
    try {
      // Reset timer when leaving
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

  // Get selected team ID
  const getSelectedTeamId = () => {
    return globalMatchmakingState.selectedTeamId
  }

  // Helper to format time display (MM:SS)
  const formatMatchmakingTime = useCallback(seconds => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }, [])

  // Navigate to battle when ready
  const enterBattle = useCallback(() => {
    if (globalMatchmakingState.battleReady?.battleId) {
      navigate(
        `/quickclash/teamBattle/${globalMatchmakingState.battleReady.battleId}`,
      )
      dispatch(clearBattleReady())
    } else {
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
    matchmakingTime: localMatchmakingTime,
    teamName: globalMatchmakingState.teamName,
    joinType: globalMatchmakingState.joinType,
    originalTeam: globalMatchmakingState.originalTeam,
    battleReady: globalMatchmakingState.battleReady,
    loading: globalMatchmakingState.loading,
    error: globalMatchmakingState.error,
    teamMembers: globalMatchmakingState.teamMembers,
    socketConnected: globalMatchmakingState.socketConnected,

    // Actions
    pollMatchmakingStatus,
    checkMatchmakingStatus,
    joinSoloMatchmaking,
    joinWithTeam,
    leaveMatchmaking,
    selectTeam,
    enterBattle,
    clearBattleReady: () => dispatch(clearBattleReady()),

    // Helper functions
    formatMatchmakingTime,
    getSelectedTeamId,
  }
}

export default useQuickClashGlobalMatchmaking
