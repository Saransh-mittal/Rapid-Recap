// components/quickClashComponents/globalmatchmaking/GlobalMatchmakingButton.jsx - REDESIGNED WITH CONSISTENT SIZING
import React, { useState, useCallback, useMemo } from 'react'
import { Button, Icon } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { Users, Activity, Globe, Zap, Shield } from 'lucide-react'

// Import the modal component
import GlobalMatchmakingModal from './GlobalMatchmakingModal'

const MotionButton = motion(Button)
const MotionBox = motion.div

// Enhanced button states with better visual design (matching MatchmakingButton)
const GLOBAL_BUTTON_STATES = {
  idle: {
    text: 'SQUAD',
    icon: Shield,
    colorScheme: 'blue',
    gradient: 'linear(135deg, #667eea 0%, #764ba2 100%)',
    shadowColor: 'rgba(102, 126, 234, 0.4)',
    hoverShadowColor: 'rgba(102, 126, 234, 0.6)',
  },
  searching: {
    text: 'Active',
    icon: Users,
    colorScheme: 'green',
    gradient: 'linear(135deg, #11998e 0%, #38ef7d 100%)',
    shadowColor: 'rgba(72, 187, 120, 0.4)',
    hoverShadowColor: 'rgba(72, 187, 120, 0.6)',
  },
  ready: {
    text: 'Battle Ready!',
    icon: Zap,
    colorScheme: 'green',
    gradient: 'linear(135deg, #4facfe 0%, #00f2fe 100%)',
    shadowColor: 'rgba(79, 172, 254, 0.4)',
    hoverShadowColor: 'rgba(79, 172, 254, 0.6)',
  },
}

/**
 * Redesigned Global Matchmaking Button with Fixed Sizing - Main entry point
 * Handles only button rendering and modal state
 */
