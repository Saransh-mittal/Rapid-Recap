import React, {
  useState,
  useEffect,
  useCallback,
  lazy,
  Suspense,
  memo,
} from 'react'
import {
  Box,
  VStack,
  Heading,
  Text,
  Badge,
  HStack,
  Button,
  Spinner,
  Center,
  Icon,
  useDisclosure,
  Flex,
  SimpleGrid,
  useBreakpointValue,
} from '@chakra-ui/react'
import {
  History,
  Brain,
  XCircle,
  Activity,
  ChevronDown,
  Grid,
  Layers,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import useQuickClash from '../../customHooks/useQuickClash'

// Optimized imports with React.lazy
const ChallengeAnalysisModal = lazy(() => import('./ChallengeAnalysisModal'))
const AnalysisSummaryCard = lazy(() =>
  import('./analysisCard/AnalysisSummaryCard'),
)

// Motion-enhanced components
const MotionBox = motion(Box)
const MotionFlex = motion(Flex)
const MotionButton = motion(Button)
const MotionSimpleGrid = motion(SimpleGrid)

// Loading state component (extracted for clarity)
const LoadingState = memo(() => {
  const { t } = useTranslation('QuickClash')

  return (
    <Center py={6}>
      <MotionBox
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <VStack spacing={4}>
          <Spinner
            size="lg"
            color="blue.400"
            thickness="3px"
            speed="0.8s"
            emptyColor="rgba(26, 32, 58, 0.4)"
          />
          <Text color="blue.100" fontSize="sm" fontWeight="medium">
            {t('Loading analyses...')}
          </Text>
        </VStack>
      </MotionBox>
    </Center>
  )
})

// Error state component (extracted for clarity)
const ErrorState = memo(({ error, onRetry }) => {
  const { t } = useTranslation('QuickClash')

  return (
    <Center py={6}>
      <MotionBox
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        p={4}
        borderRadius="lg"
        bg="rgba(26, 32, 58, 0.85)"
        borderWidth="1px"
        borderColor="red.500"
        maxW="sm"
      >
        <VStack spacing={3}>
          <Icon as={XCircle} color="red.400" boxSize={8} />
          <Text color="whiteAlpha.900" fontSize="sm" textAlign="center">
            {error}
          </Text>
          <MotionButton
            colorScheme="blue"
            size="sm"
            onClick={onRetry}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {t('Retry')}
          </MotionButton>
        </VStack>
      </MotionBox>
    </Center>
  )
})

// Empty state component (extracted for clarity)
const EmptyState = memo(() => {
  const { t } = useTranslation('QuickClash')

  return (
    <Center py={6}>
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        p={5}
        borderRadius="lg"
        bg="rgba(26, 32, 58, 0.85)"
        borderWidth="1px"
        borderColor="blue.700"
        maxW="sm"
        textAlign="center"
      >
        <VStack spacing={4}>
          <Icon as={History} color="blue.400" boxSize={10} />
          <Text color="whiteAlpha.900" fontWeight="medium" fontSize="md">
            {t('No analyses available')}
          </Text>
          <Text color="whiteAlpha.700" fontSize="sm">
            {t('Complete challenges to unlock AI insights')}
          </Text>
        </VStack>
      </MotionBox>
    </Center>
  )
})

// Header component (extracted for clarity)
const Header = memo(
  ({ challengesCount, isGridView, setIsGridView, showGridControls }) => {
    const { t } = useTranslation('QuickClash')

    return (
      <MotionBox
        bg="rgba(26, 32, 58, 0.9)"
        p={{ base: 3, md: 4 }}
        borderRadius="xl"
        boxShadow="0 4px 12px rgba(0, 0, 0, 0.15)"
        borderWidth="1px"
        borderColor="blue.700"
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        position="relative"
        overflow="hidden"
      >
        {/* Background glow effect */}
        <Box
          position="absolute"
          top="0"
          right="0"
          bottom="0"
          left="0"
          bgGradient="radial(circle at top right, rgba(66, 153, 225, 0.1), transparent 70%)"
          zIndex="0"
        />

        <Flex
          position="relative"
          zIndex="1"
          justify="space-between"
          align="center"
          direction={{ base: 'row', md: 'row' }}
          wrap="wrap"
          gap={2}
        >
          <HStack spacing={2}>
            <Icon as={Brain} color="blue.400" boxSize={5} />
            <Heading size="md" color="whiteAlpha.900" fontWeight="bold">
              {t('RR AI Analysis')}
            </Heading>

            <Badge
              borderRadius="full"
              px={2}
              py={1}
              colorScheme="blue"
              fontSize="xs"
            >
              {challengesCount}
            </Badge>
          </HStack>

          {/* Desktop grid/list toggle */}
          {showGridControls && (
            <HStack spacing={2}>
              <MotionButton
                size="sm"
                variant={isGridView ? 'solid' : 'outline'}
                colorScheme="blue"
                leftIcon={<Grid size={14} />}
                onClick={() => setIsGridView(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                iconSpacing={1}
              >
                {t('Grid')}
              </MotionButton>

              <MotionButton
                size="sm"
                variant={!isGridView ? 'solid' : 'outline'}
                colorScheme="blue"
                leftIcon={<Layers size={14} />}
                onClick={() => setIsGridView(false)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                iconSpacing={1}
              >
                {t('List')}
              </MotionButton>
            </HStack>
          )}
        </Flex>
      </MotionBox>
    )
  },
)

// Challenge Card component
const ChallengeCard = memo(
  ({
    challenge,
    analysis,
    userId,
    isAnalysisLoading,
    onViewAnalysis,
    generateAnalysis,
    index,
  }) => {
    const { t } = useTranslation('QuickClash')

    // Memoize the handler to prevent unnecessary re-renders
    const handleViewFullAnalysis = useCallback(() => {
      if (analysis) {
        onViewAnalysis(challenge._id)
      } else {
        generateAnalysis(challenge._id)
        onViewAnalysis(challenge._id)
      }
    }, [analysis, challenge._id, onViewAnalysis, generateAnalysis])

    return (
      <MotionBox
        key={challenge._id}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{
          duration: 0.35,
          delay: index * 0.05,
        }}
      >
        {/* Category and date as part of the card */}
        <Box
          borderRadius="lg"
          overflow="hidden"
          display="flex"
          flexDirection="column"
        >
          <HStack
            justify="space-between"
            fontSize="xs"
            color="whiteAlpha.700"
            mb={1}
            px={1}
          >
            <Text fontWeight="medium">{challenge.category}</Text>
            <Text>{format(new Date(challenge.createdAt), 'dd MMM yyyy')}</Text>
          </HStack>

          <Suspense
            fallback={
              <Center py={12} bg="rgba(26, 21, 39, 0.5)" borderRadius="lg">
                <Spinner size="md" color="blue.400" />
              </Center>
            }
          >
            <AnalysisSummaryCard
              challenge={challenge}
              analysis={analysis}
              userId={userId}
              isLoading={isAnalysisLoading}
              onViewFull={handleViewFullAnalysis}
            />
          </Suspense>
        </Box>
      </MotionBox>
    )
  },
)

// Main CompletedChallenges Component
const CompletedChallenges = () => {
  const { t } = useTranslation('QuickClash')
  const {
    completedChallenges: challenges,
    completedChallengesLoading: loading,
    completedChallengesError: error,
    completedChallengesPage: page,
    completedChallengesHasMore: hasMore,
    loadCompletedChallenges,
    resetCompletedChallengesState,
    fetchChallengeAnalysis,
    generateAnalysis,
    challengeAnalyses,
    challengeAnalysesLoading: analysisLoading,
  } = useQuickClash()

  const { user } = useSelector(state => state.auth)
  const userId = user?._id
  const [selectedAnalysisId, setSelectedAnalysisId] = useState(null)
  const [isGridView, setIsGridView] = useState(true)

  // Responsive layout
  const columns = useBreakpointValue({ base: 1, md: 2, lg: 3, xl: 3 })
  const showGridControls = useBreakpointValue({ base: false, md: true })

  // Modal disclosure for analysis
  const {
    isOpen: isAnalysisOpen,
    onOpen: onAnalysisOpen,
    onClose: onAnalysisClose,
  } = useDisclosure()

  // Memoize handlers to prevent unnecessary re-renders
  const handleViewAnalysis = useCallback(
    challengeId => {
      setSelectedAnalysisId(challengeId)
      onAnalysisOpen()
    },
    [onAnalysisOpen],
  )

  const handleRetry = useCallback(() => {
    loadCompletedChallenges(1, columns === 1 ? 5 : 9)
  }, [loadCompletedChallenges, columns])

  const loadMore = useCallback(() => {
    const nextPage = page + 1
    const itemsPerPage = columns === 1 ? 5 : 6
    loadCompletedChallenges(nextPage, itemsPerPage)
  }, [page, columns, loadCompletedChallenges])

  // Fetch completed challenges
  useEffect(() => {
    if (userId && page === 1) {
      loadCompletedChallenges(page, columns === 1 ? 5 : 9)
    }

    // Cleanup function
    return () => resetCompletedChallengesState()
  }, [userId, columns, resetCompletedChallengesState])

  // Fetch analyses for visible challenges - with debounce for performance
  useEffect(() => {
    if (!challenges.length || !userId) return

    // Create a queue of challenges to fetch analyses for
    const fetchQueue = challenges.map(challenge => challenge._id)

    // Process the queue with a slight delay between each request
    let timeoutId
    const processQueue = () => {
      if (fetchQueue.length === 0) return

      const challengeId = fetchQueue.shift()
      fetchChallengeAnalysis(challengeId)

      timeoutId = setTimeout(processQueue, 200) // 200ms delay between requests
    }

    processQueue()

    // Cleanup timeout on unmount
    return () => clearTimeout(timeoutId)
  }, [challenges, userId, fetchChallengeAnalysis])

  // Loading state
  if (loading && !challenges.length) {
    return <LoadingState />
  }

  // Error state
  if (error && !challenges.length) {
    return <ErrorState error={error} onRetry={handleRetry} />
  }

  // Empty state
  if (!loading && !challenges.length) {
    return <EmptyState />
  }

  return (
    <MotionBox
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      px={{ base: 2, md: 4 }}
    >
      <VStack align="stretch" spacing={5}>
        {/* Header section */}
        <Header
          challengesCount={challenges.length}
          isGridView={isGridView}
          setIsGridView={setIsGridView}
          showGridControls={showGridControls}
        />

        {/* Analysis cards - Responsive Grid/List layout */}
        {isGridView && columns > 1 ? (
          // Grid layout for desktop
          <MotionSimpleGrid
            columns={{ base: 1, md: 2, lg: 3, xl: 3 }}
            spacing={{ base: 3, md: 4 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
          >
            <AnimatePresence>
              {challenges.map((challenge, index) => (
                <ChallengeCard
                  key={challenge._id}
                  challenge={challenge}
                  analysis={challengeAnalyses[challenge._id]}
                  userId={userId}
                  isAnalysisLoading={analysisLoading[challenge._id]}
                  onViewAnalysis={handleViewAnalysis}
                  generateAnalysis={generateAnalysis}
                  index={index}
                />
              ))}
            </AnimatePresence>
          </MotionSimpleGrid>
        ) : (
          // List layout for mobile
          <VStack align="stretch" spacing={3} mt={1}>
            <AnimatePresence>
              {challenges.map((challenge, index) => (
                <ChallengeCard
                  key={challenge._id}
                  challenge={challenge}
                  analysis={challengeAnalyses[challenge._id]}
                  userId={userId}
                  isAnalysisLoading={analysisLoading[challenge._id]}
                  onViewAnalysis={handleViewAnalysis}
                  generateAnalysis={generateAnalysis}
                  index={index}
                />
              ))}
            </AnimatePresence>
          </VStack>
        )}

        {/* Load more button */}
        {hasMore && (
          <Center py={4}>
            <MotionButton
              onClick={loadMore}
              isLoading={loading}
              colorScheme="blue"
              variant="outline"
              size="sm"
              leftIcon={<Activity size={14} />}
              rightIcon={<ChevronDown size={14} />}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {t('Load More')}
            </MotionButton>
          </Center>
        )}
      </VStack>

      {/* Analysis Modal */}
      {selectedAnalysisId && (
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
            challengeId={selectedAnalysisId}
          />
        </Suspense>
      )}
    </MotionBox>
  )
}

export default memo(CompletedChallenges)
