// components/quickClashComponents/team/TeamSettingsModal.jsx
import React, { useState, useEffect } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Switch,
  FormHelperText,
  VStack,
  Text,
  HStack,
  Icon,
  Divider,
  Box,
  Badge,
  useToast,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Settings, Shield, Info, Users, AlertTriangle } from 'lucide-react'

const MotionModalContent = motion(ModalContent)

/**
 * Modal for team settings
 */
const TeamSettingsModal = ({ isOpen, onClose, team, onUpdate }) => {
  const { t } = useTranslation('QuickClash')
  const toast = useToast()

  // Form state
  const [isPersistent, setIsPersistent] = useState(false)
  const [loading, setLoading] = useState(false)

  // Modal animation
  const modalVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 25,
      },
    },
    exit: {
      opacity: 0,
      y: 20,
      scale: 0.95,
      transition: {
        duration: 0.2,
      },
    },
  }

  // Initialize form values when team data changes
  useEffect(() => {
    if (team) {
      setIsPersistent(team.isPersistent || false)
    }
  }, [team])

  // Handle form submission
  const handleSubmit = async e => {
    e.preventDefault()

    if (!team) return

    setLoading(true)

    try {
      // Only update if the value has changed
      const settings = {}

      if (isPersistent !== team.isPersistent) {
        settings.persistence = isPersistent
      }

      await onUpdate(settings)

      // Close modal
      onClose()
    } catch (error) {
      console.error('Error updating team settings:', error)
      toast({
        title: t('Error'),
        description: t('Failed to update team settings'),
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  // Handle close
  const handleClose = () => {
    // Reset form to original values
    if (team) {
      setIsPersistent(team.isPersistent || false)
    }
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} isCentered>
      <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(5px)" />
      <MotionModalContent
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={modalVariants}
        mx={4}
        bg="rgba(23, 25, 35, 0.95)"
        borderWidth="1px"
        borderColor="purple.600"
        boxShadow="0 0 20px rgba(128, 90, 213, 0.4)"
        borderRadius="xl"
      >
        <ModalHeader>
          <HStack spacing={2}>
            <Icon as={Settings} color="purple.400" />
            <Text color="white">
              {t('Team Settings')} - {team?.name}
            </Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton color="white" />

        <ModalBody pb={6}>
          <form onSubmit={handleSubmit} id="team-settings-form">
            <VStack spacing={6} align="stretch">
              <Box bg="whiteAlpha.100" p={4} borderRadius="md">
                <HStack spacing={3} mb={1}>
                  <Icon as={Info} color="blue.400" boxSize={5} />
                  <Text color="white" fontWeight="bold">
                    {t('Team Info')}
                  </Text>
                </HStack>
                <Text color="whiteAlpha.800" fontSize="sm">
                  <strong>{t('Team Leader')}:</strong>{' '}
                  {team?.members?.find(m => m.role === 'leader')?.user?.name ||
                    t('Unknown')}
                </Text>
                <Text color="whiteAlpha.800" fontSize="sm">
                  <strong>{t('Members')}:</strong> {team?.members?.length || 0}{' '}
                  / 4
                </Text>
                <Text color="whiteAlpha.800" fontSize="sm">
                  <strong>{t('Team Code')}:</strong> {team?.teamCode}
                </Text>
              </Box>

              <Divider borderColor="whiteAlpha.200" />

              <FormControl>
                <FormLabel color="whiteAlpha.900">
                  {t('Persistent Team')}
                </FormLabel>
                <HStack>
                  <Switch
                    colorScheme="purple"
                    isChecked={isPersistent}
                    onChange={e => setIsPersistent(e.target.checked)}
                  />
                </HStack>
                <FormHelperText color="whiteAlpha.600">
                  {t(
                    'Persistent teams remain after battles are completed. Non-persistent teams are automatically dissolved after completing a battle.',
                  )}
                </FormHelperText>
              </FormControl>

              {team?.isInMatch && (
                <Box
                  bg="rgba(237, 137, 54, 0.1)"
                  p={4}
                  borderRadius="md"
                  borderWidth="1px"
                  borderColor="orange.500"
                >
                  <HStack spacing={2} mb={1}>
                    <Icon as={AlertTriangle} color="orange.400" boxSize={4} />
                    <Text color="orange.400" fontWeight="bold">
                      {t('Team In Battle')}
                    </Text>
                  </HStack>
                  <Text color="whiteAlpha.800" fontSize="sm">
                    {t(
                      'Some settings cannot be changed while the team is in an active battle.',
                    )}
                  </Text>
                </Box>
              )}
            </VStack>
          </form>
        </ModalBody>

        <ModalFooter>
          <Button
            variant="ghost"
            mr={3}
            onClick={handleClose}
            color="whiteAlpha.800"
            _hover={{ bg: 'whiteAlpha.100' }}
          >
            {t('Cancel')}
          </Button>
          <Button
            colorScheme="purple"
            type="submit"
            form="team-settings-form"
            isLoading={loading}
            loadingText={t('Saving...')}
            isDisabled={team?.isInMatch}
          >
            {t('Save Settings')}
          </Button>
        </ModalFooter>
      </MotionModalContent>
    </Modal>
  )
}

export default TeamSettingsModal
