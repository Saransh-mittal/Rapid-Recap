import React, { useEffect, useState, useRef } from 'react'
import { Box, Text, Flex, Portal } from '@chakra-ui/react'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'
import { findSocietyAndCircle } from '../../../utils/helper.utils'

const MotionBox = motion(Box)
const MotionText = motion(Text)
const MotionFlex = motion(Flex)

const IQScore = ({ user, score, _hover, onClick, isVisibleRef }) => {
  const societyData = findSocietyAndCircle(score)
  const { textColor, boxShadow } = societyData || {}
  const [displayScore, setDisplayScore] = useState(user?.IQ_score || 0)
  const [showIncrease, setShowIncrease] = useState(false)
  const [componentRect, setComponentRect] = useState(null)
  const cloudControls = useAnimation()
  const componentRef = useRef(null)

  const animatableTextColor =
    textColor === 'white' ? '#FFFFFF' : textColor || '#00FFFF'

  useEffect(() => {
    const updateComponentRect = () => {
      if (componentRef.current) {
        const rect = componentRef.current.getBoundingClientRect()
        setComponentRect(rect)
      }
    }

    updateComponentRect()
    window.addEventListener('resize', updateComponentRect)
    window.addEventListener('scroll', updateComponentRect)

    return () => {
      window.removeEventListener('resize', updateComponentRect)
      window.removeEventListener('scroll', updateComponentRect)
    }
  }, [])

  useEffect(() => {
    if (
      user?.prevIQScore !== undefined &&
      user?.IQ_score !== user?.prevIQScore &&
      displayScore !== user?.IQ_score
    ) {
      animateScoreChange()
    }
  }, [user?.IQ_score, user?.prevIQScore, displayScore])

  const animateScoreChange = async () => {
    if (!componentRect) return

    setShowIncrease(true)
    await new Promise(resolve => setTimeout(resolve, 10000))

    const startY = componentRect.bottom
    const endY = componentRect.top

    // Animate cloud appearing
    await cloudControls.start({
      opacity: [0, 1],
      scale: [0.5, 1],
      y: [startY, endY],
      transition: { duration: 1, ease: 'easeOut' },
    })

    // Animate cloud merging
    await cloudControls.start({
      scale: [1, 1.2],
      y: [endY, endY - 10],
      opacity: [1, 0],
      transition: { duration: 0.5, ease: 'easeIn' },
    })

    // Update score
    setDisplayScore(user?.IQ_score)

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
      boxShadow: `0 0 12px ${animatableTextColor}`,
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
    <Box position="relative" className="IQscore">
      <MotionBox
        ref={componentRef}
        // key={`IQscore-${isVisibleRef.current}`}
        display="flex"
        alignItems="center"
        justifyContent="center"
        bg="rgba(255, 255, 255, 0.1)"
        borderRadius="full"
        p="0.5rem"
        title="Your Information Quotient (IQ) Score"
        border={`2px solid ${animatableTextColor}`}
        boxShadow={boxShadow || '0 0 1px #00FFFF'}
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
            color={animatableTextColor}
            lineHeight="1"
            mr={1}
          >
            IQ
          </MotionText>
          <MotionText
            key={displayScore}
            fontSize="1rem"
            fontWeight="bold"
            color="#9CAFAA"
            lineHeight="1"
            initial={{ scale: 1, color: '#9CAFAA' }}
            animate={{
              scale: [1, 1.2, 1],
              color: ['#9CAFAA', animatableTextColor, '#9CAFAA'],
            }}
            transition={{ duration: 0.5 }}
          >
            {user?.role === 'guest' ? 'NA' : formatScore(displayScore)}
          </MotionText>
        </MotionFlex>
      </MotionBox>
      <Portal>
        <AnimatePresence>
          {showIncrease && componentRect && (
            <MotionBox
              position="fixed"
              top={`${componentRect.bottom - 10}px`}
              left={`${componentRect.left + componentRect.width / 2 + 5}px`}
              width="fit-content"
              height="fit-content"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={cloudControls}
              exit={{ opacity: 0, scale: 0.5 }}
              zIndex={999999}
              style={{
                transformOrigin: 'center center',
                pointerEvents: 'none',
              }}
            >
              <MotionFlex
                position="absolute"
                top="50%"
                left="50%"
                transform="translate(-50%, -50%)"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                width="100%"
                height="100%"
              >
                <MotionText
                  fontSize="1rem"
                  fontWeight="bold"
                  color={
                    formatScore(user?.IQ_score - user?.prevIQScore) < 0
                      ? '#E53E3E'
                      : '#38A169'
                  }
                >
                  {formatScore(user?.IQ_score - user?.prevIQScore) < 0
                    ? formatScore(user?.IQ_score - user?.prevIQScore)
                    : '+' + formatScore(user?.IQ_score - user?.prevIQScore)}
                </MotionText>
              </MotionFlex>
            </MotionBox>
          )}
        </AnimatePresence>
      </Portal>
    </Box>
  )
}

export default IQScore
