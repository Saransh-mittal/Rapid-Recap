import React from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Text,
  Box,
  Icon,
  useBreakpointValue,
} from '@chakra-ui/react'
import { FiBarChart2 } from 'react-icons/fi'
import QuickClashAnalytics from './QuickClashAnalytics'

const QuickClashAnalyticsModal = ({ isOpen, onClose }) => {
  // Set responsive size for modal based on screen size
  const modalSize = useBreakpointValue({ base: 'full', lg: '90%' })
  const modalMargin = useBreakpointValue({ base: 0, lg: '5vh' })
  const modalMaxW = useBreakpointValue({ base: '100%', lg: '90vw' })
  const modalMaxH = useBreakpointValue({ base: '100vh', lg: '90vh' })
  const headerPadding = useBreakpointValue({ base: 3, md: 4 })

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={modalSize}
      scrollBehavior="inside"
      motionPreset="slideInBottom"
    >
      <ModalOverlay backdropFilter="blur(10px)" />
      <ModalContent
        bg="gray.800"
        color="white"
        maxW={modalMaxW}
        maxH={modalMaxH}
        my={modalMargin}
        borderRadius={useBreakpointValue({ base: 0, md: 'lg' })}
        boxShadow="dark-lg"
        borderWidth="1px"
        borderColor="purple.700"
      >
        <ModalHeader
          borderBottomWidth="1px"
          borderBottomColor="whiteAlpha.200"
          pb={headerPadding}
          pt={headerPadding}
          bg="gray.900"
          borderTopRadius={useBreakpointValue({ base: 0, md: 'lg' })}
          display="flex"
          alignItems="center"
        >
          <Icon as={FiBarChart2} color="purple.400" mr={3} boxSize={5} />
          <Text fontSize={{ base: 'lg', md: 'xl' }} fontWeight="bold">
            Quick Clash Analytics Dashboard
          </Text>
        </ModalHeader>
        <ModalCloseButton
          size="lg"
          color="whiteAlpha.700"
          _hover={{ color: 'white', bg: 'whiteAlpha.200' }}
        />
        <ModalBody p={0}>
          <Box
            overflowY="auto"
            maxH={{ base: 'calc(100vh - 60px)', lg: 'calc(90vh - 60px)' }}
            sx={{
              // Custom scrollbar for dark theme
              '&::-webkit-scrollbar': {
                width: '6px',
                borderRadius: '8px',
                backgroundColor: 'rgba(0, 0, 0, 0.05)',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: 'rgba(140, 90, 220, 0.5)',
                borderRadius: '8px',
              },
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(140, 90, 220, 0.5) rgba(0, 0, 0, 0.05)',
            }}
          >
            <QuickClashAnalytics />
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default QuickClashAnalyticsModal
