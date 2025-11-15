// components/quickClashComponents/team/teamBattlePageComponents/CategoriesSection.jsx
import React, { memo, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  Target,
  AlertCircle,
  Play,
  CheckCircle2,
  Lock,
  Loader2,
  Sparkles,
  FileText,
  Users,
  X,
} from 'lucide-react'

// Shadcn UI Components
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

// Category utilities
import { getCategoryInfo } from './categoriesSection/categoryUtils'

/**
 * Professional Categories Section
 *
 * Design fixes:
 * - Clean, spacious layout
 * - Clear visual states
 * - Vibrant but tasteful colors
 * - Good information hierarchy
 * - Proper touch targets
 */
const CategoriesSection = memo(
  ({
    currentBattle,
    userTeam,
    user,
    onSelectCategory,
    onDeselectCategory,
    onBeginChallenge,
    onViewReport,
    reportModalLoading,
    categoryOperationLoading,
    categoryOperationType,
    selectedCategoryForOperation,
    completedChallenges,
    totalChallenges,
  }) => {
    const { t } = useTranslation('QuickClash')
    const [showConfirm, setShowConfirm] = useState(false)

    // User participation status (unchanged)
    const userParticipationStatus = useMemo(() => {
      if (!currentBattle || !userTeam || !user) {
        return {
          hasParticipated: false,
          participatedCategory: null,
          hasCompleted: false,
          hasExited: false,
          hasSelected: false,
          selectedCategory: null,
        }
      }

      const teamMembers =
        userTeam === 'teamA'
          ? currentBattle.teamAMembers
          : currentBattle.teamBMembers

      const userMember = teamMembers.find(m => m.user._id === user._id)

      if (!userMember) {
        return {
          hasParticipated: false,
          participatedCategory: null,
          hasCompleted: false,
          hasExited: false,
          hasSelected: false,
          selectedCategory: null,
        }
      }

      const hasExited = userMember.participated && !userMember.completed
      const hasSelected = !!userMember.category
      const selectedCategory = userMember.category

      return {
        hasParticipated: userMember.participated || userMember.completed,
        participatedCategory: userMember.category,
        hasCompleted: userMember.completed,
        hasExited: hasExited,
        hasSelected: hasSelected,
        selectedCategory: selectedCategory,
      }
    }, [currentBattle, userTeam, user])

    // Enhanced category challenges (unchanged logic)
    const enhancedChallenges = useMemo(() => {
      if (!currentBattle || !userTeam || !user) return []

      return currentBattle.challenges.map(challenge => {
        const playerField = userTeam === 'teamA' ? 'teamAPlayer' : 'teamBPlayer'
        const userScore =
          userTeam === 'teamA' ? challenge.teamAScore : challenge.teamBScore
        const opponentScore =
          userTeam === 'teamA' ? challenge.teamBScore : challenge.teamAScore

        const isAssignedToPlayer = challenge[playerField] !== null
        const isUserAssigned = challenge[playerField] === user._id

        const teamMembers =
          userTeam === 'teamA'
            ? currentBattle.teamAMembers
            : currentBattle.teamBMembers
        const userMember = teamMembers.find(m => m.user._id === user._id)

        const isSelectedByUser = userMember?.category === challenge.category
        const hasUserParticipatedInThisCategory =
          isUserAssigned && userMember?.participated
        const hasUserCompletedThisCategory =
          isUserAssigned && userMember?.completed

        const teammateWhoSelected = teamMembers.find(
          m =>
            m.user._id !== user._id &&
            m.category === challenge.category &&
            !isAssignedToPlayer,
        )

        const isSelectedByTeammate = !!teammateWhoSelected

        const teammateWhoCompleted = teamMembers.find(
          m =>
            m.user._id !== user._id &&
            m.category === challenge.category &&
            m.completed,
        )

        const isCompletedByTeammate =
          !!teammateWhoCompleted &&
          !isUserAssigned &&
          !hasUserCompletedThisCategory

        const teammateInfo =
          teammateWhoSelected ||
          teamMembers.find(
            m =>
              m.user._id !== user._id && m.user._id === challenge[playerField],
          ) ||
          teammateWhoCompleted

        const isCompleted = hasUserCompletedThisCategory
        const isSelectedButNotStarted =
          isSelectedByUser &&
          !isUserAssigned &&
          !hasUserParticipatedInThisCategory

        const isAvailable =
          !isSelectedByUser &&
          !isSelectedByTeammate &&
          !isAssignedToPlayer &&
          !hasUserParticipatedInThisCategory &&
          !userParticipationStatus.hasParticipated &&
          !userParticipationStatus.hasExited &&
          !userParticipationStatus.hasSelected &&
          !isCompletedByTeammate

        const isLockedDueToSelection =
          userParticipationStatus.hasSelected &&
          challenge.category !== userParticipationStatus.selectedCategory

        const isLockedDueToExit =
          userParticipationStatus.hasExited &&
          challenge.category !== userParticipationStatus.participatedCategory

        const isLocked = isLockedDueToSelection || isLockedDueToExit

        const isThisCategoryLoading =
          categoryOperationLoading &&
          (selectedCategoryForOperation === challenge.category ||
            isSelectedByUser)

        const loadingType = isThisCategoryLoading ? categoryOperationType : null

        const isDisabled = categoryOperationLoading && !isThisCategoryLoading

        return {
          ...challenge,
          isAvailable,
          isCompleted,
          isSelectedButNotStarted,
          isSelectedByTeammate,
          isUserAssigned,
          userScore,
          opponentScore,
          isLoading: isThisCategoryLoading,
          loadingType,
          isDisabled,
          isLockedDueToExit,
          isLockedDueToSelection,
          isLocked,
          isCompletedByTeammate,
          teammateInfo: {
            name: teammateInfo?.user?.name || teammateInfo?.user?.inGameName,
            inGameName: teammateInfo?.user?.inGameName,
            hasCompleted: teammateInfo?.completed || false,
            teammateScore: teammateWhoCompleted ? userScore : null,
            opponentScore: teammateWhoCompleted ? opponentScore : null,
          },
        }
      })
    }, [
      currentBattle,
      userTeam,
      user,
      categoryOperationLoading,
      categoryOperationType,
      selectedCategoryForOperation,
      userParticipationStatus,
    ])

    if (!currentBattle || !userTeam) return null

    return (
      <div className="px-4 mb-5 sm:px-6 sm:mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 sm:p-6 border border-white/10"
        >
          {/* Header */}
          <div className="text-center mb-5">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Target className="w-5 h-5 text-cyan-400" />
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                {t('Choose Your Challenge')}
              </h2>
            </div>
            <p className="text-sm text-white/60">
              {t('Select a category to battle')}
            </p>
          </div>

          {/* Progress */}
          <div className="mb-5">
            <div className="flex items-center justify-between text-sm text-white/70 mb-2">
              <span className="font-semibold">{t('Progress')}</span>
              <span className="font-bold text-white">
                {completedChallenges}/{totalChallenges}
              </span>
            </div>
            <Progress
              value={(completedChallenges / totalChallenges) * 100}
              className="h-2 bg-white/10"
            />
          </div>

          {/* Categories grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-4">
            {enhancedChallenges.map((challenge, index) => (
              <CategoryCard
                key={`${challenge.category}-${index}`}
                challenge={challenge}
                index={index}
                onSelectCategory={onSelectCategory}
                onDeselectCategory={onDeselectCategory}
                onBeginChallenge={() => setShowConfirm(true)}
                onViewReport={onViewReport}
                reportModalLoading={reportModalLoading}
                t={t}
              />
            ))}
          </div>

          {/* Info messages */}
          <AnimatePresence>
            {userParticipationStatus.hasSelected &&
              !userParticipationStatus.hasParticipated && (
                <InfoMessage
                  type="info"
                  message={t('{{category}} selected. Ready to begin?', {
                    category: userParticipationStatus.selectedCategory,
                  })}
                />
              )}
            {userParticipationStatus.hasExited && (
              <InfoMessage
                type="warning"
                message={t(
                  'You have exited a challenge and cannot participate in others.',
                )}
              />
            )}
          </AnimatePresence>
        </motion.div>

        {/* Clean confirmation modal */}
        <AnimatePresence>
          {showConfirm && (
            <div
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowConfirm(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-slate-800 rounded-2xl p-6 max-w-sm w-full border border-white/10"
                onClick={e => e.stopPropagation()}
              >
                <div className="text-center mb-5">
                  <div className="inline-flex items-center justify-center w-12 h-12 mb-3 rounded-xl bg-orange-500/20">
                    <AlertCircle className="w-6 h-6 text-orange-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    {t('Start Challenge?')}
                  </h3>
                  <p className="text-sm text-white/70">
                    {t('You cannot change categories after starting.')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setShowConfirm(false)}
                    variant="outline"
                    className="flex-1 border-white/20 hover:bg-white/10 text-white"
                  >
                    {t('Cancel')}
                  </Button>
                  <Button
                    onClick={() => {
                      setShowConfirm(false)
                      onBeginChallenge()
                    }}
                    className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold"
                  >
                    <Play className="w-4 h-4 mr-1" />
                    {t('Start')}
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    )
  },
)

/**
 * Clean Category Card
 */
const CategoryCard = memo(
  ({
    challenge,
    index,
    onSelectCategory,
    onDeselectCategory,
    onBeginChallenge,
    onViewReport,
    reportModalLoading,
    t,
  }) => {
    const categoryInfo = getCategoryInfo(challenge.category)

    const getState = () => {
      if (challenge.isCompleted) return 'completed'
      if (challenge.isSelectedButNotStarted) return 'selected'
      if (challenge.isCompletedByTeammate || challenge.isSelectedByTeammate)
        return 'teammate'
      if (challenge.isLocked) return 'locked'
      if (challenge.isAvailable) return 'available'
      return 'locked'
    }

    const state = getState()

    const stateStyles = {
      available: {
        bg: 'bg-white/5 hover:bg-white/10',
        border: 'border border-white/20 hover:border-cyan-500/50',
        cursor: 'cursor-pointer',
      },
      selected: {
        bg: 'bg-cyan-500/10',
        border: 'border-2 border-cyan-500/50',
      },
      completed: {
        bg: 'bg-green-500/10',
        border: 'border-2 border-green-500/50',
      },
      teammate: {
        bg: 'bg-purple-500/10',
        border: 'border border-purple-500/30',
      },
      locked: {
        bg: 'bg-white/5',
        border: 'border border-white/10',
        opacity: 'opacity-40',
      },
    }

    const style = stateStyles[state]

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.04 }}
        className={`relative rounded-xl p-3 transition-all ${style.bg} ${style.border} ${style.cursor} ${style.opacity}`}
        onClick={() => {
          if (challenge.isAvailable && !challenge.isDisabled) {
            onSelectCategory(challenge.category)
          }
        }}
      >
        {/* Loading */}
        {challenge.isLoading && (
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm rounded-xl z-10 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
          </div>
        )}

        {/* Status icon */}
        <div className="absolute top-2 right-2 z-10">
          {state === 'completed' && (
            <CheckCircle2 className="w-4 h-4 text-green-400" />
          )}
          {state === 'selected' && (
            <Sparkles className="w-4 h-4 text-cyan-400" />
          )}
          {state === 'teammate' && (
            <Users className="w-4 h-4 text-purple-400" />
          )}
          {state === 'locked' && <Lock className="w-4 h-4 text-slate-400" />}
        </div>

        {/* Category icon */}
        <div className="flex justify-center mb-3">
          <div
            className="p-3 rounded-lg"
            style={{
              background: `linear-gradient(135deg, ${categoryInfo.primaryColor}, ${categoryInfo.secondaryColor})`,
            }}
          >
            {React.createElement(categoryInfo.iconComponent, {
              className: 'w-6 h-6 sm:w-7 sm:h-7 text-white',
            })}
          </div>
        </div>

        {/* Name */}
        <h4 className="text-sm font-bold text-center text-white capitalize mb-2 leading-tight">
          {challenge.category}
        </h4>

        {/* Teammate */}
        {challenge.teammateInfo?.name && (
          <p className="text-xs text-center text-purple-300 mb-2 truncate">
            {challenge.teammateInfo.inGameName || challenge.teammateInfo.name}
          </p>
        )}

        {/* Scores */}
        {(challenge.isCompleted || challenge.isCompletedByTeammate) && (
          <div className="flex items-center justify-center gap-1.5 text-xs mb-2">
            <span className="font-bold text-green-400">
              {challenge.userScore ?? '?'}
            </span>
            <span className="text-white/50">-</span>
            <span className="font-bold text-red-400">
              {challenge.opponentScore ?? '?'}
            </span>
          </div>
        )}

        {/* Action */}
        <CategoryAction
          state={state}
          challenge={challenge}
          onSelectCategory={onSelectCategory}
          onDeselectCategory={onDeselectCategory}
          onBeginChallenge={onBeginChallenge}
          onViewReport={onViewReport}
          reportModalLoading={reportModalLoading}
          t={t}
        />
      </motion.div>
    )
  },
)

