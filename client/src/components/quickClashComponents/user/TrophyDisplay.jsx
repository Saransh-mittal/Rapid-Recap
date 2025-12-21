// components/quickClashComponents/user/TrophyDisplay.jsx - FAITHFUL CONVERSION to Tailwind with Blue-Cyan Color Scheme
import React, {
  useEffect,
  useRef,
  useCallback,
  useMemo,
  memo,
  useState,
} from 'react'
import {
  motion,
  useAnimation,
  useReducedMotion,
  AnimatePresence,
} from 'framer-motion'
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  BarChart,
  Zap,
  Users,
  Shield,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useSelector, useDispatch } from 'react-redux'
import { fetchCombinedTrophyHistory } from '../../../redux/quickClashSlice'
import TrophyAnimation from '../animations/TrophyAnimation'

// Import centralized color scheme
import { QUICK_CLASH_CLASSES } from '../utils/quickClashColors'

// Audio feedback
import { quizAudioService } from '../../../services/quizAudioService'

const MotionDiv = motion.div
const MotionSpan = motion.span

// Simple Tooltip Component
const Tooltip = ({ children, label, show = true }) => {
  const [showTooltip, setShowTooltip] = useState(false)

  if (!show) return children

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {children}
      </div>
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-xs rounded whitespace-nowrap z-50">
          {label}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-slate-800"></div>
        </div>
      )}
    </div>
  )
}

// Custom Popover Component for Trophy Display
const CustomPopover = ({
  isOpen,
  onClose,
  children,
  trigger,
  isMobile,
  isTablet,
}) => {
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const triggerRef = useRef(null)
  const popoverRef = useRef(null)

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect()
      const popoverWidth = isMobile
        ? Math.min(window.innerWidth - 20, 350)
        : isTablet
        ? 360
        : 380
      const popoverHeight = 400 // Approximate height

      let left = triggerRect.right - popoverWidth + 20
      let top = triggerRect.bottom + 10

      // Ensure popover stays within viewport
      if (left < 10) left = 10
      if (left + popoverWidth > window.innerWidth - 10) {
        left = window.innerWidth - popoverWidth - 10
      }

      if (top + popoverHeight > window.innerHeight - 10) {
        top = triggerRect.top - popoverHeight - 10
      }

      setPosition({ top, left })
    }
  }, [isOpen, isMobile, isTablet])

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = event => {
      if (
        isOpen &&
        popoverRef.current &&
        !popoverRef.current.contains(event.target) &&
        !triggerRef.current.contains(event.target)
      ) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [isOpen, onClose])

  const popoverWidth = isMobile ? '95vw' : isTablet ? '360px' : '380px'
  const popoverMaxWidth = isMobile ? '350px' : 'none'

  return (
    <>
      <div ref={triggerRef}>{trigger}</div>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-40" onClick={onClose} />

            {/* Popover */}
            <MotionDiv
              ref={popoverRef}
              className={`
                fixed z-50 ${QUICK_CLASH_CLASSES.glassMedium}
                backdrop-blur-[16px] border border-yellow-400/40 rounded-xl overflow-hidden
                shadow-2xl shadow-black/40 ${isMobile ? 'mx-2' : ''}
              `}
              style={{
                top: position.top,
                left: position.left,
                width: popoverWidth,
                maxWidth: popoverMaxWidth,
                background: 'rgba(15, 23, 42, 0.95)',
                boxShadow:
                  '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 15px rgba(255, 215, 0, 0.3)',
              }}
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Arrow */}
              <div
                className="absolute -top-2 right-8 w-4 h-4 rotate-45"
                style={{ background: 'rgba(15, 23, 42, 0.95)' }}
              />

              {/* Close button */}
              <button
                onClick={() => { quizAudioService.playDismiss(); onClose() }}
                className={`
                  absolute ${
                    isMobile ? 'top-3 right-3 w-8 h-8' : 'top-2 right-2 w-6 h-6'
                  }
                  z-10 flex items-center justify-center text-white/70 hover:text-white
                  rounded-full hover:bg-white/10 transition-colors
                `}
              >
                ×
              </button>

              {children}
            </MotionDiv>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

