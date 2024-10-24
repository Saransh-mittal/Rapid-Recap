// src/components/quizComponents/ProgressBar.jsx
import React from 'react'
import { Box, Flex, Text } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

const MotionBox = motion(Box)

const CelebrationSparkle = React.memo(({ delay, left }) => (
  <MotionBox
    position="absolute"
    width="6px"
    height="6px"
    borderRadius="full"
    bgGradient="linear(to-r, yellow.400, pink.400)"
    initial={{
      opacity: 0,
      scale: 0,
      y: 0,
      left: `${left}%`,
    }}
    animate={{
      opacity: [0, 1, 0],
      scale: [0, 2, 0],
      y: [-20, -40, -20],
      rotate: [0, 180, 360],
    }}
    transition={{
      duration: 2,
      delay,
      repeat: Infinity,
      repeatDelay: 1,
    }}
    style={{
      top: '100%',
    }}
  />
))

const MaestroOverlay = React.memo(() => (
  <MotionBox position="absolute" inset={0} overflow="visible">
    {Array.from({ length: 15 }).map((_, i) => (
      <CelebrationSparkle
        key={i}
        delay={i * 0.15}
        left={i * 7 + Math.random() * 5}
      />
    ))}

    <MotionBox
      position="absolute"
      inset="-4px"
      rounded="full"
      bgGradient="linear(to-r, yellow.400, pink.400)"
      filter="blur(12px)"
      animate={{
        opacity: [0.2, 0.4, 0.2],
        scale: [1, 1.05, 1],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  </MotionBox>
))

const RQMLevelLabel = React.memo(({ text, range, isActive, isCurrent }) => (
  <Flex
    fontSize="xs"
    color={isActive ? 'yellow.300' : 'purple.200'}
    fontWeight={isCurrent ? 'bold' : 'normal'}
    flexDirection={{ base: 'column-reverse', md: 'row' }}
    gap={1}
    justifyContent={'center'}
    alignItems={'center'}
  >
    {text}
    <Text as="span" fontSize="2xs" opacity={0.7} height={'fit-content'}>
      {range}
    </Text>
  </Flex>
))

const ProgressBar = React.memo(
  ({ step, rqmScore, isTournament, animationDelay }) => {
    const { t } = useTranslation('SubmittedQuizInterface')

    if (step < 3) return null

    const levels = [
      { name: 'rookie', range: '(0-25)' },
      { name: 'amateur', range: '(26-50)' },
      { name: 'expert', range: '(51-75)' },
      { name: 'maestro', range: '(76+)' },
    ]

    const currentLevel = levels.findIndex((level, index) => {
      const nextThreshold = (index + 1) * 25
      return rqmScore <= nextThreshold || index === levels.length - 1
    })

    const isMaestro = rqmScore >= 76

    return (
      <MotionBox
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        bg="whiteAlpha.50"
        backdropFilter="blur(8px)"
        rounded="xl"
        p={4}
        borderWidth={1}
        borderColor="whiteAlpha.100"
        position="relative"
        overflow="visible"
        w={'100%'}
        transition={{ duration: 0.3, delay: animationDelay }}
      >
        <Flex justify="space-between" mb={2}>
          {levels.map((level, index) => (
            <RQMLevelLabel
              key={level.name}
              text={t(level.name)}
              range={level.range}
              isActive={index <= currentLevel}
              isCurrent={index === currentLevel}
            />
          ))}
        </Flex>

        <Box
          h="6px"
          bg="whiteAlpha.100"
          rounded="full"
          overflow="visible"
          position="relative"
        >
          <MotionBox
            h="full"
            bgGradient={
              isMaestro
                ? 'linear(to-r, yellow.400, pink.400)'
                : 'linear(to-r, purple.400, pink.400)'
            }
            initial={{ width: '0%' }}
            animate={{
              width: `${Math.min((rqmScore / 105) * 100, 100)}%`,
            }}
            transition={{ duration: 1.5, delay: 0.5 }}
            rounded="full"
          />

          {isMaestro && <MaestroOverlay />}

          {isMaestro && (
            <MotionBox
              position="absolute"
              top="-40px"
              left={{ base: '25%', md: '60%' }}
              transform="translateX(-50%)"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2 }}
              padding="1"
              bg="rgba(0,0,0,0.6)"
              backdropFilter="blur(4px)"
              rounded="lg"
              border="1px solid"
              borderColor="yellow.400"
            >
              <Text
                fontSize="sm"
                color="yellow.300"
                fontWeight="bold"
                textAlign="center"
              >
                🏆 {t('maestroAchieved')}
              </Text>
            </MotionBox>
          )}

          <MotionBox
            position="absolute"
            left={`${Math.min((rqmScore / 105) * 100, 100)}%`}
            bottom="-15px"
            transform="translateX(-50%)"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2 }}
          >
            <Text
              fontSize="xs"
              fontWeight="bold"
              bgGradient={
                isMaestro
                  ? 'linear(to-r, yellow.400, pink.400)'
                  : 'linear(to-r, purple.400, pink.400)'
              }
              bgClip="text"
            >
              {rqmScore}
            </Text>
          </MotionBox>
        </Box>
      </MotionBox>
    )
  },
)

export default ProgressBar
