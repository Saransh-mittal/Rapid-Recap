import React, {
  useState,
  useMemo,
  useCallback,
  lazy,
  Suspense,
  useEffect,
  useRef,
  memo,
} from 'react'
import {
  Box,
  VStack,
  Text,
  Tag,
  HStack,
  Button,
  Flex,
  Icon,
  Center,
  IconButton,
  useDisclosure,
  Spinner,
  useBreakpointValue,
  Skeleton,
} from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import {
  Shield,
  Award,
  Target,
  Check,
  X,
  PlayCircle,
  FileText,
  RotateCcw,
  Zap,
  BarChart,
} from 'lucide-react'

// Import UI components
import StatusBadge from './ui/StatusBadge'
import PlayerStatus from './ui/PlayerStatus'
import ResultBanner from './ui/ResultBanner'
import VSLine from './VSLine'
import useQuickClash from '../../customHooks/useQuickClash'
// Import enhanced trophy displays
import EnhancedPotentialTrophyDisplay from './ui/EnhancedPotentialTrophyDisplay'
import { useSelector } from 'react-redux'

// Lazy load the analysis card to improve performance
const AnalysisSummaryCard = lazy(() =>
  import('./analysisCard/AnalysisSummaryCard'),
)
const ChallengeAnalysisModal = lazy(() => import('./ChallengeAnalysisModal'))

/**
 * Flippable Challenge Item Card with enhanced layouts and dynamic height
 * - Performance optimized with memo, lazy loading, and reduced animations
 * - Responsive design with useBreakpointValue
 * - Improved memory usage and flip animation performance
 * - Added loading skeleton states
 */
