// src/components/quizComponents/ActionButtons.jsx - Updated for report context
import React from 'react'
import { Grid, Button, Text, Box, Icon } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { Trophy, FileText, Home } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { setIsOpen } from '../../../redux/quizSlice'

const MotionBox = motion(Box)
const MotionButton = motion(Button)

const ActionButton = React.memo(
  ({ icon, label, iconColor, onClick, testId, t, dispatch }) => (
    <MotionButton
      onClick={() => {
        onClick()
        if (label === t('leaderboard')) {
          dispatch(setIsOpen(false))
        }
      }}
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

const ActionButtons = React.memo(
  ({
    step,
    onViewReport,
    isTournament,
    animationDelay,
    openedFromQuickClash = false,
  }) => {
    const { t } = useTranslation('SubmittedQuizInterface')
    const navigate = useNavigate()
    const location = useLocation()
    const { user } = useSelector(state => state.auth)
    const dispatch = useDispatch()

    if (step < 4) return null

    // Check if we're in the report context
    const isInReportContext = location.pathname.includes('/report')

    // Extract articleId from the current path for report context
    const articleId = location.pathname.match(
      /\/gamehub\/([^\/]+)\/report/,
    )?.[1]

    const handleBackToArticle = () => {
      if (articleId) {
        navigate(`/article/${articleId}`, { replace: true })
      }
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
          {/* Show different buttons based on context */}
          {isInReportContext ? (
            // In report context - show Back to Games button
            <ActionButton
              icon={Home}
              label="Back to Article"
              iconColor="blue.300"
              onClick={handleBackToArticle}
              testId="back-to-article-button"
              t={t}
              dispatch={dispatch}
            />
          ) : (
            // In normal context - show leaderboard if conditions are met
            !user?.needsOnboarding &&
            !openedFromQuickClash &&
            !isTournament && (
              <ActionButton
                icon={Trophy}
                label={t('leaderboard')}
                iconColor="yellow.300"
                onClick={() => navigate('/leaderboard')}
                testId="leaderboard-button"
                t={t}
                dispatch={dispatch}
              />
            )
          )}

          {/* Always show Quiz Summary button */}
          <ActionButton
            icon={FileText}
            label={t('quizSummary')}
            iconColor="purple.300"
            onClick={onViewReport}
            testId="quiz-summary-button"
            t={t}
            dispatch={dispatch}
          />
        </Grid>
      </MotionBox>
    )
  },
)

export default ActionButtons
