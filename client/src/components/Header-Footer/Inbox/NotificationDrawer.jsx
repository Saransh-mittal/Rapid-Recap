import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import {
  Box,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerCloseButton,
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
} from '@chakra-ui/react'
import { DeleteIcon, BellIcon, TimeIcon } from '@chakra-ui/icons'
import axios from 'axios'
import { useDispatch, useSelector } from 'react-redux'
import { setUpdates } from '../../../redux/appSlice'
import { useTranslation } from 'react-i18next'
import useSafeSound from '../../../customHooks/useSafeSound'
import { useFeatureDetection } from '../../../utils/featureDetection'

//SSR image optimization
const Rapid_recap = '/images/rrlogo.webp'

// Notification item optimization with memo
const NotificationItem = React.memo(
  ({
    update,
    onNotificationClick,
    onDeleteClick,
    isLoading,
    notificationToDelete,
    t,
  }) => {
    const handleClick = useCallback(
      e => {
        e.preventDefault()
        onNotificationClick(update)
      },
      [update, onNotificationClick],
    )

    const handleDelete = useCallback(
      e => {
        e.stopPropagation()
        e.preventDefault()
        onDeleteClick(update)
      },
      [update, onDeleteClick],
    )

    const timeString = useMemo(() => {
      return new Date(update.date).toLocaleString()
    }, [update.date])

    const truncatedText = useMemo(() => {
      const doc = new DOMParser().parseFromString(update.mainText, 'text/html')
      return (
        (doc.body.textContent?.replace(/\s+/g, ' ').trim().substring(0, 120) ||
          '') + '...'
      )
    }, [update.mainText])

    return (
      <Box
        w="full"
        p={4}
        cursor="pointer"
        transition="all 0.2s"
        _hover={{ bg: 'whiteAlpha.50' }}
        onClick={handleClick}
        role="button"
        tabIndex={0}
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
              fallback={
                <Icon as={BellIcon} boxSize="40px" color="purple.400" />
              }
              loading="lazy"
            />
          </Box>

          <Box flex={1}>
            <Flex justify="space-between" align="center" mb={2}>
              <Heading
                size="sm"
                color={update.read ? 'whiteAlpha.700' : 'white'}
              >
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
              mb={2}
              sx={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {truncatedText}
            </Text>

            <Flex justify="space-between" align="center">
              <Flex align="center" gap={2} color="whiteAlpha.600">
                <TimeIcon w={3} h={3} />
                <Text fontSize="xs">{timeString}</Text>
              </Flex>

              <Button
                size="sm"
                variant="ghost"
                colorScheme="red"
                onClick={handleDelete}
                isLoading={
                  isLoading && notificationToDelete?._id === update._id
                }
                loadingText=""
                aria-label={t('delete')}
              >
                <DeleteIcon />
              </Button>
            </Flex>
          </Box>
        </Flex>
      </Box>
    )
  },
)

// Confirmation modal component
const ConfirmationModal = React.memo(
  ({ isOpen, onClose, onConfirm, title, message, isLoading, t }) => (
    <Modal isOpen={isOpen} onClose={onClose} motionPreset="slideInBottom">
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent
        bg="linear-gradient(180deg, #1E1533 0%, #0A0813 100%)"
        border="1px solid"
        borderColor="whiteAlpha.100"
        color="white"
        p={4}
      >
        <ModalHeader>{title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>{message}</ModalBody>
        <ModalFooter>
          <Button
            colorScheme="red"
            mr={3}
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {t('confirmDelete')}
          </Button>
          <Button variant="outline" onClick={onClose}>
            {t('cancel')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  ),
)

// Main drawer component
const NotificationDrawer = ({
  setIsDrawerOpen,
  setIsModalOpen,
  setSelectedNotification,
  setIsHamburgerOpen,
}) => {
  const { t } = useTranslation('NotificationDrawer')
  const features = useFeatureDetection()
  const { playClick } = useSafeSound({
    enabled: features.hasAudioSupport,
    volume: 0.5,
  })
  const dispatch = useDispatch()
  const toast = useToast()
  const isScreenSmallerThan48em = useMediaQuery('(max-width: 48em)')[0]

  // State management
  const [modalState, setModalState] = useState({
    isDeleteModalOpen: false,
    removeAllModalOpen: false,
    notificationToDelete: null,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [drawerMounted, setDrawerMounted] = useState(false)
  const notificationListRef = useRef(null)

  // Optimized selector
  const updates = useSelector(state => state.app.updates)

  // API call handler
  const apiCall = useCallback(async (endpoint, method = 'put', data = null) => {
    try {
      setIsLoading(true)
      const response = await axios[method](endpoint, data)
      return response.data
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Error handler
  const handleError = useCallback(
    (error, customMessage) => {
      console.error('Operation failed:', error)
      toast({
        title: t('error'),
        description: customMessage || error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
      })
    },
    [toast, t],
  )

  // Notification handlers
  const handleNotificationClick = useCallback(
    notification => {
      playClick()
      setSelectedNotification(notification)
      setIsModalOpen(true)
      setIsDrawerOpen(false)
    },
    [setSelectedNotification, setIsModalOpen, setIsDrawerOpen, playClick],
  )

  const handleDeleteClick = useCallback(
    notification => {
      playClick()
      setModalState(prev => ({
        ...prev,
        isDeleteModalOpen: true,
        notificationToDelete: notification,
      }))
    },
    [playClick],
  )

  const handleRemoveAllClick = useCallback(() => {
    playClick()
    setModalState(prev => ({ ...prev, removeAllModalOpen: true }))
  }, [playClick])

  // API operations
  const setReadUpdate = useCallback(
    async updateId => {
      try {
        await apiCall(`/api/user/readUpdates?updateId=${updateId}`)
        dispatch(
          setUpdates(
            updates.map(update =>
              update._id === updateId ? { ...update, read: true } : update,
            ),
          ),
        )
      } catch (error) {
        handleError(error, t('markAsReadError'))
      }
    },
    [updates, dispatch, apiCall, handleError, t],
  )

  const trashUpdate = useCallback(async () => {
    if (!modalState.notificationToDelete?._id) return

    try {
      await apiCall(
        `/api/user/trashUpdates/${modalState.notificationToDelete._id}`,
      )
      dispatch(
        setUpdates(
          updates.filter(
            update => update._id !== modalState.notificationToDelete._id,
          ),
        ),
      )

      toast({
        title: t('success'),
        description: t('deleteSuccess'),
        status: 'success',
        duration: 2000,
        isClosable: true,
        position: 'top',
      })
    } catch (error) {
      handleError(error, t('deleteError'))
    } finally {
      setModalState(prev => ({ ...prev, isDeleteModalOpen: false }))
    }
  }, [
    modalState.notificationToDelete,
    updates,
    dispatch,
    apiCall,
    toast,
    handleError,
    t,
  ])

  const removeAllNotifications = useCallback(async () => {
    try {
      await apiCall('/api/user/trashAllUpdates')
      dispatch(setUpdates([]))

      toast({
        title: t('success'),
        description: t('removeAllSuccess'),
        status: 'success',
        duration: 2000,
        isClosable: true,
        position: 'top',
      })
    } catch (error) {
      handleError(error, t('removeAllError'))
    } finally {
      setModalState(prev => ({ ...prev, removeAllModalOpen: false }))
    }
  }, [dispatch, apiCall, toast, handleError, t])

  // Mount animation
  useEffect(() => {
    setDrawerMounted(true)
    return () => setDrawerMounted(false)
  }, [])

  // Handle drawer close
  const handleDrawerClose = useCallback(() => {
    if (isScreenSmallerThan48em) {
      setIsHamburgerOpen(true)
    }
    setIsDrawerOpen(false)
  }, [isScreenSmallerThan48em, setIsHamburgerOpen, setIsDrawerOpen])

  return (
    <>
      <Drawer
        isOpen={true}
        placement="right"
        onClose={handleDrawerClose}
        size={{ base: 'full', lg: 'md' }}
      >
        <DrawerOverlay backdropFilter="blur(4px)" />
        <DrawerContent
          bg="linear-gradient(180deg, #1E1533 0%, #0A0813 100%)"
          borderLeft="1px solid"
          borderColor="whiteAlpha.100"
          transform={drawerMounted ? 'translateX(0)' : 'translateX(100%)'}
          transition="transform 0.3s ease-in-out"
        >
          <DrawerCloseButton
            color="whiteAlpha.700"
            _hover={{ color: 'white' }}
            size="lg"
          />

          <DrawerHeader borderBottomWidth="1px" borderColor="whiteAlpha.100">
            <Flex alignItems="center" mb={4} gap={3}>
              <Icon as={BellIcon} w={6} h={6} color="purple.400" />
              <Heading
                size="lg"
                bgGradient="linear(to-r, purple.400, pink.400)"
                bgClip="text"
              >
                {t('inbox')}
              </Heading>
              {updates.length > 0 && (
                <Button
                  leftIcon={<DeleteIcon />}
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveAllClick}
                  isLoading={isLoading}
                  borderColor="whiteAlpha.200"
                  color="whiteAlpha.900"
                  _hover={{
                    bg: 'whiteAlpha.50',
                    borderColor: 'red.400',
                    color: 'red.400',
                  }}
                >
                  {t('removeAllNotifications')}
                </Button>
              )}
            </Flex>
          </DrawerHeader>

          <DrawerBody p={0} ref={notificationListRef}>
            {isLoading && !updates.length && (
              <Flex justify="center" align="center" h="100px">
                <Spinner color="purple.400" />
              </Flex>
            )}

            {!isLoading && !updates.length ? (
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
            ) : (
              <VStack
                spacing={0}
                divider={<Divider borderColor="whiteAlpha.50" />}
              >
                {updates.map(update => (
                  <NotificationItem
                    key={update._id}
                    update={update}
                    onNotificationClick={notification => {
                      setReadUpdate(notification._id)
                      handleNotificationClick(notification)
                    }}
                    onDeleteClick={handleDeleteClick}
                    isLoading={isLoading}
                    notificationToDelete={modalState.notificationToDelete}
                    t={t}
                  />
                ))}
              </VStack>
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      <ConfirmationModal
        isOpen={modalState.isDeleteModalOpen}
        onClose={() =>
          setModalState(prev => ({ ...prev, isDeleteModalOpen: false }))
        }
        onConfirm={trashUpdate}
        title={t('confirmRemove')}
        message={t('deleteConfirmation')}
        isLoading={isLoading}
        t={t}
      />

      <ConfirmationModal
        isOpen={modalState.removeAllModalOpen}
        onClose={() =>
          setModalState(prev => ({ ...prev, removeAllModalOpen: false }))
        }
        onConfirm={removeAllNotifications}
        title={t('confirmRemoveAll')}
        message={t('removeAllConfirmation')}
        isLoading={isLoading}
        t={t}
      />
    </>
  )
}

export default React.memo(NotificationDrawer)
