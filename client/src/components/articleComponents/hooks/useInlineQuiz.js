// Enhanced useInlineQuiz Hook with Auto-show Previous Answers
// Location: client/src/components/articleComponents/hooks/useInlineQuiz.js

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useSelector } from 'react-redux'
import i18n from 'i18next'
import axios from 'axios'

/**
 * Enhanced hook for managing inline quiz functionality with dual language support
 * @param {Object} options - Hook options
 * @param {string} options.articleId - Article ID
 * @param {string} options.language - Optional language override
 * @returns {Object} Quiz state and methods
 */
export const useInlineQuiz = ({ articleId, language: languageOverride }) => {
  // State management
  const [quizQuestions, setQuizQuestions] = useState([])
  const [selectedAnswers, setSelectedAnswers] = useState({})
  const [showStatistics, setShowStatistics] = useState({})
  const [userAnswers, setUserAnswers] = useState({})
  const [loading, setLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState(null)
  const [actualLanguage, setActualLanguage] = useState('en')
  const [fallbackUsed, setFallbackUsed] = useState(false)

  // Get user language preference
  const { isAuthenticated } = useSelector(state => state.auth)

  // Determine the language to use
  const effectiveLanguage = i18n.language || 'en'

  // Check if text is Hindi
  const isHindiText = useCallback(text => {
    if (!text || typeof text !== 'string') return false
    const hindiRegex = /[\u0900-\u097F]/
    return hindiRegex.test(text)
  }, [])

  /**
   * Fetch quiz questions from API with user's previous answers
   */
  const fetchQuizQuestions = useCallback(async () => {
    if (!articleId) return

    try {
      setLoading(true)
      setError(null)

      console.log(
        `🎯 Fetching quiz questions for article: ${articleId}, preferred language: ${effectiveLanguage}`,
      )

      const response = await axios.get(
        `/api/articles/inline-quiz/${articleId}?language=${effectiveLanguage}`,
      )

      if (response.data.success) {
        const {
          questions,
          language,
          preferredLanguage,
          fallbackUsed: isFallback,
          userHistory, // NEW: User's previous answers
        } = response.data.data

        setQuizQuestions(questions || [])
        setActualLanguage(language || preferredLanguage || effectiveLanguage)
        setFallbackUsed(isFallback || false)

        // Initialize state for each question
        const initialSelectedAnswers = {}
        const initialShowStats = {}
        const initialUserAnswers = {}

        questions?.forEach(q => {
          // Check if user has previous answer for this question
          const userPreviousAnswer = userHistory?.find(
            h => h.questionId === q._id,
          )

          if (userPreviousAnswer && userPreviousAnswer.userAnswer) {
            // User has answered this question before - auto-show results
            initialSelectedAnswers[q._id] =
              userPreviousAnswer.userAnswer.selectedOption
            initialShowStats[q._id] = true
            initialUserAnswers[q._id] = {
              selectedOption: userPreviousAnswer.userAnswer.selectedOption,
              correctAnswer: q.correctAnswer,
              isCorrect: userPreviousAnswer.userAnswer.isCorrect,
              statistics: q.statistics,
              language: q.language,
            }
          } else {
            // User hasn't answered - show question form
            initialSelectedAnswers[q._id] = null
            initialShowStats[q._id] = false
            initialUserAnswers[q._id] = null
          }
        })

        setSelectedAnswers(initialSelectedAnswers)
        setShowStatistics(initialShowStats)
        setUserAnswers(initialUserAnswers)

        // Log if fallback was used
        if (isFallback && language !== preferredLanguage) {
          console.log(
            `🔄 Language fallback used: requested ${preferredLanguage}, got ${language}`,
          )
        }

        // Log how many questions user has already answered
        const answeredCount = Object.values(initialUserAnswers).filter(
          answer => answer !== null,
        ).length
        if (answeredCount > 0) {
          console.log(`✅ Auto-loaded ${answeredCount} previous answers`)
        }
      }
    } catch (error) {
      console.error('Error fetching quiz questions:', error)
      setError(error.response?.data?.message || 'Failed to load quiz questions')
      setQuizQuestions([])
    } finally {
      setLoading(false)
    }
  }, [articleId, effectiveLanguage, isAuthenticated])

  /**
   * Generate quiz questions as fallback
   */
  const generateQuizQuestions = useCallback(
    async ({ force = false, generateBothLanguages = false } = {}) => {
      if (!articleId || !isAuthenticated) return

      try {
        setIsGenerating(true)
        setError(null)

        console.log(
          `🔧 Generating quiz questions for article: ${articleId}, language: ${effectiveLanguage}, both: ${generateBothLanguages}`,
        )

        const response = await axios.post(
          `/api/articles/inline-quiz/generate/${articleId}`,
          {
            language: effectiveLanguage,
            force,
            generateBothLanguages,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          },
        )

        if (response.data.success) {
          const { results, totalGenerated } = response.data.data

          // Get the appropriate language result
          const languageResult =
            results[effectiveLanguage] || results['en'] || results['hi']

          if (languageResult?.success && languageResult?.questions) {
            setQuizQuestions(languageResult.questions)
            setActualLanguage(effectiveLanguage)
            setFallbackUsed(false)

            // Initialize state for generated questions
            const initialSelectedAnswers = {}
            const initialShowStats = {}
            const initialUserAnswers = {}

            languageResult.questions.forEach(q => {
              initialSelectedAnswers[q._id] = null
              initialShowStats[q._id] = false
              initialUserAnswers[q._id] = null
            })

            setSelectedAnswers(initialSelectedAnswers)
            setShowStatistics(initialShowStats)
            setUserAnswers(initialUserAnswers)

            console.log(
              `✅ Generated ${languageResult.questions.length} quiz questions (total: ${totalGenerated})`,
            )
          } else {
            console.warn(
              `⚠️ No questions generated for ${effectiveLanguage}`,
              languageResult,
            )
            setError(`Failed to generate questions for ${effectiveLanguage}`)
          }
        }
      } catch (error) {
        console.error('Error generating quiz questions:', error)
        setError(
          error.response?.data?.message || 'Failed to generate quiz questions',
        )
      } finally {
        setIsGenerating(false)
      }
    },
    [articleId, effectiveLanguage, isAuthenticated],
  )

  /**
   * Submit answer for a question
   */
  const submitAnswer = useCallback(
    async (questionId, answerIndex) => {
      try {
        const response = await axios.post(
          `/api/articles/inline-quiz/${articleId}/answer`,
          {
            questionId,
            selectedOption: answerIndex,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          },
        )

        if (response.data.success) {
          const {
            selectedOption,
            correctAnswer,
            isCorrect,
            statistics,
            language,
          } = response.data.data

          // Update state
          setSelectedAnswers(prev => ({
            ...prev,
            [questionId]: selectedOption,
          }))

          setShowStatistics(prev => ({
            ...prev,
            [questionId]: true,
          }))

          setUserAnswers(prev => ({
            ...prev,
            [questionId]: {
              selectedOption,
              correctAnswer,
              isCorrect,
              statistics,
              language,
            },
          }))

          // Update question statistics in local state
          setQuizQuestions(prev =>
            prev.map(q => (q._id === questionId ? { ...q, statistics } : q)),
          )
        }
      } catch (error) {
        console.error('Error submitting answer:', error)
        if (error.response?.status === 400 && error.response?.data?.data) {
          // User already answered
          const { previousAnswer, statistics, language } =
            error.response.data.data
          setSelectedAnswers(prev => ({
            ...prev,
            [questionId]: previousAnswer,
          }))
          setShowStatistics(prev => ({
            ...prev,
            [questionId]: true,
          }))

          // Set user answer data
          setUserAnswers(prev => ({
            ...prev,
            [questionId]: {
              selectedOption: previousAnswer,
              statistics,
              language,
            },
          }))
        } else {
          setError(error.response?.data?.message || 'Failed to submit answer')
        }
      }
    },
    [articleId, isAuthenticated],
  )

  /**
   * Get quiz summary statistics
   */
  const getQuizSummary = useCallback(() => {
    const totalQuestions = quizQuestions.length
    const answeredQuestions = Object.values(userAnswers).filter(
      answer => answer !== null,
    ).length
    const correctAnswers = Object.values(userAnswers).filter(
      answer => answer?.isCorrect,
    ).length

    return {
      totalQuestions,
      answeredQuestions,
      correctAnswers,
      percentage:
        totalQuestions > 0
          ? Math.round((correctAnswers / totalQuestions) * 100)
          : 0,
      isComplete: answeredQuestions === totalQuestions,
      language: actualLanguage,
      preferredLanguage: effectiveLanguage,
      isHindi: actualLanguage === 'hi',
      fallbackUsed,
    }
  }, [
    quizQuestions,
    userAnswers,
    actualLanguage,
    effectiveLanguage,
    fallbackUsed,
  ])

  /**
   * Get statistics for a specific question
   */
  const getQuestionStatistics = useCallback(
    questionId => {
      const question = quizQuestions.find(q => q._id === questionId)
      return question?.statistics || null
    },
    [quizQuestions],
  )

  /**
   * Check if user has answered a question
   */
  const hasAnswered = useCallback(
    questionId => {
      return (
        userAnswers[questionId] !== null &&
        userAnswers[questionId] !== undefined
      )
    },
    [userAnswers],
  )

  /**
   * Get user's answer for a question
   */
  const getUserAnswer = useCallback(
    questionId => {
      return userAnswers[questionId] || null
    },
    [userAnswers],
  )

  /**
   * Reset quiz state
   */
  const resetQuiz = useCallback(() => {
    setQuizQuestions([])
    setSelectedAnswers({})
    setShowStatistics({})
    setUserAnswers({})
    setError(null)
    setActualLanguage('en')
    setFallbackUsed(false)
  }, [])

  /**
   * Get language information
   */
  const getLanguageInfo = useCallback(() => {
    return {
      effective: effectiveLanguage,
      actual: actualLanguage,
      fallbackUsed,
      isHindi: actualLanguage === 'hi',
      isPreferredLanguage: actualLanguage === effectiveLanguage,
    }
  }, [effectiveLanguage, actualLanguage, fallbackUsed])

  // Auto-fetch questions when articleId or language changes
  useEffect(() => {
    if (articleId) {
      fetchQuizQuestions()
    }
  }, [fetchQuizQuestions])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      resetQuiz()
    }
  }, [resetQuiz])

  return {
    // State
    quizQuestions,
    selectedAnswers,
    showStatistics,
    userAnswers,
    loading,
    isGenerating,
    error,
    actualLanguage,
    fallbackUsed,

    // Methods
    fetchQuizQuestions,
    generateQuizQuestions,
    submitAnswer,
    getQuizSummary,
    getQuestionStatistics,
    hasAnswered,
    getUserAnswer,
    resetQuiz,
    getLanguageInfo,

    // Utilities
    isHindiText,
    effectiveLanguage,
  }
}
