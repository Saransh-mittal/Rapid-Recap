// screens/AppStartScreen.jsx - Enhanced with Quick Clash branding and engagement features
import React, { useState, useCallback, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Swords,
  Trophy,
  Flame,
  TrendingUp,
  ArrowRight,
  Crown,
  Star,
  Target,
  Users,
  Brain,
  Gamepad2,
  Shield,
  Award,
  Activity,
  Sparkles,
  Zap,
  Clock,
  CheckCircle2,
  XCircle,
  Circle,
  UserCheck,
  Timer,
  Gift,
} from 'lucide-react'
import FixedBackground from '../components/miscellaneous/FixedBackground'
import { useSelector } from 'react-redux'
import {
  fetchBattleStats,
  formatBattleStats,
} from '../services/battleStatsService'

// Enhanced Responsive Hook (keep existing implementation)
export const useResponsiveBreakpoints = () => {
  const [screenInfo, setScreenInfo] = useState(() => {
    const width = window.innerWidth
    const height = window.innerHeight
    return {
      width,
      height,
      isXs: width < 375,
      isSm: width >= 375 && width < 640,
      isMd: width >= 640 && width < 768,
      isLg: width >= 768 && width < 1024,
      isXl: width >= 1024 && width < 1280,
      is2Xl: width >= 1280 && width < 1536,
      is3Xl: width >= 1536,
      isMobile: width < 768,
      isTablet: width >= 768 && width < 1024,
      isDesktop: width >= 1024,
      isUltrawide: width >= 1536,
      isLandscape: width > height,
      isPortrait: height > width,
      isSquare: Math.abs(width - height) < 100,
      isTouchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    }
  })

  useEffect(() => {
    let timeoutId
    const handleResize = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        const width = window.innerWidth
        const height = window.innerHeight
        setScreenInfo({
          width,
          height,
          isXs: width < 375,
          isSm: width >= 375 && width < 640,
          isMd: width >= 640 && width < 768,
          isLg: width >= 768 && width < 1024,
          isXl: width >= 1024 && width < 1280,
          is2Xl: width >= 1280 && width < 1536,
          is3Xl: width >= 1536,
          isMobile: width < 768,
          isTablet: width >= 768 && width < 1024,
          isDesktop: width >= 1024,
          isUltrawide: width >= 1536,
          isLandscape: width > height,
          isPortrait: height > width,
          isSquare: Math.abs(width - height) < 100,
          isTouchDevice:
            'ontouchstart' in window || navigator.maxTouchPoints > 0,
        })
      }, 100)
    }

    window.addEventListener('resize', handleResize, { passive: true })
    return () => {
      window.removeEventListener('resize', handleResize)
      clearTimeout(timeoutId)
    }
  }, [])

  return screenInfo
}

