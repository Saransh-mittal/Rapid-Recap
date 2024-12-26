import { useState, useEffect, useRef } from 'react'

export const useCounter = (end, start, duration = 2) => {
  const [count, setCount] = useState(start)
  const frameRef = useRef()
  const startTimeRef = useRef()

  useEffect(() => {
    const animate = currentTime => {
      if (!startTimeRef.current) {
        startTimeRef.current = currentTime
      }

      const elapsed = currentTime - startTimeRef.current
      const progress = Math.min(elapsed / (duration * 1000), 1)

      if (progress < 1) {
        const currentCount = Math.round(start + (end - start) * progress)
        setCount(currentCount)
        frameRef.current = requestAnimationFrame(animate)
      } else {
        setCount(end)
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

  return count
}
