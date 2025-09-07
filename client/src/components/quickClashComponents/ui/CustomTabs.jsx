// components/quickClashComponents/ui/CustomTabs.jsx - FAITHFUL CONVERSION to Tailwind with Blue-Cyan Color Scheme
import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import { motion } from 'framer-motion'
import { Swords, Zap, Calendar, Users, Trophy } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

// Import centralized color scheme
import { QUICK_CLASH_CLASSES } from '../utils/quickClashColors'

const MotionDiv = motion.div
const MotionButton = motion.button
const MotionSpan = motion.span

// Map tab names to URL hashes - EXACTLY as original
const TAB_HASH_MAP = {
  0: 'active',
  1: 'tasks',
  2: 'teams',
}

// Reverse map for looking up index from hash - EXACTLY as original
const HASH_TAB_MAP = {
  active: 0,
  tasks: 1,
  teams: 2,
}

// Map icon names to actual icon components - EXACTLY as original
const ICON_MAP = {
  Swords: Swords,
  Zap: Zap,
  Calendar: Calendar,
  Users: Users,
}

// Optimized animation variants - EXACTLY as original
const createIconAnimationVariants = type => {
  switch (type) {
    case 'rotate':
      return { rotate: [0, 15, -15, 0], transition: { duration: 0.4 } }
    case 'bounce':
      return { y: [0, -3, 0], transition: { duration: 0.4 } }
    case 'scale':
      return { scale: [1, 1.1, 1], transition: { duration: 0.4 } }
    default:
      return {}
  }
}

// Memoized sparkle component with blue-cyan colors
const SparkleEffect = React.memo(({ delay = 0 }) => {
  return (
    <MotionDiv
      className="absolute"
      animate={{
        opacity: [0, 1, 0],
        scale: [0.5, 1.2, 0.5],
        rotate: [0, 90, 0],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        repeatType: 'reverse',
        delay,
      }}
    >
      <Zap className="w-3 h-3 text-white opacity-80" />
    </MotionDiv>
  )
})

SparkleEffect.displayName = 'SparkleEffect'

// Memoized background glow component with cyan tinting
const BackgroundGlow = React.memo(() => {
  return (
    <MotionDiv
      className="absolute inset-0 bg-gradient-radial from-cyan-500/15 via-transparent to-transparent"
      animate={{
        opacity: [0.5, 0.8, 0.5],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        repeatType: 'reverse',
      }}
      style={{ zIndex: 0 }}
    />
  )
})

BackgroundGlow.displayName = 'BackgroundGlow'

// Memoized active indicator component with cyan gradients
const ActiveIndicator = React.memo(({ color }) => {
  const sparklePositions = useMemo(
    () => [
      { top: '10%', right: '10%', delay: 0 },
      { bottom: '15%', left: '15%', delay: 0.5 },
    ],
    [],
  )

  return (
    <MotionDiv
      className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-600 to-cyan-500 shadow-lg shadow-cyan-500/25"
      layoutId="tab-indicator"
      initial={false}
      transition={{
        type: 'tween',
        duration: 0.2,
      }}
      style={{ zIndex: -1 }}
    >
      {sparklePositions.map((pos, idx) => (
        <SparkleEffect
          key={idx}
          delay={pos.delay}
          style={{
            position: 'absolute',
            ...pos,
          }}
        />
      ))}
    </MotionDiv>
  )
})

ActiveIndicator.displayName = 'ActiveIndicator'

// Optimized tab badge component with consistent colors
const TabBadge = React.memo(({ count }) => {
  if (count <= 0) return null

  return (
    <MotionSpan
      className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold"
      initial={{ scale: 0 }}
      animate={{
        scale: [0.8, 1.2, 1],
        transition: {
          duration: 0.4,
          repeat: 3,
          repeatType: 'reverse',
          repeatDelay: 5,
        },
      }}
    >
      {count}
    </MotionSpan>
  )
})

TabBadge.displayName = 'TabBadge'

