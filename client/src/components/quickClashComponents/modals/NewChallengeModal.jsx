import React, { useState, useCallback, useMemo } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Select,
  InputGroup,
  Input,
  InputRightElement,
  Spinner,
  Box,
  Text,
  Button,
  HStack,
  VStack,
  Icon,
  Flex,
  Tag,
  TagLabel,
  useToast,
} from '@chakra-ui/react'
import { FiSearch, FiZap } from 'react-icons/fi'
import { Target, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import axios from 'axios'

const NewChallengeModal = ({ isOpen, onClose }) => {
  const { t } = useTranslation('QuickClash')
  const toast = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [selectedCategories, setSelectedCategories] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Memoize categories list to prevent re-creation on render
  const categories = useMemo(
    () => [
      { key: 'world', label: t('World') },
      { key: 'politics', label: t('Politics') },
      { key: 'business', label: t('Business') },
      { key: 'technology', label: t('Technology') },
      { key: 'sports', label: t('Sports') },
      { key: 'health', label: t('Health') },
      { key: 'science', label: t('Science') },
      { key: 'environment', label: t('Environment') },
    ],
    [t],
  )

  // Reset state when modal opens/closes
  const resetState = useCallback(() => {
    setSearchTerm('')
    setSearchResults([])
    setSelectedUser(null)
    setSelectedCategories([])
  }, [])

  // Reset form on close
  const handleClose = useCallback(() => {
    resetState()
    onClose()
  }, [resetState, onClose])

  // Search handler with useCallback for optimization
  const handleSearch = useCallback(async () => {
    if (!searchTerm.trim()) return

    setIsSearching(true)
    try {
      const response = await axios.get(`/api/user/search?q=${searchTerm}`)
      setSearchResults(response.data.users || [])
    } catch (error) {
      console.error('Error searching users:', error)
      toast({
        title: t('Search failed'),
        status: 'error',
        duration: 3000,
        isClosable: true,
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
  const handleUserSelect = useCallback(user => {
    setSelectedUser(user)
    setSearchResults([])
    setSearchTerm('')
  }, [])

  // Category selection handler
  const handleCategoryChange = useCallback(e => {
    const options = e.target.options
    const selected = []
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selected.push(options[i].value)
      }
    }
    setSelectedCategories(selected)
  }, [])

  // Submit handler
  const handleSubmit = useCallback(async () => {
    if (!selectedUser || selectedCategories.length === 0) {
      toast({
        title: t('Incomplete form'),
        description: t(
          'Please select both an opponent and at least one category',
        ),
        status: 'warning',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setIsSubmitting(true)
    try {
      await axios.post('/api/quickClash/challenge/create', {
        opponentId: selectedUser._id,
        categories: selectedCategories,
      })

      toast({
        title: t('Challenge created!'),
        description:
          t('Your challenge has been sent to') + ` ${selectedUser.name}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
      handleClose()
    } catch (error) {
      console.error('Error creating challenge:', error)
      toast({
        title: t('Challenge creation failed'),
        description:
          error.response?.data?.message || t('Failed to create challenge'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsSubmitting(false)
    }
  }, [selectedUser, selectedCategories, toast, t, handleClose])

  // Selected category tags
  const categoryTags = useMemo(() => {
    if (selectedCategories.length === 0) return null

    return (
      <Flex mt={2} flexWrap="wrap" gap={2}>
        {selectedCategories.map(cat => {
          const category = categories.find(c => c.key === cat)
          return (
            <Tag key={cat} colorScheme="purple" size="sm" borderRadius="full">
              <TagLabel>{category?.label}</TagLabel>
            </Tag>
          )
        })}
      </Flex>
    )
  }, [selectedCategories, categories])

  // Is submission disabled?
  const isSubmitDisabled = useMemo(() => {
    return (
      !selectedUser ||
      selectedCategories.length === 0 ||
      selectedCategories.length > 3
    )
  }, [selectedUser, selectedCategories])

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <ModalOverlay backdropFilter="blur(5px)" />
      <ModalContent
        bg="#1a1527"
        borderRadius="lg"
        boxShadow="0 8px 32px rgba(0, 0, 0, 0.4)"
      >
        <ModalHeader color="white">
          <HStack>
            <Icon as={Target} color="purple.300" />
            <Text>{t('Create New Challenge')}</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton color="white" />
        <ModalBody py={6}>
          <VStack spacing={6}>
            <FormControl>
              <FormLabel color="whiteAlpha.900">{t('Find Opponent')}</FormLabel>
              <InputGroup>
                <Input
                  placeholder={t('Search by name or username')}
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  onKeyDown={handleKeyDown}
                  bg="whiteAlpha.50"
                  color="white"
                  borderColor="whiteAlpha.200"
                  _hover={{ borderColor: 'purple.400' }}
                  _focus={{
                    borderColor: 'purple.500',
                  }}
                />
                <InputRightElement>
                  {isSearching ? (
                    <Spinner size="sm" color="purple.500" />
                  ) : (
                    <FiSearch
                      color="gray"
                      cursor="pointer"
                      onClick={handleSearch}
                    />
                  )}
                </InputRightElement>
              </InputGroup>

              {searchResults.length > 0 && (
                <Box
                  mt={2}
                  maxH="200px"
                  overflowY="auto"
                  borderRadius="md"
                  border="1px solid"
                  borderColor="whiteAlpha.200"
                  bg="#14101f"
                >
                  {searchResults.map(user => (
                    <Box
                      key={user._id}
                      p={2}
                      _hover={{ bg: 'whiteAlpha.100' }}
                      cursor="pointer"
                      onClick={() => handleUserSelect(user)}
                      transition="background 0.2s"
                    >
                      <Text color="white">
                        {user.name}{' '}
                        <Text as="span" color="purple.300">
                          @{user.inGameName}
                        </Text>
                      </Text>
                    </Box>
                  ))}
                </Box>
              )}

              {selectedUser && (
                <Box
                  mt={3}
                  p={3}
                  borderRadius="md"
                  bg="#2d1b54"
                  borderWidth="1px"
                  borderColor="purple.500"
                >
                  <HStack>
                    <Icon as={Users} color="purple.200" />
                    <Text color="white" fontWeight="medium">
                      {t('Selected Opponent')}:{' '}
                      <Text as="span" fontWeight="bold">
                        {selectedUser.name}
                      </Text>{' '}
                      <Text as="span" fontSize="sm" color="purple.200">
                        @{selectedUser.inGameName}
                      </Text>
                    </Text>
                  </HStack>
                </Box>
              )}
            </FormControl>

            <FormControl>
              <FormLabel color="whiteAlpha.900">
                {t('Select Categories')}
              </FormLabel>
              <Select
                multiple
                size="md"
                onChange={handleCategoryChange}
                bg="whiteAlpha.50"
                color="white"
                borderColor="whiteAlpha.200"
                _hover={{ borderColor: 'purple.400' }}
                _focus={{
                  borderColor: 'purple.500',
                }}
                height="120px"
              >
                {categories.map(category => (
                  <option
                    key={category.key}
                    value={category.key}
                    style={{ background: '#1a1527' }}
                  >
                    {category.label}
                  </option>
                ))}
              </Select>

              {categoryTags}

              <Text color="gray.300" fontSize="sm" mt={2}>
                {t(
                  'Hold Ctrl/Cmd to select multiple categories (min 1, max 3)',
                )}
              </Text>
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={handleClose} color="gray.300">
            {t('Cancel')}
          </Button>
          <Button
            leftIcon={<FiZap />}
            bg="purple.600"
            _hover={{ bg: 'purple.700' }}
            isLoading={isSubmitting}
            isDisabled={isSubmitDisabled}
            onClick={handleSubmit}
          >
            {t('Send Challenge')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default NewChallengeModal
