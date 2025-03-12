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
  Heading,
  Tooltip,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Container,
  useBreakpointValue,
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  X,
  LogOut,
  UserPlus,
  RefreshCw,
  Search,
  Zap,
  Timer,
  Trophy,
  Shield,
  Wand2,
} from 'lucide-react'
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
const MotionBadge = motion(Badge)

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
        <VStack
          spacing={6}
          p={8}
          bg="rgba(26, 21, 39, 0.6)"
          borderRadius="xl"
          backdropFilter="blur(10px)"
        >
          <MotionBox
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Icon as={X} boxSize={16} color="red.400" />
          </MotionBox>
          <Text color="white" fontSize="xl" fontWeight="bold">
            {usersError}
          </Text>
          <Button
            leftIcon={<RefreshCw />}
            colorScheme="purple"
            size="lg"
            onClick={handleRefresh}
            p={6}
            _hover={{
              transform: 'translateY(-2px)',
              shadow: 'lg',
              bg: 'purple.500',
            }}
            transition="all 0.3s"
          >
            {t('Retry')}
          </Button>
        </VStack>
      </Center>
    )
  }

  return (
    <Container maxW="container.xl" p={{ base: 2, md: 4 }}>
      {challengeCreationData && (
        <ChallengeCreationModal
          isOpen={!!challengeCreationData}
          onClose={() => dispatch(setMatchCreationStarted(null))}
          categories={challengeCreationData.categories}
          opponent={challengeCreationData.opponent}
          error={challengeCreationError}
        />
      )}

      {/* Header with glowing effect */}
      <MotionFlex
        flexDirection={{ base: 'column', md: 'row' }}
        justify={{ base: 'center', md: 'space-between' }}
        align={{ base: 'center', md: 'center' }}
        gap={{ base: 4, md: 0 }}
        mb={{ base: 6, md: 8 }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <VStack
          align={{ base: 'center', md: 'start' }}
          spacing={1}
          mb={{ base: 2, md: 0 }}
        >
          <Heading
            size={{ base: 'md', md: 'lg' }}
            color="white"
            textShadow="0 0 10px rgba(128, 90, 213, 0.7)"
            letterSpacing="wide"
            textAlign={{ base: 'center', md: 'left' }}
          >
            {t('Battle Arena')}
          </Heading>
          <Text
            color="whiteAlpha.700"
            fontSize={{ base: 'xs', md: 'sm' }}
            textAlign={{ base: 'center', md: 'left' }}
          >
            {t('Find your next opponent and prove your knowledge')}
          </Text>
        </VStack>

        <HStack spacing={{ base: 2, md: 3 }} flexWrap="wrap" justify="center">
          <Tooltip label={t('Refresh opponent list')}>
            <Button
              colorScheme="blue"
              variant="ghost"
              leftIcon={<RefreshCw size={16} />}
              onClick={handleRefresh}
              isLoading={usersLoading}
              loadingText={useBreakpointValue({
                base: null,
                md: t('Refreshing'),
              })}
              p={{ base: 3, md: 4 }}
              _hover={{ bg: 'blue.800', transform: 'rotate(180deg)' }}
              transition="all 0.4s"
              aria-label={t('Refresh')}
              size={{ base: 'sm', md: 'md' }}
            >
              {useBreakpointValue({ base: null, md: t('Refresh') })}
            </Button>
          </Tooltip>

          {inMatchmaking ? (
            <Button
              colorScheme="red"
              variant="solid"
              leftIcon={<LogOut size={16} />}
              onClick={handleLeaveMatchmaking}
              isLoading={matchmakingLoading}
              loadingText={useBreakpointValue({ base: null, md: t('Leaving') })}
              _hover={{ transform: 'translateY(-2px)', bg: 'red.600' }}
              transition="all 0.3s"
              size={{ base: 'sm', md: 'md' }}
              p={{ base: 3, md: 4 }}
            >
              {t('Leave Matchmaking')}
            </Button>
          ) : (
            <MotionButton
              as={Button}
              colorScheme="green"
              variant="solid"
              leftIcon={<UserPlus size={16} />}
              onClick={handleInitiateJoin}
              isLoading={matchmakingLoading}
              loadingText={useBreakpointValue({ base: null, md: t('Joining') })}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              p={{ base: 3, md: 6 }}
              size={{ base: 'sm', md: 'md' }}
            >
              {t('Join Matchmaking')}
            </MotionButton>
          )}
        </HStack>
      </MotionFlex>

      {/* Game status panel with glow effect */}
      <MotionBox
        bg="rgba(26, 21, 39, 0.7)"
        borderRadius="xl"
        p={{ base: 3, md: 4 }}
        mb={{ base: 4, md: 6 }}
        borderWidth="1px"
        borderColor="whiteAlpha.200"
        boxShadow={
          inMatchmaking
            ? '0 0 20px rgba(72, 187, 120, 0.4)'
            : '0 0 10px rgba(66, 153, 225, 0.3)'
        }
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        mx={{ base: 1, md: 0 }}
      >
        <SimpleGrid
          columns={{ base: 1, sm: 2, md: 3 }}
          spacing={{ base: 3, md: 4 }}
          alignItems="center"
          width="100%"
        >
          {/* Status badge */}
          <HStack justifyContent={{ base: 'center', sm: 'flex-start' }}>
            <MotionBadge
              colorScheme={inMatchmaking ? 'green' : 'yellow'}
              p={{ base: 1.5, md: 2 }}
              borderRadius="md"
              display="flex"
              alignItems="center"
              gap={{ base: 1, md: 2 }}
              fontSize={{ base: 'xs', md: 'sm' }}
              animate={
                inMatchmaking
                  ? {
                      boxShadow: [
                        '0 0 0px rgba(72, 187, 120, 0)',
                        '0 0 15px rgba(72, 187, 120, 0.7)',
                        '0 0 0px rgba(72, 187, 120, 0)',
                      ],
                    }
                  : {}
              }
              transition={
                inMatchmaking
                  ? {
                      duration: 2,
                      repeat: Infinity,
                      repeatType: 'loop',
                    }
                  : {}
              }
            >
              {inMatchmaking ? (
                <>
                  <Icon as={Zap} boxSize={{ base: 3, md: 4 }} />
                  <Text isTruncated>{t('Looking for opponents')}</Text>
                </>
              ) : (
                <>
                  <Icon as={Timer} boxSize={{ base: 3, md: 4 }} />
                  <Text isTruncated>{t('Not in matchmaking')}</Text>
                </>
              )}
            </MotionBadge>
          </HStack>

          {/* Stats */}
          <Stat textAlign="center">
            <StatLabel
              color="whiteAlpha.700"
              fontSize={{ base: 'xs', md: 'sm' }}
            >
              {t('Available Opponents')}
            </StatLabel>
            <StatNumber fontSize={{ base: 'xl', md: '2xl' }} color="white">
              {usersLoading ? (
                <Spinner size="sm" color="purple.500" />
              ) : (
                users.length
              )}
            </StatNumber>
          </Stat>

          {/* Connection status */}
          <Flex justify={{ base: 'center', sm: 'flex-end' }}>
            <MotionBadge
              colorScheme={socketConnected ? 'green' : 'red'}
              p={{ base: 1.5, md: 2 }}
              borderRadius="md"
              alignItems="center"
              gap={{ base: 1, md: 2 }}
              display="flex"
              fontSize={{ base: 'xs', md: 'sm' }}
              animate={
                socketConnected
                  ? {
                      scale: [1, 1.05, 1],
                    }
                  : {}
              }
              transition={
                socketConnected
                  ? {
                      duration: 1.5,
                      repeat: Infinity,
                      repeatType: 'loop',
                    }
                  : {}
              }
            >
              <Box
                w={{ base: '6px', md: '8px' }}
                h={{ base: '6px', md: '8px' }}
                borderRadius="full"
                bg={socketConnected ? 'green.400' : 'red.400'}
              />
              <Text isTruncated>
                {socketConnected ? t('Live updates on') : t('Live updates off')}
              </Text>
            </MotionBadge>
          </Flex>
        </SimpleGrid>
      </MotionBox>

      {/* User grid with loading state */}
      {usersLoading && users.length === 0 ? (
        <Center h="50vh">
          <VStack spacing={6}>
            <MotionBox
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 0, 270, 270, 0],
              }}
              transition={{
                duration: 3,
                ease: 'easeInOut',
                times: [0, 0.2, 0.5, 0.8, 1],
                repeat: Infinity,
                repeatType: 'loop',
              }}
            >
              <Spinner size="xl" color="purple.500" thickness="4px" />
            </MotionBox>
            <Text color="white" fontSize="lg" fontWeight="medium">
              {t('Scanning the arena for challengers...')}
            </Text>
          </VStack>
        </Center>
      ) : users.length === 0 ? (
        <Center h="50vh">
          <MotionBox
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            p={{ base: 6, md: 10 }}
            borderRadius="2xl"
            bg="rgba(26, 21, 39, 0.6)"
            borderWidth="1px"
            borderColor="whiteAlpha.200"
            backdropFilter="blur(10px)"
            textAlign="center"
            maxW="md"
            mx={{ base: 4, md: 0 }}
          >
            <VStack spacing={{ base: 4, md: 6 }}>
              <Icon
                as={Users}
                boxSize={{ base: 12, md: 16 }}
                color="whiteAlpha.700"
              />
              <Heading size={{ base: 'sm', md: 'md' }} color="white">
                {t('The arena is empty')}
              </Heading>
              <Text
                color="whiteAlpha.700"
                fontSize={{ base: 'sm', md: 'md' }}
                px={2}
              >
                {inMatchmaking
                  ? t('Wait for brave challengers to arrive or return later')
                  : t('Join the matchmaking arena to find opponents')}
              </Text>
              <Button
                colorScheme="purple"
                size={{ base: 'md', md: 'lg' }}
                leftIcon={inMatchmaking ? <RefreshCw /> : <UserPlus />}
                onClick={inMatchmaking ? handleRefresh : handleInitiateJoin}
                _hover={{ transform: 'translateY(-3px)', boxShadow: 'lg' }}
                transition="all 0.3s"
                width={{ base: 'full', md: 'auto' }}
              >
                {inMatchmaking ? t('Refresh') : t('Join Matchmaking')}
              </Button>
            </VStack>
          </MotionBox>
        </Center>
      ) : (
        <AnimatePresence>
          <Box overflow="hidden" position="relative">
            {/* Background glow effects */}
            <Box
              position="absolute"
              top="-20%"
              left="10%"
              width="40%"
              height="40%"
              bg="purple.800"
              opacity="0.1"
              borderRadius="full"
              filter="blur(80px)"
              zIndex={0}
              display={{ base: 'none', md: 'block' }}
            />
            <Box
              position="absolute"
              bottom="-10%"
              right="5%"
              width="30%"
              height="30%"
              bg="blue.700"
              opacity="0.1"
              borderRadius="full"
              filter="blur(70px)"
              zIndex={0}
              display={{ base: 'none', md: 'block' }}
            />

            {/* User cards grid */}
            <MotionBox
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              position="relative"
              zIndex={1}
            >
              <SimpleGrid
                columns={{ base: 1, md: 3, lg: 4 }}
                spacing={{ base: 3, md: 5 }}
                p={{ base: 2, md: 4 }}
              >
                {users.map(user => (
                  <MotionBox
                    key={user.user._id}
                    variants={itemVariants}
                    whileHover={{
                      y: -5,
                      boxShadow: '0 15px 30px -10px rgba(0, 0, 0, 0.5)',
                    }}
                    transition={{ duration: 0.3 }}
                  >
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
          </Box>
        </AnimatePresence>
      )}

      {/* Join Category Selection Modal */}
      <CategorySelectionModal
        isOpen={isJoinCategoryModalOpen}
        onClose={closeJoinCategoryModal}
        onSubmit={handleJoinMatchmaking}
        title={t('Choose Your Battlefield')}
        subtitle={t('Select exactly 2 knowledge domains to compete in')}
        submitButtonText={t('Enter Battle Arena')}
        requireExactly={2}
      />
    </Container>
  )
}

// Styled Motion Button component
const MotionButton = motion(Button)

export default MatchmakingRoom
