import React from 'react'
import { Box, Flex, Text, HStack } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { Star, Zap, Crown } from 'lucide-react'

const BoostCard = ({ icon: Icon, title, isActive }) => {
  return (
    <Box
      as={motion.div}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{
        scale: 1.02,
        boxShadow: '0 0 20px rgba(147, 51, 234, 0.3)',
      }}
      position="relative"
      w={{ base: '65px', sm: '90px' }}
      h={{ base: '65px', sm: '90px' }}
      borderRadius="xl"
      overflow="hidden"
      bg="linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)"
      transition="all 0.2s ease"
      opacity={isActive ? 1 : 0.6}
    >
      <Box
        position="absolute"
        inset={0}
        opacity={0.6}
        bg="radial-gradient(circle at 50% 0%, rgba(124, 58, 237, 0.5), transparent 70%)"
      />

      <Flex
        direction="column"
        align="center"
        justify="center"
        h="full"
        p={{ base: 2, sm: 3 }}
        bg="linear-gradient(165deg, rgba(99, 102, 241, 0.9) 0%, rgba(124, 58, 237, 0.9) 100%)"
        borderTop="1px solid rgba(255, 255, 255, 0.2)"
        position="relative"
      >
        <Box
          mb={1}
          color="white"
          filter="drop-shadow(0 2px 3px rgba(0, 0, 0, 0.2))"
        >
          <Icon size={18} strokeWidth={2} />
        </Box>

        <Text
          fontSize={{ base: 'xs', sm: 'sm' }}
          fontWeight="bold"
          color="white"
          textAlign="center"
          letterSpacing="wide"
          textShadow="0 1px 2px rgba(0, 0, 0, 0.2)"
        >
          {title}
        </Text>
      </Flex>
    </Box>
  )
}

const MultiplierDisplay = ({ multiplier }) => {
  // Define gradient colors based on multiplier with more vibrant colors
  const getGradientColors = () => {
    switch (multiplier) {
      case '1.5X':
        return ['#FF3D7F', '#FF9E9E'] // Vibrant pink to light pink
      case '1.75X':
        return ['#00FF87', '#60EFFF'] // Neon green to cyan
      case '2X':
        return ['#FFD700', '#FF8A00'] // Bright gold to orange
      default:
        return ['#FF3D7F', '#FF9E9E']
    }
  }

  const [startColor, endColor] = getGradientColors()

  return (
    <Box
      as={motion.div}
      initial={{ scale: 1 }}
      animate={{
        scale: [1, 1.05, 1],
        filter: [
          `drop-shadow(0 0 8px ${startColor}99)`,
          `drop-shadow(0 0 12px ${startColor}CC)`,
          `drop-shadow(0 0 8px ${startColor}99)`,
        ],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      <Flex align="center" gap={1}>
        <Text
          bgGradient={`linear(to-r, ${startColor}, ${endColor})`}
          bgClip="text"
          fontSize={{ base: 'sm', sm: 'md' }}
          fontWeight="black"
          letterSpacing="0.1em"
          style={{
            textShadow: `0 0 15px ${startColor}66`,
            filter: 'brightness(1.2)',
          }}
        >
          {multiplier}
        </Text>
        <Text
          color={startColor}
          fontSize={{ base: 'xs', sm: 'sm' }}
          fontWeight="extrabold"
          letterSpacing="0.05em"
          textTransform="uppercase"
          style={{
            textShadow: `0 0 10px ${startColor}66`,
            background: `linear-gradient(45deg, ${startColor}26, ${endColor}40)`,
            padding: '2px 6px',
            borderRadius: '4px',
            border: `1px solid ${startColor}66`,
            filter: 'brightness(1.1)',
          }}
        >
          BOOST
        </Text>
      </Flex>
    </Box>
  )
}

const PowerBoostDisplay = ({
  quinBoost = true,
  streakSurge = true,
  categoryBoost = true,
}) => {
  const getActiveBoostCount = () => {
    let count = 0
    if (quinBoost) count++
    if (streakSurge) count++
    if (categoryBoost) count++
    return count
  }

  const getMultiplier = () => {
    const activeCount = getActiveBoostCount()
    switch (activeCount) {
      case 1:
        return '1.5X'
      case 2:
        return '1.75X'
      case 3:
        return '2X'
      default:
        return ''
    }
  }

  return (
    <Box
      position="relative"
      py={2}
      borderRadius="2xl"
      maxW={{ base: '300px', sm: '400px' }}
      mx="auto"
    >
      <Flex align="center" gap={2} mb={2} px={1}>
        <Crown
          size={16}
          color="#A78BFA"
          style={{ filter: 'drop-shadow(0 0 3px rgba(167, 139, 250, 0.5))' }}
        />
        <Flex align="center" gap={2}>
          <Text
            fontSize="xs"
            fontWeight="bold"
            color="whiteAlpha.900"
            letterSpacing="0.1em"
            textTransform="uppercase"
            textShadow="0 0 10px rgba(167, 139, 250, 0.2)"
          >
            Power Boosts
          </Text>
          {getMultiplier() && (
            <MultiplierDisplay multiplier={getMultiplier()} />
          )}
        </Flex>
      </Flex>

      <HStack spacing={2} align="center" justify="flex-start">
        <BoostCard icon={Star} title="Streak Surge" isActive={streakSurge} />
        <BoostCard icon={Zap} title="Quin Boost" isActive={quinBoost} />
        <BoostCard
          icon={Crown}
          title="Category Boost"
          isActive={categoryBoost}
        />
      </HStack>
    </Box>
  )
}

export default PowerBoostDisplay
