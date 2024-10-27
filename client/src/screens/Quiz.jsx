import React, { useState, useCallback, useEffect, lazy, Suspense } from 'react'
import { Flex, useToast, Box } from '@chakra-ui/react'
import './Quiz.css'
import ReactGA from 'react-ga4'
import { useDispatch, useSelector } from 'react-redux'

import useFetchQuiz from '../customHooks/useFetchQuiz'
import useTimer from '../customHooks/useTimer'
import useSubmitQuiz from '../customHooks/useSubmitQuiz'
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
import useNavigationWarning from '../customHooks/useNavigationWarning'
import { useNavigate } from 'react-router-dom'
import QuizLoadingScreen from '../components/quizComponents/QuizLoadingScreen'
import { useFeatureDetection } from '../utils/featureDetection'
import useSafeSound from '../customHooks/useSafeSound'

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
  const articleId = article?._id

  const navigate = useNavigate()

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
  const features = useFeatureDetection()
  const { playClick } = useSafeSound({
    enabled: features.hasAudioSupport,
    volume: 0.5,
  })
  const [showGetSetGo, setShowGetSetGo] = useState(false)
  const [messageForTournament, setMessageForTournament] = useState('')
  const [userEligibleForTournament, setUserEligibleForTournament] = useState(
    user.eligibleForTournament,
  )

  const {
    quizSession,
    quizStatus,
    load,
    startQuiz,
    remainingTime,
    isQuizGenerating,
    socket,
  } = useFetchQuiz(articleId, i18n.language, onClose, setShowInstruction)
  const quizId = quizSession?.quiz
  const [submitError, setSubmitError] = useState(false)

  const totalQuestions = quizSession ? quizSession.questions.length : 0
  const shouldWarnBeforeLeaving = !showInstruction && !submitted
  useNavigationWarning(shouldWarnBeforeLeaving)

  useEffect(() => {
    const initialAnswers = Array(totalQuestions).fill('')
    setUserAnswers(initialAnswers)
  }, [totalQuestions])

  const { handleSubmitQuiz, submitLoad, submissionProgress } = useSubmitQuiz({
    articleId,
    sessionId: quizSession?._id,
    setResult,
    setSubmitError,
  })
  const { timer, timeTaken } = useTimer(
    remainingTime,
    isOpen,
    submitted,
    showInstruction,
    userAnswers,
    ({ timeTaken, userAnswers, setSubmitted }) =>
      handleSubmitQuiz({
        timeTaken,
        userAnswers,
        setSubmitted,
        setMessageForTournament,
        setUserEligibleForTournament,
      }),
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
    if (submitError) {
      onClose()
      return
    }
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
        const newXp =
          user.xp +
          (result?.xpAwarded || 5) +
          (result?.quinBoostUtilized ? 10 : 0)
        const xpBaseAtNextLevel = ((user.level + 1) * (user.level + 2) * 10) / 2
        let isLevelUp = false
        if (newXp >= xpBaseAtNextLevel) {
          isLevelUp = true
        }
        dispatchRedux(
          setUser({
            ...user,
            xp: newXp,
            level: newXp >= xpBaseAtNextLevel ? user.level + 1 : user.level,
            IQ_score: parseFloat(result?.newIQScore) || user.IQ_score,
            prevIQScore: parseFloat(result?.prevIQScore) || user.prevIQScore,
            societyUpgradeMessage: result?.societyUpgradeMessage,
            todaysQuizCnt: user.todaysQuizCnt + 1,
            revivalPeriodEnd:
              user.todaysQuizCnt + 1 === 6 ? null : user.revivalPeriodEnd,
            streak:
              result?.quinBoostUtilized && user.revivalPeriodEnd
                ? user.streakBeforeBreak + 1
                : user.streak + 1,
            quizAttempts: [...user?.quizAttempts, quizId],
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
                isLevelUp,
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
                isLevelUp,
                duration: isLevelUp ? null : 7000,
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
        if (user?.quizAttempts.length % 3 === 0) {
          dispatchRedux(
            addNoteMessage({
              messageType: 'quizFeedback',
              title: t('Please rate us'),
              duration: null,
              width: '300px',
              actions: [{ actionType: 'SUBMIT_QUIZ_FEEDBACK' }],
              quizId: quizId,
            }),
          )
        }
      }
      setTimeout(() => {
        if (
          currentTournament.status === 'registration' &&
          !isRegistered &&
          user.role !== 'guest'
        ) {
          if (!userEligibleForTournament) {
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
                messageForTournamentEligibility: messageForTournament,
                userStreak: user.streak,
                requiredStreak: 2,
                duration: 10000,
                width: '300px',
              }),
            )
          } else {
            dispatchRedux(
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
                requiredStreak: 2,
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
  const handleStartQuiz = useCallback(async () => {
    await startQuiz()
    setShowGetSetGo(true)
  }, [startQuiz, quizSession])
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
        setMessageForTournament,
        setUserEligibleForTournament,
      })

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
              handleAnswer={handleAnswer}
              userAnswers={userAnswers}
              quizSession={quizSession}
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
    isQuizGenerating,
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
    handleAnswer,
    userAnswers,
    showSubmittedInterface,
    socket,
  ])

  return (
    <>
      {isQuizGenerating || submitLoad ? (
        <QuizLoadingScreen
          socket={socket}
          isQuizGenerating={isQuizGenerating}
          isSubmitting={submitLoad}
        />
      ) : (
        <Suspense fallback={null}>
          <ModalComponent
            setSubmitted={setSubmitted}
            timer={timer}
            isOpen={isOpen}
            onClose={handleClose}
            renderModalBody={renderModalBody}
            load={load}
            showInstruction={showInstruction}
            startQuiz={handleStartQuiz}
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
            setMessageForTournament={setMessageForTournament}
            setUserEligibleForTournament={setUserEligibleForTournament}
            quizStatus={quizStatus}
          />
        </Suspense>
      )}
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
      {/* {isBackAlertOpen && (
        <Suspense fallback={null}>
          <ConfirmationModal
            bg={'black'}
            isOpen={isBackAlertOpen}
            onClose={onBackAlertClose}
            onConfirm={handleBackButtonConfirm}
            message={t('ConfirmCloseMessage')}
          />
        </Suspense>
      )} */}
    </>
  )
}

export default Quiz
