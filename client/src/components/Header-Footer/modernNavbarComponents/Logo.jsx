// Logo.js
import React, { memo } from 'react'
import { Flex, Image, Text } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

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
      >
        <Image
          src="/images/rrlogo.webp"
          alt="Rapid Recap"
          height={isHamburgerOpen ? '50px' : '32px'}
          width={isHamburgerOpen ? '50px' : '32px'}
          objectFit="contain"
          loading="eager"
          priority="high"
        />
        <Text
          fontSize={isHamburgerOpen ? '3xl' : 'xl'}
          fontWeight="600"
          color="white"
          letterSpacing="tight"
          display={{
            base: isHamburgerOpen || !isAuthenticated ? 'block' : 'none',
            md: 'block',
          }}
        >
          {t('rr')}
        </Text>
      </MotionFlex>
    )
  },
)

Logo.displayName = 'Logo'

export default Logo
