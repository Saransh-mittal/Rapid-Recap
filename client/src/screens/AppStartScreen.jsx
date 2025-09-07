// screens/AppStartScreen.jsx - Enhanced Responsive Design with Premium Glassmorphism
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
} from 'lucide-react'
import FixedBackground from '../components/miscellaneous/FixedBackground'
import { useSelector } from 'react-redux'
import {
  fetchBattleStats,
  formatBattleStats,
} from '../services/battleStatsService'

// Enhanced Responsive Hook
export const useResponsiveBreakpoints = () => {
  const [screenInfo, setScreenInfo] = useState(() => {
    const width = window.innerWidth
    const height = window.innerHeight
    return {
      width,
      height,
      // Enhanced breakpoint system
      isXs: width < 375, // Very small phones (iPhone SE, etc.)
      isSm: width >= 375 && width < 640, // Small phones
      isMd: width >= 640 && width < 768, // Large phones / small tablets portrait
      isLg: width >= 768 && width < 1024, // Tablets
      isXl: width >= 1024 && width < 1280, // Small desktops
      is2Xl: width >= 1280 && width < 1536, // Medium desktops
      is3Xl: width >= 1536, // Large desktops / ultrawide

      // Device categories for easier logic
      isMobile: width < 768,
      isTablet: width >= 768 && width < 1024,
      isDesktop: width >= 1024,
      isUltrawide: width >= 1536,

      // Aspect ratio helpers
      isLandscape: width > height,
      isPortrait: height > width,
      isSquare: Math.abs(width - height) < 100,

      // Touch device detection
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
      }, 100) // Debounce resize events
    }

    window.addEventListener('resize', handleResize, { passive: true })
    return () => {
      window.removeEventListener('resize', handleResize)
      clearTimeout(timeoutId)
    }
  }, [])

  return screenInfo
}

