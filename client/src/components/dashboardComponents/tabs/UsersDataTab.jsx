// src/components/Dashboard/tabs/UsersDataTab.jsx
import React, { useState, useEffect, useCallback } from 'react'
import {
  VStack,
  Box,
  Heading,
  Skeleton,
  useMediaQuery,
  useToast,
  Container,
  useColorModeValue,
} from '@chakra-ui/react'
import { DataTable } from '../../miscellaneous/DataTable'
import { UserStats } from '../components/UserStats'
import { DateSelectionBox } from '../components/DateSelectionBox'
import { DataSelectionBox } from '../components/DataSelectionBox'
import { fetchQuizAttempts, fetchLastLogin, fetchTimeSpent } from '../utils/api'
import { mergeUserData } from '../utils/dataUtils'

/**
 * @typedef {Object} Column
 * @property {string} id - The unique identifier for the column
 * @property {string} label - The display label for the column
 */

const DataTableConfig = {
  pageSize: 10,
  pageSizeOptions: [5, 10, 20, 50],
  defaultSearchFields: ['name', 'email', 'inGameName'],
  exportTypes: ['csv', 'excel'],
  dateFormat: 'YYYY-MM-DD HH:mm:ss',
  emptyMessage: 'No data available',
  loadingMessage: 'Loading data...',
}

export const UsersDataTab = () => {
  // Chakra UI hooks
  const [isLargerThan768] = useMediaQuery('(min-width: 768px)')
  const toast = useToast()

  // Chakra UI color modes
  const boxBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const headingColor = useColorModeValue('gray.700', 'white')

  // State management
  const [quizAttempts, setQuizAttempts] = useState([])
  const [lastLogin, setLastLogin] = useState([])
  const [timeSpent, setTimeSpent] = useState([])
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [lastLoginAfterDate, setLastLoginAfterDate] = useState('')
  const [selectedTables, setSelectedTables] = useState(['quizAttempts'])
  const [dateError, setDateError] = useState('')
  const [loading, setLoading] = useState(true)

  // Initialize dates on component mount
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    setStartDate(today)
    setEndDate(today)
    setLastLoginAfterDate(today)
  }, [])

  // Fetch data when dates or selected tables change
  useEffect(() => {
    const fetchData = async () => {
      if (dateError) return

      setLoading(true)
      try {
        const promises = []

        if (selectedTables.includes('quizAttempts')) {
          promises.push(
            fetchQuizAttempts(startDate, endDate).then(data =>
              setQuizAttempts(data),
            ),
          )
        } else {
          setQuizAttempts([])
        }

        if (selectedTables.includes('lastLogin')) {
          promises.push(
            fetchLastLogin(lastLoginAfterDate).then(data => setLastLogin(data)),
          )
        } else {
          setLastLogin([])
        }

        if (selectedTables.includes('timeSpent')) {
          promises.push(
            fetchTimeSpent(startDate, endDate).then(data => setTimeSpent(data)),
          )
        } else {
          setTimeSpent([])
        }

        await Promise.all(promises)
      } catch (error) {
        console.error('Error fetching data:', error)
        toast({
          title: 'Error fetching data',
          description: error.message || 'Please try again later',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top-right',
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [startDate, endDate, lastLoginAfterDate, selectedTables, dateError, toast])

  // Handle date changes
  const handleDateChange = useCallback(
    setter => event => {
      const { value } = event.target
      const today = new Date().toISOString().split('T')[0]

      if (value > today) {
        setDateError('Dates cannot be in the future.')
        return
      }

      if (setter === setStartDate && value > endDate) {
        setDateError('Start date cannot be greater than end date.')
        return
      }

      if (setter === setEndDate && value < startDate) {
        setDateError('End date cannot be less than start date.')
        return
      }

      setDateError('')
      setter(value)
    },
    [startDate, endDate],
  )

  // Handle table selection changes
  const handleTableChange = useCallback(table => {
    setSelectedTables(prevSelected => {
      if (prevSelected.includes(table)) {
        return prevSelected.filter(t => t !== table)
      }
      return [...prevSelected, table]
    })
  }, [])

  // Get merged columns based on selected tables
  const getMergedColumns = useCallback(() => {
    const baseColumns = [
      { id: 'name', label: 'Name' },
      { id: 'email', label: 'Email' },
      { id: 'inGameName', label: 'In-Game Name' },
    ]

    const additionalColumns = []
    if (selectedTables.includes('quizAttempts')) {
      additionalColumns.push({ id: 'quizAttempts', label: 'Quiz Attempts' })
    }
    if (selectedTables.includes('lastLogin')) {
      additionalColumns.push({ id: 'lastLogin', label: 'Last Login' })
    }
    if (selectedTables.includes('timeSpent')) {
      additionalColumns.push({ id: 'timeSpent', label: 'Time Spent (minutes)' })
    }

    return [...baseColumns, ...additionalColumns]
  }, [selectedTables])

  // Merge data from different sources
  const { data: mergedData, totals } = mergeUserData(
    quizAttempts,
    lastLogin,
    timeSpent,
  )

  return (
    <Container maxW="container.xl" p={0}>
      <VStack spacing={6} align="stretch">
        <DateSelectionBox
          startDate={startDate}
          endDate={endDate}
          lastLoginAfterDate={lastLoginAfterDate}
          selectedTables={selectedTables}
          dateError={dateError}
          handleDateChange={handleDateChange}
        />

        <DataSelectionBox
          selectedTables={selectedTables}
          handleTableChange={handleTableChange}
        />

        {selectedTables.length > 0 && (
          <>
            <UserStats totals={totals} />

            <Box
              py={6}
              px={4}
              borderRadius="lg"
              boxShadow="md"
              bg={boxBg}
              borderWidth="1px"
              borderColor={borderColor}
            >
              <Heading
                size={isLargerThan768 ? 'md' : 'sm'}
                mb={4}
                color={headingColor}
              >
                Merged Data
              </Heading>
              {loading ? (
                <Skeleton
                  height="200px"
                  startColor={useColorModeValue('gray.100', 'gray.700')}
                  endColor={useColorModeValue('gray.400', 'gray.900')}
                />
              ) : (
                <Box overflowX="auto">
                  <DataTable
                    columns={getMergedColumns()}
                    data={mergedData}
                    initialSort={{ id: 'name', desc: false }}
                    pagination={true}
                    searchable={['name', 'email', 'inGameName']}
                    exportable={true}
                    exportFilename="user-data-export"
                    onRowClick={row => {
                      toast({
                        title: 'User Selected',
                        description: `${row.name} (${row.email})`,
                        status: 'info',
                        duration: 2000,
                        position: 'top-right',
                        isClosable: true,
                      })
                    }}
                  />
                </Box>
              )}
            </Box>
          </>
        )}
      </VStack>
    </Container>
  )
}

export default React.memo(UsersDataTab)
