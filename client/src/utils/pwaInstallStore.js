// src/utils/pwaInstallStore.js

const PWA_PROMPT_DISMISSED = 'pwa_prompt_dismissed'
const DISMISS_DURATION_DAYS = 7

export const getPWAPromptStatus = () => {
  try {
    const stored = localStorage.getItem(PWA_PROMPT_DISMISSED)
    if (!stored) return false

    const { timestamp } = JSON.parse(stored)
    const now = new Date().getTime()
    const daysSinceDismiss = (now - timestamp) / (1000 * 60 * 60 * 24)

    return daysSinceDismiss < DISMISS_DURATION_DAYS
  } catch (error) {
    return false
  }
}

export const clearPWAPromptDismissal = () => {
  localStorage.removeItem(PWA_PROMPT_DISMISSED)
}
