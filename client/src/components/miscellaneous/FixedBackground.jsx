import React, { useMemo } from 'react'
import heroBg from '../../assets/hero/hero-bg.webp' // Adjust the path as necessary
import { motion } from 'framer-motion'

// Star component
const Star = React.memo(({ size, top, left }) => (
  <motion.div
    style={{
      width: size,
      height: size,
      borderRadius: '50%',
      background: 'white',
      position: 'absolute',
      top: `${top}%`,
      left: `${left}%`,
    }}
    animate={{
      y: [`${Math.random() * 10}px`, `${-Math.random() * 10}px`],
      x: [`${Math.random() * 10}px`, `${-Math.random() * 10}px`],
      scale: [1, 1.2, 1],
      opacity: [0.7, 1, 0.7],
    }}
    transition={{
      duration: Math.random() * 2 + 1,
      repeat: Infinity,
      repeatType: 'reverse',
      ease: 'easeInOut',
    }}
  />
))
const FixedBackground = ({ starCount = 25 }) => {
  // Generate stars
  console.log(starCount)
  const stars = useMemo(
    () =>
      Array(starCount)
        .fill()
        .map((_, i) => ({
          size: Math.random() * 3 + 1,
          top: Math.random() * 100,
          left: Math.random() * 100,
        })),
    [starCount],
  )
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 'linear-gradient(to bottom, #44337A, #000000)',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        zIndex: 0,
      }}
    >
      {stars.map((star, index) => (
        <Star key={index} {...star} />
      ))}
    </div>
  )
}

export default FixedBackground
