// components/quickClashComponents/team/battleAnalysis/components/CategoryBreakdownSection.jsx
import React, { useEffect, useMemo } from 'react'
import {
  Box,
  Flex,
  Text,
  Heading,
  Icon,
  Badge,
  HStack,
  VStack,
  Grid,
  GridItem,
  Collapse,
  Avatar,
} from '@chakra-ui/react'
import { motion, useAnimationControls } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  BookOpen,
  ChevronDown,
  Trophy,
  Clock,
  CheckCircle,
  XCircle,
  Star,
  Flag,
  ShieldHalf, // For tie
} from 'lucide-react'

const MotionBox = motion(Box)

const CategoryBreakdownSection = ({
  battle,
  userTeam,
  userMemberData,
  isExpanded,
  onToggle,
}) => {
  const { t } = useTranslation('QuickClash')
  const controls = useAnimationControls()

  // Memoized responsive configuration - static values for performance
  const config = useMemo(
    () => ({
      isMobile: window.innerWidth < 768,
      columns: window.innerWidth < 768 ? 1 : window.innerWidth < 1024 ? 2 : 3,
      padding: { base: 3, md: 5 }, // Reduced padding
      headerIconSize: { base: 5, md: 6 },
      cardIconSize: { base: 4, md: 5 },
      headingSize: { base: 'md', md: 'lg' },
      categoryNameFontSize: { base: 'sm', md: 'md' },
    }),
    [],
  )

  useEffect(() => {
    controls.start({
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: 'easeOut' }, // Reduced duration
    })
  }, [controls, isExpanded])

  const getCategoryWinnerStyle = challenge => {
    let winnerTeam = null
    if (challenge.winner === 'teamA') winnerTeam = 'teamA'
    if (challenge.winner === 'teamB') winnerTeam = 'teamB'

    if (challenge.winner === 'tie')
      return {
        color: 'yellow.400',
        icon: ShieldHalf,
        text: t('Tie'),
        badgeColorScheme: 'yellow',
      }
    if (winnerTeam && winnerTeam === userTeam)
      return {
        color: 'green.400',
        icon: Trophy,
        text: t('Won'),
        badgeColorScheme: 'green',
      }
    if (winnerTeam && winnerTeam !== userTeam)
      return {
        color: 'red.400',
        icon: Flag,
        text: t('Lost'),
        badgeColorScheme: 'red',
      }

    // Default for pending or unknown
    return {
      color: 'gray.400',
      icon: Clock,
      text: t('Pending'),
      badgeColorScheme: 'gray',
    }
  }

  const getCategoryPlayers = challenge => {
    if (!challenge) return { teamA: null, teamB: null }
    const teamAPlayer = battle.teamAMembers.find(
      m => m.user._id === challenge.teamAPlayer,
    )
    const teamBPlayer = battle.teamBMembers.find(
      m => m.user._id === challenge.teamBPlayer,
    )
    return { teamAPlayer, teamBPlayer }
  }

  const renderCategoryCard = (challenge, index) => {
    if (!challenge || !challenge.challenge) return null

    const {
      color,
      icon: WinnerIcon,
      text: winnerText,
      badgeColorScheme,
    } = getCategoryWinnerStyle(challenge)
    const { teamAPlayer, teamBPlayer } = getCategoryPlayers(challenge)
    const isUserCategory =
      userMemberData && userMemberData.challenge === challenge.challenge._id

    return (
      <MotionBox
        initial={{ opacity: 0, y: 10 }} // Reduced movement
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 + index * 0.05, duration: 0.3 }} // Faster
        whileHover={
          config.isMobile
            ? {}
            : { y: -2, boxShadow: '0 8px 15px rgba(0,0,0,0.15)' }
        } // Reduced hover effect
      >
        <Box
          bg={
            isUserCategory
              ? 'rgba(128, 90, 213, 0.08)' // Reduced opacity
              : 'rgba(255, 255, 255, 0.02)' // Reduced opacity
          }
          borderRadius="xl"
          p={3} // Reduced padding
          borderWidth="1px"
          borderColor={isUserCategory ? 'purple.500' : 'whiteAlpha.200'}
          transition="all 0.2s ease-out"
          h="full"
          display="flex"
          flexDirection="column"
          justifyContent="space-between"
        >
          <VStack spacing={2.5} align="stretch" flexGrow={1}>
            {' '}
            {/* Reduced spacing */}
            <Flex justify="space-between" align="center">
              <HStack spacing={2}>
                <Icon
                  as={BookOpen}
                  color="purple.300"
                  boxSize={config.cardIconSize}
                />
                <Text
                  fontWeight="bold"
                  color="white"
                  fontSize={config.categoryNameFontSize}
                  noOfLines={1}
                >
                  {challenge.category}
                </Text>
              </HStack>
              <Badge
                colorScheme={badgeColorScheme}
                variant="subtle"
                fontSize="xs"
                px={1.5} // Reduced padding
                py={0.5}
                borderRadius="md"
              >
                <HStack spacing={0.5}>
                  {' '}
                  {/* Reduced spacing */}
                  <Icon as={WinnerIcon} boxSize={2.5} /> {/* Reduced size */}
                  <Text>{winnerText}</Text>
                </HStack>
              </Badge>
            </Flex>
            {isUserCategory && (
              <Badge
                colorScheme="purple"
                variant="outline"
                fontSize="2xs"
                alignSelf="flex-start"
                px={1.5}
                py={0.5}
              >
                {t('Your Category')}
              </Badge>
            )}
            <Grid templateColumns="1fr auto 1fr" gap={2} alignItems="center">
              <HStack spacing={1} justifySelf="start">
                {' '}
                {/* Reduced spacing */}
                <Avatar
                  size="xs"
                  name={
                    teamAPlayer?.user?.name ||
                    teamAPlayer?.user?.inGameName ||
                    '?'
                  }
                  src={teamAPlayer?.user?.pic}
                  bg={teamAPlayer ? 'blue.600' : 'gray.600'}
                  borderColor="blue.400"
                  borderWidth={userTeam === 'teamA' ? '2px' : '0px'}
                />
                <Text color="white" fontSize="sm" fontWeight="medium">
                  {challenge.teamAScore} {t('pts')}
                </Text>
              </HStack>
              <Text color="whiteAlpha.500" fontSize="xs" fontWeight="bold">
                VS
              </Text>
              <HStack spacing={1} justifySelf="end">
                {' '}
                {/* Reduced spacing */}
                <Text color="white" fontSize="sm" fontWeight="medium">
                  {challenge.teamBScore} {t('pts')}
                </Text>
                <Avatar
                  size="xs"
                  name={
                    teamBPlayer?.user?.name ||
                    teamBPlayer?.user?.inGameName ||
                    '?'
                  }
                  src={teamBPlayer?.user?.pic}
                  bg={teamBPlayer ? 'red.600' : 'gray.600'}
                  borderColor="red.400"
                  borderWidth={userTeam === 'teamB' ? '2px' : '0px'}
                />
              </HStack>
            </Grid>
            <HStack
              justify="space-between"
              spacing={2}
              pt={1.5} // Reduced padding
              borderTop="1px dashed"
              borderColor="whiteAlpha.100"
            >
              <HStack spacing={1}>
                <Icon
                  as={challenge.teamACompleted ? CheckCircle : XCircle}
                  color={challenge.teamACompleted ? 'green.400' : 'red.400'}
                  boxSize={3}
                />
                <Text fontSize="xs" color="whiteAlpha.700" noOfLines={1}>
                  {battle.teamA?.name || t('Team A')}
                </Text>
              </HStack>
              <HStack spacing={1}>
                <Icon
                  as={challenge.teamBCompleted ? CheckCircle : XCircle}
                  color={challenge.teamBCompleted ? 'green.400' : 'red.400'}
                  boxSize={3}
                />
                <Text fontSize="xs" color="whiteAlpha.700" noOfLines={1}>
                  {battle.teamB?.name || t('Team B')}
                </Text>
              </HStack>
            </HStack>
          </VStack>
        </Box>
      </MotionBox>
    )
  }

  return (
    <MotionBox
      bg="rgba(20, 15, 35, 0.7)"
      backdropFilter={config.isMobile ? 'none' : 'blur(10px)'} // No blur on mobile
      borderRadius="2xl"
      boxShadow={
        config.isMobile
          ? '0 6px 20px rgba(0, 0, 0, 0.2)'
          : '0 8px 25px rgba(0, 0, 0, 0.25)' // Reduced shadow
      }
      overflow="hidden"
      borderWidth="1px"
      borderColor="rgba(255, 255, 255, 0.1)"
      initial={{ opacity: 0, y: 15 }} // Reduced movement
      animate={controls}
    >
      <Flex
        bg="transparent"
        px={config.padding}
        py={4}
        justify="space-between"
        align="center"
        cursor="pointer"
        onClick={onToggle}
        borderBottom="1px solid"
        borderColor="rgba(255,255,255,0.08)"
        _hover={{ bg: 'rgba(255, 255, 255, 0.03)' }}
      >
        <HStack spacing={3}>
          <Icon
            as={BookOpen}
            color="purple.300"
            boxSize={config.headerIconSize}
          />
          <Heading
            size={config.headingSize}
            color="white"
            fontWeight="semibold"
          >
            {t('Category Breakdown')}
          </Heading>
        </HStack>
        <MotionBox
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <Icon as={ChevronDown} color="whiteAlpha.700" boxSize={5} />
        </MotionBox>
      </Flex>

      <Flex
        px={config.padding}
        py={isExpanded ? 3 : 4}
        direction={{ base: 'column', md: 'row' }}
        justify="space-between"
        align={{ base: 'flex-start', md: 'center' }}
        gap={{ base: 3, md: 4 }}
        borderBottomWidth={isExpanded ? '1px' : '0'}
        borderColor="rgba(255,255,255,0.08)"
        transition="padding 0.3s ease-out"
      >
        <HStack spacing={3}>
          <Icon as={BookOpen} color="purple.300" boxSize={4} />
          <Text color="white" fontSize="sm">
            {battle.challenges.length} {t('Categories Played')}
          </Text>
        </HStack>
        <HStack spacing={2} wrap="wrap">
          {' '}
          {/* Reduced spacing */}
          <Badge
            colorScheme="green"
            variant="subtle"
            px={1.5} // Reduced padding
            py={1}
            borderRadius="md"
          >
            {battle.teamAWins} {t('Team A')}
          </Badge>
          <Badge
            colorScheme="red"
            variant="subtle"
            px={1.5} // Reduced padding
            py={1}
            borderRadius="md"
          >
            {battle.teamBWins} {t('Team B')}
          </Badge>
          {battle.ties > 0 && (
            <Badge
              colorScheme="yellow"
              variant="subtle"
              px={1.5} // Reduced padding
              py={1}
              borderRadius="md"
            >
              {battle.ties} {t('Ties')}
            </Badge>
          )}
        </HStack>
      </Flex>

      <Collapse in={isExpanded} animateOpacity>
        <Box px={config.padding} py={3}>
          {' '}
          {/* Reduced padding */}
          <Grid templateColumns={`repeat(${config.columns}, 1fr)`} gap={3}>
            {' '}
            {/* Reduced gap */}
            {battle.challenges.map((challenge, index) => (
              <GridItem key={challenge._id || index} colSpan={1}>
                {renderCategoryCard(challenge, index)}
              </GridItem>
            ))}
          </Grid>
          <Text fontSize="xs" color="whiteAlpha.600" mt={4} textAlign="center">
            {' '}
            {/* Reduced margin */}
            {t(
              'Each card represents a category matchup. Highlighted card (if any) is your assigned category.',
            )}
          </Text>
        </Box>
      </Collapse>
    </MotionBox>
  )
}

export default CategoryBreakdownSection
