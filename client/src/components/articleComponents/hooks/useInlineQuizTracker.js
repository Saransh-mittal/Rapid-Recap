// Hook to track inline quiz performance for conversion optimization
// Location: client/src/components/articleComponents/hooks/useInlineQuizTracker.js

import { useState, useCallback, useEffect } from 'react'

/**
 * Hook to track inline quiz performance for conversion gate
 * Provides data about user's quiz engagement and scores
 */
export const useInlineQuizTracker = ({ articleId } = {}) => {
  const [quizPerformance, setQuizPerformance] = useState({
    totalQuestionsAnswered: 0,
    correctAnswers: 0,
    questionsCompleted: [],
    hasStartedQuiz: false,
    hasCompletedAnyQuiz: false,
    lastQuestionTime: null,
    engagementScore: 0, // 0-100 based on completion rate and accuracy
  })

  // Track when user answers a quiz question
  const trackQuizAnswer = useCallback(
    ({ questionId, isCorrect, timeSpent = 0 }) => {
      setQuizPerformance(prev => {
        const alreadyAnswered = prev.questionsCompleted.includes(questionId)

        if (alreadyAnswered) {
          return prev // Don't double count
        }

        const newCorrectAnswers = isCorrect
          ? prev.correctAnswers + 1
          : prev.correctAnswers

        const newTotalAnswered = prev.totalQuestionsAnswered + 1
        const newQuestionsCompleted = [...prev.questionsCompleted, questionId]

        // Calculate engagement score (accuracy + completion rate)
        const accuracy =
          newTotalAnswered > 0
            ? (newCorrectAnswers / newTotalAnswered) * 100
            : 0
        const engagementScore = Math.min(100, accuracy + newTotalAnswered * 10)

        const updatedPerformance = {
          totalQuestionsAnswered: newTotalAnswered,
          correctAnswers: newCorrectAnswers,
          questionsCompleted: newQuestionsCompleted,
          hasStartedQuiz: true,
          hasCompletedAnyQuiz: newTotalAnswered > 0,
          lastQuestionTime: Date.now(),
          engagementScore,
        }

        // Emit event for other components to listen
        window.dispatchEvent(
          new CustomEvent('inlineQuizCompleted', {
            detail: {
              score: newCorrectAnswers,
              totalQuestions: newTotalAnswered,
              hasCompleted: true,
              articleId,
              performance: updatedPerformance,
            },
          }),
        )

        return updatedPerformance
      })
    },
    [articleId],
  )

  // Track when user starts engaging with quiz content
  const trackQuizEngagement = useCallback(() => {
    setQuizPerformance(prev => ({
      ...prev,
      hasStartedQuiz: true,
    }))
  }, [])

  // Reset performance (useful for new articles)
  const resetPerformance = useCallback(() => {
    setQuizPerformance({
      totalQuestionsAnswered: 0,
      correctAnswers: 0,
      questionsCompleted: [],
      hasStartedQuiz: false,
      hasCompletedAnyQuiz: false,
      lastQuestionTime: null,
      engagementScore: 0,
    })
  }, [])

  // Get formatted data for conversion gate
  const getConversionData = useCallback(() => {
    return {
      score: quizPerformance.correctAnswers,
      totalQuestions: quizPerformance.totalQuestionsAnswered,
      hasCompleted: quizPerformance.hasCompletedAnyQuiz,
      accuracy:
        quizPerformance.totalQuestionsAnswered > 0
          ? Math.round(
              (quizPerformance.correctAnswers /
                quizPerformance.totalQuestionsAnswered) *
                100,
            )
          : 0,
      engagementLevel:
        quizPerformance.engagementScore >= 50 ? 'high' : 'medium',
    }
  }, [quizPerformance])

  // Check if user is ready for conversion (has engaged meaningfully)
  const isReadyForConversion = useCallback(() => {
    return (
      quizPerformance.hasCompletedAnyQuiz &&
      quizPerformance.totalQuestionsAnswered >= 1 &&
      quizPerformance.engagementScore >= 30
    )
  }, [quizPerformance])

  // Listen for quiz events from other components
  useEffect(() => {
    const handleQuizAnswer = event => {
      const { questionId, isCorrect, timeSpent } = event.detail
      trackQuizAnswer({ questionId, isCorrect, timeSpent })
    }

    const handleQuizStart = () => {
      trackQuizEngagement()
    }

    window.addEventListener('inlineQuizAnswer', handleQuizAnswer)
    window.addEventListener('inlineQuizStart', handleQuizStart)

    return () => {
      window.removeEventListener('inlineQuizAnswer', handleQuizAnswer)
      window.removeEventListener('inlineQuizStart', handleQuizStart)
    }
  }, [trackQuizAnswer, trackQuizEngagement])

  return {
    // State
    quizPerformance,

    // Actions
    trackQuizAnswer,
    trackQuizEngagement,
    resetPerformance,

    // Computed values
    getConversionData,
    isReadyForConversion: isReadyForConversion(),

    // Quick access properties
    hasEngaged: quizPerformance.hasStartedQuiz,
    hasCompleted: quizPerformance.hasCompletedAnyQuiz,
    score: quizPerformance.correctAnswers,
    totalAnswered: quizPerformance.totalQuestionsAnswered,
    accuracy:
      quizPerformance.totalQuestionsAnswered > 0
        ? Math.round(
            (quizPerformance.correctAnswers /
              quizPerformance.totalQuestionsAnswered) *
              100,
          )
        : 0,
  }
}
