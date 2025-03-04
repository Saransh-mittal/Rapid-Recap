// components/quickClashComponents/modals/newChallengeComponents/UserSearchStep.jsx
import React, { useState, useCallback } from 'react'
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
} from '@chakra-ui/react'
import { FiSearch } from 'react-icons/fi'
import { Users, Swords } from 'lucide-react'
import { motion } from 'framer-motion'
import axios from 'axios'
import { useTranslation } from 'react-i18next'

const MotionBox = motion(Box)

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

  // Search handler
  const handleSearch = useCallback(async () => {
    if (!searchTerm.trim()) return

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
  }, [searchTerm, toast, t])

  // Handle enter key press
  const handleKeyDown = useCallback(
    e => {
      if (e.key === 'Enter') {
        handleSearch()
      }
    },
    [handleSearch],
  )

  // Select user handler
  const handleUserSelect = useCallback(
    user => {
      setSelectedUser(user)
      setSearchResults([])
      setSearchTerm('')
      // Automatically move to the next step on mobile
      if (isMobile) {
        setStep(2)
      }
    },
    [isMobile, setSelectedUser, setStep],
  )

  return (
    <VStack spacing={6}>
      <FormControl>
        <FormLabel color="whiteAlpha.900" fontWeight="medium">
          {t('Find Your Worthy Opponent')}
        </FormLabel>
        <InputGroup>
          <Input
            placeholder={t('Search by name or inGameName')}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
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
                cursor="pointer"
                onClick={handleSearch}
                _hover={{ color: 'white' }}
              />
            )}
          </InputRightElement>
        </InputGroup>

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
      </FormControl>
    </VStack>
  )
}

export default UserSearchStep
