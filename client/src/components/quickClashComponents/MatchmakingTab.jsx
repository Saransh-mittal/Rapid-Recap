// components/quickClashComponents/MatchmakingTab.jsx
import React, { useEffect } from 'react'
import { Box, useToast } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

import MatchmakingRoom from './MatchmakingRoom'
import useQuickClashMatchmaking from '../../customHooks/useQuickClashMatchmaking'

const MotionBox = motion(Box)

const MatchmakingTab = () => {
  const { t } = useTranslation('QuickClash')
  const toast = useToast()

  // Get matchmaking state from our custom hook
  const {
    matchmakingError,
    challengeCreationError,

    checkMatchmakingStatus,
  } = useQuickClashMatchmaking()

  // Check matchmaking status on component mount
  useEffect(() => {
    checkMatchmakingStatus()
  }, [checkMatchmakingStatus])

  // Display error toast if matchmaking has an error
  useEffect(() => {
    if (matchmakingError) {
      toast({
        title: t('Error'),
        description: matchmakingError,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }, [matchmakingError, toast, t])

  // Display error toast if challenge creation has an error
  useEffect(() => {
    if (challengeCreationError) {
      toast({
        title: t('Error'),
        description: challengeCreationError,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }, [challengeCreationError, toast, t])

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Main matchmaking content */}
      <Box
        borderRadius="lg"
        bg="#1a1527"
        borderWidth="1px"
        borderColor="whiteAlpha.100"
        overflow="hidden"
      >
        <MatchmakingRoom />
      </Box>
    </MotionBox>
  )
}

export default MatchmakingTab
