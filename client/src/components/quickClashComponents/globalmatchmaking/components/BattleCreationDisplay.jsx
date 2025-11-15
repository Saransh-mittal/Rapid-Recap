// components/quickClashComponents/globalmatchmaking/components/BattleCreationDisplay.jsx
// REDESIGNED - Premium loading and error states with engaging visuals
import React from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  Loader2,
  AlertTriangle,
  Users,
  FileText,
  Zap,
  Shield,
  XCircle,
  Info,
} from 'lucide-react'

import { QUICK_CLASH_CLASSES } from '../../utils/quickClashColors'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'

const MotionDiv = motion.div

/**
 * Battle creation steps for loading state
 * Design Philosophy: Show users what's happening behind the scenes
 */
const CREATION_STEPS = [
  {
    icon: Users,
    label: 'Preparing teams',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
  },
  {
    icon: FileText,
    label: 'Generating challenges',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
  },
  {
    icon: Shield,
    label: 'Setting up arena',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
  },
  {
    icon: Zap,
    label: 'Almost ready',
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
  },
]

/**
 * BattleCreationDisplay - REDESIGNED
 *
 * States:
 * - creating: Engaging loading animation with step-by-step progress
 * - failed: Clear error messaging with recovery suggestions
 */
const BattleCreationDisplay = React.memo(({ status, error }) => {
  const { t } = useTranslation('QuickClash')

  // Creating state - show engaging loading animation
  if (status === 'creating') {
    return (
      <div className="space-y-6">
        {/* Main loading animation */}
        <div className="flex justify-center">
          <MotionDiv
            className={`
              w-32 h-32 rounded-full
              ${QUICK_CLASH_CLASSES.glassMedium}
              border-2 border-purple-400/60
              flex items-center justify-center
              shadow-2xl shadow-purple-500/40
              relative
            `}
            animate={{
              boxShadow: [
                '0 0 40px rgba(128, 90, 213, 0.4)',
                '0 0 80px rgba(128, 90, 213, 0.6)',
                '0 0 40px rgba(128, 90, 213, 0.4)',
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            {/* Spinning loader */}
            <MotionDiv
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              <Loader2 className="w-16 h-16 text-purple-400" />
            </MotionDiv>

            {/* Pulsing glow */}
            <MotionDiv
              className="absolute inset-0 rounded-full bg-purple-500/20"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            />
          </MotionDiv>
        </div>

        {/* Title and description */}
        <div className="text-center space-y-2">
          <h3
            className={`${QUICK_CLASH_CLASSES.textPrimary} text-2xl font-bold`}
          >
            {t('Creating Your Battle')}
          </h3>
          <p className={`${QUICK_CLASH_CLASSES.textSecondary} text-sm px-4`}>
            {t('Preparing an epic 4v4 team battle experience')}
          </p>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <Progress value={75} className="h-2 bg-purple-500/20" />
          <p className={`${QUICK_CLASH_CLASSES.textMuted} text-xs text-center`}>
            {t('This will only take a moment...')}
          </p>
        </div>

        {/* Creation steps */}
        <MotionDiv
          className={`
            ${QUICK_CLASH_CLASSES.glassLight}
            rounded-2xl p-4
            border border-purple-400/30
          `}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
              <p
                className={`${QUICK_CLASH_CLASSES.textPrimary} font-bold text-sm`}
              >
                {t('Setting Up Battle')}
              </p>
            </div>

            {CREATION_STEPS.map((step, index) => {
              const IconComponent = step.icon
              return (
                <MotionDiv
                  key={index}
                  className="flex items-center justify-between py-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg ${step.bgColor} flex items-center justify-center`}
                    >
                      <IconComponent className={`w-4 h-4 ${step.color}`} />
                    </div>
                    <p
                      className={`${QUICK_CLASH_CLASSES.textSecondary} text-sm`}
                    >
                      {t(step.label)}
                    </p>
                  </div>

                  {/* Animated spinner */}
                  <MotionDiv
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                  >
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full" />
                  </MotionDiv>
                </MotionDiv>
              )
            })}
          </div>
        </MotionDiv>

        {/* Important notice */}
        <MotionDiv
          className={`
            ${QUICK_CLASH_CLASSES.glassLight}
            rounded-xl p-4
            border border-orange-400/30
            bg-gradient-to-r from-orange-500/5 to-yellow-500/5
          `}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
            <div>
              <p
                className={`${QUICK_CLASH_CLASSES.textPrimary} text-sm font-bold mb-1`}
              >
                {t('Please Wait')}
              </p>
              <p className={`${QUICK_CLASH_CLASSES.textMuted} text-xs`}>
                {t(
                  'Cannot leave during battle creation. Your battle will be ready shortly.',
                )}
              </p>
            </div>
          </div>
        </MotionDiv>
      </div>
    )
  }

  // Failed state - show clear error with recovery options
  if (status === 'failed') {
    return (
      <div className="space-y-6">
        {/* Error icon */}
        <div className="flex justify-center">
          <MotionDiv
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 15,
            }}
            className={`
              w-32 h-32 rounded-full
              ${QUICK_CLASH_CLASSES.glassMedium}
              border-2 border-red-400/60
              flex items-center justify-center
              shadow-2xl shadow-red-500/40
            `}
          >
            <MotionDiv
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            >
              <XCircle className="w-16 h-16 text-red-400" />
            </MotionDiv>
          </MotionDiv>
        </div>

        {/* Error title and message */}
        <div className="text-center space-y-2">
          <h3
            className={`${QUICK_CLASH_CLASSES.textPrimary} text-2xl font-bold text-red-400`}
          >
            {t('Battle Creation Failed')}
          </h3>
          <p className={`${QUICK_CLASH_CLASSES.textSecondary} text-sm px-4`}>
            {error || t('Something went wrong while creating your battle')}
          </p>
        </div>

        {/* Error badge */}
        <div className="flex justify-center">
          <Badge className="bg-red-500/10 text-red-300 border border-red-400/40 px-4 py-2">
            {t('Error')}
          </Badge>
        </div>

        {/* What happened section */}
        <MotionDiv
          className={`
            ${QUICK_CLASH_CLASSES.glassLight}
            rounded-2xl p-5
            border border-red-400/30
            bg-gradient-to-r from-red-500/5 to-orange-500/5
          `}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <p
                className={`${QUICK_CLASH_CLASSES.textPrimary} font-bold text-sm`}
              >
                {t('What Happened?')}
              </p>
            </div>

            <p
              className={`${QUICK_CLASH_CLASSES.textSecondary} text-sm leading-relaxed`}
            >
              {t(
                'We encountered an issue while setting up your battle. This could be due to a temporary connection issue or server maintenance.',
              )}
            </p>

            <div className="pt-2 space-y-2">
              <p
                className={`${QUICK_CLASH_CLASSES.textPrimary} font-semibold text-xs`}
              >
                {t('You can try:')}
              </p>
              <ul className="space-y-1.5 pl-4">
                <li
                  className={`${QUICK_CLASH_CLASSES.textMuted} text-xs flex items-start gap-2`}
                >
                  <span className="text-cyan-400 mt-0.5">•</span>
                  {t('Joining matchmaking again')}
                </li>
                <li
                  className={`${QUICK_CLASH_CLASSES.textMuted} text-xs flex items-start gap-2`}
                >
                  <span className="text-cyan-400 mt-0.5">•</span>
                  {t('Checking your internet connection')}
                </li>
                <li
                  className={`${QUICK_CLASH_CLASSES.textMuted} text-xs flex items-start gap-2`}
                >
                  <span className="text-cyan-400 mt-0.5">•</span>
                  {t('Waiting a moment and trying again')}
                </li>
              </ul>
            </div>
          </div>
        </MotionDiv>

        {/* Encouragement message */}
        <MotionDiv
          className={`
            ${QUICK_CLASH_CLASSES.glassLight}
            rounded-xl p-4
            border border-cyan-400/30
            bg-gradient-to-r from-cyan-500/5 to-blue-500/5
          `}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
            <div>
              <p
                className={`${QUICK_CLASH_CLASSES.textPrimary} text-sm font-bold mb-1`}
              >
                {t("Don't Worry!")}
              </p>
              <p className={`${QUICK_CLASH_CLASSES.textMuted} text-xs`}>
                {t(
                  "Your matchmaking progress is saved. Try again and you'll be matched quickly.",
                )}
              </p>
            </div>
          </div>
        </MotionDiv>
      </div>
    )
  }

  return null
})

BattleCreationDisplay.displayName = 'BattleCreationDisplay'
export default BattleCreationDisplay
