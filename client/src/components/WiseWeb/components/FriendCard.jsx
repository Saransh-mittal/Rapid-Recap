// src/components/WiseWeb/components/FriendCard.jsx - Simple Menu with Portal
import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Trophy,
  MoreVertical,
  UserX,
  Eye,
  Zap,
  Target,
  TrendingUp,
  MessageCircle,
  Users,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import ChatButton from './ChatButton'
import RemoveFriendModal from './RemoveFriendModal'

const FriendCard = ({ friend, onRemove, onStartChat, onInviteToTeam, isOnline }) => {
  const { t } = useTranslation('WiseWeb')
  const navigate = useNavigate()
  const [showMenu, setShowMenu] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 })
  const [showRemoveModal, setShowRemoveModal] = useState(false)
  const menuButtonRef = useRef(null)
  const menuRef = useRef(null)

  const handleRemoveFriendClick = () => {
    setShowRemoveModal(true)
    setShowMenu(false)
  }

  const handleConfirmRemoveFriend = async () => {
    setIsRemoving(true)
    try {
      await onRemove(friend._id)
    } finally {
      setIsRemoving(false)
      setShowRemoveModal(false)
    }
  }

  const handleViewProfile = () => {
    navigate(`/profile/${friend.inGameName}`)
    setShowMenu(false)
  }

  const handleStartChat = () => {
    if (onStartChat) {
      onStartChat(friend)
    }
    setShowMenu(false)
  }

  const handleInviteToTeam = () => {
    if (onInviteToTeam) {
      onInviteToTeam(friend)
    }
    setShowMenu(false)
  }

  const handleMenuToggle = () => {
    if (!showMenu && menuButtonRef.current) {
      const rect = menuButtonRef.current.getBoundingClientRect()
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const scrollLeft =
        window.pageXOffset || document.documentElement.scrollLeft

      setMenuPosition({
        top: rect.bottom + scrollTop + 8,
        left: rect.right + scrollLeft - 160, // 160px is menu width
      })
    }
    setShowMenu(!showMenu)
  }

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = event => {
      // Check if click is outside BOTH the menu button AND the menu itself
      const isOutsideButton = menuButtonRef.current && !menuButtonRef.current.contains(event.target)
      const isOutsideMenu = !menuRef.current || !menuRef.current.contains(event.target)

      if (showMenu && isOutsideButton && isOutsideMenu) {
        setShowMenu(false)
      }
    }

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showMenu])

  const formatLastSeen = lastLogin => {
    if (isOnline) return t('Online')

    const now = new Date()
    const lastSeen = new Date(lastLogin)
    const diffMs = now - lastSeen
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffHours < 1) return t('Now')
    if (diffHours < 24) return t('{{hours}}h', { hours: diffHours })
    if (diffDays < 7) return t('{{days}}d', { days: diffDays })
    return t('Long ago')
  }

  const getTrophyColor = trophies => {
    if (trophies >= 2000) return 'text-purple-400'
    if (trophies >= 1500) return 'text-yellow-400'
    if (trophies >= 1200) return 'text-orange-400'
    return 'text-slate-400'
  }

  const getPerformanceIndicator = () => {
    const { quickClashTrophies, quickClashStats, level } = friend
    const winStreak = quickClashStats?.currentWinStreak || 0
    const peakTrophies = quickClashStats?.peakTrophies || quickClashTrophies

    if (winStreak > 0) {
      return (
        <div className="flex items-center gap-1">
          <Zap className="w-3 h-3 text-blue-400" />
          <span className="text-blue-300 font-medium">{winStreak}W</span>
        </div>
      )
    }

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

    return (
      <div className="flex items-center gap-1">
        <Target className="w-3 h-3 text-indigo-400" />
        <span className="text-indigo-300 font-medium">Lv.{level}</span>
      </div>
    )
  }

  // Simple Dropdown Menu Component (rendered via portal)
  const DropdownMenu = () => {
    if (!showMenu) return null

    return createPortal(
      <AnimatePresence>
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className="fixed z-[9999] w-40 bg-slate-800/95 backdrop-blur-sm border border-slate-600/50 rounded-lg shadow-xl"
          style={{
            top: menuPosition.top,
            left: menuPosition.left,
          }}
        >
          {/* View Profile */}
          <button
            onClick={handleViewProfile}
            className="w-full px-3 py-2.5 text-left text-sm text-slate-300 hover:text-white hover:bg-slate-700/50 flex items-center gap-2 transition-colors duration-150 rounded-t-lg"
          >
            <Eye className="w-4 h-4 text-slate-400" />
            {t('View Profile')}
          </button>

          {/* Start Chat - Only show if onStartChat is provided */}
          {onStartChat && (
            <button
              onClick={handleStartChat}
              className="w-full px-3 py-2.5 text-left text-sm text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 flex items-center gap-2 transition-colors duration-150 border-t border-slate-700/50"
            >
              <MessageCircle className="w-4 h-4" />
              {t('Start Chat')}
            </button>
          )}

          {/* Invite to Team - Only show if onInviteToTeam is provided */}
          {onInviteToTeam && (
            <button
              onClick={handleInviteToTeam}
              className="w-full px-3 py-2.5 text-left text-sm text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 flex items-center gap-2 transition-colors duration-150 border-t border-slate-700/50"
            >
              <Users className="w-4 h-4" />
              {t('Invite to Team')}
            </button>
          )}

          {/* Remove Friend */}
          <button
            onClick={handleRemoveFriendClick}
            disabled={isRemoving}
            className="w-full px-3 py-2.5 text-left text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 border-t border-slate-700/50 rounded-b-lg"
          >
            {isRemoving ? (
              <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
            ) : (
              <UserX className="w-4 h-4" />
            )}
            {isRemoving ? t('Removing...') : t('Remove Friend')}
          </button>
        </motion.div>
      </AnimatePresence>,
      document.body,
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      className="relative group"
    >
      <div className="bg-slate-800/30 hover:bg-slate-800/40 border border-slate-700/40 hover:border-slate-600/50 rounded-xl p-4 transition-all duration-200">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <img
              src={friend.pic}
              alt={friend.name}
              className="w-12 h-12 rounded-xl object-cover border border-slate-600/50"
              onError={e => {
                e.target.src =
                  'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg'
              }}
            />
            {isOnline && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-slate-800 rounded-full"></div>
            )}
          </div>

          {/* Friend Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3
                className="text-sm font-semibold text-white truncate max-w-[120px]"
                title={friend.name}
              >
                {friend.name}
              </h3>
              {isOnline && (
                <span className="px-2 py-0.5 bg-green-400/20 text-green-400 text-[10px] font-medium rounded-full">
                  {t('Online')}
                </span>
              )}
            </div>

            <p
              className="text-xs text-cyan-300 mb-2 truncate"
              title={`@${friend.inGameName}`}
            >
              @{friend.inGameName}
            </p>

            {/* QuickClash Stats */}
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1">
                <Trophy
                  className={`w-3 h-3 ${getTrophyColor(
                    friend.quickClashTrophies,
                  )}`}
                />
                <span className="text-white font-semibold">
                  {friend.quickClashTrophies?.toLocaleString()}
                </span>
              </div>
              {getPerformanceIndicator()}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="relative flex-shrink-0">
            <div className="flex items-center gap-1">
              {/* Chat Button - Always Visible when onStartChat provided */}
              {onStartChat && (
                <ChatButton friend={friend} onClick={onStartChat} size="sm" />
              )}

              {/* Simple More Options Button */}
              <button
                ref={menuButtonRef}
                onClick={handleMenuToggle}
                className={`
                  w-8 h-8 rounded-lg flex items-center justify-center
                  transition-all duration-200
                  ${
                    showMenu
                      ? 'bg-slate-600/60 text-slate-200'
                      : 'bg-slate-700/50 hover:bg-slate-600/50 text-slate-400 hover:text-slate-300'
                  }
                  opacity-70 group-hover:opacity-100
                `}
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Performance Highlight for Elite Friends */}
        {(friend.quickClashStats?.currentWinStreak >= 3) && (
          <div className="mt-3 pt-2 border-t border-slate-700/30">
            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded border border-blue-500/20">
                <Zap className="w-3 h-3" />
                <span className="font-medium">
                  {friend.quickClashStats.currentWinStreak} Win Streak
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Last Seen - Separate Row */}
        <div className="mt-3 pt-2 border-t border-slate-700/30">
          <span className="text-xs text-slate-500">
            {formatLastSeen(friend.lastLogin)}
          </span>
        </div>
      </div>

      {/* Portal-rendered Dropdown Menu */}
      <DropdownMenu />

      <RemoveFriendModal
        isOpen={showRemoveModal}
        onClose={() => setShowRemoveModal(false)}
        onConfirm={handleConfirmRemoveFriend}
        friendName={friend.name}
        isRemoving={isRemoving}
      />
    </motion.div>
  )
}

export default FriendCard
