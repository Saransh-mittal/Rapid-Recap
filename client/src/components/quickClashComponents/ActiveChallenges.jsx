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
  Tooltip,
  Divider,
  Heading,
  IconButton,
  useColorModeValue,
  Grid,
  GridItem,
} from '@chakra-ui/react'
import { formatDistance, formatDistanceToNow } from 'date-fns'
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
  ChevronRight,
  Zap,
  Star,
  Award,
  Calendar,
} from 'lucide-react'
import { keyframes } from '@emotion/react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import useQuickClash from '../../customHooks/useQuickClash'
import useQuickClashSocket from '../../customHooks/useQuickClashSocket'

// Lazy-loaded component
const QuizReportModal = lazy(() => import('./QuizReportModal'))

const MotionBox = motion(Box)
const MotionVStack = motion(VStack)
const MotionFlex = motion(Flex)
const MotionHStack = motion(HStack)

// Glow animation for important elements
const glowAnimation = keyframes`
0% { box-shadow: 0 0 5px rgba(124, 58, 237, 0.3); }
50% { box-shadow: 0 0 15px rgba(124, 58, 237, 0.6); }
100% { box-shadow: 0 0 5px rgba(124, 58, 237, 0.3); }
`
const pulseAnimation = keyframes`
0% { transform: scale(1); }
50% { transform: scale(1.05); }
100% { transform: scale(1); }
`

