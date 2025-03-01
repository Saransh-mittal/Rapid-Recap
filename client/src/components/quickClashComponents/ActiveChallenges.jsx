// components/quickClashComponents/ActiveChallenges.jsx
import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  lazy,
  Suspense,
} from 'react'
import {
  Box,
  VStack,
  Text,
  Badge,
  HStack,
  Button,
  useToast,
  Spinner,
  Center,
  Icon,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Flex,
  Avatar,
  Tag,
  TagLabel,
  TagLeftIcon,
} from '@chakra-ui/react'
import { formatDistance } from 'date-fns'
import {
  Clock,
  Check,
  X,
  PlayCircle,
  Trophy,
  HourglassIcon,
  AlertCircle,
  FileText,
  Users,
  Shield,
  Target,
  Flame,
} from 'lucide-react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'

// Lazy-loaded component
const QuizReportModal = lazy(() => import('./QuizReportModal'))

const MotionBox = motion(Box)
const MotionVStack = motion(VStack)

// Status Badge Component
const StatusBadge = ({ status, isChallenger }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        return {
          color: 'yellow',
          text: isChallenger ? 'Awaiting' : 'New',
          icon: <Clock size={14} />,
        }
      case 'active':
        return {
          color: 'green',
          text: 'Ready',
          icon: <Check size={14} />,
        }
      case 'in_progress':
        return {
          color: 'blue',
          text: 'Progress',
          icon: <PlayCircle size={14} />,
        }
      case 'completed':
        return {
          color: 'purple',
          text: 'Done',
          icon: <Trophy size={14} />,
        }
      case 'expired':
        return {
          color: 'red',
          text: 'Expired',
          icon: <AlertCircle size={14} />,
        }
      case 'rejected':
        return {
          color: 'red',
          text: 'Rejected',
          icon: <X size={14} />,
        }
      default:
        return {
          color: 'gray',
          text: status,
          icon: null,
        }
    }
  }

  const config = getStatusConfig()
  return (
    <Badge
      colorScheme={config.color}
      display="flex"
      alignItems="center"
      gap={1}
      px={2}
      py={1}
      borderRadius="md"
      fontSize="xs"
    >
      {config.icon}
      {config.text}
    </Badge>
  )
}

// Player Status Component
const PlayerStatus = ({ player, score, isUser }) => {
  const { t } = useTranslation('QuickClash')

  return (
    <HStack
      spacing={3}
      bg="whiteAlpha.100"
      p={2}
      borderRadius="md"
      flex={1}
      w={'100%'}
    >
      <Avatar
        name={player.name}
        src={player.pic}
        size={{ base: 'sm', md: 'md' }}
        bg={isUser ? 'purple.500' : 'gray.500'}
      />
      <Box>
        <HStack>
          <Text
            fontSize={{ base: 'sm', md: 'md' }}
            fontWeight="bold"
            color="white"
            noOfLines={1}
          >
            {player.inGameName || player.name}
          </Text>
          {isUser && (
            <Tag
              size={{ base: 'sm', md: 'md' }}
              colorScheme="purple"
              variant="subtle"
            >
              <TagLabel>{t('You')}</TagLabel>
            </Tag>
          )}
        </HStack>
        <HStack mt={1} spacing={1}>
          <Badge
            colorScheme={score > 0 ? 'green' : 'yellow'}
            fontSize={{ base: 'xs', md: 'sm' }}
          >
            {score > 0 ? t('Completed') : t('Pending')}
          </Badge>
          {score > 0 && (
            <Text
              fontSize={{ base: 'sm', md: 'md' }}
              color="blue.300"
              fontWeight="bold"
            >
              {score}
            </Text>
          )}
        </HStack>
      </Box>
    </HStack>
  )
}

