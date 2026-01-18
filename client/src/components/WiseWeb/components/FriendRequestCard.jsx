// src/components/WiseWeb/components/FriendRequestCard.jsx - Updated with QuickClash Stats
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  UserCheck,
  UserX,
  Trophy,
  Clock,
  Zap,
  Target,
  TrendingUp,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

const FriendRequestCard = ({ request, onAccept, onReject, loading }) => {
  const { t } = useTranslation('WiseWeb')
  const [isAccepting, setIsAccepting] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)

  const handleAccept = async () => {
    setIsAccepting(true)
    try {
      await onAccept(request._id)
    } finally {
      setIsAccepting(false)
    }
  }

  const handleReject = async () => {
    setIsRejecting(true)
    try {
      await onReject(request._id)
    } finally {
      setIsRejecting(false)
    }
  }

  const formatTimeAgo = dateString => {
    const now = new Date()
    const createdAt = new Date(dateString)
    const diffMs = now - createdAt
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMinutes / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMinutes < 1) return t('Now')
    if (diffMinutes < 60) return t('{{minutes}}m', { minutes: diffMinutes })
    if (diffHours < 24) return t('{{hours}}h', { hours: diffHours })
    return t('{{days}}d', { days: diffDays })
  }

  const getTrophyColor = trophies => {
    if (trophies >= 2000) return 'text-purple-400'
    if (trophies >= 1500) return 'text-yellow-400'
    if (trophies >= 1200) return 'text-orange-400'
    return 'text-slate-400'
  }

  const getStreakDisplay = streak => {
    if (streak === 0) return null
    return (
      <div className="flex items-center gap-1">
        <Zap className="w-3 h-3 text-blue-400" />
        <span className="text-blue-300 font-medium">{streak}</span>
        <span className="text-slate-500 text-xs">streak</span>
      </div>
    )
  }

  const getPeakTrophiesDisplay = (currentTrophies, peakTrophies) => {
    if (!peakTrophies || peakTrophies <= currentTrophies) return null
    return (
      <div className="flex items-center gap-1">
        <TrendingUp className="w-3 h-3 text-green-400" />
        <span className="text-green-300 font-medium">
          {peakTrophies.toLocaleString()}
        </span>
        <span className="text-slate-500 text-xs">peak</span>
      </div>
    )
  }

  const isActionLoading = isAccepting || isRejecting || loading
  const { quickClashTrophies, quickClashStats, level } = request.from

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-gradient-to-r from-slate-800/30 to-orange-900/20 border border-orange-500/30 rounded-xl p-4 hover:border-orange-500/40 transition-all duration-200"
    >
      <div className="flex items-start gap-3 mb-4">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <img
            src={request.from.pic}
            alt={request.from.name}
            className="w-12 h-12 rounded-xl object-cover border border-orange-500/30"
            onError={e => {
              e.target.src =
                'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg'
            }}
          />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-400 border-2 border-slate-800 rounded-full"></div>
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3
              className="text-sm font-semibold text-white truncate max-w-[120px]"
              title={request.from.name}
            >
              {request.from.name}
            </h3>
            <span className="px-2 py-0.5 bg-orange-400/20 text-orange-400 text-[10px] font-medium rounded-full">
              {t('Request')}
            </span>
          </div>

          <p
            className="text-xs text-cyan-300 mb-2 truncate"
            title={`@${request.from.inGameName}`}
          >
            @{request.from.inGameName}
          </p>

          {/* QuickClash Stats Row */}
          <div className="flex items-center gap-3 text-xs">
            {/* Current Trophies */}
            <div className="flex items-center gap-1">
              <Trophy
                className={`w-3 h-3 ${getTrophyColor(quickClashTrophies)}`}
              />
              <span className="text-white font-semibold">
                {quickClashTrophies?.toLocaleString() || '1,000'}
              </span>
            </div>

            {/* Win Streak (if exists) */}
            {quickClashStats?.currentWinStreak > 0 &&
              getStreakDisplay(quickClashStats.currentWinStreak)}

            {/* Peak Trophies (if higher than current) */}
            {getPeakTrophiesDisplay(
              quickClashTrophies,
              quickClashStats?.peakTrophies,
            )}

            {/* Level as fallback */}
            {(!quickClashStats?.currentWinStreak ||
              quickClashStats.currentWinStreak === 0) &&
              (!quickClashStats?.peakTrophies ||
                quickClashStats.peakTrophies <= quickClashTrophies) && (
                <div className="flex items-center gap-1">
                  <Target className="w-3 h-3 text-indigo-400" />
                  <span className="text-indigo-300 font-medium">
                    Lv.{level || 1}
                  </span>
                </div>
              )}
          </div>
        </div>
      </div>

      {/* Gaming Performance Highlight */}
      {quickClashStats?.currentWinStreak >= 3 && (
        <div className="mb-3 p-2 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-blue-400" />
              <span className="text-blue-300 font-medium">
                {quickClashStats.currentWinStreak} Win Streak
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Time since request */}
      <div className="mb-3 pb-2 border-b border-orange-500/20">
        <div className="flex items-center gap-1 text-xs text-orange-300">
          <Clock className="w-3 h-3" />
          <span>{formatTimeAgo(request.createdAt)}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleAccept}
          disabled={isActionLoading}
          className={`
            flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium
            transition-all duration-200 min-h-[40px]
            ${
              isActionLoading
                ? 'bg-slate-700/50 text-slate-500 cursor-not-allowed border border-slate-600/30'
                : 'bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30 hover:border-green-400/50'
            }
          `}
        >
          {isAccepting ? (
            <div className="w-4 h-4 border border-green-400/30 border-t-green-400 rounded-full animate-spin" />
          ) : (
            <>
              <UserCheck className="w-4 h-4" />
              {t('Accept')}
            </>
          )}
        </button>

        <button
          onClick={handleReject}
          disabled={isActionLoading}
          className={`
            flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium
            transition-all duration-200 min-h-[40px]
            ${
              isActionLoading
                ? 'bg-slate-700/50 text-slate-500 cursor-not-allowed border border-slate-600/30'
                : 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 hover:border-red-400/50'
            }
          `}
        >
          {isRejecting ? (
            <div className="w-4 h-4 border border-red-400/30 border-t-red-400 rounded-full animate-spin" />
          ) : (
            <>
              <UserX className="w-4 h-4" />
              {t('Decline')}
            </>
          )}
        </button>
      </div>
    </motion.div>
  )
}

export default FriendRequestCard
