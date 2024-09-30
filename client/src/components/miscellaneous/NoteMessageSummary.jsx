import React, {
  useMemo,
  useCallback,
  lazy,
  Suspense,
  useState,
  useEffect,
} from 'react'
import {
  Box,
  VStack,
  Text,
  CloseButton,
  Button,
  useDisclosure,
  HStack,
  Divider,
  Progress,
  Flex,
  Textarea,
  Avatar,
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux'
import {
  removeNoteMessageWithId,
  setIsNotifDrawerOpen,
  setSelectedNotificationId,
  setShowingSummaryForNoteMessages,
  setShowXpLevelModal,
} from '../../redux/appSlice'
import { createHandleMessageAction } from '../../utils/messageActionHandlers'
import { useNavigate } from 'react-router-dom'
import Confetti from 'react-confetti'
import {
  formatRemainingTime,
  handleQuizFeedback,
  handleSubmitFeedback,
} from '../../utils/helper.utils'
import { useTranslation } from 'react-i18next' // Import useTranslation
import { getMilestoneInfo } from './noteMessages/milestones'
import StarRating from './noteMessages/StarRating'
import { LockIcon } from '@chakra-ui/icons'
import CalenderSVG from '../../assets/svg/CalenderSVG'

// Lazy load components and assets
const ButtonFactory = lazy(() => import('./ButtonFactory'))
const TrophySVG = lazy(() => import('../../assets/svg/TrophySVG'))
const FireSVG = lazy(() => import('../../assets/svg/FireSVG'))
const UnlinkSVG = lazy(() => import('../../assets/svg/UnlinkSVG'))
const RevivalSVG = lazy(() => import('../../assets/svg/RevivalSVG'))
const CheckCircle = lazy(() => import('../../assets/svg/CheckCircle'))

const MotionBox = motion(Box)

const NoteMessageSummary = ({ messages, onClose }) => {
  const dispatch = useDispatch()
  const { isOpen, onClose: closeDisclosure } = useDisclosure({
    defaultIsOpen: true,
  })
  const navigate = useNavigate()
  const { user } = useSelector(state => state.auth)
  const [showConfetti, setShowConfetti] = useState(false)
  const [rating, setRating] = useState(0)
  const [quizRating, setQuizRating] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [quizFeedback, setQuizFeedback] = useState('')
  const [storyId, setStoryId] = useState(null)
  const [quizId, setQuizId] = useState(null)

  // Initialize translation
  const { t } = useTranslation('NoteMessageSummary')
  const { t: GuestLoginTranslate } = useTranslation('GuestLogin')
  const { t: tournamentTranslate } = useTranslation('TournamentNoteMessage')
  const { t: UnifiedFeedbackTranslate } = useTranslation(
    'UnifiedFeedbackNoteMessage',
  )

  // Memoize handleMessageAction to prevent unnecessary re-renders
  const handleMessageAction = useMemo(
    () =>
      createHandleMessageAction(dispatch, {
        setShowingSummaryForNoteMessages,
        removeNoteMessageWithId,
        setShowXpLevelModal,
        setSelectedNotificationId,
        setIsNotifDrawerOpen,
        navigateToProfile: id => navigate(`/profile/${id}`),
        navigateToTournament: () => navigate(`/tournament`),
        handleSubmitFeedback: () => {
          handleSubmitFeedback(rating, feedback, storyId)
        },
        handleQuizFeedback: () => {
          handleQuizFeedback(quizRating, quizFeedback, quizId)
        },
      }),
    [
      dispatch,
      navigate,
      messages,
      rating,
      feedback,
      storyId,
      quizRating,
      quizFeedback,
      quizId,
    ],
  )

  // Memoize handleDismiss and handleAction to avoid recreating the functions on every render
  const handleDismiss = useCallback(
    id => {
      handleMessageAction('DISMISS', id)
    },
    [handleMessageAction],
  )

  const handleAction = useCallback(
    (actionType, messageId, payload) => {
      handleMessageAction(actionType, messageId, user?.inGameName, payload)
    },
    [handleMessageAction, user?.inGameName],
  )

  const handleClose = useCallback(() => {
    closeDisclosure()
    setTimeout(onClose, 500) // Delay to allow for exit animation
  }, [closeDisclosure, onClose])

  useEffect(() => {
    const hasMilestone = messages.some(
      message =>
        (message.messageType === 'xpAward' &&
          (message.isMilestone || message.milestoneName)) ||
        (message.messageType === 'streak' &&
          message.streakStatus === 'revived'),
    )
    if (hasMilestone) {
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 5000) // Run confetti for 5 seconds
    }
    const feedbackMessage = messages.find(
      message => message.messageType === 'storyFeedback',
    )
    if (feedbackMessage) {
      // console.log(feedbackMessage)
      setStoryId(feedbackMessage.storyId)
    }

    const quizFeedbackMessage = messages.find(
      message => message.messageType === 'quizFeedback',
    )
    if (quizFeedbackMessage) {
      console.log(quizFeedbackMessage)
      setQuizId(quizFeedbackMessage.quizId)
    }
  }, [messages])

  const getStreakIcon = streakStatus => {
    switch (streakStatus) {
      case 'broken':
        return <UnlinkSVG height="40px" width="40px" />
      case 'revival':
        return <RevivalSVG height="40px" width="40px" />
      case 'revived':
        return <CheckCircle height="40px" width="40px" />
      default:
        return <FireSVG height="40px" width="40px" />
    }
  }

  const getStreakColorScheme = streakStatus => {
    switch (streakStatus) {
      case 'broken':
        return 'red'
      case 'revival':
        return 'yellow'
      case 'revived':
        return 'green'
      default:
        return 'orange'
    }
  }
  const getIcon = tournamentStatus => {
    switch (tournamentStatus) {
      case 'registration':
        return <CalenderSVG height="40px" width="40px" />
      case 'locked':
        return <LockIcon height="40px" width="40px" />
      default:
        return <TrophySVG height="40px" width="40px" />
    }
  }

  const getColorScheme = tournamentStatus => {
    switch (tournamentStatus) {
      case 'registration':
        return 'green'
      case 'locked':
        return 'red'
      default:
        return 'blue'
    }
  }
  const getMotivationalMessage = (
    tournamentStatus,
    requiredStreak,
    userStreak,
    messageForTournamentEligibility,
    tournamentName,
  ) => {
    const randomMessageNumber = Math.floor(Math.random() * 5) + 1
    const randomMessageNumberForLocked = Math.floor(Math.random() * 3) + 1
    switch (tournamentStatus) {
      case 'registration':
        return tournamentTranslate(
          `TournamentNoteMessage.motivation.registration.${randomMessageNumber}`,
          {
            tournamentName,
          },
        )
      case 'locked':
        return (
          messageForTournamentEligibility ||
          tournamentTranslate(
            `TournamentNoteMessage.motivation.locked.${randomMessageNumberForLocked}`,
            {
              requiredStreak: requiredStreak - userStreak,
            },
          )
        )
      default:
        return tournamentTranslate('TournamentNoteMessage.motivation.default')
    }
  }
  const LeaderboardItem = ({ rank, name, score, pic, message }) => (
    <HStack spacing={2} w="100%">
      <Text
        fontWeight="bold"
        color={`${getColorScheme(message?.tournamentStatus)}.300`}
      >
        {rank}.
      </Text>
      <Avatar size="xs" src={pic} />
      <Text flex={1} color="white" isTruncated>
        {name}
      </Text>
      <Text
        fontWeight="bold"
        color={`${getColorScheme(message?.tournamentStatus)}.300`}
      >
        {score}
      </Text>
    </HStack>
  )
  const renderMessageContent = useCallback(
    message => {
      switch (message.messageType) {
        case 'xpAward':
          const milestoneInfo = message.milestoneName
            ? getMilestoneInfo(message.milestoneName)
            : null
          const totalXp = message.xpAwarded + (milestoneInfo?.xpReward || 0)

          return (
            <Suspense fallback={null}>
              <HStack spacing={3}>
                <Box
                  bg={
                    message.isMilestone || message.milestoneName
                      ? 'yellow.500'
                      : 'yellow.400'
                  }
                  borderRadius="full"
                  p={2}
                  boxShadow={
                    message.isMilestone || message.milestoneName
                      ? '0 0 20px rgba(255, 255, 0, 0.5)'
                      : '0 0 15px rgba(255, 255, 0, 0.3)'
                  }
                >
                  <TrophySVG height={'40px'} width={'40px'} />
                </Box>
                <VStack align="start" spacing={0}>
                  <Text fontWeight="bold">
                    {message.isMilestone || message.milestoneName
                      ? t('milestoneAchieved')
                      : t('milestone')}
                  </Text>
                  <Text
                    color={
                      message.isMilestone || message.milestoneName
                        ? 'purple.400'
                        : 'green.400'
                    }
                  >
                    {t('xpEarned', { totalXp })}
                  </Text>
                  {message.xpSource && (
                    <Text color="gray.400" fontSize="sm">
                      {message.xpSource}
                    </Text>
                  )}
                  {message.milestoneName && (
                    <>
                      <Text color="blue.300" fontSize="sm">
                        {t('milestone')} {message.milestoneName}
                      </Text>
                      {milestoneInfo && (
                        <Text color="gray.400" fontSize="xs">
                          {t('milestoneDescription', {
                            description: milestoneInfo.description,
                          })}
                        </Text>
                      )}
                    </>
                  )}
                  {message.isMilestone &&
                    !message.milestoneName &&
                    message.milestoneContent && (
                      <Text color="gray.400" fontSize="xs">
                        {t('milestoneContent', {
                          content: message.milestoneContent,
                        })}
                      </Text>
                    )}
                </VStack>
              </HStack>
            </Suspense>
          )
        case 'streak':
          return (
            <Suspense fallback={null}>
              <HStack spacing={3}>
                <Box
                  bg={`${getStreakColorScheme(message.streakStatus)}.400`}
                  borderRadius="full"
                  p={2}
                  boxShadow={`0 0 15px ${getStreakColorScheme(
                    message.streakStatus,
                  )}.300`}
                >
                  {getStreakIcon(message.streakStatus)}
                </Box>
                <VStack align="start" spacing={0}>
                  <Text fontWeight="bold">{message.title}</Text>
                  <Text
                    color={`${getStreakColorScheme(message.streakStatus)}.400`}
                  >
                    {message.streakStatus === 'broken'
                      ? t('streakEnded', { count: message.streakCount })
                      : t('streak', { count: message.streakCount })}
                  </Text>
                  {message.streakStatus === 'revival' &&
                    message.remainingTime && (
                      <>
                        {message.remainingQuizzes > 0 && (
                          <Text fontSize="sm" color="gray.400">
                            {t('completeMoreQuizzes', {
                              count: message.remainingQuizzes,
                              quizCount:
                                message.remainingQuizzes === 1
                                  ? t('quiz')
                                  : t('quizzes'),
                            })}
                          </Text>
                        )}
                        <Text fontSize="sm" color="gray.400">
                          {t('timeToRevive', {
                            formattedTime: formatRemainingTime(
                              message.remainingTime,
                            ),
                          })}
                        </Text>
                        <Box w="100%" mt={1}>
                          <Progress
                            value={
                              (message.remainingTime / (24 * 60 * 60)) * 100
                            }
                            size="xs"
                            colorScheme={getStreakColorScheme(
                              message.streakStatus,
                            )}
                          />
                        </Box>
                      </>
                    )}
                </VStack>
              </HStack>
            </Suspense>
          )
        case 'storyFeedback':
          return (
            <Flex
              direction="column"
              align="center"
              w="100%"
              position="relative"
            >
              <VStack spacing={4} align="center" w="100%">
                <Text fontSize="lg" fontWeight="bold" color="purple.300">
                  {UnifiedFeedbackTranslate('StoryBodyTitle')}
                </Text>
                <Suspense fallback={<Box h="40px" />}>
                  <StarRating rating={rating} onRatingChange={setRating} />
                </Suspense>
                <Textarea
                  placeholder={t('feedbackPlaceholder')}
                  value={feedback}
                  onChange={e => setFeedback(e.target.value)}
                  bg="gray.700"
                  color="white"
                  border="1px solid"
                  borderColor="purple.500"
                  _hover={{ borderColor: 'purple.400' }}
                  _focus={{
                    borderColor: 'purple.300',
                    boxShadow: '0 0 0 1px #805AD5',
                  }}
                  resize="vertical"
                />
              </VStack>
            </Flex>
          )
        case 'quizFeedback':
          return (
            <Flex
              direction="column"
              align="center"
              w="100%"
              position="relative"
            >
              <VStack spacing={4} align="center" w="100%">
                <Text fontSize="lg" fontWeight="bold" color="purple.300">
                  {UnifiedFeedbackTranslate('QuizBodyTitle')}
                </Text>
                <Suspense fallback={<Box h="40px" />}>
                  <StarRating
                    rating={quizRating}
                    onRatingChange={setQuizRating}
                  />
                </Suspense>
                <Textarea
                  placeholder={t('feedbackPlaceholder')}
                  value={quizFeedback}
                  onChange={e => setQuizFeedback(e.target.value)}
                  bg="gray.700"
                  color="white"
                  border="1px solid"
                  borderColor="purple.500"
                  _hover={{ borderColor: 'purple.400' }}
                  _focus={{
                    borderColor: 'purple.300',
                    boxShadow: '0 0 0 1px #805AD5',
                  }}
                  resize="vertical"
                />
              </VStack>
            </Flex>
          )
        case 'tournament':
          return (
            <Flex
              direction="column"
              align="center"
              w="100%"
              position="relative"
            >
              <Box
                bg={`${getColorScheme(message?.tournamentStatus)}.400`}
                borderRadius="full"
                p={2}
                mb={3}
                boxShadow={`0 0 15px ${getColorScheme(
                  message?.tournamentStatus,
                )}.300`}
              >
                <Suspense fallback={<Box width="40px" height="40px" />}>
                  {getIcon(message?.tournamentStatus)}
                </Suspense>
              </Box>
              <VStack spacing={2} align="center" w="100%">
                <Text
                  fontSize="xl"
                  fontWeight="bold"
                  color="white"
                  textAlign="center"
                >
                  {message?.tournamentName}
                </Text>
                {message?.tournamentStatus === 'registration' && (
                  <>
                    <Text fontSize="md" fontWeight="medium" color="gray.300">
                      {tournamentTranslate(
                        'TournamentNoteMessage.registrationOpen',
                      )}
                    </Text>
                    <Text fontSize="sm" color="gray.400">
                      {tournamentTranslate(
                        'TournamentNoteMessage.registrationEnds',
                      )}
                    </Text>
                    <Text
                      fontSize="md"
                      fontWeight="bold"
                      color={`${getColorScheme(message?.tournamentStatus)}.300`}
                    >
                      {formatRemainingTime(
                        new Date(message?.registrationEndTime).getTime() -
                          new Date().getTime(),
                      )}
                    </Text>
                  </>
                )}
                {message?.tournamentStatus === 'locked' && (
                  <>
                    <Text fontSize="md" fontWeight="medium" color="gray.300">
                      {tournamentTranslate(
                        'TournamentNoteMessage.streakRequired',
                        {
                          requiredStreak: message?.requiredStreak,
                        },
                      )}
                    </Text>
                    <Text fontSize="sm" color="gray.400">
                      {tournamentTranslate('TournamentNoteMessage.yourStreak', {
                        userStreak: message?.userStreak,
                      })}
                    </Text>
                    <Box w="100%" mt={2}>
                      <Progress
                        value={
                          (message?.userStreak / message?.requiredStreak) * 100
                        }
                        colorScheme={getColorScheme(message?.tournamentStatus)}
                        borderRadius="full"
                      />
                    </Box>
                  </>
                )}
                {message?.leaderboard?.length > 0 && (
                  <VStack w="100%" mt={4} spacing={2}>
                    <Text fontSize="md" fontWeight="bold" color="white">
                      {tournamentTranslate('TournamentNoteMessage.topLeaders')}
                    </Text>
                    {message?.leaderboard?.map((leader, index) => (
                      <LeaderboardItem
                        key={leader.userId}
                        rank={index + 1}
                        name={leader.inGameName || leader.name}
                        score={leader.score}
                        pic={leader.pic}
                        message={message}
                      />
                    ))}
                  </VStack>
                )}
                {(message?.leaderboard?.length === 0 ||
                  !message.leaderboard) && (
                  <Text
                    fontSize="md"
                    fontWeight="medium"
                    color={`${getColorScheme(message?.tournamentStatus)}.300`}
                    textAlign="center"
                    mt={3}
                  >
                    {getMotivationalMessage(
                      message?.tournamentStatus,
                      message?.requiredStreak,
                      message?.userStreak,
                      message?.messageForTournamentEligibility,
                      message?.tournamentName,
                    )}
                  </Text>
                )}
              </VStack>
            </Flex>
          )
        default:
          return (
            <>
              <Text fontWeight="bold">{message.title}</Text>
              <Text>{message.content}</Text>
            </>
          )
      }
    },
    [
      t,
      rating,
      setRating,
      feedback,
      setFeedback,
      quizRating,
      setQuizRating,
      quizFeedback,
      setQuizFeedback,
      storyId,
    ],
  )

  return (
    <AnimatePresence>
      {isOpen && (
        <MotionBox
          position="fixed"
          top="20px"
          right="20px"
          width="350px"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', stiffness: 100, damping: 15 }}
          zIndex={1001}
        >
          {showConfetti && (
            <Confetti
              width={window.innerWidth}
              height={window.innerHeight}
              recycle={false}
              numberOfPieces={200}
              gravity={0.2}
            />
          )}
          <Box
            bg="gray.800"
            color="gray.100"
            borderRadius="md"
            overflow="hidden"
            boxShadow="lg"
            borderWidth="1px"
            borderColor="gray.700"
          >
            <Box
              bg="gray.700"
              px={5}
              py={3}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              borderBottomWidth="1px"
              borderColor="gray.600"
            >
              <Text fontWeight="bold">{t('allMessages')}</Text>
              <CloseButton size="sm" onClick={handleClose} />
            </Box>
            <VStack
              spacing={2}
              align="stretch"
              p={4}
              maxHeight="400px"
              overflowY="auto"
            >
              {messages.map((message, index) => (
                <Box key={index} bg="gray.700" p={3} borderRadius="md">
                  {renderMessageContent(message)}
                  <HStack mt={2} spacing={2} justify={'center'}>
                    <Suspense fallback={null}>
                      {message.actions &&
                        message.actions.map((action, actionIndex) => (
                          <ButtonFactory
                            key={actionIndex}
                            actionType={action.actionType}
                            onClick={() =>
                              handleAction(
                                action.actionType,
                                message.id,
                                action.payload,
                              )
                            }
                            size="sm"
                            innerText={action.text}
                            GuestLoginTranslate={GuestLoginTranslate}
                          >
                            {!(action.actionType === 'SIGN_IN') && action.text}
                          </ButtonFactory>
                        ))}
                    </Suspense>
                    <Button size="sm" onClick={() => handleDismiss(message.id)}>
                      {t('dismiss')}
                    </Button>
                  </HStack>
                </Box>
              ))}
            </VStack>
            <Divider />
            <Box p={4}>
              <Button width="100%" onClick={handleClose}>
                {t('dismissAll')}
              </Button>
            </Box>
          </Box>
        </MotionBox>
      )}
    </AnimatePresence>
  )
}

export default NoteMessageSummary
