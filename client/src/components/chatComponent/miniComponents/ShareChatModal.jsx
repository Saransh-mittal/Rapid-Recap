import React, { useState, useEffect, useContext } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  Text,
  Box,
  Checkbox,
  useToast,
  Flex,
} from '@chakra-ui/react'
import axios from 'axios'
import { ChatState } from '../../../contextAPI/ChatProvider'
import useSound from '../../../customHooks/useSound'
import { AppContext } from '../../../contextAPI/appContext'

const ShareChatModal = ({ isOpen, onClose, articleToShare, notLoggedIn }) => {
  const [chats, setChats] = useState([])
  const [selectedChats, setSelectedChats] = useState([])
  const [loading, setLoading] = useState(true)
  const { user, socket, socketConnected } = ChatState()
  const toast = useToast()
  const { playClick } = useContext(AppContext)

  useEffect(() => {
    fetchChats()
  }, [])

  const fetchChats = async () => {
    if (notLoggedIn) return
    try {
      const { data } = await axios.get('/api/chat')
      setChats(data)
      setLoading(false)
    } catch (error) {
      toast({
        title: 'Error Occurred!',
        description: 'Failed to Load the chats',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      })
      setLoading(false)
    }
  }

  const handleChatToggle = chatId => {
    setSelectedChats(prevSelected =>
      prevSelected.includes(chatId)
        ? prevSelected.filter(id => id !== chatId)
        : [...prevSelected, chatId],
    )
  }

  const handleShare = async () => {
    if (selectedChats.length === 0) {
      toast({
        title: 'No chats selected',
        description: 'Please select at least one chat to share the article.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    try {
      // Here you would make an API call to share the article
      const { data } = await axios.post('/api/chat/share', {
        articleId: articleToShare._id,
        chatIds: selectedChats,
        type: 'article_card',
      })

      data.forEach(message => {
        socket.emit('new message', message)
      })
      // if (socketConnected && socket) {
      //   socket?.emit("new message", data);
      // }
      toast({
        title: 'Article Shared',
        description: `Article shared to ${selectedChats.length} chat(s) successfully!`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      })

      onClose()
    } catch (error) {
      toast({
        title: 'Error Occurred!',
        description: 'Failed to share the article',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      })
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent
        bg="#1e1a2e"
        color="white"
        borderRadius="10px"
        boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
      >
        <ModalHeader
          bg="#2a2440"
          borderTopLeftRadius="10px"
          borderTopRightRadius="10px"
          w={'100%'}
        >
          Share to Chat
        </ModalHeader>
        <ModalCloseButton color="white" />
        <ModalBody maxH="60vh" overflowY="auto" w={'100%'}>
          {loading ? (
            <Text>Loading chats...</Text>
          ) : (
            <VStack spacing={2} align="stretch">
              {chats.map(chat => (
                <Flex
                  key={chat._id}
                  p={3}
                  borderWidth={1}
                  borderColor="#3a3454"
                  borderRadius="md"
                  alignItems="center"
                  transition="background-color 0.3s ease"
                  _hover={{ bg: '#2a2440' }}
                  cursor="pointer"
                  onClick={() => {
                    playClick()
                    handleChatToggle(chat._id)
                  }}
                >
                  <Checkbox
                    isChecked={selectedChats.includes(chat._id)}
                    mr={3}
                    colorScheme="green"
                    pointerEvents="none"
                  />
                  <Text fontWeight="bold">
                    {chat.isGroupChat
                      ? chat.chatName
                      : chat.users.find(u => u?._id !== user?._id)?.name}
                  </Text>
                </Flex>
              ))}
            </VStack>
          )}
        </ModalBody>
        <ModalFooter borderTop="1px solid #3a3454">
          <Button
            colorScheme="green"
            mr={3}
            onClick={() => {
              playClick()
              handleShare()
            }}
            isDisabled={selectedChats.length === 0}
          >
            Send
          </Button>
          <Button
            variant="solid"
            colorScheme="red"
            onClick={() => {
              playClick()
              onClose()
            }}
          >
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default ShareChatModal
