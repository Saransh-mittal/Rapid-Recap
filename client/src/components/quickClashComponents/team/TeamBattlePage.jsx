// components/quickClashComponents/team/TeamBattlePage.jsx
import React, { useState, useEffect, useCallback } from 'react'
import {
  Box,
  Button,
  Flex,
  Center,
  Spinner,
  VStack,
  Text,
  Icon,
  useToast,
  useDisclosure,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { AlertTriangle, ArrowLeft } from 'lucide-react'
import axios from 'axios'

// Custom hooks
import useQuickClashTeamBattle from '../../../customHooks/useQuickClashTeamBattle'

// Import components
import TeamBattleHeader from './teamBattlePageComponents/TeamBattleHeader'
import TeamBattleProgress from './teamBattlePageComponents/TeamBattleProgress'
import TeamsGrid from './teamBattlePageComponents/TeamsGrid'
import CategoriesSection from './teamBattlePageComponents/CategoriesSection'
import BattleResultsSection from './teamBattlePageComponents/BattleResultsSection'

// Import QuizReportModal
const QuizReportModal = React.lazy(() => import('../QuizReportModal'))

const MotionBox = motion(Box)
const MotionFlex = motion(Flex)

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15,
    },
  },
}

/**
 * Main Team Battle Page Component
 * This has been refactored to use smaller, reusable components
 */
