// Navigation.js
import React, { memo, useMemo } from 'react'
import { HStack, Text } from '@chakra-ui/react'
import { motion } from 'framer-motion'

const MotionText = motion(Text)

const NavLink = memo(({ label, isActive, onClick }) => (
  <MotionText
    fontSize="md"
    textTransform="uppercase"
    fontWeight={isActive ? '600' : '500'}
    color={isActive ? 'white' : 'whiteAlpha.800'}
    cursor="pointer"
    position="relative"
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    _hover={{
      color: 'white',
    }}
    _after={
      isActive
        ? {
            content: '""',
            position: 'absolute',
            bottom: '-6px',
            left: '50%',
            width: '4px',
            height: '4px',
            borderRadius: 'full',
            bg: 'white',
            transform: 'translateX(-50%)',
          }
        : {}
    }
  >
    {label}
  </MotionText>
))

NavLink.displayName = 'NavLink'

const Navigation = memo(({ items, currentPath, onNavigate }) => {
  const isLinkActive = useMemo(
    () => path => currentPath.includes(path),
    [currentPath],
  )

  return (
    <HStack spacing={10} px={4}>
      {items.map(({ label, path }) => (
        <NavLink
          key={path}
          label={label}
          isActive={isLinkActive(path)}
          onClick={() => onNavigate(path)}
        />
      ))}
    </HStack>
  )
})

Navigation.displayName = 'Navigation'

export default Navigation
