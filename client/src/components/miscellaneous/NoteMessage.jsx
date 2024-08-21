import React, { useEffect } from 'react'
import {
  Box,
  Heading,
  CloseButton,
  useDisclosure,
  Portal,
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'

const MotionBox = motion(Box)

const NoteMessage = ({
  title = 'Elegant Update',
  children,
  onClose,
  duration = 7000, // Default duration, set to null for permanent display
}) => {
  const { isOpen, onClose: closeDisclosure } = useDisclosure({
    defaultIsOpen: true,
  })

  useEffect(() => {
    if (duration !== null) {
      const timer = setTimeout(() => {
        handleClose()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [duration])

  const handleClose = () => {
    closeDisclosure()
    if (onClose) {
      setTimeout(onClose, 500) // Delay to allow for exit animation
    }
  }

  return (
    <Portal>
      <AnimatePresence>
        {isOpen && (
          <MotionBox
            position="fixed"
            top="20px"
            right="20px"
            width="320px"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 100, damping: 15 }}
            zIndex={1001}
          >
            <Box
              bg="gray.800"
              color="gray.100"
              borderRadius="md"
              overflow="hidden"
              boxShadow="lg"
              borderWidth="1px"
              borderColor="gray.700"
            >
              <Box
                bg="gray.700"
                px={5}
                py={3}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                borderBottomWidth="1px"
                borderColor="gray.600"
              >
                <Heading as="h3" size="sm" textTransform={'uppercase'}>
                  {title}
                </Heading>
                <CloseButton size="sm" onClick={handleClose} />
              </Box>
              {children}
            </Box>
          </MotionBox>
        )}
      </AnimatePresence>
    </Portal>
  )
}

export default NoteMessage
