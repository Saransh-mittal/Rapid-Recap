/**
 * Collection of SSR-safe hooks
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { isClient } from '../utils/environment'
import { safeStorage } from '../utils/storage'

// Safe window size hook
export const useWindowSize = () => {
  const [size, setSize] = useState({
    width: isClient ? window.innerWidth : 1024,
    height: isClient ? window.innerHeight : 768,
  })

  useEffect(() => {
    if (!isClient) return

    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return size
}

// Safe localStorage hook
export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      return safeStorage.local.get(key, initialValue)
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  const setValue = useCallback(
    value => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value
        setStoredValue(valueToStore)
        safeStorage.local.set(key, valueToStore)
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error)
      }
    },
    [key, storedValue],
  )

  return [storedValue, setValue]
}

// Safe media query hook
export const useMediaQuery = query => {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    if (!isClient) return false

    const media = window.matchMedia(query)
    const updateMatch = () => setMatches(media.matches)

    updateMatch()
    media.addListener(updateMatch)
    return () => media.removeListener(updateMatch)
  }, [query])

  return matches
}

// Safe scroll position hook
export const useScrollPosition = () => {
  const [scrollPosition, setScrollPosition] = useState({
    x: isClient ? window.pageXOffset : 0,
    y: isClient ? window.pageYOffset : 0,
  })

  useEffect(() => {
    if (!isClient) return

    const handleScroll = () => {
      setScrollPosition({
        x: window.pageXOffset,
        y: window.pageYOffset,
      })
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return scrollPosition
}

// Safe intersection observer hook
export const useIntersectionObserver = (options = {}) => {
  const [entry, setEntry] = useState(null)
  const elementRef = useRef(null)
  const observerRef = useRef(null)

  useEffect(() => {
    if (!isClient || !elementRef.current) return

    observerRef.current = new IntersectionObserver(
      ([entry]) => setEntry(entry),
      options,
    )

    observerRef.current.observe(elementRef.current)

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [options])

  return [elementRef, entry]
}
