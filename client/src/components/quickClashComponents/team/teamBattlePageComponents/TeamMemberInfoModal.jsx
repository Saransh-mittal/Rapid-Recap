import React, { useEffect } from 'react'
import ReactDOM from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Trophy,
  Target,
  TrendingUp,
  Swords,
  Crown,
  Medal,
  Star,
  Gem,
  Calendar,
  Loader2,
  Users,
  X,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { fetchQuickClashProfile } from '@/redux/quickClashProfileSlice'
import moment from 'moment'
import { cn } from '@/lib/utils'

const TeamMemberInfoModal = ({ userId, isOpen, onClose }) => {
  const { t } = useTranslation('QuickClash')
  const dispatch = useDispatch()

  const profile = useSelector(state => state.quickClashProfile.profiles[userId])
  const loading = useSelector(state => state.quickClashProfile.profileLoading[userId])
  const error = useSelector(state => state.quickClashProfile.profileError[userId])

  useEffect(() => {
    if (isOpen && userId && !profile) {
      dispatch(fetchQuickClashProfile({ userId }))
    }
  }, [isOpen, userId, profile, dispatch])

  const getRankColor = rank => {
    if (rank <= 1) return '#FFD700'
    if (rank <= 3) return '#E5E7EB'
    if (rank <= 10) return '#CD7F32'
    if (rank <= 50) return '#A855F7'
    if (rank <= 100) return '#3B82F6'
    if (rank <= 500) return '#10B981'
    return '#6B7280'
  }

  const getRankIcon = rank => {
    if (rank === 1) return Crown
    if (rank <= 3) return Trophy
    if (rank <= 10) return Medal
    if (rank <= 50) return Star
    if (rank <= 100) return Gem
    return Target
  }

  if (!isOpen) return null

  return ReactDOM.createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-slate-900/95 backdrop-blur-xl rounded-2xl max-w-sm w-full border border-white/10 overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-pink-500 flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white">
                  {loading ? t('Loading...') : profile ? (profile.user.inGameName || profile.user.name) : t('Profile')}
                </h3>
              </div>
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-white/60" />
              </motion.button>
            </div>

            {/* Content */}
            <div className="p-5 max-h-[70vh] overflow-y-auto scrollbar-hide">
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center py-12"
                  >
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                      <Loader2 className="w-8 h-8 text-cyan-400" />
                    </motion.div>
                    <p className="text-white/40 text-sm mt-3">{t('Fetching stats...')}</p>
                  </motion.div>
                ) : error ? (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center py-8"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-3">
                      <Target className="w-7 h-7 text-red-400" />
                    </div>
                    <p className="text-red-300 font-medium">{t('Failed to load profile')}</p>
                    <p className="text-xs text-white/40 mt-1">{error}</p>
                  </motion.div>
                ) : profile ? (
                  <motion.div
                    key="profile"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    {/* Profile Header */}
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-cyan-500 to-pink-500 opacity-50 blur-sm" />
                        <Avatar className="relative w-16 h-16 border-2 border-slate-900">
                          <AvatarImage src={profile.user.picture} />
                          <AvatarFallback className="bg-slate-800 text-white/70 text-lg font-bold">
                            {(profile.user.name || 'U')[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[9px] font-bold border border-slate-900">
                          Lv{profile.user.level || 0}
                        </div>
                      </div>

                      <div className="flex-1 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-xs text-white/40">
                          <Calendar className="w-3 h-3" />
                          <span>{t('Joined')} {moment(profile.user.joinedAt).format('MMM YYYY')}</span>
                        </div>

                        {/* Rank Badge */}
                        <div
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border"
                          style={{
                            borderColor: `${getRankColor(profile.trophies.rank)}40`,
                            backgroundColor: `${getRankColor(profile.trophies.rank)}15`
                          }}
                        >
                          {React.createElement(getRankIcon(profile.trophies.rank), {
                            size: 12,
                            color: getRankColor(profile.trophies.rank)
                          })}
                          <span className="text-xs font-bold" style={{ color: getRankColor(profile.trophies.rank) }}>
                            #{profile.trophies.rank} Global
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Key Stats */}
                    <div className="grid grid-cols-2 gap-2">
                      {/* Trophies */}
                      <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Trophy className="w-3.5 h-3.5 text-amber-400" />
                          <span className="text-[10px] font-semibold text-white/50">{t('Trophies')}</span>
                        </div>
                        <p className="text-xl font-bold text-white">{profile.trophies?.current?.toLocaleString() || 0}</p>
                        <div className="text-[10px] text-white/30 flex items-center gap-1 mt-0.5">
                          <TrendingUp className="w-2.5 h-2.5" />
                          Peak: {profile.trophies?.peak?.toLocaleString() || 0}
                        </div>
                      </div>

                      {/* Win Rate */}
                      <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Target className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-[10px] font-semibold text-white/50">{t('Win Rate')}</span>
                        </div>
                        <p className="text-xl font-bold text-white">{profile.statistics?.overall?.winRate || 0}%</p>
                        <p className="text-[10px] text-white/30">{profile.statistics?.overall?.totalMatches || 0} battles</p>
                      </div>
                    </div>

                    {/* Battle Performance */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Swords className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="text-xs font-bold text-white">{t('Battle Performance')}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {/* 1v1 Stats */}
                        <div className="p-2.5 rounded-xl bg-cyan-500/5 border border-cyan-500/10">
                          <div className="flex items-center gap-1 mb-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                            <span className="text-[10px] font-semibold text-cyan-400">1v1 Duels</span>
                          </div>
                          <div className="flex justify-between items-end">
                            <div>
                              <p className="text-lg font-bold text-white">{profile.statistics?.oneVsOne?.winRate || 0}%</p>
                              <p className="text-[9px] text-white/30">Win Rate</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold text-white/70">{profile.statistics?.oneVsOne?.totalMatches || 0}</p>
                              <p className="text-[9px] text-white/30">Matches</p>
                            </div>
                          </div>
                        </div>

                        {/* Team Stats */}
                        <div className="p-2.5 rounded-xl bg-pink-500/5 border border-pink-500/10">
                          <div className="flex items-center gap-1 mb-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-pink-400" />
                            <span className="text-[10px] font-semibold text-pink-400">Team Battles</span>
                          </div>
                          <div className="flex justify-between items-end">
                            <div>
                              <p className="text-lg font-bold text-white">{profile.statistics?.team?.winRate || 0}%</p>
                              <p className="text-[9px] text-white/30">Win Rate</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold text-white/70">{profile.statistics?.team?.totalMatches || 0}</p>
                              <p className="text-[9px] text-white/30">Matches</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}

export default TeamMemberInfoModal
