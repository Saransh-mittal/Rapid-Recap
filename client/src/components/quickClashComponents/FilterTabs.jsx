import React, { memo, useEffect, useCallback } from 'react'
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

/**
 * Individual filter tab component
 */
const FilterTab = memo(({ isSelected, label, icon, onClick }) => {
  return (
    <Button
      variant={isSelected ? 'solid' : 'ghost'}
      colorScheme={isSelected ? 'purple' : 'white'}
      leftIcon={<Icon as={icon} boxSize={4} />}
      onClick={onClick}
      borderRadius="full"
      size="sm"
      fontWeight={isSelected ? 'bold' : 'medium'}
      px={4}
      boxShadow={isSelected ? '0 0 8px rgba(124, 58, 237, 0.2)' : 'none'}
      transition="all 0.2s ease"
      _hover={{
        transform: 'translateY(-1px)',
        boxShadow: '0 3px 8px rgba(0, 0, 0, 0.15)',
      }}
    >
      {label}
    </Button>
  )
})

FilterTab.displayName = 'FilterTab'

/**
 * Filter tabs component for filtering between 1v1 and 4v4 challenges with hash navigation
 * - Performance optimized with memo
 * - Responsive design with useBreakpointValue
 * - Hash-based navigation for direct linking to modes
 */
const FilterTabs = memo(({ selectedFilter, onFilterChange }) => {
  const { t } = useTranslation('QuickClash')

  // Responsive styling
  const tabSpacing = useBreakpointValue({ base: 2, md: 3 })
  const containerPadding = useBreakpointValue({ base: 1, md: 2 })
  const maxWidth = useBreakpointValue({ base: '300px', md: '350px' })

  // Check URL hash for initial mode and handle hash changes
  useEffect(() => {
    const syncModeWithHash = () => {
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
    }

    // Initial sync on component mount
    syncModeWithHash()

    // Listen for hash changes
    window.addEventListener('hashchange', syncModeWithHash)

    // Cleanup
    return () => {
      window.removeEventListener('hashchange', syncModeWithHash)
    }
  }, [selectedFilter, onFilterChange])

  // Handle mode change with hash update
  const handleModeChange = useCallback(
    mode => {
      // Update URL hash to include mode sub-route
      const newHash = `active/${MODE_HASH_MAP[mode]}`
      window.history.pushState(null, '', `#${newHash}`)

      // Call the original filter change handler
      onFilterChange(mode)
    },
    [onFilterChange],
  )

  return (
    <HStack
      spacing={tabSpacing}
      p={containerPadding}
      borderRadius="full"
      bg="rgba(26, 32, 44, 0.6)"
      justify="center"
      overflowX="auto"
      mx="auto"
      maxW={maxWidth}
      boxShadow="0 4px 10px rgba(0, 0, 0, 0.1)"
      className="filter-tabs-container"
      data-testid="filter-tabs"
    >
      <FilterTab
        isSelected={selectedFilter === '1v1'}
        label={t('1v1')}
        icon={Zap}
        onClick={() => handleModeChange('1v1')}
      />
      <FilterTab
        isSelected={selectedFilter === '4v4'}
        label={t('4v4')}
        icon={Users}
        onClick={() => handleModeChange('4v4')}
      />
    </HStack>
  )
})

FilterTabs.displayName = 'FilterTabs'

export default FilterTabs