// Memoized sub-components for better performance
const TrophyIcon = memo(({ shouldReduceMotion, iconSize, iconColor }) => {
  const baseAnimation = shouldReduceMotion
    ? {}
    : {
        rotate: [0, 5, 0, -5, 0],
        scale: [1, 1.1, 1],
      }

  const baseTransition = shouldReduceMotion
    ? {}
    : {
        repeat: Infinity,
        repeatType: 'reverse',
        duration: 4,
      }

  return (
    <MotionDiv
      className="mr-1 md:mr-2 relative z-10"
      animate={baseAnimation}
      transition={baseTransition}
      style={{ filter: 'drop-shadow(0 0 3px rgba(255, 215, 0, 0.8))' }}
    >
      <Trophy
        className={`text-yellow-400 ${iconSize === 3 ? 'w-3 h-3' : 'w-4 h-4'}`}
      />
    </MotionDiv>
  )
})

TrophyIcon.displayName = 'TrophyIcon'

const TrophyHistoryItem = memo(({ entry, index, t, isMobile }) => {
  // Memoized calculations - EXACTLY as original
  const getBattleModeIcon = useCallback(entry => {
    if (entry.type === 'team') return Users
    if (entry.result === 'win') return TrendingUp
    if (entry.result === 'loss') return TrendingDown
    return Trophy
  }, [])

  const getResultColor = useCallback(entry => {
    if (entry.result === 'win') return 'text-green-400'
    if (entry.result === 'loss') return 'text-red-400'
    return 'text-yellow-400'
  }, [])

  const getOpponentDisplayName = useCallback(
    entry => {
      if (entry.type === 'team') {
        return entry.opponent?.name || t('Unknown Team')
      }
      return entry.opponent?.inGameName || entry.opponent?.name || t('Unknown')
    },
    [t],
  )

  const getBattleDescription = useCallback(
    entry => {
      const opponentName = getOpponentDisplayName(entry)

      if (entry.type === 'team') {
        if (entry.result === 'win')
          return `${t('Team Victory vs')} ${opponentName}`
        if (entry.result === 'loss')
          return `${t('Team Defeat vs')} ${opponentName}`
        return `${t('Team Tie vs')} ${opponentName}`
      }

      if (entry.result === 'win') return `${t('Victory vs')} ${opponentName}`
      if (entry.result === 'loss') return `${t('Defeat vs')} ${opponentName}`
      return `${t('Tie vs')} ${opponentName}`
    },
    [getOpponentDisplayName, t],
  )

  const battleModeIcon = useMemo(
    () => getBattleModeIcon(entry),
    [entry, getBattleModeIcon],
  )
  const resultColor = useMemo(
    () => getResultColor(entry),
    [entry, getResultColor],
  )
  const battleDescription = useMemo(
    () => getBattleDescription(entry),
    [entry, getBattleDescription],
  )

  const BattleModeIcon = battleModeIcon

  return (
    <div
      className={`
      flex justify-between items-center p-2 rounded-md relative
      ${index % 2 === 0 ? 'bg-slate-800/60' : 'bg-transparent'}
      ${isMobile ? 'min-h-[44px]' : ''}
    `}
    >
      <div
        className={`flex items-center ${isMobile ? 'gap-1' : 'gap-2'} flex-1`}
      >
        {/* Battle mode badge */}
        <span
          className={`
          ${
            entry.type === 'team'
              ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
              : 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
          }
          text-[10px] px-1 py-0.5 rounded-sm border font-medium
        `}
        >
          {entry.mode}
        </span>

        {/* Result icon */}
        <BattleModeIcon
          className={`${resultColor} ${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`}
        />

        {/* Battle description */}
        <div className="flex flex-col flex-1">
          <span
            className={`
            ${QUICK_CLASH_CLASSES.textSecondary}
            ${isMobile ? 'text-[10px] leading-tight' : 'text-xs'}
            ${isMobile ? 'line-clamp-2' : ''}
          `}
          >
            {battleDescription}
          </span>

          {/* Additional info for team battles - simplified on mobile */}
          {entry.type === 'team' && !isMobile && (
            <div className="flex items-center gap-1 mt-0.5">
              {entry.bonusesApplied?.strongerTeam && (
                <Tooltip label={t('Stronger Team Bonus')}>
                  <TrendingUp className="w-2 h-2 text-green-400" />
                </Tooltip>
              )}
              {entry.bonusesApplied?.allWins && (
                <Tooltip label={t('All Wins Bonus')}>
                  <Trophy className="w-2 h-2 text-yellow-400" />
                </Tooltip>
              )}
              {entry.protectionUsed && (
                <Tooltip label={t('Protection Applied')}>
                  <Shield className="w-2 h-2 text-blue-400" />
                </Tooltip>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Trophy change */}
      <span
        className={`
        ${
          entry.trophiesChange > 0
            ? 'text-green-400'
            : entry.trophiesChange < 0
            ? 'text-red-400'
            : QUICK_CLASH_CLASSES.textMuted
        }
        font-bold ${
          isMobile ? 'text-[10px] min-w-[30px]' : 'text-xs min-w-[40px]'
        } text-right
      `}
      >
        {entry.trophiesChange > 0 ? '+' : ''}
        {entry.trophiesChange}
      </span>
    </div>
  )
})

TrophyHistoryItem.displayName = 'TrophyHistoryItem'

/**
 * Premium responsive trophy display component showing user's current trophy count
 * with optimized animations and combined history popup (both 1v1 and 4v4 modes)
 */
const TrophyDisplay = memo(() => {
  const { t } = useTranslation('QuickClash')
  const dispatch = useDispatch()
  const trophyCountRef = useRef(null)
  const trophyControls = useAnimation()

  // Responsive state management
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  const shouldReduceMotion = useReducedMotion()

  useEffect(() => {
    const updateSize = () => {
      setIsMobile(window.innerWidth < 768)
      setIsTablet(window.innerWidth < 992)
    }
    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  // Responsive values
  const responsiveConfig = useMemo(
    () => ({
      popoverWidth: isMobile ? '95vw' : isTablet ? '360px' : '380px',
      popoverMaxWidth: isMobile ? '350px' : 'none',
      trophyIconSize: isMobile ? 3 : 4,
      fontSize: isMobile ? 'text-base' : 'text-lg',
      padding: isMobile ? 2 : 3,
      headerPadding: isMobile ? 3 : 4,
      historyLimit: isMobile ? 4 : 6,
      iconColor: '#FFD700',
    }),
    [isMobile, isTablet],
  )

  // Get trophy data from redux store - EXACTLY as original
  const {
    userTrophies,
    userTrophiesLoading,
    combinedTrophyHistory,
    combinedTrophyHistoryLoading,
  } = useSelector(state => state.quickClash)

  // Previous trophy count to detect changes
  const prevTrophiesRef = useRef(userTrophies)

  // Memoized trophy tier calculation - EXACTLY as original
  const trophyTier = useMemo(() => {
    if (userTrophies < 1000) return t('Bronze Tier')
    if (userTrophies < 1500) return t('Silver Tier')
    return t('Gold Tier')
  }, [userTrophies, t])

  // Handle trophy count changes with optimized animation - EXACTLY as original
  useEffect(() => {
    if (
      prevTrophiesRef.current !== undefined &&
      prevTrophiesRef.current !== userTrophies &&
      !shouldReduceMotion
    ) {
      // Play pulse animation on trophy count change
      trophyControls.start({
        scale: [1, 1.2, 1],
        transition: { duration: 0.5 },
      })
    }

    prevTrophiesRef.current = userTrophies
  }, [userTrophies, trophyControls, shouldReduceMotion])

  // Optimized popover open handler - EXACTLY as original
  const handlePopoverOpen = useCallback(() => {
    quizAudioService.playButtonClick() // Sound for opening popover
    setIsPopoverOpen(true)
    dispatch(fetchCombinedTrophyHistory({ limit: 10 }))
  }, [dispatch])

  const handlePopoverClose = useCallback(() => {
    setIsPopoverOpen(false)
  }, [])

  // Show loading spinner if data is loading
  if (userTrophiesLoading && !userTrophies) {
    return (
      <div className="flex items-center justify-center h-8">
        <div className="w-4 h-4 border-2 border-cyan-300 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  const triggerComponent = (
    <MotionDiv
      className={`
        flex items-center justify-center py-1.5 px-3 rounded-full cursor-pointer
        ${QUICK_CLASH_CLASSES.glassMedium} backdrop-blur-[8px] border border-yellow-500/30
        shadow-lg shadow-black/20 relative overflow-hidden transition-all duration-200
        hover:border-yellow-400/50 hover:shadow-xl hover:shadow-yellow-500/20
      `}
      onClick={handlePopoverOpen}
      whileHover={{
        scale: 1.05,
        boxShadow: '0 0 20px rgba(255, 215, 0, 0.4)',
      }}
      whileTap={{ scale: 0.95 }}
      style={{
        outline: 'none',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {/* Trophy animation appears below and merges into trophy count */}
      <TrophyAnimation />

      {/* Premium gradient background */}
      <div
        className="absolute inset-0 opacity-70 z-0"
        style={{
          background:
            'linear-gradient(to bottom right, rgba(255, 215, 0, 0.2), rgba(255, 140, 0, 0.1))',
        }}
      />

      {/* Optimized trophy icon */}
      <TrophyIcon
        shouldReduceMotion={shouldReduceMotion}
        iconSize={3}
        iconColor={responsiveConfig.iconColor}
      />

      {/* Trophy count with responsive animation */}
      <MotionSpan
        ref={trophyCountRef}
        className={`text-white font-bold text-base z-10`}
        animate={trophyControls}
      >
        {userTrophies}
      </MotionSpan>
    </MotionDiv>
  )

  const popoverContent = (
    <div className="p-0">
      {/* Top section with current trophies */}
      <div
        className={`
          p-${responsiveConfig.headerPadding} border-b border-yellow-500/20 relative overflow-hidden
        `}
        style={{ background: 'rgba(30, 30, 45, 1)' }}
      >
        {/* Background glow effect - reduced on mobile */}
        {!isMobile && (
          <div
            className="absolute -top-5 -left-5 w-20 h-20 rounded-full blur-[10px]"
            style={{
              background:
                'radial-gradient(circle, rgba(255, 215, 0, 0.3), transparent 70%)',
            }}
          />
        )}

        {/* Trophy info */}
        <div className="flex items-center w-full">
          <div
            className={`
              ${
                isMobile ? 'w-12 h-12' : 'w-14 h-14'
              } rounded-full flex items-center justify-center
              ${isMobile ? 'mr-3' : 'mr-4'} shadow-lg
            `}
            style={{
              background: 'linear-gradient(to bottom right, #FFD700, #FFA500)',
              boxShadow: '0 0 20px rgba(255, 215, 0, 0.4)',
            }}
          >
            <Trophy
              className={`text-white ${isMobile ? 'w-5 h-5' : 'w-6 h-6'}`}
            />
          </div>

          <div className="flex flex-col flex-1">
            <span
              className={`text-white font-bold ${
                isMobile ? 'text-sm' : 'text-base'
              }`}
            >
              {t('Your Trophies')}
            </span>
            <div
              className={`flex items-center ${
                isMobile ? 'gap-2' : 'gap-3'
              } mt-1`}
            >
              <span
                className={`text-yellow-400 font-bold ${
                  isMobile ? 'text-lg' : 'text-xl'
                }`}
              >
                {userTrophies}
              </span>

              {!isMobile ? (
                <Tooltip label={t('Trophies determine your rank')}>
                  <span className={`${QUICK_CLASH_CLASSES.textMuted} text-xs`}>
                    {trophyTier}
                  </span>
                </Tooltip>
              ) : (
                <span
                  className={`${QUICK_CLASH_CLASSES.textMuted} ${
                    isMobile ? 'text-[10px]' : 'text-xs'
                  }`}
                >
                  {trophyTier}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Trophy history section */}
      <div
        className={`px-${responsiveConfig.padding} py-${responsiveConfig.padding}`}
        style={{ background: 'rgba(20, 20, 30, 0.9)' }}
      >
        <div className="flex justify-between items-center mb-2">
          <span
            className={`text-white ${
              isMobile ? 'text-xs' : 'text-sm'
            } font-bold`}
          >
            {t('Recent Trophy Changes')}
          </span>
          {!isMobile && (
            <div className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-cyan-400" />
              <Users className="w-3 h-3 text-blue-400" />
              <BarChart className="w-4 h-4 text-white/60" />
            </div>
          )}
        </div>

        {combinedTrophyHistoryLoading ? (
          <div className="flex justify-center py-4">
            <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : combinedTrophyHistory && combinedTrophyHistory.length > 0 ? (
          <div className={`space-y-${isMobile ? '1' : '2'}`}>
            {combinedTrophyHistory
              .slice(0, responsiveConfig.historyLimit)
              .map((entry, index) => (
                <TrophyHistoryItem
                  key={entry._id}
                  entry={entry}
                  index={index}
                  t={t}
                  isMobile={isMobile}
                />
              ))}
          </div>
        ) : (
          <p
            className={`
            ${QUICK_CLASH_CLASSES.textMuted} ${
              isMobile ? 'text-[10px]' : 'text-xs'
            }
            text-center py-2
          `}
          >
            {t('No recent trophy changes')}
          </p>
        )}
      </div>

      {/* Tip section */}
      <div
        className={`
          flex items-center ${isMobile ? 'gap-2' : 'gap-3'}
          px-${responsiveConfig.padding} py-${responsiveConfig.padding}
          border-t border-yellow-500/15
        `}
        style={{ background: 'rgba(30, 30, 45, 1)' }}
      >
        <MotionDiv
          animate={
            shouldReduceMotion
              ? {}
              : {
                  rotate: [0, 10, 0, -10, 0],
                  scale: [1, 1.1, 1, 1.1, 1],
                }
          }
          transition={
            shouldReduceMotion
              ? {}
              : {
                  duration: 5,
                  repeat: Infinity,
                }
          }
          style={{ filter: 'drop-shadow(0 0 4px rgba(255, 215, 0, 0.6))' }}
        >
          <Trophy
            className={`text-yellow-400 ${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`}
          />
        </MotionDiv>
        <div className="flex flex-col">
          <span
            className={`text-white font-bold ${
              isMobile ? 'text-[10px]' : 'text-xs'
            }`}
          >
            {t('Earn More Trophies')}
          </span>
          <span
            className={`
            ${QUICK_CLASH_CLASSES.textMuted} ${
              isMobile ? 'text-[8px]' : 'text-[10px]'
            }
            leading-tight
          `}
          >
            {t(
              'Win challenges in both 1v1 and 4v4 modes to climb the leaderboard!',
            )}
          </span>
        </div>
      </div>
    </div>
  )

  return (
    <CustomPopover
      isOpen={isPopoverOpen}
      onClose={handlePopoverClose}
      trigger={triggerComponent}
      isMobile={isMobile}
      isTablet={isTablet}
    >
      {popoverContent}
    </CustomPopover>
  )
})

TrophyDisplay.displayName = 'TrophyDisplay'

export default TrophyDisplay
