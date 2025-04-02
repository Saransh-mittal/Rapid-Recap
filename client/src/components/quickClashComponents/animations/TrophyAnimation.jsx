// components/quickClashComponents/animations/TrophyAnimation.jsx
import React, { useEffect, useState } from 'react'
import { Box } from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSelector } from 'react-redux'

const MotionBox = motion(Box)

/**
 * Component that shows a floating animation when trophies change,
 * with particles that appear to fly up and merge into the trophy counter
 */
const TrophyAnimation = () => {
  const userTrophies = useSelector(state => state.quickClash.userTrophies)
  const [prevTrophies, setPrevTrophies] = useState(userTrophies)
  const [showAnimation, setShowAnimation] = useState(false)
  const [trophyDiff, setTrophyDiff] = useState(0)
  const [particles, setParticles] = useState([])

  useEffect(() => {
    // Skip initial render
    if (prevTrophies === userTrophies) return

    // Calculate trophy difference
    const diff = userTrophies - prevTrophies

    // Only show animation if there's a change
    if (diff !== 0) {
      setTrophyDiff(diff)
      setShowAnimation(true)

      // Create multiple particles for a more dynamic effect
      const particleCount = Math.min(Math.abs(diff), 5)
      const newParticles = Array.from({ length: particleCount }, (_, i) => ({
        id: `particle-${Date.now()}-${i}`,
        xOffset: (Math.random() - 0.5) * 60, // Random horizontal offset
        delay: i * 0.1, // Staggered delays
        duration: 0.8 + Math.random() * 0.4, // Slightly randomized duration
      }))

      setParticles(newParticles)

      // Hide animation after particles are done
      const timer = setTimeout(() => {
        setShowAnimation(false)
        setParticles([])
      }, 2000)

      return () => clearTimeout(timer)
    }

    // Update previous trophies
    setPrevTrophies(userTrophies)
  }, [userTrophies, prevTrophies])

  // Update previous trophies after animation completes
  const handleAnimationComplete = () => {
    setPrevTrophies(userTrophies)
  }

  // Don't render anything if there's no animation to show
  if (!showAnimation) return null

  return (
    <>
      {/* Main change indicator (+XX or -XX) */}
      <MotionBox
        position="absolute"
        left="50%"
        bottom="-5px"
        zIndex={5}
        pointerEvents="none"
        initial={{ opacity: 0, y: 20, scale: 0.5 }}
        animate={{
          opacity: [0, 1, 1, 0],
          y: [20, 10, 0, -20],
          scale: [0.5, 1, 0.9, 0.5],
        }}
        exit={{ opacity: 0, scale: 0, y: -40 }}
        transition={{
          duration: 1.5,
          ease: 'easeOut',
        }}
        sx={{
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          fontSize: 'sm',
          color: trophyDiff > 0 ? 'green.400' : 'red.400',
          textShadow: '0 0 3px rgba(0,0,0,0.8)',
        }}
        onAnimationComplete={handleAnimationComplete}
      >
        {trophyDiff > 0 ? `+${trophyDiff}` : trophyDiff}
      </MotionBox>

      {/* Particle animations */}
      <AnimatePresence>
        {particles.map(particle => (
          <MotionBox
            key={particle.id}
            position="absolute"
            zIndex={5}
            left={`calc(50% + ${particle.xOffset}px)`}
            bottom="-10px"
            width="8px"
            height="8px"
            borderRadius="full"
            bg={trophyDiff > 0 ? 'green.400' : 'red.400'}
            initial={{ opacity: 0, y: 30, scale: 0.2 }}
            animate={{
              opacity: [0, 0.8, 0],
              y: [30, 10, -30],
              scale: [0.2, 0.6, 0.2],
              x: [particle.xOffset, particle.xOffset / 2, 0],
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              ease: 'easeOut',
            }}
            boxShadow={`0 0 6px ${trophyDiff > 0 ? '#48BB78' : '#F56565'}`}
          />
        ))}
      </AnimatePresence>
    </>
  )
}

export default TrophyAnimation
