// components/quickClashComponents/team/battleAnalysis/components/MemberCardLoader.jsx
import React from 'react'
import { Box, VStack, Circle } from '@chakra-ui/react'

const MemberCardLoader = React.memo(() => (
  <Box
    h="180px" // Reduced height
    bg="rgba(255,255,255,0.04)"
    borderRadius="xl"
    p={3} // Reduced padding
    border="1px solid rgba(255,255,255,0.1)"
  >
    <VStack spacing={2.5}>
      {' '}
      {/* Reduced spacing */}
      <Circle size="50px" bg="whiteAlpha.200" /> {/* Reduced size */}
      <Box h="18px" w="80%" bg="whiteAlpha.200" borderRadius="md" />
      <Box h="14px" w="60%" bg="whiteAlpha.100" borderRadius="md" />
      <Box h="10px" w="40%" bg="whiteAlpha.100" borderRadius="md" />
    </VStack>
  </Box>
))

MemberCardLoader.displayName = 'MemberCardLoader'

export default MemberCardLoader
