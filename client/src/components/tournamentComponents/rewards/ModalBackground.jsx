// src/components/rewards/ModalBackground.jsx
import React, { useEffect, useRef } from 'react'
import { Box } from '@chakra-ui/react'
import { motion, useAnimation } from 'framer-motion'

const GlowingSphere = ({ delay }) => {
  const controls = useAnimation()

  useEffect(() => {
    controls.start({
      y: [0, -20, 0],
      opacity: [0.3, 0.6, 0.3],
      scale: [1, 1.2, 1],
      transition: {
        duration: 3,
        ease: 'easeInOut',
        times: [0, 0.5, 1],
        repeat: Infinity,
        delay: delay,
      },
    })
  }, [controls, delay])

  return (
    <Box
      as={motion.div}
      position="absolute"
      w={{ base: '150px', md: '300px' }}
      h={{ base: '150px', md: '300px' }}
      borderRadius="full"
      filter="blur(80px)"
      transform="translate(-50%, -50%)"
      animate={controls}
    />
  )
}

const ModalBackground = () => {
  const spheresRef = useRef([
    {
      color: 'rgba(68, 51, 122, 0.3)', // Purple theme
      top: '20%',
      left: '20%',
      delay: 0,
    },
    {
      color: 'rgba(236, 201, 75, 0.2)', // Gold
      top: '70%',
      left: '30%',
      delay: 0.5,
    },
    {
      color: 'rgba(159, 122, 234, 0.2)', // Purple
      top: '30%',
      left: '80%',
      delay: 1,
    },
    {
      color: 'rgba(236, 201, 75, 0.15)', // Gold
      top: '80%',
      left: '80%',
      delay: 1.5,
    },
  ])

  return (
    <Box
      position="fixed"
      inset={0}
      overflow="hidden"
      zIndex={0}
      bgGradient="linear(to-b, purple.900, black)"
      opacity={0.97}
    >
      {spheresRef.current.map((sphere, index) => (
        <Box
          key={index}
          position="absolute"
          top={sphere.top}
          left={sphere.left}
        >
          <Box as={GlowingSphere} bg={sphere.color} delay={sphere.delay} />
        </Box>
      ))}

      {/* Gradient overlay */}
      <Box
        position="absolute"
        inset={0}
        bgGradient="radial(circle at 50% 0%, transparent 0%, rgba(0,0,0,0.8) 70%)"
      />
    </Box>
  )
}

export default ModalBackground
