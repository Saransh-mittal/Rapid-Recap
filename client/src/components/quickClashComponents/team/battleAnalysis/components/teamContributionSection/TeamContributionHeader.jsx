// components/quickClashComponents/team/battleAnalysis/components/TeamContributionHeader.jsx
import React from 'react'
import {
  Flex,
  Text,
  Heading,
  Icon,
  HStack,
  VStack,
  Box,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { Users, ChevronDown } from 'lucide-react'

const TeamContributionHeader = React.memo(
  ({ isExpanded, onToggle, config, t }) => {
    return (
      <Flex
        px={config.padding}
        py={4}
        justifyContent="space-between"
        alignItems="center"
        cursor="pointer"
        onClick={onToggle}
        borderBottom="1px solid rgba(6, 182, 212, 0.2)"
        _hover={{ bg: 'rgba(6, 182, 212, 0.05)' }}
        position="relative"
        zIndex={1}
      >
        <HStack spacing={3}>
          <Box
            p={2}
            borderRadius="lg"
            bg="rgba(168, 85, 247, 0.2)"
          >
            <Icon as={Users} color="purple.400" boxSize={config.headerIconSize} />
          </Box>
          <VStack align="flex-start" spacing={0}>
            <Heading
              size={config.headingSize}
              color="white"
              fontWeight="semibold"
            >
              {t('Team Performance')}
            </Heading>
            <Text fontSize={{ base: 'xs', md: 'sm' }} color="whiteAlpha.600">
              {t('Contribution and stats per player')}
            </Text>
          </VStack>
        </HStack>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <Icon as={ChevronDown} color="cyan.400" boxSize={5} />
        </motion.div>
      </Flex>
    )
  },
)

TeamContributionHeader.displayName = 'TeamContributionHeader'
export default TeamContributionHeader
