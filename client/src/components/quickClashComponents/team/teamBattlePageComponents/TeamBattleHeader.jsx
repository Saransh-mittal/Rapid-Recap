// components/quickClashComponents/team/teamBattlePageComponents/TeamBattleHeader.jsx
import React from 'react'
import {
  HStack,
  Button,
  Heading,
  Icon,
  Flex,
  Text,
  Box,
  useBreakpointValue,
  VStack,
} from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { Users, ArrowLeft, Clock } from 'lucide-react'

/**
 * Header component for the Team Battle page (Animations Removed)
 */
const TeamBattleHeader = ({ battle, onGoBack }) => {
  const { t } = useTranslation('QuickClash')

  // Responsive values
  const headerSize = useBreakpointValue({ base: 'lg', md: 'xl' })
  const padding = useBreakpointValue({ base: 4, md: 6 })
  const iconSize = useBreakpointValue({ base: 6, md: 8 })

  return (
    <Flex
      direction="column"
      px={padding}
      py={6}
      mb={4}
      position="relative"
      overflow="hidden"
    >
      {/* Background glow effect */}
      <Box
        position="absolute"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        width="150%"
        height="200px"
        bgGradient={`radial(circle, rgba(128, 90, 213, 0.1) 0%, transparent 70%)`}
        filter="blur(40px)"
        zIndex={0}
      />

      {/* Main content container within the header card */}
      <VStack spacing={4} align="stretch" position="relative" zIndex={1}>
        {/* Top Row: Back Button and Expires Time */}
        <Flex justify="space-between" align="center" w="100%">
          <Button
            leftIcon={<ArrowLeft size={18} />}
            variant="ghost"
            colorScheme="purple"
            onClick={onGoBack}
            size="md"
            _hover={{
              bg: 'rgba(128, 90, 213, 0.2)',
            }}
            transition="all 0.2s"
          >
            {t('Back to Battles')}
          </Button>

          {battle.expiresAt && (
            <HStack spacing={2} color="whiteAlpha.700" fontSize="sm">
              <Icon as={Clock} boxSize={4} />
              <Text>
                {new Date(battle.expiresAt) > new Date()
                  ? t('Expires {{time}}', {
                      time: format(new Date(battle.expiresAt), 'MMM dd, HH:mm'),
                    })
                  : t('Expired {{time}}', {
                      time: format(new Date(battle.expiresAt), 'MMM dd, HH:mm'),
                    })}
              </Text>
            </HStack>
          )}
        </Flex>

        {/* Title and Subtitle Section - Aligned to start (left) */}
        <VStack align="flex-start" spacing={1}>
          <HStack spacing={3}>
            <Icon as={Users} boxSize={iconSize} color="purple.400" />
            <Heading
              size={headerSize}
              color="white"
              textShadow="0 2px 4px rgba(0,0,0,0.3)"
            >
              {t('4v4 Team Battle')}
            </Heading>
          </HStack>

          <Text
            color="whiteAlpha.700"
            fontSize={{ base: 'sm', md: 'md' }}
            fontWeight="medium"
            pl={iconSize + 12} // Indent subtitle to align with text of heading
          >
            {t('Challenge other teams in knowledge combat')}
          </Text>
        </VStack>
      </VStack>
    </Flex>
  )
}

export default TeamBattleHeader
