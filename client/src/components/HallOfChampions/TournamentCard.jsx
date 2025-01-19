import React from 'react'
import {
  Box,
  Flex,
  Text,
  VStack,
  HStack,
  Badge,
  useBreakpointValue,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { Trophy, Award, Star, Crown, Target, Zap } from 'lucide-react'

const MotionFlex = motion(Flex)

const rankStyles = {
  0: {
    gradient: 'linear(to-r, rgba(255, 215, 0, 0.9), rgba(255, 165, 0, 0.9))',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.4)',
    glow: '0 4px 20px rgba(255, 215, 0, 0.3)',
    statBg: 'rgba(0, 0, 0, 0.2)',
    icon: Crown,
    borderColor: 'rgba(255, 215, 0, 0.8)',
  },
  1: {
    gradient:
      'linear(to-r, rgba(192, 192, 192, 0.9), rgba(169, 169, 169, 0.9))',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.4)',
    glow: '0 4px 20px rgba(192, 192, 192, 0.3)',
    statBg: 'rgba(0, 0, 0, 0.2)',
    icon: Trophy,
    borderColor: 'rgba(192, 192, 192, 0.8)',
  },
  2: {
    gradient: 'linear(to-r, rgba(205, 127, 50, 0.9), rgba(139, 69, 19, 0.9))',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.4)',
    glow: '0 4px 20px rgba(205, 127, 50, 0.3)',
    statBg: 'rgba(0, 0, 0, 0.2)',
    icon: Award,
    borderColor: 'rgba(205, 127, 50, 0.8)',
  },
  default: {
    gradient: 'linear(to-r, rgba(44, 52, 87, 0.95), rgba(58, 66, 107, 0.95))',
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
  icon: Icon,
  isHighlight,
  bgColor,
  textShadow,
}) => (
  <Flex
    direction={{ base: 'column', md: 'row' }}
    align="center"
    bg={bgColor}
    px={{ base: 2, md: 3 }}
    py={{ base: 2, md: 2 }}
    borderRadius="xl"
    gap={{ md: 2 }}
  >
    <Flex align="center" gap={1}>
      <Icon size={14} style={{ color: 'white', opacity: 0.8 }} />
      <Text
        fontSize={{ base: 'xs', md: 'sm' }}
        color="whiteAlpha.900"
        fontWeight="medium"
        textShadow={textShadow}
      >
        {label}:
      </Text>
    </Flex>
    <Text
      fontSize={{ base: 'lg', md: 'xl' }}
      fontWeight="bold"
      color={isHighlight ? 'pink.300' : 'white'}
      textShadow={textShadow}
    >
      {value}
    </Text>
  </Flex>
)

const RankBadge = ({ rank, icon: Icon, borderColor, textShadow }) => (
  <Box
    position="relative"
    w={{ base: '44px', md: '48px' }}
    h={{ base: '44px', md: '48px' }}
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
      <Icon size={22} style={{ color: 'white' }} />
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
        #{rank + 1}
      </Text>
    </Flex>
  </Box>
)

const TournamentCard = ({ data, index }) => {
  const style = rankStyles[index] || rankStyles.default
  const isTopThree = index < 3
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
        minH={{ base: '180px', md: '80px' }}
        bgGradient={style.gradient}
        borderRadius="2xl"
        overflow="hidden"
        position="relative"
        boxShadow={style.glow}
        px={{ base: 4, md: 6 }}
        py={{ base: 4, md: 4 }}
        direction={{ base: 'column', md: 'row' }}
        align={{ md: 'center' }}
        justify={{ md: 'space-between' }}
        gap={{ md: 4 }}
      >
        {/* Left Section: Rank and Name */}
        <Flex align="center" mb={{ base: 4, md: 0 }} flex={{ md: '0 0 auto' }}>
          <RankBadge
            rank={index}
            icon={style.icon}
            borderColor={style.borderColor}
            textShadow={style.textShadow}
          />

          <VStack spacing={0} align="start" ml={4}>
            <Text
              fontSize={{ base: 'xl', md: 'lg' }}
              fontWeight="bold"
              color="white"
              textShadow={style.textShadow}
            >
              {data.name}
            </Text>
            <Text
              fontSize={{ base: 'sm', md: 'sm' }}
              color="whiteAlpha.900"
              textShadow={style.textShadow}
            >
              {data.username}
            </Text>
          </VStack>
        </Flex>

        {/* Center Section: Stats */}
        <Flex
          justify={{ base: 'space-between', md: 'center' }}
          mb={{ base: 4, md: 0 }}
          gap={{ base: 2, md: 4 }}
          flex={{ md: '0 0 auto' }}
        >
          <StatItem
            label="Total Score"
            value={data.totalScore}
            icon={Target}
            isHighlight={true}
            bgColor={style.statBg}
            textShadow={style.textShadow}
          />
          <StatItem
            label="Best Category"
            value={data.bestCategory.score}
            icon={Trophy}
            bgColor={style.statBg}
            textShadow={style.textShadow}
          />
          <StatItem
            label="Categories"
            value={data.categoriesPlayed.length}
            icon={Zap}
            bgColor={style.statBg}
            textShadow={style.textShadow}
          />
        </Flex>

        {/* Right Section: Categories */}
        <Flex
          flex={{ md: '1' }}
          justify={{ md: 'flex-end' }}
          maxW={{ md: '300px' }}
        >
          <HStack
            spacing={1}
            flexWrap="wrap"
            gap={1}
            justify={{ md: 'flex-end' }}
          >
            {data.categoriesPlayed
              .slice(0, isMobile ? undefined : 3)
              .map((category, idx) => (
                <Badge
                  key={idx}
                  px={2}
                  py={1}
                  borderRadius="full"
                  bg={style.statBg}
                  color="white"
                  textShadow={style.textShadow}
                  fontSize="xs"
                >
                  {category}
                </Badge>
              ))}
            {!isMobile && data.categoriesPlayed.length > 3 && (
              <Badge
                px={2}
                py={1}
                borderRadius="full"
                bg={style.statBg}
                color="white"
                textShadow={style.textShadow}
                fontSize="xs"
              >
                +{data.categoriesPlayed.length - 3}
              </Badge>
            )}
          </HStack>
        </Flex>

        {/* Visual Effects */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bgGradient="linear(to-b, rgba(255,255,255,0.1), transparent)"
          pointerEvents="none"
        />

        {isTopThree && (
          <Box
            as={motion.div}
            position="absolute"
            top={0}
            left="-100%"
            width="50%"
            height="100%"
            background="linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)"
            animate={{
              left: ['-100%', '200%'],
              transition: { duration: 2, repeat: Infinity },
            }}
            pointerEvents="none"
          />
        )}
      </Flex>
    </MotionFlex>
  )
}

export default TournamentCard
