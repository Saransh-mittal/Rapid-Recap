// File: SingleChat.js
import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
  Suspense,
} from 'react'
import {
  Box,
  Flex,
  Image,
  Spinner,
  Text,
  useDisclosure,
  useToast,
} from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { ChatState } from '../../../contextAPI/ChatProvider'
import ChatHeader from './singleChatsComponents/ChatHeader'
import MessageStatus from './singleChatsComponents/MessageStatus'
import rrlogoOutlined from '/images/rrlogo_badge.png'

// Lazy load components
const MessageInput = React.lazy(() =>
  import('./singleChatsComponents/MessageInput'),
)
const MessageList = React.lazy(() =>
  import('./singleChatsComponents/MessageList'),
)
const DeleteMessageModal = React.lazy(() =>
  import('./singleChatsComponents/DeleteMessageModal'),
)
const BookmarksModal = React.lazy(() =>
  import('./singleChatsComponents/BookmarksModal'),
)
const MessageRequestComponent = React.lazy(() =>
  import('./singleChatsComponents/MessageRequestComponent'),
)
import axios from 'axios'
import { getSender } from '../config/ChatLogics'
import useMessageHandlers from '../../../customHooks/useMessageHandlers'
import useSocketHandlers from '../../../customHooks/useSocketHandlers'

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const navigate = useNavigate()
  const toast = useToast()
  const selectedChatCompare = useRef(null)
  const {
    selectedChat,
    setSelectedChat,
    user,
    notification,
    setNotification,
    updateLatestMessage,
    socket,
    socketConnected,
    messagesFetched,
    setMessagesFetched,
    hasMore,
    setHasMore,
  } = ChatState()

  const {
    messages,
    loading,
    newMessage,
    isLoadingBookmarks,
    bookmarks,
    deleteInfo,
    setNewMessage,
    setDeleteInfo,
    fetchMessages,
    loadMoreMessages,
    updateMessageReadBy,
    sendMessage,
    handleDeleteMessage,
    permanentDeleteMessage,
    deleteMessage,
    confirmDelete,
    handleAddReaction,
    handleRemoveReaction,
    fetchBookmarks,
    handleShareBookmark,
    setMessages,
    showBookmarksModal,
    setShowBookmarksModal,
  } = useMessageHandlers({
    selectedChat,
    user,
    socket,
    setMessagesFetched,
    setHasMore,
    updateLatestMessage,
    setNotification,
    onOpen,
    onClose,
  })

  const [typing, setTyping] = useState(false)
  const [istyping, setIsTyping] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showStickerPicker, setShowStickerPicker] = useState(false)
  const emojiPickerRef = useRef(null)
  const stickerPickerRef = useRef(null)

  useSocketHandlers(
    socket,
    user,
    selectedChat,
    setIsTyping,
    setFetchAgain,
    messages,
    setMessages,
    updateLatestMessage,
    setNotification,
    selectedChatCompare,
    fetchAgain,
  )

  const typingHandler = useCallback(
    e => {
      setNewMessage(e.target.value)

      if (!socketConnected) return
      if (e.target.value === '') {
        socket?.emit('stop typing', selectedChat._id)
        setTyping(false)
        return
      }
      if (!typing) {
        setTyping(true)
        socket?.emit('typing', selectedChat._id)
      }
      let lastTypingTime = new Date().getTime()
      const timerLength = 3000
      setTimeout(() => {
        const timeNow = new Date().getTime()
        const timeDiff = timeNow - lastTypingTime
        if (timeDiff >= timerLength && typing) {
          socket?.emit('stop typing', selectedChat._id)
          setTyping(false)
        }
      }, timerLength)
    },
    [socketConnected, typing, selectedChat?._id, socket, setNewMessage],
  )

  const onEmojiClick = useCallback(
    emojiObject => {
      setNewMessage(prevMessage => prevMessage + emojiObject.emoji)
    },
    [setNewMessage],
  )

  const handleClickOutside = useCallback(event => {
    if (
      emojiPickerRef.current &&
      !emojiPickerRef.current.contains(event.target)
    ) {
      setShowEmojiPicker(false)
    }
    if (
      stickerPickerRef.current &&
      !stickerPickerRef.current.contains(event.target)
    ) {
      setShowStickerPicker(false)
    }
  }, [])

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [handleClickOutside])

  const handleClose = useCallback(() => {
    const params = new URLSearchParams(location.search)
    const chatId = params.get('chatId')
    if (chatId) {
      navigate(-1)
    }
    setHasMore(true)
    setMessagesFetched(false)
    setMessages([])
    socket?.emit('close chat', {
      userId: user?._id,
      chatId: selectedChat?._id,
    })
    setSelectedChat(null)
  }, [
    navigate,
    socket,
    user?._id,
    selectedChat?._id,
    setHasMore,
    setMessagesFetched,
    setMessages,
    setSelectedChat,
  ])

  const handleAccept = useCallback(async () => {
    try {
      await axios.put('/api/chat/request/handle', {
        chatId: selectedChat._id,
        action: 'accept',
      })
      navigate(`/chats?chatId=${selectedChat._id}`)
      setSelectedChat({ ...selectedChat, status: 'accepted' })
      setFetchAgain(!fetchAgain)
      toast({
        title: 'Chat request accepted',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'bottom',
      })
    } catch (error) {
      toast({
        title: 'Error Occurred!',
        description: 'Failed to accept chat request',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom',
      })
    }
  }, [
    selectedChat?._id,
    navigate,
    setSelectedChat,
    setFetchAgain,
    fetchAgain,
    toast,
  ])

  const handleReject = useCallback(async () => {
    try {
      await axios.put('/api/chat/request/handle', {
        chatId: selectedChat._id,
        action: 'reject',
      })
      toast({
        title: 'Chat request rejected',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'bottom',
      })
      setFetchAgain(!fetchAgain)
      handleClose()
    } catch (error) {
      toast({
        title: 'Error Occurred!',
        description: 'Failed to reject chat request',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom',
      })
    }
  }, [selectedChat?._id, setFetchAgain, fetchAgain, handleClose, toast])

  useEffect(() => {
    if (selectedChat && selectedChat.status === 'rejected') {
      setFetchAgain(!fetchAgain)
      handleClose()
    }
  }, [selectedChat?.status, setFetchAgain, fetchAgain, handleClose])

  useEffect(() => {
    // console.log(selectedChat)
    // console.log(selectedChatCompare.current)
    const shouldFetchMessages = () => {
      if (!selectedChat) return false
      if (
        (!messages && !messagesFetched) ||
        selectedChatCompare?.current?._id !== selectedChat?._id
      )
        return true
      if (messages?.length > 0) {
        const firstMessage = messages[0]
        const isTemporaryMessage =
          typeof firstMessage._id === 'string' && firstMessage._id.length > 24
        if (!isTemporaryMessage && firstMessage.chat._id !== selectedChat._id) {
          return true
        }
      }
      return false
    }
    if (shouldFetchMessages()) {
      fetchMessages()
    }
    selectedChatCompare.current = selectedChat

    return () => {
      socket?.emit('close chat', {
        userId: user?._id,
        chatId: selectedChat?._id,
      })
      setMessagesFetched(false)
    }
  }, [selectedChat, messages, messagesFetched, socket, user?._id])

  return (
    <>
      {selectedChat && selectedChat._id ? (
        <>
          <ChatHeader
            messages={messages}
            selectedChat={selectedChat}
            user={user}
            navigate={navigate}
            istyping={istyping}
            handleClose={handleClose}
          />
          <Box
            display="flex"
            flexDir="column"
            justifyContent="flex-end"
            p={{ base: 1, md: 3 }}
            px={0}
            w="100%"
            h="100%"
            borderRadius="lg"
            overflowY="hidden"
          >
            {loading ? (
              <Spinner
                size="xl"
                w={20}
                h={20}
                alignSelf="center"
                margin="auto"
                color="white"
              />
            ) : (
              <>
                <Suspense fallback={<Spinner color="white" />}>
                  {selectedChat.status === 'pending' &&
                    selectedChat.chatCreatedBy !== user._id && (
                      <MessageRequestComponent
                        senderName={getSender(user, selectedChat.users)}
                        onAccept={handleAccept}
                        onReject={handleReject}
                      />
                    )}
                  <MessageList
                    messages={messages}
                    handleDeleteMessage={handleDeleteMessage}
                    MessageStatus={MessageStatus}
                    loadMoreMessages={loadMoreMessages}
                    handleAddReaction={handleAddReaction}
                    handleRemoveReaction={handleRemoveReaction}
                    hasMore={hasMore}
                    selectedChat={selectedChat}
                    setHasMore={setHasMore}
                  />
                </Suspense>
              </>
            )}
            {(selectedChat.status === 'accepted' ||
              selectedChat.chatCreatedBy === user._id) && (
              <Suspense fallback={<Spinner color="white" />}>
                <MessageInput
                  sendMessage={sendMessage}
                  newMessage={newMessage}
                  typingHandler={typingHandler}
                  showEmojiPicker={showEmojiPicker}
                  setShowEmojiPicker={setShowEmojiPicker}
                  setShowStickerPicker={setShowStickerPicker}
                  emojiPickerRef={emojiPickerRef}
                  stickerPickerRef={stickerPickerRef}
                  onEmojiClick={onEmojiClick}
                  setShowBookmarksModal={setShowBookmarksModal}
                  fetchBookmarks={fetchBookmarks}
                />
              </Suspense>
            )}
          </Box>
        </>
      ) : (
        <Flex alignItems="center" justifyContent="center" h="100%">
          <Box textAlign="center">
            <Flex justifyContent={'center'}>
              <Image
                src={rrlogoOutlined}
                alt="App Logo"
                mb={4}
                w={'10rem'}
                h={'auto'}
              />
            </Flex>
            <Flex justifyContent={'center'}>
              <Text
                fontSize="xl"
                textTransform="uppercase"
                letterSpacing="1px"
                mb={0}
                w={'75%'}
              >
                Give Feedback About the Application and Chatting Experience
                through contact us.
              </Text>
            </Flex>
            <Text fontSize="lg" letterSpacing="1px" mb={0}>
              Get Started by Selecting a Chat or searching user....
            </Text>
          </Box>
        </Flex>
      )}
      <Suspense fallback={<Spinner color="white" />}>
        <BookmarksModal
          showBookmarksModal={showBookmarksModal}
          setShowBookmarksModal={setShowBookmarksModal}
          isLoadingBookmarks={isLoadingBookmarks}
          bookmarks={bookmarks}
          handleShareBookmark={handleShareBookmark}
        />
        <DeleteMessageModal
          isOpen={isOpen}
          onClose={onClose}
          confirmDelete={confirmDelete}
        />
      </Suspense>
    </>
  )
}

export default React.memo(SingleChat)
