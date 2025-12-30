import React, { useState, useEffect } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  Spinner,
  Center,
  Text,
  ModalCloseButton,
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import { useTranslation } from 'react-i18next'
import { notificationManager } from '../../utils/notifications'
import SubmittedQuizInterface from '../quizComponents/SubmittedQuizInterface'
import FixedBackground from '../miscellaneous/FixedBackground'
import QuizGivenSummary from '../quizComponents/QuizGivenSummary'
import NewQuizReportModal from './NewQuizReportModal'

const QuizReportModal = ({ isOpen, onClose, sessionId }) => {
  const { t } = useTranslation('QuickClash')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [report, setReport] = useState(null)
  const [showSummary, setShowSummary] = useState(false)

  useEffect(() => {
    const fetchReport = async () => {
      if (!isOpen || !sessionId) return

      try {
        setLoading(true)
        setError(null)

        const response = await axios.get(
          `/api/quickClash/session/${sessionId}/report`,
        )

        // Format the data to match what SubmittedQuizInterface expects
        const formattedResult = {
          message: 'Quiz report loaded successfully',
          RQM_score: response.data.report.RQM_score,
          nonBoostedRQM: response.data.report.RQM_score,
          baseRQM_score: response.data.report.baseRQM_score,
          boost: 1, // No boost in QuickClash
          isBoosted: false,
          quizDifficulty: response.data.report.quizDifficulty,
          timeTaken: response.data.report.timeTaken,
          score: response.data.report.score,
          pastRQMs: [],
          xpAwarded: 0,
          quinBoostUtilized: false,
          performanceBonus: 1,
          timeDilationBoosted: false,
          pauseRealTimeIQ: true,
          responses: response.data.report.responses,
          questions: response.data.report.questions,
          forgeScore: response.data.report.forgeScore,
          precisionBonus: response.data.report.precisionBonus,
          scoreSurgeBonus: response.data.report.scoreSurgeBonus,
          activePowerups: response.data.report.activePowerups,
          forgeQuestions: response.data.report.forgeQuestions,
        }

        setReport(formattedResult)
      } catch (err) {
        console.error('Error fetching quiz report:', err)
        setError(err.response?.data?.message || 'Failed to load quiz report')
        notificationManager.error(
          t('Error'),
          err.response?.data?.message || t('Failed to load quiz report')
        )
      } finally {
        setLoading(false)
      }
    }

    fetchReport()
  }, [isOpen, sessionId, t])

  if (!isOpen) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="full"
      motionPreset="slideInBottom"
      closeOnOverlayClick={true}
    >
      <ModalOverlay
        bg="blackAlpha.800"
        backdropFilter="blur(12px)"
      />
      <ModalContent
        bg="rgba(15, 23, 42, 0.98)"
        color="white"
        borderRadius="xl"
        boxShadow="0 4px 6px rgba(0, 0, 0, 0.3), 0 1px 3px rgba(0, 0, 0, 0.2)"
        overflow="hidden"
        position="relative"
        maxW="100%"
        minH="100vh"
      >
        <FixedBackground starCount={15} reduced={true} isModal={true} />
        {!loading && !error && <ModalCloseButton zIndex={10} />}

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Center height="100vh" flexDirection="column">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <Spinner
                    size="xl"
                    color="cyan.400"
                    thickness="4px"
                    speed="0.8s"
                  />
                </motion.div>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  style={{
                    marginTop: '1rem',
                    color: 'rgba(255,255,255,0.4)',
                    fontSize: '0.875rem'
                  }}
                >
                  📊 {t('Loading battle report...')}
                </motion.p>
              </Center>
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Center height="100vh" flexDirection="column" p={8}>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  style={{
                    width: '4rem',
                    height: '4rem',
                    borderRadius: '1rem',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1rem'
                  }}
                >
                  <Text fontSize="2xl">⚠️</Text>
                </motion.div>
                <Text fontSize="xl" fontWeight="bold" mb={2} color="red.300">
                  {t('Error Loading Report')}
                </Text>
                <Text color="whiteAlpha.500" textAlign="center">{error}</Text>
              </Center>
            </motion.div>
          ) : report && !showSummary ? (
            <motion.div
              key="report"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <NewQuizReportModal
                result={report}
                onClose={onClose}
              />
            </motion.div>
          ) : showSummary ? (
            <motion.div
              key="summary"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <QuizGivenSummary
                isOpen={showSummary}
                onClose={() => setShowSummary(false)}
                fetchQuizSummaryFromAnotherComp={true}
                timeTakenInitial={report?.timeTaken}
                quizGivenSummaryInitial={report?.questions?.map(q => ({
                  question: q.question,
                  options: q.options,
                  answer: q.answer,
                  explanation: q.explanation,
                  userAnswer: q.userAnswer,
                  isCorrect: q.isCorrect,
                }))}
                category={report?.category}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </ModalContent>
    </Modal>
  )
}

export default QuizReportModal