// Status Badge Component with expiry time
const StatusBadge = ({ status, isChallenger, expiresAt }) => {
  const { t } = useTranslation('QuickClash')

  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        return {
          color: 'yellow',
          text: isChallenger ? t('Awaiting') : t('New'),
          icon: <Clock size={14} />,
        }
      case 'active':
        return {
          color: 'green',
          text: t('Ready'),
          icon: <Zap size={14} />,
        }
      case 'in_progress':
        return {
          color: 'blue',
          text: t('Progress'),
          icon: <PlayCircle size={14} />,
        }
      case 'completed':
        return {
          color: 'purple',
          text: t('Done'),
          icon: <Check size={14} />,
        }
      case 'rejected':
        return {
          color: 'red',
          text: t('Rejected'),
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
  const isExpired = new Date(expiresAt) < new Date()

  // Don't show status badge for expired or completed challenges
  if ((isExpired && status !== 'rejected') || status === 'completed') {
    return null
  }

  return (
    <Flex w="100%" justify="space-between" align="center">
      <Badge
        colorScheme={config.color}
        display="flex"
        alignItems="center"
        gap={1}
        px={2}
        py={1}
        borderRadius="full"
        fontSize="xs"
        boxShadow={
          status === 'active' || status === 'pending'
            ? `0 0 10px var(--chakra-colors-${config.color}-500)`
            : 'none'
        }
      >
        {config.icon}
        {config.text}
      </Badge>

      {/* Show expiry time only for active and pending challenges */}
      {(status === 'active' || status === 'pending') && expiresAt && (
        <Tooltip label={t('Time left until expiry')}>
          <Badge
            colorScheme="gray"
            variant="subtle"
            fontSize="2xs"
            display="flex"
            alignItems="center"
            gap={1}
            borderRadius="full"
            px={2}
            ml="auto"
          >
            <Icon as={HourglassIcon} boxSize={3} />
            {formatDistanceToNow(new Date(expiresAt), { addSuffix: true })}
          </Badge>
        </Tooltip>
      )}
    </Flex>
  )
}

// Score Display Component
const ScoreDisplay = ({ score, size = 'md' }) => {
  const bgGradient = useColorModeValue(
    'linear(to-r, purple.600, blue.400)',
    'linear(to-r, purple.500, blue.300)',
  )

  return (
    <Center
      w={size === 'sm' ? '32px' : '40px'}
      h={size === 'sm' ? '32px' : '40px'}
      borderRadius="full"
      bgGradient={bgGradient}
      color="white"
      fontWeight="bold"
      fontSize={size === 'sm' ? 'xs' : 'sm'}
      boxShadow="0 0 10px rgba(124, 58, 237, 0.5)"
    >
      {score}
    </Center>
  )
}

// Player Status Component
const PlayerStatus = ({ player, score, attempted, isUser }) => {
  const { t } = useTranslation('QuickClash')
  const bgGradient = isUser
    ? 'linear(to-r, purple.900, purple.800)'
    : 'linear(to-r, gray.800, gray.700)'
  const borderColor = isUser ? 'purple.500' : 'whiteAlpha.200'

  const userAnimation = isUser
    ? {
        initial: { scale: 0.95 },
        animate: {
          scale: 1,
          transition: {
            type: 'spring',
            stiffness: 300,
            damping: 15,
          },
        },
      }
    : {}

  return (
    <MotionBox
      px={3}
      py={2}
      borderRadius="lg"
      bgGradient={bgGradient}
      borderWidth="1px"
      borderColor={borderColor}
      width="100%"
      overflow="hidden"
      position="relative"
      {...userAnimation}
    >
      {isUser && (
        <Box
          position="absolute"
          top={0}
          right={0}
          w="40px"
          h="40px"
          bg="purple.500"
          transform="rotate(45deg) translate(28px, -28px)"
          zIndex={0}
        />
      )}

      <HStack spacing={3} position="relative" zIndex={1}>
        <Avatar
          name={player.name}
          src={player.pic}
          size="sm"
          bg={isUser ? 'purple.400' : 'gray.500'}
          borderWidth={2}
          borderColor={isUser ? 'purple.200' : 'transparent'}
        />

        <Box flex={1}>
          <HStack justifyContent="space-between" mb={1}>
            <Text
              fontSize="sm"
              fontWeight="bold"
              color="white"
              noOfLines={1}
              maxW="150px"
            >
              {player.inGameName || player.name}
              {isUser && (
                <Tag size="sm" ml={1} colorScheme="purple" variant="solid">
                  {t('You')}
                </Tag>
              )}
            </Text>

            {attempted && <ScoreDisplay score={score} size="sm" />}
          </HStack>

          <Badge
            colorScheme={attempted ? 'green' : 'yellow'}
            fontSize="xs"
            variant={attempted ? 'solid' : 'outline'}
            borderRadius="full"
          >
            {attempted ? t('Completed') : t('Pending')}
          </Badge>
        </Box>
      </HStack>
    </MotionBox>
  )
}

const StatusSection = ({
  title,
  icon,
  challenges,
  userId,
  handlers,
  animationDelay = 0,
}) => {
  if (!challenges || challenges.length === 0) return null

  const { onAccept, onDecline, onStart, onViewReport } = handlers

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: 1,
        y: 0,
        transition: {
          delay: animationDelay,
          duration: 0.4,
          type: 'spring',
          stiffness: 100,
          damping: 15,
        },
      }}
    >
      <HStack mb={3} spacing={2}>
        <Icon as={icon} color="purple.400" boxSize={5} />
        <Heading size="sm" color="white">
          {title} ({challenges.length})
        </Heading>
      </HStack>

      <Grid
        templateColumns={{
          base: '1fr',
          md: 'repeat(2, 1fr)',
          lg: 'repeat(3, 1fr)',
        }}
        gap={4}
      >
        {challenges.map((challenge, index) => (
          <GridItem key={challenge._id}>
            <ChallengeItem
              challenge={challenge}
              userId={userId}
              onAccept={onAccept}
              onDecline={onDecline}
              onStart={onStart}
              onViewReport={onViewReport}
              index={index}
            />
          </GridItem>
        ))}
      </Grid>
    </MotionBox>
  )
}
const ResultBanner = ({ isWinner, isTie, isDefeat, expiresAt, category }) => {
  const { t } = useTranslation('QuickClash')
  const isExpired = new Date(expiresAt) < new Date()

  // Adjust the condition to always show the banner for completed challenges
  if (isExpired && !isWinner && !isTie && !isDefeat) return null

  const getCategoryStyle = category => {
    const categoryColors = {
      World: 'blue',
      Politics: 'red',
      Business: 'green',
      Technology: 'cyan',
      Sports: 'orange',
      Health: 'teal',
      Science: 'purple',
      Environment: 'green',
    }
    return categoryColors[category] || 'purple'
  }

  const bgGradient = isWinner
    ? 'linear(to-r, purple.600, blue.500)'
    : isTie
    ? 'linear(to-r, yellow.600, orange.500)'
    : 'linear(to-r, red.700, red.600)'

  const icon = isWinner ? Trophy : isTie ? Flame : AlertCircle

  const text = isWinner ? t('Victory!') : isTie ? t('Tie!') : t('Defeat!')

  const iconAnimation = {
    animate: {
      scale: [1, 1.2, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: 'reverse',
      },
    },
  }

  return (
    <MotionFlex
      py={2}
      px={4}
      bgGradient={bgGradient}
      borderBottomRadius="lg"
      alignItems="center"
      justifyContent="space-between"
      color="white"
      fontWeight="bold"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <HStack>
        <MotionBox {...iconAnimation} display="flex" alignItems="center">
          <Icon
            as={icon}
            color={isWinner ? 'yellow.300' : isTie ? 'yellow.200' : 'red.300'}
            mr={2}
          />
        </MotionBox>
        <Text textTransform="uppercase" letterSpacing="wide">
          {isWinner ? t('Victory!') : isTie ? t('Tie!') : t('Defeat!')}
        </Text>
      </HStack>

      {/* Category badge in the banner */}
      <Badge
        colorScheme={getCategoryStyle(category)}
        fontSize="xs"
        borderRadius="full"
        px={2}
      >
        {category}
      </Badge>
    </MotionFlex>
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
  const opponent = isChallenger ? challenge.opponent : challenge.challenger

  const myAttempted = isChallenger
    ? challenge.challengerAttempted
    : challenge.opponentAttempted

  const isExpired = new Date(challenge.expiresAt) < new Date()
  const myScore = isChallenger
    ? challenge.challengerScore
    : challenge.opponentScore
  const hasCompleted = myScore > 0

  const isWinner =
    challenge.status === 'completed' &&
    challenge.challengerAttempted &&
    challenge.opponentAttempted &&
    ((isChallenger && challenge.challengerScore > challenge.opponentScore) ||
      (!isChallenger && challenge.opponentScore > challenge.challengerScore))

  const isTie =
    challenge.status === 'completed' &&
    challenge.challengerAttempted &&
    challenge.opponentAttempted &&
    challenge.challengerScore === challenge.opponentScore

  const isDefeat =
    challenge.status === 'completed' &&
    challenge.challengerAttempted &&
    challenge.opponentAttempted &&
    !isWinner &&
    !isTie

  // Challenge Item animation
  const animations = {
    hidden: { opacity: 0, y: 20, scale: 0.97 },
    visible: i => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        delay: i * 0.08,
        duration: 0.4,
        type: 'spring',
        stiffness: 150,
        damping: 15,
      },
    }),
    hover: {
      scale: 1.03,
      boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)',
      y: -3,
      transition: { duration: 0.2 },
    },
  }

  // Determine card background and styles based on status
  const cardStyles = useMemo(() => {
    let borderColorStyle = 'whiteAlpha.200'
    let boxShadowStyle = 'none'

    if (challenge.status === 'completed') {
      if (isWinner) {
        borderColorStyle = 'purple.400'
        boxShadowStyle = '0 0 15px rgba(124, 58, 237, 0.3)'
      } else if (isTie) {
        borderColorStyle = 'yellow.400'
      } else if (isDefeat) {
        borderColorStyle = 'red.400'
        boxShadowStyle = '0 0 15px rgba(245, 101, 101, 0.3)'
      }
    } else if (challenge.status === 'active' && !myAttempted) {
      borderColorStyle = 'green.400'
      boxShadowStyle = '0 0 10px rgba(72, 187, 120, 0.3)'
    } else if (challenge.status === 'pending') {
      // Use gold border for both 'New' and 'Awaiting' status
      borderColorStyle = 'yellow.400'
      boxShadowStyle = '0 0 10px rgba(236, 201, 75, 0.2)'
    }

    return {
      borderColor: borderColorStyle,
      boxShadow: boxShadowStyle,
    }
  }, [challenge.status, isWinner, isTie, isDefeat, myAttempted, isChallenger])

  // Determine category badge style
  const getCategoryStyle = () => {
    const categoryColors = {
      World: 'blue',
      Politics: 'red',
      Business: 'green',
      Technology: 'cyan',
      Sports: 'orange',
      Health: 'teal',
      Science: 'purple',
      Environment: 'green',
    }

    return categoryColors[challenge.category] || 'purple'
  }

  // Determine if we should show player status section
  const showPlayerStatus =
    challenge.status !== 'pending' && challenge.status !== 'rejected'

  // Determine if we should show the opponent info
  const showOpponentInfo = !(
    challenge.status === 'completed' &&
    challenge.challengerAttempted &&
    challenge.opponentAttempted
  )

  return (
    <MotionBox
      initial="hidden"
      animate="visible"
      custom={index}
      variants={animations}
      whileHover="hover"
      mb={4}
      position="relative"
    >
      <Box
        bg="rgba(26, 32, 44, 0.8)"
        borderRadius="lg"
        overflow="hidden"
        borderWidth="1px"
        borderColor={cardStyles.borderColor}
        boxShadow={cardStyles.boxShadow}
        transition="all 0.3s"
        position="relative"
      >
        {/* Card Header - Only show status badge, not category (category will be shown in body for pending/new) */}
        {challenge.status !== 'completed' && (
          <Flex
            p={3}
            justify="space-between"
            align="center"
            borderBottomWidth="1px"
            borderBottomColor="whiteAlpha.100"
            bg="rgba(45, 55, 72, 0.3)"
          >
            <StatusBadge
              status={challenge.status}
              isChallenger={isChallenger}
              expiresAt={challenge.expiresAt}
            />
          </Flex>
        )}

        {/* Card Body */}
        <Box p={3}>
          {/* For pending/new challenges, show category and opponent in body */}
          {(challenge.status === 'pending' ||
            (challenge.status === 'active' && !showPlayerStatus)) && (
            <HStack mb={3} justify="space-between">
              <HStack spacing={2}>
                <Icon
                  as={isChallenger ? Shield : Award}
                  color={isChallenger ? 'blue.400' : 'purple.400'}
                  boxSize={5}
                />
                <Text fontSize="sm" color="whiteAlpha.800">
                  {isChallenger ? t('vs') : t('from')}{' '}
                  <Text as="span" fontWeight="bold" color="white">
                    {opponent.inGameName || opponent.name}
                  </Text>
                </Text>
              </HStack>

              <Tag
                size="sm"
                colorScheme={getCategoryStyle()}
                borderRadius="full"
                px={3}
              >
                <Icon as={Target} size={12} mr={1} />
                {challenge.category}
              </Tag>
            </HStack>
          )}

          {/* Player Status Section for active or completed challenges */}
          {showPlayerStatus && (
            <VStack spacing={2} align="stretch" mb={2}>
              <PlayerStatus
                player={challenge.challenger}
                score={challenge.challengerScore}
                attempted={challenge.challengerAttempted}
                isUser={isChallenger}
              />

              <Center py={1}>
                <Tag
                  size="sm"
                  colorScheme="gray"
                  variant="subtle"
                  borderRadius="full"
                >
                  {t('vs')}
                </Tag>
              </Center>

              <PlayerStatus
                player={challenge.opponent}
                score={challenge.opponentScore}
                attempted={challenge.opponentAttempted}
                isUser={!isChallenger}
              />
            </VStack>
          )}

          {/* Actions */}
          {!isExpired && (
            <Flex
              justify="center"
              mt={3}
              p={2}
              bg="whiteAlpha.50"
              borderRadius="md"
            >
              {myAttempted ? (
                <Button
                  size="sm"
                  colorScheme="purple"
                  variant="outline"
                  leftIcon={<FileText size={14} />}
                  onClick={() => onViewReport(challenge)}
                  as={motion.button}
                  whileTap={{ scale: 0.95 }}
                  fontWeight="medium"
                  _hover={{
                    bg: 'purple.700',
                    borderColor: 'purple.400',
                  }}
                >
                  {t('View Report')}
                </Button>
              ) : challenge.status === 'pending' && !isChallenger ? (
                <HStack spacing={3}>
                  <Button
                    size="sm"
                    colorScheme="green"
                    onClick={() => onAccept(challenge._id)}
                    leftIcon={<Check size={14} />}
                    as={motion.button}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.95 }}
                    fontWeight="medium"
                    boxShadow="0 0 8px rgba(72, 187, 120, 0.4)"
                    _hover={{
                      boxShadow: '0 0 12px rgba(72, 187, 120, 0.6)',
                    }}
                  >
                    {t('Accept')}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    colorScheme="red"
                    onClick={() => onDecline(challenge._id)}
                    leftIcon={<X size={14} />}
                    as={motion.button}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.95 }}
                    fontWeight="medium"
                  >
                    {t('Decline')}
                  </Button>
                </HStack>
              ) : challenge.status === 'active' && !myAttempted ? (
                <Button
                  size="sm"
                  colorScheme="green"
                  onClick={() => onStart(challenge._id)}
                  leftIcon={<PlayCircle size={14} />}
                  as={motion.button}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  fontWeight="bold"
                  px={6}
                  boxShadow="0 0 10px rgba(72, 187, 120, 0.4)"
                  _hover={{
                    boxShadow: '0 0 15px rgba(72, 187, 120, 0.7)',
                  }}
                  animation={`${pulseAnimation} 2s infinite ease-in-out`}
                >
                  {t('Start')}
                </Button>
              ) : null}
            </Flex>
          )}
        </Box>

        {/* Result Banner - Show for completed challenges */}
        {challenge.status === 'completed' &&
          challenge.challengerAttempted &&
          challenge.opponentAttempted && (
            <ResultBanner
              isWinner={isWinner}
              isTie={isTie}
              isDefeat={isDefeat}
              expiresAt={challenge.expiresAt}
              category={challenge.category}
            />
          )}
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
      isCentered
    >
      <AlertDialogOverlay backdropFilter="blur(8px)" bg="rgba(0, 0, 0, 0.4)">
        <AlertDialogContent
          bg="gray.800"
          borderColor="purple.700"
          borderWidth="1px"
          borderRadius="xl"
          boxShadow="0 10px 30px rgba(0, 0, 0, 0.5)"
          mx={4}
          overflow="hidden"
        >
          <AlertDialogHeader
            fontSize="lg"
            fontWeight="bold"
            color="white"
            bgGradient="linear(to-r, purple.900, gray.800)"
            py={3}
          >
            {title}
          </AlertDialogHeader>

          <AlertDialogBody color="whiteAlpha.800" py={5} fontSize="md">
            {message}
          </AlertDialogBody>

          <AlertDialogFooter
            bg="whiteAlpha.50"
            borderTopWidth="1px"
            borderTopColor="whiteAlpha.100"
          >
            <Button
              ref={cancelRef}
              onClick={onClose}
              variant="ghost"
              color="whiteAlpha.800"
              _hover={{ bg: 'whiteAlpha.100' }}
              size="md"
              fontWeight="medium"
            >
              {cancelText}
            </Button>
            <Button
              colorScheme="purple"
              onClick={onConfirm}
              ml={3}
              size="md"
              fontWeight="medium"
            >
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

  const getEmptyStateContent = () => {
    switch (filter) {
      case 'sent':
        return {
          icon: Shield,
          title: t('No Challenges Sent'),
          description: t('Challenge someone to a knowledge duel!'),
          color: 'blue.400',
        }
      case 'received':
        return {
          icon: Target,
          title: t('No Challenges Received'),
          description: t("You haven't received any challenges yet."),
          color: 'purple.400',
        }
      default:
        return {
          icon: Zap,
          title: t('No Active Challenges'),
          description: t('Create a new challenge to get started!'),
          color: 'yellow.400',
        }
    }
  }

  const content = getEmptyStateContent()

  return (
    <Center py={8}>
      <MotionVStack
        spacing={6}
        p={8}
        borderRadius="lg"
        bg="rgba(26, 32, 44, 0.8)"
        borderWidth="1px"
        borderColor="whiteAlpha.200"
        initial={{ opacity: 0, y: 20 }}
        animate={{
          opacity: 1,
          y: 0,
          transition: {
            type: 'spring',
            stiffness: 150,
            damping: 20,
          },
        }}
        maxW="90%"
        w="400px"
        textAlign="center"
        boxShadow="0 10px 30px rgba(0, 0, 0, 0.1)"
      >
        <MotionBox
          animate={{
            scale: [1, 1.1, 1],
            transition: {
              duration: 3,
              repeat: Infinity,
              repeatType: 'reverse',
            },
          }}
        >
          <Icon as={content.icon} boxSize={12} color={content.color} />
        </MotionBox>

        <VStack spacing={2}>
          <Heading size="md" color="white" fontWeight="bold">
            {content.title}
          </Heading>
          <Text color="whiteAlpha.700" fontSize="sm">
            {content.description}
          </Text>
        </VStack>
      </MotionVStack>
    </Center>
  )
}

