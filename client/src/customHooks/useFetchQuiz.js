import { useState, useEffect } from 'react'
import axios from 'axios'
import { useToast } from '@chakra-ui/react'
import { useSocket } from './useSocket'
import { useSelector } from 'react-redux'

const useFetchQuiz = (articleId, language, onClose) => {
  const [quizSession, setQuizSession] = useState(null)
  const [quizStatus, setQuizStatus] = useState(null)
  const [load, setLoad] = useState(true)
  const [remainingTime, setRemainingTime] = useState(null)
  const [isQuizGenerating, setIsQuizGenerating] = useState(false)
  const toast = useToast()
  const { socket, getSocket } = useSocket()
  const { user } = useSelector(state => state.auth)

  useEffect(() => {
    const fetchQuiz = async () => {
      setLoad(true)
      setIsQuizGenerating(true)
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
        console.log('Quiz generation complete')
      }
    }

    fetchQuiz()
  }, [articleId, language, toast, onClose])

  useEffect(() => {
    const currentSocket = getSocket()
    if (currentSocket && user) {
      currentSocket.emit('join quiz progress', user._id)
      currentSocket.on('quiz_generation_progress', data => {
        // You can update your state or perform any other actions here
        if (data.progress === 100) {
          setTimeout(() => {
            setLoad(false)
            setIsQuizGenerating(false)
          }, 1000)
        }
      })
    }

    return () => {
      if (currentSocket) {
        currentSocket.off('quiz_generation_progress')
      }
    }
  }, [getSocket, user])

  const startQuiz = async () => {
    setLoad(true)
    try {
      const response = await axios.post(`/api/quiz/start/${quizSession._id}`)

      setQuizStatus('in_progress')
      setRemainingTime(response.data.timer)
      setLoad(false)
      setIsQuizGenerating(false)
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
    isQuizGenerating,
    socket,
  }
}

export default useFetchQuiz
