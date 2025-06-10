// customHooks/useSoloQuickClash.js - COMPLETE SIMPLIFIED VERSION
import { useSelector } from 'react-redux'

/**
 * Simplified hook for Solo Quick Clash - just provides state and actions
 * No socket management - that's handled by useQuickClashSocket
 */
const useSoloQuickClash = () => {
  const socketState = useSelector(state => state.quickClashSocket)
  const quickClashState = useSelector(state => state.quickClash)

  return {
    // Socket state
    isSocketConnected: socketState.isConnected,
    isInSoloRoom: socketState.rooms.quickClash,
    lastEvent: socketState.lastEvent,
    deviceFingerprint: socketState.deviceFingerprint,
    isSocketReady: socketState.isConnected,
    socketListenersSetup: socketState.isInitialized,
    autoInitialize: true, // For backward compatibility

    // Quick Clash state
    activeChallenges: quickClashState.activeChallenges,
    challengeAnalyses: quickClashState.challengeAnalyses,
    userStats: quickClashState.userStats,

    // Status checks
    isReady: () => socketState.isConnected && socketState.rooms.quickClash,
    isInitialized: () => socketState.isInitialized,
    isRoomJoined: () => socketState.rooms.quickClash,

    // Dummy functions for backward compatibility (socket management is centralized)
    setupSoloSocketListeners: () => true,
    cleanupSocketListeners: () => {},
    joinSoloRoom: () => socketState.rooms.quickClash,
    reinitialize: () => true,
  }
}

export default useSoloQuickClash
