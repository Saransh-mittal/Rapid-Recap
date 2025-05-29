// components/quickClashComponents/globalmatchmaking/components/TeamSelectionIntro.jsx
import React from 'react'
import { VStack, Text, Box, HStack, Icon } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Users, Shield } from 'lucide-react'

const MotionBox = motion(Box)

/**
 * Introduction screen shown when not in matchmaking
 */
const TeamSelectionIntro = React.memo(() => {
  const { t } = useTranslation('QuickClash')

  return (
    <VStack spacing={6} align="stretch">
      {/* Header */}
      <VStack spacing={2} align="center">
        <MotionBox
          animate={{
            scale: [1, 1.05, 1],
            rotate: [0, 2, 0, -2, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatType: 'loop',
          }}
        >
          <Icon as={Users} boxSize={12} color="blue.400" />
        </MotionBox>
        <Text color="white" fontSize="xl" fontWeight="bold">
          {t('Join 4v4 Team Battle')}
        </Text>
        <Text color="whiteAlpha.700" textAlign="center" px={{ base: 2, md: 4 }}>
          {t(
            "Choose to join with your team or as an individual player. We'll handle the rest!",
          )}
        </Text>
      </VStack>

      {/* How it works */}
      <Box bg="rgba(255, 255, 255, 0.05)" p={4} borderRadius="md">
        <HStack mb={2}>
          <Icon as={Shield} color="blue.400" boxSize={5} />
          <Text color="white" fontWeight="bold" fontSize="md">
            {t('How It Works')}
          </Text>
        </HStack>
        <VStack spacing={2} align="start">
          {[
            t('We find 3 other players or complete your team to 4 members'),
            t('We match your team with another team of similar skill'),
            t('Each player battles in one of four different categories'),
            t("Win trophies based on your team's performance!"),
          ].map((step, index) => (
            <HStack key={index} align="start">
              <Box
                w="20px"
                h="20px"
                bg="blue.400"
                borderRadius="full"
                display="flex"
                alignItems="center"
                justifyContent="center"
                flexShrink={0}
                mt={0.5}
              >
                <Text color="white" fontSize="xs" fontWeight="bold">
                  {index + 1}
                </Text>
              </Box>
              <Text color="whiteAlpha.800" fontSize="sm" lineHeight="1.4">
                {step}
              </Text>
            </HStack>
          ))}
        </VStack>
      </Box>
    </VStack>
  )
})

TeamSelectionIntro.displayName = 'TeamSelectionIntro'

export default TeamSelectionIntro
