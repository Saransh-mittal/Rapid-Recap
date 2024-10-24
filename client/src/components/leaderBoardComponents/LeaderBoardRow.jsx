import React, { useState, useCallback, useMemo } from 'react'
import {
  Box,
  VStack,
  HStack,
  Text,
  Avatar,
  useColorModeValue,
  Flex,
  Grid,
  GridItem,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import BadgeIcon from './BadgeIcon'
import ScoreItem from './ScoreItem'
import NameLightning from '../miscellaneous/NameLightning'
import { findSocietyAndCircle } from '../../utils/helper.utils'
import { useTranslation } from 'react-i18next'

const MotionBox = motion(Box)

const RankIcon = React.memo(({ rank }) => (
  <Text fontSize="lg" fontWeight="bold">
    {rank}
  </Text>
))

const LeaderboardRow = React.memo(({ user, rank, isCurrentUser, onClick }) => {
  const { t } = useTranslation('LeaderBoardRow')
  const [isBadgeHovered, setIsBadgeHovered] = useState(false)
  const [isBadgePopoverOpen, setIsBadgePopoverOpen] = useState(false)

  const textColor = useColorModeValue('gray.100', 'gray.200')
  const accentColor = 'pink.400'

  const handleBadgeHover = useCallback(isHovered => {
    setIsBadgeHovered(isHovered)
  }, [])

  const handleBadgePopoverToggle = useCallback(isOpen => {
    setIsBadgePopoverOpen(isOpen)
  }, [])

  const isHoverDisabled = isBadgeHovered || isBadgePopoverOpen

  const societyAndCircle = useMemo(
    () => findSocietyAndCircle(user.IQ_score),
    [user.IQ_score],
  )
  const maxSocietyAndCircle = useMemo(
    () => findSocietyAndCircle(user.maxIQScore),
    [user.maxIQScore],
  )

  const handleClick = useCallback(
    e => {
      if (!isHoverDisabled) {
        onClick(e)
      }
    },
    [isHoverDisabled, onClick],
  )

  const badgeIconMemo = useMemo(
    () => (
      <BadgeIcon
        user={user}
        size={'60px'}
        onPopoverToggle={handleBadgePopoverToggle}
      />
    ),
    [user, handleBadgePopoverToggle],
  )

  const scoreItemsMemo = useMemo(
    () => (
      <>
        <ScoreItem
          label={t('IQ Score')}
          value={user.IQ_score.toFixed(1)}
          color={accentColor}
        />
        <ScoreItem
          label={t('Exp Level')}
          value={user.level}
          color={textColor}
        />
        <ScoreItem
          label={t('Submissions')}
          value={user.quizSubmissions}
          color={textColor}
        />
        <ScoreItem
          label={t('Avg. RQM')}
          value={user.RQM_avg}
          color={textColor}
        />
      </>
    ),
    [user, t, accentColor, textColor],
  )

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={isHoverDisabled ? {} : { scale: 1.02 }}
      // backgroundColor="rgba(15, 13, 21, 0.4)"
      // boxShadow="0px 4px 8px rgba(0, 0, 0, 0.3), 0px 8px 16px rgba(0, 0, 0, 0.3), 0px 12px 24px rgba(0, 0, 0, 0.3)"
      p={{ base: 3, md: 4 }}
      borderRadius="xl"
      border="1px solid"
      // borderColor={isCurrentUser ? accentColor : 'transparent'}
      onClick={handleClick}
      cursor={isHoverDisabled ? 'default' : 'pointer'}
      position="relative"
      bgGradient="linear(to-r, rgba(28, 20, 56, 0.4) 0%, rgba(35, 25, 70, 0.4) 50%, rgba(28, 20, 56, 0.4) 100%)"
      _hover={{
        bgGradient:
          'linear(to-r, rgba(35, 25, 70, 0.5) 0%, rgba(45, 32, 89, 0.5) 50%, rgba(35, 25, 70, 0.5) 100%)',
      }}
      // boxShadow={
      //   isCurrentUser
      //     ? `0px 4px 20px rgba(255, 92, 152, 0.2),
      //    inset 0px 0px 20px rgba(255, 92, 152, 0.1)`
      //     : '0px 4px 20px rgba(0, 0, 0, 0.3)'
      // }
      borderColor={isCurrentUser ? accentColor : 'rgba(255, 255, 255, 0.05)'}
      // backdropFilter="blur(12px)"
      // transition="all 0.2s ease-in-out"
    >
      <Grid
        templateColumns={{ base: 'auto 1fr auto', md: 'auto 1fr auto' }}
        gap={{ base: 3, md: 6 }}
        alignItems="center"
      >
        <GridItem>
          <HStack spacing={{ base: 1, md: 3 }}>
            <Flex
              w="36px"
              h="36px"
              align="center"
              justify="center"
              borderRadius="full"
            >
              <RankIcon rank={rank} />
            </Flex>
            <Avatar
              size={{ base: 'sm', md: 'md' }}
              name={user.name}
              src={
                user.pic ||
                `https://avatars.dicebear.com/api/initials/${user.name}.svg`
              }
            />
          </HStack>
        </GridItem>
        <GridItem>
          <VStack align="start" spacing={0}>
            <Flex position={'relative'} px={2}>
              <Text
                fontSize={{ base: 'sm', md: 'lg' }}
                fontWeight="bold"
                color={
                  user.rankedInCurrentSeason
                    ? societyAndCircle?.textColor
                    : 'gray.400'
                }
              >
                {user.name}
              </Text>
              <NameLightning
                boxShadow={maxSocietyAndCircle?.boxShadow}
                MAX_IQ={user.maxIQScore}
              />
            </Flex>
            <Text
              fontSize={{ base: 'xs', md: 'md' }}
              color={accentColor}
              fontWeight="semibold"
            >
              @{user.inGameName}
            </Text>
          </VStack>
        </GridItem>
        <GridItem justifySelf="end">
          <HStack spacing={6} display={{ base: 'none', md: 'flex' }}>
            <Box
              onMouseEnter={() => handleBadgeHover(true)}
              onMouseLeave={() => handleBadgeHover(false)}
              onClick={e => e.stopPropagation()}
            >
              {badgeIconMemo}
            </Box>
            {scoreItemsMemo}
          </HStack>
          <Flex justify="flex-end" display={{ base: 'flex', md: 'none' }}>
            <Box
              onMouseEnter={() => handleBadgeHover(true)}
              onMouseLeave={() => handleBadgeHover(false)}
              onClick={e => e.stopPropagation()}
            >
              <BadgeIcon
                user={user}
                size="48px"
                onPopoverToggle={handleBadgePopoverToggle}
              />
            </Box>
          </Flex>
        </GridItem>
      </Grid>
      <Grid
        mt={3}
        templateColumns={{ base: 'repeat(4, 1fr)' }}
        gap={2}
        display={{ base: 'grid', md: 'none' }}
        w={'85%'}
      >
        {scoreItemsMemo}
      </Grid>
    </MotionBox>
  )
})

LeaderboardRow.displayName = 'LeaderboardRow'

export default LeaderboardRow
