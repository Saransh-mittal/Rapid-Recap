import React, { useEffect, useState } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Box,
  Flex,
  Text,
  VStack,
  HStack,
  Badge,
  Divider,
  useColorModeValue,
  Stack,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Grid,
  GridItem,
  Circle,
  Tooltip,
} from '@chakra-ui/react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Area,
} from 'recharts'
import {
  Brain,
  Zap,
  Star,
  Target,
  Users,
  Trophy,
  Award,
  TrendingUp,
  CheckSquare,
  CircleDot,
  Crown,
  Sparkles,
} from 'lucide-react'
import { keyframes } from '@emotion/react'
import { useTranslation } from 'react-i18next'

// Animation keyframes
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`

const slideIn = keyframes`
  from { transform: translateX(-30px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`

const scaleIn = keyframes`
  from { transform: scale(0.9); }
  to { transform: scale(1); }
`

const glowPulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(236, 72, 153, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(236, 72, 153, 0); }
  100% { box-shadow: 0 0 0 0 rgba(236, 72, 153, 0); }
`

// Enhanced IQ Journey Component with Graph
const IQJourneyGraph = ({ start, current, peak }) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 500)
    return () => clearTimeout(timer)
  }, [])

  const generateData = () => {
    return [
      { name: 'Start', value: start },
      { name: 'Peak', value: peak },
      { name: 'Current', value: current },
    ]
  }

  return (
    <Box
      w="full"
      p={6}
      borderRadius="2xl"
      bg="rgba(255, 255, 255, 0.03)"
      backdropFilter="blur(10px)"
      border="1px solid"
      borderColor="whiteAlpha.100"
      position="relative"
      overflow="hidden"
      transition="all 0.3s"
      _hover={{
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
      }}
      style={{
        animation: `${fadeIn} 0.6s ease-out forwards`,
      }}
    >
      <VStack spacing={6}>
        <Text
          color="white"
          fontSize="xl"
          fontWeight="semibold"
          style={{
            animation: `${slideIn} 0.4s ease-out forwards`,
          }}
        >
          IQ Journey
        </Text>

        <Box
          w="full"
          h="300px"
          opacity={isVisible ? 1 : 0}
          transform={isVisible ? 'scale(1)' : 'scale(0.95)'}
          transition="all 0.6s cubic-bezier(0.4, 0, 0.2, 1)"
        >
          <ResponsiveContainer>
            <LineChart
              data={generateData()}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EC4899" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#EC4899" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.1)"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                stroke="rgba(255,255,255,0.6)"
                tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
                tickLine={{ stroke: 'rgba(255,255,255,0.2)' }}
              />
              <YAxis
                stroke="rgba(255,255,255,0.6)"
                tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
                tickLine={{ stroke: 'rgba(255,255,255,0.2)' }}
              />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: 'rgba(13, 16, 31, 0.95)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  padding: '8px 12px',
                }}
                labelStyle={{ color: 'rgba(255,255,255,0.8)' }}
                itemStyle={{ color: '#EC4899' }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="none"
                fill="url(#colorGradient)"
                fillOpacity={0.2}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#EC4899"
                strokeWidth={3}
                dot={{
                  r: 6,
                  fill: '#EC4899',
                  stroke: 'white',
                  strokeWidth: 2,
                }}
                activeDot={{
                  r: 8,
                  fill: '#EC4899',
                  stroke: 'white',
                  strokeWidth: 2,
                  style: {
                    animation: `${glowPulse} 2s infinite`,
                  },
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>

        {/* IQ Stats Summary */}
        <Grid
          templateColumns="repeat(3, 1fr)"
          gap={4}
          w="full"
          opacity={isVisible ? 1 : 0}
          transform={isVisible ? 'translateY(0)' : 'translateY(20px)'}
          transition="all 0.6s cubic-bezier(0.4, 0, 0.2, 1)"
        >
          {[
            { label: 'Starting IQ', value: start, color: 'blue.400' },
            { label: 'Current IQ', value: current, color: 'pink.400' },
            { label: 'Peak IQ', value: peak, color: 'purple.400' },
          ].map((stat, index) => (
            <Box
              key={index}
              p={4}
              borderRadius="xl"
              bg="rgba(255, 255, 255, 0.05)"
              border="1px solid"
              borderColor={stat.color}
              transition="all 0.3s"
              _hover={{
                transform: 'translateY(-2px)',
                boxShadow: `0 0 20px ${stat.color}33`,
              }}
              style={{
                animation: `${fadeIn} 0.6s ease-out ${index * 0.2}s forwards`,
              }}
            >
              <VStack spacing={2}>
                <Text
                  color={stat.color}
                  fontSize="2xl"
                  fontWeight="bold"
                  style={{
                    animation: `${scaleIn} 0.4s ease-out ${
                      index * 0.2 + 0.2
                    }s forwards`,
                  }}
                >
                  {stat.value}
                </Text>
                <Text color="whiteAlpha.700" fontSize="sm">
                  {stat.label}
                </Text>
              </VStack>
            </Box>
          ))}
        </Grid>
      </VStack>
    </Box>
  )
}

// Enhanced StatCard with Animations
const StatCard = ({
  icon: Icon,
  label,
  value,
  subValue,
  highlight,
  gradient,
  delay = 0,
}) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <Box
      p={6}
      borderRadius="2xl"
      position="relative"
      overflow="hidden"
      bg="rgba(255, 255, 255, 0.03)"
      backdropFilter="blur(10px)"
      borderWidth="1px"
      borderColor="whiteAlpha.100"
      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      transform="translateY(0)"
      _hover={{
        transform: 'translateY(-4px)',
        boxShadow: highlight
          ? '0 8px 30px rgba(236, 72, 153, 0.2)'
          : '0 8px 30px rgba(255, 255, 255, 0.1)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        animation: `${fadeIn} 0.6s ease-out ${delay}s forwards`,
      }}
    >
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        h="100%"
        bgGradient={
          gradient || 'linear(to-r, transparent, whiteAlpha.100, transparent)'
        }
        opacity={isHovered ? 0.5 : 0.3}
        transition="opacity 0.3s"
        // animation={`${shimmer} 3s infinite linear`}
      />
      <VStack
        spacing={3}
        position="relative"
        transform={isHovered ? 'scale(1.05)' : 'scale(1)'}
        transition="transform 0.3s"
      >
        <Circle
          size="40px"
          bg={highlight ? 'pink.500' : 'whiteAlpha.200'}
          transition="all 0.3s"
          animation={isHovered ? `${glowPulse} 2s infinite` : 'none'}
        >
          <Icon size={20} color="white" />
        </Circle>
        <Text
          color="whiteAlpha.700"
          fontSize="sm"
          fontWeight="medium"
          transition="color 0.3s"
        >
          {label}
        </Text>
        <Text
          color={highlight ? 'pink.300' : 'white'}
          fontSize="2xl"
          fontWeight="bold"
          transition="color 0.3s"
        >
          {value}
        </Text>
        {subValue && (
          <Text color="whiteAlpha.600" fontSize="xs" transition="color 0.3s">
            {subValue}
          </Text>
        )}
      </VStack>
    </Box>
  )
}

