import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  memo,
} from 'react'
import {
  Box,
  VStack,
  HStack,
  Grid,
  GridItem,
  Button,
  Icon,
  Flex,
  Heading,
  Text,
  Badge,
  Center,
  Spinner,
  useToast,
  useBreakpointValue,
  useDisclosure,
  Collapse,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { format, isToday, isYesterday, isSameWeek, parseISO } from 'date-fns'
import {
  RefreshCw,
  Trophy,
  Users,
  Calendar,
  ChevronDown,
  ChevronUp,
  Swords,
  Shield,
} from 'lucide-react'
import { useInView } from 'react-intersection-observer'

// Import custom components
import TeamBattleItem from './TeamBattleItem'
import DateGroupHeader from '../DateGroupHeader'
import EmptyBattlesState from './EmptyBattlesState'

// Custom hooks
import useQuickClashTeamBattle from '../../../customHooks/useQuickClashTeamBattle'
import { useSocket } from '../../../customHooks/useSocket'
import { useNavigate } from 'react-router-dom'

// Import battle analysis modal (lazy loaded)
const ChallengeAnalysisModal = React.lazy(() =>
  import('../ChallengeAnalysisModal'),
)

const MotionBox = motion(Box)
const MotionFlex = motion(Flex)
const MotionButton = motion(Button)

/**
 * Battle Section Component - Accordion style section for battles
 */
const BattleSection = memo(
  ({
    title,
    icon,
    battles,
    loading,
    error,
    hasMore,
    onLoadMore,
    onRefresh,
    onEnterBattle,
    onViewAnalysis,
    isRefreshing,
    sectionType,
  }) => {
    const { t } = useTranslation('QuickClash')
    const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: true })

    // Responsive styling
    const columns = useBreakpointValue({ base: 1, md: 2 })
    const spacing = useBreakpointValue({ base: 3, md: 4 })
    const iconSize = useBreakpointValue({ base: 4, md: 5 })
    const headingSize = useBreakpointValue({ base: 'sm', md: 'md' })
    const padding = useBreakpointValue({ base: 2, md: 4 })

    // Group battles by date
    const groupedBattles = useMemo(() => {
      if (!battles.length) return {}

      const grouped = battles.reduce((acc, battle) => {
        const battleDate = parseISO(battle.createdAt)
        let dateKey

        if (isToday(battleDate)) {
          dateKey = t('Today')
        } else if (isYesterday(battleDate)) {
          dateKey = t('Yesterday')
        } else if (isSameWeek(battleDate, new Date())) {
          dateKey = format(battleDate, 'EEEE')
        } else {
          dateKey = format(battleDate, 'MMMM d, yyyy')
        }

        if (!acc[dateKey]) {
          acc[dateKey] = []
        }

        acc[dateKey].push(battle)
        return acc
      }, {})

      return grouped
    }, [battles, t])

    // Sort date keys
    const sortedDateKeys = useMemo(() => {
      const keys = Object.keys(groupedBattles)
      return keys.sort((a, b) => {
        if (a === t('Today')) return -1
        if (b === t('Today')) return 1
        if (a === t('Yesterday')) return -1
        if (b === t('Yesterday')) return 1
        return new Date(b) - new Date(a)
      })
    }, [groupedBattles, t])

    // Ref for infinite scrolling
    const { ref: bottomRef, inView } = useInView({
      threshold: 0.1,
      triggerOnce: false,
    })

    // Handle infinite scroll
    useEffect(() => {
      if (inView && hasMore && !loading && !isRefreshing) {
        onLoadMore()
      }
    }, [inView, hasMore, loading, isRefreshing, onLoadMore])

    return (
      <MotionBox
        bg="rgba(26, 32, 44, 0.6)"
        borderRadius="xl"
        borderWidth="1px"
        borderColor="whiteAlpha.200"
        overflow="hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        _hover={{
          borderColor: 'whiteAlpha.300',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        }}
      >
        {/* Section Header */}
        <MotionFlex
          justify="space-between"
          align="center"
          p={padding}
          bg="rgba(76, 39, 143, 0.1)"
          borderBottom="1px"
          borderColor="whiteAlpha.100"
          cursor="pointer"
          onClick={onToggle}
          _hover={{ bg: 'rgba(76, 39, 143, 0.2)' }}
          transition="all 0.2s"
        >
          <HStack spacing={3}>
            <Icon
              as={icon}
              color={sectionType === 'active' ? 'green.400' : 'purple.400'}
              boxSize={iconSize}
            />
            <Heading size={headingSize} color="white">
              {title}
            </Heading>
            <Badge
              colorScheme={sectionType === 'active' ? 'green' : 'purple'}
              variant="subtle"
              borderRadius="full"
              px={2}
              py={1}
            >
              {battles.length}
            </Badge>
          </HStack>

          <HStack spacing={2}>
            <MotionButton
              size="sm"
              variant="ghost"
              colorScheme="purple"
              onClick={e => {
                e.stopPropagation()
                onRefresh()
              }}
              isLoading={isRefreshing}
              aria-label={t('Refresh')}
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.3 }}
            >
              <Icon as={RefreshCw} />
            </MotionButton>

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
          </HStack>
        </MotionFlex>

        {/* Section Content */}
        <Collapse in={isOpen} animateOpacity>
          <Box p={padding}>
            {loading && battles.length === 0 ? (
              <Center py={8}>
                <VStack spacing={3}>
                  <Spinner
                    thickness="3px"
                    speed="0.65s"
                    emptyColor="whiteAlpha.300"
                    color="purple.500"
                    size="lg"
                  />
                  <Text color="whiteAlpha.700" fontSize="sm">
                    {t('Loading battles...')}
                  </Text>
                </VStack>
              </Center>
            ) : error && battles.length === 0 ? (
              <Center py={8}>
                <VStack spacing={4}>
                  <Icon as={Shield} color="red.400" boxSize={8} />
                  <Text color="red.400" fontSize="sm" textAlign="center">
                    {error}
                  </Text>
                  <Button
                    size="sm"
                    colorScheme="purple"
                    variant="outline"
                    onClick={onRefresh}
                    leftIcon={<RefreshCw size={16} />}
                  >
                    {t('Try Again')}
                  </Button>
                </VStack>
              </Center>
            ) : battles.length === 0 ? (
              <EmptyBattlesState
                type={sectionType}
                onCreateMatch={() => {
                  window.location.hash = 'teams'
                }}
              />
            ) : (
              <VStack spacing={spacing} align="stretch">
                {sortedDateKeys.map((dateKey, dateIndex) => (
                  <Box key={dateKey}>
                    <DateGroupHeader date={dateKey} index={dateIndex} />

                    <Grid
                      templateColumns={`repeat(${columns}, 1fr)`}
                      gap={spacing}
                      mt={2}
                    >
                      {groupedBattles[dateKey].map((battle, index) => (
                        <GridItem key={battle._id}>
                          <TeamBattleItem
                            battle={battle}
                            index={index}
                            onEnter={onEnterBattle}
                            onViewAnalysis={onViewAnalysis}
                          />
                        </GridItem>
                      ))}
                    </Grid>
                  </Box>
                ))}

                {/* Load more indicator */}
                {hasMore && (
                  <Center ref={bottomRef} py={4}>
                    <MotionBox
                      animate={{
                        scale: [1, 1.05, 1],
                        opacity: [0.7, 1, 0.7],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        repeatType: 'reverse',
                      }}
                    >
                      <Spinner size="sm" color="purple.500" thickness="2px" />
                    </MotionBox>
                  </Center>
                )}
              </VStack>
            )}
          </Box>
        </Collapse>
      </MotionBox>
    )
  },
)

