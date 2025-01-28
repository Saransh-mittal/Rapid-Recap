import React from 'react'
import { Button, Box } from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera } from 'lucide-react'
import { useDispatch } from 'react-redux'
import { setIsSigninOpen } from '../../../redux/appSlice'
import { useFeatureDetection } from '../../../utils/featureDetection'
import useSafeSound from '../../../customHooks/useSafeSound'

// Create a motion-enabled button component
const MotionButton = motion(Button)
const MotionBox = motion(Box)

const GetStarted = ({
  display = 'flex',
  innerText = 'Login To Continue',
  hamburgerOnClose,
  width,
  onClick,
  isLoading,
}) => {
  const dispatch = useDispatch()
  const features = useFeatureDetection()
  const { playClick } = useSafeSound({
    enabled: features.hasAudioSupport,
    volume: 0.5,
  })

  // Framer Motion variants for animations
  const buttonVariants = {
    initial: { scale: 1 },
    hover: {
      scale: 1.05,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 10,
      },
    },
    tap: {
      scale: 0.95,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 10,
      },
    },
  }

  const particleVariants = {
    initial: { opacity: 0, y: 0 },
    animate: i => ({
      opacity: [0, 1, 0],
      y: -20,
      x: i * 10,
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: 'reverse',
        delay: i * 0.2,
      },
    }),
  }

  const glowVariants = {
    initial: { opacity: 0 },
    hover: {
      opacity: 0.6,
      transition: { duration: 0.3 },
    },
  }

  return (
    <Box position="relative" width={width || 'auto'}>
      {/* Background glow effect */}
      <MotionBox
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        borderRadius="lg"
        bg="linear-gradient(135deg, purple.400, blue.300)"
        initial="initial"
        whileHover="hover"
        variants={glowVariants}
        style={{ filter: 'blur(15px)' }}
      />

      {/* Main button */}
      <MotionButton
        display={display}
        width="full"
        bgGradient="linear(to-r, purple.600, blue.500)"
        color="white"
        px={8}
        py={6}
        rounded="lg"
        _hover={{
          bgGradient: 'linear(to-r, purple.500, blue.400)',
        }}
        _active={{
          bgGradient: 'linear(to-r, purple.700, blue.600)',
        }}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        variants={buttonVariants}
        onClick={() => {
          onClick && onClick()
          playClick()
          hamburgerOnClose && hamburgerOnClose()
          dispatch(setIsSigninOpen(true))
        }}
        isLoading={isLoading}
        loadingText="Logging in"
      >
        {/* Floating particles */}
        <AnimatePresence>
          {[0, 1, 2].map(i => (
            <MotionBox
              key={i}
              position="absolute"
              width="2px"
              height="2px"
              bg="white"
              borderRadius="full"
              custom={i}
              variants={particleVariants}
              initial="initial"
              animate="animate"
              style={{
                top: '50%',
                left: `${30 + i * 20}%`,
                pointerEvents: 'none',
              }}
            />
          ))}
        </AnimatePresence>

        {/* Button content */}
        <Box display="flex" alignItems="center" gap={2}>
          <Camera size={20} />
          <Box>{innerText}</Box>
        </Box>
      </MotionButton>
    </Box>
  )
}

export default GetStarted
