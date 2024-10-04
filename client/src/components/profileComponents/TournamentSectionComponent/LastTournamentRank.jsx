import React from 'react'
import { Flex, Text, Circle } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import AwardSVG from '../../../assets/svg/AwardSVG'
import { keyframes } from '@emotion/react'

const pulseAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`

const LastTournamentRank = ({ rank }) => {
  const { t } = useTranslation('LastTournamentRank')

  return (
    <Flex
      align="center"
      justify="center"
      bg="rgba(128, 90, 213, 0.1)"
      borderRadius="full"
      p={2}
      boxShadow="0 0 10px rgba(128, 90, 213, 0.3)"
      border="1px solid"
      borderColor="purple.500"
      w={'fit-content'}
      px={6}
    >
      <Circle
        size="40px"
        bg="purple.600"
        mr={3}
        animation={`${pulseAnimation} 2s infinite`}
      >
        <AwardSVG size={20} fill="#F6E05E" />
      </Circle>
      <Text color="purple.100" fontSize="md" fontWeight="semibold" mr={2}>
        {t('lastTournamentRank')}
      </Text>
      <Text
        color="yellow.300"
        fontSize="2xl"
        fontWeight="bold"
        textShadow="1px 1px 2px rgba(0,0,0,0.3)"
      >
        {rank || t('notAvailable')}
      </Text>
    </Flex>
  )
}

export default LastTournamentRank