// Challenge Item Component
const ChallengeItem = ({
  challenge,
  userId,
  onAccept,
  onDecline,
  onStart,
  onViewReport,
  index,
}) => {
  const { t } = useTranslation('QuickClash')
  const isChallenger = challenge.challenger._id === userId
  const timeLeft = formatDistance(new Date(challenge.expiresAt), new Date(), {
    addSuffix: true,
  })

  const isExpired = new Date(challenge.expiresAt) < new Date()
  const myScore = isChallenger
    ? challenge.challengerScore
    : challenge.opponentScore
  const hasCompleted = myScore > 0

  const isWinner =
    challenge.status === 'completed' &&
    ((isChallenger && challenge.challengerScore > challenge.opponentScore) ||
      (!isChallenger && challenge.opponentScore > challenge.challengerScore))

  const isTie =
    challenge.status === 'completed' &&
    challenge.challengerScore > 0 &&
    challenge.opponentScore > 0 &&
    challenge.challengerScore === challenge.opponentScore

  // Animation settings
  const animations = {
    hidden: { opacity: 0, y: 10 },
    visible: i => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.3,
      },
    }),
  }

  return (
    <MotionBox
      initial="hidden"
      animate="visible"
      custom={index}
      variants={animations}
      mb={3}
    >
      <Box
        bg="whiteAlpha.50"
        borderRadius="lg"
        overflow="hidden"
        borderWidth="1px"
        borderColor={
          isWinner ? 'purple.400' : isTie ? 'yellow.400' : 'whiteAlpha.100'
        }
      >
        {/* Header */}
        <Box p={3}>
          <HStack justify="space-between" mb={2}>
            <HStack>
              <StatusBadge
                status={challenge.status}
                isChallenger={isChallenger}
              />
              <Tag size={{ base: 'md' }} colorScheme="purple">
                {challenge.category}
              </Tag>
            </HStack>
            <Tag
              size="sm"
              colorScheme={isExpired ? 'red' : 'yellow'}
              variant="subtle"
            >
              <TagLeftIcon as={HourglassIcon} boxSize={3} />
              <TagLabel fontSize="xs">
                {isExpired ? t('Expired') : timeLeft}
              </TagLabel>
            </Tag>
          </HStack>

          <HStack>
            <Icon
              as={isChallenger ? Shield : Target}
              color={isChallenger ? 'blue.400' : 'purple.400'}
              boxSize={4}
            />
            <Text fontSize="sm" color="whiteAlpha.800">
              {isChallenger ? t('vs') : t('from')}{' '}
              <Text as="span" fontWeight="bold">
                {isChallenger
                  ? challenge.opponent.inGameName || challenge.opponent.name
                  : challenge.challenger.inGameName ||
                    challenge.challenger.name}
              </Text>
            </Text>
          </HStack>
        </Box>

        {/* Player Status Section */}
        {challenge.status !== 'pending' && challenge.status !== 'rejected' && (
          <Box px={3} pb={3}>
            <HStack spacing={2} display={{ base: 'none', md: 'flex' }}>
              <PlayerStatus
                player={challenge.challenger}
                score={challenge.challengerScore}
                isUser={isChallenger}
              />
              <PlayerStatus
                player={challenge.opponent}
                score={challenge.opponentScore}
                isUser={!isChallenger}
              />
            </HStack>
            <VStack spacing={2} display={{ base: 'flex', md: 'none' }}>
              <PlayerStatus
                player={challenge.challenger}
                score={challenge.challengerScore}
                isUser={isChallenger}
              />
              <PlayerStatus
                player={challenge.opponent}
                score={challenge.opponentScore}
                isUser={!isChallenger}
              />
            </VStack>
          </Box>
        )}

        {/* Result Banner */}
        {challenge.status === 'completed' && (
          <Box
            p={2}
            bg={isWinner ? 'purple.900' : isTie ? 'yellow.900' : 'gray.800'}
            textAlign="center"
          >
            <HStack spacing={1} justify="center">
              <Icon
                as={isWinner ? Trophy : isTie ? Flame : AlertCircle}
                color={
                  isWinner ? 'yellow.400' : isTie ? 'yellow.300' : 'gray.400'
                }
                boxSize={4}
              />
              <Text fontSize="sm" fontWeight="bold" color="white">
                {isWinner ? t('Victory!') : isTie ? t('Tie!') : t('Defeat')}
              </Text>
            </HStack>
          </Box>
        )}

        {/* Actions */}
        <Flex justify="center" p={2} bg="whiteAlpha.50">
          {!isExpired && (
            <>
              {hasCompleted ? (
                <Button
                  size="sm"
                  colorScheme="purple"
                  variant="outline"
                  leftIcon={<FileText size={14} />}
                  onClick={() => onViewReport(challenge)}
                  as={motion.button}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {t('View Report')}
                </Button>
              ) : challenge.status === 'pending' && !isChallenger ? (
                <HStack>
                  <Button
                    size="sm"
                    colorScheme="green"
                    onClick={() => onAccept(challenge._id)}
                    leftIcon={<Check size={14} />}
                    as={motion.button}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {t('Accept')}
                  </Button>
                  <Button
                    size="sm"
                    colorScheme="red"
                    variant="outline"
                    onClick={() => onDecline(challenge._id)}
                    leftIcon={<X size={14} />}
                    as={motion.button}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {t('Decline')}
                  </Button>
                </HStack>
              ) : challenge.status === 'active' && !hasCompleted ? (
                <Button
                  size="sm"
                  colorScheme="green"
                  onClick={() => onStart(challenge._id)}
                  leftIcon={<PlayCircle size={14} />}
                  as={motion.button}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {t('Start')}
                </Button>
              ) : null}
            </>
          )}
        </Flex>
      </Box>
    </MotionBox>
  )
}

