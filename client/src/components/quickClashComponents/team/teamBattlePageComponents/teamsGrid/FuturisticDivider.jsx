// components/quickClashComponents/team/teamBattlePageComponents/teamsGrid/FuturisticDivider.jsx
import React from 'react'
import { Box } from '@chakra-ui/react'

/**
 * Futuristic divider component for visual separation
 */
const FuturisticDivider = props => (
  <Box
    height="1.5px"
    bgGradient="linear(to-r, transparent, cyan.400, transparent)"
    opacity={0.6}
    my={{ base: 1, md: 1.5 }}
    {...props}
  />
)

export default FuturisticDivider
