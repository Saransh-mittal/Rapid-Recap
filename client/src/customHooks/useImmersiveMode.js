// Fixed hook for managing immersive mode with better desktop UX
// File: src/customHooks/useImmersiveMode.js

import { useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useMediaQuery } from '@chakra-ui/react'
import { setImmersiveModeActive } from '../redux/articleSlice'

const useImmersiveMode = ({
  enableKeyboardShortcuts = true,
  onModeChange = null,
  onExitImmersive = null,
  // Desktop-specific options
  enableDesktopFeatures = true,
  onDesktopNavigate = null,
  enableMouseIdleDetection = true,
  mouseIdleTimeout = 4000, // Increased from 3000
  enableFullscreenSupport = true,
  enableContextMenu = false,
} = {}) => {
  const dispatch = useDispatch()
  const { isImmersiveModeActive } = useSelector(state => state.articles)

  // Desktop detection and states
  const [isDesktop] = useMediaQuery('(min-width: 992px)')
  const [isMouseIdle, setIsMouseIdle] = useState(false)
  const [showDesktopControls, setShowDesktopControls] = useState(true)
  const [contextMenuPosition, setContextMenuPosition] = useState(null)
  const [isUserInteracting, setIsUserInteracting] = useState(false) // NEW: Track active interaction

  // Refs for desktop features
  const mouseIdleTimeoutRef = useRef(null)
  const controlsTimeoutRef = useRef(null)
  const lastMouseMoveRef = useRef(0)
  const isScrollingRef = useRef(false) // NEW: Track scrolling state
  const interactionTimeoutRef = useRef(null) // NEW: Track interaction state

  // Original functions (maintained for backward compatibility)
  const enableImmersiveMode = useCallback(() => {
    dispatch(setImmersiveModeActive(true))
  }, [dispatch])

  const disableImmersiveMode = useCallback(() => {
    dispatch(setImmersiveModeActive(false))
  }, [dispatch])

  const setImmersiveMode = useCallback(
    isActive => {
      dispatch(setImmersiveModeActive(isActive))
    },
    [dispatch],
  )

  // NEW: Enhanced mouse tracking with better scroll handling
  const handleMouseMove = useCallback(
    e => {
      if (!isDesktop || !enableDesktopFeatures || !enableMouseIdleDetection)
        return

      const now = Date.now()
      lastMouseMoveRef.current = now

      // Don't hide controls during active scrolling
      if (isScrollingRef.current) return

      setIsMouseIdle(false)
      setShowDesktopControls(true)
      setIsUserInteracting(true)

      // Clear existing timeouts
      if (mouseIdleTimeoutRef.current) {
        clearTimeout(mouseIdleTimeoutRef.current)
      }
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
      if (interactionTimeoutRef.current) {
        clearTimeout(interactionTimeoutRef.current)
      }

      // Set interaction timeout (shorter)
      interactionTimeoutRef.current = setTimeout(() => {
        setIsUserInteracting(false)
      }, 1000)

      // Set mouse idle timeout (longer)
      mouseIdleTimeoutRef.current = setTimeout(() => {
        // Only set idle if not recently interacting
        if (!isUserInteracting && !isScrollingRef.current) {
          setIsMouseIdle(true)
        }
      }, mouseIdleTimeout)

      // Hide controls timeout (even longer)
      controlsTimeoutRef.current = setTimeout(() => {
        if (!isUserInteracting && !isScrollingRef.current) {
          setShowDesktopControls(false)
        }
      }, mouseIdleTimeout + 2000) // Increased delay
    },
    [
      isDesktop,
      enableDesktopFeatures,
      enableMouseIdleDetection,
      mouseIdleTimeout,
      isUserInteracting,
    ],
  )

  // NEW: Enhanced scroll detection
  const handleScroll = useCallback(() => {
    if (!isDesktop || !enableDesktopFeatures) return

    isScrollingRef.current = true
    setIsUserInteracting(true)
    setShowDesktopControls(true)
    setIsMouseIdle(false)

    // Clear existing timeouts
    if (mouseIdleTimeoutRef.current) {
      clearTimeout(mouseIdleTimeoutRef.current)
    }
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }

    // Reset scroll state after scroll ends
    setTimeout(() => {
      isScrollingRef.current = false
    }, 150) // Short delay to detect scroll end

    // Don't hide controls immediately after scrolling
    controlsTimeoutRef.current = setTimeout(() => {
      if (!isUserInteracting) {
        setShowDesktopControls(false)
        setIsMouseIdle(true)
      }
    }, mouseIdleTimeout + 1000)
  }, [isDesktop, enableDesktopFeatures, mouseIdleTimeout, isUserInteracting])

  // NEW: Desktop context menu handler
  const handleContextMenu = useCallback(
    e => {
      if (!isDesktop || !enableDesktopFeatures || !enableContextMenu) return

      e.preventDefault()
      setContextMenuPosition({ x: e.clientX, y: e.clientY })
      setShowDesktopControls(true)
      setIsUserInteracting(true)
      setIsMouseIdle(false)
    },
    [isDesktop, enableDesktopFeatures, enableContextMenu],
  )

  // NEW: Close context menu
  const closeContextMenu = useCallback(() => {
    setContextMenuPosition(null)
  }, [])

  // Enhanced keyboard shortcuts with desktop features
  useEffect(() => {
    if (!enableKeyboardShortcuts) return

    const handleKeyPress = event => {
      // Close context menu on any key press
      if (contextMenuPosition) {
        setContextMenuPosition(null)
      }

      // Show controls on any key press
      if (isDesktop && enableDesktopFeatures) {
        setShowDesktopControls(true)
        setIsUserInteracting(true)
        setIsMouseIdle(false)
      }

      if (!isImmersiveModeActive) return

      switch (event.key) {
        case 'Escape':
          event.preventDefault()
          if (onExitImmersive) {
            onExitImmersive()
          } else {
            disableImmersiveMode()
          }
          break

        // Desktop navigation shortcuts
        case 'ArrowUp':
        case 'PageUp':
          if (isDesktop && enableDesktopFeatures && onDesktopNavigate) {
            event.preventDefault()
            onDesktopNavigate(-1)
          }
          break

        case 'ArrowDown':
        case 'PageDown':
        case ' ': // Spacebar
          if (isDesktop && enableDesktopFeatures && onDesktopNavigate) {
            event.preventDefault()
            onDesktopNavigate(1)
          }
          break

        case 'Home':
          if (isDesktop && enableDesktopFeatures && onDesktopNavigate) {
            event.preventDefault()
            onDesktopNavigate('top')
          }
          break

        case 'End':
          if (isDesktop && enableDesktopFeatures && onDesktopNavigate) {
            event.preventDefault()
            onDesktopNavigate('bottom')
          }
          break

        // Toggle controls visibility
        case 'h':
        case 'H':
          if (
            isDesktop &&
            enableDesktopFeatures &&
            (event.ctrlKey || event.metaKey)
          ) {
            event.preventDefault()
            setShowDesktopControls(prev => !prev)
            setIsUserInteracting(true)
          }
          break

        // Fullscreen toggle
        case 'f':
        case 'F':
          if (
            isDesktop &&
            enableDesktopFeatures &&
            enableFullscreenSupport &&
            (event.ctrlKey || event.metaKey)
          ) {
            event.preventDefault()
            if (!document.fullscreenElement) {
              document.documentElement.requestFullscreen?.()
            } else {
              document.exitFullscreen?.()
            }
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)

    return () => {
      window.removeEventListener('keydown', handleKeyPress)
    }
  }, [
    isImmersiveModeActive,
    disableImmersiveMode,
    enableKeyboardShortcuts,
    onExitImmersive,
    isDesktop,
    enableDesktopFeatures,
    onDesktopNavigate,
    enableFullscreenSupport,
    contextMenuPosition,
  ])

  // NEW: Enhanced desktop event listeners with better coordination
  useEffect(() => {
    if (!isDesktop || !enableDesktopFeatures || !isImmersiveModeActive) return

    // Mouse movement tracking
    if (enableMouseIdleDetection) {
      document.addEventListener('mousemove', handleMouseMove, { passive: true })
    }

    // Enhanced scroll detection for desktop
    document.addEventListener('wheel', handleScroll, { passive: true })

    // Context menu handling
    if (enableContextMenu) {
      document.addEventListener('contextmenu', handleContextMenu)
      document.addEventListener('click', closeContextMenu)
    }

    // NEW: Track other user interactions
    const handleUserInteraction = () => {
      setIsUserInteracting(true)
      setShowDesktopControls(true)
      setIsMouseIdle(false)

      if (interactionTimeoutRef.current) {
        clearTimeout(interactionTimeoutRef.current)
      }

      interactionTimeoutRef.current = setTimeout(() => {
        setIsUserInteracting(false)
      }, 1500)
    }

    // Track clicks, key presses, and mouse buttons
    document.addEventListener('click', handleUserInteraction, { passive: true })
    document.addEventListener('mousedown', handleUserInteraction, {
      passive: true,
    })
    document.addEventListener('keydown', handleUserInteraction, {
      passive: true,
    })

    return () => {
      if (enableMouseIdleDetection) {
        document.removeEventListener('mousemove', handleMouseMove)
      }
      document.removeEventListener('wheel', handleScroll)
      if (enableContextMenu) {
        document.removeEventListener('contextmenu', handleContextMenu)
        document.removeEventListener('click', closeContextMenu)
      }
      document.removeEventListener('click', handleUserInteraction)
      document.removeEventListener('mousedown', handleUserInteraction)
      document.removeEventListener('keydown', handleUserInteraction)
    }
  }, [
    isDesktop,
    enableDesktopFeatures,
    isImmersiveModeActive,
    enableMouseIdleDetection,
    enableContextMenu,
    handleMouseMove,
    handleScroll,
    handleContextMenu,
    closeContextMenu,
  ])

  // Desktop performance optimizations
  useEffect(() => {
    if (!isDesktop || !enableDesktopFeatures || !isImmersiveModeActive) return

    // Disable body scroll and optimize for immersive mode
    const originalOverflow = document.body.style.overflow
    const originalScrollBehavior = document.documentElement.style.scrollBehavior

    document.body.style.overflow = 'hidden'
    document.documentElement.style.scrollBehavior = 'auto'

    // Add hardware acceleration
    document.body.classList.add('desktop-immersive-mode')

    // Create performance optimization styles
    const style = document.createElement('style')
    style.id = 'desktop-immersive-styles'
    style.textContent = `
      .desktop-immersive-mode {
        transform: translateZ(0);
        will-change: scroll-position;
        backface-visibility: hidden;
        -webkit-backface-visibility: hidden;
      }

      .desktop-immersive-mode * {
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }

      .desktop-immersive-mode *:focus {
        outline: none;
      }

      .desktop-immersive-mode *::selection {
        background: rgba(159, 122, 234, 0.3);
      }

      /* NEW: Better scroll performance */
      .desktop-immersive-mode *::-webkit-scrollbar {
        width: 6px;
      }

      .desktop-immersive-mode *::-webkit-scrollbar-track {
        background: rgba(255,255,255,0.1);
      }

      .desktop-immersive-mode *::-webkit-scrollbar-thumb {
        background: rgba(159, 122, 234, 0.6);
        border-radius: 3px;
      }
    `

    if (!document.getElementById('desktop-immersive-styles')) {
      document.head.appendChild(style)
    }

    return () => {
      // Restore original settings
      document.body.style.overflow = originalOverflow
      document.documentElement.style.scrollBehavior = originalScrollBehavior
      document.body.classList.remove('desktop-immersive-mode')

      const existingStyle = document.getElementById('desktop-immersive-styles')
      if (existingStyle) {
        document.head.removeChild(existingStyle)
      }
    }
  }, [isDesktop, enableDesktopFeatures, isImmersiveModeActive])

  // Callback for mode changes (maintained for backward compatibility)
  useEffect(() => {
    if (onModeChange) {
      onModeChange(isImmersiveModeActive)
    }
  }, [isImmersiveModeActive, onModeChange])

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (mouseIdleTimeoutRef.current) {
        clearTimeout(mouseIdleTimeoutRef.current)
      }
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
      if (interactionTimeoutRef.current) {
        clearTimeout(interactionTimeoutRef.current)
      }
    }
  }, [])

  // Return enhanced API with backward compatibility
  return {
    // Original API (maintained for backward compatibility)
    isImmersiveModeActive,
    enableImmersiveMode,
    disableImmersiveMode,
    setImmersiveMode,

    // Desktop-specific features
    isDesktop,
    isMouseIdle,
    showDesktopControls,
    setShowDesktopControls,
    contextMenuPosition,
    closeContextMenu,
    isUserInteracting, // NEW: Expose interaction state

    // Desktop helper functions
    toggleFullscreen: useCallback(() => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen?.()
      } else {
        document.exitFullscreen?.()
      }
    }, []),

    forceShowControls: useCallback(() => {
      setShowDesktopControls(true)
      setIsMouseIdle(false)
      setIsUserInteracting(true)

      // Clear existing timeouts
      if (mouseIdleTimeoutRef.current) {
        clearTimeout(mouseIdleTimeoutRef.current)
      }
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
      if (interactionTimeoutRef.current) {
        clearTimeout(interactionTimeoutRef.current)
      }

      // Set new timeouts with longer delays
      interactionTimeoutRef.current = setTimeout(() => {
        setIsUserInteracting(false)
      }, 2000) // Longer interaction time

      mouseIdleTimeoutRef.current = setTimeout(() => {
        if (!isUserInteracting && !isScrollingRef.current) {
          setIsMouseIdle(true)
        }
      }, mouseIdleTimeout + 1000)

      controlsTimeoutRef.current = setTimeout(() => {
        if (!isUserInteracting && !isScrollingRef.current) {
          setShowDesktopControls(false)
        }
      }, mouseIdleTimeout + 3000) // Much longer delay
    }, [mouseIdleTimeout, isUserInteracting]),
  }
}

export default useImmersiveMode
