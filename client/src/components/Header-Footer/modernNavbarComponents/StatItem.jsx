// StatItem.js
import React, { memo } from 'react'
import { Flex, Text, Box, Image } from '@chakra-ui/react'
import { motion } from 'framer-motion'

const MotionFlex = motion(Flex)

const StatItem = memo(({ icon, value, color, size = 'md', ...props }) => {
  const sizes = {
    sm: { iconSize: '16px', fontSize: '16px' },
    md: { iconSize: '20px', fontSize: '18px' },
    lg: { iconSize: '24px', fontSize: '20px' },
  }

  const renderIcon = () => {
    // If icon is a string, treat it as an image path
    if (typeof icon === 'string') {
      return (
        <Image
          src={icon}
          alt="Stat Icon"
          width={sizes[size].iconSize}
          height={sizes[size].iconSize}
          objectFit="contain"
        />
      )
    }
    // Otherwise render it as a regular icon component
    return icon
  }

  return (
    <MotionFlex
      align="center"
      gap={1.5}
      cursor="pointer"
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.1 }}
      role="button"
      {...props}
    >
      <Box
        color={color}
        display="flex"
        alignItems="center"
        mr={-1}
        fontSize={sizes[size].iconSize}
      >
        {renderIcon()}
      </Box>
      <Text
        fontSize={sizes[size].fontSize}
        fontWeight="700"
        color={color}
        letterSpacing="tight"
      >
        {value}
      </Text>
    </MotionFlex>
  )
})

StatItem.displayName = 'StatItem'

export default StatItem
