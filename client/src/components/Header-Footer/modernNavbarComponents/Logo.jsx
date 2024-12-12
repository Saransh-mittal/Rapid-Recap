import React, { memo } from 'react'
import { Flex, Image, Text } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { keyframes } from '@emotion/react'
const pulse = keyframes`
  0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
  50% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.8; }
`

const MotionFlex = motion(Flex)

const Logo = memo(
  ({ onNavigate, isHamburgerOpen = false, isAuthenticated }) => {
    const { t } = useTranslation('NavBrand')

    return (
      <MotionFlex
        align="center"
        gap={2.5}
        cursor="pointer"
        onClick={onNavigate}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        role="button"
        zIndex={1}
        position="relative"
      >
        <Flex position="relative">
          {/* Glow Effect */}
          <Flex
            position="absolute"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            width={isHamburgerOpen ? '70px' : '52px'}
            height={isHamburgerOpen ? '70px' : '52px'}
            bgGradient="radial-gradient(circle, rgba(237, 100, 166, 0.2) 0%, transparent 70%)"
            borderRadius="full"
            animation={`${pulse} 2s infinite ease-in-out`}
            zIndex={1}
          />

          <Image
            src="/images/rrlogo.webp"
            alt="Rapid Recap"
            height={isHamburgerOpen ? '50px' : '40px'}
            width={isHamburgerOpen ? '50px' : '40px'}
            objectFit="contain"
            loading="eager"
            priority="high"
            position="relative"
            zIndex={2}
            filter="drop-shadow(0 0 20px rgba(237, 100, 166, 0.3))"
          />
        </Flex>
        <Text
          fontSize={isHamburgerOpen ? '3xl' : 'xl'}
          fontWeight="600"
          color="white"
          letterSpacing="tight"
          display={{
            base: isHamburgerOpen || !isAuthenticated ? 'block' : 'none',
            md: 'block',
          }}
          bgGradient="linear(135deg, #ED64A6, #805AD5)"
          bgClip="text"
          animation="fadeIn 0.8s ease-out"
        >
          {t('rr')}
        </Text>
      </MotionFlex>
    )
  },
)

Logo.displayName = 'Logo'

export default Logo
