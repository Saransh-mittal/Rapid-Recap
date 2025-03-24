// components/quickClashComponents/QuickClashHeader.jsx
import React, { memo } from 'react'
import {
  Box,
  Heading,
  Text,
  Button,
  Flex,
  Icon,
  HStack,
  useBreakpointValue,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { FiZap, FiArrowLeft } from 'react-icons/fi'
import { Target } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import QuickClashLeaderboardButton from './leaderboard/QuickClashLeaderboardButton'
import TaskProgressIndicator from './dailyTasks/TaskProgressIndicator'

const MotionBox = motion(Box)
const MotionButton = motion(Button)
const MotionFlex = motion(Flex)

const QuickClashHeader = ({ onNewChallenge }) => {
  const { t } = useTranslation('QuickClash')
  const navigate = useNavigate()
  const isDesktop = useBreakpointValue({ base: false, md: true })

  const handleBackToHome = () => {
    navigate('/home')
  }

  // Animation variants
  const containerVariants = {
    initial: { opacity: 0, y: -10 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    initial: { opacity: 0, y: -5 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  }

  const buttonVariants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 200,
        damping: 10,
        delay: 0.2,
      },
    },
    hover: {
      scale: 1.05,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 10,
      },
    },
    tap: { scale: 0.98 },
  }

  return (
    <MotionBox variants={containerVariants} initial="initial" animate="animate">
      {/* Back Button */}
      <MotionFlex
        justify="space-between"
        align="center"
        mb={4}
        variants={itemVariants}
      >
        <MotionButton
          leftIcon={<FiArrowLeft />}
          onClick={handleBackToHome}
          variant="ghost"
          color="whiteAlpha.800"
          _hover={{ bg: 'whiteAlpha.100', color: 'white' }}
          size="sm"
          fontWeight="normal"
        >
          {t('Back to Home')}
        </MotionButton>
      </MotionFlex>

      {/* Main Header Content */}
      <Flex
        direction={{ base: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ base: 'center', md: 'center' }}
        mb={{ base: 4, md: 8 }}
        gap={{ base: 0, md: 4 }}
      >
        {/* Title and Description */}
        <MotionBox
          flex="1"
          variants={itemVariants}
          textAlign={{ base: 'center', md: 'left' }}
          maxW={{ base: '100%', md: '60%' }}
        >
          <Heading size={{ base: 'xl', md: '2xl' }} color="purple.300" mb={2}>
            <Flex
              alignItems="center"
              justifyContent={{ base: 'center', md: 'flex-start' }}
            >
              <Icon as={Target} mr={2} />
              {t('Quick Clash')}
            </Flex>
          </Heading>

          <Text color="whiteAlpha.800" fontSize="md">
            {t(
              'Challenge other players to rapid-fire reading and quiz battles, test your knowledge and rise up the ranks!',
            )}
          </Text>
        </MotionBox>

        {/* Action Buttons Group */}
        <HStack
          spacing={3}
          align="center"
          justify={{ base: 'center', md: 'flex-end' }}
          mt={{ base: 2, md: 0 }}
          w={{ base: '100%', md: 'auto' }}
        >
          <MotionButton
            display={{ base: 'none', md: 'inline-flex' }}
            as={motion.button}
            leftIcon={<FiZap />}
            bg="purple.600"
            _hover={{ bg: 'purple.700' }}
            onClick={onNewChallenge}
            size="md"
            color="white"
            h="52px"
            px={6}
            borderRadius="xl"
            boxShadow="0 4px 15px rgba(0,0,0,0.2)"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            {t('New Challenge')}
          </MotionButton>

          {/* Leaderboard button is already responsive */}
          <QuickClashLeaderboardButton showMobileVersion={false} />
        </HStack>
      </Flex>
    </MotionBox>
  )
}

// Memoize the component to prevent unnecessary re-renders
export default memo(QuickClashHeader)
