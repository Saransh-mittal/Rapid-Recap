import React, { useMemo, useCallback, lazy, Suspense } from 'react'
import {
  Button,
  Text,
  Box,
  Progress,
  VStack,
  Spinner,
  Center,
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { QUICK_CLASH_CLASSES } from '../quickClashComponents/utils/quickClashColors'

// Lazy load OptionButton for code splitting
const OptionButton = lazy(() => import('./OptionButton'))

const QuizInterface = ({
  load,
  currentQuestionIndex,
  totalQuestions,
  handleAnswer,
  userAnswers,
  quizSession,
  isTournament = false,
}) => {
  const { t } = useTranslation('QuizInterface')

  // Set color scheme based on tournament mode
  const getColor = (defaultColor, tournamentColor) =>
    isTournament ? tournamentColor : defaultColor

  const currentQuestion = useMemo(
    () => quizSession?.questions[currentQuestionIndex] || null,
    [quizSession, currentQuestionIndex],
  )

  const handleOptionSelect = useCallback(
    optionKey => {
      handleAnswer(optionKey)
    },
    [handleAnswer],
  )

  if (load || !quizSession || quizSession.questions.length === 0) {
    return (
      <Center height="400px">
        <Spinner size="xl" color={getColor('cyan.400', 'yellow.500')} thickness="4px" />
      </Center>
    )
  }

  if (!currentQuestion) {
    return (
      <Center height="400px">
        <Text fontSize="xl" color={getColor('whiteAlpha.800', 'yellow.400')}>
          {t('noQuizData')}
        </Text>
      </Center>
    )
  }

  return (
    <Box
      width="100%"
      margin="0 auto"
      display="flex"
      flexDirection="column"
      justifyContent="center"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -50, opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-xl md:text-2xl font-bold ${isTournament ? 'text-yellow-400' : 'text-cyan-400'}`}>
              {t('question')} {currentQuestionIndex + 1} <span className="text-white/40 text-lg font-normal">/ {totalQuestions}</span>
            </h2>

            {/* Custom Progress Bar */}
            <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className={`h-full ${isTournament ? 'bg-yellow-500' : 'bg-gradient-to-r from-cyan-500 to-blue-500'}`}
                initial={{ width: 0 }}
                animate={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          <div className="mb-8 relative">
            {/* Decorative quote icon */}
            <div className="absolute -top-4 -left-2 text-6xl text-white/5 font-serif select-none pointer-events-none">"</div>

            <p className={`text-lg md:text-xl font-medium leading-relaxed relative z-10 ${isTournament ? 'text-yellow-100' : 'text-white/90'}`}>
              {currentQuestion.question}
            </p>
          </div>

          {currentQuestion && (
            <VStack spacing={3} align="stretch">
              {/* Map through options with correct structure handling */}
              {Object.entries(currentQuestion.options || {}).map(
                ([key, value]) => (
                  <OptionButton
                    key={key}
                    optionKey={key}
                    // Handle both object format and direct string format
                    optionText={typeof value === 'object' ? value.text : value}
                    isSelected={userAnswers[currentQuestionIndex] === key}
                    onSelect={handleAnswer}
                    isTournament={isTournament}
                  />
                ),
              )}
            </VStack>
          )}
        </motion.div>
      </AnimatePresence>
    </Box>
  )
}

export default React.memo(QuizInterface)
