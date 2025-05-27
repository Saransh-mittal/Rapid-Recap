// components/quickClashComponents/team/TeamBattlePage.jsx
import React, { useState, useEffect, useCallback } from 'react'
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
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { AlertTriangle, ArrowLeft } from 'lucide-react'
import axios from 'axios'

// Custom hooks
import useQuickClashTeamBattle from '../../../customHooks/useQuickClashTeamBattle'
import { useSocket } from '../../../customHooks/useSocket'

// Import enhanced components
import TeamBattleHeader from './teamBattlePageComponents/TeamBattleHeader'
import TeamBattleProgress from './teamBattlePageComponents/TeamBattleProgress'
import TeamsGrid from './teamBattlePageComponents/TeamsGrid'
import CategoriesSection from './teamBattlePageComponents/CategoriesSection'
import BattleResultsSection from './teamBattlePageComponents/BattleResultsSection'

// Import QuizReportModal
const QuizReportModal = React.lazy(() => import('../QuizReportModal'))

const MotionBox = motion(Box)

// Enhanced animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15,
      duration: 0.6,
    },
  },
}

/**
 * Enhanced Team Battle Page Component with better aesthetics and responsiveness
 */
const TeamBattlePage = () => {
  const { t } = useTranslation('QuickClash')
  const toast = useToast()
  const navigate = useNavigate()
  const { battleId } = useParams()
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
    categorySelectionLoading,
    getBattleDetails,
    selectCategory,
    setupTeamBattleSocketListeners,
    cleanupSocketListeners,
  } = useQuickClashTeamBattle()

  // Local state
  const [selectedCategoryId, setSelectedCategoryId] = useState(null)

  // Join the teams socket room when this page loads
  useEffect(() => {
    const socket = getSocket()
    if (socket) {
      socket.emit('quickClash:viewTeamBattles')
      console.log('Joined quickClash:teams room from TeamBattlePage')
    }
  }, [getSocket])

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
      <Center
        minH="100vh"
        bg="linear-gradient(135deg, #1a1527 0%, #2d1b4e 100%)"
      >
        <VStack spacing={6}>
          <MotionBox
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.8, 1, 0.8],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          >
            <Spinner
              thickness="4px"
              speed="0.65s"
              emptyColor="gray.700"
              color="purple.500"
              size="xl"
            />
          </MotionBox>
          <Text color="whiteAlpha.800" fontSize="lg">
            {t('Loading battle details...')}
          </Text>
        </VStack>
      </Center>
    )
  }

  // Render error state
  if (battleDetailsError && !currentBattle) {
    return (
      <Center
        minH="100vh"
        bg="linear-gradient(135deg, #1a1527 0%, #2d1b4e 100%)"
      >
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
            {t('Back to Challenges')}
          </Button>
        </VStack>
      </Center>
    )
  }

  // If no battle found
  if (!currentBattle) {
    return (
      <Center
        minH="100vh"
        bg="linear-gradient(135deg, #1a1527 0%, #2d1b4e 100%)"
      >
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
            {t('Back to Challenges')}
          </Button>
        </VStack>
      </Center>
    )
  }

  return (
    <Box minH="100vh" bg="gray.900" position="relative" overflow="hidden">
      {/* Animated background particles */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        opacity={0.1}
        overflow="hidden"
      >
        {[...Array(15)].map((_, i) => (
          <MotionBox
            key={i}
            position="absolute"
            width={`${Math.random() * 4 + 2}px`}
            height={`${Math.random() * 4 + 2}px`}
            bg="white"
            borderRadius="full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              y: [
                Math.random() * window.innerHeight,
                Math.random() * window.innerHeight,
              ],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        ))}
      </Box>

      <MotionBox
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        width="100%"
        position="relative"
        zIndex={1}
      >
        {/* Enhanced Header */}
        <TeamBattleHeader
          battle={currentBattle}
          battleStatus={battleStatus}
          userTeam={userTeam}
          onGoBack={handleGoBack}
          variants={itemVariants}
        />

        {/* Enhanced Progress Bar */}
        <TeamBattleProgress
          battleStatus={battleStatus}
          variants={itemVariants}
        />

        {/* Enhanced Teams Section */}
        <TeamsGrid
          currentBattle={currentBattle}
          userTeam={userTeam}
          userId={user._id}
          variants={itemVariants}
        />

        {/* Enhanced Categories Section */}
        {currentBattle.status === 'active' && userTeam && (
          <CategoriesSection
            currentBattle={currentBattle}
            uncompletedCategories={uncompletedCategories}
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

        {/* Enhanced Battle Results Section */}
        {currentBattle.status === 'completed' && (
          <BattleResultsSection
            currentBattle={currentBattle}
            userTeam={userTeam}
            variants={itemVariants}
          />
        )}

        {/* Bottom Actions */}
        <MotionBox variants={itemVariants} textAlign="center" pt={8} pb={12}>
          <Button
            leftIcon={<ArrowLeft size={18} />}
            colorScheme="purple"
            size="lg"
            onClick={handleGoBack}
            bg="rgba(128, 90, 213, 0.8)"
            _hover={{
              bg: 'rgba(128, 90, 213, 1)',
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 20px rgba(128, 90, 213, 0.4)',
            }}
            _active={{
              transform: 'translateY(0)',
            }}
            transition="all 0.2s"
          >
            {t('Back to Challenges')}
          </Button>
        </MotionBox>
      </MotionBox>

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
}

export default TeamBattlePage
