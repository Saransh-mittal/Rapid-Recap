import React from 'react'
import {
  Box,
  VStack,
  Heading,
  Text,
  Badge,
  HStack,
  Button,
  useToast,
  Tooltip,
  Divider,
} from '@chakra-ui/react'
import { formatDistance } from 'date-fns'
import {
  Clock,
  Check,
  X,
  PlayCircle,
  Trophy,
  HourglassIcon,
} from 'lucide-react'

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
      case 'accepted':
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
const ChallengeProgress = ({ challenge }) => {
  return (
    <VStack align="stretch" spacing={2} mt={2}>
      <Text fontSize="sm" fontWeight="semibold" color="whiteAlpha.800">
        Challenge Status:
      </Text>
      <HStack spacing={4} wrap="wrap">
        <Box>
          <Text fontSize="sm" color="whiteAlpha.700" mb={1}>
            {challenge.challengerName}:
          </Text>
          <Badge
            colorScheme={
              challenge.challengerStatus === 'ready'
                ? 'yellow'
                : challenge.challengerStatus === 'completed'
                ? 'green'
                : 'gray'
            }
          >
            {challenge.challengerStatus === 'ready'
              ? 'Ready to start'
              : challenge.challengerStatus === 'completed'
              ? 'Completed'
              : 'Pending'}
          </Badge>
        </Box>
        <Box>
          <Text fontSize="sm" color="whiteAlpha.700" mb={1}>
            {challenge.opponentName}:
          </Text>
          <Badge
            colorScheme={
              challenge.opponentStatus === 'ready'
                ? 'yellow'
                : challenge.opponentStatus === 'completed'
                ? 'green'
                : 'gray'
            }
          >
            {challenge.opponentStatus === 'ready'
              ? 'Ready to start'
              : challenge.opponentStatus === 'completed'
              ? 'Completed'
              : 'Pending'}
          </Badge>
        </Box>
      </HStack>
    </VStack>
  )
}

// Individual Challenge Item Component
const ChallengeItem = ({ challenge, onAccept, onDecline, onStart }) => {
  const isChallenger = challenge.challengerId === 'current-user-id'
  const timeLeft = formatDistance(new Date(challenge.expiresAt), new Date(), {
    addSuffix: true,
  })

  const renderActionButtons = () => {
    if (challenge.status === 'pending' && !isChallenger) {
      return (
        <HStack>
          <Button
            size="sm"
            colorScheme="green"
            onClick={() => onAccept(challenge.id)}
            leftIcon={<Check size={16} />}
          >
            Accept Challenge
          </Button>
          <Button
            size="sm"
            colorScheme="red"
            variant="outline"
            onClick={() => onDecline(challenge.id)}
            leftIcon={<X size={16} />}
          >
            Decline
          </Button>
        </HStack>
      )
    }
    return null
  }

  const isReadyToStart =
    challenge.status === 'accepted' &&
    ((isChallenger && challenge.challengerStatus === 'ready') ||
      (!isChallenger && challenge.opponentStatus === 'ready'))

  return (
    <Box
      p={4}
      bg="whiteAlpha.50"
      borderRadius="lg"
      mb={3}
      border="1px solid"
      borderColor="whiteAlpha.100"
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
            colorScheme={challenge.timeLeft < 6 ? 'red' : 'yellow'}
            px={2}
            py={1}
            borderRadius="md"
            display="flex"
            alignItems="center"
            gap={1}
          >
            <HourglassIcon size={14} />
            Expires {timeLeft}
          </Badge>
        </HStack>

        <VStack align="start" spacing={2}>
          <HStack>
            <Text fontWeight="bold">
              {isChallenger ? 'Challenged:' : 'Challenger:'}
            </Text>
            <Text>
              {isChallenger ? challenge.opponentName : challenge.challengerName}
            </Text>
          </HStack>
          <Text fontSize="sm" color="whiteAlpha.700">
            Category: {challenge.category}
          </Text>
          <Text fontSize="sm" color="whiteAlpha.700">
            Created: {new Date(challenge.createdAt).toLocaleDateString()}
          </Text>
        </VStack>

        {challenge.status !== 'pending' && (
          <>
            <Divider borderColor="whiteAlpha.200" />
            <ChallengeProgress challenge={challenge} />
          </>
        )}

        <HStack justify="space-between">
          {renderActionButtons()}
          {isReadyToStart && (
            <Button
              size="sm"
              colorScheme="green"
              onClick={() => onStart(challenge.id)}
              leftIcon={<PlayCircle size={16} />}
            >
              Start Challenge
            </Button>
          )}
        </HStack>
      </VStack>
    </Box>
  )
}

