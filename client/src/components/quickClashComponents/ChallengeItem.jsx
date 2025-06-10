// components/quickClashComponents/ChallengeItem.jsx
import React, { useState, useMemo, useCallback, useEffect, memo } from 'react'
import {
  Box,
  VStack,
  Text,
  Tag,
  HStack,
  Button,
  Flex,
  Icon,
  useBreakpointValue,
  Skeleton,
} from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { Target, Check, X, PlayCircle, FileText } from 'lucide-react'

// Import UI components - keep original imports
import StatusBadge from './ui/StatusBadge'
import PlayerStatus from './ui/PlayerStatus'
import VSLine from './VSLine'
import EnhancedPotentialTrophyDisplay from './ui/EnhancedPotentialTrophyDisplay'

/**
 * Optimized ChallengeItem - maintains exact original design with performance improvements
 * This is a simplified version of FlippableChallengeItem without the flip functionality
 * Used for non-completed challenges and challenges where not both players have attempted
 */
const ChallengeItem = memo(
  ({
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
    const [showTrophyAnimation, setShowTrophyAnimation] = useState(false)

    // Keep original responsive styling exactly
    const fontSize = useBreakpointValue({ base: 'xs', md: 'sm' })
    const iconSize = useBreakpointValue({ base: 3, md: 4 })
    const buttonSize = useBreakpointValue({ base: 'xs', md: 'sm' })
    const padding = useBreakpointValue({ base: 2, md: 3 })
    const spacing = useBreakpointValue({ base: 1, md: 2 })

    // Memoize basic challenge properties - keep original logic exactly
    const {
      isChallenger,
      opponent,
      myAttempted,
      isExpired,
      myScore,
      isWinner,
      isTie,
      isDefeat,
      showPlayerStatus,
    } = useMemo(() => {
      if (!challenge || !userId) {
        return {
          isChallenger: false,
          opponent: null,
          myAttempted: false,
          isExpired: false,
          myScore: 0,
          isWinner: false,
          isTie: false,
          isDefeat: false,
          showPlayerStatus: false,
        }
      }

      const isChallenger = challenge.challenger._id === userId
      const opponent = isChallenger ? challenge.opponent : challenge.challenger
      const myAttempted = isChallenger
        ? challenge.challengerAttempted
        : challenge.opponentAttempted
      const isExpired = new Date(challenge.expiresAt) < new Date()
      const myScore = isChallenger
        ? challenge.challengerScore
        : challenge.opponentScore

      const isWinner =
        challenge.status === 'completed' &&
        ((isChallenger &&
          challenge.challengerScore > challenge.opponentScore) ||
          (!isChallenger &&
            challenge.opponentScore > challenge.challengerScore))

      const isTie =
        challenge.status === 'completed' &&
        challenge.challengerScore === challenge.opponentScore

      const isDefeat = challenge.status === 'completed' && !isWinner && !isTie

      // Determine if we should show player status section
      const showPlayerStatus =
        challenge.status !== 'pending' && challenge.status !== 'rejected'

      return {
        isChallenger,
        opponent,
        myAttempted,
        isExpired,
        myScore,
        isWinner,
        isTie,
        isDefeat,
        showPlayerStatus,
      }
    }, [challenge, userId])

    // Memoize player data - keep original logic exactly
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

    // Keep original trophy animation effect
    useEffect(() => {
      if (challenge?.trophyUpdates && (isWinner || isDefeat || isTie)) {
        const timer = setTimeout(() => {
          setShowTrophyAnimation(true)
        }, 500)

        return () => clearTimeout(timer)
      }
    }, [challenge?.trophyUpdates, isWinner, isDefeat, isTie])

    // Keep original trophy change calculation
    const getTrophyChange = useCallback(() => {
      if (!challenge?.trophyUpdates) return undefined

      const userChange = isChallenger
        ? challenge.trophyUpdates.challenger?.change
        : challenge.trophyUpdates.opponent?.change

      return userChange
    }, [challenge, isChallenger])

    // Keep original potential trophy calculation
    const getTrophyPotential = useCallback(() => {
      if (!challenge) return 0

      if (challenge.status === 'active' || challenge.status === 'pending') {
        if (!challenge.trophyPotential) return 0

        return isChallenger
          ? challenge.trophyPotential.challenger?.potentialGain
          : challenge.trophyPotential.opponent?.potentialGain
      }

      return 0
    }, [challenge, isChallenger])

    // Keep original card styling logic exactly
    const cardStyles = useMemo(() => {
      if (!challenge)
        return {
          borderColor: 'whiteAlpha.200',
          boxShadow: 'none',
          gradientOverlay: 'none',
        }

      let borderColorStyle = 'whiteAlpha.200'
      let boxShadowStyle = 'none'
      let gradientOverlay = 'none'

      if (challenge.status === 'completed') {
        if (isWinner) {
          borderColorStyle = 'purple.400'
          boxShadowStyle = '0 0 10px rgba(124, 58, 237, 0.2)'
          gradientOverlay =
            'linear-gradient(135deg, rgba(124, 58, 237, 0.03), transparent)'
        } else if (isTie) {
          borderColorStyle = 'yellow.400'
          gradientOverlay =
            'linear-gradient(135deg, rgba(236, 201, 75, 0.03), transparent)'
        } else if (isDefeat) {
          borderColorStyle = 'red.400'
          boxShadowStyle = '0 0 10px rgba(245, 101, 101, 0.2)'
          gradientOverlay =
            'linear-gradient(135deg, rgba(245, 101, 101, 0.03), transparent)'
        }
      } else if (challenge.status === 'active' && !myAttempted) {
        borderColorStyle = 'green.400'
        boxShadowStyle = '0 0 8px rgba(72, 187, 120, 0.2)'
        gradientOverlay =
          'linear-gradient(135deg, rgba(72, 187, 120, 0.03), transparent)'
      } else if (challenge.status === 'pending') {
        borderColorStyle = 'yellow.400'
        boxShadowStyle = '0 0 8px rgba(236, 201, 75, 0.15)'
        gradientOverlay =
          'linear-gradient(135deg, rgba(236, 201, 75, 0.03), transparent)'
      }

      return {
        borderColor: borderColorStyle,
        boxShadow: boxShadowStyle,
        gradientOverlay,
      }
    }, [challenge, isWinner, isTie, isDefeat, myAttempted])

    // Keep original category style calculation
    const getCategoryStyle = useCallback(() => {
      if (!challenge) return 'purple'

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

      return categoryColors[challenge.category] || 'purple'
    }, [challenge])

    // Optimized event handlers with useCallback
    const handleAccept = useCallback(() => {
      onAccept(challenge._id)
    }, [onAccept, challenge])

    const handleDecline = useCallback(() => {
      onDecline(challenge._id)
    }, [onDecline, challenge])

    const handleStart = useCallback(() => {
      onStart(challenge._id)
    }, [onStart, challenge])

    const handleViewReport = useCallback(() => {
      onViewReport(challenge)
    }, [onViewReport, challenge])

    // Keep original skeleton fallback
    if (!challenge) {
      return (
        <Box
          borderRadius="lg"
          borderWidth="1px"
          borderColor="whiteAlpha.200"
          overflow="hidden"
          bg="rgba(26, 32, 44, 0.5)"
        >
          <Flex
            p={padding}
            justify="space-between"
            align="center"
            borderBottom="1px solid"
            borderColor="whiteAlpha.100"
          >
            <Skeleton height="20px" width="100px" borderRadius="md" />
            <Skeleton height="24px" width="24px" borderRadius="full" />
          </Flex>

          <Box p={padding}>
            <VStack spacing={2} align="stretch">
              <Skeleton height="24px" width="100%" borderRadius="md" mb={1} />
              <Skeleton height="18px" width="80%" borderRadius="md" />
              <Skeleton height="10px" width="100%" borderRadius="md" my={2} />
              <Skeleton height="24px" width="100%" borderRadius="md" mb={1} />
              <Skeleton height="18px" width="80%" borderRadius="md" />
            </VStack>

            <Flex justify="center" mt={4}>
              <Skeleton height="32px" width="180px" borderRadius="md" />
            </Flex>
          </Box>
        </Box>
      )
    }

    return (
      <Box
        className="challenge-item"
        data-testid="challenge-item"
        bg="rgba(26, 32, 44, 0.8)"
        borderRadius="lg"
        overflow="hidden"
        borderWidth="1px"
        borderColor={cardStyles.borderColor}
        boxShadow={cardStyles.boxShadow}
        position="relative"
        height="100%"
        transition="all 0.2s"
        _hover={{
          transform: 'translateY(-2px)',
          boxShadow: '0 6px 12px rgba(0, 0, 0, 0.1)',
        }}
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
        {/* Card Header - Keep original logic exactly */}
        {challenge.status !== 'completed' && (
          <Flex
            p={padding}
            justify="space-between"
            align="center"
            borderBottomWidth="1px"
            borderBottomColor="whiteAlpha.100"
            bg="rgba(45, 55, 72, 0.3)"
          >
            <StatusBadge
              status={challenge.status}
              isChallenger={isChallenger}
              expiresAt={challenge.expiresAt}
            />
          </Flex>
        )}

        {/* Card Body - Keep original structure exactly */}
        <Box p={padding}>
          {/* Player Status Section - Keep original exactly */}
          {showPlayerStatus && userPlayer && opponentPlayer && (
            <VStack spacing={spacing} align="stretch" mb={2}>
              <PlayerStatus
                player={
                  isChallenger ? challenge.challenger : challenge.opponent
                }
                score={
                  isChallenger
                    ? challenge.challengerScore
                    : challenge.opponentScore
                }
                attempted={
                  isChallenger
                    ? challenge.challengerAttempted
                    : challenge.opponentAttempted
                }
                isUser={true}
                trophies={
                  isChallenger
                    ? challenge.challenger.quickClashTrophies
                    : challenge.opponent.quickClashTrophies
                }
                trophyChange={getTrophyChange()}
                showTrophyAnimation={showTrophyAnimation}
                protectionApplied={
                  challenge.trophyUpdates?.protectionApplied &&
                  (isChallenger
                    ? challenge.trophyUpdates.protectionApplied.challenger
                    : challenge.trophyUpdates.protectionApplied.opponent)
                }
                isTie={isTie}
              />

              {/* VS Line - Keep original */}
              <VSLine
                category={
                  challenge.status === 'active' ? challenge.category : null
                }
                categoryColorScheme={getCategoryStyle()}
                isActiveChallenge={challenge.status === 'active'}
                myAttempted={myAttempted}
              />

              <PlayerStatus
                player={opponent}
                score={
                  isChallenger
                    ? challenge.opponentScore
                    : challenge.challengerScore
                }
                attempted={
                  isChallenger
                    ? challenge.opponentAttempted
                    : challenge.challengerAttempted
                }
                isUser={false}
                trophies={opponent.quickClashTrophies}
                trophyChange={undefined}
                showTrophyAnimation={false}
                protectionApplied={false}
                isTie={false}
              />
            </VStack>
          )}

          {/* Actions - Keep original structure exactly */}
          <Flex
            justify="center"
            mt={3}
            p={2}
            bg="whiteAlpha.50"
            borderRadius="md"
          >
            {myAttempted ? (
              <Button
                size={buttonSize}
                colorScheme="purple"
                variant="outline"
                leftIcon={<FileText size={14} />}
                onClick={handleViewReport}
                fontWeight="medium"
                _hover={{
                  bg: 'purple.700',
                  borderColor: 'purple.400',
                }}
              >
                {t('View Report')}
              </Button>
            ) : challenge.status === 'pending' && !isChallenger ? (
              <HStack spacing={3}>
                <Button
                  size={buttonSize}
                  colorScheme="green"
                  onClick={handleAccept}
                  leftIcon={<Check size={14} />}
                  fontWeight="medium"
                  boxShadow="0 0 6px rgba(72, 187, 120, 0.3)"
                  _hover={{
                    boxShadow: '0 0 8px rgba(72, 187, 120, 0.5)',
                  }}
                >
                  {t('Accept')}
                </Button>
                <Button
                  size={buttonSize}
                  variant="outline"
                  colorScheme="red"
                  onClick={handleDecline}
                  leftIcon={<X size={14} />}
                  fontWeight="medium"
                >
                  {t('Decline')}
                </Button>
              </HStack>
            ) : challenge.status === 'active' && !myAttempted ? (
              <Flex align="center" gap={spacing}>
                <EnhancedPotentialTrophyDisplay
                  potentialGain={getTrophyPotential()}
                  size={fontSize}
                  compact={true}
                />

                <Button
                  size={buttonSize}
                  colorScheme="green"
                  onClick={handleStart}
                  leftIcon={<PlayCircle size={14} />}
                  fontWeight="bold"
                  px={4}
                  boxShadow="0 0 8px rgba(72, 187, 120, 0.3)"
                  _hover={{
                    boxShadow: '0 0 12px rgba(72, 187, 120, 0.5)',
                    transform: 'translateY(-1px)',
                  }}
                  _active={{ transform: 'translateY(0)' }}
                >
                  {t('Start')}
                </Button>
              </Flex>
            ) : null}
          </Flex>
        </Box>
      </Box>
    )
  },
)

ChallengeItem.displayName = 'ChallengeItem'

export default ChallengeItem
