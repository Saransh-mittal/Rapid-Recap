// customHooks/useQuickClashMatchmaking.js
import { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useToast } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import {
  fetchMatchmakingUsers,
  joinMatchmaking,
  leaveMatchmaking,
  createMatchmakingChallenge,
  getMatchmakingStatus,
  setSocketConnected,
  addUser,
  removeUser,
  updateUserStatus,
  setPendingChallenge,
  clearPendingChallenge,
  acceptMatchmakingChallenge,
  setPreparingChallenge,
  removeLockedUser,
  setChallengeReady,
  setMatchChallengeReady,
  setMatchCreationStarted,
  setMatchCreationFailed,
} from '../redux/quickClashMatchmakingSlice'
import { useSocket } from './useSocket'
import { fetchActiveChallenges } from '../redux/quickClashSlice'

/**
 * Custom hook for Quick Clash matchmaking
 * @returns {Object} Matchmaking state and functions
 */
const useQuickClashMatchmaking = () => {
  const dispatch = useDispatch()
  const { socket, getSocket } = useSocket()
  const { _id } = useSelector(state => state.auth.user)
  const toast = useToast()
  const { t } = useTranslation('QuickClash')

  // Redux selectors
  const {
    users,
    usersLoading,
    usersError,
    inMatchmaking,
    matchmakingEntry,
    matchmakingLoading,
    matchmakingError,
    challengeCreating,
    challengeCreationResult,
    challengeCreationError,
    socketConnected,
    pendingChallenge,
  } = useSelector(state => state.quickClashMatchmaking)

  // Local state for polling
  const [pollingInterval, setPollingInterval] = useState(null)

  // Initialize socket connection for matchmaking
  useEffect(() => {
    const initSocket = () => {
      const currentSocket = getSocket()

      if (!currentSocket) {
        console.warn('Socket not available for matchmaking')
        dispatch(setSocketConnected(false))
        return false
      }
      currentSocket.emit('join', 'quickClash:matchmaking')
      // Set up event listeners
      currentSocket.on('quickClash:userJoined', data => {
        if (data.user._id.toString() === _id.toString()) return
        dispatch(addUser(data))
      })

      currentSocket.on('quickClash:userLeft', data => {
        dispatch(removeUser(data.userId))
      })

      currentSocket.on('quickClash:statusUpdated', data => {
        dispatch(updateUserStatus(data))
      })

      currentSocket.on('quickClash:botAcceptedChallenge', data => {
        // Handle bot accepting challenge
        toast({
          title: t('Challenge Accepted'),
          description: t('Your challenge has been accepted'),
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
      })

      currentSocket.on('quickClash:botRejectedChallenge', data => {
        // Handle bot rejecting challenge
        toast({
          title: t('Challenge Declined'),
          description: t('Your challenge has been declined'),
          status: 'info',
          duration: 3000,
          isClosable: true,
        })
      })

      currentSocket.on('quickClash:botCompletedChallenge', data => {
        // Handle bot completing challenge
        toast({
          title: t('Challenge Completed'),
          description: t('Your opponent has completed the challenge'),
          status: 'info',
          duration: 3000,
          isClosable: true,
        })
      })

      currentSocket.on('quickClash:userUnavailable', data => {
        dispatch(removeLockedUser(data.userId))
      })

      currentSocket.on('quickClash:userRemoved', data => {
        dispatch(removeLockedUser(data.userId))
      })

      currentSocket.on('quickClash:preparingChallenge', data => {
        dispatch(setPreparingChallenge(data))

        // Auto leave matchmaking
        leaveMatchmaking().catch(error => {
          console.error('Error leaving matchmaking:', error)
        })
      })

      currentSocket.on('quickClash:matchCreationStarted', data => {
        dispatch(setMatchCreationStarted(data))

        // Show toast
        toast({
          title: t('Challenge Accepted'),
          description: t('Creating your challenge...'),
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
      })

      currentSocket.on('quickClash:matchCreationFailed', data => {
        dispatch(setMatchCreationFailed(data))

        // Show error toast
        toast({
          title: t('Challenge Creation Failed'),
          description: data.error || t('Failed to create challenge'),
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      })

      currentSocket.on('quickClash:matchChallengeReady', data => {
        dispatch(setMatchChallengeReady(data))
        dispatch(fetchActiveChallenges())
        // Show toast
        toast({
          title: t('Challenge Ready'),
          description: t('Your challenge is ready to play!'),
          status: 'success',
          duration: 3000,
          isClosable: true,
          onClick: () => {
            navigate(`/quickclash`)
          },
        })
      })
      // Join the matchmaking room
      currentSocket.emit('quickClash:joinMatchmakingRoom')

      dispatch(setSocketConnected(true))
      return true
    }

    // Try to initialize socket
    const initialized = initSocket()

    // If socket initialization failed, set up polling as fallback
    if (!initialized && !pollingInterval) {
      const interval = setInterval(() => {
        dispatch(fetchMatchmakingUsers())
      }, 10000) // Poll every 10 seconds

      setPollingInterval(interval)
    }

    // Cleanup function
    return () => {
      if (socket) {
        socket.off('quickClash:userJoined')
        socket.off('quickClash:userLeft')
        socket.off('quickClash:statusUpdated')
        socket.off('quickClash:botAcceptedChallenge')
        socket.off('quickClash:botRejectedChallenge')
        socket.off('quickClash:botCompletedChallenge')
        socket.off('quickClash:userUnavailable')
        socket.off('quickClash:userRemoved')
        socket.off('quickClash:preparingChallenge')
        socket.off('quickClash:challengeReady')
        socket.off('quickClash:matchCreationStarted')
        socket.off('quickClash:matchChallengeReady')
        socket.off('quickClash:matchCreationFailed')
      }

      if (pollingInterval) {
        clearInterval(pollingInterval)
      }
    }
  }, [socket, getSocket, dispatch, pollingInterval, t, toast])

  // Function to join matchmaking
  const handleJoinMatchmaking = useCallback(
    categories => {
      // Validate we have exactly 2 categories
      if (
        !categories ||
        !Array.isArray(categories) ||
        categories.length !== 2
      ) {
        toast({
          title: t('Error'),
          description: t('Please select exactly 2 categories'),
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
        return Promise.reject('Invalid categories')
      }

      return dispatch(joinMatchmaking({ categories }))
        .unwrap()
        .then(result => {
          // Emit socket event if we have a socket
          if (socket) {
            socket.emit('quickClash:joinMatchmaking', {
              userId: result.user,
              categories,
            })
          }

          toast({
            title: t('Joined Matchmaking'),
            description: t('Looking for opponents...'),
            status: 'success',
            duration: 3000,
            isClosable: true,
          })

          return result
        })
        .catch(error => {
          toast({
            title: t('Error'),
            description: error || t('Failed to join matchmaking'),
            status: 'error',
            duration: 3000,
            isClosable: true,
          })

          throw error
        })
    },
    [dispatch, socket, toast, t],
  )

  // Function to leave matchmaking
  const handleLeaveMatchmaking = useCallback(() => {
    return dispatch(leaveMatchmaking())
      .unwrap()
      .then(result => {
        // Emit socket event if we have a socket
        if (socket && matchmakingEntry) {
          socket.emit('quickClash:leaveMatchmaking', {
            userId: matchmakingEntry.user,
          })
        }

        toast({
          title: t('Left Matchmaking'),
          status: 'info',
          duration: 3000,
          isClosable: true,
        })

        return result
      })
      .catch(error => {
        toast({
          title: t('Error'),
          description: error || t('Failed to leave matchmaking'),
          status: 'error',
          duration: 3000,
          isClosable: true,
        })

        throw error
      })
  }, [dispatch, socket, matchmakingEntry, toast, t])

  // Function to create a challenge from matchmaking
  const handleCreateChallenge = useCallback(
    (opponentId, categories) => {
      // Validate we have exactly 2 categories
      if (
        !categories ||
        !Array.isArray(categories) ||
        categories.length !== 2
      ) {
        toast({
          title: t('Error'),
          description: t('Please select exactly 2 categories'),
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
        return Promise.reject('Invalid categories')
      }

      // Store pending challenge data for UI state
      dispatch(setPendingChallenge({ opponentId, categories }))

      return dispatch(createMatchmakingChallenge({ opponentId, categories }))
        .unwrap()
        .then(result => {
          toast({
            title: t('Challenge Created'),
            description: t('Challenge sent successfully'),
            status: 'success',
            duration: 3000,
            isClosable: true,
          })

          // Clear pending challenge state
          dispatch(clearPendingChallenge())

          return result
        })
        .catch(error => {
          // Clear pending challenge state on error
          dispatch(clearPendingChallenge())

          toast({
            title: t('Error'),
            description: error || t('Failed to create challenge'),
            status: 'error',
            duration: 3000,
            isClosable: true,
          })

          throw error
        })
    },
    [dispatch, toast, t],
  )

  const handleAcceptChallenge = useCallback(
    (creatorId, categories) => {
      // Validate we have exactly 2 categories
      if (
        !categories ||
        !Array.isArray(categories) ||
        categories.length !== 2
      ) {
        toast({
          title: t('Error'),
          description: t('Please select exactly 2 categories'),
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
        return Promise.reject('Invalid categories')
      }

      // Store pending challenge data for UI state
      dispatch(setPendingChallenge({ opponentId: creatorId, categories }))

      return dispatch(acceptMatchmakingChallenge({ creatorId, categories }))
        .unwrap()
        .then(result => {
          toast({
            title: t('Challenge Accepted'),
            description: t('Challenge is being prepared...'),
            status: 'success',
            duration: 3000,
            isClosable: true,
          })

          // Clear pending challenge state
          dispatch(clearPendingChallenge())

          return result
        })
        .catch(error => {
          // Clear pending challenge state on error
          dispatch(clearPendingChallenge())

          // Race condition has a specific error
          if (error === 'This user is no longer available for challenges') {
            toast({
              title: t('Challenge Already Taken'),
              description: t('This user is no longer available'),
              status: 'warning',
              duration: 3000,
              isClosable: true,
            })
          } else {
            toast({
              title: t('Error'),
              description: error || t('Failed to accept challenge'),
              status: 'error',
              duration: 3000,
              isClosable: true,
            })
          }

          throw error
        })
    },
    [dispatch, toast, t],
  )

  // Function to load available users
  const loadAvailableUsers = useCallback(() => {
    return dispatch(fetchMatchmakingUsers())
  }, [dispatch])

  // Function to check matchmaking status
  const checkMatchmakingStatus = useCallback(() => {
    return dispatch(getMatchmakingStatus())
  }, [dispatch])

  return {
    // State
    users,
    usersLoading,
    usersError,
    inMatchmaking,
    matchmakingEntry,
    matchmakingLoading,
    matchmakingError,
    challengeCreating,
    challengeCreationResult,
    challengeCreationError,
    socketConnected,
    pendingChallenge,

    // Actions
    joinMatchmaking: handleJoinMatchmaking,
    leaveMatchmaking: handleLeaveMatchmaking,
    createChallenge: handleCreateChallenge,
    acceptChallenge: handleAcceptChallenge,
    loadAvailableUsers,
    checkMatchmakingStatus,
  }
}

export default useQuickClashMatchmaking
