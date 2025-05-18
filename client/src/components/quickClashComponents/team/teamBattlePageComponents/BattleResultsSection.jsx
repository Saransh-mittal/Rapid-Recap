// components/quickClashComponents/team/teamBattlePageComponents/BattleResultsSection.jsx
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
  VStack,
  useBreakpointValue,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  Trophy,
  Award,
  Star,
  TrendingUp,
  TrendingDown,
  Target,
} from 'lucide-react'

const MotionBox = motion(Box)
const MotionGrid = motion(Grid)

/**
 * Enhanced component to display battle results with better visual appeal
 */
const BattleResultsSection = ({ currentBattle, userTeam, variants }) => {
  const { t } = useTranslation('QuickClash')

  // Responsive values
  const padding = useBreakpointValue({ base: 4, md: 6 })
  const spacing = useBreakpointValue({ base: 3, md: 4 })
  const fontSize = useBreakpointValue({ base: 'md', md: 'lg' })

  if (currentBattle.status !== 'completed') return null

  // Determine winner and user's result
  const isUserWinner = currentBattle.winner === userTeam
  const isTie = currentBattle.winner === 'tie'
  const isUserDefeat = !isUserWinner && !isTie

  // Get result color scheme
  const getResultColor = () => {
    if (isUserWinner) return 'green'
    if (isTie) return 'yellow'
    return 'red'
  }

  const resultColor = getResultColor()

  return (
    <MotionBox
      variants={variants}
      mx={{ base: 4, md: 6 }}
      mb={8}
      bg="rgba(26, 32, 44, 0.6)"
      backdropFilter="blur(10px)"
      borderRadius="xl"
      p={padding}
      borderWidth="2px"
      borderColor={`${resultColor}.500`}
      position="relative"
      overflow="hidden"
    >
      {/* Animated background effect */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bgGradient={`linear(135deg, rgba(${
          resultColor === 'green'
            ? '72, 187, 120'
            : resultColor === 'red'
            ? '245, 101, 101'
            : '236, 201, 75'
        }, 0.05) 0%, transparent 50%, rgba(${
          resultColor === 'green'
            ? '72, 187, 120'
            : resultColor === 'red'
            ? '245, 101, 101'
            : '236, 201, 75'
        }, 0.05) 100%)`}
        opacity={0.8}
      />

      {/* Floating celebration particles */}
      {isUserWinner && (
        <>
          {[...Array(8)].map((_, i) => (
            <MotionBox
              key={i}
              position="absolute"
              fontSize="2xl"
              color="green.400"
              initial={{
                x: Math.random() * 100 + '%',
                y: '100%',
                rotate: 0,
              }}
              animate={{
                y: '-20%',
                rotate: 360,
                scale: [1, 1.2, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.3,
              }}
            >
              ⭐
            </MotionBox>
          ))}
        </>
      )}

      <VStack spacing={spacing} position="relative" zIndex={1}>
        {/* Header with result */}
        <Flex justify="center" align="center" mb={4}>
          <Badge
            colorScheme={resultColor}
            variant="solid"
            px={6}
            py={3}
            borderRadius="full"
            fontSize={fontSize}
            fontWeight="bold"
            animate={{
              scale: [1, 1.05, 1],
              boxShadow: [
                `0 0 20px rgba(${
                  resultColor === 'green'
                    ? '72, 187, 120'
                    : resultColor === 'red'
                    ? '245, 101, 101'
                    : '236, 201, 75'
                }, 0.4)`,
                `0 0 30px rgba(${
                  resultColor === 'green'
                    ? '72, 187, 120'
                    : resultColor === 'red'
                    ? '245, 101, 101'
                    : '236, 201, 75'
                }, 0.6)`,
                `0 0 20px rgba(${
                  resultColor === 'green'
                    ? '72, 187, 120'
                    : resultColor === 'red'
                    ? '245, 101, 101'
                    : '236, 201, 75'
                }, 0.4)`,
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          >
            <Icon
              as={isUserWinner ? Trophy : isTie ? Award : Target}
              boxSize={5}
              mr={2}
            />
            {isUserWinner ? t('Victory!') : isTie ? t('Draw!') : t('Defeat!')}
          </Badge>
        </Flex>

        <Heading size="lg" color="white" textAlign="center" mb={4}>
          {t('Battle Results')}
        </Heading>

        <MotionGrid
          templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }}
          gap={spacing}
          w="100%"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {/* Team A Results */}
          <GridItem>
            <MotionBox
              bg="rgba(66, 153, 225, 0.1)"
              p={4}
              borderRadius="lg"
              borderWidth="2px"
              borderColor="blue.500"
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <VStack spacing={3}>
                <Flex justify="space-between" align="center" w="100%">
                  <HStack>
                    <Badge colorScheme="blue" px={3} py={1} borderRadius="md">
                      {t('Team A')}
                    </Badge>
                    <Text
                      fontWeight="bold"
                      color="white"
                      fontSize="sm"
                      noOfLines={1}
                    >
                      {currentBattle.teamA?.name || t('Team A')}
                    </Text>
                  </HStack>
                  <Text fontWeight="black" color="blue.400" fontSize="2xl">
                    {currentBattle.teamATotalScore} {t('pts')}
                  </Text>
                </Flex>

                <VStack spacing={2} w="100%">
                  <HStack justify="space-between" w="100%" fontSize="sm">
                    <HStack>
                      <Icon as={Trophy} color="blue.400" boxSize={4} />
                      <Text color="whiteAlpha.700">{t('Wins')}</Text>
                    </HStack>
                    <Badge colorScheme="green">{currentBattle.teamAWins}</Badge>
                  </HStack>

                  <HStack justify="space-between" w="100%" fontSize="sm">
                    <HStack>
                      <Icon as={Target} color="blue.400" boxSize={4} />
                      <Text color="whiteAlpha.700">{t('Challenges')}</Text>
                    </HStack>
                    <Badge colorScheme="blue">
                      {
                        currentBattle.challenges.filter(c => c.teamACompleted)
                          .length
                      }
                      /{currentBattle.challenges.length}
                    </Badge>
                  </HStack>

                  {/* Trophy change */}
                  {currentBattle.trophyExchange && (
                    <HStack justify="space-between" w="100%" fontSize="sm">
                      <HStack>
                        <Icon as={Star} color="yellow.400" boxSize={4} />
                        <Text color="whiteAlpha.700">{t('Trophies')}</Text>
                      </HStack>
                      <HStack>
                        <Icon
                          as={
                            currentBattle.winner === 'teamA'
                              ? TrendingUp
                              : TrendingDown
                          }
                          color={
                            currentBattle.winner === 'teamA'
                              ? 'green.400'
                              : 'red.400'
                          }
                          boxSize={4}
                        />
                        <Text
                          color={
                            currentBattle.winner === 'teamA'
                              ? 'green.400'
                              : currentBattle.winner === 'tie'
                              ? 'yellow.400'
                              : 'red.400'
                          }
                          fontWeight="bold"
                        >
                          {currentBattle.winner === 'teamA'
                            ? `+${Math.round(
                                (currentBattle.trophyExchange.finalAmount *
                                  1.25) /
                                  4,
                              )}`
                            : currentBattle.winner === 'tie'
                            ? `+${Math.round(
                                currentBattle.trophyExchange.finalAmount * 0.1,
                              )}`
                            : `-${Math.round(
                                (currentBattle.trophyExchange.finalAmount *
                                  0.75) /
                                  4,
                              )}`}
                        </Text>
                      </HStack>
                    </HStack>
                  )}
                </VStack>
              </VStack>
            </MotionBox>
          </GridItem>

          {/* Battle Summary */}
          <GridItem>
            <MotionBox
              bg="rgba(26, 32, 44, 0.5)"
              p={4}
              borderRadius="lg"
              borderWidth="2px"
              borderColor="whiteAlpha.300"
              textAlign="center"
              height="100%"
              display="flex"
              flexDirection="column"
              justifyContent="center"
              alignItems="center"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <VStack spacing={4}>
                <Badge
                  colorScheme={
                    currentBattle.winner === 'teamA'
                      ? 'blue'
                      : currentBattle.winner === 'teamB'
                      ? 'red'
                      : 'yellow'
                  }
                  p={3}
                  borderRadius="lg"
                  fontSize="lg"
                  fontWeight="bold"
                >
                  {currentBattle.winner === 'teamA'
                    ? `${currentBattle.teamA?.name || 'Team A'} ${t('Wins')}`
                    : currentBattle.winner === 'teamB'
                    ? `${currentBattle.teamB?.name || 'Team B'} ${t('Wins')}`
                    : t('Draw!')}
                </Badge>

                <HStack spacing={6} justify="center">
                  <VStack spacing={1}>
                    <Text fontSize="3xl" fontWeight="black" color="blue.400">
                      {currentBattle.teamAWins}
                    </Text>
                    <Text fontSize="sm" color="whiteAlpha.700">
                      {t('Team A')}
                    </Text>
                  </VStack>
                  <Text fontSize="2xl" color="whiteAlpha.500">
                    :
                  </Text>
                  <VStack spacing={1}>
                    <Text fontSize="3xl" fontWeight="black" color="red.400">
                      {currentBattle.teamBWins}
                    </Text>
                    <Text fontSize="sm" color="whiteAlpha.700">
                      {t('Team B')}
                    </Text>
                  </VStack>
                </HStack>

                <HStack spacing={3} justify="center" opacity={0.8}>
                  <Text fontSize="md" color="blue.400">
                    {currentBattle.teamATotalScore} pts
                  </Text>
                  <Text fontSize="sm" color="whiteAlpha.700">
                    •
                  </Text>
                  <Text fontSize="md" color="red.400">
                    {currentBattle.teamBTotalScore} pts
                  </Text>
                </HStack>

                {/* Tie criteria */}
                {currentBattle.teamAWins === currentBattle.teamBWins && (
                  <Text fontSize="xs" color="whiteAlpha.600" px={2}>
                    {t('Tiebreaker: Total points')}
                  </Text>
                )}
              </VStack>
            </MotionBox>
          </GridItem>

          {/* Team B Results */}
          <GridItem>
            <MotionBox
              bg="rgba(245, 101, 101, 0.1)"
              p={4}
              borderRadius="lg"
              borderWidth="2px"
              borderColor="red.500"
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <VStack spacing={3}>
                <Flex justify="space-between" align="center" w="100%">
                  <HStack>
                    <Badge colorScheme="red" px={3} py={1} borderRadius="md">
                      {t('Team B')}
                    </Badge>
                    <Text
                      fontWeight="bold"
                      color="white"
                      fontSize="sm"
                      noOfLines={1}
                    >
                      {currentBattle.teamB?.name || t('Team B')}
                    </Text>
                  </HStack>
                  <Text fontWeight="black" color="red.400" fontSize="2xl">
                    {currentBattle.teamBTotalScore} {t('pts')}
                  </Text>
                </Flex>

                <VStack spacing={2} w="100%">
                  <HStack justify="space-between" w="100%" fontSize="sm">
                    <HStack>
                      <Icon as={Trophy} color="red.400" boxSize={4} />
                      <Text color="whiteAlpha.700">{t('Wins')}</Text>
                    </HStack>
                    <Badge colorScheme="green">{currentBattle.teamBWins}</Badge>
                  </HStack>

                  <HStack justify="space-between" w="100%" fontSize="sm">
                    <HStack>
                      <Icon as={Target} color="red.400" boxSize={4} />
                      <Text color="whiteAlpha.700">{t('Challenges')}</Text>
                    </HStack>
                    <Badge colorScheme="blue">
                      {
                        currentBattle.challenges.filter(c => c.teamBCompleted)
                          .length
                      }
                      /{currentBattle.challenges.length}
                    </Badge>
                  </HStack>

                  {/* Trophy change */}
                  {currentBattle.trophyExchange && (
                    <HStack justify="space-between" w="100%" fontSize="sm">
                      <HStack>
                        <Icon as={Star} color="yellow.400" boxSize={4} />
                        <Text color="whiteAlpha.700">{t('Trophies')}</Text>
                      </HStack>
                      <HStack>
                        <Icon
                          as={
                            currentBattle.winner === 'teamB'
                              ? TrendingUp
                              : TrendingDown
                          }
                          color={
                            currentBattle.winner === 'teamB'
                              ? 'green.400'
                              : 'red.400'
                          }
                          boxSize={4}
                        />
                        <Text
                          color={
                            currentBattle.winner === 'teamB'
                              ? 'green.400'
                              : currentBattle.winner === 'tie'
                              ? 'yellow.400'
                              : 'red.400'
                          }
                          fontWeight="bold"
                        >
                          {currentBattle.winner === 'teamB'
                            ? `+${Math.round(
                                (currentBattle.trophyExchange.finalAmount *
                                  1.25) /
                                  4,
                              )}`
                            : currentBattle.winner === 'tie'
                            ? `+${Math.round(
                                currentBattle.trophyExchange.finalAmount * 0.1,
                              )}`
                            : `-${Math.round(
                                (currentBattle.trophyExchange.finalAmount *
                                  0.75) /
                                  4,
                              )}`}
                        </Text>
                      </HStack>
                    </HStack>
                  )}
                </VStack>
              </VStack>
            </MotionBox>
          </GridItem>
        </MotionGrid>

        {/* Trophy bonuses section */}
        {currentBattle.trophyExchange && (
          <EnhancedTrophyBonuses
            trophyExchange={currentBattle.trophyExchange}
          />
        )}
      </VStack>
    </MotionBox>
  )
}

// Enhanced Trophy Bonuses component
const EnhancedTrophyBonuses = ({ trophyExchange }) => {
  const { t } = useTranslation('QuickClash')

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
    <MotionBox
      mt={6}
      p={4}
      borderRadius="lg"
      bg="rgba(255, 215, 0, 0.1)"
      borderWidth="2px"
      borderColor="yellow.500"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1 }}
    >
      <VStack spacing={3}>
        <Text fontWeight="bold" color="yellow.400" fontSize="lg">
          {t('Trophy Bonuses')}
        </Text>

        <Grid
          templateColumns={{
            base: '1fr',
            md: 'repeat(2, 1fr)',
            lg: 'repeat(4, 1fr)',
          }}
          gap={3}
          w="100%"
        >
          {trophyExchange.bonuses.firstDaily.applied && (
            <MotionBox
              bg="rgba(0, 0, 0, 0.3)"
              p={3}
              borderRadius="md"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <HStack spacing={2}>
                <Icon as={Star} color="yellow.400" boxSize={5} />
                <VStack align="flex-start" spacing={0}>
                  <Text color="white" fontSize="sm" fontWeight="bold">
                    {t('First Daily Battle')}
                  </Text>
                  <Text color="yellow.400" fontSize="xs">
                    +{trophyExchange.bonuses.firstDaily.amount}
                  </Text>
                </VStack>
              </HStack>
            </MotionBox>
          )}

          {trophyExchange.bonuses.strongerTeam.applied && (
            <MotionBox
              bg="rgba(0, 0, 0, 0.3)"
              p={3}
              borderRadius="md"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <HStack spacing={2}>
                <Icon as={TrendingUp} color="yellow.400" boxSize={5} />
                <VStack align="flex-start" spacing={0}>
                  <Text color="white" fontSize="sm" fontWeight="bold">
                    {t('vs Stronger Team')}
                  </Text>
                  <Text color="yellow.400" fontSize="xs">
                    +{trophyExchange.bonuses.strongerTeam.amount}
                  </Text>
                </VStack>
              </HStack>
            </MotionBox>
          )}

          {trophyExchange.bonuses.comebackWin.applied && (
            <MotionBox
              bg="rgba(0, 0, 0, 0.3)"
              p={3}
              borderRadius="md"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <HStack spacing={2}>
                <Icon as={Award} color="yellow.400" boxSize={5} />
                <VStack align="flex-start" spacing={0}>
                  <Text color="white" fontSize="sm" fontWeight="bold">
                    {t('Comeback Win')}
                  </Text>
                  <Text color="yellow.400" fontSize="xs">
                    +{trophyExchange.bonuses.comebackWin.amount}
                  </Text>
                </VStack>
              </HStack>
            </MotionBox>
          )}

          {trophyExchange.bonuses.allWins.applied && (
            <MotionBox
              bg="rgba(0, 0, 0, 0.3)"
              p={3}
              borderRadius="md"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <HStack spacing={2}>
                <Icon as={Trophy} color="yellow.400" boxSize={5} />
                <VStack align="flex-start" spacing={0}>
                  <Text color="white" fontSize="sm" fontWeight="bold">
                    {t('All Categories Won')}
                  </Text>
                  <Text color="yellow.400" fontSize="xs">
                    +{trophyExchange.bonuses.allWins.amount}
                  </Text>
                </VStack>
              </HStack>
            </MotionBox>
          )}
        </Grid>
      </VStack>
    </MotionBox>
  )
}

export default BattleResultsSection
