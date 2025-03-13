// components/quickClashComponents/leaderboard/QuickClashLeaderboardButton.jsx
import React, { memo } from 'react'
import {
  Button,
  Icon,
  Box,
  useDisclosure,
  useBreakpointValue,
  IconButton,
  HStack,
  Text,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { Trophy, Star } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import QuickClashLeaderboardModal from './QuickClashLeaderboardModal'

const MotionButton = motion(Button)
const MotionBox = motion(Box)

const QuickClashLeaderboardButton = () => {
  const { t } = useTranslation('QuickClash')
  const { isOpen, onOpen, onClose } = useDisclosure()
  const isMobile = useBreakpointValue({ base: true, md: false })
  const isSmall = useBreakpointValue({ base: true, sm: false })

  // Animation variants
  const buttonVariants = {
    initial: { scale: 0.95, opacity: 0 },
    animate: {
      scale: 1,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 15,
        delay: 0.3,
      },
    },
    hover: {
      scale: 1.05,
      boxShadow: '0 0 15px rgba(128, 90, 213, 0.6)',
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 10,
      },
    },
    tap: { scale: 0.98 },
  }

  // For floating badge (mobile)
  const floatingVariants = {
    initial: { scale: 0, opacity: 0 },
    animate: {
      scale: 1,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 15,
        delay: 0.5,
      },
    },
    hover: {
      scale: 1.1,
      rotate: [0, -5, 5, 0],
      transition: {
        rotate: {
          repeat: Infinity,
          repeatType: 'reverse',
          duration: 2,
        },
      },
    },
  }

  // For the star background effect
  const starVariants = {
    animate: {
      rotate: 360,
      transition: {
        repeat: Infinity,
        duration: 20,
        ease: 'linear',
      },
    },
  }

  // For glowing effect
  const pulseAnimation = `
    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(128, 90, 213, 0.7); }
      70% { box-shadow: 0 0 0 10px rgba(128, 90, 213, 0); }
      100% { box-shadow: 0 0 0 0 rgba(128, 90, 213, 0); }
    }
  `

  if (isMobile) {
    return (
      <>
        <MotionBox
          position="fixed"
          bottom="90px"
          right="20px"
          zIndex={10}
          variants={floatingVariants}
          initial="initial"
          animate="animate"
          whileHover="hover"
          whileTap="tap"
          onClick={onOpen}
        >
          {/* Animated star background */}
          <MotionBox
            position="absolute"
            width="150%"
            height="150%"
            top="-25%"
            left="-25%"
            opacity={0.6}
            variants={starVariants}
            animate="animate"
            pointerEvents="none"
          >
            <Icon
              as={Star}
              position="absolute"
              top="10%"
              left="10%"
              color="yellow.300"
              boxSize={3}
            />
            <Icon
              as={Star}
              position="absolute"
              top="20%"
              right="15%"
              color="yellow.400"
              boxSize={2}
            />
            <Icon
              as={Star}
              position="absolute"
              bottom="5%"
              right="25%"
              color="yellow.200"
              boxSize={3}
            />
            <Icon
              as={Star}
              position="absolute"
              bottom="30%"
              left="0%"
              color="yellow.300"
              boxSize={2}
            />
          </MotionBox>

          <Box
            bg="purple.600"
            borderRadius="full"
            p={3}
            boxShadow="0 4px 15px rgba(0,0,0,0.3)"
            position="relative"
            overflow="hidden"
            css={pulseAnimation}
            animation="pulse 2s infinite"
          >
            {/* Background gradient */}
            <Box
              position="absolute"
              top="0"
              left="0"
              right="0"
              bottom="0"
              bgGradient="linear(to-br, purple.500, purple.700)"
              opacity="0.8"
            />

            {/* Icon */}
            <Icon
              as={Trophy}
              color="yellow.400"
              boxSize={7}
              position="relative"
              zIndex={1}
            />
          </Box>
        </MotionBox>

        <QuickClashLeaderboardModal isOpen={isOpen} onClose={onClose} />
      </>
    )
  }

  // Desktop version - designed to match with the New Challenge button
  return (
    <>
      <MotionButton
        as={motion.button}
        variants={buttonVariants}
        initial="initial"
        animate="animate"
        whileHover="hover"
        whileTap="tap"
        onClick={onOpen}
        position="relative"
        height="52px"
        px={isSmall ? 3 : 6}
        overflow="hidden"
        borderRadius="xl"
        boxShadow="0 4px 15px rgba(0,0,0,0.2)"
        _hover={{}}
        _active={{}}
        bgGradient="linear(to-r, yellow.500, orange.500)"
        css={pulseAnimation}
        animation="pulse 2.5s infinite"
      >
        {/* Background elements */}
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          opacity="0.4"
          bgGradient="radial(circle at top right, yellow.300, transparent 70%)"
        />

        <Box
          position="absolute"
          top="-20px"
          right="-20px"
          width="60px"
          height="60px"
          borderRadius="full"
          bg="rgba(255,255,255,0.1)"
        />

        {/* Content */}
        <HStack spacing={3} position="relative" zIndex={1}>
          <Box
            bg="rgba(0,0,0,0.2)"
            p={1.5}
            borderRadius="full"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Icon as={Trophy} color="yellow.100" boxSize={5} />
          </Box>

          {!isSmall && (
            <Text color="white" fontWeight="bold">
              {t('Leaderboard')}
            </Text>
          )}
        </HStack>
      </MotionButton>

      <QuickClashLeaderboardModal isOpen={isOpen} onClose={onClose} />
    </>
  )
}

export default memo(QuickClashLeaderboardButton)
