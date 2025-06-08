// components/quickClashComponents/modals/newChallengeComponents/UserSearchStep.jsx
import React, { useState, useCallback, useEffect, useRef } from 'react'
import {
  Box,
  FormControl,
  FormLabel,
  InputGroup,
  Input,
  InputRightElement,
  Spinner,
  VStack,
  HStack,
  Text,
  Badge,
  Icon,
  useToast,
  Flex,
  IconButton,
  Tooltip,
} from '@chakra-ui/react'
import { FiSearch, FiX, FiTrash2 } from 'react-icons/fi'
import { Users, Swords, Clock, History } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import { useTranslation } from 'react-i18next'

const MotionBox = motion(Box)

// localStorage key for search history
const SEARCH_HISTORY_KEY = 'quickclash-search-history'

// Helper function to test localStorage availability
const isLocalStorageAvailable = () => {
  try {
    const testKey = '__storage_test__'
    localStorage.setItem(testKey, testKey)
    localStorage.removeItem(testKey)
    return true
  } catch (e) {
    return false
  }
}

const UserSearchStep = ({
  selectedUser,
  setSelectedUser,
  isMobile,
  setStep,
}) => {
  const { t } = useTranslation('QuickClash')
  const toast = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchHistory, setSearchHistory] = useState([])
  const [showHistory, setShowHistory] = useState(true)

  // Debounce timer reference
  const debounceTimerRef = useRef(null)

  // Load search history on initial render
  useEffect(() => {
    const loadHistory = () => {
      if (!isLocalStorageAvailable()) {
        console.error('localStorage is not available in this browser/context')
        return
      }

      try {
        const history = localStorage.getItem(SEARCH_HISTORY_KEY)

        if (history) {
          const parsedHistory = JSON.parse(history)

          setSearchHistory(parsedHistory)
        }
      } catch (err) {
        console.error('Error loading search history:', err)
        // If there's an error loading (e.g., invalid JSON), reset the history
        try {
          localStorage.removeItem(SEARCH_HISTORY_KEY)
        } catch (removeErr) {
          console.error('Error removing broken history:', removeErr)
        }
      }
    }

    loadHistory()
  }, [])

  // Update localStorage when search history changes
  useEffect(() => {
    // Skip empty updates
    if (searchHistory.length === 0) {
      return
    }

    if (!isLocalStorageAvailable()) {
      console.error('localStorage is not available for saving history')
      return
    }

    // Use setTimeout to ensure this runs after React has finished updating the DOM
    setTimeout(() => {
      try {
        const historyString = JSON.stringify(searchHistory)

        localStorage.setItem(SEARCH_HISTORY_KEY, historyString)

        // Verify it was saved correctly
        const savedValue = localStorage.getItem(SEARCH_HISTORY_KEY)
      } catch (err) {
        console.error('Error saving search history to localStorage:', err)
      }
    }, 0)
  }, [searchHistory])

  // Debounced search handler
  const debouncedSearch = useCallback(() => {
    // Clear any existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // Don't search for empty terms
    if (!searchTerm.trim()) {
      setSearchResults([])
      return
    }

    // Set a new timer for the search
    debounceTimerRef.current = setTimeout(async () => {
      setIsSearching(true)
      try {
        const response = await axios.get(`/api/user/search?query=${searchTerm}`)
        setSearchResults(response.data || [])
      } catch (error) {
        console.error('Error searching users:', error)
        toast({
          title: t('Search failed'),
          status: 'error',
          duration: 3000,
          isClosable: true,
          position: 'top',
        })
      } finally {
        setIsSearching(false)
      }
    }, 500) // 500ms debounce
  }, [searchTerm, toast, t])

  // Execute debounced search when searchTerm changes
  useEffect(() => {
    debouncedSearch()

    // Cleanup function to clear timer
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [searchTerm, debouncedSearch])

  // Add user to search history
  const addToHistory = useCallback(user => {
    // Extract only the needed properties to avoid circular references
    const userToSave = {
      _id: user._id,
      name: user.name,
      inGameName: user.inGameName,
      pic: user.pic || null,
      level: user.level || null,
    }

    // Get current history directly from localStorage first
    let currentHistory = []
    try {
      const storedHistory = localStorage.getItem(SEARCH_HISTORY_KEY)
      if (storedHistory) {
        currentHistory = JSON.parse(storedHistory)
      }
    } catch (err) {
      console.error('Error reading history from localStorage:', err)
    }

    // Remove the user if already in history to prevent duplicates
    const filteredHistory = currentHistory.filter(item => item._id !== user._id)

    // Add user to the beginning of the history (most recent)
    const newHistory = [userToSave, ...filteredHistory].slice(0, 10) // Keep only the 10 most recent

    // Save directly to localStorage
    try {
      const historyString = JSON.stringify(newHistory)
      localStorage.setItem(SEARCH_HISTORY_KEY, historyString)

      // Then update the state
      setSearchHistory(newHistory)
    } catch (err) {
      console.error('Error saving to localStorage in addToHistory:', err)
    }
  }, [])

  // Remove user from search history
  const removeFromHistory = useCallback((userId, e) => {
    // Stop the click from propagating to parent (which would select the user)
    e.stopPropagation()

    // Get current history directly from localStorage
    try {
      const storedHistory = localStorage.getItem(SEARCH_HISTORY_KEY)
      if (storedHistory) {
        const currentHistory = JSON.parse(storedHistory)

        // Filter out the user to remove
        const newHistory = currentHistory.filter(user => user._id !== userId)

        // Save back to localStorage
        localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory))

        // Update the state
        setSearchHistory(newHistory)
      }
    } catch (err) {
      console.error('Error removing user from history:', err)

      // Fallback to just updating the state
      setSearchHistory(prevHistory => {
        const newHistory = prevHistory.filter(user => user._id !== userId)
        return newHistory
      })
    }
  }, [])

  // Clear all search history
  const clearHistory = useCallback(() => {
    // Directly clear from localStorage
    try {
      localStorage.removeItem(SEARCH_HISTORY_KEY)
    } catch (err) {
      console.error('Error clearing localStorage:', err)
    }

    // Update state to reflect empty history
    setSearchHistory([])

    toast({
      title: t('Search history cleared'),
      status: 'info',
      duration: 2000,
      isClosable: true,
      position: 'top',
    })
  }, [t, toast])

  // Select user handler
  const handleUserSelect = useCallback(
    user => {
      setSelectedUser(user)
      setSearchResults([])
      setSearchTerm('')

      // Directly add to history without delay
      addToHistory(user)

      // Automatically move to the next step on mobile
      if (isMobile) {
        setStep(2)
      }
    },
    [isMobile, setSelectedUser, setStep, addToHistory],
  )

  // Toggle search history visibility
  const toggleHistory = useCallback(() => {
    setShowHistory(prev => !prev)
  }, [])

  return (
    <VStack spacing={6}>
      <FormControl>
        <FormLabel color="whiteAlpha.900" fontWeight="medium">
          {t('Find Your Worthy Opponent')}
        </FormLabel>
        <InputGroup>
          <Input
            placeholder={t('Name or InGameName')}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            bg="whiteAlpha.100"
            color="white"
            borderColor="whiteAlpha.300"
            _hover={{ borderColor: 'purple.400' }}
            _focus={{
              borderColor: 'purple.500',
              boxShadow: '0 0 0 1px purple.500',
            }}
            borderRadius="md"
            fontSize="md"
          />
          <InputRightElement>
            {isSearching ? (
              <Spinner size="sm" color="purple.500" />
            ) : (
              <Icon
                as={FiSearch}
                color="gray.400"
                _hover={{ color: 'white' }}
              />
            )}
          </InputRightElement>
        </InputGroup>

        {/* Search Results */}
        <AnimatePresence>
          {searchResults.length > 0 && (
            <MotionBox
              mt={3}
              maxH="200px"
              overflowY="auto"
              borderRadius="md"
              border="1px solid"
              borderColor="whiteAlpha.200"
              bg="rgba(20, 16, 31, 0.8)"
              boxShadow="0 4px 12px rgba(0, 0, 0, 0.2)"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {searchResults.map(user => (
                <MotionBox
                  key={user._id}
                  p={3}
                  _hover={{ bg: 'rgba(138, 43, 226, 0.2)' }}
                  cursor="pointer"
                  onClick={() => handleUserSelect(user)}
                  transition="all 0.2s"
                  borderBottom="1px solid"
                  borderColor="whiteAlpha.100"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <HStack>
                    <Icon as={Users} color="purple.300" />
                    <Box>
                      <Text color="white" fontWeight="medium">
                        {user.name}
                      </Text>
                      <Text color="purple.300" fontSize="sm">
                        @{user.inGameName}
                      </Text>
                    </Box>
                  </HStack>
                </MotionBox>
              ))}
            </MotionBox>
          )}
        </AnimatePresence>

        {/* Selected User */}
        {selectedUser && (
          <MotionBox
            mt={4}
            p={4}
            borderRadius="lg"
            bg="rgba(45, 27, 84, 0.5)"
            borderWidth="1px"
            borderColor="purple.500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <HStack>
              <Icon as={Swords} color="yellow.400" boxSize={5} />
              <Box>
                <Text color="white" fontWeight="bold">
                  {t('Selected Opponent')}:
                </Text>
                <HStack mt={1}>
                  <Text color="white">{selectedUser.name}</Text>
                  <Badge colorScheme="purple" borderRadius="full">
                    @{selectedUser.inGameName}
                  </Badge>
                </HStack>
              </Box>
            </HStack>
          </MotionBox>
        )}

        {/* Search History Section */}
        {searchHistory.length > 0 && !searchResults.length && !selectedUser && (
          <MotionBox
            mt={4}
            borderRadius="lg"
            bg="rgba(20, 16, 31, 0.6)"
            borderWidth="1px"
            borderColor="whiteAlpha.200"
            overflow="hidden"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            {/* History Header */}
            <Flex
              justify="space-between"
              align="center"
              bg="rgba(45, 27, 84, 0.5)"
              px={4}
              py={3}
              borderBottomWidth={showHistory ? '1px' : '0'}
              borderColor="whiteAlpha.200"
            >
              <HStack>
                <Icon as={History} color="purple.300" />
                <Text color="white" fontWeight="medium">
                  {t('Recent Opponents')}
                </Text>
              </HStack>
              <HStack>
                <Tooltip
                  label={showHistory ? t('Hide history') : t('Show history')}
                >
                  <IconButton
                    icon={<Icon as={showHistory ? FiX : History} />}
                    size="sm"
                    variant="ghost"
                    colorScheme="purple"
                    onClick={toggleHistory}
                    aria-label={
                      showHistory ? t('Hide history') : t('Show history')
                    }
                  />
                </Tooltip>
                {showHistory && (
                  <Tooltip label={t('Clear history')}>
                    <IconButton
                      icon={<Icon as={FiTrash2} />}
                      size="sm"
                      variant="ghost"
                      colorScheme="red"
                      onClick={clearHistory}
                      aria-label={t('Clear history')}
                    />
                  </Tooltip>
                )}
              </HStack>
            </Flex>

            {/* History List */}
            <AnimatePresence>
              {showHistory && (
                <MotionBox
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  maxH="250px"
                  overflowY="auto"
                >
                  {searchHistory.map((user, index) => (
                    <MotionBox
                      key={user._id}
                      p={3}
                      _hover={{ bg: 'rgba(138, 43, 226, 0.2)' }}
                      cursor="pointer"
                      onClick={() => handleUserSelect(user)}
                      borderBottom={
                        index < searchHistory.length - 1 ? '1px solid' : 'none'
                      }
                      borderColor="whiteAlpha.100"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                    >
                      <Flex justify="space-between" align="center">
                        <HStack>
                          <Icon as={Clock} color="purple.300" size={4} />
                          <Box>
                            <Text color="white" fontWeight="medium">
                              {user.name}
                            </Text>
                            <Text color="purple.300" fontSize="sm">
                              @{user.inGameName}
                            </Text>
                          </Box>
                        </HStack>
                        <IconButton
                          icon={<Icon as={FiX} />}
                          size="xs"
                          variant="ghost"
                          colorScheme="red"
                          onClick={e => removeFromHistory(user._id, e)}
                          aria-label={t('Remove from history')}
                        />
                      </Flex>
                    </MotionBox>
                  ))}
                </MotionBox>
              )}
            </AnimatePresence>
          </MotionBox>
        )}
      </FormControl>
    </VStack>
  )
}

export default UserSearchStep
