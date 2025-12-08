// components/quickClashComponents/team/TeamBattlePage.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, AlertTriangle, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

// Custom hooks
import useQuickClashTeamBattle from '../../../customHooks/useQuickClashTeamBattle'
import { useSocket } from '../../../customHooks/useSocket'

// Shadcn UI Components
import { Button } from '@/components/ui/button'

// Import redesigned sub-components
import TeamBattleHeader from './teamBattlePageComponents/TeamBattleHeader'
import TeamsGrid from './teamBattlePageComponents/TeamsGrid'
import CategoriesSection from './teamBattlePageComponents/CategoriesSection'
import BattleResultsSection from './teamBattlePageComponents/BattleResultsSection'
import PowerupsSection from './teamBattlePageComponents/PowerupsSection'
import PowerupDonationModal from '../powerups/PowerupDonationModal'
import PowerupSelectionModal from '../powerups/PowerupSelectionModal'

// Lazy load report modal
const QuizReportModal = React.lazy(() => import('../QuizReportModal'))

/**
 * Team Battle Page - Mobile-First, No Background
 *
 * Works with existing FixedBackground from App.jsx
 * Uses transparent glassmorphism to show app background
 * Mobile-first responsive design
 */
const TeamBattlePage = React.memo(() => {
  const { t } = useTranslation('QuickClash')
  const navigate = useNavigate()
  const { battleId } = useParams()
  const { user } = useSelector(state => state.auth)
  const { getSocket } = useSocket()

  // State for quiz report modal
  const [selectedSessionId, setSelectedSessionId] = useState(null)
  const [reportModalLoading, setReportModalLoading] = useState(false)
  const [isReportOpen, setIsReportOpen] = useState(false)

  // Powerup Modals State
  const [isDonationOpen, setIsDonationOpen] = useState(false)
  const [isSelectionOpen, setIsSelectionOpen] = useState(false)

  // Custom hook for team battles (unchanged)
  const {
    currentBattle,
    battleDetailsLoading,
    battleDetailsError,
    categoryOperationLoading,
    categoryOperationType,
    categoryOperationError,
    selectedCategoryForOperation,
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

  // Memoized user team calculation (unchanged logic)
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

  // Memoized battle status (unchanged logic)
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

  // Socket room joining (unchanged)
  useEffect(() => {
    const socket = getSocket()
    if (socket) {
      socket.emit('quickClash:viewTeamBattles')
    }
  }, [getSocket])

  // Fetch battle details (unchanged)
  useEffect(() => {
    if (battleId) {
      getBattleDetails(battleId)
    }
  }, [battleId, getBattleDetails])

  // Setup socket listeners (unchanged)
  useEffect(() => {
    setupTeamBattleSocketListeners()
    return cleanupSocketListeners
  }, [setupTeamBattleSocketListeners, cleanupSocketListeners])

  // Event handlers (unchanged logic)
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

  // Clear errors (unchanged)
  useEffect(() => {
    return () => {
      resetOperationState()
    }
  }, [resetOperationState])

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
        const response = await fetch(
          `/api/quickClash/challenge/${challengeId}/sessions?userId=${user._id}`,
        )
        const data = await response.json()

        if (data && data.sessionId) {
          setSelectedSessionId(data.sessionId)
          setIsReportOpen(true)
        } else {
          console.error('Could not find quiz session')
        }
      } catch (error) {
        console.error('Error fetching session:', error)
      } finally {
        setReportModalLoading(false)
      }
    },
    [user],
  )

  // Loading state - minimal, works with app background
  if (battleDetailsLoading && !currentBattle) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4 md:gap-6"
        >
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              <Loader2 className="w-12 h-12 md:w-16 md:h-16 text-cyan-400" />
            </motion.div>
            <motion.div
              className="absolute inset-0 blur-xl bg-cyan-400/30 rounded-full"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base md:text-lg text-cyan-100 font-medium text-center"
          >
            {t('Loading battle details...')}
          </motion.p>
        </motion.div>
      </div>
    )
  }

  // Error state
  if (battleDetailsError && !currentBattle) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-4 md:gap-6 max-w-md mx-auto"
        >
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <AlertTriangle className="w-16 h-16 md:w-20 md:h-20 text-red-400" />
          </motion.div>
          <p className="text-lg md:text-xl text-red-400 text-center font-medium">
            {battleDetailsError}
          </p>
          <Button
            onClick={handleGoBack}
            className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('Back to Team Battles')}
          </Button>
        </motion.div>
      </div>
    )
  }

  // Battle not found
  if (!currentBattle) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-4 md:gap-6"
        >
          <AlertTriangle className="w-16 h-16 md:w-20 md:h-20 text-yellow-400" />
          <p className="text-lg md:text-xl text-yellow-400 font-medium">
            {t('Battle not found')}
          </p>
          <Button
            onClick={handleGoBack}
            className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('Back to Team Battles')}
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Content - positioned relative to show above background */}
      <div className="relative z-10 w-full pb-8 md:pb-12">
        {/* Header */}
        <TeamBattleHeader battle={currentBattle} onGoBack={handleGoBack} />

        {/* Powerups Section */}
        {currentBattle.status === 'active' && userTeam && (
          <PowerupsSection
            currentBattle={currentBattle}
            userTeam={userTeam}
            userId={user?._id}
            onOpenDonation={() => setIsDonationOpen(true)}
            onOpenSelection={() => setIsSelectionOpen(true)}
          />
        )}

        {/* Teams Section */}

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
            userTeam={userTeam}
            user={user}
            onSelectCategory={handleCategorySelect}
            onDeselectCategory={handleCategoryDeselect}
            onBeginChallenge={handleBeginChallenge}
            onViewReport={handleViewReport}
            reportModalLoading={reportModalLoading}
            categoryOperationLoading={categoryOperationLoading}
            categoryOperationType={categoryOperationType}
            categoryOperationError={categoryOperationError}
            selectedCategoryForOperation={selectedCategoryForOperation}
            categorySelectionLoading={categorySelectionLoading}
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center pt-6 md:pt-8"
        >
          <Button
            onClick={handleGoBack}
            variant="outline"
            className="bg-slate-800/50 border-cyan-500/30 hover:bg-slate-800/70 hover:border-cyan-500/50 text-cyan-100"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('Back to Team Battles')}
          </Button>
        </motion.div>
      </div>

      {/* Quiz Report Modal */}
      <AnimatePresence>
        {isReportOpen && selectedSessionId && (
          <React.Suspense
            fallback={
              <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
                <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
              </div>
            }
          >
            <QuizReportModal
              isOpen={isReportOpen}
              onClose={() => setIsReportOpen(false)}
              sessionId={selectedSessionId}
            />
          </React.Suspense>
        )}
      </AnimatePresence>

      {/* Powerup Modals */}
      {currentBattle && userTeam && (
        <>
          <PowerupDonationModal
            isOpen={isDonationOpen}
            onClose={() => setIsDonationOpen(false)}
            battleId={currentBattle._id}
            teamId={userTeam === 'teamA' ? currentBattle.teamA._id : currentBattle.teamB._id}
          />
          <PowerupSelectionModal
            isOpen={isSelectionOpen}
            onClose={() => setIsSelectionOpen(false)}
            battleId={currentBattle._id}
            teamId={userTeam === 'teamA' ? currentBattle.teamA._id : currentBattle.teamB._id}
          />
        </>
      )}
    </div>
  )
})

TeamBattlePage.displayName = 'TeamBattlePage'

export default TeamBattlePage
