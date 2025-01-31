// Navigation.js
import React, { memo, useMemo } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { Link, HStack } from '@chakra-ui/react'
import { motion } from 'framer-motion'

// Create a motion-enabled Chakra Link component
const MotionLink = motion(Link)

const NavLink = memo(({ label, isActive, onClick, path }) => (
  <MotionLink
    as={RouterLink} // Combine Chakra + React Router
    to={path} // Required for href (SEO)
    onClick={e => {
      e.preventDefault() // Prevent full page reload
      onClick()
    }}
    sx={{
      fontSize: 'md',
      textTransform: 'uppercase',
      fontWeight: isActive ? '600' : '500',
      color: isActive ? 'white' : 'whiteAlpha.800',
      cursor: 'pointer',
      position: 'relative',
      _hover: {
        color: 'white',
        textDecoration: 'none', // Disable underline
      },
      _after: isActive
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
        : undefined,
    }}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
  >
    {label}
  </MotionLink>
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
          path={path}
        />
      ))}
    </HStack>
  )
})

Navigation.displayName = 'Navigation'

export default Navigation
