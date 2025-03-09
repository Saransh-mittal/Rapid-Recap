// components/quickClashComponents/MatchmakingRoom.jsx
import React, { useEffect, useState, useCallback } from 'react'
import {
  Box,
  VStack,
  Text,
  HStack,
  Button,
  Flex,
  Spinner,
  Center,
  SimpleGrid,
  useToast,
  Badge,
  Icon,
  Divider,
  useDisclosure,
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, X, LogOut, UserPlus, RefreshCw, Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import useQuickClashMatchmaking from '../../customHooks/useQuickClashMatchmaking'
import CategorySelectionModal from './matchmaking/CategorySelectionModal'
import UserCard from './matchmaking/UserCard'
import ChallengeCreationModal from './modals/ChallengeCreationModal'
import { useDispatch, useSelector } from 'react-redux'
import {
  clearChallengeError,
  setMatchCreationStarted,
} from '../../redux/quickClashMatchmakingSlice'

const MotionBox = motion(Box)
const MotionFlex = motion(Flex)

const MatchmakingRoom = () => {
  const { t } = useTranslation('QuickClash')
  const toast = useToast()
  const dispatch = useDispatch()
  // State for the selected user when creating a challenge
  const [selectedUser, setSelectedUser] = useState(null)
  const { challengeCreationData, challengeReady, challengeCreationError } =
    useSelector(state => state.quickClashMatchmaking)
  // Category selection modals
  const {
    isOpen: isJoinCategoryModalOpen,
    onOpen: openJoinCategoryModal,
    onClose: closeJoinCategoryModal,
  } = useDisclosure()

  const {
    isOpen: isChallengeCategoryModalOpen,
    onOpen: openChallengeCategoryModal,
    onClose: closeChallengeCategoryModal,
  } = useDisclosure()

  // Get matchmaking data and functions from our custom hook
  const {
    users,
    usersLoading,
    usersError,
    inMatchmaking,
    matchmakingLoading,
    matchmakingError,
    challengeCreating,
    socketConnected,
    pendingChallenge,

    joinMatchmaking,
    leaveMatchmaking,
    acceptChallenge,
    loadAvailableUsers,
    checkMatchmakingStatus,
  } = useQuickClashMatchmaking()

  // Load initial data
  useEffect(() => {
    checkMatchmakingStatus()
    loadAvailableUsers()
  }, [checkMatchmakingStatus, loadAvailableUsers])

  // Set up refresh interval
  useEffect(() => {
    // Initial load
    loadAvailableUsers()

    // Set up refresh interval
    const interval = setInterval(() => {
      loadAvailableUsers()
    }, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [loadAvailableUsers])

  // Handle opening join category selection modal
  const handleInitiateJoin = useCallback(() => {
    openJoinCategoryModal()
  }, [openJoinCategoryModal])

  // Handle joining matchmaking with selected categories
  const handleJoinMatchmaking = useCallback(
    categories => {
      if (!categories || categories.length !== 2) {
        toast({
          title: t('Invalid Selection'),
          description: t('Please select exactly 2 categories'),
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
        return
      }

      joinMatchmaking(categories)
        .then(() => {
          closeJoinCategoryModal()
        })
        .catch(error => {
          console.error('Failed to join matchmaking:', error)
        })
    },
    [joinMatchmaking, closeJoinCategoryModal, toast, t],
  )

  // Handle leaving matchmaking
  const handleLeaveMatchmaking = useCallback(() => {
    leaveMatchmaking().catch(error => {
      console.error('Failed to leave matchmaking:', error)
    })
  }, [leaveMatchmaking])

  // Handle selecting a user and opening category selection
  const handleSelectUser = useCallback(
    user => {
      setSelectedUser(user)
      handleAcceptChallenge(user, user?.preferredCategories)
    },
    [openChallengeCategoryModal],
  )

  const handleAcceptChallenge = useCallback(
    (user, categories) => {
      if (!user || !categories || categories.length !== 2) {
        toast({
          title: t('Invalid Selection'),
          description: t('Please select exactly 2 categories'),
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
        return
      }

      acceptChallenge(user.user._id, categories)
        .then(() => {
          closeChallengeCategoryModal()
          setSelectedUser(null)
        })
        .catch(error => {
          console.error('Failed to accept challenge:', error)
        })
    },
    [selectedUser, acceptChallenge, closeChallengeCategoryModal, toast, t],
  )

  // Manual refresh function
  const handleRefresh = useCallback(() => {
    loadAvailableUsers()

    toast({
      title: t('Refreshed'),
      description: t('User list has been refreshed'),
      status: 'info',
      duration: 2000,
      isClosable: true,
    })
  }, [loadAvailableUsers, toast, t])

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 300, damping: 20 },
    },
  }

  useEffect(() => {
    if (challengeCreationError) {
      toast({
        title: t('Challenge Creation Failed'),
        description: challengeCreationError,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })

      // Reset error state
      dispatch(clearChallengeError())
    }
  }, [challengeCreationError, dispatch, toast, t])

  // If there's an error
  if (usersError && !usersLoading) {
    return (
      <Center h="60vh">
        <VStack spacing={4}>
          <Icon as={X} boxSize={10} color="red.400" />
          <Text color="white" fontSize="lg">
            {usersError}
          </Text>
          <Button
            leftIcon={<RefreshCw />}
            colorScheme="purple"
            onClick={handleRefresh}
          >
            {t('Retry')}
          </Button>
        </VStack>
      </Center>
    )
  }

  return (
    <Box p={4}>
      {challengeCreationData && (
        <ChallengeCreationModal
          isOpen={!!challengeCreationData}
          onClose={() => dispatch(setMatchCreationStarted(null))}
          categories={challengeCreationData.categories}
          opponent={challengeCreationData.opponent}
          error={challengeCreationError}
        />
      )}
      {/* Header */}
      <VStack spacing={4} align="stretch" mb={6}>
        <Flex justify="space-between" align="center" wrap="wrap" gap={2}>
          <Heading size="lg" color="white">
            {t('Matchmaking Room')}
          </Heading>

          <HStack spacing={3}>
            <Button
              size="sm"
              colorScheme="purple"
              variant="outline"
              leftIcon={<RefreshCw size={16} />}
              onClick={handleRefresh}
              isLoading={usersLoading}
              loadingText={t('Refreshing')}
            >
              {t('Refresh')}
            </Button>

            {inMatchmaking ? (
              <Button
                size="sm"
                colorScheme="red"
                variant="solid"
                leftIcon={<LogOut size={16} />}
                onClick={handleLeaveMatchmaking}
                isLoading={matchmakingLoading}
                loadingText={t('Leaving')}
              >
                {t('Leave Matchmaking')}
              </Button>
            ) : (
              <Button
                size="sm"
                colorScheme="green"
                variant="solid"
                leftIcon={<UserPlus size={16} />}
                onClick={handleInitiateJoin}
                isLoading={matchmakingLoading}
                loadingText={t('Joining')}
              >
                {t('Join Matchmaking')}
              </Button>
            )}
          </HStack>
        </Flex>

        {/* Status indicator */}
        <HStack>
          <Badge
            colorScheme={inMatchmaking ? 'green' : 'yellow'}
            p={2}
            borderRadius="md"
          >
            {inMatchmaking
              ? t('Looking for opponents')
              : t('Not in matchmaking')}
          </Badge>

          <Badge
            colorScheme={socketConnected ? 'green' : 'red'}
            p={2}
            borderRadius="md"
          >
            {socketConnected ? t('Live updates on') : t('Live updates off')}
          </Badge>
        </HStack>

        {/* User list info */}
        <HStack mt={2} spacing={4} p={3} bg="whiteAlpha.100" borderRadius="md">
          <HStack>
            <Icon as={Search} color="whiteAlpha.700" boxSize={4} />
            <Text color="whiteAlpha.700" fontSize="sm">
              {users.length} {t('users available')}
            </Text>
          </HStack>
        </HStack>
      </VStack>

      {/* User grid */}
      {usersLoading && users.length === 0 ? (
        <Center h="60vh">
          <VStack spacing={4}>
            <Spinner size="xl" color="purple.500" thickness="4px" />
            <Text color="white">{t('Finding available players...')}</Text>
          </VStack>
        </Center>
      ) : users.length === 0 ? (
        <Center h="60vh">
          <VStack spacing={4} p={8} bg="whiteAlpha.100" borderRadius="lg">
            <Icon as={Users} boxSize={12} color="whiteAlpha.500" />
            <Text color="white" fontSize="lg">
              {t('No users available for matchmaking')}
            </Text>
            <Text color="whiteAlpha.700" fontSize="md" textAlign="center">
              {inMatchmaking
                ? t('Wait for others to join or try again later')
                : t('Join matchmaking to find opponents')}
            </Text>
            <Button
              colorScheme="purple"
              leftIcon={inMatchmaking ? <RefreshCw /> : <UserPlus />}
              onClick={inMatchmaking ? handleRefresh : handleInitiateJoin}
            >
              {inMatchmaking ? t('Refresh') : t('Join Matchmaking')}
            </Button>
          </VStack>
        </Center>
      ) : (
        <AnimatePresence>
          <MotionBox
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={4} mb={8}>
              {users.map(user => (
                <MotionBox key={user.user._id} variants={itemVariants}>
                  <UserCard
                    user={user}
                    isSelected={selectedUser?.user._id === user.user._id}
                    isPending={pendingChallenge?.opponentId === user.user._id}
                    isLoading={
                      challengeCreating &&
                      selectedUser?.user._id === user.user._id
                    }
                    onSelect={handleSelectUser}
                  />
                </MotionBox>
              ))}
            </SimpleGrid>
          </MotionBox>
        </AnimatePresence>
      )}

      {/* Join Category Selection Modal */}
      <CategorySelectionModal
        isOpen={isJoinCategoryModalOpen}
        onClose={closeJoinCategoryModal}
        onSubmit={handleJoinMatchmaking}
        title={t('Select Categories to Join Matchmaking')}
        subtitle={t('Choose exactly 2 categories you want to play')}
        submitButtonText={t('Join Matchmaking')}
        requireExactly={2}
      />
    </Box>
  )
}

// Helper component for the header
const Heading = ({ size, color, children }) => {
  return (
    <Text
      fontSize={size === 'lg' ? 'xl' : 'md'}
      fontWeight="bold"
      color={color}
    >
      {children}
    </Text>
  )
}

export default MatchmakingRoom
