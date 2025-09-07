// components/quickClashComponents/team/EmptyBattlesState.jsx - FAITHFUL CONVERSION to Tailwind CSS
import React, { memo } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  Users,
  Swords,
  Trophy,
  ArrowRight,
  PlusCircle,
  Target,
} from 'lucide-react'

// Import centralized color scheme
import { QUICK_CLASH_CLASSES } from '../utils/quickClashColors'

// You'll need to install this component: npx shadcn-ui@latest add button
import { Button } from '@/components/ui/button'

const MotionDiv = motion.div
const MotionButton = motion.button

/**
 * Enhanced empty state with animated elements - Converted to Tailwind CSS
 *
 * Key improvements in this conversion:
 * - Migrated from Chakra UI to Tailwind CSS + Shadcn/ui
 * - Implemented blue-cyan harmony color scheme
 * - Enhanced glassmorphic effects with backdrop filters
 * - Maintained all original animations and interactions
 * - Improved responsive design with Tailwind's utility classes
 */
const EmptyBattlesState = memo(({ type = 'active', onCreateMatch }) => {
  const { t } = useTranslation('QuickClash')

  // Animation variants - EXACTLY as original
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delay: 0.2,
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15,
      },
    },
  }

  const iconVariants = {
    hidden: { scale: 0.5, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 200,
        delay: 0.3,
      },
    },
    float: {
      y: [-10, 10, -10],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  }

  const glowEffectVariants = {
    animate: {
      opacity: [0.3, 0.8, 0.3],
      scale: [0.9, 1.1, 0.9],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  }

  // Determine icon and colors based on type
  const IconComponent = type === 'active' ? Swords : Trophy
  const primaryColor = type === 'active' ? 'cyan' : 'blue'

  return (
    <MotionDiv
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="enhanced-empty-battles-state w-full"
      data-testid="empty-battles-state"
    >
      <MotionDiv
        variants={itemVariants}
        className={`
          relative overflow-hidden
          flex flex-col items-center justify-center
          min-h-[400px] p-6 md:p-10
          ${QUICK_CLASH_CLASSES.glassMedium}
          rounded-2xl border-2 border-cyan-500/60
          ${QUICK_CLASH_CLASSES.shadowCyan}
          backdrop-brightness-110
        `}
      >
        {/* Background animated particles */}
        {[...Array(6)].map((_, i) => (
          <MotionDiv
            key={i}
            className={`
              absolute rounded-full opacity-20
              bg-gradient-to-r from-cyan-500 to-blue-500
              blur-[30px]
            `}
            style={{
              width: `${Math.random() * 100 + 50}px`,
              height: `${Math.random() * 100 + 50}px`,
            }}
            animate={{
              x: [Math.random() * 300, Math.random() * -300],
              y: [Math.random() * 300, Math.random() * -300],
              scale: [Math.random() + 0.5, Math.random() + 1.5],
            }}
            transition={{
              duration: Math.random() * 10 + 15,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut',
            }}
          />
        ))}

        <div className="flex flex-col items-center space-y-8 max-w-[300px] md:max-w-[450px] relative z-10">
          {/* Icon with glow effect */}
          <div className="relative">
            <MotionDiv
              className={`
                absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
                w-[120px] h-[120px] rounded-full
                bg-gradient-to-r from-cyan-500 to-blue-500
                blur-[25px] opacity-50
              `}
              variants={glowEffectVariants}
              animate="animate"
            />

            <MotionDiv
              variants={iconVariants}
              animate={['visible', 'float']}
              className="relative z-20"
            >
              <IconComponent
                className={`
                  w-16 h-16 md:w-24 md:h-24
                  ${primaryColor === 'cyan' ? 'text-cyan-300' : 'text-blue-300'}
                `}
              />
            </MotionDiv>
          </div>

          <MotionDiv variants={itemVariants} className="text-center">
            <h3
              className={`
                text-lg md:text-xl font-bold mb-3
                bg-gradient-to-r from-cyan-300 to-blue-200
                bg-clip-text text-transparent
              `}
            >
              {type === 'active'
                ? t('No Active Team Battles')
                : t('No Completed Team Battles')}
            </h3>

            <p
              className={`
                ${QUICK_CLASH_CLASSES.textSecondary}
                text-sm md:text-base leading-relaxed
              `}
            >
              {type === 'active'
                ? t(
                    'Form your squad of 4 and challenge other teams to intense knowledge battles!',
                  )
                : t(
                    'Your battle history will appear here once you complete your first team match.',
                  )}
            </p>
          </MotionDiv>

          {type === 'active' && (
            <MotionDiv variants={itemVariants}>
              <MotionButton
                onClick={onCreateMatch}
                className={`
                  flex items-center gap-3 px-6 py-3
                  ${QUICK_CLASH_CLASSES.btnPrimary}
                  text-lg font-bold rounded-xl
                  ${QUICK_CLASH_CLASSES.shadowCyan}
                  ${QUICK_CLASH_CLASSES.transformHover}
                  ${QUICK_CLASH_CLASSES.focusRing}
                  hover:shadow-cyan-500/60
                  active:scale-95
                  transition-all duration-200
                `}
                whileHover={{
                  scale: 1.05,
                  boxShadow: '0 0 20px rgba(6, 182, 212, 0.6)',
                }}
                whileTap={{ scale: 0.95 }}
              >
                <Users className="w-5 h-5" />
                <span>{t('Create Your Team')}</span>
                <ArrowRight className="w-5 h-5" />
              </MotionButton>
            </MotionDiv>
          )}
        </div>
      </MotionDiv>
    </MotionDiv>
  )
})

EmptyBattlesState.displayName = 'EmptyBattlesState'

export default EmptyBattlesState
