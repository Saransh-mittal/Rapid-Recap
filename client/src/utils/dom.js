/**
 * Safe DOM manipulation utilities
 */

import { isClient, canUseDOM } from './environment'

// Safe element getter
export const getElement = (selector, context = document) => {
  try {
    return canUseDOM ? context.querySelector(selector) : null
  } catch (error) {
    console.warn('Error getting element:', error)
    return null
  }
}

// Safe elements getter
export const getElements = (selector, context = document) => {
  try {
    return canUseDOM ? Array.from(context.querySelectorAll(selector)) : []
  } catch (error) {
    console.warn('Error getting elements:', error)
    return []
  }
}

// Safe event handling
export const safeAddEventListener = (element, event, handler, options = {}) => {
  try {
    if (element && element.addEventListener) {
      element.addEventListener(event, handler, options)
      return true
    }
    return false
  } catch (error) {
    console.warn('Error adding event listener:', error)
    return false
  }
}

export const safeRemoveEventListener = (
  element,
  event,
  handler,
  options = {},
) => {
  try {
    if (element && element.removeEventListener) {
      element.removeEventListener(event, handler, options)
      return true
    }
    return false
  } catch (error) {
    console.warn('Error removing event listener:', error)
    return false
  }
}

// Safe style manipulation
export const safeSetStyle = (element, styles = {}) => {
  try {
    if (element && element.style) {
      Object.entries(styles).forEach(([property, value]) => {
        element.style[property] = value
      })
      return true
    }
    return false
  } catch (error) {
    console.warn('Error setting styles:', error)
    return false
  }
}

// Safe class manipulation
export const safeAddClass = (element, className) => {
  try {
    if (element && element.classList) {
      element.classList.add(className)
      return true
    }
    return false
  } catch (error) {
    console.warn('Error adding class:', error)
    return false
  }
}

export const safeRemoveClass = (element, className) => {
  try {
    if (element && element.classList) {
      element.classList.remove(className)
      return true
    }
    return false
  } catch (error) {
    console.warn('Error removing class:', error)
    return false
  }
}

// Safe scroll utilities
export const safeScrollTo = (options = {}) => {
  try {
    if (!isClient) return false
    window.scrollTo({
      top: options.top || 0,
      left: options.left || 0,
      behavior: options.behavior || 'smooth',
    })
    return true
  } catch (error) {
    console.warn('Error scrolling:', error)
    return false
  }
}

// Safe dimension getters
export const getElementDimensions = element => {
  try {
    if (!element) return { width: 0, height: 0, top: 0, left: 0 }
    const rect = element.getBoundingClientRect()
    return {
      width: rect.width,
      height: rect.height,
      top: rect.top + window.pageYOffset,
      left: rect.left + window.pageXOffset,
    }
  } catch (error) {
    console.warn('Error getting element dimensions:', error)
    return { width: 0, height: 0, top: 0, left: 0 }
  }
}

// Safe viewport checks
export const isInViewport = (element, offset = 0) => {
  try {
    if (!element || !isClient) return false
    const rect = element.getBoundingClientRect()
    return (
      rect.top >= 0 - offset &&
      rect.left >= 0 - offset &&
      rect.bottom <=
        (window.innerHeight || document.documentElement.clientHeight) +
          offset &&
      rect.right <=
        (window.innerWidth || document.documentElement.clientWidth) + offset
    )
  } catch (error) {
    console.warn('Error checking viewport:', error)
    return false
  }
}
