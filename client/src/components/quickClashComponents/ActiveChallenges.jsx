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
  Heading,
  Text,
  Badge,
  HStack,
  Button,
  useToast,
  Divider,
  Spinner,
  Center,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Icon,
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
} from 'lucide-react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

// Lazy-loaded component
const QuizReportModal = lazy(() => import('./QuizReportModal'))

// Challenge Status Badge Component
const StatusBadge = ({ status, isChallenger }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        return {
          color: 'yellow',
          text: isChallenger ? 'Awaiting Response' : 'New Challenge',
          icon: <Clock size={14} />,
        }
      case 'active':
        return {
          color: 'green',
          text: 'Ready to Start',
          icon: <Check size={14} />,
        }
      case 'in_progress':
        return {
          color: 'blue',
          text: 'In Progress',
          icon: <PlayCircle size={14} />,
        }
      case 'completed':
        return {
          color: 'purple',
          text: 'Completed',
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
    >
      {config.icon}
      {config.text}
    </Badge>
  )
}

// Challenge Progress Component
const ChallengeProgress = ({ challenge, userId }) => {
  const isChallenger = challenge.challenger._id === userId

  return (
    <VStack align="stretch" spacing={2} mt={2}>
      <Text fontSize="sm" fontWeight="semibold" color="whiteAlpha.800">
        Challenge Status:
      </Text>
      <HStack spacing={4} wrap="wrap">
        <Box>
          <Text fontSize="sm" color="whiteAlpha.700" mb={1}>
            {challenge.challenger.inGameName || challenge.challenger.name}:
          </Text>
          <Badge
            colorScheme={challenge.challengerScore > 0 ? 'green' : 'yellow'}
          >
            {challenge.challengerScore > 0 ? 'Completed' : 'Pending'}
          </Badge>
          {challenge.challengerScore > 0 && (
            <Badge ml={2} colorScheme="blue">
              Score: {challenge.challengerScore}
            </Badge>
          )}
        </Box>
        <Box>
          <Text fontSize="sm" color="whiteAlpha.700" mb={1}>
            {challenge.opponent.inGameName || challenge.opponent.name}:
          </Text>
          <Badge colorScheme={challenge.opponentScore > 0 ? 'green' : 'yellow'}>
            {challenge.opponentScore > 0 ? 'Completed' : 'Pending'}
          </Badge>
          {challenge.opponentScore > 0 && (
            <Badge ml={2} colorScheme="blue">
              Score: {challenge.opponentScore}
            </Badge>
          )}
        </Box>
      </HStack>
    </VStack>
  )
}

