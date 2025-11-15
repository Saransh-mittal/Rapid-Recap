// components/quickClashComponents/team/teamBattlePageComponents/TeamBattleHeader.jsx
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  differenceInSeconds,
  differenceInMinutes,
  differenceInHours,
} from 'date-fns'
import { ArrowLeft, Clock } from 'lucide-react'
import { useTranslation } from 'react-i18next'

// Shadcn UI Components
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

/**
 * Professional Team Battle Header - Compact & Efficient
 *
 * Design fixes:
 * - Timer in top-right corner (not center)
 * - Compact layout (no wasted space)
 * - Clean typography hierarchy
 * - Professional color scheme
 */
const TeamBattleHeader = ({ battle, onGoBack }) => {
  const { t } = useTranslation('QuickClash')
  const [timeRemaining, setTimeRemaining] = useState(null)

  useEffect(() => {
    if (!battle?.expiresAt) return

    const updateTimer = () => {
      const now = new Date()
      const expiryDate = new Date(battle.expiresAt)
      const secondsLeft = differenceInSeconds(expiryDate, now)

      if (secondsLeft <= 0) {
        setTimeRemaining({ expired: true })
        return
      }

      const hours = differenceInHours(expiryDate, now)
      const minutes = differenceInMinutes(expiryDate, now) % 60
      const seconds = secondsLeft % 60

      setTimeRemaining({ hours, minutes, seconds, total: secondsLeft })
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [battle?.expiresAt])

  const getTimerColor = () => {
    if (!timeRemaining || timeRemaining.expired) return 'bg-slate-600'
    if (timeRemaining.total < 300) return 'bg-red-500'
    if (timeRemaining.total < 1800) return 'bg-orange-500'
    return 'bg-cyan-500'
  }

  return (
    <div className="px-4 py-3 sm:px-6 sm:py-4">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-4"
      >
        {/* Back button */}
        <Button
          onClick={onGoBack}
          variant="ghost"
          size="sm"
          className="text-white/90 hover:text-white hover:bg-white/10 -ml-2"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          {t('Back')}
        </Button>

        {/* Timer - Top right corner */}
        {battle.expiresAt && timeRemaining && (
          <div
            className={`${getTimerColor()} rounded-lg px-3 py-1.5 flex items-center gap-2`}
          >
            <Clock className="w-3.5 h-3.5 text-white" />
            <span className="text-sm font-bold text-white tabular-nums">
              {timeRemaining.expired ? (
                t('Expired')
              ) : (
                <>
                  {timeRemaining.hours > 0 && `${timeRemaining.hours}:`}
                  {String(timeRemaining.minutes).padStart(2, '0')}:
                  {String(timeRemaining.seconds).padStart(2, '0')}
                </>
              )}
            </span>
          </div>
        )}
      </motion.div>

      {/* Compact title section */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-center"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
          {t('4v4 Team Battle')}
        </h1>
        <p className="text-sm text-white/70">
          {t('Challenge teams in knowledge combat')}
        </p>
        {battle.status && (
          <Badge
            className={`mt-3 ${
              battle.status === 'active'
                ? 'bg-green-500 hover:bg-green-600'
                : battle.status === 'completed'
                ? 'bg-blue-500 hover:bg-blue-600'
                : 'bg-slate-500'
            } text-white border-0 font-semibold`}
          >
            {battle.status.toUpperCase()}
          </Badge>
        )}
      </motion.div>
    </div>
  )
}

export default TeamBattleHeader
