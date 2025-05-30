// components/quickClashComponents/team/battleAnalysis/components/AnalysisContent.jsx
import React, {
  useState,
  useCallback,
  lazy,
  Suspense,
  useMemo,
  useEffect,
} from 'react'
import {
  VStack,
  Box,
  Button,
  Flex,
  HStack,
  Text,
  Icon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  useDisclosure,
  Skeleton,
  useBreakpointValue,
  Divider,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeft,
  Sparkles,
  Trophy,
  Clock,
  Brain,
  MessageSquare,
  Award,
  BarChart3,
  Settings,
} from 'lucide-react'

// Error Boundary
import ErrorBoundary from '../../../../common/ErrorBoundary'
import useEngagementTracking from '../../../../../customHooks/useEngagementTracking'
// NEW: Import the smart feedback visibility hook
import useFeedbackVisibility from '../../../../../customHooks/useFeedbackVisibility'

// Lazy loaded components for better performance
const TrophyExchangeSummary = lazy(() => import('./TrophyExchangeSummary'))
const MVPRecognition = lazy(() => import('./MVPRecognition'))
const AIInsights = lazy(() => import('./aiInsights/AIInsights'))
const TeamContributionSection = lazy(() => import('./TeamContributionSection'))
const CategoryBreakdownSection = lazy(() =>
  import('./CategoryBreakdownSection'),
)
const DetailedBonusExplanation = lazy(() =>
  import('./DetailedBonusExplanation'),
)
const ShareResultsModal = lazy(() => import('./ShareResultsModal'))

// UPDATED: Import simplified feedback widget and additional components
import SimplifiedEnhancedFeedbackWidget from './SimplifiedEnhancedFeedbackWidget'
import {
  FeedbackSummary,
  FloatingFeedbackButton,
  useFeedbackIntegration,
} from './AdditionalFeedbackComponents'

// Custom hooks
import useQuickClashAnalysis from '../../../../../customHooks/useQuickClashAnalysis'
import { useFeedbackContext } from '../../../../../contextAPI/FeedbackContext'

const MotionBox = motion(Box)

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
}

const ComponentLoader = React.memo(({ height = '200px' }) => (
  <Box h={height} borderRadius="xl" overflow="hidden">
    <Skeleton
      height="100%"
      borderRadius="xl"
      startColor="gray.700"
      endColor="gray.800"
    />
  </Box>
))
ComponentLoader.displayName = 'ComponentLoader'

// UPDATED: Smart feedback section that only shows when appropriate
const SmartFeedbackSection = React.memo(
  ({
    title,
    icon,
    description,
    insightData,
    feedbackWidgetProps,
    onFeedbackSubmitted,
    children,
    sectionId,
    shouldShowFeedback, // NEW: Control visibility
    feedbackReason, // NEW: Why feedback is being shown
  }) => {
    const { t } = useTranslation('QuickClash')
    const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)

    const handleSectionFeedbackSubmitted = useCallback(
      (type, method, options = {}) => {
        setFeedbackSubmitted(true)
        onFeedbackSubmitted(type, method, {
          ...options,
          preventAutoScroll: true,
          sectionId,
        })
      },
      [onFeedbackSubmitted, sectionId],
    )

    return (
      <MotionBox variants={itemVariants}>
        <VStack spacing={4} align="stretch">
          {children}

          {/* UPDATED: Only show feedback widget when shouldShowFeedback is true */}
          {shouldShowFeedback && !feedbackSubmitted && (
            <Box
              p={3}
              bg="blackAlpha.200"
              borderRadius="lg"
              border="1px solid"
              borderColor="whiteAlpha.100"
              position="relative"
            >
              {/* UPDATED: Show why feedback is being requested */}
              {feedbackReason && (
                <Text
                  color="purple.300"
                  fontSize="xs"
                  mb={2}
                  fontStyle="italic"
                >
                  {feedbackReason === 'high_engagement' &&
                    t('You seem engaged! Your feedback would be valuable.')}
                  {feedbackReason === 'priority_analysis' &&
                    t(
                      "This was an important battle - we'd love your thoughts!",
                    )}
                  {feedbackReason === 'new_user_boost' &&
                    t('As a new user, your fresh perspective is valuable!')}
                  {feedbackReason === 'general_sampling' &&
                    t('Help us improve our AI analysis!')}
                </Text>
              )}

              <HStack mb={3} spacing={2}>
                <Icon as={icon} color="purple.400" boxSize={4} />
                <Text color="whiteAlpha.900" fontSize="sm" fontWeight="medium">
                  {title}
                </Text>
              </HStack>
              <Suspense fallback={<ComponentLoader height="100px" />}>
                <SimplifiedEnhancedFeedbackWidget
                  insightData={insightData}
                  {...feedbackWidgetProps}
                  onFeedbackSubmitted={handleSectionFeedbackSubmitted}
                  compact={true}
                  autoShow={false}
                  preventAutoScroll={true}
                  showSmartPrompt={true} // NEW: Enable smart prompting
                  visibilityReason={feedbackReason} // NEW: Pass visibility reason
                />
              </Suspense>
            </Box>
          )}

          {/* Show thank you message after feedback */}
          {feedbackSubmitted && (
            <Box
              p={3}
              bg="rgba(34, 197, 94, 0.1)"
              borderRadius="lg"
              border="1px solid"
              borderColor="green.500"
              textAlign="center"
            >
              <VStack spacing={2}>
                <Icon as={MessageSquare} color="green.400" boxSize={4} />
                <Text color="green.300" fontSize="sm" fontWeight="medium">
                  {t('Feedback received for this section')}
                </Text>
                <Text color="green.200" fontSize="xs">
                  {t('Thank you for helping improve our AI!')}
                </Text>
              </VStack>
            </Box>
          )}
        </VStack>
      </MotionBox>
    )
  },
)
SmartFeedbackSection.displayName = 'SmartFeedbackSection'

