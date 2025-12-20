// components/quickClashComponents/team/EmptyTeamState.jsx - Optimized for performance
import React, { memo } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Users, UserPlus, PlusCircle } from 'lucide-react'

// Import centralized color scheme
import { QUICK_CLASH_CLASSES } from '../utils/quickClashColors'

// You'll need to install this component:
// npx shadcn-ui@latest add button
import { Button } from '@/components/ui/button'

// Animation variants - defined outside component for stable references
const containerVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15,
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  initial: { opacity: 0, y: 15 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15,
    },
  },
}

const MotionDiv = motion.div

/**
 * Enhanced Empty Team State - Converted to Tailwind CSS with blue-cyan theme
 *
 * Key improvements in this conversion:
 * - Migrated from Chakra UI to Tailwind CSS + Shadcn/ui
 * - Implemented blue-cyan harmony color scheme
 * - Enhanced glassmorphic effects and animations
 * - Maintained all original functionality and interactions
 * - Improved responsive design with better mobile experience
 * - Enhanced visual hierarchy and call-to-action buttons
 */
const EmptyTeamState = memo(({ onCreateTeam, onJoinTeam }) => {
  const { t } = useTranslation('QuickClash')

  return (
    <MotionDiv
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className={`
        py-12 px-6 rounded-2xl border-2 border-dashed border-white/20
        ${QUICK_CLASH_CLASSES.glassMedium}
        ${QUICK_CLASH_CLASSES.shadowSoft}
        backdrop-brightness-110
        transition-all duration-300
        hover:border-cyan-400/30 hover:shadow-xl
      `}
    >
      <div className="flex justify-center">
        <div className="flex flex-col items-center space-y-6 max-w-md text-center">
          {/* Icon */}
          <MotionDiv
            variants={itemVariants}
            className={`
              p-5 rounded-full
              ${QUICK_CLASH_CLASSES.glassMedium}
              border-2 border-cyan-500/30
              ${QUICK_CLASH_CLASSES.shadowCyan}
              backdrop-brightness-115
            `}
          >
            <Users className="w-10 h-10 text-cyan-400" />
          </MotionDiv>

          {/* Title and Description */}
          <MotionDiv variants={itemVariants} className="space-y-3">
            <h3
              className={`
              text-2xl font-bold mb-2
              ${QUICK_CLASH_CLASSES.textGradientCyan}
            `}
            >
              {t('No Teams Yet')}
            </h3>
            <p
              className={`${QUICK_CLASH_CLASSES.textSecondary} leading-relaxed`}
            >
              {t(
                'Create a team to challenge other players or join an existing team with your friends',
              )}
            </p>
          </MotionDiv>

          <MotionDiv variants={itemVariants} className="w-full">
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full">
              <button
                onClick={onCreateTeam}
                className={`
                  ${QUICK_CLASH_CLASSES.btnPrimary}
                  ${QUICK_CLASH_CLASSES.focusRing}
                  px-8 py-3 text-lg font-bold rounded-xl
                  ${QUICK_CLASH_CLASSES.shadowCyan}
                  hover:shadow-cyan-500/60
                  transition-all duration-200
                  flex items-center gap-3
                  w-full sm:w-auto
                  active:scale-95
                `}
              >
                <PlusCircle className="w-5 h-5" />
                {t('Create Team')}
              </button>

              <button
                onClick={onJoinTeam}
                className={`
                  ${QUICK_CLASH_CLASSES.glassMedium}
                  border-2 border-blue-500/60 text-blue-300
                  hover:bg-blue-500/10 hover:border-blue-400/80 hover:text-blue-200
                  ${QUICK_CLASH_CLASSES.focusRing}
                  px-8 py-3 text-lg font-bold rounded-xl
                  ${QUICK_CLASH_CLASSES.shadowBlue}
                  hover:shadow-blue-500/40
                  transition-all duration-200
                  flex items-center gap-3
                  w-full sm:w-auto
                  active:scale-95
                `}
              >
                <UserPlus className="w-5 h-5" />
                {t('Join Team')}
              </button>
            </div>
          </MotionDiv>

          {/* Help Text */}
          <MotionDiv variants={itemVariants}>
            <div
              className={`
              p-4 rounded-xl
              ${QUICK_CLASH_CLASSES.glassLight}
              border border-cyan-500/20
              backdrop-brightness-105
            `}
            >
              <p
                className={`text-sm ${QUICK_CLASH_CLASSES.textMuted} leading-relaxed`}
              >
                {t(
                  'Teams let you participate in 4v4 battles with your friends against other teams',
                )}
              </p>
            </div>
          </MotionDiv>
        </div>
      </div>
    </MotionDiv>
  )
})

EmptyTeamState.displayName = 'EmptyTeamState'

export default EmptyTeamState
