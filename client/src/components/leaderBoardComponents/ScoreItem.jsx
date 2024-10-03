import React from 'react'
import { VStack, Text, Tooltip } from '@chakra-ui/react'

const ScoreItem = ({ label, value, color }) => (
  <Tooltip label={label} placement="top">
    <VStack align="center" spacing={0}>
      <Text
        fontSize={{ base: 'xs', md: 'sm', lg: 'md' }}
        fontWeight="bold"
        color={color}
      >
        {value}
      </Text>
      <Text fontSize={{ base: '2xs', md: 'xs', lg: 'sm' }} color="gray.400">
        {label}
      </Text>
    </VStack>
  </Tooltip>
)

export default ScoreItem
