// components/quickClashComponents/ActiveChallenges.jsx
import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  Suspense,
  useRef,
} from 'react'
import {
  Box,
  VStack,
  Text,
  useToast,
  Spinner,
  Center,
  Icon,
  Button,
  useDisclosure,
  Flex,
} from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { AnimatePresence, motion } from 'framer-motion'
import axios from 'axios'
import {
  Target,
  Zap,
  HourglassIcon,
  Trophy,
  X,
  FileText,
  ChevronDown,
} from 'lucide-react'

// Import custom components
import FilterTabs from './FilterTabs'
import EmptyState from './EmptyState'
import StatusSection from './StatusSection'
import ConfirmationDialog from './ConfirmationDialog'
import RevengeConfirmationDialog from './RevengeConfirmationDialog'

// Use React.lazy for components that aren't always needed
const QuizReportModal = React.lazy(() => import('./QuizReportModal'))
const NewChallengeModal = React.lazy(() => import('./modals/NewChallengeModal'))

// Custom hooks
import useQuickClash from '../../customHooks/useQuickClash'
import useQuickClashSocket from '../../customHooks/useQuickClashSocket'

const MotionCenter = motion(Center)
const MotionButton = motion(Button)

/**
 * Displays active challenges, allowing filtering and interaction
 */