const GlobalMatchmakingButton = React.memo(
  ({
    compact = false,
    renderAsModal = false,
    onModalClose,
    // Fixed sizing props to match MatchmakingButton exactly
    buttonSize = { base: 'md', md: 'lg' },
    buttonWidth = { base: '100%', md: '240px' }, // Same fixed width as MatchmakingButton
    buttonHeight = { base: '48px', md: '56px' }, // Same fixed height as MatchmakingButton
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

    // Only subscribe to essential state with shallow comparison
    const matchmakingState = useSelector(
      state => ({
        inMatchmaking: state.quickClashGlobalMatchmaking.inMatchmaking,
        battleReady: state.quickClashGlobalMatchmaking.battleReady,
        loading: state.quickClashGlobalMatchmaking.loading,
        battleCreationStatus:
          state.quickClashGlobalMatchmaking.battleCreationStatus,
      }),
      (prev, next) =>
        prev.inMatchmaking === next.inMatchmaking &&
        prev.battleReady === next.battleReady &&
        prev.loading === next.loading &&
        prev.battleCreationStatus === next.battleCreationStatus,
    )

    // Memoize button configuration to prevent recalculation
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

    // Enhanced button animations (matching MatchmakingButton)
    const buttonAnimation = useMemo(() => {
      const baseAnimation = {
        scale: 1,
        rotate: 0,
      }

      if (buttonConfig.currentState === 'ready') {
        return {
          ...baseAnimation,
          boxShadow: [
            `0 8px 32px ${buttonConfig.shadowColor}`,
            `0 12px 48px ${buttonConfig.hoverShadowColor}`,
            `0 8px 32px ${buttonConfig.shadowColor}`,
          ],
          scale: [1, 1.02, 1],
        }
      }
      if (buttonConfig.currentState === 'searching') {
        return {
          ...baseAnimation,
          boxShadow: [
            `0 8px 32px ${buttonConfig.shadowColor}`,
            `0 12px 48px ${buttonConfig.hoverShadowColor}`,
            `0 8px 32px ${buttonConfig.shadowColor}`,
          ],
        }
      }
      return baseAnimation
    }, [
      buttonConfig.currentState,
      buttonConfig.shadowColor,
      buttonConfig.hoverShadowColor,
    ])

    const handleOpenModal = useCallback(() => {
      setIsModalOpen(true)
    }, [])

    const handleCloseModal = useCallback(() => {
      setIsModalOpen(false)
      if (onModalClose) {
        onModalClose()
      }
    }, [onModalClose])

    if (renderAsModal) {
      return (
        <GlobalMatchmakingModal
          isOpen={true}
          onClose={handleCloseModal}
          isEmbedded={true}
        />
      )
    }

    const renderButton = () => {
      const { loading } = matchmakingState
      const config = buttonConfig

      if (compact) {
        return (
          <MotionButton
            colorScheme={config.colorScheme}
            onClick={handleOpenModal}
            isLoading={loading}
            borderRadius="full"
            bgGradient={config.gradient}
            boxShadow={`0 8px 32px ${config.shadowColor}`}
            border="2px solid"
            borderColor="whiteAlpha.200"
            color="white"
            fontWeight="bold"
            textShadow="0 2px 4px rgba(0,0,0,0.3)"
            _hover={{
              transform: 'translateY(-2px)',
              boxShadow: `0 12px 48px ${config.hoverShadowColor}`,
              borderColor: 'whiteAlpha.400',
            }}
            _active={{
              transform: 'translateY(0px)',
              boxShadow: `0 6px 24px ${config.shadowColor}`,
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            {...otherProps}
          >
            {config.animationType === 'spin' ? (
              <MotionBox
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              >
                <Icon as={config.icon} boxSize={5} />
              </MotionBox>
            ) : (
              <Icon as={config.icon} boxSize={5} />
            )}
          </MotionButton>
        )
      }

      return (
        <MotionButton
          size={buttonSize}
          leftIcon={<Icon as={config.icon} boxSize={5} />}
          rightIcon={
            config.animationType === 'spin' ? (
              <MotionBox
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              >
                <Icon as={Globe} boxSize={4} />
              </MotionBox>
            ) : null
          }
          onClick={handleOpenModal}
          isLoading={loading}
          loadingText={t('Joining...')}
          borderRadius="full"
          mb={4}
          bgGradient={config.gradient}
          boxShadow={`0 8px 32px ${config.shadowColor}`}
          border="2px solid"
          borderColor="whiteAlpha.200"
          color="white"
          fontWeight="bold"
          fontSize={{ base: 'sm', md: 'md' }}
          textShadow="0 2px 4px rgba(0,0,0,0.3)"
          position="relative"
          overflow="hidden"
          className="global-matchmaking-button"
          _hover={{
            transform: 'translateY(-2px)',
            boxShadow: `0 12px 48px ${config.hoverShadowColor}`,
            borderColor: 'whiteAlpha.400',
          }}
          _active={{
            transform: 'translateY(0px)',
            boxShadow: `0 6px 24px ${config.shadowColor}`,
          }}
          _disabled={{
            opacity: 0.6,
            cursor: 'not-allowed',
            transform: 'none',
          }}
          // Fixed sizing props (exactly matching MatchmakingButton)
          w={buttonWidth}
          h={buttonHeight}
          minW={buttonMinWidth}
          // Enhanced animations
          animate={buttonAnimation}
          transition={{
            duration: 0.3,
            ease: 'easeInOut',
            boxShadow: {
              duration: 2,
              repeat: config.shouldPulse ? Infinity : 0,
              repeatType: 'reverse',
            },
            scale: {
              duration: 1.5,
              repeat: config.currentState === 'ready' ? Infinity : 0,
              repeatType: 'reverse',
            },
          }}
          whileHover={{
            scale: loading ? 1 : 1.05,
            transition: { duration: 0.2 },
          }}
          whileTap={{
            scale: loading ? 1 : 0.98,
            transition: { duration: 0.1 },
          }}
          {...otherProps}
          // Glassmorphism effect (matching MatchmakingButton)
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
        >
          {t(config.text)}
        </MotionButton>
      )
    }

    return (
      <>
        {renderButton()}
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
