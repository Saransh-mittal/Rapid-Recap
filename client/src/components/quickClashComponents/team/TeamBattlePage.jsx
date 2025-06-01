// components/quickClashComponents/team/TeamBattlePage.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Box,
  Button,
  Center,
  Spinner,
  VStack,
  Text,
  Icon,
  useToast,
  useDisclosure,
} from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { AlertTriangle, ArrowLeft } from 'lucide-react'
import axios from 'axios'

// Custom hooks
import useQuickClashTeamBattle from '../../../customHooks/useQuickClashTeamBattle'
import { useSocket } from '../../../customHooks/useSocket'

// Import optimized components
import TeamBattleHeader from './teamBattlePageComponents/TeamBattleHeader'
import TeamsGrid from './teamBattlePageComponents/TeamsGrid'
import CategoriesSection from './teamBattlePageComponents/CategoriesSection'
import BattleResultsSection from './teamBattlePageComponents/BattleResultsSection'

// Import QuizReportModal with React.lazy
const QuizReportModal = React.lazy(() => import('../QuizReportModal'))

/**
 * Team Battle Page Component - Animations Removed
 */
const TeamBattlePage = React.memo(() => {
  const { t } = useTranslation('QuickClash')
  const toast = useToast()
  const navigate = useNavigate()
  const { battleId } = useParams()
  const location = useLocation()
  const { user } = useSelector(state => state.auth)
  const { getSocket } = useSocket()

  // State for quiz report modal
  const [selectedSessionId, setSelectedSessionId] = useState(null)
  const [reportModalLoading, setReportModalLoading] = useState(false)
  const {
    isOpen: isReportOpen,
    onOpen: openReportModal,
    onClose: closeReportModal,
  } = useDisclosure()

  // Custom hook for team battles
  const {
    currentBattle,
    battleDetailsLoading,
    battleDetailsError,
    // New loading states
    categoryOperationLoading,
    categoryOperationType,
    categoryOperationError,
    selectedCategoryForOperation,
    // Legacy loading states (for backward compatibility)
    categorySelectionLoading,
    getBattleDetails,
    selectCategory,
    deselectCategory,
    beginChallenge,
    clearOperationError,
    resetOperationState,
    setupTeamBattleSocketListeners,
    cleanupSocketListeners,
  } = useQuickClashTeamBattle()
  // Local state
  const [selectedCategoryId, setSelectedCategoryId] = useState(null)

  // Memoized user team calculation
  const userTeam = useMemo(() => {
    if (!currentBattle || !user) return null

    const isInTeamA = currentBattle.teamAMembers.some(
      member => member.user._id === user._id || member.user === user._id,
    )
    const isInTeamB = currentBattle.teamBMembers.some(
      member => member.user._id === user._id || member.user === user._id,
    )

    return isInTeamA ? 'teamA' : isInTeamB ? 'teamB' : null
  }, [currentBattle, user?._id])

  // Memoized battle status calculation
  const battleStatus = useMemo(() => {
    if (!currentBattle)
      return {
        status: 'loading',
        statusColor: 'gray',
        completionPercentage: 0,
        completedChallenges: 0,
        totalChallenges: 0,
      }

    const totalChallenges = currentBattle.challenges.length
    const completedChallenges = currentBattle.challenges.filter(
      challenge => challenge.teamACompleted && challenge.teamBCompleted,
    ).length

    const completionPercentage =
      totalChallenges > 0
        ? Math.round((completedChallenges / totalChallenges) * 100)
        : 0

    let status = currentBattle.status
    let statusColor = 'gray'

    if (status === 'completed') {
      if (currentBattle.winner === userTeam) {
        statusColor = 'green'
      } else if (currentBattle.winner === 'tie') {
        statusColor = 'yellow'
      } else {
        statusColor = 'red'
      }
    } else if (status === 'active') {
      statusColor = 'blue'
    }

    return {
      status,
      statusColor,
      completionPercentage,
      completedChallenges,
      totalChallenges,
    }
  }, [currentBattle, userTeam])

  // Memoized uncompleted categories
  const uncompletedCategories = useMemo(() => {
    if (!currentBattle || !userTeam) return []

    const teamField = userTeam === 'teamA' ? 'teamACompleted' : 'teamBCompleted'
    const teamPlayerField = userTeam === 'teamA' ? 'teamAPlayer' : 'teamBPlayer'

    return currentBattle.challenges
      .filter(
        challenge =>
          !challenge[teamField] && challenge[teamPlayerField] === null,
      )
      .map(challenge => ({
        category: challenge.category,
        challengeId: challenge.challenge,
      }))
  }, [currentBattle, userTeam])

  // Optimized socket room joining
  useEffect(() => {
    const socket = getSocket()
    if (socket) {
      socket.emit('quickClash:viewTeamBattles')
    }
  }, [getSocket])

  // Fetch battle details on mount and when battleId changes
  useEffect(() => {
    if (battleId) {
      getBattleDetails(battleId)
    }
  }, [battleId, getBattleDetails])

  // Setup socket listeners on mount
  useEffect(() => {
    setupTeamBattleSocketListeners()
    return cleanupSocketListeners
  }, [setupTeamBattleSocketListeners, cleanupSocketListeners])

  // Memoized event handlers - Fixed navigation to go back to team battles
  const handleGoBack = useCallback(() => {
    navigate('/quickclash#active/4v4')
  }, [navigate])

  const handleCategorySelect = useCallback(
    category => {
      if (!currentBattle) return

      selectCategory(currentBattle._id, category).catch(error => {
        console.error('Error selecting category:', error)
      })
    },
    [currentBattle, selectCategory],
  )

  const handleCategoryDeselect = useCallback(() => {
    if (!currentBattle) return

    deselectCategory(currentBattle._id).catch(error => {
      console.error('Error deselecting category:', error)
    })
  }, [currentBattle, deselectCategory])

  const handleBeginChallenge = useCallback(() => {
    if (!currentBattle) return

    beginChallenge(currentBattle._id).catch(error => {
      console.error('Error beginning challenge:', error)
    })
  }, [currentBattle, beginChallenge])

  // Clear operation errors when component unmounts or battle changes
  useEffect(() => {
    return () => {
      resetOperationState()
    }
  }, [resetOperationState])

  // Clear errors when battle changes
  useEffect(() => {
    if (categoryOperationError) {
      clearOperationError()
    }
  }, [currentBattle?._id, categoryOperationError, clearOperationError])

  const handleViewReport = useCallback(
    async challengeId => {
      if (!challengeId) return

      setReportModalLoading(true)

      try {
        const response = await axios.get(
          `/api/quickClash/challenge/${challengeId}/sessions?userId=${user._id}`,
        )

        if (response.data && response.data.sessionId) {
          setSelectedSessionId(response.data.sessionId)
          openReportModal()
        } else {
          toast({
            title: t('Error'),
            description: t('Could not find your quiz session'),
            status: 'error',
            duration: 3000,
            isClosable: true,
          })
        }
      } catch (error) {
        console.error('Error fetching session:', error)
        toast({
          title: t('Error'),
          description: t('Failed to load quiz report'),
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
      } finally {
        setReportModalLoading(false)
      }
    },
    [user, openReportModal, toast, t],
  )

  // Loading state
  if (battleDetailsLoading && !currentBattle) {
    return (
      <Center minH="100vh" bg="gray.900">
        <VStack spacing={6}>
          <Spinner
            thickness="4px"
            speed="0.65s"
            emptyColor="gray.700"
            color="purple.500"
            size="xl"
          />
          <Text color="whiteAlpha.800" fontSize="lg">
            {t('Loading battle details...')}
          </Text>
        </VStack>
      </Center>
    )
  }

  // Error state
  if (battleDetailsError && !currentBattle) {
    return (
      <Center minH="100vh" bg="gray.900">
        <VStack spacing={6}>
          <Icon as={AlertTriangle} color="red.400" boxSize={12} />
          <Text color="red.400" fontSize="xl" textAlign="center">
            {battleDetailsError}
          </Text>
          <Button
            leftIcon={<ArrowLeft size={18} />}
            colorScheme="purple"
            size="lg"
            onClick={handleGoBack}
          >
            {t('Back to Team Battles')}
          </Button>
        </VStack>
      </Center>
    )
  }

  // Battle not found
  if (!currentBattle) {
    return (
      <Center minH="100vh" bg="gray.900">
        <VStack spacing={6}>
          <Icon as={AlertTriangle} color="yellow.400" boxSize={12} />
          <Text color="yellow.400" fontSize="xl">
            {t('Battle not found')}
          </Text>
          <Button
            leftIcon={<ArrowLeft size={18} />}
            colorScheme="purple"
            size="lg"
            onClick={handleGoBack}
          >
            {t('Back to Team Battles')}
          </Button>
        </VStack>
      </Center>
    )
  }

  return (
    <Box minH="100vh" bg="gray.900" position="relative" overflow="hidden">
      <Box width="100%" position="relative" zIndex={1}>
        {/* Header */}
        <TeamBattleHeader battle={currentBattle} onGoBack={handleGoBack} />

        {/* Teams Section */}
        <TeamsGrid
          currentBattle={currentBattle}
          userTeam={userTeam}
          userId={user?._id}
        />

        {/* Categories Section */}
        {currentBattle.status === 'active' && userTeam && (
          <CategoriesSection
            currentBattle={currentBattle}
            uncompletedCategories={uncompletedCategories}
            userTeam={userTeam}
            user={user}
            onSelectCategory={handleCategorySelect}
            onDeselectCategory={handleCategoryDeselect}
            onBeginChallenge={handleBeginChallenge}
            onViewReport={handleViewReport}
            reportModalLoading={reportModalLoading}
            // New loading props
            categoryOperationLoading={categoryOperationLoading}
            categoryOperationType={categoryOperationType}
            categoryOperationError={categoryOperationError}
            selectedCategoryForOperation={selectedCategoryForOperation}
            // Legacy props for backward compatibility
            categorySelectionLoading={categorySelectionLoading}
            selectedCategoryId={selectedCategoryId}
            completedChallenges={battleStatus.completedChallenges}
            totalChallenges={battleStatus.totalChallenges}
          />
        )}

        {/* Battle Results Section */}
        {currentBattle.status === 'completed' && (
          <BattleResultsSection
            currentBattle={currentBattle}
            userTeam={userTeam}
          />
        )}

        {/* Bottom Actions */}
        <Box textAlign="center" pt={8} pb={12}>
          <Button
            leftIcon={<ArrowLeft size={18} />}
            colorScheme="purple"
            size="lg"
            onClick={handleGoBack}
            bg="rgba(128, 90, 213, 0.8)"
            _hover={{
              bg: 'rgba(128, 90, 213, 1)',
            }}
            transition="all 0.2s"
          >
            {t('Back to Team Battles')}
          </Button>
        </Box>
      </Box>

      {/* Quiz Report Modal */}
      {isReportOpen && selectedSessionId && (
        <React.Suspense fallback={<Spinner />}>
          <QuizReportModal
            isOpen={isReportOpen}
            onClose={closeReportModal}
            sessionId={selectedSessionId}
          />
        </React.Suspense>
      )}
    </Box>
  )
})

TeamBattlePage.displayName = 'TeamBattlePage'

export default TeamBattlePage
