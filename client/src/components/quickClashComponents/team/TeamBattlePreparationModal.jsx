// components/quickClashComponents/team/TeamBattlePreparationModal.jsx
import React, { useEffect } from 'react'
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
  Progress,
  Box,
  Flex,
  HStack,
  Icon,
  Spinner,
  Badge,
  Center,
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
} from 'lucide-react'

const MotionBox = motion(Box)
const MotionFlex = motion(Flex)
const MotionHStack = motion(HStack)
const MotionText = motion(Text)

/**
 * Modal that shows progress of team battle matchmaking and preparation
 */
const TeamBattlePreparationModal = ({
  isOpen,
  onClose,
  progress,
  step,
  battleId,
}) => {
  const { t } = useTranslation('QuickClash')
  const navigate = useNavigate()

  // Step configuration
  const steps = [
    {
      id: 'searching',
      label: t('Searching for Teams'),
      icon: Search,
      color: 'blue',
      description: t('Looking for another team with similar trophy level...'),
    },
    {
      id: 'matchFound',
      label: t('Match Found'),
      icon: Users,
      color: 'green',
      description: t('A suitable opponent team has been found!'),
    },
    {
      id: 'preparing',
      label: t('Preparing Battle'),
      icon: FileText,
      color: 'purple',
      description: t('Setting up the team battle...'),
    },
    {
      id: 'matchingBots',
      label: t('Finding AI Teammates'),
      icon: CloudLightning,
      color: 'cyan',
      description: t('No teams available. Adding AI teammates...'),
    },
    {
      id: 'generatingChallenges',
      label: t('Generating Challenges'),
      icon: BookOpen,
      color: 'orange',
      description: t('Selecting categories and generating reading content...'),
    },
    {
      id: 'preparingBattle',
      label: t('Finalizing Setup'),
      icon: Target,
      color: 'pink',
      description: t('Almost ready! Finalizing battle setup...'),
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
    if (battleId) {
      navigate(`/quickclash/teamBattle/${battleId}`)
      onClose()
    }
  }

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
            {/* Progress Bar */}
            <Box>
              <Flex justify="space-between" mb={2}>
                <Text color="whiteAlpha.700" fontSize="sm">
                  {t('Progress')}
                </Text>
                <Text color="whiteAlpha.700" fontSize="sm" fontWeight="bold">
                  {progress}%
                </Text>
              </Flex>
              <Progress
                value={progress}
                size="sm"
                colorScheme={currentStep.color}
                borderRadius="full"
                hasStripe
                isAnimated
              />
            </Box>

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
          {step === 'battleReady' && battleId ? (
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

export default TeamBattlePreparationModal
