import React, { useState, useEffect } from 'react'
import { Box, Text, Flex, useColorModeValue } from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'

const MotionBox = motion(Box)
const MotionFlex = motion(Flex)

const TimeUnit = ({ value, label }) => {
  return (
    <MotionBox
      display="flex"
      flexDirection="column"
      alignItems="center"
      mx={1.5}
    >
      <MotionBox
        w={{ base: '45px', md: '50px' }}
        h={{ base: '45px', md: '50px' }}
        bg="rgba(147, 112, 219, 0.3)"
        borderRadius="lg"
        display="flex"
        alignItems="center"
        justifyContent="center"
        position="relative"
        overflow="hidden"
        boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
        border="1px solid rgba(255, 255, 255, 0.1)"
      >
        <AnimatePresence mode="wait">
          <MotionFlex
            key={value}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Text
              fontSize={{ base: 'xl', md: '2xl' }}
              fontWeight="bold"
              color="white"
              fontFamily="mono"
            >
              {String(value).padStart(2, '0')}
            </Text>
          </MotionFlex>
        </AnimatePresence>
      </MotionBox>
      <Text
        fontSize="xs"
        mt={1}
        color="whiteAlpha.700"
        fontWeight="medium"
        letterSpacing="wider"
      >
        {label}
      </Text>
    </MotionBox>
  )
}

const RefreshTimer = ({ initialTime }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: initialTime.days || 0,
    hours: initialTime.hours || 0,
    minutes: initialTime.minutes || 0,
    seconds: initialTime.seconds || 0,
  })
  const { t } = useTranslation('LeaderBoard')
  useEffect(() => {
    let totalSeconds = initialTime.totalSeconds
    const timer = setInterval(() => {
      if (totalSeconds <= 0) {
        clearInterval(timer)
        return
      }

      const days = Math.floor(totalSeconds / (24 * 60 * 60))
      const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60))
      const minutes = Math.floor((totalSeconds % (60 * 60)) / 60)
      const seconds = Math.floor(totalSeconds % 60)

      setTimeLeft({ days, hours, minutes, seconds })
      totalSeconds -= 1
    }, 1000)

    return () => clearInterval(timer)
  }, [initialTime.totalSeconds])

  return (
    <MotionBox
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box
        px={4}
        py={3}
        borderRadius="xl"
        bg="rgba(20, 20, 43, 0.6)"
        backdropFilter="blur(10px)"
        border="1px solid rgba(255, 255, 255, 0.1)"
        maxW="fit-content"
        mx="auto"
      >
        <Text
          textAlign="center"
          mb={2}
          fontSize="sm"
          color="purple.300"
          fontWeight="semibold"
          letterSpacing="wider"
          textTransform="uppercase"
        >
          {t('refreshIn')}
        </Text>
        <Flex justify="center" align="center">
          <TimeUnit value={timeLeft.days} label="DAYS" />
          <TimeUnit value={timeLeft.hours} label="HOURS" />
          <TimeUnit value={timeLeft.minutes} label="MINS" />
          <TimeUnit value={timeLeft.seconds} label="SECS" />
        </Flex>
      </Box>
    </MotionBox>
  )
}

export default RefreshTimer
