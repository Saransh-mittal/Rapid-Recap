// components/quickClashComponents/team/battleAnalysis/TeamBattleAnalysis.jsx
import React, { useEffect, useMemo, useState } from 'react'
import {
  Box,
  VStack,
  Button,
  Spinner,
  Center,
  Text,
  Icon,
  useBreakpointValue,
  useDisclosure,
  Container,
  Flex,
  HStack,
  Progress,
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import {
  ArrowLeft,
  AlertTriangle,
  Sparkles,
  Trophy,
  Clock,
  Brain,
  Activity,
} from 'lucide-react'
import { useSelector } from 'react-redux'

// Custom hooks
import useQuickClashAnalysis from '../../../../customHooks/useQuickClashAnalysis'

// Enhanced Component imports
import BattleResultBanner from './components/BattleResultBanner'
import TrophyExchangeSummary from './components/TrophyExchangeSummary'
import AIInsights from './components/aiInsights/AIInsights'
import TeamContributionSection from './components/TeamContributionSection'
import CategoryBreakdownSection from './components/CategoryBreakdownSection'
import DetailedBonusExplanation from './components/DetailedBonusExplanation'
import ShareResultsModal from './components/ShareResultsModal'
import MVPRecognition from './components/MVPRecognition'

const MotionBox = motion(Box)
const MotionContainer = motion(Container)

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
      duration: 0.6,
    },
  },
}

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 30,
    scale: 0.98,
    filter: 'blur(5px)',
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      type: 'spring',
      stiffness: 80,
      damping: 15,
      duration: 0.8,
    },
  },
}

