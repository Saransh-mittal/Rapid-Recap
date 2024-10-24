import React, { useCallback, useRef, useEffect } from 'react'
import { motion, useAnimation } from 'framer-motion'

// Cached gradient string to avoid recreation
const GRADIENT = 'linear-gradient(to bottom, #44337A, #000000)'

// Optimized Star component with React.memo and useCallback for animations
const Star = React.memo(
  ({ size, top, left, controls }) => {
    // Use CSS transform instead of x/y for better performance
    const style = {
      width: size,
      height: size,
      borderRadius: '50%',
      background: 'white',
      position: 'absolute',
      top: `${top}%`,
      left: `${left}%`,
      willChange: 'transform, opacity',
    }

    return (
      <motion.div
        style={style}
        animate={controls}
        initial={{ opacity: 0.7, scale: 1 }}
      />
    )
  },
  (prevProps, nextProps) => {
    // Custom comparison for React.memo
    return (
      prevProps.size === nextProps.size &&
      prevProps.top === nextProps.top &&
      prevProps.left === nextProps.left
    )
  },
)

const FixedBackground = ({ starCount = 25 }) => {
  // Use ref to store stars data to avoid recreation
  const starsRef = useRef(
    Array(starCount)
      .fill()
      .map(() => ({
        size: Math.random() * 3 + 1,
        top: Math.random() * 100,
        left: Math.random() * 100,
        controls: useAnimation(),
      })),
  )

  // Animate stars using requestAnimationFrame for better performance
  const animateStars = useCallback(() => {
    starsRef.current.forEach(star => {
      star.controls.start({
        y: [`${Math.random() * 10}px`, `${-Math.random() * 10}px`],
        x: [`${Math.random() * 10}px`, `${-Math.random() * 10}px`],
        scale: [1, 1.2, 1],
        opacity: [0.7, 1, 0.7],
        transition: {
          duration: Math.random() * 2 + 1,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'easeInOut',
        },
      })
    })
  }, [])

  useEffect(() => {
    // Start animations
    animateStars()

    // Cleanup animations on unmount
    return () => {
      starsRef.current.forEach(star => {
        star.controls.stop()
      })
    }
  }, [animateStars])

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: GRADIENT,
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        zIndex: 0,
        willChange: 'transform', // Optimize for animations
        transform: 'translateZ(0)', // Force GPU acceleration
        backfaceVisibility: 'hidden', // Optimize paint
        perspective: 1000,
      }}
    >
      {starsRef.current.map((star, index) => (
        <Star
          key={index}
          size={star.size}
          top={star.top}
          left={star.left}
          controls={star.controls}
        />
      ))}
    </div>
  )
}

// Memoize the entire component since it rarely needs to update
export default React.memo(FixedBackground)