// Main Modal Component
const ChampionDetailsModal = ({ isOpen, onClose, champion }) => {
  const { t } = useTranslation('ChampionDetailsModal')
  if (!champion) return null

  const rankColors = {
    1: 'yellow.400',
    2: 'gray.300',
    3: 'orange.300',
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={{ base: 'full', md: '4xl' }}
      motionPreset="slideInBottom"
    >
      <ModalOverlay backdropFilter="blur(8px)" />
      <ModalContent
        bg="rgba(13, 16, 31, 0.95)"
        boxShadow="dark-lg"
        borderRadius={{ base: 0, md: '2xl' }}
        border="1px solid"
        borderColor="whiteAlpha.100"
        my={{ base: 0, md: '3.75rem' }}
        overflow="hidden"
        style={{
          animation: `${fadeIn} 0.4s ease-out forwards`,
        }}
      >
        {/* Decorative top gradient */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          h="200px"
          bgGradient={
            champion.finalRank <= 3
              ? 'linear(to-r, pink.500, purple.500)'
              : 'linear(to-r, purple.600, blue.600)'
          }
          opacity={0.1}
        />

        <ModalCloseButton
          color="white"
          size="lg"
          zIndex={2}
          transition="all 0.3s"
          _hover={{
            transform: 'rotate(90deg)',
          }}
        />

        {/* Header Section */}
        <ModalHeader
          pt={{ base: 6, md: 8 }}
          pb={{ base: 4, md: 6 }}
          px={{ base: 4, md: 6 }}
        >
          <Stack
            direction={{ base: 'column', md: 'row' }}
            spacing={{ base: 3, md: 4 }}
            align={{ base: 'center', md: 'center' }}
            w="full"
            style={{
              animation: `${slideIn} 0.5s ease-out forwards`,
            }}
          >
            {/* Avatar Section */}
            <Flex
              w={{ base: '72px', md: '60px' }}
              h={{ base: '72px', md: '60px' }}
              bg="rgba(255, 255, 255, 0.03)"
              borderRadius="full"
              align="center"
              justify="center"
              border="3px solid"
              borderColor={rankColors[champion.finalRank] || 'whiteAlpha.300'}
              position="relative"
              overflow="hidden"
              transition="all 0.3s"
              _hover={{
                transform: 'scale(1.05)',
                boxShadow: `0 0 20px ${
                  rankColors[champion.finalRank] || 'whiteAlpha.300'
                }`,
              }}
            >
              <Box
                position="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
                bgGradient="linear(to-br, whiteAlpha.100, transparent)"
                opacity={0.5}
              />
              <Text
                fontSize={{ base: '3xl', md: '2xl' }}
                fontWeight="bold"
                color="white"
                zIndex={1}
              >
                {champion.avatar}
              </Text>
            </Flex>

            {/* Name and Rank Section */}
            <VStack
              align={{ base: 'center', md: 'start' }}
              spacing={1}
              flex="1"
            >
              <HStack spacing={3}>
                <Text
                  color="white"
                  fontSize={{ base: '2xl', md: '2xl' }}
                  fontWeight="bold"
                >
                  {champion.name}
                </Text>
                <Badge
                  colorScheme={champion.finalRank <= 3 ? 'pink' : 'purple'}
                  variant="solid"
                  px={2}
                  py={1}
                  borderRadius="md"
                  transition="all 0.3s"
                  _hover={{
                    transform: 'scale(1.05)',
                    boxShadow: '0 0 20px rgba(236, 72, 153, 0.3)',
                  }}
                >
                  {t('Rank')} #{champion.finalRank}
                </Badge>
              </HStack>

              <HStack spacing={4}>
                <Text color="whiteAlpha.900" fontSize="md">
                  {champion.username}
                </Text>
                <Badge
                  colorScheme="blue"
                  variant="subtle"
                  px={2}
                  py={0.5}
                  borderRadius="full"
                  transition="all 0.3s"
                  _hover={{
                    transform: 'scale(1.05)',
                    boxShadow: '0 0 20px rgba(66, 153, 225, 0.3)',
                  }}
                >
                  {champion.circle}
                </Badge>
              </HStack>
            </VStack>
          </Stack>
        </ModalHeader>

        <ModalBody pb={8} px={6}>
          <VStack spacing={8}>
            {/* IQ Journey Graph */}
            <IQJourneyGraph
              start={champion.iqScore.start}
              current={champion.iqScore.final}
              peak={champion.iqScore.peak}
            />

            {/* Primary Stats Grid */}
            <Grid
              templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }}
              gap={4}
              w="full"
            >
              <StatCard
                icon={Zap}
                label={t('Exp Level')}
                value={champion.expLevel}
                delay={0.2}
              />
              <StatCard
                icon={Target}
                label={t('Submissions')}
                value={champion.submissions}
                delay={0.3}
              />
              <StatCard
                icon={Star}
                label={t('RQM Score')}
                value={champion.rqmScore.average}
                subValue={`Peak: ${champion.rqmScore.highest}`}
                delay={0.4}
              />
            </Grid>

            <Divider borderColor="whiteAlpha.200" />

            {/* Quiz Stats Section */}
            <QuizStatsCard stats={champion.quizStats} t={t} />

            {/* League Info */}
            <LeagueInfoCard champion={champion} t={t} />

            {/* Achievements */}
            <AchievementsCard champion={champion} t={t} />

            {/* Performance Insights */}
            <PerformanceInsightsCard champion={champion} t={t} />
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

// Enhanced Quiz Stats Card
const QuizStatsCard = ({ stats, t }) => (
  <Box
    w="full"
    p={6}
    bg="rgba(255, 255, 255, 0.03)"
    borderRadius="xl"
    backdropFilter="blur(10px)"
    border="1px solid"
    borderColor="whiteAlpha.100"
    style={{
      animation: `${fadeIn} 0.6s ease-out 0.4s forwards`,
    }}
  >
    <VStack spacing={4} align="start">
      <Text color="white" fontSize="lg" fontWeight="semibold">
        {t('Quiz Performance')}
      </Text>
      <Grid
        templateColumns={{
          base: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',
        }}
        gap={4}
        w="full"
      >
        <StatCard
          icon={CheckSquare}
          label={t('Total Quizzes')}
          value={stats.total}
          delay={0.5}
        />
        <StatCard
          icon={Trophy}
          label={t('Perfect Scores')}
          value={stats.perfectScores}
          delay={0.6}
        />
        <StatCard
          icon={Award}
          label={t('Success Rate')}
          value={`${((stats.perfectScores / stats.total) * 100).toFixed(1)}%`}
          delay={0.7}
        />
      </Grid>
    </VStack>
  </Box>
)

// Enhanced League Info Card
const LeagueInfoCard = ({ champion, t }) => (
  <Box
    w="full"
    p={6}
    bg="rgba(255, 255, 255, 0.03)"
    borderRadius="xl"
    backdropFilter="blur(10px)"
    border="1px solid"
    borderColor="whiteAlpha.100"
    style={{
      animation: `${fadeIn} 0.6s ease-out 0.5s forwards`,
    }}
  >
    <VStack spacing={4}>
      <HStack w="full" justify="space-between">
        <Text color="white" fontSize="lg" fontWeight="semibold">
          {t('League')}
        </Text>
        <Text color="whiteAlpha.600" fontSize="sm">
          {champion.month}/{champion.year}
        </Text>
      </HStack>
      <Grid
        templateColumns={{
          base: 'repeat(1, 1fr)',
          md: 'repeat(2, 1fr)',
        }}
        gap={4}
        w="full"
      >
        {[
          { icon: Users, label: 'Society', value: champion.society },
          { icon: CircleDot, label: 'Circle', value: champion.circle },
        ].map((item, index) => (
          <Box
            key={index}
            p={4}
            bg="rgba(255, 255, 255, 0.05)"
            borderRadius="xl"
            transition="all 0.3s"
            _hover={{
              transform: 'translateY(-2px)',
              bg: 'rgba(255, 255, 255, 0.08)',
              boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
            }}
            style={{
              animation: `${fadeIn} 0.6s ease-out ${
                0.6 + index * 0.1
              }s forwards`,
            }}
          >
            <VStack align="start" spacing={1}>
              <HStack>
                <item.icon size={16} color="white" />
                <Text color="whiteAlpha.700" fontSize="sm">
                  {item.label}
                </Text>
              </HStack>
              <Text color="white" fontSize="lg" fontWeight="semibold">
                {item.value}
              </Text>
            </VStack>
          </Box>
        ))}
      </Grid>
    </VStack>
  </Box>
)

// Enhanced Achievements Card
const AchievementsCard = ({ champion, t }) => {
  const achievements = [
    {
      condition: champion.finalRank <= 3,
      icon: Crown,
      text: t('Top 3 Champion'),
      color: 'yellow',
    },
    {
      condition: champion.iqScore.final > 150,
      icon: Brain,
      text: t('IQ Elite'),
      color: 'purple',
    },
    {
      condition: champion.submissions > 500,
      icon: Target,
      text: t('Dedicated Solver'),
      color: 'blue',
    },
    {
      condition: champion.quizStats.perfectScores >= 10,
      icon: Trophy,
      text: t('Quiz Master'),
      color: 'green',
    },
    {
      condition: champion.rqmScore.highest >= 65,
      icon: Sparkles,
      text: t('High RQM Achiever'),
      color: 'pink',
    },
  ].filter(a => a.condition)

  return (
    <Box
      w="full"
      p={6}
      bg="rgba(255, 255, 255, 0.03)"
      borderRadius="xl"
      backdropFilter="blur(10px)"
      border="1px solid"
      borderColor="whiteAlpha.100"
      style={{
        animation: `${fadeIn} 0.6s ease-out 0.6s forwards`,
      }}
    >
      <VStack align="start" spacing={4}>
        <Text color="white" fontSize="lg" fontWeight="semibold">
          {t('Achievements')}
        </Text>
        <Stack
          direction={{ base: 'column', md: 'row' }}
          spacing={{ base: 2, md: 4 }}
          w="full"
          flexWrap="wrap"
        >
          {achievements.map((achievement, index) => (
            <Badge
              key={index}
              colorScheme={achievement.color}
              variant="subtle"
              px={3}
              py={1.5}
              borderRadius="full"
              transition="all 0.3s"
              _hover={{
                transform: 'scale(1.05)',
                boxShadow: `0 0 20px ${achievement.color}33`,
              }}
              style={{
                animation: `${fadeIn} 0.6s ease-out ${
                  0.7 + index * 0.1
                }s forwards`,
              }}
            >
              <HStack spacing={2}>
                <achievement.icon size={14} />
                <Text>{achievement.text}</Text>
              </HStack>
            </Badge>
          ))}
        </Stack>
      </VStack>
    </Box>
  )
}

// Enhanced Performance Insights Card
const PerformanceInsightsCard = ({ champion, t }) => {
  const metrics = [
    {
      icon: TrendingUp,
      label: t('IQ Growth Rate'),
      value: `${(
        ((champion.iqScore.final - champion.iqScore.start) /
          champion.iqScore.start) *
        100
      ).toFixed(1)}%`,
      subtext: `From ${champion.iqScore.start} to ${champion.iqScore.final}`,
    },
    {
      icon: CheckSquare,
      label: t('Quiz Success Rate'),
      value: `${(
        (champion.quizStats.perfectScores / champion.quizStats.total) *
        100
      ).toFixed(1)}%`,
      subtext: `${champion.quizStats.perfectScores} perfect scores out of ${champion.quizStats.total}`,
    },
  ]

  return (
    <Box
      w="full"
      p={6}
      bg="rgba(255, 255, 255, 0.03)"
      borderRadius="xl"
      backdropFilter="blur(10px)"
      border="1px solid"
      borderColor="whiteAlpha.100"
      style={{
        animation: `${fadeIn} 0.6s ease-out 0.7s forwards`,
      }}
    >
      <VStack align="start" spacing={4}>
        <Text color="white" fontSize="lg" fontWeight="semibold">
          {t('Performance Insights')}
        </Text>
        <Grid
          templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }}
          gap={4}
          w="full"
        >
          {metrics.map((metric, index) => (
            <Box
              key={index}
              p={4}
              bg="rgba(255, 255, 255, 0.05)"
              borderRadius="xl"
              transition="all 0.3s"
              _hover={{
                transform: 'translateY(-2px)',
                bg: 'rgba(255, 255, 255, 0.08)',
                boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
              }}
              style={{
                animation: `${fadeIn} 0.6s ease-out ${
                  0.8 + index * 0.1
                }s forwards`,
              }}
            >
              <VStack align="start" spacing={2}>
                <HStack>
                  <metric.icon
                    size={16}
                    color="white"
                    style={{
                      animation: `${scaleIn} 0.4s ease-out ${
                        0.9 + index * 0.1
                      }s forwards`,
                    }}
                  />
                  <Text color="white" fontSize="sm" fontWeight="medium">
                    {metric.label}
                  </Text>
                </HStack>
                <Text
                  color="white"
                  fontSize="2xl"
                  fontWeight="bold"
                  style={{
                    animation: `${slideIn} 0.4s ease-out ${
                      1 + index * 0.1
                    }s forwards`,
                  }}
                >
                  {metric.value}
                </Text>
                <Text color="whiteAlpha.600" fontSize="sm">
                  {metric.subtext}
                </Text>
              </VStack>
            </Box>
          ))}
        </Grid>
      </VStack>
    </Box>
  )
}

export default ChampionDetailsModal
