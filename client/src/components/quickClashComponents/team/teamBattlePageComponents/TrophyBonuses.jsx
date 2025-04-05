// components/quickClashComponents/team/TrophyBonuses.jsx
import React from 'react'
import { Box, Text, Grid, HStack, Icon } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { Calendar, Shield, Zap, Trophy } from 'lucide-react'

/**
 * Component to display trophy bonuses
 */
const TrophyBonuses = ({ trophyExchange }) => {
  const { t } = useTranslation('QuickClash')

  // If no bonuses, don't render
  if (
    !trophyExchange ||
    !(
      trophyExchange.bonuses.firstDaily.applied ||
      trophyExchange.bonuses.strongerTeam.applied ||
      trophyExchange.bonuses.comebackWin.applied ||
      trophyExchange.bonuses.allWins.applied
    )
  ) {
    return null
  }

  return (
    <Box
      mt={4}
      p={3}
      borderRadius="md"
      bg="rgba(255, 215, 0, 0.1)"
      borderWidth="1px"
      borderColor="yellow.500"
    >
      <Text fontWeight="bold" color="yellow.400" mb={2}>
        {t('Trophy Bonuses')}
      </Text>

      <Grid
        templateColumns={{
          base: '1fr',
          md: 'repeat(2, 1fr)',
          lg: 'repeat(4, 1fr)',
        }}
        gap={3}
      >
        {trophyExchange.bonuses.firstDaily.applied && (
          <HStack bg="rgba(0, 0, 0, 0.2)" p={2} borderRadius="md">
            <Icon as={Calendar} color="yellow.400" boxSize={4} />
            <Text color="white" fontSize="sm">
              {t('First Daily Battle')}: +
              {trophyExchange.bonuses.firstDaily.amount}
            </Text>
          </HStack>
        )}

        {trophyExchange.bonuses.strongerTeam.applied && (
          <HStack bg="rgba(0, 0, 0, 0.2)" p={2} borderRadius="md">
            <Icon as={Shield} color="yellow.400" boxSize={4} />
            <Text color="white" fontSize="sm">
              {t('vs Stronger Team')}: +
              {trophyExchange.bonuses.strongerTeam.amount}
            </Text>
          </HStack>
        )}

        {trophyExchange.bonuses.comebackWin.applied && (
          <HStack bg="rgba(0, 0, 0, 0.2)" p={2} borderRadius="md">
            <Icon as={Zap} color="yellow.400" boxSize={4} />
            <Text color="white" fontSize="sm">
              {t('Comeback Win')}: +{trophyExchange.bonuses.comebackWin.amount}
            </Text>
          </HStack>
        )}

        {trophyExchange.bonuses.allWins.applied && (
          <HStack bg="rgba(0, 0, 0, 0.2)" p={2} borderRadius="md">
            <Icon as={Trophy} color="yellow.400" boxSize={4} />
            <Text color="white" fontSize="sm">
              {t('All Categories Won')}: +
              {trophyExchange.bonuses.allWins.amount}
            </Text>
          </HStack>
        )}
      </Grid>
    </Box>
  )
}

export default TrophyBonuses
