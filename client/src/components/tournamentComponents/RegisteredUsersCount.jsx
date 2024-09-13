import React, { lazy, Suspense, useMemo } from 'react'
import {
  Box,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useColorModeValue,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import UserFriendsSVG from '../../assets/svg/UserFriendsSVG'

const MotionBox = motion(Box)

const RegisteredUsersCount = ({ count }) => {
  const { t } = useTranslation('RegisteredUsersCount') // Translation hook for this component

  // Memoizing background and border color to prevent unnecessary recalculations
  const bgColor = useColorModeValue(
    'rgba(255, 255, 255, 0.08)',
    'rgba(0, 0, 0, 0.3)',
  )
  const borderColor = useColorModeValue('pink.200', 'pink.700')

  // Memoizing the animation variants
  const animationVariants = useMemo(
    () => ({
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 },
    }),
    [],
  )

  return (
    <Suspense fallback={null}>
      <MotionBox
        initial="hidden"
        animate="visible"
        variants={animationVariants}
        transition={{ duration: 0.5 }}
      >
        <Box
          bg={bgColor}
          borderRadius="lg"
          p={6}
          borderWidth={2}
          borderColor={borderColor}
          boxShadow="xl"
        >
          <Stat>
            <StatLabel
              fontSize="lg"
              fontWeight="semibold"
              color="pink.300"
              display="flex"
              alignItems="center"
            >
              <UserFriendsSVG
                size={20}
                color="#ED64A6"
                style={{ marginRight: '0.5rem' }}
              />
              {t('label')}
            </StatLabel>
            <StatNumber fontSize="4xl" fontWeight="bold" color="white">
              {count}
            </StatNumber>
            <StatHelpText color="gray.400">{t('helpText')}</StatHelpText>
          </Stat>
        </Box>
      </MotionBox>
    </Suspense>
  )
}

export default React.memo(RegisteredUsersCount)
