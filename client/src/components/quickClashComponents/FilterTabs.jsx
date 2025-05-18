import React, { memo } from 'react'
import { HStack, Button, Icon, useBreakpointValue } from '@chakra-ui/react'
import { Zap, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'

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
 * Filter tabs component for filtering between 1v1 and 4v4 challenges
 * - Performance optimized with memo
 * - Responsive design with useBreakpointValue
 */
const FilterTabs = memo(({ selectedFilter, onFilterChange }) => {
  const { t } = useTranslation('QuickClash')

  // Responsive styling
  const tabSpacing = useBreakpointValue({ base: 2, md: 3 })
  const containerPadding = useBreakpointValue({ base: 1, md: 2 })
  const maxWidth = useBreakpointValue({ base: '300px', md: '350px' })

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
        onClick={() => onFilterChange('1v1')}
      />
      <FilterTab
        isSelected={selectedFilter === '4v4'}
        label={t('4v4')}
        icon={Users}
        onClick={() => onFilterChange('4v4')}
      />
    </HStack>
  )
})

FilterTabs.displayName = 'FilterTabs'

export default FilterTabs
