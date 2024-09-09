import React from 'react'
import { VStack, useToast } from '@chakra-ui/react'
import { useSelector } from 'react-redux'
import CategorySelection from './CategorySelection'

const RegistrationForm = ({ onRegister, registerLoading }) => {
  const { user } = useSelector(state => state.auth)
  const toast = useToast()

  const handleRegistration = async selectedCategories => {
    try {
      await onRegister({
        userId: user._id,
        selectedCategories,
      })
      toast({
        title: 'Registration Successful',
        description:
          'You have been successfully registered for the tournament.',
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'top',
      })
    } catch (err) {
      toast({
        title: 'Registration Failed',
        description:
          'There was an error during registration. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      })
    }
  }

  return (
    <VStack spacing={6} align="stretch">
      <CategorySelection
        onRegister={handleRegistration}
        isRegistration={true}
        registerLoading={registerLoading}
      />
    </VStack>
  )
}

export default RegistrationForm
