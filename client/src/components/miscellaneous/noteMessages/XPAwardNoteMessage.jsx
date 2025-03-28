// XPAwardNoteMessage.jsx
import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react'
import {
  Text,
  VStack,
  Box,
  Flex,
  Divider,
  Center,
  HStack,
  Tag,
  useBreakpointValue,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { keyframes } from '@chakra-ui/system'
import { useSelector } from 'react-redux'
import { ArrowForwardIcon, StarIcon } from '@chakra-ui/icons'
import NoteMessage from '../NoteMessage'
import { getMilestoneInfo } from './milestones'
import { useTranslation } from 'react-i18next'

// Lazy load components and assets
const TrophySVG = lazy(() => import('../../../assets/svg/TrophySVG'))
const Confetti = lazy(() => import('react-confetti'))

// Motion components
const MotionBox = motion(Box)
const MotionText = motion(Text)
const MotionFlex = motion(Flex)

// Animations
const glowAnimation = keyframes`
  0% { box-shadow: 0 0 8px rgba(66, 153, 225, 0.7); }
  50% { box-shadow: 0 0 25px rgba(66, 153, 225, 0.9), 0 0 40px rgba(66, 153, 225, 0.5); }
  100% { box-shadow: 0 0 8px rgba(66, 153, 225, 0.7); }
`

const pulseAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
`

const fadeInAnimation = keyframes`
  0% { opacity: 0; transform: translateY(15px); }
  100% { opacity: 1; transform: translateY(0); }
`

const XPAwardNoteMessage = ({
  messageId,
  xpAwarded,
  xpSource,
  milestoneName,
  isMilestone,
  milestoneContent,
  isLevelUp,
  title,
  onClose,
  duration,
}) => {
  const { t } = useTranslation('XPAwardNoteMessage')
  const [showConfetti, setShowConfetti] = useState(
    isMilestone || !!milestoneName || isLevelUp,
  )
  const milestoneInfo = milestoneName ? getMilestoneInfo(milestoneName) : null
  const totalXp = xpAwarded + (milestoneInfo?.xpReward || 0)
  const { user } = useSelector(state => state.auth)

  // Responsive sizes
  const fontSize = useBreakpointValue({ base: 'sm', md: 'md', lg: 'lg' })
  const iconSize = useBreakpointValue({ base: '45px', md: '55px', lg: '65px' })
  const width = useBreakpointValue({ base: '90%', sm: '320px', md: '350px' })
  const titleFontSize = useBreakpointValue({ base: 'lg', md: 'xl', lg: '2xl' })
  const xpAwardedFontSize = useBreakpointValue({
    base: 'lg',
    md: 'xl',
    lg: '2xl',
  })
  const totalXPFontSize = useBreakpointValue({
    base: 'xl',
    md: '2xl',
    lg: '3xl',
  })

  useEffect(() => {
    if (isMilestone || milestoneName || isLevelUp) {
      const timer = setTimeout(() => {
        setShowConfetti(false)
      }, 5000) // Run confetti for 5 seconds

      return () => clearTimeout(timer)
    }
  }, [isMilestone, milestoneName, isLevelUp])

  const LevelUpAnimation = React.memo(() => (
    <MotionFlex
      w="100%"
      bg="rgba(66, 153, 225, 0.12)"
      borderRadius="lg"
      p={3}
      my={3}
      boxShadow="0 0 20px rgba(66, 153, 225, 0.3)"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5, type: 'spring' }}
      alignItems="center"
      justifyContent="center"
    >
      <HStack spacing={2} align="center" width="100%" justify="center">
        <MotionBox
          textAlign="center"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.3 }}
        >
          <MotionText
            fontSize={useBreakpointValue({ base: 'xl', md: '2xl', lg: '3xl' })}
            fontWeight="bold"
            color="yellow.400"
            textShadow="0 0 10px rgba(255,255,255,0.3)"
          >
            {user.level - 1}
          </MotionText>
        </MotionBox>

        <MotionBox
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{
            scale: 1,
            opacity: 1,
            transition: {
              delay: 0.6,
              duration: 0.5,
              type: 'spring',
              stiffness: 150,
            },
          }}
        >
          <ArrowForwardIcon
            w={6}
            h={6}
            color="blue.300"
            mx={2}
            animation={`${pulseAnimation} 2s infinite ease-in-out`}
          />
        </MotionBox>

        <MotionBox
          textAlign="center"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: 1,
          }}
          transition={{
            delay: 0.7,
            duration: 0.7,
            times: [0, 0.6, 1],
          }}
        >
          <MotionText
            fontSize={useBreakpointValue({ base: '2xl', md: '3xl', lg: '4xl' })}
            fontWeight="extrabold"
            color="yellow.400"
            textShadow="0 0 15px rgba(255,255,255,0.5)"
          >
            {user.level}
          </MotionText>
        </MotionBox>
      </HStack>
    </MotionFlex>
  ))

  const customContent = useMemo(
    () => (
      <Flex direction="column" align="center" w="100%" position="relative">
        {showConfetti && (
          <Suspense fallback={null}>
            <Confetti
              width={window.innerWidth}
              height={window.innerHeight}
              recycle={false}
              numberOfPieces={isLevelUp ? 250 : 120}
              gravity={0.15}
              colors={['#F6E05E', '#4299E1', '#9F7AEA', '#48BB78', '#ED64A6']}
              confettiSource={{
                x: window.innerWidth / 2,
                y: window.innerHeight / 3,
                w: 0,
                h: 0,
              }}
            />
          </Suspense>
        )}
        <Suspense fallback={null}>
          <MotionBox
            bg={
              isLevelUp
                ? 'blue.500'
                : isMilestone || milestoneName
                ? 'yellow.500'
                : 'yellow.400'
            }
            borderRadius="full"
            p={3}
            mb={4}
            boxShadow={
              isLevelUp
                ? `0 0 30px rgba(66, 153, 225, 0.8)`
                : isMilestone || milestoneName
                ? '0 0 20px rgba(255, 215, 0, 0.6)'
                : '0 0 15px rgba(255, 215, 0, 0.4)'
            }
            animation={isLevelUp ? `${glowAnimation} 2s infinite` : 'none'}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{
              scale: 1,
              opacity: 1,
              rotate: [0, 15, 0, -15, 0],
            }}
            transition={{
              duration: 0.8,
              times: [0, 0.25, 0.5, 0.75, 1],
              type: 'spring',
              stiffness: 200,
            }}
          >
            <TrophySVG height={iconSize} width={iconSize} />
          </MotionBox>
        </Suspense>
        <VStack spacing={1} align="center" w="100%">
          <MotionText
            fontSize={fontSize}
            fontWeight="bold"
            color={isLevelUp ? 'blue.300' : 'purple.300'}
            textTransform="uppercase"
            letterSpacing="wide"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            {isLevelUp
              ? t('epicLevelUp')
              : isMilestone || milestoneName
              ? t('milestoneAchieved')
              : t('xpSourceCompleted', { xpSource })}
          </MotionText>

          <MotionText
            fontSize={titleFontSize}
            fontWeight="extrabold"
            color="white"
            textAlign="center"
            textShadow="0 0 10px rgba(255,255,255,0.5)"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.3 }}
          >
            {isLevelUp ? t('levelUpTitle') : title}
          </MotionText>

          {isLevelUp && <LevelUpAnimation />}

          <MotionBox
            mt={3}
            bg={
              isLevelUp
                ? 'rgba(66, 153, 225, 0.8)'
                : isMilestone && !milestoneName
                ? 'rgba(237, 137, 54, 0.8)'
                : 'rgba(72, 187, 120, 0.8)'
            }
            px={5}
            py={2}
            borderRadius="xl"
            boxShadow={
              isLevelUp
                ? '0 0 15px rgba(66, 153, 225, 0.7)'
                : isMilestone && !milestoneName
                ? '0 0 10px rgba(237, 137, 54, 0.5)'
                : '0 0 10px rgba(72, 187, 120, 0.5)'
            }
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.3 }}
            whileHover={{
              y: -2,
              boxShadow: isLevelUp
                ? '0 0 20px rgba(66, 153, 225, 0.9)'
                : isMilestone && !milestoneName
                ? '0 0 15px rgba(237, 137, 54, 0.7)'
                : '0 0 15px rgba(72, 187, 120, 0.7)',
            }}
          >
            <MotionText
              fontSize={xpAwardedFontSize}
              fontWeight="bold"
              color="white"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <StarIcon mr={2} />
              {t('xpAwarded', { xpAwarded })}
            </MotionText>
          </MotionBox>

          {milestoneInfo && (
            <MotionBox
              width="100%"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.3 }}
            >
              <Divider my={3} borderColor="whiteAlpha.300" />
              <MotionText
                fontSize={fontSize}
                fontWeight="semibold"
                color="purple.300"
                textAlign="center"
              >
                {t('milestoneBonus', { milestoneName: milestoneInfo.name })}
              </MotionText>
              <MotionText
                fontSize="0.9rem"
                color="whiteAlpha.800"
                textAlign="center"
                mt={1}
              >
                {milestoneInfo.description}
              </MotionText>
              <Center mt={3}>
                <Tag
                  size="lg"
                  bg="purple.500"
                  color="white"
                  borderRadius="full"
                  px={4}
                  py={2}
                  fontWeight="bold"
                  boxShadow="0 0 10px rgba(128, 90, 213, 0.5)"
                >
                  <StarIcon mr={2} />
                  {t('milestoneXP', { xp: milestoneInfo.xpReward })}
                </Tag>
              </Center>
            </MotionBox>
          )}

          {isMilestone && !milestoneName && milestoneContent && (
            <MotionBox
              width="100%"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.3 }}
            >
              <Divider my={3} borderColor="whiteAlpha.300" />
              <MotionText
                fontSize={fontSize}
                fontWeight="semibold"
                color="blue.300"
                textAlign="center"
              >
                {t('milestoneContent')}
              </MotionText>
              <MotionText
                fontSize="0.9rem"
                color="whiteAlpha.800"
                textAlign="center"
                mt={1}
                px={2}
              >
                {milestoneContent}
              </MotionText>
            </MotionBox>
          )}

          {(isMilestone && milestoneName) || isLevelUp ? (
            <MotionFlex
              mt={4}
              bg={
                isLevelUp
                  ? 'rgba(49, 130, 206, 0.8)'
                  : 'rgba(128, 90, 213, 0.8)'
              }
              px={6}
              py={3}
              borderRadius="xl"
              boxShadow={
                isLevelUp
                  ? '0 0 20px rgba(66, 153, 225, 0.8)'
                  : '0 0 20px rgba(128, 90, 213, 0.7)'
              }
              alignItems="center"
              justifyContent="center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: 1,
                scale: 1,
                transition: {
                  delay: 0.6,
                  duration: 0.5,
                  type: 'spring',
                  stiffness: 120,
                },
              }}
              whileHover={{
                scale: 1.05,
                boxShadow: isLevelUp
                  ? '0 0 25px rgba(66, 153, 225, 0.9)'
                  : '0 0 25px rgba(128, 90, 213, 0.8)',
              }}
            >
              <MotionText
                fontSize={totalXPFontSize}
                fontWeight="black"
                color="white"
                textShadow="0 1px 3px rgba(0,0,0,0.3)"
              >
                {t('totalXP', { xp: totalXp })}
              </MotionText>
            </MotionFlex>
          ) : null}
        </VStack>
      </Flex>
    ),
    [
      showConfetti,
      isMilestone,
      milestoneName,
      isLevelUp,
      title,
      xpAwarded,
      xpSource,
      milestoneInfo,
      totalXp,
      milestoneContent,
      user.level,
      t,
      fontSize,
      iconSize,
      titleFontSize,
      xpAwardedFontSize,
      totalXPFontSize,
    ],
  )

  return (
    <NoteMessage
      messageId={messageId}
      title={
        isLevelUp
          ? t('epicLevelUpAchieved')
          : isMilestone || milestoneName
          ? t('majorAchievementUnlocked')
          : t('achievementUnlocked')
      }
      customContent={customContent}
      onClose={onClose}
      duration={duration}
      width={width}
      actions={[
        {
          text: t('viewExperience'),
          actionType: 'VIEW_EXPERIENCE',
        },
      ]}
    />
  )
}

export default XPAwardNoteMessage
