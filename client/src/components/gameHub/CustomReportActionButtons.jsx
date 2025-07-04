// components/gameHub/CustomReportActionButtons.jsx - Simple navigation fix
import React from 'react'
import { Grid, Button, Text, Box, Icon } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { FileText, BookOpen } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

const MotionBox = motion(Box)
const MotionButton = motion(Button)

const ActionButton = React.memo(
  ({ icon, label, iconColor, onClick, testId }) => (
    <MotionButton
      onClick={onClick}
      data-testid={testId}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      size="lg"
      width="full"
      height="56px"
      bg="rgba(23, 25, 35, 0.5)"
      border="1px solid"
      borderColor="whiteAlpha.100"
      rounded="xl"
      _hover={{
        bg: 'rgba(23, 25, 35, 0.7)',
        borderColor: 'whiteAlpha.200',
      }}
      _active={{
        bg: 'rgba(23, 25, 35, 0.9)',
      }}
      display="flex"
      alignItems="center"
      justifyContent="center"
      gap={3}
      px={6}
    >
      <Icon as={icon} boxSize={5} color={iconColor} />
      <Text
        fontSize="sm"
        fontWeight="normal"
        letterSpacing="wide"
        color={iconColor}
        opacity={0.9}
      >
        {label}
      </Text>
    </MotionButton>
  ),
)

const CustomReportActionButtons = React.memo(
  ({ step, onViewReport, articleId, animationDelay = 0 }) => {
    const { t } = useTranslation('SubmittedQuizInterface')
    const navigate = useNavigate()

    if (step < 4) return null

    // FIXED: Use simple navigation to article
    const handleBackToArticle = () => {
      console.log('CustomReportActionButtons: navigating to article')
      navigate(-1)
    }

    return (
      <MotionBox
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: animationDelay }}
      >
        <Grid
          templateColumns="repeat(2, 1fr)"
          gap={4}
          mt={6}
          mx="auto"
          maxW="100%"
          px={0}
        >
          <ActionButton
            icon={BookOpen}
            label="Back to Article"
            iconColor="blue.300"
            onClick={handleBackToArticle}
            testId="back-to-article-button"
          />
          <ActionButton
            icon={FileText}
            label={t('quizSummary')}
            iconColor="purple.300"
            onClick={onViewReport}
            testId="quiz-summary-button"
          />
        </Grid>
      </MotionBox>
    )
  },
)

export default CustomReportActionButtons
