// src/components/dashboard/DateRangeSelector.jsx
import React from 'react'
import {
  Box,
  Heading,
  Input,
  SimpleGrid,
  Alert,
  AlertIcon,
  useMediaQuery,
} from '@chakra-ui/react'

const DateRangeSelector = ({
  startDate,
  endDate,
  lastLoginAfterDate,
  selectedTables,
  dateError,
  onStartDateChange,
  onEndDateChange,
  onLastLoginDateChange,
}) => {
  const [isLargerThan768] = useMediaQuery('(min-width: 768px)')

  return (
    <Box p={6} borderRadius="lg" boxShadow="md">
      <Heading size={isLargerThan768 ? 'md' : 'sm'} mb={4}>
        Date Range Selection
      </Heading>
      {(selectedTables.includes('quizAttempts') ||
        selectedTables.includes('timeSpent')) && (
        <SimpleGrid columns={[1, null, 2]} spacing={4}>
          <Input
            type="date"
            value={startDate}
            max={new Date().toISOString().split('T')[0]}
            onChange={e => onStartDateChange(e.target.value)}
            placeholder="Start Date"
          />
          <Input
            type="date"
            value={endDate}
            max={new Date().toISOString().split('T')[0]}
            onChange={e => onEndDateChange(e.target.value)}
            placeholder="End Date"
          />
        </SimpleGrid>
      )}
      {selectedTables.includes('lastLogin') && (
        <Input
          type="date"
          value={lastLoginAfterDate}
          max={new Date().toISOString().split('T')[0]}
          onChange={e => onLastLoginDateChange(e.target.value)}
          placeholder="Last Login After Date"
          mt={4}
        />
      )}
      {dateError && (
        <Alert status="error" mt={4}>
          <AlertIcon />
          {dateError}
        </Alert>
      )}
    </Box>
  )
}

export default DateRangeSelector
