// components/quickClashComponents/StatusSection.jsx
import React, {
  memo,
  useCallback,
  useState,
  useEffect,
  useRef,
  useMemo,
} from 'react'
import {
  Box,
  Heading,
  HStack,
  Icon,
  Grid,
  GridItem,
  VStack,
  useBreakpointValue,
  Collapse,
  Button,
  Text,
  useDisclosure,
  Flex,
  Skeleton,
  SkeletonCircle,
  Avatar,
} from '@chakra-ui/react'
import { ChevronDown, ChevronUp, Trophy } from 'lucide-react'
import ChallengeItem from './ChallengeItem'
import FlippableChallengeItem from './FlippableChallengeItem'
import DateGroupHeader from './DateGroupHeader'
import {
  groupChallengesByDate,
  sortDateKeys,
} from '../../utils/dateGroupingUtils'
import { useTranslation } from 'react-i18next'

// Progressive rendering configuration
const PROGRESSIVE_CONFIG = {
  initialRenderCount: 6, // Render first 6 items immediately
  batchSize: 4, // Render 4 more items each time
  intersectionThreshold: 0.1, // Trigger when 10% visible
  rootMargin: '100px', // Start loading 100px before coming into view
}

// Aesthetic challenge item skeleton that matches your app design
const AestheticChallengeItemSkeleton = memo(() => {
  const padding = useBreakpointValue({ base: 2, md: 3 })

  return (
    <Box
      bg="rgba(26, 32, 44, 0.8)"
      borderRadius="lg"
      overflow="hidden"
      borderWidth="1px"
      borderColor="whiteAlpha.100"
      position="relative"
      minHeight="220px"
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background:
          'linear-gradient(135deg, rgba(124, 58, 237, 0.02), transparent)',
        opacity: 0.7,
        pointerEvents: 'none',
        borderRadius: 'lg',
      }}
    >
      {/* Header Section - Status and Category */}
      <Flex
        p={padding}
        justify="space-between"
        align="center"
        borderBottomWidth="1px"
        borderBottomColor="whiteAlpha.100"
        bg="rgba(45, 55, 72, 0.3)"
      >
        {/* Status Badge Skeleton */}
        <Skeleton
          height="24px"
          width="80px"
          borderRadius="full"
          startColor="rgba(72, 187, 120, 0.1)"
          endColor="rgba(72, 187, 120, 0.3)"
        />

        {/* Category Tag Skeleton */}
        <Skeleton
          height="24px"
          width="70px"
          borderRadius="full"
          startColor="rgba(66, 153, 225, 0.1)"
          endColor="rgba(66, 153, 225, 0.3)"
        />
      </Flex>

      {/* Main Content */}
      <Box p={padding}>
        <VStack spacing={2} align="stretch">
          {/* User Player Section */}
          <Box
            bg="rgba(124, 58, 237, 0.1)"
            borderRadius="lg"
            p={3}
            borderWidth="1px"
            borderColor="rgba(124, 58, 237, 0.2)"
          >
            <HStack spacing={3}>
              <SkeletonCircle
                size="40px"
                startColor="rgba(124, 58, 237, 0.2)"
                endColor="rgba(124, 58, 237, 0.4)"
              />
              <VStack align="flex-start" flex={1} spacing={1}>
                <HStack>
                  <Skeleton
                    height="16px"
                    width="120px"
                    borderRadius="md"
                    startColor="rgba(255, 255, 255, 0.1)"
                    endColor="rgba(255, 255, 255, 0.2)"
                  />
                  <Skeleton
                    height="18px"
                    width="35px"
                    borderRadius="full"
                    startColor="rgba(124, 58, 237, 0.3)"
                    endColor="rgba(124, 58, 237, 0.5)"
                  />
                </HStack>
                <HStack spacing={2}>
                  <Icon as={Trophy} color="yellow.400" boxSize={3} />
                  <Skeleton
                    height="12px"
                    width="40px"
                    borderRadius="md"
                    startColor="rgba(255, 193, 7, 0.2)"
                    endColor="rgba(255, 193, 7, 0.4)"
                  />
                </HStack>
              </VStack>
              <Skeleton
                height="24px"
                width="24px"
                borderRadius="full"
                startColor="rgba(66, 153, 225, 0.2)"
                endColor="rgba(66, 153, 225, 0.4)"
              />
            </HStack>
          </Box>

          {/* VS Line */}
          <Flex align="center" justify="center" py={2}>
            <Box
              bg="rgba(255, 255, 255, 0.1)"
              borderRadius="full"
              px={4}
              py={1}
            >
              <Text fontSize="sm" color="gray.400" fontWeight="medium">
                VS
              </Text>
            </Box>
          </Flex>

          {/* Opponent Player Section */}
          <Box
            bg="rgba(45, 55, 72, 0.4)"
            borderRadius="lg"
            p={3}
            borderWidth="1px"
            borderColor="whiteAlpha.100"
          >
            <HStack spacing={3}>
              <SkeletonCircle
                size="40px"
                startColor="rgba(107, 114, 128, 0.2)"
                endColor="rgba(107, 114, 128, 0.4)"
              />
              <VStack align="flex-start" flex={1} spacing={1}>
                <Skeleton
                  height="16px"
                  width="100px"
                  borderRadius="md"
                  startColor="rgba(255, 255, 255, 0.1)"
                  endColor="rgba(255, 255, 255, 0.2)"
                />
                <HStack spacing={2}>
                  <Icon as={Trophy} color="yellow.400" boxSize={3} />
                  <Skeleton
                    height="12px"
                    width="35px"
                    borderRadius="md"
                    startColor="rgba(255, 193, 7, 0.2)"
                    endColor="rgba(255, 193, 7, 0.4)"
                  />
                </HStack>
              </VStack>
              <Skeleton
                height="24px"
                width="24px"
                borderRadius="full"
                startColor="rgba(107, 114, 128, 0.2)"
                endColor="rgba(107, 114, 128, 0.4)"
              />
            </HStack>
          </Box>

          {/* Action Section */}
          <Flex
            justify="center"
            mt={3}
            p={3}
            bg="rgba(255, 255, 255, 0.02)"
            borderRadius="md"
            borderWidth="1px"
            borderColor="whiteAlpha.50"
          >
            <HStack spacing={3}>
              {/* Trophy Gain Indicator Skeleton */}
              <HStack
                bg="rgba(255, 193, 7, 0.1)"
                borderRadius="full"
                px={3}
                py={1.5}
                borderWidth="1px"
                borderColor="rgba(255, 193, 7, 0.3)"
              >
                <Icon as={Trophy} color="yellow.400" boxSize={4} />
                <Skeleton
                  height="14px"
                  width="25px"
                  borderRadius="md"
                  startColor="rgba(255, 193, 7, 0.2)"
                  endColor="rgba(255, 193, 7, 0.5)"
                />
              </HStack>

              {/* Action Button Skeleton */}
              <Skeleton
                height="36px"
                width="100px"
                borderRadius="md"
                startColor="rgba(72, 187, 120, 0.2)"
                endColor="rgba(72, 187, 120, 0.5)"
              />
            </HStack>
          </Flex>
        </VStack>
      </Box>
    </Box>
  )
})

