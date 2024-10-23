import React, { useState, useEffect } from 'react'
import { Box, Flex, Icon, Text } from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import CountingNumber from './CountingNumber.jsx'

const MotionBox = motion(Box)

const RQMScoreCard = ({ step, quizData, isTournament }) => {
  const { t } = useTranslation('SubmittedQuizInterface')
  const [rqmStep, setRqmStep] = useState(0)

  useEffect(() => {
    if (step >= 1) {
      const timer = setInterval(() => {
        setRqmStep(prev => (prev < 3 ? prev + 1 : prev))
      }, 1500)
      return () => clearInterval(timer)
    }
  }, [step])

  const renderRQMScore = () => {
    const baseScore = quizData.baseRQM || quizData.finalRQM
    const withPerformance = quizData.performanceBonus
      ? parseInt((baseScore * quizData.performanceBonus).toFixed(0))
      : baseScore

    const finalScore = quizData.finalRQM

    switch (rqmStep) {
      case 0:
        return (
          <Text
            fontSize="4xl"
            fontWeight="bold"
            bgGradient={
              isTournament
                ? 'linear(to-r, yellow.400, orange.400)'
                : 'linear(to-r, purple.400, pink.400)'
            }
            bgClip="text"
          >
            {baseScore}
          </Text>
        )
      case 1:
        return (
          <CountingNumber
            from={baseScore}
            to={withPerformance}
            duration={2}
            label={
              baseScore < withPerformance
                ? t('performanceBonus', {
                    bonus: Math.ceil(
                      (parseFloat(quizData.performanceBonus) - 1) * 100,
                    ),
                  })
                : null
            }
            color="green.400"
          />
        )
      case 2:
        return (
          <CountingNumber
            from={withPerformance}
            to={finalScore}
            duration={2}
            label={
              quizData.isBoost
                ? t('quizBoost', {
                    boost: ((quizData.boost - 1) * 100).toFixed(0),
                  })
                : null
            }
            color="blue.400"
          />
        )
      default:
        return (
          <motion.div
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 0.5 }}
          >
            <MotionBox
              position="absolute"
              inset="-16px"
              rounded="xl"
              bgGradient="linear(to-r, rgba(168, 85, 247, 0.2), rgba(236, 72, 153, 0.2))"
              filter="blur(16px)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.5 }}
            />
            <Text
              fontSize="4xl"
              fontWeight="bold"
              bgGradient={
                isTournament
                  ? 'linear(to-r, yellow.400, orange.400)'
                  : 'linear(to-r, purple.400, pink.400)'
              }
              bgClip="text"
            >
              {finalScore}
            </Text>
          </motion.div>
        )
    }
  }
  if (step < 2) return null
  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      bg="whiteAlpha.50"
      backdropFilter="blur(8px)"
      rounded="xl"
      p={6}
      borderWidth={1}
      borderColor="whiteAlpha.100"
      w={{
        base: '100%',
        md:
          !quizData?.iqData ||
          Object.keys(quizData?.iqData).length === 0 ||
          Object.values(quizData?.iqData).every(
            val => val === null || val === undefined,
          )
            ? '100%'
            : '50%',
      }}
    >
      <Flex alignItems="center" gap={2} mb={6}>
        <Icon
          as={Brain}
          boxSize={5}
          color={isTournament ? 'yellow.400' : 'purple.400'}
        />
        <Text fontSize="sm" fontWeight="medium" color="purple.200">
          {t('rqmScore')}
        </Text>
      </Flex>

      <Box h="80px" display="flex" justifyContent="center" alignItems="center">
        <AnimatePresence mode="wait">{renderRQMScore()}</AnimatePresence>
      </Box>
    </MotionBox>
  )
}

export default RQMScoreCard
