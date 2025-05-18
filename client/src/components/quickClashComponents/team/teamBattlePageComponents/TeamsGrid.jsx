// components/quickClashComponents/team/teamBattlePageComponents/TeamsGrid.jsx
import React from 'react'
import {
  Grid,
  Flex,
  Text,
  Box,
  VStack,
  HStack,
  Badge,
  Avatar,
  Icon,
  useBreakpointValue,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Users, Star, Trophy, Zap } from 'lucide-react'

const MotionBox = motion(Box)
const MotionFlex = motion(Flex)

/**
 * Enhanced component to display both teams with improved visual appeal
 */
const TeamsGrid = ({ currentBattle, userTeam, userId, variants }) => {
  const { t } = useTranslation('QuickClash')

  // Responsive values
  const padding = useBreakpointValue({ base: 4, md: 6 })
  const spacing = useBreakpointValue({ base: 3, md: 4 })
  const avatarSize = useBreakpointValue({ base: 'md', md: 'lg' })

  const TeamSection = ({ team, teamType, members, wins, isUserTeam }) => (
    <MotionBox
      variants={variants}
      bg={`rgba(${
        teamType === 'teamA' ? '66, 153, 225' : '245, 101, 101'
      }, 0.1)`}
      backdropFilter="blur(10px)"
      borderRadius="xl"
      p={padding}
      borderWidth="2px"
      borderColor={
        isUserTeam
          ? 'purple.500'
          : teamType === 'teamA'
          ? 'blue.500'
          : 'red.500'
      }
      position="relative"
      overflow="hidden"
      whileHover={{ scale: 1.02, y: -5 }}
      transition={{ duration: 0.3 }}
    >
      {/* Animated background gradient */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bgGradient={`linear(45deg, transparent 0%, rgba(${
          teamType === 'teamA' ? '66, 153, 225' : '245, 101, 101'
        }, 0.05) 50%, transparent 100%)`}
        opacity={0.7}
      />

      {/* Floating particles effect */}
      {isUserTeam && (
        <>
          {[...Array(5)].map((_, i) => (
            <MotionBox
              key={i}
              position="absolute"
              width="4px"
              height="4px"
              bg="purple.400"
              borderRadius="full"
              initial={{
                x: Math.random() * 100 + '%',
                y: '100%',
                opacity: 0,
              }}
              animate={{
                y: '-20px',
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.5,
              }}
            />
          ))}
        </>
      )}

      <VStack spacing={spacing} position="relative" zIndex={1}>
        {/* Team Header */}
        <Flex justify="space-between" align="center" w="100%">
          <HStack spacing={2}>
            <Badge
              colorScheme={teamType === 'teamA' ? 'blue' : 'red'}
              variant="solid"
              px={3}
              py={1}
              borderRadius="lg"
              fontSize="sm"
              fontWeight="bold"
            >
              {teamType === 'teamA' ? t('Team A') : t('Team B')}
            </Badge>
            <Text fontWeight="bold" color="white" fontSize="lg" noOfLines={1}>
              {team?.name || (teamType === 'teamA' ? t('Team A') : t('Team B'))}
            </Text>
            {isUserTeam && (
              <Badge colorScheme="purple" variant="subtle" fontSize="xs">
                <Icon as={Star} boxSize={3} mr={1} />
                {t('Your Team')}
              </Badge>
            )}
          </HStack>

          <Badge
            colorScheme="green"
            variant="outline"
            px={3}
            py={1}
            borderRadius="lg"
            fontSize="md"
            fontWeight="bold"
          >
            <Icon as={Trophy} boxSize={4} mr={1} />
            {wins || 0}
          </Badge>
        </Flex>

        {/* Team Members */}
        <VStack align="stretch" spacing={3} w="100%">
          {members.map((member, index) => (
            <MotionBox
              key={member.user._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Flex
                justify="space-between"
                align="center"
                bg={
                  member.user._id === userId
                    ? 'rgba(128, 90, 213, 0.2)'
                    : 'rgba(255, 255, 255, 0.05)'
                }
                p={3}
                borderRadius="lg"
                borderWidth={member.user._id === userId ? '2px' : '1px'}
                borderColor={
                  member.user._id === userId ? 'purple.500' : 'transparent'
                }
                position="relative"
                overflow="hidden"
              >
                {/* User highlight glow */}
                {member.user._id === userId && (
                  <Box
                    position="absolute"
                    top={0}
                    left={0}
                    right={0}
                    bottom={0}
                    bgGradient="linear(45deg, rgba(128, 90, 213, 0.1), transparent)"
                    borderRadius="lg"
                  />
                )}

                <HStack spacing={3} position="relative" zIndex={1}>
                  <Avatar
                    size={avatarSize}
                    name={member.user.name || member.user.inGameName}
                    src={member.user.pic}
                    borderWidth="2px"
                    borderColor={
                      member.user._id === userId
                        ? 'purple.500'
                        : 'whiteAlpha.300'
                    }
                  />
                  <VStack align="flex-start" spacing={0} flex="1">
                    <Text
                      color="white"
                      fontWeight={
                        member.user._id === userId ? 'bold' : 'medium'
                      }
                      fontSize="md"
                      noOfLines={1}
                    >
                      {member.user.name || member.user.inGameName}
                    </Text>
                    {member.category && (
                      <Badge colorScheme="blue" variant="subtle" fontSize="xs">
                        {member.category}
                      </Badge>
                    )}
                  </VStack>
                </HStack>

                <VStack spacing={1} align="end">
                  {member.completed ? (
                    <Badge colorScheme="green" px={2} py={1} borderRadius="md">
                      <Icon as={Trophy} boxSize={3} mr={1} />
                      {member.score} {t('pts')}
                    </Badge>
                  ) : member.participated ? (
                    <Badge colorScheme="yellow" px={2} py={1} borderRadius="md">
                      <Icon as={Zap} boxSize={3} mr={1} />
                      {t('Playing')}
                    </Badge>
                  ) : (
                    <Badge colorScheme="gray" px={2} py={1} borderRadius="md">
                      {t('Waiting')}
                    </Badge>
                  )}
                </VStack>
              </Flex>
            </MotionBox>
          ))}
        </VStack>
      </VStack>
    </MotionBox>
  )

  return (
    <Box mx={{ base: 4, md: 6 }} mb={6}>
      <Grid
        templateColumns={{ base: '1fr', md: '1fr auto 1fr' }}
        gap={spacing}
        alignItems="center"
      >
        {/* Team A */}
        <TeamSection
          team={currentBattle.teamA}
          teamType="teamA"
          members={currentBattle.teamAMembers}
          wins={currentBattle.teamAWins}
          isUserTeam={userTeam === 'teamA'}
        />

        {/* VS Section */}
        <MotionFlex
          variants={variants}
          display={{ base: 'none', md: 'flex' }}
          align="center"
          justify="center"
          p={4}
          position="relative"
        >
          <MotionBox
            animate={{
              rotateY: [0, 360],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          >
            <Text
              fontSize="3xl"
              fontWeight="black"
              color="whiteAlpha.700"
              textShadow="0 2px 4px rgba(0,0,0,0.3)"
            >
              VS
            </Text>
          </MotionBox>

          {/* Lightning effect */}
          <Box
            position="absolute"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            width="2px"
            height="40px"
            bg="purple.500"
            opacity={0.3}
            animate={{
              opacity: [0.3, 0.8, 0.3],
              scaleY: [1, 1.5, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          />
        </MotionFlex>

        {/* Team B */}
        <TeamSection
          team={currentBattle.teamB}
          teamType="teamB"
          members={currentBattle.teamBMembers}
          wins={currentBattle.teamBWins}
          isUserTeam={userTeam === 'teamB'}
        />
      </Grid>

      {/* Mobile VS indicator */}
      <Flex display={{ base: 'flex', md: 'none' }} justify="center" py={4}>
        <Text
          fontSize="2xl"
          fontWeight="bold"
          color="whiteAlpha.600"
          textShadow="0 2px 4px rgba(0,0,0,0.3)"
        >
          VS
        </Text>
      </Flex>
    </Box>
  )
}

export default TeamsGrid