// Progressive challenge renderer with intersection observer
const ProgressiveChallengeRenderer = memo(
  ({
    challenge,
    userId,
    handlers,
    index,
    revengeLoading,
    isVisible,
    onVisibilityChange,
    shouldRender,
  }) => {
    const elementRef = useRef()

    // Setup intersection observer for this item
    useEffect(() => {
      if (!elementRef.current || shouldRender) return

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            onVisibilityChange(index, true)
            observer.disconnect() // Stop observing once visible
          }
        },
        {
          threshold: PROGRESSIVE_CONFIG.intersectionThreshold,
          rootMargin: PROGRESSIVE_CONFIG.rootMargin,
        },
      )

      observer.observe(elementRef.current)

      return () => observer.disconnect()
    }, [index, onVisibilityChange, shouldRender])

    // Determine if this challenge should use flippable component
    const isFlippable = useMemo(
      () =>
        challenge.status === 'completed' &&
        challenge.challengerAttempted &&
        challenge.opponentAttempted,
      [challenge],
    )

    return (
      <Box ref={elementRef} minHeight="220px">
        {shouldRender ? (
          isFlippable ? (
            <FlippableChallengeItem
              challenge={challenge}
              userId={userId}
              onAccept={handlers.onAccept}
              onDecline={handlers.onDecline}
              onStart={handlers.onStart}
              onViewReport={handlers.onViewReport}
              onRevenge={handlers.onRevenge}
              index={index}
              revengeLoading={revengeLoading}
            />
          ) : (
            <ChallengeItem
              challenge={challenge}
              userId={userId}
              onAccept={handlers.onAccept}
              onDecline={handlers.onDecline}
              onStart={handlers.onStart}
              onViewReport={handlers.onViewReport}
              onRevenge={handlers.onRevenge}
              index={index}
              revengeLoading={revengeLoading}
            />
          )
        ) : (
          <AestheticChallengeItemSkeleton />
        )}
      </Box>
    )
  },
)

