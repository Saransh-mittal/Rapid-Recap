import React from 'react'
import { Box, Flex, Text, Tooltip, VStack } from '@chakra-ui/react'
import LightbulbIcon from '../../assets/svg/LightbulbIcon'
import StarIcon from '../../assets/svg/StarIcon'
import SkullIcon from '../../assets/svg/SkullIcon'

const DifficultyLegend = () => {
  const difficulties = [
    { icon: LightbulbIcon, color: 'green', label: 'Easy' },
    { icon: StarIcon, color: 'yellow', label: 'Medium' },
    { icon: SkullIcon, color: 'red', label: 'Hard' },
  ]

  return (
    <Flex
      justifyContent="center"
      mb={4}
      p={2}
      bg="rgba(255, 255, 255, 0.1)"
      borderRadius="md"
    >
      <VStack spacing={2}>
        <Text fontSize="sm" fontWeight="bold" color="white">
          Difficulty Levels:
        </Text>
        <Flex justifyContent="center" gap={4}>
          {difficulties.map(({ icon: Icon, color, label }) => (
            <Tooltip key={label} label={label} hasArrow>
              <Flex alignItems="center" gap={1}>
                <Box color={color}>
                  <Icon />
                </Box>
                <Text fontSize="xs" color="white">
                  {label}
                </Text>
              </Flex>
            </Tooltip>
          ))}
        </Flex>
      </VStack>
    </Flex>
  )
}

export default DifficultyLegend
