import React, { useState, useCallback, useEffect, lazy, Suspense } from 'react'
import { Flex, useToast, Box } from '@chakra-ui/react'
import './Quiz.css'
import ReactGA from 'react-ga4'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import useFetchQuiz from '../customHooks/useFetchQuiz'
import useTimer from '../customHooks/useTimer'
import useSubmitQuiz from '../customHooks/useSubmitQuiz'
import useSound from '../customHooks/useSound'
import {
  dailyStreakCheckerAndUpdater,
  quinBoostChecker,
} from '../utils/quiz.utils'
import { useTranslation } from 'react-i18next'
import { addNoteMessage, setStreakLoading } from '../redux/appSlice'
import { setUser } from '../redux/authSlice'
import {
  setIsQuinBoostAvailable,
  setQuizLeftToGetQuizBoost,
  setIsOpen,
} from '../redux/quizSlice'
import { setTotalUsersGivenQuiz } from '../redux/articleSlice'
import i18n from 'i18next'

// Lazy load components
const ConfirmationModal = lazy(() =>
  import('../components/quizComponents/customQuizModal/ConfirmationModal'),
)
const InstructionModal = lazy(() =>
  import('../components/quizComponents/customQuizModal/InstructionModal'),
)
const QuizInterface = lazy(() =>
  import('../components/quizComponents/QuizInterface'),
)
const SubmittedQuizInterface = lazy(() =>
  import('../components/quizComponents/SubmittedQuizInterface'),
)
const BoostedSubmittedQuizInterface = lazy(() =>
  import('../components/quizComponents/BoostedSubmittedQuizInterface'),
)
const QuizGivenSummary = lazy(() =>
  import('../components/quizComponents/QuizGivenSummary'),
)
const ModalComponent = lazy(() =>
  import('../components/quizComponents/ModalComponent'),
)
const GetSetGoAnimation = lazy(() =>
  import('../components/quizComponents/GetSetGoAnimation'),
)

