// components/quickClashComponents/ui/EnhancedPotentialTrophyDisplay.jsx - FAITHFUL CONVERSION with Consistent Color Scheme
import React, { useEffect } from 'react'
import { motion, useAnimation } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Trophy, TrendingUp } from 'lucide-react'

// Import centralized color scheme
import { QUICK_CLASH_CLASSES } from '../utils/quickClashColors'

// You'll need to install this component: npx shadcn-ui@latest add tooltip
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

const MotionDiv = motion.div

/**
 * Enhanced component to display potential trophy gains with sophisticated animations
 *
 * Key improvements:
 * - Updated to blue-cyan harmony color scheme
 * - Enhanced glassmorphic styling with better visual depth
 * - Improved animations with spring physics
 * - Better responsive design and sizing options
 * - Maintained all original functionality and animation logic
 *
 * @param {Number} potentialGain - Number of trophies that can be gained
 * @param {Boolean} showWinLoss - Whether to show win/loss indicators
 * @param {String} size - Size variant (sm, md, lg)
 * @param {Boolean} compact - Whether to use compact layout
 */
const EnhancedPotentialTrophyDisplay = ({
  potentialGain = 0,
  showWinLoss = true,
  size = 'md',
  compact = false,
}) => {
  const { t } = useTranslation('QuickClash')
  const controls = useAnimation()

  // If no potential gain, don't render anything
  if (potentialGain === 0) return null

  // Calculate sizes based on prop
  const sizeConfig = {
    sm: {
      iconSize: 'w-3 h-3',
      fontSize: 'text-xs',
      padding: 'p-2',
      spacing: 'space-x-1',
    },
    md: {
      iconSize: 'w-4 h-4',
      fontSize: 'text-sm',
      padding: 'p-2.5',
      spacing: 'space-x-1.5',
    },
    lg: {
      iconSize: 'w-5 h-5',
      fontSize: 'text-base',
      padding: 'p-3',
      spacing: 'space-x-2',
    },
  }

  const config = sizeConfig[size] || sizeConfig.md

  useEffect(() => {
    // Run initial animation with spring physics
    controls.start({
      scale: [1, 1.1, 1],
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 15,
        duration: 0.6,
      },
    })
  }, [controls])

  // Compact version for inline display
  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <MotionDiv
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{
                opacity: 1,
                scale: 1,
                transition: {
                  type: 'spring',
                  stiffness: 300,
                  damping: 15,
                },
              }}
              whileHover={{
                scale: 1.05,
                transition: { duration: 0.2 },
              }}
              className={`
                flex items-center ${config.spacing}
                bg-yellow-400/15
                hover:bg-yellow-400/25
                ${config.padding}
                rounded-full
                border border-yellow-400/40
                hover:border-yellow-400/60
                ${QUICK_CLASH_CLASSES.shadowSoft}
                hover:shadow-yellow-400/20
                cursor-help
                transition-all duration-200
                backdrop-blur-sm
              `}
            >
              <MotionDiv
                animate={{
                  rotate: [0, 5, 0, -5, 0],
                  transition: {
                    duration: 3,
                    repeat: Infinity,
                    repeatType: 'reverse',
                    ease: 'easeInOut',
                    repeatDelay: 2,
                  },
                }}
              >
                <Trophy className={`${config.iconSize} text-yellow-400`} />
              </MotionDiv>
              <MotionDiv animate={controls}>
                <span
                  className={`
                  text-green-400
                  font-bold
                  ${config.fontSize}
                  drop-shadow-sm
                `}
                >
                  +{potentialGain}
                </span>
              </MotionDiv>
            </MotionDiv>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t('Potential trophy gain')}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  // Full version for standalone display
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <MotionDiv
            initial={{ opacity: 0, y: 5 }}
            animate={{
              opacity: 1,
              y: 0,
              transition: {
                type: 'spring',
                stiffness: 300,
                damping: 20,
              },
            }}
          >
            <div
              className={`
              flex flex-col items-center
              ${QUICK_CLASH_CLASSES.glassMedium}
              rounded-2xl
              ${config.padding}
              border border-yellow-400/40
              ${QUICK_CLASH_CLASSES.shadowSoft}
              hover:shadow-yellow-400/20
              relative
              overflow-hidden
              transition-all duration-300
              hover:border-yellow-400/60
              backdrop-brightness-110
              cursor-help
            `}
            >
              {/* Top accent line */}
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-yellow-500 via-orange-400 to-yellow-500 rounded-t-2xl" />

              <span
                className={`
                ${size === 'sm' ? 'text-xs' : 'text-sm'}
                ${QUICK_CLASH_CLASSES.textSecondary}
                font-medium
                mb-2
                tracking-wide
                uppercase
              `}
              >
                {t('Trophy Stake')}
              </span>

              {/* Potential gain display */}
              {showWinLoss && (
                <div className={`flex items-center ${config.spacing} mb-1`}>
                  <MotionDiv
                    animate={{
                      y: [0, -2, 0],
                      transition: {
                        duration: 2,
                        repeat: Infinity,
                        repeatType: 'reverse',
                        ease: 'easeInOut',
                        repeatDelay: 1,
                      },
                    }}
                  >
                    <TrendingUp
                      className={`${config.iconSize} text-green-400`}
                    />
                  </MotionDiv>
                  <div
                    className={`
                    flex items-center ${config.spacing}
                    bg-green-500/10
                    hover:bg-green-500/15
                    px-2 py-1
                    rounded-full
                    border border-green-400/30
                    transition-all duration-200
                  `}
                  >
                    <MotionDiv
                      animate={{
                        scale: [1, 1.15, 1],
                        transition: {
                          duration: 2,
                          repeat: Infinity,
                          repeatType: 'reverse',
                          ease: 'easeInOut',
                          repeatDelay: 2,
                        },
                      }}
                    >
                      <Trophy
                        className={`
                        ${config.iconSize}
                        text-yellow-400
                        drop-shadow-sm
                      `}
                      />
                    </MotionDiv>
                    <MotionDiv animate={controls}>
                      <span
                        className={`
                        text-green-400
                        font-bold
                        ${config.fontSize}
                        drop-shadow-sm
                      `}
                      >
                        +{potentialGain}
                      </span>
                    </MotionDiv>
                  </div>
                </div>
              )}

              {/* Simplified display without win/loss indicators */}
              {!showWinLoss && (
                <div
                  className={`
                  flex items-center ${config.spacing}
                  bg-green-500/10
                  hover:bg-green-500/15
                  px-3 py-2
                  rounded-full
                  border border-green-400/30
                  ${QUICK_CLASH_CLASSES.shadowSoft}
                  hover:shadow-green-400/20
                  transition-all duration-200
                `}
                >
                  <MotionDiv
                    animate={{
                      rotate: [0, 10, 0, -10, 0],
                      transition: {
                        duration: 4,
                        repeat: Infinity,
                        repeatType: 'reverse',
                        ease: 'easeInOut',
                      },
                    }}
                  >
                    <Trophy
                      className={`
                      ${config.iconSize}
                      text-yellow-400
                      drop-shadow-sm
                    `}
                    />
                  </MotionDiv>
                  <MotionDiv animate={controls}>
                    <span
                      className={`
                      text-green-400
                      font-bold
                      ${config.fontSize}
                      drop-shadow-sm
                    `}
                    >
                      +{potentialGain}
                    </span>
                  </MotionDiv>
                </div>
              )}
            </div>
          </MotionDiv>
        </TooltipTrigger>
        <TooltipContent>
          <p>{t('Win to earn trophies and rise in the leaderboard!')}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default EnhancedPotentialTrophyDisplay
