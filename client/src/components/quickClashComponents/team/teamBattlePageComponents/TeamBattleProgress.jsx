// components/quickClashComponents/team/teamBattlePageComponents/TeamBattleProgress.jsx
import React from 'react'
import {
  Box,
  Flex,
  Text,
  Badge,
  Progress,
  HStack,
  Icon,
  useBreakpointValue,
  VStack,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Target, Zap } from 'lucide-react'

const MotionBox = motion(Box)
const MotionProgress = motion(Progress)

/**
 * Enhanced component for displaying the progress bar of a team battle
 */
const TeamBattleProgress = ({ battleStatus, variants }) => {
  const { t } = useTranslation('QuickClash')

  // Responsive values
  const padding = useBreakpointValue({ base: 4, md: 6 })
  const fontSize = useBreakpointValue({ base: 'sm', md: 'md' })
  const progressSize = useBreakpointValue({ base: 'md', md: 'lg' })

  // Get progress color based on completion
  const getProgressColor = () => {
    if (battleStatus.completionPercentage >= 80) return 'green'
    if (battleStatus.completionPercentage >= 50) return 'blue'
    if (battleStatus.completionPercentage >= 25) return 'yellow'
    return 'purple'
  }

  const progressColor = getProgressColor()

  return (
    <MotionBox
      variants={variants}
      mx={{ base: 4, md: 6 }}
      mb={6}
      bg="rgba(26, 32, 44, 0.6)"
      backdropFilter="blur(10px)"
      borderRadius="xl"
      p={padding}
      borderWidth="1px"
      borderColor="whiteAlpha.200"
      position="relative"
      overflow="hidden"
    >
      {/* Animated background glow */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bgGradient={`linear(to-r, transparent 0%, rgba(128, 90, 213, 0.05) 50%, transparent 100%)`}
        opacity={0.8}
        transform="translateX(-100%)"
        animation={
          battleStatus.status === 'active' ? 'sweep 3s infinite' : 'none'
        }
        css={`
          @keyframes sweep {
            0% {
              transform: translateX(-100%);
            }
            100% {
              transform: translateX(100%);
            }
          }
        `}
      />

      <VStack spacing={4} position="relative" zIndex={1}>
        <Flex justify="space-between" align="center" w="100%">
          <HStack spacing={2}>
            <Icon as={Target} color="purple.400" boxSize={5} />
            <Text fontSize={fontSize} fontWeight="bold" color="white">
              {t('Battle Progress')}
            </Text>
          </HStack>

          <HStack spacing={3}>
            <Badge
              colorScheme={progressColor}
              variant="subtle"
              px={3}
              py={1}
              borderRadius="full"
              fontSize="sm"
            >
              {battleStatus.completionPercentage}%
            </Badge>
            <Badge
              colorScheme="gray"
              variant="outline"
              px={3}
              py={1}
              borderRadius="full"
              fontSize="sm"
            >
              {battleStatus.completedChallenges} /{' '}
              {battleStatus.totalChallenges} {t('Categories')}
            </Badge>
          </HStack>
        </Flex>

        <Box width="100%" position="relative">
          <MotionProgress
            value={battleStatus.completionPercentage}
            size={progressSize}
            colorScheme={progressColor}
            borderRadius="full"
            hasStripe
            isAnimated={battleStatus.status === 'active'}
            bg="rgba(255, 255, 255, 0.1)"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            style={{ transformOrigin: 'left' }}
            boxShadow={`0 0 20px rgba(${
              progressColor === 'green'
                ? '72, 187, 120'
                : progressColor === 'blue'
                ? '66, 153, 225'
                : progressColor === 'yellow'
                ? '236, 201, 75'
                : '128, 90, 213'
            }, 0.3)`}
          />

          {/* Progress indicator glow */}
          {battleStatus.status === 'active' && (
            <Box
              position="absolute"
              top="50%"
              left={`${battleStatus.completionPercentage}%`}
              transform="translate(-50%, -50%)"
              width="20px"
              height="20px"
              borderRadius="full"
              bg={`${progressColor}.400`}
              boxShadow={`0 0 20px rgba(${
                progressColor === 'green'
                  ? '72, 187, 120'
                  : progressColor === 'blue'
                  ? '66, 153, 225'
                  : progressColor === 'yellow'
                  ? '236, 201, 75'
                  : '128, 90, 213'
              }, 0.8)`}
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
            />
          )}
        </Box>

        {/* Status indicator */}
        {battleStatus.status === 'active' && (
          <HStack spacing={2} color="whiteAlpha.700" fontSize="sm">
            <Icon as={Zap} boxSize={4} />
            <Text>{t('Battle in progress...')}</Text>
          </HStack>
        )}
      </VStack>
    </MotionBox>
  )
}

export default TeamBattleProgress
