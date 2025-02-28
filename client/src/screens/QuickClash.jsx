import React, { useState } from 'react'
import {
  Container,
  VStack,
  Box,
  Heading,
  Text,
  Button,
  HStack,
  useDisclosure,
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
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Divider,
  Icon,
} from '@chakra-ui/react'
import { FiSearch, FiZap } from 'react-icons/fi'
import { Trophy, Clock } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import ActiveChallenges from '../components/quickClashComponents/ActiveChallenges'
import CompletedChallenges from '../components/quickClashComponents/CompletedChallenges'

const MotionBox = motion(Box)

const NewChallengeModal = ({ isOpen, onClose }) => {
  const { t } = useTranslation('QuickClash')
  const toast = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [selectedCategories, setSelectedCategories] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Available categories list
  const categories = [
    { key: 'world', label: t('World') },
    { key: 'politics', label: t('Politics') },
    { key: 'business', label: t('Business') },
    { key: 'technology', label: t('Technology') },
    { key: 'sports', label: t('Sports') },
    { key: 'health', label: t('Health') },
    { key: 'science', label: t('Science') },
    { key: 'environment', label: t('Environment') },
  ]

  const handleSearch = async () => {
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
  }

  const handleKeyDown = e => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleUserSelect = user => {
    setSelectedUser(user)
    setSearchResults([])
    setSearchTerm('')
  }

  const handleCategoryChange = e => {
    const options = e.target.options
    const selected = []
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selected.push(options[i].value)
      }
    }
    setSelectedCategories(selected)
  }

  const handleSubmit = async () => {
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
      onClose()
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
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(5px)" />
      <ModalContent
        bg="linear-gradient(135deg, #1a1527, #0f0d15)"
        borderRadius="xl"
        boxShadow="0 8px 32px rgba(0, 0, 0, 0.4)"
      >
        <ModalHeader color="white">{t('Create New Challenge')}</ModalHeader>
        <ModalCloseButton color="white" />
        <ModalBody>
          <VStack spacing={6}>
            <FormControl>
              <FormLabel color="whiteAlpha.900">{t('Find Opponent')}</FormLabel>
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
                    boxShadow: '0 0 0 1px #805AD5',
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
                  bg="whiteAlpha.50"
                >
                  {searchResults.map(user => (
                    <Box
                      key={user._id}
                      p={2}
                      _hover={{ bg: 'whiteAlpha.100' }}
                      cursor="pointer"
                      onClick={() => handleUserSelect(user)}
                    >
                      <Text color="white">
                        {user.name} (@{user.inGameName})
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
                  border="1px solid"
                  borderColor="purple.300"
                  bg="whiteAlpha.100"
                >
                  <Text color="white" fontWeight="bold">
                    {t('Selected Opponent')}: {selectedUser.name} (@
                    {selectedUser.inGameName})
                  </Text>
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
                bg="whiteAlpha.100"
                color="white"
                borderColor="whiteAlpha.300"
                _hover={{ borderColor: 'purple.400' }}
                _focus={{
                  borderColor: 'purple.500',
                  boxShadow: '0 0 0 1px #805AD5',
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
              <Text color="gray.300" fontSize="sm" mt={1}>
                {t(
                  'Hold Ctrl/Cmd to select multiple categories (min 1, max 3)',
                )}
              </Text>
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="outline" mr={3} onClick={onClose} color="gray.300">
            {t('Cancel')}
          </Button>
          <Button
            leftIcon={<FiZap />}
            colorScheme="purple"
            isLoading={isSubmitting}
            isDisabled={
              !selectedUser ||
              selectedCategories.length === 0 ||
              selectedCategories.length > 3
            }
            onClick={handleSubmit}
          >
            {t('Send Challenge')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

const QuickClash = () => {
  const { t } = useTranslation('QuickClash')
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <Container maxW="container.xl" py={8} mt={8}>
      <VStack spacing={8} align="stretch">
        <MotionBox
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <HStack
            justifyContent="space-between"
            alignItems="center"
            wrap="wrap"
          >
            <Box>
              <Heading size="xl" color="whiteAlpha.900">
                {t('Quick Clash')}
              </Heading>
              <Text color="whiteAlpha.700" mt={2}>
                {t(
                  'Challenge other players to rapid-fire reading and quiz battles!',
                )}
              </Text>
            </Box>
            <Button
              leftIcon={<FiZap />}
              size="md"
              colorScheme="purple"
              onClick={onOpen}
              bgGradient="linear(to-r, purple.500, purple.700)"
              _hover={{ bgGradient: 'linear(to-r, purple.600, purple.800)' }}
              boxShadow="0 4px 12px rgba(138, 43, 226, 0.3)"
            >
              {t('New Challenge')}
            </Button>
          </HStack>
        </MotionBox>

        <MotionBox
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          bg="rgba(14, 12, 22, 0.97)"
          borderRadius="xl"
          p={6}
          border="1px solid"
          borderColor="whiteAlpha.100"
        >
          <Tabs variant="soft-rounded" colorScheme="purple">
            <TabList mb={6}>
              <Tab
                color="white"
                _selected={{
                  color: 'white',
                  bg: 'purple.500',
                  fontWeight: 'bold',
                }}
                px={5}
              >
                <Icon as={Clock} mr={2} />
                {t('Active Challenges')}
              </Tab>
              <Tab
                color="white"
                _selected={{
                  color: 'white',
                  bg: 'purple.500',
                  fontWeight: 'bold',
                }}
                px={5}
              >
                <Icon as={Trophy} mr={2} />
                {t('History')}
              </Tab>
            </TabList>

            <TabPanels>
              <TabPanel px={0}>
                <ActiveChallenges />
              </TabPanel>
              <TabPanel px={0}>
                <CompletedChallenges />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </MotionBox>
      </VStack>

      <NewChallengeModal isOpen={isOpen} onClose={onClose} />
    </Container>
  )
}

export default QuickClash
