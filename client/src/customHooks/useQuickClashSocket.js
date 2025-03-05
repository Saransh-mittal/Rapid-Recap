// customHooks/useQuickClashSocket.js
import { useState, useCallback, useRef } from 'react'
import { useSocket } from './useSocket'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchActiveChallenges,
  setChallengeAnalysisLoading,
  setChallengeAnalysis,
  setSocketListening,
} from '../redux/quickClashSlice'
import { addNoteMessageIfAllowed } from '../redux/appSlice'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { v4 as uuidv4 } from 'uuid'

/**
 * Custom hook for managing Quick Clash socket events
 * @returns {Object} Quick Clash socket event handlers and state
 */
const useQuickClashSocket = () => {
  const { socket, getSocket } = useSocket()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { t } = useTranslation('QuickClash')

  // Ref to track initialization status
  const initAttemptedRef = useRef(false)
  const maxRetries = 5
  const retryCount = useRef(0)

  // State for tracking socket events
  const [lastEvent, setLastEvent] = useState(null)
  const isListening = useSelector(state => state.quickClash.socketListening)

  // Initialize and setup socket handlers
  const initializeQuickClashSocket = useCallback(() => {
    // Prevent duplicate initialization attempts
    if (isListening || initAttemptedRef.current) {
      return
    }

    // Mark that we've attempted initialization
    initAttemptedRef.current = true

    const currentSocket = getSocket()

    if (!currentSocket) {
      console.warn('Socket not available yet for Quick Clash initialization')

      // Reset the attempted flag to allow future attempts
      setTimeout(() => {
        initAttemptedRef.current = false
      }, 500)

      return
    }

    // Set up event listeners
    setupSocketListeners(currentSocket)

    // Join the quick clash notification room
    currentSocket.emit('quickClash:join')

    // Mark as listening
    dispatch(setSocketListening(true))
    console.log('Quick Clash socket initialized successfully')
  }, [getSocket, isListening, dispatch])

  // Set up socket event listeners
  const setupSocketListeners = useCallback(
    socket => {
      if (!socket) return

      // Clean up any existing listeners first to prevent duplicates
      socket.off('quickClash:newChallenge')
      socket.off('quickClash:challengerNotified')
      socket.off('quickClash:challengeAccepted')
      socket.off('quickClash:challengeRejected')
      socket.off('quickClash:challengeCompleted')
      socket.off('quickClash:challengeCompletedByBothPlayers')
      socket.off('quickClash:analysisReady')

      // New challenge received
      socket.on('quickClash:newChallenge', data => {
        console.log('New Quick Clash challenge received:', data)
        setLastEvent({ type: 'newChallenge', data, timestamp: new Date() })

        // Add to note message queue for in-app notification
        dispatch(
          addNoteMessageIfAllowed({
            id: uuidv4(),
            messageType: 'quickClash',
            eventType: 'newChallenge',
            data: data,
            duration: 10000,
            width: '350px',
          }),
        )

        // Refresh active challenges list
        dispatch(fetchActiveChallenges())
      })

      socket.on('quickClash:challengerNotified', data => {
        console.log('Quick Clash challenge creation status:', data)
        setLastEvent({
          type: 'challengerNotified',
          data,
          timestamp: new Date(),
        })

        if (data.success) {
          // Add to note message queue for success notification
          dispatch(
            addNoteMessageIfAllowed({
              id: uuidv4(),
              messageType: 'quickClash',
              eventType: 'challengeCreated',
              data: data,
              duration: 8000,
              width: '350px',
            }),
          )
        } else {
          // Add to note message queue for failure notification
          dispatch(
            addNoteMessageIfAllowed({
              id: uuidv4(),
              messageType: 'quickClash',
              eventType: 'challengeCreateFailed',
              data: {
                ...data,
                errorMessage: data.errorMessage || t('Unknown error'),
              },
              duration: 8000,
              width: '350px',
            }),
          )
        }

        // Refresh active challenges list in either case
        dispatch(fetchActiveChallenges())
      })

      // Challenge accepted
      socket.on('quickClash:challengeAccepted', data => {
        console.log('Quick Clash challenge accepted:', data)
        setLastEvent({ type: 'challengeAccepted', data, timestamp: new Date() })

        // Add to note message queue
        dispatch(
          addNoteMessageIfAllowed({
            id: uuidv4(),
            messageType: 'quickClash',
            eventType: 'challengeAccepted',
            data: data,
            duration: 10000,
            width: '350px',
          }),
        )

        // Refresh active challenges list
        dispatch(fetchActiveChallenges())
      })

      // Challenge rejected
      socket.on('quickClash:challengeRejected', data => {
        console.log('Quick Clash challenge rejected:', data)
        setLastEvent({ type: 'challengeRejected', data, timestamp: new Date() })

        // Add to note message queue
        dispatch(
          addNoteMessageIfAllowed({
            id: uuidv4(),
            messageType: 'quickClash',
            eventType: 'challengeRejected',
            data: data,
            duration: 8000,
            width: '350px',
          }),
        )

        // Refresh active challenges list
        dispatch(fetchActiveChallenges())
      })

      // Challenge completed
      socket.on('quickClash:challengeCompleted', data => {
        console.log('Quick Clash challenge completed:', data)
        setLastEvent({
          type: 'challengeCompleted',
          data,
          timestamp: new Date(),
        })

        // Add to note message queue
        dispatch(
          addNoteMessageIfAllowed({
            id: uuidv4(),
            messageType: 'quickClash',
            eventType: 'challengeCompleted',
            data: data,
            duration: 10000,
            width: '350px',
          }),
        )

        // Refresh active challenges list
        dispatch(fetchActiveChallenges())
      })
      socket.on('quickClash:challengeCompletedByBothPlayers', data => {
        console.log('Quick Clash challenge completed:', data)
        setLastEvent({
          type: 'challengeCompletedByBothPlayers',
          data,
          timestamp: new Date(),
        })

        // Add to note message queue
        dispatch(
          addNoteMessageIfAllowed({
            id: uuidv4(),
            messageType: 'quickClash',
            eventType: 'challengeCompletedByBothPlayers',
            data: data,
            duration: 10000,
            width: '350px',
          }),
        )

        // Refresh active challenges list
        dispatch(fetchActiveChallenges())
      })

      // Analysis ready
      socket.on('quickClash:analysisReady', data => {
        console.log('Quick Clash analysis ready:', data)
        setLastEvent({ type: 'analysisReady', data, timestamp: new Date() })

        // Add to note message queue
        dispatch(
          addNoteMessageIfAllowed({
            id: uuidv4(),
            messageType: 'quickClash',
            eventType: 'analysisReady',
            data: data,
            duration: 10000,
            width: '350px',
          }),
        )

        // Update the analysis state if needed
        dispatch(
          setChallengeAnalysisLoading({
            challengeId: data.challengeId,
            isLoading: false,
          }),
        )
      })

      // Handle socket reconnection
      socket.on('reconnect', () => {
        console.log('Socket reconnected, re-joining Quick Clash rooms')
        // Reset the initialization flag
        initAttemptedRef.current = false
        dispatch(setSocketListening(false))
      })
    },
    [dispatch, t, fetchActiveChallenges],
  )

  // Clean up event listeners
  const cleanupSocketListeners = useCallback(() => {
    if (socket) {
      socket.off('quickClash:newChallenge')
      socket.off('quickClash:challengerNotified')
      socket.off('quickClash:challengeAccepted')
      socket.off('quickClash:challengeRejected')
      socket.off('quickClash:challengeCompleted')
      socket.off('quickClash:challengeCompletedByBothPlayers')
      socket.off('quickClash:analysisReady')
      socket.off('reconnect')

      // Reset state
      initAttemptedRef.current = false
      dispatch(setSocketListening(false))
      console.log('Quick Clash socket listeners cleaned up')
    }
  }, [socket, dispatch])

  // Emit events - all with improved error handling
  const emitChallengeCreated = useCallback(
    data => {
      if (socket && socket.connected) {
        try {
          socket.emit('quickClash:createChallenge', data)
          console.log('Emitted quickClash:createChallenge:', data)
        } catch (error) {
          console.error('Error emitting quickClash:createChallenge:', error)
        }
      } else {
        console.warn(
          'Socket not connected, unable to emit quickClash:createChallenge',
        )
      }
    },
    [socket],
  )

  const emitChallengeAccepted = useCallback(
    data => {
      if (socket && socket.connected) {
        try {
          socket.emit('quickClash:acceptChallenge', data)
          console.log('Emitted quickClash:acceptChallenge:', data)
        } catch (error) {
          console.error('Error emitting quickClash:acceptChallenge:', error)
        }
      } else {
        console.warn(
          'Socket not connected, unable to emit quickClash:acceptChallenge',
        )
      }
    },
    [socket],
  )

  const emitChallengeRejected = useCallback(
    data => {
      if (socket && socket.connected) {
        try {
          socket.emit('quickClash:rejectChallenge', data)
          console.log('Emitted quickClash:rejectChallenge:', data)
        } catch (error) {
          console.error('Error emitting quickClash:rejectChallenge:', error)
        }
      } else {
        console.warn(
          'Socket not connected, unable to emit quickClash:rejectChallenge',
        )
      }
    },
    [socket],
  )

  const emitChallengeCompleted = useCallback(
    data => {
      if (socket && socket.connected) {
        try {
          socket.emit('quickClash:completeChallenge', data)
          console.log('Emitted quickClash:completeChallenge:', data)
        } catch (error) {
          console.error('Error emitting quickClash:completeChallenge:', error)
        }
      } else {
        console.warn(
          'Socket not connected, unable to emit quickClash:completeChallenge',
        )
      }
    },
    [socket],
  )

  const emitAnalysisReady = useCallback(
    data => {
      if (socket && socket.connected) {
        try {
          socket.emit('quickClash:analysisReady', data)
          console.log('Emitted quickClash:analysisReady:', data)
        } catch (error) {
          console.error('Error emitting quickClash:analysisReady:', error)
        }
      } else {
        console.warn(
          'Socket not connected, unable to emit quickClash:analysisReady',
        )
      }
    },
    [socket],
  )

  return {
    isListening,
    lastEvent,
    initializeQuickClashSocket,
    emitChallengeCreated,
    emitChallengeAccepted,
    emitChallengeRejected,
    emitChallengeCompleted,
    emitAnalysisReady,
    cleanupSocketListeners,
  }
}

export default useQuickClashSocket
