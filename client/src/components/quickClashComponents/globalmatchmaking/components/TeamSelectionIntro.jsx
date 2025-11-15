// components/quickClashComponents/globalmatchmaking/components/TeamSelectionIntro.jsx
// REDESIGNED - Engaging matchmaking introduction with gamified elements
import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  Users,
  Shield,
  Trophy,
  Target,
  Zap,
  UserPlus,
  ArrowRight,
  Sparkles,
} from 'lucide-react'

import { QUICK_CLASH_CLASSES } from '../../utils/quickClashColors'
import { Badge } from '@/components/ui/badge'

const MotionDiv = motion.div

/**
 * Feature step component for consistent styling
 */
const FeatureStep = React.memo(({ icon: Icon, label, color, index }) => (
  <MotionDiv
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.1 }}
    className="flex items-start gap-3"
  >
    {/* Number badge */}
    <div
      className={`
        w-8 h-8 rounded-lg
        ${color.bg}
        border ${color.border}
        flex items-center justify-center
        flex-shrink-0
        mt-0.5
      `}
    >
      <span className={`${color.text} text-sm font-bold`}>{index + 1}</span>
    </div>

    {/* Icon and label */}
    <div className="flex-1">
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`w-4 h-4 ${color.text}`} />
        <p
          className={`${QUICK_CLASH_CLASSES.textSecondary} text-sm leading-tight`}
        >
          {label}
        </p>
      </div>
    </div>
  </MotionDiv>
))
FeatureStep.displayName = 'FeatureStep'

/**
 * TeamSelectionIntro - REDESIGNED
 *
 * Key Features:
 * - Eye-catching hero icon
 * - Clear value proposition
 * - Step-by-step process explanation
 * - Gamified visual elements
 * - Encouraging call to action
 */
const TeamSelectionIntro = React.memo(() => {
  const { t } = useTranslation('QuickClash')

  // Memoize steps to avoid recreation
  const steps = useMemo(
    () => [
      {
        icon: UserPlus,
        label: t('We find 3 other players or complete your team to 4 members'),
        color: {
          bg: 'bg-cyan-500/10',
          border: 'border-cyan-400/30',
          text: 'text-cyan-400',
        },
      },
      {
        icon: Target,
        label: t('We match your team with another team of similar skill'),
        color: {
          bg: 'bg-blue-500/10',
          border: 'border-blue-400/30',
          text: 'text-blue-400',
        },
      },
      {
        icon: Zap,
        label: t('Each player battles in one of four different categories'),
        color: {
          bg: 'bg-purple-500/10',
          border: 'border-purple-400/30',
          text: 'text-purple-400',
        },
      },
      {
        icon: Trophy,
        label: t("Win trophies based on your team's performance!"),
        color: {
          bg: 'bg-yellow-500/10',
          border: 'border-yellow-400/30',
          text: 'text-yellow-400',
        },
      },
    ],
    [t],
  )

  return (
    <div className="space-y-6">
      {/* Hero icon animation */}
      <div className="flex justify-center relative">
        <MotionDiv
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: 'spring',
            stiffness: 200,
            damping: 15,
          }}
        >
          <div className="relative">
            {/* Main icon container */}
            <div
              className={`
                w-32 h-32 rounded-full
                ${QUICK_CLASH_CLASSES.glassMedium}
                border-2 border-teal-400/60
                flex items-center justify-center
                shadow-2xl shadow-teal-500/40
              `}
            >
              <Users className="w-16 h-16 text-teal-300" />
            </div>

            {/* Floating decorative elements */}
            {[0, 1, 2].map(i => (
              <MotionDiv
                key={i}
                className="absolute"
                style={{
                  left: `${20 + i * 30}%`,
                  top: `${10 + (i % 2) * 70}%`,
                }}
                animate={{
                  y: [0, -15, 0],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2 + i * 0.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: i * 0.3,
                }}
              >
                <Shield className="w-5 h-5 text-cyan-400/70" />
              </MotionDiv>
            ))}
          </div>
        </MotionDiv>
      </div>

      {/* Title and description */}
      <MotionDiv
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center space-y-2"
      >
        <h2
          className={`
            text-3xl font-extrabold
            bg-gradient-to-r from-teal-300 via-cyan-300 to-blue-300
            bg-clip-text text-transparent
            tracking-tight
          `}
        >
          {t('Join 4v4 Team Battle')}
        </h2>
        <p
          className={`${QUICK_CLASH_CLASSES.textSecondary} text-base px-4 leading-relaxed`}
        >
          {t(
            "Choose to join with your team or as an individual. We'll handle the rest!",
          )}
        </p>
      </MotionDiv>

      {/* Feature badges */}
      <MotionDiv
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-wrap items-center justify-center gap-2"
      >
        <Badge className="bg-teal-500/20 text-teal-300 border border-teal-400/40 px-3 py-1.5">
          <Users className="w-3 h-3 mr-1.5" />
          {t('4v4 Teams')}
        </Badge>
        <Badge className="bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 px-3 py-1.5">
          <Zap className="w-3 h-3 mr-1.5" />
          {t('Quick Match')}
        </Badge>
        <Badge className="bg-yellow-500/20 text-yellow-300 border border-yellow-400/40 px-3 py-1.5">
          <Trophy className="w-3 h-3 mr-1.5" />
          {t('Win Trophies')}
        </Badge>
      </MotionDiv>

      {/* How it works section */}
      <MotionDiv
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className={`
          ${QUICK_CLASH_CLASSES.glassLight}
          rounded-2xl p-5
          border border-teal-400/30
          shadow-xl shadow-teal-500/10
        `}
      >
        <div className="space-y-4">
          {/* Section header */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-teal-400" />
            </div>
            <h3
              className={`${QUICK_CLASH_CLASSES.textPrimary} font-bold text-base`}
            >
              {t('How It Works')}
            </h3>
          </div>

          {/* Steps */}
          <div className="space-y-4 pl-1">
            {steps.map((step, index) => (
              <FeatureStep key={index} {...step} index={index} />
            ))}
          </div>
        </div>
      </MotionDiv>

      {/* Call to action hint */}
      <MotionDiv
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className={`
          ${QUICK_CLASH_CLASSES.glassLight}
          rounded-xl p-4
          border border-cyan-400/30
          bg-gradient-to-r from-cyan-500/5 to-blue-500/5
        `}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3 flex-1">
            <Sparkles className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
            <div>
              <p
                className={`${QUICK_CLASH_CLASSES.textPrimary} text-sm font-bold mb-1`}
              >
                {t('Ready to Start?')}
              </p>
              <p
                className={`${QUICK_CLASH_CLASSES.textMuted} text-xs leading-relaxed`}
              >
                {t('Select how you want to join and let the battle begin!')}
              </p>
            </div>
          </div>
          <MotionDiv
            animate={{
              x: [0, 5, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
            }}
          >
            <ArrowRight className="w-5 h-5 text-cyan-400" />
          </MotionDiv>
        </div>
      </MotionDiv>
    </div>
  )
})

TeamSelectionIntro.displayName = 'TeamSelectionIntro'
export default TeamSelectionIntro
