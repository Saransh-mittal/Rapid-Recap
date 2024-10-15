import React, {
  useState,
  useCallback,
  useEffect,
  lazy,
  Suspense,
  useMemo,
} from 'react'
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
import FullScreenLoadingSpinner from './FullScreenLoadingSpinner'
import {
  setRefetchLeaderBoard,
  updateCategoryStatus,
} from '../../../redux/tournamentSlice'
import i18n from 'i18next'
import useNavigationWarning from '../../../customHooks/useNavigationWarning'

// Lazy loaded components
const QuizInterface = lazy(() => import('../../quizComponents/QuizInterface'))
const SubmittedQuizInterface = lazy(() =>
  import('../../quizComponents/SubmittedQuizInterface'),
)
const ConfirmationModal = lazy(() =>
  import('../../quizComponents/customQuizModal/ConfirmationModal'),
)
const ModalComponent = lazy(() => import('../../quizComponents/ModalComponent'))
const QuizGivenSummary = lazy(() =>
  import('../../quizComponents/QuizGivenSummary'),
)
const ShutterAnimation = lazy(() => import('./ShutterAnimation'))

const TournamentQuiz = () => {
  const { t } = useTranslation('TournamentQuiz')
  const dispatch = useDispatch()
  const toast = useToast()

  const { isOpen } = useSelector(state => state.quiz)
  const { user } = useSelector(state => state.auth)
  const { tournamentId, category, completedCategories, categoryAttempts } =
    useSelector(state => state.tournament)

  // Local states
  const [error, setError] = useState(null)
  const [quizSession, setQuizSession] = useState(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState([])
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState(null)
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [stopTimer, setStopTimer] = useState(false)
  const [showGetSetGo, setShowGetSetGo] = useState(false)
  const [quizStarted, setQuizStarted] = useState(false)
  const [showCategoryQuizSummary, setShowCategoryQuizSummary] = useState(false)
  const shouldWarnBeforeLeaving = !submitted
  useNavigationWarning(shouldWarnBeforeLeaving)

  const { playClick } = useSound()

  const startQuiz = useCallback(async () => {
    setLoading(true)
    setError(null) // Clear any previous errors
    try {
      const response = await axios.post('/api/tournament/quiz/start', {
        userId: user._id,
        tournamentId,
        category,
        lang: i18n.language,
      })
      // Transform the questions to match the existing frontend structure
      const transformedQuestions = response.data.quizSession.questions.map(
        q => ({
          ...q,
          options: q.options.reduce((acc, opt, index) => {
            const key = ['a', 'b', 'c', 'd'][index]
            acc[key] = {
              text: opt.text,
              id: opt.id,
            }
            return acc
          }, {}),
        }),
      )

      setQuizSession({
        ...response.data.quizSession,
        questions: transformedQuestions,
      })
      setUserAnswers(new Array(transformedQuestions.length).fill(''))
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
  }, [isOpen, startQuiz])

  const handleAnswer = useCallback(
    selectedOption => {
      playClick()
      setUserAnswers(prevAnswers => {
        const newAnswers = [...prevAnswers]
        newAnswers[currentQuestionIndex] = selectedOption
        return newAnswers
      })
    },
    [currentQuestionIndex, playClick, setUserAnswers],
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
      setStopTimer(true)
      try {
        // Convert userAnswers back to the format expected by the backend
        const convertedUserAnswers = userAnswers.map((answer, index) => {
          const question = quizSession.questions[index]
          return question.options[answer]?.id || ''
        })

        const response = await axios.post('/api/tournament/quiz/submit', {
          quizSessionId: quizSession._id,
          userResponses: convertedUserAnswers,
          questionsIds: quizSession.questions.map(question => question._id),
          timeTaken,
        })
        setResult(response.data)

        dispatch(
          updateCategoryStatus({
            category: category,
            attemptsLeft: response.data.attemptsLeft,
            isCompleted: response.data.isCompleted,
            score: response.data.RQM_score,
          }),
        )
        setSubmitted(true)

        dispatch(
          setUser({
            ...user,
            xp: user.xp + 10,
          }),
        )

        if (response.data.sendTourFeedback === true) {
          dispatch(
            addNoteMessage({
              messageType: 'tournamentQuizFeedback',
              title: t('Please rate us'),
              duration: null,
              width: '300px',
              actions: [{ actionType: 'SUBMIT_TOURNAMENT_FEEDBACK' }],
              tournamentId: tournamentId,
            }),
          )
        }

        ReactGA.event({
          category: 'Tournament',
          action: 'Quiz Submitted',
          label: category,
        })
      } catch (error) {
        console.error('Error submitting quiz:', error)
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
    [quizSession, dispatch, user, category, completedCategories, t, toast],
  )

  const { timer, timeTaken } = useTimer(
    quizStarted,
    stopTimer,
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
      dispatch(setRefetchLeaderBoard(true))
      dispatch(
        addNoteMessage({
          messageType: 'xpAward',
          xpAwarded: 10,
          title: t('XPAwarded'),
          actions: [{ actionType: 'VIEW_EXPERIENCE' }],
          width: '250px',
          xpSource: 'TOURNAMENT_QUIZ',
        }),
      )
    }
  }, [submitted, currentQuestionIndex, quizSession, dispatch, t])

  const handleConfirmClose = useCallback(() => {
    handleSubmitQuiz({
      timeTaken,
      userAnswers,
    })
    dispatch(setIsOpen(false))
    dispatch(setTournamentQuiz(false))
    setShowConfirmationModal(false)
  }, [dispatch, timeTaken, userAnswers, handleSubmitQuiz])

  useEffect(() => {
    let lastPathName = window.location.pathname
    const handlePopState = event => {
      if (shouldWarnBeforeLeaving) {
        event.preventDefault()
        // Optionally, you can show a custom modal here instead of the browser's default
        if (
          window.confirm(
            'Are you sure you want to leave? Your progress will be lost.',
          )
        ) {
          // If confirmed, close the modal and navigate away
          handleConfirmClose()
        } else {
          // If not confirmed, push a new state to remain on the current page
          navigate(lastPathName)
        }
      }
    }

    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [shouldWarnBeforeLeaving])

  const handleAnimationComplete = useCallback(() => {
    setShowGetSetGo(false)
    setQuizStarted(true)
    ReactGA.event({
      category: 'Tournament',
      action: 'Quiz Started After Get-Set-Go Animation',
    })
  }, [])

  const renderModalBody = useCallback(() => {
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

    if (submitted) {
      return (
        <Suspense fallback={<div>{t('Loading')}</div>}>
          <SubmittedQuizInterface
            submitLoad={submitting}
            result={result}
            isTournament={true}
            onViewReport={() => {
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
          <Suspense fallback={<div>{t('Loading')}</div>}>
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
    showCategoryQuizSummary,
    tournamentId,
    category,
    t,
    playClick,
  ])

  return (
    <>
      <Suspense fallback={<div>{t('Loading')}</div>}>
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
        <Suspense fallback={<div>{t('Loading')}</div>}>
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