// Custom Gradient Filter Tab
const FilterTab = ({ isSelected, label, icon, onClick }) => {
  return (
    <Button
      variant={isSelected ? 'solid' : 'ghost'}
      colorScheme={isSelected ? 'purple' : 'white'}
      leftIcon={<Icon as={icon} boxSize={4} />}
      onClick={onClick}
      borderRadius="full"
      size="sm"
      fontWeight={isSelected ? 'bold' : 'medium'}
      px={4}
      boxShadow={isSelected ? '0 0 12px rgba(124, 58, 237, 0.3)' : 'none'}
      transition="all 0.3s ease"
      _hover={{
        transform: 'translateY(-2px)',
        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)',
      }}
    >
      {label}
    </Button>
  )
}

// Main ActiveChallenges Component
const ActiveChallenges = () => {
  const { t } = useTranslation('QuickClash')
  const toast = useToast()
  const navigate = useNavigate()
  const [filter, setFilter] = useState('all')
  const {
    activeChallenges: challenges,
    activeChallengesLoading: loading,
    activeChallengesError: error,
    loadActiveChallenges,
    handleAcceptChallenge,
    handleRejectChallenge,
  } = useQuickClash()
  const { emitChallengeAccepted, emitChallengeRejected } = useQuickClashSocket()
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
    if (userId) {
      loadActiveChallenges()
    }
  }, [userId, loadActiveChallenges])

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

    // Sort challenges by status and date (pending first, then active, expired last)
    filtered.sort((a, b) => {
      const statusOrder = {
        active: 0,
        pending: 1,
        completed: 2,
        expired: 3,
        rejected: 4,
      }

      // First sort by status
      const statusDiff = statusOrder[a.status] - statusOrder[b.status]
      if (statusDiff !== 0) return statusDiff

      // For same status, sort by date (newest first)
      return new Date(b.createdAt) - new Date(a.createdAt)
    })

    return filtered
  }, [filter, challenges, userId])

  const groupedChallenges = useMemo(() => {
    if (!filteredChallenges.length) return {}

    // Group challenges by status
    return filteredChallenges.reduce((groups, challenge) => {
      const isChallenger = challenge.challenger._id === userId
      let statusGroup

      if (challenge.status === 'completed') {
        statusGroup = 'completed'
      } else if (challenge.status === 'active') {
        statusGroup = 'active'
      } else if (challenge.status === 'pending') {
        statusGroup = isChallenger ? 'awaiting' : 'new'
      } else if (challenge.status === 'rejected') {
        statusGroup = 'rejected'
      } else {
        statusGroup = 'other'
      }

      if (!groups[statusGroup]) {
        groups[statusGroup] = []
      }

      groups[statusGroup].push(challenge)
      return groups
    }, {})
  }, [filteredChallenges, userId])

  // Define display order and labels for status groups
  const statusGroups = [
    { key: 'new', label: t('New Challenges'), icon: Target },
    { key: 'active', label: t('Ready to Play'), icon: Zap },
    { key: 'awaiting', label: t('Awaiting Response'), icon: HourglassIcon },
    { key: 'completed', label: t('Completed'), icon: Trophy },
    { key: 'rejected', label: t('Rejected'), icon: X },
    { key: 'other', label: t('Other'), icon: FileText },
  ]

  // Filter tab animations
  const tabContainerVariants = {
    initial: { opacity: 0, y: -10 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.1,
        duration: 0.3,
        when: 'beforeChildren',
        staggerChildren: 0.1,
      },
    },
  }

  const tabVariants = {
    initial: { opacity: 0, y: -10 },
    animate: { opacity: 1, y: 0 },
  }

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
              position: 'top-right',
              variant: 'subtle',
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
            position: 'top-right',
            variant: 'subtle',
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
        const challenge = await handleAcceptChallenge(id)

        // If successful, emit socket event
        if (challenge) {
          emitChallengeAccepted({
            challengerId: challenge.challenger._id,
            challengeId: challenge._id,
            category: challenge.category,
          })
        }
      } else if (type === 'decline') {
        const challenge = await handleRejectChallenge(id)

        // If successful, emit socket event
        if (challenge) {
          emitChallengeRejected({
            challengerId: challenge.challenger._id,
            challengeId: challenge._id,
            category: challenge.category,
          })
        }
      }

      // No need to fetch challenges again as Redux will update the state
    } catch (error) {
      console.error(`Error ${type}ing challenge:`, error)
    } finally {
      onConfirmClose()
    }
  }

  // Check if we're still loading and no challenges have been loaded yet
  if (loading && !challenges.length) {
    return (
      <Center py={12}>
        <VStack spacing={5}>
          <Spinner
            size="xl"
            color="purple.500"
            thickness="4px"
            speed="0.8s"
            emptyColor="gray.700"
          />
          <Text color="whiteAlpha.800" fontWeight="medium">
            {t('Loading challenges...')}
          </Text>
        </VStack>
      </Center>
    )
  }

  // If there was an error and no challenges have been loaded yet
  if (error && !challenges.length) {
    return (
      <Center py={12}>
        <VStack
          spacing={5}
          bg="gray.800"
          p={6}
          borderRadius="lg"
          borderWidth="1px"
          borderColor="red.500"
          maxW="400px"
        >
          <Icon as={AlertCircle} boxSize={10} color="red.400" />
          <Text color="white" fontWeight="medium" textAlign="center">
            {error}
          </Text>
          <Button colorScheme="purple" onClick={() => loadActiveChallenges()}>
            {t('Retry')}
          </Button>
        </VStack>
      </Center>
    )
  }

  return (
    <Box>
      <VStack align="stretch" spacing={6}>
        {/* Filter Tabs */}
        <MotionHStack
          spacing={3}
          p={2}
          borderRadius="full"
          bg="rgba(26, 32, 44, 0.6)"
          justify="center"
          overflowX="auto"
          mx="auto"
          maxW="350px"
          boxShadow="0 5px 15px rgba(0, 0, 0, 0.1)"
          variants={tabContainerVariants}
          initial="initial"
          animate="animate"
        >
          <motion.div variants={tabVariants}>
            <FilterTab
              isSelected={filter === 'all'}
              label={t('All')}
              icon={Zap}
              onClick={() => setFilter('all')}
            />
          </motion.div>
          <motion.div variants={tabVariants}>
            <FilterTab
              isSelected={filter === 'sent'}
              label={t('Sent')}
              icon={Shield}
              onClick={() => setFilter('sent')}
            />
          </motion.div>
          <motion.div variants={tabVariants}>
            <FilterTab
              isSelected={filter === 'received'}
              label={t('Received')}
              icon={Target}
              onClick={() => setFilter('received')}
            />
          </motion.div>
        </MotionHStack>

        {/* Challenge Count */}
        {filteredChallenges.length > 0 && filter !== 'all' && (
          <MotionBox
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            textAlign="center"
          >
            <Text color="whiteAlpha.700" fontSize="sm">
              {filteredChallenges.length}{' '}
              {filteredChallenges.length === 1
                ? t('challenge')
                : t('challenges')}{' '}
              {filter === 'sent'
                ? t('sent')
                : filter === 'received'
                ? t('received')
                : ''}
            </Text>
          </MotionBox>
        )}

        {/* Challenge List Grouped by Status */}
        <AnimatePresence>
          {filteredChallenges.length === 0 ? (
            <EmptyState filter={filter} />
          ) : (
            <VStack spacing={8} align="stretch" px={1}>
              {/* Use StatusSection component for each group */}
              {statusGroups.map((group, idx) => (
                <StatusSection
                  key={group.key}
                  title={group.label}
                  icon={group.icon}
                  challenges={groupedChallenges[group.key] || []}
                  userId={userId}
                  handlers={{
                    onAccept: handleAccept,
                    onDecline: handleDecline,
                    onStart: handleStart,
                    onViewReport: handleViewReport,
                  }}
                  animationDelay={idx * 0.1}
                />
              ))}
            </VStack>
          )}
        </AnimatePresence>
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