BattleSection.displayName = 'BattleSection'

/**
 * Enhanced TeamBattleList with Accordion Sections
 */
const TeamBattleList = memo(() => {
  const { t } = useTranslation('QuickClash')
  const toast = useToast()
  const { getSocket } = useSocket()
  const navigate = useNavigate()
  // Responsive sizing
  const headerSize = useBreakpointValue({ base: 'md', md: 'lg' })
  const containerPadding = useBreakpointValue({ base: 1, md: 4 })
  const sectionSpacing = useBreakpointValue({ base: 4, md: 6 })

  // State
  const [selectedBattleId, setSelectedBattleId] = useState(null)
  const [refreshingActive, setRefreshingActive] = useState(false)
  const [refreshingCompleted, setRefreshingCompleted] = useState(false)

  // Analysis modal state
  const {
    isOpen: isAnalysisOpen,
    onOpen: openAnalysisModal,
    onClose: closeAnalysisModal,
  } = useDisclosure()

  // Get team battle data from hook
  const {
    activeBattles,
    activeBattlesLoading,
    activeBattlesError,
    activeBattlesHasMore,

    completedBattles,
    completedBattlesLoading,
    completedBattlesError,
    completedBattlesHasMore,

    loadTeamBattles,
    loadMoreTeamBattles,
    goToBattle,
  } = useQuickClashTeamBattle()

  // Join teams socket room when component mounts
  useEffect(() => {
    const socket = getSocket()
    if (socket) {
      socket.emit('quickClash:viewTeamBattles')
      console.log('Joined quickClash:teams room from TeamBattleList')
    }

    return () => {
      if (socket) {
        socket.off('quickClash:teamBattleUpdated')
      }
    }
  }, [getSocket])

  // Fetch both active and completed battles on mount
  useEffect(() => {
    loadTeamBattles('active')
    loadTeamBattles('completed')
  }, [loadTeamBattles])

  // Handle refreshing active battles
  const handleRefreshActive = useCallback(async () => {
    setRefreshingActive(true)
    try {
      await loadTeamBattles('active')
      toast({
        title: t('Refreshed'),
        description: t('Active battles have been refreshed'),
        status: 'success',
        duration: 2000,
        isClosable: true,
        position: 'top-right',
      })
    } finally {
      setRefreshingActive(false)
    }
  }, [loadTeamBattles, toast, t])

  // Handle refreshing completed battles
  const handleRefreshCompleted = useCallback(async () => {
    setRefreshingCompleted(true)
    try {
      await loadTeamBattles('completed')
      toast({
        title: t('Refreshed'),
        description: t('Completed battles have been refreshed'),
        status: 'success',
        duration: 2000,
        isClosable: true,
        position: 'top-right',
      })
    } finally {
      setRefreshingCompleted(false)
    }
  }, [loadTeamBattles, toast, t])

  // Handle loading more battles
  const handleLoadMoreActive = useCallback(() => {
    if (!activeBattlesLoading && activeBattlesHasMore && !refreshingActive) {
      loadMoreTeamBattles('active')
    }
  }, [
    activeBattlesLoading,
    activeBattlesHasMore,
    refreshingActive,
    loadMoreTeamBattles,
  ])

  const handleLoadMoreCompleted = useCallback(() => {
    if (
      !completedBattlesLoading &&
      completedBattlesHasMore &&
      !refreshingCompleted
    ) {
      loadMoreTeamBattles('completed')
    }
  }, [
    completedBattlesLoading,
    completedBattlesHasMore,
    refreshingCompleted,
    loadMoreTeamBattles,
  ])

  // Handle entering a team battle
  const handleEnterTeamBattle = useCallback(
    battleId => {
      goToBattle(battleId)
    },
    [goToBattle],
  )

  // Handle viewing battle analysis
  const handleViewBattleAnalysis = useCallback(
    battleId => {
      navigate(`/quickclash/analysis/${battleId}`)
      scrollTo(0, 0)
    },
    [navigate],
  )

  return (
    <Box
      width="100%"
      maxWidth="100vw"
      overflow="hidden"
      px={containerPadding}
      className="enhanced-team-battle-list"
      data-testid="team-battle-list"
    >
      {/* Header */}
      <MotionFlex
        direction="column"
        align="center"
        mb={sectionSpacing}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <HStack spacing={3} mb={2}>
          <Icon as={Users} boxSize={6} color="purple.400" />
          <Heading size={headerSize} color="white">
            {t('Team Battles')}
          </Heading>
        </HStack>

        <Text color="whiteAlpha.700" fontSize="md" textAlign="center">
          {t('Compete with your team in 4v4 knowledge battles')}
        </Text>
      </MotionFlex>

      {/* Battle Sections */}
      <VStack spacing={sectionSpacing} align="stretch">
        {/* Active Battles Section */}
        <BattleSection
          title={t('Active Battles')}
          icon={Swords}
          battles={activeBattles}
          loading={activeBattlesLoading}
          error={activeBattlesError}
          hasMore={activeBattlesHasMore}
          onLoadMore={handleLoadMoreActive}
          onRefresh={handleRefreshActive}
          onEnterBattle={handleEnterTeamBattle}
          onViewAnalysis={handleViewBattleAnalysis}
          isRefreshing={refreshingActive}
          sectionType="active"
        />

        {/* Completed Battles Section */}
        <BattleSection
          title={t('Completed Battles')}
          icon={Trophy}
          battles={completedBattles}
          loading={completedBattlesLoading}
          error={completedBattlesError}
          hasMore={completedBattlesHasMore}
          onLoadMore={handleLoadMoreCompleted}
          onRefresh={handleRefreshCompleted}
          onEnterBattle={handleEnterTeamBattle}
          onViewAnalysis={handleViewBattleAnalysis}
          isRefreshing={refreshingCompleted}
          sectionType="completed"
        />
      </VStack>

      {/* Analysis Modal */}
      {isAnalysisOpen && selectedBattleId && (
        <React.Suspense fallback={<Spinner />}>
          <ChallengeAnalysisModal
            isOpen={isAnalysisOpen}
            onClose={closeAnalysisModal}
            challengeId={selectedBattleId}
          />
        </React.Suspense>
      )}
    </Box>
  )
})

TeamBattleList.displayName = 'TeamBattleList'

export default TeamBattleList
