// components/quickClashComponents/team/InviteUserModal.jsx
import React, { useState, useEffect, useCallback } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Text,
  HStack,
  Icon,
  Avatar,
  Box,
  Divider,
  Spinner,
  Badge,
  InputGroup,
  InputLeftElement,
  useToast,
  Flex,
  Tooltip,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  UserPlus,
  Users,
  Search,
  User,
  Plus,
  Check,
  Trophy,
  Star,
  Target,
  Zap,
} from 'lucide-react'
import axios from 'axios'
import { debounce } from 'lodash'

const MotionModalContent = motion(ModalContent)
const MotionBox = motion(Box)

// User Card Component for search results
const UserResultCard = ({ user, onSelect, isSelected }) => {
  const { t } = useTranslation('QuickClash')

  return (
    <MotionBox
      display="flex"
      alignItems="center"
      gap={4}
      p={4}
      borderRadius="lg"
      bg={isSelected ? 'rgba(66, 153, 225, 0.15)' : 'whiteAlpha.50'}
      borderWidth="1px"
      borderColor={isSelected ? 'blue.500' : 'whiteAlpha.200'}
      _hover={{
        bg: isSelected ? 'rgba(66, 153, 225, 0.2)' : 'whiteAlpha.100',
        borderColor: isSelected ? 'blue.400' : 'whiteAlpha.300',
      }}
      cursor="pointer"
      onClick={() => onSelect(user)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      position="relative"
    >
      {/* Avatar */}
      <Avatar
        size="md"
        name={user.name || user.inGameName}
        src={user.pic}
        bg="purple.500"
      >
        {user.displayedBadge && (
          <Badge
            position="absolute"
            bottom="-2"
            right="-2"
            bg="gold"
            color="black"
            fontSize="xs"
            borderRadius="full"
            px={1}
          >
            {user.displayedBadge.badgeName || '★'}
          </Badge>
        )}
      </Avatar>

      {/* User Info */}
      <Box flex="1">
        <Flex justify="space-between" align="center" mb={1}>
          <Text color="white" fontWeight="bold" fontSize="md">
            {user.name || user.inGameName}
          </Text>
          {isSelected && <Icon as={Check} color="green.400" boxSize={5} />}
        </Flex>

        {/* Display both name and inGameName if different */}
        {user.name && user.inGameName && user.name !== user.inGameName && (
          <Text fontSize="sm" color="whiteAlpha.700" mb={1}>
            @{user.inGameName}
          </Text>
        )}

        {/* User Stats */}
        <HStack spacing={3} wrap="wrap">
          {/* IQ Score */}
          <HStack spacing={1}>
            <Icon as={Target} color="purple.400" boxSize={3} />
            <Text fontSize="xs" color="whiteAlpha.700">
              IQ: {user.IQ_score || 0}
            </Text>
          </HStack>

          {/* Level */}
          {user.level > 0 && (
            <HStack spacing={1}>
              <Icon as={Star} color="yellow.400" boxSize={3} />
              <Text fontSize="xs" color="whiteAlpha.700">
                Lv.{user.level}
              </Text>
            </HStack>
          )}

          {/* RQM Average */}
          {user.RQM_avg > 0 && (
            <HStack spacing={1}>
              <Icon as={Zap} color="cyan.400" boxSize={3} />
              <Text fontSize="xs" color="whiteAlpha.700">
                RQM: {user.RQM_avg}
              </Text>
            </HStack>
          )}

          {/* Rank */}
          {user.rank && (
            <HStack spacing={1}>
              <Icon as={Trophy} color="orange.400" boxSize={3} />
              <Text fontSize="xs" color="whiteAlpha.700">
                #{user.rank}
              </Text>
            </HStack>
          )}
        </HStack>

        {/* Quiz Submissions */}
        <Text fontSize="xs" color="whiteAlpha.500" mt={1}>
          {user.quizSubmissions} {t('quizzes completed')}
        </Text>
      </Box>

      {/* Add Icon */}
      {!isSelected && <Icon as={Plus} color="blue.400" boxSize={5} />}
    </MotionBox>
  )
}

/**
 * Modal for inviting users to a team
 */
const InviteUserModal = ({ isOpen, onClose, teamId, teamName, onInvite }) => {
  const { t } = useTranslation('QuickClash')
  const toast = useToast()

  // State
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [inviting, setInviting] = useState(false)

  // Modal animation
  const modalVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 25,
      },
    },
    exit: {
      opacity: 0,
      y: 20,
      scale: 0.95,
      transition: {
        duration: 0.2,
      },
    },
  }

  // Search for users
  const searchUsers = useCallback(
    debounce(async query => {
      if (!query || query.length < 2) {
        setSearchResults([])
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        // Updated to use the correct endpoint
        const response = await axios.get('/api/user/search', {
          params: { query },
        })

        // Response is directly an array, not wrapped in a users property
        setSearchResults(response.data || [])
      } catch (error) {
        console.error('Error searching users:', error)
        toast({
          title: t('Error'),
          description: t('Failed to search for users'),
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
        setSearchResults([])
      } finally {
        setLoading(false)
      }
    }, 500),
    [toast, t],
  )

  // Handle search input change
  const handleSearchInputChange = e => {
    const value = e.target.value
    setSearchQuery(value)
    setSelectedUser(null) // Clear selection when searching
    searchUsers(value)
  }

  // Handle selecting a user
  const handleSelectUser = user => {
    setSelectedUser(selectedUser?._id === user._id ? null : user)
  }

  // Handle inviting a user
  const handleInviteUser = async () => {
    if (!selectedUser) return

    setInviting(true)

    try {
      // Call the parent's onInvite function with the selected user ID
      await onInvite(selectedUser._id)

      // Clear form and close modal
      setSearchQuery('')
      setSelectedUser(null)
      setSearchResults([])
      onClose()
    } catch (error) {
      console.error('Error inviting user:', error)
    } finally {
      setInviting(false)
    }
  }

  // Clear form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('')
      setSelectedUser(null)
      setSearchResults([])
    }
  }, [isOpen])

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
      <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(5px)" />
      <MotionModalContent
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={modalVariants}
        mx={4}
        bg="rgba(23, 25, 35, 0.95)"
        borderWidth="1px"
        borderColor="blue.600"
        boxShadow="0 0 20px rgba(66, 153, 225, 0.4)"
        borderRadius="xl"
      >
        <ModalHeader>
          <HStack spacing={3}>
            <Icon as={UserPlus} color="blue.400" boxSize={6} />
            <Box>
              <Text color="white" fontSize="lg">
                {t('Invite to')} {teamName}
              </Text>
              <Text color="whiteAlpha.700" fontSize="sm" fontWeight="normal">
                {t('Search for players to invite to your team')}
              </Text>
            </Box>
          </HStack>
        </ModalHeader>
        <ModalCloseButton color="white" />

        <ModalBody pb={6}>
          <VStack spacing={5} align="stretch">
            {/* Search Input */}
            <FormControl>
              <FormLabel color="whiteAlpha.900">
                {t('Search Players')}
              </FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <Icon as={Search} color="whiteAlpha.500" />
                </InputLeftElement>
                <Input
                  placeholder={t('Enter name, username, or email')}
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  bg="blackAlpha.400"
                  color="white"
                  borderColor="whiteAlpha.300"
                  _hover={{ borderColor: 'blue.400' }}
                  _focus={{
                    borderColor: 'blue.500',
                    boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)',
                  }}
                />
              </InputGroup>
              <Text fontSize="xs" color="whiteAlpha.600" mt={1}>
                {t('Search by name, username, or email (min 2 characters)')}
              </Text>
            </FormControl>

            {/* Selected User */}
            {selectedUser && (
              <Box>
                <Text
                  color="whiteAlpha.800"
                  fontSize="sm"
                  mb={3}
                  fontWeight="medium"
                >
                  {t('Selected Player')}
                </Text>
                <UserResultCard
                  user={selectedUser}
                  onSelect={handleSelectUser}
                  isSelected={true}
                />
              </Box>
            )}

            {/* Search Results */}
            {searchQuery.length >= 2 && !selectedUser && (
              <Box>
                <Flex justify="space-between" align="center" mb={3}>
                  <Text
                    color="whiteAlpha.800"
                    fontSize="sm"
                    fontWeight="medium"
                  >
                    {loading
                      ? t('Searching...')
                      : searchResults.length > 0
                      ? `${searchResults.length} ${t('players found')}`
                      : t('No players found')}
                  </Text>
                  {searchResults.length > 5 && (
                    <Text fontSize="xs" color="whiteAlpha.600">
                      {t('Showing top results')}
                    </Text>
                  )}
                </Flex>

                {loading ? (
                  <Box textAlign="center" py={6}>
                    <Spinner size="md" color="blue.400" mb={3} />
                    <Text color="whiteAlpha.700">
                      {t('Searching for players...')}
                    </Text>
                  </Box>
                ) : searchResults.length > 0 ? (
                  <VStack
                    align="stretch"
                    spacing={3}
                    maxH="300px"
                    overflowY="auto"
                    sx={{
                      '&::-webkit-scrollbar': {
                        width: '4px',
                      },
                      '&::-webkit-scrollbar-track': {
                        background: 'whiteAlpha.100',
                      },
                      '&::-webkit-scrollbar-thumb': {
                        background: 'whiteAlpha.400',
                        borderRadius: '2px',
                      },
                    }}
                  >
                    {searchResults.slice(0, 10).map(user => (
                      <UserResultCard
                        key={user._id}
                        user={user}
                        onSelect={handleSelectUser}
                        isSelected={false}
                      />
                    ))}
                  </VStack>
                ) : searchQuery.length >= 2 ? (
                  <Box
                    p={6}
                    borderRadius="lg"
                    bg="whiteAlpha.50"
                    textAlign="center"
                    borderWidth="1px"
                    borderColor="whiteAlpha.200"
                  >
                    <Icon
                      as={Users}
                      color="whiteAlpha.500"
                      boxSize={8}
                      mb={3}
                    />
                    <Text color="whiteAlpha.700" mb={1}>
                      {t('No players found')}
                    </Text>
                    <Text fontSize="sm" color="whiteAlpha.500">
                      {t('Try a different search term')}
                    </Text>
                  </Box>
                ) : null}
              </Box>
            )}

            {/* Help Text */}
            {searchQuery.length === 0 && (
              <Box
                p={4}
                borderRadius="lg"
                bg="rgba(66, 153, 225, 0.1)"
                borderWidth="1px"
                borderColor="blue.500"
              >
                <HStack spacing={2} mb={2}>
                  <Icon as={UserPlus} color="blue.400" boxSize={4} />
                  <Text fontSize="sm" color="blue.300" fontWeight="medium">
                    {t('How to invite players')}
                  </Text>
                </HStack>
                <Text fontSize="sm" color="whiteAlpha.700">
                  {t(
                    'Search for players by their name, username, or email address. Select a player and send them an invitation to join your team.',
                  )}
                </Text>
              </Box>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button
            variant="ghost"
            mr={3}
            onClick={onClose}
            color="whiteAlpha.800"
            _hover={{ bg: 'whiteAlpha.100' }}
          >
            {t('Cancel')}
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleInviteUser}
            isLoading={inviting}
            loadingText={t('Sending invite...')}
            isDisabled={!selectedUser}
            leftIcon={<Icon as={UserPlus} />}
            bg="blue.600"
            _hover={{ bg: 'blue.700' }}
          >
            {t('Send Invitation')}
          </Button>
        </ModalFooter>
      </MotionModalContent>
    </Modal>
  )
}

export default InviteUserModal
