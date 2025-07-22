// services/onboardingGameService.js
// Service to handle game completion events in onboarding context

/**
 * Dispatches a custom event when an onboarding game is completed
 * @param {Object} gameData - Data about the completed game
 * @param {string} gameData.gameType - Type of game completed
 * @param {number} gameData.score - Score achieved
 * @param {string} gameData.articleId - ID of the article
 */
export const dispatchOnboardingGameComplete = gameData => {
  const event = new CustomEvent('onboardingGameComplete', {
    detail: {
      gameCompleted: true,
      isOnboarding: true,
      ...gameData,
    },
  })
  window.dispatchEvent(event)
}

/**
 * Listens for onboarding game completion events
 * @param {Function} callback - Callback function to handle the event
 * @returns {Function} - Cleanup function to remove the event listener
 */
export const listenForOnboardingGameComplete = callback => {
  const handleGameComplete = event => {
    if (event.detail?.gameCompleted && event.detail?.isOnboarding) {
      callback(event.detail)
    }
  }

  window.addEventListener('onboardingGameComplete', handleGameComplete)

  return () => {
    window.removeEventListener('onboardingGameComplete', handleGameComplete)
  }
}

/**
 * Checks if the current session is an onboarding session
 * @returns {boolean} - True if in onboarding mode
 */
export const isOnboardingSession = () => {
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get('onboarding') === 'true'
}

/**
 * Redirects back to onboarding after game completion
 */
export const redirectToOnboarding = () => {
  const urlParams = new URLSearchParams(window.location.search)
  const sessionId = urlParams.get('sessionId')

  if (sessionId) {
    // Dispatch the completion event with session info
    dispatchOnboardingGameComplete({
      sessionId,
      completedAt: new Date().toISOString(),
    })
  }

  // Small delay to ensure the event is processed
  setTimeout(() => {
    window.history.back()
  }, 100)
}

/**
 * Handles game completion in different contexts
 * @param {Object} gameResult - Result data from the completed game
 * @param {string} context - Context where the game was completed ('onboarding' | 'normal')
 */
export const handleGameCompletion = (gameResult, context = 'normal') => {
  if (context === 'onboarding' || isOnboardingSession()) {
    dispatchOnboardingGameComplete({
      ...gameResult,
      context: 'onboarding',
    })
  }

  // Handle normal game completion logic here if needed
  // This can be extended for regular game completion handling
}

export default {
  dispatchOnboardingGameComplete,
  listenForOnboardingGameComplete,
  isOnboardingSession,
  redirectToOnboarding,
  handleGameCompletion,
}
