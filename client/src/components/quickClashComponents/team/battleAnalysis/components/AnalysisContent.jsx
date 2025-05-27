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
  useBreakpointValue,
  Skeleton,
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
} from 'lucide-react'

// Error Boundary
import ErrorBoundary from '../../../../common/ErrorBoundary'

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
const EnhancedFeedbackWidget = lazy(() => import('./EnhancedFeedbackWidget'))
const FeedbackSummary = lazy(() =>
  import('./EnhancedFeedbackWidget').then(module => ({
    default: module.FeedbackSummary,
  })),
)
const FloatingFeedbackButton = lazy(() =>
  import('./EnhancedFeedbackWidget').then(module => ({
    default: module.FloatingFeedbackButton,
  })),
)

// Custom hooks
import useQuickClashAnalysis from '../../../../../customHooks/useQuickClashAnalysis'
import { useFeedbackIntegration } from './EnhancedFeedbackWidget'

const MotionBox = motion(Box)

// Simplified animation variants for better performance
const itemVariants = {
  hidden: {
    opacity: 0,
    y: 15,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
}

/**
 * Component loading placeholder - optimized
 */
const ComponentLoader = React.memo(({ height = '200px' }) => (
  <Box h={height} borderRadius="xl" overflow="hidden">
    <Skeleton height="100%" borderRadius="xl" />
  </Box>
))

ComponentLoader.displayName = 'ComponentLoader'

/**
 * Main Analysis Content Component - Optimized for performance
 */
const AnalysisContent = React.memo(
  ({ battle, userTeam, userMemberData, user, battleId }) => {
    const { t } = useTranslation('QuickClash')
    const [visibleSections, setVisibleSections] = useState(
      new Set(['banner', 'trophy']),
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

    // Enhanced feedback integration with performance optimizations
    const {
      feedbackPrompts,
      addFeedbackPrompt,
      removeFeedbackPrompt,
      recordFeedback,
    } = useFeedbackIntegration()

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

    const spacing = useBreakpointValue({ base: 4, md: 6, lg: 8 })
    const isMobile = useBreakpointValue({ base: true, md: false })

    // Memoized user team role calculation
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

    // Optimized feedback submission handler
    const handleFeedbackSubmitted = useCallback(
      (feedbackType, method, insightId) => {
        recordFeedback(insightId, {
          type: feedbackType,
          method,
          timestamp: Date.now(),
          battleId,
          userTeam,
        })
        removeFeedbackPrompt(insightId)

        // Debounced tracking
        setTimeout(() => {
          trackInteraction('feedback_submitted', {
            feedbackType,
            method,
            insightId,
            engagementLevel:
              engagementData?.scrollDepth > 70 ? 'high' : 'medium',
          })
        }, 500)
      },
      [
        recordFeedback,
        removeFeedbackPrompt,
        trackInteraction,
        battleId,
        userTeam,
        engagementData,
      ],
    )

    // Progressive loading of sections - optimized
    const loadSection = useCallback(sectionId => {
      setVisibleSections(prev => new Set([...prev, sectionId]))
    }, [])

    // Load sections progressively with better timing
    useEffect(() => {
      const timers = [
        setTimeout(() => loadSection('mvp'), 300),
        setTimeout(() => loadSection('insights'), 600),
        setTimeout(() => loadSection('team'), 900),
        setTimeout(() => loadSection('category'), 1200),
        setTimeout(() => loadSection('bonus'), 1500),
      ]

      return () => timers.forEach(clearTimeout)
    }, [loadSection])

    // Memoized common props for feedback widgets
    const commonFeedbackProps = useMemo(
      () => ({
        compact: true,
        userStats: {
          score: userMemberData?.score || 0,
          trophyChange: userMemberData?.trophyChange || 0,
          teamRole: userTeamRole,
        },
        battleId,
      }),
      [userMemberData, userTeamRole, battleId],
    )

    return (
      <>
        <VStack spacing={spacing} align="stretch">
          {/* Trophy Exchange Summary with Feedback */}
          <ErrorBoundary
            title="Trophy Summary Error"
            fallbackText="Failed to load trophy exchange summary"
          >
            <MotionBox variants={itemVariants}>
              <VStack spacing={3} align="stretch">
                <Suspense fallback={<ComponentLoader height="280px" />}>
                  <TrophyExchangeSummary
                    battle={battle}
                    userTeam={userTeam}
                    userMemberData={userMemberData}
                    isExpanded={expandedSections.trophies}
                    onToggle={() => handleToggleSection('trophies')}
                    simplifiedTrophyData={simplifiedTrophyData}
                  />
                </Suspense>

                <Suspense fallback={<ComponentLoader height="100px" />}>
                  <EnhancedFeedbackWidget
                    insightData={{
                      title: 'Trophy Exchange Analysis',
                      description:
                        'Analysis of trophy gains/losses and performance bonuses',
                      type: 'trophy_analysis',
                      category: 'improvement',
                    }}
                    {...commonFeedbackProps}
                    onFeedbackSubmitted={(type, method) =>
                      handleFeedbackSubmitted(type, method, 'trophy_analysis')
                    }
                  />
                </Suspense>
              </VStack>
            </MotionBox>
          </ErrorBoundary>

          {/* MVP Recognition with Feedback */}
          {visibleSections.has('mvp') &&
            (mvpAwards?.matchMVP ||
              mvpAwards?.teamMVP ||
              mvpAwards?.pivotalPlayer ||
              (mvpAwards?.performanceRecognitions &&
                mvpAwards.performanceRecognitions.length > 0)) && (
              <ErrorBoundary
                title="MVP Recognition Error"
                fallbackText="Failed to load MVP recognition section"
              >
                <MotionBox variants={itemVariants}>
                  <VStack spacing={3} align="stretch">
                    <Suspense fallback={<ComponentLoader height="350px" />}>
                      <MVPRecognition
                        mvpAwards={mvpAwards}
                        userTeam={userTeam}
                        isExpanded={expandedSections.mvpRecognition}
                        onToggle={() => handleToggleSection('mvpRecognition')}
                      />
                    </Suspense>

                    <Suspense fallback={<ComponentLoader height="100px" />}>
                      <EnhancedFeedbackWidget
                        insightData={{
                          title: 'MVP Recognition Analysis',
                          description:
                            'Recognition of standout performances and achievements',
                          type: 'achievement',
                          category: 'validation',
                        }}
                        {...commonFeedbackProps}
                        onFeedbackSubmitted={(type, method) =>
                          handleFeedbackSubmitted(type, method, 'mvp_analysis')
                        }
                      />
                    </Suspense>
                  </VStack>
                </MotionBox>
              </ErrorBoundary>
            )}

          {/* AI Insights */}
          {visibleSections.has('insights') &&
            (battleRecap ||
              followUpQuestions ||
              (battle.aiInsights && battle.aiInsights.length > 0)) && (
              <ErrorBoundary
                title="AI Insights Error"
                fallbackText="Failed to load AI insights section"
              >
                <MotionBox variants={itemVariants}>
                  <VStack spacing={3} align="stretch">
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
                        onToggle={() => handleToggleSection('aiInsights')}
                      />
                    </Suspense>
                  </VStack>
                </MotionBox>
              </ErrorBoundary>
            )}

          {/* Team Contribution */}
          {visibleSections.has('team') && user && user._id && (
            <ErrorBoundary
              title="Team Performance Error"
              fallbackText="Failed to load team performance section"
            >
              <MotionBox variants={itemVariants}>
                <VStack spacing={3} align="stretch">
                  <Suspense fallback={<ComponentLoader height="500px" />}>
                    <TeamContributionSection
                      battle={battle}
                      userTeam={userTeam}
                      userId={user._id}
                      isExpanded={expandedSections.teamPerformance}
                      onToggle={() => handleToggleSection('teamPerformance')}
                      enhancedMemberPerformance={enhancedMemberPerformance}
                      mvpAwards={mvpAwards}
                    />
                  </Suspense>

                  <Suspense fallback={<ComponentLoader height="100px" />}>
                    <EnhancedFeedbackWidget
                      insightData={{
                        title: 'Team Performance Analysis',
                        description:
                          'Analysis of individual contributions and team dynamics',
                        type: 'team_dynamics',
                        category: 'tactical',
                      }}
                      {...commonFeedbackProps}
                      onFeedbackSubmitted={(type, method) =>
                        handleFeedbackSubmitted(
                          type,
                          method,
                          'team_performance',
                        )
                      }
                    />
                  </Suspense>
                </VStack>
              </MotionBox>
            </ErrorBoundary>
          )}

          {/* Category Breakdown */}
          {visibleSections.has('category') && (
            <ErrorBoundary
              title="Category Breakdown Error"
              fallbackText="Failed to load category breakdown section"
            >
              <MotionBox variants={itemVariants}>
                <Suspense fallback={<ComponentLoader height="350px" />}>
                  <CategoryBreakdownSection
                    battle={battle}
                    userTeam={userTeam}
                    userMemberData={userMemberData}
                    isExpanded={expandedSections.categoryBreakdown}
                    onToggle={() => handleToggleSection('categoryBreakdown')}
                  />
                </Suspense>
              </MotionBox>
            </ErrorBoundary>
          )}

          {/* Detailed Bonus Explanation */}
          {visibleSections.has('bonus') &&
            simplifiedTrophyData?.activeBonuses &&
            simplifiedTrophyData.activeBonuses.length > 0 && (
              <ErrorBoundary
                title="Bonus Details Error"
                fallbackText="Failed to load bonus explanation section"
              >
                <MotionBox variants={itemVariants}>
                  <Suspense fallback={<ComponentLoader height="250px" />}>
                    <DetailedBonusExplanation
                      trophyExchange={battle.trophyExchange}
                      isExpanded={expandedSections.bonuses}
                      onToggle={() => handleToggleSection('bonuses')}
                      simplifiedData={simplifiedTrophyData}
                    />
                  </Suspense>
                </MotionBox>
              </ErrorBoundary>
            )}

          {/* Feedback Summary Section */}
          <MotionBox variants={itemVariants}>
            <Suspense fallback={<ComponentLoader height="120px" />}>
              <FeedbackSummary userId={user?._id} />
            </Suspense>
          </MotionBox>

          {/* Final Summary and Action Buttons */}
          <MotionBox
            variants={itemVariants}
            textAlign="center"
            pt={{ base: 6, md: 8 }}
            pb={{ base: 8, md: 10 }}
          >
            <VStack spacing={{ base: 4, md: 6 }}>
              <Box
                bg="rgba(139, 92, 246, 0.08)"
                backdropFilter={isMobile ? 'none' : 'blur(10px)'}
                borderRadius="xl"
                border="1px solid rgba(139, 92, 246, 0.2)"
                p={{ base: 4, md: 5 }}
                maxW="lg"
                w="full"
                mx="auto"
              >
                <HStack
                  justify="space-around"
                  spacing={{ base: 3, md: 4 }}
                  flexWrap="wrap"
                >
                  <VStack>
                    <Icon as={Trophy} color="purple.300" boxSize={4} />
                    <Text color="white" fontWeight="bold" fontSize="md">
                      {userMemberData?.trophyChange > 0 ? '+' : ''}
                      {userMemberData?.trophyChange || 0}
                    </Text>
                    <Text color="whiteAlpha.700" fontSize="xs">
                      {t('Trophy Change')}
                    </Text>
                  </VStack>
                  <VStack>
                    <Icon as={Clock} color="blue.400" boxSize={4} />
                    <Text color="white" fontWeight="bold" fontSize="md">
                      {battle.challenges?.length || 0}
                    </Text>
                    <Text color="whiteAlpha.700" fontSize="xs">
                      {t('Categories')}
                    </Text>
                  </VStack>
                </HStack>
              </Box>

              <Flex
                justify="center"
                align="center"
                gap={{ base: 3, md: 4 }}
                wrap="wrap"
                direction={{ base: 'column', sm: 'row' }}
                w="full"
              >
                <Button
                  leftIcon={<ArrowLeft size={16} />}
                  size="lg"
                  onClick={goBack}
                  bgGradient="linear(to-r, purple.500, purple.600)"
                  color="white"
                  borderRadius="lg"
                  px={{ base: 6, md: 8 }}
                  py={{ base: 5, md: 6 }}
                  fontSize={{ base: 'sm', md: 'md' }}
                  fontWeight="medium"
                  _hover={{
                    bgGradient: 'linear(to-r, purple.600, purple.700)',
                    transform: 'translateY(-1px)',
                  }}
                  _active={{ transform: 'translateY(0)' }}
                  transition="all 0.2s ease"
                  w={{ base: 'full', sm: 'auto' }}
                >
                  {t('Back to Battles')}
                </Button>
                <Button
                  leftIcon={<Sparkles size={16} />}
                  variant="outline"
                  size="lg"
                  onClick={openShare}
                  borderColor="purple.400"
                  color="purple.300"
                  borderRadius="lg"
                  px={{ base: 6, md: 8 }}
                  py={{ base: 5, md: 6 }}
                  fontSize={{ base: 'sm', md: 'md' }}
                  fontWeight="medium"
                  _hover={{
                    bg: 'rgba(139, 92, 246, 0.1)',
                    borderColor: 'purple.300',
                    color: 'purple.200',
                    transform: 'translateY(-1px)',
                  }}
                  _active={{ transform: 'translateY(0)' }}
                  transition="all 0.2s ease"
                  w={{ base: 'full', sm: 'auto' }}
                >
                  {t('Share Analysis')}
                </Button>
              </Flex>
            </VStack>
          </MotionBox>
        </VStack>

        {/* Share Results Modal */}
        {isShareOpen && battle && (
          <Suspense fallback={<div />}>
            <ShareResultsModal
              isOpen={isShareOpen}
              onClose={closeShare}
              battle={battle}
              userTeam={userTeam}
            />
          </Suspense>
        )}

        {/* Floating Feedback Button */}
        <Suspense fallback={<div />}>
          <FloatingFeedbackButton
            onOpen={openFeedback}
            hasUnseenInsights={feedbackPrompts.size > 0}
          />
        </Suspense>

        {/* Global Feedback Modal */}
        <Modal
          isOpen={isFeedbackOpen}
          onClose={closeFeedback}
          size="lg"
          isCentered
        >
          <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(5px)" />
          <ModalContent
            bg="rgba(26, 32, 44, 0.95)"
            backdropFilter={isMobile ? 'none' : 'blur(15px)'}
            borderRadius="xl"
            borderWidth="1px"
            borderColor="purple.600"
          >
            <ModalHeader color="whiteAlpha.900">
              <HStack>
                <Icon as={Brain} color="purple.400" boxSize={5} />
                <Text fontWeight="semibold">
                  {t('Battle Analysis Feedback')}
                </Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton color="whiteAlpha.700" />

            <ModalBody pb={6}>
              <VStack spacing={5} align="stretch">
                <Text color="whiteAlpha.800" fontSize="sm">
                  {t(
                    'Help us improve the AI analysis by sharing your thoughts on the insights provided.',
                  )}
                </Text>

                <Suspense fallback={<ComponentLoader height="150px" />}>
                  <EnhancedFeedbackWidget
                    insightData={{
                      title: 'Overall Battle Analysis',
                      description:
                        'Complete analysis including AI insights and team performance',
                      type: 'battle_recap',
                      category: 'general',
                    }}
                    compact={false}
                    showDetailedForm={true}
                    {...commonFeedbackProps}
                    onFeedbackSubmitted={(type, method) => {
                      handleFeedbackSubmitted(type, method, 'overall_analysis')
                      closeFeedback()
                    }}
                  />
                </Suspense>

                <Suspense fallback={<ComponentLoader height="80px" />}>
                  <FeedbackSummary userId={user?._id} />
                </Suspense>
              </VStack>
            </ModalBody>
          </ModalContent>
        </Modal>
      </>
    )
  },
)

AnalysisContent.displayName = 'AnalysisContent'

export default AnalysisContent
