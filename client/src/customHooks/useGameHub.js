// customHooks/useGameHub.js - Updated version with improved timer management
import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { useToast } from '@chakra-ui/react'
import { useSocket } from './useSocket'
import { useSelector } from 'react-redux'
import i18n from 'i18next'

// Hook for fetching and managing game data
export const useFetchGameData = ({ articleId, language = 'en' }) => {
  const [gameData, setGameData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const toast = useToast()
  const { getSocket } = useSocket()
  const { user } = useSelector(state => state.auth)

  const fetchGameData = useCallback(async () => {
    if (!articleId) return

    setLoading(true)
    setError(null)

    try {
      const response = await axios.get(
        `/api/gamehub/data/${articleId}/${language}`,
      )
      setGameData(response.data.gameData)
    } catch (err) {
      console.error('Error fetching game data:', err)
      setError(err.response?.data?.error || 'Failed to load game data')
      toast({
        title: 'Error',
        description: 'Failed to load game data',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
      })
    } finally {
      setLoading(false)
    }
  }, [articleId, language, toast])

  useEffect(() => {
    const currentSocket = getSocket()
    if (currentSocket && user) {
      currentSocket.emit('join game progress', user._id)
      currentSocket.on('game_generation_progress', data => {
        console.log('Game generation progress:', data.progress)
      })
    }

    return () => {
      if (currentSocket) {
        currentSocket.off('game_generation_progress')
      }
    }
  }, [getSocket, user])

  useEffect(() => {
    fetchGameData()
  }, [fetchGameData])

  return { gameData, loading, error, refetchGameData: fetchGameData }
}

// Hook for managing game sessions with proper timer handling
export const useGameSession = ({ articleId, gameType, language = 'en' }) => {
  const [sessionId, setSessionId] = useState(null)
  const [gameSession, setGameSession] = useState(null)
  const [sessionStatus, setSessionStatus] = useState('idle') // idle, creating, ready, playing, completed
  const [initialTimer, setInitialTimer] = useState(0)
  const toast = useToast()

  const createSession = useCallback(async () => {
    if (!articleId || !gameType) return

    setSessionStatus('creating')
    try {
      const response = await axios.post('/api/gamehub/session/create', {
        articleId,
        gameType,
        language,
      })

      setSessionId(response.data.sessionId)
      setInitialTimer(response.data.timer)
      setSessionStatus('ready')

      console.log('Session created:', {
        sessionId: response.data.sessionId,
        timer: response.data.timer,
        gameType,
      })

      return response.data.sessionId
    } catch (error) {
      console.error('Error creating game session:', error)
      setSessionStatus('idle')
      toast({
        title: 'Error',
        description:
          error.response?.data?.error || 'Failed to create game session',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      throw error
    }
  }, [articleId, gameType, language, toast])

  const startSession = useCallback(
    async (sessionIdParam = sessionId) => {
      if (!sessionIdParam) return

      try {
        const response = await axios.post(
          `/api/gamehub/session/start/${sessionIdParam}`,
        )

        // Create enhanced session object with timer info
        const enhancedSession = {
          ...response.data.gameSession,
          timer: response.data.timer || initialTimer,
          startTime: response.data.startTime,
          endTime: response.data.endTime,
        }

        setGameSession(enhancedSession)
        setSessionStatus('playing')

        console.log('Session started:', {
          timer: response.data.timer,
          startTime: response.data.startTime,
          endTime: response.data.endTime,
          gameType: enhancedSession.gameType,
        })

        return enhancedSession
      } catch (error) {
        console.error('Error starting game session:', error)
        toast({
          title: 'Error',
          description:
            error.response?.data?.error || 'Failed to start game session',
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
        throw error
      }
    },
    [sessionId, initialTimer, toast],
  )

  const initializeGame = useCallback(async () => {
    try {
      const newSessionId = await createSession()
      const sessionData = await startSession(newSessionId)
      return sessionData
    } catch (error) {
      console.error('Error initializing game:', error)
      setSessionStatus('error')
    }
  }, [createSession, startSession])

  return {
    sessionId,
    gameSession,
    sessionStatus,
    initialTimer,
    createSession,
    startSession,
    initializeGame,
  }
}

// Hook for submitting game attempts with better progress tracking
export const useSubmitGame = () => {
  const [submitting, setSubmitting] = useState(false)
  const [submissionProgress, setSubmissionProgress] = useState(0)
  const toast = useToast()
  const { getSocket } = useSocket()
  const { user } = useSelector(state => state.auth)

  useEffect(() => {
    const currentSocket = getSocket()
    if (currentSocket && user) {
      currentSocket.emit('join game submission progress', user._id)
      currentSocket.on('game_submission_progress', data => {
        console.log('Submission progress:', data)
        setSubmissionProgress(data.progress || 0)
      })
    }

    return () => {
      if (currentSocket) {
        currentSocket.off('game_submission_progress')
      }
    }
  }, [getSocket, user])

  const submitGame = useCallback(
    async ({ sessionId, userResponses, timeTaken }) => {
      setSubmitting(true)
      setSubmissionProgress(0)

      try {
        console.log('Submitting game attempt:', {
          sessionId,
          responseCount: userResponses.length,
          timeTaken,
        })

        const response = await axios.post('/api/gamehub/attempt', {
          sessionId,
          userResponses,
          timeTaken: Math.max(timeTaken, 0), // Ensure positive time
        })

        toast({
          title: 'Game Completed! 🎉',
          description: `Your RQM score: ${response.data.RQM_score}`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        })

        return response.data
      } catch (error) {
        console.error('Error submitting game:', error)
        toast({
          title: 'Submission Error',
          description:
            error.response?.data?.error ||
            'Failed to submit game. Please try again.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
        throw error
      } finally {
        setSubmitting(false)
        setSubmissionProgress(0)
      }
    },
    [toast],
  )

  return {
    submitGame,
    submitting,
    submissionProgress,
  }
}

// Hook for game summary/results
export const useGameSummary = ({ sessionId }) => {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const toast = useToast()

  const fetchSummary = useCallback(async () => {
    if (!sessionId) return

    setLoading(true)
    setError(null)

    try {
      const response = await axios.get(`/api/gamehub/summary/${sessionId}`)
      setSummary(response.data)
    } catch (err) {
      console.error('Error fetching game summary:', err)
      setError(err.response?.data?.error || 'Failed to load game summary')
      toast({
        title: 'Error',
        description: 'Failed to load game summary',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }, [sessionId, toast])

  useEffect(() => {
    fetchSummary()
  }, [fetchSummary])

  return { summary, loading, error, refetchSummary: fetchSummary }
}

// Hook for importing custom game data
export const useImportGameData = () => {
  const [importing, setImporting] = useState(false)
  const toast = useToast()

  const importGameData = useCallback(
    async gameData => {
      setImporting(true)

      try {
        const response = await axios.post('/api/gamehub/import', { gameData })

        toast({
          title: 'Success',
          description: 'Game data imported successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })

        return response.data
      } catch (error) {
        console.error('Error importing game data:', error)
        toast({
          title: 'Error',
          description:
            error.response?.data?.error || 'Failed to import game data',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
        throw error
      } finally {
        setImporting(false)
      }
    },
    [toast],
  )

  return {
    importGameData,
    importing,
  }
}

// Simplified timer hook for specific use cases (optional)
export const useGameTimer = ({
  initialTime,
  autoStart = false,
  onTimeUp,
  onTick,
}) => {
  const [timeLeft, setTimeLeft] = useState(initialTime)
  const [isRunning, setIsRunning] = useState(autoStart)
  const [timerRef, setTimerRef] = useState(null)

  const startTimer = useCallback(() => {
    setIsRunning(true)
  }, [])

  const stopTimer = useCallback(() => {
    setIsRunning(false)
    if (timerRef) {
      clearInterval(timerRef)
      setTimerRef(null)
    }
  }, [timerRef])

  const resetTimer = useCallback(
    (newTime = initialTime) => {
      setTimeLeft(newTime)
      setIsRunning(false)
      if (timerRef) {
        clearInterval(timerRef)
        setTimerRef(null)
      }
    },
    [initialTime, timerRef],
  )

  useEffect(() => {
    setTimeLeft(initialTime)
  }, [initialTime])

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      const interval = setInterval(() => {
        setTimeLeft(prev => {
          const newTime = prev - 1

          if (onTick) {
            onTick(newTime)
          }

          if (newTime <= 0) {
            setIsRunning(false)
            if (onTimeUp) {
              onTimeUp()
            }
            return 0
          }

          return newTime
        })
      }, 1000)

      setTimerRef(interval)

      return () => {
        clearInterval(interval)
      }
    }
  }, [isRunning, timeLeft, onTimeUp, onTick])

  useEffect(() => {
    return () => {
      if (timerRef) {
        clearInterval(timerRef)
      }
    }
  }, [timerRef])

  return {
    timeLeft,
    isRunning,
    startTimer,
    stopTimer,
    resetTimer,
    setTimeLeft,
  }
}
