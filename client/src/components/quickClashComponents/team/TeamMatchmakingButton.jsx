// components/quickClashComponents/team/TeamMatchmakingButton.jsx
import React, {
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from 'react'
import {
  Button,
  Spinner,
  HStack,
  Text,
  Icon,
  Badge,
  Tooltip,
  useDisclosure,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Users, Activity, Zap } from 'lucide-react'

// Import our custom hook and components
import useQuickClashGlobalMatchmaking from '../../../customHooks/useQuickClashGlobalMatchmaking'
import GlobalMatchmakingPreparationModal from '../GlobalMatchmakingPreparationModal'

const MotionButton = motion(Button)

/**
 * Button component for team matchmaking
 */
const TeamMatchmakingButton = forwardRef(({ teamId, compact = false }, ref) => {
  const { t } = useTranslation('QuickClash')

  // Use modal disclosure
  const {
    isOpen: isModalOpen,
    onOpen: openModal,
    onClose: closeModal,
  } = useDisclosure()

  // Use our global matchmaking hook
  const {
    inMatchmaking,
    selectedTeamId,
    loading,
    progress,
    step,

    joinWithTeam,
    leaveMatchmaking,
    selectTeam,
  } = useQuickClashGlobalMatchmaking()

  // Check if this specific team is in matchmaking
  const isTeamInMatchmaking = inMatchmaking && selectedTeamId === teamId

  // Expose handleJoinTeamMatchmaking method to parent components
  useImperativeHandle(ref, () => ({
    handleJoinTeamMatchmaking: () => {
      handleJoinTeamMatchmaking()
    },
  }))

  // Set the selected team when component mounts if this team is provided
  useEffect(() => {
    if (teamId && !selectedTeamId) {
      selectTeam(teamId)
    }
  }, [teamId, selectedTeamId, selectTeam])

  // Handle join team matchmaking
  const handleJoinTeamMatchmaking = useCallback(async () => {
    if (!teamId) {
      return
    }

    try {
      await joinWithTeam(teamId, true)
      openModal()
    } catch (error) {
      // The error toasts are already handled in joinWithTeam hook
      console.error('Error joining team matchmaking:', error)
    }
  }, [joinWithTeam, teamId, openModal])

  // Handle leave matchmaking
  const handleLeaveTeamMatchmaking = useCallback(async () => {
    try {
      await leaveMatchmaking()
      closeModal()
    } catch (error) {
      console.error('Error leaving team matchmaking:', error)
    }
  }, [leaveMatchmaking, closeModal])

  // Compact version for team cards
  if (compact) {
    return (
      <>
        {isTeamInMatchmaking ? (
          <Tooltip label={t('View matchmaking status')}>
            <MotionButton
              colorScheme="green"
              onClick={openModal}
              borderRadius="full"
              bgGradient="linear(to-r, green.500, teal.500)"
              boxShadow="0 4px 10px rgba(0,0,0,0.25)"
              animate={{
                boxShadow: [
                  '0 0 0px rgba(72, 187, 120, 0.4)',
                  '0 0 20px rgba(72, 187, 120, 0.7)',
                  '0 0 0px rgba(72, 187, 120, 0.4)',
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
              _hover={{ transform: 'translateY(-2px)' }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Spinner size="sm" color="white" />
            </MotionButton>
          </Tooltip>
        ) : (
          <Tooltip label={t('Join Team Matchmaking')}>
            <MotionButton
              colorScheme="blue"
              onClick={handleJoinTeamMatchmaking}
              isLoading={loading}
              borderRadius="full"
              bgGradient="linear(to-r, blue.500, purple.500)"
              boxShadow="0 4px 10px rgba(0,0,0,0.25)"
              _hover={{ transform: 'translateY(-2px)' }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              isDisabled={!teamId}
            >
              <Icon as={Users} boxSize={5} />
            </MotionButton>
          </Tooltip>
        )}

        {/* Preparation Modal */}
        <GlobalMatchmakingPreparationModal
          isOpen={isModalOpen}
          onClose={closeModal}
        />
      </>
    )
  }

  // Full-size version
  return (
    <>
      {isTeamInMatchmaking ? (
        <Tooltip label={t('View matchmaking status')}>
          <MotionButton
            colorScheme="green"
            leftIcon={<Icon as={Activity} />}
            onClick={openModal}
            borderRadius="full"
            px={6}
            py={6}
            mb={4}
            animate={{
              boxShadow: [
                '0 0 0px rgba(72, 187, 120, 0.4)',
                '0 0 20px rgba(72, 187, 120, 0.7)',
                '0 0 0px rgba(72, 187, 120, 0.4)',
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
            _hover={{ transform: 'translateY(-3px)' }}
          >
            <HStack>
              <Spinner size="sm" color="white" mr={1} />
              <Text>{t('Team Matchmaking Active')}</Text>
            </HStack>
          </MotionButton>
        </Tooltip>
      ) : (
        <MotionButton
          colorScheme="purple"
          size="lg"
          leftIcon={<Icon as={Users} />}
          rightIcon={<Icon as={Zap} />}
          onClick={handleJoinTeamMatchmaking}
          isLoading={loading}
          loadingText={t('Joining...')}
          borderRadius="full"
          px={8}
          py={7}
          mb={4}
          bgGradient="linear(to-r, purple.600, blue.600)"
          boxShadow="0 4px 20px rgba(124, 58, 237, 0.5)"
          whileHover={{
            scale: 1.05,
            boxShadow: '0 8px 30px rgba(124, 58, 237, 0.7)',
          }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.3 }}
          _hover={{
            bgGradient: 'linear(to-r, purple.500, blue.500)',
          }}
          _active={{
            bgGradient: 'linear(to-r, purple.700, blue.700)',
          }}
          isDisabled={!teamId}
        >
          {t('Find Team Match')}
        </MotionButton>
      )}

      {/* Preparation Modal */}
      <GlobalMatchmakingPreparationModal
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </>
  )
})

export default TeamMatchmakingButton
