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
  Divider,
  Badge,
  Flex,
  Tooltip,
  Center,
  Spinner,
  useToast,
  Input,
  InputGroup,
  InputRightElement,
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
  Bot,
  LogOut,
  Settings,
} from 'lucide-react'

// Import sub-components
import CreateTeamModal from './CreateTeamModal'
import JoinTeamModal from './JoinTeamModal'
import TeamCard from './TeamCard'
import EmptyTeamState from './EmptyTeamState'
import InviteUserModal from './InviteUserModal'
import TeamSettingsModal from './TeamSettingsModal'

// Import custom hook for team operations
import useQuickClashTeamBattle from '../../../customHooks/useQuickClashTeamBattle'

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

const MotionBox = motion(Box)
const MotionFlex = motion(Flex)
const MotionButton = motion(Button)

const TeamDashboard = () => {
  const { t } = useTranslation('QuickClash')
  const toast = useToast()
  const { user } = useSelector(state => state.auth)

  // State
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedTeam, setSelectedTeam] = useState(null)
  const [copySuccess, setCopySuccess] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  // Get team battle state and functions from custom hook
  const { setupTeamBattleSocketListeners, cleanupSocketListeners } =
    useQuickClashTeamBattle()

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

  const {
    isOpen: isSettingsModalOpen,
    onOpen: openSettingsModal,
    onClose: closeSettingsModal,
  } = useDisclosure()

  // Set up socket listeners on mount
  useEffect(() => {
    setupTeamBattleSocketListeners()

    return () => {
      cleanupSocketListeners()
    }
  }, [setupTeamBattleSocketListeners, cleanupSocketListeners])

  // Fetch teams on component mount
  useEffect(() => {
    fetchTeams()
  }, [])

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
        const response = await axios.post('/api/quickClash/team', teamData)

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
        const response = await axios.post('/api/quickClash/team/join', {
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

        toast({
          title: 'Member Removed',
          description: 'The member has been removed from the team',
          status: 'info',
          duration: 3000,
          isClosable: true,
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

  // Handle updating team settings
  const handleUpdateTeamSettings = useCallback(
    async (teamId, settings) => {
      try {
        if (settings.persistence !== undefined) {
          await axios.post(`/api/quickClash/team/${teamId}/persistence`)
        }

        toast({
          title: 'Settings Updated',
          description: 'Team settings have been updated successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })

        // Close modal
        closeSettingsModal()

        // Refresh team list
        fetchTeams()
      } catch (error) {
        toast({
          title: 'Error',
          description:
            error.response?.data?.message || 'Failed to update settings',
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
      }
    },
    [toast, closeSettingsModal, fetchTeams],
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
            emptyColor="gray.700"
            color="purple.500"
            size="xl"
          />
          <Text color="whiteAlpha.700">{t('Loading teams...')}</Text>
        </VStack>
      </Center>
    )
  }

  // Render error state
  if (error && !teams.length) {
    return (
      <Center h="400px">
        <VStack spacing={4}>
          <Icon as={RefreshCw} color="red.400" boxSize={10} />
          <Text color="red.400">{error}</Text>
          <Button
            leftIcon={<RefreshCw size={18} />}
            colorScheme="purple"
            variant="outline"
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
    >
      {/* Header with Actions */}
      <MotionFlex
        variants={itemVariants}
        justify="space-between"
        align="center"
        mb={6}
      >
        <HStack spacing={3}>
          <Icon as={Users} boxSize={6} color="purple.400" />
          <Heading size="md" color="white">
            {t('My Teams')}
          </Heading>

          <Tooltip label="Refresh teams">
            <MotionButton
              size="sm"
              variant="ghost"
              colorScheme="purple"
              isLoading={refreshing}
              onClick={handleRefresh}
              aria-label="Refresh teams"
              icon={<RefreshCw size={16} />}
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.3 }}
            >
              <Icon as={RefreshCw} />
            </MotionButton>
          </Tooltip>
        </HStack>

        <HStack spacing={3}>
          <MotionButton
            leftIcon={<PlusCircle size={18} />}
            colorScheme="purple"
            onClick={openCreateModal}
            size="sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {t('Create Team')}
          </MotionButton>
          <MotionButton
            leftIcon={<UserPlus size={18} />}
            variant="outline"
            colorScheme="blue"
            onClick={openJoinModal}
            size="sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {t('Join Team')}
          </MotionButton>
        </HStack>
      </MotionFlex>

      {/* No Teams State */}
      {!loading && teams.length === 0 ? (
        <EmptyTeamState
          onCreateTeam={openCreateModal}
          onJoinTeam={openJoinModal}
        />
      ) : (
        // Teams List
        <VStack spacing={4} align="stretch">
          {teams.map((team, index) => (
            <TeamCard
              key={team._id}
              team={team}
              index={index}
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
              onOpenSettings={() => {
                setSelectedTeam(team)
                openSettingsModal()
              }}
              onCopyTeamCode={() => copyTeamCode(team.teamCode)}
            />
          ))}
        </VStack>
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

          <TeamSettingsModal
            isOpen={isSettingsModalOpen}
            onClose={closeSettingsModal}
            team={selectedTeam}
            onUpdate={settings =>
              handleUpdateTeamSettings(selectedTeam._id, settings)
            }
          />
        </>
      )}
    </MotionBox>
  )
}

export default TeamDashboard
