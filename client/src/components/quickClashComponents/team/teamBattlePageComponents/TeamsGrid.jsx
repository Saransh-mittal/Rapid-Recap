// components/quickClashComponents/team/teamBattlePageComponents/TeamsGrid.jsx
import React, { memo, useMemo } from 'react'
import {
  Flex,
  Text,
  Box,
  VStack,
  HStack,
  Badge,
  Avatar,
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
  Tooltip,
  Portal,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Trophy, Swords, Zap, CheckCircle, Clock, Users, X } from 'lucide-react'

const MotionBox = motion(Box)
const MotionFlex = motion(Flex)

// Memoized Avatar component
const MemoizedAvatar = memo(({ member, teamColor, userId, t }) => (
  <Tooltip
    label={`${member.user.name || member.user.inGameName}${
      member.completed
        ? ` (${member.score}pts)`
        : member.participated
        ? ` (${t('Playing')})`
        : ''
    }`}
    placement="top"
    bg="gray.800"
    color="white"
    borderRadius="lg"
    p={3}
    fontSize="sm"
    fontWeight="medium"
    hasArrow
    offset={[0, 10]}
  >
    <MotionBox whileHover={{ scale: 1.1 }} transition={{ duration: 0.2 }}>
      <Avatar
        name={member.user.name || member.user.inGameName}
        src={member.user.pic}
        borderWidth="2px"
        borderColor={
          member.user._id === userId
            ? 'cyan.300'
            : member.completed
            ? 'green.400'
            : member.participated
            ? 'yellow.400'
            : 'gray.500'
        }
        bg="gray.700"
      />
    </MotionBox>
  </Tooltip>
))
MemoizedAvatar.displayName = 'MemoizedAvatar'

// Helper for futuristic divider
const FuturisticDivider = props => (
  <Box
    height="1.5px"
    bgGradient="linear(to-r, transparent, cyan.400, transparent)"
    opacity={0.6}
    my={{ base: 1, md: 1.5 }}
    {...props}
  />
)

