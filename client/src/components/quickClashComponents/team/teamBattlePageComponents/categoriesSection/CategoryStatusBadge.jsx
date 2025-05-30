// components/quickClashComponents/team/teamBattlePageComponents/categoriesSection/CategoryStatusBadge.jsx
import React, { memo } from 'react'
import {
  Badge,
  Icon,
  VStack,
  Progress,
  useBreakpointValue,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { Clock, Star, Sparkles } from 'lucide-react'

const MotionBox = motion.div

/**
 * Category Status Badge Component
 */
const CategoryStatusBadge = memo(
  ({ isUserAssigned, isSelectedByTeammate, isAvailable, t }) => {
    const badgeFontSize = useBreakpointValue({
      base: '9px',
      sm: '10px',
      md: '11px',
    })

    if (isUserAssigned) {
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
            <Icon as={Clock} boxSize="12px" mr={1.5} />
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
      <MotionBox
        animate={{ scale: [1, 1.05, 1], opacity: [0.9, 1, 0.9] }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
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
      </MotionBox>
    )
  },
)

CategoryStatusBadge.displayName = 'CategoryStatusBadge'

export default CategoryStatusBadge
