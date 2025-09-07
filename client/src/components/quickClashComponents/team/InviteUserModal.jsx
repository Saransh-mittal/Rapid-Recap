// components/quickClashComponents/team/InviteUserModal.jsx - FAITHFUL CONVERSION to Tailwind CSS
import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  UserPlus,
  Users,
  Search,
  User,
  Plus,
  Check,
  Trophy,
  Star,
  Target,
  Zap,
  Loader2,
} from 'lucide-react'
import axios from 'axios'
import { debounce } from 'lodash'

// Import centralized color scheme
import { QUICK_CLASH_CLASSES } from '../utils/quickClashColors'

// You'll need to install these components:
// npx shadcn-ui@latest add dialog
// npx shadcn-ui@latest add button
// npx shadcn-ui@latest add input
// npx shadcn-ui@latest add badge
// npx shadcn-ui@latest add avatar
// npx shadcn-ui@latest add label
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Label } from '@/components/ui/label'

const MotionDiv = motion.div

/**
 * Enhanced User Result Card - Converted to Tailwind CSS
 */
const UserResultCard = ({ user, onSelect, isSelected }) => {
  const { t } = useTranslation('QuickClash')

  return (
    <MotionDiv
      className={`
        flex items-center gap-4 p-4 rounded-lg cursor-pointer
        ${
          isSelected
            ? `${QUICK_CLASH_CLASSES.glassMedium} border-2 border-blue-500/60 bg-blue-500/15`
            : `${QUICK_CLASH_CLASSES.glassLight} border border-white/20`
        }
        hover:${
          isSelected
            ? 'bg-blue-500/20 border-blue-400/80'
            : 'bg-white/10 border-white/30'
        }
        transition-all duration-200 relative
      `}
      onClick={() => onSelect(user)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Avatar */}
      <div className="relative">
        <Avatar className="w-12 h-12">
          <AvatarImage src={user.pic} alt={user.name || user.inGameName} />
          <AvatarFallback className="bg-cyan-600 text-white font-bold">
            {(user.name || user.inGameName || '?')[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>

        {user.displayedBadge && (
          <Badge
            className={`
            absolute -bottom-1 -right-1
            ${QUICK_CLASH_CLASSES.badgeWarning}
            text-xs px-1 py-0.5 rounded-full
          `}
          >
            {user.displayedBadge.badgeName || '★'}
          </Badge>
        )}
      </div>

      {/* User Info */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-1">
          <h4
            className={`
            font-bold text-sm truncate mr-2
            ${QUICK_CLASH_CLASSES.textPrimary}
          `}
          >
            {user.name || user.inGameName}
          </h4>
          {isSelected && (
            <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
          )}
        </div>

        {/* Display both name and inGameName if different */}
        {user.name && user.inGameName && user.name !== user.inGameName && (
          <p
            className={`text-sm mb-1 truncate ${QUICK_CLASH_CLASSES.textMuted}`}
          >
            @{user.inGameName}
          </p>
        )}

        {/* User Stats */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* IQ Score */}
          <div className="flex items-center gap-1">
            <Target className="w-3 h-3 text-cyan-400" />
            <span className={`text-xs ${QUICK_CLASH_CLASSES.textMuted}`}>
              IQ: {user.IQ_score || 0}
            </span>
          </div>

          {/* Level */}
          {user.level > 0 && (
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-400" />
              <span className={`text-xs ${QUICK_CLASH_CLASSES.textMuted}`}>
                Lv.{user.level}
              </span>
            </div>
          )}

          {/* RQM Average */}
          {user.RQM_avg > 0 && (
            <div className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-cyan-400" />
              <span className={`text-xs ${QUICK_CLASH_CLASSES.textMuted}`}>
                RQM: {user.RQM_avg}
              </span>
            </div>
          )}

          {/* Rank */}
          {user.rank && (
            <div className="flex items-center gap-1">
              <Trophy className="w-3 h-3 text-orange-400" />
              <span className={`text-xs ${QUICK_CLASH_CLASSES.textMuted}`}>
                #{user.rank}
              </span>
            </div>
          )}
        </div>

        {/* Quiz Submissions */}
        <p className={`text-xs mt-1 ${QUICK_CLASH_CLASSES.textMuted}`}>
          {user.quizSubmissions} {t('quizzes completed')}
        </p>
      </div>

      {/* Add Icon */}
      {!isSelected && <Plus className="w-5 h-5 text-blue-400 flex-shrink-0" />}
    </MotionDiv>
  )
}

/**
 * Enhanced Invite User Modal - Converted to Tailwind CSS with blue-cyan theme
 *
 * Key improvements in this conversion:
 * - Migrated from Chakra UI to Tailwind CSS + Shadcn/ui Dialog
 * - Implemented blue-cyan harmony color scheme
 * - Enhanced search functionality with better visual feedback
 * - Improved user result cards with better information display
 * - Maintained all original functionality including debounced search
 * - Enhanced loading states and error handling
 * - Improved responsive design and accessibility
 */
const InviteUserModal = ({ isOpen, onClose, teamId, teamName, onInvite }) => {
  const { t } = useTranslation('QuickClash')

  // State - EXACTLY as original
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [inviting, setInviting] = useState(false)

  // Modal animation
  const modalVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 25,
      },
    },
    exit: {
      opacity: 0,
      y: 20,
      scale: 0.95,
      transition: {
        duration: 0.2,
      },
    },
  }

  // Search for users - EXACTLY as original
  const searchUsers = useCallback(
    debounce(async query => {
      if (!query || query.length < 2) {
        setSearchResults([])
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const response = await axios.get('/api/user/search', {
          params: { query },
        })

        setSearchResults(response.data || [])
      } catch (error) {
        console.error('Error searching users:', error)
        setSearchResults([])
      } finally {
        setLoading(false)
      }
    }, 500),
    [],
  )

  // Handle search input change - EXACTLY as original
  const handleSearchInputChange = e => {
    const value = e.target.value
    setSearchQuery(value)
    setSelectedUser(null)
    searchUsers(value)
  }

  // Handle selecting a user - EXACTLY as original
  const handleSelectUser = user => {
    setSelectedUser(selectedUser?._id === user._id ? null : user)
  }

  // Handle inviting a user - EXACTLY as original
  const handleInviteUser = async () => {
    if (!selectedUser) return

    setInviting(true)

    try {
      await onInvite(selectedUser._id)
      setSearchQuery('')
      setSelectedUser(null)
      setSearchResults([])
      onClose()
    } catch (error) {
      console.error('Error inviting user:', error)
    } finally {
      setInviting(false)
    }
  }

  // Clear form when modal closes - EXACTLY as original
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('')
      setSelectedUser(null)
      setSearchResults([])
    }
  }, [isOpen])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={`
          max-w-2xl max-h-[90vh] overflow-y-auto
          ${QUICK_CLASH_CLASSES.glassDark}
          border-2 border-blue-600/60
          ${QUICK_CLASH_CLASSES.shadowBlue}
          backdrop-brightness-115
        `}
        asChild
      >
        <MotionDiv
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* Enhanced Header */}
          <DialogHeader className="space-y-3 pb-4">
            <div className="flex items-center gap-3">
              <div
                className={`
                w-10 h-10 rounded-full flex items-center justify-center
                bg-blue-500/20 border border-blue-400
                ${QUICK_CLASH_CLASSES.shadowBlue}
              `}
              >
                <UserPlus className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <DialogTitle
                  className={`
                  text-xl font-bold
                  ${QUICK_CLASH_CLASSES.textPrimary}
                `}
                >
                  {t('Invite to')} {teamName}
                </DialogTitle>
                <DialogDescription
                  className={`
                  ${QUICK_CLASH_CLASSES.textMuted} text-sm
                `}
                >
                  {t('Search for players to invite to your team')}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Form Content */}
          <div className="space-y-5">
            {/* Search Input */}
            <div className="space-y-2">
              <Label
                className={`text-sm font-medium ${QUICK_CLASH_CLASSES.textBright}`}
              >
                {t('Search Players')}
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
                <Input
                  placeholder={t('Enter name, username, or email')}
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  className={`
                    pl-10
                    ${QUICK_CLASH_CLASSES.glassMedium}
                    border-white/30 text-white placeholder:text-white/50
                    focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50
                    hover:border-blue-400/60
                    transition-all duration-200
                  `}
                />
              </div>
              <p className={`text-xs ${QUICK_CLASH_CLASSES.textMuted}`}>
                {t('Search by name, username, or email (min 2 characters)')}
              </p>
            </div>

            {/* Selected User */}
            {selectedUser && (
              <div className="space-y-3">
                <h4
                  className={`text-sm font-medium ${QUICK_CLASH_CLASSES.textBright}`}
                >
                  {t('Selected Player')}
                </h4>
                <UserResultCard
                  user={selectedUser}
                  onSelect={handleSelectUser}
                  isSelected={true}
                />
              </div>
            )}

            {/* Search Results */}
            {searchQuery.length >= 2 && !selectedUser && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4
                    className={`text-sm font-medium ${QUICK_CLASH_CLASSES.textBright}`}
                  >
                    {loading
                      ? t('Searching...')
                      : searchResults.length > 0
                      ? `${searchResults.length} ${t('players found')}`
                      : t('No players found')}
                  </h4>
                  {searchResults.length > 5 && (
                    <p className={`text-xs ${QUICK_CLASH_CLASSES.textMuted}`}>
                      {t('Showing top results')}
                    </p>
                  )}
                </div>

                {loading ? (
                  <div className="flex flex-col items-center justify-center py-8 space-y-3">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
                    <p className={QUICK_CLASH_CLASSES.textMuted}>
                      {t('Searching for players...')}
                    </p>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div
                    className={`
                    space-y-3 max-h-80 overflow-y-auto
                    scrollbar-thin scrollbar-track-white/10 scrollbar-thumb-white/30
                  `}
                  >
                    {searchResults.slice(0, 10).map(user => (
                      <UserResultCard
                        key={user._id}
                        user={user}
                        onSelect={handleSelectUser}
                        isSelected={false}
                      />
                    ))}
                  </div>
                ) : searchQuery.length >= 2 ? (
                  <div
                    className={`
                    p-6 rounded-lg text-center
                    ${QUICK_CLASH_CLASSES.glassLight}
                    border border-white/20
                  `}
                  >
                    <Users
                      className={`w-8 h-8 mx-auto mb-3 ${QUICK_CLASH_CLASSES.textMuted}`}
                    />
                    <p className={`${QUICK_CLASH_CLASSES.textMuted} mb-1`}>
                      {t('No players found')}
                    </p>
                    <p className={`text-sm ${QUICK_CLASH_CLASSES.textMuted}`}>
                      {t('Try a different search term')}
                    </p>
                  </div>
                ) : null}
              </div>
            )}

            {/* Help Text */}
            {searchQuery.length === 0 && (
              <div
                className={`
                p-4 rounded-lg
                ${QUICK_CLASH_CLASSES.glassMedium}
                border border-blue-500/30
                bg-blue-500/10
              `}
              >
                <div className="flex items-start gap-2 mb-2">
                  <UserPlus className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  <h4 className="text-sm text-blue-300 font-medium">
                    {t('How to invite players')}
                  </h4>
                </div>
                <p className={`text-sm ${QUICK_CLASH_CLASSES.textMuted}`}>
                  {t(
                    'Search for players by their name, username, or email address. Select a player and send them an invitation to join your team.',
                  )}
                </p>
              </div>
            )}
          </div>

          {/* Enhanced Footer */}
          <DialogFooter className="gap-3 pt-6 border-t border-white/10 mt-6">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className={`
                ${QUICK_CLASH_CLASSES.glassMedium}
                border border-white/20 text-white/80 hover:text-white
                hover:bg-white/10 hover:border-white/30
                ${QUICK_CLASH_CLASSES.focusRing}
                transition-all duration-200
              `}
            >
              {t('Cancel')}
            </Button>

            <Button
              onClick={handleInviteUser}
              disabled={!selectedUser || inviting}
              className={`
                ${QUICK_CLASH_CLASSES.btnSecondary}
                ${QUICK_CLASH_CLASSES.focusRing}
                ${QUICK_CLASH_CLASSES.transformHover}
                font-bold px-6
                disabled:opacity-50 disabled:cursor-not-allowed
                disabled:hover:transform-none
              `}
            >
              {inviting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  {t('Sending invite...')}
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  {t('Send Invitation')}
                </>
              )}
            </Button>
          </DialogFooter>
        </MotionDiv>
      </DialogContent>
    </Dialog>
  )
}

export default InviteUserModal
