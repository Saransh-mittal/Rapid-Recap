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
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { UserPlus, Users, Search, User, Plus, Check } from 'lucide-react'
import axios from 'axios'
import { debounce } from 'lodash'

const MotionModalContent = motion(ModalContent)
const MotionBox = motion(Box)

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
      if (!query || query.length < 3) {
        setSearchResults([])
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const response = await axios.get('/api/users/search', {
          params: { query },
        })

        setSearchResults(response.data.users || [])
      } catch (error) {
        console.error('Error searching users:', error)
        toast({
          title: t('Error'),
          description: t('Failed to search for users'),
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
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
    searchUsers(value)
  }

  // Handle selecting a user
  const handleSelectUser = user => {
    setSelectedUser(user)
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
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
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
          <HStack spacing={2}>
            <Icon as={UserPlus} color="blue.400" />
            <Text color="white">
              {t('Invite to')} {teamName}
            </Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton color="white" />

        <ModalBody pb={6}>
          <VStack spacing={4} align="stretch">
            {/* Search Input */}
            <FormControl>
              <FormLabel color="whiteAlpha.900">{t('Search Users')}</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <Icon as={Search} color="whiteAlpha.500" />
                </InputLeftElement>
                <Input
                  placeholder={t('Enter name or username')}
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
            </FormControl>

            {/* Selected User */}
            {selectedUser && (
              <Box>
                <Text color="whiteAlpha.700" fontSize="sm" mb={2}>
                  {t('Selected User')}
                </Text>
                <MotionBox
                  display="flex"
                  alignItems="center"
                  gap={3}
                  bg="rgba(66, 153, 225, 0.1)"
                  p={3}
                  borderRadius="md"
                  borderWidth="1px"
                  borderColor="blue.500"
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Avatar
                    size="sm"
                    name={selectedUser.name || selectedUser.inGameName}
                    src={selectedUser.pic}
                  />
                  <Box flex="1">
                    <Text color="white" fontWeight="medium">
                      {selectedUser.name || selectedUser.inGameName}
                    </Text>
                    {selectedUser.inGameName &&
                      selectedUser.inGameName !== selectedUser.name && (
                        <Text fontSize="xs" color="whiteAlpha.700">
                          {selectedUser.inGameName}
                        </Text>
                      )}
                  </Box>
                  <Badge colorScheme="green">
                    <Icon as={Check} boxSize={3} />
                  </Badge>
                </MotionBox>
              </Box>
            )}

            {/* Search Results */}
            {searchQuery.length >= 3 && !selectedUser && (
              <Box>
                <Text color="whiteAlpha.700" fontSize="sm" mb={2}>
                  {loading
                    ? t('Searching...')
                    : searchResults.length > 0
                    ? t('Search Results')
                    : t('No users found')}
                </Text>

                {loading ? (
                  <Box textAlign="center" py={4}>
                    <Spinner size="sm" color="blue.400" mr={2} />
                    <Text display="inline" color="whiteAlpha.700">
                      {t('Searching...')}
                    </Text>
                  </Box>
                ) : searchResults.length > 0 ? (
                  <VStack
                    align="stretch"
                    spacing={2}
                    maxH="200px"
                    overflowY="auto"
                  >
                    {searchResults.map(user => (
                      <MotionBox
                        key={user._id}
                        display="flex"
                        alignItems="center"
                        gap={3}
                        p={3}
                        borderRadius="md"
                        bg="whiteAlpha.50"
                        _hover={{ bg: 'whiteAlpha.100' }}
                        cursor="pointer"
                        onClick={() => handleSelectUser(user)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Avatar
                          size="sm"
                          name={user.name || user.inGameName}
                          src={user.pic}
                        />
                        <Box flex="1">
                          <Text color="white" fontWeight="medium">
                            {user.name || user.inGameName}
                          </Text>
                          {user.inGameName && user.inGameName !== user.name && (
                            <Text fontSize="xs" color="whiteAlpha.700">
                              {user.inGameName}
                            </Text>
                          )}
                        </Box>
                        <Icon as={Plus} color="blue.400" boxSize={4} />
                      </MotionBox>
                    ))}
                  </VStack>
                ) : searchQuery.length >= 3 ? (
                  <Box
                    p={4}
                    borderRadius="md"
                    bg="whiteAlpha.50"
                    textAlign="center"
                  >
                    <Text color="whiteAlpha.700">
                      {t('No users found matching your search')}
                    </Text>
                  </Box>
                ) : null}
              </Box>
            )}

            <Divider borderColor="whiteAlpha.200" />

            <Text fontSize="sm" color="whiteAlpha.600">
              {t(
                'Search for users by name or username to invite them to your team',
              )}
            </Text>
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
            loadingText={t('Inviting...')}
            isDisabled={!selectedUser}
            leftIcon={<Icon as={UserPlus} />}
          >
            {t('Send Invite')}
          </Button>
        </ModalFooter>
      </MotionModalContent>
    </Modal>
  )
}

export default InviteUserModal
