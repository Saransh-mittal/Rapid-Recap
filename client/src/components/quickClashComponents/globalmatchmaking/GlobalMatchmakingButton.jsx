// components/quickClashComponents/globalmatchmaking/GlobalMatchmakingButton.jsx
// REDESIGNED - Premium Gamified Button with Enhanced Visual Hierarchy
import React, { useState, useCallback, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { Shield, Zap, Users, Sparkles, TrendingUp } from 'lucide-react'

import { QUICK_CLASH_CLASSES } from '../utils/quickClashColors'
import GlobalMatchmakingModal from './GlobalMatchmakingModal'

const MotionButton = motion.button

/**
 * Enhanced button states with premium gamified theme
 * Design Philosophy: Each state should feel distinct and exciting
 * - idle: Inviting teal gradient with shield icon (represents strength)
 * - searching: Dynamic emerald with activity indicator (shows progress)
 * - ready: Triumphant cyan with electric bolt (battle excitement)
 */
const BUTTON_STATES = {
  idle: {
    text: 'SQUAD',
    icon: Shield,
    gradient: 'linear-gradient(135deg, #14B8A6 0%, #0D9488 50%, #0F766E 100%)',
    glowColor: '#14B8A6',
    borderColor: 'border-teal-400/50',
    shadowIntensity: 'md',
  },
  searching: {
    text: 'Finding Battle',
    icon: TrendingUp,
    gradient: 'linear-gradient(135deg, #10B981 0%, #059669 50%, #047857 100%)',
    glowColor: '#10B981',
    borderColor: 'border-emerald-400/50',
    shadowIntensity: 'lg',
  },
  ready: {
    text: 'Battle Ready!',
    icon: Zap,
    gradient: 'linear-gradient(135deg, #06B6D4 0%, #0891B2 50%, #0E7490 100%)',
    glowColor: '#06B6D4',
    borderColor: 'border-cyan-400/50',
    shadowIntensity: 'xl',
  },
}

const GlobalMatchmakingButton = React.memo(
  ({
    compact = false,
    renderAsModal = false,
    onModalClose,
    buttonSize = { base: 'md', md: 'lg' },
    buttonWidth = { base: '100%', md: '240px' },
    buttonHeight = { base: '48px', md: '56px' },
    buttonMinWidth = { base: '140px', md: '240px' },
    ...otherProps
  }) => {
    const { t } = useTranslation('QuickClash')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
      const checkMobile = () => setIsMobile(window.innerWidth < 768)
      checkMobile()
      window.addEventListener('resize', checkMobile)
      return () => window.removeEventListener('resize', checkMobile)
    }, [])

    const matchmakingState = useSelector(
      state => ({
        inMatchmaking:
          state.quickClashGlobalMatchmaking?.inMatchmaking || false,
        battleReady: state.quickClashGlobalMatchmaking?.battleReady || false,
        loading: state.quickClashGlobalMatchmaking?.loading || false,
      }),
      (prev, next) =>
        prev.inMatchmaking === next.inMatchmaking &&
        prev.battleReady === next.battleReady &&
        prev.loading === next.loading,
    )
    const buttonState = useMemo(() => {
      if (matchmakingState.battleReady) return 'ready'
      if (matchmakingState.inMatchmaking) return 'searching'
      return 'idle'
    }, [matchmakingState])

    const config = BUTTON_STATES[buttonState]

    const handleOpenModal = useCallback(() => setIsModalOpen(true), [])
    const handleCloseModal = useCallback(() => {
      setIsModalOpen(false)
      onModalClose?.()
    }, [onModalClose])

    const sizeConfig = useMemo(() => {
      const isBase = isMobile
      return {
        width: isBase
          ? typeof buttonWidth === 'object'
            ? buttonWidth.base
            : buttonWidth
          : typeof buttonWidth === 'object'
          ? buttonWidth.md
          : buttonWidth,
        height: isBase
          ? typeof buttonHeight === 'object'
            ? buttonHeight.base
            : buttonHeight
          : typeof buttonHeight === 'object'
          ? buttonHeight.md
          : buttonHeight,
        minWidth: isBase
          ? typeof buttonMinWidth === 'object'
            ? buttonMinWidth.base
            : buttonMinWidth
          : typeof buttonMinWidth === 'object'
          ? buttonMinWidth.md
          : buttonMinWidth,
        fontSize: isBase ? 'text-sm' : 'text-base',
      }
    }, [isMobile, buttonWidth, buttonHeight, buttonMinWidth])

    if (renderAsModal) {
      return (
        <GlobalMatchmakingModal
          isOpen={true}
          onClose={handleCloseModal}
          isEmbedded={true}
        />
      )
    }

    const IconComponent = config.icon
    const isLoading = matchmakingState.loading

    // Compact version for icon-only display
    if (compact) {
      return (
        <>
          <MotionButton
            onClick={handleOpenModal}
            disabled={isLoading}
            className={`
              relative w-12 h-12 rounded-full overflow-hidden
              ${config.borderColor} border-2
              ${QUICK_CLASH_CLASSES.focusRing}
              transition-all duration-300
              ${isLoading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
            `}
            style={{
              background: config.gradient,
              boxShadow: `0 0 ${
                config.shadowIntensity === 'xl' ? '40px' : '20px'
              } ${config.glowColor}40`,
            }}
            whileHover={!isLoading ? { scale: 1.1, rotate: 5 } : {}}
            whileTap={!isLoading ? { scale: 0.95 } : {}}
            animate={
              buttonState === 'ready'
                ? {
                    scale: [1, 1.05, 1],
                    boxShadow: [
                      `0 0 20px ${config.glowColor}40`,
                      `0 0 40px ${config.glowColor}80`,
                      `0 0 20px ${config.glowColor}40`,
                    ],
                  }
                : {}
            }
            transition={{
              duration: 1.5,
              repeat: buttonState === 'ready' ? Infinity : 0,
            }}
            {...otherProps}
          >
            {/* Multi-layer glass effect */}
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />

            {/* Icon with conditional animation */}
            <div className="relative z-10 w-full h-full flex items-center justify-center">
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : buttonState === 'searching' ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                >
                  <IconComponent className="w-5 h-5 text-white" />
                </motion.div>
              ) : (
                <IconComponent className="w-5 h-5 text-white" />
              )}
            </div>

            {/* Pulsing glow for active states */}
            {buttonState !== 'idle' && (
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ background: `${config.glowColor}20` }}
                animate={{
                  scale: [0.8, 1.2, 0.8],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
          </MotionButton>
          <GlobalMatchmakingModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
          />
        </>
      )
    }

    // Full button version
    return (
      <>
        <MotionButton
          onClick={handleOpenModal}
          disabled={isLoading}
          className={`
            relative overflow-hidden rounded-2xl
            ${config.borderColor} border-2
            ${sizeConfig.fontSize} font-bold text-white
            ${QUICK_CLASH_CLASSES.focusRing}
            transition-all duration-300
            ${
              isLoading
                ? 'opacity-60 cursor-not-allowed'
                : 'cursor-pointer hover:-translate-y-1'
            }
            flex items-center justify-center gap-3
            mb-4
          `}
          style={{
            background: config.gradient,
            width: sizeConfig.width,
            height: sizeConfig.height,
            minWidth: sizeConfig.minWidth,
            boxShadow: `0 8px 32px ${config.glowColor}40, 0 0 0 1px ${config.glowColor}20 inset`,
            textShadow: '0 2px 8px rgba(0,0,0,0.5)',
          }}
          whileHover={
            !isLoading
              ? {
                  boxShadow: `0 12px 48px ${config.glowColor}60, 0 0 0 1px ${config.glowColor}40 inset`,
                }
              : {}
          }
          whileTap={!isLoading ? { scale: 0.98 } : {}}
          animate={
            buttonState === 'ready'
              ? {
                  scale: [1, 1.02, 1],
                  boxShadow: [
                    `0 8px 32px ${config.glowColor}40, 0 0 0 1px ${config.glowColor}20 inset`,
                    `0 12px 48px ${config.glowColor}80, 0 0 0 1px ${config.glowColor}60 inset`,
                    `0 8px 32px ${config.glowColor}40, 0 0 0 1px ${config.glowColor}20 inset`,
                  ],
                }
              : {}
          }
          transition={{
            duration: 1.5,
            repeat: buttonState === 'ready' ? Infinity : 0,
          }}
          {...otherProps}
        >
          {/* Multi-layer glass effects */}
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/10" />

          {/* Animated shine effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatDelay: 2,
            }}
          />

          {/* Content */}
          <div className="relative z-10 flex items-center gap-3">
            {/* Left Icon */}
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : buttonState === 'searching' ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              >
                <IconComponent className="w-5 h-5" />
              </motion.div>
            ) : (
              <IconComponent className="w-5 h-5" />
            )}

            {/* Button Text */}
            <span className="font-extrabold tracking-wide">
              {isLoading ? t('Joining...') : t(config.text)}
            </span>

            {/* Right sparkle for ready state */}
            {buttonState === 'ready' && !isLoading && (
              <motion.div
                animate={{
                  scale: [1, 1.3, 1],
                  rotate: [0, 180, 360],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="w-4 h-4" />
              </motion.div>
            )}
          </div>

          {/* Pulsing glow background for active states */}
          {buttonState !== 'idle' && (
            <motion.div
              className="absolute inset-0 rounded-2xl"
              style={{ background: `${config.glowColor}15` }}
              animate={{
                scale: [0.9, 1.05, 0.9],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </MotionButton>

        <GlobalMatchmakingModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      </>
    )
  },
)

GlobalMatchmakingButton.displayName = 'GlobalMatchmakingButton'

export default GlobalMatchmakingButton