const ActiveChallenges = () => {
  const { t } = useTranslation('QuickClash')
  const toast = useToast()
  const navigate = useNavigate()
  const [filter, setFilter] = useState('all')
  const {
    activeChallenges: challenges,
    activeChallengesLoading: loading,
    activeChallengesError: error,
    activeChallengesPage: page,
    activeChallengesHasMore: hasMore,
    loadActiveChallenges,
    loadMoreActiveChallenges,
    handleAcceptChallenge,
    handleRejectChallenge,
    createChallenge, // Import this from useQuickClash
  } = useQuickClash()
  const { emitChallengeAccepted, emitChallengeRejected } = useQuickClashSocket()
  const { user } = useSelector(state => state.auth)
  const userId = user?._id
  const [selectedSession, setSelectedSession] = useState(null)
  const [nextPageLoading, setNextPageLoading] = useState(false)

  // Modal disclosures
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [isReportOpen, setIsReportOpen] = useState(false)
  const [isRevengeConfirmOpen, setIsRevengeConfirmOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState({ type: '', id: '' })

  // Revenge state
  const [revengeData, setRevengeData] = useState(null)
  const [revengeLoading, setRevengeLoading] = useState(false)
  const [revengeProgress, setRevengeProgress] = useState(0)
  const progressTimerRef = useRef(null)

  // Fetch challenges
  useEffect(() => {
    if (userId) {
      loadActiveChallenges()
    }
  }, [userId, loadActiveChallenges])

  // Filter challenges based on the selected filter
  const filteredChallenges = useMemo(() => {
    if (!challenges || !userId) return []

    let filtered = [...challenges]

    // Filter based on type (sent/received)
    switch (filter) {
      case 'sent':
        filtered = filtered.filter(c => c.challenger._id === userId)
        break
      case 'received':
        filtered = filtered.filter(c => c.opponent._id === userId)
        break
    }

    // Sort challenges by status and date (pending first, then active, expired last)
    filtered.sort((a, b) => {
      const statusOrder = {
        active: 0,
        pending: 1,
        completed: 2,
        expired: 3,
        rejected: 4,
      }

      // First sort by status
      const statusDiff = statusOrder[a.status] - statusOrder[b.status]
      if (statusDiff !== 0) return statusDiff

      // For same status, sort by date (newest first)
      return new Date(b.createdAt) - new Date(a.createdAt)
    })

    return filtered
  }, [filter, challenges, userId])

  // Group challenges by their status
  const groupedChallenges = useMemo(() => {
    if (!filteredChallenges.length) return {}

    // Group challenges by status
    return filteredChallenges.reduce((groups, challenge) => {
      const isChallenger = challenge.challenger._id === userId
      let statusGroup

      if (challenge.status === 'completed') {
        statusGroup = 'completed'
      } else if (challenge.status === 'active') {
        statusGroup = 'active'
      } else if (challenge.status === 'pending') {
        statusGroup = isChallenger ? 'awaiting' : 'new'
      } else if (challenge.status === 'rejected') {
        statusGroup = 'rejected'
      } else {
        statusGroup = 'other'
      }

      if (!groups[statusGroup]) {
        groups[statusGroup] = []
      }

      groups[statusGroup].push(challenge)
      return groups
    }, {})
  }, [filteredChallenges, userId])

  // Define display order and labels for status groups
  const statusGroups = [
    { key: 'new', label: t('New Challenges'), icon: Target },
    { key: 'active', label: t('Ready to Play'), icon: Zap },
    { key: 'awaiting', label: t('Awaiting Response'), icon: HourglassIcon },
    { key: 'completed', label: t('Completed'), icon: Trophy },
    { key: 'rejected', label: t('Rejected'), icon: X },
    { key: 'other', label: t('Other'), icon: FileText },
  ]

  // Handle confirmation dialog
  const openConfirmDialog = useCallback((type, id) => {
    setConfirmAction({ type, id })
    setIsConfirmOpen(true)
  }, [])

  const closeConfirmDialog = useCallback(() => {
    setIsConfirmOpen(false)
  }, [])

  // Handle report modal
  const openReportModal = useCallback(() => {
    setIsReportOpen(true)
  }, [])

  const closeReportModal = useCallback(() => {
    setIsReportOpen(false)
    setSelectedSession(null)
  }, [])

  // Handle revenge action
  const handleRevenge = useCallback((opponent, originalChallenge) => {
    // Store the revenge data for use when confirmed
    setRevengeData({
      opponent,
      originalChallengeId: originalChallenge._id,
      category: originalChallenge.category,
    })

    // Open the revenge confirmation dialog
    setIsRevengeConfirmOpen(true)
  }, [])

  // Close revenge confirmation dialog
  const closeRevengeConfirmDialog = useCallback(() => {
    setIsRevengeConfirmOpen(false)
    // Clear progress timer if it exists
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current)
      progressTimerRef.current = null
    }
    // Reset progress if dialog is being closed
    setRevengeProgress(0)
  }, [])

  // Setup simulated progress timer for better UX during long operations
  const startProgressTimer = useCallback(() => {
    // Clear any existing timer
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current)
    }

    // Reset progress
    setRevengeProgress(5)

    // Create a timer that increments progress slowly
    // We'll target around 90% over 25 seconds, reserving the last 10% for completion
    progressTimerRef.current = setInterval(() => {
      setRevengeProgress(prev => {
        // Slow down progress as it gets higher
        const increment = prev < 30 ? 5 : prev < 60 ? 3 : prev < 85 ? 1 : 0.5
        const newValue = Math.min(prev + increment, 90)
        return newValue
      })
    }, 1000) // Update every second
  }, [])

  // Execute the revenge action when confirmed
  const executeRevenge = useCallback(async () => {
    if (!revengeData) return

    // Start loading state
    setRevengeLoading(true)

    // Start progress timer for UX
    startProgressTimer()

    try {
      // Create a new challenge with the same category
      const result = await createChallenge(revengeData.opponent._id, [
        revengeData.category,
      ])

      // Complete the progress
      setRevengeProgress(100)

      // Make API call to update the original challenge's revengeStatus
      await axios.post(
        `/api/quickClash/challenge/${revengeData.originalChallengeId}/markRevenge`,
      )

      // Short delay to show completed progress
      await new Promise(resolve => setTimeout(resolve, 500))

      // Show success message
      toast({
        title: t('Revenge Challenge Sent!'),
        description: t(
          "Your revenge challenge has been sent. It's time for redemption!",
        ),
        status: 'success',
        duration: 5000,
        isClosable: true,
      })

      // Refresh challenges list
      loadActiveChallenges()

      // Close the confirmation dialog
      closeRevengeConfirmDialog()

      // Clear the revenge data
      setRevengeData(null)
    } catch (error) {
      console.error('Error creating revenge challenge:', error)

      // Show error toast
      toast({
        title: t('Failed to Send Revenge'),
        description:
          error.response?.data?.message ||
          t('An error occurred while creating the revenge challenge.'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      })

      // Close dialog after error
      closeRevengeConfirmDialog()

      // Clear the revenge data
      setRevengeData(null)
    } finally {
      // End loading state
      setRevengeLoading(false)

      // Clear progress timer
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current)
        progressTimerRef.current = null
      }
    }
  }, [
    revengeData,
    createChallenge,
    closeRevengeConfirmDialog,
    toast,
    t,
    loadActiveChallenges,
    startProgressTimer,
  ])

  // Handle challenge actions
  const handleAccept = useCallback(
    challengeId => {
      openConfirmDialog('accept', challengeId)
    },
    [openConfirmDialog],
  )

  const handleDecline = useCallback(
    challengeId => {
      openConfirmDialog('decline', challengeId)
    },
    [openConfirmDialog],
  )

  const handleStart = useCallback(
    challengeId => {
      navigate(`/quickclash/session/${challengeId}`)
    },
    [navigate],
  )

  const handleViewReport = useCallback(
    challenge => {
      // Find the completed session for this challenge
      const fetchSession = async () => {
        try {
          const response = await axios.get(
            `/api/quickClash/challenge/${challenge._id}/sessions?userId=${userId}`,
          )
          if (response.data && response.data.sessionId) {
            setSelectedSession(response.data.sessionId)
            openReportModal()
          } else {
            toast({
              title: t('Error'),
              description: t('Could not find your quiz session'),
              status: 'error',
              duration: 3000,
              isClosable: true,
              position: 'top-right',
              variant: 'subtle',
            })
          }
        } catch (error) {
          console.error('Error fetching session:', error)
          toast({
            title: t('Error'),
            description: t('Failed to load quiz session'),
            status: 'error',
            duration: 3000,
            isClosable: true,
            position: 'top-right',
            variant: 'subtle',
          })
        }
      }

      fetchSession()
    },
    [userId, openReportModal, toast, t],
  )

  // Execute the confirmed action
  const executeConfirmAction = async () => {
    const { type, id } = confirmAction

    try {
      if (type === 'accept') {
        const challenge = await handleAcceptChallenge(id)

        // If successful, emit socket event
        if (challenge) {
          emitChallengeAccepted({
            challengerId: challenge.challenger._id,
            challengeId: challenge._id,
            category: challenge.category,
          })
        }
      } else if (type === 'decline') {
        const challenge = await handleRejectChallenge(id)

        // If successful, emit socket event
        if (challenge) {
          emitChallengeRejected({
            challengerId: challenge.challenger._id,
            challengeId: challenge._id,
            category: challenge.category,
          })
        }
      }

      // No need to fetch challenges again as Redux will update the state
    } catch (error) {
      console.error(`Error ${type}ing challenge:`, error)
    } finally {
      closeConfirmDialog()
    }
  }

  // Handle loading more challenges
  const handleLoadMore = useCallback(async () => {
    if (nextPageLoading || !hasMore) return

    setNextPageLoading(true)
    try {
      await loadMoreActiveChallenges()
    } catch (error) {
      console.error('Error loading more challenges:', error)
      toast({
        title: t('Error'),
        description: t('Failed to load more challenges'),
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setNextPageLoading(false)
    }
  }, [nextPageLoading, hasMore, loadMoreActiveChallenges, toast, t])

  // Check if we're still loading and no challenges have been loaded yet
  if (loading && !challenges.length) {
    return (
      <MotionCenter
        py={12}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <VStack spacing={5}>
          <Spinner
            size="xl"
            color="purple.500"
            thickness="4px"
            speed="0.8s"
            emptyColor="gray.700"
          />
          <Text color="whiteAlpha.800" fontWeight="medium">
            {t('Loading challenges...')}
          </Text>
        </VStack>
      </MotionCenter>
    )
  }

  // If there was an error and no challenges have been loaded yet
  if (error && !challenges.length) {
    return (
      <MotionCenter
        py={12}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <VStack
          spacing={5}
          bg="gray.800"
          p={6}
          borderRadius="lg"
          borderWidth="1px"
          borderColor="red.500"
          maxW="400px"
        >
          <Icon as={FileText} boxSize={10} color="red.400" />
          <Text color="white" fontWeight="medium" textAlign="center">
            {error}
          </Text>
          <Button
            colorScheme="purple"
            onClick={() => loadActiveChallenges()}
            as={motion.button}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {t('Retry')}
          </Button>
        </VStack>
      </MotionCenter>
    )
  }

  return (
    <Box>
      <VStack align="stretch" spacing={6}>
        {/* Filter Tabs */}
        <FilterTabs selectedFilter={filter} onFilterChange={setFilter} />

        {/* Challenge Count */}
        {filteredChallenges.length > 0 && filter !== 'all' && (
          <Box textAlign="center">
            <Text color="whiteAlpha.700" fontSize="sm">
              {filteredChallenges.length}{' '}
              {filteredChallenges.length === 1
                ? t('challenge')
                : t('challenges')}{' '}
              {filter === 'sent'
                ? t('sent')
                : filter === 'received'
                ? t('received')
                : ''}
            </Text>
          </Box>
        )}

        {/* Challenge List Grouped by Status */}
        <AnimatePresence>
          {filteredChallenges.length === 0 ? (
            <EmptyState filter={filter} />
          ) : (
            <VStack spacing={8} align="stretch" px={1}>
              {/* Use StatusSection component for each group */}
              {statusGroups.map((group, idx) => (
                <StatusSection
                  key={group.key}
                  title={group.label}
                  icon={group.icon}
                  challenges={groupedChallenges[group.key] || []}
                  userId={userId}
                  handlers={{
                    onAccept: handleAccept,
                    onDecline: handleDecline,
                    onStart: handleStart,
                    onViewReport: handleViewReport,
                    onRevenge: handleRevenge,
                  }}
                  animationDelay={idx * 0.1}
                />
              ))}
            </VStack>
          )}
        </AnimatePresence>

        {/* Load More Button */}
        {hasMore && filteredChallenges.length > 0 && (
          <Flex justify="center" mt={4} mb={6}>
            <MotionButton
              onClick={handleLoadMore}
              isLoading={nextPageLoading}
              colorScheme="purple"
              variant="outline"
              size="md"
              leftIcon={<ChevronDown size={18} />}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {t('Load More Challenges')}
            </MotionButton>
          </Flex>
        )}
      </VStack>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isConfirmOpen}
        onClose={closeConfirmDialog}
        onConfirm={executeConfirmAction}
        title={
          confirmAction.type === 'accept'
            ? t('Accept Challenge?')
            : t('Decline Challenge?')
        }
        message={
          confirmAction.type === 'accept'
            ? t('You can start it immediately after accepting.')
            : t('This action cannot be undone.')
        }
        confirmText={
          confirmAction.type === 'accept' ? t('Accept') : t('Decline')
        }
      />

      {/* Revenge Confirmation Dialog */}
      {revengeData && (
        <RevengeConfirmationDialog
          isOpen={isRevengeConfirmOpen}
          onClose={closeRevengeConfirmDialog}
          onConfirm={executeRevenge}
          opponentName={
            revengeData.opponent?.inGameName || revengeData.opponent?.name
          }
          category={revengeData.category}
          isLoading={revengeLoading}
          loadingProgress={revengeProgress}
        />
      )}

      {/* Quiz Report Modal */}
      <Suspense fallback={null}>
        {isReportOpen && selectedSession && (
          <QuizReportModal
            isOpen={isReportOpen}
            onClose={closeReportModal}
            sessionId={selectedSession}
          />
        )}
      </Suspense>
    </Box>
  )
}

export default ActiveChallenges
