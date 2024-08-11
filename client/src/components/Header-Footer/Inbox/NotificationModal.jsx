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
  Text,
  Spinner,
} from '@chakra-ui/react'
import { useSelector } from 'react-redux'
import rr from '/images/rrlogo.webp'

// Lazy load large components or sections if needed
const LazyNotificationContent = React.lazy(() =>
  import('./LazyNotificationContent'),
)

const NotificationModal = ({
  setIsModalOpen,
  selectedNotification,
  setIsDrawerOpen,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { user } = useSelector(state => state.auth)

  useEffect(() => {
    onOpen()
  }, [onOpen])

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false)
    setIsDrawerOpen(true)
    onClose()
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
        backgroundImage={{
          base: 'linear-gradient(-180deg, #1a1527, #0e0c16 88%, #0e0c16 99%)',
        }}
        backgroundColor={{ base: '#0f0d15', xl: 'transparent' }}
        boxShadow={{
          base: '0px 4px 8px rgba(0, 0, 0, 0.3), 0px 8px 16px rgba(0, 0, 0, 0.3), 0px 12px 24px rgba(0, 0, 0, 0.3)',
        }}
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
