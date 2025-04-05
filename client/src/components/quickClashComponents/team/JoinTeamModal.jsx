// components/quickClashComponents/team/JoinTeamModal.jsx
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
  useColorModeValue,
  PinInput,
  PinInputField,
  Flex,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { UserPlus, Users, Key } from 'lucide-react'

const MotionModalContent = motion(ModalContent)

/**
 * Modal for joining an existing team
 */
const JoinTeamModal = ({ isOpen, onClose, onJoin }) => {
  const { t } = useTranslation('QuickClash')

  // Form state
  const [teamCode, setTeamCode] = useState('')
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

    if (!teamCode.trim()) return

    setLoading(true)

    try {
      await onJoin(teamCode)

      // Reset form
      setTeamCode('')
    } catch (error) {
      console.error('Error joining team:', error)
    } finally {
      setLoading(false)
    }
  }

  // Handle close
  const handleClose = () => {
    setTeamCode('')
    onClose()
  }

  // Handle PIN input complete
  const handlePinComplete = value => {
    setTeamCode(value)
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
        borderColor="blue.600"
        boxShadow="0 0 20px rgba(66, 153, 225, 0.4)"
        borderRadius="xl"
      >
        <ModalHeader>
          <HStack spacing={2}>
            <Icon as={UserPlus} color="blue.400" />
            <Text color="white">{t('Join Existing Team')}</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton color="white" />

        <ModalBody pb={6}>
          <form onSubmit={handleSubmit} id="join-team-form">
            <VStack spacing={6} align="stretch">
              <FormControl isRequired>
                <FormLabel color="whiteAlpha.900">{t('Team Code')}</FormLabel>
                <Input
                  placeholder={t('Enter 6-digit team code')}
                  value={teamCode}
                  onChange={e => setTeamCode(e.target.value)}
                  bg="blackAlpha.400"
                  color="white"
                  borderColor="whiteAlpha.300"
                  _hover={{ borderColor: 'blue.400' }}
                  _focus={{
                    borderColor: 'blue.500',
                    boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)',
                  }}
                  maxLength={6}
                />
                <FormHelperText color="whiteAlpha.600">
                  {t('Enter the 6-character code to join a team')}
                </FormHelperText>
              </FormControl>

              <Flex justify="center">
                <HStack>
                  <Icon as={Key} color="blue.400" boxSize={5} />
                  <PinInput
                    otp
                    size="lg"
                    value={teamCode}
                    onChange={setTeamCode}
                    onComplete={handlePinComplete}
                    colorScheme="blue"
                  >
                    <PinInputField
                      bg="blackAlpha.400"
                      color="white"
                      borderColor="whiteAlpha.300"
                      _hover={{ borderColor: 'blue.400' }}
                      _focus={{
                        borderColor: 'blue.500',
                        boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)',
                      }}
                    />
                    <PinInputField
                      bg="blackAlpha.400"
                      color="white"
                      borderColor="whiteAlpha.300"
                      _hover={{ borderColor: 'blue.400' }}
                      _focus={{
                        borderColor: 'blue.500',
                        boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)',
                      }}
                    />
                    <PinInputField
                      bg="blackAlpha.400"
                      color="white"
                      borderColor="whiteAlpha.300"
                      _hover={{ borderColor: 'blue.400' }}
                      _focus={{
                        borderColor: 'blue.500',
                        boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)',
                      }}
                    />
                    <PinInputField
                      bg="blackAlpha.400"
                      color="white"
                      borderColor="whiteAlpha.300"
                      _hover={{ borderColor: 'blue.400' }}
                      _focus={{
                        borderColor: 'blue.500',
                        boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)',
                      }}
                    />
                    <PinInputField
                      bg="blackAlpha.400"
                      color="white"
                      borderColor="whiteAlpha.300"
                      _hover={{ borderColor: 'blue.400' }}
                      _focus={{
                        borderColor: 'blue.500',
                        boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)',
                      }}
                    />
                    <PinInputField
                      bg="blackAlpha.400"
                      color="white"
                      borderColor="whiteAlpha.300"
                      _hover={{ borderColor: 'blue.400' }}
                      _focus={{
                        borderColor: 'blue.500',
                        boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)',
                      }}
                    />
                  </PinInput>
                </HStack>
              </Flex>

              <Divider borderColor="whiteAlpha.200" />

              <VStack align="stretch" spacing={2}>
                <HStack>
                  <Icon as={Users} color="blue.400" boxSize={4} />
                  <Text color="white" fontWeight="bold">
                    {t('Team Information')}
                  </Text>
                </HStack>
                <Text color="whiteAlpha.700" fontSize="sm">
                  {t('You can get a team code from a team leader')}
                </Text>
                <Text color="whiteAlpha.700" fontSize="sm">
                  {t('Teams can have up to 4 members')}
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
            colorScheme="blue"
            type="submit"
            form="join-team-form"
            isLoading={loading}
            loadingText={t('Joining...')}
            isDisabled={teamCode.length !== 6}
            leftIcon={<Icon as={UserPlus} />}
          >
            {t('Join Team')}
          </Button>
        </ModalFooter>
      </MotionModalContent>
    </Modal>
  )
}

export default JoinTeamModal