// Confirmation Dialog Component
const ConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
}) => {
  const cancelRef = React.useRef()

  return (
    <AlertDialog
      isOpen={isOpen}
      leastDestructiveRef={cancelRef}
      onClose={onClose}
      motionPreset="scale"
    >
      <AlertDialogOverlay>
        <AlertDialogContent
          bg="gray.800"
          borderColor="whiteAlpha.200"
          borderWidth="1px"
          m={3}
        >
          <AlertDialogHeader fontSize="lg" fontWeight="bold" color="white">
            {title}
          </AlertDialogHeader>

          <AlertDialogBody color="whiteAlpha.800">{message}</AlertDialogBody>

          <AlertDialogFooter>
            <Button
              ref={cancelRef}
              onClick={onClose}
              variant="ghost"
              color="whiteAlpha.800"
              _hover={{ bg: 'whiteAlpha.100' }}
            >
              {cancelText}
            </Button>
            <Button colorScheme="red" onClick={onConfirm} ml={3}>
              {confirmText}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  )
}

// Empty State Component
const EmptyState = ({ filter }) => {
  const { t } = useTranslation('QuickClash')

  return (
    <Center py={6}>
      <MotionVStack
        spacing={4}
        p={6}
        borderRadius="lg"
        bg="whiteAlpha.50"
        borderWidth="1px"
        borderColor="whiteAlpha.100"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        maxW="90%"
        w="400px"
        textAlign="center"
      >
        <Icon
          as={
            filter === 'sent' ? Shield : filter === 'received' ? Target : Users
          }
          boxSize={8}
          color="purple.300"
        />
        <Text color="white" fontWeight="medium">
          {filter === 'sent'
            ? t('No Challenges Sent')
            : filter === 'received'
            ? t('No Challenges Received')
            : t('No Active Challenges')}
        </Text>
        <Text color="whiteAlpha.600" fontSize="sm">
          {filter === 'sent'
            ? t('Challenge someone to a knowledge duel!')
            : filter === 'received'
            ? t("You haven't received any challenges yet.")
            : t('Create a new challenge to get started!')}
        </Text>
      </MotionVStack>
    </Center>
  )
}

