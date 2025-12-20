// components/quickClashComponents/globalmatchmaking/components/BattleCreationDisplay.jsx
// V2 REDESIGN - Minimal, compact battle creation state

import React from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Loader2, Swords, AlertTriangle, RefreshCw } from 'lucide-react'

const MotionDiv = motion.div

/**
 * BattleCreationDisplay - V2 Redesign
 *
 * Design: Compact, minimal, with subtle shimmer effect
 * - Single spinner with glow
 * - Minimal text
 * - Error state with compact recovery options
 */
const BattleCreationDisplay = React.memo(({ status, error }) => {
  const { t } = useTranslation('QuickClash')

  // Creating state
  if (status === 'creating') {
    return (
      <div className="flex flex-col items-center gap-6 py-6">
        {/* Animated Icon */}
        <div className="relative">
          {/* Shimmer ring */}
          <MotionDiv
            className="absolute inset-0 rounded-full"
            style={{
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3), transparent, rgba(139, 92, 246, 0.3))',
              width: 80,
              height: 80,
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          />

          {/* Icon container */}
          <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/40 flex items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.3)]">
            <MotionDiv
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            >
              <Loader2 className="w-10 h-10 text-purple-400" />
            </MotionDiv>
          </div>
        </div>

        {/* Title */}
        <div className="text-center">
          <h3 className="text-white text-xl font-bold mb-1">
            {t('Creating Battle')}
          </h3>
          <p className="text-white/50 text-sm">
            {t('Setting up your 4v4 arena')}
          </p>
        </div>

        {/* Warning */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500/10 border border-orange-500/30">
          <Swords className="w-4 h-4 text-orange-400" />
          <p className="text-orange-300 text-xs font-medium">
            {t('Please wait, battle will be ready shortly')}
          </p>
        </div>
      </div>
    )
  }

  // Failed state
  if (status === 'failed') {
    return (
      <div className="flex flex-col items-center gap-6 py-6">
        {/* Error Icon */}
        <MotionDiv
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500/20 to-red-600/10 border border-red-500/40 flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.3)]"
        >
          <AlertTriangle className="w-10 h-10 text-red-400" />
        </MotionDiv>

        {/* Title */}
        <div className="text-center">
          <h3 className="text-white text-xl font-bold mb-1">
            {t('Creation Failed')}
          </h3>
          <p className="text-white/50 text-sm max-w-[250px]">
            {error || t('Something went wrong. Please try again.')}
          </p>
        </div>

        {/* Recovery hint */}
        <div className="flex items-center gap-2 text-white/40 text-xs">
          <RefreshCw className="w-3 h-3" />
          <span>{t('Click retry below to try again')}</span>
        </div>
      </div>
    )
  }

  return null
})

BattleCreationDisplay.displayName = 'BattleCreationDisplay'
export default BattleCreationDisplay
