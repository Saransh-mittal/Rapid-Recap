import axios from 'axios'
import React from 'react'
import { Button, useToast } from '@chakra-ui/react'
import { setUser, verifyAdminStatus } from '../../redux/authSlice'
import { dailyStreakCheckerAndUpdater } from '../../utils/quiz.utils'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'

const GuestLogin = ({ width, onCloseNoteMessage, hamburgerOnClose }) => {
  const toast = useToast()
  const navigate = useNavigate()
  const dispatchRedux = useDispatch()

  const handleGuestLoginSuccess = guestUser => {
    dispatchRedux(setUser(guestUser))
    dispatchRedux(verifyAdminStatus())
    hamburgerOnClose && hamburgerOnClose()
    dailyStreakCheckerAndUpdater(dispatchRedux)

    location.pathname === '/' && navigate('/home/all')
  }
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
        localStorage.setItem('token', response.data.token)
        handleGuestLoginSuccess(response.data.user)
        // Show success toast
        toast({
          title: 'Guest Login Successful',
          description: `Logged in as ${response.data.user.inGameName}`,
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'top',
        })
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
      onClick={() => {
        handleGuestLogin()
        onCloseNoteMessage()
      }}
      className="get-started-button"
      width={width || `auto`}
    >
      Continue as Guest
    </Button>
  )
}

export default GuestLogin
