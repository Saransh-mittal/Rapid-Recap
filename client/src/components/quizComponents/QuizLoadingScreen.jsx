import React, { useState, useEffect } from 'react'
import { Box, Text, Progress, VStack, Fade } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

const QuizLoadingScreen = ({ socket, isQuizGenerating }) => {
  const [progress, setProgress] = useState(0)
  const [currentTip, setCurrentTip] = useState('')
  const { t } = useTranslation('QuizLoadingScreen')

  const tips = [t('tip1'), t('tip2'), t('tip3'), t('tip4'), t('tip5')]

  useEffect(() => {
    if (isQuizGenerating && socket) {
      socket.on('quiz_generation_progress', data => {
        setProgress(data.progress)
      })
    }

    return () => {
      if (socket) {
        socket.off('quiz_generation_progress')
      }
    }
  }, [socket, isQuizGenerating])

  useEffect(() => {
    const tipInterval = setInterval(() => {
      setCurrentTip(tips[Math.floor(Math.random() * tips.length)])
    }, 5000)

    return () => clearInterval(tipInterval)
  }, [tips])

  return (
    <Box
      height="100vh"
      w={'100vw'}
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      bg="rgba(0, 0, 0, 1)"
      color="white"
      position={'fixed'}
      zIndex={10000}
    >
      <VStack spacing={8} width="80%">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Text fontSize="3xl" fontWeight="bold">
            {t('preparingYourQuiz')}
          </Text>
        </motion.div>

        <Progress
          value={progress}
          size="lg"
          width="100%"
          colorScheme="purple"
          isAnimated
          hasStripe
        />

        <Fade in={true}>
          <Box textAlign="center" p={4} borderRadius="md" bg="whiteAlpha.200">
            <Text fontSize="xl">{currentTip}</Text>
          </Box>
        </Fade>
      </VStack>
    </Box>
  )
}

export default QuizLoadingScreen
