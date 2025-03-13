// components/quickClashComponents/leaderboard/components/LeaderboardCard.jsx
import React, { useMemo, useState, useRef } from 'react'
import {
  Box,
  VStack,
  Text,
  Flex,
  Icon,
  Avatar,
  HStack,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverArrow,
  Button,
  useDisclosure,
  Portal,
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  Trophy,
  TrendingUp,
  Award,
  Crown,
  Medal,
  UserRound,
  ExternalLink,
} from 'lucide-react'
import StatItem from './StatItem'

const MotionBox = motion(Box)
const MotionButton = motion(Button)

const LeaderboardCard = React.memo(
  ({ user, currentUserId, rank, onViewProfile }) => {
    const { t } = useTranslation('QuickClash')
    const isCurrentUser = user._id === currentUserId
    const { isOpen, onOpen, onClose } = useDisclosure()
    const cardRef = useRef()

    // Determine rank badge styling and icon - memoized to prevent recalculation
    const rankBadge = useMemo(() => {
      if (rank === 1)
        return {
          color: '#FFD700',
          icon: Crown,
          bg: 'linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 215, 0, 0.05) 100%)',
          borderColor: 'rgba(255, 215, 0, 0.3)',
          label: t('Champion'),
        }
      if (rank === 2)
        return {
          color: '#C0C0C0',
          icon: Medal,
          bg: 'linear-gradient(135deg, rgba(192, 192, 192, 0.15) 0%, rgba(192, 192, 192, 0.05) 100%)',
          borderColor: 'rgba(192, 192, 192, 0.3)',
          label: t('Silver'),
        }
      if (rank === 3)
        return {
          color: '#CD7F32',
          icon: Medal,
          bg: 'linear-gradient(135deg, rgba(205, 127, 50, 0.15) 0%, rgba(205, 127, 50, 0.05) 100%)',
          borderColor: 'rgba(205, 127, 50, 0.3)',
          label: t('Bronze'),
        }
      return {
        color: 'whiteAlpha.600',
        icon: null,
        bg: 'transparent',
        borderColor: 'transparent',
        label: null,
      }
    }, [rank, t])

    // Calculate gradient based on rank - memoized
    const cardGradient = useMemo(() => {
      if (rank === 1)
        return 'linear-gradient(135deg, rgba(255, 215, 0, 0.12) 0%, rgba(255, 215, 0, 0.03) 100%)'
      if (rank === 2)
        return 'linear-gradient(135deg, rgba(192, 192, 192, 0.12) 0%, rgba(192, 192, 192, 0.03) 100%)'
      if (rank === 3)
        return 'linear-gradient(135deg, rgba(205, 127, 50, 0.12) 0%, rgba(205, 127, 50, 0.03) 100%)'
      return isCurrentUser
        ? 'linear-gradient(135deg, rgba(138, 75, 255, 0.12) 0%, rgba(138, 75, 255, 0.03) 100%)'
        : 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.8) 100%)'
    }, [rank, isCurrentUser])

    // Animation variants
    const cardVariants = {
      hidden: { opacity: 0, scale: 0.96, y: 10 },
      visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
          type: 'spring',
          stiffness: 260,
          damping: 20,
          duration: 0.2,
        },
      },
      hover: {
        scale: 1.02,
        boxShadow:
          '0 4px 15px -3px rgba(0,0,0,0.2), 0 3px 6px -2px rgba(0,0,0,0.1)',
        transition: {
          type: 'spring',
          stiffness: 400,
          damping: 15,
        },
      },
      tap: {
        scale: 0.98,
        transition: {
          type: 'spring',
          stiffness: 300,
          damping: 10,
        },
      },
    }

    // Button animation variants
    const buttonVariants = {
      initial: { opacity: 0, y: 10 },
      animate: {
        opacity: 1,
        y: 0,
        transition: {
          type: 'spring',
          stiffness: 300,
          damping: 20,
        },
      },
      hover: {
        scale: 1.05,
        boxShadow: '0 0 15px rgba(138, 75, 255, 0.4)',
        transition: {
          type: 'spring',
          stiffness: 400,
          damping: 10,
        },
      },
      tap: { scale: 0.95 },
    }

    const topRankBeforeStyle =
      rank <= 3
        ? {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: `linear-gradient(90deg, transparent 0%, ${rankBadge.color} 50%, transparent 100%)`,
            opacity: 0.5,
          }
        : {}

    const handleCardClick = () => {
      onOpen()
    }

    const handleProfileClick = () => {
      onClose()
      onViewProfile(user.inGameName)
    }

    return (
      <Popover
        isOpen={isOpen}
        onClose={onClose}
        closeOnBlur={true}
        autoFocus={false}
        isLazy
      >
        <PopoverTrigger>
          <Box ref={cardRef}>
            <MotionBox
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              whileTap="tap"
              onClick={handleCardClick}
              cursor="pointer"
              position="relative"
              overflow="hidden"
              background={cardGradient}
              borderRadius="xl"
              p={3}
              my={1.5}
              mx={0}
              borderWidth="1px"
              borderColor={
                isCurrentUser
                  ? 'rgba(138, 75, 255, 0.2)'
                  : isOpen
                  ? 'rgba(138, 75, 255, 0.3)'
                  : 'rgba(255, 255, 255, 0.03)'
              }
              boxShadow={
                isCurrentUser
                  ? '0 0 15px -5px rgba(138, 75, 255, 0.15)'
                  : isOpen
                  ? '0 0 20px -5px rgba(138, 75, 255, 0.3)'
                  : rank <= 3
                  ? '0 0 15px -5px rgba(255, 215, 0, 0.1)'
                  : 'none'
              }
              _before={topRankBeforeStyle}
            >
              {/* Rank indicator and user info */}
              <Flex align="center" ml={-1}>
                <Box
                  minW="28px"
                  height="28px"
                  bg={rankBadge.bg}
                  borderRadius="lg"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  mr={2}
                  border="1px solid"
                  borderColor={rankBadge.borderColor}
                >
                  {rankBadge.icon ? (
                    <Icon
                      as={rankBadge.icon}
                      color={rankBadge.color}
                      boxSize={4}
                    />
                  ) : (
                    <Text
                      fontWeight="bold"
                      fontSize="xs"
                      color={rankBadge.color}
                    >
                      {rank}
                    </Text>
                  )}
                </Box>

                {/* User info */}
                <Avatar
                  size="sm"
                  name={user.name}
                  src={user.pic}
                  mr={2}
                  borderWidth={isCurrentUser || rank <= 3 ? '1.5px' : '0px'}
                  borderColor={
                    rank <= 3
                      ? rankBadge.color
                      : isCurrentUser
                      ? 'purple.500'
                      : 'transparent'
                  }
                />

                <VStack spacing={0} align="start" flex="1">
                  <Text
                    fontWeight="semibold"
                    color={rank <= 3 ? rankBadge.color : 'white'}
                    fontSize="sm"
                    isTruncated
                  >
                    {user.inGameName || user.name}
                  </Text>
                  {user.inGameName !== user.name && (
                    <Text
                      fontSize="xs"
                      color="whiteAlpha.600"
                      isTruncated
                      noOfLines={1}
                    >
                      {user.name}
                    </Text>
                  )}
                </VStack>

                {/* Badge for top ranks */}
                {rankBadge.label && (
                  <Box
                    px={2}
                    py={0.5}
                    borderRadius="full"
                    bg={rankBadge.bg}
                    borderWidth="1px"
                    borderColor={rankBadge.borderColor}
                  >
                    <Text
                      fontSize="xs"
                      fontWeight="medium"
                      color={rankBadge.color}
                    >
                      {rankBadge.label}
                    </Text>
                  </Box>
                )}
              </Flex>

              {/* Stats */}
              <Flex justify="space-between" align="center" mt={2} px={1}>
                <StatItem
                  icon={Trophy}
                  label={t('Wins')}
                  value={user.wins}
                  color="#4ADE80"
                />
                <StatItem
                  icon={TrendingUp}
                  label={t('Win %')}
                  value={`${user.winRate}%`}
                  color="#5EADFF"
                />
                <StatItem
                  icon={Award}
                  label={t('Avg')}
                  value={user.avgScore}
                  color="#A78BFA"
                />
              </Flex>
            </MotionBox>
          </Box>
        </PopoverTrigger>

        <Portal>
          <PopoverContent
            bg="rgba(20, 20, 40, 0.95)"
            borderColor="purple.500"
            borderWidth="1px"
            boxShadow="0 10px 25px rgba(0, 0, 0, 0.5)"
            backdropFilter="blur(10px)"
            _focus={{ outline: 'none' }}
            zIndex={1500} // Ensure it appears above the modal
            borderRadius="lg"
            overflow="hidden"
            width="160px"
          >
            <PopoverArrow
              bg="rgba(20, 20, 40, 0.95)"
              borderColor="purple.500"
            />
            <PopoverBody p={0}>
              <AnimatePresence>
                <MotionButton
                  as={motion.button}
                  variants={buttonVariants}
                  initial="initial"
                  animate="animate"
                  whileHover="hover"
                  whileTap="tap"
                  leftIcon={<Icon as={UserRound} />}
                  rightIcon={<Icon as={ExternalLink} size={14} />}
                  onClick={handleProfileClick}
                  bg="rgba(138, 75, 255, 0.2)"
                  _hover={{}}
                  _active={{}}
                  color="white"
                  fontSize="sm"
                  width="100%"
                  borderRadius="0"
                  height="50px"
                  justifyContent="space-between"
                  fontWeight="medium"
                  bgGradient="linear(to-r, rgba(138, 75, 255, 0.2), rgba(138, 75, 255, 0.3))"
                >
                  {t('View Profile')}
                </MotionButton>
              </AnimatePresence>
            </PopoverBody>
          </PopoverContent>
        </Portal>
      </Popover>
    )
  },
)

LeaderboardCard.displayName = 'LeaderboardCard'

export default LeaderboardCard
