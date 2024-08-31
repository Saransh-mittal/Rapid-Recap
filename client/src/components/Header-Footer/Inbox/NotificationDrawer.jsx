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
} from '@chakra-ui/react'
import React, { useEffect, useState, useMemo, useCallback } from 'react'

import Rapid_recap from '/images/rrlogo.webp'
import { DeleteIcon } from '@chakra-ui/icons'
import axios from 'axios'
import parse from 'html-react-parser'
import useSound from '../../../customHooks/useSound'
import { useDispatch, useSelector } from 'react-redux'
import { setUpdates } from '../../../redux/appSlice'
import { useTranslation } from 'react-i18next'

const NotificationDrawer = ({
  setIsDrawerOpen,
  setIsModalOpen,
  setSelectedNotification,
  setIsHamburgerOpen,
}) => {
  const { t } = useTranslation('NotificationDrawer')
  const { playClick } = useSound()
  const dispatch = useDispatch()
  const { updates } = useSelector(state => state.app)
  const toast = useToast()
  const isScreenSmallerThan48em = useMediaQuery('(max-width: 48em)')[0]

  const notificationData = useMemo(() => updates, [updates]) // Memoize notifications data

  const { isOpen, onOpen, onClose } = useDisclosure()
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [notificationToDelete, setNotificationToDelete] = useState(null)
  const [removeAllModalOpen, setRemoveAllModalOpen] = useState(false)

  const handleNotificationClick = useCallback(
    notification => {
      setSelectedNotification(notification)
      setIsModalOpen(true)
      setIsDrawerOpen(false)
    },
    [setSelectedNotification, setIsModalOpen, setIsDrawerOpen],
  )

  const setReadUpdate = useCallback(
    async updateId => {
      try {
        await axios.put(`/api/user/readUpdates?updateId=${updateId}`)
        const updatedNotifications = notificationData.map(update =>
          update._id === updateId ? { ...update, read: true } : update,
        )
        dispatch(setUpdates(updatedNotifications))
      } catch (error) {
        toast({
          title: t('error'),
          description: t('markAsReadError'),
          status: 'error',
          duration: 3000,
          isClosable: true,
          position: 'top',
        })
        console.log(error)
      }
    },
    [notificationData, dispatch, toast],
  )

  const handleDeleteClick = useCallback(
    notification => {
      playClick()
      setNotificationToDelete(notification)
      setIsDeleteModalOpen(true)
    },
    [playClick],
  )

  const handleRemoveAllClick = useCallback(() => {
    playClick()
    setRemoveAllModalOpen(true)
  }, [playClick])

  const trashUpdate = useCallback(async () => {
    playClick()
    try {
      await axios.put(`/api/user/trashUpdates/${notificationToDelete._id}`)
      const updatedNotificationData = notificationData.filter(
        update => update._id !== notificationToDelete._id,
      )
      dispatch(setUpdates(updatedNotificationData))
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete update',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
      })
      console.log(error)
    } finally {
      setIsDeleteModalOpen(false)
    }
  }, [notificationToDelete, notificationData, dispatch, playClick, toast])

  const removeAllNotifications = useCallback(async () => {
    playClick()
    try {
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
        toast({
          title: t('error'),
          description: t('removeAllError'),
          status: 'error',
          duration: 3000,
          isClosable: true,
          position: 'top',
        })
      }
    } catch (error) {
      toast({
        title: t('error'),
        description: t('removeAllError'),
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
      })
      console.log(error)
    } finally {
      setRemoveAllModalOpen(false)
    }
  }, [playClick, dispatch, toast])

  useEffect(() => {
    onOpen()
  }, [onOpen])

  return (
    <>
      <Drawer
        size={{ base: 'full', lg: 'xs' }}
        isOpen={isOpen}
        placement="right"
        onClose={() => {
          isScreenSmallerThan48em && setIsHamburgerOpen(true)
          setIsDrawerOpen(false)
          onClose()
        }}
        backgroundImage="linear-gradient(-180deg, #1a1527, #0e0c16 88%, #0e0c16 99%)"
        boxShadow="0px 4px 8px rgba(0, 0, 0, 0.3), 0px 8px 16px rgba(0, 0, 0, 0.3), 0px 12px 24px rgba(0, 0, 0, 0.3)"
      >
        <DrawerOverlay />
        <DrawerContent
          backgroundImage="linear-gradient(-180deg, #1a1527, #0e0c16 88%, #0e0c16 99%)"
          boxShadow="0px 4px 8px rgba(0, 0, 0, 0.3), 0px 8px 16px rgba(0, 0, 0, 0.3), 0px 12px 24px rgba(0, 0, 0, 0.3)"
          color="white"
          className="inbox-drawer"
        >
          <DrawerCloseButton />
          <DrawerHeader size="10px">
            <span>{t('inbox')}</span>
          </DrawerHeader>
          <DrawerHeader size="10px">
            {notificationData.length > 0 && (
              <Button
                color="white"
                border={'2px solid white'}
                background={'transparent'}
                _hover={{ color: 'red', borderColor: 'red' }}
                onClick={handleRemoveAllClick}
              >
                {t('removeAllNotifications')}
              </Button>
            )}
          </DrawerHeader>
          <DrawerBody
            style={{
              overflowY: 'auto',
              scrollbarWidth: 'thin',
              scrollbarColor: 'black transparent',
            }}
          >
            {notificationData.length > 0 &&
              notificationData.map((update, index) => {
                return (
                  <Box
                    color={update.read ? '#9CAFAA' : null}
                    key={index}
                    style={{
                      marginBottom: '1rem',
                      cursor: 'pointer',
                      backgroundColor: '#0f0d15',
                      backgroundImage:
                        'linear-gradient(-180deg, #1a1527, #0e0c16 88%, #0e0c16 99%)',
                      boxShadow:
                        '0px 4px 8px rgba(0, 0, 0, 0.9), 0px 8px 16px rgba(0, 0, 0, 0.9), 0px 12px 24px rgba(0, 0, 0, 0.9)',
                    }}
                    onClick={() => {
                      setReadUpdate(update._id)
                      handleNotificationClick(update)
                    }}
                    paddingBottom={'20px'}
                    padding={'10px'}
                  >
                    <Flex
                      flexDirection={'row'}
                      justifyContent={'space-between'}
                      gap={3}
                    >
                      <Flex
                        w={'30%'}
                        justifyContent={'center'}
                        alignItems={'center'}
                        height="50px"
                        p={0}
                        m={0}
                      >
                        <Image
                          src={Rapid_recap}
                          alt={t('notificationImage')}
                          width="40px "
                          height="40px"
                          borderRadius="50%"
                          objectFit="cover"
                          objectPosition="center center"
                        />
                      </Flex>
                      <Flex justifyContent={'center'} alignItems={'center'}>
                        <Heading
                          as={'h5'}
                          size={'sm'}
                          style={{ marginBottom: '0.5rem', textAlign: 'left' }}
                        >
                          {update.title}
                        </Heading>
                      </Flex>
                    </Flex>

                    <Text style={{ textAlign: 'left' }}>
                      {parse(update.mainText.substring(0, 60))}.....
                    </Text>
                    <Flex>
                      <small>{new Date(update.date).toLocaleString()}</small>
                      <small style={{ marginLeft: 'auto' }}>
                        {update.read ? 'Read' : 'Unread'}
                      </small>
                    </Flex>
                    <Flex
                      width={'100%'}
                      justifyContent={'center'}
                      alignItems={'center'}
                      marginTop={'10px'}
                    >
                      <small>
                        <Button
                          p={0}
                          background={'transparent'}
                          color={'white'}
                          _hover={{ background: 'transparent', color: 'red' }}
                          onClick={e => {
                            e.stopPropagation()
                            handleDeleteClick(update)
                          }}
                        >
                          <DeleteIcon />
                        </Button>
                      </small>
                    </Flex>
                  </Box>
                )
              })}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
      <Modal
        isOpen={isDeleteModalOpen || removeAllModalOpen}
        onClose={() =>
          isDeleteModalOpen
            ? setIsDeleteModalOpen(false)
            : setRemoveAllModalOpen(false)
        }
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
          p={'3'}
        >
          <ModalHeader>
            {isDeleteModalOpen ? (
              <b>{t('confirmRemove')}</b>
            ) : (
              <b>{t('confirmRemoveAll')}</b>
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
              onClick={isDeleteModalOpen ? trashUpdate : removeAllNotifications}
            >
              {t('confirmDelete')}
            </Button>
            <Button
              onClick={() => {
                playClick()
                isDeleteModalOpen
                  ? setIsDeleteModalOpen(false)
                  : setRemoveAllModalOpen(false)
              }}
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
