// components/quickClashComponents/ui/PlayerStatus.jsx - FAITHFUL CONVERSION with Consistent Color Scheme
import React from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Trophy } from 'lucide-react'

// Import centralized color scheme
import { QUICK_CLASH_CLASSES } from '../utils/quickClashColors'

// Import existing UI components
import ScoreDisplay from './ScoreDisplay'
import EnhancedTrophyChangeDisplay from './EnhancedTrophyChangeDisplay'

// You'll need to install this component: npx shadcn-ui@latest add avatar
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

const MotionDiv = motion.div

/**
 * Enhanced PlayerStatus component - Displays player information in Quick Clash challenges
 *
 * Key improvements:
 * - Updated to blue-cyan harmony color scheme
 * - Enhanced glassmorphic styling with Tailwind CSS
 * - Better responsive design and accessibility
 * - Improved animations and visual feedback
 * - Maintained all original functionality and prop structure
 *
 * @param {Object} player - Player object with name, pic, inGameName
 * @param {Number} score - Player's score in the challenge
 * @param {Boolean} attempted - Whether player has attempted the challenge
 * @param {Boolean} isUser - Whether this is the current user's status
 * @param {Number} trophies - Player's current trophy count
 * @param {Number} trophyChange - Trophy change from this challenge
 * @param {Boolean} showTrophyAnimation - Whether to show trophy change animation
 * @param {Boolean} protectionApplied - Whether trophy protection was applied
 * @param {Boolean} isTie - Whether the challenge was a tie
 */
const PlayerStatus = ({
  player,
  score,
  attempted,
  isUser,
  trophies,
  trophyChange,
  showTrophyAnimation = false,
  protectionApplied = false,
  isTie = false,
}) => {
  const { t } = useTranslation('QuickClash')

  // Enhanced styling for user vs opponent with blue-cyan theme
  const containerClasses = isUser
    ? `
        ${QUICK_CLASH_CLASSES.glassMedium}
        bg-gradient-to-r from-cyan-500/10 to-purple-500/10
        border-2 border-cyan-500/30
        ${QUICK_CLASH_CLASSES.shadowCyan}
      `
    : `
        ${QUICK_CLASH_CLASSES.glassMedium}
        bg-gradient-to-r from-slate-600/10 to-slate-500/10
        border border-white/20
      `

  // Animation configuration for user status
  const animationProps = isUser
    ? {
        initial: { scale: 0.95, opacity: 0 },
        animate: {
          scale: 1,
          opacity: 1,
          transition: {
            type: 'spring',
            stiffness: 300,
            damping: 15,
          },
        },
      }
    : {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
      }

  return (
    <MotionDiv
      {...animationProps}
      className={`
        ${containerClasses}
        rounded-2xl
        p-3
        w-full
        relative
        overflow-hidden
        transition-all duration-300
        hover:shadow-xl
        backdrop-brightness-110
      `}
    >
      {/* Corner indicator for current user */}
      {isUser && (
        <div className="absolute top-0 right-0 w-10 h-10 bg-gradient-to-br from-cyan-500 to-cyan-600 transform rotate-45 translate-x-7 -translate-y-7" />
      )}

      {/* Main layout */}
      <div className="flex items-center justify-between relative z-10">
        {/* Left section: Avatar and player info */}
        <div className="flex items-center space-x-3 flex-1">
          <Avatar
            className={`
            ${isUser ? 'ring-2 ring-cyan-400/50' : ''}
            transition-all duration-200
            hover:scale-105
          `}
          >
            <AvatarImage
              src={player?.pic}
              alt={player?.name}
              className="object-cover"
            />
            <AvatarFallback
              className={`
              ${
                isUser
                  ? 'bg-gradient-to-br from-cyan-400 to-cyan-500 text-white'
                  : 'bg-gradient-to-br from-gray-400 to-gray-500 text-white'
              }
              font-bold
            `}
            >
              {player?.name?.charAt(0)?.toUpperCase() || '?'}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col space-y-1 flex-1">
            <div className="flex items-center space-x-2">
              <span
                className={`
                ${QUICK_CLASH_CLASSES.textPrimary}
                text-sm font-bold
                truncate max-w-[120px]
              `}
              >
                {player?.inGameName || player?.name}
              </span>
              {isUser && (
                <Badge
                  variant="secondary"
                  className={`
                    ${QUICK_CLASH_CLASSES.btnPrimary}
                    text-xs
                    px-2 py-0.5
                    rounded-full
                    font-bold
                  `}
                >
                  {t('You')}
                </Badge>
              )}
            </div>

            {/* Trophy change display - positioned below name for current user */}
            {isUser && trophyChange !== undefined && (
              <div className="mt-1">
                <EnhancedTrophyChangeDisplay
                  trophyChange={trophyChange}
                  showAnimation={showTrophyAnimation}
                  size="sm"
                  protectionApplied={protectionApplied}
                  isTie={isTie}
                />
              </div>
            )}

            {/* Trophy display */}
            {trophies !== undefined && (
              <MotionDiv
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  transition: { delay: 0.2 },
                }}
                className={`
                  flex items-center
                  bg-yellow-400/10
                  rounded-full
                  px-2 py-1
                  border border-yellow-400/30
                  ${isUser && trophyChange !== undefined ? 'mt-1' : ''}
                  w-fit
                `}
              >
                <Trophy className="w-3 h-3 text-yellow-400 mr-1" />
                <span
                  className={`
                  ${QUICK_CLASH_CLASSES.textPrimary}
                  font-semibold
                  text-xs
                `}
                >
                  {trophies}
                </span>
              </MotionDiv>
            )}
          </div>
        </div>

        {/* Right section: Score display */}
        {attempted && (
          <div className="flex items-center justify-center ml-3">
            <ScoreDisplay score={score} size="sm" />
          </div>
        )}
      </div>
    </MotionDiv>
  )
}

export default PlayerStatus
