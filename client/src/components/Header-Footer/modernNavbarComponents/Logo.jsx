// Logo.js
import React, { memo } from 'react'
import { Flex, Image, Text } from '@chakra-ui/react'
import { motion } from 'framer-motion'

const MotionFlex = motion(Flex)

const Logo = memo(({ onNavigate }) => (
  <MotionFlex
    align="center"
    gap={2.5}
    cursor="pointer"
    onClick={onNavigate}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    role="button"
  >
    <Image
      src="/images/rrlogo.webp"
      alt="Rapid Recap"
      height="32px"
      width="32px"
      objectFit="contain"
      loading="eager"
      priority="high"
    />
    <Text
      fontSize="xl"
      fontWeight="600"
      color="white"
      letterSpacing="tight"
      display={{ base: 'none', md: 'block' }}
    >
      Rapid Recap
    </Text>
  </MotionFlex>
))

Logo.displayName = 'Logo'

export default Logo
