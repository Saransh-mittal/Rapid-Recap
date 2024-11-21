// IconButton.js
import React from 'react'
import { Flex, Box } from '@chakra-ui/react'
import { motion } from 'framer-motion'

const MotionFlex = motion(Flex)

export const IconButton = ({
  icon,
  hasNotification = false,
  notificationCount,
  onClick,
  ...props
}) => (
  <MotionFlex
    position="relative"
    align="center"
    justify="center"
    cursor="pointer"
    whileHover={{ scale: 1.08 }}
    whileTap={{ scale: 0.95 }}
    color="whiteAlpha.800"
    _hover={{ color: 'white' }}
    transition={{ duration: 0.1 }}
    onClick={onClick}
    role="button"
    {...props}
  >
    {hasNotification && (
      <Box
        position="absolute"
        top={-1}
        right={-1}
        minW="16px"
        h="16px"
        bg="red.500"
        borderRadius="full"
        display="flex"
        alignItems="center"
        justifyContent="center"
        fontSize="xs"
        color="white"
        padding="0 4px"
      >
        {notificationCount > 0 && notificationCount}
      </Box>
    )}
    {icon}
  </MotionFlex>
)