const TeamBattlePage = () => {
  const { t } = useTranslation('QuickClash')
  const toast = useToast()
  const navigate = useNavigate()
  const { battleId } = useParams()
  const { user } = useSelector(state => state.auth)

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
    categorySelectionLoading,
    getBattleDetails,
    selectCategory,
    setupTeamBattleSocketListeners,
    cleanupSocketListeners,
  } = useQuickClashTeamBattle()

  // Local state
  const [selectedCategoryId, setSelectedCategoryId] = useState(null)

  // Fetch battle details on mount and when battleId changes
  useEffect(() => {
    if (battleId) {
      getBattleDetails(battleId)
    }

    return () => {
      // Cleanup
    }
  }, [battleId, getBattleDetails])

  // Setup socket listeners on mount
  useEffect(() => {
    setupTeamBattleSocketListeners()

    return () => {
      cleanupSocketListeners()
    }
  }, [setupTeamBattleSocketListeners, cleanupSocketListeners])

  // Determine if the current user is in team A or B
  const userTeam = React.useMemo(() => {
    if (!currentBattle || !user) return null

    const isInTeamA = currentBattle.teamAMembers.some(
      member => member.user._id === user._id,
    )

    const isInTeamB = currentBattle.teamBMembers.some(
      member => member.user._id === user._id,
    )

    return isInTeamA ? 'teamA' : isInTeamB ? 'teamB' : null
  }, [currentBattle, user])

  // Get user's record in this battle
  const userRecord = React.useMemo(() => {
    if (!currentBattle || !userTeam || !user) return null

    const teamMembers =
      userTeam === 'teamA'
        ? currentBattle.teamAMembers
        : currentBattle.teamBMembers
    return teamMembers.find(member => member.user._id === user._id)
  }, [currentBattle, userTeam, user])

  // Calculate battle status and completion
  const battleStatus = React.useMemo(() => {
    if (!currentBattle) return {}

    // Calculate completion percentage
    const totalChallenges = currentBattle.challenges.length
    const completedChallenges = currentBattle.challenges.filter(
      challenge => challenge.teamACompleted && challenge.teamBCompleted,
    ).length

    const completionPercentage =
      totalChallenges > 0
        ? Math.round((completedChallenges / totalChallenges) * 100)
        : 0

    // Determine battle status
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

  // Get uncompleted categories for the user's team
  const uncompletedCategories = React.useMemo(() => {
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

  // Get categories the user has already completed
  const userCompletedCategories = React.useMemo(() => {
    if (!currentBattle || !userTeam || !user) return []

    // Get user's team members array
    const teamMembers =
      userTeam === 'teamA'
        ? currentBattle.teamAMembers
        : currentBattle.teamBMembers

    // Find the current user's record
    const userMember = teamMembers.find(m => m.user._id === user._id)

    // If user has completed a challenge, return its category
    if (userMember && userMember.completed && userMember.category) {
      return [userMember.category]
    }

    return []
  }, [currentBattle, userTeam, user])

  // Check if the current user has already participated in any challenge
  const hasUserParticipated = React.useMemo(() => {
    if (!currentBattle || !userTeam || !user) return false

    // Get user's team members array
    const teamMembers =
      userTeam === 'teamA'
        ? currentBattle.teamAMembers
        : currentBattle.teamBMembers

    // Find the current user's record
    const userMember = teamMembers.find(m => m.user._id === user._id)

    // Check if user has participated in any challenge
    return userMember && (userMember.participated || userMember.completed)
  }, [currentBattle, userTeam, user])

  // Get categories selected by teammates but not yet completed by them
  const teammatesSelectedCategories = React.useMemo(() => {
    if (!currentBattle || !userTeam || !user) return []

    // Get team members array excluding current user
    const teamMembers = (
      userTeam === 'teamA'
        ? currentBattle.teamAMembers
        : currentBattle.teamBMembers
    ).filter(m => m.user._id !== user._id)

    // Get categories selected by teammates
    return teamMembers
      .filter(m => m.category && !m.completed)
      .map(m => m.category)
  }, [currentBattle, userTeam, user])

  // Handle go back
  const handleGoBack = useCallback(() => {
    navigate('/quickclash')
  }, [navigate])

  // Handle selecting a category
  const handleCategorySelect = useCallback(
    category => {
      if (!currentBattle || !category) return

      const challenge = currentBattle.challenges.find(
        c => c.category === category,
      )
      if (!challenge) return

      setSelectedCategoryId(challenge.challenge)

      selectCategory(currentBattle._id, category)
        .then(() => {
          // Navigation will happen in the hook after successful selection
          console.log('Category selected successfully')
        })
        .catch(error => {
          console.error('Error selecting category:', error)
          setSelectedCategoryId(null)
          toast({
            title: 'Error',
            description: error.message || 'Failed to select category',
            status: 'error',
            duration: 3000,
            isClosable: true,
          })
        })
    },
    [currentBattle, selectCategory, toast],
  )

  // Handle viewing a challenge report
  const handleViewReport = useCallback(
    async challengeId => {
      if (!challengeId) return

      setReportModalLoading(true)

      try {
        // Get the session ID for this challenge
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

  // Rendering loading state
  if (battleDetailsLoading && !currentBattle) {
    return (
      <Center minH="400px">
        <VStack spacing={4}>
          <Spinner
            thickness="4px"
            speed="0.65s"
            emptyColor="gray.700"
            color="purple.500"
            size="xl"
          />
          <Text color="whiteAlpha.700">{t('Loading battle details...')}</Text>
        </VStack>
      </Center>
    )
  }

  // Render error state
  if (battleDetailsError && !currentBattle) {
    return (
      <Center minH="400px">
        <VStack spacing={4}>
          <Icon as={AlertTriangle} color="red.400" boxSize={10} />
          <Text color="red.400">{battleDetailsError}</Text>
          <Button
            leftIcon={<ArrowLeft size={18} />}
            colorScheme="purple"
            onClick={handleGoBack}
          >
            {t('Back to Challenges')}
          </Button>
        </VStack>
      </Center>
    )
  }

  // If no battle found
  if (!currentBattle) {
    return (
      <Center minH="400px">
        <VStack spacing={4}>
          <Icon as={AlertTriangle} color="yellow.400" boxSize={10} />
          <Text color="yellow.400">{t('Battle not found')}</Text>
          <Button
            leftIcon={<ArrowLeft size={18} />}
            colorScheme="purple"
            onClick={handleGoBack}
          >
            {t('Back to Challenges')}
          </Button>
        </VStack>
      </Center>
    )
  }

  return (
    <MotionBox
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      width="100%"
    >
      {/* Header */}
      <TeamBattleHeader
        battle={currentBattle}
        battleStatus={battleStatus}
        userTeam={userTeam}
        onGoBack={handleGoBack}
        variants={itemVariants}
      />

      {/* Progress Bar */}
      <TeamBattleProgress battleStatus={battleStatus} variants={itemVariants} />

      {/* Teams Section */}
      <TeamsGrid
        currentBattle={currentBattle}
        userTeam={userTeam}
        userId={user._id}
        variants={itemVariants}
      />

      {/* Categories Section - only shown if battle is active and user is part of it */}
      {currentBattle.status === 'active' && userTeam && (
        <CategoriesSection
          currentBattle={currentBattle}
          uncompletedCategories={uncompletedCategories}
          userCompletedCategories={userCompletedCategories}
          hasUserParticipated={hasUserParticipated}
          teammatesSelectedCategories={teammatesSelectedCategories}
          userTeam={userTeam}
          user={user}
          onSelectCategory={handleCategorySelect}
          onViewReport={handleViewReport}
          reportModalLoading={reportModalLoading}
          categorySelectionLoading={categorySelectionLoading}
          selectedCategoryId={selectedCategoryId}
          variants={itemVariants}
        />
      )}

      {/* Battle Results Section - only shown if battle is completed */}
      {currentBattle.status === 'completed' && (
        <BattleResultsSection
          currentBattle={currentBattle}
          userTeam={userTeam}
          variants={itemVariants}
        />
      )}

      {/* Bottom Actions */}
      <MotionFlex variants={itemVariants} justify="center" pt={4} pb={8}>
        <Button
          leftIcon={<ArrowLeft size={18} />}
          colorScheme="purple"
          onClick={handleGoBack}
        >
          {t('Back to Challenges')}
        </Button>
      </MotionFlex>

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
    </MotionBox>
  )
}

export default TeamBattlePage