// Individual Challenge Item Component
const ChallengeItem = ({
  challenge,
  userId,
  onAccept,
  onDecline,
  onStart,
  onViewReport,
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
  const opponentScore = isChallenger
    ? challenge.opponentScore
    : challenge.challengerScore
  const hasCompleted = myScore > 0

  const renderActionButtons = () => {
    if (isExpired) {
      return null
    }

    // If user has completed the challenge, show view report button
    if (hasCompleted) {
      return (
        <Button
          size="sm"
          colorScheme="purple"
          variant="outline"
          leftIcon={<FileText size={16} />}
          onClick={() => onViewReport(challenge)}
        >
          {t('View Report')}
        </Button>
      )
    }

    if (challenge.status === 'pending' && !isChallenger) {
      return (
        <HStack>
          <Button
            size="sm"
            colorScheme="green"
            onClick={() => onAccept(challenge._id)}
            leftIcon={<Check size={16} />}
          >
            {t('Accept Challenge')}
          </Button>
          <Button
            size="sm"
            colorScheme="red"
            variant="outline"
            onClick={() => onDecline(challenge._id)}
            leftIcon={<X size={16} />}
          >
            {t('Decline')}
          </Button>
        </HStack>
      )
    }

    if (challenge.status === 'active' && !hasCompleted) {
      return (
        <Button
          size="sm"
          colorScheme="green"
          onClick={() => onStart(challenge._id)}
          leftIcon={<PlayCircle size={16} />}
        >
          {t('Start Challenge')}
        </Button>
      )
    }

    return null
  }

  const isWinner =
    challenge.status === 'completed' &&
    ((isChallenger && challenge.challengerScore > challenge.opponentScore) ||
      (!isChallenger && challenge.opponentScore > challenge.challengerScore))

  const isTie =
    challenge.status === 'completed' &&
    challenge.challengerScore > 0 &&
    challenge.opponentScore > 0 &&
    challenge.challengerScore === challenge.opponentScore

  return (
    <Box
      p={4}
      bg="whiteAlpha.50"
      borderRadius="lg"
      mb={3}
      border="1px solid"
      borderColor={
        isWinner ? 'purple.400' : isTie ? 'yellow.400' : 'whiteAlpha.100'
      }
      _hover={{ bg: 'whiteAlpha.100' }}
      transition="all 0.2s"
    >
      <VStack align="stretch" spacing={3}>
        <HStack justify="space-between" wrap="wrap" gap={2}>
          <HStack>
            <Badge
              colorScheme={isChallenger ? 'blue' : 'purple'}
              px={2}
              py={1}
              borderRadius="md"
            >
              {isChallenger ? 'Created by you' : 'Received'}
            </Badge>
            <StatusBadge
              status={challenge.status}
              isChallenger={isChallenger}
            />
          </HStack>
          <Badge
            colorScheme={isExpired ? 'red' : 'yellow'}
            px={2}
            py={1}
            borderRadius="md"
            display="flex"
            alignItems="center"
            gap={1}
          >
            <HourglassIcon size={14} />
            {isExpired ? 'Expired' : `Expires ${timeLeft}`}
          </Badge>
        </HStack>

        <VStack align="start" spacing={2}>
          <HStack>
            <Text fontWeight="bold" color="white">
              {isChallenger ? 'Challenged:' : 'Challenger:'}
            </Text>
            <Text color="whiteAlpha.900">
              {isChallenger
                ? challenge.opponent.inGameName || challenge.opponent.name
                : challenge.challenger.inGameName || challenge.challenger.name}
            </Text>
          </HStack>
          <Text fontSize="sm" color="whiteAlpha.700">
            Category: {challenge.category}
          </Text>
          <Text fontSize="sm" color="whiteAlpha.700">
            Created: {new Date(challenge.createdAt).toLocaleDateString()}
          </Text>
        </VStack>

        {challenge.status !== 'pending' && challenge.status !== 'rejected' && (
          <>
            <Divider borderColor="whiteAlpha.200" />
            <ChallengeProgress challenge={challenge} userId={userId} />
          </>
        )}

        {challenge.status === 'completed' && (
          <Box
            p={2}
            bg={isWinner ? 'purple.900' : isTie ? 'yellow.900' : 'gray.800'}
            borderRadius="md"
            textAlign="center"
          >
            <Text fontWeight="bold" color="white">
              {isWinner
                ? '🎉 You won the challenge!'
                : isTie
                ? '🤝 Challenge ended in a tie!'
                : 'Better luck next time!'}
            </Text>
          </Box>
        )}

        <HStack justify="space-between">{renderActionButtons()}</HStack>
      </VStack>
    </Box>
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
    >
      <AlertDialogOverlay>
        <AlertDialogContent
          bg="gray.800"
          borderColor="whiteAlpha.200"
          borderWidth="1px"
        >
          <AlertDialogHeader fontSize="lg" fontWeight="bold" color="white">
            {title}
          </AlertDialogHeader>

          <AlertDialogBody color="whiteAlpha.800">{message}</AlertDialogBody>

          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose}>
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

// Main Active Challenges Component
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
      const isChallenger = challenge.challenger._id === userId

      // We'll need to find the session ID through an API call
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
              description: t(
                'Could not find your quiz session for this challenge',
              ),
              status: 'error',
              duration: 3000,
              isClosable: true,
            })
          }
        } catch (error) {
          console.error('Error fetching session:', error)
          toast({
            title: t('Error'),
            description: t('Failed to load your quiz session'),
            status: 'error',
            duration: 3000,
            isClosable: true,
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
          description: t('The challenge is now ready to start!'),
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
      } else if (type === 'decline') {
        await axios.post(`/api/quickClash/challenge/${id}/reject`)
        toast({
          title: t('Challenge Declined'),
          status: 'info',
          duration: 3000,
          isClosable: true,
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
      })
    } finally {
      onConfirmClose()
    }
  }

  // Check if we're still loading and no challenges have been loaded yet
  if (loading && !challenges.length) {
    return (
      <Center py={10}>
        <VStack spacing={4}>
          <Spinner size="xl" color="purple.500" thickness="4px" />
          <Text color="whiteAlpha.700">{t('Loading challenges...')}</Text>
        </VStack>
      </Center>
    )
  }

  // If there was an error and no challenges have been loaded yet
  if (error && !challenges.length) {
    return (
      <Center py={10}>
        <VStack spacing={4}>
          <Box as={AlertCircle} size="48px" color="red.400" />
          <Text color="whiteAlpha.700">{error}</Text>
          <Button colorScheme="blue" onClick={() => window.location.reload()}>
            {t('Retry')}
          </Button>
        </VStack>
      </Center>
    )
  }

  return (
    <Box>
      <VStack align="stretch" spacing={4}>
        <Heading size="lg" color="whiteAlpha.900">
          {t('Active Challenges')}
        </Heading>

        <HStack spacing={2} mb={4}>
          <Button
            size="sm"
            colorScheme={filter === 'all' ? 'blue' : 'gray'}
            onClick={() => setFilter('all')}
          >
            {t('All Challenges')}
          </Button>
          <Button
            size="sm"
            colorScheme={filter === 'sent' ? 'blue' : 'gray'}
            onClick={() => setFilter('sent')}
          >
            {t('Sent by You')}
          </Button>
          <Button
            size="sm"
            colorScheme={filter === 'received' ? 'blue' : 'gray'}
            onClick={() => setFilter('received')}
          >
            {t('Received')}
          </Button>
        </HStack>

        {filteredChallenges.length === 0 ? (
          <Box p={6} textAlign="center" bg="whiteAlpha.50" borderRadius="lg">
            <Text color="whiteAlpha.700">
              {t('No active challenges found')}
            </Text>
          </Box>
        ) : (
          filteredChallenges.map(challenge => (
            <ChallengeItem
              key={challenge._id}
              challenge={challenge}
              userId={userId}
              onAccept={handleAccept}
              onDecline={handleDecline}
              onStart={handleStart}
              onViewReport={handleViewReport}
            />
          ))
        )}
      </VStack>

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
            ? t('Are you sure you want to accept this challenge?')
            : t('Are you sure you want to decline this challenge?')
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