/**
 * Enhanced CustomTabs component - FAITHFUL CONVERSION to Tailwind with Blue-Cyan Color Scheme
 * ALL ORIGINAL FUNCTIONALITY PRESERVED - Hash navigation, performance optimizations, animations, etc.
 */
const CustomTabs = ({
  children,
  initialTabIndex = 0,
  onChange,
  tabNames,
  tabIcons = [],
}) => {
  const { t } = useTranslation('QuickClash')
  const [tabIndex, setTabIndex] = useState(initialTabIndex)
  const hashChangeTimeoutRef = useRef()

  // Responsive detection (mobile-first approach)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Get daily tasks progress with memoization - EXACTLY as original
  const pendingTasksCount = useSelector(
    state =>
      state.quickClashDailyTasks.tasks.filter(task => !task.completed).length,
    (prev, next) => prev === next,
  )

  // Memoized tab data with blue-cyan color scheme
  const tabs = useMemo(() => {
    const defaultTabs = [
      {
        label: tabNames?.[0] || t('Challenges'),
        icon: tabIcons[0] ? ICON_MAP[tabIcons[0]] : Swords,
        ariaLabel: 'active challenges tab',
        color: 'cyan',
        iconAnimation: createIconAnimationVariants('rotate'),
        hash: 'active',
      },
      {
        label: tabNames?.[1] || t('Tasks'),
        icon: tabIcons[1] ? ICON_MAP[tabIcons[1]] : Calendar,
        ariaLabel: 'Daily Tasks tab',
        color: 'orange',
        iconAnimation: createIconAnimationVariants('bounce'),
        hash: 'tasks',
      },
      {
        label: tabNames?.[2] || t('Teams'),
        icon: tabIcons[2] ? ICON_MAP[tabIcons[2]] : Users,
        ariaLabel: 'Teams tab',
        color: 'blue',
        iconAnimation: createIconAnimationVariants('scale'),
        hash: 'teams',
      },
    ]

    return tabNames
      ? defaultTabs.slice(0, tabNames.length)
      : defaultTabs.slice(0, 2)
  }, [tabNames, tabIcons, t])

  // ALL ORIGINAL HASH NAVIGATION LOGIC PRESERVED EXACTLY
  const getTabIndexFromHash = useCallback(hash => {
    if (!hash) return 0
    const hashParts = hash.substring(1).split('/')
    const mainRoute = hashParts[0]
    return HASH_TAB_MAP[mainRoute] !== undefined ? HASH_TAB_MAP[mainRoute] : 0
  }, [])

  // Debounced hash sync - EXACTLY as original
  const syncTabWithHash = useCallback(() => {
    clearTimeout(hashChangeTimeoutRef.current)
    hashChangeTimeoutRef.current = setTimeout(() => {
      const hash = window.location.hash
      const newIndex = getTabIndexFromHash(hash)

      if (newIndex !== tabIndex) {
        setTabIndex(newIndex)
        if (onChange) {
          onChange(newIndex)
        }
      }
    }, 50) // Debounce for 50ms
  }, [getTabIndexFromHash, tabIndex, onChange])

  // Check URL hash on mount and when hash changes - EXACTLY as original
  useEffect(() => {
    // Initial sync on component mount
    syncTabWithHash()

    // Listen for hash changes
    window.addEventListener('hashchange', syncTabWithHash)

    // Cleanup
    return () => {
      window.removeEventListener('hashchange', syncTabWithHash)
      clearTimeout(hashChangeTimeoutRef.current)
    }
  }, [syncTabWithHash])

  // Optimized tab change handler - EXACTLY as original
  const handleTabChange = useCallback(
    index => {
      setTabIndex(index)

      // Update URL hash without triggering a page reload
      const hash = TAB_HASH_MAP[index] || 'active'

      // For the active tab, preserve sub-routes or default to 1v1
      if (hash === 'active') {
        const currentHash = window.location.hash.substring(1)
        if (currentHash.startsWith('active/')) {
          // Keep existing sub-route
          return // Don't change hash as it already has proper format
        } else {
          // Set default sub-route for active tab
          window.history.pushState(null, '', `#${hash}/1v1`)
        }
      } else {
        // For other tabs, just set the main route
        window.history.pushState(null, '', `#${hash}`)
      }

      if (onChange) {
        onChange(index)
      }
    },
    [onChange],
  )

  // Tab color mapping for consistent blue-cyan theme
  const getTabColors = useCallback((color, isActive, isHovered = false) => {
    if (isActive) {
      return {
        text: 'text-white',
        icon: 'text-white',
      }
    }

    const colorMap = {
      cyan: isHovered ? 'text-cyan-300' : 'text-cyan-400',
      orange: isHovered ? 'text-orange-300' : 'text-orange-400',
      blue: isHovered ? 'text-blue-300' : 'text-blue-400',
    }

    return {
      text: `text-white/70 ${isHovered ? 'group-hover:text-white' : ''}`,
      icon: colorMap[color] || colorMap.cyan,
    }
  }, [])

  return (
    <div className="tabs-container">
      {/* Tab List with glassmorphic styling */}
      <div
        className={`
          ${QUICK_CLASH_CLASSES.glassMedium} backdrop-brightness-110
          rounded-xl p-1.5 mb-5 flex justify-between
          shadow-2xl border border-white/10 overflow-hidden relative
        `}
      >
        {/* Background glow effect */}
        <BackgroundGlow />

        {tabs.map((tab, idx) => {
          const isActive = tabIndex === idx
          const colors = getTabColors(tab.color, isActive)
          const IconComponent = tab.icon

          return (
            <MotionButton
              key={idx}
              className={`
                flex-1 ${isMobile ? 'py-3' : 'py-2.5'} px-3 rounded-lg relative
                ${colors.text} hover:text-white transition-all duration-200
                group focus:outline-none focus:ring-2 focus:ring-cyan-400/50
                z-10
              `}
              onClick={() => handleTabChange(idx)}
              aria-label={tab.ariaLabel}
              animate={isActive ? 'active' : 'inactive'}
              variants={{
                active: { scale: 1.03 },
                inactive: { scale: 1 },
              }}
              transition={{
                type: 'tween',
                duration: 0.2,
              }}
            >
              <MotionDiv
                className={`
                  flex ${isMobile ? 'flex-col' : 'flex-row'}
                  items-center justify-center
                  ${isMobile ? 'gap-1.5' : 'gap-2'} relative
                `}
              >
                {/* Icon with animation */}
                <MotionDiv
                  className="flex items-center justify-center"
                  animate={isActive ? tab.iconAnimation : {}}
                >
                  <IconComponent
                    className={`
                      ${isMobile ? 'w-5 h-5' : 'w-5 h-5'}
                      ${isActive ? 'text-white' : colors.icon}
                    `}
                  />
                </MotionDiv>

                {/* Label */}
                <span
                  className={`
                    ${isMobile ? 'text-sm' : 'text-md'}
                    ${isActive ? 'font-bold' : 'font-medium'}
                    tracking-wide
                  `}
                >
                  {tab.label}
                </span>

                {/* Badge for Daily Tasks */}
                {tab.label === t('Tasks') && (
                  <TabBadge count={pendingTasksCount} />
                )}

                {/* Active indicator dot */}
                {isActive && (
                  <MotionDiv
                    className="absolute -bottom-2.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      delay: 0.1,
                      duration: 0.2,
                    }}
                  />
                )}
              </MotionDiv>

              {/* Active tab background indicator */}
              {isActive && <ActiveIndicator color={tab.color} />}
            </MotionButton>
          )
        })}
      </div>

      {/* Tab Panels */}
      <div className="tab-panels">
        {React.Children.map(children, (child, idx) => (
          <MotionDiv
            key={idx}
            initial={{ opacity: 0, y: 8 }}
            animate={{
              opacity: tabIndex === idx ? 1 : 0,
              y: tabIndex === idx ? 0 : 8,
            }}
            transition={{
              duration: 0.2,
              ease: 'easeOut',
            }}
            className={tabIndex === idx ? 'block' : 'hidden'}
          >
            {child}
          </MotionDiv>
        ))}
      </div>
    </div>
  )
}

export default React.memo(CustomTabs)
