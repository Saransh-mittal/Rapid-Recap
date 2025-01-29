import React, { useEffect, useRef } from 'react'
import { Box } from '@chakra-ui/react'

const AnimatedBackground = () => {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animationFrameId
    let stars = []

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      initStars()
    }

    const initStars = () => {
      stars = Array(100)
        .fill()
        .map(() => ({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2,
          speed: Math.random() * 0.5 + 0.1,
        }))
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      stars.forEach(star => {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
        ctx.fill()

        star.y += star.speed
        if (star.y > canvas.height) {
          star.y = 0
          star.x = Math.random() * canvas.width
        }
      })

      animationFrameId = requestAnimationFrame(animate)
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    animate()

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <Box position="fixed" top="0" left="0" right="0" bottom="0" zIndex="0">
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          background:
            'linear-gradient(180deg, rgba(13,10,28,0.95) 0%, rgba(23,19,40,0.98) 100%)',
        }}
      />
    </Box>
  )
}

export default AnimatedBackground
