// components/quickClashComponents/MatchmakingButton.jsx - FIXED MODAL INTERACTION
import React, {
  useMemo,
  forwardRef,
  useImperativeHandle,
  useCallback,
} from 'react'
import { Button, Spinner, Text, Icon, useToast } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Users, Shield, Globe, PlayCircle, Sword } from 'lucide-react'
import useQuickClashMatchmaking from '../../customHooks/useQuickClashMatchmaking'

const MotionButton = motion(Button)

// Button state configurations
const BUTTON_STATES = {
  idle: {
    text: 'SOLO',
    icon: Sword,
    gradient: 'linear(135deg, #667eea 0%, #764ba2 100%)',
    shadowColor: 'rgba(102, 126, 234, 0.4)',
    hoverShadowColor: 'rgba(102, 126, 234, 0.6)',
  },
  searching: {
    text: 'Searching...',
    icon: Users,
    gradient: 'linear(135deg, #667eea 0%, #764ba2 100%)',
    shadowColor: 'rgba(66, 153, 225, 0.4)',
    hoverShadowColor: 'rgba(66, 153, 225, 0.6)',
  },
  preparing: {
    text: 'Preparing...',
    icon: Globe,
    gradient: 'linear(135deg, #f093fb 0%, #f5576c 100%)',
    shadowColor: 'rgba(245, 87, 108, 0.4)',
    hoverShadowColor: 'rgba(245, 87, 108, 0.6)',
  },
  ready: {
    text: 'Challenge Ready!',
    icon: PlayCircle,
    gradient: 'linear(135deg, #4facfe 0%, #00f2fe 100%)',
    shadowColor: 'rgba(72, 187, 120, 0.4)',
    hoverShadowColor: 'rgba(72, 187, 120, 0.6)',
  },
}

