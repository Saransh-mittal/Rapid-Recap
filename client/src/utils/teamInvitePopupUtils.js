// utils/teamInvitePopupUtils.js
// Utility functions for managing the occasional team invite popup
// Uses localStorage to track cooldowns, dismiss counts, and probability

const POPUP_STORAGE_KEY = 'qc_team_invite_popup'
const COOLDOWN_DAYS = 3

/**
 * Get popup data from localStorage
 */
const getPopupData = () => {
  try {
    const data = localStorage.getItem(POPUP_STORAGE_KEY)
    return data ? JSON.parse(data) : {}
  } catch (e) {
    return {}
  }
}

/**
 * Save popup data to localStorage
 */
const savePopupData = (data) => {
  try {
    localStorage.setItem(POPUP_STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    console.warn('Failed to save popup data:', e)
  }
}

/**
 * Get current probability based on dismiss count
 * Decreases with each dismissal to be less annoying
 */
export const getPopupProbability = () => {
  const data = getPopupData()
  const dismissCount = data.dismissCount || 0

  // Probability decreases with each dismiss
  if (dismissCount === 0) return 0.6  // 60% first time
  if (dismissCount === 1) return 0.4  // 40%
  if (dismissCount === 2) return 0.25 // 25%
  return 0.15 // 15% for persistent dismissers
}

/**
 * Check if popup should be shown based on:
 * 1. User has team with empty slots
 * 2. Cooldown period has passed (3 days)
 * 3. Random probability check
 * 4. Not a session player
 */
export const shouldShowTeamInvitePopup = (teams, isSession) => {
  // Never show for session players
  if (isSession) return { show: false, team: null }

  // Check for team with empty slots
  const teamWithEmptySlots = teams?.find(t => (t?.members?.length || 0) < 4)
  if (!teamWithEmptySlots) return { show: false, team: null }

  const data = getPopupData()
  const lastShown = data.lastShown ? new Date(data.lastShown) : null
  const now = new Date()

  // Check cooldown (3 days)
  if (lastShown) {
    const daysSinceLastShown = (now - lastShown) / (1000 * 60 * 60 * 24)
    if (daysSinceLastShown < COOLDOWN_DAYS) {
      return { show: false, team: null }
    }
  }

  // Probability check
  const probability = getPopupProbability()
  const roll = Math.random()

  if (roll > probability) {
    return { show: false, team: null }
  }

  return { show: true, team: teamWithEmptySlots }
}

/**
 * Record that the popup was shown
 */
export const recordPopupShown = (teamId) => {
  const data = getPopupData()
  savePopupData({
    ...data,
    lastShown: new Date().toISOString(),
    lastTeamId: teamId,
  })
}

/**
 * Record that user dismissed the popup
 */
export const recordPopupDismissed = () => {
  const data = getPopupData()
  savePopupData({
    ...data,
    dismissCount: (data.dismissCount || 0) + 1,
    lastDismissed: new Date().toISOString(),
  })
}

/**
 * Record that user clicked invite (reset dismiss count as they engaged)
 */
export const recordPopupInviteClicked = () => {
  const data = getPopupData()
  savePopupData({
    ...data,
    dismissCount: 0, // Reset since they engaged positively
    lastInviteClicked: new Date().toISOString(),
  })
}
