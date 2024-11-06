import { useEffect, useState } from 'react'

const useScrollAwarePosition = ref => {
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 })

  useEffect(() => {
    const updatePosition = () => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect()
        const scrollTop = window.scrollY || document.documentElement.scrollTop

        setPosition({
          // Add scrollTop to maintain position relative to document
          top: rect.bottom + scrollTop + 8,
          left: rect.left,
          width: rect.width,
        })
      }
    }

    updatePosition()
    window.addEventListener('scroll', updatePosition)
    window.addEventListener('resize', updatePosition)

    return () => {
      window.removeEventListener('scroll', updatePosition)
      window.removeEventListener('resize', updatePosition)
    }
  }, [ref])

  return position
}

export default useScrollAwarePosition
