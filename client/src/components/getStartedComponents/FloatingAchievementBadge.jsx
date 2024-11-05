import React from 'react'
import { Box } from '@chakra-ui/react'
import { keyframes } from '@emotion/react'

// Define floating animation
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`

const FloatingAchievementBadge = ({
  icon: Icon,
  position,
  delay = 0,
  COLORS,
}) => {
  return (
    <Box
      position="absolute"
      {...position}
      bg={COLORS.darkBg}
      p={4}
      borderRadius="xl"
      border="1px solid"
      borderColor={COLORS.cardBorder}
      animation={`${float} 3s ease-in-out infinite ${delay}s`}
      _hover={{
        borderColor: COLORS.accent,
        transform: 'scale(1.1)',
        transition: 'all 0.3s ease',
      }}
    >
      <Icon color={COLORS.accent} size={24} />
    </Box>
  )
}

export default FloatingAchievementBadge
