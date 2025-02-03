// src/hooks/useCounter.js
import { useState, useEffect, useRef } from 'react'
import { formatNumber } from '../../../utils/helper.utils'

export const useCounter = (end, start, duration = 4) => {
  const [count, setCount] = useState(formatNumber(start))
  const frameRef = useRef()
  const startTimeRef = useRef()

  useEffect(() => {
    const animate = currentTime => {
      if (!startTimeRef.current) {
        startTimeRef.current = currentTime
      }

      const elapsed = currentTime - startTimeRef.current
      const progress = Math.min(elapsed / (duration * 1000), 2)

      if (progress < 1) {
        const rawCount = start + (end - start) * progress
        const currentCount = formatNumber(rawCount)
        setCount(currentCount)
        frameRef.current = requestAnimationFrame(animate)
      } else {
        setCount(formatNumber(end))
      }
    }

    frameRef.current = requestAnimationFrame(animate)

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
      }
      startTimeRef.current = undefined
    }
  }, [start, end, duration])

  return formatNumber(count)
}
