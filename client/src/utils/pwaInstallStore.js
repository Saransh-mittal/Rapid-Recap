const PWA_PROMPT_KEY = 'pwa_prompt_dismissed'

// Store the event in memory (it cannot be serialized to storage)
let deferredPrompt = null

export const getPWAPromptStatus = () => {
  // Use sessionStorage to manage per-browser-session state
  return sessionStorage.getItem(PWA_PROMPT_KEY) === 'true'
}

export const setPWAPromptDismissal = () => {
  sessionStorage.setItem(PWA_PROMPT_KEY, 'true')
}

export const clearPWAPromptDismissal = () => {
  sessionStorage.removeItem(PWA_PROMPT_KEY)
}

// New methods for handling the install prompt event
export const setDeferredPrompt = (e) => {
  deferredPrompt = e
}

export const getDeferredPrompt = () => {
  return deferredPrompt
}

export const clearDeferredPrompt = () => {
  deferredPrompt = null
}
