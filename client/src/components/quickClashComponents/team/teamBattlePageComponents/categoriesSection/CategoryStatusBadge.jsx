// components/quickClashComponents/team/teamBattlePageComponents/categoriesSection/CategoryStatusBadge.jsx
import React, { memo } from 'react'
import {
  Badge,
  Icon,
  VStack,
  Progress,
  useBreakpointValue,
} from '@chakra-ui/react'
import { Star, Sparkles, CheckCircle, Zap, X, Lock } from 'lucide-react'

/**
 * Category Status Badge Component with Fixed Priority Logic (Mobile Responsive)
 */
const CategoryStatusBadge = memo(
  ({
    isInProgress,
    isSelectedButNotStarted,
    isSelectedByTeammate,
    isAvailable,
    isLockedDueToExit,
    isLockedDueToSelection,
    isCompletedByTeammate,
    t,
  }) => {
    // Responsive font sizes
    const badgeFontSize = useBreakpointValue({
      base: '8px',
      sm: '9px',
      md: '10px',
      lg: '11px',
      xl: '12px',
    })

    const badgePaddingX = useBreakpointValue({
      base: 1.5,
      sm: 2,
      md: 2.5,
      lg: 3,
      xl: 3.5,
    })

    const badgePaddingY = useBreakpointValue({
      base: 0.5,
      sm: 1,
      md: 1.5,
      lg: 1.5,
    })

    const iconSize = useBreakpointValue({
      base: '10px',
      sm: '11px',
      md: '12px',
      lg: '13px',
    })

    const progressWidth = useBreakpointValue({
      base: '50px',
      sm: '60px',
      md: '70px',
      lg: '80px',
      xl: '90px',
    })

    const progressSize = useBreakpointValue({
      base: 'xs',
      sm: 'sm',
      md: 'sm',
    })

    // Priority 1: User's own states (highest priority)
    if (isInProgress) {
      return (
        <VStack spacing={{ base: 1, sm: 1.5 }}>
          <Badge
            bg="linear-gradient(135deg, #F59E0B, #D97706)"
            color="white"
            px={badgePaddingX}
            py={badgePaddingY}
            borderRadius="lg"
            fontSize={badgeFontSize}
            fontWeight="bold"
            display="flex"
            alignItems="center"
            justifyContent="center"
            boxShadow="0 4px 15px rgba(245, 158, 11, 0.3)"
            maxW="100%"
            overflow="hidden"
            textOverflow="ellipsis"
            whiteSpace="nowrap"
          >
            <Icon as={Zap} boxSize={iconSize} mr={1} flexShrink={0} />
            {t('In Progress')}
          </Badge>
          <Progress
            value={75}
            size={progressSize}
            colorScheme="orange"
            borderRadius="full"
            width={progressWidth}
            bg="rgba(245, 158, 11, 0.2)"
          />
        </VStack>
      )
    }

    if (isSelectedButNotStarted) {
      return (
        <VStack spacing={{ base: 1, sm: 1.5 }}>
          <Badge
            bg="linear-gradient(135deg, #3B82F6, #1D4ED8)"
            color="white"
            px={badgePaddingX}
            py={badgePaddingY}
            borderRadius="lg"
            fontSize={badgeFontSize}
            fontWeight="bold"
            display="flex"
            alignItems="center"
            justifyContent="center"
            boxShadow="0 4px 15px rgba(59, 130, 246, 0.3)"
            maxW="100%"
            overflow="hidden"
            textOverflow="ellipsis"
            whiteSpace="nowrap"
          >
            <Icon as={CheckCircle} boxSize={iconSize} mr={1} flexShrink={0} />
            {t('Selected')}
          </Badge>
          <Progress
            value={25}
            size={progressSize}
            colorScheme="blue"
            borderRadius="full"
            width={progressWidth}
            bg="rgba(59, 130, 246, 0.2)"
          />
        </VStack>
      )
    }

    // Priority 2: Teammate states (medium-high priority)
    if (isCompletedByTeammate) {
      return (
        <Badge
          bg="linear-gradient(135deg, #8B5CF6, #7C3AED)"
          color="white"
          px={badgePaddingX}
          py={badgePaddingY}
          borderRadius="lg"
          fontSize={badgeFontSize}
          fontWeight="bold"
          display="flex"
          alignItems="center"
          justifyContent="center"
          boxShadow="0 4px 15px rgba(139, 92, 246, 0.3)"
          maxW="100%"
          overflow="hidden"
          textOverflow="ellipsis"
          whiteSpace="nowrap"
        >
          <Icon as={CheckCircle} boxSize={iconSize} mr={1} flexShrink={0} />
          {t('Completed')}
        </Badge>
      )
    }

    if (isSelectedByTeammate) {
      return (
        <Badge
          bg="linear-gradient(135deg, #8B5CF6, #7C3AED)"
          color="white"
          px={badgePaddingX}
          py={badgePaddingY}
          borderRadius="lg"
          fontSize={badgeFontSize}
          fontWeight="bold"
          display="flex"
          alignItems="center"
          justifyContent="center"
          boxShadow="0 4px 15px rgba(139, 92, 246, 0.3)"
          maxW="100%"
          overflow="hidden"
          textOverflow="ellipsis"
          whiteSpace="nowrap"
        >
          <Icon as={Star} boxSize={iconSize} mr={1} flexShrink={0} />
          {t('Teammate')}
        </Badge>
      )
    }

    // Priority 3: Lock states (medium priority)
    if (isLockedDueToExit) {
      return (
        <Badge
          bg="rgba(107, 114, 128, 0.8)"
          color="gray.300"
          px={badgePaddingX}
          py={badgePaddingY}
          borderRadius="lg"
          fontSize={badgeFontSize}
          fontWeight="bold"
          display="flex"
          alignItems="center"
          justifyContent="center"
          border="1px solid"
          borderColor="rgba(107, 114, 128, 0.5)"
          boxShadow="0 2px 8px rgba(107, 114, 128, 0.2)"
          maxW="100%"
          overflow="hidden"
          textOverflow="ellipsis"
          whiteSpace="nowrap"
        >
          <Icon as={X} boxSize={iconSize} mr={1} flexShrink={0} />
          {t('Locked')}
        </Badge>
      )
    }

    if (isLockedDueToSelection) {
      return (
        <Badge
          bg="rgba(245, 158, 11, 0.8)"
          color="orange.100"
          px={badgePaddingX}
          py={badgePaddingY}
          borderRadius="lg"
          fontSize={badgeFontSize}
          fontWeight="bold"
          display="flex"
          alignItems="center"
          justifyContent="center"
          border="1px solid"
          borderColor="rgba(245, 158, 11, 0.5)"
          boxShadow="0 2px 8px rgba(245, 158, 11, 0.2)"
          maxW="100%"
          overflow="hidden"
          textOverflow="ellipsis"
          whiteSpace="nowrap"
        >
          <Icon as={Lock} boxSize={iconSize} mr={1} flexShrink={0} />
          {t('Another Selected')}
        </Badge>
      )
    }

    // Priority 4: Available state (lowest priority)
    if (isAvailable) {
      return (
        <Badge
          bg="rgba(59, 130, 246, 0.2)"
          color="#3B82F6"
          px={badgePaddingX}
          py={badgePaddingY}
          borderRadius="full"
          fontSize={badgeFontSize}
          fontWeight="bold"
          display="flex"
          alignItems="center"
          justifyContent="center"
          border="2px solid"
          borderColor="rgba(59, 130, 246, 0.6)"
          boxShadow="0 0 20px rgba(59, 130, 246, 0.3)"
          maxW="100%"
          overflow="hidden"
          textOverflow="ellipsis"
          whiteSpace="nowrap"
        >
          <Icon as={Sparkles} boxSize={iconSize} mr={1} flexShrink={0} />
          {t('Ready')}
        </Badge>
      )
    }

    // Default: Not available/locked (general fallback)
    return (
      <Badge
        bg="rgba(71, 85, 105, 0.8)"
        color="slate.300"
        px={badgePaddingX}
        py={badgePaddingY}
        borderRadius="lg"
        fontSize={badgeFontSize}
        fontWeight="500"
        backdropFilter="blur(5px)"
        maxW="100%"
        overflow="hidden"
        textOverflow="ellipsis"
        whiteSpace="nowrap"
      >
        {t('Locked')}
      </Badge>
    )
  },
)

CategoryStatusBadge.displayName = 'CategoryStatusBadge'

export default CategoryStatusBadge
