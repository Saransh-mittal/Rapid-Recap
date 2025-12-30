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
} from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { notificationManager } from '../../../utils/notifications'

// Import utility functions
import { processCategories } from '../../../utils/categoryUtils'
import { categories, getCategories } from '../../../assets/Categories'

// Import sub-components
import UserSearchStep from './newChallengeComponents/UserSearchStep'
import CategorySelectionStep from './newChallengeComponents/CategorySelectionStep'
import ModalHeader from './newChallengeComponents/ModalHeader'
import ChallengeCreationAnimation from './newChallengeComponents/ChallengeCreationAnimation'
import {
  Step1Buttons,
  Step2Buttons,
} from './newChallengeComponents/StepButtons'

// Import hooks
import useQuickClash from '../../../customHooks/useQuickClash'
import useDailyTasks from '../../../customHooks/useDailyTasks'
import { setChallengeCreating } from '../../../redux/quickClashSlice'

// Audio feedback
import { quizAudioService } from '../../../services/quizAudioService'

const NewChallengeModal = ({ isOpen, onClose, preSelectedUser = null }) => {
  const { t } = useTranslation('QuickClash')
  const dispatch = useDispatch()

  const { createChallenge, challengeCreating: isSubmitting } = useQuickClash()

  const { trackFriendChallenge } = useDailyTasks()

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
  const allCategories = getCategories({ categoryPrivileges: null })
  const processedCategories = processCategories(allCategories)

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
    quizAudioService.playDismiss() // Sound for closing modal
    // If animation is showing, we can simply close without resetting state
    // to allow the background processing to continue
    setShowAnimation(false)
    dispatch(setChallengeCreating(false))
    if (showAnimation) {
      manuallyClosed.current = true
      onClose()
    } else {
      resetState()
      onClose()
    }
  }, [resetState, onClose, showAnimation, dispatch])

  // We no longer need a separate desktop category selection handler
  // since we're using the grid for both desktop and mobile

  // Category toggle handler for mobile view - exactly 1 category
  const toggleCategory = useCallback(categoryKey => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryKey)) {
        // Allow removing a category
        return prev.filter(c => c !== categoryKey)
      } else {
        // Replace any existing selection with the new category
        return [categoryKey]
      }
    })
  }, [])

  // Remove category
  const removeCategory = useCallback(categoryKey => {
    setSelectedCategories(prev => prev.filter(c => c !== categoryKey))
  }, [])

  // Go to next step
  const goToNextStep = useCallback(() => {
    if (step === 1 && !selectedUser) {
      notificationManager.warning(t('Please select an opponent'))
      return
    }
    quizAudioService.playButtonClick() // Sound for next step
    setStep(2)
  }, [step, selectedUser, t])

  // Go back to previous step
  const goToPreviousStep = useCallback(() => {
    quizAudioService.playButtonClick() // Sound for back step
    setStep(1)
  }, [])

  // Submit handler
  const handleSubmit = useCallback(async () => {
    // Requires exactly 1 category
    if (!selectedUser || selectedCategories.length !== 1) {
      notificationManager.warning(
        t('Incomplete selection'),
        t('Please select an opponent and a category')
      )
      return
    }

    // Show animation before making API call
    quizAudioService.playGoButton() // Energetic sound for creating challenge
    setShowAnimation(true)

    try {
      // Use the action from our hook
      const challenge = await createChallenge(
        selectedUser._id,
        selectedCategories,
      )

      // If creation was successful, emit socket event
      if (challenge) {
        trackFriendChallenge()
      }

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
    t,
    createChallenge,

    trackFriendChallenge,
    manuallyClosed,
    isOpen,
    resetState,
    onClose,
  ])

  // Is submission disabled? - Exactly 1 category required
  const isSubmitDisabled = useMemo(() => {
    return !selectedUser || selectedCategories.length !== 1
  }, [selectedUser, selectedCategories])

  // Get readable category names for the animation
  const getCategoryLabels = useCallback(() => {
    return selectedCategories.map(key => {
      const category = processedCategories.find(c => c.key === key)
      return category ? category.label : key
    })
  }, [selectedCategories, processedCategories])

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size={modalSize}>
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
                  /* handleCategoryChange prop no longer needed */
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