/**
 * FIXED matchmaking button component with proper modal interaction
 * Handles button states and click events correctly
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

    // FIXED: Enhanced modal state information from parent
    isModalMinimized = false,
    canOpenSearch = false,
    canOpenPreparation = false,
    searchModalWasMinimized = false,

    ...otherProps
  } = props

  const { t } = useTranslation('QuickClash')
  const toast = useToast()

  // Get only the state we need from the hook
  const {
    inMatchmaking,
    matchmakingLoading,
    preparingChallenge,
    challengeReady,
    preparationProgress,
    isSocketReady,
    joinMatchmaking,
  } = useQuickClashMatchmaking()

  // Determine current visual state
  const currentState = useMemo(() => {
    if (challengeReady) return 'ready'
    if (preparingChallenge || preparationProgress > 0) return 'preparing'
    if (inMatchmaking) return 'searching'
    return 'idle'
  }, [challengeReady, preparingChallenge, preparationProgress, inMatchmaking])

  // FIXED: Determine if button should be clickable
  const isButtonClickable = useMemo(() => {
    switch (currentState) {
      case 'ready':
        return true // Always clickable to open preparation modal
      case 'searching':
        // FIXED: Clickable if modal was minimized or can be opened
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

  // Handle join matchmaking action
  const handleJoinMatchmaking = useCallback(async () => {
    if (!isSocketReady) {
      toast({
        title: t('Connection Error'),
        description: t('Please wait for connection to be established'),
        status: 'warning',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    try {
      await joinMatchmaking()
      // Let parent handle modal opening via onJoinMatchmaking callback
      onJoinMatchmaking?.()
    } catch (error) {
      toast({
        title: t('Failed to Join'),
        description: error.message || t('Could not join matchmaking'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }, [isSocketReady, joinMatchmaking, onJoinMatchmaking, toast, t])

  // FIXED: Enhanced click handler with better logic
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
        // FIXED: Better logic for reopening search modal
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
        // FIXED: Better logic for reopening preparation modal
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

  // Expose join function to parent components
  useImperativeHandle(
    ref,
    () => ({
      handleJoinMatchmaking,
    }),
    [handleJoinMatchmaking],
  )

  // Button configuration
  const buttonConfig = useMemo(() => {
    const config = BUTTON_STATES[currentState]

    let buttonText = config.text
    if (buttonTextOverride && currentState === 'idle') {
      buttonText = buttonTextOverride
    } else if (currentState === 'ready') {
      buttonText = challengeReady ? t('Challenge Ready!') : t('Match Found!')
    } else if (currentState === 'searching') {
      // FIXED: Show different text based on modal state
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

  // Animation configuration
  const animations = useMemo(() => {
    const base = { scale: 1, rotate: 0 }

    if (currentState === 'ready') {
      return {
        ...base,
        boxShadow: [
          `0 8px 32px ${buttonConfig.shadowColor}`,
          `0 12px 48px ${buttonConfig.hoverShadowColor}`,
          `0 8px 32px ${buttonConfig.shadowColor}`,
        ],
        scale: [1, 1.02, 1],
      }
    }

    if (currentState === 'searching') {
      return {
        ...base,
        boxShadow: [
          `0 8px 32px ${buttonConfig.shadowColor}`,
          `0 12px 48px ${buttonConfig.hoverShadowColor}`,
          `0 8px 32px ${buttonConfig.shadowColor}`,
        ],
      }
    }

    return base
  }, [currentState, buttonConfig.shadowColor, buttonConfig.hoverShadowColor])

  return (
    <MotionButton
      size={buttonSize}
      leftIcon={
        currentState === 'searching' && !searchModalWasMinimized ? (
          <Spinner size="sm" />
        ) : (
          <Icon as={buttonConfig.icon} boxSize={5} />
        )
      }
      rightIcon={
        currentState === 'searching' && !compact && !searchModalWasMinimized ? (
          <Text fontSize="xs" fontFamily="mono">
            {/* Timer would be managed by parent component */}
          </Text>
        ) : null
      }
      onClick={handleClick}
      isLoading={buttonConfig.isLoading}
      loadingText={t('Joining...')}
      isDisabled={buttonConfig.isDisabled}
      // Styling
      borderRadius="full"
      mb={compact ? 0 : 4}
      bgGradient={buttonConfig.gradient}
      boxShadow={`0 8px 32px ${buttonConfig.shadowColor}`}
      border="2px solid"
      borderColor="whiteAlpha.200"
      color="white"
      fontWeight="bold"
      fontSize={{ base: 'sm', md: 'md' }}
      textShadow="0 2px 4px rgba(0,0,0,0.3)"
      position="relative"
      overflow="hidden"
      // Fixed sizing
      w={buttonWidth}
      h={buttonHeight}
      minW={buttonMinWidth}
      // Hover states
      _hover={{
        transform: buttonConfig.isDisabled ? 'none' : 'translateY(-2px)',
        boxShadow: buttonConfig.isDisabled
          ? `0 8px 32px ${buttonConfig.shadowColor}`
          : `0 12px 48px ${buttonConfig.hoverShadowColor}`,
        borderColor: buttonConfig.isDisabled
          ? 'whiteAlpha.200'
          : 'whiteAlpha.400',
      }}
      _active={{
        transform: buttonConfig.isDisabled ? 'none' : 'translateY(0px)',
        boxShadow: `0 6px 24px ${buttonConfig.shadowColor}`,
      }}
      _disabled={{
        opacity: 0.6,
        cursor: 'not-allowed',
        transform: 'none',
      }}
      // Animations
      animate={animations}
      transition={{
        duration: 0.3,
        ease: 'easeInOut',
        boxShadow: {
          duration: 2,
          repeat:
            currentState === 'ready' || currentState === 'searching'
              ? Infinity
              : 0,
          repeatType: 'reverse',
        },
        scale: {
          duration: 1.5,
          repeat: currentState === 'ready' ? Infinity : 0,
          repeatType: 'reverse',
        },
      }}
      whileHover={{
        scale: buttonConfig.isDisabled ? 1 : 1.05,
        transition: { duration: 0.2 },
      }}
      whileTap={{
        scale: buttonConfig.isDisabled ? 1 : 0.98,
        transition: { duration: 0.1 },
      }}
      // Glassmorphism effect
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background:
          'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
        borderRadius: 'full',
        pointerEvents: 'none',
      }}
      {...otherProps}
    >
      {buttonConfig.text}
    </MotionButton>
  )
})

MatchmakingButton.displayName = 'MatchmakingButton'

export default MatchmakingButton
