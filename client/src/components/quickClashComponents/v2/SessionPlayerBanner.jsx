// components/quickClashComponents/v2/SessionPlayerBanner.jsx
// Premium banner - sleek two-row design with coins display

import React, { memo } from 'react'
import { motion } from 'framer-motion'
import { UserPlus, Trophy, Sparkles, Coins } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

// Audio and haptics
import { quizAudioService } from '../../../services/quizAudioService'
import { haptics } from '../../../utils/haptics'

const SessionPlayerBanner = memo(({ player, onCreateAccount }) => {
  const navigate = useNavigate()

  if (!player) return null

  const handleCreateAccount = () => {
    haptics.impact()
    quizAudioService.playButtonClick()
    if (onCreateAccount) {
      onCreateAccount()
    } else {
      navigate('/play', { state: { intent: 'createAccount' } })
    }
  }

  const playerName = player.inGameName || player.name || 'Player'
  const trophies = player.trophies ?? 1000
  const streak = player.streak?.dayStreak || 0
  const coins = player.coins ?? 0

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-3 mb-2 mt-2"
    >
      {/* Entire banner is clickable */}
      <motion.button
        onClick={handleCreateAccount}
        whileTap={{ scale: 0.98 }}
        className="w-full rounded-xl text-left cursor-pointer overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.12) 0%, rgba(236, 72, 153, 0.12) 100%)',
          border: '1px solid rgba(147, 51, 234, 0.25)',
        }}
      >
        {/* Top Row - Avatar, Name, and Signup indicator */}
        <div className="flex items-center gap-2 px-2.5 py-1.5">
          {/* Avatar - smaller */}
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #9333ea 0%, #ec4899 100%)',
              boxShadow: '0 2px 8px rgba(147, 51, 234, 0.3)',
            }}
          >
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>

          {/* Name - gets all flex space */}
          <span className="text-sm font-semibold text-white flex-1 truncate min-w-0">
            {playerName}
          </span>

          {/* Signup indicator - compact */}
          <div
            className="flex items-center gap-1 px-2 py-0.5 rounded-full flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.25) 0%, rgba(236, 72, 153, 0.25) 100%)',
              border: '1px solid rgba(168, 85, 247, 0.4)',
            }}
          >
            <UserPlus className="w-3 h-3 text-purple-300" />
            <span className="text-[10px] font-medium text-purple-300 hidden xs:inline">Sign Up</span>
          </div>
        </div>

        {/* Divider - subtle */}
        <div
          className="h-px mx-2.5"
          style={{ background: 'rgba(255, 255, 255, 0.06)' }}
        />

        {/* Bottom Row - Stats */}
        <div className="flex items-center gap-2 px-2.5 py-1.5">
          {/* Streak - if > 0 */}
          {streak > 0 && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <span className="text-xs">🔥</span>
              <span className="text-xs font-bold text-orange-400">{streak}</span>
            </div>
          )}

          {/* Trophies */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <Trophy className="w-3 h-3 text-yellow-400" />
            <span className="text-xs font-bold text-yellow-400">{trophies}</span>
          </div>

          {/* Coins */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <Coins className="w-3 h-3 text-amber-300" />
            <span className="text-xs font-bold text-amber-300">{coins}</span>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Tap to upgrade hint */}
          <span className="text-[10px] text-white/40 italic">
            Tap to upgrade
          </span>
        </div>
      </motion.button>
    </motion.div>
  )
})

SessionPlayerBanner.displayName = 'SessionPlayerBanner'
export default SessionPlayerBanner
