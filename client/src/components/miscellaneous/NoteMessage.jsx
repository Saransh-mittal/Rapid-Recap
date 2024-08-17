import React, { useEffect } from 'react'
import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  CloseButton,
  useDisclosure,
  SlideFade,
} from '@chakra-ui/react'

const NoteMessage = ({
  title = 'Elegant Update',
  message = "We've refined your experience with a touch of sophistication. Discover the nuanced improvements we've crafted for you.",
  actionText = 'Explore Details',
  actionHref = '#',
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
    <SlideFade in={isOpen} offsetY="20px">
      <Box
        position="fixed"
        top="20px"
        right="20px"
        width="320px"
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
          <Heading as="h3" size="sm" fontFamily="'Playfair Display', serif">
            {title}
          </Heading>
          <CloseButton size="sm" onClick={handleClose} />
        </Box>
        <VStack align="stretch" spacing={4} p={5}>
          <Text fontSize="sm" color="gray.300">
            {message}
          </Text>
          <Button
            as="a"
            href={actionHref}
            size="sm"
            colorScheme="gray"
            fontWeight="semibold"
            _hover={{ transform: 'translateY(-2px)', boxShadow: 'sm' }}
            transition="all 0.3s"
          >
            {actionText}
          </Button>
        </VStack>
      </Box>
    </SlideFade>
  )
}

export default NoteMessage
