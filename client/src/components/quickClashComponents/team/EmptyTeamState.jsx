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
        py-8 px-5 rounded-xl border border-dashed border-white/15
        ${QUICK_CLASH_CLASSES.glassMedium}
        transition-all duration-300
        hover:border-cyan-400/25
      `}
    >
      <div className="flex flex-col items-center space-y-4 max-w-sm mx-auto text-center">
        {/* Icon - smaller */}
        <MotionDiv
          variants={itemVariants}
          className={`
            p-3.5 rounded-full
            ${QUICK_CLASH_CLASSES.glassMedium}
            border border-cyan-500/25
          `}
        >
          <Users className="w-7 h-7 text-cyan-400" />
        </MotionDiv>

        {/* Title and Description - compact */}
        <MotionDiv variants={itemVariants} className="space-y-1.5">
          <h3
            className={`
            text-lg font-bold
            ${QUICK_CLASH_CLASSES.textGradientCyan}
          `}
          >
            {t('No Teams Yet')}
          </h3>
          <p
            className={`text-sm ${QUICK_CLASH_CLASSES.textSecondary} leading-relaxed`}
          >
            {t(
              'Create a team to challenge other players or join an existing team with your friends',
            )}
          </p>
        </MotionDiv>

        {/* Buttons - inline, compact */}
        <MotionDiv variants={itemVariants}>
          <div className="flex gap-2 justify-center items-center">
            <button
              onClick={onCreateTeam}
              className={`
                ${QUICK_CLASH_CLASSES.btnPrimary}
                px-4 py-2 text-xs font-semibold rounded-lg
                transition-all duration-200
                flex items-center gap-1.5
                active:scale-95
              `}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              {t('Create Team')}
            </button>

            <button
              onClick={onJoinTeam}
              className={`
                bg-transparent
                border border-blue-500/40 text-blue-300
                hover:bg-blue-500/10 hover:border-blue-400/60
                px-4 py-2 text-xs font-semibold rounded-lg
                transition-all duration-200
                flex items-center gap-1.5
                active:scale-95
              `}
            >
              <UserPlus className="w-3.5 h-3.5" />
              {t('Join Team')}
            </button>
          </div>
        </MotionDiv>

        {/* Help Text - minimal */}
        <MotionDiv variants={itemVariants}>
          <p
            className={`text-xs ${QUICK_CLASH_CLASSES.textMuted} leading-relaxed`}
          >
            {t(
              'Teams let you participate in 4v4 battles with your friends against other teams',
            )}
          </p>
        </MotionDiv>
      </div>
    </MotionDiv>
  )
})

EmptyTeamState.displayName = 'EmptyTeamState'

export default EmptyTeamState
