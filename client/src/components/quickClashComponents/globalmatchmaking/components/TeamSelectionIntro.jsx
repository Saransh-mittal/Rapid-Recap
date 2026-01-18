// components/quickClashComponents/globalmatchmaking/components/TeamSelectionIntro.jsx
// V3 REDESIGN - Compact info strip, not decorative hero

import React from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Users, Trophy, Zap, Swords } from 'lucide-react'

const MotionDiv = motion.div

/**
 * TeamSelectionIntro - V3 Redesign
 *
 * Design: Compact horizontal info strip
 * - No large icons or hero elements
 * - Badges shown inline
 * - Subtle, informative footer to the entry selection
 */
const TeamSelectionIntro = React.memo(() => {
  const { t } = useTranslation('QuickClash')

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="flex flex-col items-center gap-3 py-3"
    >
      {/* Compact Title Row */}
      <div className="flex items-center gap-2">
        <Swords className="w-5 h-5 text-cyan-400" />
        <h3 className="text-base font-bold text-white">
          {t('4v4 Team Battle')}
        </h3>
      </div>

      {/* Subtitle */}
      <p className="text-white/50 text-xs text-center max-w-[280px]">
        {t('Join solo or with your team. We handle the rest!')}
      </p>

      {/* Compact Features Row */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30">
          <Users className="w-3 h-3 text-cyan-400" />
          <span className="text-cyan-300 text-[10px] font-medium">4v4</span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/30">
          <Trophy className="w-3 h-3 text-yellow-400" />
          <span className="text-yellow-300 text-[10px] font-medium">{t('Trophies')}</span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/30">
          <Zap className="w-3 h-3 text-purple-400" />
          <span className="text-purple-300 text-[10px] font-medium">{t('Quick')}</span>
        </div>
      </div>
    </MotionDiv>
  )
})

TeamSelectionIntro.displayName = 'TeamSelectionIntro'
export default TeamSelectionIntro
