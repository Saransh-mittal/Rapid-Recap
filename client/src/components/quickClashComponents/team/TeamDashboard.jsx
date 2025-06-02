// components/quickClashComponents/team/TeamDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react'
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Heading,
  Icon,
  useDisclosure,
  Badge,
  Flex,
  Tooltip,
  Center,
  Spinner,
  useToast,
  useBreakpointValue,
  IconButton,
  SimpleGrid, // Ensure SimpleGrid is imported if not already
  Divider,
  Avatar,
  AvatarGroup,
  Grid,
  GridItem,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import { useSelector } from 'react-redux'
import {
  Users,
  Trophy,
  UserPlus,
  Copy,
  Shield,
  RefreshCw,
  PlusCircle,
  LogOut,
  Zap,
  Check,
  ArrowRight,
  Activity,
  User,
  Search,
} from 'lucide-react'

// Import sub-components
import CreateTeamModal from './CreateTeamModal'
import JoinTeamModal from './JoinTeamModal'
import EmptyTeamState from './EmptyTeamState'
import InviteUserModal from './InviteUserModal'

import QuickClashBackground from '../QuickClashBackground'

// Import custom hook for team operations
import useQuickClashTeamBattle from '../../../customHooks/useQuickClashTeamBattle'
import { useSocket } from '../../../customHooks/useSocket'

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
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15,
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: i => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.1,
      duration: 0.4,
      type: 'spring',
      stiffness: 100,
      damping: 15,
    },
  }),
  hover: {
    y: -5,
    boxShadow: '0 15px 30px rgba(128, 90, 213, 0.3)',
    transition: { duration: 0.3 },
  },
}

const buttonMotion = {
  hover: { scale: 1.05, boxShadow: '0 5px 15px rgba(128, 90, 213, 0.4)' },
  tap: { scale: 0.95 },
}

const MotionBox = motion(Box)
const MotionFlex = motion(Flex)
const MotionButton = motion(Button)
const MotionIconButton = motion(IconButton)
const MotionBadge = motion(Badge)
const MotionSimpleGrid = motion(SimpleGrid)

// Enhanced status badge component for consistent styling
const StatusBadge = ({ status, size = 'md' }) => {
  let color, icon, label

  switch (status) {
    case 'inBattle':
      color = 'cyan'
      icon = Zap
      label = 'IN BATTLE'
      break
    case 'leader':
      color = 'purple'
      icon = Shield
      label = 'LEADER'
      break
    case 'persistent':
      color = 'blue'
      icon = Shield
      label = 'PERSISTENT'
      break
    default:
      color = 'yellow'
      icon = Activity
      label = status.toUpperCase()
  }

  return (
    <MotionBadge
      display="flex"
      alignItems="center"
      px={size === 'sm' ? 1.5 : 2}
      py={size === 'sm' ? 0.5 : 1}
      borderRadius="md"
      bg={`${color}.500`}
      color="white"
      fontSize={size === 'sm' ? 'xs' : 'sm'}
      fontWeight="extrabold"
      letterSpacing="0.5px"
      whileHover={{ scale: 1.05 }}
      boxShadow={`0 0 10px ${color}.400`}
      initial={{ scale: 0.9 }}
      animate={{ scale: 1 }}
      textShadow="0 1px 2px rgba(0,0,0,0.3)"
    >
      {icon && <Icon as={icon} boxSize={size === 'sm' ? 3 : 4} mr={1.5} />}
      {label}
    </MotionBadge>
  )
}

