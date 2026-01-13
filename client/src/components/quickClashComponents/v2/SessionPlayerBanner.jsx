// components/quickClashComponents/v2/SessionPlayerBanner.jsx
// Premium banner - fully clickable, polished stats display

import React, { memo } from 'react'
import { motion } from 'framer-motion'
import { UserPlus, Trophy, Sparkles } from 'lucide-react'
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

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-3 mb-3 mt-3"
    >
      {/* Entire banner is clickable */}
      <motion.button
        onClick={handleCreateAccount}
        whileTap={{ scale: 0.98 }}
        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left cursor-pointer"
        style={{
          background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.18) 0%, rgba(236, 72, 153, 0.18) 100%)',
          border: '1px solid rgba(147, 51, 234, 0.35)',
        }}
      >
        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/20">
          <Sparkles className="w-4 h-4 text-white" />
        </div>

        {/* Name - gets all flex space */}
        <span className="text-sm font-bold text-white flex-1 truncate min-w-0">
          {playerName}
        </span>

        {/* Streak - original pill badge */}
        {streak > 0 && (
          <div
            className="flex items-center gap-1 px-1.5 py-0.5 rounded-full flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.25) 0%, rgba(234, 88, 12, 0.25) 100%)',
              border: '1px solid rgba(249, 115, 22, 0.4)',
            }}
          >
            <span className="text-xs">🔥</span>
            <span className="text-xs font-bold text-orange-400">{streak}</span>
          </div>
        )}

        {/* Trophies - original pill badge */}
        <div
          className="flex items-center gap-1 px-1.5 py-0.5 rounded-full flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, rgba(250, 204, 21, 0.2) 0%, rgba(234, 179, 8, 0.2) 100%)',
            border: '1px solid rgba(250, 204, 21, 0.35)',
          }}
        >
          <Trophy className="w-3 h-3 text-yellow-400" />
          <span className="text-xs font-bold text-yellow-400">{trophies}</span>
        </div>

        {/* Signup indicator - matching pill badge style */}
        <div
          className="flex items-center justify-center px-2 py-1 rounded-full flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.3) 0%, rgba(236, 72, 153, 0.3) 100%)',
            border: '1px solid rgba(168, 85, 247, 0.5)',
          }}
        >
          <UserPlus className="w-3.5 h-3.5 text-purple-300" />
        </div>
      </motion.button>
    </motion.div>
  )
})

SessionPlayerBanner.displayName = 'SessionPlayerBanner'
export default SessionPlayerBanner
