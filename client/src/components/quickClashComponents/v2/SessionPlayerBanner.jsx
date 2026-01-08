// components/quickClashComponents/v2/SessionPlayerBanner.jsx
// Sleek, compact banner for session players - balanced spacing

import React, { memo } from 'react'
import { motion } from 'framer-motion'
import { User, Trophy, Sparkles, ChevronRight } from 'lucide-react'
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

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-3 mb-3 mt-3"
    >
      {/* Sleek compact card */}
      <div
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
        style={{
          background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.18) 0%, rgba(236, 72, 153, 0.18) 100%)',
          border: '1px solid rgba(147, 51, 234, 0.35)',
        }}
      >
        {/* Avatar - Compact with subtle glow */}
        <div className="relative flex-shrink-0">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
        </div>

        {/* Player Info - Takes available space, fully visible */}
        <div className="flex-1 min-w-0 flex items-center gap-3">
          <span className="text-sm font-semibold text-white">
            {playerName}
          </span>
          <div className="flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-xs text-yellow-400 font-semibold">{trophies}</span>
          </div>
        </div>

        {/* CTA Button - Sleek */}
        <motion.button
          onClick={handleCreateAccount}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
          style={{
            background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
            boxShadow: '0 2px 10px rgba(168, 85, 247, 0.35)',
          }}
        >
          <User className="w-3 h-3" />
          <span>Sign Up</span>
          <ChevronRight className="w-3 h-3" />
        </motion.button>
      </div>
    </motion.div>
  )
})

SessionPlayerBanner.displayName = 'SessionPlayerBanner'
export default SessionPlayerBanner
