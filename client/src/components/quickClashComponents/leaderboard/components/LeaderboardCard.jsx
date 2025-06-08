// components/quickClashComponents/leaderboard/components/LeaderboardCard.jsx
import React, { useMemo, useState } from 'react'
import {
  Box,
  VStack,
  Text,
  Flex,
  Icon,
  Avatar,
  HStack,
  SimpleGrid,
  Collapse,
  Button,
  Divider,
  Tooltip,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  Trophy,
  TrendingUp,
  Award,
  Crown,
  Medal,
  Users,
  Percent,
  Target,
  UserRound,
  ArrowRight,
} from 'lucide-react'
import StatItem from './StatItem'

const MotionBox = motion(Box)

/*
  NOTE FOR DEVELOPER:
  If the list of cards is getting cut off at the bottom by a footer, the ideal
  solution is to add bottom padding to the SCROLLABLE PARENT CONTAINER that
  maps through and renders these LeaderboardCard components.

  For example, in the parent component:
  <VStack overflowY="auto" pb="80px"> // <-- Add padding-bottom here
    {users.map(user => <LeaderboardCard ... />)}
  </VStack>

  The `mb` property on MotionBox below is a workaround within this component.
*/

const LeaderboardCard = React.memo(
  ({ user, currentUserId, rank, onViewProfile }) => {
    const { t } = useTranslation('QuickClash')
    const isCurrentUser = user._id === currentUserId

    const [isStatsExpanded, setIsStatsExpanded] = useState(false)

    const handleToggleStats = () => {
      setIsStatsExpanded(!isStatsExpanded)
    }

    const handleProfileClick = event => {
      event.stopPropagation()
      onViewProfile(user.inGameName)
    }

    const rankStyle = useMemo(() => {
      const base = {
        textColor: 'whiteAlpha.900',
        iconColor: 'whiteAlpha.700',
        rankIconContainerBg: 'rgba(255, 255, 255, 0.05)',
        rankIconContainerBorder: 'rgba(255, 255, 255, 0.1)',
        cardBg: isCurrentUser
          ? 'linear-gradient(140deg, rgba(138, 75, 255, 0.22) 0%, rgba(138, 75, 255, 0.1) 100%)'
          : 'linear-gradient(140deg, rgba(45, 55, 72, 0.5) 0%, rgba(30, 35, 45, 0.5) 100%)',
        cardBorder: isCurrentUser ? 'purple.400' : 'rgba(255, 255, 255, 0.06)',
        cardShadow: isCurrentUser
          ? '0 0 10px rgba(138, 75, 255, 0.15)'
          : '0 2px 6px rgba(0,0,0,0.1)',
        trophyTextColor: 'yellow.400',
        nameColor: 'whiteAlpha.900',
      }

      if (rank === 1)
        return {
          ...base,
          iconColor: 'yellow.400',
          rankIcon: Crown,
          rankIconContainerBg: 'rgba(255, 215, 0, 0.15)',
          rankIconContainerBorder: 'rgba(255, 215, 0, 0.5)',
          cardBg:
            'linear-gradient(140deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 215, 0, 0.08) 100%)',
          cardBorder: 'yellow.400',
          cardShadow:
            '0 0 15px rgba(255, 215, 0, 0.25), 0 0 0 1px rgba(255,215,0,0.4)',
          trophyTextColor: 'yellow.300',
          nameColor: 'yellow.400',
        }
      if (rank === 2)
        return {
          ...base,
          iconColor: 'gray.200',
          rankIcon: Medal,
          rankIconContainerBg: 'rgba(192, 192, 192, 0.15)',
          rankIconContainerBorder: 'rgba(192, 192, 192, 0.5)',
          cardBg:
            'linear-gradient(140deg, rgba(192, 192, 192, 0.2) 0%, rgba(192, 192, 192, 0.08) 100%)',
          cardBorder: 'gray.300',
          cardShadow:
            '0 0 15px rgba(192,192,192,0.2), 0 0 0 1px rgba(192,192,192,0.35)',
          trophyTextColor: 'gray.100',
          nameColor: 'gray.200',
        }
      if (rank === 3)
        return {
          ...base,
          iconColor: 'orange.300',
          rankIcon: Medal,
          rankIconContainerBg: 'rgba(205, 127, 50, 0.15)',
          rankIconContainerBorder: 'rgba(205, 127, 50, 0.5)',
          cardBg:
            'linear-gradient(140deg, rgba(205, 127, 50, 0.2) 0%, rgba(205, 127, 50, 0.08) 100%)',
          cardBorder: 'orange.400',
          cardShadow:
            '0 0 15px rgba(205,127,50,0.25), 0 0 0 1px rgba(205,127,50,0.35)',
          trophyTextColor: 'orange.200',
          nameColor: 'orange.300',
        }
      return base
    }, [rank, t, isCurrentUser])

    // FIX: Moved cardVariants into its own useMemo and added defensive checks
    const cardVariants = useMemo(() => {
      let hoverShadow = '0 3px 10px rgba(0,0,0,0.15)' // Default for rank > 3

      // Defensively check for cardShadow before trying to use .replace on it
      if (rank <= 3 && rankStyle.cardShadow) {
        hoverShadow = rankStyle.cardShadow
          .replace('15px', '18px')
          .replace(
            /0\.\d+\)/,
            match => `${parseFloat(match.slice(0, -1)) + 0.05})`,
          )
      }

      return {
        hidden: { opacity: 0, y: 15, scale: 0.98 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: {
            type: 'spring',
            stiffness: 300,
            damping: 25,
            duration: 0.25,
          },
        },
        hover: {
          scale: 1.005,
          boxShadow: hoverShadow,
          borderColor:
            rank <= 3 ? rankStyle.borderColor : 'rgba(255,255,255,0.1)',
          transition: { type: 'spring', stiffness: 350, damping: 15 },
        },
        tap: {
          scale: 0.995,
          transition: { type: 'spring', stiffness: 380, damping: 12 },
        },
      }
    }, [rank, rankStyle]) // Dependencies for this memo

    const formatStatValue = (value, isPercentage = false) => {
      if (value === undefined || value === null) return 'N/A'
      const numValue = parseFloat(value)
      if (isNaN(numValue)) return 'N/A'
      return isPercentage ? `${numValue.toFixed(1)}%` : numValue.toFixed(1)
    }

    const formatStatValueInteger = value => {
      if (value === undefined || value === null) return 'N/A'
      const numValue = parseInt(value, 10)
      if (isNaN(numValue)) return 'N/A'
      return numValue
    }

    return (
      <Box px={{ base: 0.5, md: 1 }}>
        <MotionBox
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          whileHover="hover"
          whileTap="tap"
          onClick={handleToggleStats}
          cursor="pointer"
          position="relative"
          overflow="hidden"
          bg={rankStyle.cardBg}
          borderRadius="md"
          px={2.5}
          py={2}
          mt={1}
          mb={2}
          borderWidth="1px"
          borderColor={isStatsExpanded ? 'purple.300' : rankStyle.cardBorder}
          boxShadow={rankStyle.cardShadow}
          transition="border-color 0.2s ease-out, background 0.2s ease-out"
        >
          <HStack spacing={1.5} alignItems="center" width="100%">
            <Flex
              w="30px"
              h="30px"
              flexShrink={0}
              bg={rankStyle.rankIconContainerBg}
              borderRadius="sm"
              alignItems="center"
              justifyContent="center"
              border="1px solid"
              borderColor={rankStyle.rankIconContainerBorder}
            >
              {rank <= 3 ? (
                <Icon
                  as={rankStyle.rankIcon}
                  color={rankStyle.iconColor}
                  boxSize={'16px'}
                />
              ) : (
                <Text
                  fontWeight="semibold"
                  fontSize="sm"
                  color={rankStyle.textColor}
                  lineHeight="1"
                >
                  {rank}
                </Text>
              )}
            </Flex>

            <Avatar
              size="xs"
              name={user.name}
              src={user.pic}
              borderWidth="1px"
              flexShrink={0}
              borderColor={
                rank <= 3
                  ? rankStyle.borderColor
                  : isCurrentUser
                  ? 'purple.300'
                  : 'transparent'
              }
              boxShadow={
                rank <= 3
                  ? `0 0 3px ${rankStyle.iconColor}33`
                  : isCurrentUser
                  ? '0 0 3px rgba(138,75,255,0.3)'
                  : 'none'
              }
            />

            <VStack
              align="start"
              spacing={0}
              flexGrow={1}
              minWidth={0}
              overflow="hidden"
            >
              <Tooltip
                label={user.inGameName || user.name}
                placement="top-start"
                hasArrow
                bg="gray.800"
                color="whiteAlpha.900"
                fontSize="xs"
                px={2}
                py={1}
                borderRadius="md"
                openDelay={400}
                isDisabled={isStatsExpanded}
              >
                <Text
                  fontWeight="semibold"
                  color={rankStyle.nameColor}
                  fontSize="sm"
                  lineHeight="1.2"
                  noOfLines={1}
                >
                  {user.inGameName || user.name}
                </Text>
              </Tooltip>
              <Text
                fontSize="2xs"
                color={isCurrentUser ? 'purple.300' : 'whiteAlpha.500'}
                fontWeight="medium"
                lineHeight="1"
              >
                {isCurrentUser ? t('You') : null}
              </Text>
            </VStack>

            <HStack spacing={1} alignItems="center" flexShrink={0}>
              <Icon as={Trophy} color={rankStyle.trophyTextColor} boxSize={4} />
              <Text
                fontSize="sm"
                fontWeight="bold"
                color={rankStyle.trophyTextColor}
                lineHeight="1"
              >
                {user.trophies || 0}
              </Text>
            </HStack>
          </HStack>

          <Collapse in={isStatsExpanded} animateOpacity unmountOnExit>
            <VStack align="stretch" spacing={3} mt={3} pb={1}>
              <Divider borderColor="whiteAlpha.200" />
              <SimpleGrid columns={2} spacingX={2} spacingY={2}>
                <StatItem
                  icon={Trophy}
                  label={t('1v1 Wins')}
                  value={formatStatValueInteger(
                    user.wins1v1 !== undefined ? user.wins1v1 : user.wins,
                  )}
                  color="#58D68D"
                />
                <StatItem
                  icon={Users}
                  label={t('4v4 Wins')}
                  value={formatStatValueInteger(user.wins4v4)}
                  color="#F39C12"
                />
                <StatItem
                  icon={TrendingUp}
                  label={t('1v1 Win %')}
                  value={formatStatValue(
                    user.winRate1v1 !== undefined
                      ? user.winRate1v1
                      : user.winRate,
                    true,
                  )}
                  color="#5DADE2"
                />
                <StatItem
                  icon={Percent}
                  label={t('4v4 Win Rate')}
                  value={formatStatValue(user.winRate4v4, true)}
                  color="#3498DB"
                />
                <StatItem
                  icon={Award}
                  label={t('1v1 Avg Score')}
                  value={formatStatValue(
                    user.avgScore1v1 !== undefined
                      ? user.avgScore1v1
                      : user.avgScore,
                  )}
                  color="#AF7AC5"
                />
                <StatItem
                  icon={Target}
                  label={t('4v4 Avg Score')}
                  value={formatStatValue(user.avgScore4v4)}
                  color="#1ABC9C"
                />
              </SimpleGrid>

              <Button
                mt={1}
                size="sm"
                width="full"
                variant="outline"
                borderColor="whiteAlpha.300"
                color="whiteAlpha.800"
                fontWeight="medium"
                onClick={handleProfileClick}
                leftIcon={<Icon as={UserRound} boxSize="14px" />}
                rightIcon={<Icon as={ArrowRight} boxSize="14px" />}
                _hover={{
                  bg: 'whiteAlpha.200',
                  borderColor: 'purple.300',
                  color: 'white',
                }}
                _active={{ bg: 'whiteAlpha.300' }}
              >
                {t('View Profile')}
              </Button>
            </VStack>
          </Collapse>
        </MotionBox>
      </Box>
    )
  },
)

LeaderboardCard.displayName = 'LeaderboardCard'
export default LeaderboardCard
