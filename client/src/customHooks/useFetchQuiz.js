// /hooks/useFetchQuiz.js
import { useState, useEffect } from 'react'
import axios from 'axios'
import { useToast } from '@chakra-ui/react'

const useFetchQuiz = (articleId, language, onClose, setShowInstruction) => {
  const [quizSession, setQuizSession] = useState(null)
  const [quizStatus, setQuizStatus] = useState(null)
  const [load, setLoad] = useState(true)
  const [remainingTime, setRemainingTime] = useState(null)
  const toast = useToast()
  useEffect(() => {
    const fetchQuiz = async () => {
      setLoad(true)
      try {
        const response = await axios.get(
          `/api/quiz/getQuiz/${articleId}/${language}`,
        )
        const { quizSession, status, timer, message } = response.data
        setQuizSession(quizSession)
        setQuizStatus(status)
        setRemainingTime(timer)
        if (status === 'completed') {
          toast({
            title: 'Quiz Already Completed',
            description: message,
            status: 'info',
            duration: 5000,
            isClosable: true,
            position: 'top',
          })
        }
      } catch (error) {
        console.error(error)
        toast({
          title: 'Quiz Fetch Failed',
          description: error.response?.data?.error || 'Please try again later',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top',
        })
        onClose()
      } finally {
        setLoad(false)
      }
    }

    fetchQuiz()
  }, [articleId, language, toast, onClose])

  const startQuiz = async () => {
    setLoad(true)
    try {
      const response = await axios.post(`/api/quiz/start/${quizSession._id}`)

      setQuizStatus('in_progress')
      setRemainingTime(response.data.timer)
      setLoad(false)
      toast({
        title: 'Quiz Started',
        description: 'Good luck!',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top',
      })
    } catch (error) {
      console.error(error)
      toast({
        title: 'Failed to Start Quiz',
        description: error.response?.data?.error || 'Please try again',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      })
    }
  }

  return {
    quizSession,
    quizStatus,
    load,
    startQuiz,
    remainingTime,
  }
}

export default useFetchQuiz
