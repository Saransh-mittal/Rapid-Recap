import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react'
import {
  Text,
  VStack,
  Box,
  Flex,
  Divider,
  Center,
  Icon,
  useBreakpointValue,
} from '@chakra-ui/react'
import { keyframes } from '@chakra-ui/system'
import { useSelector } from 'react-redux'
import { ArrowRightIcon } from '@chakra-ui/icons'
import NoteMessage from '../NoteMessage'
import { getMilestoneInfo } from './milestones'
import { useTranslation } from 'react-i18next'

// Lazy load components and assets
const TrophySVG = lazy(() => import('../../../assets/svg/TrophySVG'))
const Confetti = lazy(() => import('react-confetti'))

const glowAnimation = keyframes`
  0% { box-shadow: 0 0 5px #4299E1; }
  50% { box-shadow: 0 0 20px #4299E1, 0 0 30px #4299E1; }
  100% { box-shadow: 0 0 5px #4299E1; }
`

const fadeInAnimation = keyframes`
  0% { opacity: 0; transform: translateY(10px); }
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

  // Responsive sizes - moved to top level
  const fontSize = useBreakpointValue({ base: 'sm', md: 'md', lg: 'lg' })
  const iconSize = useBreakpointValue({ base: '40px', md: '50px', lg: '60px' })
  const width = useBreakpointValue({ base: '90%', sm: '320px', md: '400px' })
  const titleFontSize = useBreakpointValue({ base: 'lg', md: 'xl', lg: '2xl' })
  const xpAwardedFontSize = useBreakpointValue({
    base: 'lg',
    md: 'xl',
    lg: '2xl',
  })
  const milestoneDescriptionFontSize = useBreakpointValue({
    base: 'xs',
    md: 'sm',
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
    <Center
      w="100%"
      bg="rgba(66, 153, 225, 0.1)"
      borderRadius="lg"
      p={2}
      my={2}
      boxShadow="0 0 10px rgba(66, 153, 225, 0.3)"
      animation={`${fadeInAnimation} 0.5s ease-out`}
    >
      <Flex align="center" justify="center">
        <Box textAlign="center">
          <Text
            fontSize={useBreakpointValue({ base: 'xl', md: '2xl', lg: '3xl' })}
            fontWeight="bold"
            color="yellow.400"
            textShadow="0 0 10px rgba(255,255,255,0.3)"
          >
            {user.level - 1}
          </Text>
        </Box>
        <Icon as={ArrowRightIcon} w={6} h={6} color="blue.300" mx={2} />
        <Box textAlign="center">
          <Text
            fontSize={useBreakpointValue({ base: '2xl', md: '3xl', lg: '4xl' })}
            fontWeight="extrabold"
            color="yellow.400"
            textShadow="0 0 15px rgba(255,255,255,0.5)"
          >
            {user.level}
          </Text>
        </Box>
      </Flex>
    </Center>
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
              numberOfPieces={isLevelUp ? 200 : 100}
              gravity={0.2}
            />
          </Suspense>
        )}
        <Suspense fallback={null}>
          <Box
            bg={
              isLevelUp
                ? 'blue.500'
                : isMilestone || milestoneName
                ? 'yellow.500'
                : 'yellow.400'
            }
            borderRadius="full"
            p={2}
            mb={3}
            boxShadow={
              isLevelUp
                ? `0 0 30px rgba(66, 153, 225, 0.8)`
                : isMilestone || milestoneName
                ? '0 0 20px rgba(255, 255, 0, 0.5)'
                : '0 0 15px rgba(255, 255, 0, 0.3)'
            }
            animation={isLevelUp ? `${glowAnimation} 2s infinite` : 'none'}
          >
            <TrophySVG height={iconSize} width={iconSize} />
          </Box>
        </Suspense>
        <VStack spacing={1} align="center" w="100%">
          <Text
            fontSize={fontSize}
            fontWeight="bold"
            color={isLevelUp ? 'blue.300' : 'gray.300'}
            textTransform="uppercase"
            letterSpacing="wide"
          >
            {isLevelUp
              ? t('epicLevelUp')
              : isMilestone || milestoneName
              ? t('milestoneAchieved')
              : t('xpSourceCompleted', { xpSource })}
          </Text>
          <Text
            fontSize={titleFontSize}
            fontWeight="extrabold"
            color="white"
            textAlign="center"
            textShadow="0 0 10px rgba(255,255,255,0.5)"
          >
            {isLevelUp ? t('levelUpTitle') : title}
          </Text>
          {isLevelUp && <LevelUpAnimation />}
          <Box
            mt={2}
            bg={
              isLevelUp
                ? 'blue.500'
                : isMilestone && !milestoneName
                ? 'orange.500'
                : 'green.500'
            }
            px={4}
            py={1}
            borderRadius="full"
            boxShadow={
              isLevelUp
                ? '0 0 15px rgba(66, 153, 225, 0.7)'
                : isMilestone && !milestoneName
                ? '0 0 10px rgba(237, 137, 54, 0.5)'
                : '0 0 10px rgba(72, 187, 120, 0.5)'
            }
          >
            <Text fontSize={xpAwardedFontSize} fontWeight="bold" color="white">
              {t('xpAwarded', { xpAwarded })}
            </Text>
          </Box>
          {milestoneInfo && (
            <>
              <Divider my={2} />
              <Text
                fontSize={fontSize}
                fontWeight="semibold"
                color="purple.300"
              >
                {t('milestoneBonus', { milestoneName: milestoneInfo.name })}
              </Text>
              <Text
                fontSize={milestoneDescriptionFontSize}
                color="gray.400"
                textAlign="center"
              >
                {milestoneInfo.description}
              </Text>
              <Box
                mt={2}
                bg="purple.500"
                px={3}
                py={1}
                borderRadius="full"
                boxShadow="0 0 15px rgba(128, 90, 213, 0.7)"
              >
                <Text
                  fontSize={xpAwardedFontSize}
                  fontWeight="bold"
                  color="white"
                >
                  {t('milestoneXP', { xp: milestoneInfo.xpReward })}
                </Text>
              </Box>
            </>
          )}
          {isMilestone && !milestoneName && milestoneContent && (
            <>
              <Divider my={2} />
              <Text fontSize={fontSize} fontWeight="semibold" color="blue.300">
                {t('milestoneContent')}
              </Text>
              <Text
                fontSize={milestoneDescriptionFontSize}
                color="gray.400"
                textAlign="center"
              >
                {milestoneContent}
              </Text>
            </>
          )}
          {(isMilestone && milestoneName) || isLevelUp ? (
            <Box
              mt={3}
              bg="blue.600"
              px={5}
              py={2}
              borderRadius="full"
              boxShadow="0 0 20px rgba(66, 153, 225, 0.8)"
            >
              <Text fontSize={totalXPFontSize} fontWeight="black" color="white">
                {t('totalXP', { xp: totalXp })}
              </Text>
            </Box>
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
      milestoneDescriptionFontSize,
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
