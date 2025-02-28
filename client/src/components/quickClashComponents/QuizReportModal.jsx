// components/quickClashComponents/QuizReportModal.jsx
import React, { useState, useEffect } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  Spinner,
  Center,
  useToast,
  Text,
  ModalCloseButton,
} from '@chakra-ui/react'
import axios from 'axios'
import { useTranslation } from 'react-i18next'
import SubmittedQuizInterface from '../quizComponents/SubmittedQuizInterface'
import FixedBackground from '../miscellaneous/FixedBackground'
import QuizGivenSummary from '../quizComponents/QuizGivenSummary'

const QuizReportModal = ({ isOpen, onClose, sessionId }) => {
  const { t } = useTranslation('QuickClash')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [report, setReport] = useState(null)
  const [showSummary, setShowSummary] = useState(false)
  const toast = useToast()

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
        }

        setReport(formattedResult)
      } catch (err) {
        console.error('Error fetching quiz report:', err)
        setError(err.response?.data?.message || 'Failed to load quiz report')
        toast({
          title: t('Error'),
          description:
            err.response?.data?.message || t('Failed to load quiz report'),
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchReport()
  }, [isOpen, sessionId, toast, t])

  if (!isOpen) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="full"
      scrollBehavior="inside"
      motionPreset="slideInBottom"
      closeOnOverlayClick={true}
    >
      <ModalOverlay backdropFilter="blur(5px)" />
      <ModalContent
        bg="rgba(26, 21, 39, 0.98)"
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

        {loading ? (
          <Center height="100vh">
            <Spinner size="xl" color="purple.500" thickness="4px" />
          </Center>
        ) : error ? (
          <Center height="100vh" flexDirection="column" p={8}>
            <Text fontSize="xl" mb={4}>
              {t('Error Loading Report')}
            </Text>
            <Text>{error}</Text>
          </Center>
        ) : report && !showSummary ? (
          <SubmittedQuizInterface
            result={report}
            onViewReport={() => setShowSummary(true)}
          />
        ) : showSummary ? (
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
        ) : null}
      </ModalContent>
    </Modal>
  )
}

export default QuizReportModal
