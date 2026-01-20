import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { useLocation } from 'react-router-dom'
import axios from 'axios'
import TutorialOverlay from './TutorialOverlay'
import { usePlayer } from '../../../../hooks/usePlayer'

const TutorialContext = createContext(null)

export const useTutorial = () => useContext(TutorialContext)

export const TutorialProvider = ({ children }) => {
  const dispatch = useDispatch()
  const location = useLocation()

  // Get user/player state using unified hook
  const { player, isSession, isAuthenticated, refresh: refreshPlayer, loading } = usePlayer()

  // Local state for tutorials
  const [activeTutorial, setActiveTutorial] = useState(null)
  const [stepIndex, setStepIndex] = useState(0) // Lifted state
  const [tutorialProgress, setTutorialProgress] = useState({
    lobby: false,
    battle: false,
    squad_intro: false
  })

  // Blocking mechanism for modals (e.g. Welcome Modal, Streak Popup)
  const [isBlocked, setBlocked] = useState(false)


  // Sync progress from Player state (works for both Auth and Session now)
  useEffect(() => {
    if (player?.tutorialProgress) {
       // Only update if values actually match to avoid loop
       const progressString = JSON.stringify(player.tutorialProgress)
       setTutorialProgress(prev => {
          if (JSON.stringify(prev) === progressString) return prev
          return { ...prev, ...player.tutorialProgress }
       })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player?.tutorialProgress ? JSON.stringify(player.tutorialProgress) : null])

  // Core Logic: Check triggers AND auto-dismiss on navigation
  useEffect(() => {
    // Wait for player data to load to avoid race conditions
    if (loading) return

    // Auto-dismiss: If there's an active tutorial but user navigated away from its page
    if (activeTutorial) {
      const isBattleTutorial = activeTutorial === 'battle'
      const isLobbyTutorial = activeTutorial === 'lobby'
      const isSquadIntroTutorial = activeTutorial === 'squad_intro'

      const isOnBattlePage = location.pathname.startsWith('/play/battle/') || location.pathname.startsWith('/quickclash/teamBattle/')
      const isOnLobbyPage = location.pathname === '/play/lobby'
      const isOnQuickClashPage = location.pathname === '/quickclash' || location.pathname === '/quickclash/'

      // Dismiss if tutorial doesn't match current page
      if (isBattleTutorial && !isOnBattlePage) {
        setActiveTutorial(null)
        return
      }
      if (isLobbyTutorial && !isOnLobbyPage) {
        setActiveTutorial(null)
        return
      }
      if (isSquadIntroTutorial && !isOnQuickClashPage) {
        setActiveTutorial(null)
        return
      }
    }

    // Don't trigger if blocked by other modals
    if (isBlocked) return

    // 1. Lobby Tutorial
    if (location.pathname === '/play/lobby') {
      if (!tutorialProgress.lobby && !activeTutorial) {
        const timer = setTimeout(() => {
           setActiveTutorial('lobby')
           setStepIndex(0) // Reset step
        }, 1000)
        return () => clearTimeout(timer)
      }
    }

    // 2. Battle Tutorial (matches both legacy /play/battle/ and new /quickclash/teamBattle/)
    if (location.pathname.startsWith('/play/battle/') || location.pathname.startsWith('/quickclash/teamBattle/')) {
        if (!tutorialProgress.battle && !activeTutorial) {
             const timer = setTimeout(() => {
                setActiveTutorial('battle')
                setStepIndex(0) // Reset step
             }, 1500)
             return () => clearTimeout(timer)
        }
    }

    // 3. Squad Intro Tutorial (GameHub / QuickClash)
    if (location.pathname === '/quickclash' || location.pathname === '/quickclash/') {
        if (!tutorialProgress.squad_intro && !activeTutorial) {
             const timer = setTimeout(() => {
                setActiveTutorial('squad_intro')
                setStepIndex(0) // Reset step
             }, 1000) // Slight delay to ensure page is settled
             return () => clearTimeout(timer)
        }
    }

  }, [location.pathname, tutorialProgress, activeTutorial, loading, isBlocked])

  // Action: Complete Tutorial
  const completeTutorial = useCallback(async (step) => {
    // 1. Optimistic Update
    setTutorialProgress(prev => ({ ...prev, [step]: true }))
    setActiveTutorial(null)

    // 2. Backend Persistence
    try {
      if (isAuthenticated) {
        await axios.post('/api/user/tutorial-progress', { tutorial: step, completed: true })
      } else {
        // Session Player
        const sessionId = player?.sessionId || localStorage.getItem('playSessionId')
        if (sessionId) {
            await axios.post('/api/play/session/tutorial-progress', { tutorial: step, completed: true, sessionId })

            // Also update localStorage immediately for instant persistence on refresh
             const currentProgress = JSON.parse(localStorage.getItem('playSessionTutorialProgress') || '{}')
             currentProgress[step] = true
             localStorage.setItem('playSessionTutorialProgress', JSON.stringify(currentProgress))
        }
      }
      // Refresh player state to ensure persistence is reflected
      if (refreshPlayer) refreshPlayer()
    } catch (err) {
      console.error('Failed to save tutorial progress', err)
      // Silent fail is okay for tutorials, don't block user
    }
  }, [isAuthenticated, player, refreshPlayer])

  const dismissTutorial = useCallback(() => {
      if (activeTutorial) {
          completeTutorial(activeTutorial)
      }
  }, [activeTutorial, completeTutorial])

  // Helper to advance step programmatically
  const nextStep = useCallback(() => {
     setStepIndex(prev => prev + 1)
  }, [])

  return (
    <TutorialContext.Provider value={{
      activeTutorial,
      dismissTutorial,
      tutorialProgress,
      stepIndex,
      nextStep,
      completeTutorial, // Export so overlay can call it on last step
      setBlocked // Expose blocking control
    }}>
      {children}
      {activeTutorial && (
        <TutorialOverlay
            type={activeTutorial}
            isSessionPlayer={isSession || !isAuthenticated}
            stepIndex={stepIndex}
            onNext={nextStep}
            onComplete={() => completeTutorial(activeTutorial)}
            onDismiss={dismissTutorial}
        />
      )}
    </TutorialContext.Provider>
  )
}