// Progressive challenge grid component
const ProgressiveChallengeGrid = memo(
  ({ challenges, columns, spacing, userId, handlers, revengeLoading }) => {
    const [visibleItems, setVisibleItems] = useState(new Set())
    const [renderCount, setRenderCount] = useState(
      PROGRESSIVE_CONFIG.initialRenderCount,
    )

    // Initialize with first batch
    useEffect(() => {
      const initialItems = new Set()
      for (
        let i = 0;
        i < Math.min(PROGRESSIVE_CONFIG.initialRenderCount, challenges.length);
        i++
      ) {
        initialItems.add(i)
      }
      setVisibleItems(initialItems)
    }, [challenges.length])

    // Handle item visibility change
    const handleVisibilityChange = useCallback((index, isVisible) => {
      if (isVisible) {
        setVisibleItems(prev => {
          const newSet = new Set(prev)
          newSet.add(index)
          return newSet
        })
      }
    }, [])

    // Batch render more items when approaching the end
    useEffect(() => {
      const visibleCount = visibleItems.size
      const shouldLoadMore =
        visibleCount > renderCount - PROGRESSIVE_CONFIG.batchSize

      if (shouldLoadMore && renderCount < challenges.length) {
        const newRenderCount = Math.min(
          renderCount + PROGRESSIVE_CONFIG.batchSize,
          challenges.length,
        )
        setRenderCount(newRenderCount)

        // Preemptively mark next batch as renderable
        setVisibleItems(prev => {
          const newSet = new Set(prev)
          for (let i = renderCount; i < newRenderCount; i++) {
            newSet.add(i)
          }
          return newSet
        })
      }
    }, [visibleItems.size, renderCount, challenges.length])

    if (!challenges?.length) return null

    return (
      <Grid templateColumns={`repeat(${columns}, 1fr)`} gap={spacing}>
        {challenges.map((challenge, index) => (
          <GridItem key={challenge._id}>
            <ProgressiveChallengeRenderer
              challenge={challenge}
              userId={userId}
              handlers={handlers}
              index={index}
              revengeLoading={revengeLoading}
              isVisible={visibleItems.has(index)}
              onVisibilityChange={handleVisibilityChange}
              shouldRender={visibleItems.has(index)}
            />
          </GridItem>
        ))}
      </Grid>
    )
  },
)

// Progressive date-grouped content
const ProgressiveDateGroupedContent = memo(
  ({
    dateGroupedChallenges,
    sortedDateKeys,
    columns,
    spacing,
    userId,
    handlers,
    revengeLoading,
  }) => {
    if (!sortedDateKeys?.length) return null

    return (
      <VStack align="stretch" spacing={spacing}>
        {sortedDateKeys.map((dateKey, dateIndex) => (
          <Box key={dateKey}>
            <DateGroupHeader date={dateKey} index={dateIndex} />
            <Box mt={2}>
              <ProgressiveChallengeGrid
                challenges={dateGroupedChallenges[dateKey]}
                columns={columns}
                spacing={spacing}
                userId={userId}
                handlers={handlers}
                revengeLoading={revengeLoading}
              />
            </Box>
          </Box>
        ))}
      </VStack>
    )
  },
)

/**
 * Optimized StatusSection with progressive rendering and aesthetic skeleton loaders
 * - Maintains exact original design with performance improvements
 * - Progressive rendering of challenge items as they come into view
 * - Beautiful skeleton loaders that match the app's design aesthetic
 * - Reduced initial render time and memory usage
 * - Smooth scrolling even with many challenges
 * - Intersection Observer for efficient visibility detection
 */
