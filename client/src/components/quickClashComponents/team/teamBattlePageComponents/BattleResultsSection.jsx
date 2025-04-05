// components/quickClashComponents/team/BattleResultsSection.jsx
import React from 'react'
import {
  Box,
  Heading,
  Grid,
  GridItem,
  Flex,
  HStack,
  Text,
  Badge,
  Icon,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Trophy } from 'lucide-react'

import TrophyBonuses from './TrophyBonuses'

const MotionBox = motion(Box)

/**
 * Component to display battle results
 */
const BattleResultsSection = ({ currentBattle, userTeam, variants }) => {
  const { t } = useTranslation('QuickClash')

  if (currentBattle.status !== 'completed') return null

  return (
    <MotionBox
      variants={variants}
      bg="rgba(26, 32, 44, 0.8)"
      borderRadius="lg"
      p={4}
      borderWidth="1px"
      borderColor={
        currentBattle.winner === userTeam
          ? 'green.500'
          : currentBattle.winner === 'tie'
          ? 'yellow.500'
          : 'red.500'
      }
    >
      <Heading size="md" color="white" mb={4}>
        {t('Battle Results')}
      </Heading>

      <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4}>
        {/* Team A */}
        <GridItem>
          <Box
            bg="rgba(66, 153, 225, 0.1)"
            p={3}
            borderRadius="md"
            borderWidth="1px"
            borderColor="blue.500"
          >
            <Flex justify="space-between" align="center" mb={2}>
              <HStack>
                <Badge colorScheme="blue" p={1} borderRadius="md">
                  {t('Team A')}
                </Badge>
                <Text fontWeight="bold" color="white" fontSize="sm">
                  {currentBattle.teamA?.name || t('Team A')}
                </Text>
              </HStack>
              <Text fontWeight="bold" color="blue.400">
                {currentBattle.teamATotalScore} {t('pts')}
              </Text>
            </Flex>

            <HStack justify="space-between" fontSize="sm">
              <Text color="whiteAlpha.700">{t('Wins')}</Text>
              <Badge colorScheme="green">{currentBattle.teamAWins}</Badge>
            </HStack>

            <HStack justify="space-between" fontSize="sm" mt={1}>
              <Text color="whiteAlpha.700">{t('Challenges')}</Text>
              <Badge colorScheme="blue">
                {currentBattle.challenges.filter(c => c.teamACompleted).length}/
                {currentBattle.challenges.length}
              </Badge>
            </HStack>

            {/* Trophy info */}
            {currentBattle.trophyExchange && (
              <HStack justify="space-between" fontSize="sm" mt={2}>
                <Text color="whiteAlpha.700">{t('Trophies')}</Text>
                <HStack>
                  <Icon as={Trophy} color="yellow.400" boxSize={3} />
                  <Text
                    color={
                      currentBattle.winner === 'teamA'
                        ? 'green.400'
                        : currentBattle.winner === 'tie'
                        ? 'yellow.400'
                        : 'red.400'
                    }
                  >
                    {currentBattle.winner === 'teamA'
                      ? `+${Math.round(
                          (currentBattle.trophyExchange.finalAmount * 1.25) / 4,
                        )}`
                      : currentBattle.winner === 'tie'
                      ? `+${Math.round(
                          currentBattle.trophyExchange.finalAmount * 0.1,
                        )}`
                      : `-${Math.round(
                          (currentBattle.trophyExchange.finalAmount * 0.75) / 4,
                        )}`}
                  </Text>
                </HStack>
              </HStack>
            )}
          </Box>
        </GridItem>

        {/* Result */}
        <GridItem>
          <Box
            bg="rgba(26, 32, 44, 0.5)"
            p={3}
            borderRadius="md"
            borderWidth="1px"
            borderColor="whiteAlpha.300"
            textAlign="center"
            height="100%"
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
          >
            <Badge
              colorScheme={
                currentBattle.winner === 'teamA'
                  ? 'blue'
                  : currentBattle.winner === 'teamB'
                  ? 'red'
                  : 'yellow'
              }
              p={2}
              borderRadius="md"
              mb={3}
            >
              {currentBattle.winner === 'teamA'
                ? t('Team A Wins')
                : currentBattle.winner === 'teamB'
                ? t('Team B Wins')
                : t('Tie')}
            </Badge>

            <HStack spacing={3} justify="center">
              <Text fontSize="2xl" fontWeight="bold" color="blue.400">
                {currentBattle.teamAWins}
              </Text>
              <Text fontSize="xl" color="whiteAlpha.700">
                :
              </Text>
              <Text fontSize="2xl" fontWeight="bold" color="red.400">
                {currentBattle.teamBWins}
              </Text>
            </HStack>

            <HStack spacing={3} justify="center" mt={2}>
              <Text fontSize="md" color="blue.400">
                {currentBattle.teamATotalScore} pts
              </Text>
              <Text fontSize="sm" color="whiteAlpha.700">
                /
              </Text>
              <Text fontSize="md" color="red.400">
                {currentBattle.teamBTotalScore} pts
              </Text>
            </HStack>

            {/* Tie criteria */}
            {currentBattle.teamAWins === currentBattle.teamBWins && (
              <Text fontSize="xs" color="whiteAlpha.600" mt={2} px={2}>
                {t('Tiebreaker: Total points')}
              </Text>
            )}
          </Box>
        </GridItem>

        {/* Team B */}
        <GridItem>
          <Box
            bg="rgba(245, 101, 101, 0.1)"
            p={3}
            borderRadius="md"
            borderWidth="1px"
            borderColor="red.500"
          >
            <Flex justify="space-between" align="center" mb={2}>
              <HStack>
                <Badge colorScheme="red" p={1} borderRadius="md">
                  {t('Team B')}
                </Badge>
                <Text fontWeight="bold" color="white" fontSize="sm">
                  {currentBattle.teamB?.name || t('Team B')}
                </Text>
              </HStack>
              <Text fontWeight="bold" color="red.400">
                {currentBattle.teamBTotalScore} {t('pts')}
              </Text>
            </Flex>

            <HStack justify="space-between" fontSize="sm">
              <Text color="whiteAlpha.700">{t('Wins')}</Text>
              <Badge colorScheme="green">{currentBattle.teamBWins}</Badge>
            </HStack>

            <HStack justify="space-between" fontSize="sm" mt={1}>
              <Text color="whiteAlpha.700">{t('Challenges')}</Text>
              <Badge colorScheme="blue">
                {currentBattle.challenges.filter(c => c.teamBCompleted).length}/
                {currentBattle.challenges.length}
              </Badge>
            </HStack>

            {/* Trophy info */}
            {currentBattle.trophyExchange && (
              <HStack justify="space-between" fontSize="sm" mt={2}>
                <Text color="whiteAlpha.700">{t('Trophies')}</Text>
                <HStack>
                  <Icon as={Trophy} color="yellow.400" boxSize={3} />
                  <Text
                    color={
                      currentBattle.winner === 'teamB'
                        ? 'green.400'
                        : currentBattle.winner === 'tie'
                        ? 'yellow.400'
                        : 'red.400'
                    }
                  >
                    {currentBattle.winner === 'teamB'
                      ? `+${Math.round(
                          (currentBattle.trophyExchange.finalAmount * 1.25) / 4,
                        )}`
                      : currentBattle.winner === 'tie'
                      ? `+${Math.round(
                          currentBattle.trophyExchange.finalAmount * 0.1,
                        )}`
                      : `-${Math.round(
                          (currentBattle.trophyExchange.finalAmount * 0.75) / 4,
                        )}`}
                  </Text>
                </HStack>
              </HStack>
            )}
          </Box>
        </GridItem>
      </Grid>

      {/* Trophy bonuses */}
      <TrophyBonuses trophyExchange={currentBattle.trophyExchange} />
    </MotionBox>
  )
}

export default BattleResultsSection