const TeamsGrid = ({ currentBattle, userTeam, userId, variants }) => {
  const { t } = useTranslation('QuickClash')

  // Memoize team arrangements (user's team always on left)
  const { leftTeam, rightTeam } = useMemo(() => {
    if (!currentBattle) {
      return {
        leftTeam: {
          data: null,
          members: [],
          wins: 0,
          type: 'teamA',
          isUserTeam: false,
          avgTrophies: 0,
          formationInfo: null,
        },
        rightTeam: {
          data: null,
          members: [],
          wins: 0,
          type: 'teamB',
          isUserTeam: false,
          avgTrophies: 0,
          formationInfo: null,
        },
      }
    }
    const isUserTeamA = userTeam === 'teamA'
    const isUserTeamB = userTeam === 'teamB'

    const teamAData = {
      data: currentBattle.teamA || {
        name: t('Team A'),
        avgTrophies: 0,
        formationInfo: { isAutoFormed: true },
      },
      members: currentBattle.teamAMembers || [],
      wins: currentBattle.teamAWins || 0,
      avgTrophies: currentBattle.teamA?.avgTrophies,
      formationInfo: currentBattle.teamA?.formationInfo,
      type: 'teamA',
      isUserTeam: isUserTeamA,
    }
    const teamBData = {
      data: currentBattle.teamB || {
        name: t('Team B'),
        avgTrophies: 0,
        formationInfo: { isAutoFormed: true },
      },
      members: currentBattle.teamBMembers || [],
      wins: currentBattle.teamBWins || 0,
      avgTrophies: currentBattle.teamB?.avgTrophies,
      formationInfo: currentBattle.teamB?.formationInfo,
      type: 'teamB',
      isUserTeam: isUserTeamB,
    }

    if (isUserTeamA) return { leftTeam: teamAData, rightTeam: teamBData }
    if (isUserTeamB) return { leftTeam: teamBData, rightTeam: teamAData } // User's team (B) on the left
    // Default: if user is not in either team (spectator), show A on left, B on right
    return { leftTeam: teamAData, rightTeam: teamBData }
  }, [currentBattle, userTeam, t])

  const containerPadding = useBreakpointValue({ base: 2, sm: 3, md: 4, lg: 8 })
  const vsSpacing = useBreakpointValue({ base: '8px', md: '12px', lg: '16px' })
  const vsSectionEffectiveWidth = useBreakpointValue({
    base: '70px',
    md: '90px',
    lg: '120px',
  })
  const gapValue = useBreakpointValue({ base: 1, md: 2, lg: 3 })
  const gapSizeToPx = themeSpaceUnit => themeSpaceUnit * 4
  const totalGapWidthInPx = useBreakpointValue({
    base: gapSizeToPx(1) * 2,
    md: gapSizeToPx(2) * 2,
    lg: gapSizeToPx(3) * 2,
  })
  const cardMaxWidth = `calc((100% - ${vsSectionEffectiveWidth} - ${totalGapWidthInPx}px) / 2)`
  const avatarSize = useBreakpointValue({ base: 'sm', md: 'md' })
  const avatarGroupMax = useBreakpointValue({ base: 1, sm: 2, md: 3 })
  const titleFontSize = useBreakpointValue({ base: 'sm', md: 'md', lg: 'lg' })

  // Team Card Component
  const TeamCard = ({ team, isUserTeam, position }) => {
    const showTrophyBox =
      typeof team?.avgTrophies === 'number' && team.avgTrophies >= 0

    // Determine card color scheme
    const teamColorForStyling = position === 'left' ? 'blue' : 'red'
    const headerBgColor = `${teamColorForStyling}.600`
    const headerBorderColor = team.isUserTeam
      ? `${teamColorForStyling}.300`
      : `${teamColorForStyling}.400`

    const teamNameDisplay =
      team.data?.name || (team.type === 'teamA' ? t('Team A') : t('Team B'))

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

    // More balanced styling with prominent user team and subtle opponent glow
    const cardGlowStyles = team.isUserTeam
      ? {
          position: 'relative',
          borderRadius: 'xl',
          transform: 'scale(1.05)',
          boxShadow: `0 0 15px 3px rgba(${
            teamColorForStyling === 'blue' ? '0, 210, 255' : '255, 56, 56'
          }, 0.6)`, // Reduced glow intensity
          _before: {
            content: '""',
            position: 'absolute',
            top: '-3px', // Slightly reduced border width
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
            opacity: 0.8, // Slightly reduced opacity
            animation: 'pulseBorder 3s infinite alternate', // Slower animation
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
                }, 0.7)`, // Less intense maximum glow
              },
            },
            '@keyframes gradientBorder': {
              '0%': { backgroundPosition: '0% 50%' },
              '50%': { backgroundPosition: '100% 50%' },
              '100%': { backgroundPosition: '0% 50%' },
            },
          },
        }
      : {
          position: 'relative',
          borderRadius: 'xl',
          boxShadow: `0 0 8px 2px rgba(${
            teamColorForStyling === 'blue' ? '59, 130, 246' : '239, 68, 68'
          }, 0.4)`, // Added subtle boxShadow
          filter: 'brightness(0.9)', // Less dimming (was 0.85)
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
            animation: 'subtlePulse 4s infinite alternate', // Very subtle pulse
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
                  teamColorForStyling === 'blue'
                    ? '59, 130, 246'
                    : '239, 68, 68'
                }, 0.3)`,
              },
              '100%': {
                opacity: 0.7,
                boxShadow: `0 0 8px 2px rgba(${
                  teamColorForStyling === 'blue'
                    ? '59, 130, 246'
                    : '239, 68, 68'
                }, 0.5)`,
              },
            },
          },
        }

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
                    <Flex
                      direction="row"
                      align="center"
                      justifyContent="center"
                      bg="rgba(26, 32, 44, 0.7)"
                      border="1px solid"
                      borderColor="cyan.500"
                      py={{ base: 0.5, md: 1 }}
                      px={{ base: 2, md: 3 }}
                      borderRadius="md"
                      minW={{ base: '80px', md: '100px' }}
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
                    </Flex>
                  </Box>
                </>
              )}
            </VStack>
          </Box>
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
            <HStack
              justify="center"
              spacing={-2.5}
              width="100%"
              my={1}
              position="relative"
              zIndex="1"
            >
              <Box>
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
              </Box>
            </HStack>
            <Popover
              placement="bottom"
              isLazy
              arrowShadowColor={`${teamColorForStyling}.500`}
              gutter={12}
            >
              <PopoverTrigger>
                <MotionFlex
                  as="button"
                  align="center"
                  justifyContent="center"
                  px={3}
                  py={1.5}
                  mt={1}
                  position="relative"
                  color="white"
                  borderRadius="md"
                  fontWeight="bold"
                  fontSize="xs"
                  letterSpacing="0.5px"
                  textTransform="uppercase"
                  cursor="pointer"
                  bg={`${teamColorForStyling}.600`}
                  _hover={{
                    bg: `${teamColorForStyling}.500`,
                    transform: 'scale(1.03)',
                  }}
                  _active={{
                    transform: 'scale(0.98)',
                  }}
                  transition="all 0.2s cubic-bezier(.08,.52,.52,1)"
                  zIndex="1"
                >
                  {team.isUserTeam ? t('YOUR TEAM') : t('TEAM')}
                </MotionFlex>
              </PopoverTrigger>
              <Portal>
                <PopoverContent
                  bg="gray.800"
                  border="1px solid"
                  borderColor={team.isUserTeam ? 'cyan.400' : 'purple.400'}
                  borderRadius="xl"
                  boxShadow="xl"
                  color="white"
                  width={{ base: '300px', md: '360px' }}
                  zIndex="popover"
                >
                  <PopoverArrow bg="gray.800" />
                  <PopoverCloseButton />
                  <PopoverHeader
                    fontWeight="bold"
                    borderBottom="1px solid"
                    borderBottomColor="gray.600"
                    pb={3}
                    pt={1}
                    mb={1}
                    textAlign="center"
                    fontSize={{ base: 'lg', md: 'xl' }}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Icon as={Users} mr={2} boxSize={5} />
                    {team.data?.name ||
                      (team.type === 'teamA' ? t('Team A') : t('Team B'))}{' '}
                    {t('Members')}
                  </PopoverHeader>
                  <PopoverBody p={3} maxHeight="300px" overflowY="auto">
                    {team.members?.length > 0 ? (
                      <VStack align="stretch" spacing={2.5}>
                        {team.members.map(member => (
                          <Flex
                            key={member.user._id}
                            justify="space-between"
                            align="center"
                            p={2.5}
                            borderRadius="lg"
                            bg={
                              member.user._id === userId
                                ? 'rgba(0, 210, 255, 0.1)'
                                : 'whiteAlpha.50'
                            }
                            _hover={{
                              bg: 'whiteAlpha.100',
                            }}
                          >
                            <HStack spacing={3}>
                              <Avatar
                                size="sm"
                                name={
                                  member.user.name || member.user.inGameName
                                }
                                src={member.user.pic}
                                bg="gray.700"
                              />
                              <VStack align="flex-start" spacing={0}>
                                <Text
                                  fontSize="sm"
                                  fontWeight="medium"
                                  color="white"
                                >
                                  {member.user.name ||
                                    member.user.inGameName ||
                                    t('Unnamed Player')}
                                </Text>
                                {member.user._id === userId && (
                                  <Badge
                                    fontSize="2xs"
                                    px={2}
                                    py={0.5}
                                    borderRadius="full"
                                    bg="cyan.600"
                                    color="white"
                                    variant="solid"
                                    mt="1px"
                                  >
                                    {t('YOU')}
                                  </Badge>
                                )}
                              </VStack>
                            </HStack>
                            <Badge
                              px={2.5}
                              py={1}
                              borderRadius="full"
                              fontSize="xs"
                              colorScheme={
                                member.completed
                                  ? 'green'
                                  : member.participated
                                  ? 'yellow'
                                  : 'gray'
                              }
                            >
                              <Icon
                                as={
                                  member.completed
                                    ? CheckCircle
                                    : member.participated
                                    ? Zap
                                    : Clock
                                }
                                boxSize={3.5}
                                mr={1.5}
                              />
                              {member.completed
                                ? `${member.score} ${t('pts')}`
                                : member.participated
                                ? t('Playing')
                                : t('Waiting')}
                            </Badge>
                          </Flex>
                        ))}
                      </VStack>
                    ) : (
                      <Text
                        fontSize="sm"
                        color="gray.400"
                        textAlign="center"
                        py={4}
                      >
                        {t('No members in this team.')}
                      </Text>
                    )}
                  </PopoverBody>
                </PopoverContent>
              </Portal>
            </Popover>
          </VStack>
        </VStack>
      </MotionBox>
    )
  }

  // VS Section
  const VSSection = () => (
    <MotionFlex
      align="center"
      justifyContent="center"
      direction="column"
      px={vsSpacing}
      width={vsSectionEffectiveWidth}
      flex="0 0 auto"
      my={{ base: 'auto', md: 0 }}
      py={2}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{
        opacity: 1,
        scale: 1,
        transition: {
          type: 'spring',
          stiffness: 200,
          damping: 15,
          delay: 0.3,
        },
      }}
    >
      <VStack spacing={{ base: 1.5, md: 2.5 }}>
        <MotionBox
          animate={{
            textShadow: [
              '0 0 6px rgba(0, 210, 255, 0.5), 0 0 12px rgba(0, 210, 255, 0.3)',
              '0 0 8px rgba(124, 58, 237, 0.5), 0 0 16px rgba(124, 58, 237, 0.3)',
              '0 0 6px rgba(0, 210, 255, 0.5), 0 0 12px rgba(0, 210, 255, 0.3)',
            ],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <Text
            fontFamily="'Orbitron', sans-serif"
            fontSize={{ base: '2xl', md: '3xl', lg: '4xl' }}
            fontWeight="bold"
            bgGradient="linear(to-r, cyan.400, purple.500, cyan.400)"
            bgClip="text"
            letterSpacing="1.5px"
            lineHeight="1"
          >
            VS
          </Text>
        </MotionBox>

        <MotionBox
          animate={{
            rotate: [0, 5, 0, -5, 0],
            filter: [
              'drop-shadow(0 0 6px rgba(124, 58, 237, 0.6))',
              'drop-shadow(0 0 8px rgba(124, 58, 237, 0.8))',
              'drop-shadow(0 0 6px rgba(124, 58, 237, 0.6))',
            ],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Icon
            as={Swords}
            boxSize={{ base: 4, md: 6, lg: 8 }}
            color="purple.300"
          />
        </MotionBox>

        <HStack spacing={{ base: 1, md: 1.5 }} mt={{ base: 0.5, md: 1 }}>
          <Badge
            bgGradient="linear(to-br, blue.700, blue.500)"
            color="white"
            border="1px solid"
            borderColor="blue.300"
            boxShadow="0 0 8px rgba(0, 123, 255, 0.3), inset 0 0 4px rgba(0, 123, 255, 0.2)"
            px={{ base: 1.5, md: 2 }}
            py={{ base: 0.5, md: 1 }}
            borderRadius="md"
            fontSize={{ base: 'sm', md: 'md' }}
            fontFamily="'Aldrich', sans-serif"
            fontWeight="bold"
            minW="30px"
            textAlign="center"
          >
            {leftTeam.wins}
          </Badge>
          <Text
            color="whiteAlpha.700"
            fontSize={{ base: 'md', md: 'lg' }}
            fontWeight="bold"
            fontFamily="'Orbitron', sans-serif"
          >
            :
          </Text>
          <Badge
            bgGradient="linear(to-br, red.700, red.500)"
            color="white"
            border="1px solid"
            borderColor="red.300"
            boxShadow="0 0 8px rgba(255, 0, 0, 0.3), inset 0 0 4px rgba(255, 0, 0, 0.2)"
            px={{ base: 1.5, md: 2 }}
            py={{ base: 0.5, md: 1 }}
            borderRadius="md"
            fontSize={{ base: 'sm', md: 'md' }}
            fontFamily="'Aldrich', sans-serif"
            fontWeight="bold"
            minW="30px"
            textAlign="center"
          >
            {rightTeam.wins}
          </Badge>
        </HStack>
      </VStack>
    </MotionFlex>
  )

  return (
    <Box mx={containerPadding} mb={{ base: 4, md: 6 }} px={{ base: 1, md: 0 }}>
      <MotionFlex
        direction="row"
        align="stretch"
        justify="space-between"
        gap={gapValue}
        width="100%"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <VStack
          spacing={0}
          align="stretch"
          flexGrow={1}
          flexShrink={1}
          flexBasis="0%"
          maxW={cardMaxWidth}
          minWidth="0"
        >
          <TeamCard
            team={leftTeam}
            isUserTeam={leftTeam.isUserTeam}
            position="left"
          />
        </VStack>

        <VSSection />

        <VStack
          spacing={0}
          align="stretch"
          flexGrow={1}
          flexShrink={1}
          flexBasis="0%"
          maxW={cardMaxWidth}
          minWidth="0"
          mr={'-0.65rem'}
        >
          <TeamCard
            team={rightTeam}
            isUserTeam={rightTeam.isUserTeam}
            position="right"
          />
        </VStack>
      </MotionFlex>
    </Box>
  )
}

export default TeamsGrid