const Quiz = () => {
  const { t } = useTranslation('Quiz')

  const dispatchRedux = useDispatch()
  const onClose = useCallback(
    () => dispatchRedux(setIsOpen(false)),
    [dispatchRedux],
  )
  const { totalUsersGivenQuiz, articleData: article } = useSelector(
    state => state.articles,
  )
  const { isOpen, isQuinBoostAvailable } = useSelector(state => state.quiz)
  const { isRegistered, currentTournament } = useSelector(
    state => state.tournament,
  )
  const articleId = article._id
  const { quizData, load, quizId, setLoad } = useFetchQuiz(
    articleId,
    i18n.language,
    onClose,
  )

  const totalQuestions = quizData ? quizData.questions.length : 0
  const toast = useToast()
  const { isBoosted } = useSelector(state => state.app)
  const { user } = useSelector(state => state.auth)

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [userAnswers, setUserAnswers] = useState([])
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)
  const [showInstruction, setShowInstruction] = useState(true)

  const [showSubmittedInterface, setShowSubmittedInterface] = useState(false)
  const [showQuizSummary, setShowQuizSummary] = useState(false)
  const [result, setResult] = useState({})
  const [isAnswered, setIsAnswered] = useState(false)
  const { playClick } = useSound()
  const [showGetSetGo, setShowGetSetGo] = useState(false)

  useEffect(() => {
    const initialAnswers = Array(totalQuestions).fill('')
    setUserAnswers(initialAnswers)
  }, [totalQuestions])

  const { handleSubmitQuiz, submitLoad } = useSubmitQuiz({
    articleId,
    quizData,
    quizId,
    setResult,
  })

  const { timer, timeTaken } = useTimer(
    isOpen,
    submitted,
    showInstruction,
    userAnswers,
    ({ timeTaken, userAnswers, setSubmitted }) =>
      handleSubmitQuiz({ timeTaken, userAnswers, setSubmitted }),
    setSubmitted,
  )

  const handleNextQuestion = useCallback(() => {
    playClick()
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1)
    }
  }, [playClick, currentQuestionIndex, totalQuestions])

  const handleAnswer = useCallback(
    selectedOption => {
      playClick()
      setUserAnswers(prevAnswers => {
        const newAnswers = [...prevAnswers]
        newAnswers[currentQuestionIndex] = selectedOption
        return newAnswers
      })
    },
    [playClick, currentQuestionIndex],
  )

  const startQuiz = async () => {
    setLoad(true)
    try {
      await axios.get(`/api/articles/startQuiz/${articleId}`)
      localStorage.removeItem('isQuizGivenCalled')
      setShowGetSetGo(true)
    } catch (error) {
      console.log(error)
      toast({
        title: t('QuizFailed'),
        description: error.response?.data?.error || t('RetryError'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setLoad(false)
      ReactGA.event({
        category: 'Quiz',
        action: 'Start Quiz Button Clicked',
      })
    }
  }

  const handleAnimationComplete = useCallback(() => {
    setShowGetSetGo(false)
    setShowInstruction(false)
    ReactGA.event({
      category: 'Quiz',
      action: 'Quiz Started After Get-Set-Go Animation',
    })
  }, [])

  const showConfirmation = useCallback(() => {
    setShowConfirmationModal(true)
  }, [])

  const handleClose = async () => {
    try {
      dispatchRedux(setStreakLoading(true))
      dispatchRedux(setTotalUsersGivenQuiz(totalUsersGivenQuiz + 1))
      quinBoostChecker({
        setIsQuinBoostAvailable,
        setQuizLeftToGetQuizBoost,
        dispatch: dispatchRedux,
      })

      if (
        !submitted &&
        currentQuestionIndex < totalQuestions &&
        !showInstruction
      ) {
        showConfirmation()
      } else if (showInstruction) {
        setShowInstruction(false)
        onClose()
      } else {
        onClose()
        dispatchRedux(
          setUser({
            ...user,
            xp:
              user.xp +
              (result?.xpAwarded || 5) +
              (result?.quinBoostUtilized ? 10 : 0),
            todaysQuizCnt: user.todaysQuizCnt + 1,
            revivalPeriodEnd:
              user.todaysQuizCnt + 1 === 6 ? null : user.revivalPeriodEnd,
            streak:
              result?.quinBoostUtilized && user.revivalPeriodEnd
                ? user.streakBeforeBreak + 1
                : user.streak + 1,
          }),
        )

        result?.quinBoostUtilized
          ? dispatchRedux(
              addNoteMessage({
                messageType: 'xpAward',
                xpAwarded: result?.xpAwarded || 10,
                title: t('XP Awarded For Quiz + Quin Boost'),
                actions: [{ actionType: 'VIEW_EXPERIENCE' }],
                width: '250px',
                milestoneName: 'QUIN_BOOST',
                isMilestone: true,
                duration: null,
                xpSource: 'QUIZ',
              }),
            )
          : dispatchRedux(
              addNoteMessage({
                messageType: 'xpAward',
                xpAwarded: result?.xpAwarded || 5,
                title: t('XP Awarded For Quiz'),
                actions: [{ actionType: 'VIEW_EXPERIENCE' }],
                width: '250px',
                xpSource: 'QUIZ',
              }),
            )

        result?.quinBoostUtilized &&
          user.revivalPeriodEnd &&
          dispatchRedux(
            addNoteMessage({
              messageType: 'streak',
              xpAwarded: result?.xpAwarded || 10,
              title: t('Congratulations! Your Strek is Revived!'),
              width: '250px',
              streakStatus: 'revived',
              streakCount: user.streakBeforeBreak + 1,
            }),
          )
      }
      setTimeout(() => {
        if (
          currentTournament.status === 'registration' &&
          !isRegistered &&
          user.role !== 'guest'
        ) {
          if (user.streak < 3) {
            dispatchRedux(
              addNoteMessage({
                title: 'Keep Going!',
                messageType: 'tournament',
                tournamentStatus: 'locked',
                tournamentName:
                  '#' +
                  String(
                    String(currentTournament?.tournamentNumber).padStart(
                      3,
                      '0',
                    ),
                  ),
                tournamentEndTime: currentTournament?.registrationEndDate,
                userStreak: user.streak,
                requiredStreak: 3 - user.streak,
                duration: 10000,
                width: '300px',
              }),
            )
          } else {
            dispatch(
              addNoteMessage({
                title: 'Tournament Time!',
                duration: 10000,
                width: '300px',
                messageType: 'tournament',
                tournamentStatus: 'registration',
                tournamentName:
                  '#' +
                  String(
                    String(currentTournament?.tournamentNumber).padStart(
                      3,
                      '0',
                    ),
                  ),
                tournamentEndTime: currentTournament?.registrationEndDate,
                userStreak: user?.streak,
                requiredStreak: 3,
              }),
            )
          }
        }
      }, 10000)
      setTimeout(() => dailyStreakCheckerAndUpdater(dispatchRedux), 14000)
    } catch (error) {
      console.log(error)
    }
  }

  const handleConfirmClose = useCallback(async () => {
    try {
      quinBoostChecker({
        setIsQuinBoostAvailable,
        setQuizLeftToGetQuizBoost,
        dispatch: dispatchRedux,
      })

      handleSubmitQuiz({
        timeTaken,
        userAnswers,
        setSubmitted,
      })
      dispatchRedux(
        setUser({
          ...user,
          xp:
            user.xp +
            (result?.xpAwarded || 5) +
            (result?.quinBoostUtilized ? 10 : 0),
          todaysQuizCnt: user.todaysQuizCnt + 1,
          revivalPeriodEnd:
            user.todaysQuizCnt + 1 === 6 ? null : user.revivalPeriodEnd,
        }),
      )

      result?.quinBoostUtilized
        ? dispatchRedux(
            addNoteMessage({
              messageType: 'xpAward',
              xpAwarded: result?.xpAwarded || 10,
              title: t('XP Awarded For Quiz + Quin Boost'),
              actions: [{ actionType: 'VIEW_EXPERIENCE' }],
              width: '250px',
              milestoneName: 'QUIN_BOOST',
              isMilestone: true,
              duration: null,
              xpSource: 'QUIZ',
            }),
          )
        : dispatchRedux(
            addNoteMessage({
              messageType: 'xpAward',
              xpAwarded: result?.xpAwarded || 5,
              title: t('XP Awarded For Quiz'),
              actions: [{ actionType: 'VIEW_EXPERIENCE' }],
              width: '250px',
              xpSource: 'QUIZ',
            }),
          )

      setShowConfirmationModal(false)
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || t('QuizClosingError'),
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
      })
      handleClose()
    }
  }, [
    handleSubmitQuiz,
    timeTaken,
    userAnswers,
    setSubmitted,
    toast,
    handleClose,
  ])

  useEffect(() => {
    const handleBeforeUnload = event => {
      event.preventDefault()
      event.returnValue = ''
      setShowConfirmationModal(true)
    }
    if (!showInstruction)
      window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [showInstruction])

  useEffect(() => {
    if (submitted && !load && (isBoosted || isQuinBoostAvailable)) {
      stars()
    }
  }, [submitted, load, isBoosted, isQuinBoostAvailable])

  useEffect(() => {
    setIsAnswered(userAnswers[currentQuestionIndex] !== '')
  }, [userAnswers, currentQuestionIndex])

  useEffect(() => {
    if (showSubmittedInterface) {
      const scene = document.querySelector('.scene')
      if (!scene) return
      const stars = scene.querySelectorAll('i')
      stars.forEach(star => {
        star.remove()
      })
    }
  }, [showSubmittedInterface])

  const stars = () => {
    let count = 40
    let scene = document?.querySelector('.scene')
    let i = 0
    while (i < count) {
      let star = document?.createElement('i')
      let x = Math.floor(Math.random() * window.innerWidth)
      let duration = Math.random() * 1
      let h = Math.random() * 100
      star.style.left = `${x}px`
      star.style.width = '1px'
      star.style.height = `${h}px`
      star.style.animationDuration = `${duration}s`
      scene?.appendChild(star)
      i++
    }
  }

  const renderModalBody = useCallback(() => {
    if (showInstruction) {
      return (
        <Box position={'relative'}>
          {showGetSetGo && (
            <Suspense fallback={null}>
              <GetSetGoAnimation onComplete={handleAnimationComplete} />
            </Suspense>
          )}
          <Suspense fallback={null}>
            <InstructionModal
              isQuinBoostAvailable={isQuinBoostAvailable}
              language={i18n.language}
            />
          </Suspense>
        </Box>
      )
    }

    if (showQuizSummary) {
      return (
        <Suspense fallback={null}>
          <QuizGivenSummary
            isOpen={isOpen}
            onClose={() => setShowQuizSummary(false)}
            articleId={articleId}
          />
        </Suspense>
      )
    }

    if (showSubmittedInterface) {
      return (
        <Suspense fallback={null}>
          <SubmittedQuizInterface
            submitLoad={submitLoad}
            result={result}
            onViewReport={() => {
              playClick()
              setShowQuizSummary(true)
            }}
          />
        </Suspense>
      )
    }

    return (
      <Flex
        p={4}
        mt={'25px'}
        display={'flex'}
        flexDirection={'column'}
        justifyContent={'center'}
        alignItems={'center'}
        width={'100%'}
        userSelect={'none'}
        position={'relative'}
      >
        {!submitted ? (
          <Suspense fallback={null}>
            <QuizInterface
              load={load}
              currentQuestionIndex={currentQuestionIndex}
              totalQuestions={totalQuestions}
              quizData={quizData}
              handleAnswer={handleAnswer}
              userAnswers={userAnswers}
            />
          </Suspense>
        ) : isBoosted || isQuinBoostAvailable ? (
          <Suspense fallback={null}>
            <BoostedSubmittedQuizInterface
              isOpen={isOpen}
              score={result?.RQM_score}
              submitLoad={submitLoad}
              isBoosted={isBoosted}
              isQuinBoostAvailable={isQuinBoostAvailable}
              onViewReport={() => {
                playClick()
                setShowSubmittedInterface(true)
              }}
            />
            {showSubmittedInterface && (
              <SubmittedQuizInterface
                submitLoad={submitLoad}
                result={result}
                onViewReport={() => {
                  playClick()
                  setShowQuizSummary(true)
                }}
              />
            )}
          </Suspense>
        ) : (
          <Suspense fallback={null}>
            <SubmittedQuizInterface
              submitLoad={submitLoad}
              result={result}
              onViewReport={() => {
                playClick()
                setShowQuizSummary(true)
              }}
            />
          </Suspense>
        )}
      </Flex>
    )
  }, [
    showInstruction,
    showGetSetGo,
    handleAnimationComplete,
    isQuinBoostAvailable,
    i18n.language,
    showQuizSummary,
    isOpen,
    articleId,
    submitLoad,
    result,
    playClick,
    submitted,
    isBoosted,
    load,
    currentQuestionIndex,
    totalQuestions,
    quizData,
    handleAnswer,
    userAnswers,
    showSubmittedInterface,
  ])

  return (
    <>
      <Suspense fallback={null}>
        <ModalComponent
          setSubmitted={setSubmitted}
          timer={timer}
          isOpen={isOpen}
          onClose={handleClose}
          renderModalBody={renderModalBody}
          load={load}
          showInstruction={showInstruction}
          startQuiz={startQuiz}
          handleNextQuestion={handleNextQuestion}
          currentQuestionIndex={currentQuestionIndex}
          totalQuestions={totalQuestions}
          submitted={submitted}
          submitLoad={submitLoad}
          timeTaken={timeTaken}
          userAnswers={userAnswers}
          handleSubmitQuiz={handleSubmitQuiz}
          setShowInstruction={setShowInstruction}
          isAnswered={isAnswered}
          showGetSetGo={showGetSetGo}
        />
      </Suspense>
      {!showInstruction && showConfirmationModal && (
        <Suspense fallback={null}>
          <ConfirmationModal
            bg={'black'}
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

export default Quiz
