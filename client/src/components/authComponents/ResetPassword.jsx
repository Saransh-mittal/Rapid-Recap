import React, { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import throttle from 'lodash.throttle'
import {
  useToast,
  Button,
  Input,
  InputGroup,
  InputRightElement,
  Box,
  Text,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Spinner,
  Flex,
} from '@chakra-ui/react'
import { useDispatch } from 'react-redux'
import { setForgotPassword } from '../../redux/authSlice'
import useSound from '../../customHooks/useSound'

const ResetPassword = ({ email, onClose }) => {
  const toast = useToast()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const { playClick } = useSound()
  const dispatch = useDispatch()
  const [load, setLoad] = useState(false)
  const [show, setShow] = useState({
    new_p: false,
    confirm_p: false,
  })

  const handleResetPassword = async () => {
    setLoad(true)
    if (newPassword !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      })
      setLoad(false)
      return
    }

    try {
      const response = await axios.post(`/api/user/forgotPassword`, {
        email,
        newPassword,
      })

      if (response.status === 201) {
        toast({
          title: 'Password Reset Successfully',
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'top',
        })

        dispatch(setForgotPassword(false))
        onClose()
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Something went wrong',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      })
    } finally {
      setLoad(false)
    }
  }

  const handleResetPasswordThrottled = useCallback(
    throttle(handleResetPassword, 1000),
    [newPassword, confirmPassword],
  )

  useEffect(() => {
    return () => handleResetPasswordThrottled.cancel()
  }, [handleResetPasswordThrottled])

  // Handle pressing Enter key
  const handleKeyDown = e => {
    if (e.key === 'Enter') {
      playClick()
      handleResetPasswordThrottled()
    }
  }

  return (
    <Flex
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      color="white"
    >
      <Text fontSize="2xl" fontWeight="bold">
        Reset Password
      </Text>
      <VStack spacing={5} mt={5} w="100%" maxW="md">
        <FormControl id="newPassword">
          <HStack justify="space-between">
            <FormLabel>New Password:</FormLabel>
          </HStack>
          <InputGroup size="md">
            <Input
              pr="4.5rem"
              type={show.new_p ? 'text' : 'password'}
              placeholder="Enter password"
              minLength={8}
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              onKeyDown={handleKeyDown} // Add this line to handle Enter key
            />
            <InputRightElement width="4.5rem">
              <Button
                h="1.75rem"
                size="sm"
                name="new_p"
                onClick={e => {
                  playClick()
                  setShow({
                    ...show,
                    [e.target.name]: !show[e.target.name],
                  })
                }}
              >
                {show.new_p ? 'Hide' : 'Show'}
              </Button>
            </InputRightElement>
          </InputGroup>
        </FormControl>

        <FormControl id="confirmPassword">
          <HStack justify="space-between">
            <FormLabel>Confirm Password:</FormLabel>
          </HStack>
          <InputGroup size="md">
            <Input
              pr="4.5rem"
              type={show.confirm_p ? 'text' : 'password'}
              placeholder="Enter password"
              minLength={8}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              onKeyDown={handleKeyDown} // Add this line to handle Enter key
            />
            <InputRightElement width="4.5rem">
              <Button
                h="1.75rem"
                size="sm"
                name="confirm_p"
                onClick={e => {
                  playClick()
                  setShow({
                    ...show,
                    [e.target.name]: !show[e.target.name],
                  })
                }}
              >
                {show.confirm_p ? 'Hide' : 'Show'}
              </Button>
            </InputRightElement>
          </InputGroup>
        </FormControl>

        <Button
          colorScheme="messenger"
          mt={5}
          w="full"
          onClick={() => {
            playClick()
            handleResetPasswordThrottled()
          }}
          isLoading={load}
          loadingText="Resetting Password"
          spinner={<Spinner size="sm" />}
        >
          Reset Password
        </Button>
      </VStack>
    </Flex>
  )
}

export default ResetPassword
