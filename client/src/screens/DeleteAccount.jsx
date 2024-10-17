import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  useToast,
  Container,
} from '@chakra-ui/react'

const DeleteAccount = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const toast = useToast()

  const handleDelete = async () => {
    setIsLoading(true)
    try {
      const response = await axios.post('/api/user/deleteAccount', {
        email,
        password,
      })
      toast({
        title: 'Confirmation Email Sent',
        description: response.data.message,
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
      navigate('/') // Redirect to home page after successful request
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'An error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Container maxW="container.md" py={10} mt={12}>
      <VStack spacing={8} align="stretch">
        <Heading as="h1" size="xl" textAlign="center">
          Delete Account
        </Heading>
        <Text textAlign="center">
          Warning: This action is irreversible. All your data will be
          permanently deleted.
        </Text>
        <Box>
          <FormControl isRequired>
            <FormLabel>Email</FormLabel>
            <Input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
          </FormControl>
        </Box>
        <Box>
          <FormControl isRequired>
            <FormLabel>Password</FormLabel>
            <Input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </FormControl>
        </Box>
        <Button
          colorScheme="red"
          onClick={handleDelete}
          isLoading={isLoading}
          loadingText="Submitting"
        >
          Confirm Account Deletion
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate('/profile')}
          textColor={'white'}
          // _hover={{ textColor: 'black' }}
        >
          Cancel
        </Button>
      </VStack>
    </Container>
  )
}

export default DeleteAccount
