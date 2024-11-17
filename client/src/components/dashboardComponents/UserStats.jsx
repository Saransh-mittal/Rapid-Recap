// src/components/dashboard/UserStats.jsx
import React from 'react'
import {
  Box,
  Heading,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  useMediaQuery,
} from '@chakra-ui/react'

const UserStats = ({ totals }) => {
  const [isLargerThan768] = useMediaQuery('(min-width: 768px)')
  const borderColor = 'gray.700'

  return (
    <Box p={6} borderRadius="lg" boxShadow="md">
      <Heading size={isLargerThan768 ? 'md' : 'sm'} mb={4}>
        User Statistics
      </Heading>
      <SimpleGrid columns={[2, null, 5]} spacing={4}>
        <Stat
          border="1px solid"
          borderColor={borderColor}
          borderRadius="md"
          p={4}
          boxShadow="sm"
        >
          <StatLabel>Total Users</StatLabel>
          <StatNumber>{totals.totalUsers}</StatNumber>
        </Stat>
        <Stat
          border="1px solid"
          borderColor={borderColor}
          borderRadius="md"
          p={4}
          boxShadow="sm"
        >
          <StatLabel>Quiz Attempts Users</StatLabel>
          <StatNumber>{totals.totalQuizAttemptsUsers}</StatNumber>
        </Stat>
        <Stat
          border="1px solid"
          borderColor={borderColor}
          borderRadius="md"
          p={4}
          boxShadow="sm"
        >
          <StatLabel>Last Login Users</StatLabel>
          <StatNumber>{totals.totalLastLoginUsers}</StatNumber>
        </Stat>
        <Stat
          border="1px solid"
          borderColor={borderColor}
          borderRadius="md"
          p={4}
          boxShadow="sm"
        >
          <StatLabel>Time Spent Users</StatLabel>
          <StatNumber>{totals.totalTimeSpentUsers}</StatNumber>
        </Stat>
        <Stat
          border="1px solid"
          borderColor={borderColor}
          borderRadius="md"
          p={4}
          boxShadow="sm"
        >
          <StatLabel>New Users</StatLabel>
          <StatNumber>{totals.totalNewUsers}</StatNumber>
        </Stat>
      </SimpleGrid>
    </Box>
  )
}

export default UserStats
