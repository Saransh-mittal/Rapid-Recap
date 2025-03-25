// components/quickClashComponents/FlippableChallengeItem.jsx
import React, { useState, useMemo, useCallback, lazy, Suspense } from 'react'
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
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
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
import useQuickClash from '../../customHooks/useQuickClash'

// Lazy load the analysis card to improve performance
const AnalysisSummaryCard = lazy(() =>
  import('./analysisCard/AnalysisSummaryCard'),
)
const ChallengeAnalysisModal = lazy(() => import('./ChallengeAnalysisModal'))

const MotionBox = motion(Box)
const MotionButton = motion(Button)
const MotionIconButton = motion(IconButton)

// Define animation for button pulse
const pulseAnimation = `
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
`

/**
 * Flippable Challenge Item Card with 3D transition to show analysis
 */
const FlippableChallengeItem = ({
  challenge,
  userId,
  onAccept,
  onDecline,
  onStart,
  onViewReport,
  onRevenge,
  index,
}) => {
  const { t } = useTranslation('QuickClash')
  const [isFlipped, setIsFlipped] = useState(false)
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
    const isChallenger = challenge.challenger._id === userId
    const opponent = isChallenger ? challenge.opponent : challenge.challenger
    const myAttempted = isChallenger
      ? challenge.challengerAttempted
      : challenge.opponentAttempted
    const isExpired = new Date(challenge.expiresAt) < new Date()
    const myScore = isChallenger
      ? challenge.challengerScore
      : challenge.opponentScore

    const bothAttempted =
      challenge.challengerAttempted && challenge.opponentAttempted

    const isWinner =
      challenge.status === 'completed' &&
      bothAttempted &&
      ((isChallenger && challenge.challengerScore > challenge.opponentScore) ||
        (!isChallenger && challenge.opponentScore > challenge.challengerScore))

    const isTie =
      challenge.status === 'completed' &&
      bothAttempted &&
      challenge.challengerScore === challenge.opponentScore

    const isDefeat =
      challenge.status === 'completed' && bothAttempted && !isWinner && !isTie

    // Only show flip button for completed challenges where both players completed
    const showFlipButton = challenge.status === 'completed' && bothAttempted

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

  // Analysis data
  const analysis = useMemo(
    () => challengeAnalyses[challenge._id],
    [challengeAnalyses, challenge._id],
  )

  const isAnalysisLoading = useMemo(
    () => challengeAnalysesLoading[challenge._id],
    [challengeAnalysesLoading, challenge._id],
  )

  const analysisError = useMemo(
    () => challengeAnalysesError[challenge._id],
    [challengeAnalysesError, challenge._id],
  )

  // Fetch analysis when card is flipped
  React.useEffect(() => {
    if (
      isFlipped &&
      !analysis &&
      !isAnalysisLoading &&
      !analysisError &&
      challenge._id
    ) {
      fetchChallengeAnalysis(challenge._id)
    }
  }, [
    isFlipped,
    analysis,
    isAnalysisLoading,
    analysisError,
    challenge._id,
    fetchChallengeAnalysis,
  ])

  // Memoize animations to prevent unnecessary recalculations
  const animations = useMemo(
    () => ({
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
    }),
    [],
  )

  // Determine card background and styles based on status
  const cardStyles = useMemo(() => {
    let borderColorStyle = 'whiteAlpha.200'
    let boxShadowStyle = 'none'

    if (challenge.status === 'completed') {
      if (isWinner) {
        borderColorStyle = 'purple.400'
        boxShadowStyle = '0 0 15px rgba(124, 58, 237, 0.3)'
      } else if (isTie) {
        borderColorStyle = 'yellow.400'
      } else if (isDefeat) {
        borderColorStyle = 'red.400'
        boxShadowStyle = '0 0 15px rgba(245, 101, 101, 0.3)'
      }
    } else if (challenge.status === 'active' && !myAttempted) {
      borderColorStyle = 'green.400'
      boxShadowStyle = '0 0 10px rgba(72, 187, 120, 0.3)'
    } else if (challenge.status === 'pending') {
      // Use gold border for both 'New' and 'Awaiting' status
      borderColorStyle = 'yellow.400'
      boxShadowStyle = '0 0 10px rgba(236, 201, 75, 0.2)'
    }

    return {
      borderColor: borderColorStyle,
      boxShadow: boxShadowStyle,
    }
  }, [challenge.status, isWinner, isTie, isDefeat, myAttempted])

  // Determine category badge style - memoized
  const getCategoryStyle = useCallback(() => {
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
  }, [challenge.category])

  // Create a memoized category tag
  const CategoryTag = useMemo(
    () => (
      <Tag
        size="sm"
        colorScheme={getCategoryStyle()}
        borderRadius="full"
        px={3}
      >
        <Icon as={Target} size={12} mr={1} />
        {challenge.category}
      </Tag>
    ),
    [getCategoryStyle, challenge.category, t],
  )

  // Handle flip toggle
  const handleFlip = useCallback(e => {
    e.stopPropagation()
    setIsFlipped(prev => !prev)
  }, [])

  // Handle view full analysis
  const handleViewAnalysis = useCallback(() => {
    onAnalysisOpen()
  }, [onAnalysisOpen])

  // Handle retry analysis fetch
  const handleRetryAnalysis = useCallback(() => {
    retryAnalysisFetch(challenge._id)
  }, [retryAnalysisFetch, challenge._id])

  // Handle accept challenge
  const handleAccept = useCallback(() => {
    onAccept(challenge._id)
  }, [onAccept, challenge._id])

  // Handle decline challenge
  const handleDecline = useCallback(() => {
    onDecline(challenge._id)
  }, [onDecline, challenge._id])

  // Handle start challenge
  const handleStart = useCallback(() => {
    onStart(challenge._id)
  }, [onStart, challenge._id])

  // Handle view report
  const handleViewReport = useCallback(() => {
    onViewReport(challenge)
  }, [onViewReport, challenge])

  // Handle revenge
  const handleRevenge = useCallback(() => {
    if (isDefeat) {
      onRevenge(opponent, challenge)
    }
  }, [onRevenge, opponent, isDefeat])

  // Memoize the pending / new challenges content
  const pendingContent = useMemo(
    () => (
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

        {CategoryTag}
      </HStack>
    ),
    [isChallenger, opponent, CategoryTag, t],
  )

  // Memoize the player status section
  const playerStatusSection = useMemo(
    () => (
      <VStack spacing={2} align="stretch" mb={2}>
        <PlayerStatus
          player={challenge.challenger}
          score={challenge.challengerScore}
          attempted={challenge.challengerAttempted}
          isUser={isChallenger}
        />

        <Flex justify="center" align="center" py={1} position="relative">
          <HStack spacing={3}>
            {/* VS Tag */}
            <Tag
              size="sm"
              colorScheme="gray"
              variant="subtle"
              borderRadius="full"
            >
              {t('vs')}
            </Tag>

            {/* Analysis Button - shown for completed challenges */}
            {showFlipButton && (
              <MotionButton
                size="sm"
                colorScheme="purple"
                position={'absolute'}
                right={0}
                bg="rgba(128, 90, 213, 0.8)"
                leftIcon={<Icon as={BarChart} boxSize={3} />}
                onClick={handleFlip}
                borderRadius="full"
                px={3}
                height="24px"
                minW="auto"
                fontWeight="bold"
                fontSize="xs"
                boxShadow="0 0 10px rgba(128, 90, 213, 0.4)"
                _hover={{
                  bg: 'rgba(128, 90, 213, 0.9)',
                  boxShadow: '0 0 12px rgba(128, 90, 213, 0.6)',
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {t('Analysis')}
              </MotionButton>
            )}
          </HStack>

          {challenge.status === 'active' && (
            <Tag
              position={'absolute'}
              right={0}
              size="sm"
              colorScheme={getCategoryStyle()}
              borderRadius="full"
              px={3}
              animation={
                challenge.status === 'active' && !myAttempted
                  ? 'pulse 3s infinite ease-in-out'
                  : 'none'
              }
              css={
                challenge.status === 'active' && !myAttempted
                  ? pulseAnimation
                  : ''
              }
            >
              <Icon as={Target} size={12} mr={1} />
              {challenge.category}
            </Tag>
          )}
        </Flex>

        <PlayerStatus
          player={challenge.opponent}
          score={challenge.opponentScore}
          attempted={challenge.opponentAttempted}
          isUser={!isChallenger}
        />
      </VStack>
    ),
    [
      challenge.challenger,
      challenge.opponent,
      challenge.challengerScore,
      challenge.opponentScore,
      challenge.challengerAttempted,
      challenge.opponentAttempted,
      challenge.status,
      challenge.category,
      isChallenger,
      showFlipButton,
      myAttempted,
      getCategoryStyle,
      handleFlip,
      t,
    ],
  )

  // Memoize the actions section
  const actionsSection = useMemo(() => {
    if (isExpired) return null

    return (
      <Flex justify="center" mt={3} p={2} bg="whiteAlpha.50" borderRadius="md">
        {myAttempted ? (
          <Button
            size="sm"
            colorScheme="purple"
            variant="outline"
            leftIcon={<FileText size={14} />}
            onClick={handleViewReport}
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
        ) : challenge.status === 'pending' && !isChallenger ? (
          <HStack spacing={3}>
            <Button
              size="sm"
              colorScheme="green"
              onClick={handleAccept}
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
              onClick={handleDecline}
              leftIcon={<X size={14} />}
              as={motion.button}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              fontWeight="medium"
            >
              {t('Decline')}
            </Button>
          </HStack>
        ) : challenge.status === 'active' && !myAttempted ? (
          <Button
            size="sm"
            colorScheme="green"
            onClick={handleStart}
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
        ) : null}
      </Flex>
    )
  }, [
    isExpired,
    myAttempted,
    challenge.status,
    isChallenger,
    handleViewReport,
    handleAccept,
    handleDecline,
    handleStart,
    t,
  ])

  // Memoize the front face of the card
  const frontFace = useMemo(
    () => (
      <MotionBox
        key="front"
        position="relative"
        width="100%"
        bg="rgba(26, 32, 44, 0.8)"
        borderRadius="lg"
        overflow="hidden"
        borderWidth="1px"
        borderColor={cardStyles.borderColor}
        boxShadow={cardStyles.boxShadow}
        initial={{ rotateY: 180 }}
        animate={{ rotateY: 0 }}
        exit={{ rotateY: -180, opacity: 0 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
        style={{
          backfaceVisibility: 'hidden',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Card Header - Show status badge and category for active/pending */}
        {challenge.status !== 'completed' && (
          <Flex
            p={3}
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
        <Box p={3}>
          {/* For pending/new challenges, show opponent and category in body */}
          {(challenge.status === 'pending' ||
            (challenge.status === 'active' && !showPlayerStatus)) &&
            pendingContent}

          {/* Player Status Section for active or completed challenges */}
          {showPlayerStatus && playerStatusSection}

          {/* Actions */}
          {actionsSection}
        </Box>

        {/* Result Banner - Show for completed challenges */}
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
            />
          )}
      </MotionBox>
    ),
    [
      cardStyles,
      challenge.status,
      challenge.expiresAt,
      challenge.challengerAttempted,
      challenge.opponentAttempted,
      isChallenger,
      showPlayerStatus,
      pendingContent,
      playerStatusSection,
      actionsSection,
      isWinner,
      isTie,
      isDefeat,
      handleRevenge,
    ],
  )

  // Memoize the back face of the card (analysis)
  const backFace = useMemo(
    () => (
      <MotionBox
        key="back"
        position="relative"
        width="100%"
        borderRadius="lg"
        overflow="hidden"
        borderWidth="1px"
        borderColor={cardStyles.borderColor}
        boxShadow={cardStyles.boxShadow}
        initial={{ rotateY: -180 }}
        animate={{ rotateY: 0 }}
        exit={{ rotateY: 180, opacity: 0 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
        style={{
          backfaceVisibility: 'hidden',
          transformStyle: 'preserve-3d',
        }}
        bg="rgba(26, 32, 44, 0.95)"
      >
        {/* Improved Flip Back Button with better visibility */}
        <MotionIconButton
          icon={<RotateCcw size={18} />}
          aria-label={t('View Challenge')}
          size="md"
          colorScheme="blue"
          bg="rgba(66, 153, 225, 0.3)"
          position="absolute"
          top={0}
          right={0}
          zIndex={10}
          onClick={handleFlip}
          whileHover={{ scale: 1.1, rotate: -10 }}
          whileTap={{ scale: 0.9 }}
          borderRadius="full"
          boxShadow="0 0 10px rgba(66, 153, 225, 0.5)"
          _hover={{
            bg: 'rgba(66, 153, 225, 0.5)',
            boxShadow: '0 0 15px rgba(66, 153, 225, 0.7)',
          }}
          title={t('View Challenge')}
        />

        {/* Analysis Summary Card */}
        <Suspense
          fallback={
            <Center p={6} minHeight="300px">
              <VStack spacing={4}>
                <Icon as={Zap} color="purple.400" boxSize={8} />
                <Text color="white" textAlign="center">
                  {t('Analyzing challenge data...')}
                </Text>
              </VStack>
            </Center>
          }
        >
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
        </Suspense>
      </MotionBox>
    ),
    [
      cardStyles,
      t,
      handleFlip,
      challenge,
      analysis,
      userId,
      isAnalysisLoading,
      analysisError,
      handleViewAnalysis,
      handleRetryAnalysis,
    ],
  )

  // Memoize the analysis modal
  const analysisModal = useMemo(
    () => (
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
              <Spinner size="xl" color="blue.500" thickness="4px" />
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
    ),
    [isAnalysisOpen, onAnalysisClose, challenge._id, t],
  )

  return (
    <MotionBox
      initial="hidden"
      animate="visible"
      custom={index}
      variants={animations}
      whileHover={!isFlipped ? 'hover' : {}}
      position="relative"
      style={{
        perspective: '1000px',
      }}
    >
      <Box style={{ transformStyle: 'preserve-3d' }}>
        <AnimatePresence initial={false} mode="wait">
          {!isFlipped ? frontFace : backFace}
        </AnimatePresence>
      </Box>
      {analysisModal}
    </MotionBox>
  )
}

// Further optimize by preventing unnecessary re-renders
export default React.memo(FlippableChallengeItem)
