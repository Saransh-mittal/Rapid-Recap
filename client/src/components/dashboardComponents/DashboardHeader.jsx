// src/components/dashboard/DashboardHeader.jsx
import React from 'react'
import { Flex, Heading, Text, useMediaQuery } from '@chakra-ui/react'

const DashboardHeader = () => {
  const [isLargerThan768] = useMediaQuery('(min-width: 768px)')

  return (
    <Flex direction="column" align="center" mb={8}>
      <Heading
        as="h1"
        size={isLargerThan768 ? '2xl' : 'lg'}
        mb={2}
        p={2}
        borderRadius="md"
        color="gray.200"
        textAlign="center"
      >
        Dashboard
      </Heading>
      <Text fontSize={isLargerThan768 ? 'lg' : 'md'} color="gray.500">
        Manage and analyze your application data
      </Text>
    </Flex>
  )
}

export default DashboardHeader
