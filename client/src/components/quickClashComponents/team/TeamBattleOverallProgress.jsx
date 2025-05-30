// src/components/quickClashComponents/team/teamBattlePageComponents/TeamBattleOverallProgress.jsx
import React from 'react'
import {
  Box,
  CircularProgress,
  CircularProgressLabel,
  Text,
  VStack,
  HStack,
  Icon,
  Heading,
  useBreakpointValue,
  useTheme, // To access theme colors
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader,
} from 'lucide-react' // Icons for status

const MotionBox = motion(Box)

const TeamBattleOverallProgress = ({ battleStatus, variants }) => {
  const { t } = useTranslation('QuickClash')
  const theme = useTheme()

  // Responsive Styles
  const containerPadding = useBreakpointValue({ base: 4, sm: 5, md: 6 })
  const progressSize = useBreakpointValue({
    base: '90px',
    sm: '110px',
    md: '120px',
  })
  const progressThickness = useBreakpointValue({ base: '8px', sm: '10px' })
  const titleFontSize = useBreakpointValue({ base: 'lg', sm: 'xl' })
  const percentageFontSize = useBreakpointValue({
    base: 'xl',
    sm: '2xl',
    md: '3xl',
  })
  const statusTextFontSize = useBreakpointValue({ base: 'xs', sm: 'sm' })
  const captionFontSize = useBreakpointValue({ base: 'sm', sm: 'md' })
  const headerIconSize = useBreakpointValue({ base: 5, sm: 6 })

  // Early exit if data isn't ready or no challenges
  if (!battleStatus || battleStatus.totalChallenges === 0) {
    return null
  }

  const {
    status,
    statusColor, // e.g., 'blue', 'green', 'yellow', 'red'
    completionPercentage,
    completedChallenges,
    totalChallenges,
  } = battleStatus

  // Determine theme color and icon based on status
  let progressTrackColor = theme.colors.gray[700] // Default track
  let progressValueColor = theme.colors.blue[400] // Default for 'active'
  let StatusIconComponent = TrendingUp

  switch (statusColor) {
    case 'green':
      progressValueColor = theme.colors.green[400]
      StatusIconComponent = CheckCircle
      break
    case 'yellow':
      progressValueColor = theme.colors.yellow[400]
      StatusIconComponent = AlertCircle // Or a tie icon if you have one
      break
    case 'red':
      progressValueColor = theme.colors.red[400]
      StatusIconComponent = XCircle
      break
    case 'blue': // active
      progressValueColor = theme.colors.blue[400]
      StatusIconComponent = TrendingUp
      break
    default: // loading or other
      progressValueColor = theme.colors.gray[400]
      StatusIconComponent = Loader
      break
  }

  return (
    <MotionBox
      variants={variants}
      mx={{ base: 3, sm: 4, md: 6, lg: 8 }}
      my={{ base: 4, sm: 6 }}
      position="relative"
      overflow="hidden"
    >
      {/* Background Styling */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bg="rgba(15, 23, 42, 0.92)" // Slightly transparent dark blue
        backdropFilter="blur(12px)"
        borderRadius="xl"
        border="1px solid"
        borderColor="rgba(71, 85, 105, 0.25)"
        boxShadow="0 12px 35px rgba(0, 0, 0, 0.25)"
      />

      <VStack
        spacing={{ base: 3, md: 4 }}
        p={containerPadding}
        align="center"
        position="relative"
        zIndex={1}
      >
        {/* Header */}
        <HStack spacing={2.5} align="center">
          <Icon
            as={StatusIconComponent}
            color={progressValueColor}
            boxSize={headerIconSize}
          />
          <Heading
            size={titleFontSize}
            color="whiteAlpha.900"
            fontWeight="semibold"
          >
            {t('Battle Progress')}
          </Heading>
        </HStack>

        {/* Circular Progress */}
        <CircularProgress
          value={completionPercentage}
          size={progressSize}
          color={progressValueColor}
          trackColor={progressTrackColor}
          thickness={progressThickness}
          capIsRound
          aria-label={t('Overall battle completion percentage')}
        >
          <CircularProgressLabel>
            <VStack spacing={0}>
              <Text
                fontSize={percentageFontSize}
                fontWeight="bold"
                color="white"
              >
                {`${completionPercentage}%`}
              </Text>
              <Text
                fontSize={statusTextFontSize}
                color={`${statusColor}.300`} // Use the statusColor for text too
                textTransform="capitalize"
                fontWeight="medium"
              >
                {t(status)}
              </Text>
            </VStack>
          </CircularProgressLabel>
        </CircularProgress>

        {/* Caption */}
        <Text
          fontSize={captionFontSize}
          color="whiteAlpha.700"
          textAlign="center"
        >
          {t('{{completed}}/{{total}} Categories Resolved', {
            completed: completedChallenges,
            total: totalChallenges,
          })}
        </Text>
      </VStack>
    </MotionBox>
  )
}

export default TeamBattleOverallProgress
