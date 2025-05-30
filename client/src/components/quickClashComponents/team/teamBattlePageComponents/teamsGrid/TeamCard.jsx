// components/quickClashComponents/team/teamBattlePageComponents/teamsGrid/TeamCard.jsx
import React, { memo, useMemo } from 'react'
import {
  Box,
  VStack,
  Text,
  HStack,
  Icon,
  useBreakpointValue,
  AvatarGroup,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverArrow,
  PopoverCloseButton,
  Portal,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Trophy, Users } from 'lucide-react'

import MemoizedAvatar from './MemoizedAvatar'
import FuturisticDivider from './FuturisticDivider'
import TeamMembersPopover from './TeamMembersPopover'

const MotionBox = motion(Box)
const MotionFlex = motion(Box)

/**
 * Individual Team Card Component - Optimized for performance
 */
const TeamCard = memo(({ team, position, userId }) => {
  const { t } = useTranslation('QuickClash')

  // Responsive values
  const avatarSize = useBreakpointValue({ base: 'sm', md: 'md' })
  const avatarGroupMax = useBreakpointValue({ base: 1, sm: 2, md: 3 })
  const titleFontSize = useBreakpointValue({ base: 'sm', md: 'md', lg: 'lg' })

  // Memoized values
  const showTrophyBox = useMemo(
    () => typeof team?.avgTrophies === 'number' && team.avgTrophies >= 0,
    [team?.avgTrophies],
  )

  const teamColorForStyling = useMemo(
    () => (position === 'left' ? 'blue' : 'red'),
    [position],
  )

  const headerBgColor = useMemo(
    () => `${teamColorForStyling}.600`,
    [teamColorForStyling],
  )

  const headerBorderColor = useMemo(
    () =>
      team.isUserTeam
        ? `${teamColorForStyling}.300`
        : `${teamColorForStyling}.400`,
    [team.isUserTeam, teamColorForStyling],
  )

  const teamNameDisplay = useMemo(
    () =>
      team.data?.name || (team.type === 'teamA' ? t('Team A') : t('Team B')),
    [team.data?.name, team.type, t],
  )

  const cardMotionVariants = useMemo(
    () => ({
      hidden: {
        opacity: 0,
        y: 20,
        x: position === 'left' ? -20 : 20,
        scale: 0.95,
      },
      visible: {
        opacity: 1,
        y: 0,
        x: 0,
        scale: 1,
        transition: {
          type: 'spring',
          stiffness: 100,
          damping: 15,
          duration: 0.7,
        },
      },
    }),
    [position],
  )

  // Memoized card glow styles for better performance
  const cardGlowStyles = useMemo(() => {
    if (team.isUserTeam) {
      return {
        position: 'relative',
        borderRadius: 'xl',
        transform: 'scale(1.05)',
        boxShadow: `0 0 15px 3px rgba(${
          teamColorForStyling === 'blue' ? '0, 210, 255' : '255, 56, 56'
        }, 0.6)`,
        _before: {
          content: '""',
          position: 'absolute',
          top: '-3px',
          right: '-3px',
          bottom: '-3px',
          left: '-3px',
          background:
            teamColorForStyling === 'blue'
              ? 'linear-gradient(135deg, #38bdf8, #0ea5e9, #0284c7, #38bdf8)'
              : 'linear-gradient(135deg, #f87171, #ef4444, #dc2626, #f87171)',
          backgroundSize: '400% 400%',
          borderRadius: 'xl',
          zIndex: '0',
          opacity: 0.8,
          animation: 'pulseBorder 3s infinite alternate',
        },
        _after: {
          content: '""',
          position: 'absolute',
          top: '0',
          right: '0',
          bottom: '0',
          left: '0',
          background: 'rgba(15, 23, 42, 0.90)',
          borderRadius: { base: 'lg', md: 'xl' },
          zIndex: '1',
        },
        sx: {
          '@keyframes pulseBorder': {
            '0%': {
              opacity: 0.7,
              boxShadow: `0 0 8px 2px rgba(${
                teamColorForStyling === 'blue' ? '0, 210, 255' : '255, 56, 56'
              }, 0.5)`,
            },
            '100%': {
              opacity: 0.9,
              boxShadow: `0 0 15px 4px rgba(${
                teamColorForStyling === 'blue' ? '0, 210, 255' : '255, 56, 56'
              }, 0.7)`,
            },
          },
        },
      }
    } else {
      return {
        position: 'relative',
        borderRadius: 'xl',
        boxShadow: `0 0 8px 2px rgba(${
          teamColorForStyling === 'blue' ? '59, 130, 246' : '239, 68, 68'
        }, 0.4)`,
        filter: 'brightness(0.9)',
        _before: {
          content: '""',
          position: 'absolute',
          top: '-2px',
          right: '-2px',
          bottom: '-2px',
          left: '-2px',
          background:
            teamColorForStyling === 'blue'
              ? 'linear-gradient(to bottom right, #3b82f6 0%, #1d4ed8 50%, #2563eb 100%)'
              : 'linear-gradient(to bottom right, #ef4444 0%, #b91c1c 50%, #dc2626 100%)',
          borderRadius: 'xl',
          zIndex: '0',
          opacity: 0.6,
          animation: 'subtlePulse 4s infinite alternate',
        },
        _after: {
          content: '""',
          position: 'absolute',
          top: '0',
          right: '0',
          bottom: '0',
          left: '0',
          background: 'rgba(17, 24, 39, 0.95)',
          borderRadius: { base: 'lg', md: 'xl' },
          zIndex: '1',
        },
        sx: {
          '@keyframes subtlePulse': {
            '0%': {
              opacity: 0.5,
              boxShadow: `0 0 5px 1px rgba(${
                teamColorForStyling === 'blue' ? '59, 130, 246' : '239, 68, 68'
              }, 0.3)`,
            },
            '100%': {
              opacity: 0.7,
              boxShadow: `0 0 8px 2px rgba(${
                teamColorForStyling === 'blue' ? '59, 130, 246' : '239, 68, 68'
              }, 0.5)`,
            },
          },
        },
      }
    }
  }, [team.isUserTeam, teamColorForStyling])

  return (
    <MotionBox
      variants={cardMotionVariants}
      width="95%"
      minH="auto"
      backgroundColor="transparent"
      borderRadius={{ base: 'lg', md: 'xl' }}
      position="relative"
      {...cardGlowStyles}
    >
      <VStack spacing={0} align="stretch" position="relative" zIndex="2">
        {/* Header */}
        <Box
          bg={headerBgColor}
          width="100%"
          p={{ base: 1.5, md: 2 }}
          borderBottomWidth="2px"
          borderBottomColor={headerBorderColor}
          position="relative"
          overflow="hidden"
          borderTopRadius={{ base: 'lg', md: 'xl' }}
        >
          <VStack
            spacing={{ base: 1, md: 1.5 }}
            align="stretch"
            position="relative"
            zIndex="1"
          >
            <Text
              fontFamily="'Orbitron', sans-serif"
              fontSize={titleFontSize}
              fontWeight="bold"
              color="white"
              textTransform="uppercase"
              textAlign="center"
              letterSpacing="0.5px"
              textShadow={
                team.isUserTeam ? '0 0 8px rgba(0, 210, 255, 0.6)' : 'none'
              }
              noOfLines={1}
              position="relative"
            >
              {team.data?.formationInfo?.isAutoFormed
                ? team.type === 'teamA'
                  ? t('TEAM A')
                  : t('TEAM B')
                : teamNameDisplay}
            </Text>

            {showTrophyBox && (
              <>
                <FuturisticDivider />
                <Box display="flex" justifyContent="center" width="100%">
                  <Box
                    bg="rgba(26, 32, 44, 0.7)"
                    border="1px solid"
                    borderColor="cyan.500"
                    py={{ base: 0.5, md: 1 }}
                    px={{ base: 2, md: 3 }}
                    borderRadius="md"
                    minW={{ base: '80px', md: '100px' }}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Icon
                      as={Trophy}
                      boxSize={{ base: 3, md: 4 }}
                      color="yellow.400"
                      mr={1.5}
                    />
                    <Text
                      fontFamily="'Aldrich', sans-serif"
                      fontSize={{ base: 'md', md: 'lg' }}
                      fontWeight="bold"
                      color="cyan.300"
                      lineHeight="1"
                    >
                      {team.avgTrophies}
                    </Text>
                  </Box>
                </Box>
              </>
            )}
          </VStack>
        </Box>

        {/* Body */}
        <VStack
          spacing={2}
          width="100%"
          p={{ base: 1.5, md: 2 }}
          align="center"
          bg="rgba(17, 24, 39, 0.95)"
          position="relative"
          overflow="hidden"
          borderBottomRadius={{ base: 'lg', md: 'xl' }}
          backdropFilter="blur(4px)"
        >
          {/* Avatar Group */}
          <HStack
            justify="center"
            spacing={-2.5}
            width="100%"
            my={1}
            position="relative"
            zIndex="1"
          >
            <AvatarGroup
              size={avatarSize}
              max={avatarGroupMax}
              spacing={{ base: -2, md: -3, lg: -4 }}
              css={{
                '.chakra-avatar__excess': {
                  background: `linear-gradient(135deg, ${
                    teamColorForStyling === 'blue' ? '#1e3a8a' : '#7f1d1d'
                  }, #4B5563)`,
                  border: `2px solid ${
                    team.isUserTeam
                      ? '#2dd4ff'
                      : teamColorForStyling === 'blue'
                      ? '#3b82f6'
                      : '#ef4444'
                  }`,
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '0.75rem',
                },
              }}
            >
              {team.members?.map(member => (
                <MemoizedAvatar
                  key={member.user._id}
                  member={member}
                  teamColor={teamColorForStyling}
                  userId={userId}
                  t={t}
                />
              ))}
            </AvatarGroup>
          </HStack>

          {/* Squad Button with Popover */}
          <TeamMembersPopover
            team={team}
            teamColorForStyling={teamColorForStyling}
            userId={userId}
            t={t}
          />
        </VStack>
      </VStack>
    </MotionBox>
  )
})

TeamCard.displayName = 'TeamCard'

export default TeamCard