/**
 * Category Action Button
 */
const CategoryAction = memo(
  ({
    state,
    challenge,
    onSelectCategory,
    onDeselectCategory,
    onBeginChallenge,
    onViewReport,
    reportModalLoading,
    t,
  }) => {
    switch (state) {
      case 'completed':
        return (
          <Button
            size="sm"
            variant="outline"
            className="w-full h-9 text-xs border-green-500/40 text-green-300 hover:bg-green-500/10"
            onClick={e => {
              e.stopPropagation()
              onViewReport(challenge.challenge?._id)
            }}
            disabled={reportModalLoading}
          >
            <FileText className="w-3 h-3 mr-1" />
            {t('Report')}
          </Button>
        )

      case 'selected':
        return (
          <div className="space-y-1.5" onClick={e => e.stopPropagation()}>
            <Button
              size="sm"
              className="w-full h-9 text-xs bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold"
              onClick={onBeginChallenge}
              disabled={challenge.isDisabled}
            >
              <Play className="w-3 h-3 mr-1" />
              {t('Start')}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="w-full h-7 text-xs text-white/60 hover:text-white hover:bg-white/10"
              onClick={onDeselectCategory}
              disabled={challenge.isDisabled}
            >
              <X className="w-3 h-3 mr-1" />
              {t('Change')}
            </Button>
          </div>
        )

      case 'available':
        return (
          <Button
            size="sm"
            className="w-full h-9 text-xs bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold"
            onClick={e => {
              e.stopPropagation()
              onSelectCategory(challenge.category)
            }}
            disabled={challenge.isDisabled}
          >
            {t('Select')}
          </Button>
        )

      case 'teammate':
        return (
          <Badge className="w-full justify-center h-9 bg-purple-500/20 text-purple-300 border-purple-500/40 text-xs">
            {t('Teammate')}
          </Badge>
        )

      default:
        return (
          <Badge className="w-full justify-center h-9 bg-white/5 text-slate-400 border-slate-500/30 text-xs">
            <Lock className="w-3 h-3 mr-1" />
            {t('Locked')}
          </Badge>
        )
    }
  },
)

/**
 * Info Message
 */
const InfoMessage = memo(({ type, message }) => {
  const config = {
    info: {
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/30',
      text: 'text-cyan-300',
      icon: Sparkles,
    },
    warning: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      text: 'text-red-300',
      icon: AlertCircle,
    },
  }

  const { bg, border, text, icon: Icon } = config[type]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`${bg} ${border} border rounded-lg p-3 flex items-start gap-2`}
    >
      <Icon className={`w-4 h-4 ${text} flex-shrink-0 mt-0.5`} />
      <p className={`text-sm ${text}`}>{message}</p>
    </motion.div>
  )
})

CategoryCard.displayName = 'CategoryCard'
CategoryAction.displayName = 'CategoryAction'
InfoMessage.displayName = 'InfoMessage'
CategoriesSection.displayName = 'CategoriesSection'

export default CategoriesSection
