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
  HStack,
  Text,
  Icon,
  Skeleton,
  useBreakpointValue,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeft,
  Trophy,
  Clock,
} from 'lucide-react'

// Error Boundary
import ErrorBoundary from '../../../../common/ErrorBoundary'


// Lazy loaded components for better performance
const TrophyExchangeSummary = lazy(() => import('./TrophyExchangeSummary'))
const MVPRecognition = lazy(() => import('./MVPRecognition'))

const TeamContributionSection = lazy(() => import('./TeamContributionSection'))
const CategoryBreakdownSection = lazy(() =>
  import('./CategoryBreakdownSection'),
)
const DetailedBonusExplanation = lazy(() =>
  import('./DetailedBonusExplanation'),
)

// Custom hooks
import useQuickClashAnalysis from '../../../../../customHooks/useQuickClashAnalysis'

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

// Simple section wrapper (no feedback)
const SectionWrapper = React.memo(({ children }) => (
  <MotionBox variants={itemVariants}>
    <VStack spacing={4} align="stretch">
      {children}
    </VStack>
  </MotionBox>
))
SectionWrapper.displayName = 'SectionWrapper'

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
      goBack,
    } = useQuickClashAnalysis()

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

    const loadSection = useCallback(
      sectionId => {
        setVisibleSections(prev => new Set([...prev, sectionId]))
      },
      [],
    )

    const handleToggleSectionWithTracking = useCallback(
      section => {
        handleToggleSection(section)
      },
      [handleToggleSection],
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

    return (
      <>
        <VStack spacing={config.spacing} align="stretch">
          {/* SECTION 1: PERFORMANCE ANALYSIS */}
          {visibleSections.has('performance') && (
            <SectionWrapper>
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
            </SectionWrapper>
          )}



          {/* SECTION 2: CATEGORY BREAKDOWN */}
          {visibleSections.has('system') && (
            <SectionWrapper>
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
            </SectionWrapper>
          )}

          <MotionBox
            variants={itemVariants}
            textAlign="center"
            pt={config.componentPadding.base}
            pb={{ base: 8, md: 10 }}
          >
            <VStack spacing={config.spacing.base}>
              <Box
                bg="rgba(15, 23, 42, 0.3)"
                backdropFilter={isMobile ? 'none' : 'blur(12px)'}
                borderRadius="lg"
                border="1px solid"
                borderColor="rgba(6, 182, 212, 0.4)"
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
                </HStack>
              </Box>

              {/* REMOVED SHARE BUTTON - Only show back button */}
              <Button
                leftIcon={<ArrowLeft size={16} />}
                size={config.buttonSize}
                onClick={goBack}
                bg="gray.700"
                color="whiteAlpha.900"
                borderRadius="md"
                _hover={{ bg: 'gray.600' }}
                w={{ base: 'full', sm: 'auto' }}
                minW={{ base: 'full', sm: '200px' }}
                py={isMobile ? 2.5 : 2}
                h="auto"
              >
                {t('Back to Battles')}
              </Button>
            </VStack>
          </MotionBox>
        </VStack>


      </>
    )
  },
)
AnalysisContent.displayName = 'AnalysisContent'

export default AnalysisContent
