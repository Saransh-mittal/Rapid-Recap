// src/components/WiseWeb/components/SearchUserCard.jsx - Complete with chat integration
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Trophy,
  UserPlus,
  Check,
  Clock,
  Zap,
  Target,
  TrendingUp,
  MessageCircle,
  Eye,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import ChatButton from './ChatButton'

const SearchUserCard = ({
  user,
  onSendRequest,
  onStartChat,
  hasPendingRequest,
  loading,
}) => {
  const { t } = useTranslation('WiseWeb')
  const navigate = useNavigate()
  const [isRequestSent, setIsRequestSent] = useState(false)

  const handleSendRequest = async () => {
    const success = await onSendRequest(user._id)
    if (success) {
      setIsRequestSent(true)
    }
  }

  const handleViewProfile = () => {
    navigate(`/profile/${user.inGameName}`)
  }

  const handleStartChat = () => {
    if (onStartChat) {
      onStartChat(user)
    }
  }

  const getTrophyColor = trophies => {
    if (trophies >= 2000) return 'text-purple-400'
    if (trophies >= 1500) return 'text-yellow-400'
    if (trophies >= 1200) return 'text-orange-400'
    return 'text-slate-400'
  }

  const getPerformanceIndicator = () => {
    const { quickClashTrophies, quickClashStats, level } = user
    const winStreak = quickClashStats?.currentWinStreak || 0
    const peakTrophies = quickClashStats?.peakTrophies || quickClashTrophies

    // Show win streak if active
    if (winStreak > 0) {
      return (
        <div className="flex items-center gap-1">
          <Zap className="w-3 h-3 text-blue-400" />
          <span className="text-blue-300 font-medium">{winStreak}W</span>
        </div>
      )
    }

    // Show peak if higher than current
    if (peakTrophies > quickClashTrophies) {
      return (
        <div className="flex items-center gap-1">
          <TrendingUp className="w-3 h-3 text-green-400" />
          <span className="text-green-300 font-medium">
            {peakTrophies?.toLocaleString()}
          </span>
        </div>
      )
    }

    // Show level as fallback
    return (
      <div className="flex items-center gap-1">
        <Target className="w-3 h-3 text-indigo-400" />
        <span className="text-indigo-300 font-medium">Lv.{level}</span>
      </div>
    )
  }

  const getRelationshipStatus = () => {
    if (user.relationshipStatus === 'friend') {
      return {
        type: 'friend',
        label: t('Friend'),
        color: 'text-green-400',
        bgColor: 'bg-green-500/10',
        borderColor: 'border-green-500/20',
      }
    }

    if (
      user.relationshipStatus === 'pending_sent' ||
      hasPendingRequest ||
      isRequestSent
    ) {
      return {
        type: 'pending',
        label: t('Request Sent'),
        color: 'text-orange-400',
        bgColor: 'bg-orange-500/10',
        borderColor: 'border-orange-500/20',
      }
    }

    if (user.relationshipStatus === 'pending_received') {
      return {
        type: 'received',
        label: t('Request Received'),
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/10',
        borderColor: 'border-blue-500/20',
      }
    }

    return {
      type: 'none',
      label: null,
      color: null,
      bgColor: null,
      borderColor: null,
    }
  }

  const relationshipStatus = getRelationshipStatus()

  const getActionButton = () => {
    if (relationshipStatus.type === 'friend') {
      return (
        <div className="flex items-center gap-2">
          {/* Chat Button for Friends */}
          {onStartChat && (
            <ChatButton friend={user} onClick={onStartChat} size="sm" />
          )}

          {/* View Profile Button */}
          <button
            onClick={handleViewProfile}
            className="w-8 h-8 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg flex items-center justify-center transition-colors duration-200"
            title={t('View Profile')}
          >
            <Eye className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      )
    }

    if (relationshipStatus.type === 'pending') {
      return (
        <div className="flex items-center gap-2">
          <div
            className={`
            px-3 py-1.5 rounded-lg flex items-center gap-2
            ${relationshipStatus.bgColor} ${relationshipStatus.borderColor}
            border
          `}
          >
            <Clock className={`w-3 h-3 ${relationshipStatus.color}`} />
            <span className={`text-xs font-medium ${relationshipStatus.color}`}>
              {relationshipStatus.label}
            </span>
          </div>
        </div>
      )
    }

    if (relationshipStatus.type === 'received') {
      return (
        <div
          className={`
          px-3 py-1.5 rounded-lg flex items-center gap-2
          ${relationshipStatus.bgColor} ${relationshipStatus.borderColor}
          border
        `}
        >
          <span className={`text-xs font-medium ${relationshipStatus.color}`}>
            {relationshipStatus.label}
          </span>
        </div>
      )
    }

    // No relationship - show add friend button
    return (
      <button
        onClick={handleSendRequest}
        disabled={loading}
        className="w-8 h-8 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-700 disabled:cursor-not-allowed rounded-lg flex items-center justify-center transition-colors duration-200"
        title={t('Send Friend Request')}
      >
        {loading ? (
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <UserPlus className="w-4 h-4 text-white" />
        )}
      </button>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-slate-800/30 hover:bg-slate-800/40 border border-slate-700/40 hover:border-slate-600/50 rounded-xl p-4 transition-all duration-200"
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <img
            src={user.pic}
            alt={user.name}
            className="w-12 h-12 rounded-xl object-cover border border-slate-600/50"
            onError={e => {
              e.target.src =
                'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg'
            }}
          />
          {user.isOnline && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-slate-800 rounded-full"></div>
          )}
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3
              className="text-sm font-semibold text-white truncate max-w-[120px]"
              title={user.name}
            >
              {user.name}
            </h3>
            {user.isOnline && (
              <span className="px-2 py-0.5 bg-green-400/20 text-green-400 text-[10px] font-medium rounded-full">
                {t('Online')}
              </span>
            )}
            {relationshipStatus.label &&
              relationshipStatus.type === 'friend' && (
                <span
                  className={`
                px-2 py-0.5 text-[10px] font-medium rounded-full
                ${relationshipStatus.bgColor} ${relationshipStatus.color}
              `}
                >
                  {relationshipStatus.label}
                </span>
              )}
          </div>

          <p
            className="text-xs text-cyan-300 mb-2 truncate"
            title={`@${user.inGameName}`}
          >
            @{user.inGameName}
          </p>

          {/* QuickClash Stats */}
          <div className="flex items-center gap-3 text-xs">
            {/* Trophies - Always shown */}
            <div className="flex items-center gap-1">
              <Trophy
                className={`w-3 h-3 ${getTrophyColor(user.quickClashTrophies)}`}
              />
              <span className="text-white font-semibold">
                {user.quickClashTrophies?.toLocaleString()}
              </span>
            </div>

            {/* Performance Indicator */}
            {getPerformanceIndicator()}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex-shrink-0">{getActionButton()}</div>
      </div>

      {/* Performance Highlight for Elite Users */}
      {(user.quickClashStats?.currentWinStreak >= 3) && (
        <div className="mt-3 pt-2 border-t border-slate-700/30">
          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded border border-blue-500/20">
              <Zap className="w-3 h-3" />
              <span className="font-medium">
                {user.quickClashStats.currentWinStreak} Win Streak
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Last Seen */}
      <div className="mt-3 pt-2 border-t border-slate-700/30">
        <span className="text-xs text-slate-500">
          {user.isOnline
            ? t('Online')
            : user.lastLogin
            ? (() => {
                const now = new Date()
                const lastSeen = new Date(user.lastLogin)
                const diffMs = now - lastSeen
                const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
                const diffDays = Math.floor(diffHours / 24)

                if (diffHours < 1) return t('Now')
                if (diffHours < 24) return t('{{hours}}h', { hours: diffHours })
                if (diffDays < 7) return t('{{days}}d', { days: diffDays })
                return t('Long ago')
              })()
            : t('Never seen')}
        </span>
      </div>
    </motion.div>
  )
}

export default SearchUserCard
