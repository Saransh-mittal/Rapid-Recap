// components/quickClashComponents/leaderboard/components/StatItem.jsx
import React from 'react'
import { VStack, Icon, Text, HStack, Box } from '@chakra-ui/react'
import { User as UserIcon, Users as UsersIcon } from 'lucide-react'

const StatItem = React.memo(
  ({ mainIcon, label, value1v1, value4v4, has4v4Stats, color }) => {
    // Determine if we should show the dual stats section or a single stat.
    // Only show dual if has4v4Stats is true AND at least one of the 4v4 values is actually a number (not undefined/null).
    // We assume if wins4v4 is a number, the others (rate, score) are meant to be shown too, even if they are 0.
    const shouldDisplay4v4 = has4v4Stats && typeof value4v4 === 'number'

    return (
      <VStack
        spacing={1} // Reduced spacing a bit
        align="center"
        flex="1"
        minW="0"
        py={2.5}
        px={1.5}
        bg="rgba(255,255,255,0.03)"
        borderRadius="lg"
        border="1px solid rgba(255,255,255,0.06)"
        minH="100px" // Ensure all stat items have a consistent height
        justifyContent="space-between" // Distribute content vertically
      >
        <HStack
          spacing={1.5}
          color="whiteAlpha.800"
          alignSelf="flex-start"
          pl={1}
        >
          <Icon as={mainIcon} boxSize={4} color={color} />
          <Text
            fontSize="xs"
            fontWeight="semibold"
            textTransform="uppercase"
            letterSpacing="0.05em"
          >
            {label}
          </Text>
        </HStack>

        {shouldDisplay4v4 ? (
          <VStack spacing={0.5} align="stretch" w="full" px={1} mt={1}>
            {/* 1v1 Stat */}
            <Flex justify="space-between" w="full" align="center">
              <HStack spacing={1} align="center">
                <Icon as={UserIcon} boxSize={3} color="whiteAlpha.600" />
                <Text fontSize="2xs" color="whiteAlpha.600">
                  1v1
                </Text>
              </HStack>
              <Text
                fontSize="md"
                fontWeight="bold"
                color={color}
                lineHeight="1.1"
              >
                {value1v1 !== undefined ? value1v1 : '-'}
              </Text>
            </Flex>
            {/* Divider */}
            <Box
              h="1px"
              bg="rgba(255,255,255,0.05)"
              w="80%"
              mx="auto"
              my={0.5}
            />
            {/* 4v4 Stat */}
            <Flex justify="space-between" w="full" align="center">
              <HStack spacing={1} align="center">
                <Icon as={UsersIcon} boxSize={3} color="whiteAlpha.600" />
                <Text fontSize="2xs" color="whiteAlpha.600">
                  4v4
                </Text>
              </HStack>
              <Text
                fontSize="md"
                fontWeight="bold"
                color={color}
                lineHeight="1.1"
              >
                {/* Ensure value4v4 (which can be a string like "75%") is handled or its base number is passed */}
                {typeof value4v4 === 'string' && value4v4.includes('%')
                  ? value4v4 // If it's already a percentage string
                  : value4v4 !== undefined
                  ? value4v4
                  : '-'}
              </Text>
            </Flex>
          </VStack>
        ) : (
          // Single stat display (if no 4v4 stats or not applicable)
          <Text
            fontSize="xl"
            fontWeight="bold"
            color={color}
            lineHeight="1.1"
            mt={1}
          >
            {value1v1 !== undefined ? value1v1 : '-'}
          </Text>
        )}
      </VStack>
    )
  },
)

StatItem.displayName = 'StatItem'
export default StatItem
