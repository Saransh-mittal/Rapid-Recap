// components/quickClashComponents/team/TeamDashboard.jsx
import React, { useState, useEffect, useCallback, useMemo, memo } from 'react'
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
  Center,
  Spinner,
  useToast,
  useBreakpointValue,
  IconButton,
  SimpleGrid,
  Avatar,
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
} from 'lucide-react'

// Import sub-components
import CreateTeamModal from './CreateTeamModal'
import JoinTeamModal from './JoinTeamModal'
import EmptyTeamState from './EmptyTeamState'
import InviteUserModal from './InviteUserModal'

// Import custom hook for team operations
import useQuickClashTeamBattle from '../../../customHooks/useQuickClashTeamBattle'
import { useSocket } from '../../../customHooks/useSocket'

// Lightweight motion components for better performance
const MotionBox = motion(Box)
const MotionSimpleGrid = motion(SimpleGrid)

// Reduced animation variants for better performance
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, duration: 0.3 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
}

// Optimized Team Card Component
const TeamCard = memo(
  ({
    team,
    isLeader,
    userId,
    onLeave,
    onRemoveMember,
    onInvite,
    onCopyTeamCode,
  }) => {
    const { t } = useTranslation('QuickClash')

    // Memoize computed values
    const teamMembers = useMemo(() => team.members || [], [team.members])
    const isTeamFull = useMemo(
      () => teamMembers.length >= team.maxMembers,
      [teamMembers.length, team.maxMembers],
    )
    const emptySlots = useMemo(
      () => team.maxMembers - teamMembers.length,
      [team.maxMembers, teamMembers.length],
    )

    // Memoized event handlers
    const handleCopyCode = useCallback(
      () => onCopyTeamCode(team.teamCode),
      [onCopyTeamCode, team.teamCode],
    )
    const handleLeave = useCallback(
      () => onLeave(team._id),
      [onLeave, team._id],
    )
    const handleInvite = useCallback(() => onInvite(), [onInvite])

    return (
      <Box
        borderRadius="xl"
        overflow="hidden"
        bg="#131823"
        borderWidth="1px"
        borderColor="#2D3748"
        width="100%"
        maxWidth={{ base: '100%', md: '400px' }}
        boxShadow="0 4px 10px rgba(0, 0, 0, 0.2)"
        transition="transform 0.2s ease"
        _hover={{ transform: 'translateY(-2px)' }}
      >
        {/* Team Header */}
        <Flex
          bg="#2D1A4A"
          px={4}
          py={3.5}
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <HStack spacing={3}>
            <Icon as={Users} color="gray.300" boxSize={5} />
            <Text
              fontSize="xl"
              fontWeight="bold"
              bgGradient="linear(to-r, white, purple.200)"
              bgClip="text"
              letterSpacing="wide"
            >
              {team.name}
            </Text>
          </HStack>

          <Flex
            align="center"
            justify="center"
            bg="#8B5A2B"
            rounded="md"
            px={3}
            py={1.5}
            boxShadow="0 2px 8px rgba(0,0,0,0.3)"
          >
            <Icon as={Trophy} color="#FFD700" boxSize={4} mr={1.5} />
            <Text fontWeight="bold" fontSize="md" color="#FFD700">
              {team.avgTrophies || 0}
            </Text>
          </Flex>
        </Flex>

        {/* Status Badges */}
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
            <Badge
              bg="cyan.500"
              color="white"
              px={3}
              py={1}
              borderRadius="full"
            >
              {t('IN BATTLE')}
            </Badge>
          )}
        </Flex>

        {/* Team Code and Invite Section */}
        <Box px={4} py={3} borderBottomWidth="1px" borderBottomColor="gray.700">
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

            <IconButton
              icon={<Copy size={16} />}
              size="xs"
              colorScheme="blue"
              variant="ghost"
              onClick={handleCopyCode}
              aria-label={t('Copy Team Code')}
            />
          </Flex>

          {isLeader && (
            <Button
              size="sm"
              colorScheme="purple"
              variant="outline"
              onClick={handleInvite}
              isDisabled={isTeamFull || team.isInMatch}
              width="100%"
              borderColor="purple.400"
              color="purple.300"
              _hover={{
                bg: 'purple.500',
                color: 'white',
                borderColor: 'purple.500',
              }}
            >
              {isTeamFull
                ? t('Team Full')
                : team.isInMatch
                ? t('In Battle')
                : t('Invite Player')}
            </Button>
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
              <MemberRow
                key={member.user._id}
                member={member}
                userId={userId}
                isLeader={isLeader}
                isInMatch={team.isInMatch}
                onRemove={onRemoveMember}
              />
            ))}
          </VStack>

          {/* Empty slots indicator */}
          {!isTeamFull && (
            <Box mt={2}>
              {Array.from({ length: emptySlots }).map((_, index) => (
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
              ))}
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
            onClick={handleLeave}
            isDisabled={team.isInMatch}
          >
            {t('Leave')}
          </Button>

          <HStack spacing={2}>
            <Text fontSize="xs" color="gray.500">
              {t('Avg Trophies')}:
            </Text>
            <Text fontSize="xs" color="cyan.300" fontWeight="bold">
              {team.avgTrophies || 0}
            </Text>
          </HStack>
        </Flex>
      </Box>
    )
  },
)

