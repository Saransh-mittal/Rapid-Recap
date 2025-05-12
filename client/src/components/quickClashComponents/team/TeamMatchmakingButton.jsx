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
import { Users, Activity, Zap, Lock } from 'lucide-react'

// Import our custom hook and components
import useQuickClashGlobalMatchmaking from '../../../customHooks/useQuickClashGlobalMatchmaking'
import GlobalMatchmakingPreparationModal from '../GlobalMatchmakingPreparationModal'

const MotionButton = motion(Button)

/**
 * Button component for team matchmaking
 * @param {Object} props - Component props
 * @param {string} props.teamId - Team ID
 * @param {boolean} props.compact - Whether to show compact version
 * @param {boolean} props.isLeader - Whether the current user is team leader
 */
const TeamMatchmakingButton = forwardRef(
  ({ teamId, compact = false, isLeader = false }, ref) => {
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
      if (!teamId || !isLeader) {
        return
      }

      try {
        // Get team details first to get the name
        let teamName = 'Team'
        try {
          const teamResponse = await axios.get(`/api/quickClash/team/${teamId}`)
          if (teamResponse.data && teamResponse.data.team) {
            teamName = teamResponse.data.team.name || 'Team'
          }
        } catch (teamError) {
          console.error('Error fetching team details:', teamError)
        }

        // Pass teamName to the joinWithTeam function
        await joinWithTeam(teamId, true, teamName)
        openModal()
      } catch (error) {
        // The error toasts are already handled in joinWithTeam hook
        console.error('Error joining team matchmaking:', error)
      }
    }, [joinWithTeam, teamId, openModal, isLeader])

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
            <Tooltip
              label={
                !isLeader
                  ? t('Only team leaders can start matchmaking')
                  : t('Join Team Matchmaking')
              }
            >
              <span>
                <MotionButton
                  colorScheme="blue"
                  onClick={handleJoinTeamMatchmaking}
                  isLoading={loading}
                  borderRadius="full"
                  bgGradient={
                    isLeader
                      ? 'linear(to-r, blue.500, purple.500)'
                      : 'linear(to-r, gray.500, gray.600)'
                  }
                  boxShadow="0 4px 10px rgba(0,0,0,0.25)"
                  _hover={isLeader ? { transform: 'translateY(-2px)' } : {}}
                  whileHover={{ scale: isLeader ? 1.05 : 1 }}
                  whileTap={{ scale: isLeader ? 0.95 : 1 }}
                  isDisabled={!teamId || !isLeader}
                  cursor={isLeader ? 'pointer' : 'not-allowed'}
                >
                  <Icon as={isLeader ? Users : Lock} boxSize={5} />
                </MotionButton>
              </span>
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
          <Tooltip
            label={
              !isLeader ? t('Only team leaders can start matchmaking') : ''
            }
            isDisabled={isLeader}
          >
            <span>
              <MotionButton
                colorScheme={isLeader ? 'purple' : 'gray'}
                size="lg"
                leftIcon={<Icon as={isLeader ? Users : Lock} />}
                rightIcon={isLeader ? <Icon as={Zap} /> : null}
                onClick={handleJoinTeamMatchmaking}
                isLoading={loading}
                loadingText={t('Joining...')}
                borderRadius="full"
                px={8}
                py={7}
                mb={4}
                bgGradient={
                  isLeader
                    ? 'linear(to-r, purple.600, blue.600)'
                    : 'linear(to-r, gray.600, gray.700)'
                }
                boxShadow={
                  isLeader ? '0 4px 20px rgba(124, 58, 237, 0.5)' : 'none'
                }
                whileHover={{
                  scale: isLeader ? 1.05 : 1,
                  boxShadow: isLeader
                    ? '0 8px 30px rgba(124, 58, 237, 0.7)'
                    : 'none',
                }}
                whileTap={{ scale: isLeader ? 0.98 : 1 }}
                transition={{ duration: 0.3 }}
                _hover={{
                  bgGradient: isLeader
                    ? 'linear(to-r, purple.500, blue.500)'
                    : undefined,
                }}
                _active={{
                  bgGradient: isLeader
                    ? 'linear(to-r, purple.700, blue.700)'
                    : undefined,
                }}
                isDisabled={!teamId || !isLeader}
                cursor={isLeader ? 'pointer' : 'not-allowed'}
              >
                {isLeader
                  ? t('Find Team Match')
                  : t('Only Leaders Can Start Matchmaking')}
              </MotionButton>
            </span>
          </Tooltip>
        )}

        {/* Preparation Modal */}
        <GlobalMatchmakingPreparationModal
          isOpen={isModalOpen}
          onClose={closeModal}
        />
      </>
    )
  },
)

export default TeamMatchmakingButton
