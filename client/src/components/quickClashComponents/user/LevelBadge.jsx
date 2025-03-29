// components/quickClashComponents/user/LevelBadge.jsx
import React from 'react'
import {
  Box,
  Flex,
  Text,
  Icon,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverArrow,
  PopoverCloseButton,
  HStack,
  VStack,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

const MotionBox = motion(Box)
const MotionFlex = motion(Flex)
const MotionIcon = motion(Icon)
const MotionText = motion(Text)

/**
 * A premium, sleek level badge showing the user's current level
 * Features a minimal, horizontal popover with important level information
 */
const LevelBadge = () => {
  const { t } = useTranslation('QuickClash')
  const { user } = useSelector(state => state.auth)

  // Calculate level and XP metrics
  const level = user?.level || 0
  const xp = user?.xp || 0
  const xpBaseAtCurrLevel = (level * (level + 1) * 10) / 2
  const xpForNextLevel = (level + 1) * 10
  const xpProgress = xp - xpBaseAtCurrLevel
  const progressPercentage = Math.min(
    100,
    Math.round((xpProgress / xpForNextLevel) * 100),
  )

  return (
    <Popover placement="bottom" trigger="click">
      <PopoverTrigger>
        <MotionFlex
          align="center"
          justify="center"
          py={1.5}
          px={3}
          borderRadius="full"
          bg="rgba(26, 32, 44, 0.4)"
          backdropFilter="blur(8px)"
          boxShadow="0 4px 12px rgba(0, 0, 0, 0.2)"
          cursor="pointer"
          transition="all 0.2s"
          whileHover={{
            scale: 1.05,
            boxShadow: '0 0 20px rgba(119, 81, 204, 0.4)',
          }}
          whileTap={{ scale: 0.95 }}
          position="relative"
          overflow="hidden"
          border="1px solid"
          borderColor="rgba(138, 92, 246, 0.3)"
          _focusVisible={{ outline: 'none' }}
          sx={{
            // Remove focus outline/rectangle across browsers
            '&:focus': { outline: 'none', boxShadow: 'none' },
            '&:focus-visible': { outline: 'none', boxShadow: 'none' },
            '&:active': { outline: 'none' },
            '&::selection': { background: 'transparent' },
          }}
        >
          {/* Premium gradient background */}
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bgGradient="linear(to-br, rgba(138, 92, 246, 0.2), rgba(79, 70, 229, 0.1))"
            opacity={0.7}
            zIndex={0}
          />

          {/* Animated star icon */}
          <MotionIcon
            as={Star}
            color="#F7D147"
            boxSize={4}
            mr={2}
            animate={{
              rotate: [0, 10, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              repeat: Infinity,
              repeatType: 'reverse',
              duration: 4,
            }}
            zIndex={1}
            filter="drop-shadow(0 0 3px rgba(247, 209, 71, 0.8))"
          />

          {/* Level text */}
          <MotionText
            color="white"
            fontWeight="bold"
            fontSize="lg"
            zIndex={1}
            mr={3}
          >
            {level}
          </MotionText>

          {/* Mini progress bar */}
          <Box
            w="32px"
            h="3px"
            borderRadius="full"
            bg="whiteAlpha.200"
            zIndex={1}
          >
            <Box
              h="100%"
              w={`${progressPercentage}%`}
              borderRadius="full"
              bgGradient="linear(to-r, #9F7AFA, #7551CC)"
            />
          </Box>
        </MotionFlex>
      </PopoverTrigger>

      <PopoverContent
        bg="rgba(20, 20, 30, 0.95)"
        backdropFilter="blur(16px)"
        borderColor="rgba(138, 92, 246, 0.4)"
        boxShadow="0 8px 32px rgba(0, 0, 0, 0.4), 0 0 15px rgba(128, 90, 213, 0.3)"
        width="340px"
        height="auto"
        p={0}
        overflow="hidden"
        borderRadius="xl"
        _focus={{ outline: 'none', boxShadow: 'none' }}
        sx={{
          // Remove focus styles for the popover content too
          '&:focus': { outline: 'none' },
          '&:focus-visible': { outline: 'none' },
        }}
      >
        <PopoverArrow bg="rgba(20, 20, 30, 0.95)" />
        <PopoverCloseButton color="whiteAlpha.700" zIndex={2} />
        <PopoverBody p={0}>
          {/* Top section with current level */}
          <Flex
            bg="rgba(30, 30, 45, 0.8)"
            p={4}
            borderBottomWidth="1px"
            borderColor="rgba(138, 92, 246, 0.2)"
            position="relative"
            overflow="hidden"
          >
            {/* Background glow effect */}
            <Box
              position="absolute"
              top="-20px"
              left="-20px"
              width="80px"
              height="80px"
              borderRadius="full"
              bgGradient="radial(circle, rgba(138, 92, 246, 0.3), transparent 70%)"
              filter="blur(10px)"
            />

            {/* Level info */}
            <Flex align="center" width="100%">
              <Flex
                w="56px"
                h="56px"
                borderRadius="full"
                bgGradient="linear(to-br, #9F7AFA, #7551CC)"
                align="center"
                justify="center"
                boxShadow="0 0 20px rgba(119, 81, 204, 0.4)"
                mr={4}
              >
                <Text fontSize="2xl" fontWeight="bold" color="white">
                  {level}
                </Text>
              </Flex>

              <VStack align="start" spacing={0} flex={1}>
                <Text color="white" fontWeight="bold" fontSize="md">
                  {t('Current Level')}
                </Text>
                <HStack spacing={3} mt={1}>
                  <HStack spacing={1}>
                    <Text color="whiteAlpha.700" fontSize="sm">
                      {t('Total XP')}:
                    </Text>
                    <Text color="#9F7AFA" fontWeight="bold" fontSize="sm">
                      {xp} XP
                    </Text>
                  </HStack>

                  <HStack spacing={1}>
                    <Text color="whiteAlpha.700" fontSize="sm">
                      {t('Next')}:
                    </Text>
                    <Text color="#10B981" fontWeight="bold" fontSize="sm">
                      {xpProgress}/{xpForNextLevel} XP
                    </Text>
                  </HStack>
                </HStack>
              </VStack>
            </Flex>
          </Flex>

          {/* Progress section */}
          <Box px={4} py={3}>
            <Flex justify="space-between" mb={1} align="center">
              <Text color="whiteAlpha.600" fontSize="xs">
                {progressPercentage}%
              </Text>
              <Text color="whiteAlpha.600" fontSize="xs">
                {t('Level')} {level} → {level + 1}
              </Text>
            </Flex>

            <Box
              w="100%"
              h="5px"
              bg="rgba(30, 30, 45, 0.6)"
              borderRadius="full"
              overflow="hidden"
              position="relative"
            >
              {/* Progress fill */}
              <Box
                position="absolute"
                top={0}
                left={0}
                bottom={0}
                width={`${progressPercentage}%`}
                bgGradient="linear(to-r, #9F7AFA, #7551CC)"
                borderRadius="full"
              />

              {/* Shimmering effect */}
              <Box
                position="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
                bgGradient="linear(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)"
                backgroundSize="200% 100%"
                animation="shimmer 2s infinite linear"
                sx={{
                  '@keyframes shimmer': {
                    '0%': { backgroundPosition: '200% 0' },
                    '100%': { backgroundPosition: '0% 0' },
                  },
                }}
              />
            </Box>
          </Box>

          {/* Tip section */}
          <HStack
            spacing={3}
            px={4}
            py={3}
            align="center"
            bg="rgba(30, 30, 45, 0.4)"
            borderTop="1px solid"
            borderColor="rgba(138, 92, 246, 0.15)"
          >
            <MotionIcon
              as={Star}
              color="#F7D147"
              boxSize={5}
              animate={{
                rotate: [0, 10, 0, -10, 0],
                scale: [1, 1.1, 1, 1.1, 1],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
              }}
              filter="drop-shadow(0 0 4px rgba(247, 209, 71, 0.6))"
            />
            <VStack spacing={0} align="start">
              <Text color="white" fontWeight="bold" fontSize="xs">
                {t('Keep Earning XP')}
              </Text>
              <Text color="whiteAlpha.600" fontSize="2xs">
                {t('Complete challenges and daily tasks to level up!')}
              </Text>
            </VStack>
          </HStack>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  )
}

export default LevelBadge
