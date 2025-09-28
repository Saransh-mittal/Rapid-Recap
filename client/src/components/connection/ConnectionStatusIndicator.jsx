// components/connection/ConnectionStatusIndicator.jsx
import React, { useEffect, useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useSelector } from 'react-redux'
import socketManager from '../../services/socketInitManager'

/**
 * Elegant Animated WiFi Icon
 *
 * Clean, modern WiFi signal with sequential pulse animation
 * Properly oriented with the signal radiating upward
 */
const ElegantWifiIcon = () => {
  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* WiFi Icon Container */}
      <div className="relative w-20 h-20 flex items-center justify-center">
        <svg
          width="80"
          height="80"
          viewBox="0 0 80 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Base dot - always visible with subtle glow */}
          <motion.circle
            cx="40"
            cy="55"
            r="4"
            fill="white"
            initial={{ scale: 0.8 }}
            animate={{ scale: [0.8, 1.1, 0.8] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Small arc */}
          <motion.path
            d="M 30 45 Q 40 35 50 45"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, 0.9, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0,
            }}
          />

          {/* Medium arc */}
          <motion.path
            d="M 23 38 Q 40 21 57 38"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, 0.7, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.4,
            }}
          />

          {/* Large arc */}
          <motion.path
            d="M 16 31 Q 40 7 64 31"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, 0.5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.8,
            }}
          />
        </svg>

        {/* Subtle glow effect behind icon */}
        <motion.div
          className="absolute inset-0 rounded-full bg-white/10 blur-xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Text with dots animation */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-4"
      >
        <div className="flex items-center gap-1">
          <span className="text-white/80 text-sm font-light tracking-wide">
            Reconnecting
          </span>
          <motion.span
            className="text-white/80 text-sm font-light"
            animate={{ opacity: [0, 1, 1, 0] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              times: [0, 0.33, 0.66, 1],
            }}
          >
            .
          </motion.span>
          <motion.span
            className="text-white/80 text-sm font-light"
            animate={{ opacity: [0, 1, 1, 0] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              times: [0, 0.33, 0.66, 1],
              delay: 0.2,
            }}
          >
            .
          </motion.span>
          <motion.span
            className="text-white/80 text-sm font-light"
            animate={{ opacity: [0, 1, 1, 0] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              times: [0, 0.33, 0.66, 1],
              delay: 0.4,
            }}
          >
            .
          </motion.span>
        </div>
      </motion.div>
    </div>
  )
}

/**
 * Alternative Minimalist WiFi Icon (even simpler)
 */
const MinimalistWifiIcon = () => {
  return (
    <div className="relative flex flex-col items-center justify-center gap-3">
      <div className="relative">
        {/* Center dot with pulse */}
        <motion.div
          className="w-2 h-2 bg-white rounded-full"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* WiFi arcs using CSS */}
        {[1, 2, 3].map(index => (
          <motion.div
            key={index}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 border-t-2 border-white rounded-t-full"
            style={{
              width: `${index * 24}px`,
              height: `${index * 12}px`,
              marginTop: `-${index * 6}px`,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.8 - index * 0.2, 0] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: index * 0.3,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      <motion.p
        className="text-white/70 text-xs font-light"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Reconnecting...
      </motion.p>
    </div>
  )
}

/**
 * Main Connection Status Indicator
 * Elegant overlay with WiFi animation when connection is lost
 */
const ConnectionStatusIndicator = () => {
  const { isAuthenticated } = useSelector(state => state.auth)

  const [showIndicator, setShowIndicator] = useState(false)
  const [isBrowser, setIsBrowser] = useState(false)

  const hasBeenConnectedRef = useRef(false)
  const autoRefreshTimerRef = useRef(null)
  const showIndicatorTimerRef = useRef(null)

  const SHOW_INDICATOR_DELAY = 2000
  const AUTO_REFRESH_DELAY = 20000

  useEffect(() => {
    setIsBrowser(true)

    const removeConnectionListener = socketManager.addConnectionListener(
      connected => {
        if (connected) {
          hasBeenConnectedRef.current = true
          setShowIndicator(false)

          if (autoRefreshTimerRef.current) {
            clearTimeout(autoRefreshTimerRef.current)
            autoRefreshTimerRef.current = null
          }
          if (showIndicatorTimerRef.current) {
            clearTimeout(showIndicatorTimerRef.current)
            showIndicatorTimerRef.current = null
          }
        } else if (hasBeenConnectedRef.current && isAuthenticated) {
          showIndicatorTimerRef.current = setTimeout(() => {
            if (!socketManager.isConnected()) {
              setShowIndicator(true)

              autoRefreshTimerRef.current = setTimeout(() => {
                window.location.reload()
              }, AUTO_REFRESH_DELAY - SHOW_INDICATOR_DELAY)
            }
          }, SHOW_INDICATOR_DELAY)
        }
      },
    )

    if (socketManager.isConnected()) {
      hasBeenConnectedRef.current = true
    }

    return () => {
      removeConnectionListener()
      if (autoRefreshTimerRef.current) clearTimeout(autoRefreshTimerRef.current)
      if (showIndicatorTimerRef.current)
        clearTimeout(showIndicatorTimerRef.current)
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (!isAuthenticated) {
      hasBeenConnectedRef.current = false
      setShowIndicator(false)
      if (autoRefreshTimerRef.current) clearTimeout(autoRefreshTimerRef.current)
      if (showIndicatorTimerRef.current)
        clearTimeout(showIndicatorTimerRef.current)
    }
  }, [isAuthenticated])

  const indicatorContent = (
    <AnimatePresence>
      {showIndicator && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="fixed inset-0 z-[9998] flex items-center justify-center"
        >
          {/* Backdrop with gradient and blur */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-black/60 to-black/50 backdrop-blur-md" />

          {/* Content container with subtle glass effect */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{
              duration: 0.3,
              delay: 0.1,
              ease: [0.4, 0, 0.2, 1],
            }}
            className="relative z-10 p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10"
          >
            <ElegantWifiIcon />
            {/* Uncomment below to use minimalist version */}
            {/* <MinimalistWifiIcon /> */}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  if (!isBrowser || !isAuthenticated) {
    return null
  }

  return createPortal(indicatorContent, document.body)
}

export default ConnectionStatusIndicator
