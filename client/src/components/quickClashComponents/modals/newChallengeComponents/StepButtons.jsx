// components/quickClashComponents/modals/newChallengeComponents/StepButtons.jsx
import React from 'react'
import { Flex, Button, Icon } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { FiX, FiZap } from 'react-icons/fi'
import { Target } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const MotionButton = motion(Button)

// Step 1 buttons (User Selection)
export const Step1Buttons = ({
  handleClose,
  goToNextStep,
  isNextDisabled,
  buttonSize,
}) => {
  const { t } = useTranslation('QuickClash')

  return (
    <Flex width="100%" justify="space-between">
      <Button
        variant="ghost"
        onClick={handleClose}
        color="whiteAlpha.700"
        _hover={{ bg: 'whiteAlpha.100', color: 'white' }}
        size={buttonSize}
      >
        {t('Cancel')}
      </Button>
      <MotionButton
        rightIcon={<Icon as={Target} />}
        onClick={goToNextStep}
        isDisabled={isNextDisabled}
        bgGradient="linear(to-r, purple.500, purple.700)"
        _hover={{ bgGradient: 'linear(to-r, purple.600, purple.800)' }}
        color="white"
        size={buttonSize}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        boxShadow="0 4px 10px rgba(138, 43, 226, 0.3)"
      >
        {t('Next: Choose Categories')}
      </MotionButton>
    </Flex>
  )
}

// Step 2 buttons (Category Selection)
export const Step2Buttons = ({
  goToPreviousStep,
  handleSubmit,
  isSubmitting,
  isSubmitDisabled,
  buttonSize,
}) => {
  const { t } = useTranslation('QuickClash')

  return (
    <Flex width="100%" justify="space-between" gap={4}>
      <Button
        leftIcon={<Icon as={FiX} />}
        onClick={goToPreviousStep}
        variant="outline"
        colorScheme="whiteAlpha"
        size={buttonSize}
      >
        {t('Back')}
      </Button>
      <MotionButton
        rightIcon={<Icon as={FiZap} />}
        onClick={handleSubmit}
        isLoading={isSubmitting}
        isDisabled={isSubmitDisabled}
        bgGradient="linear(to-r, yellow.400, orange.500)"
        _hover={{ bgGradient: 'linear(to-r, yellow.500, orange.600)' }}
        color="black"
        fontWeight="bold"
        size={buttonSize}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        boxShadow="0 4px 15px rgba(255, 186, 8, 0.4)"
      >
        {t('Send Challenge')}
      </MotionButton>
    </Flex>
  )
}
