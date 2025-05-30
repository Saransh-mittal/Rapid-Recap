// components/quickClashComponents/team/teamBattlePageComponents/battleResultsSection/ResultHeader.jsx
import React, { memo } from 'react'
import { VStack, Badge, Icon, useBreakpointValue } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { Crown, Award, Target } from 'lucide-react'

const MotionBox = motion.div

/**
 * Responsive Result Header Component - Shows victory/defeat badge with animations
 */
const ResultHeader = memo(({ resultData, animationPhase, t }) => {
  // Responsive values
  const badgeSize = useBreakpointValue({
    base: 'lg',
    md: 'xl',
    lg: '2xl',
  })

  const badgePadding = useBreakpointValue({
    base: { px: 6, py: 2 },
    md: { px: 8, py: 3 },
    lg: { px: 10, py: 4 },
  })

  const iconSize = useBreakpointValue({
    base: 4,
    md: 5,
    lg: 6,
  })

  // Get result icon based on outcome
  const getResultIcon = () => {
    if (resultData.isUserWinner) return Crown
    if (resultData.isTie) return Award
    return Target
  }

  const ResultIcon = getResultIcon()

  // Get result text
  const getResultText = () => {
    if (resultData.isUserWinner) return t('VICTORY!')
    if (resultData.isTie) return t('DRAW!')
    return t('DEFEAT!')
  }

  return (
    <MotionBox
      initial={{ scale: 0, opacity: 0 }}
      animate={animationPhase !== 'initial' ? { scale: 1, opacity: 1 } : {}}
      transition={{ duration: 0.5, type: 'spring', bounce: 0.3 }}
    >
      <Badge
        bg={`linear-gradient(135deg, ${
          resultData.resultColor === 'green'
            ? '#10B981, #059669'
            : resultData.resultColor === 'red'
            ? '#EF4444, #DC2626'
            : '#F59E0B, #D97706'
        })`}
        color="white"
        {...badgePadding}
        borderRadius="full"
        fontSize={badgeSize}
        fontWeight="bold"
        letterSpacing="wide"
        display="flex"
        alignItems="center"
        gap={2}
      >
        <Icon as={ResultIcon} boxSize={iconSize} />
        {getResultText()}
      </Badge>
    </MotionBox>
  )
})

ResultHeader.displayName = 'ResultHeader'

export default ResultHeader
