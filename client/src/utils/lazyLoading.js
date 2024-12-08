// src/utils/lazyLoading.js
import React from 'react'

/**
 * Creates a preloadable version of a lazy-loaded component
 * @param {Function} importFn - Dynamic import function
 * @returns {Object} Lazy component with preload capability
 */
export const createPreloadableComponent = importFn => {
  let promise = null
  const LazyComponent = React.lazy(() => {
    if (promise === null) {
      promise = importFn()
    }
    return promise
  })

  LazyComponent.preload = () => {
    if (promise === null) {
      promise = importFn()
    }
    return promise
  }

  return LazyComponent
}

/**
 * Creates multiple preloadable components from a components map
 * @param {Object} componentsMap - Object with import functions
 * @returns {Object} Object with preloadable components
 */
export const createPreloadableComponents = componentsMap => {
  return Object.entries(componentsMap).reduce((acc, [key, importFn]) => {
    acc[key] = createPreloadableComponent(importFn)
    return acc
  }, {})
}

/**
 * Preloads multiple components during idle time
 * @param {Array} components - Array of preloadable components
 */
export const preloadComponents = components => {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      components.forEach(component => component.preload())
    })
  } else {
    // Fallback for browsers that don't support requestIdleCallback
    setTimeout(() => {
      components.forEach(component => component.preload())
    }, 0)
  }
}

// Optional: Create a hook for component preloading
export const usePreloadComponents = (components, deps = []) => {
  React.useEffect(() => {
    preloadComponents(components)
  }, deps) // Re-run when dependencies change
}
