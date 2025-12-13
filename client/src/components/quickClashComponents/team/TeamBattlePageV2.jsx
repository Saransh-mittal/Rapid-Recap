// TeamBattlePageV2.jsx - Premium + Colorful + Dopamine Design
import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Loader2, Clock, Trophy, Users, Target, Play, CheckCircle2,
  Lock, Sparkles, FileText, X, AlertCircle, Crown, Star, Zap, Gift, Bolt,
  TrendingUp, TrendingDown, Award, ChevronRight, Flame,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { differenceInSeconds, differenceInMinutes, differenceInHours } from 'date-fns'

import useQuickClashTeamBattle from '../../../customHooks/useQuickClashTeamBattle'
import { useSocket } from '../../../customHooks/useSocket'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getCategoryInfo } from './teamBattlePageComponents/categoriesSection/categoryUtils'

// Haptic feedback for gaming interactions
import { haptics } from '../../../utils/haptics'

// Audio feedback for game sounds
import { quizAudioService } from '../../../services/quizAudioService'

const QuizReportModal = React.lazy(() => import('../QuizReportModal'))
import PowerupDonationModal from '../powerups/PowerupDonationModal'
import PowerupSelectionModal from '../powerups/PowerupSelectionModal'
import TeamMemberInfoModal from './teamBattlePageComponents/TeamMemberInfoModal'

// ═══════════════════════════════════════════════════════════════
// GLASS CARD WITH OPTIONAL COLOR ACCENT
// ═══════════════════════════════════════════════════════════════
const GlassCard = ({ children, className = '', accent = null }) => (
  <div className={`relative backdrop-blur-2xl bg-white/[0.04] border border-white/[0.1] rounded-2xl overflow-hidden ${className}`}>
    {accent && <div className={`absolute inset-0 bg-gradient-to-br ${accent} opacity-10 pointer-events-none`} />}
    <div className="relative">{children}</div>
  </div>
)

