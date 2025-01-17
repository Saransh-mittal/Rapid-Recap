// src/hooks/useRewardsModal.js

import { useState, useEffect } from 'react'
import axios from 'axios'

const useRewardsModal = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkModalStatus = async () => {
      try {
        const { data } = await axios.get('/api/user/modal-status')
        if (data.shouldShowModal) {
          setIsOpen(true)
        }
      } catch (error) {
        console.error('Error checking rewards modal status:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkModalStatus()
  }, [])

  const handleClose = () => {
    setIsOpen(false)
  }

  return {
    isOpen,
    onClose: handleClose,
    isLoading,
  }
}

export default useRewardsModal
