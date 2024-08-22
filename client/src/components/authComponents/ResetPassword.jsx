import React, { useState, useCallback } from 'react'
import axios from 'axios'
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
  VStack,
  useToast,
  InputGroup,
  InputRightElement,
  Flex,
} from '@chakra-ui/react'
import useSound from '../../customHooks/useSound'

const ResetPassword = ({ email, isOpen, onClose }) => {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const toast = useToast()
  const { playClick } = useSound()

  const handleResetPassword = useCallback(async () => {
    if (!email) {
      toast({
        title: 'Error',
        description: 'Email is missing',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await axios.post('/api/user/forgotPassword', {
        email,
        newPassword,
      })

      if (response.status === 201) {
        toast({
          title: 'Success',
          description: 'Password reset successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
        onClose()
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to reset password',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }, [email, newPassword, confirmPassword, toast, onClose])

  const handleSubmit = e => {
    e.preventDefault()
    playClick()
    handleResetPassword()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent
        bg="#0f0d15"
        backgroundImage="linear-gradient(-180deg, #1a1527, #0e0c16 88%, #0e0c16 99%)"
        color="white"
      >
        <ModalHeader>Reset Password</ModalHeader>
        <ModalCloseButton />
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>New Password</FormLabel>
                <InputGroup>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                  />
                  <InputRightElement width="4.5rem">
                    <Button
                      h="1.75rem"
                      size="sm"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </Button>
                  </InputRightElement>
                </InputGroup>
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Confirm Password</FormLabel>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Flex w={'100%'} justifyContent={'center'} alignItems={'center'}>
              <Button
                w={'100%'}
                type="submit"
                colorScheme="blue"
                isLoading={isLoading}
                loadingText="Resetting"
              >
                Reset Password
              </Button>
            </Flex>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}

export default ResetPassword
