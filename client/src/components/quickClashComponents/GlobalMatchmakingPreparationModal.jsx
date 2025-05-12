import React from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Text,
  VStack,
  Box,
  Flex,
  HStack,
  Icon,
  Spinner,
  Badge,
  Center,
  Tooltip,
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import {
  Users,
  Search,
  FileText,
  CheckCircle,
  AlertCircle,
  Zap,
  BookOpen,
  Target,
  CloudLightning,
  User,
  UserPlus,
  Info,
} from 'lucide-react'

// Import our custom hook
import useQuickClashGlobalMatchmaking from '../../customHooks/useQuickClashGlobalMatchmaking'

const MotionBox = motion(Box)
const MotionFlex = motion(Flex)
const MotionHStack = motion(HStack)
const MotionText = motion(Text)
const MotionBadge = motion(Badge)

const GlobalMatchmakingPreparationModal = ({ isOpen, onClose }) => {
  const { t } = useTranslation('QuickClash')
  const navigate = useNavigate()

  // Use our custom hook
  const {
    step,
    battleReady,
    enterBattle,
    matchmakingType,
    teamName,
    joinType,
    originalTeam,
  } = useQuickClashGlobalMatchmaking()

  // Step configuration with detailed information
  const steps = [
    {
      id: 'searching',
      label: t('Searching for Players'),
      icon: Search,
      color: 'blue',
      description: t('Looking for other players with similar trophy level...'),
    },
    {
      id: 'forming_team',
      label: t('Forming Your Team'),
      icon: Users,
      color: 'teal',
      description: t('Finding teammates for your 4v4 battle...'),
    },
    {
      id: 'team_formed',
      label: t('Team Formed'),
      icon: CheckCircle,
      color: 'green',
      description: t('Your team is ready! Now looking for opponents...'),
    },
    {
      id: 'searching_opponents',
      label: t('Finding Opponents'),
      icon: Target,
      color: 'purple',
      description: t('Searching for another team to battle against...'),
    },
    {
      id: 'match_found',
      label: t('Match Found'),
      icon: Users,
      color: 'indigo',
      description: t('Opponent team found! Setting up the battle...'),
    },
    {
      id: 'preparing_battle',
      label: t('Preparing Battle'),
      icon: FileText,
      color: 'orange',
      description: t('Creating reading materials and questions...'),
    },
    {
      id: 'generating_challenges',
      label: t('Generating Challenges'),
      icon: BookOpen,
      color: 'pink',
      description: t('Selecting categories and generating content...'),
    },
    {
      id: 'battleReady',
      label: t('Battle Ready'),
      icon: Zap,
      color: 'green',
      description: t('Your team battle is ready to begin!'),
    },
  ]

  // Get current step info
  const currentStep = steps.find(s => s.id === step) || steps[0]

  // Generate animation effect for active step
  const getAnimation = stepId => {
    if (stepId === step) {
      return {
        scale: [1, 1.05, 1],
        transition: {
          duration: 1,
          repeat: Infinity,
          repeatType: 'reverse',
        },
      }
    }
    return {}
  }

  // Handle entering the battle
  const handleEnterBattle = () => {
    if (battleReady) {
      enterBattle()
      onClose()
    }
  }

  // Determine the badge text and icon based on joinType and matchmakingType
  const getBadgeInfo = () => {
    // Pure solo player (directly joined individually)
    if (joinType === 'solo' && matchmakingType === 'solo') {
      return {
        icon: User,
        color: 'blue',
        text: t('Joined Individually'),
        tooltip: t('You joined matchmaking as an individual player'),
      }
    }

    // Solo player assigned to auto-formed team
    if (joinType === 'solo' && matchmakingType === 'team') {
      return {
        icon: UserPlus,
        color: 'teal',
        text: t('Joined Individually → Auto-Team'),
        tooltip: t(
          'You joined individually and were assigned to an auto-formed team',
        ),
      }
    }

    // Player from a source team that was merged into auto-formed team
    if (joinType === 'sourceTeam' && originalTeam) {
      return {
        icon: Users,
        color: 'purple',
        text: t('Joined with Team: {{teamName}}', {
          teamName: originalTeam.name || t('Original Team'),
        }),
        tooltip: t('Your original team was merged into an auto-formed team'),
      }
    }

    // Regular team member
    if (joinType === 'regular' && matchmakingType === 'team') {
      return {
        icon: Users,
        color: 'purple',
        text: t('Joined with Team: {{teamName}}', {
          teamName: teamName || t('Team'),
        }),
        tooltip: t('You joined matchmaking with your team'),
      }
    }

    // Default fallback
    return {
      icon: Users,
      color: 'blue',
      text:
        matchmakingType === 'team'
          ? t('Joined with Team: {{teamName}}', {
              teamName: teamName || t('Team'),
            })
          : t('Joined Individually'),
      tooltip: t('Matchmaking information'),
    }
  }

  const badgeInfo = getBadgeInfo()

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      isCentered
      closeOnOverlayClick={false}
    >
      <ModalOverlay backdropFilter="blur(3px)" bg="rgba(0, 0, 0, 0.7)" />
      <ModalContent
        bg="rgba(26, 21, 39, 0.95)"
        borderRadius="xl"
        borderWidth="1px"
        borderColor={`${currentStep.color}.500`}
        boxShadow={`0 0 20px rgba(128, 90, 213, 0.4)`}
      >
        <ModalHeader
          color="white"
          borderBottomWidth="1px"
          borderColor="whiteAlpha.200"
        >
          <HStack>
            <Icon as={Users} color={`${currentStep.color}.400`} boxSize={5} />
            <Text>{t('Team Battle Preparation')}</Text>

            {step === 'battleReady' && (
              <Badge colorScheme="green" ml={2}>
                {t('Ready')}
              </Badge>
            )}
          </HStack>
        </ModalHeader>
        <ModalCloseButton color="white" />

        <ModalBody py={6}>
          <VStack spacing={6} align="stretch">
            {/* Show matchmaking type badge - with improved info */}
            <Tooltip label={badgeInfo.tooltip} hasArrow placement="top">
              <Flex justify="center">
                <MotionBadge
                  colorScheme={badgeInfo.color}
                  px={3}
                  py={2}
                  borderRadius="full"
                  fontSize="sm"
                  display="flex"
                  alignItems="center"
                  animate={{
                    y: [0, -2, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: 'reverse',
                  }}
                >
                  <Icon as={badgeInfo.icon} mr={2} boxSize={4} />
                  {badgeInfo.text}

                  {joinType !== 'regular' && (
                    <Icon as={Info} ml={2} boxSize={3} opacity={0.7} />
                  )}
                </MotionBadge>
              </Flex>
            </Tooltip>

            {/* If this is an auto-formed team from a source team, show additional info */}
            {joinType === 'sourceTeam' && originalTeam && (
              <Box
                bg="rgba(121, 80, 242, 0.1)"
                borderWidth="1px"
                borderColor="purple.500"
                borderRadius="md"
                p={3}
                mx={4}
              >
                <HStack mb={1}>
                  <Icon as={Info} color="purple.300" boxSize={4} />
                  <Text color="white" fontWeight="bold" fontSize="sm">
                    {t('Auto-Team Formation')}
                  </Text>
                </HStack>
                <Text color="whiteAlpha.800" fontSize="sm">
                  {t(
                    'Your team "{{originalTeam}}" has been merged with other players to form a 4v4 battle team.',
                    { originalTeam: originalTeam.name || t('Original Team') },
                  )}
                </Text>
              </Box>
            )}

            {/* If this is a solo player added to auto-formed team, show additional info */}
            {joinType === 'solo' && matchmakingType === 'team' && (
              <Box
                bg="rgba(49, 151, 149, 0.1)"
                borderWidth="1px"
                borderColor="teal.500"
                borderRadius="md"
                p={3}
                mx={4}
              >
                <HStack mb={1}>
                  <Icon as={Info} color="teal.300" boxSize={4} />
                  <Text color="white" fontWeight="bold" fontSize="sm">
                    {t('Auto-Team Formation')}
                  </Text>
                </HStack>
                <Text color="whiteAlpha.800" fontSize="sm">
                  {t(
                    'You joined individually and have been assigned to a team with other players for a 4v4 battle.',
                  )}
                </Text>
              </Box>
            )}

            {/* Current Step Display */}
            <MotionBox
              animate={getAnimation(currentStep.id)}
              p={4}
              borderRadius="md"
              bg={`${currentStep.color}.900`}
              borderWidth="1px"
              borderColor={`${currentStep.color}.500`}
              boxShadow={`0 0 10px ${currentStep.color}.400`}
            >
              <HStack spacing={4}>
                <Center
                  boxSize="50px"
                  borderRadius="full"
                  bg={`${currentStep.color}.600`}
                >
                  <Icon as={currentStep.icon} color="white" boxSize={6} />
                </Center>
                <VStack align="start" spacing={1}>
                  <Text color="white" fontWeight="bold" fontSize="lg">
                    {currentStep.label}
                  </Text>
                  <Text color="whiteAlpha.700">{currentStep.description}</Text>
                </VStack>
              </HStack>
            </MotionBox>

            {/* Steps Timeline */}
            <VStack align="stretch" spacing={0}>
              {steps.map((stepItem, index) => {
                const isActive = stepItem.id === step
                const isCompleted =
                  steps.findIndex(s => s.id === step) >
                  steps.findIndex(s => s.id === stepItem.id)

                return (
                  <MotionHStack
                    key={stepItem.id}
                    spacing={3}
                    py={2}
                    opacity={isActive ? 1 : isCompleted ? 0.7 : 0.4}
                    animate={getAnimation(stepItem.id)}
                  >
                    <Center
                      boxSize="30px"
                      borderRadius="full"
                      bg={
                        isCompleted || isActive
                          ? `${stepItem.color}.500`
                          : 'whiteAlpha.200'
                      }
                    >
                      {isCompleted ? (
                        <Icon as={CheckCircle} color="white" boxSize={4} />
                      ) : isActive ? (
                        <Spinner size="sm" color="white" />
                      ) : (
                        <Text color="white" fontSize="xs">
                          {index + 1}
                        </Text>
                      )}
                    </Center>
                    <Text
                      color={isActive ? 'white' : 'whiteAlpha.800'}
                      fontWeight={isActive ? 'bold' : 'normal'}
                    >
                      {stepItem.label}
                    </Text>
                  </MotionHStack>
                )
              })}
            </VStack>
          </VStack>
        </ModalBody>

        <ModalFooter borderTopWidth="1px" borderColor="whiteAlpha.200">
          {step === 'battleReady' && battleReady ? (
            <Button
              colorScheme="green"
              leftIcon={<Icon as={Zap} />}
              onClick={handleEnterBattle}
              size="lg"
              as={motion.button}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
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
            >
              {t('Enter Battle')}
            </Button>
          ) : (
            <Button variant="ghost" colorScheme="purple" onClick={onClose}>
              {t('Close')}
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default GlobalMatchmakingPreparationModal
