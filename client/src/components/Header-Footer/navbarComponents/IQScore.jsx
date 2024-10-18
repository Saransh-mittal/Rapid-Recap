import React, { useEffect, useState } from 'react'
import { Box, Text, Flex } from '@chakra-ui/react'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'
import { findSocietyAndCircle } from '../../../utils/helper.utils'

const MotionBox = motion(Box)
const MotionText = motion(Text)
const MotionFlex = motion(Flex)

const IQScore = ({ user, score, _hover, onClick }) => {
  const societyData = findSocietyAndCircle(score)
  const { textColor, boxShadow } = societyData || {}
  const [displayScore, setDisplayScore] = useState(user?.IQ_score || 0)
  const [showIncrease, setShowIncrease] = useState(false)
  const controls = useAnimation()
  const cloudControls = useAnimation()

  useEffect(() => {
    if (
      user?.prevIQScore !== undefined &&
      user?.IQ_score !== user?.prevIQScore
    ) {
      animateScoreChange()
    }
  }, [user?.IQ_score, user?.prevIQScore])

  const animateScoreChange = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    setShowIncrease(true)

    // Animate cloud appearing
    await cloudControls.start({
      opacity: [0, 1],
      scale: [0.5, 1],
      y: [50, 0],
      transition: { duration: 0.5, ease: 'easeOut' },
    })

    // Hold the cloud visible for a moment
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Animate cloud merging
    await cloudControls.start({
      scale: [1, 1.2],
      y: [0, -10],
      opacity: [1, 0],
      transition: { duration: 0.5, ease: 'easeIn' },
    })

    // Update score
    setDisplayScore(user?.IQ_score)

    // Animate score change
    await controls.start({
      scale: [1, 1.2, 1],
      transition: { duration: 0.3, times: [0, 0.5, 1] },
    })

    setShowIncrease(false)
  }

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, type: 'spring', stiffness: 120 },
    },
    hover: {
      scale: 1.05,
      boxShadow: `0 0 12px ${textColor || '#00ffff'}`,
      transition: { duration: 0.3 },
    },
    tap: { scale: 0.95 },
  }

  const formatScore = score => {
    if (typeof score === 'number' && !isNaN(score)) {
      return score.toFixed(1)
    }
    return 'N/A'
  }

  return (
    <Box position="relative">
      <MotionBox
        display="flex"
        alignItems="center"
        justifyContent="center"
        bg="rgba(255, 255, 255, 0.1)"
        borderRadius="full"
        p="0.5rem"
        title="Your Information Quotient (IQ) Score"
        border={`2px solid ${textColor || '#00ffff'}`}
        boxShadow={boxShadow || '0 0 1px #00ffff'}
        width="105px"
        height="40px"
        gap={1}
        onClick={onClick}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        whileHover="hover"
        whileTap="tap"
        _hover={{ ..._hover }}
      >
        <MotionFlex
          flexDirection="row"
          alignItems="center"
          justifyContent="center"
        >
          <MotionText
            fontSize="1rem"
            fontWeight="bold"
            color={textColor || 'white'}
            lineHeight="1"
            mr={1}
          >
            IQ
          </MotionText>
          <MotionText
            fontSize="1rem"
            fontWeight="bold"
            color="#9CAFAA"
            lineHeight="1"
            animate={controls}
          >
            {user?.role === 'guest' ? 'NA' : formatScore(displayScore)}
          </MotionText>
        </MotionFlex>
      </MotionBox>
      <AnimatePresence>
        {showIncrease && (
          <MotionBox
            position="absolute"
            top="-60px"
            left="50%"
            transform="translateX(-50%)"
            width="120px"
            height="60px"
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={cloudControls}
            exit={{ opacity: 0, scale: 0.5, y: -50 }}
          >
            <svg
              width="120"
              height="60"
              viewBox="0 0 120 60"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M60 10C26.8629 10 0 36.8629 0 70H120C120 36.8629 93.1371 10 60 10Z"
                fill="rgba(255, 255, 255, 0.9)"
              />
              <path
                d="M30 30C13.4315 30 0 43.4315 0 60H60C60 43.4315 46.5685 30 30 30Z"
                fill="rgba(255, 255, 255, 0.7)"
              />
              <path
                d="M90 40C78.9543 40 70 48.9543 70 60H110C110 48.9543 101.046 40 90 40Z"
                fill="rgba(255, 255, 255, 0.7)"
              />
            </svg>
            <MotionFlex
              position="absolute"
              top="50%"
              left="50%"
              transform="translate(-50%, -50%)"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
            >
              <MotionText fontSize="1.2rem" fontWeight="bold" color="green.500">
                +{formatScore(user?.IQ_score - user?.prevIQScore)}
              </MotionText>
              <MotionText fontSize="0.8rem" color="gray.600">
                IQ Increase
              </MotionText>
            </MotionFlex>
          </MotionBox>
        )}
      </AnimatePresence>
    </Box>
  )
}

export default IQScore
