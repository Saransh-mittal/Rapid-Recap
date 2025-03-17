import React from 'react'
import { Box, VStack, Flex, Icon } from '@chakra-ui/react'
import { Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { useSelector } from 'react-redux'

// Import sub-components
import ResultBadge from './ResultBadge'
import ScoreDisplay from './ScoreDisplay'
import PerformanceMetrics from './PerformanceMetrics'
import CommentSection, {
  findShortestComment,
  getCommentIcon,
} from './CommentSection'
import ViewFullButton from './ViewFullButton'
import AnalysisCardLoading from './AnalysisCardLoading'
import GenerateAnalysisButton from './GenerateAnalysisButton'
import AnalysisErrorCard from './AnalysisErrorCard'

// Import helpers
import { getThemeColors } from './themeHelpers'

// Motion-enhanced components
const MotionBox = motion(Box)

// Loading state component - extracted to avoid conditionals in main component
const LoadingCard = ({ onViewFull }) => <AnalysisCardLoading />

// Generate button component - extracted to avoid conditionals in main component
const GenerateCard = ({ onViewFull }) => (
  <GenerateAnalysisButton onViewFull={onViewFull} />
)

// Main card component - extracted to avoid conditionals in main component
const MainCard = ({ challenge, analysis, userId, onViewFull }) => {
  const { user } = useSelector(state => state.auth)

  // Pre-calculate values that don't need memoization
  const isChallenger = challenge.challenger._id === userId
  const userScore = isChallenger
    ? challenge.challengerScore
    : challenge.opponentScore
  const opponentScore = isChallenger
    ? challenge.opponentScore
    : challenge.challengerScore
  const opponent = isChallenger ? challenge.opponent : challenge.challenger

  // Calculate result states
  const userIsWinner = userScore > opponentScore
  const isTie = userScore === opponentScore && userScore > 0

  // Check if user prefers Hindi
  const prefersHindi = user?.userLanguage === 'hi'

  // Get the user's analysis data
  const userAnalysis =
    analysis?.challenger?._id === userId
      ? analysis?.challenger
      : analysis?.opponent || {}
  const metrics = analysis?.battleMetrics || {}
  const engagement = analysis?.engagement || {}

  // Find the shortest comment
  const shortestComment = findShortestComment(engagement, userIsWinner)
  const commentIcon = getCommentIcon(shortestComment, engagement)

  // Get theme colors based on result
  const themeColors = getThemeColors(userIsWinner, isTie)

  return (
    <MotionBox
      width={'100%'}
      display={{ base: 'block', md: 'flex' }}
      flexDirection={'column'}
      p={2.5}
      height={{ base: '100%', md: '225px' }}
      borderRadius="lg"
      bgGradient={themeColors.cardBg}
      borderWidth="1.5px"
      borderColor={themeColors.borderColor}
      boxShadow={`0 4px 16px rgba(0, 0, 0, 0.2), 0 0 0 1px ${
        userIsWinner
          ? 'rgba(72, 187, 120, 0.1)'
          : isTie
          ? 'rgba(66, 153, 225, 0.1)'
          : 'rgba(245, 101, 101, 0.1)'
      }`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      position="relative"
      overflow="hidden"
      _hover={{
        transform: 'translateY(-2px)',
        boxShadow: `0 6px 20px rgba(0, 0, 0, 0.25), 0 0 0 1px ${
          userIsWinner
            ? 'rgba(72, 187, 120, 0.2)'
            : isTie
            ? 'rgba(66, 153, 225, 0.2)'
            : 'rgba(245, 101, 101, 0.2)'
        }`,
        transition: 'all 0.2s ease-in-out',
      }}
    >
      {/* Background glow/gradient effect */}
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        bottom="0"
        bgGradient={`radial(circle at top right, ${themeColors.gradientStart}, ${themeColors.gradientEnd})`}
        zIndex="0"
      />

      {/* Victory sparkle effects */}
      {userIsWinner && (
        <>
          <MotionBox
            position="absolute"
            top="20%"
            right="10%"
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
            zIndex="1"
          >
            <Icon as={Sparkles} color="green.300" boxSize={3} />
          </MotionBox>

          <MotionBox
            position="absolute"
            bottom="15%"
            left="5%"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.4, 0.8, 0.4],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              repeatType: 'reverse',
              delay: 0.5,
            }}
            zIndex="1"
          >
            <Icon as={Sparkles} color={themeColors.iconColor} boxSize={2.5} />
          </MotionBox>
        </>
      )}

      <VStack spacing={2} align="stretch" position="relative" zIndex="2">
        {/* Header with result banner and score */}
        <Flex justifyContent="space-between" alignItems="center">
          {/* Left side - Badge */}
          <ResultBadge userIsWinner={userIsWinner} isTie={isTie} />

          {/* Right side - Score */}
          <ScoreDisplay
            userScore={userScore}
            opponentScore={opponentScore}
            userIsWinner={userIsWinner}
            isTie={isTie}
            opponentName={opponent.inGameName}
          />
        </Flex>

        {/* Performance metrics */}
        <PerformanceMetrics
          userAnalysis={userAnalysis}
          metrics={metrics}
          themeColors={themeColors}
        />

        {/* Comment Section - Only show if available */}
        {shortestComment && (
          <CommentSection
            comment={shortestComment}
            commentIcon={commentIcon}
            themeColors={themeColors}
          />
        )}

        {/* Mobile View button */}
        <ViewFullButton
          onClick={onViewFull}
          userIsWinner={userIsWinner}
          isTie={isTie}
          display={{ base: 'flex', md: 'none' }}
          width="100%"
          marginTop={2}
        />
      </VStack>

      {/* Desktop View Button */}
      <ViewFullButton
        onClick={onViewFull}
        userIsWinner={userIsWinner}
        isTie={isTie}
        display={{ base: 'none', md: 'block' }}
      />
    </MotionBox>
  )
}

/**
 * AnalysisSummaryCard - Container component that renders the appropriate card
 * based on loading state and available data
 */
const AnalysisSummaryCard = ({
  challenge,
  analysis,
  userId,
  isLoading = false,
  isError = false,
  errorMessage = '',
  onViewFull,
  onRetry,
}) => {
  // Use simple conditional rendering with no hooks
  if (isLoading) {
    return <LoadingCard onViewFull={onViewFull} />
  }

  if (isError) {
    return <AnalysisErrorCard error={errorMessage} onRetry={onRetry} />
  }

  if (!analysis) {
    return <GenerateCard onViewFull={onViewFull} />
  }

  return (
    <MainCard
      challenge={challenge}
      analysis={analysis}
      userId={userId}
      onViewFull={onViewFull}
    />
  )
}

export default AnalysisSummaryCard
