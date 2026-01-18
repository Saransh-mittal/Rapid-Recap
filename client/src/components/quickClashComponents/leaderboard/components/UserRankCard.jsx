import React, { memo } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Trophy, ArrowDown, ChevronRight } from 'lucide-react'

const UserRankCard = memo(({ user, rank, onViewProfile }) => {
  const { t } = useTranslation('QuickClash')

  if (!user || !rank) return null

  // Format rank with suffix (1st, 2nd, 3rd, 4th)
  // Or just use #Hash format for simplicity and localization ease
  const rankDisplay = `#${rank}`

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-20 px-3 pb-3 -mt-2"
    >
      <div
        onClick={() => onViewProfile && onViewProfile(user._id)}
        className="
          relative p-3 rounded-xl
          bg-gradient-to-r from-purple-900/40 via-purple-800/20 to-slate-900/90
          backdrop-blur-md border border-purple-500/30
          shadow-[0_8px_16px_-6px_rgba(168,85,247,0.2)]
          cursor-pointer group overflow-hidden
        "
      >
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />

        {/* Label */}
        <div className="absolute top-0 right-0 px-2.5 py-1 bg-purple-500/20 rounded-bl-xl border-b border-l border-purple-500/30 z-20">
            <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider block leading-none">
                {t('Your Rank')}
            </span>
        </div>

        <div className="flex items-center gap-3 relative z-10 w-full">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-12 h-12 rounded-full p-[2px] bg-gradient-to-br from-purple-400 to-indigo-600">
              <div className="w-full h-full rounded-full overflow-hidden bg-slate-900">
                {user.pic ? (
                  <img src={user.pic} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-800 font-bold text-white">
                    {user.name?.charAt(0)}
                  </div>
                )}
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-slate-900 flex items-center justify-center border border-purple-500/30">
                <Trophy className="w-2.5 h-2.5 text-yellow-500" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
             <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-white truncate text-sm">
                    {user.inGameName || user.name}
                </h3>
             </div>

             <div className="flex items-center gap-3 mt-0.5">
                <div className="flex items-center gap-1.5 bg-white/5 rounded-lg px-2 py-0.5">
                    <Trophy className="w-3 h-3 text-yellow-500" />
                    <span className="font-bold text-yellow-500 text-sm leading-none pt-0.5">{user.trophies}</span>
                </div>
             </div>
          </div>

          <div className="text-right shrink-0 flex flex-col items-end pl-2 pt-2">
             <div className="flex flex-col items-end">
                <div className="flex items-center gap-1 mb-1 mt-1">
                    <span className="text-2xl font-black bg-gradient-to-br from-white via-purple-200 to-purple-400 bg-clip-text text-transparent leading-none filter drop-shadow-sm">
                        {rankDisplay}
                    </span>
                    <span className="text-[10px] text-purple-300/60 font-medium self-end mb-1.5 uppercase tracking-wide">
                        {t('Global')}
                    </span>
                </div>
                <div
                    onClick={(e) => {
                        e.stopPropagation();
                        onViewProfile && onViewProfile(user._id);
                    }}
                    className="flex items-center text-[10px] text-purple-300/50 gap-0.5 group-hover:text-purple-300 transition-colors cursor-pointer"
                >
                    {t('View Profile')}
                    <ChevronRight className="w-3 h-3" />
                </div>
             </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
})

UserRankCard.displayName = 'UserRankCard'
export default UserRankCard
