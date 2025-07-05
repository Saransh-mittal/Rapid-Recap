// utils/timerUtils.js - Utility functions for timer management
export const formatTime = seconds => {
  if (seconds < 0) return '0:00'

  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

export const getTimerColor = (timeLeft, totalTime) => {
  const percentage = (timeLeft / totalTime) * 100
  if (percentage > 50) return 'green.400'
  if (percentage > 25) return 'yellow.400'
  return 'red.400'
}

export const getTimerWarningState = (timeLeft, totalTime) => {
  const percentage = (timeLeft / totalTime) * 100
  if (percentage <= 10) return 'critical'
  if (percentage <= 25) return 'warning'
  return 'normal'
}

export const shouldShowTimerWarning = (timeLeft, totalTime) => {
  return (timeLeft / totalTime) * 100 <= 25
}

export const shouldShowCriticalWarning = (timeLeft, totalTime) => {
  return (timeLeft / totalTime) * 100 <= 10
}

export const calculateTimeTaken = (totalTime, timeLeft) => {
  return Math.max(totalTime - timeLeft, 0)
}

export const getGameTypeTimerConfig = gameType => {
  const configs = {
    normal_quiz: {
      timeLimit: 50,
      warningAt: 30,
      criticalAt: 10,
    },
    true_false: {
      timeLimit: 35,
      warningAt: 20,
      criticalAt: 8,
    },
    word_weaver: {
      timeLimit: 100,
      warningAt: 60,
      criticalAt: 20,
    },
    connections: {
      timeLimit: 80,
      warningAt: 40,
      criticalAt: 15,
    },
  }

  return configs[gameType] || configs.normal_quiz
}
