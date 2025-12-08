import React from 'react'
import { Box, VStack, Text, HStack, Badge, Icon } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { Zap, Clock, Target, Eye } from 'lucide-react'

const MotionBox = motion(Box)

const AbilityItem = ({ powerup, index }) => {
  const getIcon = (id) => {
    switch (id) {
      case 'TIME_WARP': return Clock
      case 'PRECISION_PROTOCOL': return Target
      case 'SCORE_SURGE': return Zap
      case 'ORACLES_EYE': return Eye

      default: return Zap
    }
  }

  const getBenefit = (p) => {
    switch (p.powerupId) {
      case 'TIME_WARP': return '+15s Time Extension'
      case 'PRECISION_PROTOCOL': return '+50 Bonus Points (Perfect Score)'
      case 'SCORE_SURGE': return '1.1x Score Multiplier'
      case 'ORACLES_EYE': return 'Removed 2 Incorrect Options'

      default: return 'Ability Used'
    }
  }

  const getColor = (id) => {
    switch (id) {
      case 'TIME_WARP': return 'blue'
      case 'PRECISION_PROTOCOL': return 'purple'
      case 'SCORE_SURGE': return 'yellow'
      case 'ORACLES_EYE': return 'teal'

      default: return 'gray'
    }
  }

  const IconComponent = getIcon(powerup.powerupId)
  const colorScheme = getColor(powerup.powerupId)

  return (
    <Box
      p={4}
      bg="whiteAlpha.100"
      borderRadius="xl"
      border="1px solid"
      borderColor="whiteAlpha.200"
      w="100%"
    >
      <HStack justify="space-between">
        <HStack spacing={4}>
          <Box
            p={2}
            borderRadius="lg"
            bg={`${colorScheme}.500`}
            color="white"
            boxShadow={`0 0 10px var(--chakra-colors-${colorScheme}-500)`}
          >
            <Icon as={IconComponent} boxSize={5} />
          </Box>
          <VStack align="start" spacing={0}>
            <Text fontWeight="bold" fontSize="md">
              {powerup.powerupId.replace('_', ' ')}
            </Text>
            <Text fontSize="sm" color="whiteAlpha.700">
              {getBenefit(powerup)}
            </Text>
          </VStack>
        </HStack>
        <Badge colorScheme={colorScheme} variant="solid" borderRadius="full" px={3}>
          USED
        </Badge>
      </HStack>
    </Box>
  )
}

const AbilitiesBreakdown = ({ activePowerups = [] }) => {
  console.log('AbilitiesBreakdown activePowerups:', activePowerups)
  const usedPowerups = activePowerups.filter(p => p.used)
  console.log('AbilitiesBreakdown usedPowerups:', usedPowerups)

  // DEBUG: Always render to see what's happening
  return (
    <VStack w="100%" spacing={3} align="stretch" border="4px solid red" p={4} bg="blackAlpha.500">
      <Text color="white" fontWeight="bold">DEBUG INFO:</Text>
      <Text color="white">Total Powerups: {activePowerups.length}</Text>
      <Text color="white">Used Powerups: {usedPowerups.length}</Text>
      <Box maxH="200px" overflowY="auto" bg="black" p={2} fontSize="xs" fontFamily="monospace">
        {JSON.stringify(activePowerups, null, 2)}
      </Box>

      <Text fontSize="lg" fontWeight="bold" mb={2}>
        Abilities Deployed
      </Text>
      {usedPowerups.map((p, i) => (
        <AbilityItem key={i} powerup={p} index={i} />
      ))}
    </VStack>
  )
}

export default AbilitiesBreakdown
