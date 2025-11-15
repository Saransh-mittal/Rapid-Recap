// components/quickClashComponents/MatchmakingButton.jsx - FAITHFUL CONVERSION to Tailwind with Blue-Cyan Color Scheme
import React, {
  useMemo,
  forwardRef,
  useImperativeHandle,
  useCallback,
  useState,
  useEffect,
} from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Users, Shield, Globe, PlayCircle, Sword } from 'lucide-react'
import useQuickClashMatchmaking from '../../customHooks/useQuickClashMatchmaking'

// Import centralized color scheme
import { QUICK_CLASH_CLASSES } from '../../utils/quickClashColors'

const MotionButton = motion.button
const MotionDiv = motion.div

// Custom Toast Hook (simplified replacement for Chakra's useToast)
const useToast = () => {
  const showToast = useCallback(
    ({ title, description, status, duration = 3000 }) => {
      // Simple implementation - in a real app you'd have a toast system
      console.log(`Toast (${status}): ${title} - ${description}`)

      // You could implement a real toast notification system here
      // For now, this maintains the interface compatibility
    },
    [],
  )

  return { toast: showToast }
}

// Custom Spinner Component
const Spinner = ({ size = 'sm', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  }

  return (
    <div
      className={`${sizeClasses[size]} border-2 border-white border-t-transparent rounded-full animate-spin ${className}`}
    />
  )
}

// Button state configurations with blue-cyan theme
const BUTTON_STATES = {
  idle: {
    text: 'SOLO',
    icon: Sword,
    gradient: 'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)',
    shadowColor: 'rgba(6, 182, 212, 0.4)',
    hoverShadowColor: 'rgba(6, 182, 212, 0.6)',
    glowColor: 'cyan-400',
  },
  searching: {
    text: 'Searching...',
    icon: Users,
    gradient: 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)',
    shadowColor: 'rgba(14, 165, 233, 0.4)',
    hoverShadowColor: 'rgba(14, 165, 233, 0.6)',
    glowColor: 'blue-400',
  },
  preparing: {
    text: 'Preparing...',
    icon: Globe,
    gradient: 'linear-gradient(135deg, #F59E0B 0%, #EA580C 100%)',
    shadowColor: 'rgba(245, 158, 11, 0.4)',
    hoverShadowColor: 'rgba(245, 158, 11, 0.6)',
    glowColor: 'orange-400',
  },
  ready: {
    text: 'Challenge Ready!',
    icon: PlayCircle,
    gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    shadowColor: 'rgba(16, 185, 129, 0.4)',
    hoverShadowColor: 'rgba(16, 185, 129, 0.6)',
    glowColor: 'green-400',
  },
}

/**
 * Enhanced matchmaking button component - FAITHFUL CONVERSION with blue-cyan theme
 * Maintains all original functionality with improved performance and styling
 */
