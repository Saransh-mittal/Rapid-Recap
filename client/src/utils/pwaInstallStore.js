const PWA_PROMPT_KEY = 'pwa_browser_session'

export const getPWAPromptStatus = () => {
  // Use sessionStorage to manage per-browser-session state
  return sessionStorage.getItem(PWA_PROMPT_KEY) === 'dismissed'
}

export const setPWAPromptDismissal = () => {
  sessionStorage.setItem(PWA_PROMPT_KEY, 'dismissed')
}

export const clearPWAPromptDismissal = () => {
  sessionStorage.removeItem(PWA_PROMPT_KEY)
}