// ═══════════════════════════════════════════════════════════════
// HEADER WITH LIVE BADGE
// ═══════════════════════════════════════════════════════════════
const Header = ({ battle, onGoBack, t }) => {
  const [time, setTime] = useState(null)

  useEffect(() => {
    if (!battle?.expiresAt) return
    const tick = () => {
      const now = new Date(), exp = new Date(battle.expiresAt)
      const sec = differenceInSeconds(exp, now)
      if (sec <= 0) { setTime({ expired: true }); return }
      setTime({ h: differenceInHours(exp, now), m: differenceInMinutes(exp, now) % 60, s: sec % 60, sec })
    }
    tick()
    const i = setInterval(tick, 1000)
    return () => clearInterval(i)
  }, [battle?.expiresAt])

  const urgent = time?.sec < 300
  const warning = time?.sec < 1800

  return (
    <div className="px-5 pt-5 pb-2">
      <div className="flex items-center justify-between">
        <motion.button
          onClick={onGoBack}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-1.5 text-white/50 hover:text-white transition-colors text-sm px-2 py-1 -ml-2 rounded-lg hover:bg-white/5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">{t('Back')}</span>
        </motion.button>

        {time && !time.expired && (
          <motion.div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${
              urgent ? 'bg-red-500/20 border-red-500/30' : warning ? 'bg-amber-500/20 border-amber-500/30' : 'bg-cyan-500/10 border-cyan-500/20'
            }`}
            animate={urgent ? { scale: [1, 1.02, 1] } : {}}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            <Clock className={`w-3.5 h-3.5 ${urgent ? 'text-red-400' : warning ? 'text-amber-400' : 'text-cyan-400'}`} />
            <span className={`text-sm font-mono font-semibold ${urgent ? 'text-red-400' : warning ? 'text-amber-400' : 'text-cyan-400'}`}>
              {time.h > 0 && `${time.h}:`}{String(time.m).padStart(2, '0')}:{String(time.s).padStart(2, '0')}
            </span>
          </motion.div>
        )}

        {battle.status === 'active' ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30">
            <motion.div
              className="w-2 h-2 rounded-full bg-emerald-400"
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span className="text-xs font-semibold text-emerald-400">LIVE</span>
          </div>
        ) : (
          <div className="px-2.5 py-1 rounded-full bg-white/10 text-white/50 text-xs font-medium">Ended</div>
        )}
      </div>

      {/* Title with emoji */}
      <div className="text-center mt-4 mb-2">
        <h1 className="text-xl font-bold text-white">⚔️ Team Battle</h1>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// COLORFUL SCORE DISPLAY
// ═══════════════════════════════════════════════════════════════
const ScoreDisplay = ({ left, right, leftName, rightName, isUserLeft }) => (
  <div className="px-5 py-4">
    <GlassCard className="p-5" accent="from-cyan-500 via-purple-500 to-pink-500">
      <div className="flex items-center justify-center gap-4 sm:gap-8">
        {/* Left Score */}
        <div className="flex-1 text-right">
          <motion.div
            className={`text-5xl sm:text-6xl font-bold ${isUserLeft ? 'text-cyan-400' : 'text-white/60'}`}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            {left}
          </motion.div>
          <p className={`text-xs mt-1 truncate ${isUserLeft ? 'text-cyan-400/60' : 'text-white/30'}`}>
            {isUserLeft && '👤 '}{leftName}
          </p>
        </div>

        {/* VS Badge */}
        <motion.div
          className="relative"
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/30 to-pink-500/30 border border-white/20 flex items-center justify-center">
            <span className="text-white/80 font-bold text-sm">VS</span>
          </div>
        </motion.div>

        {/* Right Score */}
        <div className="flex-1 text-left">
          <motion.div
            className={`text-5xl sm:text-6xl font-bold ${!isUserLeft ? 'text-pink-400' : 'text-white/60'}`}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
          >
            {right}
          </motion.div>
          <p className={`text-xs mt-1 truncate ${!isUserLeft ? 'text-pink-400/60' : 'text-white/30'}`}>
            {!isUserLeft && '👤 '}{rightName}
          </p>
        </div>
      </div>

      {/* Points comparison */}
      <div className="flex justify-center gap-6 mt-4 text-xs">
        <span className="text-cyan-400/80">⭐ {isUserLeft ? 'Your pts' : 'Opp pts'}</span>
        <span className="text-pink-400/80">⭐ {!isUserLeft ? 'Your pts' : 'Opp pts'}</span>
      </div>
    </GlassCard>
  </div>
)

// ═══════════════════════════════════════════════════════════════
// TEAM MEMBERS - Colorful with status rings
// ═══════════════════════════════════════════════════════════════
const TeamRow = ({ members, userId, isUserTeam, teamScore, onMemberClick, t }) => (
  <div className="px-5 mb-3">
    <GlassCard className="p-4" accent={isUserTeam ? 'from-cyan-500 to-blue-500' : 'from-pink-500 to-red-500'}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isUserTeam ? 'bg-cyan-400' : 'bg-pink-400'}`} />
          <span className={`text-sm font-semibold ${isUserTeam ? 'text-cyan-400' : 'text-pink-400'}`}>
            {isUserTeam ? '🏠 Your Team' : '⚔️ Opponents'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Star className={`w-3.5 h-3.5 ${isUserTeam ? 'text-cyan-400' : 'text-pink-400'}`} />
          <span className={`text-sm font-bold ${isUserTeam ? 'text-cyan-400' : 'text-pink-400'}`}>{teamScore || 0}</span>
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
        {members.map((m, i) => (
          <motion.div
            key={m.user._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ scale: 1.08, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onMemberClick(m.user._id)}
            className="flex-shrink-0 cursor-pointer"
          >
            <div className={`relative p-0.5 rounded-xl ${
              m.user._id === userId ? 'bg-gradient-to-br from-cyan-400 to-blue-500' :
              m.completed ? 'bg-gradient-to-br from-emerald-400 to-green-500' :
              m.participated ? 'bg-gradient-to-br from-amber-400 to-orange-500' :
              'bg-white/20'
            }`}>
              <Avatar className="w-12 h-12 border-2 border-slate-900">
                <AvatarImage src={m.user.pic} />
                <AvatarFallback className="bg-slate-800 text-white/70 text-sm font-bold">
                  {(m.user.name || m.user.inGameName || 'U')[0]}
                </AvatarFallback>
              </Avatar>
              {m.completed && (
                <motion.div
                  className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-slate-900"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring' }}
                >
                  <CheckCircle2 className="w-3 h-3 text-white" />
                </motion.div>
              )}
              {m.participated && !m.completed && (
                <motion.div
                  className="absolute -bottom-1 -right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center border-2 border-slate-900"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <Flame className="w-3 h-3 text-white" />
                </motion.div>
              )}
            </div>
            <p className="text-[10px] text-white/40 text-center mt-1.5 w-12 truncate">
              {m.user._id === userId ? '👤 You' : (m.user.inGameName || m.user.name?.split(' ')[0] || 'Player')}
            </p>
            {m.score > 0 && (
              <p className="text-[10px] text-emerald-400 text-center font-semibold">+{m.score}</p>
            )}
          </motion.div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="mt-3">
        <div className="flex justify-between text-xs text-white/30 mb-1">
          <span>{members.filter(m => m.completed).length}/{members.length} finished</span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className={`h-full ${isUserTeam ? 'bg-gradient-to-r from-cyan-500 to-blue-500' : 'bg-gradient-to-r from-pink-500 to-red-500'}`}
            initial={{ width: 0 }}
            animate={{ width: `${(members.filter(m => m.completed).length / members.length) * 100}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>
    </GlassCard>
  </div>
)

// ═══════════════════════════════════════════════════════════════
// COLORFUL CATEGORY CARD
// ═══════════════════════════════════════════════════════════════
const CategoryCard = ({ challenge, onSelect, onDeselect, onBegin, onReport, loading, t }) => {
  const info = getCategoryInfo(challenge.category)
  const state = challenge.isCompleted ? 'done' : challenge.isSelectedButNotStarted ? 'selected' :
                challenge.isCompletedByTeammate || challenge.isSelectedByTeammate ? 'teammate' :
                challenge.isLocked ? 'locked' : challenge.isAvailable ? 'available' : 'locked'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={state === 'available' ? { scale: 1.02, y: -2 } : {}}
      whileTap={state === 'available' ? { scale: 0.98 } : {}}
      onClick={() => state === 'available' && !challenge.isDisabled && !challenge.isLoading && onSelect(challenge.category)}
      className={`relative overflow-hidden rounded-xl transition-all cursor-pointer ${
        state === 'locked' ? 'opacity-40' : ''
      }`}
      style={{
        background: state === 'done' ? `linear-gradient(135deg, ${info.primaryColor}15, ${info.secondaryColor}15)` :
                   state === 'selected' ? `linear-gradient(135deg, ${info.primaryColor}25, ${info.secondaryColor}25)` :
                   'rgba(255,255,255,0.04)'
      }}
    >
      {/* Border accent */}
      <div className={`absolute inset-0 rounded-xl border-2 ${
        state === 'selected' ? 'border-cyan-400/50' :
        state === 'done' ? 'border-emerald-400/30' :
        state === 'teammate' ? 'border-purple-400/30' :
        'border-white/[0.08]'
      }`} />

      {challenge.isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-900/60 backdrop-blur-sm rounded-xl overflow-hidden"
        >
          {/* Subtle Scanning Effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent shadow-sm"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />

          {/* Pulsing Target - Subtle */}
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="relative z-10"
          >
            <div className="bg-cyan-500/20 p-3 rounded-full ring-1 ring-cyan-500/30">
              <Target className="w-5 h-5 text-cyan-300" />
            </div>
          </motion.div>
        </motion.div>
      )}

      <div className="relative p-3.5">
        <div className="flex items-center gap-3">
          {/* Colorful Icon */}
          <motion.div
            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: `linear-gradient(135deg, ${info.primaryColor}, ${info.secondaryColor})` }}
            whileHover={{ rotate: [0, -5, 5, 0] }}
            transition={{ duration: 0.3 }}
          >
            {React.createElement(info.iconComponent, { className: 'w-5 h-5 text-white' })}
          </motion.div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white capitalize truncate">{challenge.category}</p>
            {challenge.teammateInfo?.name && (
              <p className="text-xs text-purple-400 truncate flex items-center gap-1">
                <Users className="w-3 h-3" />
                {challenge.teammateInfo.inGameName || challenge.teammateInfo.name}
              </p>
            )}
            {(challenge.isCompleted || challenge.isCompletedByTeammate) && (
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs font-bold text-emerald-400">{challenge.userScore ?? '?'}</span>
                <span className="text-xs text-white/30">vs</span>
                <span className="text-xs font-bold text-red-400">{challenge.opponentScore ?? '?'}</span>
                {challenge.userScore > challenge.opponentScore && <span className="text-xs">🎉</span>}
              </div>
            )}
          </div>

          {/* Action */}
          <div className="flex-shrink-0" onClick={e => e.stopPropagation()}>
            {state === 'done' && (
              <motion.button
                onClick={() => onReport(challenge.challenge?._id)}
                disabled={loading}
                whileTap={{ scale: 0.9 }}
                className="p-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 transition-colors"
              >
                <FileText className="w-4 h-4 text-emerald-400" />
              </motion.button>
            )}
            {state === 'selected' && (
              <div className="flex items-center gap-2">
                <motion.button
                  onClick={onDeselect}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 rounded-lg hover:bg-white/10"
                >
                  <X className="w-4 h-4 text-white/40" />
                </motion.button>
                <motion.button
                  onClick={onBegin}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-white text-sm font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-500/25"
                >
                  <Play className="w-4 h-4" /> GO!
                </motion.button>
              </div>
            )}
            {state === 'available' && (
              <ChevronRight className="w-5 h-5 text-white/30" />
            )}
            {state === 'teammate' && (
              <div className="px-2 py-1 rounded-lg bg-purple-500/20">
                <span className="text-xs text-purple-400">Ally</span>
              </div>
            )}
            {state === 'locked' && <Lock className="w-4 h-4 text-white/20" />}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════
// RESULTS - Celebration with colors
// ═══════════════════════════════════════════════════════════════
const ResultsCard = ({ battle, userTeam, t }) => {
  const isWin = battle.winner === userTeam
  const isTie = battle.winner === 'tie'
  const userWins = userTeam === 'teamA' ? battle.teamAWins : battle.teamBWins
  const oppWins = userTeam === 'teamA' ? battle.teamBWins : battle.teamAWins
  const trophyChange = battle.trophyExchange ? Math.round((battle.trophyExchange.finalAmount * (isWin ? 1.25 : isTie ? 0.1 : -0.75)) / 4) : 0

  return (
    <div className="px-5 mb-4">
      <GlassCard
        className="p-6 text-center"
        accent={isWin ? 'from-amber-500 via-yellow-500 to-orange-500' : isTie ? 'from-purple-500 to-pink-500' : 'from-slate-500 to-slate-600'}
      >
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', delay: 0.2 }}
        >
          {isWin ? (
            <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
              <Crown className="w-14 h-14 mx-auto text-amber-400 mb-2" />
            </motion.div>
          ) : isTie ? (
            <Award className="w-14 h-14 mx-auto text-purple-400 mb-2" />
          ) : (
            <Target className="w-14 h-14 mx-auto text-white/40 mb-2" />
          )}
        </motion.div>

        <h2 className={`text-2xl font-bold mb-1 ${isWin ? 'text-amber-400' : isTie ? 'text-purple-400' : 'text-white/50'}`}>
          {isWin ? '🎉 Victory!' : isTie ? '🤝 Draw!' : '💪 Next Time!'}
        </h2>

        <div className="flex justify-center items-baseline gap-4 my-4">
          <span className="text-5xl font-bold text-cyan-400">{userWins}</span>
          <span className="text-xl text-white/30">:</span>
          <span className="text-5xl font-bold text-pink-400/60">{oppWins}</span>
        </div>

        <motion.div
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${
            trophyChange >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
          }`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: 'spring' }}
        >
          <Trophy className="w-4 h-4" />
          {trophyChange >= 0 ? '+' : ''}{trophyChange} trophies
          {trophyChange > 0 && <Sparkles className="w-4 h-4" />}
        </motion.div>
      </GlassCard>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
const TeamBattlePageV2 = React.memo(() => {
  const { t } = useTranslation('QuickClash')
  const navigate = useNavigate()
  const { battleId } = useParams()
  const { user } = useSelector(state => state.auth)
  const { getSocket } = useSocket()

  const [selectedSessionId, setSelectedSessionId] = useState(null)
  const [reportLoading, setReportLoading] = useState(false)
  const [isReportOpen, setIsReportOpen] = useState(false)
  const [isDonationOpen, setIsDonationOpen] = useState(false)
  const [isSelectionOpen, setIsSelectionOpen] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [selectedMember, setSelectedMember] = useState(null)
  const [isMemberOpen, setIsMemberOpen] = useState(false)

  // Local state to bridge the gap between click and API/Socket update
  const [localProcessingCategory, setLocalProcessingCategory] = useState(null)

  const {
    currentBattle, battleDetailsLoading, battleDetailsError, categoryOperationLoading,
    categoryOperationType, categoryOperationError, selectedCategoryForOperation, getBattleDetails,
    selectCategory, deselectCategory, beginChallenge, resetOperationState,
    setupTeamBattleSocketListeners, cleanupSocketListeners, clearOperationError
  } = useQuickClashTeamBattle()

  // Clear operation errors when they occur
  useEffect(() => {
    if (categoryOperationError) {
      clearOperationError()
    }
  }, [currentBattle?._id, categoryOperationError, clearOperationError])

  const userTeam = useMemo(() => {
    if (!currentBattle || !user) return null
    if (currentBattle.teamAMembers.some(m => m.user._id === user._id || m.user === user._id)) return 'teamA'
    if (currentBattle.teamBMembers.some(m => m.user._id === user._id || m.user === user._id)) return 'teamB'
    return null
  }, [currentBattle, user?._id])

  const teams = useMemo(() => {
    if (!currentBattle) return null
    const a = { members: currentBattle.teamAMembers, wins: currentBattle.teamAWins, name: currentBattle.teamA?.name, score: currentBattle.teamATotalScore }
    const b = { members: currentBattle.teamBMembers, wins: currentBattle.teamBWins, name: currentBattle.teamB?.name, score: currentBattle.teamBTotalScore }
    return userTeam === 'teamB' ? { user: b, opp: a, userIsLeft: true } : { user: a, opp: b, userIsLeft: true }
  }, [currentBattle, userTeam])

  const progress = useMemo(() => {
    if (!currentBattle) return { done: 0, total: 0 }
    const total = currentBattle.challenges.length
    const done = currentBattle.challenges.filter(c => c.teamACompleted && c.teamBCompleted).length
    return { done, total }
  }, [currentBattle])

  const userStatus = useMemo(() => {
    if (!currentBattle || !userTeam || !user) return {}
    const members = userTeam === 'teamA' ? currentBattle.teamAMembers : currentBattle.teamBMembers
    const me = members.find(m => m.user._id === user._id)
    if (!me) return {}
    return { participated: me.participated || me.completed, completed: me.completed, exited: me.participated && !me.completed, selected: !!me.category, category: me.category }
  }, [currentBattle, userTeam, user])

  const challenges = useMemo(() => {
    if (!currentBattle || !userTeam || !user) return []
    return currentBattle.challenges.map(ch => {
      const field = userTeam === 'teamA' ? 'teamAPlayer' : 'teamBPlayer'
      const members = userTeam === 'teamA' ? currentBattle.teamAMembers : currentBattle.teamBMembers
      const me = members.find(m => m.user._id === user._id)
      const assigned = ch[field] !== null, userAssigned = ch[field] === user._id
      const selectedByUser = me?.category === ch.category, userCompleted = userAssigned && me?.completed
      const teammate = members.find(m => m.user._id !== user._id && m.category === ch.category)
      const selectedByTeammate = !!teammate && !assigned
      const completedByTeammate = !!members.find(m => m.user._id !== user._id && m.category === ch.category && m.completed) && !userAssigned && !userCompleted
      const available = !selectedByUser && !selectedByTeammate && !assigned && !userStatus.participated && !userStatus.exited && !userStatus.selected && !completedByTeammate
      const locked = (userStatus.selected && ch.category !== userStatus.category) || (userStatus.exited)

      // Combined loading state: Redux OR Local
      const loading = (categoryOperationLoading && (selectedCategoryForOperation === ch.category || selectedByUser)) || localProcessingCategory === ch.category

      // Combined disabled state
      const disabled = categoryOperationLoading || localProcessingCategory !== null

      return {
        ...ch, isAvailable: available, isCompleted: userCompleted, isSelectedButNotStarted: selectedByUser && !assigned && !(userAssigned && me?.participated),
        isSelectedByTeammate: selectedByTeammate, isCompletedByTeammate: completedByTeammate, isLocked: locked, isLoading: loading,
        isDisabled: disabled, userScore: userTeam === 'teamA' ? ch.teamAScore : ch.teamBScore,
        opponentScore: userTeam === 'teamA' ? ch.teamBScore : ch.teamAScore, teammateInfo: teammate ? { name: teammate.user.name, inGameName: teammate.user.inGameName } : null,
      }
    })
  }, [currentBattle, userTeam, user, categoryOperationLoading, selectedCategoryForOperation, userStatus, localProcessingCategory])

  useEffect(() => { const s = getSocket(); if (s) s.emit('quickClash:viewTeamBattles') }, [getSocket])
  useEffect(() => { if (battleId) getBattleDetails(battleId) }, [battleId, getBattleDetails])
  useEffect(() => { setupTeamBattleSocketListeners(); return cleanupSocketListeners }, [setupTeamBattleSocketListeners, cleanupSocketListeners])
  useEffect(() => { return () => resetOperationState() }, [resetOperationState])

  const goBack = useCallback(() => {
    haptics.light()
    navigate('/quickclash#active/4v4')
  }, [navigate])

  const selectCat = useCallback(async (c) => {
    if (!currentBattle || localProcessingCategory) return

    // Haptic feedback on category selection
    haptics.selection()
    quizAudioService.playSubmit() // Audio for category selection

    // Set local loading immediately to block interactions
    setLocalProcessingCategory(c)

    try {
      await selectCategory(currentBattle._id, c)
    } catch (error) {
      console.error('Error selecting category:', error)
      // On error, we must clear local state so user can try again
      setLocalProcessingCategory(null)
    }
    // Note: We do NOT clear local state on success here immediately because
    // we want the loading animation to persist until the socket update reflects
    // the change (which updates currentBattle and removes 'isAvailable' status).
    // The component re-render with new data will handle the transition.
    // However, as a failsafe, we can clear it after a timeout or rely on useEffect.
    // Actually, safer to clear it in finally to avoid stuck state if socket fails?
    // But if we clear it, the animation stops before the data update.
    // Compromise: Clear it in a useEffect when currentBattle updates OR simple timeout.
    // Let's go with clearing in finally for safety, the Redux loading state *should* have kicked in by then.
    // Or better: keep it true until categoryOperationLoading becomes true?
    // Simple approach: Clear on finally. The Redux state usually updates *before* the promise resolves if dispatch is awaited.
    // If not, there might be a flicker. Let's try clearing in finally.
    setLocalProcessingCategory(null)
  }, [currentBattle, selectCategory, localProcessingCategory])

  const deselectCat = useCallback(async () => {
    if (!currentBattle || localProcessingCategory || !userStatus.category) return

    setLocalProcessingCategory(userStatus.category)

    try {
      await deselectCategory(currentBattle._id)
    } catch (error) {
      console.error('Error deselecting category:', error)
      setLocalProcessingCategory(null)
    }
    setLocalProcessingCategory(null)
  }, [currentBattle, deselectCategory, localProcessingCategory, userStatus.category])
  const startChallenge = useCallback(() => {
    haptics.impact() // Haptic for starting a challenge
    quizAudioService.playQuizStart() // Audio for starting battle
    currentBattle && beginChallenge(currentBattle._id)
  }, [currentBattle, beginChallenge])
  const viewReport = useCallback(async id => {
    if (!id) return
    setReportLoading(true)
    try { const r = await fetch(`/api/quickClash/challenge/${id}/sessions?userId=${user._id}`); const d = await r.json(); if (d?.sessionId) { setSelectedSessionId(d.sessionId); setIsReportOpen(true) } }
    finally { setReportLoading(false) }
  }, [user])

  // Loading
  if (battleDetailsLoading && !currentBattle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
            <Loader2 className="w-10 h-10 text-cyan-400 mx-auto" />
          </motion.div>
          <p className="text-white/40 text-sm mt-3">⚔️ {t('Entering arena...')}</p>
        </div>
      </div>
    )
  }

  // Error
  if ((battleDetailsError || !currentBattle) && !battleDetailsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-500/20 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <p className="text-white/50 mb-4">{battleDetailsError || t('Battle not found')}</p>
          <Button onClick={goBack} className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
            <ArrowLeft className="w-4 h-4 mr-2" />{t('Back')}
          </Button>
        </div>
      </div>
    )
  }

  const teamId = userTeam === 'teamA' ? currentBattle.teamA?._id : currentBattle.teamB?._id
  const loadout = teams?.user.members.find(m => m.user._id === user?._id)?.loadout || { housingUsed: 0 }

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <Header battle={currentBattle} onGoBack={goBack} t={t} />

      <ScoreDisplay
        left={teams?.user.wins || 0}
        right={teams?.opp.wins || 0}
        leftName={teams?.user.name || 'Your Team'}
        rightName={teams?.opp.name || 'Opponents'}
        isUserLeft={true}
      />

      <TeamRow members={teams?.user.members || []} userId={user?._id} isUserTeam={true} teamScore={teams?.user.score}
        onMemberClick={id => { setSelectedMember(id); setIsMemberOpen(true) }} t={t} />
      <TeamRow members={teams?.opp.members || []} userId={user?._id} isUserTeam={false} teamScore={teams?.opp.score}
        onMemberClick={id => { setSelectedMember(id); setIsMemberOpen(true) }} t={t} />

      {/* Powerups */}
      {currentBattle.status === 'active' && userTeam && (
        <div className="px-5 mb-4">
          <GlassCard className="p-3" accent="from-purple-500 to-indigo-500">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-500/30 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-white">{t('Powerups')}</span>
                  <span className="text-xs text-white/40 ml-2">{loadout.housingUsed}/30</span>
                </div>
              </div>
              <div className="flex gap-2">
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => setIsDonationOpen(true)} className="p-2.5 rounded-xl bg-white/10 hover:bg-white/15 transition-colors">
                  <Gift className="w-4 h-4 text-purple-300" />
                </motion.button>
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => setIsSelectionOpen(true)} className="px-3 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-white text-sm font-semibold flex items-center gap-1.5">
                  <Bolt className="w-4 h-4" /> Equip
                </motion.button>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Categories */}
      {currentBattle.status === 'active' && userTeam && (
        <div className="px-5 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-semibold text-white">{t('Pick a Category')}</span>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/10">
              <span className="text-xs font-bold text-emerald-400">{progress.done}</span>
              <span className="text-xs text-white/30">/</span>
              <span className="text-xs text-white/50">{progress.total}</span>
            </div>
          </div>
          <div className="space-y-2">
            {challenges.map((ch, i) => (
              <CategoryCard key={`${ch.category}-${i}`} challenge={ch} onSelect={selectCat} onDeselect={deselectCat}
                onBegin={() => setShowConfirm(true)} onReport={viewReport} loading={reportLoading} t={t} />
            ))}
          </div>
          {userStatus.selected && !userStatus.participated && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 p-3 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30"
            >
              <p className="text-sm text-cyan-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Ready for <strong>{userStatus.category}</strong>! Tap GO to start 🚀
              </p>
            </motion.div>
          )}
        </div>
      )}

      {/* Results */}
      {currentBattle.status === 'completed' && <ResultsCard battle={currentBattle} userTeam={userTeam} t={t} />}

      {/* Back Button */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed bottom-4 left-4 right-4 md:static md:px-5 md:pt-4 z-20"
      >
        <Button onClick={goBack} className="w-full md:w-auto bg-white/10 hover:bg-white/15 backdrop-blur-xl border border-white/10 text-white">
          <ArrowLeft className="w-4 h-4 mr-2" />{t('Back to Battles')}
        </Button>
      </motion.div>

      {/* Confirm Modal */}
      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowConfirm(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900/95 backdrop-blur-xl rounded-2xl p-6 max-w-sm w-full border border-white/10" onClick={e => e.stopPropagation()}>
              <div className="text-center mb-5">
                <motion.div
                  className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Flame className="w-8 h-8 text-amber-400" />
                </motion.div>
                <h3 className="text-xl font-bold text-white mb-1">Ready to Battle? ⚔️</h3>
                <p className="text-sm text-white/50">{t('No going back once you start!')}</p>
              </div>
              <div className="flex gap-3">
                <Button onClick={() => setShowConfirm(false)} variant="outline" className="flex-1 border-white/20 text-white/70">{t('Wait')}</Button>
                <motion.button
                  onClick={() => { setShowConfirm(false); startChallenge() }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25"
                >
                  <Play className="w-4 h-4" /> Let's Go!
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {isReportOpen && selectedSessionId && (
          <React.Suspense fallback={<div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"><Loader2 className="w-6 h-6 text-cyan-400 animate-spin" /></div>}>
            <QuizReportModal isOpen={isReportOpen} onClose={() => setIsReportOpen(false)} sessionId={selectedSessionId} />
          </React.Suspense>
        )}
      </AnimatePresence>
      {currentBattle && userTeam && teamId && (
        <>
          <PowerupDonationModal isOpen={isDonationOpen} onClose={() => setIsDonationOpen(false)} battleId={currentBattle._id} teamId={teamId} />
          <PowerupSelectionModal isOpen={isSelectionOpen} onClose={() => setIsSelectionOpen(false)} battleId={currentBattle._id} teamId={teamId} />
        </>
      )}
      <TeamMemberInfoModal userId={selectedMember} isOpen={isMemberOpen} onClose={() => { setIsMemberOpen(false); setSelectedMember(null) }} />
    </div>
  )
})

TeamBattlePageV2.displayName = 'TeamBattlePageV2'
export default TeamBattlePageV2
