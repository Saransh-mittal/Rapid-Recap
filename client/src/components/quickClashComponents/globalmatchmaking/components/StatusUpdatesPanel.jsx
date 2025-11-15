// components/quickClashComponents/globalmatchmaking/components/StatusUpdatesPanel.jsx
// REDESIGNED - Real-time status feed with engaging animations
import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Activity, Clock } from 'lucide-react'

import { QUICK_CLASH_CLASSES } from '../../utils/quickClashColors'

const MotionDiv = motion.div

/**
 * StatusUpdatesPanel - REDESIGNED
 *
 * Design Philosophy: Keep users informed with real-time updates
 * - Smooth entry/exit animations
 * - Chronological display of updates
 * - Minimal, scannable design
 * - Auto-scroll to latest (optional)
 */
const StatusUpdatesPanel = React.memo(({ statusUpdates }) => {
  const { t } = useTranslation('QuickClash')

  if (!statusUpdates || statusUpdates.length === 0) {
    return null
  }

  // Get last 5 updates (most recent)
  const recentUpdates = statusUpdates.slice(-5).reverse()

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        ${QUICK_CLASH_CLASSES.glassLight}
        rounded-2xl p-4
        border border-white/10
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          <p className={`${QUICK_CLASH_CLASSES.textPrimary} font-bold text-sm`}>
            {t('Recent Updates')}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <MotionDiv
            className="w-2 h-2 rounded-full bg-emerald-400"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [1, 0.5, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          />
          <span className={`${QUICK_CLASH_CLASSES.textMuted} text-xs`}>
            {t('Live')}
          </span>
        </div>
      </div>

      {/* Updates list */}
      <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {recentUpdates.map((update, index) => (
            <MotionDiv
              key={update.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{
                duration: 0.3,
                delay: index * 0.05,
              }}
              className={`
                ${QUICK_CLASH_CLASSES.glassLight}
                rounded-lg p-2.5
                border border-white/5
                hover:border-emerald-400/20
                transition-colors
              `}
            >
              <div className="flex items-start justify-between gap-3">
                {/* Update message */}
                <p
                  className={`
                    ${QUICK_CLASH_CLASSES.textSecondary}
                    text-xs
                    leading-relaxed
                    flex-1
                  `}
                >
                  {update.message}
                </p>

                {/* Timestamp */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Clock className="w-3 h-3 text-emerald-400/70" />
                  <span
                    className={`
                      ${QUICK_CLASH_CLASSES.textMuted}
                      text-xs
                      font-mono
                      min-w-[35px]
                      text-right
                    `}
                  >
                    {update.time}s
                  </span>
                </div>
              </div>
            </MotionDiv>
          ))}
        </AnimatePresence>
      </div>

      {/* Gradient fade at bottom if scrollable */}
      {recentUpdates.length > 4 && (
        <div
          className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none"
          style={{
            background:
              'linear-gradient(to top, rgba(15, 23, 42, 0.4), transparent)',
          }}
        />
      )}

      {/* Custom scrollbar styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(16, 185, 129, 0.4);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(16, 185, 129, 0.6);
        }
      `}</style>
    </MotionDiv>
  )
})

StatusUpdatesPanel.displayName = 'StatusUpdatesPanel'
export default StatusUpdatesPanel
