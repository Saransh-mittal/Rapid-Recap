// components/quickClashComponents/team/teamBattlePageComponents/categoriesSection/CategoryStatusBadge.jsx
import React, { memo } from 'react'
import {
  Badge,
  Icon,
  VStack,
  Progress,
  useBreakpointValue,
} from '@chakra-ui/react'
import { Clock, Star, Sparkles, CheckCircle, Zap, X } from 'lucide-react'

/**
 * Category Status Badge Component with All States Including Locked
 */
const CategoryStatusBadge = memo(
  ({
    isInProgress,
    isSelectedButNotStarted,
    isSelectedByTeammate,
    isAvailable,
    isLockedDueToExit, // NEW PROP
    t,
  }) => {
    const badgeFontSize = useBreakpointValue({
      base: '9px',
      sm: '10px',
      md: '11px',
    })

    // NEW: Locked state - highest priority
    if (isLockedDueToExit) {
      return (
        <Badge
          bg="rgba(107, 114, 128, 0.8)"
          color="gray.300"
          px={{ base: 2, sm: 3 }}
          py={{ base: 1, sm: 1.5 }}
          borderRadius="lg"
          fontSize={badgeFontSize}
          fontWeight="bold"
          display="flex"
          alignItems="center"
          border="1px solid"
          borderColor="rgba(107, 114, 128, 0.5)"
          boxShadow="0 2px 8px rgba(107, 114, 128, 0.2)"
        >
          <Icon as={X} boxSize="12px" mr={1.5} />
          {t('Locked')}
        </Badge>
      )
    }

    // In Progress - User has started the challenge
    if (isInProgress) {
      return (
        <VStack spacing={1.5}>
          <Badge
            bg="linear-gradient(135deg, #F59E0B, #D97706)"
            color="white"
            px={{ base: 2, sm: 3 }}
            py={{ base: 1, sm: 1.5 }}
            borderRadius="lg"
            fontSize={badgeFontSize}
            fontWeight="bold"
            display="flex"
            alignItems="center"
            boxShadow="0 4px 15px rgba(245, 158, 11, 0.3)"
          >
            <Icon as={Zap} boxSize="12px" mr={1.5} />
            {t('In Progress')}
          </Badge>
          <Progress
            value={75}
            size="sm"
            colorScheme="orange"
            borderRadius="full"
            width={{ base: '60px', sm: '80px' }}
            bg="rgba(245, 158, 11, 0.2)"
          />
        </VStack>
      )
    }

    // Selected but not started - User selected this category but hasn't begun the challenge
    if (isSelectedButNotStarted) {
      return (
        <VStack spacing={1.5}>
          <Badge
            bg="linear-gradient(135deg, #3B82F6, #1D4ED8)"
            color="white"
            px={{ base: 2, sm: 3 }}
            py={{ base: 1, sm: 1.5 }}
            borderRadius="lg"
            fontSize={badgeFontSize}
            fontWeight="bold"
            display="flex"
            alignItems="center"
            boxShadow="0 4px 15px rgba(59, 130, 246, 0.3)"
          >
            <Icon as={CheckCircle} boxSize="12px" mr={1.5} />
            {t('Selected')}
          </Badge>
          <Progress
            value={25}
            size="sm"
            colorScheme="blue"
            borderRadius="full"
            width={{ base: '60px', sm: '80px' }}
            bg="rgba(59, 130, 246, 0.2)"
          />
        </VStack>
      )
    }

    // Selected by teammate
    if (isSelectedByTeammate) {
      return (
        <Badge
          bg="linear-gradient(135deg, #8B5CF6, #7C3AED)"
          color="white"
          px={{ base: 2, sm: 3 }}
          py={{ base: 1, sm: 1.5 }}
          borderRadius="lg"
          fontSize={badgeFontSize}
          fontWeight="bold"
          display="flex"
          alignItems="center"
          boxShadow="0 4px 15px rgba(139, 92, 246, 0.3)"
        >
          <Icon as={Star} boxSize="12px" mr={1.5} />
          {t('Teammate')}
        </Badge>
      )
    }

    // Not available/locked (but not due to exit)
    if (!isAvailable) {
      return (
        <Badge
          bg="rgba(71, 85, 105, 0.8)"
          color="slate.300"
          px={{ base: 2, sm: 3 }}
          py={{ base: 1, sm: 1.5 }}
          borderRadius="lg"
          fontSize={badgeFontSize}
          fontWeight="500"
          backdropFilter="blur(5px)"
        >
          {t('Locked')}
        </Badge>
      )
    }

    // Available state
    return (
      <Badge
        bg="rgba(59, 130, 246, 0.2)"
        color="#3B82F6"
        px={{ base: 2, sm: 3 }}
        py={{ base: 1, sm: 1.5 }}
        borderRadius="full"
        fontSize={badgeFontSize}
        fontWeight="bold"
        display="flex"
        alignItems="center"
        border="2px solid"
        borderColor="rgba(59, 130, 246, 0.6)"
        boxShadow="0 0 20px rgba(59, 130, 246, 0.3)"
      >
        <Icon as={Sparkles} boxSize="12px" mr={1.5} />
        {t('Ready')}
      </Badge>
    )
  },
)

CategoryStatusBadge.displayName = 'CategoryStatusBadge'

export default CategoryStatusBadge
