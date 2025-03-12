import React, { memo } from 'react'
import { HStack, VStack, Text, Center } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'

const ScoreDisplay = ({
  userScore,
  opponentScore,
  userIsWinner,
  isTie,
  opponentName,
}) => {
  const { t } = useTranslation('QuickClash')

  return (
    <HStack
      spacing={1.5}
      bg={`rgba(20, 20, 35, 0.6)`}
      p={1.5}
      borderRadius="md"
      boxShadow="0 2px 8px rgba(0, 0, 0, 0.1)"
    >
      <VStack spacing={0} align="center">
        <Text color="whiteAlpha.600" fontSize="2xs">
          {t('You')}
        </Text>
        <Text
          fontWeight="bold"
          fontSize="sm"
          color={userIsWinner ? 'green.300' : 'whiteAlpha.900'}
          textShadow={userIsWinner ? '0 0 5px rgba(72, 187, 120, 0.5)' : 'none'}
        >
          {userScore}
        </Text>
      </VStack>

      <Center height="20px">
        <Text color="whiteAlpha.500" fontSize="md" mx={0.5}>
          :
        </Text>
      </Center>

      <VStack spacing={0} align="center">
        <Text color="whiteAlpha.600" fontSize="2xs">
          {opponentName}
        </Text>
        <Text
          fontWeight="bold"
          fontSize="sm"
          color={!userIsWinner && !isTie ? 'red.300' : 'whiteAlpha.900'}
          textShadow={
            !userIsWinner && !isTie
              ? '0 0 5px rgba(245, 101, 101, 0.5)'
              : 'none'
          }
        >
          {opponentScore}
        </Text>
      </VStack>
    </HStack>
  )
}

export default memo(ScoreDisplay)
