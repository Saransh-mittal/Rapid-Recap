// src/components/WiseWeb/components/TeamSelectForInviteModal.jsx
import React, { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Users,
  Plus,
  Loader2,
  Trophy,
  AlertCircle,
  Check,
  Sparkles,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { quickClashTeamService } from '../../../services/quickClashServices/quickClashTeamService'
import { useNotifications } from '../../../utils/notifications.jsx'

const TeamSelectForInviteModal = ({ isOpen, onClose, friend }) => {
  const { t } = useTranslation('WiseWeb')
  const { notify } = useNotifications()

  const [teams, setTeams] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [invitingTeamId, setInvitingTeamId] = useState(null)
  const [showCreateTeam, setShowCreateTeam] = useState(false)
  const [newTeamName, setNewTeamName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState(null)

  // Fetch user's teams when modal opens
  useEffect(() => {
    if (isOpen && friend) {
      fetchTeams()
    }
  }, [isOpen, friend])

  const fetchTeams = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await quickClashTeamService.getMyTeams()
      if (response.success) {
        // Filter teams: not full AND friend not already a member
        const eligibleTeams = (response.teams || []).filter(team => {
          const isFull = team.members?.length >= (team.maxMembers || 4)
          const friendInTeam = team.members?.some(
            member =>
              member.user?._id === friend._id ||
              member.user === friend._id
          )
          return !isFull && !friendInTeam
        })
        setTeams(eligibleTeams)
      }
    } catch (err) {
      console.error('Error fetching teams:', err)
      setError(err.response?.data?.message || 'Failed to load teams')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInviteToTeam = async (teamId, teamName) => {
    setInvitingTeamId(teamId)
    try {
      const response = await quickClashTeamService.inviteFriendToTeam(teamId, friend._id)
      if (response.success) {
        notify.success(t('Invitation sent to {{name}}', { name: friend.inGameName || friend.name }))
        onClose()
      }
    } catch (err) {
      console.error('Error inviting friend:', err)
      notify.error(err.response?.data?.message || 'Failed to send invitation')
    } finally {
      setInvitingTeamId(null)
    }
  }

  const handleCreateTeamAndInvite = async () => {
    if (!newTeamName.trim()) {
      notify.error(t('Please enter a team name'))
      return
    }

    setIsCreating(true)
    try {
      // Create the team
      const createResponse = await quickClashTeamService.createTeam(newTeamName.trim())
      if (createResponse.success && createResponse.team) {
        // Invite the friend to the new team
        const inviteResponse = await quickClashTeamService.inviteFriendToTeam(
          createResponse.team._id,
          friend._id
        )
        if (inviteResponse.success) {
          notify.success(t('Team created and invitation sent to {{name}}', { name: friend.inGameName || friend.name }))
          onClose()
        }
      }
    } catch (err) {
      console.error('Error creating team:', err)
      notify.error(err.response?.data?.message || 'Failed to create team')
    } finally {
      setIsCreating(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && showCreateTeam && newTeamName.trim()) {
      handleCreateTeamAndInvite()
    }
  }

  if (!isOpen) return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[1200] flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="relative px-6 py-4 border-b border-slate-700/50 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-white">
                    {t('Invite to Team')}
                  </h3>
                  <p className="text-sm text-slate-400 truncate">
                    {t('Invite {{name}}', { name: friend?.inGameName || friend?.name })}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[400px] overflow-y-auto">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mb-3" />
                  <p className="text-slate-400">{t('Loading teams...')}</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <AlertCircle className="w-10 h-10 text-red-400 mb-3" />
                  <p className="text-slate-300 mb-2">{error}</p>
                  <button
                    onClick={fetchTeams}
                    className="text-sm text-emerald-400 hover:text-emerald-300 underline"
                  >
                    {t('Retry')}
                  </button>
                </div>
              ) : (
                <>
                  {/* Teams List */}
                  {teams.length > 0 && (
                    <div className="mb-6">
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">
                        {t('Your Teams')} ({teams.length})
                      </p>
                      <div className="space-y-2">
                        {teams.map((team) => (
                          <motion.div
                            key={team._id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center justify-between p-3 bg-slate-800/30 hover:bg-slate-800/50 border border-slate-700/40 rounded-xl transition-colors group"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-slate-600/50 rounded-lg flex items-center justify-center">
                                <Trophy className="w-5 h-5 text-purple-400" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-white truncate">
                                  {team.name}
                                </p>
                                <p className="text-xs text-slate-400">
                                  <Users className="inline w-3 h-3 mr-1" />
                                  {team.members?.length || 1}/{team.maxMembers || 4} {t('members')}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleInviteToTeam(team._id, team.name)}
                              disabled={invitingTeamId === team._id}
                              className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 hover:text-emerald-300 text-sm font-medium rounded-lg border border-emerald-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                            >
                              {invitingTeamId === team._id ? (
                                <>
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  {t('Inviting...')}
                                </>
                              ) : (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  {t('Invite')}
                                </>
                              )}
                            </button>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Divider */}
                  {teams.length > 0 && (
                    <div className="relative flex items-center gap-3 mb-6">
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-600/50 to-transparent" />
                      <span className="text-xs text-slate-500 uppercase tracking-wider">{t('or')}</span>
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-600/50 to-transparent" />
                    </div>
                  )}

                  {/* Create New Team Section */}
                  {!showCreateTeam ? (
                    <button
                      onClick={() => setShowCreateTeam(true)}
                      className="w-full p-4 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 hover:from-emerald-500/20 hover:to-cyan-500/20 border border-emerald-500/30 hover:border-emerald-500/50 rounded-xl transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                          <Plus className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-medium text-white">
                            {t('Create New Team')}
                          </p>
                          <p className="text-xs text-slate-400">
                            {t('Create a team and invite {{name}}', { name: friend?.inGameName || friend?.name })}
                          </p>
                        </div>
                        <Sparkles className="w-5 h-5 text-emerald-400 ml-auto" />
                      </div>
                    </button>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="p-4 bg-slate-800/30 border border-slate-700/50 rounded-xl"
                    >
                      <p className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-emerald-400" />
                        {t('Create New Team with {{name}}', { name: friend?.inGameName })}
                      </p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newTeamName}
                          onChange={(e) => setNewTeamName(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder={t('Enter team name...')}
                          maxLength={24}
                          autoFocus
                          className="flex-1 px-3 py-2 bg-slate-900/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50"
                        />
                        <button
                          onClick={handleCreateTeamAndInvite}
                          disabled={isCreating || !newTeamName.trim()}
                          className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white text-sm font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                        >
                          {isCreating ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              {t('Creating...')}
                            </>
                          ) : (
                            <>
                              <Plus className="w-4 h-4" />
                              {t('Create')}
                            </>
                          )}
                        </button>
                      </div>
                      <button
                        onClick={() => {
                          setShowCreateTeam(false)
                          setNewTeamName('')
                        }}
                        className="mt-2 text-xs text-slate-400 hover:text-slate-300"
                      >
                        {t('Cancel')}
                      </button>
                    </motion.div>
                  )}

                  {/* No teams available state */}
                  {teams.length === 0 && !showCreateTeam && !isLoading && (
                    <p className="text-center text-sm text-slate-500 mt-4">
                      {t('No eligible teams found. Create a new team to invite your friend!')}
                    </p>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}

export default TeamSelectForInviteModal
