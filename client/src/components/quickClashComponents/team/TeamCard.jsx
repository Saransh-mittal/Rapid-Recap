// components/quickClashComponents/team/TeamCard.jsx
import React, { useState } from 'react'
import {
  Box,
  Flex,
  Text,
  Button,
  Badge,
  Avatar,
  AvatarGroup,
  Icon,
  HStack,
  VStack,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Tooltip,
  Divider,
  useDisclosure,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
  PopoverArrow,
  PopoverCloseButton,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  Users,
  UserPlus,
  Copy,
  Settings,
  LogOut,
  Bot,
  Trophy,
  Shield,
  User,
  Swords,
  MoreVertical,
  Activity,
  Check,
} from 'lucide-react'

const MotionBox = motion(Box)
const MotionButton = motion(Button)

/**
 * Team card component for displaying a team in the dashboard
 */
const TeamCard = ({
  team,
  index,
  isLeader,
  userId,
  onLeave,
  onRemoveMember,
  onInvite,
  onOpenSettings,
  onCopyTeamCode,
}) => {
  const { t } = useTranslation('QuickClash')
  const [showCopied, setShowCopied] = useState(false)

  // Handle team code copy
  const handleCopyTeamCode = () => {
    if (onCopyTeamCode) {
      onCopyTeamCode()
      setShowCopied(true)
      setTimeout(() => setShowCopied(false), 2000)
    }
  }

  // Handle leave team with confirmation
  const [confirmLeave, setConfirmLeave] = useState(false)
  const {
    isOpen: isLeaveOpen,
    onOpen: onLeaveOpen,
    onClose: onLeaveClose,
  } = useDisclosure()

  const handleLeaveClick = () => {
    setConfirmLeave(true)
    onLeaveOpen()
  }

  const confirmLeaveTeam = () => {
    onLeaveClose()
    if (onLeave) {
      onLeave()
    }
  }

  // Handle remove member with confirmation
  const [memberToRemove, setMemberToRemove] = useState(null)
  const {
    isOpen: isRemoveOpen,
    onOpen: onRemoveOpen,
    onClose: onRemoveClose,
  } = useDisclosure()

  const handleRemoveMember = (memberId, memberName) => {
    setMemberToRemove({ id: memberId, name: memberName })
    onRemoveOpen()
  }

  const confirmRemoveMember = () => {
    onRemoveClose()
    if (onRemoveMember && memberToRemove) {
      onRemoveMember(memberToRemove.id)
    }
  }

  // Calculate team status
  const getTeamStatus = () => {
    if (team.isInMatch) {
      return {
        status: 'inMatch',
        label: t('In Battle'),
        color: 'green',
        icon: Swords,
      }
    }

    const readyMembers = team.members.filter(m => m.status === 'ready').length
    const totalMembers = team.members.length

    if (readyMembers === totalMembers) {
      return {
        status: 'ready',
        label: t('Ready'),
        color: 'green',
        icon: Check,
      }
    } else {
      return {
        status: 'notReady',
        label: `${readyMembers}/${totalMembers} ${t('Ready')}`,
        color: 'yellow',
        icon: Activity,
      }
    }
  }

  const teamStatus = getTeamStatus()

  // Animation variants
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
      boxShadow: '0 12px 24px rgba(0, 0, 0, 0.2)',
      transition: { duration: 0.3 },
    },
  }

  return (
    <MotionBox
      initial="hidden"
      animate="visible"
      custom={index}
      variants={cardVariants}
      whileHover="hover"
      bg="rgba(26, 32, 44, 0.8)"
      borderRadius="lg"
      borderWidth="1px"
      borderColor="purple.600"
      overflow="hidden"
      position="relative"
      _after={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        bgGradient: 'linear(to-r, purple.500, blue.500)',
      }}
    >
      {/* Team Header */}
      <Flex
        justify="space-between"
        align="center"
        borderBottom="1px"
        borderColor="whiteAlpha.200"
        p={4}
        bg="rgba(76, 39, 143, 0.1)"
      >
        <HStack spacing={3}>
          <Icon as={Users} color="purple.400" boxSize={5} />
          <VStack align="flex-start" spacing={0}>
            <Text fontWeight="bold" fontSize="lg" color="white">
              {team.name}
            </Text>
            <HStack>
              {isLeader && (
                <Badge colorScheme="purple" variant="solid" fontSize="xs">
                  {t('Leader')}
                </Badge>
              )}
              <Badge
                colorScheme={teamStatus.color}
                variant="subtle"
                fontSize="xs"
                display="flex"
                alignItems="center"
              >
                <Icon as={teamStatus.icon} boxSize={3} mr={1} />
                {teamStatus.label}
              </Badge>
            </HStack>
          </VStack>
        </HStack>

        <HStack spacing={2}>
          {/* Team Trophy Display */}
          <Tooltip label={t('Team Average Trophies')}>
            <Badge
              display="flex"
              alignItems="center"
              px={2}
              py={1}
              borderRadius="full"
              bg="rgba(255, 215, 0, 0.1)"
              borderWidth="1px"
              borderColor="rgba(255, 215, 0, 0.4)"
            >
              <Icon as={Trophy} color="yellow.400" boxSize={3} mr={1} />
              <Text color="yellow.400" fontWeight="bold" fontSize="xs">
                {team.avgTrophies}
              </Text>
            </Badge>
          </Tooltip>

          {/* Team Code */}
          <Tooltip label={showCopied ? t('Copied!') : t('Copy Team Code')}>
            <Button
              size="sm"
              variant="outline"
              colorScheme="blue"
              leftIcon={<Icon as={Copy} size={14} />}
              onClick={handleCopyTeamCode}
              px={2}
            >
              {team.teamCode}
            </Button>
          </Tooltip>
        </HStack>
      </Flex>

      {/* Team Members */}
      <Box p={4}>
        <HStack justify="space-between" mb={3}>
          <Text fontSize="sm" fontWeight="bold" color="whiteAlpha.800">
            {t('Members')} ({team.members.length}/4)
          </Text>

          {isLeader && team.members.length < 4 && (
            <HStack spacing={2}>
              <Button
                size="xs"
                leftIcon={<Icon as={UserPlus} size={14} />}
                colorScheme="blue"
                variant="ghost"
                onClick={onInvite}
              >
                {t('Invite')}
              </Button>
            </HStack>
          )}
        </HStack>

        <VStack spacing={2} align="stretch">
          {team.members.map(member => (
            <Flex
              key={member.user._id}
              justify="space-between"
              align="center"
              p={2}
              bg={
                member.user._id === userId
                  ? 'rgba(128, 90, 213, 0.1)'
                  : 'transparent'
              }
              borderRadius="md"
              borderWidth={member.user._id === userId ? '1px' : '0'}
              borderColor="purple.500"
            >
              <HStack>
                <Avatar
                  size="sm"
                  name={member.user.name || member.user.inGameName}
                  src={member.user.pic}
                />
                <VStack align="flex-start" spacing={0}>
                  <Text
                    color="white"
                    fontWeight={member.role === 'leader' ? 'bold' : 'normal'}
                  >
                    {member.user.name || member.user.inGameName}
                    {member.user.email?.includes('dummy') && (
                      <Badge ml={1} colorScheme="gray" fontSize="xs">
                        {t('Bot')}
                      </Badge>
                    )}
                  </Text>
                  <HStack>
                    {member.role === 'leader' && (
                      <Badge
                        colorScheme="purple"
                        variant="subtle"
                        fontSize="2xs"
                      >
                        {t('Leader')}
                      </Badge>
                    )}
                    <Badge
                      colorScheme={
                        member.status === 'ready' ? 'green' : 'yellow'
                      }
                      variant="subtle"
                      fontSize="2xs"
                    >
                      {member.status === 'ready' ? t('Ready') : t('Pending')}
                    </Badge>
                  </HStack>
                </VStack>
              </HStack>

              {isLeader && member.user._id !== userId && (
                <Tooltip label={t('Remove Member')}>
                  <Button
                    size="xs"
                    variant="ghost"
                    colorScheme="red"
                    onClick={() =>
                      handleRemoveMember(
                        member.user._id,
                        member.user.name || member.user.inGameName,
                      )
                    }
                    isDisabled={team.isInMatch}
                  >
                    {t('Remove')}
                  </Button>
                </Tooltip>
              )}
            </Flex>
          ))}
        </VStack>
      </Box>

      {/* Team Actions */}
      <Flex
        justify="space-between"
        align="center"
        borderTop="1px"
        borderColor="whiteAlpha.200"
        p={4}
        bg="rgba(76, 39, 143, 0.05)"
      >
        <HStack spacing={2}>
          {isLeader && (
            <Button
              size="sm"
              leftIcon={<Icon as={Settings} size={14} />}
              colorScheme="blue"
              variant="ghost"
              onClick={onOpenSettings}
            >
              {t('Settings')}
            </Button>
          )}
          <Button
            size="sm"
            leftIcon={<Icon as={LogOut} size={14} />}
            colorScheme="red"
            variant="ghost"
            onClick={handleLeaveClick}
            isDisabled={team.isInMatch}
          >
            {t('Leave')}
          </Button>
        </HStack>
      </Flex>

      {/* Leave Confirmation Popover */}
      <Popover
        isOpen={isLeaveOpen}
        onClose={onLeaveClose}
        placement="top"
        closeOnBlur={true}
      >
        <PopoverContent bg="gray.800" borderColor="red.500">
          <PopoverArrow bg="gray.800" />
          <PopoverCloseButton />
          <PopoverHeader borderColor="gray.600" fontWeight="bold">
            {t('Confirm Leave')}
          </PopoverHeader>
          <PopoverBody>
            <Text>
              {isLeader
                ? t(
                    'As a leader, leaving will dissolve the team. Are you sure?',
                  )
                : t('Are you sure you want to leave this team?')}
            </Text>
          </PopoverBody>
          <PopoverFooter
            borderColor="gray.600"
            d="flex"
            justifyContent="flex-end"
          >
            <Button size="sm" variant="ghost" mr={2} onClick={onLeaveClose}>
              {t('Cancel')}
            </Button>
            <Button size="sm" colorScheme="red" onClick={confirmLeaveTeam}>
              {t('Leave')}
            </Button>
          </PopoverFooter>
        </PopoverContent>
      </Popover>

      {/* Remove Member Confirmation Popover */}
      <Popover
        isOpen={isRemoveOpen}
        onClose={onRemoveClose}
        placement="top"
        closeOnBlur={true}
      >
        <PopoverContent bg="gray.800" borderColor="red.500">
          <PopoverArrow bg="gray.800" />
          <PopoverCloseButton />
          <PopoverHeader borderColor="gray.600" fontWeight="bold">
            {t('Confirm Remove')}
          </PopoverHeader>
          <PopoverBody>
            <Text>
              {t('Are you sure you want to remove {{name}} from the team?', {
                name: memberToRemove?.name || t('this member'),
              })}
            </Text>
          </PopoverBody>
          <PopoverFooter
            borderColor="gray.600"
            d="flex"
            justifyContent="flex-end"
          >
            <Button size="sm" variant="ghost" mr={2} onClick={onRemoveClose}>
              {t('Cancel')}
            </Button>
            <Button size="sm" colorScheme="red" onClick={confirmRemoveMember}>
              {t('Remove')}
            </Button>
          </PopoverFooter>
        </PopoverContent>
      </Popover>
    </MotionBox>
  )
}

export default TeamCard
