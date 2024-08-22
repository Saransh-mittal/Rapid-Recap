import axios from 'axios'
import React from 'react'
import { Button, useToast } from '@chakra-ui/react'
import { setUser, verifyAdminStatus } from '../../redux/authSlice'
import { dailyStreakCheckerAndUpdater } from '../../utils/quiz.utils'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import Loading from '../miscellaneous/Loading'
import { setIsSigninOpen } from '../../redux/appSlice'

const GuestLogin = ({ width, onCloseNoteMessage }) => {
  const toast = useToast()
  const navigate = useNavigate()
  const dispatchRedux = useDispatch()
  const [loading, setLoading] = React.useState(false)

  const handleGuestLoginSuccess = guestUser => {
    dispatchRedux(setUser(guestUser))
    dispatchRedux(verifyAdminStatus())
    dispatchRedux(setIsSigninOpen(false))
    // hamburgerOnClose && hamburgerOnClose()
    dailyStreakCheckerAndUpdater(dispatchRedux)

    location.pathname === '/' && navigate('/home/all')
  }
  const handleGuestLogin = async () => {
    const storedGuestId = localStorage.getItem('guestUserId')
    setLoading(true)
    try {
      const response = await axios.post('/api/user/guestLogin', {
        storedGuestId,
      })

      if (response.status === 200) {
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
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {loading && <Loading />}
      <Button
        onClick={() => {
          handleGuestLogin()
          onCloseNoteMessage && onCloseNoteMessage()
        }}
        className="get-started-button"
        width={width || `auto`}
      >
        Continue as Guest
      </Button>
    </>
  )
}

export default GuestLogin
