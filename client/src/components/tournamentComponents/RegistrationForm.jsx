import React, { lazy, Suspense, useCallback } from 'react'
import { VStack, useToast, Spinner } from '@chakra-ui/react'
import { useSelector } from 'react-redux'

// Lazy load CategorySelection for code splitting
const CategorySelection = lazy(() => import('./CategorySelection'))

const RegistrationForm = ({ onRegister, registerLoading }) => {
  const { user } = useSelector(state => state.auth)
  const toast = useToast()

  // Memoize handleRegistration to prevent unnecessary re-renders
  const handleRegistration = useCallback(
    async selectedCategories => {
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
    },
    [onRegister, user._id, toast],
  )

  return (
    <VStack spacing={6} align="stretch">
      {/* Suspense wrapper to display fallback during lazy load */}
      <Suspense fallback={<Spinner />}>
        <CategorySelection
          onRegister={handleRegistration}
          isRegistration={true}
          registerLoading={registerLoading}
        />
      </Suspense>
    </VStack>
  )
}

export default RegistrationForm
