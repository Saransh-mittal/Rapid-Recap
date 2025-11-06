// components/quickClashComponents/modals/MatchPreparationModal.jsx - RESPONSIVE FOR ALL SCREENS
import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  memo,
  useMemo,
} from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  Sword,
  Shield,
  CheckCircle,
  Zap,
  PlayCircle,
  Loader,
  Minimize2,
  X,
} from 'lucide-react'
import { useSelector, useDispatch } from 'react-redux'
import {
  clearMatchmakingAfterChallengeReady,
  clearMatchmakingAfterModalClose,
} from '../../../redux/quickClashMatchmakingSlice'

// Import centralized color scheme
import { QUICK_CLASH_CLASSES } from '../utils/quickClashColors'

// Import simplified win probability component
import WinProbabilityBar from '../ui/WinProbabilityBar'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'

const MotionDiv = motion.div

// Step configurations
const STEP_CONFIGS = [
  {
    id: 'matchFound',
    title: 'Match Found',
    description: 'Found your opponent!',
    color: 'text-green-500',
    progressMin: 0,
    progressMax: 20,
  },
  {
    id: 'contentLoading',
    title: 'Loading Content',
    description: 'Preparing quiz content...',
    color: 'text-blue-500',
    progressMin: 20,
    progressMax: 60,
  },
  {
    id: 'generatingQuiz',
    title: 'Generating Questions',
    description: 'Creating your challenge...',
    color: 'text-purple-500',
    progressMin: 60,
    progressMax: 95,
  },
  {
    id: 'challengeReady',
    title: 'Challenge Ready',
    description: 'Ready to play!',
    color: 'text-teal-500',
    progressMin: 95,
    progressMax: 100,
  },
]

const calculateTrophyPotential = (playerTrophies, opponentTrophies) => {
  const BASE_TROPHIES = 30
  const TROPHY_K_FACTOR = 0.8

  const potentialGain = Math.max(
    5,
    Math.round(
      BASE_TROPHIES *
        (1 + (TROPHY_K_FACTOR * (opponentTrophies - playerTrophies)) / 500),
    ),
  )

  const potentialLoss = Math.min(
    potentialGain,
    Math.max(0, playerTrophies - 100),
  )

  return { potentialGain, potentialLoss }
}

// VS Badge Component
const VSBadge = memo(({ size = 'md', isActive = false }) => {
  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-8 h-8 text-xs',
    lg: 'w-10 h-10 text-sm',
  }

  return (
    <div
      className={`
        ${sizeClasses[size]}
        rounded-full
        ${
          isActive
            ? 'bg-green-500 border-green-400'
            : 'bg-gray-700 border-yellow-400'
        }
        border-2
        flex items-center justify-center
        ${
          isActive
            ? 'shadow-lg shadow-green-500/50'
            : 'shadow-md shadow-yellow-400/30'
        }
        transition-all duration-300
        flex-shrink-0
      `}
    >
      <span
        className={`font-bold ${isActive ? 'text-white' : 'text-yellow-400'}`}
      >
        VS
      </span>
    </div>
  )
})
VSBadge.displayName = 'VSBadge'

// Progress Bar Component
const ProgressBar = memo(({ progress, isComplete }) => {
  return (
    <div className="relative w-full h-2 bg-black/30 rounded-full overflow-hidden border border-white/20">
      <MotionDiv
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ type: 'spring', stiffness: 80, damping: 15 }}
        className={`
          absolute left-0 top-0 h-full
          ${isComplete ? 'bg-green-400' : 'bg-purple-500'}
          ${isComplete ? 'shadow-green-400/40' : 'shadow-purple-400/30'}
          shadow-md
          rounded-full
        `}
      />
    </div>
  )
})
ProgressBar.displayName = 'ProgressBar'

