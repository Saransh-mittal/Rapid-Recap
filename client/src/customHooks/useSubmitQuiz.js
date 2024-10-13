// /hooks/useSubmitQuiz.js
import { useState } from 'react'
import axios from 'axios'
import { useToast } from '@chakra-ui/react'
import useSound from './useSound'

const useSubmitQuiz = ({ articleId, sessionId, setResult }) => {
  const [submitLoad, setSubmitLoad] = useState(false)
  const toast = useToast()
  const { playEndChime } = useSound()

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
    try {
      const response = await axios.post(`/api/quiz/attempt`, {
        articleId,
        userResponses: userAnswers,
        timeTaken: timeTaken === 0 ? 1 : timeTaken,
        sessionId,
      })

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
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Quiz submission failed!',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      })
    } finally {
      setSubmitLoad(false)
    }
  }

  return { handleSubmitQuiz, submitLoad }
}

export default useSubmitQuiz
