import React, { useState, useCallback } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
  Input,
  VStack,
  useToast,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  IconButton,
  Text,
  Box,
  HStack,
  Progress,
} from '@chakra-ui/react'
import {
  Brain,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Unlock,
  ShieldCheck,
} from 'lucide-react'
import axios from 'axios'
import { useTranslation } from 'react-i18next'
import { keyframes } from '@emotion/react'

// Animation keyframes
const glowAnimation = keyframes`
  0% { text-shadow: 0 0 5px #FF0080; }
  50% { text-shadow: 0 0 20px #FF0080, 0 0 30px #FF0080; }
  100% { text-shadow: 0 0 5px #FF0080; }
`

const floatAnimation = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`

const ResetPassword = ({ email, isOpen, onClose }) => {
  const { t } = useTranslation('ResetPassword')
  const toast = useToast()

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
    showNewPassword: false,
    showConfirmPassword: false,
  })
  const [isLoading, setIsLoading] = useState(false)

  // Calculate progress based on form completion
  const calculateProgress = () => {
    let progress = 0
    if (formData.newPassword) progress += 50
    if (formData.confirmPassword) progress += 50
    return progress
  }

  const handleInputChange = field => e => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value,
    }))
  }

  const togglePasswordVisibility = field => {
    setFormData(prev => ({
      ...prev,
      [field]: !prev[field],
    }))
  }

  const handleResetPassword = useCallback(async () => {
    if (!email) {
      toast({
        title: 'Error',
        description: 'Email address is missing.',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      })
      return
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: 'Password Mismatch',
        description: 'The passwords you entered do not match.',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await axios.post('/api/user/forgotPassword', {
        email,
        newPassword: formData.newPassword,
      })

      if (response.status === 201) {
        toast({
          title: 'Success!',
          description: 'Your password has been reset successfully.',
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'top',
        })
        onClose()
      }
    } catch (error) {
      toast({
        title: 'Reset Failed',
        description:
          error.response?.data?.error ||
          'Failed to reset password. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      })
    } finally {
      setIsLoading(false)
    }
  }, [email, formData.newPassword, formData.confirmPassword, toast, onClose])

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={{ base: 'full', md: 'md' }}
      motionPreset="slideInBottom"
    >
      <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(10px)" />
      <ModalContent
        bg="#0f0d15"
        backgroundImage="linear-gradient(to bottom, #1a1527, #0e0c16 88%, #0e0c16 99%)"
        borderRadius="xl"
        border="1px solid"
        borderColor="whiteAlpha.100"
        boxShadow="0 0 20px rgba(255, 0, 128, 0.2)"
      >
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          h="4px"
          bgGradient="linear(to-r, pink.500, purple.500)"
        />

        <ModalHeader pt={8}>
          <VStack spacing={4}>
            <HStack spacing={2}>
              <Box
                as={Brain}
                size="30px"
                color="pink.400"
                animation={`${floatAnimation} 3s infinite`}
              />
              <Text
                fontSize="3xl"
                fontWeight="bold"
                bgGradient="linear(to-r, pink.400, purple.400)"
                bgClip="text"
                animation={`${glowAnimation} 2s infinite`}
              >
                Reset Password
              </Text>
            </HStack>
            <Box as={ShieldCheck} size="48px" color="pink.400" />
          </VStack>
        </ModalHeader>

        <ModalCloseButton color="white" />

        <ModalBody pb={6}>
          <VStack spacing={6}>
            <Box w="full">
              <Progress
                value={calculateProgress()}
                size="sm"
                colorScheme="pink"
                hasStripe
                isAnimated
                borderRadius="full"
              />
            </Box>

            <Text color="whiteAlpha.600" textAlign="center">
              Enter your new password below to reset your account access
            </Text>

            <VStack w="full" spacing={4}>
              <InputGroup>
                <InputLeftElement>
                  <Box as={Lock} color="pink.400" size={18} />
                </InputLeftElement>
                <Input
                  type={formData.showNewPassword ? 'text' : 'password'}
                  placeholder="New Password"
                  value={formData.newPassword}
                  onChange={handleInputChange('newPassword')}
                  bg="whiteAlpha.50"
                  border="1px solid"
                  borderColor="whiteAlpha.200"
                  color="white"
                  _hover={{ borderColor: 'pink.400' }}
                  _focus={{
                    borderColor: 'pink.500',
                    boxShadow: '0 0 0 1px #FF0080',
                  }}
                  _placeholder={{ color: 'whiteAlpha.400' }}
                />
                <InputRightElement>
                  <IconButton
                    size="sm"
                    variant="ghost"
                    color="pink.400"
                    _hover={{ bg: 'whiteAlpha.100' }}
                    icon={
                      formData.showNewPassword ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )
                    }
                    onClick={() => togglePasswordVisibility('showNewPassword')}
                  />
                </InputRightElement>
              </InputGroup>

              <InputGroup>
                <InputLeftElement>
                  <Box as={Unlock} color="pink.400" size={18} />
                </InputLeftElement>
                <Input
                  type={formData.showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm New Password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange('confirmPassword')}
                  bg="whiteAlpha.50"
                  border="1px solid"
                  borderColor="whiteAlpha.200"
                  color="white"
                  _hover={{ borderColor: 'pink.400' }}
                  _focus={{
                    borderColor: 'pink.500',
                    boxShadow: '0 0 0 1px #FF0080',
                  }}
                  _placeholder={{ color: 'whiteAlpha.400' }}
                />
                <InputRightElement>
                  <IconButton
                    size="sm"
                    variant="ghost"
                    color="pink.400"
                    _hover={{ bg: 'whiteAlpha.100' }}
                    icon={
                      formData.showConfirmPassword ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )
                    }
                    onClick={() =>
                      togglePasswordVisibility('showConfirmPassword')
                    }
                  />
                </InputRightElement>
              </InputGroup>
            </VStack>

            <Button
              w="full"
              size="lg"
              onClick={handleResetPassword}
              isLoading={isLoading}
              loadingText="Resetting Password..."
              leftIcon={<KeyRound size={18} />}
              bgGradient="linear(to-r, pink.500, purple.500)"
              color="white"
              _hover={{
                bgGradient: 'linear(to-r, pink.600, purple.600)',
                transform: 'translateY(-2px)',
              }}
              _active={{
                bgGradient: 'linear(to-r, pink.700, purple.700)',
                transform: 'translateY(0)',
              }}
              transition="all 0.2s"
            >
              Reset Password
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default ResetPassword
