// customHooks/useGameExitWarning.js - Simplified version without React Router dependencies
import { useState, useEffect, useCallback, useRef } from 'react'

export const useGameExitWarning = ({
  isGameActive = false,
  currentAnswers = [],
  gameSession = null,
  gameType = 'normal_quiz',
  timeLeft = 0,
  totalTime = 0,
  onSubmitAndExit,
  enableWarnings = true,
}) => {
  const [showExitWarning, setShowExitWarning] = useState(false)
  const [exitReason, setExitReason] = useState('navigation_away')
  const [isSubmittingExit, setIsSubmittingExit] = useState(false)

  // Refs to track state
  const isShowingWarningRef = useRef(false)
  const hasUserConfirmedExitRef = useRef(false)

  // Calculate current progress
  const getCurrentProgress = useCallback(() => {
    if (!gameSession?.questions) {
      return {
        answeredQuestions: 0,
        totalQuestions: 0,
        completionPercentage: 0,
      }
    }

    let answeredCount = 0
    const totalQuestions = gameSession.questions.length

    if (gameType === 'connections') {
      // For connections, check if any connections are made
      answeredCount = currentAnswers && currentAnswers.length > 0 ? 1 : 0
    } else {
      // For other game types, count non-null answers
      answeredCount = currentAnswers.filter(
        answer => answer !== null && answer !== undefined && answer !== '',
      ).length
    }

    return {
      answeredQuestions: answeredCount,
      totalQuestions: totalQuestions,
      completionPercentage:
        totalQuestions > 0
          ? Math.round((answeredCount / totalQuestions) * 100)
          : 0,
    }
  }, [currentAnswers, gameSession, gameType])

  // Handle beforeunload event (page refresh/close)
  useEffect(() => {
    if (!isGameActive || !enableWarnings) return

    const handleBeforeUnload = event => {
      // Don't show browser warning if our custom warning is already showing
      if (isShowingWarningRef.current || hasUserConfirmedExitRef.current) {
        return
      }

      const message =
        'You have an active game. Are you sure you want to leave? Your progress will be saved.'
      event.preventDefault()
      event.returnValue = message
      return message
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [isGameActive, enableWarnings])

  // Handle browser back button
  useEffect(() => {
    if (!isGameActive || !enableWarnings) return

    const handlePopState = event => {
      if (isShowingWarningRef.current || hasUserConfirmedExitRef.current) {
        return
      }

      // Prevent the navigation by pushing the current state back
      window.history.pushState(null, '', window.location.pathname)

      // Show our custom warning
      setExitReason('back_button')
      setShowExitWarning(true)
      isShowingWarningRef.current = true
    }
    console.log('pushState called for back navigation')
    // Add a history entry to detect back navigation
    window.history.pushState(null, '', window.location.pathname)
    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [isGameActive, enableWarnings])

  // Show exit warning manually (for programmatic triggers)
  const showExitWarningDialog = useCallback(
    (reason = 'navigation_away') => {
      if (
        !isGameActive ||
        isShowingWarningRef.current ||
        hasUserConfirmedExitRef.current
      )
        return

      const progress = getCurrentProgress()
      // Only show warning if there's actual progress
      if (progress.answeredQuestions > 0 || timeLeft < totalTime) {
        setExitReason(reason)
        setShowExitWarning(true)
        isShowingWarningRef.current = true
        console.log('Exit warning shown:', reason)
        return true // Warning was shown
      }

      return false // No warning needed
    },
    [isGameActive, getCurrentProgress, timeLeft, totalTime],
  )

  // Handle user choosing to stay in game
  const handleStayInGame = useCallback(() => {
    setShowExitWarning(false)
    isShowingWarningRef.current = false
    console.log('User chose to stay in game')
  }, [])

  // Handle user confirming exit
  const handleConfirmExit = useCallback(async () => {
    if (isSubmittingExit) return

    setIsSubmittingExit(true)
    hasUserConfirmedExitRef.current = true

    try {
      console.log('User confirmed exit, submitting game...', {
        exitReason,
        answersCount: currentAnswers.length,
      })

      // Submit the game with current progress
      if (onSubmitAndExit) {
        await onSubmitAndExit(currentAnswers, exitReason)
      }

      // Close the warning dialog
      setShowExitWarning(false)
      isShowingWarningRef.current = false

      console.log('Game successfully submitted and exit confirmed')
    } catch (error) {
      console.error('Error during exit submission:', error)
      // Reset states on error but still allow exit
      hasUserConfirmedExitRef.current = false
      setIsSubmittingExit(false)

      // Still close dialog even if submission failed
      setShowExitWarning(false)
      isShowingWarningRef.current = false
    }
  }, [isSubmittingExit, onSubmitAndExit, currentAnswers, exitReason])

  // Disable warnings (when game is completed)
  const disableWarnings = useCallback(() => {
    hasUserConfirmedExitRef.current = true
    setShowExitWarning(false)
    isShowingWarningRef.current = false
    console.log('Exit warnings disabled')
  }, [])

  // Check if user should be warned about exit
  const shouldWarnBeforeExit = useCallback(() => {
    if (!isGameActive || !enableWarnings) return false
    if (hasUserConfirmedExitRef.current) return false
    if (isShowingWarningRef.current) return false

    const progress = getCurrentProgress()
    return progress.answeredQuestions > 0 || timeLeft < totalTime
  }, [isGameActive, enableWarnings, getCurrentProgress, timeLeft, totalTime])

  // Reset warning states (when starting new game)
  const resetWarningState = useCallback(() => {
    hasUserConfirmedExitRef.current = false
    isShowingWarningRef.current = false
    setShowExitWarning(false)
    setIsSubmittingExit(false)
    console.log('Exit warning state reset')
  }, [])

  // Create a wrapper for navigation functions that shows warning if needed
  const createNavigationWrapper = useCallback(
    originalNavigationFn => {
      return (...args) => {
        const warningShown = showExitWarningDialog('navigation_away')
        if (!warningShown) {
          // No warning needed, proceed with navigation
          originalNavigationFn(...args)
        }
        // If warning was shown, navigation will happen after user confirms
      }
    },
    [showExitWarningDialog],
  )

  return {
    // State
    showExitWarning,
    exitReason,
    isSubmittingExit,
    currentProgress: getCurrentProgress(),

    // Actions
    showExitWarningDialog,
    handleStayInGame,
    handleConfirmExit,
    disableWarnings,
    resetWarningState,
    shouldWarnBeforeExit,
    createNavigationWrapper,

    // Utils
    isWarningActive: isShowingWarningRef.current,
    hasUserConfirmedExit: hasUserConfirmedExitRef.current,
  }
}
