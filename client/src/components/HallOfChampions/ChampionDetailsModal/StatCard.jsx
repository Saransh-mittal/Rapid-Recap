import React, { useState } from 'react'
import { Box, Circle, Text, VStack } from '@chakra-ui/react'
import { fadeIn, glowPulse } from './animations'

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
export default StatCard