// Main Active Challenges Component
const ActiveChallenges = () => {
  const toast = useToast()
  const [filter, setFilter] = React.useState('all')

  // Enhanced dummy data
  const dummyChallenges = [
    {
      id: '1',
      challengerId: 'current-user-id',
      challengerName: 'You',
      opponentId: 'user2',
      opponentName: 'John Doe',
      category: 'Current Affairs',
      status: 'pending',
      createdAt: '2024-02-23T10:00:00Z',
      expiresAt: '2024-02-24T10:00:00Z',
      timeLeft: 12,
      challengerStatus: 'ready',
      opponentStatus: 'pending',
    },
    {
      id: '2',
      challengerId: 'user3',
      challengerName: 'Jane Smith',
      opponentId: 'current-user-id',
      opponentName: 'You',
      category: 'Technology',
      status: 'accepted',
      createdAt: '2024-02-23T09:00:00Z',
      expiresAt: '2024-02-24T09:00:00Z',
      timeLeft: 4,
      challengerStatus: 'ready',
      opponentStatus: 'ready',
    },
    {
      id: '3',
      challengerId: 'current-user-id',
      challengerName: 'You',
      opponentId: 'user4',
      opponentName: 'Mike Wilson',
      category: 'Sports',
      status: 'accepted',
      createdAt: '2024-02-23T08:00:00Z',
      expiresAt: '2024-02-24T08:00:00Z',
      timeLeft: 8,
      challengerStatus: 'completed',
      opponentStatus: 'ready',
    },
    {
      id: '3',
      challengerId: 'current-user-id',
      challengerName: 'You',
      opponentId: 'user4',
      opponentName: 'Mike Wilson',
      category: 'Sports',
      status: 'accepted',
      createdAt: '2024-02-23T08:00:00Z',
      expiresAt: '2024-02-24T08:00:00Z',
      timeLeft: 8,
      challengerStatus: 'completed',
      opponentStatus: 'ready',
    },
  ]

  const filteredChallenges = React.useMemo(() => {
    let filtered = dummyChallenges

    // Filter based on type (sent/received)
    switch (filter) {
      case 'sent':
        filtered = filtered.filter(c => c.challengerId === 'current-user-id')
        break
      case 'received':
        filtered = filtered.filter(c => c.challengerId !== 'current-user-id')
        break
    }

    // Only show pending and accepted challenges
    filtered = filtered.filter(c =>
      ['pending', 'accepted', 'in_progress'].includes(c.status),
    )

    return filtered
  }, [filter])

  const handleAccept = challengeId => {
    toast({
      title: 'Challenge Accepted',
      description: 'The challenge is now ready to start!',
      status: 'success',
      duration: 3000,
      isClosable: true,
    })
  }

  const handleDecline = challengeId => {
    toast({
      title: 'Challenge Declined',
      status: 'info',
      duration: 3000,
      isClosable: true,
    })
  }

  const handleStart = challengeId => {
    toast({
      title: 'Starting Challenge',
      description: 'Preparing your reading session...',
      status: 'info',
      duration: 3000,
      isClosable: true,
    })
  }

  return (
    <Box>
      <VStack align="stretch" spacing={4}>
        <Heading size="lg" color="whiteAlpha.900">
          Active Challenges
        </Heading>

        <HStack spacing={2} mb={4}>
          <Button
            size="sm"
            colorScheme={filter === 'all' ? 'blue' : 'gray'}
            onClick={() => setFilter('all')}
          >
            All Challenges
          </Button>
          <Button
            size="sm"
            colorScheme={filter === 'sent' ? 'blue' : 'gray'}
            onClick={() => setFilter('sent')}
          >
            Sent by You
          </Button>
          <Button
            size="sm"
            colorScheme={filter === 'received' ? 'blue' : 'gray'}
            onClick={() => setFilter('received')}
          >
            Received
          </Button>
        </HStack>

        {filteredChallenges.length === 0 ? (
          <Box p={6} textAlign="center" bg="whiteAlpha.50" borderRadius="lg">
            <Text color="whiteAlpha.700">No active challenges found</Text>
          </Box>
        ) : (
          filteredChallenges.map(challenge => (
            <ChallengeItem
              key={challenge.id}
              challenge={challenge}
              onAccept={handleAccept}
              onDecline={handleDecline}
              onStart={handleStart}
            />
          ))
        )}
      </VStack>
    </Box>
  )
}

export default ActiveChallenges
