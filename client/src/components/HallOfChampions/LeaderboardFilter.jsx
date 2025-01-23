import React, { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Text,
  HStack,
  Icon,
  VStack,
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Trophy, Clock } from 'lucide-react'

const MotionBox = motion(Box)
const MotionButton = motion(Button)
const MotionMenuList = motion(MenuList)

const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const FilterButton = ({ isOpen, onClick, children, isActive }) => (
  <MenuButton
    as={MotionButton}
    px={6}
    py={3}
    position="relative"
    borderRadius="xl"
    bg="transparent"
    color={isActive ? 'white' : 'whiteAlpha.800'}
    _hover={{ color: 'white' }}
    _active={{ bg: 'transparent' }}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    rightIcon={
      <Icon
        as={ChevronDown}
        transform={isOpen ? 'rotate(180deg)' : 'rotate(0deg)'}
        transition="transform 0.2s"
      />
    }
  >
    {children}
    <Box
      position="absolute"
      inset={0}
      borderRadius="xl"
      bg={isActive ? 'whiteAlpha.200' : 'whiteAlpha.100'}
      backdropFilter="blur(8px)"
      zIndex={-1}
      transition="all 0.3s"
    />
  </MenuButton>
)

const LeaderboardFilter = ({ type = 'champions', onFilterChange }) => {
  const [availableMonths, setAvailableMonths] = useState([])
  const [selectedMonth, setSelectedMonth] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchAvailableMonths()
  }, [])

  const fetchAvailableMonths = async () => {
    try {
      const response = await fetch('/api/leaderboard/available-months')
      const data = await response.json()
      if (data.status === 'success') {
        // Transform the data to match our UI needs
        const transformedData = data.data.map(item => ({
          id: `${item.year}-${item.month}`,
          label: `${monthNames[item.month - 1]} ${item.year}`,
          month: item.month,
          year: item.year,
          icon: isCurrentMonth(item.month, item.year) ? Trophy : Clock,
        }))
        setAvailableMonths(transformedData)

        // Select the most recent month by default
        if (transformedData.length > 0) {
          setSelectedMonth(transformedData[0])
          onFilterChange?.({
            month: transformedData[0].month,
            year: transformedData[0].year,
          })
        }
      }
    } catch (error) {
      console.error('Error fetching available months:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const isCurrentMonth = (month, year) => {
    const now = new Date()
    return month === now.getMonth() + 1 && year === now.getFullYear()
  }

  const handleSelect = monthData => {
    setSelectedMonth(monthData)
    onFilterChange?.({
      month: monthData.month,
      year: monthData.year,
    })
  }

  if (isLoading || !selectedMonth) {
    return null // Or a loading spinner
  }

  return (
    <MotionBox
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      sx={{ WebkitTapHighlightColor: 'transparent' }}
    >
      <Menu placement="bottom">
        {({ isOpen }) => (
          <>
            <FilterButton isOpen={isOpen} isActive={true}>
              <HStack spacing={2}>
                <Icon as={selectedMonth.icon} size={16} />
                <Text>{selectedMonth.label}</Text>
              </HStack>
            </FilterButton>

            <AnimatePresence>
              {isOpen && (
                <MotionMenuList
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  bg="rgba(23, 25, 35, 0.98)"
                  border="1px solid"
                  borderColor="whiteAlpha.200"
                  backdropFilter="blur(16px)"
                  boxShadow="lg"
                  py={2}
                  zIndex={100}
                  maxH="300px"
                  overflowY="auto"
                >
                  {availableMonths.map(monthData => (
                    <MenuItem
                      key={monthData.id}
                      onClick={() => handleSelect(monthData)}
                      bg="transparent"
                      _hover={{
                        bg: 'whiteAlpha.200',
                      }}
                      color="white"
                      px={4}
                      py={3}
                    >
                      <HStack spacing={3} align="center">
                        <Icon as={monthData.icon} size={16} />
                        <VStack spacing={0} align="start">
                          <Text fontSize="md">{monthData.label}</Text>
                          {monthData.id === selectedMonth.id && (
                            <Text fontSize="xs" color="pink.300">
                              Currently Selected
                            </Text>
                          )}
                        </VStack>
                      </HStack>
                    </MenuItem>
                  ))}
                </MotionMenuList>
              )}
            </AnimatePresence>
          </>
        )}
      </Menu>
    </MotionBox>
  )
}

export default LeaderboardFilter