// Main ActiveChallenges Component
const ActiveChallenges = () => {
  const { t } = useTranslation('QuickClash')
  const toast = useToast()
  const navigate = useNavigate()
  const [filter, setFilter] = useState('all')
  const [challenges, setChallenges] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { user } = useSelector(state => state.auth)
  const userId = user?._id
  const [selectedSession, setSelectedSession] = useState(null)

  // Modal disclosures
  const {
    isOpen: isConfirmOpen,
    onOpen: onConfirmOpen,
    onClose: onConfirmClose,
  } = useDisclosure()

  const {
    isOpen: isReportOpen,
    onOpen: onReportOpen,
    onClose: onReportClose,
  } = useDisclosure()

  const [confirmAction, setConfirmAction] = useState({ type: '', id: '' })

  // Fetch challenges
  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        setLoading(true)
        const response = await axios.get('/api/quickClash/challenges')
        setChallenges(response.data.challenges || [])
        setError(null)
      } catch (err) {
        setError('Failed to load challenges. Please try again.')
        console.error('Error fetching challenges:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchChallenges()
    // Set up polling interval to refresh challenges every 30 seconds
    const intervalId = setInterval(() => {
      fetchChallenges()
    }, 30000)

    return () => clearInterval(intervalId)
  }, [])

  const filteredChallenges = useMemo(() => {
    if (!challenges || !userId) return []

    let filtered = [...challenges]

    // Filter based on type (sent/received)
    switch (filter) {
      case 'sent':
        filtered = filtered.filter(c => c.challenger._id === userId)
        break
      case 'received':
        filtered = filtered.filter(c => c.opponent._id === userId)
        break
    }
    return filtered
  }, [filter, challenges, userId])

  const handleAccept = useCallback(
    challengeId => {
      setConfirmAction({ type: 'accept', id: challengeId })
      onConfirmOpen()
    },
    [onConfirmOpen],
  )

  const handleDecline = useCallback(
    challengeId => {
      setConfirmAction({ type: 'decline', id: challengeId })
      onConfirmOpen()
    },
    [onConfirmOpen],
  )

  const handleStart = useCallback(
    challengeId => {
      navigate(`/quickclash/session/${challengeId}`)
    },
    [navigate],
  )

  const handleViewReport = useCallback(
    challenge => {
      // Find the completed session for this challenge
      const fetchSession = async () => {
        try {
          const response = await axios.get(
            `/api/quickClash/challenge/${challenge._id}/sessions?userId=${userId}`,
          )
          if (response.data && response.data.sessionId) {
            setSelectedSession(response.data.sessionId)
            onReportOpen()
          } else {
            toast({
              title: t('Error'),
              description: t('Could not find your quiz session'),
              status: 'error',
              duration: 3000,
              isClosable: true,
              position: 'top',
            })
          }
        } catch (error) {
          console.error('Error fetching session:', error)
          toast({
            title: t('Error'),
            description: t('Failed to load quiz session'),
            status: 'error',
            duration: 3000,
            isClosable: true,
            position: 'top',
          })
        }
      }

      fetchSession()
    },
    [userId, onReportOpen, toast, t],
  )

  const executeConfirmAction = async () => {
    const { type, id } = confirmAction

    try {
      if (type === 'accept') {
        await axios.post(`/api/quickClash/challenge/${id}/accept`)
        toast({
          title: t('Challenge Accepted'),
          status: 'success',
          duration: 3000,
          isClosable: true,
          position: 'top',
        })
      } else if (type === 'decline') {
        await axios.post(`/api/quickClash/challenge/${id}/reject`)
        toast({
          title: t('Challenge Declined'),
          status: 'info',
          duration: 3000,
          isClosable: true,
          position: 'top',
        })
      }

      // Refresh challenges
      const response = await axios.get('/api/quickClash/challenges')
      setChallenges(response.data.challenges || [])
    } catch (error) {
      console.error(`Error ${type}ing challenge:`, error)
      toast({
        title: t('Error'),
        description:
          error.response?.data?.message || t(`Failed to ${type} challenge`),
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
      })
    } finally {
      onConfirmClose()
    }
  }

  // Check if we're still loading and no challenges have been loaded yet
  if (loading && !challenges.length) {
    return (
      <Center py={10}>
        <VStack spacing={3}>
          <Spinner size="lg" color="purple.500" thickness="3px" speed="0.8s" />
          <Text color="whiteAlpha.700" fontSize="sm">
            {t('Loading challenges...')}
          </Text>
        </VStack>
      </Center>
    )
  }

  // If there was an error and no challenges have been loaded yet
  if (error && !challenges.length) {
    return (
      <Center py={10}>
        <VStack spacing={3}>
          <Icon as={AlertCircle} boxSize={8} color="red.400" />
          <Text color="whiteAlpha.700" fontSize="sm">
            {error}
          </Text>
          <Button
            colorScheme="purple"
            size="sm"
            onClick={() => window.location.reload()}
          >
            {t('Retry')}
          </Button>
        </VStack>
      </Center>
    )
  }

  return (
    <Box>
      <VStack align="stretch" spacing={4}>
        {/* Filter Tabs */}
        <HStack
          spacing={1}
          p={1}
          borderRadius="lg"
          bg="whiteAlpha.100"
          justify="center"
          overflowX="auto"
          mx="auto"
          maxW="320px"
          mb={3}
        >
          <Button
            size="sm"
            colorScheme={filter === 'all' ? 'purple' : 'white'}
            onClick={() => setFilter('all')}
            variant={filter === 'all' ? 'solid' : 'ghost'}
            leftIcon={<Users size={12} />}
            flexShrink={0}
          >
            {t('All')}
          </Button>
          <Button
            size="sm"
            colorScheme={filter === 'sent' ? 'purple' : 'white'}
            onClick={() => setFilter('sent')}
            variant={filter === 'sent' ? 'solid' : 'ghost'}
            leftIcon={<Shield size={12} />}
            flexShrink={0}
          >
            {t('Sent')}
          </Button>
          <Button
            size="sm"
            colorScheme={filter === 'received' ? 'purple' : 'white'}
            onClick={() => setFilter('received')}
            variant={filter === 'received' ? 'solid' : 'ghost'}
            leftIcon={<Target size={12} />}
            flexShrink={0}
          >
            {t('Received')}
          </Button>
        </HStack>

        {/* Challenge List */}
        {filteredChallenges.length === 0 ? (
          <EmptyState filter={filter} />
        ) : (
          <VStack align="stretch" spacing={2} px={1}>
            {filteredChallenges.map((challenge, index) => (
              <ChallengeItem
                key={challenge._id}
                challenge={challenge}
                userId={userId}
                onAccept={handleAccept}
                onDecline={handleDecline}
                onStart={handleStart}
                onViewReport={handleViewReport}
                index={index}
              />
            ))}
          </VStack>
        )}
      </VStack>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isConfirmOpen}
        onClose={onConfirmClose}
        onConfirm={executeConfirmAction}
        title={
          confirmAction.type === 'accept'
            ? t('Accept Challenge?')
            : t('Decline Challenge?')
        }
        message={
          confirmAction.type === 'accept'
            ? t('You can start it immediately after accepting.')
            : t('This action cannot be undone.')
        }
        confirmText={
          confirmAction.type === 'accept' ? t('Accept') : t('Decline')
        }
      />

      {/* Quiz Report Modal */}
      <Suspense fallback={null}>
        {isReportOpen && selectedSession && (
          <QuizReportModal
            isOpen={isReportOpen}
            onClose={onReportClose}
            sessionId={selectedSession}
          />
        )}
      </Suspense>
    </Box>
  )
}

export default ActiveChallenges