// Optimized Member Row Component
const MemberRow = memo(({ member, userId, isLeader, isInMatch, onRemove }) => {
  const { t } = useTranslation('QuickClash')

  const isCurrentUser = member.user._id === userId
  const handleRemove = useCallback(
    () => onRemove(member.user._id),
    [onRemove, member.user._id],
  )

  return (
    <Flex
      py={2.5}
      px={3}
      justify="space-between"
      align="center"
      bg={isCurrentUser ? 'rgba(128, 90, 213, 0.15)' : 'transparent'}
      borderRadius="md"
      _hover={{
        bg: isCurrentUser ? 'rgba(128, 90, 213, 0.2)' : 'rgba(26, 32, 44, 0.6)',
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
              color={isCurrentUser ? 'purple.300' : 'white'}
              fontWeight={isCurrentUser ? 'bold' : 'medium'}
              fontSize="sm"
              noOfLines={1}
            >
              {member.user.name || member.user.inGameName}
            </Text>
            {isCurrentUser && (
              <Badge colorScheme="purple" variant="solid" fontSize="2xs" ml={1}>
                {t('YOU')}
              </Badge>
            )}
          </HStack>

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
        </Box>
      </HStack>

      {isLeader && !isCurrentUser && (
        <Button
          size="xs"
          colorScheme="red"
          variant="ghost"
          onClick={handleRemove}
          isDisabled={isInMatch}
          ml={2}
        >
          {t('Remove')}
        </Button>
      )}
    </Flex>
  )
})

const TeamDashboard = () => {
  const { t } = useTranslation('QuickClash')
  const toast = useToast()
  const { user } = useSelector(state => state.auth)

  // Responsive values
  const buttonSize = useBreakpointValue({ base: 'sm', md: 'md' })
  const headingSize = useBreakpointValue({ base: 'md', md: 'lg' })
  const cardColumns = useBreakpointValue({ base: 1, md: 2, lg: 2, xl: 3 })
  const iconSize = useBreakpointValue({ base: 5, md: 6 })

  // State
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedTeam, setSelectedTeam] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  const { getSocket } = useSocket()
  const { setupTeamBattleSocketListeners } = useQuickClashTeamBattle()

  // Modal disclosures
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

  // Memoized function to fetch teams
  const fetchTeams = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await axios.get('/api/quickClash/teams')
      setTeams(response.data.teams || [])
    } catch (error) {
      console.error('Error fetching teams:', error)
      const errorMessage =
        error.response?.data?.message || 'Failed to fetch teams'
      setError(errorMessage)
      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  // Socket setup and team fetch
  useEffect(() => {
    setupTeamBattleSocketListeners()

    const socket = getSocket()
    if (socket) {
      const handleTeamUpdate = () => fetchTeams()

      socket.on('quickClash:teamInvitationAccepted', handleTeamUpdate)
      socket.on('quickClash:teamMemberJoined', handleTeamUpdate)
      socket.on('quickClash:teamMemberLeft', handleTeamUpdate)
      socket.on('quickClash:teamMemberRemoved', handleTeamUpdate)

      return () => {
        socket.off('quickClash:teamInvitationAccepted', handleTeamUpdate)
        socket.off('quickClash:teamMemberJoined', handleTeamUpdate)
        socket.off('quickClash:teamMemberLeft', handleTeamUpdate)
        socket.off('quickClash:teamMemberRemoved', handleTeamUpdate)
      }
    }
  }, [setupTeamBattleSocketListeners, fetchTeams, getSocket])

  // Initial fetch
  useEffect(() => {
    fetchTeams()
  }, [fetchTeams])

  // Memoized handlers
  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    await fetchTeams()
    setRefreshing(false)
  }, [fetchTeams])

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
        fetchTeams()
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

  const handleJoinTeam = useCallback(
    async teamCode => {
      try {
        await axios.post('/api/quickClash/team/join', { teamCode })
        toast({
          title: 'Team Joined',
          description: 'You have joined the team successfully!',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
        fetchTeams()
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

  const handleRemoveMember = useCallback(
    async (teamId, memberId) => {
      try {
        await axios.post(`/api/quickClash/team/${teamId}/remove`, { memberId })
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

  const handleInviteUser = useCallback(
    async (teamId, inviteeId) => {
      try {
        await axios.post(`/api/quickClash/team/${teamId}/invite`, { inviteeId })
        toast({
          title: 'Invitation Sent',
          description: 'The user has been invited to your team',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
        closeInviteModal()
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

  const copyTeamCode = useCallback(
    async code => {
      try {
        // Check if modern clipboard API is available
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(code)
          toast({
            title: 'Copied!',
            description: 'Team code copied to clipboard',
            status: 'success',
            duration: 2000,
            isClosable: true,
            position: 'top-right',
          })
        } else {
          // Fallback for older browsers or non-secure contexts
          const textArea = document.createElement('textarea')
          textArea.value = code
          textArea.style.position = 'fixed'
          textArea.style.left = '-999999px'
          textArea.style.top = '-999999px'
          document.body.appendChild(textArea)
          textArea.focus()
          textArea.select()

          try {
            const result = document.execCommand('copy')
            document.body.removeChild(textArea)

            if (result) {
              toast({
                title: 'Copied!',
                description: 'Team code copied to clipboard',
                status: 'success',
                duration: 2000,
                isClosable: true,
                position: 'top-right',
              })
            } else {
              throw new Error('Copy command failed')
            }
          } catch (err) {
            document.body.removeChild(textArea)
            throw err
          }
        }
      } catch (error) {
        console.error('Failed to copy team code:', error)

        // Show fallback modal or toast with the code
        toast({
          title: 'Copy Failed',
          description: `Please copy manually: ${code}`,
          status: 'warning',
          duration: 5000,
          isClosable: true,
          position: 'top-right',
        })
      }
    },
    [toast],
  )

  // Memoized check for team leader
  const isUserTeamLeader = useCallback(
    team => {
      return team?.members.some(
        member => member.user._id === user._id && member.role === 'leader',
      )
    },
    [user._id],
  )

  // Memoized team card handlers
  const teamCardHandlers = useMemo(
    () => ({
      onLeave: handleLeaveTeam,
      onRemoveMember: teamId => memberId =>
        handleRemoveMember(teamId, memberId),
      onInvite: team => () => {
        setSelectedTeam(team)
        openInviteModal()
      },
      onCopyTeamCode: copyTeamCode,
    }),
    [handleLeaveTeam, handleRemoveMember, copyTeamCode, openInviteModal],
  )

  // Loading state
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
          />
          <Text color="whiteAlpha.800" fontSize="lg" fontWeight="medium">
            {t('Loading your teams...')}
          </Text>
        </VStack>
      </Center>
    )
  }

  // Error state
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
          >
            <Icon as={RefreshCw} color="red.400" boxSize={12} />
          </Box>
          <Text color="red.400" fontSize="lg" fontWeight="medium">
            {error}
          </Text>
          <Button
            leftIcon={<RefreshCw size={18} />}
            colorScheme="purple"
            onClick={handleRefresh}
          >
            {t('Try Again')}
          </Button>
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
      px={{ base: 2, md: 4 }}
    >
      {/* Header */}
      <Box mb={6} mt={4}>
        <Flex
          justify="space-between"
          align="center"
          wrap={{ base: 'wrap', md: 'nowrap' }}
          gap={{ base: 3, md: 4 }}
        >
          <Flex
            direction="row"
            align="center"
            flex={{ base: '1 1 100%', md: '1 1 auto' }}
            mb={{ base: 3, md: 0 }}
          >
            <HStack spacing={{ base: 2, md: 3 }}>
              <Icon as={Users} boxSize={iconSize} color="purple.400" />
              <Heading size={headingSize} color="white">
                {t('My Teams')}
              </Heading>
            </HStack>

            <IconButton
              ml={3}
              icon={<RefreshCw size={18} />}
              colorScheme="purple"
              variant="ghost"
              isLoading={refreshing}
              onClick={handleRefresh}
              aria-label={t('Refresh teams')}
            />
          </Flex>

          <Flex
            gap={{ base: 2, md: 3 }}
            justify={{ base: 'flex-start', md: 'flex-end' }}
            flex={{ base: '1 1 100%', md: '0 0 auto' }}
            width={{ base: '100%', md: 'auto' }}
          >
            <Button
              leftIcon={<PlusCircle size={18} />}
              colorScheme="purple"
              onClick={openCreateModal}
              size={buttonSize}
              flexGrow={{ base: 1, md: 0 }}
            >
              {t('Create Team')}
            </Button>

            <Button
              leftIcon={<UserPlus size={18} />}
              variant="outline"
              colorScheme="blue"
              onClick={openJoinModal}
              size={buttonSize}
              flexGrow={{ base: 1, md: 0 }}
            >
              {t('Join Team')}
            </Button>
          </Flex>
        </Flex>
      </Box>

      {/* Teams Content */}
      {teams.length === 0 ? (
        <MotionBox variants={itemVariants}>
          <EmptyTeamState
            onCreateTeam={openCreateModal}
            onJoinTeam={openJoinModal}
          />
        </MotionBox>
      ) : (
        <MotionSimpleGrid
          columns={cardColumns}
          spacing={{ base: 4, md: 6 }}
          variants={itemVariants}
        >
          {teams.map(team => (
            <TeamCard
              key={team._id}
              team={team}
              isLeader={isUserTeamLeader(team)}
              userId={user._id}
              onLeave={teamCardHandlers.onLeave}
              onRemoveMember={teamCardHandlers.onRemoveMember(team._id)}
              onInvite={teamCardHandlers.onInvite(team)}
              onCopyTeamCode={teamCardHandlers.onCopyTeamCode}
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
        <InviteUserModal
          isOpen={isInviteModalOpen}
          onClose={closeInviteModal}
          teamId={selectedTeam._id}
          teamName={selectedTeam.name}
          onInvite={inviteeId => handleInviteUser(selectedTeam._id, inviteeId)}
        />
      )}
    </MotionBox>
  )
}

TeamCard.displayName = 'TeamCard'
MemberRow.displayName = 'MemberRow'

export default memo(TeamDashboard)
