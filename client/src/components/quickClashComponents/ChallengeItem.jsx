// components/quickClashComponents/ChallengeItem.jsx
import React, { useMemo } from 'react'
import {
  Box,
  VStack,
  Text,
  Tag,
  HStack,
  Button,
  Flex,
  Icon,
  Badge,
  Center,
  Tooltip,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  Shield,
  Award,
  Target,
  Check,
  X,
  PlayCircle,
  FileText,
  Flame,
  Sword,
} from 'lucide-react'

// Import UI components
import StatusBadge from './ui/StatusBadge'
import PlayerStatus from './ui/PlayerStatus'
import ResultBanner from './ui/ResultBanner'
import VSLine from './VSLine'
// Import the enhanced trophy displays
import EnhancedPotentialTrophyDisplay from './ui/EnhancedPotentialTrophyDisplay'

const MotionBox = motion(Box)
const MotionButton = motion(Button)

// Define animation for button pulse
const pulseAnimation = `
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
`

/**
 * Renders a single challenge item card
 */
const ChallengeItem = ({
  challenge,
  userId,
  onAccept,
  onDecline,
  onStart,
  onViewReport,
  onRevenge,
  revengeLoading,
  index,
}) => {
  const { t } = useTranslation('QuickClash')
  const isChallenger = challenge?.challenger?._id === userId
  const opponent = isChallenger ? challenge?.opponent : challenge?.challenger

  const myAttempted = isChallenger
    ? challenge?.challengerAttempted
    : challenge?.opponentAttempted

  const bothAttempted =
    challenge?.challengerAttempted && challenge?.opponentAttempted

  const isExpired = new Date(challenge?.expiresAt) < new Date()
  const myScore = isChallenger
    ? challenge?.challengerScore
    : challenge?.opponentScore
  const hasCompleted = myScore > 0

  const isWinner =
    challenge?.status === 'completed' &&
    bothAttempted &&
    ((isChallenger && challenge?.challengerScore > challenge?.opponentScore) ||
      (!isChallenger && challenge?.opponentScore > challenge?.challengerScore))

  const isTie =
    challenge?.status === 'completed' &&
    bothAttempted &&
    challenge?.challengerScore === challenge?.opponentScore

  const isDefeat =
    challenge?.status === 'completed' && bothAttempted && !isWinner && !isTie

  // NEW: Memoize player data to ensure user is always on top
  const { userPlayer, opponentPlayer } = useMemo(() => {
    if (!challenge || !userId) {
      return { userPlayer: null, opponentPlayer: null }
    }

    const isUserTheChallenger = challenge.challenger._id === userId

    const uPlayer = isUserTheChallenger
      ? challenge.challenger
      : challenge.opponent
    const oPlayer = isUserTheChallenger
      ? challenge.opponent
      : challenge.challenger

    const uPlayerScore = isUserTheChallenger
      ? challenge.challengerScore
      : challenge.opponentScore
    const oPlayerScore = isUserTheChallenger
      ? challenge.opponentScore
      : challenge.challengerScore

    const uPlayerAttempted = isUserTheChallenger
      ? challenge.challengerAttempted
      : challenge.opponentAttempted
    const oPlayerAttempted = isUserTheChallenger
      ? challenge.opponentAttempted
      : challenge.challengerAttempted

    const uPlayerTrophies = uPlayer?.quickClashTrophies
    const oPlayerTrophies = oPlayer?.quickClashTrophies

    return {
      userPlayer: {
        player: uPlayer,
        score: uPlayerScore,
        attempted: uPlayerAttempted,
        trophies: uPlayerTrophies,
      },
      opponentPlayer: {
        player: oPlayer,
        score: oPlayerScore,
        attempted: oPlayerAttempted,
        trophies: oPlayerTrophies,
      },
    }
  }, [challenge, userId])

  // Challenge Item animation
  const animations = {
    hidden: { opacity: 0, y: 20, scale: 0.97 },
    visible: i => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        delay: i * 0.08,
        duration: 0.4,
        type: 'spring',
        stiffness: 150,
        damping: 15,
      },
    }),
    hover: {
      scale: 1.03,
      boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)',
      y: -3,
      transition: { duration: 0.2 },
    },
  }

  // Determine card background and styles based on status
  const cardStyles = useMemo(() => {
    let borderColorStyle = 'whiteAlpha.200'
    let boxShadowStyle = 'none'
    let borderWidthStyle = '1px'
    let gradientOverlay = 'none'

    if (challenge?.status === 'completed') {
      if (isWinner) {
        borderColorStyle = 'purple.400'
        boxShadowStyle = '0 0 15px rgba(124, 58, 237, 0.3)'
        gradientOverlay =
          'linear-gradient(135deg, rgba(124, 58, 237, 0.05), transparent)'
      } else if (isTie) {
        borderColorStyle = 'yellow.400'
        gradientOverlay =
          'linear-gradient(135deg, rgba(236, 201, 75, 0.05), transparent)'
      } else if (isDefeat) {
        borderColorStyle = 'red.400'
        boxShadowStyle = '0 0 15px rgba(245, 101, 101, 0.3)'
        gradientOverlay =
          'linear-gradient(135deg, rgba(245, 101, 101, 0.05), transparent)'
      }
    } else if (challenge?.status === 'active' && !myAttempted) {
      borderColorStyle = 'green.400'
      boxShadowStyle = '0 0 10px rgba(72, 187, 120, 0.3)'
      gradientOverlay =
        'linear-gradient(135deg, rgba(72, 187, 120, 0.05), transparent)'
    } else if (challenge?.status === 'pending') {
      // Use gold border for both 'New' and 'Awaiting' status
      borderColorStyle = 'yellow.400'
      boxShadowStyle = '0 0 10px rgba(236, 201, 75, 0.2)'
      gradientOverlay =
        'linear-gradient(135deg, rgba(236, 201, 75, 0.05), transparent)'
    }

    return {
      borderColor: borderColorStyle,
      boxShadow: boxShadowStyle,
      borderWidth: borderWidthStyle,
      gradientOverlay,
    }
  }, [challenge?.status, isWinner, isTie, isDefeat, myAttempted])

  // Determine category badge style
  const getCategoryStyle = () => {
    const categoryColors = {
      World: 'blue',
      Politics: 'red',
      Business: 'green',
      Technology: 'cyan',
      Sports: 'orange',
      Health: 'teal',
      Science: 'purple',
      Environment: 'green',
    }

    return categoryColors[challenge?.category] || 'purple'
  }

  const getTrophyPotential = () => {
    // For active or pending challenges, return potential gain
    if (challenge?.status === 'active' || challenge?.status === 'pending') {
      if (!challenge?.trophyPotential) return 0

      return isChallenger
        ? challenge?.trophyPotential.challenger?.potentialGain
        : challenge?.trophyPotential.opponent.potentialGain
    }

    return 0
  }

  // Get trophy change
  const getTrophyChange = () => {
    if (!challenge?.trophyUpdates) return undefined

    const trophyChange = isChallenger
      ? challenge?.trophyUpdates.challenger?.change
      : challenge?.trophyUpdates.opponent.change

    return trophyChange
  }

  // Determine if we should show player status section
  const showPlayerStatus =
    challenge?.status !== 'pending' && challenge?.status !== 'rejected'

  // Create a category tag that can be reused
  const CategoryTag = () => (
    <Tag size="sm" colorScheme={getCategoryStyle()} borderRadius="full" px={3}>
      <Icon as={Target} size={12} mr={1} />
      {challenge?.category}
    </Tag>
  )

  return (
    <MotionBox
      initial="hidden"
      animate="visible"
      custom={index}
      variants={animations}
      whileHover="hover"
      position="relative"
    >
      <Box
        bg="rgba(26, 32, 44, 0.8)"
        borderRadius="lg"
        overflow="hidden"
        borderWidth={cardStyles.borderWidth}
        borderColor={cardStyles.borderColor}
        boxShadow={cardStyles.boxShadow}
        transition="all 0.3s"
        position="relative"
        _before={{
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: cardStyles.gradientOverlay,
          opacity: 0.7,
          pointerEvents: 'none',
          borderRadius: 'lg',
        }}
      >
        {/* Card Header - Show status badge and category for active/pending */}
        {challenge?.status !== 'completed' && (
          <Flex
            p={3}
            justify="space-between"
            align="center"
            borderBottomWidth="1px"
            borderBottomColor="whiteAlpha.100"
            bg="rgba(45, 55, 72, 0.3)"
          >
            <StatusBadge
              status={challenge?.status}
              isChallenger={isChallenger}
              expiresAt={challenge?.expiresAt}
            />
          </Flex>
        )}

        {/* Card Body */}
        <Box p={3}>
          {/* For pending/new challenges, show opponent and category in body */}
          {(challenge?.status === 'pending' ||
            (challenge?.status === 'active' && !showPlayerStatus)) && (
            <HStack mb={3} justify="space-between">
              <HStack spacing={2}>
                <Icon
                  as={isChallenger ? Shield : Award}
                  color={isChallenger ? 'blue.400' : 'purple.400'}
                  boxSize={5}
                />
                <Text fontSize="sm" color="whiteAlpha.800">
                  {isChallenger ? t('vs') : t('from')}{' '}
                  <Text as="span" fontWeight="bold" color="white">
                    {opponent.inGameName || opponent.name}
                  </Text>
                </Text>
              </HStack>

              <HStack spacing={2}>
                {/* Show potential trophy gain with enhanced component */}
                {challenge?.trophyPotential && (
                  <EnhancedPotentialTrophyDisplay
                    potentialGain={getTrophyPotential()}
                    size="sm"
                    compact={true}
                  />
                )}
                <CategoryTag />
              </HStack>
            </HStack>
          )}

          {/* Player Status Section for active or completed challenges */}
          {showPlayerStatus && userPlayer && opponentPlayer && (
            <>
              <VStack spacing={2} align="stretch" mb={2}>
                <PlayerStatus
                  player={userPlayer.player}
                  score={userPlayer.score}
                  attempted={userPlayer.attempted}
                  isUser={true}
                  trophies={userPlayer.trophies}
                  isChallengeOver={bothAttempted}
                />

                {/* VS Line with Trophy Change Display */}
                <VSLine
                  trophyChange={getTrophyChange()}
                  category={
                    challenge?.status === 'active' ? challenge?.category : null
                  }
                  categoryColorScheme={getCategoryStyle()}
                  isActiveChallenge={challenge?.status === 'active'}
                  myAttempted={myAttempted}
                />

                <PlayerStatus
                  player={opponentPlayer.player}
                  score={opponentPlayer.score}
                  attempted={opponentPlayer.attempted}
                  isUser={false}
                  trophies={opponentPlayer.trophies}
                  isChallengeOver={bothAttempted}
                />
              </VStack>
            </>
          )}

          {/* Actions */}
          {!isExpired && (
            <Flex
              justify="center"
              mt={3}
              p={2}
              bg="whiteAlpha.50"
              borderRadius="md"
            >
              {myAttempted ? (
                <Button
                  size="sm"
                  colorScheme="purple"
                  variant="outline"
                  leftIcon={<FileText size={14} />}
                  onClick={() => onViewReport(challenge)}
                  as={motion.button}
                  whileTap={{ scale: 0.95 }}
                  fontWeight="medium"
                  _hover={{
                    bg: 'purple.700',
                    borderColor: 'purple.400',
                  }}
                >
                  {t('View Report')}
                </Button>
              ) : challenge?.status === 'pending' && !isChallenger ? (
                <HStack spacing={3}>
                  <Button
                    size="sm"
                    colorScheme="green"
                    onClick={() => onAccept(challenge?._id)}
                    leftIcon={<Check size={14} />}
                    as={motion.button}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.95 }}
                    fontWeight="medium"
                    boxShadow="0 0 8px rgba(72, 187, 120, 0.4)"
                    _hover={{
                      boxShadow: '0 0 12px rgba(72, 187, 120, 0.6)',
                    }}
                  >
                    {t('Accept')}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    colorScheme="red"
                    onClick={() => onDecline(challenge?._id)}
                    leftIcon={<X size={14} />}
                    as={motion.button}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.95 }}
                    fontWeight="medium"
                  >
                    {t('Decline')}
                  </Button>
                </HStack>
              ) : challenge?.status === 'active' && !myAttempted ? (
                <Flex align="center" gap={2}>
                  {/* Show potential trophy gain with enhanced component */}
                  <EnhancedPotentialTrophyDisplay
                    potentialGain={getTrophyPotential()}
                    size="sm"
                    compact={true}
                  />

                  <Button
                    size="sm"
                    colorScheme="green"
                    onClick={() => onStart(challenge?._id)}
                    leftIcon={<PlayCircle size={14} />}
                    as={motion.button}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    fontWeight="bold"
                    px={6}
                    boxShadow="0 0 10px rgba(72, 187, 120, 0.4)"
                    _hover={{
                      boxShadow: '0 0 15px rgba(72, 187, 120, 0.7)',
                    }}
                    animation="pulse 2s infinite ease-in-out"
                    css={pulseAnimation}
                  >
                    {t('Start')}
                  </Button>
                </Flex>
              ) : null}
            </Flex>
          )}
        </Box>

        {/* Result Banner - Without trophy display */}
        {challenge?.status === 'completed' && bothAttempted && (
          <ResultBanner
            isWinner={isWinner}
            isTie={isTie}
            isDefeat={isDefeat}
            expiresAt={challenge?.expiresAt}
            category={challenge?.category}
            onRevenge={isDefeat ? () => onRevenge(opponent, challenge) : null}
            revengeStatus={challenge?.revengeStatus}
            revengeLoading={revengeLoading}
            protectionApplied={
              isDefeat &&
              challenge?.trophyUpdates?.protectionApplied &&
              (isChallenger
                ? challenge?.trophyUpdates.protectionApplied.challenger
                : challenge?.trophyUpdates.protectionApplied.opponent)
            }
            protectionType={
              isDefeat &&
              challenge?.trophyUpdates?.protectionApplied &&
              (isChallenger
                ? challenge?.trophyUpdates.protectionApplied.challenger_type
                : challenge?.trophyUpdates.protectionApplied.opponent_type)
            }
          />
        )}
      </Box>
    </MotionBox>
  )
}

export default ChallengeItem
