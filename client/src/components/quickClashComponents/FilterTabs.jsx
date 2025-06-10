import React, { memo, useEffect, useCallback, useMemo, useRef } from 'react'
import { HStack, Button, Icon, useBreakpointValue } from '@chakra-ui/react'
import { Zap, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'

// Map mode names to URL hash suffixes
const MODE_HASH_MAP = {
  '1v1': '1v1',
  '4v4': '4v4',
}

// Reverse map for looking up mode from hash
const HASH_MODE_MAP = {
  '1v1': '1v1',
  '4v4': '4v4',
}

// Cached responsive configuration for better performance
const RESPONSIVE_CONFIG = {
  tabSpacing: { base: 2, md: 3 },
  containerPadding: { base: 1, md: 2 },
  maxWidth: { base: '300px', md: '350px' },
}

/**
 * Optimized individual filter tab component
 */
const FilterTab = memo(({ isSelected, label, icon, onClick }) => {
  // Memoized styles for better performance
  const buttonStyles = useMemo(
    () => ({
      variant: isSelected ? 'solid' : 'ghost',
      colorScheme: isSelected ? 'purple' : 'white',
      borderRadius: 'full',
      size: 'sm',
      fontWeight: isSelected ? 'bold' : 'medium',
      px: 4,
      boxShadow: isSelected ? '0 0 8px rgba(124, 58, 237, 0.2)' : 'none',
      transition: 'all 0.2s ease',
      _hover: {
        transform: 'translateY(-1px)',
        boxShadow: '0 3px 8px rgba(0, 0, 0, 0.15)',
      },
      _active: {
        transform: 'scale(0.98)',
      },
    }),
    [isSelected],
  )

  return (
    <Button
      {...buttonStyles}
      leftIcon={<Icon as={icon} boxSize={4} />}
      onClick={onClick}
    >
      {label}
    </Button>
  )
})

FilterTab.displayName = 'FilterTab'

/**
 * Optimized filter tabs component - maintains exact original design with performance improvements
 * - Cached responsive values to reduce re-renders
 * - Memoized expensive operations
 * - Optimized event handlers
 * - Hash-based navigation for direct linking to modes
 * - Debounced hash changes for smooth performance
 */
const FilterTabs = memo(({ selectedFilter, onFilterChange }) => {
  const { t } = useTranslation('QuickClash')
  const hashChangeTimeoutRef = useRef()
  const isInitializedRef = useRef(false)

  // Cache responsive values - using the cached config
  const tabSpacing = useBreakpointValue(RESPONSIVE_CONFIG.tabSpacing)
  const containerPadding = useBreakpointValue(
    RESPONSIVE_CONFIG.containerPadding,
  )
  const maxWidth = useBreakpointValue(RESPONSIVE_CONFIG.maxWidth)

  // Memoized container styles
  const containerStyles = useMemo(
    () => ({
      spacing: tabSpacing,
      p: containerPadding,
      borderRadius: 'full',
      bg: 'rgba(26, 32, 44, 0.6)',
      justify: 'center',
      overflowX: 'auto',
      mx: 'auto',
      maxW: maxWidth,
      boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
      className: 'filter-tabs-container',
      'data-testid': 'filter-tabs',
    }),
    [tabSpacing, containerPadding, maxWidth],
  )

  // Memoized tab data
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

  // Debounced hash sync function
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

  // Check URL hash for initial mode and handle hash changes
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

  // Optimized mode change handler with reduced DOM operations
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

  // Memoized click handlers to prevent recreation
  const clickHandlers = useMemo(
    () =>
      tabData.reduce((acc, tab) => {
        acc[tab.mode] = () => handleModeChange(tab.mode)
        return acc
      }, {}),
    [tabData, handleModeChange],
  )

  return (
    <HStack {...containerStyles}>
      {tabData.map(tab => (
        <FilterTab
          key={tab.mode}
          isSelected={selectedFilter === tab.mode}
          label={tab.label}
          icon={tab.icon}
          onClick={clickHandlers[tab.mode]}
        />
      ))}
    </HStack>
  )
})

FilterTabs.displayName = 'FilterTabs'

export default FilterTabs