const FlippableChallengeItem = memo(
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
    const [isFlipped, setIsFlipped] = useState(false)
    const [cardHeight, setCardHeight] = useState('auto')
    const frontCardRef = useRef(null)
    const isFirstRender = useRef(true)

    // Responsive styling
    const fontSize = useBreakpointValue({ base: 'xs', md: 'sm' })
    const iconSize = useBreakpointValue({ base: 3, md: 4 })
    const buttonSize = useBreakpointValue({ base: 'xs', md: 'sm' })
    const padding = useBreakpointValue({ base: 2, md: 3 })
    const spacing = useBreakpointValue({ base: 1, md: 2 })

    const {
      fetchChallengeAnalysis,
      generateAnalysis,
      retryAnalysisFetch,
      challengeAnalyses,
      challengeAnalysesLoading,
      challengeAnalysesError,
    } = useQuickClash()

    const {
      isOpen: isAnalysisOpen,
      onOpen: onAnalysisOpen,
      onClose: onAnalysisClose,
    } = useDisclosure()

    // Memoize basic challenge properties to avoid recalculations
    const {
      isChallenger,
      opponent,
      myAttempted,
      isExpired,
      myScore,
      isWinner,
      isTie,
      isDefeat,
      showFlipButton,
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
          showFlipButton: false,
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

      // Only show flip button for completed challenges where both players completed
      const showFlipButton = challenge.status === 'completed'

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
        showFlipButton,
        showPlayerStatus,
      }
    }, [challenge, userId])

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

    // Analysis data
    const analysis = useMemo(
      () => challengeAnalyses[challenge?._id],
      [challengeAnalyses, challenge],
    )

    const isAnalysisLoading = useMemo(
      () => challengeAnalysesLoading[challenge?._id],
      [challengeAnalysesLoading, challenge],
    )

    const analysisError = useMemo(
      () => challengeAnalysesError[challenge?._id],
      [challengeAnalysesError, challenge],
    )

    // Use effect to measure the height of the front card for proper flip animation
    useEffect(() => {
      if (frontCardRef.current && !isFlipped) {
        const height = frontCardRef.current.clientHeight
        setCardHeight(`${height}px`)
      }
    }, [frontCardRef, isFlipped, challenge])

    // Fetch analysis when card is flipped
    useEffect(() => {
      if (
        isFlipped &&
        !analysis &&
        !isAnalysisLoading &&
        !analysisError &&
        challenge?._id
      ) {
        fetchChallengeAnalysis(challenge._id)
      }
    }, [
      isFlipped,
      analysis,
      isAnalysisLoading,
      analysisError,
      challenge,
      fetchChallengeAnalysis,
    ])

    // Trophy animation effect
    useEffect(() => {
      if (challenge?.trophyUpdates && (isWinner || isDefeat || isTie)) {
        // Delay the animation slightly for better UX
        const timer = setTimeout(() => {
          setShowTrophyAnimation(true)
        }, 500)

        return () => clearTimeout(timer)
      }
    }, [challenge?.trophyUpdates, isWinner, isDefeat, isTie])

    // Get trophy changes
    const getTrophyChange = useCallback(() => {
      if (!challenge?.trophyUpdates) return undefined

      const userChange = isChallenger
        ? challenge.trophyUpdates.challenger?.change
        : challenge.trophyUpdates.opponent?.change

      return userChange
    }, [challenge, isChallenger])

    // Get potential trophy gain for active/pending challenges
    const getTrophyPotential = useCallback(() => {
      if (!challenge) return 0

      // For active challenges, return potential gain
      if (challenge.status === 'active' || challenge.status === 'pending') {
        if (!challenge.trophyPotential) return 0

        return isChallenger
          ? challenge.trophyPotential.challenger?.potentialGain
          : challenge.trophyPotential.opponent?.potentialGain
      }

      return 0
    }, [challenge, isChallenger])

    // Determine card background and styles based on status
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
        // Use gold border for both 'New' and 'Awaiting' status
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

    // Determine category badge style - memoized
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

    // Handle flip toggle
    const handleFlip = useCallback(e => {
      if (e) e.stopPropagation()
      setIsFlipped(prev => !prev)
    }, [])

    // Handle view full analysis
    const handleViewAnalysis = useCallback(() => {
      onAnalysisOpen()
    }, [onAnalysisOpen])

    // Handle retry analysis fetch
    const handleRetryAnalysis = useCallback(() => {
      retryAnalysisFetch(challenge._id)
    }, [retryAnalysisFetch, challenge])

    // Event handlers
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

    const handleRevenge = useCallback(() => {
      if (isDefeat) {
        onRevenge(opponent, challenge)
      }
    }, [onRevenge, opponent, isDefeat, challenge])

    // Create a memoized category tag
    const CategoryTag = useMemo(() => {
      if (!challenge) return null

      return (
        <Tag
          size="sm"
          colorScheme={getCategoryStyle()}
          borderRadius="full"
          px={2}
        >
          <Icon as={Target} size={12} mr={1} />
          {challenge.category}
        </Tag>
      )
    }, [getCategoryStyle, challenge])

    // If no challenge data, show skeleton
    if (!challenge) {
      return <FlippableChallengeItemSkeleton />
    }

    return (
      <Box
        className="flippable-challenge-item"
        data-testid="flippable-challenge-item"
        position="relative"
        height={isFlipped ? cardHeight : 'auto'}
        transition="all 0.2s"
        _hover={{
          transform: isFlipped ? 'none' : 'translateY(-2px)',
          boxShadow: isFlipped ? 'none' : '0 6px 12px rgba(0, 0, 0, 0.1)',
        }}
      >
        {!isFlipped ? (
          // FRONT FACE - Normal Challenge Card
          <Box
            ref={frontCardRef}
            bg="rgba(26, 32, 44, 0.8)"
            borderRadius="lg"
            overflow="hidden"
            borderWidth="1px"
            borderColor={cardStyles.borderColor}
            boxShadow={cardStyles.boxShadow}
            position="relative"
            height="100%"
            transition="all 0.2s"
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
            {/* Card Header - Show status badge for active/pending */}
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

            {/* Card Body */}
            <Box p={padding}>
              {/* Player Status Section */}
              {showPlayerStatus && userPlayer && opponentPlayer && (
                <VStack spacing={spacing} align="stretch" mb={2}>
                  {/* Always show logged-in user first */}
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

                  {/* VS Line */}
                  <VSLine
                    category={
                      challenge.status === 'active' ? challenge.category : null
                    }
                    categoryColorScheme={getCategoryStyle()}
                    isActiveChallenge={challenge.status === 'active'}
                    myAttempted={myAttempted}
                  />

                  {/* Always show opponent second */}
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
                    trophyChange={undefined} // Only show trophy change for logged-in user
                    showTrophyAnimation={false} // Only animate for logged-in user
                    protectionApplied={false} // Only show protection for logged-in user
                    isTie={false} // Only relevant for logged-in user
                  />
                </VStack>
              )}

              {/* Actions */}
              <Flex
                justify="center"
                mt={3}
                p={2}
                bg="whiteAlpha.50"
                borderRadius="md"
              >
                {myAttempted ? (
                  <HStack spacing={3}>
                    {/* ENHANCED "View Report" Button */}
                    <Button
                      size={buttonSize}
                      leftIcon={<FileText size={14} />}
                      onClick={handleViewReport}
                      bg="transparent"
                      color="purple.300"
                      borderColor="purple.400"
                      borderWidth="1px"
                      fontWeight="bold"
                      boxShadow="0px 0px 8px rgba(147, 51, 234, 0.3), inset 0px 0px 4px rgba(147, 51, 234, 0.2)"
                      transition="all 0.3s ease"
                      _hover={{
                        bg: 'rgba(147, 51, 234, 0.15)',
                        color: 'white',
                        borderColor: 'purple.300',
                        transform: 'scale(1.05)',
                        boxShadow:
                          '0px 0px 16px rgba(147, 51, 234, 0.5), inset 0px 0px 6px rgba(147, 51, 234, 0.3)',
                      }}
                      _active={{
                        transform: 'scale(1.0)',
                        bg: 'rgba(147, 51, 234, 0.25)',
                      }}
                    >
                      {t('View Report')}
                    </Button>

                    {/* ENHANCED "Analysis" Button */}
                    {showFlipButton && (
                      <Button
                        size={buttonSize}
                        leftIcon={<BarChart size={14} />}
                        onClick={handleFlip}
                        bg="transparent"
                        color="blue.300"
                        borderColor="blue.400"
                        borderWidth="1px"
                        fontWeight="bold"
                        boxShadow="0px 0px 8px rgba(59, 130, 246, 0.3), inset 0px 0px 4px rgba(59, 130, 246, 0.2)"
                        transition="all 0.3s ease"
                        _hover={{
                          bg: 'rgba(59, 130, 246, 0.15)',
                          color: 'white',
                          borderColor: 'blue.300',
                          transform: 'scale(1.05)',
                          boxShadow:
                            '0px 0px 16px rgba(59, 130, 246, 0.5), inset 0px 0px 6px rgba(59, 130, 246, 0.3)',
                        }}
                        _active={{
                          transform: 'scale(1.0)',
                          bg: 'rgba(59, 130, 246, 0.25)',
                        }}
                      >
                        {t('Analysis')}
                      </Button>
                    )}
                  </HStack>
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
                    {/* Show enhanced trophy display */}
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

            {/* Result Banner */}
            {challenge.status === 'completed' &&
              challenge.challengerAttempted &&
              challenge.opponentAttempted && (
                <ResultBanner
                  isWinner={isWinner}
                  isTie={isTie}
                  isDefeat={isDefeat}
                  expiresAt={challenge.expiresAt}
                  category={challenge.category}
                  onRevenge={isDefeat ? handleRevenge : null}
                  revengeStatus={challenge.revengeStatus}
                  revengeLoading={revengeLoading}
                />
              )}
          </Box>
        ) : (
          // BACK FACE - Analysis Card
          <Box
            bg="rgba(26, 32, 44, 0.95)"
            borderRadius="lg"
            overflow="hidden"
            borderWidth="1px"
            borderColor={cardStyles.borderColor}
            boxShadow={cardStyles.boxShadow}
            position="relative"
            height="100%"
          >
            {/* Improved Flip Back Button with better visibility */}
            <IconButton
              icon={<RotateCcw size={18} />}
              aria-label={t('View Challenge')}
              size="sm"
              colorScheme="blue"
              bg="rgba(66, 153, 225, 0.3)"
              position="absolute"
              top={2}
              right={2}
              zIndex={10}
              onClick={handleFlip}
              borderRadius="full"
              boxShadow="0 0 8px rgba(66, 153, 225, 0.4)"
              _hover={{
                bg: 'rgba(66, 153, 225, 0.5)',
                boxShadow: '0 0 10px rgba(66, 153, 225, 0.6)',
                transform: 'rotate(-180deg)',
              }}
              transition="all 0.3s"
              title={t('View Challenge')}
            />

            {/* Analysis Summary Card */}
            <Suspense
              fallback={
                <Center p={6} height="100%">
                  <VStack spacing={4}>
                    <Icon as={Zap} color="purple.400" boxSize={6} />
                    <Text color="white" textAlign="center" fontSize={fontSize}>
                      {t('Analyzing challenge data...')}
                    </Text>
                    <Spinner color="purple.400" size="md" thickness="2px" />
                  </VStack>
                </Center>
              }
            >
              <Box height="100%">
                <AnalysisSummaryCard
                  challenge={challenge}
                  analysis={analysis}
                  userId={userId}
                  isLoading={isAnalysisLoading}
                  isError={!!analysisError}
                  errorMessage={analysisError}
                  onViewFull={handleViewAnalysis}
                  onRetry={handleRetryAnalysis}
                />
              </Box>
            </Suspense>
          </Box>
        )}

        {/* Analysis Modal - Only render when needed */}
        {isAnalysisOpen && (
          <Suspense
            fallback={
              <Center
                position="fixed"
                top="0"
                left="0"
                right="0"
                bottom="0"
                bg="rgba(0,0,0,0.7)"
                zIndex="modal"
              >
                <VStack spacing={4}>
                  <Spinner size="lg" color="blue.500" thickness="3px" />
                  <Text color="white" fontWeight="medium">
                    {t('Loading analysis...')}
                  </Text>
                </VStack>
              </Center>
            }
          >
            <ChallengeAnalysisModal
              isOpen={isAnalysisOpen}
              onClose={onAnalysisClose}
              challengeId={challenge._id}
            />
          </Suspense>
        )}
      </Box>
    )
  },
)

/**
 * Skeleton loading state for FlippableChallengeItem
 */
const FlippableChallengeItemSkeleton = () => {
  const padding = useBreakpointValue({ base: 2, md: 3 })

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

FlippableChallengeItem.displayName = 'FlippableChallengeItem'

export default FlippableChallengeItem