const MatchmakingButton = forwardRef((props, ref) => {
  const {
    // Button customization
    buttonSize = { base: 'md', md: 'lg' },
    buttonWidth = { base: '100%', md: '240px' },
    buttonHeight = { base: '48px', md: '56px' },
    buttonMinWidth = { base: '140px', md: '240px' },
    buttonTextOverride,
    iconOverride,
    bgGradientOverride,
    shadowColorOverride,
    compact = false,

    // Event handlers from parent
    onJoinMatchmaking,
    onOpenSearchModal,
    onOpenPreparationModal,

    // Enhanced modal state information from parent
    isModalMinimized = false,
    canOpenSearch = false,
    canOpenPreparation = false,
    searchModalWasMinimized = false,

    ...otherProps
  } = props

  const { t } = useTranslation('QuickClash')
  const { toast } = useToast()

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

  // Get only the state we need from the hook - EXACTLY as original
  const {
    inMatchmaking,
    matchmakingLoading,
    preparingChallenge,
    challengeReady,
    preparationProgress,
    isSocketReady,
  } = useQuickClashMatchmaking()

  // Determine current visual state - EXACTLY as original
  const currentState = useMemo(() => {
    if (challengeReady) return 'ready'
    if (preparingChallenge || preparationProgress > 0) return 'preparing'
    if (inMatchmaking) return 'searching'
    return 'idle'
  }, [challengeReady, preparingChallenge, preparationProgress, inMatchmaking])

  // Determine if button should be clickable - EXACTLY as original
  const isButtonClickable = useMemo(() => {
    switch (currentState) {
      case 'ready':
        return true // Always clickable to open preparation modal
      case 'searching':
        return canOpenSearch || searchModalWasMinimized || isModalMinimized
      case 'preparing':
        return canOpenPreparation || isModalMinimized
      case 'idle':
        return isSocketReady && !matchmakingLoading
      default:
        return false
    }
  }, [
    currentState,
    canOpenSearch,
    canOpenPreparation,
    searchModalWasMinimized,
    isModalMinimized,
    isSocketReady,
    matchmakingLoading,
  ])

  // Join matchmaking handler - EXACTLY as original
  const handleJoinMatchmaking = useCallback(() => {
    if (!isSocketReady) {
      toast({
        title: t('Connection Error'),
        description: t('Please wait for connection to be established'),
        status: 'warning',
        duration: 3000,
      })
      return
    }

    // Just call the parent's handler - don't call joinMatchmaking directly
    onJoinMatchmaking?.()
  }, [isSocketReady, onJoinMatchmaking, toast, t])

  // Enhanced click handler - EXACTLY as original logic
  const handleClick = useCallback(() => {
    console.log('[MATCHMAKING_BUTTON] Click handler called:', {
      currentState,
      canOpenSearch,
      canOpenPreparation,
      searchModalWasMinimized,
      isModalMinimized,
      isButtonClickable,
    })

    if (!isButtonClickable) {
      console.log('[MATCHMAKING_BUTTON] Button not clickable, ignoring click')
      return
    }

    switch (currentState) {
      case 'ready':
        console.log(
          '[MATCHMAKING_BUTTON] Opening preparation modal (ready state)',
        )
        onOpenPreparationModal?.()
        break

      case 'searching':
        if (canOpenSearch || searchModalWasMinimized || isModalMinimized) {
          console.log(
            '[MATCHMAKING_BUTTON] Opening search modal (searching state)',
          )
          onOpenSearchModal?.()
        } else {
          console.log('[MATCHMAKING_BUTTON] Cannot open search modal')
        }
        break

      case 'preparing':
        if (canOpenPreparation || isModalMinimized) {
          console.log(
            '[MATCHMAKING_BUTTON] Opening preparation modal (preparing state)',
          )
          onOpenPreparationModal?.()
        } else {
          console.log('[MATCHMAKING_BUTTON] Cannot open preparation modal')
        }
        break

      case 'idle':
      default:
        console.log('[MATCHMAKING_BUTTON] Joining matchmaking (idle state)')
        handleJoinMatchmaking()
        break
    }
  }, [
    currentState,
    canOpenPreparation,
    canOpenSearch,
    searchModalWasMinimized,
    isModalMinimized,
    isButtonClickable,
    onOpenPreparationModal,
    onOpenSearchModal,
    handleJoinMatchmaking,
  ])

  // Expose join function to parent components - EXACTLY as original
  useImperativeHandle(
    ref,
    () => ({
      handleJoinMatchmaking,
    }),
    [handleJoinMatchmaking],
  )

  // Button configuration - EXACTLY as original logic with new colors
  const buttonConfig = useMemo(() => {
    const config = BUTTON_STATES[currentState]

    let buttonText = config.text
    if (buttonTextOverride && currentState === 'idle') {
      buttonText = buttonTextOverride
    } else if (currentState === 'ready') {
      buttonText = challengeReady ? t('Challenge Ready!') : t('Match Found!')
    } else if (currentState === 'searching') {
      if (searchModalWasMinimized || isModalMinimized) {
        buttonText = t('Show Search')
      } else {
        buttonText = t('Searching...')
      }
    } else {
      buttonText = t(config.text)
    }

    return {
      text: buttonText,
      icon: iconOverride || config.icon,
      gradient: bgGradientOverride || config.gradient,
      shadowColor: shadowColorOverride || config.shadowColor,
      hoverShadowColor: shadowColorOverride || config.hoverShadowColor,
      glowColor: config.glowColor,
      isLoading: matchmakingLoading && currentState === 'idle',
      isDisabled: !isButtonClickable,
    }
  }, [
    currentState,
    challengeReady,
    matchmakingLoading,
    searchModalWasMinimized,
    isModalMinimized,
    isButtonClickable,
    buttonTextOverride,
    iconOverride,
    bgGradientOverride,
    shadowColorOverride,
    t,
  ])

  // Animation configuration - EXACTLY as original
  const animations = useMemo(() => {
    const base = { scale: 1, rotate: 0 }

    if (currentState === 'ready') {
      return {
        ...base,
        scale: [1, 1.02, 1],
      }
    }

    if (currentState === 'searching') {
      return {
        ...base,
      }
    }

    return base
  }, [currentState])

  // Responsive sizing
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

  const IconComponent = buttonConfig.icon

  return (
    <MotionButton
      onClick={handleClick}
      disabled={buttonConfig.isDisabled || buttonConfig.isLoading}
      className={`
        relative overflow-hidden rounded-full border-2 border-white/20
        font-bold text-white transition-all duration-200
        ${
          buttonConfig.isDisabled
            ? 'opacity-60 cursor-not-allowed'
            : 'hover:border-white/40'
        }
        ${compact ? 'mb-0' : 'mb-4'} ${sizeConfig.fontSize}
        flex items-center justify-center gap-2 text-center
        hover:-translate-y-0.5 active:translate-y-0
        focus:outline-none focus:ring-2 focus:ring-cyan-400/50
      `}
      style={{
        background: buttonConfig.gradient,
        boxShadow: `0 8px 32px ${buttonConfig.shadowColor}`,
        width: sizeConfig.width,
        height: sizeConfig.height,
        minWidth: sizeConfig.minWidth,
        textShadow: '0 2px 4px rgba(0,0,0,0.3)',
      }}
      animate={animations}
      transition={{
        duration: 0.3,
        ease: 'easeInOut',
        scale: {
          duration: 1.5,
          repeat: currentState === 'ready' ? Infinity : 0,
          repeatType: 'reverse',
        },
      }}
      whileHover={
        buttonConfig.isDisabled
          ? {}
          : {
              scale: 1.05,
              boxShadow: `0 12px 48px ${buttonConfig.hoverShadowColor}`,
              transition: { duration: 0.2 },
            }
      }
      whileTap={
        buttonConfig.isDisabled
          ? {}
          : {
              scale: 0.98,
              boxShadow: `0 6px 24px ${buttonConfig.shadowColor}`,
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
        {buttonConfig.isLoading ? (
          <Spinner size="sm" />
        ) : currentState === 'searching' && !searchModalWasMinimized ? (
          <MotionDiv
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <IconComponent className="w-5 h-5" />
          </MotionDiv>
        ) : (
          <IconComponent className="w-5 h-5" />
        )}
      </div>

      {/* Button Text */}
      <span className="relative z-10 font-bold">
        {buttonConfig.isLoading ? t('Joining...') : buttonConfig.text}
      </span>

      {/* Right Icon/Timer */}
      {currentState === 'searching' && !compact && !searchModalWasMinimized && (
        <div className="relative z-10 flex items-center">
          <span className="text-xs font-mono opacity-75">
            {/* Timer would be managed by parent component */}
          </span>
        </div>
      )}

      {/* Glow effect for active states */}
      {(currentState === 'ready' || currentState === 'searching') && (
        <MotionDiv
          className={`absolute inset-0 rounded-full bg-${buttonConfig.glowColor}/20 blur-lg`}
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
  )
})

MatchmakingButton.displayName = 'MatchmakingButton'

export default MatchmakingButton
