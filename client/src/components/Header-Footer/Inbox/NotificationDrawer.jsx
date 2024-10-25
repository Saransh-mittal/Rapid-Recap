import {
  Box,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerCloseButton,
  useDisclosure,
  Image,
  Heading,
  Text,
  Flex,
  useToast,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useMediaQuery,
  Badge,
  Divider,
  Icon,
  VStack,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react'
import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { DeleteIcon, BellIcon, TimeIcon } from '@chakra-ui/icons'
import axios from 'axios'
import useSound from '../../../customHooks/useSound'
import { useDispatch, useSelector } from 'react-redux'
import { setUpdates } from '../../../redux/appSlice'
import { useTranslation } from 'react-i18next'
import Rapid_recap from '/images/rrlogo.webp'

const NotificationDrawer = ({
  setIsDrawerOpen,
  setIsModalOpen,
  setSelectedNotification,
  setIsHamburgerOpen,
}) => {
  // Hooks
  const { t } = useTranslation('NotificationDrawer')
  const { playClick } = useSound()
  const dispatch = useDispatch()
  const { updates } = useSelector(state => state.app)
  const toast = useToast()
  const isScreenSmallerThan48em = useMediaQuery('(max-width: 48em)')[0]
  const { isOpen, onOpen, onClose } = useDisclosure()

  // State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [notificationToDelete, setNotificationToDelete] = useState(null)
  const [removeAllModalOpen, setRemoveAllModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // Memoized Data
  const notificationData = useMemo(() => updates, [updates])

  // Text Extraction Function
  const extractTextFromHtml = useCallback(html => {
    try {
      // Create a temporary div
      const div = document.createElement('div')
      div.innerHTML = html

      // Remove script and style elements
      const scripts = div.getElementsByTagName('script')
      const styles = div.getElementsByTagName('style')
      while (scripts[0]) scripts[0].parentNode.removeChild(scripts[0])
      while (styles[0]) styles[0].parentNode.removeChild(styles[0])

      // Get text content and clean it up
      let text = div.textContent || div.innerText || ''

      // Remove extra whitespace and clean up the text
      text = text
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .replace(/^\s+|\s+$/g, '') // Trim start and end
        .replace(/\n+/g, ' ') // Replace newlines with spaces

      return text
    } catch (error) {
      console.error('Error extracting text:', error)
      return ''
    }
  }, [])

  // Error Handler
  const handleError = useCallback(
    (error, customMessage) => {
      console.error(error)
      setError(error.message)
      toast({
        title: t('error'),
        description: customMessage || error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      })
    },
    [toast, t],
  )

  // Click Handlers
  const handleNotificationClick = useCallback(
    notification => {
      try {
        playClick()
        setSelectedNotification(notification)
        setIsModalOpen(true)
        setIsDrawerOpen(false)
      } catch (error) {
        handleError(error, t('errorOpeningNotification'))
      }
    },
    [
      setSelectedNotification,
      setIsModalOpen,
      setIsDrawerOpen,
      playClick,
      handleError,
      t,
    ],
  )

  const handleDeleteClick = useCallback(
    notification => {
      try {
        playClick()
        setNotificationToDelete(notification)
        setIsDeleteModalOpen(true)
      } catch (error) {
        handleError(error, t('errorDeletingNotification'))
      }
    },
    [playClick, handleError, t],
  )

  const handleRemoveAllClick = useCallback(() => {
    try {
      playClick()
      setRemoveAllModalOpen(true)
    } catch (error) {
      handleError(error, t('errorRemovingAll'))
    }
  }, [playClick, handleError, t])

  // API Calls
  const setReadUpdate = useCallback(
    async updateId => {
      try {
        setIsLoading(true)
        const response = await axios.put(
          `/api/user/readUpdates?updateId=${updateId}`,
        )

        if (response.status === 200) {
          const updatedNotifications = notificationData.map(update =>
            update._id === updateId ? { ...update, read: true } : update,
          )
          dispatch(setUpdates(updatedNotifications))
        } else {
          throw new Error(t('markAsReadError'))
        }
      } catch (error) {
        handleError(error, t('markAsReadError'))
      } finally {
        setIsLoading(false)
      }
    },
    [notificationData, dispatch, handleError, t],
  )

  const trashUpdate = useCallback(async () => {
    try {
      setIsLoading(true)
      playClick()
      const response = await axios.put(
        `/api/user/trashUpdates/${notificationToDelete._id}`,
      )

      if (response.status === 200) {
        const updatedNotificationData = notificationData.filter(
          update => update._id !== notificationToDelete._id,
        )
        dispatch(setUpdates(updatedNotificationData))
        toast({
          title: t('success'),
          description: t('deleteSuccess'),
          status: 'success',
          duration: 3000,
          isClosable: true,
          position: 'top',
        })
      } else {
        throw new Error(t('deleteError'))
      }
    } catch (error) {
      handleError(error, t('deleteError'))
    } finally {
      setIsLoading(false)
      setIsDeleteModalOpen(false)
    }
  }, [
    notificationToDelete,
    notificationData,
    dispatch,
    playClick,
    toast,
    handleError,
    t,
  ])

  const removeAllNotifications = useCallback(async () => {
    try {
      setIsLoading(true)
      playClick()
      const response = await axios.put('/api/user/trashAllUpdates')

      if (response.status === 200) {
        dispatch(setUpdates([]))
        toast({
          title: t('success'),
          description: t('removeAllSuccess'),
          status: 'success',
          duration: 3000,
          isClosable: true,
          position: 'top',
        })
      } else {
        throw new Error(t('removeAllError'))
      }
    } catch (error) {
      handleError(error, t('removeAllError'))
    } finally {
      setIsLoading(false)
      setRemoveAllModalOpen(false)
    }
  }, [playClick, dispatch, toast, handleError, t])

  // Effects
  useEffect(() => {
    onOpen()
  }, [onOpen])

  // Render Helper Functions
  const renderNotification = (update, index) => (
    <Box
      key={index}
      w="full"
      p={4}
      cursor="pointer"
      transition="all 0.2s"
      _hover={{ bg: 'whiteAlpha.50' }}
      onClick={() => {
        setReadUpdate(update._id)
        handleNotificationClick(update)
      }}
    >
      <Flex gap={4}>
        <Box flexShrink={0}>
          <Image
            src={Rapid_recap}
            alt={t('notificationImage')}
            boxSize="40px"
            borderRadius="full"
            border="2px solid"
            borderColor="purple.400"
            fallback={<Icon as={BellIcon} boxSize="40px" color="purple.400" />}
          />
        </Box>

        <Box flex={1}>
          <Flex justify="space-between" align="center" mb={2}>
            <Heading size="sm" color={update.read ? 'whiteAlpha.700' : 'white'}>
              {update.title}
            </Heading>
            <Badge
              colorScheme={update.read ? 'gray' : 'purple'}
              variant="subtle"
              fontSize="xs"
            >
              {update.read ? t('read') : t('new')}
            </Badge>
          </Flex>

          <Text
            color={update.read ? 'whiteAlpha.700' : 'whiteAlpha.900'}
            fontSize="sm"
            noOfLines={2}
            mb={2}
            css={{
              display: '-webkit-box',
              WebkitLineClamp: '2',
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {extractTextFromHtml(update.mainText).substring(0, 120)}...
          </Text>

          <Flex justify="space-between" align="center">
            <Flex align="center" gap={2} color="whiteAlpha.600">
              <TimeIcon w={3} h={3} />
              <Text fontSize="xs">
                {new Date(update.date).toLocaleString()}
              </Text>
            </Flex>

            <Button
              size="sm"
              variant="ghost"
              colorScheme="red"
              onClick={e => {
                e.stopPropagation()
                handleDeleteClick(update)
              }}
              isLoading={isLoading && notificationToDelete?._id === update._id}
            >
              <DeleteIcon />
            </Button>
          </Flex>
        </Box>
      </Flex>
    </Box>
  )

  const renderError = () => (
    <Alert status="error" variant="solid" borderRadius="md" m={4}>
      <AlertIcon />
      <Box>
        <AlertTitle>{t('error')}</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Box>
    </Alert>
  )

  const renderEmptyState = () => (
    <Flex
      direction="column"
      align="center"
      justify="center"
      p={8}
      textAlign="center"
      color="whiteAlpha.700"
    >
      <Icon as={BellIcon} w={12} h={12} mb={4} />
      <Text fontSize="lg" fontWeight="medium">
        {t('noNotifications')}
      </Text>
      <Text fontSize="sm">{t('notificationsWillAppearHere')}</Text>
    </Flex>
  )

  // Main Render
  return (
    <>
      <Drawer
        size={{ base: 'full', lg: 'sm' }}
        isOpen={isOpen}
        placement="right"
        onClose={() => {
          isScreenSmallerThan48em && setIsHamburgerOpen(true)
          setIsDrawerOpen(false)
          onClose()
        }}
      >
        <DrawerOverlay backdropFilter="blur(4px)" />
        <DrawerContent
          bg="linear-gradient(180deg, #1E1533 0%, #0A0813 100%)"
          // boxShadow="dark-lg"
          borderLeft="1px solid"
          borderColor="whiteAlpha.100"
        >
          <DrawerCloseButton
            color="whiteAlpha.700"
            _hover={{ color: 'white' }}
            size="lg"
          />

          <DrawerHeader borderBottomWidth="1px" borderColor="whiteAlpha.100">
            <Flex alignItems="center" mb={4} gap={3}>
              <Flex alignItems="center" gap={3}>
                <Icon as={BellIcon} w={6} h={6} color="purple.400" />
                <Heading
                  size="lg"
                  bgGradient="linear(to-r, purple.400, pink.400)"
                  bgClip="text"
                >
                  {t('inbox')}
                </Heading>
              </Flex>
              {notificationData.length > 0 && (
                <Button
                  leftIcon={<DeleteIcon />}
                  variant="outline"
                  borderColor="whiteAlpha.200"
                  color="whiteAlpha.900"
                  _hover={{
                    bg: 'whiteAlpha.50',
                    borderColor: 'red.400',
                    color: 'red.400',
                  }}
                  size="sm"
                  onClick={handleRemoveAllClick}
                  isLoading={isLoading}
                >
                  {t('removeAllNotifications')}
                </Button>
              )}
            </Flex>
          </DrawerHeader>

          <DrawerBody p={0}>
            {error && renderError()}
            {isLoading && !error && (
              <Flex justify="center" align="center" h="100px">
                <Spinner color="purple.400" />
              </Flex>
            )}
            {!isLoading && !error && (
              <VStack
                spacing={0}
                divider={<Divider borderColor="whiteAlpha.50" />}
              >
                {notificationData.length > 0
                  ? notificationData.map((update, index) =>
                      renderNotification(update, index),
                    )
                  : renderEmptyState()}
              </VStack>
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      <Modal
        isOpen={isDeleteModalOpen || removeAllModalOpen}
        onClose={() => {
          isDeleteModalOpen
            ? setIsDeleteModalOpen(false)
            : setRemoveAllModalOpen(false)
        }}
      >
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent
          bg="linear-gradient(180deg, #1E1533 0%, #0A0813 100%)"
          border="1px solid"
          borderColor="whiteAlpha.100"
          // boxShadow="dark-lg"
          color="white"
          p={4}
        >
          <ModalHeader>
            {isDeleteModalOpen ? (
              <Text fontWeight="bold">{t('confirmRemove')}</Text>
            ) : (
              <Text fontWeight="bold">{t('confirmRemoveAll')}</Text>
            )}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {isDeleteModalOpen
              ? t('deleteConfirmation')
              : t('removeAllConfirmation')}
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="red"
              mr={3}
              variant="solid"
              onClick={isDeleteModalOpen ? trashUpdate : removeAllNotifications}
              isLoading={isLoading}
            >
              {t('confirmDelete')}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                playClick()
                isDeleteModalOpen
                  ? setIsDeleteModalOpen(false)
                  : setRemoveAllModalOpen(false)
              }}
              isDisabled={isLoading}
            >
              {t('cancel')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default NotificationDrawer
