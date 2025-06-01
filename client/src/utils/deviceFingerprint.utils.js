// utils/deviceFingerprint.utils.js

/**
 * Generate a unique device fingerprint based on browser and device characteristics
 * This replaces MAC address since it's not accessible from browsers
 * @returns {Promise<string>} Unique device fingerprint
 */
const generateDeviceFingerprint = async () => {
  const fingerprint = {
    // Browser characteristics
    userAgent: navigator.userAgent,
    language: navigator.language,
    languages: navigator.languages?.join(',') || '',
    platform: navigator.platform,

    // Screen characteristics
    screenWidth: screen.width,
    screenHeight: screen.height,
    screenColorDepth: screen.colorDepth,
    screenPixelDepth: screen.pixelDepth,
    availWidth: screen.availWidth,
    availHeight: screen.availHeight,

    // Timezone and locale
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timezoneOffset: new Date().getTimezoneOffset(),

    // Hardware characteristics
    hardwareConcurrency: navigator.hardwareConcurrency || 0,
    maxTouchPoints: navigator.maxTouchPoints || 0,

    // Browser capabilities
    cookieEnabled: navigator.cookieEnabled,
    doNotTrack: navigator.doNotTrack,

    // Canvas fingerprint for uniqueness
    canvasFingerprint: await getCanvasFingerprint(),

    // WebGL fingerprint
    webglFingerprint: getWebGLFingerprint(),

    // Audio context fingerprint
    audioFingerprint: await getAudioFingerprint(),

    // Unique tab identifier
    tabId: generateTabId(),

    // Session storage support
    sessionStorageSupported: !!window.sessionStorage,
    localStorageSupported: !!window.localStorage,

    // Additional entropy
    entropy: Math.random().toString(36).substring(2, 15),
  }

  // Convert to string and hash
  const fingerprintString = JSON.stringify(fingerprint)
  const hash = await hashString(fingerprintString)

  // Combine hash with tab ID for uniqueness per tab
  return `${hash}_${fingerprint.tabId}`
}

/**
 * Generate canvas fingerprint
 * @returns {Promise<string>} Canvas fingerprint
 */
const getCanvasFingerprint = async () => {
  try {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) return 'no_canvas'

    // Draw some shapes and text for fingerprinting
    ctx.textBaseline = 'top'
    ctx.font = '14px Arial'
    ctx.fillStyle = '#f60'
    ctx.fillRect(125, 1, 62, 20)
    ctx.fillStyle = '#069'
    ctx.fillText('Device fingerprint test 🔒', 2, 15)
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)'
    ctx.fillText('Device fingerprint test 🔒', 4, 17)

    // Add some geometric shapes
    ctx.beginPath()
    ctx.arc(100, 100, 50, 0, 2 * Math.PI)
    ctx.stroke()

    return canvas.toDataURL()
  } catch (error) {
    console.warn('Canvas fingerprinting failed:', error)
    return 'canvas_error'
  }
}

/**
 * Generate WebGL fingerprint
 * @returns {string} WebGL fingerprint
 */
const getWebGLFingerprint = () => {
  try {
    const canvas = document.createElement('canvas')
    const gl =
      canvas.getContext('webgl') || canvas.getContext('experimental-webgl')

    if (!gl) return 'no_webgl'

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
    const vendor = debugInfo
      ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)
      : 'unknown'
    const renderer = debugInfo
      ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
      : 'unknown'

    return `${vendor}_${renderer}_${gl.getParameter(gl.VERSION)}`
  } catch (error) {
    console.warn('WebGL fingerprinting failed:', error)
    return 'webgl_error'
  }
}

/**
 * Generate audio context fingerprint
 * @returns {Promise<string>} Audio fingerprint
 */
