// components/quickClashComponents/EmptyChallenges1v1State.jsx - FAITHFUL CONVERSION to Tailwind with Blue-Cyan Color Scheme
import React, { memo, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Target, PlusCircle, Trophy } from 'lucide-react'

// Import centralized color scheme
import { QUICK_CLASH_CLASSES } from './utils/quickClashColors'

const MotionDiv = motion.div
const MotionButton = motion.button

const EmptyChallenges1v1State = memo(
  ({ type = 'active', onCreateChallenge, message, variant = 'default' }) => {
    const { t } = useTranslation('QuickClash')

    // Responsive state management
    const [isMobile, setIsMobile] = useState(false)
    const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })

    useEffect(() => {
      const updateSize = () => {
        setIsMobile(window.innerWidth < 768)
        setWindowSize({ width: window.innerWidth, height: window.innerHeight })
      }
      updateSize()
      window.addEventListener('resize', updateSize)
      return () => window.removeEventListener('resize', updateSize)
    }, [])

    const isCompact = variant === 'compact'

    // Responsive values with mobile-first approach
    const responsiveValues = {
      iconSize: isMobile ? (isCompact ? 48 : 64) : isCompact ? 64 : 96,
      padding: isMobile ? (isCompact ? 16 : 24) : isCompact ? 24 : 40,
      maxWidth: isMobile ? (isCompact ? 280 : 300) : isCompact ? 400 : 450,
      headingSize: isMobile
        ? isCompact
          ? 'text-lg'
          : 'text-xl'
        : isCompact
        ? 'text-xl'
        : 'text-2xl',
      textSize: isMobile ? 'text-xs' : isCompact ? 'text-sm' : 'text-base',
      minHeight: isCompact ? 'auto' : '380px',
      particleCount: isCompact ? 2 : 5,
      particleBlur: isCompact ? 'blur-sm' : 'blur-xl',
      particleSizeMultiplier: isCompact ? 0.6 : 1,
      glowSize: isMobile ? (isCompact ? 70 : 90) : isCompact ? 90 : 110,
      spacing: isCompact ? 16 : 28,
    }

    // Animation variants with consistent easing
    const containerVariants = {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: { delay: 0.1, staggerChildren: 0.05 },
      },
    }

    const itemVariants = {
      hidden: { opacity: 0, y: 15 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring', stiffness: 100, damping: 12 },
      },
    }

    const iconVariants = {
      hidden: { scale: 0.5, opacity: 0 },
      visible: {
        scale: 1,
        opacity: 1,
        transition: { type: 'spring', stiffness: 180, delay: 0.2 },
      },
      float: {
        y: [-6, 6, -6],
        transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
      },
    }

    const glowEffectVariants = {
      animate: {
        opacity: [0.2, 0.6, 0.2],
        scale: [0.8, 1, 0.8],
        transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' },
      },
    }

    const buttonVariants = {
      hidden: { opacity: 0, scale: 0.95 },
      visible: {
        opacity: 1,
        scale: 1,
        transition: { type: 'spring', stiffness: 200, damping: 10 },
      },
      hover: {
        scale: 1.05,
        transition: { type: 'spring', stiffness: 300, damping: 10 },
      },
      tap: { scale: 0.95 },
    }

    // Component selection based on type
    const mainIcon = type === 'active' ? Target : Trophy
    const defaultMessage =
      type === 'active'
        ? t(
            'emptyStates.noActive1v1Default',
            "It's a bit quiet here. Time to ignite some rivalries! Create a new 1v1 challenge or accept one from others.",
          )
        : t(
            'emptyStates.noCompleted1v1',
            'Your 1v1 duels and triumphs will be recorded here. Complete a match to see your history.',
          )

    const MainIcon = mainIcon

    return (
      <MotionDiv
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={`enhanced-empty-1v1-state ${isCompact ? 'compact' : ''}`}
        data-testid="empty-1v1-state"
        style={{
          paddingTop: isCompact ? 12 : 32,
          paddingBottom: isCompact ? 12 : 32,
          marginTop: isCompact ? 8 : 0,
          marginBottom: isCompact ? 8 : 0,
        }}
      >
        <MotionDiv
          variants={itemVariants}
          className={`
            ${QUICK_CLASH_CLASSES.glassMedium} backdrop-brightness-110
            rounded-xl border border-cyan-600/30 flex flex-col items-center justify-center
            relative overflow-hidden mx-auto shadow-2xl
          `}
          style={{
            padding: responsiveValues.padding,
            minHeight: responsiveValues.minHeight,
            maxWidth: isMobile ? '95%' : isCompact ? '420px' : '500px',
            background:
              'linear-gradient(to bottom, rgba(6, 182, 212, 0.15), rgba(15, 23, 42, 0.3))',
          }}
        >
          {/* Floating Particles with blue-cyan gradients */}
          {[...Array(responsiveValues.particleCount)].map((_, i) => (
            <MotionDiv
              key={i}
              className={`absolute rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 opacity-10 ${responsiveValues.particleBlur}`}
              animate={{
                x: [
                  Math.random() *
                    200 *
                    responsiveValues.particleSizeMultiplier -
                    100 * responsiveValues.particleSizeMultiplier,
                  Math.random() *
                    -200 *
                    responsiveValues.particleSizeMultiplier +
                    100 * responsiveValues.particleSizeMultiplier,
                ],
                y: [
                  Math.random() *
                    150 *
                    responsiveValues.particleSizeMultiplier -
                    75 * responsiveValues.particleSizeMultiplier,
                  Math.random() *
                    -150 *
                    responsiveValues.particleSizeMultiplier +
                    75 * responsiveValues.particleSizeMultiplier,
                ],
                scale: [
                  Math.random() *
                    0.7 *
                    responsiveValues.particleSizeMultiplier +
                    0.4 * responsiveValues.particleSizeMultiplier,
                  Math.random() *
                    1.1 *
                    responsiveValues.particleSizeMultiplier +
                    0.7 * responsiveValues.particleSizeMultiplier,
                ],
              }}
              transition={{
                duration: Math.random() * 10 + 15,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'easeInOut',
              }}
              style={{
                height: `${
                  (Math.random() * 60 + 30) *
                  responsiveValues.particleSizeMultiplier
                }px`,
                width: `${
                  (Math.random() * 60 + 30) *
                  responsiveValues.particleSizeMultiplier
                }px`,
                zIndex: 0,
              }}
            />
          ))}

          {/* Main Content */}
          <div
            className="flex flex-col items-center relative z-10"
            style={{
              gap: responsiveValues.spacing,
              maxWidth: responsiveValues.maxWidth,
            }}
          >
            {/* Icon with Glow Effect */}
            <MotionDiv className="relative">
              <MotionDiv
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 blur-lg opacity-40"
                variants={glowEffectVariants}
                animate="animate"
                style={{
                  width: responsiveValues.glowSize,
                  height: responsiveValues.glowSize,
                }}
              />
              <MotionDiv
                variants={iconVariants}
                animate={['visible', 'float']}
                className="relative z-20 flex items-center justify-center"
              >
                <MainIcon
                  className="text-cyan-300"
                  style={{
                    width: responsiveValues.iconSize,
                    height: responsiveValues.iconSize,
                  }}
                />
              </MotionDiv>
            </MotionDiv>

            {/* Text Content */}
            <MotionDiv variants={itemVariants} className="text-center">
              <h3
                className={`
                  ${responsiveValues.headingSize} font-bold bg-gradient-to-r from-cyan-300 to-blue-200
                  bg-clip-text text-transparent mb-3
                `}
                style={{ marginBottom: isCompact ? 4 : 12 }}
              >
                {type === 'active'
                  ? t('No Active 1v1 Challenges')
                  : t('No Completed 1v1 Challenges')}
              </h3>
              <p
                className={`${QUICK_CLASH_CLASSES.textSecondary} ${responsiveValues.textSize} leading-relaxed`}
              >
                {message || defaultMessage}
              </p>
            </MotionDiv>

            {/* Create Challenge Button */}
            {variant === 'default' &&
              type === 'active' &&
              onCreateChallenge && (
                <MotionButton
                  variants={buttonVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover="hover"
                  whileTap="tap"
                  onClick={onCreateChallenge}
                  className={`
                    flex items-center gap-2 px-6 py-3
                    ${QUICK_CLASH_CLASSES.btnPrimary}
                    text-lg font-bold rounded-lg shadow-lg
                    hover:shadow-cyan-500/40 hover:shadow-xl
                    focus:outline-none focus:ring-2 focus:ring-cyan-400/50
                    transition-all duration-200
                  `}
                  style={{
                    background:
                      'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)',
                    boxShadow: '0 5px 15px rgba(6, 182, 212, 0.4)',
                  }}
                >
                  <PlusCircle className="w-5 h-5" />
                  {t('Create 1v1 Challenge')}
                </MotionButton>
              )}
          </div>
        </MotionDiv>
      </MotionDiv>
    )
  },
)

EmptyChallenges1v1State.displayName = 'EmptyChallenges1v1State'

export default EmptyChallenges1v1State