// Player Card Component
const PlayerCard = memo(({ player, isUser = false, avatarSize = 'lg' }) => {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-14 h-14',
    lg: 'w-16 h-16',
  }

  return (
    <div className="flex flex-col items-center space-y-1.5 flex-1 min-w-0">
      <span
        className={`text-xs ${QUICK_CLASH_CLASSES.textMuted} font-medium text-center truncate max-w-full`}
      >
        {player?.inGameName || (isUser ? 'You' : 'Opponent')}
      </span>

      <MotionDiv
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: 'spring',
          stiffness: 200,
          damping: 20,
          delay: isUser ? 0.2 : 0.4,
        }}
      >
        <Avatar
          className={`
            ${sizeClasses[avatarSize]}
            ${isUser ? 'ring-2 ring-purple-300' : 'ring-2 ring-blue-300'}
            ring-offset-2 ring-offset-slate-900
          `}
        >
          <AvatarImage src={player?.pic} alt={player?.name} />
          <AvatarFallback
            className={`${
              isUser ? 'bg-purple-500' : 'bg-blue-500'
            } text-white font-bold text-sm`}
          >
            {player?.name?.[0]?.toUpperCase() || '?'}
          </AvatarFallback>
        </Avatar>
      </MotionDiv>

      <span
        className={`text-xs sm:text-sm ${QUICK_CLASH_CLASSES.textPrimary} font-semibold text-center truncate max-w-full`}
      >
        {player?.name && player.name.length > 12
          ? player.name.substring(0, 10) + '..'
          : player?.name}
      </span>
    </div>
  )
})
PlayerCard.displayName = 'PlayerCard'

/**
 * RESPONSIVE MatchPreparationModal - Mobile/Tablet/Desktop Optimized
 *
 * KEY IMPROVEMENTS:
 * 1. Proper responsive breakpoints (mobile, tablet, desktop)
 * 2. No overflow on any screen size
 * 3. Consistent typography scale
 * 4. Simplified padding and spacing
 * 5. Touch-friendly on mobile
 * 6. Adaptive layout (vertical on mobile, horizontal on desktop)
 */
