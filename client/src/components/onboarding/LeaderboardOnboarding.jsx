import React from 'react'
import { Box, Text, Button, Flex } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import LeaderBoard from '../../screens/LeaderBoard'
import { ChevronRightIcon } from '@chakra-ui/icons'
import { useTranslation } from 'react-i18next'

const MotionButton = motion(Button)

const LeaderboardOnboarding = ({ onComplete }) => {
  const { t } = useTranslation('OnboardingProcess')

  return (
    <Box position="relative" h="100vh" w="100vw">
      {/* Floating Button Container */}
      <Box
        position="fixed"
        bottom={{ base: '20px', md: '40px' }}
        left="50%"
        transform="translateX(-50%)"
        zIndex={1000}
        width={{ base: '90%', md: 'auto' }}
      >
        <MotionButton
          onClick={onComplete}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{
            scale: 1.05,
            boxShadow: '0 0 20px rgba(128, 90, 213, 0.6)',
          }}
          whileTap={{ scale: 0.95 }}
          bg="purple.600"
          color="white"
          size="lg"
          px={8}
          py={6}
          width={{ base: '100%', md: 'auto' }}
          fontSize={{ base: 'lg', md: 'xl' }}
          fontWeight="bold"
          borderRadius="full"
          _hover={{
            bg: 'purple.700',
          }}
          transition="all 0.3s"
          boxShadow="0 4px 15px rgba(128, 90, 213, 0.4)"
          rightIcon={<ChevronRightIcon boxSize={6} />}
          aria-label={t('leaderboardOnboarding.beginJourneyAriaLabel')}
        >
          <Flex align="center" gap={2}>
            <Text>{t('leaderboardOnboarding.beginJourneyButton')}</Text>
          </Flex>
        </MotionButton>
      </Box>

      {/* Gradient Overlay for Button Background */}
      <Box
        position="fixed"
        bottom={0}
        left={0}
        right={0}
        height={{ base: '100px', md: '120px' }}
        bgGradient="linear(to-t, rgba(44, 37, 71, 0.9), transparent)"
        pointerEvents="none"
        zIndex={999}
        aria-hidden="true"
      />

      {/* Main Leaderboard Content */}
      <Box
        height={'100vh'}
        position="relative"
        mt={{ base: '-20%', md: '-6%' }}
        zIndex={1}
        pb={{ base: '100px', md: '120px' }}
      >
        <LeaderBoard />
      </Box>
    </Box>
  )
}

export default LeaderboardOnboarding
