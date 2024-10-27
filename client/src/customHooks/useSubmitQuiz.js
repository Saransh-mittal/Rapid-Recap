import { useState, useEffect } from 'react'
import axios from 'axios'
import { useToast } from '@chakra-ui/react'
import { useFeatureDetection } from '../utils/featureDetection'
import useSafeSound from './useSafeSound'
import { useSocket } from './useSocket'
import { useDispatch, useSelector } from 'react-redux'
import { setOnBoardingQuizSubmitted } from '../redux/quizSlice'
import { isClient } from '../utils/environment'

const useSubmitQuiz = ({ articleId, sessionId, setResult, setSubmitError }) => {
  const [submitLoad, setSubmitLoad] = useState(false)
  const [submissionProgress, setSubmissionProgress] = useState(0)
  const toast = useToast()
  const features = useFeatureDetection()
  const dispatch = useDispatch()
  const { user } = useSelector(state => state.auth)

  // Initialize safe sound
  const { playEndChime, isReady } = useSafeSound({
    enabled: features.hasAudioSupport,
    soundEnabled: true,
    onError: err => console.warn('Sound error in quiz submission:', err),
  })

  // Get socket safely
  const { getSocket } = useSocket()

  // Handle socket connection and events
  useEffect(() => {
    if (!isClient) return

    let currentSocket = null

    const initializeSocket = async () => {
      try {
        currentSocket = await getSocket()
        if (currentSocket && user) {
          currentSocket.emit('join quiz submission progress', user._id)
          currentSocket.on('quiz_submission_progress', data => {
            setSubmissionProgress(data.progress)
          })
        }
      } catch (err) {
        console.warn('Socket initialization error:', err)
      }
    }

    initializeSocket()

    return () => {
      if (currentSocket) {
        try {
          currentSocket.off('quiz_submission_progress')
        } catch (err) {
          console.warn('Socket cleanup error:', err)
        }
      }
    }
  }, [getSocket, user])

  const handleSubmitQuiz = async ({
    timeTaken,
    userAnswers,
    setSubmitted,
    setMessageForTournament,
    setUserEligibleForTournament,
  }) => {
    // Play sound if available and supported
    if (isClient && isReady && features.hasAudioSupport) {
      try {
        playEndChime()
      } catch (err) {
        console.warn('Error playing end chime:', err)
      }
    }

    setSubmitLoad(true)
    setSubmitted(true)
    setSubmissionProgress(0)

    try {
      const response = await axios.post(`/api/quiz/attempt`, {
        articleId,
        userResponses: userAnswers,
        timeTaken: timeTaken === 0 ? 1 : timeTaken,
        sessionId,
      })

      // Handle onboarding state
      if (user?.needsOnboarding) {
        dispatch(setOnBoardingQuizSubmitted(true))
      }

      // Show success toast
      if (isClient) {
        toast({
          title: 'Quiz Submitted Successfully!',
          description: 'You can now view your score.',
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'top',
        })
      }

      // Handle tournament eligibility
      if (response.data?.messageForTournamentEligibility) {
        setMessageForTournament(response.data.messageForTournamentEligibility)
      }
      if (response.data?.userEligibleForTournament) {
        setUserEligibleForTournament(response.data.userEligibleForTournament)
      }

      setResult(response.data)
      return response.data
    } catch (error) {
      console.error('Quiz submission error:', error)
      setSubmitError(true)

      if (isClient) {
        toast({
          title: 'Error',
          description: error.response?.data?.error || 'Quiz submission failed!',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top',
        })
      }
    } finally {
      if (isClient) {
        setTimeout(() => setSubmitLoad(false), 500)
      } else {
        setSubmitLoad(false)
      }
    }
  }

  return {
    handleSubmitQuiz,
    submitLoad,
    submissionProgress,
    isReady: isClient && isReady && features.hasAudioSupport,
  }
}

export default useSubmitQuiz
