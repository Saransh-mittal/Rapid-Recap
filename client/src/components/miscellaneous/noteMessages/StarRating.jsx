// StarRating.jsx
import React, { useState, useEffect } from 'react'
import { HStack, Box } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { StarIcon } from '@chakra-ui/icons'

// Motion components
const MotionIcon = motion(StarIcon)
const MotionBox = motion(Box)

const StarRating = ({ rating, onRatingChange, size = 'md' }) => {
  const [hoverRating, setHoverRating] = useState(0)
  const [animateIndex, setAnimateIndex] = useState(-1)

  // Determine star size based on size prop
  const getStarSize = () => {
    switch (size) {
      case 'sm':
        return 5
      case 'md':
        return 6
      case 'lg':
        return 8
      default:
        return 6
    }
  }

  // Animation when rating changes
  useEffect(() => {
    if (rating > 0) {
      // Animate stars one by one
      const timeout = setTimeout(() => {
        setAnimateIndex(0)
      }, 100)

      return () => clearTimeout(timeout)
    }
  }, [rating])

  // When one star animation completes, trigger the next one
  useEffect(() => {
    if (animateIndex >= 0 && animateIndex < rating - 1) {
      const timeout = setTimeout(() => {
        setAnimateIndex(animateIndex + 1)
      }, 150)

      return () => clearTimeout(timeout)
    }
  }, [animateIndex, rating])

  // Animation variants
  const starVariants = {
    initial: { scale: 1 },
    hover: {
      scale: 1.2,
      rotate: [0, 10, -10, 0],
      transition: { duration: 0.3 },
    },
    selected: index => ({
      scale: [1, 1.5, 1],
      rotate: [0, 15, -15, 0],
      transition: {
        duration: 0.5,
        delay: index * 0.1,
        times: [0, 0.4, 0.8, 1],
      },
    }),
    animate: {
      scale: [1, 1.5, 1],
      rotate: [0, 20, -20, 0],
      transition: {
        duration: 0.5,
        times: [0, 0.4, 0.8, 1],
      },
    },
  }

  return (
    <HStack spacing={1} justifyContent="center" py={2}>
      {[1, 2, 3, 4, 5].map(starValue => (
        <MotionBox
          key={starValue}
          position="relative"
          animate={
            rating >= starValue && animateIndex === starValue - 1
              ? 'animate'
              : 'initial'
          }
          variants={starVariants}
          whileHover="hover"
        >
          <MotionIcon
            boxSize={getStarSize()}
            color={
              starValue <= (hoverRating || rating)
                ? 'yellow.400'
                : 'whiteAlpha.300'
            }
            cursor="pointer"
            onClick={() => {
              onRatingChange(starValue)
              setAnimateIndex(0) // Start animation sequence
            }}
            onMouseEnter={() => setHoverRating(starValue)}
            onMouseLeave={() => setHoverRating(0)}
            _hover={{ transform: 'none' }} // Disable Chakra's built-in hover since we're using Framer Motion
            transition="color 0.2s"
            filter={
              starValue <= (hoverRating || rating)
                ? 'drop-shadow(0 0 4px rgba(255, 215, 0, 0.6))'
                : 'none'
            }
          />

          {/* Subtle glow effect for selected stars */}
          {starValue <= (hoverRating || rating) && (
            <Box
              position="absolute"
              top="50%"
              left="50%"
              transform="translate(-50%, -50%)"
              width="100%"
              height="100%"
              borderRadius="full"
              background="radial-gradient(circle, rgba(255,215,0,0.3) 0%, rgba(255,215,0,0) 70%)"
              pointerEvents="none"
              zIndex="-1"
            />
          )}
        </MotionBox>
      ))}
    </HStack>
  )
}

export default StarRating
