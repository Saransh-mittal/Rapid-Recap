import React from 'react'
import { HStack, Text, Box } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'

const TimeUnit = ({ value, unit, color = 'whiteAlpha.800' }) => (
  <Box
    textAlign="center"
    display={'flex'}
    gap={1}
    justifyContent={'center'}
    alignItems={'center'}
  >
    <Text fontSize={{ base: 'md', md: 'lg' }} fontWeight="bold" color={color}>
      {value.toString().padStart(2, '0')}
    </Text>
    <Text fontSize={{ base: 'xs', md: 'sm' }} color={color} opacity={0.8}>
      {unit}
    </Text>
  </Box>
)

const CountdownDisplay = ({ countdown, color }) => {
  const { t } = useTranslation('GetStarted')
  const { days, hours, minutes, seconds } = countdown

  return (
    <HStack spacing={4}>
      <TimeUnit
        value={days}
        unit={t('Tournament.countdown.days')}
        color={color}
      />
      <Text color={color}>:</Text>
      <TimeUnit
        value={hours}
        unit={t('Tournament.countdown.hours')}
        color={color}
      />
      <Text color={color}>:</Text>
      <TimeUnit
        value={minutes}
        unit={t('Tournament.countdown.minutes')}
        color={color}
      />
      <Text color={color}>:</Text>
      <TimeUnit
        value={seconds}
        unit={t('Tournament.countdown.seconds')}
        color={color}
      />
    </HStack>
  )
}

export default CountdownDisplay
