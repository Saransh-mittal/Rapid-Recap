// src/components/dashboard/DataSelector.jsx
import React from 'react'
import {
  Box,
  Heading,
  SimpleGrid,
  Button,
  useMediaQuery,
} from '@chakra-ui/react'

const DataSelector = ({ selectedTables, handleTableChange }) => {
  const [isLargerThan768] = useMediaQuery('(min-width: 768px)')
  const buttonColorScheme = 'teal'

  return (
    <Box p={6} borderRadius="lg" boxShadow="md">
      <Heading size={isLargerThan768 ? 'md' : 'sm'} mb={4}>
        Data Selection
      </Heading>
      <SimpleGrid columns={[1, null, 4]} spacing={4}>
        <Button
          onClick={() => handleTableChange('quizAttempts')}
          colorScheme={buttonColorScheme}
          variant={
            selectedTables.includes('quizAttempts') ? 'solid' : 'outline'
          }
        >
          Quiz Attempts
        </Button>
        <Button
          onClick={() => handleTableChange('lastLogin')}
          colorScheme={buttonColorScheme}
          variant={selectedTables.includes('lastLogin') ? 'solid' : 'outline'}
        >
          Last Login Times
        </Button>
        <Button
          onClick={() => handleTableChange('timeSpent')}
          colorScheme={buttonColorScheme}
          variant={selectedTables.includes('timeSpent') ? 'solid' : 'outline'}
        >
          Time Spent
        </Button>
        <Button
          onClick={() => handleTableChange('newUsers')}
          colorScheme={buttonColorScheme}
          variant={selectedTables.includes('newUsers') ? 'solid' : 'outline'}
        >
          New Users
        </Button>
      </SimpleGrid>
    </Box>
  )
}

export default DataSelector
