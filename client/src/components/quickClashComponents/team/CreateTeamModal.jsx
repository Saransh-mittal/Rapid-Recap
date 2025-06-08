// components/quickClashComponents/team/CreateTeamModal.jsx
import React, { useState } from 'react'
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
  Input,
  FormHelperText,
  VStack,
  Text,
  Icon,
  HStack,
  Divider,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Users, Shield } from 'lucide-react'

const MotionModalContent = motion(ModalContent)

/**
 * Modal for creating a new team
 */
const CreateTeamModal = ({ isOpen, onClose, onCreate }) => {
  const { t } = useTranslation('QuickClash')

  // Form state
  const [name, setName] = useState('')
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

  // Handle form submission
  const handleSubmit = async e => {
    e.preventDefault()

    if (!name.trim()) return

    setLoading(true)

    try {
      await onCreate({ name })

      // Reset form
      setName('')
    } catch (error) {
      console.error('Error creating team:', error)
    } finally {
      setLoading(false)
    }
  }

  // Handle close
  const handleClose = () => {
    setName('')
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
            <Icon as={Users} color="purple.400" />
            <Text color="white">{t('Create New Team')}</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton color="white" />

        <ModalBody pb={6}>
          <form onSubmit={handleSubmit} id="create-team-form">
            <VStack spacing={6} align="stretch">
              <FormControl isRequired>
                <FormLabel color="whiteAlpha.900">{t('Team Name')}</FormLabel>
                <Input
                  placeholder={t('Enter team name')}
                  value={name}
                  onChange={e => setName(e.target.value)}
                  bg="blackAlpha.400"
                  color="white"
                  borderColor="whiteAlpha.300"
                  _hover={{ borderColor: 'purple.400' }}
                  _focus={{
                    borderColor: 'purple.500',
                    boxShadow: '0 0 0 1px var(--chakra-colors-purple-500)',
                  }}
                />
                <FormHelperText color="whiteAlpha.600">
                  {t('Choose a name for your team')}
                </FormHelperText>
              </FormControl>

              <Divider borderColor="whiteAlpha.200" />

              <VStack align="stretch" spacing={2}>
                <HStack>
                  <Icon as={Shield} color="purple.400" boxSize={4} />
                  <Text color="white" fontWeight="bold">
                    {t('Team Benefits')}
                  </Text>
                </HStack>
                <Text color="whiteAlpha.700" fontSize="sm">
                  • {t('Participate in 4v4 team battles')}
                </Text>
                <Text color="whiteAlpha.700" fontSize="sm">
                  • {t('Earn team bonuses and rewards')}
                </Text>
                <Text color="whiteAlpha.700" fontSize="sm">
                  • {t('Climb the team leaderboards')}
                </Text>
              </VStack>
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
            form="create-team-form"
            isLoading={loading}
            loadingText={t('Creating...')}
            leftIcon={<Icon as={Users} />}
          >
            {t('Create Team')}
          </Button>
        </ModalFooter>
      </MotionModalContent>
    </Modal>
  )
}

export default CreateTeamModal
