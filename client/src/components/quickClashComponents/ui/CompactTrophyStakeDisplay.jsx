// components/quickClashComponents/ui/CompactTrophyStakeDisplay.jsx - FAITHFUL CONVERSION with Consistent Color Scheme
import React from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { ChevronUp, ChevronDown, Trophy } from 'lucide-react'

// Import centralized color scheme
import { QUICK_CLASH_CLASSES } from '../utils/quickClashColors'

// You'll need to install these components: npx shadcn-ui@latest add popover separator
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'

const MotionDiv = motion.div

/**
 * Enhanced CompactTrophyStakeDisplay - Shows trophy stakes with detailed popover
 *
 * Key improvements:
 * - Updated to blue-cyan harmony color scheme
 * - Enhanced glassmorphic styling with sophisticated backdrop effects
 * - Improved popover styling with better visual hierarchy
 * - Better responsive design with multiple size variants
 * - Enhanced animations with spring physics and micro-interactions
 * - Maintained all original functionality and hover behavior
 *
 * @param {Number} potentialGain - Trophies gained on win
 * @param {Number} potentialLoss - Trophies lost on defeat
 * @param {String} size - Size variant (xs, sm, md)
 */
const CompactTrophyStakeDisplay = ({
  potentialGain = 0,
  potentialLoss = 0,
  size = 'sm',
}) => {
  const { t } = useTranslation('QuickClash')

  // If no potential gain, don't render anything
  if (potentialGain === 0) return null

  const sizeConfig = {
    xs: {
      fontSize: 'text-xs',
      iconSize: 'w-2.5 h-2.5',
      spacing: 'space-x-0.5',
      padding: 'px-2 py-1',
      height: 'h-6',
      minWidth: 'min-w-[60px]',
    },
    sm: {
      fontSize: 'text-xs',
      iconSize: 'w-3 h-3',
      spacing: 'space-x-1',
      padding: 'px-2.5 py-1',
      height: 'h-7',
      minWidth: 'min-w-[70px]',
    },
    md: {
      fontSize: 'text-sm',
      iconSize: 'w-3.5 h-3.5',
      spacing: 'space-x-1.5',
      padding: 'px-3 py-1.5',
      height: 'h-8',
      minWidth: 'min-w-[80px]',
    },
  }

  const config = sizeConfig[size] || sizeConfig.sm

  return (
    <Popover>
      <PopoverTrigger asChild>
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
          whileTap={{
            scale: 0.95,
            transition: { duration: 0.1 },
          }}
          className={`
            flex items-center justify-center
            ${config.minWidth}
            ${config.height}
            ${config.padding}
            ${QUICK_CLASH_CLASSES.glassMedium}
            hover:bg-black/60
            rounded-full
            border border-yellow-400/30
            hover:border-yellow-400/50
            ${QUICK_CLASH_CLASSES.shadowSoft}
            hover:shadow-yellow-400/20
            cursor-help
            transition-all duration-200
            backdrop-blur-md
            backdrop-brightness-110
            relative
            overflow-hidden
          `}
        >
          {/* Background gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 via-yellow-400/5 to-yellow-400/10 rounded-full" />

          <div className={`flex items-center ${config.spacing} relative z-10`}>
            {/* Trophy icon with glow effect */}
            <MotionDiv
              animate={{
                rotate: [0, 3, 0, -3, 0],
                transition: {
                  duration: 4,
                  repeat: Infinity,
                  repeatType: 'reverse',
                  ease: 'easeInOut',
                },
              }}
              className="relative"
            >
              <Trophy
                className={`
                ${config.iconSize}
                text-yellow-400
                drop-shadow-[0_0_4px_rgba(251,191,36,0.6)]
              `}
              />
            </MotionDiv>

            {/* Potential gain */}
            <div className="flex items-center space-x-0">
              <MotionDiv
                animate={{
                  y: [0, -0.5, 0],
                  transition: {
                    duration: 2,
                    repeat: Infinity,
                    repeatType: 'reverse',
                    ease: 'easeInOut',
                  },
                }}
              >
                <ChevronUp className={`${config.iconSize} text-green-400`} />
              </MotionDiv>
              <span
                className={`
                text-green-300
                font-bold
                ${config.fontSize}
                min-w-[20px]
                text-center
                drop-shadow-sm
              `}
              >
                {potentialGain}
              </span>
            </div>

            {/* Potential loss */}
            <div className="flex items-center space-x-0">
              <MotionDiv
                animate={{
                  y: [0, 0.5, 0],
                  transition: {
                    duration: 2,
                    repeat: Infinity,
                    repeatType: 'reverse',
                    ease: 'easeInOut',
                  },
                }}
              >
                <ChevronDown className={`${config.iconSize} text-red-400`} />
              </MotionDiv>
              <span
                className={`
                text-red-300
                font-bold
                ${config.fontSize}
                min-w-[20px]
                text-center
                drop-shadow-sm
              `}
              >
                {potentialLoss}
              </span>
            </div>
          </div>
        </MotionDiv>
      </PopoverTrigger>

      <PopoverContent
        className={`
          ${QUICK_CLASH_CLASSES.glassMedium}
          border border-yellow-400/40
          ${QUICK_CLASH_CLASSES.shadowStrong}
          rounded-2xl
          backdrop-blur-xl
          backdrop-brightness-110
          max-w-[220px]
          p-0
        `}
        sideOffset={8}
      >
        <div className="p-4">
          <div className="flex flex-col space-y-3">
            {/* Header */}
            <div className="flex items-center space-x-2">
              <Trophy className="w-4 h-4 text-yellow-400" />
              <span
                className={`
                ${QUICK_CLASH_CLASSES.textPrimary}
                font-bold
                text-sm
              `}
              >
                {t('Trophy Stakes')}
              </span>
            </div>

            <Separator className="bg-white/10" />

            {/* Stakes breakdown */}
            <div className="flex flex-col space-y-2">
              {/* Win scenario */}
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-1.5">
                  <ChevronUp className="w-4 h-4 text-green-400" />
                  <span
                    className={`
                    ${QUICK_CLASH_CLASSES.textSecondary}
                    text-sm
                  `}
                  >
                    {t('On Win')}
                  </span>
                </div>
                <span className="text-green-400 font-bold text-sm">
                  +{potentialGain}
                </span>
              </div>

              {/* Loss scenario */}
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-1.5">
                  <ChevronDown className="w-4 h-4 text-red-400" />
                  <span
                    className={`
                    ${QUICK_CLASH_CLASSES.textSecondary}
                    text-sm
                  `}
                  >
                    {t('On Loss')}
                  </span>
                </div>
                <span className="text-red-400 font-bold text-sm">
                  -{potentialLoss}
                </span>
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default CompactTrophyStakeDisplay
