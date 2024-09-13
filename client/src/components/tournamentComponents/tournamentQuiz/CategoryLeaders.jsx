// CategoryLeaders.js
import React, { Suspense, lazy } from 'react'
import { Box, VStack, Text } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'

const LeaderCard = lazy(() => import('./LeaderCard'))

const CategoryLeaders = ({ leaders }) => {
  const { t } = useTranslation('CategoryLeaders')
  return (
    <Box
      borderRadius="xl"
      p={6}
      mt={8}
      bg="rgba(0,0,0,0.6)"
      backdropFilter="blur(10px)"
      border="1px solid rgba(255,215,0,0.3)"
      boxShadow="0 0 20px rgba(255,215,0,0.2)"
    >
      <Text
        fontSize="2xl"
        fontWeight="bold"
        mb={6}
        color="rgba(255,223,0,0.9)"
        textAlign="center"
        textTransform="uppercase"
        letterSpacing="wide"
        textShadow="0 0 10px rgba(255,215,0,0.5)"
      >
        {t('Category Leaders')}
      </Text>
      <VStack spacing={4} align="stretch">
        <Suspense fallback={<div>{t('Loading...')}</div>}>
          {leaders.map((leader, index) => (
            <LeaderCard
              key={leader.inGameName}
              rank={index + 1}
              inGameName={leader.inGameName}
              score={leader.score}
            />
          ))}
        </Suspense>
      </VStack>
    </Box>
  )
}

export default CategoryLeaders
