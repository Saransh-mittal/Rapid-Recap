// components/quickClashComponents/leaderboard/components/LeaderboardCard.jsx
import React, { useMemo, useState, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  Trophy,
  TrendingUp,
  Award,
  Crown,
  Medal,
  Users,
  Percent,
  Target,
  User,
  ArrowRight,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

// Stat Item Component
const StatItem = ({ icon: Icon, label, value, color }) => (
  <div className="flex flex-col items-center p-2 rounded-lg bg-slate-800/50 border border-slate-700/50">
    <div className="flex items-center gap-1.5 mb-1">
      <Icon className="w-3.5 h-3.5" style={{ color }} />
      <span className="text-[10px] text-slate-400 uppercase font-medium">{label}</span>
    </div>
    <span className="text-sm font-bold text-white tracking-wide">{value}</span>
  </div>
)

const LeaderboardCard = memo(({ user, currentUserId, rank, onViewProfile }) => {
  const { t } = useTranslation('QuickClash')
  const isCurrentUser = user._id === currentUserId
  const [isStatsExpanded, setIsStatsExpanded] = useState(false)

  const handleToggleStats = () => setIsStatsExpanded(!isStatsExpanded)

  // Handle view profile
  const handleProfileClick = () => {
    if (onViewProfile) {
      onViewProfile(user._id)
    }
  }

  const formatStatValue = (value, isPercentage = false) => {
    if (value === undefined || value === null) return 'N/A'
    const numValue = parseFloat(value)
    if (isNaN(numValue)) return 'N/A'
    return isPercentage ? `${numValue.toFixed(1)}%` : numValue.toFixed(1)
  }

  const formatStatValueInteger = (value) => {
    if (value === undefined || value === null) return 'N/A'
    const numValue = parseInt(value, 10)
    if (isNaN(numValue)) return 'N/A'
    return numValue
  }

  // Styles based on rank (mainly for if top 3 appear in search results, though Podium handles main view)
  const rankStyles = useMemo(() => {
    if (rank === 1) return {
      borderColor: 'border-yellow-500/50',
      bgGradient: 'bg-gradient-to-r from-yellow-500/10 to-transparent',
      rankColor: 'text-yellow-400',
      shadow: 'shadow-yellow-500/10',
      icon: Crown
    }
    if (rank === 2) return {
      borderColor: 'border-gray-400/50',
      bgGradient: 'bg-gradient-to-r from-gray-400/10 to-transparent',
      rankColor: 'text-gray-300',
      shadow: 'shadow-gray-400/10',
      icon: Medal
    }
    if (rank === 3) return {
      borderColor: 'border-orange-500/50',
      bgGradient: 'bg-gradient-to-r from-orange-500/10 to-transparent',
      rankColor: 'text-orange-400',
      shadow: 'shadow-orange-500/10',
      icon: Medal
    }
    return {
      borderColor: isCurrentUser ? 'border-purple-500/50' : 'border-white/5',
      bgGradient: isCurrentUser ? 'bg-purple-500/10' : 'bg-white/5',
      rankColor: isCurrentUser ? 'text-purple-400' : 'text-slate-400',
      shadow: isCurrentUser ? 'shadow-purple-500/10' : '',
      icon: null
    }
  }, [rank, isCurrentUser])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        relative mb-3 rounded-xl border ${rankStyles.borderColor} ${rankStyles.bgGradient}
        backdrop-blur-sm overflow-hidden transition-all duration-200
        ${rankStyles.shadow ? `shadow-lg ${rankStyles.shadow}` : ''}
        hover:bg-white/10
      `}
    >
      {/* Main Row */}
      <div
        onClick={handleToggleStats}
        className="flex items-center p-3 cursor-pointer"
      >
        {/* Rank */}
        <div className="w-8 flex justify-center mr-3 font-mono font-bold text-lg">
          {rankStyles.icon ? (
            <rankStyles.icon className={`w-5 h-5 ${rankStyles.rankColor}`} />
          ) : (
            <span className={rankStyles.rankColor}>{rank}</span>
          )}
        </div>

        {/* Avatar */}
        <div className={`
          relative w-10 h-10 rounded-full overflow-hidden bg-slate-800 border
          ${isCurrentUser ? 'border-purple-500' : 'border-white/10'} mr-3
        `}>
          {user.pic ? (
            <img src={user.pic} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-700 text-white font-bold">
              {user.name?.charAt(0)}
            </div>
          )}
        </div>

        {/* Name & Badge */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className={`font-bold text-sm truncate ${isCurrentUser ? 'text-purple-300' : 'text-white'}`}>
              {user.inGameName || user.name}
            </h3>
            {isCurrentUser && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                YOU
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className="capitalize">{t('Level')} 1</span> {/* Placeholder if no level data */}
          </div>
        </div>

        {/* Trophies */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20">
          <Trophy className="w-3.5 h-3.5 text-yellow-500" />
          <span className="font-bold text-yellow-500 text-sm">{user.trophies || 0}</span>
        </div>

        {/* Expand Icon */}
        <div className="ml-2 text-slate-500">
          {isStatsExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </div>

      {/* Expanded Stats */}
      <AnimatePresence>
        {isStatsExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-white/5 bg-black/20"
          >
            <div className="p-3">
              <div className="grid grid-cols-2 gap-2 mb-3">
                <StatItem
                  icon={Trophy}
                  label={t('1v1 Wins')}
                  value={formatStatValueInteger(user.wins1v1 !== undefined ? user.wins1v1 : user.wins)}
                  color="#58D68D"
                />
                <StatItem
                  icon={Users}
                  label={t('4v4 Wins')}
                  value={formatStatValueInteger(user.wins4v4)}
                  color="#F39C12"
                />
                <StatItem
                  icon={TrendingUp}
                  label={t('1v1 Win %')}
                  value={formatStatValue(user.winRate1v1 !== undefined ? user.winRate1v1 : user.winRate, true)}
                  color="#5DADE2"
                />
                <StatItem
                  icon={Percent}
                  label={t('4v4 Win Rate')}
                  value={formatStatValue(user.winRate4v4, true)}
                  color="#3498DB"
                />
              </div>

              <button
                onClick={handleProfileClick}
                className="w-full py-2 flex items-center justify-center gap-2 rounded-lg border border-white/10 hover:bg-white/5 transition-colors text-sm font-medium text-slate-300"
              >
                <User className="w-3.5 h-3.5" />
                {t('View Profile')}
                <ArrowRight className="w-3.5 h-3.5 opacity-50" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
})

LeaderboardCard.displayName = 'LeaderboardCard'
export default LeaderboardCard
