import React, { useMemo, useCallback, Suspense } from 'react'
import { VStack, Text, Box, Flex } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { keyframes } from '@emotion/react'

import CheckCircle from '../../assets/svg/CheckCircle'
import ExclamationCircle from '../../assets/svg/ExclamationCircle'
import TimesCircle from '../../assets/svg/TimesCircle'
import { useSelector } from 'react-redux'

// Lazy load the SVGs
const GlobeAmericas = React.lazy(() => import('../../assets/svg/GlobeAmericas'))
const Landmark = React.lazy(() => import('../../assets/svg/Landmark'))
const ChartLine = React.lazy(() => import('../../assets/svg/ChartLine'))
const MicroChip = React.lazy(() => import('../../assets/svg/MicroChip'))
const FootballBall = React.lazy(() => import('../../assets/svg/FootballBall'))
const RevivalSVG = React.lazy(() => import('../../assets/svg/RevivalSVG'))
const Flask = React.lazy(() => import('../../assets/svg/Flask'))
const Leaf = React.lazy(() => import('../../assets/svg/Leaf'))
const Gavel = React.lazy(() => import('../../assets/svg/Gavel'))
const GraduationCap = React.lazy(() => import('../../assets/svg/GraduationCap'))
const Film = React.lazy(() => import('../../assets/svg/Film'))
const Utensils = React.lazy(() => import('../../assets/svg/Utensils'))
const UserTie = React.lazy(() => import('../../assets/svg/UserTie'))
const Plane = React.lazy(() => import('../../assets/svg/Plane'))

const MotionBox = motion(Box)

// Map category to icons
const categoryIcons = {
  world: GlobeAmericas,
  politics: Landmark,
  business: ChartLine,
  technology: MicroChip,
  sports: FootballBall,
  health: RevivalSVG,
  science: Flask,
  environment: Leaf,
  crime: Gavel,
  education: GraduationCap,
  entertainment: Film,
  food: Utensils,
  lifestyle: UserTie,
  tourism: Plane,
}

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`

const CategoryCard = ({
  category,
  isSelected,
  onSelect,
  tournamentStatus,
  attemptsFromCategorySelection,
  isCompletedFromStats,
  userInGameName = null,
}) => {
  const { t } = useTranslation('CategoryCard')
  const inGameName = useSelector(state => state.auth?.user?.inGameName)
  const attempts = useSelector(
    state =>
      state.tournament.categoryAttempts[category] ||
      attemptsFromCategorySelection ||
      0,
  )
  const isCompleted = useSelector(state =>
    state.tournament.completedCategories.includes(category),
  )
  const score = useSelector(
    state => state.tournament.categoryScores[category] || 0,
  )

  const IconComponent = useMemo(
    () => categoryIcons[category] || GlobeAmericas,
    [category],
  )

  const handleSelect = useCallback(
    () => onSelect(category),
    [category, onSelect],
  )

  const attemptsLeft = 2 - attempts

  const badgeProps = useMemo(() => {
    if (isCompleted) {
      return {
        icon: CheckCircle,
        text: t('completed'),
        gradient: 'linear(to-r, green.400, green.600)',
        textColor: 'white',
      }
    }
    if (attemptsLeft === 2) {
      return {
        icon: CheckCircle,
        text: t('twoAttemptsLeft'),
        gradient: 'linear(to-r, blue.400, blue.600)',
        textColor: 'white',
      }
    }
    if (attemptsLeft === 1) {
      return {
        icon: ExclamationCircle,
        text: t('oneAttemptLeft'),
        gradient: 'linear(to-r, orange.400, orange.600)',
        textColor: 'white',
      }
    }
    return {
      icon: TimesCircle,
      text: t('noAttemptsLeft'),
      gradient: 'linear(to-r, red.400, red.600)',
      textColor: 'white',
    }
  }, [isCompleted, attemptsLeft, t])

  return (
    <MotionBox
      borderWidth="1px"
      borderRadius="lg"
      borderColor={
        isCompletedFromStats || isCompleted
          ? 'green.500'
          : isSelected
          ? 'pink.500'
          : 'gray.700'
      }
      bg={
        isCompletedFromStats || isCompleted
          ? 'rgba(72, 187, 120, 0.1)'
          : isSelected
          ? 'rgba(237, 100, 166, 0.1)'
          : 'gray.800'
      }
      p={4}
      cursor="pointer"
      onClick={handleSelect}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2 }}
      boxShadow={
        isCompletedFromStats || isCompleted
          ? '0 0 0 2px rgba(72, 187, 120, 0.6)'
          : isSelected
          ? '0 0 0 2px rgba(237, 100, 166, 0.6)'
          : 'none'
      }
      position="relative"
    >
      <VStack spacing={2}>
        <Suspense fallback={<Box size="32px" />}>
          <IconComponent
            size="32px"
            color={
              isCompletedFromStats || isCompleted
                ? '#68D391'
                : isSelected
                ? '#ED64A6'
                : '#A0AEC0'
            }
          />
        </Suspense>

        <Text
          fontWeight="bold"
          textAlign="center"
          fontSize="sm"
          color={
            isCompletedFromStats || isCompleted
              ? 'green.400'
              : isSelected
              ? 'pink.400'
              : 'gray.300'
          }
          textTransform="capitalize"
        >
          {t(category)}
        </Text>

        {attempts > 0 && !isCompleted && userInGameName === inGameName && (
          <Text fontSize="xs" color="gray.400">
            {t('bestScore')}: {score}
          </Text>
        )}
      </VStack>

      {tournamentStatus === 'ongoing' && (
        <Flex
          position="absolute"
          bottom="-12px"
          left="50%"
          transform="translateX(-50%)"
          justifyContent="center"
          width="120%"
        >
          <Flex
            bgGradient={badgeProps.gradient}
            color={badgeProps.textColor}
            px={3}
            py={1}
            borderRadius="full"
            fontSize="xs"
            fontWeight="bold"
            alignItems="center"
            boxShadow="0px 4px 10px rgba(0, 0, 0, 0.2)"
            animation={`${pulse} 2s infinite ease-in-out`}
          >
            <Box as={badgeProps.icon} mr={1} />
            {badgeProps.text}
          </Flex>
        </Flex>
      )}
    </MotionBox>
  )
}

export default CategoryCard
