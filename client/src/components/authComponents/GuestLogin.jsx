import axios from 'axios'
import React from 'react'
import { Button, useToast } from '@chakra-ui/react'

const GuestLogin = ({ onSuccess }) => {
  const toast = useToast()

  const handleGuestLogin = async () => {
    const storedGuestId = localStorage.getItem('guestUserId')

    try {
      const response = await axios.post('/api/user/guestLogin', {
        storedGuestId,
      })
      console.log('Guest login response:', response)
      if (response.status === 200) {
        console.log('Guest login successful:', response.data)
        // Store the guest user ID
        localStorage.setItem('guestUserId', response.data.user._id)

        // Show success toast
        toast({
          title: 'Guest Login Successful',
          description: `Logged in as ${response.data.user.inGameName}`,
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'top',
        })

        // Call the onSuccess callback
        onSuccess(response.data.user)
      } else {
        throw new Error('Guest login failed')
      }
    } catch (error) {
      console.error('Error during guest login:', error)
      toast({
        title: 'Guest Login Failed',
        description: error.message || 'An error occurred during guest login',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      })
    }
  }

  return (
    <Button
      onClick={handleGuestLogin}
      colorScheme="purple"
      variant="outline"
      size="lg"
      width="100%"
      mt={4}
    >
      Continue as Guest
    </Button>
  )
}

export default GuestLogin
