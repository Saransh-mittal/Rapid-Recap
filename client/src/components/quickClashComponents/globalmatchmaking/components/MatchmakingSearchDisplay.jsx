// components/quickClashComponents/globalmatchmaking/components/MatchmakingSearchDisplay.jsx
import React from 'react'
import {
  VStack,
  Text,
  Box,
  HStack,
  Divider,
  Icon,
  Badge,
  Tooltip,
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Globe, Clock, User, UserPlus, Users, Info } from 'lucide-react'

// Import status updates panel
import StatusUpdatesPanel from './StatusUpdatesPanel'

const MotionFlex = motion(Box)
const MotionBadge = motion(Badge)
const MotionBox = motion(Box)

/**
 * Display component for when user is actively searching for a match
 */
const MatchmakingSearchDisplay = React.memo(
  ({
    matchmakingTime,
    badgeInfo,
    joinType,
    originalTeam,
    statusUpdates,
    formatMatchmakingTime,
  }) => {
    const { t } = useTranslation('QuickClash')

    // Get icon component from string name
    const getIconComponent = iconName => {
      const iconMap = {
        User,
        UserPlus,
        Users,
        Info,
      }
      return iconMap[iconName] || Users
    }

    const IconComponent = getIconComponent(badgeInfo.icon)

    return (
      <VStack spacing={6} align="center">
        {/* Animated Matchmaking Status */}
        <MotionFlex
          display={'flex'}
          justifyContent="center"
          alignItems="center"
          w="120px"
          h="120px"
          borderRadius="full"
          bg="rgba(66, 153, 225, 0.1)"
          border="2px solid"
          borderColor="blue.400"
          position="relative"
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        >
          <MotionBox
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          >
            <Icon as={Globe} color="blue.400" boxSize={16} />
          </MotionBox>
        </MotionFlex>

        {/* Matchmaking Type Badge */}
        <Tooltip label={badgeInfo.tooltip} hasArrow placement="top">
          <MotionBadge
            colorScheme={badgeInfo.color}
            px={3}
            py={2}
            borderRadius="full"
            fontSize="sm"
            display="flex"
            alignItems="center"
            animate={{
              y: [0, -2, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          >
            <Icon as={IconComponent} mr={2} boxSize={4} />
            {badgeInfo.text}
            {joinType !== 'regular' && (
              <Icon as={Info} ml={2} boxSize={3} opacity={0.7} />
            )}
          </MotionBadge>
        </Tooltip>

        {/* Auto-team formation info */}
        {joinType === 'sourceTeam' && originalTeam && (
          <Box
            bg="rgba(121, 80, 242, 0.1)"
            borderWidth="1px"
            borderColor="purple.500"
            borderRadius="md"
            p={3}
            w={{ base: '95%', md: '90%' }}
          >
            <HStack mb={1}>
              <Icon as={Info} color="purple.300" boxSize={4} />
              <Text color="white" fontWeight="bold" fontSize="sm">
                {t('Auto-Team Formation')}
              </Text>
            </HStack>
            <Text color="whiteAlpha.800" fontSize="sm">
              {t(
                'Your team "{{originalTeam}}" has been merged with other players to form a 4v4 battle team.',
                { originalTeam: originalTeam.name || t('Original Team') },
              )}
            </Text>
          </Box>
        )}

        {joinType === 'solo' && (
          <Box
            bg="rgba(49, 151, 149, 0.1)"
            borderWidth="1px"
            borderColor="teal.500"
            borderRadius="md"
            p={3}
            w={{ base: '95%', md: '90%' }}
          >
            <HStack mb={1}>
              <Icon as={Info} color="teal.300" boxSize={4} />
              <Text color="white" fontWeight="bold" fontSize="sm">
                {t('Auto-Team Formation')}
              </Text>
            </HStack>
            <Text color="whiteAlpha.800" fontSize="sm">
              {t(
                'You joined individually and have been assigned to a team with other players for a 4v4 battle.',
              )}
            </Text>
          </Box>
        )}

        {/* Main Status */}
        <VStack spacing={3} align="center">
          <Text color="white" fontSize="2xl" fontWeight="bold">
            {t('Finding Your 4v4 Battle')}
          </Text>
          <Text
            color="whiteAlpha.700"
            fontSize="md"
            textAlign="center"
            px={{ base: 2, md: 4 }}
          >
            {t('We are matching you with players of similar skill level...')}
          </Text>
        </VStack>

        <Divider borderColor="whiteAlpha.300" w="80%" />

        {/* Time and Status Display */}
        <HStack spacing={8} justify="center">
          <VStack spacing={1}>
            <Text color="whiteAlpha.600" fontSize="sm">
              {t('Time in Queue')}
            </Text>
            <HStack
              p={2}
              borderRadius="md"
              bg="whiteAlpha.100"
              border="1px solid"
              borderColor="whiteAlpha.200"
            >
              <Icon as={Clock} color="blue.300" boxSize={4} />
              <Text color="white" fontWeight="bold" fontFamily="mono">
                {formatMatchmakingTime(matchmakingTime)}
              </Text>
            </HStack>
          </VStack>

          <VStack spacing={1}>
            <Text color="whiteAlpha.600" fontSize="sm">
              {t('Status')}
            </Text>
            <MotionBadge
              colorScheme="blue"
              px={3}
              py={1}
              animate={{
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
            >
              {t('Searching')}
            </MotionBadge>
          </VStack>
        </HStack>

        {/* Status Updates Panel */}
        <StatusUpdatesPanel statusUpdates={statusUpdates} />

        {/* Info */}
        <Box w="100%" pt={4}>
          <Text
            color="whiteAlpha.600"
            fontSize="sm"
            textAlign="center"
            px={{ base: 2, md: 4 }}
          >
            {t(
              'You can close this modal and continue using the app. We will notify you when your battle is ready.',
            )}
          </Text>
        </Box>
      </VStack>
    )
  },
)

MatchmakingSearchDisplay.displayName = 'MatchmakingSearchDisplay'

export default MatchmakingSearchDisplay
