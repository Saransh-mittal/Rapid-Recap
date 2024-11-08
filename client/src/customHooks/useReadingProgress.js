import { useState, useEffect } from 'react'

export const useReadingProgress = () => {
  const [readProgress, setReadProgress] = useState(0)

  useEffect(() => {
    const calculateProgress = () => {
      const windowHeight = window.innerHeight
      const documentHeight =
        document.documentElement.scrollHeight - windowHeight
      const scrollTop = window.scrollY
      const progress = (scrollTop / documentHeight) * 100
      setReadProgress(Math.min(100, Math.max(0, progress)))
    }

    window.addEventListener('scroll', calculateProgress)
    return () => window.removeEventListener('scroll', calculateProgress)
  }, [])

  return readProgress
}
