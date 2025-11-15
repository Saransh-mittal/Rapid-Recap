// components/quickClashComponents/team/teamBattlePageComponents/BattleResultsSection.jsx
import React, { useMemo, memo } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  Trophy,
  Target,
  TrendingUp,
  TrendingDown,
  Crown,
  Star,
  Zap,
  Award,
} from 'lucide-react'

// Shadcn UI Components
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

/**
 * Mobile-First Battle Results Section - No Background
 *
 * Features:
 * - Transparent glassmorphism
 * - Celebration/defeat animations
 * - Mobile-first responsive layout
 * - Touch-friendly elements
 */
const BattleResultsSection = memo(({ currentBattle, userTeam }) => {
  const { t } = useTranslation('QuickClash')

  if (currentBattle.status !== 'completed') return null

  // Calculate result data
  const resultData = useMemo(() => {
    const isUserWinner = currentBattle.winner === userTeam
    const isTie = currentBattle.winner === 'tie'
    const isUserDefeat = !isUserWinner && !isTie

    return {
      isUserWinner,
      isTie,
      isUserDefeat,
      resultColor: isUserWinner ? 'cyan' : isTie ? 'yellow' : 'red',
      resultGradient: isUserWinner
        ? 'from-cyan-500 to-blue-500'
        : isTie
        ? 'from-yellow-500 to-orange-500'
        : 'from-red-500 to-pink-500',
    }
  }, [currentBattle.winner, userTeam])

  // Get team data
  const userTeamData = useMemo(() => {
    const isUserTeamA = userTeam === 'teamA'
    return {
      wins: isUserTeamA ? currentBattle.teamAWins : currentBattle.teamBWins,
      totalScore: isUserTeamA
        ? currentBattle.teamATotalScore
        : currentBattle.teamBTotalScore,
      name: isUserTeamA ? currentBattle.teamA?.name : currentBattle.teamB?.name,
      members: isUserTeamA
        ? currentBattle.teamAMembers
        : currentBattle.teamBMembers,
    }
  }, [currentBattle, userTeam])

  const opponentTeamData = useMemo(() => {
    const isUserTeamA = userTeam === 'teamA'
    return {
      wins: isUserTeamA ? currentBattle.teamBWins : currentBattle.teamAWins,
      totalScore: isUserTeamA
        ? currentBattle.teamBTotalScore
        : currentBattle.teamATotalScore,
      name: isUserTeamA ? currentBattle.teamB?.name : currentBattle.teamA?.name,
      members: isUserTeamA
        ? currentBattle.teamBMembers
        : currentBattle.teamAMembers,
    }
  }, [currentBattle, userTeam])

  // Calculate trophy changes
  const trophyChange = useMemo(() => {
    if (!currentBattle.trophyExchange) return 0

    if (resultData.isUserWinner) {
      return Math.round((currentBattle.trophyExchange.finalAmount * 1.25) / 4)
    } else if (resultData.isTie) {
      return Math.round(currentBattle.trophyExchange.finalAmount * 0.1)
    } else {
      return -Math.round((currentBattle.trophyExchange.finalAmount * 0.75) / 4)
    }
  }, [currentBattle.trophyExchange, resultData])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="px-3 mb-6 sm:px-4 sm:mb-7 md:px-6 md:mb-8"
    >
      {/* Main results container - transparent glass */}
      <div
        className={`relative overflow-hidden rounded-xl sm:rounded-2xl md:rounded-3xl backdrop-blur-[12px] border-2 shadow-2xl ${
          resultData.isUserWinner
            ? 'bg-slate-900/50 border-cyan-500/50 shadow-[0_0_40px_rgba(6,182,212,0.3)]'
            : resultData.isTie
            ? 'bg-slate-900/50 border-yellow-500/50 shadow-[0_0_40px_rgba(245,158,11,0.3)]'
            : 'bg-slate-900/50 border-red-500/50 shadow-[0_0_40px_rgba(239,68,68,0.3)]'
        }`}
      >
        {/* Animated particles for victory */}
        {resultData.isUserWinner && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1.5 h-1.5 sm:w-2 sm:h-2 bg-cyan-400 rounded-full"
                initial={{
                  x: '50%',
                  y: '100%',
                  scale: 0,
                  opacity: 0,
                }}
                animate={{
                  x: `${Math.random() * 100}%`,
                  y: `${-Math.random() * 100}%`,
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.1,
                  ease: 'easeOut',
                }}
              />
            ))}
          </div>
        )}

        <div className="relative z-10 p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-7 md:space-y-8">
          {/* Result header - Mobile First */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            {/* Crown/Trophy icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', bounce: 0.5 }}
              className="flex justify-center mb-3 sm:mb-4"
            >
              {resultData.isUserWinner ? (
                <div className="relative">
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      rotate: [0, 10, -10, 0],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Crown className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-yellow-400" />
                  </motion.div>
                  <div className="absolute inset-0 bg-yellow-400/20 blur-2xl" />
                </div>
              ) : resultData.isTie ? (
                <Award className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-yellow-400" />
              ) : (
                <Target className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-red-400" />
              )}
            </motion.div>

            {/* Result text */}
            <Badge
              className={`text-xl sm:text-2xl md:text-3xl px-6 sm:px-8 py-2 sm:py-3 bg-gradient-to-r ${resultData.resultGradient} text-white font-bold`}
            >
              {resultData.isUserWinner
                ? t('VICTORY!')
                : resultData.isTie
                ? t('DRAW!')
                : t('DEFEAT!')}
            </Badge>

            <p className="mt-3 sm:mt-4 text-sm sm:text-base md:text-lg text-cyan-100/70 px-4">
              {resultData.isUserWinner
                ? t('Congratulations! You dominated the battlefield!')
                : resultData.isTie
                ? t('An epic draw! Both teams fought valiantly!')
                : t('Better luck next time! Keep fighting!')}
            </p>
          </motion.div>

          {/* Score display - Mobile First */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-slate-800/50 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 backdrop-blur-sm"
          >
            <div className="flex items-center justify-center gap-4 sm:gap-6 md:gap-8">
              {/* User team score */}
              <div className="text-center">
                <motion.div
                  animate={{
                    textShadow: [
                      '0 0 10px rgba(6,182,212,0.5)',
                      '0 0 20px rgba(6,182,212,0.8)',
                      '0 0 10px rgba(6,182,212,0.5)',
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-4xl sm:text-5xl md:text-6xl font-black text-cyan-400 mb-1 sm:mb-2"
                >
                  {userTeamData.wins}
                </motion.div>
                <p className="text-xs sm:text-sm text-cyan-100/70">
                  {t('Your Team')}
                </p>
              </div>

              {/* VS divider */}
              <div className="text-2xl sm:text-3xl font-bold text-white/50">
                :
              </div>

              {/* Opponent team score */}
              <div className="text-center">
                <motion.div
                  animate={{
                    textShadow: [
                      '0 0 10px rgba(239,68,68,0.5)',
                      '0 0 20px rgba(239,68,68,0.8)',
                      '0 0 10px rgba(239,68,68,0.5)',
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-4xl sm:text-5xl md:text-6xl font-black text-red-400 mb-1 sm:mb-2"
                >
                  {opponentTeamData.wins}
                </motion.div>
                <p className="text-xs sm:text-sm text-red-100/70">
                  {t('Opponent')}
                </p>
              </div>
            </div>

            {/* Total points */}
            <div className="flex items-center justify-center gap-4 sm:gap-6 mt-4 sm:mt-5 text-xs sm:text-sm">
              <span className="text-cyan-400 font-bold">
                {userTeamData.totalScore} pts
              </span>
              <span className="text-white/50">•</span>
              <span className="text-red-400 font-bold">
                {opponentTeamData.totalScore} pts
              </span>
            </div>
          </motion.div>

          {/* Team performance cards - Mobile: Stack, Desktop: Side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {/* User team */}
            <TeamPerformanceCard
              team={userTeamData}
              isUserTeam={true}
              challenges={currentBattle.challenges}
              actualTeam={userTeam === 'teamA' ? 'A' : 'B'}
              trophyChange={trophyChange}
              isWinner={resultData.isUserWinner}
              isTie={resultData.isTie}
              t={t}
            />

            {/* Opponent team */}
            <TeamPerformanceCard
              team={opponentTeamData}
              isUserTeam={false}
              challenges={currentBattle.challenges}
              actualTeam={userTeam === 'teamA' ? 'B' : 'A'}
              trophyChange={-trophyChange}
              isWinner={
                currentBattle.winner ===
                (userTeam === 'teamA' ? 'teamB' : 'teamA')
              }
              isTie={resultData.isTie}
              t={t}
            />
          </div>

          {/* Trophy bonuses */}
          {currentBattle.trophyExchange?.bonuses && (
            <TrophyBonuses
              bonuses={currentBattle.trophyExchange.bonuses}
              t={t}
            />
          )}
        </div>
      </div>
    </motion.div>
  )
})

/**
 * Team Performance Card - Mobile First
 */
const TeamPerformanceCard = memo(
  ({
    team,
    isUserTeam,
    challenges,
    actualTeam,
    trophyChange,
    isWinner,
    isTie,
    t,
  }) => {
    const completedChallenges = challenges.filter(
      c => c[`team${actualTeam}Completed`],
    ).length

    return (
      <motion.div
        initial={{ opacity: 0, x: isUserTeam ? -20 : 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
        className={`rounded-lg sm:rounded-xl p-4 sm:p-5 backdrop-blur-[8px] ${
          isUserTeam
            ? 'bg-cyan-500/10 border-2 border-cyan-500/30'
            : 'bg-red-500/10 border-2 border-red-500/30'
        }`}
      >
        {/* Team name */}
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h3
            className={`text-base sm:text-lg font-bold truncate ${
              isUserTeam ? 'text-cyan-300' : 'text-red-300'
            }`}
          >
            {team.name || t('Team {{team}}', { team: actualTeam })}
          </h3>
          {isWinner && (
            <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 flex-shrink-0" />
          )}
        </div>

        {/* Stats */}
        <div className="space-y-2 sm:space-y-3">
          <StatItem
            icon={Trophy}
            label={t('Wins')}
            value={team.wins}
            color={isUserTeam ? 'cyan' : 'red'}
          />
          <StatItem
            icon={Target}
            label={t('Completed')}
            value={`${completedChallenges}/${challenges.length}`}
            color={isUserTeam ? 'cyan' : 'red'}
          />
          <StatItem
            icon={trophyChange >= 0 ? TrendingUp : TrendingDown}
            label={t('Trophies')}
            value={`${trophyChange >= 0 ? '+' : ''}${trophyChange}`}
            color={trophyChange >= 0 ? 'green' : 'red'}
          />

          {/* Progress bar */}
          <div>
            <div className="flex justify-between text-xs text-white/70 mb-1">
              <span>{t('Progress')}</span>
              <span>
                {completedChallenges}/{challenges.length}
              </span>
            </div>
            <Progress
              value={(completedChallenges / challenges.length) * 100}
              className={`h-1.5 sm:h-2 ${
                isUserTeam ? 'bg-cyan-900/50' : 'bg-red-900/50'
              }`}
            />
          </div>
        </div>
      </motion.div>
    )
  },
)

/**
 * Stat Item Component
 */
const StatItem = memo(({ icon: Icon, label, value, color }) => {
  const colorClasses = {
    cyan: 'text-cyan-400',
    red: 'text-red-400',
    green: 'text-green-400',
    yellow: 'text-yellow-400',
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${colorClasses[color]}`} />
        <span className="text-xs sm:text-sm text-white/70">{label}</span>
      </div>
      <span className={`text-xs sm:text-sm font-bold ${colorClasses[color]}`}>
        {value}
      </span>
    </div>
  )
})

/**
 * Trophy Bonuses Display - Mobile First
 */
const TrophyBonuses = memo(({ bonuses, t }) => {
  const applicableBonuses = [
    bonuses.firstDaily?.applied && {
      key: 'firstDaily',
      label: t('First Daily'),
      ...bonuses.firstDaily,
    },
    bonuses.strongerTeam?.applied && {
      key: 'strongerTeam',
      label: t('vs Stronger'),
      ...bonuses.strongerTeam,
    },
    bonuses.comebackWin?.applied && {
      key: 'comebackWin',
      label: t('Comeback'),
      ...bonuses.comebackWin,
    },
    bonuses.allWins?.applied && {
      key: 'allWins',
      label: t('All Wins'),
      ...bonuses.allWins,
    },
  ].filter(Boolean)

  if (applicableBonuses.length === 0) return null

  const bonusIcons = {
    firstDaily: Star,
    strongerTeam: TrendingUp,
    comebackWin: Award,
    allWins: Trophy,
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 }}
      className="rounded-xl sm:rounded-2xl bg-yellow-500/10 backdrop-blur-[8px] border-2 border-yellow-500/30 p-4 sm:p-5 md:p-6"
    >
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
        <h3 className="text-base sm:text-lg font-bold text-yellow-300">
          {t('🏆 BONUS TROPHIES')}
        </h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        {applicableBonuses.map((bonus, index) => (
          <motion.div
            key={bonus.key}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 + index * 0.1 }}
            className="bg-slate-800/50 backdrop-blur-[8px] rounded-lg sm:rounded-xl p-2 sm:p-3 text-center"
          >
            {React.createElement(bonusIcons[bonus.key], {
              className:
                'w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 mx-auto mb-1 sm:mb-2',
            })}
            <p className="text-xs text-white font-medium mb-1">{bonus.label}</p>
            <motion.p
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{ duration: 1, repeat: Infinity }}
              className="text-base sm:text-lg font-bold text-yellow-400"
            >
              +{bonus.amount}
            </motion.p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
})

StatItem.displayName = 'StatItem'
TeamPerformanceCard.displayName = 'TeamPerformanceCard'
TrophyBonuses.displayName = 'TrophyBonuses'
BattleResultsSection.displayName = 'BattleResultsSection'

export default BattleResultsSection
