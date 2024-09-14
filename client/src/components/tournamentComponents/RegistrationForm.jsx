import React, { lazy, Suspense, useCallback } from 'react'
import { VStack, Spinner } from '@chakra-ui/react'
import { useSelector } from 'react-redux'

// Lazy load CategorySelection for code splitting
const CategorySelection = lazy(() => import('./CategorySelection'))

const RegistrationForm = ({ onRegister, registerLoading }) => {
  const { user } = useSelector(state => state.auth)

  // Memoize handleRegistration to prevent unnecessary re-renders
  const handleRegistration = useCallback(
    selectedCategories => {
      onRegister({
        userId: user._id,
        selectedCategories,
      })
    },
    [onRegister, user._id],
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
