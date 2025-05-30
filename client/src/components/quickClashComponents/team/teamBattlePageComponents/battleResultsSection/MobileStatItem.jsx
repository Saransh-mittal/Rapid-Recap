// components/quickClashComponents/team/teamBattlePageComponents/battleResultsSection/MobileStatItem.jsx
import React, { memo } from 'react'
import { VStack, Text, Icon, useBreakpointValue } from '@chakra-ui/react'

/**
 * Responsive Stat Item Component
 * Displays a single statistic with icon, label, and value
 */
const MobileStatItem = memo(({ icon, label, value, color }) => {
  // Responsive values
  const iconSize = useBreakpointValue({
    base: 4,
    md: 5,
    lg: 6,
  })

  const labelFontSize = useBreakpointValue({
    base: 'xs',
    md: 'sm',
    lg: 'sm',
  })

  const valueFontSize = useBreakpointValue({
    base: 'sm',
    md: 'md',
    lg: 'lg',
  })

  const spacing = useBreakpointValue({
    base: 1,
    md: 1.5,
    lg: 2,
  })

  return (
    <VStack spacing={spacing} align="center" flex={1}>
      <Icon as={icon} color={color} boxSize={iconSize} />
      <Text
        color="whiteAlpha.600"
        fontSize={labelFontSize}
        textAlign="center"
        fontWeight="medium"
      >
        {label}
      </Text>
      <Text
        color="white"
        fontWeight="bold"
        fontSize={valueFontSize}
        textAlign="center"
        fontFamily="'Orbitron', sans-serif"
      >
        {value}
      </Text>
    </VStack>
  )
})

MobileStatItem.displayName = 'MobileStatItem'

export default MobileStatItem
