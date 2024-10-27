/**
 * SSR-safe Chakra UI component wrappers
 */

import React from 'react'
import { Box, Image, useColorMode } from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { isServer } from '../utils/environment'

// Safe motion components
export const MotionBox = motion(Box)
export const MotionImage = motion(Image)

// Safe color mode component
export const SafeColorMode = ({ children }) => {
  const { colorMode } = useColorMode()

  // Prevent flash of wrong theme
  if (isServer) {
    return <>{children}</>
  }

  return (
    <Box
      sx={{
        '*, *::before, *::after': {
          transition: 'none !important',
        },
      }}
      {...(colorMode === 'dark' ? { bg: 'gray.800', color: 'white' } : {})}
    >
      {children}
    </Box>
  )
}

// Safe animation wrapper
export const SafeAnimatePresence = ({ children, ...props }) => {
  if (isServer) {
    return <>{children}</>
  }

  return <AnimatePresence {...props}>{children}</AnimatePresence>
}

// Safe image component
export const SafeImage = ({ src, fallbackSrc, alt, ...props }) => {
  if (isServer) {
    // Return a simpler version during SSR
    return <Box as="img" src={fallbackSrc || src} alt={alt} {...props} />
  }

  return (
    <Image
      src={src}
      fallbackSrc={fallbackSrc}
      alt={alt}
      loading="lazy"
      {...props}
    />
  )
}

// Safe modal component that prevents scroll on mount
export const SafeModal = ({ children, isOpen, onClose, ...props }) => {
  React.useEffect(() => {
    if (isOpen && !isServer) {
      document.body.style.overflow = 'hidden'
    }
    return () => {
      if (!isServer) {
        document.body.style.overflow = ''
      }
    }
  }, [isOpen])

  if (isServer) {
    return null // Don't render modals during SSR
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} {...props}>
      {children}
    </Modal>
  )
}