// Smooth animation wrapper
const FadeIn = ({ children, delay = 0, className = '', screenInfo }) => {
  const adjustedDelay = screenInfo?.isMobile ? delay * 0.7 : delay

  return (
    <motion.div
      initial={{ opacity: 0, y: screenInfo?.isMobile ? 15 : 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: screenInfo?.isMobile ? 0.35 : 0.4,
        delay: adjustedDelay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Enhanced Glassmorphic Card Component
const GlassCard = ({
  children,
  className = '',
  style = {},
  delay = 0,
  screenInfo,
  intensity = 'medium',
}) => {
  const intensityStyles = {
    light: {
      background: 'rgba(15, 23, 42, 0.2)',
      backdropFilter: 'blur(8px)',
      border: '1px solid rgba(255, 255, 255, 0.05)',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
    },
    medium: {
      background: 'rgba(15, 23, 42, 0.3)',
      backdropFilter: 'blur(16px)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
    },
    strong: {
      background: 'rgba(15, 23, 42, 0.4)',
      backdropFilter: 'blur(24px)',
      border: '1px solid rgba(255, 255, 255, 0.12)',
      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.3)',
    },
  }

  const hoverScale = screenInfo?.isTouchDevice ? 1.005 : 1.01

  return (
    <FadeIn delay={delay} screenInfo={screenInfo}>
      <motion.div
        className={`relative ${className}`}
        whileHover={{ scale: hoverScale }}
        whileTap={{ scale: 0.995 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        style={{
          ...intensityStyles[intensity],
          WebkitBackdropFilter: intensityStyles[intensity].backdropFilter,
          ...style,
        }}
      >
        {children}
      </motion.div>
    </FadeIn>
  )
}

// Quick Clash Header - Balanced colors
const QuickClashHeader = ({ screenInfo }) => {
  const containerPadding = screenInfo.isMobile
    ? 'px-3 pt-3 pb-2'
    : 'px-0 pt-0 pb-3'

  return (
    <FadeIn delay={0.05} className={containerPadding} screenInfo={screenInfo}>
      <div className="text-center">
        <div className="flex items-center justify-center gap-2.5 mb-1">
          <div className="w-1 h-1 rounded-full bg-blue-400/60" />
          <h1
            className="font-bold text-transparent bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text tracking-wide"
            style={{
              fontSize: `clamp(1.25rem, 4vw, 1.75rem)`,
              letterSpacing: '0.05em',
            }}
          >
            QUICK CLASH
          </h1>
          <div className="w-1 h-1 rounded-full bg-cyan-400/60" />
        </div>
        <p
          className="text-blue-200/80 font-medium"
          style={{ fontSize: `clamp(0.75rem, 2vw, 0.875rem)` }}
        >
          Test Your Knowledge
        </p>
      </div>
    </FadeIn>
  )
}

// Live Status Bar - Balanced design
const LiveStatusBar = ({ screenInfo }) => {
  const liveData = {
    activeBattles: 47,
    friendsOnline: 3,
    avgWaitTime: '< 30s',
  }

  const containerPadding = screenInfo.isMobile ? 'px-3 py-2' : 'px-0 py-2'

  return (
    <FadeIn delay={0.1} className={containerPadding} screenInfo={screenInfo}>
      <GlassCard
        className="rounded-xl p-2.5"
        screenInfo={screenInfo}
        intensity="light"
      >
        <div className="flex items-center justify-around gap-2">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span
              className="text-blue-100/90 font-medium"
              style={{ fontSize: 'clamp(0.6875rem, 2vw, 0.75rem)' }}
            >
              <span className="text-white font-semibold">
                {liveData.activeBattles}
              </span>{' '}
              active
            </span>
          </div>

          <div className="h-3 w-px bg-white/10" />

          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-blue-300" />
            <span
              className="text-blue-100/90 font-medium"
              style={{ fontSize: 'clamp(0.6875rem, 2vw, 0.75rem)' }}
            >
              <span className="text-white font-semibold">
                {liveData.friendsOnline}
              </span>{' '}
              online
            </span>
          </div>

          <div className="h-3 w-px bg-white/10" />

          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-cyan-300" />
            <span
              className="text-blue-100/90 font-medium"
              style={{ fontSize: 'clamp(0.6875rem, 2vw, 0.75rem)' }}
            >
              {liveData.avgWaitTime}
            </span>
          </div>
        </div>
      </GlassCard>
    </FadeIn>
  )
}

// Recent Matches - Balanced colors
const RecentMatches = ({ screenInfo }) => {
  // TODO: Replace with real match history from backend
  const recentMatches = [
    { result: 'win', score: '8-6', opponent: 'Player123', timeAgo: '2h ago' },
    { result: 'loss', score: '5-7', opponent: 'QuizMaster', timeAgo: '5h ago' },
    { result: 'win', score: '9-4', opponent: 'BrainBox', timeAgo: '1d ago' },
  ]

  const containerPadding = screenInfo.isMobile ? 'px-3' : 'px-0'

  const getResultIcon = result => {
    if (result === 'win')
      return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
    if (result === 'loss')
      return <XCircle className="w-3.5 h-3.5 text-rose-400" />
    return <Circle className="w-3.5 h-3.5 text-slate-400" />
  }

  const getResultColor = result => {
    if (result === 'win') return 'border-emerald-400/30 bg-emerald-400/10'
    if (result === 'loss') return 'border-rose-400/30 bg-rose-400/10'
    return 'border-slate-400/20 bg-slate-400/5'
  }

  return (
    <FadeIn delay={0.15} className={containerPadding} screenInfo={screenInfo}>
      <GlassCard className="rounded-xl p-2.5" screenInfo={screenInfo}>
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5">
            <Brain className="w-3.5 h-3.5 text-cyan-400" />
            <span
              className="font-semibold text-white"
              style={{ fontSize: `clamp(0.75rem, 2.5vw, 0.875rem)` }}
            >
              Recent Battles
            </span>
          </div>
          <span
            className="text-blue-200/70 font-medium"
            style={{ fontSize: `clamp(0.625rem, 2vw, 0.6875rem)` }}
          >
            Last 3
          </span>
        </div>

        <div className="space-y-1.5">
          {recentMatches.map((match, index) => (
            <motion.div
              key={index}
              className={`flex items-center justify-between p-2 rounded-lg border ${getResultColor(
                match.result,
              )}`}
              whileHover={{ x: 2 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              <div className="flex items-center gap-2">
                {getResultIcon(match.result)}
                <div>
                  <p
                    className="text-white font-medium"
                    style={{ fontSize: 'clamp(0.75rem, 2vw, 0.8125rem)' }}
                  >
                    vs {match.opponent}
                  </p>
                  <p
                    className="text-blue-200/60"
                    style={{ fontSize: 'clamp(0.625rem, 1.8vw, 0.6875rem)' }}
                  >
                    {match.timeAgo}
                  </p>
                </div>
              </div>
              <span
                className={`font-semibold ${
                  match.result === 'win' ? 'text-emerald-400' : 'text-rose-400'
                }`}
                style={{ fontSize: 'clamp(0.75rem, 2.2vw, 0.875rem)' }}
              >
                {match.score}
              </span>
            </motion.div>
          ))}
        </div>
      </GlassCard>
    </FadeIn>
  )
}

// Daily Challenge - Balanced colors
const DailyChallenge = ({ screenInfo }) => {
  // TODO: Replace with real challenge data from backend
  const challenge = {
    title: 'Win Streak Master',
    description: 'Win 3 battles in a row',
    progress: 1,
    target: 3,
    reward: '50 Trophies + Special Badge',
    timeLeft: '18h 32m',
  }

  const progressPercent = (challenge.progress / challenge.target) * 100
  const containerPadding = screenInfo.isMobile ? 'px-3' : 'px-0'

  return (
    <FadeIn delay={0.2} className={containerPadding} screenInfo={screenInfo}>
      <GlassCard
        className="rounded-xl p-2.5 overflow-hidden relative"
        screenInfo={screenInfo}
      >
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-purple-400" />
              <span
                className="font-semibold text-white"
                style={{ fontSize: `clamp(0.75rem, 2.5vw, 0.875rem)` }}
              >
                Today's Challenge
              </span>
            </div>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-400/10 border border-purple-400/30">
              <Clock className="w-3 h-3 text-purple-300" />
              <span
                className="text-purple-200 font-medium"
                style={{ fontSize: 'clamp(0.625rem, 2vw, 0.6875rem)' }}
              >
                {challenge.timeLeft}
              </span>
            </div>
          </div>

          <h3
            className="text-white font-bold mb-1"
            style={{ fontSize: 'clamp(0.875rem, 2.5vw, 1rem)' }}
          >
            {challenge.title}
          </h3>
          <p
            className="text-blue-100/70 mb-2.5"
            style={{ fontSize: 'clamp(0.6875rem, 2vw, 0.8125rem)' }}
          >
            {challenge.description}
          </p>

          {/* Progress bar */}
          <div className="mb-2.5">
            <div className="flex items-center justify-between mb-1.5">
              <span
                className="text-blue-100/90 font-medium"
                style={{ fontSize: 'clamp(0.6875rem, 2vw, 0.8125rem)' }}
              >
                Progress: {challenge.progress}/{challenge.target}
              </span>
              <span
                className="text-white font-semibold"
                style={{ fontSize: 'clamp(0.6875rem, 2vw, 0.8125rem)' }}
              >
                {Math.round(progressPercent)}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 1, delay: 0.3 }}
              />
            </div>
          </div>

          {/* Reward */}
          <div className="flex items-center gap-1.5 p-2 rounded-lg bg-amber-400/10 border border-amber-400/30">
            <Gift className="w-3.5 h-3.5 text-amber-400" />
            <span
              className="text-amber-300 font-medium"
              style={{ fontSize: 'clamp(0.6875rem, 2vw, 0.8125rem)' }}
            >
              {challenge.reward}
            </span>
          </div>
        </div>
      </GlassCard>
    </FadeIn>
  )
}

// Profile Badge - Balanced colors
const CompactProfile = ({ user, battleStats, screenInfo }) => {
  const getRankInfo = trophies => {
    const level = Math.floor(trophies / 100) || 1

    if (trophies >= 3000)
      return { name: 'LEGEND', level, color: 'from-amber-400 to-orange-400' }
    if (trophies >= 2000)
      return { name: 'MASTER', level, color: 'from-purple-400 to-pink-400' }
    if (trophies >= 1000)
      return { name: 'EXPERT', level, color: 'from-blue-400 to-cyan-400' }
    if (trophies >= 500)
      return { name: 'ADVANCED', level, color: 'from-emerald-400 to-teal-400' }
    return { name: 'RISING', level, color: 'from-slate-400 to-slate-500' }
  }

  const rank = getRankInfo(battleStats?.userTrophies || 0)
  const containerPadding = screenInfo.isMobile ? 'px-3 pb-2' : 'px-0 pb-2'

  return (
    <FadeIn delay={0.08} className={containerPadding} screenInfo={screenInfo}>
      <GlassCard
        className="rounded-xl p-2.5"
        screenInfo={screenInfo}
        intensity="light"
      >
        <div className="flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="relative flex-shrink-0">
              <div
                className={`w-10 h-10 rounded-lg bg-gradient-to-br ${rank.color} p-0.5`}
              >
                <div className="h-full w-full rounded-lg bg-slate-900/60 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 px-1 py-0.5 rounded bg-slate-900/80 border border-white/20 backdrop-blur-sm">
                <span className="text-white font-bold text-xs">
                  {rank.level}
                </span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-blue-200/70 uppercase tracking-wide font-semibold text-xs mb-0.5">
                {rank.name}
              </p>
              <h2
                className="text-white font-bold truncate"
                style={{ fontSize: 'clamp(0.875rem, 2.5vw, 1rem)' }}
              >
                {user?.inGameName || 'Info_King'}
              </h2>
            </div>
          </div>

          {/* Trophies Display */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-400/15 border border-amber-400/30 flex-shrink-0">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span
              className="text-amber-300 font-bold"
              style={{ fontSize: 'clamp(0.875rem, 2.5vw, 1rem)' }}
            >
              {battleStats?.userTrophies?.toLocaleString() || '0'}
            </span>
          </div>
        </div>
      </GlassCard>
    </FadeIn>
  )
}

// Enhanced Enter Game Button
const EnterGameButton = ({ onEnterGame, isLoading, screenInfo }) => {
  const buttonStyle = {
    background:
      'linear-gradient(135deg, rgba(59, 130, 246, 0.85), rgba(99, 102, 241, 0.85))',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 8px 32px rgba(59, 130, 246, 0.3)',
  }

  const containerPadding = screenInfo.isMobile ? 'px-3 pb-3 pt-2' : 'px-0 pt-3'

  return (
    <FadeIn delay={0.3} className={containerPadding} screenInfo={screenInfo}>
      <motion.button
        onClick={onEnterGame}
        disabled={isLoading}
        whileHover={{
          scale: screenInfo.isTouchDevice ? 1 : 1.01,
          boxShadow: '0 12px 40px rgba(99, 102, 241, 0.4)',
        }}
        whileTap={{ scale: 0.98 }}
        className={`w-full ${
          screenInfo.isMobile ? 'py-3.5' : 'py-4'
        } rounded-xl relative overflow-hidden group ${
          screenInfo.isMobile ? 'min-h-[48px]' : ''
        }`}
        style={buttonStyle}
      >
        <div className="relative z-10 flex items-center justify-center gap-2.5 text-white">
          <motion.div
            animate={{ rotate: isLoading ? 360 : 0 }}
            transition={{
              duration: isLoading ? 1 : 0,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            <Gamepad2 className={screenInfo.isMobile ? 'h-4 w-4' : 'h-5 w-5'} />
          </motion.div>
          <span
            className="font-bold tracking-wide uppercase"
            style={{ fontSize: `clamp(0.875rem, 3vw, 1rem)` }}
          >
            {isLoading ? 'Loading...' : 'Enter Battle Arena'}
          </span>
          {!isLoading && (
            <ArrowRight
              className={screenInfo.isMobile ? 'h-4 w-4' : 'h-5 w-5'}
            />
          )}
        </div>
      </motion.button>
    </FadeIn>
  )
}

// Loading Screen
export const LoadingScreen = ({ screenInfo }) => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-14 h-14 border-3 border-cyan-400/30 border-t-cyan-400 rounded-full mx-auto mb-3"
        />
        <h2
          className="font-semibold text-white mb-1"
          style={{ fontSize: `clamp(1rem, 3vw, 1.25rem)` }}
        >
          Loading Quick Clash
        </h2>
        <p
          className="text-white/50"
          style={{ fontSize: `clamp(0.75rem, 2vw, 0.875rem)` }}
        >
          Preparing your battle arena...
        </p>
      </div>
    </div>
  )
}

// Main Component
const AppStartScreen = () => {
  const [battleStats, setBattleStats] = useState(null)
  const [statsLoading, setStatsLoading] = useState(true)
  const [statsError, setStatsError] = useState(null)
  const navigate = useNavigate()

  const screenInfo = useResponsiveBreakpoints()
  const { user, isAuthenticated } = useSelector(state => state.auth)

  // Fetch battle statistics
  useEffect(() => {
    const loadBattleStats = async () => {
      if (!isAuthenticated || !user) {
        setStatsLoading(false)
        return
      }

      try {
        setStatsLoading(true)
        setStatsError(null)

        const response = await fetchBattleStats()

        if (response.success) {
          setBattleStats(formatBattleStats(response.data))
        } else {
          console.error('Failed to fetch battle stats:', response.error)
          setStatsError(response.error)
          setBattleStats(formatBattleStats(response.data || {}))
        }
      } catch (error) {
        console.error('Error loading battle stats:', error)
        setStatsError(error.message)
        setBattleStats(formatBattleStats({}))
      } finally {
        setStatsLoading(false)
      }
    }

    loadBattleStats()
  }, [isAuthenticated, user])

  const handleEnterGame = useCallback(() => {
    navigate('/quickclash')
  }, [navigate])

  const containerClass = 'h-screen w-full relative overflow-hidden'
  const contentContainerClass = screenInfo.isMobile
    ? 'relative z-10 h-full flex flex-col min-h-0 overflow-y-auto'
    : 'relative z-10 h-full flex items-center justify-center p-6'

  const mainContentClass = useMemo(() => {
    if (screenInfo.isXs) return 'w-full max-w-sm mx-auto'
    if (screenInfo.isSm) return 'w-full max-w-md mx-auto'
    if (screenInfo.isMd) return 'w-full max-w-lg mx-auto'
    if (screenInfo.isLg) return 'w-full max-w-2xl'
    if (screenInfo.isXl) return 'w-full max-w-3xl'
    return 'w-full max-w-4xl'
  }, [screenInfo])

  return (
    <div className={containerClass}>
      <FixedBackground forceRender={true} />

      <AnimatePresence mode="wait">
        <motion.div
          key={screenInfo.isMobile ? 'mobile-content' : 'desktop-content'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className={contentContainerClass}
          style={
            screenInfo.isMobile ? { height: '100vh', maxHeight: '100vh' } : {}
          }
        >
          {screenInfo.isMobile ? (
            // Mobile Layout
            <div className="flex-1 flex flex-col min-h-0 overflow-y-auto pb-safe">
              <QuickClashHeader screenInfo={screenInfo} />
              <CompactProfile
                user={user}
                battleStats={battleStats}
                screenInfo={screenInfo}
              />
              <LiveStatusBar screenInfo={screenInfo} />
              <div className="space-y-2.5 flex-shrink-0 mt-2">
                <DailyChallenge screenInfo={screenInfo} />
                <RecentMatches screenInfo={screenInfo} />
              </div>
              <div className="flex-shrink-0 mt-auto">
                <EnterGameButton
                  onEnterGame={handleEnterGame}
                  isLoading={statsLoading}
                  screenInfo={screenInfo}
                />
              </div>
            </div>
          ) : (
            // Desktop Layout
            <div className={mainContentClass}>
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="space-y-3"
              >
                <QuickClashHeader screenInfo={screenInfo} />
                <CompactProfile
                  user={user}
                  battleStats={battleStats}
                  screenInfo={screenInfo}
                />
                <LiveStatusBar screenInfo={screenInfo} />

                <div className="grid grid-cols-2 gap-3">
                  <DailyChallenge screenInfo={screenInfo} />
                  <RecentMatches screenInfo={screenInfo} />
                </div>

                <EnterGameButton
                  onEnterGame={handleEnterGame}
                  isLoading={statsLoading}
                  screenInfo={screenInfo}
                />
              </motion.div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export default AppStartScreen