const floatingVariants = {
  animate: {
    y: [0, -10, 0], // Subtle float
    rotate: [0, 3, 0, -3, 0], // Gentle sway
    transition: {
      duration: 5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
}

/**
 * Loading Screen Component with Enhanced Animation
 */
const LoadingScreen = ({ progress, step }) => {
  const { t } = useTranslation('QuickClash')

  return (
    <Box minH="100vh" position="relative" bg="gray.900">
      <Center minH="100vh" p={4}>
        <VStack spacing={10} maxW="md" w="full">
          <MotionBox
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.8, 1, 0.8],
              rotate: [0, 120, 240, 360],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          >
            <Box
              position="relative"
              p={6}
              borderRadius="full"
              bg="rgba(139, 92, 246, 0.15)"
              border="3px solid"
              borderColor="purple.500"
              boxShadow="0 0 30px rgba(139, 92, 246, 0.5)"
            >
              <Spinner
                thickness="4px"
                speed="0.7s"
                emptyColor="rgba(255,255,255,0.05)"
                color="purple.400"
                size="xl"
              />
              <Icon
                as={Brain}
                position="absolute"
                top="50%"
                left="50%"
                transform="translate(-50%, -50%)"
                color="purple.300"
                boxSize={10}
              />
            </Box>
          </MotionBox>

          <VStack spacing={5} textAlign="center" w="100%">
            <VStack spacing={2}>
              <Text
                color="whiteAlpha.900"
                fontSize={{ base: 'xl', md: '2xl' }}
                fontWeight="bold"
                letterSpacing="tight"
              >
                {t('Analyzing Battle')}
              </Text>
              <AnimatePresence mode="wait">
                <MotionBox
                  key={step}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                >
                  <Text
                    color="whiteAlpha.700"
                    fontSize={{ base: 'md', md: 'lg' }}
                  >
                    {step || t('Loading battle data...')}
                  </Text>
                </MotionBox>
              </AnimatePresence>
            </VStack>

            <Box w="100%">
              <Progress
                value={progress}
                size="lg"
                borderRadius="full"
                bg="rgba(255, 255, 255, 0.1)"
                sx={{
                  '& > div': {
                    background:
                      'linear-gradient(90deg, #A855F7, #C084FC, #D8B4FE)',
                    boxShadow: '0 0 15px rgba(168, 85, 247, 0.5)',
                  },
                }}
              />
              <HStack justify="space-between" mt={2.5}>
                <Text fontSize="xs" color="whiteAlpha.600">
                  0%
                </Text>
                <Text fontSize="xs" color="purple.300" fontWeight="bold">
                  {progress}%
                </Text>
                <Text fontSize="xs" color="whiteAlpha.600">
                  100%
                </Text>
              </HStack>
            </Box>

            <Box
              mt={6}
              p={4}
              bg="rgba(255, 255, 255, 0.05)"
              borderRadius="xl"
              border="1px solid rgba(255, 255, 255, 0.1)"
              w="full"
            >
              <HStack spacing={3}>
                <Icon as={Sparkles} color="purple.400" boxSize={5} />
                <Text fontSize="sm" color="whiteAlpha.800">
                  {t('BattleSage AI is preparing personalized insights')}
                </Text>
              </HStack>
            </Box>
          </VStack>
        </VStack>
      </Center>
    </Box>
  )
}

/**
 * Main TeamBattleAnalysis Component
 */
const TeamBattleAnalysis = () => {
  const { t } = useTranslation('QuickClash')
  const { battleId } = useParams()
  const { user } = useSelector(state => state.auth)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [analysisStep, setAnalysisStep] = useState('')
  const {
    isOpen: isShareOpen,
    onOpen: openShare,
    onClose: closeShare,
  } = useDisclosure()

  const spacing = useBreakpointValue({ base: 6, md: 8, lg: 10 })
  const containerMaxW = useBreakpointValue({
    base: 'full',
    md: 'container.lg',
    xl: 'container.xl',
  })
  const containerPx = useBreakpointValue({ base: 4, sm: 6, md: 8 })

  const {
    currentBattleAnalysis: battle,
    userTeam,
    aiInsights,
    battleRecap,
    followUpQuestions,
    battleAnalysisLoading,
    battleAnalysisError,
    getBattleAnalysis,
    goBack,
    expandedSections,
    handleToggleSection,
    submitInsightFeedbackToServer,
    clearAnalysis,
    mvpAwards,
    simplifiedTrophyData,
    enhancedMemberPerformance,
  } = useQuickClashAnalysis()

  // Enhanced loading sequence
  useEffect(() => {
    if (battleId) {
      const steps = [
        { step: t('Connecting to battle data...'), progress: 15 },
        { step: t('Loading team performance metrics...'), progress: 30 },
        { step: t('Analyzing battle patterns...'), progress: 45 },
        { step: t('Processing team dynamics...'), progress: 60 },
        { step: t('Identifying key moments...'), progress: 75 },
        { step: t('Generating BattleSage AI insights...'), progress: 90 },
        { step: t('Finalizing personalized analysis...'), progress: 100 },
      ]

      setLoadingProgress(0)
      setAnalysisStep(steps[0].step)
      let currentStepIndex = 0

      const stepInterval = setInterval(() => {
        currentStepIndex++
        if (currentStepIndex < steps.length) {
          setAnalysisStep(steps[currentStepIndex].step)
          setLoadingProgress(steps[currentStepIndex].progress)
        } else {
          clearInterval(stepInterval)
        }
      }, 400) // Slightly faster steps

      getBattleAnalysis(battleId).catch(err => {
        clearInterval(stepInterval)
      })

      return () => {
        clearInterval(stepInterval)
      }
    }
  }, [battleId, getBattleAnalysis, t])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearAnalysis()
    }
  }, [clearAnalysis])

  const userMemberData = useMemo(() => {
    if (!battle || !user || !userTeam) return null
    const teamMembers =
      userTeam === 'teamA' ? battle.teamAMembers : battle.teamBMembers
    return teamMembers.find(
      member => member.user && member.user._id === user._id,
    )
  }, [battle, user, userTeam])

  if (battleAnalysisLoading && !battle) {
    return <LoadingScreen progress={loadingProgress} step={analysisStep} />
  }

  if (battleAnalysisError && !battle) {
    return (
      <Box minH="100vh" position="relative" bg="gray.900">
        <Center minH="100vh" p={4}>
          <VStack spacing={8} maxW="md" textAlign="center">
            <MotionBox
              initial={{ scale: 0.5, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 150, damping: 12 }}
            >
              <Box
                p={6}
                borderRadius="full"
                bg="rgba(239, 68, 68, 0.15)"
                border="3px solid"
                borderColor="red.500"
                boxShadow="0 0 30px rgba(239, 68, 68, 0.5)"
              >
                <Icon as={AlertTriangle} color="red.400" boxSize={12} />
              </Box>
            </MotionBox>
            <VStack spacing={4}>
              <Text
                color="red.400"
                fontSize={{ base: 'xl', md: '2xl' }}
                fontWeight="bold"
              >
                {t('Analysis Failed')}
              </Text>
              <Text
                color="whiteAlpha.800"
                fontSize={{ base: 'md', md: 'lg' }}
                maxW="sm"
              >
                {battleAnalysisError}
              </Text>
              <Button
                leftIcon={<ArrowLeft size={18} />}
                colorScheme="purple"
                size="lg"
                onClick={goBack}
                bgGradient="linear(to-r, purple.500, purple.600)"
                borderRadius="xl"
                px={8}
                py={6}
                mt={4}
                _hover={{
                  bgGradient: 'linear(to-r, purple.600, purple.700)',
                  transform: 'translateY(-3px)',
                  boxShadow: '0 10px 25px rgba(139, 92, 246, 0.4)',
                }}
                _active={{ transform: 'translateY(-1px)' }}
                transition="all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
              >
                {t('Back to Battles')}
              </Button>
            </VStack>
          </VStack>
        </Center>
      </Box>
    )
  }

  if (!battle || !userTeam) {
    return (
      <Box minH="100vh" position="relative" bg="gray.900">
        <Center minH="100vh" p={4}>
          <VStack spacing={8} textAlign="center" maxW="md">
            <MotionBox variants={floatingVariants} animate="animate">
              <Box
                p={6}
                borderRadius="full"
                bg="rgba(245, 158, 11, 0.15)"
                border="3px solid"
                borderColor="yellow.500"
                boxShadow="0 0 30px rgba(245, 158, 11, 0.5)"
              >
                <Icon as={AlertTriangle} color="yellow.400" boxSize={12} />
              </Box>
            </MotionBox>
            <VStack spacing={4}>
              <Text
                color="yellow.400"
                fontSize={{ base: 'xl', md: '2xl' }}
                fontWeight="bold"
              >
                {t('Battle Not Found')}
              </Text>
              <Text
                color="whiteAlpha.800"
                fontSize={{ base: 'md', md: 'lg' }}
                maxW="sm"
              >
                {t(
                  'This battle analysis is no longer available or could not be loaded.',
                )}
              </Text>
              <Button
                leftIcon={<ArrowLeft size={18} />}
                colorScheme="purple"
                size="lg"
                onClick={goBack}
                bgGradient="linear(to-r, purple.500, purple.600)"
                borderRadius="xl"
                px={8}
                py={6}
                mt={4}
                _hover={{
                  bgGradient: 'linear(to-r, purple.600, purple.700)',
                  transform: 'translateY(-3px)',
                  boxShadow: '0 10px 25px rgba(139, 92, 246, 0.4)',
                }}
                _active={{ transform: 'translateY(-1px)' }}
                transition="all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
              >
                {t('Back to Battles')}
              </Button>
            </VStack>
          </VStack>
        </Center>
      </Box>
    )
  }

  // Main Content Render
  return (
    <Box
      minH="100vh"
      position="relative"
      overflowX="hidden"
      bg="gray.900"
      pb={2}
    >
      {/* Subtle Animated background elements */}
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        zIndex={0}
        overflow="hidden"
      >
        <MotionBox
          position="absolute"
          top="10%"
          left="5%"
          w={{ base: '100px', md: '150px' }}
          h={{ base: '100px', md: '150px' }}
          bg="purple.700"
          borderRadius="full"
          opacity={0.15}
          filter="blur(60px)"
          animate={{
            x: [0, 20, 0, -20, 0],
            y: [0, -20, 0, 20, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />
        <MotionBox
          position="absolute"
          bottom="15%"
          right="8%"
          w={{ base: '120px', md: '180px' }}
          h={{ base: '120px', md: '180px' }}
          bg="pink.600"
          borderRadius="full"
          opacity={0.1}
          filter="blur(70px)"
          animate={{
            x: [0, -15, 0, 15, 0],
            y: [0, 15, 0, -15, 0],
            rotate: [0, 90, 180, 270, 360],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />
      </Box>

      <MotionContainer
        maxW={containerMaxW}
        px={containerPx}
        pt={{ base: 6, md: 8 }}
        position="relative"
        zIndex={1}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <MotionBox variants={itemVariants} mb={{ base: 6, md: 8 }}>
          <Button
            leftIcon={<ArrowLeft size={18} />}
            variant="outline"
            onClick={goBack}
            color="whiteAlpha.800"
            borderColor="whiteAlpha.300"
            borderRadius="xl"
            px={{ base: 5, md: 6 }}
            py={{ base: 5, md: 6 }}
            fontSize={{ base: 'sm', md: 'md' }}
            fontWeight="medium"
            _hover={{
              bg: 'rgba(255, 255, 255, 0.1)',
              borderColor: 'purple.400',
              color: 'white',
              transform: 'translateX(-2px)',
              boxShadow: '0 8px 20px rgba(139, 92, 246, 0.25)',
            }}
            _active={{ transform: 'translateX(0)' }}
            transition="all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
          >
            {t('Back to Battles')}
          </Button>
        </MotionBox>

        <VStack spacing={spacing} align="stretch">
          <MotionBox variants={itemVariants}>
            <BattleResultBanner
              battle={battle}
              userTeam={userTeam}
              onShare={openShare}
            />
          </MotionBox>

          <MotionBox variants={itemVariants}>
            <TrophyExchangeSummary
              battle={battle}
              userTeam={userTeam}
              userMemberData={userMemberData}
              isExpanded={expandedSections.trophies}
              onToggle={() => handleToggleSection('trophies')}
              simplifiedTrophyData={simplifiedTrophyData}
            />
          </MotionBox>

          {/* NEW MVP RECOGNITION COMPONENT */}
          {(mvpAwards.matchMVP ||
            mvpAwards.teamMVP ||
            mvpAwards.pivotalPlayer ||
            (mvpAwards.performanceRecognitions &&
              mvpAwards.performanceRecognitions.length > 0)) && (
            <MotionBox variants={itemVariants}>
              <MVPRecognition
                mvpAwards={mvpAwards}
                userTeam={userTeam}
                isExpanded={expandedSections.mvpRecognition}
                onToggle={() => handleToggleSection('mvpRecognition')}
              />
            </MotionBox>
          )}

          {(battleRecap ||
            followUpQuestions ||
            (aiInsights && aiInsights.length > 0)) && (
            <MotionBox variants={itemVariants}>
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
            </MotionBox>
          )}

          {user && user._id && (
            <MotionBox variants={itemVariants}>
              <TeamContributionSection
                battle={battle}
                userTeam={userTeam}
                userId={user._id}
                isExpanded={expandedSections.teamPerformance}
                onToggle={() => handleToggleSection('teamPerformance')}
                enhancedMemberPerformance={enhancedMemberPerformance}
                mvpAwards={mvpAwards}
              />
            </MotionBox>
          )}

          <MotionBox variants={itemVariants}>
            <CategoryBreakdownSection
              battle={battle}
              userTeam={userTeam}
              userMemberData={userMemberData}
              isExpanded={expandedSections.categoryBreakdown}
              onToggle={() => handleToggleSection('categoryBreakdown')}
            />
          </MotionBox>

          {simplifiedTrophyData.activeBonuses &&
            simplifiedTrophyData.activeBonuses.length > 0 && (
              <MotionBox variants={itemVariants}>
                <DetailedBonusExplanation
                  trophyExchange={battle.trophyExchange}
                  isExpanded={expandedSections.bonuses}
                  onToggle={() => handleToggleSection('bonuses')}
                  simplifiedData={simplifiedTrophyData}
                />
              </MotionBox>
            )}

          <MotionBox
            variants={itemVariants}
            textAlign="center"
            pt={{ base: 8, md: 10 }}
            pb={{ base: 10, md: 12 }}
          >
            <VStack spacing={{ base: 6, md: 8 }}>
              <Box
                bg="rgba(139, 92, 246, 0.1)"
                backdropFilter="blur(15px)"
                borderRadius="2xl"
                border="1px solid rgba(139, 92, 246, 0.3)"
                p={{ base: 5, md: 6 }}
                maxW="lg"
                w="full"
                mx="auto"
                boxShadow="0 8px 25px rgba(0,0,0,0.2)"
              >
                <HStack
                  justify="space-around"
                  spacing={{ base: 4, md: 6 }}
                  flexWrap="wrap"
                >
                  <VStack>
                    <Icon as={Trophy} color="purple.300" boxSize={5} />
                    <Text color="white" fontWeight="bold" fontSize="lg">
                      {userMemberData?.score || 0}
                    </Text>
                    <Text color="whiteAlpha.700" fontSize="xs">
                      {t('Your Score')}
                    </Text>
                  </VStack>
                  <VStack>
                    <Icon
                      as={
                        (userMemberData?.trophyChange || 0) >= 0
                          ? Trophy
                          : AlertTriangle
                      }
                      color={
                        (userMemberData?.trophyChange || 0) >= 0
                          ? 'green.400'
                          : 'red.400'
                      }
                      boxSize={5}
                    />
                    <Text color="white" fontWeight="bold" fontSize="lg">
                      {userMemberData?.trophyChange > 0 ? '+' : ''}
                      {userMemberData?.trophyChange || 0}
                    </Text>
                    <Text color="whiteAlpha.700" fontSize="xs">
                      {t('Trophy Change')}
                    </Text>
                  </VStack>
                  <VStack>
                    <Icon as={Clock} color="blue.400" boxSize={5} />
                    <Text color="white" fontWeight="bold" fontSize="lg">
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
                gap={{ base: 4, md: 6 }}
                wrap="wrap"
                direction={{ base: 'column', sm: 'row' }}
                w="full"
              >
                <Button
                  leftIcon={<ArrowLeft size={18} />}
                  size="lg"
                  onClick={goBack}
                  bgGradient="linear(to-r, purple.500, purple.600)"
                  color="white"
                  borderRadius="xl"
                  px={{ base: 8, md: 10 }}
                  py={{ base: 6, md: 7 }}
                  fontSize={{ base: 'md', md: 'lg' }}
                  fontWeight="medium"
                  _hover={{
                    bgGradient: 'linear(to-r, purple.600, purple.700)',
                    transform: 'translateY(-3px)',
                    boxShadow: '0 12px 30px rgba(139, 92, 246, 0.45)',
                  }}
                  _active={{ transform: 'translateY(-1px)' }}
                  transition="all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
                  boxShadow="0 8px 20px rgba(139, 92, 246, 0.3)"
                  w={{ base: 'full', sm: 'auto' }}
                >
                  {t('Back to Battles')}
                </Button>
                <Button
                  leftIcon={<Sparkles size={18} />}
                  variant="outline"
                  size="lg"
                  onClick={openShare}
                  borderColor="purple.400"
                  color="purple.300"
                  borderRadius="xl"
                  px={{ base: 8, md: 10 }}
                  py={{ base: 6, md: 7 }}
                  fontSize={{ base: 'md', md: 'lg' }}
                  fontWeight="medium"
                  _hover={{
                    bg: 'rgba(139, 92, 246, 0.15)',
                    borderColor: 'purple.300',
                    color: 'purple.200',
                    transform: 'translateY(-3px)',
                    boxShadow: '0 12px 30px rgba(139, 92, 246, 0.3)',
                  }}
                  _active={{ transform: 'translateY(-1px)' }}
                  transition="all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
                  w={{ base: 'full', sm: 'auto' }}
                >
                  {t('Share Analysis')}
                </Button>
              </Flex>
            </VStack>
          </MotionBox>
        </VStack>
      </MotionContainer>

      {isShareOpen && battle && (
        <ShareResultsModal
          isOpen={isShareOpen}
          onClose={closeShare}
          battle={battle}
          userTeam={userTeam}
        />
      )}
    </Box>
  )
}

export default TeamBattleAnalysis
