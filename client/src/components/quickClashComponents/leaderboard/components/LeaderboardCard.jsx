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
  SimpleGrid,
  Collapse,
  IconButton,
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
  Hash,
  Users,
  Percent,
  Target,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import StatItem from './StatItem' // Assuming StatItem will also be made more compact

const MotionBox = motion(Box)
const MotionButton = motion(Button)

const LeaderboardCard = React.memo(
  ({ user, currentUserId, rank, onViewProfile }) => {
    const { t } = useTranslation('QuickClash')
    const isCurrentUser = user._id === currentUserId
    const {
      isOpen: isPopoverOpen,
      onOpen: onPopoverOpen,
      onClose: onPopoverClose,
    } = useDisclosure()
    const cardRef = useRef()

    const [isStatsExpanded, setIsStatsExpanded] = useState(false)

    const handleToggleStats = event => {
      event.stopPropagation()
      setIsStatsExpanded(!isStatsExpanded)
    }

    const handleCardClickForPopover = () => onPopoverOpen()

    const rankStyle = useMemo(() => {
      // Base styles remain largely the same for colors/gradients
      const base = {
        textColor: 'whiteAlpha.900',
        iconColor: 'whiteAlpha.700',
        rankIconContainerBg: 'rgba(255, 255, 255, 0.05)',
        rankIconContainerBorder: 'rgba(255, 255, 255, 0.1)',
        rankLabelBg: 'rgba(255, 255, 255, 0.05)',
        rankLabelBorder: 'rgba(255, 255, 255, 0.1)',
        rankIcon: Hash,
        rankLabelText: null,
        cardBg: isCurrentUser
          ? 'linear-gradient(140deg, rgba(138, 75, 255, 0.22) 0%, rgba(138, 75, 255, 0.1) 100%)'
          : 'linear-gradient(140deg, rgba(45, 55, 72, 0.6) 0%, rgba(30, 35, 45, 0.6) 100%)',
        cardBorder: isCurrentUser ? 'purple.400' : 'rgba(255, 255, 255, 0.08)',
        cardShadow: isCurrentUser
          ? '0 0 15px rgba(138, 75, 255, 0.2)' // Reduced shadow for thinner look
          : '0 3px 10px rgba(0,0,0,0.15)', // Reduced shadow
        trophySectionBg: isCurrentUser
          ? 'rgba(138, 75, 255, 0.1)'
          : 'rgba(0,0,0,0.2)',
        trophyTextColor: 'yellow.400',
        nameColor: 'whiteAlpha.900',
      }
      // Rank-specific style overrides remain the same logic
      if (rank === 1)
        return {
          ...base,
          textColor: 'yellow.400',
          iconColor: 'yellow.400',
          rankIcon: Crown,
          rankIconContainerBg: 'rgba(255, 215, 0, 0.2)',
          rankIconContainerBorder: 'rgba(255, 215, 0, 0.6)',
          rankLabelBg: 'rgba(255, 215, 0, 0.2)',
          rankLabelBorder: 'rgba(255, 215, 0, 0.6)',
          rankLabelText: t('Champion'),
          cardBg:
            'linear-gradient(140deg, rgba(255, 215, 0, 0.25) 0%, rgba(255, 215, 0, 0.1) 100%)',
          cardBorder: 'yellow.400',
          cardShadow: `0 0 20px rgba(255, 215, 0, 0.3), 0 0 0 1px rgba(255,215,0,0.5)`, // Slightly reduced shadow
          trophySectionBg: 'rgba(255, 215, 0, 0.15)',
          trophyTextColor: 'yellow.300',
          nameColor: 'yellow.400',
        }
      if (rank === 2)
        return {
          ...base,
          textColor: 'gray.200',
          iconColor: 'gray.200',
          rankIcon: Medal,
          rankIconContainerBg: 'rgba(192, 192, 192, 0.2)',
          rankIconContainerBorder: 'rgba(192, 192, 192, 0.6)',
          rankLabelBg: 'rgba(192, 192, 192, 0.2)',
          rankLabelBorder: 'rgba(192, 192, 192, 0.6)',
          rankLabelText: t('Silver'),
          cardBg:
            'linear-gradient(140deg, rgba(192, 192, 192, 0.25) 0%, rgba(192, 192, 192, 0.1) 100%)',
          cardBorder: 'gray.300',
          cardShadow: `0 0 20px rgba(192,192,192,0.25), 0 0 0 1px rgba(192,192,192,0.4)`, // Slightly reduced shadow
          trophySectionBg: 'rgba(192, 192, 192, 0.15)',
          trophyTextColor: 'gray.100',
          nameColor: 'gray.200',
        }
      if (rank === 3)
        return {
          ...base,
          textColor: 'orange.300',
          iconColor: 'orange.300',
          rankIcon: Medal,
          rankIconContainerBg: 'rgba(205, 127, 50, 0.2)',
          rankIconContainerBorder: 'rgba(205, 127, 50, 0.6)',
          rankLabelBg: 'rgba(205, 127, 50, 0.2)',
          rankLabelBorder: 'rgba(205, 127, 50, 0.6)',
          rankLabelText: t('Bronze'),
          cardBg:
            'linear-gradient(140deg, rgba(205, 127, 50, 0.25) 0%, rgba(205, 127, 50, 0.1) 100%)',
          cardBorder: 'orange.400',
          cardShadow: `0 0 20px rgba(205,127,50,0.3), 0 0 0 1px rgba(205,127,50,0.4)`, // Slightly reduced shadow
          trophySectionBg: 'rgba(205, 127, 50, 0.15)',
          trophyTextColor: 'orange.200',
          nameColor: 'orange.300',
        }
      return base
    }, [rank, t, isCurrentUser])

    const cardVariants = {
      // Animation variants remain the same
      hidden: { opacity: 0, y: 20, scale: 0.96 },
      visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
          type: 'spring',
          stiffness: 320,
          damping: 28,
          duration: 0.3,
        },
      },
      hover: {
        scale: 1.01, // Slightly less scale on hover
        boxShadow: isPopoverOpen
          ? rankStyle.cardShadow
          : rank <= 3
          ? rankStyle.cardShadow.replace('20px', '25px').replace('0.3)', '0.4)') // Adjust hover shadow
          : '0 5px 15px rgba(0,0,0,0.2)', // Adjust hover shadow
        borderColor: isPopoverOpen
          ? 'purple.300'
          : rank <= 3
          ? rankStyle.borderColor
          : 'rgba(255,255,255,0.12)',
        transition: { type: 'spring', stiffness: 380, damping: 18 },
      },
      tap: {
        scale: 0.99, // Slightly less scale on tap
        transition: { type: 'spring', stiffness: 400, damping: 15 },
      },
    }

    const buttonVariants = {
      /* Popover button variants remain same */
    }

    const handleProfileClickInPopover = () => {
      onPopoverClose()
      onViewProfile(user.inGameName)
    }

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
      <Popover
        isOpen={isPopoverOpen}
        onClose={onPopoverClose}
        closeOnBlur={true}
        autoFocus={false}
        isLazy
      >
        <PopoverTrigger>
          <Box ref={cardRef} px={{ base: 0.5, md: 1 }}>
            {' '}
            {/* Outer spacing for scrollbar */}
            <MotionBox
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              whileTap="tap"
              onClick={handleCardClickForPopover}
              cursor="pointer"
              position="relative"
              overflow="hidden"
              bg={rankStyle.cardBg}
              borderRadius="lg" // Slightly less rounded for thinner feel
              px={3} // Reduced horizontal padding
              py={2} // Reduced vertical padding
              my={1.5} // Reduced inter-card margin
              borderWidth="1px"
              borderColor={isPopoverOpen ? 'purple.300' : rankStyle.cardBorder}
              boxShadow={
                isPopoverOpen
                  ? '0 0 25px rgba(138, 75, 255, 0.3)' // Reduced popover open shadow
                  : rankStyle.cardShadow
              }
            >
              {/* Top Section */}
              <VStack align="stretch" spacing={0.5} mb={1.5}>
                {' '}
                {/* Reduced spacing and mb */}
                <HStack spacing={2} align="center" width="100%">
                  {' '}
                  {/* Reduced spacing */}
                  <VStack
                    w="36px"
                    h="36px" // Reduced size
                    flexShrink={0}
                    bg={rankStyle.rankIconContainerBg}
                    borderRadius="md" // Reduced border radius
                    alignItems="center"
                    justifyContent="center"
                    border="1px solid" // Thinner border
                    borderColor={rankStyle.rankIconContainerBorder}
                    spacing={0}
                  >
                    <Icon
                      as={rankStyle.rankIcon}
                      color={rankStyle.iconColor}
                      boxSize={rank <= 3 ? '18px' : '14px'} // Reduced icon size
                    />
                    {rank > 3 && (
                      <Text
                        fontWeight="semibold" // Slightly less bold
                        fontSize="xs" // Reduced font size
                        color={rankStyle.iconColor}
                        mt={-0.5}
                      >
                        {rank}
                      </Text>
                    )}
                  </VStack>
                  <Avatar
                    size="sm" // Reduced avatar size
                    name={user.name}
                    src={user.pic}
                    borderWidth="1.5px" // Thinner border
                    flexShrink={0}
                    borderColor={
                      rank <= 3
                        ? rankStyle.borderColor
                        : isCurrentUser
                        ? 'purple.300'
                        : 'transparent'
                    }
                    boxShadow={
                      // Reduced shadow
                      rank <= 3
                        ? `0 0 5px ${rankStyle.iconColor}44`
                        : isCurrentUser
                        ? '0 0 5px rgba(138,75,255,0.4)'
                        : 'none'
                    }
                  />
                  <VStack align="start" spacing={0} flexGrow={1} minWidth={0}>
                    <Text
                      fontWeight="semibold"
                      color={rankStyle.nameColor}
                      fontSize="sm" // Reduced font size
                      lineHeight="1.2" // Reduced line height
                      wordBreak="break-word"
                      noOfLines={1} // Attempt to keep name on one line, will truncate with ... if too long
                    >
                      {user.inGameName || user.name}
                    </Text>
                    <Text
                      fontSize="2xs" // Reduced font size
                      color={isCurrentUser ? 'purple.300' : 'whiteAlpha.600'}
                      fontWeight="medium"
                    >
                      {isCurrentUser ? t('You') : t('Player')}
                    </Text>
                  </VStack>
                </HStack>
                {rankStyle.rankLabelText && (
                  <Box>
                    <Box
                      display="inline-block"
                      px={2} // Reduced padding
                      py={0.5} // Reduced padding
                      borderRadius="sm" // Reduced border radius
                      bg={rankStyle.rankLabelBg}
                      borderWidth="1px"
                      borderColor={rankStyle.rankLabelBorder}
                      boxShadow={`0 1px 2px ${rankStyle.iconColor}11`} // Reduced shadow
                    >
                      <Text
                        fontSize="2xs" // Reduced font size
                        fontWeight="semibold" // Slightly less bold
                        color={rankStyle.textColor}
                        textTransform="uppercase"
                        letterSpacing="0.03em" // Tighter letter spacing
                      >
                        {rankStyle.rankLabelText}
                      </Text>
                    </Box>
                  </Box>
                )}
              </VStack>

              {/* Trophy Section */}
              <Flex
                align="center"
                justify="center"
                py={1.5} // Reduced vertical padding
                px={3} // Reduced horizontal padding
                bg={rankStyle.trophySectionBg}
                borderRadius="md" // Reduced border radius
                border="1px solid" // Thinner border
                borderColor={
                  rank <= 3
                    ? `${rankStyle.iconColor}33` // Softer border for top ranks
                    : 'rgba(255,255,255,0.05)'
                }
                boxShadow={`inset 0 1px 2px rgba(0,0,0,0.15), 0 1px 1px ${
                  // Reduced shadow
                  rank <= 3 ? `${rankStyle.iconColor}11` : 'transparent'
                }`}
              >
                <Icon
                  as={Trophy}
                  color={rankStyle.trophyTextColor}
                  boxSize={5} // Reduced icon size
                  mr={1.5} // Reduced margin
                />
                <VStack spacing={0} align="flex-start">
                  <Text
                    fontSize="lg" // Reduced font size
                    fontWeight="bold" // Slightly less bold
                    color={rankStyle.trophyTextColor}
                    lineHeight={1}
                  >
                    {user.trophies || 0}
                  </Text>
                  <Text
                    fontSize="3xs" // Reduced font size (ensure this is defined or use 2xs)
                    color="whiteAlpha.600" // Slightly dimmer
                    fontWeight="normal"
                    textTransform="uppercase"
                    letterSpacing="0.03em" // Tighter
                  >
                    {t('Trophies')}
                  </Text>
                </VStack>
              </Flex>

              {/* Arrow Button to Toggle Stats */}
              <Flex justifyContent="center" mt={1} mb={isStatsExpanded ? 0 : 0}>
                {' '}
                {/* Reduced mt, mb set to 0 when collapsed */}
                <IconButton
                  aria-label={
                    isStatsExpanded ? t('Hide stats') : t('Show stats')
                  }
                  aria-expanded={isStatsExpanded}
                  icon={
                    isStatsExpanded ? (
                      <Icon as={ChevronUp} boxSize={4} />
                    ) : (
                      <Icon as={ChevronDown} boxSize={4} />
                    )
                  } // Reduced icon size
                  onClick={handleToggleStats}
                  variant="ghost"
                  size="xs" // Reduced button size
                  minW="auto" // Allow button to be smaller
                  h="auto" // Allow button to be smaller
                  p={1} // Minimal padding for the button
                  isRound
                  color="whiteAlpha.500" // Dimmer color
                  _hover={{ bg: 'whiteAlpha.05', color: 'whiteAlpha.800' }}
                  zIndex={1}
                />
              </Flex>

              {/* Collapsible Stats Section */}
              <Collapse in={isStatsExpanded} animateOpacity unmountOnExit>
                <Box pt={1.5}>
                  {' '}
                  {/* Reduced padding top */}
                  <SimpleGrid columns={2} spacing={1.5}>
                    {' '}
                    {/* Reduced spacing */}
                    {/* StatItems - Consider making StatItem internally more compact too */}
                    <StatItem
                      icon={Trophy}
                      label={t('1v1 Wins')}
                      value={formatStatValueInteger(
                        user.wins1v1 !== undefined ? user.wins1v1 : user.wins,
                      )}
                      color="#58D68D"
                    />
                    {/* ... other StatItems ... */}
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
                </Box>
              </Collapse>
            </MotionBox>
          </Box>
        </PopoverTrigger>

        {/* Popover Content - remains same */}
        <Portal>
          <PopoverContent
            bg="rgba(18, 21, 40, 0.97)"
            borderColor="purple.400"
            borderWidth="1px"
            boxShadow="0 12px 30px rgba(0, 0, 0, 0.6)"
            backdropFilter="blur(12px)"
            _focus={{ outline: 'none' }}
            zIndex={1500}
            borderRadius="md"
            overflow="hidden"
            width="170px"
          >
            <PopoverArrow
              bg="rgba(18, 21, 40, 0.97)"
              borderColor="purple.400"
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
                  leftIcon={<Icon as={UserRound} boxSize="18px" />}
                  rightIcon={<Icon as={ExternalLink} size={16} />}
                  onClick={handleProfileClickInPopover}
                  bg="transparent"
                  _hover={{
                    bgGradient:
                      'linear(to-r, rgba(138, 75, 255, 0.35), rgba(138, 75, 255, 0.45))',
                  }}
                  _active={{}}
                  color="whiteAlpha.900"
                  fontSize="sm"
                  width="100%"
                  borderRadius="0"
                  height="50px"
                  justifyContent="space-between"
                  fontWeight="medium"
                  px={4}
                  bgGradient="linear(to-r, rgba(138, 75, 255, 0.25), rgba(138, 75, 255, 0.35))"
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
