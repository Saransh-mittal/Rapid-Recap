import React from 'react'
import { Box, Heading, Text, Button, Image } from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { isClient } from '../../utils/environment'

// Create motion components only on client side
const MotionBox = isClient ? motion(Box) : Box
const MotionHeading = isClient ? motion(Heading) : Heading
const MotionText = isClient ? motion(Text) : Text
const MotionButton = isClient ? motion(Button) : Button
const MotionImage = isClient ? motion(Image) : Image

// Export wrapped components
export const SafeBox = props => <MotionBox {...props} />
export const SafeHeading = props => <MotionHeading {...props} />
export const SafeText = props => <MotionText {...props} />
export const SafeButton = props => <MotionButton {...props} />
export const SafeImage = props => <MotionImage {...props} />

// Animation Presence wrapper
export const SafeAnimatePresence = ({ children, ...props }) => {
  if (!isClient) {
    return <>{children}</>
  }
  return <AnimatePresence {...props}>{children}</AnimatePresence>
}

// Safe color mode wrapper
export const SafeColorMode = ({ children }) => {
  if (!isClient) {
    return <>{children}</>
  }

  return (
    <Box
      sx={{
        '*, *::before, *::after': {
          transition: 'none !important',
        },
      }}
    >
      {children}
    </Box>
  )
}

// Default exports for named imports
export default {
  SafeBox,
  SafeHeading,
  SafeText,
  SafeButton,
  SafeImage,
  SafeAnimatePresence,
  SafeColorMode,
}
