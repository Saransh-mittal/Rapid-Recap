// components/quickClashComponents/leaderboard/components/LoadingState.jsx
import React from 'react'
import { Center, VStack, Spinner, Text } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

const MotionBox = motion.div

const LoadingState = () => {
  const { t } = useTranslation('QuickClash')

  return (
    <Center py={12} h="50vh">
      <VStack spacing={3}>
        <MotionBox
          animate={{
            rotate: [0, 360],
            transition: {
              duration: 1.5,
              repeat: Infinity,
              ease: 'linear',
            },
          }}
        >
          <Spinner
            size="md"
            color="purple.500"
            thickness="3px"
            speed="0.75s"
            emptyColor="rgba(255, 255, 255, 0.1)"
          />
        </MotionBox>
        <Text color="whiteAlpha.700" fontSize="sm">
          {t('Loading leaderboard...')}
        </Text>
      </VStack>
    </Center>
  )
}

export default React.memo(LoadingState)
