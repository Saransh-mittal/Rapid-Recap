// customHooks/useQuickClashMatchmaking.js
import { useCallback, useEffect, useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useToast } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import {
  joinMatchmaking,
  leaveMatchmaking,
  getMatchmakingStatus,
  setSocketConnected,
  setPreparingChallenge,
  setMatchCreationStarted,
  setMatchChallengeReady,
  setMatchCreationFailed,
  clearChallengeError,
  setInMatchmaking,
  setPreparationProgress,
  setPreparationStep,
} from '../redux/quickClashMatchmakingSlice'
import { useSocket } from './useSocket'
import { fetchActiveChallenges } from '../redux/quickClashSlice'
import { addNoteMessageIfAllowed } from '../redux/appSlice'
import { v4 as uuidv4 } from 'uuid'

/**
 * Custom hook for Quick Clash matchmaking
 * Focuses only on matchmaking functionality - challenge events are handled by useQuickClashSocket
 * @returns {Object} Matchmaking state and functions
 */
const useQuickClashMatchmaking = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { getSocket } = useSocket()
  const toast = useToast()
  const { t } = useTranslation('QuickClash')

  // Get current user ID
  const { user } = useSelector(state => state.auth)
  const userId = user?._id?.toString()

  // Redux selectors
  const {
    inMatchmaking,
    matchmakingEntry,
    matchmakingLoading,
    matchmakingError,
    challengeCreating,
    challengeCreationResult,
    challengeCreationError,
    socketConnected,
    challengeCreationData,
    challengeReady,
    preparingChallenge,
    preparationProgress,
    preparationStep,
  } = useSelector(state => state.quickClashMatchmaking)

  // Setup socket event listeners - only for matchmaking events
  const setupSocketListeners = useCallback(
    currentSocket => {
      if (!currentSocket) return

      // Clean up any existing listeners first to avoid duplicates
      cleanupSocketListeners(currentSocket)

      // NEW: Listen for match found events
      currentSocket.on('quickClash:matchFound', data => {
        // Set match preparation state in Redux
        dispatch(setPreparingChallenge(data))

        // If we're in matchmaking, consider us "out" now as we found a match
        dispatch(setInMatchmaking(false))

        // Initialize progress
        dispatch(setPreparationProgress(5))
        dispatch(setPreparationStep('matchFound'))

        // You can also play a sound here if desired
        toast({
          title: t('Match Found!'),
          description: t('Preparing your challenge...'),
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
      })

      // NEW: Listen for challenge progress updates
      currentSocket.on('quickClash:challengeProgress', data => {
        if (data.progress) {
          dispatch(setPreparationProgress(data.progress))
        }

        if (data.step) {
          dispatch(setPreparationStep(data.step))
        }
      })

      // Listen for challenge ready events
      currentSocket.on('quickClash:matchChallengeReady', data => {
        // Update Redux state
        dispatch(setMatchChallengeReady(data))

        // Ensure progress is shown as complete
        dispatch(setPreparationProgress(100))
        dispatch(setPreparationStep('challengeReady'))

        // Refresh active challenges list
        dispatch(fetchActiveChallenges())

        toast({
          title: t('Challenge Ready!'),
          description: t('Your challenge is ready to play!'),
          status: 'success',
          duration: 3000,
          isClosable: true,
          onClick: () => {
            navigate(`/quickclash`)
          },
        })

        dispatch(
          addNoteMessageIfAllowed({
            id: uuidv4(),
            messageType: 'quickClash',
            eventType: 'challengeReady',
            data: {
              challengeId: data.challengeId,
            },
            duration: 10000,
            width: '350px',
            actions: [
              {
                text: t('Play Now'),
                actionType: 'NAVIGATE',
                route: `/quickclash/session/${data.challengeId}`,
              },
            ],
          }),
        )
      })

      // Reconnect handling
      currentSocket.on('reconnect', () => {
        checkMatchmakingStatus()
      })
    },
    [userId, dispatch, toast, t, navigate],
  )

  // Clean up socket event listeners
  const cleanupSocketListeners = useCallback(currentSocket => {
    if (!currentSocket) return
    // Remove all matchmaking-related event listeners
    currentSocket.off('quickClash:joinedMatchmaking')
    currentSocket.off('quickClash:matchFound')
    currentSocket.off('quickClash:challengeProgress')
    currentSocket.off('quickClash:matchChallengeReady')
    currentSocket.off('quickClash:botAcceptedChallenge')
    currentSocket.off('reconnect')
  }, [])

  // Function to check matchmaking status
  const checkMatchmakingStatus = useCallback(() => {
    return dispatch(getMatchmakingStatus())
      .unwrap()
      .then(result => {
        return result
      })
      .catch(error => {
        console.error('Error checking matchmaking status:', error)
      })
  }, [dispatch])

  // Initialize socket connection for matchmaking
  useEffect(() => {
    // Only attempt socket initialization if we have a userId
    if (!userId) return

    const currentSocket = getSocket()
    if (!currentSocket) {
      console.warn('Socket not available for matchmaking')
      dispatch(setSocketConnected(false))
      return
    }

    // Set up socket listeners and connections
    currentSocket.emit('join', 'quickClash:matchmaking')
    setupSocketListeners(currentSocket)

    // Join the personal quickClash room
    currentSocket.emit('quickClash:joinMatchmakingRoom')

    // Set connected status
    dispatch(setSocketConnected(true))

    // Check status on connection
    dispatch(getMatchmakingStatus())

    // Cleanup function
    return () => {
      cleanupSocketListeners(currentSocket)
      dispatch(setSocketConnected(false))
    }
  }, [
    userId,
    getSocket,
    setupSocketListeners,
    cleanupSocketListeners,
    dispatch,
  ])

  // Display error toast if matchmaking has an error
  useEffect(() => {
    if (matchmakingError) {
      toast({
        title: t('Error'),
        description: matchmakingError,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }, [matchmakingError, toast, t])

  // Display error toast if challenge creation has an error
  useEffect(() => {
    if (challengeCreationError) {
      toast({
        title: t('Error'),
        description: challengeCreationError,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })

      // Clear the error
      dispatch(clearChallengeError())
    }
  }, [challengeCreationError, toast, t, dispatch])

  // Function to join matchmaking
  const handleJoinMatchmaking = useCallback(() => {
    // Clear any previous timeout
    dispatch(setInMatchmaking(true))
    return dispatch(joinMatchmaking())
      .unwrap()
      .then(result => {
        // Emit socket event if we have a socket
        const currentSocket = getSocket()
        if (currentSocket && result) {
          // This will trigger the server to emit 'quickClash:joinedMatchmaking' back
          currentSocket.emit('quickClash:joinMatchmaking')
        }

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
  }, [dispatch, getSocket, t, toast])

  // Function to leave matchmaking
  const handleLeaveMatchmaking = useCallback(() => {
    return dispatch(leaveMatchmaking())
      .unwrap()
      .then(result => {
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
  }, [dispatch, t, toast])

  return {
    // State
    inMatchmaking,
    matchmakingEntry,
    matchmakingLoading,
    matchmakingError,
    challengeCreating,
    challengeCreationResult,
    challengeCreationError,
    socketConnected,
    challengeCreationData,
    challengeReady,
    preparingChallenge,
    preparationProgress,
    preparationStep,

    // Actions
    joinMatchmaking: handleJoinMatchmaking,
    leaveMatchmaking: handleLeaveMatchmaking,
    checkMatchmakingStatus,

    // Socket management
    setupSocketListeners,
    cleanupSocketListeners,
  }
}

export default useQuickClashMatchmaking
