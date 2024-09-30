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
} from '@chakra-ui/react'
import { useSelector } from 'react-redux'
import rr from '/images/rrlogo.webp'
import axios from 'axios'

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
  }, [])

  const handleModalClose = useCallback(() => {
    setIsModalOpen && setIsModalOpen(false)
    setIsDrawerOpen && setIsDrawerOpen(true)
    onClose()
    handleNotifModalClose && handleNotifModalClose()
  }, [onClose, setIsModalOpen, setIsDrawerOpen])

  const formattedDate = useMemo(() => {
    return selectedNotification
      ? new Date(selectedNotification.date).toLocaleString()
      : ''
  }, [selectedNotification])

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleModalClose}
      size={{ base: 'full', md: 'xl' }}
    >
      <ModalOverlay />
      <ModalContent
        bg="rgba(15, 13, 21, 1)"
        borderRadius="xl"
        boxShadow="0 8px 32px 0 rgba(31, 38, 135, 0.37)"
        border="1px solid rgba(255, 255, 255, 0.18)"
        color={'white'}
      >
        <ModalHeader display={'flex'} px={0} w={'100%'} pb={0}>
          <Flex justifyContent="center" w={'20%'} position={'relative'}>
            <Image
              ml={'3rem'}
              src={rr}
              alt="Notification Image"
              width="80px"
              height="80px"
              borderRadius="50%"
              objectFit="cover"
              objectPosition="center center"
            />
          </Flex>
          {selectedNotification && (
            <Flex w={'70%'}>
              <Heading
                ml={'3rem'}
                as="h2"
                size="md"
                fontWeight="bold"
                textShadow="2px 2px 4px rgba(0, 0, 0, 0.3)"
                borderRadius="md"
                px={2}
                py={1}
                mt={2}
                css={{
                  backdropFilter: 'blur(8px)',
                  border: '2px solid #4A5568', // Border color
                  padding: '10px 20px',
                  background: `linear-gradient(to right, #ff8a00, #e52e71)`,
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                }}
              >
                {selectedNotification.title}
              </Heading>
            </Flex>
          )}
        </ModalHeader>

        <ModalCloseButton onClick={handleModalClose} />
        <ModalBody>
          {selectedNotification && (
            <Suspense fallback={<Spinner />}>
              <LazyNotificationContent
                user={user}
                selectedNotification={selectedNotification}
                formattedDate={formattedDate}
              />
            </Suspense>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default NotificationModal
