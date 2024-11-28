import React, { useMemo } from 'react'
import { Box, Flex, Icon, Text, Badge, Tooltip } from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, PauseCircle, Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { getBoostReason, calculateScoreData } from './IQScore/utils'
import { useScoreAnimation } from './IQScore/hooks/useScoreAnimation'
import { PreciseCountingNumber } from './IQScore/PreciseCountingNumber'
import { IncrementFlow } from './IQScore/IncrementFlow'
import { FinalIncrement } from './IQScore/FinalIncrement'

const MotionBox = motion(Box)
const MotionFlex = motion(Flex)
const MotionText = motion(Text)
const MotionBadge = motion(Badge)

const IQScoreCard = React.memo(
  ({ step, quizData, isTournament, animationDelay }) => {
    const { t } = useTranslation('SubmittedQuizInterface')
    const { user } = useSelector(state => state.auth)

    const scoreData = useMemo(
      () => calculateScoreData(user, quizData),
      [user, quizData],
    )

    const boostReason = getBoostReason(scoreData.RQM_score)
    const { showAnimation, currentScore, animationStep } = useScoreAnimation(
      scoreData,
      step,
    )

    if (!quizData?.iqData || step < 2) return null

    return (
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: animationDelay }}
        bg="whiteAlpha.50"
        rounded="xl"
        p={6}
        borderWidth={1}
        borderColor="whiteAlpha.100"
        height="200px"
        position="relative"
        w={{ base: '100%', md: '50%' }}
      >
        {/* Header Section */}
        <Flex alignItems="flex-start" justify="space-between" mb={4}>
          <Flex alignItems="center" gap={2}>
            <Icon as={Zap} boxSize={5} color="yellow.400" />
            <Text fontSize="sm" fontWeight="medium" color="yellow.200">
              {t('iqScore')}
            </Text>
          </Flex>

          <Flex gap={2}>
            {scoreData.isGuest && (
              <Tooltip label={t('registerTooltip')} placement="top" hasArrow>
                <MotionBadge
                  colorScheme="purple"
                  variant="subtle"
                  fontSize="xs"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {t('guestMode')}
                </MotionBadge>
              </Tooltip>
            )}

            {scoreData.isPaused && !scoreData.isGuest && (
              <MotionBadge
                display="flex"
                alignItems="center"
                gap={1}
                colorScheme="orange"
                variant="subtle"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Icon as={PauseCircle} boxSize={3} />
                <Text fontSize="xs">{t('iqPaused')}</Text>
              </MotionBadge>
            )}

            {scoreData.boostMultiplier > 1 && (
              <MotionFlex
                flexDirection={'column'}
                justifyContent={'center'}
                alignItems={'center'}
                gap={1}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 2.5 }}
              >
                <MotionBadge
                  colorScheme="yellow"
                  variant="solid"
                  fontSize="xs"
                  px={3}
                  py={1}
                  borderRadius="full"
                  bgGradient="linear(to-r, orange.400, yellow.400)"
                  display="flex"
                  alignItems="center"
                  gap={1}
                >
                  <Icon as={Sparkles} boxSize={3} />+
                  {(scoreData.boostMultiplier - 1) * 100}% BOOST
                </MotionBadge>
                <Text fontSize="xs" color="gray.300">
                  for {boostReason}
                </Text>
              </MotionFlex>
            )}
          </Flex>
        </Flex>

        {/* Main Content Area */}
        <Flex
          position="relative"
          height="calc(100% - 48px)"
          alignItems="center"
          justifyContent="center"
        >
          <AnimatePresence mode="wait">
            {!showAnimation ? (
              <MotionFlex
                key="initial"
                justifyContent="center"
                alignItems={
                  scoreData?.boostMultiplier > 1 ? 'flex-start' : 'center'
                }
                width={'100%'}
                h={'100%'}
              >
                <PreciseCountingNumber
                  from={scoreData.prevScore}
                  to={scoreData.prevScore}
                  isGuest={scoreData.isGuest}
                  needsOnboarding={scoreData.needsOnboarding}
                  inGameName={user?.inGameName}
                />
              </MotionFlex>
            ) : (
              <MotionFlex
                key="animated"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                width="100%"
                gap={0}
                mt={scoreData?.boostMultiplier > 1 ? -12 : 0}
                position={'relative'}
              >
                {animationStep === 3 && (
                  <MotionBox
                    position="absolute"
                    h={'100%'}
                    w={'100%'}
                    inset="-8px"
                    rounded="lg"
                    bgGradient="linear(to-r, yellow.500, orange.500)"
                    filter="blur(20px)"
                    opacity={0.3}
                    animate={{
                      scale: [1, 1.1, 1],
                      opacity: [0.2, 0.4, 0.2],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                )}
                <Box position="relative">
                  <PreciseCountingNumber
                    from={scoreData.prevScore}
                    to={currentScore}
                    duration={0.8}
                    isGuest={scoreData.isGuest}
                    needsOnboarding={scoreData.needsOnboarding}
                    inGameName={user?.inGameName}
                    boostMultiplier={scoreData.boostMultiplier}
                  />
                  {/* Increment flow animation */}
                  {animationStep >= 1 && scoreData?.boostMultiplier > 1 && (
                    <IncrementFlow
                      originalIncrement={scoreData.originalIncrement}
                      additionalIncrement={scoreData.additionalIncrement}
                    />
                  )}
                  {/* Final increment with sparkle */}
                  {animationStep === 3 && !scoreData?.isPaused && (
                    <FinalIncrement
                      boostedIncrement={scoreData?.boostedIncrement}
                      boostMultiplier={scoreData?.boostMultiplier}
                    />
                  )}
                </Box>
              </MotionFlex>
            )}
          </AnimatePresence>
        </Flex>

        {scoreData.isGuest && (
          <MotionText
            position="absolute"
            bottom={1}
            left={0}
            right={0}
            textAlign="center"
            fontSize="xs"
            color="gray.300"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            {t('registerNote')}
          </MotionText>
        )}
      </MotionBox>
    )
  },
)

export default IQScoreCard
