// components/quickClashComponents/globalmatchmaking/components/TeamSelectionIntro.jsx
// V2 REDESIGN - Minimal, compact intro display

import React from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Users, Trophy, Zap, ChevronDown } from 'lucide-react'

const MotionDiv = motion.div

/**
 * TeamSelectionIntro - V2 Redesign
 *
 * Design: Minimal, compact, inviting
 * - Simple icon
 * - Clear value proposition
 * - Compact features list
 */
const TeamSelectionIntro = React.memo(() => {
  const { t } = useTranslation('QuickClash')

  return (
    <div className="flex flex-col items-center gap-5 py-4">
      {/* Hero Icon */}
      <MotionDiv
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 border border-cyan-500/40 flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.3)]"
      >
        <Users className="w-8 h-8 text-cyan-400" />
      </MotionDiv>

      {/* Title */}
      <div className="text-center">
        <h2 className="text-xl font-bold text-white mb-1">
          {t('4v4 Team Battle')}
        </h2>
        <p className="text-white/50 text-sm max-w-[250px]">
          {t('Join solo or with your team. We handle the rest!')}
        </p>
      </div>

      {/* Features Row */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30">
          <Users className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-cyan-300 text-xs font-medium">4v4</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/30">
          <Trophy className="w-3.5 h-3.5 text-yellow-400" />
          <span className="text-yellow-300 text-xs font-medium">{t('Trophies')}</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30">
          <Zap className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-purple-300 text-xs font-medium">{t('Quick')}</span>
        </div>
      </div>

      {/* Hint to scroll/continue */}
      <MotionDiv
        className="flex flex-col items-center gap-1 text-white/30"
        animate={{ y: [0, 5, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <span className="text-xs">{t('Select how to join')}</span>
        <ChevronDown className="w-4 h-4" />
      </MotionDiv>
    </div>
  )
})

TeamSelectionIntro.displayName = 'TeamSelectionIntro'
export default TeamSelectionIntro