const AnalysisContent = React.memo(
  ({ battle, userTeam, userMemberData, user, battleId }) => {
    const { t } = useTranslation('QuickClash')
    const [visibleSections, setVisibleSections] = useState(
      new Set(['banner', 'trophy']),
    )
    const [submittedFeedbackSections, setSubmittedFeedbackSections] = useState(
      new Set(),
    )

    const {
      expandedSections,
      handleToggleSection,
      mvpAwards,
      simplifiedTrophyData,
      enhancedMemberPerformance,
      battleRecap,
      followUpQuestions,
      engagementData,
      trackInteraction,
      goBack,
    } = useQuickClashAnalysis()

    const {
      trackSectionExpansion,
      trackQuestionView,
      trackFeedbackSubmission,
      trackReadingTime,
      getCurrentEngagementData,
    } = useEngagementTracking({
      analysisId: battleId,
      enabled: true,
    })

    // Calculate user team role
    const userTeamRole = useMemo(() => {
      if (!userMemberData || !battle || !user) return 'average'
      const teamMembers =
        userTeam === 'teamA' ? battle.teamAMembers : battle.teamBMembers
      const sortedByScore = [...teamMembers].sort((a, b) => b.score - a.score)
      const userRank = sortedByScore.findIndex(m => m.user._id === user._id) + 1
      if (userRank === 1) return 'top_performer'
      if (userRank === teamMembers.length) return 'bottom_performer'
      if (mvpAwards?.matchMVP?.user._id === user._id) return 'mvp'
      return 'average'
    }, [userMemberData, battle, userTeam, user, mvpAwards])

    // NEW: Smart feedback visibility system
    const {
      shouldShowWidget,
      shouldShowFloatingButton,
      visibilityReason,
      confidence,
      engagementScore,
      trackInteraction: trackFeedbackInteraction,
      markFeedbackProvided,
      debugInfo,
    } = useFeedbackVisibility({
      analysisId: battleId,
      battleId,
      userEngagement: {
        scrollDepth: getCurrentEngagementData()?.scrollDepth || 0,
        readingTime: getCurrentEngagementData()?.currentSessionTime || 0,
        interactionCount: getCurrentEngagementData()?.interactions?.length || 0,
        questionsViewed: followUpQuestions?.length || 0,
        sectionsExpanded:
          Object.values(expandedSections).filter(Boolean).length,
        trophyChange: userMemberData?.trophyChange || 0,
        teamRole: userTeamRole,
      },
      enabled: true,
    })

    const {
      feedbackPrompts,
      addFeedbackPrompt,
      removeFeedbackPrompt,
      recordFeedback,
    } = useFeedbackIntegration()

    const {
      checkOverallFeedbackExists,
      overallFeedbackSubmitted,
      markFeedbackProvided: contextMarkFeedbackProvided,
      overallFeedbackLoading,
    } = useFeedbackContext()

    const {
      isOpen: isShareOpen,
      onOpen: openShare,
      onClose: closeShare,
    } = useDisclosure()
    const {
      isOpen: isFeedbackOpen,
      onOpen: openFeedback,
      onClose: closeFeedback,
    } = useDisclosure()

    // Debug: Log when feedback modal should open
    const handleOpenFeedback = useCallback(() => {
      if (process.env.NODE_ENV === 'development') {
        console.log('🎯 Opening feedback modal:', {
          shouldShowWidget,
          shouldShowFloatingButton,
          visibilityReason,
          confidence,
          overallFeedbackSubmitted,
        })
      }
      openFeedback()
    }, [
      openFeedback,
      shouldShowWidget,
      shouldShowFloatingButton,
      visibilityReason,
      confidence,
      overallFeedbackSubmitted,
    ])

    const isMobile = useBreakpointValue({ base: true, md: false })

    const config = useMemo(
      () => ({
        spacing: { base: 4, md: 5, lg: 6 },
        sectionPadding: { base: 3, md: 4 },
        componentPadding: { base: 3, md: 4, lg: 5 },
        textSizes: {
          title: { base: 'lg', md: 'xl', lg: '2xl' },
          subtitle: { base: 'sm', md: 'md' },
          body: { base: 'xs', md: 'sm' },
        },
        reduceMotion: isMobile,
        buttonSize: isMobile ? 'md' : 'lg',
        iconSize: isMobile ? 4 : 5,
      }),
      [isMobile],
    )

    // UPDATED: Enhanced feedback submission handler with smart tracking
    const handleFeedbackSubmitted = useCallback(
      (feedbackType, method, options = {}) => {
        const { preventAutoScroll = false, sectionId } = options

        // Track feedback submission for engagement
        trackFeedbackSubmission(feedbackType, options.rating || 3)

        // NEW: Track feedback interaction with smart system
        trackFeedbackInteraction('feedback_submitted', {
          type: feedbackType,
          method,
          sectionId,
          visibilityReason,
          confidence,
          engagementScore,
        })

        const safeOptions = {
          ...options,
          preventAutoScroll: true,
        }

        // Record feedback
        const insightId = sectionId || options.insightId || 'general_feedback'
        recordFeedback(insightId, {
          type: feedbackType,
          method,
          timestamp: Date.now(),
          battleId,
          userTeam,
          deviceType: isMobile ? 'mobile' : 'desktop',
          sectionId,
          visibilityReason,
          confidence,
        })

        // Mark section as submitted
        if (sectionId) {
          setSubmittedFeedbackSections(prev => new Set([...prev, sectionId]))
        }

        // Remove from prompts
        removeFeedbackPrompt(insightId)

        // NEW: Mark feedback as provided in smart system
        markFeedbackProvided(feedbackType, options.rating || 3)

        // Handle overall feedback marking
        if (insightId === 'complete_analysis') {
          contextMarkFeedbackProvided(
            battleId,
            'Complete Battle Analysis Experience',
          )
        }

        // Track interaction
        setTimeout(() => {
          trackInteraction('feedback_submitted', {
            feedbackType,
            method,
            insightId,
            isMobile,
            sectionId,
            preventedAutoScroll: true,
            engagementLevel:
              engagementData?.scrollDepth > 70 ? 'high' : 'medium',
            smartVisibility: {
              reason: visibilityReason,
              confidence,
              engagementScore,
            },
          })
        }, 300)

        console.log('Smart feedback submitted:', {
          feedbackType,
          method,
          sectionId,
          visibilityReason,
          confidence,
          engagementScore,
        })
      },
      [
        trackFeedbackSubmission,
        trackFeedbackInteraction,
        recordFeedback,
        removeFeedbackPrompt,
        trackInteraction,
        markFeedbackProvided,
        contextMarkFeedbackProvided,
        battleId,
        userTeam,
        engagementData,
        isMobile,
        visibilityReason,
        confidence,
        engagementScore,
      ],
    )

    const loadSection = useCallback(
      sectionId => {
        setVisibleSections(prev => new Set([...prev, sectionId]))

        // Track section view for engagement
        setTimeout(() => {
          trackSectionExpansion(sectionId)
          // NEW: Track section view for smart feedback system
          trackFeedbackInteraction('section_viewed', { sectionId })
        }, 1000)
      },
      [trackSectionExpansion, trackFeedbackInteraction],
    )

    const handleToggleSectionWithTracking = useCallback(
      section => {
        const isExpanding = !expandedSections[section]

        if (isExpanding) {
          trackSectionExpansion(section)
          trackFeedbackInteraction('section_expanded', { section })
        }

        handleToggleSection(section)
      },
      [
        handleToggleSection,
        expandedSections,
        trackSectionExpansion,
        trackFeedbackInteraction,
      ],
    )

    useEffect(() => {
      const delays = isMobile ? [200, 500, 900] : [150, 300, 600]
      const timers = [
        setTimeout(() => loadSection('performance'), delays[0]),
        setTimeout(() => loadSection('insights'), delays[1]),
        setTimeout(() => loadSection('system'), delays[2]),
      ]
      return () => timers.forEach(clearTimeout)
    }, [loadSection, isMobile])

    useEffect(() => {
      if (
        visibleSections.has('insights') &&
        (battleRecap || followUpQuestions)
      ) {
        const startTime = Date.now()

        return () => {
          const readingTime = Date.now() - startTime
          if (readingTime > 5000) {
            trackReadingTime('ai_insights', readingTime)
            trackFeedbackInteraction('content_read', {
              contentType: 'ai_insights',
              readingTime,
            })
          }
        }
      }
    }, [
      visibleSections,
      battleRecap,
      followUpQuestions,
      trackReadingTime,
      trackFeedbackInteraction,
    ])

    useEffect(() => {
      if (followUpQuestions && followUpQuestions.length > 0) {
        followUpQuestions.forEach(question => {
          if (question.id && question.answered === false) {
            trackQuestionView(question.id)
            trackFeedbackInteraction('question_viewed', {
              questionId: question.id,
            })
          }
        })
      }
    }, [followUpQuestions, trackQuestionView, trackFeedbackInteraction])

    useEffect(() => {
      if (battleId) {
        checkOverallFeedbackExists(battleId)
      }
    }, [battleId, checkOverallFeedbackExists])

    const feedbackWidgetProps = useMemo(
      () => ({
        userStats: {
          score: userMemberData?.score || 0,
          trophyChange: userMemberData?.trophyChange || 0,
          teamRole: userTeamRole,
        },
        battleId,
        mobileOptimized: isMobile,
        preventAutoScroll: true,
        // NEW: Pass smart feedback information
        smartFeedback: {
          reason: visibilityReason,
          confidence,
          engagementScore,
        },
      }),
      [
        userMemberData,
        userTeamRole,
        battleId,
        isMobile,
        visibilityReason,
        confidence,
        engagementScore,
      ],
    )

    // NEW: Debug information for development
    useEffect(() => {
      if (process.env.NODE_ENV === 'development' && debugInfo) {
        // Only log once when visibility changes, not constantly
        const logKey = `${visibilityReason}_${confidence}_${shouldShowWidget}_${shouldShowFloatingButton}`
        if (
          !window.lastSmartFeedbackLog ||
          window.lastSmartFeedbackLog !== logKey
        ) {
          // console.log('Smart Feedback State Changed:', {
          //   shouldShowWidget,
          //   shouldShowFloatingButton,
          //   visibilityReason,
          //   confidence,
          //   engagementScore,
          // })
          window.lastSmartFeedbackLog = logKey
        }
      }
    }, [
      shouldShowWidget,
      shouldShowFloatingButton,
      visibilityReason,
      confidence,
      engagementScore,
    ])

    return (
      <>
        <VStack spacing={config.spacing} align="stretch">
          {/* SECTION 1: PERFORMANCE ANALYSIS */}
          {visibleSections.has('performance') && (
            <SmartFeedbackSection
              title={t('Performance Analysis Feedback')}
              icon={Award}
              sectionId="performance_analysis"
              insightData={{
                title: 'Performance Analysis Suite',
                description: 'Trophy, MVP, and team performance.',
                type: 'team_performance',
                category: 'tactical',
              }}
              feedbackWidgetProps={feedbackWidgetProps}
              onFeedbackSubmitted={handleFeedbackSubmitted}
              shouldShowFeedback={
                shouldShowWidget &&
                visibilityReason !== 'disabled_or_missing_data'
              }
              feedbackReason={visibilityReason}
            >
              <ErrorBoundary
                title="Trophy Summary Error"
                fallbackText="Failed to load trophy summary"
              >
                <Suspense fallback={<ComponentLoader height="280px" />}>
                  <TrophyExchangeSummary
                    battle={battle}
                    userTeam={userTeam}
                    userMemberData={userMemberData}
                    isExpanded={expandedSections.trophies}
                    onToggle={() => handleToggleSectionWithTracking('trophies')}
                    simplifiedTrophyData={simplifiedTrophyData}
                  />
                </Suspense>
              </ErrorBoundary>
              {(mvpAwards?.matchMVP ||
                mvpAwards?.teamMVP ||
                mvpAwards?.pivotalPlayer ||
                (mvpAwards?.performanceRecognitions &&
                  mvpAwards.performanceRecognitions.length > 0)) && (
                <ErrorBoundary
                  title="MVP Recognition Error"
                  fallbackText="Failed to load MVP section"
                >
                  <Suspense fallback={<ComponentLoader height="320px" />}>
                    <MVPRecognition
                      mvpAwards={mvpAwards}
                      userTeam={userTeam}
                      isExpanded={expandedSections.mvpRecognition}
                      onToggle={() =>
                        handleToggleSectionWithTracking('mvpRecognition')
                      }
                    />
                  </Suspense>
                </ErrorBoundary>
              )}
              {user && user._id && (
                <ErrorBoundary
                  title="Team Performance Error"
                  fallbackText="Failed to load team performance"
                >
                  <Suspense fallback={<ComponentLoader height="480px" />}>
                    <TeamContributionSection
                      battle={battle}
                      userTeam={userTeam}
                      userId={user._id}
                      isExpanded={expandedSections.teamPerformance}
                      onToggle={() =>
                        handleToggleSectionWithTracking('teamPerformance')
                      }
                      enhancedMemberPerformance={enhancedMemberPerformance}
                      mvpAwards={mvpAwards}
                    />
                  </Suspense>
                </ErrorBoundary>
              )}
            </SmartFeedbackSection>
          )}

          {/* SECTION 2: AI INSIGHTS ANALYSIS */}
          {visibleSections.has('insights') &&
            (battleRecap ||
              followUpQuestions ||
              (battle.aiInsights && battle.aiInsights.length > 0)) && (
              <SmartFeedbackSection
                title={t('AI Analysis Feedback')}
                icon={Brain}
                sectionId="ai_insights_suite"
                insightData={{
                  title: 'AI Insights & Analysis Suite',
                  description: 'AI battle insights and category performance.',
                  type: 'ai_insights',
                  category: 'strategic',
                }}
                feedbackWidgetProps={{
                  ...feedbackWidgetProps,
                  priorityFeedback: true,
                }}
                onFeedbackSubmitted={handleFeedbackSubmitted}
                shouldShowFeedback={shouldShowWidget && confidence > 30} // Higher threshold for AI insights
                feedbackReason={visibilityReason}
              >
                <ErrorBoundary
                  title="AI Insights Error"
                  fallbackText="Failed to load AI insights"
                >
                  <Suspense fallback={<ComponentLoader height="400px" />}>
                    <AIInsights
                      battleRecap={battleRecap}
                      followUpQuestions={followUpQuestions}
                      userStats={
                        userMemberData
                          ? {
                              score: userMemberData.score,
                              trophyChange: userMemberData.trophyChange,
                              contribution: Math.round(
                                (userMemberData.score /
                                  Math.max(
                                    1,
                                    battle[`${userTeam}Members`].reduce(
                                      (sum, m) => sum + m.score,
                                      0,
                                    ),
                                  )) *
                                  100,
                              ),
                            }
                          : null
                      }
                      battleId={battleId}
                      isExpanded={expandedSections.aiInsights}
                      onToggle={() =>
                        handleToggleSectionWithTracking('aiInsights')
                      }
                    />
                  </Suspense>
                </ErrorBoundary>
                <Divider borderColor="whiteAlpha.200" />
              </SmartFeedbackSection>
            )}

          {/* SECTION 3: SYSTEM FEATURES */}
          {visibleSections.has('system') && (
            <SmartFeedbackSection
              title={t('System Features Feedback')}
              icon={Settings}
              sectionId="system_features"
              insightData={{
                title: 'System Features & Bonus Analysis',
                description: 'Bonus calculations and system features.',
                type: 'bonus_system',
                category: 'educational',
              }}
              feedbackWidgetProps={feedbackWidgetProps}
              onFeedbackSubmitted={handleFeedbackSubmitted}
              shouldShowFeedback={shouldShowWidget && confidence > 20} // Lower threshold for system features
              feedbackReason={visibilityReason}
            >
              <ErrorBoundary
                title="Category Breakdown Error"
                fallbackText="Failed to load category breakdown"
              >
                <Suspense fallback={<ComponentLoader height="320px" />}>
                  <CategoryBreakdownSection
                    battle={battle}
                    userTeam={userTeam}
                    userMemberData={userMemberData}
                    isExpanded={expandedSections.categoryBreakdown}
                    onToggle={() =>
                      handleToggleSectionWithTracking('categoryBreakdown')
                    }
                  />
                </Suspense>
              </ErrorBoundary>
              {simplifiedTrophyData?.activeBonuses &&
                simplifiedTrophyData.activeBonuses.length > 0 && (
                  <ErrorBoundary
                    title="Bonus Details Error"
                    fallbackText="Failed to load bonus explanation"
                  >
                    <Suspense fallback={<ComponentLoader height="250px" />}>
                      <DetailedBonusExplanation
                        trophyExchange={battle.trophyExchange}
                        isExpanded={expandedSections.bonuses}
                        onToggle={() =>
                          handleToggleSectionWithTracking('bonuses')
                        }
                        simplifiedData={simplifiedTrophyData}
                      />
                    </Suspense>
                  </ErrorBoundary>
                )}
            </SmartFeedbackSection>
          )}

          <MotionBox variants={itemVariants}>
            <Suspense fallback={<ComponentLoader height="150px" />}>
              <FeedbackSummary userId={user?._id} />
            </Suspense>
          </MotionBox>

          <MotionBox
            variants={itemVariants}
            textAlign="center"
            pt={config.componentPadding.base}
            pb={{ base: 8, md: 10 }}
          >
            <VStack spacing={config.spacing.base}>
              <Box
                bg="blackAlpha.300"
                backdropFilter={isMobile ? 'none' : 'blur(5px)'}
                borderRadius="lg"
                border="1px solid"
                borderColor="whiteAlpha.200"
                p={config.componentPadding.base}
                maxW="lg"
                w="full"
                mx="auto"
              >
                <HStack
                  justify="space-around"
                  spacing={config.componentPadding.base}
                  flexWrap="wrap"
                >
                  <VStack>
                    <Icon
                      as={Trophy}
                      color="purple.300"
                      boxSize={config.iconSize}
                    />
                    <Text
                      color="white"
                      fontWeight="bold"
                      fontSize={config.textSizes.subtitle}
                    >
                      {userMemberData?.trophyChange > 0 ? '+' : ''}
                      {userMemberData?.trophyChange || 0}
                    </Text>
                    <Text
                      color="whiteAlpha.700"
                      fontSize={config.textSizes.body}
                    >
                      {t('Trophy Change')}
                    </Text>
                  </VStack>
                  <VStack>
                    <Icon
                      as={Clock}
                      color="blue.400"
                      boxSize={config.iconSize}
                    />
                    <Text
                      color="white"
                      fontWeight="bold"
                      fontSize={config.textSizes.subtitle}
                    >
                      {battle.challenges?.length || 0}
                    </Text>
                    <Text
                      color="whiteAlpha.700"
                      fontSize={config.textSizes.body}
                    >
                      {t('Categories')}
                    </Text>
                  </VStack>
                  <VStack>
                    <Icon
                      as={MessageSquare}
                      color="green.400"
                      boxSize={config.iconSize}
                    />
                    <Text
                      color="white"
                      fontWeight="bold"
                      fontSize={config.textSizes.subtitle}
                    >
                      {submittedFeedbackSections.size || 0}
                    </Text>
                    <Text
                      color="whiteAlpha.700"
                      fontSize={config.textSizes.body}
                    >
                      {t('Feedback Given')}
                    </Text>
                  </VStack>
                </HStack>

                {/* NEW: Show smart feedback info in development */}
                {process.env.NODE_ENV === 'development' && debugInfo && (
                  <Box mt={4} p={2} bg="blackAlpha.400" borderRadius="md">
                    <Text color="yellow.300" fontSize="xs" fontWeight="bold">
                      Smart Feedback Debug:
                    </Text>
                    <Text color="yellow.200" fontSize="xs">
                      Reason: {visibilityReason} | Confidence: {confidence}% |
                      Engagement: {engagementScore}%
                    </Text>
                  </Box>
                )}
              </Box>

              <Flex
                justify="center"
                align="center"
                gap={config.componentPadding.base}
                wrap="wrap"
                direction={{ base: 'column', sm: 'row' }}
                w="full"
              >
                <Button
                  leftIcon={<ArrowLeft size={16} />}
                  size={config.buttonSize}
                  onClick={goBack}
                  bg="gray.700"
                  color="whiteAlpha.900"
                  borderRadius="md"
                  _hover={{ bg: 'gray.600' }}
                  w={{ base: 'full', sm: 'auto' }}
                  minW={{ base: 'full', sm: '140px' }}
                  py={isMobile ? 2.5 : 2}
                  h="auto"
                >
                  {t('Back to Battles')}
                </Button>
                <Button
                  leftIcon={<Sparkles size={16} />}
                  variant="outline"
                  size={config.buttonSize}
                  onClick={openShare}
                  borderColor="purple.500"
                  color="purple.300"
                  borderRadius="md"
                  _hover={{ bg: 'purple.500_with_alpha_0.1' }}
                  w={{ base: 'full', sm: 'auto' }}
                  minW={{ base: 'full', sm: '140px' }}
                  py={isMobile ? 2.5 : 2}
                  h="auto"
                >
                  {t('Share Analysis')}
                </Button>
              </Flex>
            </VStack>
          </MotionBox>
        </VStack>

        {isShareOpen && battle && (
          <Suspense fallback={null}>
            <ShareResultsModal
              isOpen={isShareOpen}
              onClose={closeShare}
              battle={battle}
              userTeam={userTeam}
            />
          </Suspense>
        )}

        {/* UPDATED: Smart floating feedback button - only shown when appropriate */}
        {shouldShowFloatingButton && (
          <Suspense fallback={null}>
            <FloatingFeedbackButton
              onOpen={handleOpenFeedback}
              hasUnseenInsights={
                feedbackPrompts.size > 0 && !overallFeedbackSubmitted
              }
              isDisabled={overallFeedbackLoading || overallFeedbackSubmitted}
              smartFeedback={{
                reason: visibilityReason,
                confidence,
                engagementScore,
              }}
            />
          </Suspense>
        )}

        {/* UPDATED: Overall feedback modal with smart visibility */}
        <Modal
          isOpen={
            isFeedbackOpen &&
            !overallFeedbackSubmitted &&
            !overallFeedbackLoading &&
            (shouldShowWidget || shouldShowFloatingButton) // Allow if either should show
          }
          onClose={closeFeedback}
          size={isMobile ? 'full' : 'xl'}
          isCentered={!isMobile}
          scrollBehavior="inside"
        >
          <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(5px)" />
          <ModalContent
            bg="gray.800"
            backdropFilter={isMobile ? 'none' : 'blur(10px)'}
            borderRadius={isMobile ? 'none' : 'lg'}
            borderWidth="1px"
            borderColor="purple.700"
            h={isMobile ? '100vh' : 'auto'}
            maxH={isMobile ? '100vh' : '90vh'}
          >
            <ModalHeader color="whiteAlpha.900" pb={isMobile ? 2 : 4}>
              <HStack>
                <Icon as={Brain} color="purple.400" boxSize={5} />
                <Text fontWeight="semibold" fontSize={config.textSizes.title}>
                  {t('Complete Battle Analysis Feedback')}
                </Text>
              </HStack>
              {/* NEW: Show why feedback is being requested */}
              <Text color="purple.300" fontSize="sm" mt={1}>
                {visibilityReason === 'high_engagement' &&
                  t('You seem very engaged with this analysis!')}
                {visibilityReason === 'priority_analysis' &&
                  t('This was an important battle for you.')}
                {visibilityReason === 'new_user_boost' &&
                  t('Your fresh perspective as a new user is valuable!')}
              </Text>
            </ModalHeader>
            <ModalCloseButton
              color="whiteAlpha.700"
              size={isMobile ? 'md' : 'lg'}
            />
            <ModalBody pb={6} px={isMobile ? 4 : 6}>
              <VStack spacing={config.spacing.base} align="stretch">
                <Text
                  color="whiteAlpha.800"
                  fontSize={config.textSizes.subtitle}
                >
                  {t(
                    'Your feedback is invaluable! Help us improve the AI analysis by sharing your thoughts on the overall battle insights.',
                  )}
                </Text>

                {/* NEW: Show engagement info */}
                <Box
                  p={3}
                  bg="purple.900_with_alpha_0.2"
                  borderRadius="md"
                  border="1px solid"
                  borderColor="purple.600"
                >
                  <Text
                    color="purple.200"
                    fontSize={config.textSizes.body}
                    textAlign="center"
                  >
                    💡{' '}
                    {t(
                      'Your engagement score: {{score}}% | Confidence: {{confidence}}%',
                      {
                        score: engagementScore,
                        confidence: confidence,
                      },
                    )}
                  </Text>
                </Box>

                <Box
                  p={3}
                  bg="green.900_with_alpha_0.2"
                  borderRadius="md"
                  border="1px solid"
                  borderColor="green.600"
                >
                  <Text
                    color="green.200"
                    fontSize={config.textSizes.body}
                    textAlign="center"
                  >
                    ✨{' '}
                    {t(
                      'Most of our users are on mobile - your mobile feedback drives our AI improvements!',
                    )}
                  </Text>
                </Box>
                <Suspense fallback={<ComponentLoader height="200px" />}>
                  <SimplifiedEnhancedFeedbackWidget
                    insightData={{
                      title: 'Complete Battle Analysis Experience',
                      description:
                        'Overall assessment of the entire battle analysis.',
                      type: 'complete_analysis',
                      category: 'comprehensive',
                    }}
                    compact={false}
                    showDetailedForm={true}
                    priorityFeedback={true}
                    {...feedbackWidgetProps}
                    onFeedbackSubmitted={(type, method, options = {}) => {
                      handleFeedbackSubmitted(type, method, {
                        ...options,
                        insightId: 'complete_analysis',
                        preventAutoScroll: true,
                      })
                      closeFeedback()
                    }}
                    autoShow={true}
                    preventAutoScroll={true}
                    showSmartPrompt={true}
                    visibilityReason={visibilityReason}
                  />
                </Suspense>
                <Suspense fallback={<ComponentLoader height="100px" />}>
                  <FeedbackSummary userId={user?._id} />
                </Suspense>
              </VStack>
            </ModalBody>
          </ModalContent>
        </Modal>

        {/* Already submitted feedback modal */}
        {overallFeedbackSubmitted && isFeedbackOpen && (
          <Modal
            isOpen={isFeedbackOpen}
            onClose={closeFeedback}
            size={isMobile ? 'full' : 'md'}
            isCentered
          >
            <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(5px)" />
            <ModalContent
              bg="gray.800"
              borderRadius={isMobile ? 'none' : 'lg'}
              borderWidth="1px"
              borderColor="green.600"
            >
              <ModalHeader color="whiteAlpha.900" textAlign="center">
                <VStack spacing={2}>
                  <Icon as={MessageSquare} color="green.400" boxSize={8} />
                  <Text fontWeight="semibold">
                    {t('Feedback Already Submitted')}
                  </Text>
                </VStack>
              </ModalHeader>
              <ModalCloseButton color="whiteAlpha.700" />
              <ModalBody pb={6} textAlign="center">
                <VStack spacing={4}>
                  <Text color="whiteAlpha.800" fontSize="md">
                    {t(
                      'You have already provided overall feedback for this battle analysis.',
                    )}
                  </Text>
                  <Text color="green.300" fontSize="sm">
                    {t('Thank you for helping us improve our AI system!')}
                  </Text>
                </VStack>
              </ModalBody>
            </ModalContent>
          </Modal>
        )}
      </>
    )
  },
)
AnalysisContent.displayName = 'AnalysisContent'

export default AnalysisContent
