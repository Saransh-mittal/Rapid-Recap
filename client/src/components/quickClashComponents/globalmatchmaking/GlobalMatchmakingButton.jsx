// components/quickClashComponents/globalmatchmaking/GlobalMatchmakingButton.jsx
import React, { useState, useCallback, useMemo } from 'react'
import { Button, Icon, Tooltip } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { Users, Activity, Globe, Zap } from 'lucide-react'

// Import the modal component
import GlobalMatchmakingModal from './GlobalMatchmakingModal'

const MotionButton = motion(Button)
const MotionBox = motion.div

/**
 * Optimized Global Matchmaking Button - Main entry point
 * Handles only button rendering and modal state
 */
const GlobalMatchmakingButton = React.memo(
  ({ compact = false, renderAsModal = false, onModalClose }) => {
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
      const { inMatchmaking, battleReady, loading } = matchmakingState

      if (battleReady) {
        return {
          colorScheme: 'green',
          icon: Zap,
          tooltip: t('Battle Ready! Click to enter'),
          gradient: 'linear(to-r, green.500, teal.500)',
          text: t('Battle Ready!'),
          shouldPulse: true,
          animationType: 'pulse',
        }
      }

      if (inMatchmaking) {
        return {
          colorScheme: 'green',
          icon: Globe,
          tooltip: t('View matchmaking status'),
          gradient: 'linear(to-r, green.500, teal.500)',
          text: t('4v4 Matchmaking Active'),
          shouldPulse: true,
          animationType: 'spin',
        }
      }

      return {
        colorScheme: 'blue',
        icon: Users,
        tooltip: t('Join 4v4 Matchmaking'),
        gradient: 'linear(to-r, blue.500, purple.500)',
        text: t('Join 4v4 Matchmaking'),
        shouldPulse: false,
        animationType: 'none',
      }
    }, [matchmakingState, t])

    // Optimized handlers
    const handleOpenModal = useCallback(() => {
      setIsModalOpen(true)
    }, [])

    const handleCloseModal = useCallback(() => {
      setIsModalOpen(false)
      if (onModalClose) {
        onModalClose()
      }
    }, [onModalClose])

    // If rendering as modal content only (for SimpleCompact version)
    if (renderAsModal) {
      return (
        <GlobalMatchmakingModal
          isOpen={true}
          onClose={handleCloseModal}
          isEmbedded={true}
        />
      )
    }

    // Render appropriate button style
    const renderButton = () => {
      const { loading } = matchmakingState
      const config = buttonConfig

      if (compact) {
        return (
          <Tooltip label={config.tooltip} hasArrow>
            <MotionButton
              aria-label={config.tooltip}
              colorScheme={config.colorScheme}
              onClick={handleOpenModal}
              isLoading={loading}
              borderRadius="full"
              bgGradient={config.gradient}
              boxShadow="0 4px 10px rgba(0,0,0,0.25)"
              _hover={{ transform: 'translateY(-2px)' }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={
                config.shouldPulse
                  ? {
                      boxShadow:
                        config.animationType === 'pulse'
                          ? [
                              '0 0 0px rgba(72, 187, 120, 0.4)',
                              '0 0 20px rgba(72, 187, 120, 0.7)',
                              '0 0 0px rgba(72, 187, 120, 0.4)',
                            ]
                          : undefined,
                    }
                  : undefined
              }
              transition={
                config.shouldPulse
                  ? {
                      duration: 2,
                      repeat: Infinity,
                      repeatType: 'reverse',
                    }
                  : undefined
              }
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
          </Tooltip>
        )
      }

      return (
        <Tooltip label={config.tooltip} hasArrow>
          <MotionButton
            colorScheme={config.colorScheme}
            size="lg"
            leftIcon={<Icon as={config.icon} />}
            rightIcon={
              config.animationType === 'spin' ? (
                <MotionBox
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                >
                  <Icon as={Globe} />
                </MotionBox>
              ) : (
                <Icon as={Zap} />
              )
            }
            onClick={handleOpenModal}
            isLoading={loading}
            loadingText={t('Joining...')}
            borderRadius="full"
            px={8}
            py={7}
            mb={4}
            bgGradient={config.gradient}
            boxShadow="0 4px 20px rgba(66, 153, 225, 0.5)"
            whileHover={{
              scale: 1.05,
              boxShadow: '0 8px 30px rgba(66, 153, 225, 0.7)',
            }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.3 }}
            animate={
              config.shouldPulse
                ? {
                    boxShadow: [
                      '0 0 0px rgba(72, 187, 120, 0.4)',
                      '0 0 20px rgba(72, 187, 120, 0.7)',
                      '0 0 0px rgba(72, 187, 120, 0.4)',
                    ],
                  }
                : undefined
            }
            className="global-matchmaking-button"
          >
            {config.text}
          </MotionButton>
        </Tooltip>
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
