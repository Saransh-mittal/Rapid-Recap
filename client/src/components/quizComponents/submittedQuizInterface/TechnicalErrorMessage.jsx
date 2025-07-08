// src/components/quizComponents/TechnicalErrorMessage.jsx
import React from 'react'
import { Box, Text, Icon } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { WarningIcon } from '@chakra-ui/icons'
import { useTranslation } from 'react-i18next'

const MotionBox = motion(Box)

const TechnicalErrorMessage = React.memo(({ technicalError }) => {
  const { t } = useTranslation('SubmittedQuizInterface')

  return (
    <MotionBox
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      textAlign="center"
      mt={6}
      px={5}
      py={4}
      bg="rgba(255, 0, 0, 0.1)" // semi-transparent red tint
      borderRadius="lg"
      border="1px solid"
      borderColor="red.500"
      display="flex"
      alignItems="center"
      justifyContent="center"
      gap={3}
      backdropFilter="blur(6px)"
      boxShadow="0 0 10px rgba(255, 0, 0, 0.3)"
      zIndex={1}
    >
      <Icon as={WarningIcon} color="red.400" boxSize={5} />
      <Text fontSize="sm" color="red.300" fontWeight="medium">
        {technicalError}
      </Text>
    </MotionBox>
  )
})

export default TechnicalErrorMessage
