// components/quickClashComponents/ui/QuickClashOnboarding.jsx
// First-time user onboarding tooltips for Quick Clash

import React, { memo, useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, Users, Swords, Trophy } from 'lucide-react'
import { haptics } from '../../../utils/haptics'

const MotionDiv = motion.div

// Local storage key for tracking seen onboarding
const STORAGE_KEY = 'quickclash_onboarding_seen'

/**
 * Get which onboarding steps have been completed
 */
const getSeenSteps = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

/**
 * Mark a step as seen
 */
const markStepAsSeen = (stepId) => {
  try {
    const seen = getSeenSteps()
    seen[stepId] = true
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seen))
  } catch {
    // Storage full or unavailable
  }
}

// Onboarding step configurations
const ONBOARDING_STEPS = {
  squad: {
    id: 'squad',
    icon: Users,
    title: 'Form Your Squad!',
    description: 'Tap here to create or join a 4-player team for intense squad battles.',
    position: 'below', // Tooltip appears below the target
  },
  matchmaking: {
    id: 'matchmaking',
    icon: Swords,
    title: 'Find Opponents',
    description: 'Start matchmaking to find teams at your skill level.',
    position: 'below',
  },
  history: {
    id: 'history',
    icon: Trophy,
    title: 'Battle History',
    description: 'View your past battles, analyze performance, and track your wins.',
    position: 'above',
  },
}

/**
 * Individual tooltip component
 */
const OnboardingTooltip = memo(({
  step,
  onDismiss,
  targetRef,
  show = true,
}) => {
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const config = ONBOARDING_STEPS[step]

  useEffect(() => {
    if (!targetRef?.current || !show) return

    const target = targetRef.current
    const rect = target.getBoundingClientRect()

    // Calculate position based on configuration
    const tooltipPosition = {
      left: rect.left + rect.width / 2,
      top: config.position === 'below'
        ? rect.bottom + 8
        : rect.top - 8,
    }

    setPosition(tooltipPosition)
  }, [targetRef, show, config.position])

  if (!config || !show) return null

  const Icon = config.icon

  return (
    <AnimatePresence>
      <MotionDiv
        initial={{ opacity: 0, y: config.position === 'below' ? -10 : 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="fixed z-[100] pointer-events-auto"
        style={{
          top: position.top,
          left: position.left,
          transform: `translateX(-50%) ${config.position === 'above' ? 'translateY(-100%)' : ''}`,
        }}
      >
        {/* Arrow */}
        <div
          className={`absolute left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-800 rotate-45 border-cyan-500/30 ${
            config.position === 'below'
              ? '-top-1.5 border-l border-t'
              : '-bottom-1.5 border-r border-b'
          }`}
        />

        {/* Tooltip content */}
        <div className="relative bg-slate-800/95 backdrop-blur-lg border border-cyan-500/30 rounded-xl p-4 max-w-[280px] shadow-[0_0_20px_rgba(6,182,212,0.2)]">
          {/* Close button */}
          <button
            onClick={() => {
              haptics.light()
              onDismiss()
            }}
            className="absolute top-2 right-2 p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4 text-white/60" />
          </button>

          {/* Header with icon */}
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/20">
              <Icon className="w-4 h-4 text-cyan-400" />
            </div>
            <span className="text-white font-bold text-sm">{config.title}</span>
            <Sparkles className="w-3 h-3 text-yellow-400 animate-pulse" />
          </div>

          {/* Description */}
          <p className="text-white/70 text-xs leading-relaxed mb-3">
            {config.description}
          </p>

          {/* Got it button */}
          <button
            onClick={() => {
              haptics.selection()
              onDismiss()
            }}
            className="w-full py-2 px-4 rounded-lg bg-gradient-to-r from-cyan-500 to-cyan-600 text-white text-xs font-bold hover:from-cyan-400 hover:to-cyan-500 transition-all shadow-[0_0_10px_rgba(6,182,212,0.3)]"
          >
            Got it!
          </button>
        </div>
      </MotionDiv>
    </AnimatePresence>
  )
})

OnboardingTooltip.displayName = 'OnboardingTooltip'

/**
 * Hook to manage onboarding state for a specific step
 */
export const useOnboardingStep = (stepId) => {
  const [shouldShow, setShouldShow] = useState(false)

  useEffect(() => {
    // Check if this step has been seen
    const seen = getSeenSteps()
    if (!seen[stepId]) {
      // Delay showing to let the page render first
      const timer = setTimeout(() => setShouldShow(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [stepId])

  const dismiss = useCallback(() => {
    markStepAsSeen(stepId)
    setShouldShow(false)
  }, [stepId])

  return { shouldShow, dismiss }
}

/**
 * Wrapper component for elements that need onboarding tooltips
 */
export const OnboardingTarget = memo(({
  stepId,
  children,
  className = '',
}) => {
  const targetRef = React.useRef(null)
  const { shouldShow, dismiss } = useOnboardingStep(stepId)

  return (
    <>
      <div ref={targetRef} className={`relative ${className}`}>
        {children}

        {/* Pulse animation when tooltip is showing */}
        {shouldShow && (
          <motion.div
            className="absolute inset-0 rounded-xl pointer-events-none"
            animate={{
              boxShadow: [
                '0 0 0 0 rgba(6,182,212,0.4)',
                '0 0 0 8px rgba(6,182,212,0)',
              ],
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
      </div>

      <OnboardingTooltip
        step={stepId}
        targetRef={targetRef}
        show={shouldShow}
        onDismiss={dismiss}
      />
    </>
  )
})

OnboardingTarget.displayName = 'OnboardingTarget'

/**
 * Reset onboarding (for testing)
 */
export const resetOnboarding = () => {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Storage unavailable
  }
}

export default OnboardingTooltip
