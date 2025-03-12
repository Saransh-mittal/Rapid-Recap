import React, { useMemo } from 'react'
import {
  Box,
  VStack,
  Text,
  Tag,
  HStack,
  Button,
  Flex,
  Icon,
  Badge,
  Center,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  Shield,
  Award,
  Target,
  Check,
  X,
  PlayCircle,
  FileText,
} from 'lucide-react'

// Import UI components
import StatusBadge from './ui/StatusBadge'
import PlayerStatus from './ui/PlayerStatus'
import ResultBanner from './ui/ResultBanner'

const MotionBox = motion(Box)

// Define animation for button pulse
const pulseAnimation = `
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
`

/**
 * Renders a single challenge item card
 */
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
  }, [challenge.status, isWinner, isTie, isDefeat, myAttempted])

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
                  animation="pulse 2s infinite ease-in-out"
                  css={pulseAnimation}
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

export default ChallengeItem
