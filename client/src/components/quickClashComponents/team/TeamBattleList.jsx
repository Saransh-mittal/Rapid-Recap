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
  Filter,
  ArrowUpDown,
  ChevronDown,
} from 'lucide-react'
import { useInView } from 'react-intersection-observer'

// Import custom components
import TeamBattleItem from './TeamBattleItem'
import DateGroupHeader from '../DateGroupHeader'
import TeamMatchmakingButton from './TeamMatchmakingButton'
import EmptyBattlesState from './EmptyBattlesState'

// Custom hooks
import useQuickClashTeamBattle from '../../../customHooks/useQuickClashTeamBattle'
import { useSocket } from '../../../customHooks/useSocket'

// Import battle analysis modal (lazy loaded)
const ChallengeAnalysisModal = React.lazy(() =>
  import('../ChallengeAnalysisModal'),
)

const MotionBox = motion(Box)
const MotionFlex = motion(Flex)
const MotionButton = motion(Button)

/**
 * Enhanced component for displaying team battles with date grouping
 */
const TeamBattleList = memo(() => {
  const { t } = useTranslation('QuickClash')
  const toast = useToast()
  const { getSocket } = useSocket()

  // Responsive sizing with more granular breakpoints
  const columns = useBreakpointValue({ base: 1, md: 2 })
  const spacing = useBreakpointValue({ base: 3, sm: 3, md: 4, lg: 5 })
  const containerPadding = useBreakpointValue({ base: 3, sm: 3, md: 2, lg: 4 })
  const buttonSize = useBreakpointValue({ base: 'xs', md: 'sm' })
  const headerSize = useBreakpointValue({ base: 'sm', md: 'md' })

  // State
  const [activeTab, setActiveTab] = useState('active')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedBattleId, setSelectedBattleId] = useState(null)

  // Analysis modal state
  const {
    isOpen: isAnalysisOpen,
    onOpen: openAnalysisModal,
    onClose: closeAnalysisModal,
  } = useDisclosure()

  // Ref for the bottom observer (infinite loading)
  const { ref: bottomRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  })

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
      // Clean up socket listener when component unmounts
      if (socket) {
        socket.off('quickClash:teamBattleUpdated')
      }
    }
  }, [getSocket])

  // Fetch active battles on mount
  useEffect(() => {
    loadTeamBattles('active')
  }, [loadTeamBattles])

  // Handle infinite scrolling
  useEffect(() => {
    if (inView && !refreshing) {
      const hasMore =
        activeTab === 'active' ? activeBattlesHasMore : completedBattlesHasMore
      const isLoading =
        activeTab === 'active' ? activeBattlesLoading : completedBattlesLoading

      if (hasMore && !isLoading) {
        handleLoadMore()
      }
    }
  }, [
    inView,
    activeTab,
    refreshing,
    activeBattlesHasMore,
    completedBattlesHasMore,
  ])

  // Handle tab change
  const handleTabChange = useCallback(
    tab => {
      setActiveTab(tab)

      // Load data for the selected tab if not already loaded
      if (tab === 'active' && !activeBattles.length && !activeBattlesLoading) {
        loadTeamBattles('active')
      } else if (
        tab === 'completed' &&
        !completedBattles.length &&
        !completedBattlesLoading
      ) {
        loadTeamBattles('completed')
      }
    },
    [
      activeBattles.length,
      activeBattlesLoading,
      completedBattles.length,
      completedBattlesLoading,
      loadTeamBattles,
    ],
  )

  // Handle refreshing battle list
  const handleRefresh = useCallback(() => {
    setRefreshing(true)
    loadTeamBattles(activeTab).finally(() => {
      setRefreshing(false)
      // Display success toast
      toast({
        title: t('Refreshed'),
        description: t('Team battles have been refreshed'),
        status: 'success',
        duration: 2000,
        isClosable: true,
        position: 'top-right',
      })
    })
  }, [activeTab, loadTeamBattles, toast, t])

  // Handle loading more battles
  const handleLoadMore = useCallback(() => {
    if (refreshing) return

    const isLoading =
      activeTab === 'active' ? activeBattlesLoading : completedBattlesLoading
    const hasMore =
      activeTab === 'active' ? activeBattlesHasMore : completedBattlesHasMore

    if (!isLoading && hasMore) {
      loadMoreTeamBattles(activeTab)
    }
  }, [
    activeTab,
    loadMoreTeamBattles,
    refreshing,
    activeBattlesLoading,
    completedBattlesLoading,
    activeBattlesHasMore,
    completedBattlesHasMore,
  ])

  // Handle clicking Enter on a battle
  const handleEnterBattle = useCallback(
    battleId => {
      goToBattle(battleId)
    },
    [goToBattle],
  )

  // Handle viewing battle analysis
  const handleViewBattleAnalysis = useCallback(
    battleId => {
      setSelectedBattleId(battleId)
      openAnalysisModal()
    },
    [openAnalysisModal],
  )

  // Group battles by date
  const groupedBattles = useMemo(() => {
    const battles = activeTab === 'active' ? activeBattles : completedBattles
    if (!battles.length) return {}

    const grouped = battles.reduce((acc, battle) => {
      // Parse date from createdAt
      const battleDate = parseISO(battle.createdAt)
      let dateKey

      if (isToday(battleDate)) {
        dateKey = t('Today')
      } else if (isYesterday(battleDate)) {
        dateKey = t('Yesterday')
      } else if (isSameWeek(battleDate, new Date())) {
        // Format to day name (Monday, Tuesday, etc)
        dateKey = format(battleDate, 'EEEE')
      } else {
        // Format to date (March 11, 2025)
        dateKey = format(battleDate, 'MMMM d, yyyy')
      }

      if (!acc[dateKey]) {
        acc[dateKey] = []
      }

      acc[dateKey].push(battle)
      return acc
    }, {})

    return grouped
  }, [activeTab, activeBattles, completedBattles, t])

  // Get current battles based on active tab
  const currentBattles =
    activeTab === 'active' ? activeBattles : completedBattles
  const isCurrentLoading =
    (activeTab === 'active' ? activeBattlesLoading : completedBattlesLoading) ||
    loading
  const currentError =
    activeTab === 'active' ? activeBattlesError : completedBattlesError
  const hasMore =
    activeTab === 'active' ? activeBattlesHasMore : completedBattlesHasMore

  // Sort date keys with "Today" and "Yesterday" first
  const sortedDateKeys = useMemo(() => {
    const keys = Object.keys(groupedBattles)

    return keys.sort((a, b) => {
      if (a === t('Today')) return -1
      if (b === t('Today')) return 1
      if (a === t('Yesterday')) return -1
      if (b === t('Yesterday')) return 1

      // Simply compare dates for the rest (newest first)
      return new Date(b) - new Date(a)
    })
  }, [groupedBattles, t])

  // Render loading state
  if (isCurrentLoading && currentBattles.length === 0) {
    return (
      <Center h="300px">
        <VStack spacing={4}>
          <Spinner
            thickness="3px"
            speed="0.65s"
            emptyColor="whiteAlpha.300"
            color="purple.500"
            size="xl"
          />
          <MotionBox
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Text color="whiteAlpha.800" fontSize="lg" fontWeight="medium">
              {t('Loading team battles...')}
            </Text>
          </MotionBox>
        </VStack>
      </Center>
    )
  }

  // Render error state
  if (currentError && currentBattles.length === 0) {
    return (
      <Center h="300px">
        <VStack spacing={5}>
          <MotionBox
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 150 }}
          >
            <Icon as={RefreshCw} color="red.400" boxSize={10} />
          </MotionBox>
          <Text color="red.400" fontSize="lg" fontWeight="medium">
            {currentError}
          </Text>
          <MotionButton
            leftIcon={<RefreshCw size={18} />}
            colorScheme="purple"
            onClick={handleRefresh}
            size={buttonSize}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {t('Try Again')}
          </MotionButton>
        </VStack>
      </Center>
    )
  }

  return (
    <Box
      width="100%"
      maxWidth="100vw"
      overflow="hidden"
      px={containerPadding}
      className="enhanced-team-battle-list"
      data-testid="team-battle-list"
    >
      {/* Header with tabs and actions */}
      <MotionFlex
        justify="space-between"
        align="center"
        mb={6}
        flexDir={{ base: 'column', sm: 'row' }}
        gap={{ base: 3, sm: 0 }}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <MotionFlex
          direction="column"
          align={{ base: 'center', sm: 'flex-start' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <HStack spacing={2} mb={1}>
            <Icon as={Users} boxSize={5} color="purple.400" />
            <Heading size={headerSize} color="white">
              {t('Team Battles')}
            </Heading>
          </HStack>

          <Text color="whiteAlpha.700" fontSize="sm">
            {t('Compete with your team in 4v4 knowledge battles')}
          </Text>
        </MotionFlex>

        <HStack spacing={3}>
          <MotionButton
            leftIcon={
              <Icon as={activeTab === 'active' ? Users : Trophy} boxSize={4} />
            }
            rightIcon={<Icon as={ChevronDown} boxSize={4} />}
            colorScheme="purple"
            variant="outline"
            size={buttonSize}
            onClick={() =>
              handleTabChange(activeTab === 'active' ? 'completed' : 'active')
            }
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {activeTab === 'active' ? t('Active') : t('Completed')}
          </MotionButton>

          <MotionButton
            icon={<RefreshCw size={16} />}
            colorScheme="purple"
            variant="ghost"
            size={buttonSize}
            isRound
            onClick={handleRefresh}
            isLoading={refreshing}
            aria-label={t('Refresh')}
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.3 }}
          >
            <Icon as={RefreshCw} />
          </MotionButton>

          {/* Team Matchmaking Button */}
          <TeamMatchmakingButton compact={true} />
        </HStack>
      </MotionFlex>

      {/* Team battle list */}
      {currentBattles.length === 0 ? (
        <EmptyBattlesState
          type={activeTab}
          onCreateMatch={() => {
            // Navigate to teams tab where user can create/join team
            window.location.hash = 'teams'
          }}
        />
      ) : (
        <MotionBox
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          width="100%"
          maxWidth="100vw"
          overflow="hidden"
        >
          {/* Render battles grouped by date */}
          {sortedDateKeys.map((dateKey, dateIndex) => (
            <Box key={dateKey} mb={spacing}>
              <DateGroupHeader date={dateKey} index={dateIndex} />

              <Box width="100%" overflow="hidden">
                <Grid
                  templateColumns={{
                    base: '1fr',
                    md: 'repeat(2, 1fr)',
                  }}
                  gap={spacing}
                  width="100%"
                  maxWidth="100%"
                  px={0}
                  boxSizing="border-box"
                >
                  {groupedBattles[dateKey].map((battle, index) => (
                    <GridItem
                      key={battle._id}
                      width="100%"
                      maxWidth="100%"
                      minWidth="0"
                      overflow="hidden"
                    >
                      <Box width="100%" maxWidth="100%" minWidth="0">
                        <TeamBattleItem
                          battle={battle}
                          index={index}
                          onEnter={handleEnterBattle}
                          onViewAnalysis={handleViewBattleAnalysis}
                        />
                      </Box>
                    </GridItem>
                  ))}
                </Grid>
              </Box>
            </Box>
          ))}

          {/* Load more indicator */}
          {hasMore && (
            <Center ref={bottomRef} py={6} opacity={0.8}>
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
                <Spinner size="md" color="purple.500" thickness="3px" />
              </MotionBox>
            </Center>
          )}
        </MotionBox>
      )}

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
