// components/quickClashComponents/team/battleAnalysis/components/CategoryBreakdownSection.jsx
import React, { useEffect } from 'react'
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
  useBreakpointValue,
  Collapse,
  Avatar,
} from '@chakra-ui/react'
import { motion, useAnimationControls } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
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

  const columns = useBreakpointValue({ base: 1, md: 2, lg: 3 }) // More columns on large screens
  const padding = useBreakpointValue({ base: 4, md: 6 })
  const headerIconSize = useBreakpointValue({ base: 5, md: 6 })
  const cardIconSize = useBreakpointValue({ base: 4, md: 5 })
  const headingSize = useBreakpointValue({ base: 'md', md: 'lg' })
  const categoryNameFontSize = useBreakpointValue({ base: 'sm', md: 'md' })

  useEffect(() => {
    controls.start({
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    })
  }, [controls, isExpanded]) // Re-animate slightly if needed, or just control initial

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
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 + index * 0.08, duration: 0.4 }}
        whileHover={{ y: -3, boxShadow: '0 10px 20px rgba(0,0,0,0.2)' }}
      >
        <Box
          bg={
            isUserCategory
              ? 'rgba(128, 90, 213, 0.1)'
              : 'rgba(255, 255, 255, 0.03)'
          }
          borderRadius="xl" // More rounded
          p={4}
          borderWidth="1px"
          borderColor={isUserCategory ? 'purple.500' : 'whiteAlpha.200'}
          transition="all 0.2s ease-out"
          h="full" // Ensure cards have same height in a row if needed
          display="flex"
          flexDirection="column"
          justifyContent="space-between"
        >
          <VStack spacing={3} align="stretch" flexGrow={1}>
            <Flex justify="space-between" align="center">
              <HStack spacing={2}>
                <Icon as={BookOpen} color="purple.300" boxSize={cardIconSize} />
                <Text
                  fontWeight="bold"
                  color="white"
                  fontSize={categoryNameFontSize}
                  noOfLines={1}
                >
                  {challenge.category}
                </Text>
              </HStack>
              <Badge
                colorScheme={badgeColorScheme}
                variant="subtle"
                fontSize="xs"
                px={2}
                py={0.5}
                borderRadius="md"
              >
                <HStack spacing={1}>
                  <Icon as={WinnerIcon} boxSize={3} />
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
              <HStack spacing={1.5} justifySelf="start">
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
              <HStack spacing={1.5} justifySelf="end">
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
              pt={2}
              borderTop="1px dashed"
              borderColor="whiteAlpha.100"
            >
              <HStack spacing={1}>
                <Icon
                  as={challenge.teamACompleted ? CheckCircle : XCircle}
                  color={challenge.teamACompleted ? 'green.400' : 'red.400'}
                  boxSize={3.5}
                />
                <Text fontSize="xs" color="whiteAlpha.700" noOfLines={1}>
                  {battle.teamA?.name || t('Team A')}
                </Text>
              </HStack>
              <HStack spacing={1}>
                <Icon
                  as={challenge.teamBCompleted ? CheckCircle : XCircle}
                  color={challenge.teamBCompleted ? 'green.400' : 'red.400'}
                  boxSize={3.5}
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
      bg="rgba(20, 15, 35, 0.7)" // Darker, purplish base
      backdropFilter="blur(15px)"
      borderRadius="2xl" // Consistent rounding
      boxShadow="0 8px 30px rgba(0, 0, 0, 0.25)"
      overflow="hidden"
      borderWidth="1px"
      borderColor="rgba(255, 255, 255, 0.1)"
      initial={{ opacity: 0, y: 20 }}
      animate={controls}
    >
      <Flex
        bg="transparent" // Let MotionBox handle background
        px={padding}
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
          <Icon as={BookOpen} color="purple.300" boxSize={headerIconSize} />
          <Heading size={headingSize} color="white" fontWeight="semibold">
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
        px={padding}
        py={isExpanded ? 3 : 4} // Adjust padding when collapsed
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
        <HStack spacing={3} wrap="wrap">
          <Badge
            colorScheme="green"
            variant="subtle"
            px={2}
            py={1}
            borderRadius="md"
          >
            {battle.teamAWins} {t('Team A')}
          </Badge>
          <Badge
            colorScheme="red"
            variant="subtle"
            px={2}
            py={1}
            borderRadius="md"
          >
            {battle.teamBWins} {t('Team B')}
          </Badge>
          {battle.ties > 0 && (
            <Badge
              colorScheme="yellow"
              variant="subtle"
              px={2}
              py={1}
              borderRadius="md"
            >
              {battle.ties} {t('Ties')}
            </Badge>
          )}
        </HStack>
      </Flex>

      <Collapse in={isExpanded} animateOpacity>
        <Box px={padding} py={4}>
          <Grid templateColumns={`repeat(${columns}, 1fr)`} gap={4}>
            {battle.challenges.map((challenge, index) => (
              <GridItem key={challenge._id || index} colSpan={1}>
                {renderCategoryCard(challenge, index)}
              </GridItem>
            ))}
          </Grid>
          <Text fontSize="xs" color="whiteAlpha.600" mt={6} textAlign="center">
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
