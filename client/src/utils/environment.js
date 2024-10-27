/**
 * Core environment detection utilities
 */

// Basic environment checks
export const isServer = typeof window === 'undefined'
export const isClient = !isServer
export const canUseDOM =
  typeof window !== 'undefined' &&
  window.document &&
  window.document.createElement

// Device and browser detection
export const getDeviceInfo = () => {
  if (!isClient)
    return {
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      userAgent: '',
      isBot: false,
    }

  const userAgent = window.navigator.userAgent.toLowerCase()
  const isMobile =
    /mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm/i.test(
      userAgent,
    )
  const isTablet = /tablet|ipad|playbook|silk|(android(?!.*mobile))/i.test(
    userAgent,
  )
  const isBot = /bot|crawler|spider|crawling/i.test(userAgent)

  return {
    isMobile,
    isTablet,
    isDesktop: !isMobile && !isTablet,
    userAgent,
    isBot,
  }
}

// Performance and capability checks
export const getSystemCapabilities = () => {
  if (!isClient)
    return {
      isLowEndDevice: false,
      isLowEndExperience: false,
      connection: 'unknown',
      deviceMemory: 4,
      hardwareConcurrency: 4,
    }

  const { hardwareConcurrency = 4, deviceMemory = 4 } = window.navigator
  const connection = navigator?.connection?.effectiveType || 'unknown'

  const isLowEndDevice = hardwareConcurrency < 4 || deviceMemory < 4
  const isLowEndExperience =
    isLowEndDevice || ['slow-2g', '2g'].includes(connection)

  return {
    isLowEndDevice,
    isLowEndExperience,
    connection,
    deviceMemory,
    hardwareConcurrency,
  }
}

// Window size and screen utilities
export const getWindowDimensions = () => {
  if (!isClient) return { width: 1024, height: 768, dpr: 1 }

  return {
    width: window.innerWidth,
    height: window.innerHeight,
    dpr: window.devicePixelRatio || 1,
  }
}

// Feature detection
export const getFeatureSupport = () => {
  if (!isClient)
    return {
      webGL: false,
      webP: false,
      serviceWorker: false,
      notification: false,
    }

  return {
    webGL: !!window.WebGLRenderingContext,
    webP:
      document
        .createElement('canvas')
        .toDataURL('image/webp')
        .indexOf('data:image/webp') === 0,
    serviceWorker: 'serviceWorker' in navigator,
    notification: 'Notification' in window,
  }
}

// Safe environment getter that combines all info
export const getEnvironmentInfo = () => ({
  isServer,
  isClient,
  canUseDOM,
  ...getDeviceInfo(),
  ...getSystemCapabilities(),
  ...getWindowDimensions(),
  ...getFeatureSupport(),
})
