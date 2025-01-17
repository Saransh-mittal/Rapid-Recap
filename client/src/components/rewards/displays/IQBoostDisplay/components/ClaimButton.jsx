// src/components/rewards/displays/IQBoostDisplay/components/ClaimButton.jsx
import React, { memo } from 'react'
import { Box } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const ClaimButton = ({ onClick, disabled, theme }) => {
  const buttonGradient =
    theme?.buttonGradient || 'linear(to-r, blue.400, blue.600)'
  const glowColor = theme?.glowColor || 'rgba(99, 179, 237, 0.4)'
  const shimmerColor = theme?.shimmerColor || 'rgba(99, 179, 237, 0.15)'
  const { t } = useTranslation('rewards')
  return (
    <Box
      as={motion.button}
      w="full"
      h="70px"
      borderRadius="2xl"
      fontSize={{ base: 'xl', md: '2xl' }}
      fontWeight="bold"
      display="flex"
      alignItems="center"
      justifyContent="center"
      gap={3}
      disabled={disabled}
      whileHover={{
        scale: 1.02,
        boxShadow: `0 0 30px ${glowColor}`,
      }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      bgGradient={buttonGradient}
      color="white"
      _hover={{
        cursor: 'pointer',
      }}
      transition="all 0.3s ease"
      boxShadow={`0 0 20px ${glowColor}`}
      position="relative"
      overflow="hidden"
      css={{
        backdropFilter: 'blur(10px)',
      }}
    >
      {/* Shimmer effect */}
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        bottom="0"
        bgGradient={`linear(to-r, transparent, ${shimmerColor}, transparent)`}
        transform="translateX(-100%)"
        animation="shimmer 2s infinite"
        sx={{
          '@keyframes shimmer': {
            '100%': {
              transform: 'translateX(100%)',
            },
          },
        }}
      />

      <Sparkles size={28} />
      <span>{t('iqBoost.button.claim')}</span>
      <Sparkles size={28} />
    </Box>
  )
}

export default memo(ClaimButton)
