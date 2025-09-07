// components/quickClashComponents/globalmatchmaking/GlobalMatchmakingButton.jsx - FAITHFUL CONVERSION to Tailwind with Blue-Cyan Color Scheme
import React, { useState, useCallback, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { Users, Activity, Globe, Zap, Shield } from 'lucide-react'

// Import centralized color scheme
import { QUICK_CLASH_CLASSES } from '../utils/quickClashColors'

// Import the modal component (assuming it exists)
import GlobalMatchmakingModal from './GlobalMatchmakingModal'

const MotionButton = motion.button
const MotionDiv = motion.div

// Enhanced button states with blue-cyan theme (differentiated from SOLO)
const GLOBAL_BUTTON_STATES = {
  idle: {
    text: 'SQUAD',
    icon: Shield,
    gradient: 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)', // Teal gradient for differentiation
    shadowColor: 'rgba(13, 148, 136, 0.4)',
    hoverShadowColor: 'rgba(13, 148, 136, 0.6)',
    glowColor: 'teal-400',
  },
  searching: {
    text: 'Active',
    icon: Users,
    gradient: 'linear-gradient(135deg, #059669 0%, #047857 100%)', // Green for active state
    shadowColor: 'rgba(5, 150, 105, 0.4)',
    hoverShadowColor: 'rgba(5, 150, 105, 0.6)',
    glowColor: 'emerald-400',
  },
  ready: {
    text: 'Battle Ready!',
    icon: Zap,
    gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', // Bright green for ready
    shadowColor: 'rgba(16, 185, 129, 0.4)',
    hoverShadowColor: 'rgba(16, 185, 129, 0.6)',
    glowColor: 'green-400',
  },
}

/**
 * Enhanced Global Matchmaking Button - FAITHFUL CONVERSION with blue-cyan theme
 * Handles SQUAD matchmaking with consistent sizing and styling
 */
