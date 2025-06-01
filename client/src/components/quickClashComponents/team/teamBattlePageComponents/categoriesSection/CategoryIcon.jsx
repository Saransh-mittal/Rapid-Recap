// components/quickClashComponents/team/teamBattlePageComponents/categoriesSection/CategoryIcon.jsx
import React, { memo } from 'react'
import { Icon, useBreakpointValue, Box } from '@chakra-ui/react'

/**
 * Category Icon Component (Animations Removed)
 */
const CategoryIcon = memo(({ categoryInfo }) => {
  const iconSize = useBreakpointValue({
    base: '24px',
    sm: '28px',
    md: '30px',
  })

  return (
    <Box
      background={`linear-gradient(135deg, ${categoryInfo.primaryColor}, ${categoryInfo.secondaryColor})`}
      borderRadius="8px"
      padding={useBreakpointValue({ base: '6px', sm: '8px' })}
      boxShadow={`0 4px 15px ${categoryInfo.primaryColor}40`}
    >
      <Icon as={categoryInfo.iconComponent} boxSize={iconSize} color="white" />
    </Box>
  )
})

CategoryIcon.displayName = 'CategoryIcon'

export default CategoryIcon
