// components/quickClashComponents/SimpleCompactGlobalMatchmakingButton.jsx
import React, { useState, useCallback } from 'react'
import {
  Button,
  Icon,
  // Tooltip, // Tooltip removed
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  HStack,
  Text,
  Badge,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { Users, Activity, Globe, Zap } from 'lucide-react'

// Import the full GlobalMatchmakingButton for modal content
import GlobalMatchmakingButton from './GlobalMatchmakingButton'

const MotionButton = motion(Button)
const MotionBox = motion.div

/**
 * Ultra-simple compact button that only reads Redux state
 * and opens a modal with the full GlobalMatchmakingButton
 */
const SimpleCompactGlobalMatchmakingButton = React.memo(() => {
  const { t } = useTranslation('QuickClash')
  const [isModalOpen, setIsModalOpen] = useState(false)

  // ONLY read the state we absolutely need from Redux - no hooks, no effects
  const { inMatchmaking, battleReady, loading } = useSelector(
    state => ({
      inMatchmaking: state.quickClashGlobalMatchmaking.inMatchmaking,
      battleReady: state.quickClashGlobalMatchmaking.battleReady,
      loading: state.quickClashGlobalMatchmaking.loading,
    }),
    // Use strict equality to prevent unnecessary re-renders
    (prev, next) =>
      prev.inMatchmaking === next.inMatchmaking &&
      prev.battleReady === next.battleReady &&
      prev.loading === next.loading,
  )

  // Simple handlers - no complex logic
  const handleOpenModal = useCallback(() => {
    setIsModalOpen(true)
  }, [])

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false)
  }, [])

  // Determine button appearance based on state
  const getButtonProps = () => {
    if (battleReady) {
      return {
        colorScheme: 'green',
        icon: Zap,
        // tooltip: t('Battle Ready! Click to enter'), // Tooltip text removed
        gradient: 'linear(to-r, green.500, teal.500)',
        shouldAnimate: true,
        animationType: 'pulse',
      }
    }

    if (inMatchmaking) {
      return {
        colorScheme: 'green',
        icon: Globe,
        // tooltip: t('View matchmaking status'), // Tooltip text removed
        gradient: 'linear(to-r, green.500, teal.500)',
        shouldAnimate: true,
        animationType: 'spin',
      }
    }

    return {
      colorScheme: 'blue',
      icon: Users,
      // tooltip: t('Join 4v4 Matchmaking'), // Tooltip text removed
      gradient: 'linear(to-r, blue.500, purple.500)',
      shouldAnimate: false,
      animationType: 'none',
    }
  }

  const buttonProps = getButtonProps()

  return (
    <>
      {/* Tooltip component removed */}
      <MotionButton
        aria-label={
          battleReady
            ? t('Battle Ready! Click to enter')
            : inMatchmaking
            ? t('View matchmaking status')
            : t('Join 4v4 Matchmaking')
        } // Add aria-label for accessibility since tooltip is gone
        colorScheme={buttonProps.colorScheme}
        onClick={handleOpenModal}
        isLoading={loading}
        borderRadius="full"
        bgGradient={buttonProps.gradient}
        boxShadow="0 4px 10px rgba(0,0,0,0.25)"
        _hover={{ transform: 'translateY(-2px)' }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={
          buttonProps.shouldAnimate
            ? {
                boxShadow:
                  buttonProps.animationType === 'pulse'
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
          buttonProps.shouldAnimate
            ? {
                duration: 2,
                repeat: Infinity,
                repeatType: 'reverse',
              }
            : undefined
        }
      >
        {buttonProps.animationType === 'spin' ? (
          <MotionBox
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <Icon as={buttonProps.icon} boxSize={5} />
          </MotionBox>
        ) : (
          <Icon as={buttonProps.icon} boxSize={5} />
        )}
      </MotionButton>
      {/* End of Tooltip removal */}

      {/* Modal with full functionality */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        size="lg"
        isCentered
        closeOnOverlayClick={!inMatchmaking && !battleReady} // Allow close if not in matchmaking or battle not ready
      >
        <ModalOverlay backdropFilter="blur(3px)" bg="rgba(0, 0, 0, 0.7)" />
        <ModalContent
          bg="rgba(26, 21, 39, 0.95)"
          borderRadius="xl"
          borderWidth="1px"
          borderColor={
            battleReady
              ? 'green.500'
              : inMatchmaking
              ? 'green.500'
              : 'purple.600'
          }
          boxShadow={`0 0 20px rgba(${
            battleReady
              ? '72, 187, 120, 0.4'
              : inMatchmaking
              ? '72, 187, 120, 0.4'
              : '66, 153, 225, 0.4'
          })`}
        >
          <ModalHeader
            color="white"
            borderBottomWidth="1px"
            borderColor="whiteAlpha.200"
          >
            <HStack>
              <Icon
                as={battleReady ? Zap : inMatchmaking ? Activity : Users}
                color={
                  battleReady
                    ? 'green.400'
                    : inMatchmaking
                    ? 'green.400'
                    : 'blue.400'
                }
                boxSize={5}
              />
              <Text>
                {battleReady
                  ? t('Battle Ready!')
                  : inMatchmaking
                  ? t('4v4 Matchmaking Active')
                  : t('Join 4v4 Matchmaking')}
              </Text>
              {inMatchmaking && !battleReady && (
                <Badge colorScheme="green" ml={2}>
                  {t('Finding Battle')}
                </Badge>
              )}
              {battleReady && (
                <Badge colorScheme="green" ml={2}>
                  {t('Ready to Enter')}
                </Badge>
              )}
            </HStack>
          </ModalHeader>
          <ModalCloseButton color="white" />

          <ModalBody py={0} px={0}>
            {/* The full GlobalMatchmakingButton handles all the complex logic */}
            {/* It will now render its content directly due to renderAsModal=true */}
            <GlobalMatchmakingButton
              renderAsModal={true}
              onModalClose={handleCloseModal} // Pass the callback
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
})

SimpleCompactGlobalMatchmakingButton.displayName =
  'SimpleCompactGlobalMatchmakingButton'

export default SimpleCompactGlobalMatchmakingButton
