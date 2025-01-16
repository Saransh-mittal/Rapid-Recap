// src/components/rewards/AchievementBadgesSection.jsx
import React from 'react'
import { Box, Text, SimpleGrid, VStack } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

const MiniAchievementBadge = ({ badge, delay, t }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      style={{ width: '100%' }}
    >
      <motion.div
        animate={{
          y: [-2, 2, -2],
          rotate: [-2, 2, -2],
        }}
        transition={{
          repeat: Infinity,
          duration: 3,
          ease: 'easeInOut',
          delay: Math.random(),
        }}
      >
        <Box
          position="relative"
          display="flex"
          flexDirection="column"
          alignItems="center"
          p={4}
        >
          {/* Badge Image */}
          <Box
            as="img"
            src={badge.badge.image}
            alt={badge.type}
            w={{
              base: badge.type === 'TOP_10' ? '65px' : '90px',
              md: badge.type === 'TOP_10' ? '80px' : '100px',
            }}
            h={{
              base: badge.type === 'TOP_10' ? '65px' : '90px',
              md: badge.type === 'TOP_10' ? '80px' : '100px',
            }}
            objectFit="contain"
            filter={`drop-shadow(0 0 8px ${badge.badge.style.color}40)`}
            mb={2}
          />

          {/* Badge Title */}
          <Text
            fontSize={{ base: 'xs', md: 'sm' }}
            fontWeight="medium"
            color="whiteAlpha.900"
            textAlign="center"
            mt={2}
          >
            {badge.type.includes('TOP')
              ? t(`achievements.${badge.type}.title`)
              : badge.badge.title}
          </Text>
          <Text
            fontSize={{ base: '2xs', md: 'xs' }}
            color="whiteAlpha.600"
            textAlign="center"
            px={2}
          >
            {t(`achievements.${badge.type}.description`)}
          </Text>

          {/* Glow Effect */}
          <Box
            position="absolute"
            inset={0}
            bgGradient={badge.badge.style.background}
            opacity={0.1}
            filter="blur(20px)"
            zIndex={-1}
          />
        </Box>
      </motion.div>
    </motion.div>
  )
}

const AchievementBadgesSection = ({ badges }) => {
  const { t } = useTranslation('rewards')
  return (
    <Box
      bg="rgba(17, 17, 26, 0.4)"
      backdropFilter="blur(20px)"
      borderRadius="2xl"
      borderWidth="1px"
      borderColor="whiteAlpha.100"
      position="relative"
      overflow="hidden"
      p={8}
      _hover={{
        borderColor: 'whiteAlpha.300',
      }}
      transition="all 0.3s ease"
    >
      <VStack spacing={6}>
        <Text
          fontSize={{ base: 'lg', md: 'xl' }}
          fontWeight="bold"
          color="whiteAlpha.900"
          textAlign="center"
          mb={4}
        >
          {t('modal.sections.achievements')}
        </Text>

        <SimpleGrid columns={{ base: 2, sm: 3, md: 4 }} spacing={4} w="full">
          {badges.map((badge, index) => (
            <MiniAchievementBadge
              key={badge.type}
              badge={badge}
              delay={0.1 * (index + 1)}
              t={t}
            />
          ))}
        </SimpleGrid>
      </VStack>

      {/* Background Effects */}
      <Box
        position="absolute"
        inset={0}
        bgGradient="linear(to-br, whiteAlpha.50, transparent)"
        opacity={0.05}
        zIndex={0}
      />

      {/* Animated Background */}
      <Box
        as={motion.div}
        position="absolute"
        inset={0}
        bgGradient="radial(circle at 50% 50%, whiteAlpha.100, transparent)"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        zIndex={0}
      />
    </Box>
  )
}

export default AchievementBadgesSection
