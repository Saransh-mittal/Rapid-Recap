// components/quickClashComponents/team/teamBattlePageComponents/TeamBattleHeader.jsx
import React from 'react'
import {
  HStack,
  Button,
  Heading,
  Icon,
  Flex,
  Badge,
  Text,
  Box,
  useBreakpointValue,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { Users, ArrowLeft, Clock, Trophy, Swords } from 'lucide-react'

const MotionFlex = motion(Flex)
const MotionBadge = motion(Badge)
const MotionButton = motion(Button)

/**
 * Enhanced Header component for the Team Battle page with better visual appeal
 */
const TeamBattleHeader = ({
  battle,
  battleStatus,
  userTeam,
  onGoBack,
  variants,
}) => {
  const { t } = useTranslation('QuickClash')

  // Responsive values
  const headerSize = useBreakpointValue({ base: 'lg', md: 'xl' })
  const padding = useBreakpointValue({ base: 4, md: 6 })
  const iconSize = useBreakpointValue({ base: 6, md: 8 })

  // Get battle status icon and color
  const getStatusInfo = () => {
    if (battle.status === 'completed') {
      if (battle.winner === userTeam) {
        return { icon: Trophy, color: 'green', text: t('Victory!') }
      } else if (battle.winner === 'tie') {
        return { icon: Swords, color: 'yellow', text: t('Draw!') }
      } else {
        return { icon: Swords, color: 'red', text: t('Defeat!') }
      }
    } else if (battle.status === 'active') {
      return { icon: Swords, color: 'blue', text: t('In Progress') }
    } else {
      return { icon: Clock, color: 'gray', text: t('Expired') }
    }
  }

  const statusInfo = getStatusInfo()

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
        justify="space-between"
        align={{ base: 'flex-start', md: 'center' }}
        direction={{ base: 'column', md: 'row' }}
        gap={{ base: 4, md: 0 }}
        position="relative"
        zIndex={1}
      >
        <Flex direction="column" align={{ base: 'center', md: 'flex-start' }}>
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

        <Flex
          direction="column"
          align={{ base: 'center', md: 'flex-end' }}
          gap={3}
        >
          <MotionBadge
            colorScheme={statusInfo.color}
            variant="solid"
            p={3}
            borderRadius="lg"
            fontSize="md"
            fontWeight="bold"
            display="flex"
            alignItems="center"
            gap={2}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.05 }}
            boxShadow={`0 0 20px rgba(${
              statusInfo.color === 'green'
                ? '72, 187, 120'
                : statusInfo.color === 'red'
                ? '245, 101, 101'
                : statusInfo.color === 'yellow'
                ? '236, 201, 75'
                : '66, 153, 225'
            }, 0.4)`}
          >
            <Icon as={statusInfo.icon} />
            {statusInfo.text}
          </MotionBadge>

          {/* Time info */}
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
      </Flex>
    </MotionFlex>
  )
}

export default TeamBattleHeader
