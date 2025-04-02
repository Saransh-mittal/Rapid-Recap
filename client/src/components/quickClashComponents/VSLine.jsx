// components/quickClashComponents/VSLine.jsx
import React, { useMemo, memo } from 'react'
import {
  Flex,
  Tag,
  Icon,
  Text,
  Box,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverArrow,
  PopoverCloseButton,
  Badge,
  useDisclosure,
  HStack,
  VStack,
  Divider,
  Portal,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { Target, Shield, TrendingDown, Award, Star } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import EnhancedTrophyChangeDisplay from './ui/EnhancedTrophyChangeDisplay'

const MotionTag = motion(Tag)
const MotionBadge = motion(Badge)
const MotionFlex = motion(Flex)
const MotionBox = motion(Box)

/**
 * Protection Badge Component - Extracted for better performance
 */
const ProtectionBadge = memo(({ protectionType, protectionStyle, onOpen }) => {
  return (
    <MotionBadge
      colorScheme={protectionStyle.color}
      px={2}
      py={0.5}
      fontSize="xs"
      fontWeight="medium"
      borderRadius="full"
      display="flex"
      alignItems="center"
      maxWidth="90px"
      textOverflow="ellipsis"
      whiteSpace="nowrap"
      cursor="pointer"
      initial={{ scale: 0.9 }}
      animate={{
        scale: [0.9, 1.05, 0.9],
        transition: {
          duration: 2,
          repeat: Infinity,
          repeatType: 'loop',
        },
      }}
      boxShadow={`0 0 10px var(--chakra-colors-${protectionStyle.color}-400)`}
      _hover={{
        boxShadow: `0 0 15px var(--chakra-colors-${protectionStyle.color}-500)`,
      }}
      onClick={onOpen}
    >
      <Icon as={Shield} boxSize={3} mr={1} />
      {protectionStyle.label}
    </MotionBadge>
  )
})

/**
 * VS Line component that shows the trophy changes centered with the VS tag
 * Enhanced with stylish protection badge popover with fixed z-index
 */
const VSLine = ({
  trophyChange,
  potentialTrophyGain,
  showTrophyAnimation = false,
  category = null,
  categoryColorScheme = 'purple',
  isActiveChallenge = false,
  showAnalysisButton = false,
  onAnalysisClick = null,
  AnalysisButton = null,
  myAttempted = false,
  protectionApplied = false,
  protectionType = null,
}) => {
  const { t } = useTranslation('QuickClash')
  const { isOpen, onOpen, onClose } = useDisclosure()

  // Get icon for protection popover
  const getProtectionIcon = useMemo(() => {
    if (protectionType === 'streak') return Star
    if (protectionType === 'activity') return Award
    if (protectionType === 'floor') return TrendingDown
    return Shield
  }, [protectionType])

  // Get styling based on protection type (memoized to avoid recalculations)
  const protectionStyle = useMemo(() => {
    let color, bgGradient, label, detail, subtext

    switch (protectionType) {
      case 'streak':
        color = 'yellow'
        bgGradient = 'linear(to-r, yellow.500, orange.500)'
        label = t('Streak')
        detail = t('Win Streak Protection')
        subtext = t(
          'Your 3+ win streak protected you from trophy loss. Keep winning to maintain this protection!',
        )
        break
      case 'activity':
        color = 'green'
        bgGradient = 'linear(to-r, green.500, teal.500)'
        label = t('Beginner')
        detail = t('Beginner Protection')
        subtext = t(
          'As a new player, your trophy count is protected for your first 14 days. Enjoy building your skills!',
        )
        break
      case 'floor':
        color = 'blue'
        bgGradient = 'linear(to-r, blue.500, cyan.500)'
        label = t('Zero Floor')
        detail = t('Trophy Floor Protection')
        subtext = t(
          'Your trophies cannot drop below zero, ensuring you always have a foundation to build from.',
        )
        break
      default:
        color = 'purple'
        bgGradient = 'linear(to-r, purple.500, pink.500)'
        label = t('Protected')
        detail = t('Trophy Protection')
        subtext = t('Your trophies were protected in this match.')
    }

    return { color, bgGradient, label, detail, subtext }
  }, [protectionType, t])

  return (
    <Flex
      justify="center"
      align="center"
      py={1}
      position="relative"
      width="100%"
    >
      {/* Center container with VS and Trophy */}
      <Flex
        align="center"
        justify="center"
        position="relative"
        width="100%"
        zIndex={1}
      >
        {/* Trophy Change display - shown on the left when no protection is applied */}
        {trophyChange !== undefined &&
          trophyChange !== 0 &&
          !protectionApplied && (
            <Box position="absolute" left="0">
              <EnhancedTrophyChangeDisplay
                trophyChange={trophyChange}
                showAnimation={showTrophyAnimation}
              />
            </Box>
          )}

        {/* Enhanced Protection Badge with Popover - replaces trophy change */}
        {protectionApplied && (
          <Box position="absolute" left="0" zIndex={10}>
            <Popover
              trigger="click"
              isOpen={isOpen}
              onOpen={onOpen}
              onClose={onClose}
              closeOnBlur={true}
              gutter={12}
              popperConfig={{
                modifiers: [
                  {
                    name: 'preventOverflow',
                    options: {
                      enabled: true,
                    },
                  },
                  {
                    name: 'flip',
                    options: {
                      enabled: true,
                    },
                  },
                ],
              }}
              lazyBehavior="unmount"
            >
              <PopoverTrigger>
                <Box>
                  <ProtectionBadge
                    protectionType={protectionType}
                    protectionStyle={protectionStyle}
                    onOpen={onOpen}
                  />
                </Box>
              </PopoverTrigger>
              <Portal>
                <PopoverContent
                  width="230px"
                  bg="gray.800"
                  borderColor={`${protectionStyle.color}.500`}
                  borderWidth="1px"
                  boxShadow={`0 8px 16px rgba(0,0,0,0.2), 0 0 0 1px var(--chakra-colors-${protectionStyle.color}-600)`}
                  _focusVisible={{ outline: 'none' }}
                  overflow="hidden"
                  zIndex={9999}
                >
                  <PopoverArrow
                    bg="gray.800"
                    borderColor={`${protectionStyle.color}.500`}
                  />

                  <PopoverHeader
                    bgGradient={protectionStyle.bgGradient}
                    borderTopRadius="md"
                    borderBottomWidth="0px"
                    py={2}
                    px={3}
                    display="flex"
                    alignItems="center"
                    position="relative"
                    overflow="hidden"
                    _before={{
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background:
                        'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
                      backgroundSize: '200% 100%',
                      animation: 'shine 2s infinite linear',
                    }}
                    css={`
                      @keyframes shine {
                        from {
                          background-position: -200% 0;
                        }
                        to {
                          background-position: 200% 0;
                        }
                      }
                    `}
                  >
                    <HStack spacing={2}>
                      <MotionBox
                        animate={{
                          rotate: [0, 5, 0, -5, 0],
                          transition: { duration: 2, repeat: Infinity },
                        }}
                      >
                        <Icon
                          as={getProtectionIcon}
                          boxSize={4}
                          color="white"
                        />
                      </MotionBox>
                      <Text fontWeight="bold" fontSize="sm" color="white">
                        {protectionStyle.detail}
                      </Text>
                    </HStack>
                  </PopoverHeader>
                  <PopoverBody py={3} px={3}>
                    <VStack align="start" spacing={2}>
                      <Text fontSize="xs" color="gray.200">
                        {protectionStyle.subtext}
                      </Text>
                      <Divider borderColor="gray.600" />
                      <HStack fontSize="xs" color="gray.400" pt={1}>
                        <Icon as={Shield} boxSize={3} />
                        <Text>{t('Trophy loss prevented')}</Text>
                      </HStack>
                    </VStack>
                  </PopoverBody>
                </PopoverContent>
              </Portal>
            </Popover>
          </Box>
        )}

        {/* VS Tag - slightly offset to avoid overlap */}
        <MotionTag
          size="sm"
          colorScheme="gray"
          variant="subtle"
          borderRadius="full"
          whileHover={{ scale: 1.05 }}
          px={3}
          py={1}
          ml={protectionApplied ? '5px' : 0}
          zIndex={2}
        >
          {t('vs')}
        </MotionTag>

        {/* Analysis Button - Positioned to the right */}
        {showAnalysisButton && AnalysisButton && (
          <Box position="absolute" right="0" zIndex={2}>
            {AnalysisButton}
          </Box>
        )}
      </Flex>

      {/* Category Tag for Active Challenges */}
      {isActiveChallenge && category && (
        <Tag
          position="absolute"
          right={0}
          size="sm"
          colorScheme={categoryColorScheme}
          borderRadius="full"
          px={3}
          zIndex={2}
          animation={
            isActiveChallenge && !myAttempted
              ? 'pulse 3s infinite ease-in-out'
              : 'none'
          }
          css={
            isActiveChallenge && !myAttempted
              ? `@keyframes pulse {
                  0% { transform: scale(1); }
                  50% { transform: scale(1.05); }
                  100% { transform: scale(1); }
                }`
              : ''
          }
        >
          <Icon as={Target} size={12} mr={1} />
          <Text fontSize="xs">{category}</Text>
        </Tag>
      )}
    </Flex>
  )
}

// Memoize the component to prevent unnecessary re-renders
export default memo(VSLine)
