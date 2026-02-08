// src/utils/pwaDetection.js

export const isPWA = () => {
  // Check if running as standalone PWA
  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone || // For iOS
    document.referrer.includes('android-app://')

  // Check if running in supported browser
  const isChrome =
    /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)
  const isSafari =
    /Safari/.test(navigator.userAgent) &&
    /Apple Computer/.test(navigator.vendor)
  const isFirefox = /Firefox/.test(navigator.userAgent)

  // Check if it's within a PWA window
  const isPWAWindow =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true

  return {
    isInstalled: isStandalone || isPWAWindow,
    browser: isChrome
      ? 'chrome'
      : isSafari
      ? 'safari'
      : isFirefox
      ? 'firefox'
      : 'other',
    isSupported: isChrome || isSafari || isFirefox,
  }
}

import { setDeferredPrompt } from './pwaInstallStore'

// Listen for PWA install
export const listenForInstall = callback => {
  window.addEventListener('beforeinstallprompt', e => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault()
    // Stash the event so it can be triggered later.
    setDeferredPrompt(e)

    callback && callback('prompted')
  })

  window.addEventListener('appinstalled', e => {
    callback && callback('installed')
  })
}
