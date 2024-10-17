import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Box, Heading, Text, Button, useToast } from '@chakra-ui/react'

const ConfirmDeleteAccount = () => {
  const { token } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleted, setIsDeleted] = useState(false)

  useEffect(() => {
    const confirmDeletion = async () => {
      try {
        const response = await axios.get(
          `/api/user/confirmDeleteAccount/${token}`,
        )
        setIsDeleted(true)
        toast({
          title: 'Account Deleted',
          description: response.data.message,
          status: 'success',
          duration: 5000,
          isClosable: true,
        })
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

    confirmDeletion()
  }, [token, toast])

  if (isLoading) {
    return <Box>Loading...</Box>
  }

  return (
    <Box textAlign="center" py={10} px={6}>
      <Heading as="h2" size="xl" mt={6} mb={2}>
        {isDeleted ? 'Account Deleted' : 'Error'}
      </Heading>
      <Text color={'gray.500'}>
        {isDeleted
          ? `Your account has been successfully deleted. We're sorry to see you go!`
          : 'There was an error processing your request. The link may be invalid or expired.'}
      </Text>
      <Button colorScheme="blue" mt={6} onClick={() => navigate('/')}>
        Go to Homepage
      </Button>
    </Box>
  )
}

export default ConfirmDeleteAccount
