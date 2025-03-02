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
  TagCloseButton,
  useToast,
  Divider,
  Badge,
  useBreakpointValue,
  Progress,
} from '@chakra-ui/react'
import { FiSearch, FiZap, FiX } from 'react-icons/fi'
import {
  Target,
  Users,
  Award,
  Shield,
  Swords,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import axios from 'axios'
import { categories } from '../../../assets/Categories'

const MotionBox = motion(Box)
const MotionButton = motion(Button)

const NewChallengeModal = ({ isOpen, onClose, preSelectedUser = null }) => {
  const { t } = useTranslation('QuickClash')
  const toast = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedUser, setSelectedUser] = useState(preSelectedUser || null)
  const [selectedCategories, setSelectedCategories] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [step, setStep] = useState(preSelectedUser ? 2 : 1) // 1: Select opponent, 2: Select categories

  // Responsive adjustments
  const modalSize = useBreakpointValue({ base: 'full', md: 'lg' })
  const buttonSize = useBreakpointValue({ base: 'md', md: 'md' })
  const tagSize = useBreakpointValue({ base: 'sm', md: 'md' })
  const isMobile = useBreakpointValue({ base: true, md: false })

  // Import categories from the provided Categories module
  const allCategories = useMemo(() => {
    // Filter out 'all', 'top', and 'general' categories
    const filteredCategories = categories.filter(
      cat => !['all', 'top', 'general'].includes(cat.key),
    )

    // Add color and icon based on category key
    return filteredCategories.map(cat => {
      let color = 'purple'
      let icon = Target

      switch (cat.key) {
        case 'world':
          color = 'blue'
          break
        case 'politics':
          color = 'red'
          icon = Shield
          break
        case 'business':
          color = 'green'
          icon = Award
          break
        case 'technology':
          color = 'cyan'
          break
        case 'sports':
          color = 'orange'
          icon = Swords
          break
        case 'health':
          color = 'teal'
          icon = CheckCircle
          break
        case 'science':
          color = 'purple'
          break
        case 'environment':
          color = 'green'
          break
        case 'crime':
          color = 'red'
          break
        case 'education':
          color = 'blue'
          break
        case 'entertainment':
          color = 'pink'
          break
        case 'food':
          color = 'orange'
          break
        case 'lifestyle':
          color = 'teal'
          break
        case 'tourism':
          color = 'green'
          break
        default:
          color = 'purple'
      }

      return {
        ...cat,
        color,
        icon,
      }
    })
  }, [categories])

  // Reset state when modal opens/closes
  const resetState = useCallback(() => {
    setSearchTerm('')
    setSearchResults([])
    setSelectedUser(null)
    setSelectedCategories([])
    setStep(1)
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
    [isMobile],
  )

  // Category selection handler for multiple select
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

  // Category toggle handler for mobile view - exactly 2 categories
  const toggleCategory = useCallback(
    categoryKey => {
      setSelectedCategories(prev => {
        if (prev.includes(categoryKey)) {
          // Allow removing a category
          return prev.filter(c => c !== categoryKey)
        } else {
          if (prev.length >= 2) {
            // Exactly 2 categories required - replace the oldest selection if trying to add a third
            toast({
              title: t('Only 2 categories allowed'),
              description: t('First category has been replaced'),
              status: 'info',
              duration: 2000,
              isClosable: true,
              position: 'top',
            })
            // Return the most recent selection plus the new selection (remove the oldest)
            return [prev[1], categoryKey]
          }
          // Add the new category
          return [...prev, categoryKey]
        }
      })
    },
    [t, toast],
  )

  // Remove category
  const removeCategory = useCallback(categoryKey => {
    setSelectedCategories(prev => prev.filter(c => c !== categoryKey))
  }, [])

  // Go to next step
  const goToNextStep = useCallback(() => {
    if (step === 1 && !selectedUser) {
      toast({
        title: t('Please select an opponent'),
        status: 'warning',
        duration: 2000,
        isClosable: true,
        position: 'top',
      })
      return
    }
    setStep(2)
  }, [step, selectedUser, t, toast])

  // Go back to previous step
  const goToPreviousStep = useCallback(() => {
    setStep(1)
  }, [])

  // Submit handler
  const handleSubmit = useCallback(async () => {
    // Modified to require exactly 2 categories
    if (!selectedUser || selectedCategories.length !== 2) {
      toast({
        title: t('Incomplete selection'),
        description: t('Please select an opponent and exactly 2 categories'),
        status: 'warning',
        duration: 3000,
        isClosable: true,
        position: 'top',
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
        position: 'top',
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
        position: 'top',
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
          const category = allCategories.find(c => c.key === cat)
          return (
            <Tag
              key={cat}
              colorScheme={category?.color || 'purple'}
              size={tagSize}
              borderRadius="full"
              pr={1}
            >
              <TagLabel>{category?.label}</TagLabel>
              <TagCloseButton onClick={() => removeCategory(cat)} />
            </Tag>
          )
        })}
      </Flex>
    )
  }, [selectedCategories, categories, tagSize, removeCategory])

  // Is submission disabled? - Exactly 2 categories required
  const isSubmitDisabled = useMemo(() => {
    return (
      !selectedUser || selectedCategories.length !== 2 // Exactly 2 categories required
    )
  }, [selectedUser, selectedCategories])

  // Progress percentage for steps
  const progressPercentage = useMemo(() => {
    return step === 1 ? 50 : 100
  }, [step])

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size={modalSize}
      motionPreset="slideInBottom"
    >
      <ModalOverlay backdropFilter="blur(10px)" bg="rgba(0,0,0,0.7)" />
      <ModalContent
        bg="linear-gradient(to bottom, #2d1b54, #1a1527)"
        borderRadius="xl"
        boxShadow="0 8px 32px rgba(0, 0, 0, 0.6)"
        borderWidth="1px"
        borderColor="purple.600"
        overflow="hidden"
        mx={3}
      >
        {/* Header with progress */}
        <Box position="relative">
          <Progress
            value={progressPercentage}
            colorScheme="purple"
            size="xs"
            position="absolute"
            top="0"
            width="100%"
            borderRadius="0"
          />
          <ModalHeader color="white" pt={6}>
            <HStack>
              <Icon
                as={step === 1 ? Users : Target}
                color="purple.300"
                boxSize={5}
              />
              <Text fontWeight="bold">
                {step === 1
                  ? t('Select Your Opponent')
                  : t('Choose Battle Categories')}
              </Text>
            </HStack>
            {step === 2 && (
              <HStack mt={1}>
                <Badge
                  colorScheme="purple"
                  px={2}
                  py={1}
                  borderRadius="md"
                  variant="solid"
                >
                  {t('Step')} {step}/2
                </Badge>
                <Text fontSize="sm" color="whiteAlpha.700">
                  {t('Select 2-3 categories')}
                </Text>
              </HStack>
            )}
          </ModalHeader>
        </Box>
        <ModalCloseButton color="white" />

        <ModalBody py={6}>
          {step === 1 ? (
            <VStack spacing={6}>
              <FormControl>
                <FormLabel color="whiteAlpha.900" fontWeight="medium">
                  {t('Find Your Worthy Opponent')}
                </FormLabel>
                <InputGroup>
                  <Input
                    placeholder={t('Search by name or username')}
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
          ) : (
            <VStack spacing={6}>
              <FormControl>
                <FormLabel color="whiteAlpha.900" fontWeight="medium">
                  {t('Select Battle Categories')}
                </FormLabel>

                {!isMobile ? (
                  // Desktop view: Multi-select dropdown
                  <Box>
                    <Select
                      multiple
                      size="md"
                      onChange={handleCategoryChange}
                      bg="whiteAlpha.100"
                      color="white"
                      borderColor="whiteAlpha.300"
                      _hover={{ borderColor: 'purple.400' }}
                      _focus={{
                        borderColor: 'purple.500',
                      }}
                      height="120px"
                      value={selectedCategories}
                    >
                      {allCategories.map(category => (
                        <option
                          key={category.key}
                          value={category.key}
                          style={{ background: '#1a1527' }}
                        >
                          {category.label}
                        </option>
                      ))}
                    </Select>
                    <Text color="gray.300" fontSize="sm" mt={2}>
                      {t('Hold Ctrl/Cmd to select exactly 2 categories')}
                    </Text>
                  </Box>
                ) : (
                  // Mobile view: Clickable cards
                  <MotionBox
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Flex wrap="wrap" gap={2} justify="center">
                      {allCategories.map(category => (
                        <MotionBox
                          key={category.key}
                          onClick={() => toggleCategory(category.key)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          width="calc(50% - 8px)"
                          p={3}
                          borderRadius="md"
                          bg={
                            selectedCategories.includes(category.key)
                              ? `${category.color}.700`
                              : 'whiteAlpha.100'
                          }
                          borderWidth="1px"
                          borderColor={
                            selectedCategories.includes(category.key)
                              ? `${category.color}.500`
                              : 'whiteAlpha.200'
                          }
                          cursor="pointer"
                          transition="all 0.2s"
                          boxShadow={
                            selectedCategories.includes(category.key)
                              ? `0 0 12px rgba(138, 43, 226, 0.3)`
                              : 'none'
                          }
                          mb={2}
                        >
                          <VStack spacing={1} align="center">
                            <Icon
                              as={category.icon}
                              color={`${category.color}.300`}
                              boxSize={5}
                            />
                            <Text
                              color="white"
                              fontWeight={
                                selectedCategories.includes(category.key)
                                  ? 'bold'
                                  : 'normal'
                              }
                              fontSize="sm"
                            >
                              {category.label}
                            </Text>
                          </VStack>
                        </MotionBox>
                      ))}
                    </Flex>
                    <Text
                      color="gray.300"
                      fontSize="xs"
                      mt={3}
                      textAlign="center"
                    >
                      {t('Tap to select exactly 2 categories')}
                    </Text>
                  </MotionBox>
                )}

                {/* Selected categories visualization */}
                {categoryTags && (
                  <Box mt={4}>
                    <Divider my={2} borderColor="whiteAlpha.300" />
                    <HStack>
                      <Text fontSize="sm" color="whiteAlpha.700">
                        {t('Selected Categories')}:
                      </Text>
                      <Badge
                        colorScheme={
                          selectedCategories.length === 2 ? 'green' : 'red'
                        }
                      >
                        {selectedCategories.length}/2
                      </Badge>
                    </HStack>
                    {categoryTags}
                    {selectedCategories.length !== 2 && (
                      <Text color="red.300" fontSize="xs" mt={2}>
                        <Icon as={AlertTriangle} boxSize={3} mr={1} />
                        {t('Please select exactly 2 categories')}
                      </Text>
                    )}
                  </Box>
                )}
              </FormControl>
            </VStack>
          )}
        </ModalBody>

        <ModalFooter
          borderTopWidth="1px"
          borderColor="whiteAlpha.200"
          bgGradient="linear(to-b, rgba(45, 27, 84, 0.3), rgba(45, 27, 84, 0.1))"
          py={4}
        >
          {step === 1 ? (
            <Flex width="100%" justify="space-between">
              <Button
                variant="ghost"
                onClick={handleClose}
                color="whiteAlpha.700"
                _hover={{ bg: 'whiteAlpha.100', color: 'white' }}
                size={buttonSize}
              >
                {t('Cancel')}
              </Button>
              <MotionButton
                rightIcon={<Icon as={Target} />}
                onClick={goToNextStep}
                isDisabled={!selectedUser}
                bgGradient="linear(to-r, purple.500, purple.700)"
                _hover={{ bgGradient: 'linear(to-r, purple.600, purple.800)' }}
                color="white"
                size={buttonSize}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                boxShadow="0 4px 10px rgba(138, 43, 226, 0.3)"
              >
                {t('Next: Choose Categories')}
              </MotionButton>
            </Flex>
          ) : (
            <Flex width="100%" justify="space-between" gap={4}>
              <Button
                leftIcon={<Icon as={FiX} />}
                onClick={goToPreviousStep}
                variant="outline"
                colorScheme="whiteAlpha"
                size={buttonSize}
              >
                {t('Back')}
              </Button>
              <MotionButton
                rightIcon={<Icon as={FiZap} />}
                onClick={handleSubmit}
                isLoading={isSubmitting}
                isDisabled={isSubmitDisabled}
                bgGradient="linear(to-r, yellow.400, orange.500)"
                _hover={{ bgGradient: 'linear(to-r, yellow.500, orange.600)' }}
                color="black"
                fontWeight="bold"
                size={buttonSize}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                boxShadow="0 4px 15px rgba(255, 186, 8, 0.4)"
              >
                {t('Send Challenge')}
              </MotionButton>
            </Flex>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default NewChallengeModal