const EnhancedTeamCard = ({
  team,
  index,
  isLeader,
  userId,
  onLeave,
  onRemoveMember,
  onInvite,
  onCopyTeamCode,
}) => {
  const { t } = useTranslation('QuickClash')
  const teamMembers = team.members || []
  const isTeamFull = teamMembers.length >= team.maxMembers

  return (
    <MotionBox
      variants={cardVariants}
      custom={index}
      initial="hidden"
      animate="visible"
      borderRadius="xl"
      overflow="hidden"
      bg="#131823"
      borderWidth="1px"
      borderColor="#2D3748"
      width="100%" // Card takes full width of its grid cell
      maxWidth={{ base: '100%', md: '400px' }} // Max width for larger screens
      boxShadow="0 4px 10px rgba(0, 0, 0, 0.2)"
    >
      {/* Team Header with name and trophy */}
      <Flex
        bg="#2D1A4A"
        px={4}
        py={3.5}
        direction="row"
        alignItems="center"
        justifyContent="space-between"
      >
        {/* Team Name with attractive styling */}
        <HStack spacing={3}>
          <Icon as={User} color="gray.300" boxSize={5} />
          <Text
            fontSize="xl"
            fontWeight="bold"
            bgGradient="linear(to-r, white, purple.200)"
            bgClip="text"
            letterSpacing="wide"
            textShadow="0 0 5px rgba(128, 90, 213, 0.3)"
          >
            {team.name}
          </Text>
        </HStack>

        {/* Premium Trophy Display */}
        <Flex
          align="center"
          justify="center"
          bg="#8B5A2B"
          rounded="md"
          px={3}
          py={1.5}
          borderColor="yellow.700"
          boxShadow="0 2px 8px rgba(0,0,0,0.3)"
        >
          <Icon as={Trophy} color="#FFD700" boxSize={4} mr={1.5} />
          <Text fontWeight="bold" fontSize="md" color="#FFD700">
            {team.avgTrophies || 0}
          </Text>
        </Flex>
      </Flex>

      {/* Status Badges Row */}
      <Flex px={4} py={2.5} gap={2} wrap="wrap">
        {isLeader && (
          <Badge
            bg="purple.500"
            color="white"
            px={3}
            py={1}
            borderRadius="full"
          >
            {t('LEADER')}
          </Badge>
        )}
        {team.isInMatch && (
          <Badge bg="cyan.500" color="white" px={3} py={1} borderRadius="full">
            {t('IN BATTLE')}
          </Badge>
        )}
        {isTeamFull && (
          <Badge
            bg="orange.500"
            color="white"
            px={3}
            py={1}
            borderRadius="full"
          >
            {t('FULL')}
          </Badge>
        )}
      </Flex>

      {/* Team Code and Invite Section */}
      <Box px={4} py={3} borderBottomWidth="1px" borderBottomColor="gray.700">
        {/* Team Code Row */}
        <Flex justify="space-between" align="center" mb={3}>
          <HStack>
            <Text fontSize="sm" color="gray.400">
              {t('Team Code')}:
            </Text>
            <Text
              fontSize="sm"
              fontWeight="bold"
              color="cyan.300"
              letterSpacing="wider"
            >
              {team.teamCode}
            </Text>
          </HStack>

          <MotionIconButton
            icon={<Copy size={16} />}
            size="xs"
            colorScheme="blue"
            variant="ghost"
            onClick={() => onCopyTeamCode(team.teamCode)}
            aria-label={t('Copy Team Code')}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          />
        </Flex>

        {/* Invite Button - Only show for leaders */}
        {isLeader && (
          <MotionButton
            leftIcon={<UserPlus size={16} />}
            size="sm"
            colorScheme="purple"
            variant="outline"
            onClick={onInvite}
            isDisabled={isTeamFull || team.isInMatch}
            width="100%"
            borderColor="purple.400"
            color="purple.300"
            _hover={{
              bg: 'purple.500',
              color: 'white',
              borderColor: 'purple.500',
            }}
            _disabled={{
              opacity: 0.5,
              cursor: 'not-allowed',
              _hover: {
                bg: 'transparent',
                color: 'purple.300',
                borderColor: 'purple.400',
              },
            }}
            whileHover={!isTeamFull && !team.isInMatch ? { scale: 1.02 } : {}}
            whileTap={!isTeamFull && !team.isInMatch ? { scale: 0.98 } : {}}
          >
            {isTeamFull
              ? t('Team Full')
              : team.isInMatch
              ? t('In Battle')
              : t('Invite Player')}
          </MotionButton>
        )}
      </Box>

      {/* Members Section */}
      <Box px={4} py={3}>
        <Flex justify="space-between" align="center" mb={3}>
          <Text fontSize="sm" fontWeight="medium" color="gray.400">
            {t('Members')} ({teamMembers.length}/{team.maxMembers})
          </Text>
        </Flex>

        <VStack spacing={1} align="stretch">
          {teamMembers.map(member => (
            <Flex
              key={member.user._id}
              py={2.5}
              px={3}
              justify="space-between"
              align="center"
              bg={
                member.user._id === userId
                  ? 'rgba(128, 90, 213, 0.15)'
                  : 'transparent'
              }
              borderRadius="md"
              borderWidth="0px"
              _hover={{
                bg:
                  member.user._id === userId
                    ? 'rgba(128, 90, 213, 0.2)'
                    : 'rgba(26, 32, 44, 0.6)',
              }}
            >
              <HStack spacing={3}>
                <Avatar
                  size="sm"
                  name={member.user.name || member.user.inGameName}
                  src={member.user.pic}
                  bg="gray.700"
                />

                <Box>
                  <HStack spacing={1} mb={0.5}>
                    <Text
                      color={
                        member.user._id === userId ? 'purple.300' : 'white'
                      }
                      fontWeight={
                        member.user._id === userId ? 'bold' : 'medium'
                      }
                      fontSize="sm"
                      noOfLines={1}
                    >
                      {member.user.name || member.user.inGameName}
                    </Text>
                    {member.user._id === userId && (
                      <Badge
                        colorScheme="purple"
                        variant="solid"
                        fontSize="2xs"
                        ml={1}
                      >
                        {t('YOU')}
                      </Badge>
                    )}
                  </HStack>

                  <HStack spacing={1}>
                    {member.role === 'leader' && (
                      <Badge
                        bg="purple.500"
                        color="white"
                        fontSize="xs"
                        px={2}
                        borderRadius="full"
                      >
                        {t('LEADER')}
                      </Badge>
                    )}
                  </HStack>
                </Box>
              </HStack>

              {isLeader && member.user._id !== userId && (
                <Button
                  size="xs"
                  colorScheme="red"
                  variant="ghost"
                  onClick={() => onRemoveMember(member.user._id)}
                  isDisabled={team.isInMatch}
                  ml={2}
                >
                  {t('Remove')}
                </Button>
              )}
            </Flex>
          ))}
        </VStack>

        {/* Empty slots indicator */}
        {!isTeamFull && (
          <Box mt={2}>
            {Array.from({ length: team.maxMembers - teamMembers.length }).map(
              (_, index) => (
                <Flex
                  key={`empty-${index}`}
                  py={2.5}
                  px={3}
                  align="center"
                  bg="rgba(45, 55, 72, 0.3)"
                  borderRadius="md"
                  borderWidth="1px"
                  borderColor="gray.600"
                  borderStyle="dashed"
                  mb={1}
                >
                  <HStack spacing={3}>
                    <Box
                      width="32px"
                      height="32px"
                      borderRadius="full"
                      bg="gray.600"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Icon as={UserPlus} color="gray.400" boxSize={4} />
                    </Box>
                    <Text fontSize="sm" color="gray.500" fontStyle="italic">
                      {isLeader
                        ? t('Invite a player')
                        : t('Waiting for player')}
                    </Text>
                  </HStack>
                </Flex>
              ),
            )}
          </Box>
        )}
      </Box>

      {/* Team Footer */}
      <Flex
        justify="space-between"
        align="center"
        px={4}
        py={3}
        borderTopWidth="1px"
        borderTopColor="gray.700"
      >
        <Button
          size="sm"
          leftIcon={<LogOut size={14} />}
          colorScheme="red"
          variant="ghost"
          onClick={onLeave}
          isDisabled={team.isInMatch}
        >
          {t('Leave')}
        </Button>

        {/* Team Stats */}
        <HStack spacing={2}>
          <Text fontSize="xs" color="gray.500">
            {t('Avg Trophies')}:
          </Text>
          <Text fontSize="xs" color="cyan.300" fontWeight="bold">
            {team.avgTrophies || 0}
          </Text>
        </HStack>
      </Flex>
    </MotionBox>
  )
}

