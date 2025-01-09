import { useState, useEffect } from 'react'
import axios from 'axios'
import { useToast } from '@chakra-ui/react'
import useSound from './useSound'
import { useSocket } from './useSocket'
import { useDispatch, useSelector } from 'react-redux'
import { setOnBoardingQuizSubmitted, setQuizBoost } from '../redux/quizSlice'

const useSubmitQuiz = ({ articleId, sessionId, setResult, setSubmitError }) => {
  const [submitLoad, setSubmitLoad] = useState(false)
  const [submissionProgress, setSubmissionProgress] = useState(0)
  const toast = useToast()
  const { playEndChime } = useSound()
  const { getSocket } = useSocket()
  const { user } = useSelector(state => state.auth)
  const dispatch = useDispatch()

  useEffect(() => {
    const currentSocket = getSocket()
    if (currentSocket && user) {
      currentSocket.emit('join quiz submission progress', user._id)
      currentSocket.on('quiz_submission_progress', data => {
        setSubmissionProgress(data.progress)
      })
    }

    return () => {
      if (currentSocket) {
        currentSocket.off('quiz_submission_progress')
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
    playEndChime()
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
      if (response.data?.boost > 1) {
        dispatch(setQuizBoost(response.data.boost))
      }
      if (user?.needsOnboarding) {
        dispatch(setOnBoardingQuizSubmitted(true))
      }
      toast({
        title: 'Quiz Submitted Successfully!',
        description: 'You can now view your score.',
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'top',
      })

      if (response.data?.messageForTournamentEligibility) {
        setMessageForTournament(response.data.messageForTournamentEligibility)
      }
      if (response.data?.userEligibleForTournament) {
        setUserEligibleForTournament(response.data.userEligibleForTournament)
      }
      setResult(response.data)

      return response.data
    } catch (error) {
      console.log(error)
      setSubmitError(true)
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Quiz submission failed!',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      })
    } finally {
      setTimeout(() => setSubmitLoad(false), 500)
    }
  }

  return { handleSubmitQuiz, submitLoad, submissionProgress }
}

export default useSubmitQuiz
