// components/quickClashComponents/FilterTabs.jsx - FAITHFUL CONVERSION with Consistent Color Scheme
import React, { memo, useEffect, useCallback, useMemo, useRef } from 'react'
import { motion } from 'framer-motion'
import { Zap, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'

// Import centralized color scheme
import { QUICK_CLASH_CLASSES } from './utils/quickClashColors'

const MotionDiv = motion.div
const MotionButton = motion.button

// Map mode names to URL hash suffixes - EXACTLY as original
const MODE_HASH_MAP = {
  '1v1': '1v1',
  '4v4': '4v4',
}

// Reverse map for looking up mode from hash - EXACTLY as original
const HASH_MODE_MAP = {
  '1v1': '1v1',
  '4v4': '4v4',
}

// Responsive configuration - EXACTLY as original
const RESPONSIVE_CONFIG = {
  spacing: 'gap-2 md:gap-3',
  padding: 'p-1 md:p-2',
  maxWidth: 'max-w-[300px] md:max-w-[350px]',
}

/**
 * Optimized individual filter tab component - Faithful conversion with consistent colors
 */
const FilterTab = memo(({ isSelected, label, icon: Icon, onClick }) => {
  // Enhanced button classes with consistent color scheme
  const buttonClasses = useMemo(() => {
    const baseClasses = `
      flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
      transition-all duration-200 ease-out transform-gpu
      hover:scale-[1.02] hover:-translate-y-0.5 hover:shadow-lg
      active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-cyan-400/50
    `

    const selectedClasses = isSelected
      ? `
        bg-gradient-to-br from-cyan-500 to-cyan-600 text-white font-bold
        shadow-lg shadow-cyan-500/25
      `
      : `
        bg-transparent text-white/70 hover:text-white hover:bg-white/10
      `

    return `${baseClasses} ${selectedClasses}`.trim()
  }, [isSelected])

  return (
    <MotionButton
      className={buttonClasses}
      onClick={onClick}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </MotionButton>
  )
})

FilterTab.displayName = 'FilterTab'

/**
 * Enhanced FilterTabs component - Faithful conversion with consistent color scheme
 * ALL ORIGINAL FUNCTIONALITY PRESERVED - Hash navigation, performance optimizations, etc.
 */
const FilterTabs = memo(({ selectedFilter, onFilterChange }) => {
  const { t } = useTranslation('QuickClash')
  const hashChangeTimeoutRef = useRef()
  const isInitializedRef = useRef(false)

  // Container classes with full width design
  const containerClasses = useMemo(
    () =>
      `
    flex items-center justify-center mx-auto
    ${RESPONSIVE_CONFIG.spacing} ${RESPONSIVE_CONFIG.padding} ${RESPONSIVE_CONFIG.maxWidth} w-fit
    ${QUICK_CLASH_CLASSES.glassMedium} rounded-full shadow-xl backdrop-brightness-110
    filter-tabs-container
  `.trim(),
    [],
  )

  // Memoized tab data - EXACTLY as original
  const tabData = useMemo(
    () => [
      {
        mode: '1v1',
        label: t('1v1'),
        icon: Zap,
      },
      {
        mode: '4v4',
        label: t('4v4'),
        icon: Users,
      },
    ],
    [t],
  )

  // ALL ORIGINAL LOGIC PRESERVED EXACTLY - NO CHANGES TO FUNCTIONALITY

  // Debounced hash sync function - EXACTLY as original
  const syncModeWithHash = useCallback(() => {
    clearTimeout(hashChangeTimeoutRef.current)
    hashChangeTimeoutRef.current = setTimeout(() => {
      const hash = window.location.hash.substring(1) // Remove # symbol

      // Check if we're on the active tab and there's a sub-route
      if (hash.startsWith('active/')) {
        const subRoute = hash.split('/')[1]
        if (
          subRoute &&
          HASH_MODE_MAP[subRoute] &&
          HASH_MODE_MAP[subRoute] !== selectedFilter
        ) {
          onFilterChange(HASH_MODE_MAP[subRoute])
        }
      } else if (hash === 'active') {
        // If just on active tab without sub-route, default to 1v1
        if (selectedFilter !== '1v1') {
          onFilterChange('1v1')
        }
      }
    }, 50) // Debounce for 50ms
  }, [selectedFilter, onFilterChange])

  // Check URL hash for initial mode and handle hash changes - EXACTLY as original
  useEffect(() => {
    // Only sync on initial mount
    if (!isInitializedRef.current) {
      syncModeWithHash()
      isInitializedRef.current = true
    }

    // Listen for hash changes
    window.addEventListener('hashchange', syncModeWithHash)

    // Cleanup
    return () => {
      window.removeEventListener('hashchange', syncModeWithHash)
      clearTimeout(hashChangeTimeoutRef.current)
    }
  }, [syncModeWithHash])

  // Optimized mode change handler - EXACTLY as original
  const handleModeChange = useCallback(
    mode => {
      // Prevent unnecessary updates
      if (mode === selectedFilter) return

      // Update URL hash to include mode sub-route
      const newHash = `active/${MODE_HASH_MAP[mode]}`

      // Use replaceState for better performance if we're just switching modes
      const currentHash = window.location.hash.substring(1)
      if (currentHash.startsWith('active/')) {
        window.history.replaceState(null, '', `#${newHash}`)
      } else {
        window.history.pushState(null, '', `#${newHash}`)
      }

      // Call the original filter change handler
      onFilterChange(mode)
    },
    [onFilterChange, selectedFilter],
  )

  // Memoized click handlers to prevent recreation - EXACTLY as original
  const clickHandlers = useMemo(
    () =>
      tabData.reduce((acc, tab) => {
        acc[tab.mode] = () => handleModeChange(tab.mode)
        return acc
      }, {}),
    [tabData, handleModeChange],
  )

  return (
    <MotionDiv
      className={containerClasses}
      data-testid="filter-tabs"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {tabData.map(tab => (
        <FilterTab
          key={tab.mode}
          isSelected={selectedFilter === tab.mode}
          label={tab.label}
          icon={tab.icon}
          onClick={clickHandlers[tab.mode]}
        />
      ))}
    </MotionDiv>
  )
})

FilterTabs.displayName = 'FilterTabs'

export default FilterTabs
