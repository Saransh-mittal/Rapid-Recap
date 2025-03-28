// TournamentNoteMessage.jsx
import React, { useMemo, lazy, Suspense } from 'react'
import {
  Text,
  VStack,
  Box,
  Flex,
  Progress,
  HStack,
  Avatar,
  Spinner,
  Divider,
  Badge,
  Icon,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import NoteMessage from '../NoteMessage'
import { formatRemainingTime } from '../../../utils/helper.utils'
import { useTranslation } from 'react-i18next'
import { LockIcon, TimeIcon } from '@chakra-ui/icons'
import TournamentOngoingMessage from './TournamentMessagesSubComp/TournamentOngoingMessage'
import { useSelector } from 'react-redux'
import { Trophy } from 'lucide-react'

// Lazy loaded components
const TrophySVG = lazy(() => import('../../../assets/svg/TrophySVG'))
const CalenderSVG = lazy(() => import('../../../assets/svg/CalenderSVG'))

// Motion components
const MotionBox = motion(Box)
const MotionFlex = motion(Flex)
const MotionText = motion(Text)
const MotionProgress = motion(Progress)
const MotionHStack = motion(HStack)
const MotionBadge = motion(Badge)

const TournamentNoteMessage = ({
  messageId,
  tournamentStatus,
  tournamentName,
  registrationEndTime,
  userStreak,
  requiredStreak,
  onClose,
  duration,
  width = '320px',
  leaderboard = [],
  messageForTournamentEligibility,
}) => {
  const { t } = useTranslation('TournamentNoteMessage')
  const { isUnderMaintenance } = useSelector(state => state.tournament)

  const getIcon = () => {
    switch (tournamentStatus) {
      case 'registration':
        return <CalenderSVG height="40px" width="40px" />
      case 'locked':
        return <LockIcon height="40px" width="40px" />
      default:
        return <TrophySVG height="40px" width="40px" />
    }
  }

  const getColorScheme = () => {
    switch (tournamentStatus) {
      case 'registration':
        return 'green'
      case 'locked':
        return 'red'
      default:
        return 'blue'
    }
  }

  const getMotivationalMessage = () => {
    const randomMessageNumber = Math.floor(Math.random() * 5) + 1
    const randomMessageNumberForLocked = Math.floor(Math.random() * 3) + 1
    switch (tournamentStatus) {
      case 'registration':
        return t(
          `TournamentNoteMessage.motivation.registration.${randomMessageNumber}`,
          {
            tournamentName,
          },
        )
      case 'locked':
        return (
          messageForTournamentEligibility ||
          t(
            `TournamentNoteMessage.motivation.locked.${randomMessageNumberForLocked}`,
            {
              requiredStreak: requiredStreak - userStreak,
            },
          )
        )
      default:
        return t('TournamentNoteMessage.motivation.default')
    }
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 10,
      },
    },
  }

  const LeaderboardItem = ({ rank, name, score, pic }) => (
    <MotionHStack
      spacing={2}
      w="100%"
      bg="rgba(255, 255, 255, 0.05)"
      p={2}
      borderRadius="md"
      variants={itemVariants}
      whileHover={{
        x: 2,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        transition: { duration: 0.2 },
      }}
    >
      <Flex
        w="24px"
        h="24px"
        borderRadius="full"
        bg={
          rank === 1
            ? 'yellow.400'
            : rank === 2
            ? 'gray.400'
            : rank === 3
            ? 'orange.400'
            : `${getColorScheme(tournamentStatus)}.500`
        }
        justify="center"
        align="center"
        boxShadow={rank <= 3 ? '0 0 10px rgba(255, 215, 0, 0.5)' : 'none'}
      >
        <Text fontWeight="bold" fontSize="xs" color="white">
          {rank}
        </Text>
      </Flex>
      <Avatar size="xs" src={pic} name={name} />
      <Text flex={1} color="white" isTruncated fontWeight="medium">
        {name}
      </Text>
      <MotionBadge
        colorScheme={getColorScheme(tournamentStatus)}
        variant="solid"
        fontWeight="bold"
        animate={
          rank <= 3
            ? {
                scale: [1, 1.1, 1],
                boxShadow: [
                  '0 0 0 rgba(255, 215, 0, 0)',
                  '0 0 10px rgba(255, 215, 0, 0.5)',
                  '0 0 0 rgba(255, 215, 0, 0)',
                ],
              }
            : {}
        }
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
      >
        {score}
      </MotionBadge>
    </MotionHStack>
  )

  const customContent = useMemo(
    () => (
      <MotionFlex
        direction="column"
        align="center"
        w="100%"
        position="relative"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <MotionBox
          bg={`${getColorScheme()}.500`}
          borderRadius="full"
          p={3}
          mb={4}
          boxShadow={`0 0 20px ${getColorScheme()}.400`}
          variants={itemVariants}
          whileHover={{
            y: -3,
            boxShadow: `0 0 25px ${getColorScheme()}.500`,
            rotate: tournamentStatus === 'ongoing' ? [0, -5, 5, -5, 0] : 0,
          }}
          transition={{
            duration: 0.5,
            times: [0, 0.25, 0.5, 0.75, 1],
          }}
        >
          <Suspense fallback={<Box width="40px" height="40px" />}>
            {getIcon()}
          </Suspense>
        </MotionBox>

        <VStack spacing={3} align="center" w="100%">
          <MotionText
            fontSize="xl"
            fontWeight="bold"
            color="white"
            textAlign="center"
            variants={itemVariants}
            textShadow="0 1px 3px rgba(0,0,0,0.3)"
          >
            {tournamentName}
          </MotionText>

          {tournamentStatus === 'ongoing' && (
            <MotionBox variants={itemVariants} width="100%">
              <Suspense
                fallback={
                  <Spinner size="md" color={`${getColorScheme()}.400`} />
                }
              >
                <TournamentOngoingMessage
                  t={t}
                  tournamentNumber={tournamentName}
                />
              </Suspense>
            </MotionBox>
          )}

          {tournamentStatus === 'registration' && (
            <MotionBox variants={itemVariants} width="100%">
              <MotionText
                fontSize="md"
                fontWeight="medium"
                color="green.300"
                mb={1}
              >
                {t('TournamentNoteMessage.registrationOpen')}
              </MotionText>

              <Flex align="center" mb={2}>
                <TimeIcon mr={2} color="green.300" />
                <MotionText fontSize="sm" color="whiteAlpha.800">
                  {t('TournamentNoteMessage.registrationEnds')}
                </MotionText>
              </Flex>

              <Flex
                align="center"
                justify="center"
                bg="rgba(72, 187, 120, 0.15)"
                borderRadius="lg"
                py={2}
                px={4}
              >
                <MotionText
                  fontSize="lg"
                  fontWeight="bold"
                  color="green.300"
                  animate={{
                    scale: [1, 1.03, 1],
                    textShadow: [
                      '0 0 0px rgba(72, 187, 120, 0)',
                      '0 0 8px rgba(72, 187, 120, 0.7)',
                      '0 0 0px rgba(72, 187, 120, 0)',
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: 'reverse',
                  }}
                >
                  {formatRemainingTime(
                    new Date(registrationEndTime).getTime() -
                      new Date().getTime(),
                  )}
                </MotionText>
              </Flex>
            </MotionBox>
          )}

          {tournamentStatus === 'locked' && (
            <MotionBox variants={itemVariants} width="100%">
              <MotionText
                fontSize="md"
                fontWeight="medium"
                color="red.300"
                mb={2}
              >
                {t('TournamentNoteMessage.streakRequired', { requiredStreak })}
              </MotionText>

              <HStack spacing={2} mb={2}>
                <Icon as={Trophy} color="yellow.400" />
                <MotionText fontSize="sm" color="whiteAlpha.800">
                  {t('TournamentNoteMessage.yourStreak', { userStreak })}
                </MotionText>
              </HStack>

              <Box position="relative" w="100%" mt={1} mb={3}>
                <MotionProgress
                  value={(userStreak / requiredStreak) * 100}
                  colorScheme={getColorScheme()}
                  borderRadius="full"
                  height="10px"
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  bg="rgba(255, 255, 255, 0.1)"
                />

                {/* Streak goal indicator */}
                <MotionBox
                  position="absolute"
                  top="-4px"
                  left={`${(requiredStreak / requiredStreak) * 100}%`}
                  transform="translateX(-50%)"
                  animate={{
                    y: [0, -3, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    repeatType: 'reverse',
                  }}
                >
                  <Icon as={Trophy} w={5} h={5} color="yellow.400" />
                </MotionBox>
              </Box>
            </MotionBox>
          )}

          {leaderboard?.length > 0 && (
            <MotionBox variants={itemVariants} w="100%" mt={2}>
              <Flex justify="space-between" align="center" mb={3}>
                <HStack>
                  <Icon as={Trophy} color={`${getColorScheme()}.400`} />
                  <Text fontSize="md" fontWeight="bold" color="white">
                    {t('TournamentNoteMessage.topLeaders')}
                  </Text>
                </HStack>
                <MotionBadge
                  colorScheme={getColorScheme()}
                  variant="subtle"
                  animate={{
                    opacity: [0.7, 1, 0.7],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                >
                  {leaderboard.length}
                </MotionBadge>
              </Flex>

              <VStack spacing={2} width="100%">
                {leaderboard?.map((leader, index) =>
                  leader?.score > 0 ? (
                    <LeaderboardItem
                      key={leader.userId}
                      rank={index + 1}
                      name={leader.inGameName || leader.name}
                      score={leader.score}
                      pic={leader.pic}
                    />
                  ) : null,
                )}
              </VStack>
            </MotionBox>
          )}

          {(leaderboard.length === 0 || !leaderboard) && (
            <MotionBox
              variants={itemVariants}
              bg={`${getColorScheme()}.500`}
              bgGradient={`linear(to-r, ${getColorScheme()}.600, ${getColorScheme()}.400)`}
              px={4}
              py={3}
              borderRadius="lg"
              mt={2}
              boxShadow={`0 2px 10px ${getColorScheme()}.600`}
              whileHover={{
                y: -2,
                boxShadow: `0 4px 15px ${getColorScheme()}.600`,
              }}
            >
              <MotionText
                fontSize="md"
                fontWeight="medium"
                color="white"
                textAlign="center"
                textShadow="0 1px 2px rgba(0,0,0,0.3)"
              >
                {getMotivationalMessage()}
              </MotionText>
            </MotionBox>
          )}
        </VStack>
      </MotionFlex>
    ),
    [
      tournamentStatus,
      tournamentName,
      registrationEndTime,
      userStreak,
      requiredStreak,
      leaderboard,
      t,
    ],
  )

  const getActions = () => {
    switch (tournamentStatus) {
      case 'registration':
        return [
          {
            text: t('TournamentNoteMessage.actions.register'),
            actionType: 'REGISTER_TOURNAMENT',
          },
        ]
      default:
        return [
          {
            text: t('TournamentNoteMessage.actions.viewTournament'),
            actionType: 'VIEW_TOURNAMENT',
          },
        ]
    }
  }

  if (isUnderMaintenance) return null

  return (
    <NoteMessage
      messageId={messageId}
      title={
        leaderboard.length === 0
          ? t('TournamentNoteMessage.title', {
              status: t(`TournamentNoteMessage.status.${tournamentStatus}`),
            })
          : t('TournamentNoteMessage.tournamentLeaderboard')
      }
      customContent={customContent}
      onClose={onClose}
      duration={duration}
      width={width}
      actions={getActions()}
    />
  )
}

export default TournamentNoteMessage