const TeamDashboard = () => {
  const { t } = useTranslation('QuickClash')
  const toast = useToast()
  const { user } = useSelector(state => state.auth)

  // Responsive values
  const buttonSize = useBreakpointValue({ base: 'sm', md: 'md' })
  const headingSize = useBreakpointValue({ base: 'md', md: 'lg' })
  const cardColumns = useBreakpointValue({ base: 1, md: 2, lg: 2, xl: 3 }) // md:2, lg:2, xl:3 columns
  const iconSize = useBreakpointValue({ base: 5, md: 6 })

  // State
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedTeam, setSelectedTeam] = useState(null)
  const [copySuccess, setCopySuccess] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const { getSocket } = useSocket()
  // Get team battle state and functions from custom hook
  const { setupTeamBattleSocketListeners } = useQuickClashTeamBattle()

  // Disclosure hooks for modals
  const {
    isOpen: isCreateModalOpen,
    onOpen: openCreateModal,
    onClose: closeCreateModal,
  } = useDisclosure()

  const {
    isOpen: isJoinModalOpen,
    onOpen: openJoinModal,
    onClose: closeJoinModal,
  } = useDisclosure()

  const {
    isOpen: isInviteModalOpen,
    onOpen: openInviteModal,
    onClose: closeInviteModal,
  } = useDisclosure()

  // Function to fetch user's teams
  const fetchTeams = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await axios.get('/api/quickClash/teams')
      setTeams(response.data.teams || [])
    } catch (error) {
      console.error('Error fetching teams:', error)
      setError(error.response?.data?.message || 'Failed to fetch teams')
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to fetch teams',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    setupTeamBattleSocketListeners()

    // Set up additional socket listeners for team invitations
    const socket = getSocket()
    if (socket) {
      // Listen for team invitation acceptance
      socket.on('quickClash:teamInvitationAccepted', data => {
        // User accepted an invitation, refresh teams list
        fetchTeams()
      })

      // Listen for when someone accepts invitation to user's team
      socket.on('quickClash:teamMemberJoined', data => {
        fetchTeams()
      })

      socket.on('quickClash:teamMemberLeft', data => {
        // User left a team, refresh teams list
        fetchTeams()
      })

      socket.on('quickClash:teamMemberRemoved', data => {
        // A member was removed from a team, refresh teams list
        fetchTeams()
      })
    }
  }, [setupTeamBattleSocketListeners, teams, user._id, fetchTeams, toast, t])

  // Fetch teams on component mount
  useEffect(() => {
    fetchTeams()
  }, [])

  // Function to refresh teams data
  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchTeams()
    setRefreshing(false)
  }

  // Handle creating a new team
  const handleCreateTeam = useCallback(
    async teamData => {
      try {
        await axios.post('/api/quickClash/team', teamData)

        toast({
          title: 'Team Created',
          description: 'Your team has been created successfully!',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })

        // Refresh team list
        fetchTeams()

        // Close modal
        closeCreateModal()
      } catch (error) {
        toast({
          title: 'Error',
          description: error.response?.data?.message || 'Failed to create team',
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
      }
    },
    [toast, fetchTeams, closeCreateModal],
  )

  // Handle joining a team
  const handleJoinTeam = useCallback(
    async teamCode => {
      try {
        await axios.post('/api/quickClash/team/join', {
          teamCode,
        })

        toast({
          title: 'Team Joined',
          description: 'You have joined the team successfully!',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })

        // Refresh team list
        fetchTeams()

        // Close modal
        closeJoinModal()
      } catch (error) {
        toast({
          title: 'Error',
          description: error.response?.data?.message || 'Failed to join team',
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
      }
    },
    [toast, fetchTeams, closeJoinModal],
  )

  // Handle leaving a team
  const handleLeaveTeam = useCallback(
    async teamId => {
      try {
        await axios.post(`/api/quickClash/team/${teamId}/leave`)

        toast({
          title: 'Team Left',
          description: 'You have left the team',
          status: 'info',
          duration: 3000,
          isClosable: true,
        })

        // Refresh team list
        fetchTeams()
      } catch (error) {
        toast({
          title: 'Error',
          description: error.response?.data?.message || 'Failed to leave team',
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
      }
    },
    [toast, fetchTeams],
  )

  // Handle removing a member from a team
  const handleRemoveMember = useCallback(
    async (teamId, memberId) => {
      try {
        await axios.post(`/api/quickClash/team/${teamId}/remove`, {
          memberId,
        })

        // Refresh team list
        fetchTeams()
      } catch (error) {
        toast({
          title: 'Error',
          description:
            error.response?.data?.message || 'Failed to remove member',
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
      }
    },
    [toast, fetchTeams],
  )

  // Handle inviting a user to a team
  const handleInviteUser = useCallback(
    async (teamId, inviteeId) => {
      try {
        await axios.post(`/api/quickClash/team/${teamId}/invite`, {
          inviteeId,
        })

        toast({
          title: 'Invitation Sent',
          description: 'The user has been invited to your team',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })

        // Close modal
        closeInviteModal()

        // Refresh team list
        fetchTeams()
      } catch (error) {
        toast({
          title: 'Error',
          description: error.response?.data?.message || 'Failed to invite user',
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
      }
    },
    [toast, closeInviteModal, fetchTeams],
  )

  // Function to copy team code to clipboard
  const copyTeamCode = code => {
    navigator.clipboard.writeText(code)
    setCopySuccess(true)

    toast({
      title: 'Copied!',
      description: 'Team code copied to clipboard',
      status: 'success',
      duration: 2000,
      isClosable: true,
      position: 'top-right',
    })

    setTimeout(() => setCopySuccess(false), 2000)
  }

  // Check if user is a team leader
  const isUserTeamLeader = team => {
    return (
      team &&
      team.members.some(
        member => member.user._id === user._id && member.role === 'leader',
      )
    )
  }

  // Render loading state
  if (loading && !refreshing) {
    return (
      <Center h="400px">
        <VStack spacing={4}>
          <Spinner
            thickness="4px"
            speed="0.65s"
            emptyColor="whiteAlpha.200"
            color="purple.500"
            size="xl"
            boxShadow="0 0 20px rgba(128, 90, 213, 0.3)"
          />
          <Text
            color="whiteAlpha.800"
            fontSize="lg"
            fontWeight="medium"
            bgGradient="linear(to-r, purple.200, blue.200)"
            bgClip="text"
          >
            {t('Loading your teams...')}
          </Text>
        </VStack>
      </Center>
    )
  }

  // Render error state
  if (error && !teams.length) {
    return (
      <Center h="400px">
        <VStack spacing={5}>
          <Box
            p={4}
            bg="rgba(229, 62, 62, 0.1)"
            borderRadius="full"
            borderWidth="1px"
            borderColor="red.500"
            boxShadow="0 0 20px rgba(229, 62, 62, 0.2)"
          >
            <Icon as={RefreshCw} color="red.400" boxSize={12} />
          </Box>
          <Text color="red.400" fontSize="lg" fontWeight="medium">
            {error}
          </Text>
          <MotionButton
            leftIcon={<RefreshCw size={18} />}
            colorScheme="purple"
            onClick={handleRefresh}
            whileHover={buttonMotion.hover}
            whileTap={buttonMotion.tap}
            boxShadow="0 5px 15px rgba(128, 90, 213, 0.3)"
            bg="linear-gradient(135deg, purple.600, purple.700)"
          >
            {t('Try Again')}
          </MotionButton>
        </VStack>
      </Center>
    )
  }

  return (
    <MotionBox
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      width="100%"
      px={{ base: 2, md: 4 }} // Add some padding to the main container
    >
      {/* Header with title and action buttons */}
      <Box mb={6} mt={4}>
        {' '}
        {/* Added mt for spacing from top */}
        <MotionFlex
          variants={itemVariants}
          justify="space-between"
          align="center"
          wrap={{ base: 'wrap', md: 'nowrap' }}
          gap={{ base: 3, md: 4 }} // Responsive gap
        >
          {/* Title Section */}
          <Flex
            direction="row"
            align="center"
            flex={{ base: '1 1 100%', md: '1 1 auto' }} // Ensure title takes space on mobile
            mb={{ base: 3, md: 0 }} // Margin bottom on mobile when wrapped
          >
            <HStack spacing={{ base: 2, md: 3 }}>
              {' '}
              {/* Responsive spacing */}
              <Icon as={Users} boxSize={iconSize} color="purple.400" />
              <Heading size={headingSize} color="white">
                {t('My Teams')}
              </Heading>
            </HStack>

            <MotionIconButton
              ml={3}
              icon={<RefreshCw size={18} />}
              colorScheme="purple"
              variant="ghost"
              isLoading={refreshing}
              onClick={handleRefresh}
              aria-label={t('Refresh teams')}
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.3 }}
            />
          </Flex>

          {/* Action Buttons */}
          <Flex
            gap={{ base: 2, md: 3 }} // Responsive gap for buttons
            justify={{ base: 'flex-start', md: 'flex-end' }} // Start align on mobile
            flex={{ base: '1 1 100%', md: '0 0 auto' }} // Full width on mobile for buttons
            width={{ base: '100%', md: 'auto' }} // Ensure buttons can span full width if needed
          >
            <MotionButton
              leftIcon={<PlusCircle size={18} />}
              colorScheme="purple"
              onClick={openCreateModal}
              size={buttonSize}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              flexGrow={{ base: 1, md: 0 }} // Allow button to grow on mobile
            >
              {t('Create Team')}
            </MotionButton>

            <MotionButton
              leftIcon={<UserPlus size={18} />}
              variant="outline"
              colorScheme="blue"
              onClick={openJoinModal}
              size={buttonSize}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              flexGrow={{ base: 1, md: 0 }} // Allow button to grow on mobile
            >
              {t('Join Team')}
            </MotionButton>
          </Flex>
        </MotionFlex>
      </Box>

      {/* No Teams State */}
      {!loading && teams.length === 0 ? (
        <MotionBox variants={itemVariants}>
          {' '}
          {/* Wrap EmptyTeamState for animation */}
          <EmptyTeamState
            onCreateTeam={openCreateModal}
            onJoinTeam={openJoinModal}
          />
        </MotionBox>
      ) : (
        // Teams List - Responsive Grid
        <MotionSimpleGrid
          columns={cardColumns}
          spacing={{ base: 4, md: 6 }} // Responsive spacing for grid items
          variants={itemVariants} // Apply item variant for the grid container itself
        >
          {teams.map((team, index) => (
            <EnhancedTeamCard
              key={team._id}
              team={team}
              index={index} // Used for card animation delay
              isLeader={isUserTeamLeader(team)}
              userId={user._id}
              onLeave={() => handleLeaveTeam(team._id)}
              onRemoveMember={memberId =>
                handleRemoveMember(team._id, memberId)
              }
              onInvite={() => {
                setSelectedTeam(team)
                openInviteModal()
              }}
              onCopyTeamCode={() => copyTeamCode(team.teamCode)}
            />
          ))}
        </MotionSimpleGrid>
      )}

      {/* Modals */}
      <CreateTeamModal
        isOpen={isCreateModalOpen}
        onClose={closeCreateModal}
        onCreate={handleCreateTeam}
      />

      <JoinTeamModal
        isOpen={isJoinModalOpen}
        onClose={closeJoinModal}
        onJoin={handleJoinTeam}
      />

      {selectedTeam && (
        <>
          <InviteUserModal
            isOpen={isInviteModalOpen}
            onClose={closeInviteModal}
            teamId={selectedTeam._id}
            teamName={selectedTeam.name}
            onInvite={inviteeId =>
              handleInviteUser(selectedTeam._id, inviteeId)
            }
          />
        </>
      )}
    </MotionBox>
  )
}

export default TeamDashboard
