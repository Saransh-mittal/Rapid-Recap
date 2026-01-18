// src/components/WiseWeb/components/MiniProfileView.jsx - Fully Consistent with Controllers
import React from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Trophy,
  Zap,
  Calendar,
  Users,
  ExternalLink,
  Target,
  TrendingUp,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

const MiniProfileView = ({
  user,
  isOpen,
  onClose,
  onSendRequest,
  hasPendingRequest,
  loading,
}) => {
  const { t } = useTranslation('WiseWeb')
  const navigate = useNavigate()

  const handleViewFullProfile = () => {
    navigate(`/profile/${user.inGameName}`)
    onClose()
  }

  const formatJoinDate = dateString => {
    if (!dateString) return t('Unknown')
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    })
  }

  const formatLastSeen = (lastLogin, isOnline) => {
    if (isOnline) return t('Online now')

    const now = new Date()
    const lastSeen = new Date(lastLogin)
    const diffMs = now - lastSeen
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffHours < 1) return t('Just now')
    if (diffHours < 24) return t('{{hours}} hours ago', { hours: diffHours })
    if (diffDays < 7) return t('{{days}} days ago', { days: diffDays })
    return t('A while ago')
  }

  const getTrophyColor = trophies => {
    if (trophies >= 2000) return 'text-purple-400'
    if (trophies >= 1500) return 'text-yellow-400'
    if (trophies >= 1200) return 'text-orange-400'
    return 'text-slate-400'
  }

  const getStatusButton = () => {
    switch (user.relationshipStatus) {
      case 'friend':
        return (
          <button
            disabled
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-green-500/20 text-green-400 border border-green-500/30"
          >
            <Users className="w-4 h-4" />
            {t('Friends')}
          </button>
        )

      case 'pending_sent':
        return (
          <button
            disabled
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
          >
            <Trophy className="w-4 h-4" />
            {t('Request Sent')}
          </button>
        )

      case 'pending_received':
        return (
          <button
            disabled
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30"
          >
            <Users className="w-4 h-4" />
            {t('Sent to You')}
          </button>
        )

      default:
        return (
          <button
            onClick={() => onSendRequest(user._id)}
            disabled={loading || hasPendingRequest}
            className={`
              w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg
              transition-all duration-200
              ${
                loading || hasPendingRequest
                  ? 'bg-slate-700/40 text-slate-500 cursor-not-allowed border border-slate-600/30'
                  : 'bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/30 hover:border-cyan-400/50'
              }
            `}
          >
            {loading ? (
              <div className="w-4 h-4 border border-cyan-300/30 border-t-cyan-300 rounded-full animate-spin"></div>
            ) : (
              <Users className="w-4 h-4" />
            )}
            {t('Add Friend')}
          </button>
        )
    }
  }

  // Only render portal if modal should be open and user exists
  if (!isOpen || !user) return null

  // Extract QuickClash data with fallbacks
  const {
    quickClashTrophies = 1000,
    quickClashStats = {},
    level = 1,
    isOnline = false,
    lastLogin,
    createdAt,
  } = user

  const winStreak = quickClashStats.currentWinStreak || 0
  const peakTrophies = quickClashStats.peakTrophies || quickClashTrophies

  // Create the modal content
  const modalContent = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 30 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="w-full max-w-sm max-h-[85vh] bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header with Close Button */}
        <div className="relative p-5">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-slate-800/50 hover:bg-slate-700/60 rounded-lg flex items-center justify-center transition-colors duration-200"
          >
            <X className="w-4 h-4 text-slate-400 hover:text-white" />
          </button>

          {/* Profile Header */}
          <div className="flex items-start gap-4 mb-5 pr-10">
            <div className="relative flex-shrink-0">
              <img
                src={user.pic}
                alt={user.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-600/50"
                onError={e => {
                  e.target.src =
                    'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg'
                }}
              />
              {isOnline && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 border-2 border-slate-900 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-white mb-1 leading-tight break-words">
                {user.name}
              </h3>
              <p className="text-sm text-cyan-300 font-medium mb-2 break-words">
                @{user.inGameName}
              </p>

              {isOnline && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-400/20 text-green-400 text-xs font-medium rounded-lg border border-green-400/30">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  {t('Online now')}
                </span>
              )}
            </div>
          </div>

          {/* QuickClash Stats Section */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            {/* Trophies */}
            <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/30">
              <div className="flex items-center gap-2 mb-2">
                <Trophy
                  className={`w-4 h-4 ${getTrophyColor(quickClashTrophies)}`}
                />
                <span className="text-xs text-slate-400 font-medium">
                  Trophies
                </span>
              </div>
              <p className="text-lg font-bold text-white">
                {quickClashTrophies.toLocaleString()}
              </p>
            </div>

            {/* Dynamic Second Stat */}
            <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/30">
              <div className="flex items-center gap-2 mb-2">
                {winStreak > 0 ? (
                  <>
                    <Zap className="w-4 h-4 text-blue-400" />
                    <span className="text-xs text-slate-400 font-medium">
                      Win Streak
                    </span>
                  </>
                ) : peakTrophies > quickClashTrophies ? (
                  <>
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <span className="text-xs text-slate-400 font-medium">
                      Peak
                    </span>
                  </>
                ) : (
                  <>
                    <Target className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs text-slate-400 font-medium">
                      Level
                    </span>
                  </>
                )}
              </div>
              <p className="text-lg font-bold text-white">
                {winStreak > 0
                  ? winStreak
                  : peakTrophies > quickClashTrophies
                  ? peakTrophies.toLocaleString()
                  : level}
              </p>
            </div>
          </div>

          {/* Performance Highlights */}
          {winStreak >= 3 && (
            <div className="mb-5 p-3 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
              <div className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-1">
                  <Zap className="w-4 h-4 text-blue-400" />
                  <span className="text-blue-300 font-semibold">
                    {winStreak} Win Streak!
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Additional Info */}
          <div className="space-y-3 text-sm text-slate-400 mb-5">
            {createdAt && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Joined {formatJoinDate(createdAt)}</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <div
                className={`w-4 h-4 rounded-full flex items-center justify-center ${
                  isOnline ? 'bg-green-400' : 'bg-slate-500'
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    isOnline ? 'bg-white' : 'bg-slate-300'
                  }`}
                />
              </div>
              <span>{formatLastSeen(lastLogin, isOnline)}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-5 pt-0 space-y-3 border-t border-slate-700/50">
          {getStatusButton()}

          <button
            onClick={handleViewFullProfile}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-300 hover:text-white bg-slate-800/50 hover:bg-slate-700/60 border border-slate-600/30 hover:border-slate-500/50 rounded-lg transition-all duration-200"
          >
            <ExternalLink className="w-4 h-4" />
            {t('View Full Profile')}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )

  // Use createPortal to render the modal directly to document.body
  return createPortal(
    <AnimatePresence mode="wait">{modalContent}</AnimatePresence>,
    document.body,
  )
}

export default MiniProfileView
