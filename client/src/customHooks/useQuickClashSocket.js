// customHooks/useQuickClashSocket.js
import { useState, useCallback, useRef, useEffect } from 'react'
import { useSocket } from './useSocket'
import { useDispatch, useSelector } from 'react-redux'
import { setSocketListening } from '../redux/quickClashSlice'
import { addNoteMessageIfAllowed } from '../redux/appSlice'
import { useTranslation } from 'react-i18next'
import { v4 as uuidv4 } from 'uuid'

/**
 * Base custom hook for managing Quick Clash socket infrastructure
 * Handles general socket setup, device conflicts, and base functionality
 * Specific features (solo challenges, teams) use their own dedicated hooks
 * @returns {Object} Base Quick Clash socket utilities and state
 */
const useQuickClashSocket = () => {
  const {
    socket,
    getSocket,
    emitWithDeviceContext,
    addEventListener,
    deviceFingerprint,
    deviceConflictDetected,
    isSocketReady,
  } = useSocket()
  const dispatch = useDispatch()
  const { t } = useTranslation('QuickClash')

  // Ref to track initialization status and cleanup functions
  const initAttemptedRef = useRef(false)
  const eventCleanupFunctions = useRef([])

  // State for tracking socket events and device conflicts
  const [lastEvent, setLastEvent] = useState(null)
  const [deviceConflictCount, setDeviceConflictCount] = useState(0)
  const isListening = useSelector(state => state.quickClash.socketListening)
  const { user } = useSelector(state => state.auth)
  const userId = user?._id

  // Handle device conflicts
  useEffect(() => {
    if (deviceConflictDetected) {
      setDeviceConflictCount(prev => prev + 1)

      // Add note message for device conflict
      dispatch(
        addNoteMessageIfAllowed({
          id: uuidv4(),
          messageType: 'system',
          eventType: 'deviceConflict',
          data: {
            message: t('Another device/tab is using your account'),
            deviceFingerprint,
          },
          duration: 8000,
          width: '350px',
        }),
      )
    }
  }, [deviceConflictDetected, deviceFingerprint, dispatch, t])

  // FIXED: Stable cleanup function
  const cleanupSocketListeners = useCallback(() => {
    console.log('[QC_BASE_SOCKET] Cleaning up base socket listeners')

    // Clean up all registered event listeners
    eventCleanupFunctions.current.forEach(cleanup => {
      if (typeof cleanup === 'function') {
        cleanup()
      }
    })
    eventCleanupFunctions.current = []

    // Reset state
    initAttemptedRef.current = false
    dispatch(setSocketListening(false))
  }, [dispatch])

  // FIXED: Stable base socket listeners setup
  const setupBaseSocketListeners = useCallback(() => {
    const cleanupFunctions = []

    console.log('[QC_BASE_SOCKET] Setting up base Quick Clash socket listeners')

    // Handle socket reconnection for base functionality
    const cleanupReconnect = addEventListener('reconnect', () => {
      console.log(
        '[QC_BASE_SOCKET] Socket reconnected, re-initializing base...',
      )

      // Reset the initialization flag
      initAttemptedRef.current = false
      dispatch(setSocketListening(false))

      // Re-initialize after a short delay
      setTimeout(() => {
        initializeQuickClashSocket()
      }, 1000)
    })
    cleanupFunctions.push(cleanupReconnect)

    // Handle disconnect for base functionality
    const cleanupDisconnect = addEventListener('disconnect', () => {
      console.log('[QC_BASE_SOCKET] Socket disconnected')
      initAttemptedRef.current = false
      dispatch(setSocketListening(false))
    })
    cleanupFunctions.push(cleanupDisconnect)

    // Store cleanup functions for later use
    eventCleanupFunctions.current = cleanupFunctions

    console.log('[QC_BASE_SOCKET] Base socket listeners setup completed')
  }, [addEventListener, dispatch])

  // FIXED: Stable initialization without circular dependency
  const initializeQuickClashSocket = useCallback(() => {
    // Prevent duplicate initialization attempts
    if (isListening || initAttemptedRef.current) {
      console.log(
        '[QC_BASE_SOCKET] Already listening or initialization attempted, skipping',
      )
      return
    }

    // Mark that we've attempted initialization
    initAttemptedRef.current = true

    if (!isSocketReady()) {
      console.warn(
        '[QC_BASE_SOCKET] Socket not ready for Quick Clash initialization',
      )

      // Reset the attempted flag to allow future attempts
      setTimeout(() => {
        initAttemptedRef.current = false
      }, 500)

      return
    }

    console.log('[QC_BASE_SOCKET] Initializing base Quick Clash socket')

    // Clean up any existing listeners first
    cleanupSocketListeners()

    // Set up base event listeners
    setupBaseSocketListeners()

    // Mark as listening
    dispatch(setSocketListening(true))

    console.log(
      '[QC_BASE_SOCKET] Base Quick Clash socket initialization completed',
    )

    // REMOVED: Direct call to setupSoloSocketListeners() - this created circular dependency
    // Solo hook will auto-initialize when it detects base is ready
  }, [
    isSocketReady,
    isListening,
    dispatch,
    cleanupSocketListeners,
    setupBaseSocketListeners,
  ])

  // Cleanup on unmount only
  useEffect(() => {
    return () => {
      cleanupSocketListeners()
    }
  }, [cleanupSocketListeners])

  // Generic room management functions (for any Quick Clash feature)
  const joinGenericRoom = useCallback(
    roomName => {
      if (isSocketReady()) {
        emitWithDeviceContext(roomName)
        console.log(`[QC_BASE_SOCKET] Joined room: ${roomName}`)
      }
    },
    [isSocketReady, emitWithDeviceContext],
  )

  return {
    // State
    isListening,
    lastEvent,
    deviceFingerprint,
    deviceConflictDetected,
    deviceConflictCount,
    isSocketReady: isSocketReady(),

    // Core functions
    initializeQuickClashSocket,
    cleanupSocketListeners,

    // Generic utilities
    joinGenericRoom,
    emitWithDeviceContext,

    // Socket instance (for advanced use cases)
    socket,
    getSocket,
  }
}

export default useQuickClashSocket
