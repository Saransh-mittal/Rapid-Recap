// components/quickClashComponents/ui/EnhancedTrophyChangeDisplay.jsx - FAITHFUL CONVERSION with Consistent Color Scheme
import React, { useEffect } from 'react'
import { motion, useAnimation } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  ChevronUp,
  ChevronDown,
  Shield,
  Equal,
  Minus,
  Trophy,
} from 'lucide-react'

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
 * Enhanced TrophyChangeDisplay - Ultra-slim premium trophy change indicator
 *
 * ORIGINAL LOGIC PRESERVED:
 * - All animation triggers and state handling maintained
 * - Protection, tie, and zero-change logic intact
 * - Size variants and responsive behavior preserved
 * - All useEffect hooks and animation controls unchanged
 *
 * REDESIGNED VISUALS:
 * - Minimal fit-content approach
 * - Ultra-slim profile with tight spacing
 * - Modern badge-style design
 */
const EnhancedTrophyChangeDisplay = ({
  trophyChange,
  showAnimation = false,
  size = 'sm',
  protectionApplied = false,
  isTie = false,
}) => {
  const { t } = useTranslation('QuickClash')
  const controls = useAnimation()
  const trophyControls = useAnimation()

  // ORIGINAL ANIMATION LOGIC - UNCHANGED
  useEffect(() => {
    if (showAnimation) {
      // Main content animation with spring physics
      controls.start({
        scale: [1, 1.08, 1],
        transition: {
          type: 'spring',
          stiffness: 400,
          damping: 15,
          duration: 0.5,
        },
      })

      // Trophy icon animation with rotation
      trophyControls.start({
        rotate: [0, 8, -8, 0],
        scale: [1, 1.1, 1],
        transition: {
          type: 'spring',
          stiffness: 300,
          damping: 20,
          duration: 0.6,
        },
      })
    }
  }, [showAnimation, controls, trophyControls])

  // ORIGINAL EARLY RETURN LOGIC - UNCHANGED
  if (trophyChange === undefined) return null

  // REFINED SIZE CONFIG - SLIM BUT POLISHED
  const getSizeClasses = () => {
    switch (size) {
      case 'xs':
        return {
          container: 'text-xs h-5 px-1.5 py-1',
          trophy: 'w-2.5 h-2.5',
          icon: 'w-2.5 h-2.5',
          gap: 'gap-1',
        }
      case 'md':
        return {
          container: 'text-xs h-6 px-2 py-1',
          trophy: 'w-3 h-3',
          icon: 'w-3 h-3',
          gap: 'gap-1',
        }
      default: // sm
        return {
          container: 'text-xs h-5 px-1.5 py-1',
          trophy: 'w-2.5 h-2.5',
          icon: 'w-2.5 h-2.5',
          gap: 'gap-1',
        }
    }
  }

  const sizeClasses = getSizeClasses()

  // ORIGINAL ZERO CHANGE LOGIC - UNCHANGED
  if (trophyChange === 0) {
    const getZeroChangeConfig = () => {
      if (protectionApplied) {
        return {
          icon: Shield,
          iconColor: 'text-blue-400',
          textColor: 'text-blue-400',
          bgClass: 'bg-blue-500/15',
          borderClass: 'border-blue-400/50',
          text: t('Protected'),
          tooltip: t('Your trophies were protected from loss'),
          animated: true,
        }
      } else if (isTie) {
        return {
          icon: Equal,
          iconColor: 'text-yellow-400',
          textColor: 'text-yellow-400',
          bgClass: 'bg-yellow-500/15',
          borderClass: 'border-yellow-400/50',
          text: t('Tie'),
          tooltip: t('Equal performance - no trophy change'),
          animated: true,
        }
      } else {
        return {
          icon: Minus,
          iconColor: 'text-gray-400',
          textColor: 'text-gray-400',
          bgClass: 'bg-gray-500/10',
          borderClass: 'border-gray-400/30',
          text: '0',
          tooltip: t('No trophy change'),
          animated: false,
        }
      }
    }

    const zeroConfig = getZeroChangeConfig()

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
            >
              <MotionDiv
                className={`
                  inline-flex items-center justify-center
                  ${sizeClasses.container}
                  ${sizeClasses.gap}
                  rounded-full
                  ${zeroConfig.bgClass}
                  border
                  ${zeroConfig.borderClass}
                  cursor-default
                  font-medium
                  leading-none
                  w-fit
                `}
                animate={
                  zeroConfig.animated
                    ? {
                        boxShadow: [
                          '0 0 0 rgba(59, 130, 246, 0)',
                          '0 0 8px rgba(59, 130, 246, 0.3)',
                          '0 0 0 rgba(59, 130, 246, 0)',
                        ],
                        transition: {
                          duration: 2.5,
                          repeat: Infinity,
                          repeatType: 'reverse',
                        },
                      }
                    : {}
                }
                whileHover={{
                  scale: 1.05,
                  transition: { duration: 0.2 },
                }}
              >
                {/* Minimal shimmer for special states */}
                {zeroConfig.animated && (
                  <MotionDiv
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-full"
                    animate={{
                      x: ['-100%', '200%'],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                  />
                )}

                {/* Trophy + Status Icon + Text - Ultra compact */}
                <MotionDiv animate={trophyControls}>
                  <Trophy className={`${sizeClasses.trophy} text-yellow-400`} />
                </MotionDiv>
                <MotionDiv
                  animate={showAnimation ? { rotate: [0, 3, 0, -3, 0] } : {}}
                >
                  <zeroConfig.icon
                    className={`${sizeClasses.icon} ${zeroConfig.iconColor}`}
                  />
                </MotionDiv>
                <MotionDiv animate={controls}>
                  <span className={`${zeroConfig.textColor} font-bold`}>
                    {zeroConfig.text}
                  </span>
                </MotionDiv>
              </MotionDiv>
            </MotionDiv>
          </TooltipTrigger>
          <TooltipContent>
            <p>{zeroConfig.tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  // ORIGINAL POSITIVE CHANGE LOGIC - REDESIGNED VISUALS
  if (trophyChange > 0) {
    return (
      <MotionDiv
        initial={{ opacity: 0, scale: 0.9, y: 3 }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
          transition: {
            type: 'spring',
            stiffness: 400,
            damping: 20,
          },
        }}
      >
        <MotionDiv
          className={`
            inline-flex items-center justify-center
            ${sizeClasses.container}
            ${sizeClasses.gap}
            rounded-full
            bg-green-500/15
            border
            border-green-400/50
            font-medium
            leading-none
            w-fit
          `}
          animate={controls}
          whileHover={{
            scale: 1.05,
            transition: { duration: 0.2 },
          }}
        >
          {/* Minimal shimmer effect */}
          <MotionDiv
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-full"
            animate={
              showAnimation
                ? {
                    x: ['-100%', '200%'],
                    transition: {
                      duration: 2,
                      repeat: 1,
                      ease: 'linear',
                    },
                  }
                : {}
            }
          />

          {/* Ultra-compact trophy + arrow + value */}
          <MotionDiv animate={trophyControls}>
            <Trophy className={`${sizeClasses.trophy} text-yellow-400`} />
          </MotionDiv>
          <MotionDiv
            animate={
              showAnimation
                ? {
                    y: [0, -1, 0],
                    transition: {
                      duration: 0.6,
                      repeat: 1,
                      repeatType: 'reverse',
                    },
                  }
                : {}
            }
          >
            <ChevronUp className={`${sizeClasses.icon} text-green-400`} />
          </MotionDiv>
          <MotionDiv animate={controls}>
            <span className="text-green-400 font-bold">+{trophyChange}</span>
          </MotionDiv>
        </MotionDiv>
      </MotionDiv>
    )
  }

  // ORIGINAL NEGATIVE CHANGE LOGIC - REDESIGNED VISUALS
  return (
    <MotionDiv
      initial={{ opacity: 0, scale: 0.9, y: 3 }}
      animate={{
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
          type: 'spring',
          stiffness: 400,
          damping: 20,
        },
      }}
    >
      <MotionDiv
        className={`
          inline-flex items-center justify-center
          ${sizeClasses.container}
          ${sizeClasses.gap}
          rounded-full
          bg-red-500/15
          border
          border-red-400/50
          font-medium
          leading-none
          w-fit
        `}
        animate={controls}
        whileHover={{
          scale: 1.05,
          transition: { duration: 0.2 },
        }}
      >
        {/* Minimal shimmer effect */}
        <MotionDiv
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-full"
          animate={
            showAnimation
              ? {
                  x: ['-100%', '200%'],
                  transition: {
                    duration: 2,
                    repeat: 1,
                    ease: 'linear',
                  },
                }
              : {}
          }
        />

        {/* Ultra-compact trophy + arrow + value */}
        <MotionDiv animate={trophyControls}>
          <Trophy className={`${sizeClasses.trophy} text-yellow-400`} />
        </MotionDiv>
        <MotionDiv
          animate={
            showAnimation
              ? {
                  y: [0, 1, 0],
                  transition: {
                    duration: 0.6,
                    repeat: 1,
                    repeatType: 'reverse',
                  },
                }
              : {}
          }
        >
          <ChevronDown className={`${sizeClasses.icon} text-red-400`} />
        </MotionDiv>
        <MotionDiv animate={controls}>
          <span className="text-red-400 font-bold">{trophyChange}</span>
        </MotionDiv>
      </MotionDiv>
    </MotionDiv>
  )
}

export default EnhancedTrophyChangeDisplay
