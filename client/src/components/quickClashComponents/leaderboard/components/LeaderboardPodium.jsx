import React, { memo } from 'react'
import { motion } from 'framer-motion'
import { Crown, Trophy, Medal } from 'lucide-react'
import { useTranslation } from 'react-i18next'

// Helper for the podium place visuals
const PodiumPlace = memo(({ user, rank, delay, onViewProfile, isCurrentUser }) => {
  if (!user) return null

  // Config based on rank
  const isFirst = rank === 1
  const isSecond = rank === 2
  const isThird = rank === 3

  let scale = 1
  let yOffset = 0
  let color = ''
  let gradient = ''
  let borderColor = ''
  let shadowColor = ''
  let icon = null

  if (isFirst) {
    scale = 1.1
    yOffset = 0
    color = 'text-yellow-400'
    gradient = 'from-yellow-400/20 to-amber-600/5'
    borderColor = 'border-yellow-400/50'
    shadowColor = 'shadow-yellow-400/20'
    icon = <Crown className="w-5 h-5 text-yellow-400 fill-yellow-400/20" />
  } else if (isSecond) {
    scale = 0.9
    yOffset = 15
    color = 'text-gray-300'
    gradient = 'from-gray-300/20 to-slate-500/5'
    borderColor = 'border-gray-300/50'
    shadowColor = 'shadow-gray-300/20'
    icon = <Medal className="w-5 h-5 text-gray-300" />
  } else if (isThird) {
    scale = 0.9
    yOffset = 15
    color = 'text-orange-400'
    gradient = 'from-orange-400/20 to-red-600/5'
    borderColor = 'border-orange-400/50'
    shadowColor = 'shadow-orange-400/20'
    icon = <Medal className="w-5 h-5 text-orange-400" />
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.8 }}
      animate={{ opacity: 1, y: yOffset, scale: scale }}
      transition={{
        delay: delay,
        type: 'spring',
        stiffness: 200,
        damping: 20
      }}
      className={`relative flex flex-col items-center z-${isFirst ? '10' : '0'}`}
      onClick={() => onViewProfile(user._id)}
    >
      {/* Crown/Rank Icon */}
      <div className={`absolute -top-6 ${isFirst ? '-mt-2' : ''} animate-bounce`} style={{ animationDuration: '3s' }}>
        {icon}
      </div>

      {/* Avatar Container */}
      <div
        className={`
          relative w-20 h-20 rounded-full border-2 p-1
          ${isCurrentUser ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-slate-900' : ''}
          ${borderColor} bg-slate-900 cursor-pointer group transition-transform hover:scale-105
        `}
      >
        <div className={`w-full h-full rounded-full overflow-hidden bg-slate-800 ${shadowColor} shadow-lg`}>
          {user.pic ? (
            <img src={user.pic} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${gradient}`}>
              <span className={`text-2xl font-bold ${color}`}>{user.name?.charAt(0)}</span>
            </div>
          )}
        </div>

        {/* Rank Badge */}
        <div className={`
          absolute -bottom-2 left-1/2 -translate-x-1/2
          w-6 h-6 rounded-full flex items-center justify-center
          bg-slate-900 border ${borderColor} ${color} font-bold text-xs
        `}>
          {rank}
        </div>
      </div>

      {/* Name & Trophies */}
      <div className="mt-3 text-center">
        <h3 className={`font-bold text-sm max-w-[100px] truncate ${isCurrentUser ? 'text-purple-300' : 'text-white'}`}>
          {user.inGameName || user.name}
        </h3>
        <div className="flex items-center justify-center gap-1 mt-0.5">
          <Trophy className="w-3 h-3 text-yellow-500" />
          <span className="text-xs font-bold text-yellow-500">{user.trophies}</span>
        </div>
      </div>

      {/* Background Glow */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full ${shadowColor} opacity-20 blur-xl -z-10`} />
    </motion.div>
  )
})
PodiumPlace.displayName = 'PodiumPlace'

const LeaderboardPodium = memo(({ topUsers, currentUserId, onViewProfile }) => {
  const { t } = useTranslation('QuickClash')

  // We expect topUsers to be an array of up to 3 users sorted by rank
  const first = topUsers.find(u => u.rank === 1)
  const second = topUsers.find(u => u.rank === 2)
  const third = topUsers.find(u => u.rank === 3)

  if (!first) return null

  return (
    <div className="relative w-full pt-8 pb-4 px-4 mb-4">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-1/4 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute top-10 right-1/4 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="flex items-end justify-center gap-2 md:gap-8">
        {/* Second Place (Left) */}
        <div className="w-1/3 flex justify-center order-1">
          {second && (
            <PodiumPlace
              user={second}
              rank={2}
              delay={0.2}
              onViewProfile={onViewProfile}
              isCurrentUser={second._id === currentUserId}
            />
          )}
        </div>

        {/* First Place (Center) */}
        <div className="w-1/3 flex justify-center order-2 mb-4">
          <PodiumPlace
            user={first}
            rank={1}
            delay={0}
            onViewProfile={onViewProfile}
            isCurrentUser={first._id === currentUserId}
          />
        </div>

        {/* Third Place (Right) */}
        <div className="w-1/3 flex justify-center order-3">
          {third && (
            <PodiumPlace
              user={third}
              rank={3}
              delay={0.4}
              onViewProfile={onViewProfile}
              isCurrentUser={third._id === currentUserId}
            />
          )}
        </div>
      </div>

      {/* Pedestal Base (Visual only) */}
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mt-4"
      />
    </div>
  )
})

LeaderboardPodium.displayName = 'LeaderboardPodium'

export default LeaderboardPodium
