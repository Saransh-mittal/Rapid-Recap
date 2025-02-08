// src/utils/browserDetection.js

export const detectEnvironment = () => {
  const userAgent = navigator.userAgent
  const platform = navigator.platform

  // iPad detection - multiple methods for different iOS versions
  const isIPad =
    /iPad/.test(userAgent) || // For older iPads
    (/Macintosh/.test(userAgent) && 'ontouchend' in document) || // For iPad Pro and newer iPads in desktop mode
    (platform === 'MacIntel' && navigator.maxTouchPoints > 1) // Another way to detect iPad Pro

  // Other OS Detection
  const isIPhone = /iPhone|iPod/.test(userAgent)
  const isIOS = isIPad || isIPhone
  const isMacOS = /Mac/.test(userAgent) && !isIOS
  const isAndroid = /Android/.test(userAgent)
  const isWindows = /Windows/.test(userAgent)

  // Browser Detection
  const isChrome =
    /Chrome/.test(userAgent) && /Google Inc/.test(navigator.vendor)
  const isSafari =
    /Safari/.test(userAgent) && /Apple Computer/.test(navigator.vendor)
  const isFirefox = /Firefox/.test(userAgent)
  const isEdge = /Edg/.test(userAgent)
  const isSamsung = /SamsungBrowser/.test(userAgent)

  // Device Type
  const isMobile = /Mobi|Android/i.test(userAgent) || isIOS

  return {
    os: isIOS
      ? 'ios'
      : isAndroid
      ? 'android'
      : isMacOS
      ? 'macos'
      : isWindows
      ? 'windows'
      : 'other',
    browser: isEdge
      ? 'edge'
      : isChrome
      ? 'chrome'
      : isSafari
      ? 'safari'
      : isFirefox
      ? 'firefox'
      : isSamsung
      ? 'samsung'
      : 'other',
    isMobile,
    isIPad,
  }
}

export const getInstallSteps = () => {
  const { os, browser, isMobile } = detectEnvironment()

  const steps = {
    ios: {
      safari: [
        'Tap the Share button in Safari (rectangle with arrow pointing up)',
        'Scroll down and tap "Add to Home Screen"',
        'Name your shortcut if you want, then tap "Add"',
      ],
      other: [
        'Open this website in Safari',
        'Installation is only available in Safari on iOS',
      ],
    },
    android: {
      chrome: [
        'Tap the menu icon (three dots) in Chrome',
        'Select "Install app" or "Add to Home screen"',
        'Follow the installation prompts',
      ],
      samsung: [
        'Tap the menu icon (three dots) in Samsung Browser',
        'Select "Add page to" and then "Home screen"',
        'Tap "Add" to confirm',
      ],
      other: [
        'Open this website in Chrome or Samsung Browser',
        'Installation is supported in Chrome and Samsung Browser on Android',
      ],
    },
    windows: {
      chrome: [
        'Click the menu icon (three dots) in Chrome',
        'Select "Install Rapid Recap..."',
        'Click "Install" in the prompt',
      ],
      edge: [
        'Click the menu icon (three dots) in Edge',
        'Select "Apps" and then "Install Rapid Recap"',
        'Click "Install" to confirm',
      ],
      other: [
        'Open this website in Chrome or Edge',
        'Installation is supported in Chrome and Edge on Windows',
      ],
    },
    macos: {
      chrome: [
        'Click the menu icon (three dots) in Chrome',
        'Select "Install Rapid Recap..."',
        'Click "Install" in the prompt',
      ],
      safari: [
        'Click the Share button in the toolbar (rectangle with arrow pointing up)',
        'Select "Add to Dock" from the menu',
        'Click "Add" to confirm installation',
      ],
      other: [
        'Open this website in Chrome or Safari',
        'Installation is supported in Chrome and Safari on macOS',
      ],
    },
    other: {
      any: [
        'Open this website in a supported browser (Chrome, Edge, or Safari)',
        'Look for installation option in the browser menu',
      ],
    },
  }

  const osSteps = steps[os] || steps.other
  return osSteps[browser] || osSteps.any || steps.other.any
}
