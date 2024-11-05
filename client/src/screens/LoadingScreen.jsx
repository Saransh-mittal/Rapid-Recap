import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { Box, Text, Flex, Progress, Image, VStack } from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'

//SSR images
const rrlogo = '/images/rrlogo.webp'

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

const TipContainer = React.memo(({ children }) => (
  <Box
    textAlign="center"
    p={4}
    borderRadius="lg"
    bg="rgba(255, 255, 255, 0.1)"
    boxShadow="0 8px 32px 0 rgba(31, 38, 135, 0.37)"
    border="1px solid rgba(255, 255, 255, 0.18)"
    display="flex"
    alignItems="center"
    justifyContent="center"
  >
    {children}
  </Box>
))

const AnimatedTip = React.memo(({ tip }) => (
  <AnimatePresence mode="wait">
    <motion.div
      key={tip}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Text
        fontSize={{ base: 'md', md: 'xl' }}
        fontStyle="italic"
        fontFamily="'Cormorant Garamond', serif"
        lineHeight="1.6"
        color="white"
      >
        "{tip}"
      </Text>
    </motion.div>
  </AnimatePresence>
))

const LoadingScreen = React.memo(({ progress }) => {
  const { t } = useTranslation('LoadingScreen')
  const [currentTip, setCurrentTip] = useState('Tips will appear here')

  const shownTips = useRef(new Set())

  const tips = useMemo(() => t('tips', { returnObjects: true }), [t])

  const getRandomTip = useCallback(() => {
    if (shownTips.current.size === tips.length) {
      shownTips.current.clear()
    }
    let newTip
    do {
      newTip = tips[Math.floor(Math.random() * tips.length)]
    } while (shownTips.current.has(newTip))
    return newTip
  }, [tips])
  // In LoadingScreen.jsx - add this to your existing useEffect
  useEffect(() => {
    // Hide splash screen when LoadingScreen mounts
    const splashScreen = document.getElementById('splash-screen')
    if (splashScreen) {
      splashScreen.style.opacity = '0'
      splashScreen.style.transition = 'opacity 0.3s ease-out'
      setTimeout(() => {
        splashScreen.style.display = 'none'
      }, 300)
    }
  }, []) // Empty dependency array means this runs once on mount
  useEffect(() => {
    const showNewTip = () => {
      const newTip = getRandomTip()
      setCurrentTip(newTip)
      shownTips.current.add(newTip)
    }

    showNewTip()
    const tipInterval = setInterval(showNewTip, 8000)

    return () => clearInterval(tipInterval)
  }, [getRandomTip])

  const stars = useMemo(
    () =>
      Array(30)
        .fill()
        .map((_, i) => ({
          size: Math.random() * 3 + 1,
          top: Math.random() * 100,
          left: Math.random() * 100,
        })),
    [],
  )

  return (
    <Box
      position="fixed"
      top="0"
      left="0"
      right="0"
      bottom="0"
      bgGradient="linear(to-b, purple.900, black)"
      zIndex="9999"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      overflow="hidden"
    >
      {stars.map((star, index) => (
        <Star key={index} {...star} />
      ))}

      <motion.div
        style={{
          position: 'absolute',
          top: '10%',
          left: '45%',
          // transform: 'translateX(-60%)',
        }}
        animate={{
          y: [0, -20, 0],
          rotate: [0, 10, -10, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <Text fontSize={{ base: '70px', md: '100px' }}>🧠</Text>
      </motion.div>

      <VStack spacing={8} width="80%" maxWidth="600px" zIndex={1}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Flex gap={2} alignItems="center">
            <Image src={rrlogo} width={'40px'} height={'50px'} />
            <Text fontSize="4xl" fontWeight="bold" color="white">
              Rapid Recap
            </Text>
          </Flex>
        </motion.div>

        <Flex direction="column" align="center" width="100%">
          <Progress
            value={progress}
            width="100%"
            colorScheme="purple"
            height="4px"
            mb={4}
            borderRadius="full"
            isAnimated
            hasStripe
          />
          <Text color="white" fontSize="sm">
            {progress}% Loaded
          </Text>
        </Flex>

        <TipContainer>
          <AnimatedTip tip={currentTip} />
        </TipContainer>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <Text color="gray.300" fontSize="md" textAlign="center">
            Prepare for an enlightening journey...
          </Text>
        </motion.div>
      </VStack>
    </Box>
  )
})

export default LoadingScreen
