import React, { useState, useEffect } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useToast } from '@chakra-ui/react'
import axios from 'axios'
import Loading from '../components/miscellaneous/Loading'
import { useDispatch, useSelector } from 'react-redux'
import { setIsAdmin } from '../redux/authSlice'

const AdminRoute = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true)
  const { isAdmin } = useSelector(state => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const toast = useToast()

  useEffect(() => {
    const verifyAdminStatus = async () => {
      try {
        const response = await axios.get('/api/admin/verify-admin', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        })

        dispatch(setIsAdmin(response.data.isAdmin))
      } catch (error) {
        console.error('Error verifying admin status:', error)
        toast({
          title: 'Unauthorized',
          description: 'You are not authorized to access this page.',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top',
        })
        navigate('/')
      } finally {
        setIsLoading(false)
      }
    }

    verifyAdminStatus()
  }, [navigate, toast])

  if (isLoading) {
    return <Loading />
  }

  return isAdmin ? children : <Navigate to="/" replace />
}

export default AdminRoute
