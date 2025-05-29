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
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { Users, ArrowLeft, Clock } from 'lucide-react' // Ensured only used icons are imported

const MotionFlex = motion(Flex)
const MotionButton = motion(Button)

/**
 * Enhanced Header component for the Team Battle page with better visual appeal
 */
const TeamBattleHeader = ({
  battle, // Retained as battle.expiresAt is used
  // battleStatus, // Removed as it was likely for getStatusInfo
  // userTeam, // Removed as it was likely for getStatusInfo
  onGoBack,
  variants,
}) => {
  const { t } = useTranslation('QuickClash')

  // Responsive values
  const headerSize = useBreakpointValue({ base: 'lg', md: 'xl' })
  const padding = useBreakpointValue({ base: 4, md: 6 })
  const iconSize = useBreakpointValue({ base: 6, md: 8 })

  // getStatusInfo function and statusInfo variable have been completely removed.

  return (
    <MotionFlex
      variants={variants}
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

      <Flex
        justify="space-between" // This might not be needed if the right column is truly empty.
        align={{ base: 'flex-start', md: 'center' }} // md: 'center' might also be less relevant now.
        direction={{ base: 'column', md: 'row' }}
        gap={{ base: 4, md: 0 }}
        position="relative"
        zIndex={1}
      >
        {/* Main Content Column (formerly Left Column) */}
        <Flex direction="column" align="flex-start">
          <MotionButton
            leftIcon={<ArrowLeft size={18} />}
            variant="ghost"
            colorScheme="purple"
            onClick={onGoBack}
            size="md"
            mb={3}
            whileHover={{ scale: 1.05, x: -5 }}
            whileTap={{ scale: 0.95 }}
            _hover={{
              bg: 'rgba(128, 90, 213, 0.2)',
              transform: 'translateX(-5px)',
            }}
            transition="all 0.2s"
          >
            {t('Back')}
          </MotionButton>

          {/* Moved and Styled Expires Text */}
          {battle.expiresAt && (
            <HStack spacing={2} color="whiteAlpha.700" fontSize="sm" mb={3}>
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

          <HStack spacing={3} mb={2}>
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
          >
            {t('Challenge other teams in knowledge combat')}
          </Text>
        </Flex>

        {/* Right Column: This Flex container is now empty.
            Consider removing it or repurposing if needed in the future.
            For now, leaving it to maintain the original structure slightly,
            but it doesn't render anything visible. */}
        <Flex
          direction="column"
          align={{ base: 'center', md: 'flex-end' }}
          gap={3}
        >
          {/* Content previously here (MotionBadge, Expires text) has been removed or moved */}
        </Flex>
      </Flex>
    </MotionFlex>
  )
}

export default TeamBattleHeader
