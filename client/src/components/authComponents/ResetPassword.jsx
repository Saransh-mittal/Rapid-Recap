// ResetPassword.jsx
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
import { useTranslation } from 'react-i18next' // Import useTranslation hook
import useSound from '../../customHooks/useSound'

const ResetPassword = ({ email, isOpen, onClose }) => {
  const { t } = useTranslation('ResetPassword') // Initialize useTranslation
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const toast = useToast()
  const { playClick } = useSound()

  const handleResetPassword = useCallback(async () => {
    if (!email) {
      toast({
        title: t('error'),
        description: t('emailMissing'),
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: t('error'),
        description: t('passwordMismatch'),
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
          title: t('success'),
          description: t('passwordResetSuccess'),
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
        onClose()
      }
    } catch (error) {
      toast({
        title: t('error'),
        description: error.response?.data?.error || t('passwordResetFailed'),
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }, [email, newPassword, confirmPassword, toast, onClose, t])

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
        <ModalHeader>{t('resetPassword')}</ModalHeader>
        <ModalCloseButton />
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>{t('newPassword')}</FormLabel>
                <InputGroup>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder={t('enterNewPassword')}
                  />
                  <InputRightElement width="4.5rem">
                    <Button
                      h="1.75rem"
                      size="sm"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? t('hide') : t('show')}
                    </Button>
                  </InputRightElement>
                </InputGroup>
              </FormControl>
              <FormControl isRequired>
                <FormLabel>{t('confirmPassword')}</FormLabel>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder={t('confirmNewPassword')}
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
                loadingText={t('resetting')}
              >
                {t('resetPassword')}
              </Button>
            </Flex>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}

export default ResetPassword
