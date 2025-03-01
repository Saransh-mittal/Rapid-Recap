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
  Icon,
  Flex,
  Tag,
  TagLabel,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { FiSearch, FiZap, FiArrowRight } from 'react-icons/fi'
import { Trophy, Clock, Users, Sparkles, Target } from 'lucide-react'
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
      <ModalOverlay />
      <ModalContent bg="#1a1527" borderRadius="lg">
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

              {selectedCategories.length > 0 && (
                <Flex mt={2} flexWrap="wrap" gap={2}>
                  {selectedCategories.map(cat => {
                    const category = categories.find(c => c.key === cat)
                    return (
                      <Tag
                        key={cat}
                        colorScheme="purple"
                        size="sm"
                        borderRadius="full"
                      >
                        <TagLabel>{category?.label}</TagLabel>
                      </Tag>
                    )
                  })}
                </Flex>
              )}

              <Text color="gray.300" fontSize="sm" mt={2}>
                {t(
                  'Hold Ctrl/Cmd to select multiple categories (min 1, max 3)',
                )}
              </Text>
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose} color="gray.300">
            {t('Cancel')}
          </Button>
          <Button
            leftIcon={<FiZap />}
            bg="purple.600"
            _hover={{ bg: 'purple.700' }}
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

const QuickClashHeader = ({ onNewChallenge }) => {
  const { t } = useTranslation('QuickClash')

  return (
    <MotionBox
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Flex
        direction={{ base: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ base: 'flex-start', md: 'center' }}
        mb={8}
        gap={4}
      >
        <Box>
          <Heading
            size={{ base: 'xl', md: '2xl' }}
            color="purple.300"
            mb={2}
            textAlign={{ base: 'center', md: 'left' }}
          >
            {t('Quick Clash')}
          </Heading>

          <Text
            color="whiteAlpha.800"
            fontSize="md"
            textAlign={{ base: 'center', md: 'left' }}
          >
            {t(
              'Challenge other players to rapid-fire reading and quiz battles, test your knowledge and rise up the ranks!',
            )}
          </Text>
        </Box>

        <Button
          leftIcon={<FiZap />}
          bg="purple.600"
          _hover={{ bg: 'purple.700' }}
          onClick={onNewChallenge}
          size="md"
          mx={{ base: 'auto', md: 0 }}
          color={'white'}
        >
          {t('New Challenge')}
        </Button>
      </Flex>
    </MotionBox>
  )
}

const Stat = ({ icon, label, value, color }) => (
  <Box textAlign="center" p={2} flex="1" minW={{ base: '40%', md: 'auto' }}>
    <Icon as={icon} color={color} boxSize={6} mb={2} />
    <Text fontSize="sm" color="whiteAlpha.700">
      {label}
    </Text>
    <Text fontSize="xl" fontWeight="bold" color="white">
      {value}
    </Text>
  </Box>
)

const StatsCard = () => {
  const { t } = useTranslation('QuickClash')

  return (
    <Box mb={6}>
      <Box
        borderRadius="lg"
        bg="#1a1527"
        borderWidth="1px"
        borderColor="whiteAlpha.100"
      >
        <Flex wrap="wrap" justify="space-around" py={4} px={4} gap={2}>
          <Stat
            icon={Trophy}
            label={t('Win Rate')}
            value="68%"
            color="yellow.400"
          />
          <Stat
            icon={Clock}
            label={t('Avg. Completion')}
            value="43s"
            color="blue.400"
          />
          <Stat
            icon={Users}
            label={t('Challenges')}
            value="12"
            color="purple.400"
          />
          <Stat
            icon={Sparkles}
            label={t('Best Category')}
            value={t('Science')}
            color="green.400"
          />
        </Flex>
      </Box>
    </Box>
  )
}

const CustomTabs = ({ children }) => {
  const { t } = useTranslation('QuickClash')

  return (
    <Tabs variant="soft-rounded" colorScheme="purple" isLazy>
      <TabList
        mb={4}
        overflowX="auto"
        css={{
          scrollbarWidth: 'none',
          '::-webkit-scrollbar': {
            display: 'none',
          },
        }}
      >
        <Tab
          color="white"
          _selected={{
            color: 'white',
            bg: 'purple.600',
            fontWeight: 'medium',
          }}
          borderRadius="md"
          px={4}
          py={2}
          mr={2}
        >
          <Icon as={Clock} mr={2} />
          {t('Active Challenges')}
        </Tab>
        <Tab
          color="white"
          _selected={{
            color: 'white',
            bg: 'purple.600',
            fontWeight: 'medium',
          }}
          borderRadius="md"
          px={4}
          py={2}
        >
          <Icon as={Trophy} mr={2} />
          {t('History')}
        </Tab>
      </TabList>

      <TabPanels>{children}</TabPanels>
    </Tabs>
  )
}

const QuickClash = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <Container maxW="container.xl" py={8}>
      <QuickClashHeader onNewChallenge={onOpen} />
      <StatsCard />

      <MotionBox
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Box
          borderRadius="lg"
          bg="#1a1527"
          borderWidth="1px"
          borderColor="whiteAlpha.100"
          mb={4}
        >
          <Box p={4}>
            <CustomTabs>
              <TabPanel px={0}>
                <ActiveChallenges />
              </TabPanel>
              <TabPanel px={0}>
                <CompletedChallenges />
              </TabPanel>
            </CustomTabs>
          </Box>
        </Box>
      </MotionBox>

      <NewChallengeModal isOpen={isOpen} onClose={onClose} />
    </Container>
  )
}

export default QuickClash
