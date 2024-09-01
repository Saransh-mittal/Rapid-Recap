import React from 'react'
import { Box, Image, Text, Flex } from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { findSocietyAndCircle } from '../../../utils/helper.utils'

const MotionBox = motion(Box)
const MotionText = motion(Text)
const MotionImage = motion(Image)
const MotionFlex = motion(Flex)

const IQScore = ({ user, score, _hover, onClick }) => {
  const societyData = findSocietyAndCircle(score)
  const { image: society, textColor, boxShadow } = societyData || {}

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        type: 'spring',
        stiffness: 120,
      },
    },
    hover: {
      scale: 1.05,
      boxShadow: `0 0 12px ${textColor || '#00ffff'}`,
      transition: { duration: 0.3 },
    },
    tap: { scale: 0.95 },
  }

  const textVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { delay: 0.2, duration: 0.3 },
    },
  }

  const imageVariants = {
    hidden: { opacity: 0, scale: 0, rotate: -180 },
    visible: {
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: {
        delay: 0.4,
        duration: 0.5,
        type: 'spring',
        stiffness: 200,
      },
    },
    hover: {
      rotate: 360,
      transition: { duration: 0.5 },
    },
  }

  return (
    <AnimatePresence>
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
          variants={textVariants}
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
          >
            {user?.role === 'guest' ? 'NA' : score}
          </MotionText>
        </MotionFlex>
        {user?.role !== 'guest' && (
          <MotionImage
            src={society}
            alt={'Society'}
            h="25px"
            w="25px"
            variants={imageVariants}
            whileHover="hover"
          />
        )}
      </MotionBox>
    </AnimatePresence>
  )
}

export default IQScore
