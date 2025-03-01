import React, { useState, useCallback, memo } from 'react'
import { Box, Flex, Icon, Text, Tooltip, Skeleton } from '@chakra-ui/react'
import { Info } from 'lucide-react'

const Stat = ({ icon, label, value, color, isLoading, tooltip }) => {
  // State to control tooltip visibility manually for mobile
  const [isTooltipOpen, setIsTooltipOpen] = useState(false)

  // Handle tap for mobile devices with useCallback for better performance
  const handleTooltipToggle = useCallback(() => {
    if (tooltip) {
      setIsTooltipOpen(prev => !prev)

      // Auto-close tooltip after 3 seconds on mobile
      if (!isTooltipOpen) {
        setTimeout(() => setIsTooltipOpen(false), 3000)
      }
    }
  }, [tooltip, isTooltipOpen])

  // Use handleMouseEnter/Leave with useCallback
  const handleMouseEnter = useCallback(() => {
    if (tooltip) setIsTooltipOpen(true)
  }, [tooltip])

  const handleMouseLeave = useCallback(() => {
    if (tooltip) setIsTooltipOpen(false)
  }, [tooltip])

  return (
    <Box textAlign="center" p={2} flex="1" minW={{ base: '40%', md: 'auto' }}>
      <Flex justify="center" align="center" mb={2}>
        <Icon as={icon} color={color} boxSize={6} />
        {tooltip && (
          <Tooltip
            label={tooltip}
            placement="top"
            hasArrow
            isOpen={isTooltipOpen}
            closeOnClick={false}
          >
            <Box
              ml={1}
              cursor="help"
              onClick={handleTooltipToggle}
              onTouchStart={handleTooltipToggle}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              aria-label={tooltip}
              role="button"
              tabIndex={0}
            >
              <Icon
                as={Info}
                color="whiteAlpha.500"
                boxSize={3.5}
                _hover={{ color: 'whiteAlpha.800' }}
              />
            </Box>
          </Tooltip>
        )}
      </Flex>
      <Text fontSize="sm" color="whiteAlpha.700">
        {label}
      </Text>
      <Skeleton
        isLoaded={!isLoading}
        h={isLoading ? '24px' : 'auto'}
        startColor="purple.800"
        endColor="purple.900"
      >
        <Text fontSize="xl" fontWeight="bold" color="white">
          {value}
        </Text>
      </Skeleton>
    </Box>
  )
}

// Memoize the component to prevent unnecessary re-renders
export default memo(Stat)
