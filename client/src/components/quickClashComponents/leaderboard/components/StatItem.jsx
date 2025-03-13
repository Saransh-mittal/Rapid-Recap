// components/quickClashComponents/leaderboard/components/StatItem.jsx
import React from 'react'
import { Flex, HStack, Icon, Text } from '@chakra-ui/react'

const StatItem = React.memo(({ icon, label, value, color }) => (
  <Flex
    direction="column"
    align="center"
    borderRadius="lg"
    minW="28%"
    py={1}
    px={2}
  >
    <HStack spacing={1} mb={0.5}>
      <Icon as={icon} color={color} boxSize={3} />
      <Text fontSize="2xs" color="whiteAlpha.700">
        {label}
      </Text>
    </HStack>
    <Text fontWeight="bold" color={color} fontSize="sm">
      {value}
    </Text>
  </Flex>
))

StatItem.displayName = 'StatItem'

export default StatItem
