// components/quickClashComponents/GlobalMatchmakingFloatingButton.jsx
import React, { useState } from 'react'
import {
  Box,
  Button,
  Tooltip,
  Icon,
  VStack,
  Text,
  HStack,
  Spinner,
  useDisclosure,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Users, Zap, Activity } from 'lucide-react'
import { keyframes } from '@emotion/react'

// Import our custom hook and components
import useQuickClashGlobalMatchmaking from '../../customHooks/useQuickClashGlobalMatchmaking'
import GlobalMatchmakingButton from './GlobalMatchmakingButton'
import GlobalMatchmakingPreparationModal from './GlobalMatchmakingPreparationModal'

const MotionButton = motion(Button)
const MotionBox = motion(Box)

// Pulse animation for active matchmaking
const pulsing = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(92, 219, 149, 0.7); }
  70% { box-shadow: 0 0 0 10px rgba(92, 219, 149, 0); }
  100% { box-shadow: 0 0 0 0 rgba(92, 219, 149, 0); }
`

/**
 * Floating button for Global Matchmaking that can be fixed to bottom of screen
 */
const GlobalMatchmakingFloatingButton = ({ position = 'bottom-right' }) => {
  const { t } = useTranslation('QuickClash')

  // Use matchmaking hook
  const { inMatchmaking, step } = useQuickClashGlobalMatchmaking()

  // Modal state
  const {
    isOpen: isModalOpen,
    onOpen: openModal,
    onClose: closeModal,
  } = useDisclosure()

  const {
    isOpen: isPrepModalOpen,
    onOpen: openPrepModal,
    onClose: closePrepModal,
  } = useDisclosure()

  // Open the appropriate modal based on matchmaking state
  const handleButtonClick = () => {
    if (inMatchmaking && step) {
      openPrepModal() // Show progress modal if matchmaking is in progress
    } else {
      openModal() // Show standard matchmaking modal
    }
  }

  // Determine position styles
  const getPositionStyles = () => {
    switch (position) {
      case 'bottom-right':
        return {
          bottom: '20px',
          right: '20px',
        }
      case 'bottom-left':
        return {
          bottom: '20px',
          left: '20px',
        }
      case 'top-right':
        return {
          top: '20px',
          right: '20px',
        }
      case 'top-left':
        return {
          top: '20px',
          left: '20px',
        }
      default:
        return {
          bottom: '20px',
          right: '20px',
        }
    }
  }

  return (
    <>
      <MotionBox
        position="fixed"
        zIndex={1000}
        {...getPositionStyles()}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 20,
        }}
      >
        <Tooltip
          label={
            inMatchmaking
              ? t('View Matchmaking Status')
              : t('Join 4v4 Matchmaking')
          }
          placement="top"
          hasArrow
        >
          <MotionButton
            onClick={handleButtonClick}
            size="lg"
            borderRadius="full"
            boxShadow="0 4px 20px rgba(0, 0, 0, 0.3)"
            h="60px"
            w="60px"
            colorScheme={inMatchmaking ? 'green' : 'blue'}
            bgGradient={
              inMatchmaking
                ? 'linear(to-r, green.500, teal.500)'
                : 'linear(to-r, blue.500, purple.500)'
            }
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.2 }}
            _hover={{
              transform: 'translateY(-2px)',
            }}
            css={
              inMatchmaking
                ? {
                    animation: `${pulsing} 2s infinite`,
                  }
                : {}
            }
          >
            {inMatchmaking ? (
              <Spinner size="md" color="white" />
            ) : (
              <Icon as={Users} boxSize={6} />
            )}
          </MotionButton>
        </Tooltip>
      </MotionBox>

      {/* Render the matchmaking button (which contains the main modal) */}
      <GlobalMatchmakingButton
        isOpen={isModalOpen}
        onClose={closeModal}
        compact={true}
        hidden={true}
      />

      {/* Render preparation modal */}
      <GlobalMatchmakingPreparationModal
        isOpen={isPrepModalOpen}
        onClose={closePrepModal}
      />
    </>
  )
}

export default GlobalMatchmakingFloatingButton