const StatusSection = memo(
  ({
    title,
    icon,
    challenges,
    userId,
    handlers,
    animationDelay = 0,
    revengeLoading,
  }) => {
    const { t } = useTranslation('QuickClash')
    const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: true })

    // Responsive styling - keep original breakpoints and values
    const columns = useBreakpointValue({
      base: 1,
      sm: title === t('Completed') ? 1 : 2,
      md: title === t('Completed') ? 2 : 2,
      lg: title === t('Completed') ? 2 : 3,
      xl: title === t('Completed') ? 3 : 3,
    })
    const spacing = useBreakpointValue({ base: 3, md: 4 })
    const iconSize = useBreakpointValue({ base: 4, md: 5 })
    const headingSize = useBreakpointValue({ base: 'xs', md: 'sm' })

    // Early return if no challenges - keep original logic
    if (!challenges || challenges.length === 0) return null

    const { onAccept, onDecline, onStart, onViewReport, onRevenge } = handlers

    // Group completed challenges by date - keep original logic
    const isCompletedSection = title === t('Completed')
    const dateGroupedChallenges = useMemo(
      () => (isCompletedSection ? groupChallengesByDate(challenges, t) : null),
      [challenges, isCompletedSection, t],
    )

    const sortedDateKeys = useMemo(
      () =>
        isCompletedSection && dateGroupedChallenges
          ? sortDateKeys(Object.keys(dateGroupedChallenges), t)
          : null,
      [dateGroupedChallenges, isCompletedSection, t],
    )

    // Memoize section content for better performance
    const sectionContent = useMemo(() => {
      if (!isOpen) return null

      if (isCompletedSection) {
        return (
          <ProgressiveDateGroupedContent
            dateGroupedChallenges={dateGroupedChallenges}
            sortedDateKeys={sortedDateKeys}
            columns={columns}
            spacing={spacing}
            userId={userId}
            handlers={handlers}
            revengeLoading={revengeLoading}
          />
        )
      }

      return (
        <ProgressiveChallengeGrid
          challenges={challenges}
          columns={columns}
          spacing={spacing}
          userId={userId}
          handlers={handlers}
          revengeLoading={revengeLoading}
        />
      )
    }, [
      isOpen,
      isCompletedSection,
      dateGroupedChallenges,
      sortedDateKeys,
      challenges,
      columns,
      spacing,
      userId,
      handlers,
      revengeLoading,
    ])

    return (
      <Box
        className="status-section"
        data-testid={`status-section-${title
          .toLowerCase()
          .replace(/\s+/g, '-')}`}
        bg="rgba(26, 32, 44, 0.4)"
        borderRadius="lg"
        p={3}
        mb={4}
        borderWidth="1px"
        borderColor="whiteAlpha.100"
        transition="all 0.2s"
        _hover={{
          borderColor: 'whiteAlpha.200',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        }}
      >
        {/* Section Header with toggle - keep original design */}
        <Flex
          mb={isOpen ? 3 : 0}
          justify="space-between"
          align="center"
          onClick={onToggle}
          cursor="pointer"
          p={2}
          borderRadius="md"
          _hover={{ bg: 'whiteAlpha.50' }}
        >
          <HStack spacing={2}>
            <Icon as={icon} color="purple.400" boxSize={iconSize} />
            <Heading size={headingSize} color="white">
              {title} ({challenges.length})
            </Heading>
          </HStack>

          <Button
            size="sm"
            variant="ghost"
            colorScheme="purple"
            p={1}
            minW="auto"
            h="auto"
          >
            <Icon
              as={isOpen ? ChevronUp : ChevronDown}
              boxSize={4}
              color="whiteAlpha.700"
            />
          </Button>
        </Flex>

        {/* Keep original Collapse component and animation */}
        <Collapse in={isOpen} animateOpacity>
          {sectionContent}
        </Collapse>
      </Box>
    )
  },
)

// Set display names for debugging
AestheticChallengeItemSkeleton.displayName = 'AestheticChallengeItemSkeleton'
ProgressiveChallengeRenderer.displayName = 'ProgressiveChallengeRenderer'
ProgressiveChallengeGrid.displayName = 'ProgressiveChallengeGrid'
ProgressiveDateGroupedContent.displayName = 'ProgressiveDateGroupedContent'
StatusSection.displayName = 'StatusSection'

export default StatusSection
