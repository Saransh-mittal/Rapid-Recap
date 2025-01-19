import React from 'react'
import { Box, Flex, Text, VStack, useBreakpointValue } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { Brain, Zap, Star, Crown, Trophy, Award } from 'lucide-react'

const MotionFlex = motion(Flex)

const rankStyles = {
  1: {
    gradient:
      'linear(to-r, rgba(246, 135, 179, 0.9) 0%, rgba(183, 148, 244, 0.9) 100%)',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.4)',
    glow: '0 4px 20px rgba(246, 135, 179, 0.3)',
    statBg: 'rgba(0, 0, 0, 0.15)',
    icon: Crown,
    borderColor: 'rgba(255, 215, 0, 0.6)',
  },
  2: {
    gradient:
      'linear(to-r, rgba(183, 148, 244, 0.9) 0%, rgba(246, 135, 179, 0.9) 100%)',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.4)',
    glow: '0 4px 20px rgba(183, 148, 244, 0.3)',
    statBg: 'rgba(0, 0, 0, 0.15)',
    icon: Trophy,
    borderColor: 'rgba(192, 192, 192, 0.6)',
  },
  3: {
    gradient:
      'linear(to-r, rgba(66, 153, 225, 0.9) 0%, rgba(183, 148, 244, 0.9) 100%)',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.4)',
    glow: '0 4px 20px rgba(66, 153, 225, 0.3)',
    statBg: 'rgba(0, 0, 0, 0.15)',
    icon: Award,
    borderColor: 'rgba(205, 127, 50, 0.6)',
  },
  default: {
    gradient: 'linear(to-r, rgba(41, 33, 61, 0.95), rgba(62, 50, 92, 0.95))',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
    glow: 'none',
    statBg: 'rgba(255, 255, 255, 0.1)',
    icon: Star,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
}

const StatItem = ({
  label,
  value,
  isHighlight,
  bgColor,
  textShadow,
  icon: Icon,
}) => (
  <VStack
    spacing={0}
    align="center"
    bg={bgColor}
    px={{ base: 2, md: 4 }}
    py={{ base: 2, md: 3 }}
    borderRadius="xl"
    minW={{ base: '80px', md: '110px' }}
    position="relative"
    overflow="hidden"
  >
    <Flex direction="column" align="center" gap={{ base: 0.5, md: 1 }}>
      <Flex align="center" gap={1}>
        <Icon size={14} style={{ color: 'white', opacity: 0.8 }} />
        <Text
          fontSize={{ base: 'xs', md: 'sm' }}
          color="whiteAlpha.900"
          fontWeight="medium"
          textShadow={textShadow}
        >
          {label}
        </Text>
      </Flex>
      <Text
        fontSize={{ base: 'lg', md: '2xl' }}
        fontWeight="bold"
        color={isHighlight ? 'pink.300' : 'white'}
        textShadow={textShadow}
        lineHeight="1"
      >
        {value}
      </Text>
    </Flex>
  </VStack>
)

const RankBadge = ({ rank, icon: Icon, borderColor, textShadow }) => (
  <Box
    position="relative"
    w={{ base: '40px', md: '48px' }}
    h={{ base: '40px', md: '48px' }}
  >
    <Flex
      position="absolute"
      top="0"
      left="0"
      w="100%"
      h="100%"
      borderRadius="full"
      bg="rgba(255, 255, 255, 0.2)"
      align="center"
      justify="center"
      border="3px solid"
      borderColor={borderColor}
    >
      <Icon size={20} style={{ color: 'white' }} />
    </Flex>
    <Flex
      position="absolute"
      bottom="-4px"
      right="-4px"
      w="24px"
      h="24px"
      bg="rgba(0, 0, 0, 0.5)"
      borderRadius="full"
      align="center"
      justify="center"
      border="2px solid"
      borderColor={borderColor}
    >
      <Text
        fontSize="sm"
        fontWeight="bold"
        color="white"
        textShadow={textShadow}
      >
        #{rank}
      </Text>
    </Flex>
  </Box>
)

const ChampionCard = ({ champion, index }) => {
  const rank = index + 1
  const style = rankStyles[rank] || rankStyles.default
  const isTopThree = rank <= 3
  const isMobile = useBreakpointValue({ base: true, md: false })

  return (
    <MotionFlex
      w="100%"
      maxW={{ base: '100%', md: '900px' }}
      mx="auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Flex
        w="100%"
        minH={{ base: '120px', md: '110px' }}
        bgGradient={style.gradient}
        borderRadius="2xl"
        overflow="hidden"
        position="relative"
        boxShadow={style.glow}
        px={{ base: 4, md: 6 }}
        py={{ base: 3, md: 5 }}
        direction="column"
        justify="space-between"
      >
        {/* Top Section: Rank and Name */}
        <Flex align="center" mb={{ base: 2, md: 3 }}>
          <RankBadge
            rank={rank}
            icon={style.icon}
            borderColor={style.borderColor}
            textShadow={style.textShadow}
          />

          <VStack spacing={0} align="start" ml={4}>
            <Text
              fontSize={{ base: 'lg', md: '2xl' }}
              fontWeight="bold"
              color="white"
              textShadow={style.textShadow}
              letterSpacing="wide"
            >
              {champion.name}
            </Text>
            <Text
              fontSize={{ base: 'xs', md: 'md' }}
              color="whiteAlpha.900"
              textShadow={style.textShadow}
            >
              {champion.username}
            </Text>
          </VStack>
        </Flex>

        {/* Stats Section */}
        <Flex
          justify="space-between"
          px={{ base: 1, md: 4 }}
          mt={{ base: 1, md: 2 }}
          mx={{ base: -1, md: 0 }}
        >
          <StatItem
            label="IQ Score"
            value={champion.iqScore}
            isHighlight={true}
            bgColor={style.statBg}
            textShadow={style.textShadow}
            icon={Brain}
          />
          <StatItem
            label="Exp Level"
            value={champion.expLevel}
            bgColor={style.statBg}
            textShadow={style.textShadow}
            icon={Zap}
          />
          <StatItem
            label="RQM"
            value={champion.rqm}
            bgColor={style.statBg}
            textShadow={style.textShadow}
            icon={Star}
          />
        </Flex>

        {/* Ambient Light Effect */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bgGradient="linear(to-b, rgba(255,255,255,0.1), transparent)"
          pointerEvents="none"
        />

        {/* Shimmer Effect */}
        <Box
          as={motion.div}
          position="absolute"
          top={0}
          left={'-100%'}
          width="50%"
          height="100%"
          background="linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)"
          animation={isTopThree ? 'shimmer 2s infinite' : 'none'}
          pointerEvents="none"
          sx={{
            '@keyframes shimmer': {
              '0%': { left: '-100%' },
              '100%': { left: '200%' },
            },
          }}
        />
      </Flex>
    </MotionFlex>
  )
}

export default ChampionCard
