// components/HallOfChampions/TournamentCard.jsx
import React from 'react'
import {
  Grid,
  GridItem,
  Text,
  Avatar,
  HStack,
  VStack,
  Box,
  Flex,
  Badge,
  useColorModeValue,
  Wrap,
  WrapItem,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { Trophy, Award, Star } from 'lucide-react'

const MotionFlex = motion(Flex)

const TournamentCard = ({ data, index, isMobile }) => {
  const textColor = useColorModeValue('gray.100', 'gray.200')
  const accentColor = 'pink.400'
  const rankColors = {
    0: 'linear-gradient(135deg, #FFD700, #FFA500)', // Gold
    1: 'linear-gradient(135deg, #C0C0C0, #A9A9A9)', // Silver
    2: 'linear-gradient(135deg, #CD7F32, #8B4513)', // Bronze
  }

  const isTopThree = index < 3
  const bgGradient = isTopThree
    ? rankColors[index]
    : 'linear-gradient(135deg, rgba(28, 20, 56, 0.4), rgba(35, 25, 70, 0.4))'

  // Rank icon based on position
  const RankIcon = () => {
    if (index === 0) return <Trophy size={24} />
    if (index === 1) return <Award size={24} />
    if (index === 2) return <Star size={24} />
    return null
  }

  return (
    <MotionFlex
      w="100%"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Grid
        templateColumns={isMobile ? '1fr' : 'auto 1fr auto'}
        gap={4}
        w="100%"
        p={4}
        borderRadius="xl"
        bgGradient={bgGradient}
        borderWidth="1px"
        borderColor="whiteAlpha.200"
        _hover={{
          transform: 'translateY(-2px)',
          borderColor: 'whiteAlpha.300',
        }}
        transition="all 0.2s"
      >
        {/* Rank and Avatar Section */}
        <GridItem>
          <HStack spacing={4}>
            <Flex
              w="40px"
              h="40px"
              align="center"
              justify="center"
              borderRadius="full"
              bgGradient={isTopThree ? rankColors[index] : 'none'}
              border={!isTopThree ? '2px solid' : 'none'}
              borderColor="whiteAlpha.300"
            >
              {isTopThree ? (
                <RankIcon />
              ) : (
                <Text fontSize="lg" fontWeight="bold" color={textColor}>
                  #{index + 1}
                </Text>
              )}
            </Flex>
            <Avatar
              size="lg"
              name={data.name}
              src={data.avatar}
              borderWidth={2}
              borderColor={isTopThree ? 'white' : 'whiteAlpha.300'}
            />
          </HStack>
        </GridItem>

        {/* Tournament Stats Section */}
        <GridItem>
          <VStack align="start" spacing={2}>
            <Box>
              <Text fontSize="xl" fontWeight="bold" color={textColor}>
                {data.name}
              </Text>
              <Text fontSize="md" color={accentColor}>
                {data.username}
              </Text>
            </Box>

            {/* Tournament Performance Stats */}
            <Grid
              templateColumns={isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)'}
              gap={4}
              w="100%"
              mt={2}
            >
              <StatItem
                label="Total Score"
                value={data.totalScore}
                isHighlight={true}
              />
              <StatItem
                label="Best Category"
                value={`${data.bestCategory.name} (${data.bestCategory.score})`}
              />
              <StatItem
                label="Categories Played"
                value={data.categoriesPlayed.length}
              />
            </Grid>

            {/* Category Pills */}
            <Wrap spacing={2} mt={2}>
              {data.categoriesPlayed.map((category, idx) => (
                <WrapItem key={idx}>
                  <Badge
                    px={2}
                    py={1}
                    borderRadius="full"
                    colorScheme="purple"
                    fontSize="xs"
                  >
                    {category}
                  </Badge>
                </WrapItem>
              ))}
            </Wrap>
          </VStack>
        </GridItem>

        {/* Badges Section */}
        {!isMobile && (
          <GridItem>
            <VStack spacing={2}>
              {data.badges.map((badge, idx) => (
                <TournamentBadge key={idx} badge={badge} />
              ))}
            </VStack>
          </GridItem>
        )}

        {/* Mobile Badges */}
        {isMobile && data.badges.length > 0 && (
          <Box mt={4}>
            <Wrap spacing={2}>
              {data.badges.map((badge, idx) => (
                <WrapItem key={idx}>
                  <TournamentBadge badge={badge} isMobile={true} />
                </WrapItem>
              ))}
            </Wrap>
          </Box>
        )}
      </Grid>
    </MotionFlex>
  )
}

const StatItem = ({ label, value, isHighlight }) => (
  <Box>
    <Text fontSize="sm" color="whiteAlpha.700">
      {label}
    </Text>
    <Text
      fontSize="lg"
      fontWeight="bold"
      color={isHighlight ? 'pink.400' : 'white'}
    >
      {value}
    </Text>
  </Box>
)

const TournamentBadge = ({ badge, isMobile }) => (
  <Flex
    direction="column"
    align="center"
    justify="center"
    bg="whiteAlpha.100"
    p={isMobile ? 2 : 3}
    borderRadius="lg"
    minW={isMobile ? 'auto' : '120px'}
  >
    <Text fontSize={isMobile ? 'xs' : 'sm'} fontWeight="bold" color="white">
      {badge.type}
    </Text>
    {!isMobile && (
      <Text fontSize="xs" color="whiteAlpha.700" textAlign="center">
        {badge.category}
      </Text>
    )}
  </Flex>
)

export default TournamentCard