const getAudioFingerprint = async () => {
  try {
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const analyser = audioContext.createAnalyser()
    const gainNode = audioContext.createGain()
    const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1)

    oscillator.type = 'triangle'
    oscillator.frequency.setValueAtTime(10000, audioContext.currentTime)

    gainNode.gain.setValueAtTime(0, audioContext.currentTime)

    oscillator.connect(analyser)
    analyser.connect(scriptProcessor)
    scriptProcessor.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.start(0)

    return new Promise(resolve => {
      scriptProcessor.addEventListener('audioprocess', function (e) {
        const samples = e.inputBuffer.getChannelData(0)
        let sum = 0
        for (let i = 0; i < samples.length; i++) {
          sum += Math.abs(samples[i])
        }

        oscillator.stop()
        audioContext.close()
        resolve(sum.toString())
      })

      // Fallback timeout
      setTimeout(() => {
        try {
          oscillator.stop()
          audioContext.close()
        } catch (e) {}
        resolve('audio_timeout')
      }, 1000)
    })
  } catch (error) {
    console.warn('Audio fingerprinting failed:', error)
    return 'audio_error'
  }
}

/**
 * Generate unique tab identifier with session component
 * @returns {string} Tab ID
 */
const generateTabId = () => {
  // Try to get existing tab ID from session storage
  if (window.sessionStorage) {
    let tabId = sessionStorage.getItem('device_tab_id')
    if (!tabId) {
      // Include a session start timestamp to make each session unique
      const sessionStart = Date.now()
      tabId = `tab_${sessionStart}_${Math.random()
        .toString(36)
        .substring(2, 15)}`
      sessionStorage.setItem('device_tab_id', tabId)
      sessionStorage.setItem('session_start', sessionStart.toString())
    }
    return tabId
  }

  // Fallback if session storage not available
  return `tab_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
}

/**
 * Hash a string using Web Crypto API
 * @param {string} str - String to hash
 * @returns {Promise<string>} Hashed string
 */
const hashString = async str => {
  try {
    const encoder = new TextEncoder()
    const data = encoder.encode(str)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  } catch (error) {
    console.warn('Crypto hashing failed, using fallback:', error)
    // Fallback hash function
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16)
  }
}

/**
 * Get stored device fingerprint or generate new one
 * @returns {Promise<string>} Device fingerprint
 */
const getDeviceFingerprint = async () => {
  try {
    // Try to get cached fingerprint (without tab ID)
    const cacheKey = 'device_fingerprint_base'
    let cachedFingerprint = null

    if (window.localStorage) {
      cachedFingerprint = localStorage.getItem(cacheKey)
    }

    if (cachedFingerprint) {
      // Add current tab ID to cached fingerprint
      const tabId = generateTabId()
      return `${cachedFingerprint}_${tabId}`
    }

    // Generate new fingerprint
    const fullFingerprint = await generateDeviceFingerprint()

    // Cache the base fingerprint (without tab ID)
    const baseFingerprintMatch = fullFingerprint.match(/^(.+)_tab_/)
    if (baseFingerprintMatch && window.localStorage) {
      localStorage.setItem(cacheKey, baseFingerprintMatch[1])
    }

    return fullFingerprint
  } catch (error) {
    console.error('Device fingerprinting failed:', error)
    // Fallback fingerprint
    const fallback = `fallback_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 15)}`
    const tabId = generateTabId()
    return `${fallback}_${tabId}`
  }
}

/**
 * Check if two fingerprints belong to the same device (ignoring tab differences)
 * @param {string} fp1 - First fingerprint
 * @param {string} fp2 - Second fingerprint
 * @returns {boolean} True if same device
 */
const isSameDevice = (fp1, fp2) => {
  if (!fp1 || !fp2) return false

  // Extract base fingerprints (without tab IDs)
  const base1 = fp1.split('_tab_')[0]
  const base2 = fp2.split('_tab_')[0]

  return base1 === base2
}

/**
 * Clear cached fingerprint (for testing or reset purposes)
 */
const clearCachedFingerprint = () => {
  if (window.localStorage) {
    localStorage.removeItem('device_fingerprint_base')
  }
  if (window.sessionStorage) {
    sessionStorage.removeItem('device_tab_id')
  }
}

export {
  generateDeviceFingerprint,
  getDeviceFingerprint,
  isSameDevice,
  clearCachedFingerprint,
  generateTabId,
}
