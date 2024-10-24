import { useState, useEffect, useCallback } from 'react'
import { STEP_DELAYS } from '../models/submittedQuizInterfaceConstants'

export const useQuizProgress = submitLoad => {
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (!submitLoad) {
      const timer = setInterval(() => {
        setStep(prev => (prev < 4 ? prev + 1 : prev))
      }, STEP_DELAYS.STEP_INCREMENT)
      return () => clearInterval(timer)
    }
  }, [submitLoad])

  const resetProgress = useCallback(() => setStep(0), [])

  return { step, resetProgress }
}
