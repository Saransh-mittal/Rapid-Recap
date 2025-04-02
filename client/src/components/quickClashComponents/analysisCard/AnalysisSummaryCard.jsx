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
import { useTranslation } from 'react-i18next'

// Motion-enhanced components
const MotionBox = motion(Box)

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
  const { t } = useTranslation('QuickClash')
  const { user } = useSelector(state => state.auth)

  // Use simple conditional rendering with no hooks
  if (isLoading) {
    return <AnalysisCardLoading />
  }

  if (isError) {
    return <AnalysisErrorCard error={errorMessage} onRetry={onRetry} />
  }

  if (!analysis) {
    return <GenerateAnalysisButton onViewFull={onViewFull} />
  }

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

  // Get the user's analysis data

  const userAnalysis =
    analysis?.challenger?._id === userId
      ? analysis?.challenger
      : analysis?.opponent || analysis?.userAnalysis?.userId === userId
      ? analysis?.userAnalysis
      : {}
  const metrics = analysis?.battleMetrics || {}
  const engagement = analysis?.engagement || {}

  // Find the shortest comment
  const shortestComment = findShortestComment(engagement, userIsWinner)
  const commentIcon = getCommentIcon(shortestComment, engagement)

  // Get theme colors based on result
  const themeColors = getThemeColors(userIsWinner, isTie)

  return (
    <MotionBox
      width="100%"
      height="100%"
      display="flex"
      flexDirection="column"
      p={4}
      borderRadius="lg"
      bgGradient={themeColors.cardBg}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      position="relative"
      overflow="hidden"
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

      <VStack spacing={3} align="stretch" position="relative" zIndex="2">
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
          marginTop="auto"
          mt={3}
        />
      </VStack>

      {/* Desktop View Button */}
      <ViewFullButton
        onClick={onViewFull}
        userIsWinner={userIsWinner}
        isTie={isTie}
        display={{ base: 'none', md: 'block' }}
        marginTop="auto"
        mt={3}
        position="static"
        alignSelf="flex-end"
      />
    </MotionBox>
  )
}

export default AnalysisSummaryCard
