import React, { useState, useCallback, useEffect, lazy, Suspense } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Flex, useToast, Box } from '@chakra-ui/react'
import axios from 'axios'
import { useTranslation } from 'react-i18next'
import ReactGA from 'react-ga4'

import { setIsOpen, setTournamentQuiz } from '../../../redux/quizSlice'
import { setUser } from '../../../redux/authSlice'
import { addNoteMessage } from '../../../redux/appSlice'
import useTimer from '../../../customHooks/useTimer'
import useSound from '../../../customHooks/useSound'
import QuizGivenSummary from '../../quizComponents/QuizGivenSummary'
import ShutterAnimation from './ShutterAnimation'
import FullScreenLoadingSpinner from './FullScreenLoadingSpinner'

const QuizInterface = lazy(() => import('../../quizComponents/QuizInterface'))
const SubmittedQuizInterface = lazy(() =>
  import('../../quizComponents/SubmittedQuizInterface'),
)
const ConfirmationModal = lazy(() =>
  import('../../quizComponents/customQuizModal/ConfirmationModal'),
)
const ModalComponent = lazy(() => import('../../quizComponents/ModalComponent'))

const TournamentQuiz = () => {
  const { t } = useTranslation('Quiz')
  const dispatch = useDispatch()
  const toast = useToast()

  const { isOpen } = useSelector(state => state.quiz)
  const { user } = useSelector(state => state.auth)
  const { tournamentId, category } = useSelector(state => state.tournament)
  const [error, setError] = useState(null)
  const [quizSession, setQuizSession] = useState(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState([])
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState(null)
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showGetSetGo, setShowGetSetGo] = useState(false)
  const [quizStarted, setQuizStarted] = useState(false)
  const [showCategoryQuizSummary, setShowCategoryQuizSummary] = useState(false)

  const { playClick } = useSound()

  const startQuiz = useCallback(async () => {
    setLoading(true)
    setError(null) // Clear any previous errors
    try {
      const response = await axios.post('/api/tournament/quiz/start', {
        userId: user._id,
        tournamentId,
        category,
      })
      setQuizSession(response.data.quizSession)
      setUserAnswers(
        new Array(response.data.quizSession.questions.length).fill(''),
      )
      setShowGetSetGo(true)
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setError(error.response.data.message)
        toast({
          title: t('QuizStartFailed'),
          description: error.response.data.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      } else {
        setError(t('UnexpectedError'))
        toast({
          title: t('QuizStartFailed'),
          description: t('UnexpectedError'),
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      }
      dispatch(setIsOpen(false))
    } finally {
      setLoading(false)
    }
  }, [user._id, tournamentId, category, dispatch, toast, t])

  useEffect(() => {
    if (isOpen) {
      startQuiz()
    }
  }, [isOpen])

  const handleAnswer = useCallback(
    selectedOption => {
      playClick()
      setUserAnswers(prevAnswers => {
        const newAnswers = [...prevAnswers]
        newAnswers[currentQuestionIndex] = selectedOption
        return newAnswers
      })
    },
    [currentQuestionIndex, playClick],
  )

  const handleNextQuestion = useCallback(() => {
    playClick()
    if (currentQuestionIndex < quizSession.questions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1)
    }
  }, [currentQuestionIndex, quizSession, playClick])

  const handleSubmitQuiz = useCallback(
    async ({ timeTaken, userAnswers }) => {
      setSubmitting(true)
      try {
        const response = await axios.post('/api/tournament/quiz/submit', {
          quizSessionId: quizSession._id,
          userResponses: userAnswers,
          timeTaken,
        })
        setResult(response.data)
        setSubmitted(true)

        dispatch(
          setUser({
            ...user,
            xp: user.xp + response.data.xpAwarded,
          }),
        )

        ReactGA.event({
          category: 'Tournament',
          action: 'Quiz Submitted',
          label: category,
        })
      } catch (error) {
        toast({
          title: t('QuizSubmissionFailed'),
          description: error.response?.data?.message || t('UnexpectedError'),
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      } finally {
        setSubmitting(false)
      }
    },
    [quizSession, userAnswers, dispatch, user, category, toast, t],
  )

  const { timer, timeTaken } = useTimer(
    quizStarted,
    submitted,
    false,
    userAnswers,
    handleSubmitQuiz,
    setSubmitted,
  )

  const handleClose = useCallback(() => {
    if (!submitted && currentQuestionIndex < quizSession.questions.length) {
      setShowConfirmationModal(true)
    } else {
      dispatch(setIsOpen(false))
      dispatch(setTournamentQuiz(false))
      dispatch(
        addNoteMessage({
          messageType: 'xpAward',
          xpAwarded: response.data.xpAwarded,
          title: t('XP Awarded For Tournament Quiz'),
          actions: [{ actionType: 'VIEW_EXPERIENCE' }],
          width: '250px',
          xpSource: 'TOURNAMENT_QUIZ',
        }),
      )
    }
  }, [submitted, currentQuestionIndex, quizSession, dispatch])

  const handleConfirmClose = useCallback(() => {
    handleSubmitQuiz({
      timeTaken,
      userAnswers,
    })
    dispatch(setIsOpen(false))
    dispatch(setTournamentQuiz(false))
    setShowConfirmationModal(false)
  }, [dispatch, timeTaken, userAnswers, handleSubmitQuiz])

  const handleAnimationComplete = useCallback(() => {
    setShowGetSetGo(false)
    setQuizStarted(true)
    ReactGA.event({
      category: 'Tournament',
      action: 'Quiz Started After Get-Set-Go Animation',
    })
  }, [])

  const renderModalBody = useCallback(() => {
    if (loading) {
      return <FullScreenLoadingSpinner />
    }

    if (showGetSetGo) {
      return (
        <Suspense fallback={null}>
          <ShutterAnimation onComplete={handleAnimationComplete} />
        </Suspense>
      )
    }

    if (showCategoryQuizSummary) {
      return (
        <Suspense fallback={null}>
          <QuizGivenSummary
            isOpen={showCategoryQuizSummary}
            onClose={() => setShowCategoryQuizSummary(false)}
            isTournament={true}
            tournamentId={tournamentId}
            category={category}
          />
        </Suspense>
      )
    }

    if (showCategoryQuizSummary) {
      return (
        <Suspense fallback={null}>
          <QuizGivenSummary
            isOpen={showCategoryQuizSummary}
            onClose={() => setShowCategoryQuizSummary(false)}
            isTournament={true}
            tournamentId={tournamentId}
            category={category}
          />
        </Suspense>
      )
    }

    if (submitted) {
      return (
        <Suspense fallback={<div>Loading...</div>}>
          <SubmittedQuizInterface
            submitLoad={submitting}
            result={result}
            isTournament={true}
            onViewReport={() => {
              /* Implement view report logic */
              playClick()
              setShowCategoryQuizSummary(true)
            }}
          />
        </Suspense>
      )
    }

    if (quizStarted) {
      return (
        <Flex
          p={4}
          mt={'25px'}
          flexDirection={'column'}
          justifyContent={'center'}
          alignItems={'center'}
          width={'100%'}
          userSelect={'none'}
          position={'relative'}
        >
          <Suspense fallback={<div>Loading...</div>}>
            <QuizInterface
              load={loading}
              currentQuestionIndex={currentQuestionIndex}
              totalQuestions={quizSession?.questions.length || 0}
              quizData={quizSession}
              handleAnswer={handleAnswer}
              userAnswers={userAnswers}
              isTournament={true}
            />
          </Suspense>
        </Flex>
      )
    }

    return null
  }, [
    loading,
    showGetSetGo,
    handleAnimationComplete,
    submitted,
    submitting,
    result,
    quizStarted,
    currentQuestionIndex,
    quizSession,
    handleAnswer,
    userAnswers,
  ])

  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <ModalComponent
          isOpen={isOpen}
          onClose={handleClose}
          renderModalBody={renderModalBody}
          handleNextQuestion={handleNextQuestion}
          currentQuestionIndex={currentQuestionIndex}
          totalQuestions={quizSession?.questions.length || 0}
          submitted={submitted}
          submitLoad={submitting}
          userAnswers={userAnswers}
          handleSubmitQuiz={handleSubmitQuiz}
          isAnswered={userAnswers[currentQuestionIndex] !== ''}
          timer={timer}
          showInstruction={false}
          setShowInstruction={() => {}}
          startQuiz={startQuiz}
          timeTaken={timeTaken}
          showGetSetGo={showGetSetGo}
          size={'full'}
          isTournament={true}
        />
      </Suspense>
      {showConfirmationModal && (
        <Suspense fallback={<div>Loading...</div>}>
          <ConfirmationModal
            isOpen={showConfirmationModal}
            onClose={() => setShowConfirmationModal(false)}
            onConfirm={handleConfirmClose}
            message={t('ConfirmCloseMessage')}
          />
        </Suspense>
      )}
    </>
  )
}

export default TournamentQuiz
