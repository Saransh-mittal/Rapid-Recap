import React from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Box,
  Text,
  Badge,
  HStack,
  VStack,
  Flex,
  Icon,
  useBreakpointValue,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import {
  BarChart,
  Calendar,
  User,
  Trophy,
  Medal,
  UserCheck,
  ArrowRight,
} from 'lucide-react'
import { format } from 'date-fns'
import { useTranslation } from 'react-i18next'

// Motion components
const MotionBox = motion(Box)
const MotionBadge = motion(Badge)

const ChallengeDetailsModal = ({ isOpen, onClose, challenge, userId }) => {
  const { t } = useTranslation('QuickClash')
  const isMobile = useBreakpointValue({ base: true, md: false })

  if (!challenge) return null

  // Challenge details
  const isChallenger = challenge.challenger._id === userId
  const won = challenge.winner && challenge.winner === userId
  const tied =
    challenge.challengerScore > 0 &&
    challenge.opponentScore > 0 &&
    challenge.challengerScore === challenge.opponentScore

  const myScore = isChallenger
    ? challenge.challengerScore
    : challenge.opponentScore
  const opponentScore = isChallenger
    ? challenge.opponentScore
    : challenge.challengerScore
  const opponentName = isChallenger
    ? challenge.opponent.inGameName
    : challenge.challenger.inGameName

  // Result configuration
  const resultConfig = {
    badge: won
      ? { text: t('Victory'), color: 'green' }
      : tied
      ? { text: t('Tie'), color: 'yellow' }
      : challenge.winner
      ? { text: t('Defeat'), color: 'red' }
      : { text: t('Incomplete'), color: 'gray' },
  }

  // Detail items with icons, labels and values
  const detailItems = [
    {
      icon: BarChart,
      color: 'blue.400',
      label: t('Category'),
      value: challenge.category,
    },
    {
      icon: Calendar,
      color: 'green.400',
      label: t('Created'),
      value: format(new Date(challenge.createdAt), 'PPP'),
    },
    {
      icon: isChallenger ? UserCheck : User,
      color: 'purple.400',
      label: t('Challenger'),
      value: `${challenge.challenger.name} (@${challenge.challenger.inGameName})`,
    },
    {
      icon: !isChallenger ? UserCheck : User,
      color: 'blue.400',
      label: t('Opponent'),
      value: `${challenge.opponent.name} (@${challenge.opponent.inGameName})`,
    },
    {
      icon: Trophy,
      color: 'yellow.400',
      label: `${challenge.challenger.inGameName}'s Score`,
      value: challenge.challengerScore || t('Did not complete'),
    },
    {
      icon: Trophy,
      color: 'yellow.400',
      label: `${challenge.opponent.inGameName}'s Score`,
      value: challenge.opponentScore || t('Did not complete'),
    },
    {
      icon: Medal,
      color: won ? 'green.400' : tied ? 'yellow.400' : 'red.400',
      label: t('Winner'),
      value: challenge.winner
        ? won
          ? t('You')
          : isChallenger
          ? challenge.opponent.inGameName
          : challenge.challenger.inGameName
        : tied
        ? t('Tie')
        : t('Incomplete'),
    },
  ]

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={isMobile ? 'full' : 'md'}
      motionPreset="slideInBottom"
      isCentered={!isMobile}
    >
      <ModalOverlay backdropFilter="blur(8px)" />
      <ModalContent
        bg="#1a1527"
        borderRadius="xl"
        borderWidth="1px"
        borderColor="whiteAlpha.100"
        boxShadow="0 8px 32px rgba(0,0,0,0.5)"
        overflow="hidden"
        mx={2}
      >
        {/* Header with trophy icon and result badge */}
        <ModalHeader
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          color="white"
          pb={3}
        >
          <HStack>
            <Icon as={Trophy} color="purple.400" />
            <Text>{t('Challenge Details')}</Text>
          </HStack>

          <MotionBadge
            colorScheme={resultConfig.badge.color}
            px={3}
            py={1}
            borderRadius="full"
            display="flex"
            alignItems="center"
            position={'absolute'}
            right={'3.8rem'}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            {resultConfig.badge.text}
          </MotionBadge>
        </ModalHeader>

        <ModalCloseButton color="white" />

        <ModalBody pb={6}>
          {/* Score comparison card */}
          <MotionBox
            mb={5}
            p={4}
            bg="rgba(26, 32, 44, 0.5)"
            borderRadius="lg"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Flex justify="space-between" align="center">
              <VStack align="start" spacing={0}>
                <Text color="whiteAlpha.700" fontSize="sm">
                  {t('Your Score')}
                </Text>
                <Text color="white" fontSize="3xl" fontWeight="bold">
                  {myScore || 0}
                </Text>
              </VStack>

              <Box px={4} textAlign="center">
                <Icon as={ArrowRight} color="purple.400" boxSize={5} />
              </Box>

              <VStack align="end" spacing={0}>
                <Text color="whiteAlpha.700" fontSize="sm">
                  {opponentName}
                </Text>
                <Text color="white" fontSize="3xl" fontWeight="bold">
                  {opponentScore || 0}
                </Text>
              </VStack>
            </Flex>
          </MotionBox>

          {/* Detail items */}
          <VStack spacing={3} align="stretch">
            {detailItems.map((item, index) => (
              <MotionBox
                key={index}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                <HStack spacing={4}>
                  <Flex
                    w="44px"
                    h="44px"
                    bg="whiteAlpha.100"
                    borderRadius="md"
                    justify="center"
                    align="center"
                  >
                    <Icon as={item.icon} color={item.color} boxSize={5} />
                  </Flex>

                  <Box>
                    <Text fontSize="sm" color="whiteAlpha.600" mb={0.5}>
                      {item.label}
                    </Text>
                    <Text fontWeight="bold" color="white">
                      {item.value}
                    </Text>
                  </Box>
                </HStack>
              </MotionBox>
            ))}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default React.memo(ChallengeDetailsModal)
