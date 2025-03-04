// components/quickClashComponents/modals/NewChallengeModal.jsx
import React, { useState, useCallback, useMemo, useRef } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useBreakpointValue,
  useToast,
} from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import { categories } from '../../../assets/Categories'

// Import utility functions
import { processCategories } from '../../../utils/categoryUtils'

// Import sub-components
import UserSearchStep from './newChallengeComponents/UserSearchStep'
import CategorySelectionStep from './newChallengeComponents/CategorySelectionStep'
import ModalHeader from './newChallengeComponents/ModalHeader'
import ChallengeCreationAnimation from './newChallengeComponents/ChallengeCreationAnimation'
import {
  Step1Buttons,
  Step2Buttons,
} from './newChallengeComponents/StepButtons'
import useQuickClash from '../../../customHooks/useQuickClash'

const NewChallengeModal = ({ isOpen, onClose, preSelectedUser = null }) => {
  const { t } = useTranslation('QuickClash')
  const toast = useToast()
  const { createChallenge, challengeCreating: isSubmitting } = useQuickClash()

  // State management
  const [selectedUser, setSelectedUser] = useState(preSelectedUser || null)
  const [selectedCategories, setSelectedCategories] = useState([])
  const [step, setStep] = useState(preSelectedUser ? 2 : 1) // 1: Select opponent, 2: Select categories, 3: Creating challenge
  const [showAnimation, setShowAnimation] = useState(false)
  // Use ref to track if the modal was manually closed
  const manuallyClosed = useRef(false)

  // Responsive adjustments
  const modalSize = useBreakpointValue({ base: 'full', md: 'lg' })
  const buttonSize = useBreakpointValue({ base: 'md', md: 'md' })
  const tagSize = useBreakpointValue({ base: 'sm', md: 'md' })
  const isMobile = useBreakpointValue({ base: true, md: false })

  // Process categories with colors and icons
  const processedCategories = useMemo(
    () => processCategories(categories),
    [categories],
  )

  // Calculate progress percentage for steps
  const progressPercentage = useMemo(() => (step === 1 ? 50 : 100), [step])

  // Reset state when modal opens/closes
  const resetState = useCallback(() => {
    setSelectedUser(null)
    setSelectedCategories([])
    setStep(1)
    setShowAnimation(false)
    manuallyClosed.current = false
  }, [])

  // Reset form on close
  const handleClose = useCallback(() => {
    // If animation is showing, we can simply close without resetting state
    // to allow the background processing to continue
    if (showAnimation) {
      manuallyClosed.current = true
      onClose()
    } else {
      resetState()
      onClose()
    }
  }, [resetState, onClose, showAnimation])

  // No progress update handler needed

  // Category selection handler for desktop (multiple select)
  const handleCategoryChange = useCallback(e => {
    const options = e.target.options
    const selected = []
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selected.push(options[i].value)
      }
    }
    setSelectedCategories(selected)
  }, [])

  // Category toggle handler for mobile view - exactly 2 categories
  const toggleCategory = useCallback(
    categoryKey => {
      setSelectedCategories(prev => {
        if (prev.includes(categoryKey)) {
          // Allow removing a category
          return prev.filter(c => c !== categoryKey)
        } else {
          if (prev.length >= 2) {
            // Exactly 2 categories required - replace the oldest selection
            toast({
              title: t('Only 2 categories allowed'),
              description: t('First category has been replaced'),
              status: 'info',
              duration: 2000,
              isClosable: true,
              position: 'top',
            })
            return [prev[1], categoryKey]
          }
          // Add the new category
          return [...prev, categoryKey]
        }
      })
    },
    [t, toast],
  )

  // Remove category
  const removeCategory = useCallback(categoryKey => {
    setSelectedCategories(prev => prev.filter(c => c !== categoryKey))
  }, [])

  // Go to next step
  const goToNextStep = useCallback(() => {
    if (step === 1 && !selectedUser) {
      toast({
        title: t('Please select an opponent'),
        status: 'warning',
        duration: 2000,
        isClosable: true,
        position: 'top',
      })
      return
    }
    setStep(2)
  }, [step, selectedUser, t, toast])

  // Go back to previous step
  const goToPreviousStep = useCallback(() => {
    setStep(1)
  }, [])

  // Submit handler
  const handleSubmit = useCallback(async () => {
    // Requires exactly 2 categories
    if (!selectedUser || selectedCategories.length !== 2) {
      toast({
        title: t('Incomplete selection'),
        description: t('Please select an opponent and exactly 2 categories'),
        status: 'warning',
        duration: 3000,
        isClosable: true,
        position: 'top',
      })
      return
    }

    // Show animation before making API call
    setShowAnimation(true)

    try {
      // Use the action from our hook
      await createChallenge(selectedUser._id, selectedCategories)

      // Close the modal if not already closed
      if (!manuallyClosed.current && isOpen) {
        resetState()
        onClose()
      }
    } catch (error) {
      // Error handling already done in the hook
      setShowAnimation(false)
    }
  }, [
    selectedUser,
    selectedCategories,
    toast,
    t,
    onClose,
    resetState,
    isOpen,
    createChallenge,
  ])

  // Is submission disabled? - Exactly 2 categories required
  const isSubmitDisabled = useMemo(() => {
    return !selectedUser || selectedCategories.length !== 2
  }, [selectedUser, selectedCategories])

  // Get readable category names for the animation
  const getCategoryLabels = useCallback(() => {
    return selectedCategories.map(key => {
      const category = processedCategories.find(c => c.key === key)
      return category ? category.label : key
    })
  }, [selectedCategories, processedCategories])

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size={modalSize}
      motionPreset="slideInBottom"
    >
      <ModalOverlay backdropFilter="blur(10px)" bg="rgba(0,0,0,0.7)" />
      <ModalContent
        bg="linear-gradient(to bottom, #2d1b54, #1a1527)"
        borderRadius="xl"
        boxShadow="0 8px 32px rgba(0, 0, 0, 0.6)"
        borderWidth="1px"
        borderColor="purple.600"
        overflow="hidden"
        mx={3}
      >
        {showAnimation ? (
          <>
            <ModalCloseButton color="white" />
            <ChallengeCreationAnimation
              onClose={handleClose}
              categories={getCategoryLabels()}
            />
          </>
        ) : (
          <>
            {/* Header with progress */}
            <ModalHeader step={step} progressPercentage={progressPercentage} />
            <ModalCloseButton color="white" />

            <ModalBody py={6}>
              {step === 1 ? (
                <UserSearchStep
                  selectedUser={selectedUser}
                  setSelectedUser={setSelectedUser}
                  isMobile={isMobile}
                  setStep={setStep}
                />
              ) : (
                <CategorySelectionStep
                  processedCategories={processedCategories}
                  selectedCategories={selectedCategories}
                  handleCategoryChange={handleCategoryChange}
                  toggleCategory={toggleCategory}
                  removeCategory={removeCategory}
                  isMobile={isMobile}
                  tagSize={tagSize}
                />
              )}
            </ModalBody>

            <ModalFooter
              borderTopWidth="1px"
              borderColor="whiteAlpha.200"
              bgGradient="linear(to-b, rgba(45, 27, 84, 0.3), rgba(45, 27, 84, 0.1))"
              py={4}
            >
              {step === 1 ? (
                <Step1Buttons
                  handleClose={handleClose}
                  goToNextStep={goToNextStep}
                  isNextDisabled={!selectedUser}
                  buttonSize={buttonSize}
                />
              ) : (
                <Step2Buttons
                  goToPreviousStep={goToPreviousStep}
                  handleSubmit={handleSubmit}
                  isSubmitting={isSubmitting}
                  isSubmitDisabled={isSubmitDisabled}
                  buttonSize={buttonSize}
                />
              )}
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}

export default NewChallengeModal
