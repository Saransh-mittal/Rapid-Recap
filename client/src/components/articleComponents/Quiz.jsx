import React, {
  useState,
  useCallback,
  useEffect,
  lazy,
  Suspense,
  useMemo,
} from 'react'
import { Flex, useToast, Box, Spinner } from '@chakra-ui/react'
import './Quiz.css'
import ReactGA from 'react-ga4'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import useFetchQuiz from '../../customHooks/useFetchQuiz'
import useTimer from '../../customHooks/useTimer'
import useSubmitQuiz from '../../customHooks/useSubmitQuiz'
import useSound from '../../customHooks/useSound'
import {
  dailyStreakCheckerAndUpdater,
  quinBoostChecker,
} from '../../utils/quiz.utils'
import { addNoteMessage, fetchUnreadNoteMessages } from '../../redux/appSlice'
import { setUser } from '../../redux/authSlice'

// Lazy load components
const ConfirmationModal = lazy(() =>
  import('./customQuizModal/ConfirmationModal'),
)
const InstructionModal = lazy(() =>
  import('./customQuizModal/InstructionModal'),
)
const QuizInterface = lazy(() => import('./quizComponents/quizInterface'))
const SubmittedQuizInterface = lazy(() =>
  import('./quizComponents/SubmittedQuizInterface'),
)
const BoostedSubmittedQuizInterface = lazy(() =>
  import('./quizComponents/BoostedSubmittedQuizInterface'),
)
const QuizGivenSummary = lazy(() => import('./quizComponents/QuizGivenSummary'))
const ModalComponent = lazy(() => import('./ModalComponent'))
const GetSetGoAnimation = lazy(() =>
  import('./quizComponents/GetSetGoAnimation'),
)

const Quiz = ({
  article,
  isOpen,
  onClose,
  ofShowQuiz,
  language,
  isQuinBoostAvailable,
  setIsQuinBoostAvailable,
  setQuizLeftToGetQuizBoost,
  setTotalUsersGivenQuiz,
}) => {
  const articleId = article._id
  const { quizData, load, quizId, setLoad } = useFetchQuiz(
    articleId,
    language,
    onClose,
  )
  const totalQuestions = quizData ? quizData.questions.length : 0
  const toast = useToast()
  const { isBoosted } = useSelector(state => state.app)
  const { user } = useSelector(state => state.auth)
  const dispatchRedux = useDispatch()

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [userAnswers, setUserAnswers] = useState([])
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)
  const [showInstruction, setShowInstruction] = useState(true)
  const [isCloseButtonHovered, setIsCloseButtonHovered] = useState(false)
  const [isStartQuizButtonHovered, setIsStartQuizButtonHovered] =
    useState(false)
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
        title: 'Quiz failed!',
        description:
          error.response?.data?.error ||
          'Please try again (Close the quiz and try refreshing the page)',
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
      setTotalUsersGivenQuiz(prev => prev + 1)
      quinBoostChecker({
        setIsQuinBoostAvailable,
        setQuizLeftToGetQuizBoost,
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
        ofShowQuiz()
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
                title: 'XP Awarded For Quiz + Quin Boost',
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
                title: 'XP Awarded For Quiz',
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
              title: 'Congratulations! Your Strek is Revived!',
              width: '250px',
              streakStatus: 'revived',
              streakCount: user.streakBeforeBreak + 1,
            }),
          )
        user.revivalPeriodEnd &&
          user.todaysQuizCnt + 1 < 6 &&
          setTimeout(
            () =>
              dispatchRedux(
                addNoteMessage({
                  messageType: 'streak',
                  streakStatus: 'revival',
                  streakCount: user?.streakBeforeBreak,
                  remainingTime:
                    user.revivalPeriodEnd.getTime() - new Date().getTime(),
                  remainingQuizzes: 6 - user.todaysQuizCnt + 1,
                  title: 'Revive your streak!',
                  width: '300px',
                }),
              ),
            14000,
          )
      }
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
              title: 'XP Awarded For Quiz + Quin Boost',
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
              title: 'XP Awarded For Quiz',
              actions: [{ actionType: 'VIEW_EXPERIENCE' }],
              width: '250px',
              xpSource: 'QUIZ',
            }),
          )

      setShowConfirmationModal(false)
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error.response?.data?.error ||
          'Quiz closing failed! Please try again.',
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
    let scene = document.querySelector('.scene')
    let i = 0
    while (i < count) {
      let star = document.createElement('i')
      let x = Math.floor(Math.random() * window.innerWidth)
      let duration = Math.random() * 1
      let h = Math.random() * 100
      star.style.left = `${x}px`
      star.style.width = '1px'
      star.style.height = `${h}px`
      star.style.animationDuration = `${duration}s`
      scene.appendChild(star)
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
              language={language}
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
    language,
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
          setIsCloseButtonHovered={setIsCloseButtonHovered}
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
            message="Clicking on Confirm will result in submission of the quiz with 0 score. Are you sure you want to submit the quiz?"
          />
        </Suspense>
      )}
    </>
  )
}

export default Quiz
