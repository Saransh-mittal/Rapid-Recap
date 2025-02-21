import { useState, useEffect } from 'react'
import axios from 'axios'
import { useToast } from '@chakra-ui/react'
import { useSocket } from './useSocket'
import { useSelector } from 'react-redux'
import { useMemo } from 'react'
import {
  calculateTotalEffect,
  getCategoryFromBoost,
  isCategoryBoost,
} from '../utils/helper.utils'

const useFetchQuiz = (articleId, language, onClose) => {
  const [quizSession, setQuizSession] = useState(null)
  const [quizStatus, setQuizStatus] = useState(null)
  const [load, setLoad] = useState(true)
  const [remainingTime, setRemainingTime] = useState(null)
  const [isQuizGenerating, setIsQuizGenerating] = useState(true)
  const toast = useToast()
  const { socket, getSocket } = useSocket()
  const { user } = useSelector(state => state.auth)
  const { activeAbilities } = useSelector(state => state.inventory)
  const filteredActiveAbilities = activeAbilities.filter(ability => {
    // Handle category boosts

    if (ability && ability?.name && isCategoryBoost(ability.name) && category) {
      const boostCategory = getCategoryFromBoost(ability.name)

      return boostCategory.toLowerCase() === category.toLowerCase()
    }
    // Include all other types of boosts
    return true
  })
  const timeDilationEffect = useMemo(
    () =>
      calculateTotalEffect(
        filteredActiveAbilities.filter(
          ability => ability?.name === 'TimeDilation',
        ),
        'POWER_UP',
      ),
    [activeAbilities],
  )
  const additionalTime = useMemo(
    () =>
      timeDilationEffect?.additionalTime
        ? timeDilationEffect?.additionalTime
        : 0,
    [timeDilationEffect],
  )

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
        setRemainingTime((timer || 50) + additionalTime)

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
          title: error?.response?.data?.message || 'Quiz Fetch Failed',
          description: error.response?.data?.error || 'Please try again later',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top',
        })
        onClose()
      } finally {
        setLoad(false)
        console.log('Quiz generation complete')
        setTimeout(() => {
          setIsQuizGenerating(false)
        }, 500)
      }
    }

    fetchQuiz()
  }, [articleId, language, toast, onClose, additionalTime])

  useEffect(() => {
    const currentSocket = getSocket()
    if (currentSocket && user) {
      currentSocket.emit('join quiz progress', user._id)
      currentSocket.on('quiz_generation_progress', data => {})
    }

    return () => {
      if (currentSocket) {
        currentSocket.off('quiz_generation_progress')
      }
    }
  }, [getSocket, user, socket])

  const startQuiz = async () => {
    setLoad(true)
    try {
      const response = await axios.post(
        `/api/quiz/start/${quizSession._id}?onBoarding=${user?.needsOnboarding}`,
      )

      setQuizStatus('in_progress')
      setQuizSession(response.data.quizSession)
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
