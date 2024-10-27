import React, { useEffect, useMemo, useCallback, Suspense } from 'react'
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  Image,
  Flex,
  Heading,
  Spinner,
  Box,
  Icon,
  Text,
  Badge,
} from '@chakra-ui/react'
import { BellIcon, TimeIcon } from '@chakra-ui/icons'
import { useSelector } from 'react-redux'
import axios from 'axios'

//SSR images
const rr = '/images/rrlogo.webp'

// Lazy load large components or sections if needed
const LazyNotificationContent = React.lazy(() =>
  import('./LazyNotificationContent'),
)

const NotificationModal = ({
  setIsModalOpen,
  selectedNotification,
  setIsDrawerOpen,
  handleNotifModalClose,
  selectedNotificationId,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { user } = useSelector(state => state.auth)

  useEffect(() => {
    setReadUpdate()
    onOpen()
  }, [onOpen])

  const setReadUpdate = useCallback(async () => {
    if (!selectedNotificationId) return
    try {
      await axios.put(
        `/api/user/readUpdates?updateId=${selectedNotificationId}`,
      )
    } catch (error) {
      console.log(error)
    }
  }, [selectedNotificationId])

  const handleModalClose = useCallback(() => {
    setIsModalOpen && setIsModalOpen(false)
    setIsDrawerOpen && setIsDrawerOpen(true)
    onClose()
    handleNotifModalClose && handleNotifModalClose()
  }, [onClose, setIsModalOpen, setIsDrawerOpen, handleNotifModalClose])

  const formattedDate = useMemo(() => {
    return selectedNotification
      ? new Date(selectedNotification.date).toLocaleString()
      : ''
  }, [selectedNotification])

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleModalClose}
      size={{ base: 'full', md: '2xl' }}
      motionPreset="slideInBottom"
    >
      <ModalOverlay backdropFilter="blur(4px)" bg="blackAlpha.600" />
      <ModalContent
        bg="linear-gradient(180deg, #1E1533 0%, #0A0813 100%)"
        borderRadius="xl"
        border="1px solid"
        borderColor="whiteAlpha.100"
        boxShadow="dark-lg"
        color="white"
        overflow="hidden"
      >
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          height="8px"
          bgGradient="linear(to-r, purple.500, pink.500)"
        />

        <ModalHeader p={6}>
          <Flex gap={6} align="start">
            <Box position="relative" flexShrink={0} className="image-container">
              <Image
                src={rr}
                alt="Notification Image"
                w="64px"
                h="64px"
                borderRadius="full"
                border="2px solid"
                borderColor="purple.400"
                bg="whiteAlpha.100"
                fallback={
                  <Icon as={BellIcon} w="64px" h="64px" color="purple.400" />
                }
              />
              <Badge
                position="absolute"
                bottom="-2"
                right="-2"
                colorScheme="purple"
                variant="solid"
                fontSize="xs"
                borderRadius="full"
                px={2}
              >
                New
              </Badge>
            </Box>

            <Box flex="1">
              {selectedNotification && (
                <>
                  <Heading
                    size="lg"
                    bgGradient="linear(to-r, purple.400, pink.400)"
                    bgClip="text"
                    letterSpacing="tight"
                    mb={2}
                  >
                    {selectedNotification.title}
                  </Heading>
                  <Flex align="center" gap={2} color="whiteAlpha.700">
                    <TimeIcon w={3} h={3} />
                    <Text fontSize="sm">{formattedDate}</Text>
                  </Flex>
                </>
              )}
            </Box>
          </Flex>
        </ModalHeader>

        <ModalCloseButton
          size="lg"
          color="whiteAlpha.700"
          _hover={{ color: 'white' }}
        />

        <ModalBody px={6} pb={6}>
          {selectedNotification ? (
            <Suspense
              fallback={
                <Flex justify="center" py={8}>
                  <Spinner color="purple.400" size="xl" />
                </Flex>
              }
            >
              <Box
                bg="whiteAlpha.50"
                borderRadius="lg"
                p={6}
                backdropFilter="blur(8px)"
                border="1px solid"
                borderColor="whiteAlpha.100"
              >
                <LazyNotificationContent
                  user={user}
                  selectedNotification={selectedNotification}
                  formattedDate={formattedDate}
                />
              </Box>
            </Suspense>
          ) : (
            <Flex
              direction="column"
              align="center"
              justify="center"
              py={12}
              color="whiteAlpha.700"
            >
              <Icon as={BellIcon} w={12} h={12} mb={4} />
              <Text fontSize="lg">No notification selected</Text>
            </Flex>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default NotificationModal
