// components/quickClashComponents/globalmatchmaking/components/MatchmakingSearchDisplay.jsx
// V2 REDESIGN - Minimal, enterprise gaming UI

import React from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Globe, Clock, Zap } from 'lucide-react'

const MotionDiv = motion.div

/**
 * MatchmakingSearchDisplay - V2 Redesign
 *
 * Design: Minimal, compact, premium gaming feel
 * - Single animated icon instead of large globe
 * - Compact time display with glow
 * - Latest status update inline
 */
const MatchmakingSearchDisplay = React.memo(
  ({ matchmakingTime, statusUpdates, formatMatchmakingTime }) => {
    const { t } = useTranslation('QuickClash')

    // Get latest status update
    const latestUpdate = statusUpdates?.[statusUpdates.length - 1]?.message || null

    return (
      <div className="flex flex-col items-center gap-6 py-4">
        {/* Animated Search Icon */}
        <div className="relative">
          {/* Outer glow ring */}
          <MotionDiv
            className="absolute inset-0 rounded-full bg-cyan-500/20"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.5, 0.2, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{ width: 80, height: 80 }}
          />

          {/* Icon container */}
          <MotionDiv
            className="relative w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 border border-cyan-500/40 flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.3)]"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          >
            <Globe className="w-10 h-10 text-cyan-400" />
          </MotionDiv>
        </div>

        {/* Title */}
        <div className="text-center">
          <h3 className="text-white text-xl font-bold mb-1">
            {t('Finding Battle')}
            <MotionDiv
              className="inline-flex ml-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <span className="text-cyan-400">...</span>
            </MotionDiv>
          </h3>
          <p className="text-white/50 text-sm">
            {t('Matching you with players of similar skill')}
          </p>
        </div>

        {/* Compact Stats Row */}
        <div className="flex items-center gap-6">
          {/* Time in Queue */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
              <Clock className="w-4 h-4 text-white/60" />
            </div>
            <div>
              <p className="text-white/40 text-[10px] uppercase tracking-wider font-medium">
                {t('Queue')}
              </p>
              <p className="text-white text-lg font-bold tabular-nums">
                {formatMatchmakingTime(matchmakingTime)}
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="w-px h-10 bg-white/10" />

          {/* Status */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
              <Zap className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <p className="text-white/40 text-[10px] uppercase tracking-wider font-medium">
                {t('Status')}
              </p>
              <p className="text-cyan-400 text-sm font-bold">
                {t('Searching')}
              </p>
            </div>
          </div>
        </div>

        {/* Latest Update (if any) */}
        {latestUpdate && (
          <MotionDiv
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-white/40 text-xs text-center px-4 py-2 rounded-lg bg-white/5 border border-white/10"
          >
            {latestUpdate}
          </MotionDiv>
        )}

        {/* Tip */}
        <div className="text-center px-4">
          <p className="text-white/30 text-xs">
            {t('You can close this modal and we\'ll notify you when ready')}
          </p>
        </div>
      </div>
    )
  },
)

MatchmakingSearchDisplay.displayName = 'MatchmakingSearchDisplay'
export default MatchmakingSearchDisplay
