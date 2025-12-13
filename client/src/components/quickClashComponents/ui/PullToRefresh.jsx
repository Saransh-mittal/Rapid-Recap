// components/quickClashComponents/ui/PullToRefresh.jsx
// Premium pull-to-refresh with crossed swords animation

import React, { memo, useState, useCallback, useRef, useEffect } from 'react'
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion'
import { Swords, Loader2 } from 'lucide-react'
import { haptics } from '../../../utils/haptics'

const MotionDiv = motion.div

/**
 * Pull-to-Refresh component with Quick Clash themed animation
 *
 * @example
 * <PullToRefresh onRefresh={async () => await loadData()}>
 *   <YourContent />
 * </PullToRefresh>
 */
const PullToRefresh = memo(({
  children,
  onRefresh,
  pullThreshold = 80,
  maxPull = 120,
  disabled = false,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isPulling, setIsPulling] = useState(false)
  const containerRef = useRef(null)
  const startY = useRef(0)
  const currentY = useRef(0)

  // Motion values for smooth animation
  const pullDistance = useMotionValue(0)

  // Transform pull distance to visual elements
  const swordRotation = useTransform(pullDistance, [0, maxPull], [0, 45])
  const iconScale = useTransform(pullDistance, [0, pullThreshold], [0.5, 1])
  const iconOpacity = useTransform(pullDistance, [0, 30, pullThreshold], [0, 0.5, 1])
  const glowIntensity = useTransform(pullDistance, [0, pullThreshold], [0, 0.6])

  const handleTouchStart = useCallback((e) => {
    if (disabled || isRefreshing) return

    // Only trigger if at top of scroll
    const container = containerRef.current
    if (container && container.scrollTop > 0) return

    startY.current = e.touches[0].clientY
    setIsPulling(true)
  }, [disabled, isRefreshing])

  const handleTouchMove = useCallback((e) => {
    if (!isPulling || disabled || isRefreshing) return

    const container = containerRef.current
    if (container && container.scrollTop > 0) {
      setIsPulling(false)
      pullDistance.set(0)
      return
    }

    currentY.current = e.touches[0].clientY
    const diff = Math.max(0, currentY.current - startY.current)

    // Apply resistance for overscroll feel
    const resistedDiff = Math.min(maxPull, diff * 0.5)
    pullDistance.set(resistedDiff)

    // Haptic feedback at threshold
    if (resistedDiff >= pullThreshold && pullDistance.getPrevious() < pullThreshold) {
      haptics.selection()
    }
  }, [isPulling, disabled, isRefreshing, maxPull, pullThreshold, pullDistance])

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling || disabled) return

    setIsPulling(false)

    const currentPull = pullDistance.get()

    if (currentPull >= pullThreshold && !isRefreshing && onRefresh) {
      setIsRefreshing(true)
      haptics.impact()

      try {
        await onRefresh()
        haptics.success()
      } catch (error) {
        haptics.error()
        console.error('Refresh failed:', error)
      } finally {
        setIsRefreshing(false)
      }
    }

    // Animate back to zero
    pullDistance.set(0)
  }, [isPulling, disabled, isRefreshing, onRefresh, pullThreshold, pullDistance])

  // Clean up touch listeners
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener('touchstart', handleTouchStart, { passive: true })
    container.addEventListener('touchmove', handleTouchMove, { passive: true })
    container.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleTouchEnd)
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd])

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-auto overscroll-contain"
    >
      {/* Pull indicator */}
      <AnimatePresence>
        {(isPulling || isRefreshing) && (
          <MotionDiv
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-0 left-0 right-0 z-50 flex justify-center items-center"
            style={{
              height: maxPull,
              pointerEvents: 'none',
            }}
          >
            {/* Glow effect */}
            <motion.div
              className="absolute inset-x-8 h-16 rounded-full blur-xl"
              style={{
                background: 'radial-gradient(circle, rgba(6,182,212,0.4) 0%, transparent 70%)',
                opacity: glowIntensity,
              }}
            />

            {isRefreshing ? (
              // Loading spinner
              <MotionDiv
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="relative z-10"
              >
                <Loader2
                  className="w-8 h-8 text-cyan-400"
                  style={{ filter: 'drop-shadow(0 0 8px rgba(6,182,212,0.6))' }}
                />
              </MotionDiv>
            ) : (
              // Crossed swords animation
              <MotionDiv
                className="relative z-10 flex items-center justify-center"
                style={{
                  scale: iconScale,
                  opacity: iconOpacity,
                }}
              >
                {/* Left sword */}
                <motion.div
                  style={{ rotate: swordRotation, x: -4 }}
                  className="text-cyan-400"
                >
                  <Swords
                    className="w-6 h-6"
                    style={{
                      transform: 'scaleX(-1)',
                      filter: 'drop-shadow(0 0 4px rgba(6,182,212,0.6))',
                    }}
                  />
                </motion.div>

                {/* Right sword */}
                <motion.div
                  style={{
                    rotate: useTransform(swordRotation, v => -v),
                    x: 4,
                  }}
                  className="text-cyan-400"
                >
                  <Swords
                    className="w-6 h-6"
                    style={{ filter: 'drop-shadow(0 0 4px rgba(6,182,212,0.6))' }}
                  />
                </motion.div>
              </MotionDiv>
            )}

            {/* Pull progress text */}
            {!isRefreshing && (
              <motion.span
                className="absolute bottom-2 text-xs text-cyan-300/80 font-medium"
                style={{ opacity: iconOpacity }}
              >
                {pullDistance.get() >= pullThreshold ? 'Release to refresh' : 'Pull to refresh'}
              </motion.span>
            )}
          </MotionDiv>
        )}
      </AnimatePresence>

      {/* Content with pull offset */}
      <MotionDiv
        style={{
          y: isPulling ? pullDistance : 0,
        }}
      >
        {children}
      </MotionDiv>
    </div>
  )
})

PullToRefresh.displayName = 'PullToRefresh'

export default PullToRefresh