// Smooth animation wrapper with enhanced responsive delays
const FadeIn = ({ children, delay = 0, className = '', screenInfo }) => {
  // Adjust animation delay based on screen size for better UX
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

// Enhanced Profile Header with fluid typography
const ProfileHeader = ({ user, battleStats, screenInfo }) => {
  const getRankInfo = trophies => {
    if (trophies >= 3000)
      return {
        name: 'Legend',
        color: 'from-yellow-400 to-orange-500',
        icon: Crown,
      }
    if (trophies >= 2000)
      return {
        name: 'Master',
        color: 'from-purple-400 to-pink-500',
        icon: Award,
      }
    if (trophies >= 1000)
      return {
        name: 'Expert',
        color: 'from-blue-400 to-cyan-500',
        icon: Star,
      }
    if (trophies >= 500)
      return {
        name: 'Advanced',
        color: 'from-green-400 to-emerald-500',
        icon: Shield,
      }
    return {
      name: 'Rising',
      color: 'from-gray-400 to-slate-500',
      icon: Activity,
    }
  }

  const rank = getRankInfo(battleStats?.userTrophies || 0)
  const RankIcon = rank.icon

  // Enhanced responsive padding and margins
  const containerPadding = useMemo(() => {
    if (screenInfo.isXs) return 'mx-3 mt-3 mb-2 p-2.5'
    if (screenInfo.isSm) return 'mx-4 mt-4 mb-3 p-3'
    if (screenInfo.isMd) return 'mx-4 mt-4 mb-3 p-3.5'
    if (screenInfo.isLg) return 'p-4'
    if (screenInfo.isXl) return 'p-5'
    if (screenInfo.is2Xl) return 'p-6'
    return 'p-7' // 3XL and above
  }, [screenInfo])

  // Avatar size responsive to screen
  const avatarSize = useMemo(() => {
    if (screenInfo.isXs) return 'h-8 w-8'
    if (screenInfo.isSm) return 'h-10 w-10'
    if (screenInfo.isMd) return 'h-12 w-12'
    if (screenInfo.isLg) return 'h-14 w-14'
    if (screenInfo.isXl) return 'h-16 w-16'
    if (screenInfo.is2Xl) return 'h-18 w-18'
    return 'h-20 w-20'
  }, [screenInfo])

  const iconSize = useMemo(() => {
    if (screenInfo.isXs) return 'h-4 w-4'
    if (screenInfo.isSm) return 'h-5 w-5'
    if (screenInfo.isMd) return 'h-6 w-6'
    if (screenInfo.isLg) return 'h-7 w-7'
    if (screenInfo.isXl) return 'h-8 w-8'
    return 'h-9 w-9'
  }, [screenInfo])

  if (screenInfo.isMobile) {
    // Enhanced Mobile Layout
    return (
      <GlassCard
        delay={0.1}
        className={`rounded-2xl ${containerPadding}`}
        screenInfo={screenInfo}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div
                className={`${avatarSize} rounded-xl bg-gradient-to-br ${rank.color} p-0.5`}
              >
                <div className="h-full w-full rounded-xl bg-slate-900/80 flex items-center justify-center">
                  <Brain
                    className={iconSize
                      .replace('h-', 'h-')
                      .replace('w-', 'w-')
                      .replace(/\d+/, match =>
                        Math.max(3, parseInt(match) - 2),
                      )}
                    text-white
                  />
                </div>
              </div>
              <motion.div
                className={`absolute -top-1 -right-1 ${
                  screenInfo.isXs ? 'w-3 h-3' : 'w-4 h-4'
                } bg-gradient-to-br ${
                  rank.color
                } rounded-full flex items-center justify-center`}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <RankIcon
                  className={screenInfo.isXs ? 'h-1.5 w-1.5' : 'h-2.5 w-2.5'}
                />
              </motion.div>
            </div>
            <div>
              <p
                className="text-white/60 uppercase tracking-wider font-medium"
                style={{ fontSize: `clamp(0.625rem, 2vw, 0.75rem)` }}
              >
                {rank.name} Rank
              </p>
              <h1
                className="font-bold text-white leading-tight"
                style={{ fontSize: `clamp(0.875rem, 4vw, 1.25rem)` }}
              >
                {user?.inGameName || 'Info_King'}
              </h1>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1.5">
              <div>
                <p
                  className="text-white/60 font-medium"
                  style={{ fontSize: `clamp(0.625rem, 2vw, 0.75rem)` }}
                >
                  Trophies
                </p>
                <p
                  className="font-bold text-yellow-400"
                  style={{ fontSize: `clamp(1rem, 5vw, 1.5rem)` }}
                >
                  {battleStats?.userTrophies?.toLocaleString() || '0'}
                </p>
              </div>
              <Trophy
                className={`${
                  screenInfo.isXs ? 'w-3 h-3' : 'w-4 h-4'
                } text-yellow-400/80`}
              />
            </div>
          </div>
        </div>
      </GlassCard>
    )
  }

  // Enhanced Desktop/Tablet Layout
  return (
    <GlassCard
      delay={0.1}
      className={`rounded-2xl ${containerPadding}`}
      screenInfo={screenInfo}
      intensity="medium"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Enhanced Avatar */}
          <div className="relative">
            <motion.div
              className={`relative ${avatarSize} rounded-2xl bg-gradient-to-br ${rank.color} p-0.5`}
              whileHover={{ rotate: [0, -5, 5, 0] }}
              transition={{ duration: 0.5 }}
            >
              <div className="h-full w-full rounded-2xl bg-slate-900/70 flex items-center justify-center backdrop-blur-sm">
                <Brain className={iconSize} />
              </div>
            </motion.div>
            <motion.div
              className={`absolute -top-1.5 -right-1.5 ${
                screenInfo.isLg ? 'w-5 h-5' : 'w-6 h-6'
              } bg-gradient-to-br ${
                rank.color
              } rounded-full flex items-center justify-center shadow-lg`}
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            >
              <RankIcon
                className={screenInfo.isLg ? 'h-3 w-3' : 'h-3.5 w-3.5'}
              />
            </motion.div>
          </div>

          {/* User Info with Fluid Typography */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className="px-2 py-0.5 rounded-full bg-white/5 text-white/70 font-medium uppercase tracking-wider"
                style={{ fontSize: `clamp(0.625rem, 1.2vw, 0.875rem)` }}
              >
                {rank.name}
              </span>
              <span
                className="text-white/40"
                style={{ fontSize: `clamp(0.625rem, 1vw, 0.75rem)` }}
              >
                Level {Math.floor((battleStats?.userTrophies || 0) / 100)}
              </span>
            </div>
            <h1
              className="font-bold text-white mb-0.5 leading-tight"
              style={{ fontSize: `clamp(1.25rem, 3vw, 2rem)` }}
            >
              {user?.inGameName || 'Info_King'}
            </h1>
            <p
              className="text-white/50"
              style={{ fontSize: `clamp(0.75rem, 1.5vw, 1rem)` }}
            >
              Knowledge Warrior • Strategic Mind
            </p>
          </div>
        </div>

        {/* Enhanced Trophy Display */}
        <motion.div
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
          style={{
            background:
              'linear-gradient(135deg, rgba(251, 191, 36, 0.08), rgba(251, 146, 60, 0.08))',
            border: '1px solid rgba(251, 191, 36, 0.2)',
          }}
          whileHover={{ scale: 1.05 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <div>
            <p
              className="text-yellow-400/70 uppercase tracking-wider font-medium"
              style={{ fontSize: `clamp(0.625rem, 1vw, 0.75rem)` }}
            >
              Trophies
            </p>
            <p
              className="font-black text-transparent bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text"
              style={{ fontSize: `clamp(1.5rem, 4vw, 2.5rem)` }}
            >
              {battleStats?.userTrophies?.toLocaleString() || '0'}
            </p>
          </div>
          <Trophy
            className={`${
              screenInfo.isLg ? 'w-6 h-6' : 'w-8 h-8'
            } text-yellow-400/80`}
          />
        </motion.div>
      </div>
    </GlassCard>
  )
}

// Enhanced Stats Grid with responsive columns
const StatsGrid = ({ battleStats, screenInfo }) => {
  const stats = [
    {
      icon: Swords,
      label: 'Battles Won',
      value: battleStats?.battlesWon || 0,
      color: '#22d3ee',
    },
    {
      icon: Flame,
      label: 'Win Streak',
      value: battleStats?.currentWinStreak || 0,
      color: '#f59e0b',
    },
    {
      icon: TrendingUp,
      label: 'Win Rate',
      value: `${battleStats?.winRate || 0}%`,
      color: '#10b981',
    },
    {
      icon: Users,
      label: 'Team Wins',
      value: battleStats?.teamBattlesWon || 0,
      color: '#8b5cf6',
    },
  ]

  // Enhanced responsive grid columns
  const gridCols = useMemo(() => {
    if (screenInfo.isXs) return 'grid-cols-2'
    if (screenInfo.isSm || screenInfo.isMd) return 'grid-cols-2'
    if (screenInfo.isLg) return 'grid-cols-2'
    return 'grid-cols-4'
  }, [screenInfo])

  // Enhanced responsive gaps
  const gridGap = useMemo(() => {
    if (screenInfo.isXs) return 'gap-2'
    if (screenInfo.isSm) return 'gap-2.5'
    if (screenInfo.isMd) return 'gap-3'
    if (screenInfo.isLg) return 'gap-3'
    if (screenInfo.isXl) return 'gap-4'
    return 'gap-5'
  }, [screenInfo])

  // Enhanced responsive padding
  const containerPadding = screenInfo.isMobile ? 'px-3' : ''
  const cardPadding = useMemo(() => {
    if (screenInfo.isXs) return 'p-2.5'
    if (screenInfo.isSm) return 'p-3'
    if (screenInfo.isMd) return 'p-3.5'
    return 'p-4'
  }, [screenInfo])

  return (
    <div className={`${containerPadding} ${screenInfo.isMobile ? 'mb-3' : ''}`}>
      <div className={`grid ${gridCols} ${gridGap}`}>
        {stats.map((stat, index) => (
          <GlassCard
            key={stat.label}
            delay={0.2 + index * 0.05}
            className={`rounded-xl ${cardPadding} group`}
            screenInfo={screenInfo}
          >
            <div className="flex items-center justify-between mb-2">
              <div
                className={`${screenInfo.isXs ? 'p-1.5' : 'p-2'} rounded-lg`}
                style={{
                  background: `linear-gradient(135deg, ${stat.color}15, ${stat.color}08)`,
                }}
              >
                <stat.icon
                  className={
                    screenInfo.isXs
                      ? 'h-3 w-3'
                      : screenInfo.isMobile
                      ? 'h-3.5 w-3.5'
                      : 'h-4 w-4'
                  }
                  style={{ color: stat.color }}
                />
              </div>
              {!screenInfo.isMobile && (
                <Sparkles
                  className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: stat.color }}
                />
              )}
            </div>
            <p
              className="font-bold text-white mb-1"
              style={{
                fontSize: `clamp(1rem, ${
                  screenInfo.isMobile ? '4vw' : '2.5vw'
                }, ${screenInfo.isMobile ? '1.25rem' : '1.75rem'})`,
              }}
            >
              {typeof stat.value === 'number'
                ? stat.value.toLocaleString()
                : stat.value}
            </p>
            <p
              className="text-white/40 uppercase tracking-wider font-medium"
              style={{ fontSize: `clamp(0.625rem, 2vw, 0.75rem)` }}
            >
              {stat.label}
            </p>
          </GlassCard>
        ))}
      </div>
    </div>
  )
}

// Enhanced Performance Section with better responsive layouts
const PerformanceSection = ({ battleStats, screenInfo }) => {
  const challenges = [
    {
      title: 'Solo Streak',
      progress: Math.min(((battleStats?.currentWinStreak || 0) / 5) * 100, 100),
      icon: Swords,
      color: '#22d3ee',
    },
    {
      title: 'Team Victory',
      progress: Math.min(((battleStats?.weeklyTeamWins || 0) / 3) * 100, 100),
      icon: Users,
      color: '#8b5cf6',
    },
  ]

  const globalComp = battleStats?.globalComparison || {}
  const userRQM = globalComp.userRQM || 0
  const globalAvg = globalComp.globalAverage || 0
  const userPercentile = globalComp.userPercentile || 0

  const getPerformanceColor = () => {
    if (userPercentile >= 75) return '#10b981'
    if (userPercentile >= 50) return '#22d3ee'
    if (userPercentile >= 25) return '#f59e0b'
    return '#8b5cf6'
  }

  const containerPadding = screenInfo.isMobile ? 'px-3' : ''
  const gridLayout = screenInfo.isLg
    ? 'grid-cols-1 gap-3'
    : screenInfo.isMobile
    ? 'space-y-3'
    : 'grid-cols-2 gap-4'

  if (screenInfo.isMobile) {
    // Enhanced Mobile Stacked Layout
    return (
      <div className={containerPadding}>
        <div className="space-y-3">
          {/* Challenges Card */}
          <GlassCard
            delay={0.4}
            className="rounded-xl p-3"
            screenInfo={screenInfo}
          >
            <div className="flex items-center gap-1.5 mb-3">
              <Target className="h-3.5 w-3.5 text-orange-400" />
              <span
                className="font-semibold text-white"
                style={{ fontSize: `clamp(0.75rem, 3vw, 0.875rem)` }}
              >
                Active Challenges
              </span>
            </div>
            <div className="space-y-2.5">
              {challenges.map((challenge, index) => (
                <div key={challenge.title} className="flex items-center gap-2">
                  <challenge.icon
                    className="h-3 w-3 flex-shrink-0"
                    style={{ color: challenge.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <span
                        className="text-white/80"
                        style={{ fontSize: `clamp(0.75rem, 2.5vw, 0.875rem)` }}
                      >
                        {challenge.title}
                      </span>
                      <span
                        className="font-semibold"
                        style={{
                          color: challenge.color,
                          fontSize: `clamp(0.625rem, 2vw, 0.75rem)`,
                        }}
                      >
                        {Math.round(challenge.progress)}%
                      </span>
                    </div>
                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: challenge.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${challenge.progress}%` }}
                        transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* RQM Score Card */}
          <GlassCard
            delay={0.5}
            className="rounded-xl p-3"
            screenInfo={screenInfo}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <Brain className="h-3.5 w-3.5 text-purple-400" />
                <span
                  className="font-semibold text-white"
                  style={{ fontSize: `clamp(0.75rem, 3vw, 0.875rem)` }}
                >
                  RQM Score
                </span>
              </div>
              {userPercentile > 0 && (
                <span
                  className="px-2 py-0.5 rounded-full font-medium"
                  style={{
                    background: `${getPerformanceColor()}15`,
                    color: getPerformanceColor(),
                    fontSize: `clamp(0.625rem, 2vw, 0.75rem)`,
                  }}
                >
                  Top {100 - userPercentile}%
                </span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p
                  className="font-bold text-white"
                  style={{ fontSize: `clamp(1.5rem, 6vw, 2rem)` }}
                >
                  {userRQM || '--'}
                </p>
                <p
                  className="text-white/40"
                  style={{ fontSize: `clamp(0.625rem, 2vw, 0.75rem)` }}
                >
                  Global Avg: {globalAvg}
                </p>
              </div>
              <div className="text-right">
                <p
                  className="text-white/40 uppercase"
                  style={{ fontSize: `clamp(0.625rem, 2vw, 0.75rem)` }}
                >
                  Among
                </p>
                <p
                  className="text-white/60"
                  style={{ fontSize: `clamp(0.75rem, 2.5vw, 0.875rem)` }}
                >
                  {globalComp.totalPlayers?.toLocaleString() || 0} players
                </p>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    )
  }

  // Enhanced Desktop/Tablet Layout
  return (
    <div className={containerPadding}>
      <div
        className={`${
          screenInfo.isLg ? 'space-y-3' : 'grid grid-cols-2 gap-4'
        }`}
      >
        {/* Challenges Card */}
        <GlassCard
          delay={0.4}
          className="rounded-xl p-4"
          screenInfo={screenInfo}
        >
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-4 w-4 text-orange-400" />
            <span
              className="font-semibold text-white"
              style={{ fontSize: `clamp(0.875rem, 1.5vw, 1rem)` }}
            >
              Active Challenges
            </span>
          </div>
          <div className="space-y-3">
            {challenges.map((challenge, index) => (
              <motion.div
                key={challenge.title}
                className="p-2.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                whileHover={{ x: 3 }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="p-1.5 rounded-lg"
                    style={{ background: `${challenge.color}15` }}
                  >
                    <challenge.icon
                      className="h-3.5 w-3.5"
                      style={{ color: challenge.color }}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1.5">
                      <span
                        className="text-white/80"
                        style={{ fontSize: `clamp(0.75rem, 1.2vw, 0.875rem)` }}
                      >
                        {challenge.title}
                      </span>
                      <span
                        className="font-bold"
                        style={{ color: challenge.color }}
                      >
                        {Math.round(challenge.progress)}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{
                          background: `linear-gradient(90deg, ${challenge.color}, ${challenge.color}dd)`,
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${challenge.progress}%` }}
                        transition={{ duration: 1, delay: 0.5 + index * 0.15 }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </GlassCard>

        {/* RQM Performance Card */}
        <GlassCard
          delay={0.5}
          className="rounded-xl p-4"
          screenInfo={screenInfo}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-purple-400" />
              <span
                className="font-semibold text-white"
                style={{ fontSize: `clamp(0.875rem, 1.5vw, 1rem)` }}
              >
                RQM Global Ranking
              </span>
            </div>
            {userPercentile > 0 && (
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{
                  background: `${getPerformanceColor()}15`,
                  color: getPerformanceColor(),
                }}
              >
                Top {100 - userPercentile}%
              </span>
            )}
          </div>

          {/* RQM Score Display */}
          <div className="text-center mb-4 p-3 rounded-xl bg-gradient-to-br from-purple-500/5 to-pink-500/5">
            <p
              className="text-purple-400/60 uppercase tracking-wider mb-1"
              style={{ fontSize: `clamp(0.625rem, 1vw, 0.75rem)` }}
            >
              Your Score
            </p>
            <p
              className="font-black text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text"
              style={{ fontSize: `clamp(2rem, 4vw, 3rem)` }}
            >
              {userRQM || '--'}
            </p>
          </div>

          {/* Comparison */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/40">Global Average</span>
              <span className="text-white/60 font-semibold">{globalAvg}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/40">Highest Score</span>
              <span className="text-yellow-400 font-semibold">
                {globalComp.highestRQM || 0}
              </span>
            </div>
            <div className="pt-2 mt-2 border-t border-white/5">
              <p
                className="text-center text-white/30"
                style={{ fontSize: `clamp(0.625rem, 1vw, 0.75rem)` }}
              >
                Among {globalComp.totalPlayers?.toLocaleString() || 0} warriors
                worldwide
              </p>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}

// Enhanced Enter Game Button with proper touch targets
const EnterGameButton = ({ onEnterGame, isLoading, screenInfo }) => {
  const buttonStyle = {
    background:
      'linear-gradient(135deg, rgba(6, 182, 212, 0.85), rgba(59, 130, 246, 0.85), rgba(139, 92, 246, 0.85))',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    boxShadow: '0 20px 50px rgba(59, 130, 246, 0.35)',
  }

  if (screenInfo.isMobile) {
    // Enhanced Mobile Button with proper touch target
    const containerPadding = screenInfo.isXs ? 'px-3 pb-3' : 'px-4 pb-4'

    return (
      <FadeIn delay={0.6} className={containerPadding} screenInfo={screenInfo}>
        <motion.button
          onClick={onEnterGame}
          disabled={isLoading}
          whileHover={{ scale: screenInfo.isTouchDevice ? 1 : 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-4 rounded-2xl relative overflow-hidden group min-h-[48px] touch-manipulation"
          style={buttonStyle}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          />
          <div className="relative z-10 flex items-center justify-center gap-2 text-white">
            <motion.div
              animate={{ rotate: isLoading ? 360 : 0 }}
              transition={{
                duration: isLoading ? 1 : 0,
                repeat: Infinity,
                ease: 'linear',
              }}
            >
              <Gamepad2 className="h-4 w-4" />
            </motion.div>
            <span
              className="font-semibold tracking-wide"
              style={{ fontSize: `clamp(0.875rem, 3.5vw, 1rem)` }}
            >
              {isLoading ? 'Loading...' : 'Enter Battle Arena'}
            </span>
            {!isLoading && <ArrowRight className="h-4 w-4" />}
          </div>
        </motion.button>
      </FadeIn>
    )
  }

  // Enhanced Desktop Button
  const buttonPadding = useMemo(() => {
    if (screenInfo.isLg) return 'px-8 py-3.5'
    if (screenInfo.isXl) return 'px-10 py-4'
    return 'px-12 py-5'
  }, [screenInfo])

  return (
    <FadeIn delay={0.6} screenInfo={screenInfo}>
      <div className="flex justify-center">
        <motion.button
          onClick={onEnterGame}
          disabled={isLoading}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          className={`${buttonPadding} rounded-2xl relative overflow-hidden group`}
          style={buttonStyle}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          />
          <div className="relative z-10 flex items-center justify-center gap-3 text-white">
            <motion.div
              animate={{ rotate: isLoading ? 360 : 0 }}
              transition={{
                duration: isLoading ? 1 : 0,
                repeat: Infinity,
                ease: 'linear',
              }}
            >
              <Gamepad2 className={screenInfo.isLg ? 'h-4 w-4' : 'h-5 w-5'} />
            </motion.div>
            <span
              className="font-semibold tracking-wider uppercase"
              style={{ fontSize: `clamp(0.875rem, 1.5vw, 1.125rem)` }}
            >
              {isLoading ? 'Loading Arena...' : 'Enter Battle Arena'}
            </span>
            {!isLoading && (
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <ArrowRight
                  className={screenInfo.isLg ? 'h-4 w-4' : 'h-5 w-5'}
                />
              </motion.div>
            )}
          </div>
        </motion.button>
      </div>
    </FadeIn>
  )
}

// Enhanced Loading Screen
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
          Loading Battle Arena
        </h2>
        <p
          className="text-white/50"
          style={{ fontSize: `clamp(0.75rem, 2vw, 0.875rem)` }}
        >
          Preparing your experience...
        </p>
      </div>
    </div>
  )
}

// Main Component
const AppStartScreen = () => {
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [battleStats, setBattleStats] = useState(null)
  const [statsLoading, setStatsLoading] = useState(true)
  const [statsError, setStatsError] = useState(null)
  const navigate = useNavigate()

  // Enhanced responsive hook
  const screenInfo = useResponsiveBreakpoints()

  // Get user data from Redux
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

  const handleVideoLoad = useCallback(() => {
    setVideoLoaded(true)
  }, [])

  const handleEnterGame = useCallback(() => {
    navigate('/quickclash')
  }, [navigate])

  // Enhanced video overlays based on screen size
  const videoOverlays = useMemo(
    () => [
      {
        className: screenInfo.isMobile
          ? 'bg-gradient-to-b from-slate-900/50 via-transparent to-slate-900/70'
          : 'bg-gradient-to-b from-slate-900/40 via-transparent to-slate-900/60',
        style: { zIndex: 1 },
      },
    ],
    [screenInfo.isMobile],
  )

  // Container class based on screen size
  const containerClass = useMemo(() => {
    if (screenInfo.isMobile) {
      return 'h-screen w-full relative overflow-hidden'
    }
    return 'h-screen w-full relative overflow-hidden'
  }, [screenInfo.isMobile])

  // Content container class
  const contentContainerClass = useMemo(() => {
    if (screenInfo.isMobile) {
      return 'relative z-10 h-full flex flex-col justify-between min-h-0 overflow-y-auto'
    }
    return 'relative z-10 h-full flex items-center justify-center p-6'
  }, [screenInfo.isMobile])

  // Main content wrapper
  const mainContentClass = useMemo(() => {
    if (screenInfo.isXs) return 'w-full max-w-sm mx-auto'
    if (screenInfo.isSm) return 'w-full max-w-md mx-auto'
    if (screenInfo.isMd) return 'w-full max-w-lg mx-auto'
    if (screenInfo.isLg) return 'w-full max-w-3xl'
    if (screenInfo.isXl) return 'w-full max-w-4xl'
    if (screenInfo.is2Xl) return 'w-full max-w-5xl'
    return 'w-full max-w-6xl'
  }, [screenInfo])

  return (
    <div className={containerClass}>
      <FixedBackground
        useVideo={true}
        desktopVideo="/videos/Desktop_Screen"
        mobileVideo="/videos/Mobile_Screen"
        onVideoLoad={handleVideoLoad}
        forceRender={true}
        customOverlays={videoOverlays}
      />

      {videoLoaded && (
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
              // Enhanced Mobile Layout
              <div className="flex-1 flex flex-col justify-between min-h-0 overflow-y-auto">
                <div className="space-y-3 flex-shrink-0">
                  <ProfileHeader
                    user={user}
                    battleStats={battleStats}
                    screenInfo={screenInfo}
                  />
                  <StatsGrid
                    battleStats={battleStats}
                    screenInfo={screenInfo}
                  />
                  <PerformanceSection
                    battleStats={battleStats}
                    screenInfo={screenInfo}
                  />
                </div>
                <div className="flex-shrink-0">
                  <EnterGameButton
                    onEnterGame={handleEnterGame}
                    isLoading={statsLoading}
                    screenInfo={screenInfo}
                  />
                </div>
              </div>
            ) : (
              // Enhanced Desktop Layout
              <div className={mainContentClass}>
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="space-y-4"
                >
                  <ProfileHeader
                    user={user}
                    battleStats={battleStats}
                    screenInfo={screenInfo}
                  />
                  <StatsGrid
                    battleStats={battleStats}
                    screenInfo={screenInfo}
                  />
                  <PerformanceSection
                    battleStats={battleStats}
                    screenInfo={screenInfo}
                  />
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
      )}

      {!videoLoaded && <LoadingScreen screenInfo={screenInfo} />}
    </div>
  )
}

export default AppStartScreen
