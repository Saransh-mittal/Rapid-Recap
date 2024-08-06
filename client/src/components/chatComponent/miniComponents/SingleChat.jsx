// File: SingleChat.js
import React, { useState, useRef, useEffect } from 'react'
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
import MessageInput from './singleChatsComponents/MessageInput'
import MessageList from './singleChatsComponents/MessageList'
import DeleteMessageModal from './singleChatsComponents/DeleteMessageModal'
import BookmarksModal from './singleChatsComponents/BookmarksModal'
import axios from 'axios'
import { getSender } from '../config/ChatLogics'
import useMessageHandlers from '../../../customHooks/useMessageHandlers'
import useSocketHandlers from '../../../customHooks/useSocketHandlers'
import MessageStatus from './singleChatsComponents/MessageStatus'
import rrlogoOutlined from '/images/rrlogo_badge.png'

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

  const typingHandler = e => {
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
    var timerLength = 3000
    setTimeout(() => {
      var timeNow = new Date().getTime()
      var timeDiff = timeNow - lastTypingTime
      if (timeDiff >= timerLength && typing) {
        socket?.emit('stop typing', selectedChat._id)
        setTyping(false)
      }
    }, timerLength)
  }

  const onEmojiClick = emojiObject => {
    setNewMessage(prevMessage => prevMessage + emojiObject.emoji)
  }

  const handleClickOutside = event => {
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
  }

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleClose = () => {
    const params = new URLSearchParams(location.search)
    const chatId = params.get('chatId')
    if (chatId) {
      navigate(`/chats`)
    }
    setHasMore(true)
    setMessagesFetched(false)
    setMessages([])
    socket?.emit('close chat', {
      userId: user?._id,
      chatId: selectedChat?._id,
    })
    setSelectedChat(null)
  }

  const handleAccept = async () => {
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
  }

  const handleReject = async () => {
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
  }

  useEffect(() => {
    if (selectedChat && selectedChat.status === 'rejected') {
      setFetchAgain(!fetchAgain)
      handleClose()
    }
  }, [selectedChat?.status])

  useEffect(() => {
    const shouldFetchMessages = () => {
      if (!selectedChat) return false
      if (messages.length === 0 && !messagesFetched) return true
      if (messages.length > 0) {
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
      // console.log("fetching messages");
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
  }, [selectedChat])

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
            // style={{
            //   backgroundImage:
            //     'linear-gradient(-180deg, rgba(26, 21, 39, 0.6), rgba(14, 12, 22, 0.6) 88%, rgba(14, 12, 22, 0.6) 99%)',
            //   boxShadow:
            //     '0px 4px 8px rgba(0, 0, 0, 0.3), 0px 8px 16px rgba(0, 0, 0, 0.3), 0px 12px 24px rgba(0, 0, 0, 0.3)',
            // }}
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
                {selectedChat.status === 'pending' &&
                  selectedChat.chatCreatedBy !== user._id && (
                    <MessageRequestComponent
                      senderName={getSender(user, selectedChat.users)}
                      onAccept={handleAccept}
                      onReject={handleReject}
                      // onBlock={handleBlock}
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
              </>
            )}
            {(selectedChat.status === 'accepted' ||
              selectedChat.chatCreatedBy === user._id) && (
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
            <Text
              fontSize="lg"
              // textTransform="uppercase"
              letterSpacing="1px"
              mb={0}
            >
              Get Started by Selecting a Chat or searching user....
            </Text>
          </Box>
        </Flex>
      )}
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
    </>
  )
}

export default SingleChat