const GlobalMatchmakingButton = React.memo(
  ({
    compact = false,
    renderAsModal = false,
    onModalClose,
    // Fixed sizing props to match MatchmakingButton exactly
    buttonSize = { base: 'md', md: 'lg' },
    buttonWidth = { base: '100%', md: '240px' },
    buttonHeight = { base: '48px', md: '56px' },
    buttonMinWidth = { base: '140px', md: '240px' },
    // Text override props
    buttonTextOverride,
    iconOverride,
    bgGradientOverride,
    shadowColorOverride,
    ...otherProps
  }) => {
    const { t } = useTranslation('QuickClash')
    const [isModalOpen, setIsModalOpen] = useState(false)

    // Responsive state management
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
      const checkMobile = () => {
        setIsMobile(window.innerWidth < 768)
      }
      checkMobile()
      window.addEventListener('resize', checkMobile)
      return () => window.removeEventListener('resize', checkMobile)
    }, [])

    // Subscribe to essential state with shallow comparison - EXACTLY as original
    const matchmakingState = useSelector(
      state => ({
        inMatchmaking:
          state.quickClashGlobalMatchmaking?.inMatchmaking || false,
        battleReady: state.quickClashGlobalMatchmaking?.battleReady || false,
        loading: state.quickClashGlobalMatchmaking?.loading || false,
        battleCreationStatus:
          state.quickClashGlobalMatchmaking?.battleCreationStatus || null,
      }),
      (prev, next) =>
        prev.inMatchmaking === next.inMatchmaking &&
        prev.battleReady === next.battleReady &&
        prev.loading === next.loading &&
        prev.battleCreationStatus === next.battleCreationStatus,
    )

    // Memoized button configuration - EXACTLY as original logic
    const buttonConfig = useMemo(() => {
      const { inMatchmaking, battleReady } = matchmakingState

      let currentState = 'idle'
      if (battleReady) {
        currentState = 'ready'
      } else if (inMatchmaking) {
        currentState = 'searching'
      }

      const config = GLOBAL_BUTTON_STATES[currentState]

      return {
        ...config,
        icon: iconOverride || config.icon,
        gradient: bgGradientOverride || config.gradient,
        text: buttonTextOverride || t(config.text),
        shadowColor: shadowColorOverride || config.shadowColor,
        hoverShadowColor: shadowColorOverride || config.hoverShadowColor,
        glowColor: config.glowColor,
        shouldPulse: currentState !== 'idle',
        animationType:
          currentState === 'searching'
            ? 'spin'
            : currentState === 'ready'
            ? 'pulse'
            : 'none',
        currentState,
      }
    }, [
      matchmakingState,
      t,
      buttonTextOverride,
      iconOverride,
      bgGradientOverride,
      shadowColorOverride,
    ])

    // Enhanced button animations (matching MatchmakingButton) - EXACTLY as original
    const buttonAnimation = useMemo(() => {
      const baseAnimation = {
        scale: 1,
        rotate: 0,
      }

      if (buttonConfig.currentState === 'ready') {
        return {
          ...baseAnimation,
          scale: [1, 1.02, 1],
        }
      }
      if (buttonConfig.currentState === 'searching') {
        return {
          ...baseAnimation,
        }
      }
      return baseAnimation
    }, [buttonConfig.currentState])

    const handleOpenModal = useCallback(() => {
      setIsModalOpen(true)
    }, [])

    const handleCloseModal = useCallback(() => {
      setIsModalOpen(false)
      if (onModalClose) {
        onModalClose()
      }
    }, [onModalClose])

    // Responsive sizing - matching MatchmakingButton exactly
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

    const { loading } = matchmakingState
    const config = buttonConfig
    const IconComponent = config.icon

    if (compact) {
      return (
        <>
          <MotionButton
            onClick={handleOpenModal}
            disabled={loading}
            className={`
              rounded-full border-2 border-white/20 font-bold text-white
              transition-all duration-200 hover:border-white/40
              hover:-translate-y-0.5 active:translate-y-0
              focus:outline-none focus:ring-2 focus:ring-teal-400/50
              flex items-center justify-center
            `}
            style={{
              background: config.gradient,
              boxShadow: `0 8px 32px ${config.shadowColor}`,
              textShadow: '0 2px 4px rgba(0,0,0,0.3)',
            }}
            whileHover={
              loading
                ? {}
                : {
                    scale: 1.05,
                    boxShadow: `0 12px 48px ${config.hoverShadowColor}`,
                    transition: { duration: 0.2 },
                  }
            }
            whileTap={
              loading
                ? {}
                : {
                    scale: 0.95,
                    boxShadow: `0 6px 24px ${config.shadowColor}`,
                    transition: { duration: 0.1 },
                  }
            }
            {...otherProps}
          >
            {/* Glassmorphism overlay */}
            <div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                background:
                  'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
              }}
            />

            {config.animationType === 'spin' ? (
              <MotionDiv
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="relative z-10"
              >
                <IconComponent className="w-5 h-5" />
              </MotionDiv>
            ) : (
              <IconComponent className="w-5 h-5 relative z-10" />
            )}

            {/* Glow effect for active states */}
            {config.shouldPulse && (
              <MotionDiv
                className={`absolute inset-0 rounded-full bg-${config.glowColor}/20 blur-lg`}
                animate={{
                  opacity: [0.5, 0.8, 0.5],
                  scale: [0.95, 1.05, 0.95],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: 'reverse',
                }}
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

    return (
      <>
        <MotionButton
          onClick={handleOpenModal}
          disabled={loading}
          className={`
            relative overflow-hidden rounded-full border-2 border-white/20
            font-bold text-white transition-all duration-200
            ${
              loading
                ? 'opacity-60 cursor-not-allowed'
                : 'hover:border-white/40'
            }
            mb-4 ${sizeConfig.fontSize}
            flex items-center justify-center gap-2 text-center
            hover:-translate-y-0.5 active:translate-y-0
            focus:outline-none focus:ring-2 focus:ring-teal-400/50
          `}
          style={{
            background: config.gradient,
            boxShadow: `0 8px 32px ${config.shadowColor}`,
            width: sizeConfig.width,
            height: sizeConfig.height,
            minWidth: sizeConfig.minWidth,
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
          }}
          animate={buttonAnimation}
          transition={{
            duration: 0.3,
            ease: 'easeInOut',
            scale: {
              duration: 1.5,
              repeat: config.currentState === 'ready' ? Infinity : 0,
              repeatType: 'reverse',
            },
          }}
          whileHover={
            loading
              ? {}
              : {
                  scale: 1.05,
                  boxShadow: `0 12px 48px ${config.hoverShadowColor}`,
                  transition: { duration: 0.2 },
                }
          }
          whileTap={
            loading
              ? {}
              : {
                  scale: 0.98,
                  boxShadow: `0 6px 24px ${config.shadowColor}`,
                  transition: { duration: 0.1 },
                }
          }
          {...otherProps}
        >
          {/* Glassmorphism overlay */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background:
                'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
            }}
          />

          {/* Left Icon */}
          <div className="relative z-10 flex items-center">
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <IconComponent className="w-5 h-5" />
            )}
          </div>

          {/* Button Text */}
          <span className="relative z-10 font-bold">
            {loading ? t('Joining...') : config.text}
          </span>

          {/* Right Icon for spinning globe */}
          {config.animationType === 'spin' && !loading && (
            <MotionDiv
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="relative z-10 flex items-center"
            >
              <Globe className="w-4 h-4" />
            </MotionDiv>
          )}

          {/* Glow effect for active states */}
          {config.shouldPulse && (
            <MotionDiv
              className={`absolute inset-0 rounded-full bg-${config.glowColor}/20 blur-lg`}
              animate={{
                opacity: [0.5, 0.8, 0.5],
                scale: [0.95, 1.05, 0.95],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
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
