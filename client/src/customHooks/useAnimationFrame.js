import { useEffect, useRef } from 'react'

export const useAnimationFrame = (callback, duration, dependencies = []) => {
  const frameRef = useRef()
  const startTimeRef = useRef()

  useEffect(() => {
    const animate = timestamp => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp
      }

      const elapsed = timestamp - startTimeRef.current
      const progress = Math.min(elapsed / duration, 1)

      callback(progress)

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate)
      }
    }

    frameRef.current = requestAnimationFrame(animate)

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
      }
    }
  }, dependencies) // eslint-disable-line react-hooks/exhaustive-deps
}
