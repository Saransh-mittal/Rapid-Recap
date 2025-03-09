// components/quickClashComponents/MatchmakingTab.jsx
import React, { useState, useEffect } from 'react'
import {
  Box,
  VStack,
  Text,
  Button,
  HStack,
  Flex,
  Icon,
  Divider,
  useToast,
  Collapse,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  CloseButton,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Users, Info, AlertCircle, UserCheck } from 'lucide-react'
import { useSelector } from 'react-redux'

import MatchmakingRoom from './MatchmakingRoom'
import useQuickClashMatchmaking from '../../customHooks/useQuickClashMatchmaking'

const MotionBox = motion(Box)

const MatchmakingTab = () => {
  const { t } = useTranslation('QuickClash')
  const toast = useToast()
  const [showInfo, setShowInfo] = useState(true)
  const { user } = useSelector(state => state.auth)

  // Get matchmaking state from our custom hook
  const {
    inMatchmaking,
    matchmakingLoading,
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
      {/* Info panel */}
      <Collapse in={showInfo} animateOpacity>
        <Alert
          status="info"
          variant="subtle"
          flexDirection={{ base: 'column', md: 'row' }}
          alignItems="flex-start"
          borderRadius="md"
          bg="blue.800"
          mb={4}
        >
          <AlertIcon color="blue.300" boxSize={5} mr={2} mt={1} />
          <Box flex="1">
            <AlertTitle fontSize="lg" mb={1} color="white">
              {t('Quick Matchmaking')}
            </AlertTitle>
            <AlertDescription color="whiteAlpha.900" fontSize="sm">
              {t(
                'Find opponents quickly in the matchmaking room. Join the room to make yourself available for challenges, or challenge other players directly.',
              )}
            </AlertDescription>
            <HStack mt={3} spacing={4}>
              <Flex align="center" gap={1}>
                <Icon as={UserCheck} color="green.300" boxSize={4} />
                <Text color="green.300" fontSize="sm" fontWeight="medium">
                  {t('Challenge anyone')}
                </Text>
              </Flex>
              <Flex align="center" gap={1}>
                <Icon as={Users} color="blue.300" boxSize={4} />
                <Text color="blue.300" fontSize="sm" fontWeight="medium">
                  {t('Bot opponents available')}
                </Text>
              </Flex>
            </HStack>
          </Box>
          <CloseButton
            position="absolute"
            right="8px"
            top="8px"
            color="white"
            onClick={() => setShowInfo(false)}
          />
        </Alert>
      </Collapse>

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
