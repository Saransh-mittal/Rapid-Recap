import React, { lazy, Suspense, useCallback } from 'react'
import { VStack, useToast, Spinner } from '@chakra-ui/react'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'

// Lazy load CategorySelection for code splitting
const CategorySelection = lazy(() => import('./CategorySelection'))

const RegistrationForm = ({ onRegister, registerLoading }) => {
  const { user } = useSelector(state => state.auth)
  const toast = useToast()
  const { t } = useTranslation('RegistrationForm') // Translation hook for this component

  // Memoize handleRegistration to prevent unnecessary re-renders
  const handleRegistration = useCallback(
    async selectedCategories => {
      try {
        await onRegister({
          userId: user._id,
          selectedCategories,
        })
        toast({
          title: t('registrationSuccess.title'),
          description: t('registrationSuccess.description'),
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'top',
        })
      } catch (err) {
        toast({
          title: t('registrationError.title'),
          description: t('registrationError.description'),
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top',
        })
      }
    },
    [onRegister, user._id, toast, t],
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
