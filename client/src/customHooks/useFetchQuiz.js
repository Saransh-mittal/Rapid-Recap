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
        const response = await axios.get(`/api/quiz/${articleId}/${language}`)
        const { quizSession, status, timer, message } = response.data
        console.log(response.data)
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
        } else {
          toast({
            title: 'Quiz Session Created',
            description: message,
            status: 'success',
            duration: 5000,
            isClosable: true,
            position: 'top',
          })
        }
      } catch (error) {
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
    try {
      const response = await axios.post(`/api/quiz/start/${quizSession._id}`)

      setQuizStatus('in_progress')
      setRemainingTime(response.data.timer)
      setShowInstruction(false)
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

  const resumeQuiz = async () => {
    try {
      const response = await axios.post(`/api/quiz/resume/${quizSession._id}`)
      setQuizStatus('in_progress')
      setTimer(response.data.remainingTime)
      toast({
        title: 'Quiz Resumed',
        description: 'Good luck!',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top',
      })
    } catch (error) {
      toast({
        title: 'Failed to Resume Quiz',
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
    remainingTime,
    setLoad,
    startQuiz,
    resumeQuiz,
  }
}

export default useFetchQuiz