const MatchPreparationModal = ({
  isOpen,
  onClose,
  preparingData = null,
  challengeId = null,
  onPlayNow,
  progress = 0,
  step = null,
}) => {
  const { t } = useTranslation('QuickClash')
  const dispatch = useDispatch()
  const { user } = useSelector(state => state.auth)

  const [modalState, setModalState] = useState({
    currentProgress: 0,
    isComplete: false,
    showPlayButton: false,
  })

  const hasShownCompletionToast = useRef(false)
  const progressAnimationRef = useRef(null)
  const componentMounted = useRef(true)

  // Cleanup on unmount
  useEffect(() => {
    componentMounted.current = true
    return () => {
      componentMounted.current = false
      if (progressAnimationRef.current) {
        clearTimeout(progressAnimationRef.current)
      }
    }
  }, [])

  const updateModalState = useCallback(updates => {
    if (componentMounted.current) {
      setModalState(prev => ({ ...prev, ...updates }))
    }
  }, [])

  // Progress animation
  useEffect(() => {
    if (progress !== modalState.currentProgress) {
      if (progressAnimationRef.current) {
        clearTimeout(progressAnimationRef.current)
      }

      progressAnimationRef.current = setTimeout(() => {
        updateModalState({ currentProgress: progress })
      }, 100)
    }

    return () => {
      if (progressAnimationRef.current) {
        clearTimeout(progressAnimationRef.current)
      }
    }
  }, [progress, modalState.currentProgress, updateModalState])

  // Handle completion
  useEffect(() => {
    if (
      modalState.currentProgress >= 100 &&
      challengeId &&
      !modalState.isComplete
    ) {
      updateModalState({ isComplete: true })

      if (!hasShownCompletionToast.current) {
        hasShownCompletionToast.current = true
      }

      setTimeout(() => {
        updateModalState({ showPlayButton: true })
      }, 800)
    }
  }, [
    modalState.currentProgress,
    challengeId,
    modalState.isComplete,
    updateModalState,
  ])

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setModalState({
        currentProgress: 0,
        isComplete: false,
        showPlayButton: false,
      })
      hasShownCompletionToast.current = false
    }
  }, [isOpen])

  // Action handlers
  const actionHandlers = useMemo(
    () => ({
      handleMinimize: () => {
        if (onClose) onClose('minimize')
      },
      handleCompleteClose: () => {
        dispatch(clearMatchmakingAfterModalClose())
        if (onClose) onClose('close')
      },
      handlePlayNow: () => {
        dispatch(clearMatchmakingAfterChallengeReady())
        setTimeout(() => {
          if (onPlayNow && challengeId) {
            onPlayNow()
          }
        }, 100)
      },
    }),
    [onClose, onPlayNow, challengeId, dispatch],
  )

  // Extract opponent info
  const opponent = useMemo(() => {
    if (preparingData?.opponent) {
      return preparingData.opponent
    }

    if (preparingData && typeof preparingData === 'object') {
      if (preparingData.name && preparingData.name !== user?.name) {
        return {
          name: preparingData.name,
          inGameName: preparingData.inGameName || preparingData.name,
          pic: preparingData.pic || '',
          quickClashTrophies: preparingData.quickClashTrophies || 1000,
        }
      }

      if (preparingData.userName && preparingData.userName !== user?.name) {
        return {
          name: preparingData.userName,
          inGameName: preparingData.userInGameName || preparingData.userName,
          pic: preparingData.userPic || '',
          quickClashTrophies: preparingData.userTrophies || 1000,
        }
      }
    }

    return {
      name: 'Opponent',
      inGameName: 'Player',
      pic: '',
      quickClashTrophies: 1000,
    }
  }, [preparingData, user])

  // Calculate win probability
  const winProbability = useMemo(() => {
    const userTrophies = user?.quickClashTrophies || 1000
    const opponentTrophies = opponent?.quickClashTrophies || 1000

    const ratingDiff = userTrophies - opponentTrophies
    const expectedScore = 1 / (1 + Math.pow(10, -ratingDiff / 400))

    return {
      userProbability: expectedScore,
      opponentProbability: 1 - expectedScore,
    }
  }, [user?.quickClashTrophies, opponent?.quickClashTrophies])

  // Current step
  const currentStepData = useMemo(() => {
    let stepIndex = 0

    if (step) {
      const foundIndex = STEP_CONFIGS.findIndex(s => s.id === step)
      if (foundIndex >= 0) stepIndex = foundIndex
    } else {
      for (let i = STEP_CONFIGS.length - 1; i >= 0; i--) {
        if (modalState.currentProgress >= STEP_CONFIGS[i].progressMin) {
          stepIndex = i
          break
        }
      }
    }

    return STEP_CONFIGS[stepIndex] || STEP_CONFIGS[0]
  }, [step, modalState.currentProgress])

  const modalStyles = useMemo(() => {
    const borderColor = modalState.isComplete
      ? 'border-green-400/60'
      : 'border-purple-400/60'
    const shadowColor = modalState.isComplete
      ? 'shadow-green-500/40'
      : 'shadow-purple-500/30'

    return { borderColor, shadowColor }
  }, [modalState.isComplete])

  const StatusIcon = modalState.isComplete
    ? CheckCircle
    : currentStepData.id === 'matchFound'
    ? Sword
    : Shield

  return (
    <Dialog open={isOpen} onOpenChange={actionHandlers.handleCompleteClose}>
      <DialogContent
        className={`
          ${QUICK_CLASH_CLASSES.glassMedium}
          border-2 ${modalStyles.borderColor}
          ${modalStyles.shadowColor}
          shadow-2xl
          rounded-2xl
          w-[95vw] max-w-2xl
          sm:w-[90vw] md:w-full
          p-4 sm:p-6
          overflow-y-auto
          max-h-[95vh] sm:max-h-[90vh]
          backdrop-brightness-110
        `}
      >
        {/* Background gradient */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${
            modalState.isComplete
              ? 'from-green-500/5 to-transparent'
              : 'from-purple-500/5 to-transparent'
          } opacity-70 pointer-events-none`}
        />

        {/* Header */}
        <DialogHeader className="relative z-10 pb-3 sm:pb-4">
          <div className="flex flex-col items-center space-y-2">
            <div className="flex items-center justify-center space-x-2 flex-wrap">
              <StatusIcon
                className={`w-5 h-5 sm:w-6 sm:h-6 ${
                  modalState.isComplete ? 'text-green-400' : 'text-purple-400'
                }`}
              />
              <DialogTitle
                className={`text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r ${
                  modalState.isComplete
                    ? 'from-green-300 to-teal-300'
                    : 'from-purple-300 to-blue-300'
                } bg-clip-text text-transparent`}
              >
                {modalState.isComplete
                  ? t('Challenge Ready!')
                  : t('Preparing Challenge')}
              </DialogTitle>
              <Zap
                className={`w-5 h-5 sm:w-6 sm:h-6 ${
                  modalState.isComplete ? 'text-teal-400' : 'text-blue-400'
                }`}
              />
            </div>
          </div>

          {/* Close/Minimize button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-0 right-0 text-white/70 hover:text-white hover:bg-white/10 w-8 h-8 sm:w-9 sm:h-9"
            onClick={
              modalState.showPlayButton
                ? actionHandlers.handleCompleteClose
                : actionHandlers.handleMinimize
            }
          >
            {modalState.showPlayButton ? (
              <X className="w-4 h-4" />
            ) : (
              <Minimize2 className="w-4 h-4" />
            )}
          </Button>
        </DialogHeader>

        {/* Body */}
        <div className="relative z-10 py-3 sm:py-4 space-y-3 sm:space-y-4">
          {/* Players section */}
          <div
            className={`${QUICK_CLASH_CLASSES.glassLight} rounded-xl p-3 sm:p-4 border border-white/20`}
          >
            <div className="flex justify-between items-center gap-2">
              <PlayerCard player={user} isUser={true} avatarSize="md" />

              <div className="flex justify-center px-1">
                <VSBadge size="md" isActive={modalState.isComplete} />
              </div>

              <PlayerCard player={opponent} isUser={false} avatarSize="md" />
            </div>
          </div>

          {/* Win Probability Bar - Simplified */}
          <WinProbabilityBar
            userProbability={winProbability.userProbability}
            opponentProbability={winProbability.opponentProbability}
            userName={user?.inGameName || user?.name || 'You'}
            opponentName={opponent?.inGameName || opponent?.name || 'Opponent'}
            size="sm"
            showLabels={true}
          />

          <Separator className="bg-white/10" />

          {/* Progress Section */}
          <div className="space-y-2 sm:space-y-3">
            <div className="flex justify-between items-center gap-2">
              <div className="space-y-1 flex-1 min-w-0">
                <h3
                  className={`${QUICK_CLASH_CLASSES.textPrimary} font-bold text-sm sm:text-base truncate`}
                >
                  {t(currentStepData.title)}
                </h3>
                <p
                  className={`${QUICK_CLASH_CLASSES.textMuted} text-xs sm:text-sm`}
                >
                  {t(currentStepData.description)}
                </p>
              </div>
              <Badge
                className={`
                  ${modalState.isComplete ? 'bg-green-500' : 'bg-purple-500'}
                  text-white
                  rounded-full
                  px-2 sm:px-3 py-1
                  text-xs sm:text-sm
                  font-bold
                  flex-shrink-0
                `}
              >
                {Math.round(modalState.currentProgress)}%
              </Badge>
            </div>

            <ProgressBar
              progress={modalState.currentProgress}
              isComplete={modalState.isComplete}
            />

            {!modalState.isComplete && (
              <div className="flex justify-center items-center space-x-3 pt-2">
                <Loader
                  className={`w-4 h-4 animate-spin ${currentStepData.color}`}
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="relative z-10 border-t border-white/20 pt-3 sm:pt-4">
          <AnimatePresence>
            {modalState.showPlayButton ? (
              <MotionDiv
                key="play-button"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="w-full flex justify-center"
              >
                <Button
                  size="lg"
                  onClick={actionHandlers.handlePlayNow}
                  className={`
                    ${QUICK_CLASH_CLASSES.btnSuccess}
                    rounded-full
                    px-6 sm:px-8 py-3 sm:py-4
                    text-sm sm:text-base font-bold
                    shadow-lg shadow-green-500/30
                    hover:shadow-green-500/50
                    ${QUICK_CLASH_CLASSES.transformHover}
                    w-full sm:w-auto
                  `}
                >
                  <PlayCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  {t('Play Now!')}
                </Button>
              </MotionDiv>
            ) : (
              <MotionDiv
                key="minimize-button"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full flex justify-center"
              >
                <Button
                  variant="ghost"
                  onClick={actionHandlers.handleMinimize}
                  className="text-white/80 hover:text-white hover:bg-white/10 text-sm sm:text-base"
                >
                  <Minimize2 className="w-4 h-4 mr-2" />
                  {t('Minimize')}
                </Button>
              </MotionDiv>
            )}
          </AnimatePresence>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

MatchPreparationModal.displayName = 'MatchPreparationModal'

export default MatchPreparationModal
