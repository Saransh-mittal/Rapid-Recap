import React, { useState, useEffect } from 'react'
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
  Divider,
  Image,
  Spinner,
} from '@chakra-ui/react'
import axios from 'axios'
import { ChatState } from '../../../contextAPI/ChatProvider'
import useSound from '../../../customHooks/useSound'
import { CopyIcon } from '@chakra-ui/icons'
const socialPlatforms = [
  { name: 'whatsapp', logo: '/images/whatsapp-logo.png', color: '#25D366' },
  // { name: 'instagram', logo: '/images/instagram-logo.png', color: '#E4405F' },
  { name: 'twitter', logo: '/images/twitter-logo.png', color: '#1DA1F2' },
  { name: 'facebook', logo: '/images/facebook-logo.png', color: '#1877F2' },
  { name: 'linkedin', logo: '/images/linkedin-logo.png', color: '#0A66C2' },
]

const ShareChatModal = ({ isOpen, onClose, articleToShare, notLoggedIn }) => {
  const [chats, setChats] = useState([])
  const [selectedChats, setSelectedChats] = useState([])
  const [loading, setLoading] = useState(true)
  const { user, socket, socketConnected } = ChatState()
  const toast = useToast()
  const { playClick } = useSound()

  useEffect(() => {
    if (isOpen) fetchChats()
  }, [notLoggedIn, articleToShare, isOpen])

  const fetchChats = async () => {
    if (notLoggedIn || notLoggedIn === undefined) return
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

  const handleSocialShare = platform => {
    playClick()
    let url = ''
    const articleUrl = `https://www.rapidrecap.co.in/article/${articleToShare._id}` // Replace with your actual article URL
    const text = encodeURIComponent(
      `Check out this article: ${articleToShare.title}`,
    )

    switch (platform) {
      case 'whatsapp':
        url = `https://api.whatsapp.com/send?text=${text} ${articleUrl}`
        break
      // case 'instagram':
      //   url = `https://www.instagram.com/sharer.php?u=${articleUrl}`
      //   break
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${text}&url=${articleUrl}`
        break
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${articleUrl}`
        break
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${articleUrl}`
        break
      default:
        return
    }

    window.open(url, '_blank')
  }

  const handleChatToggle = chatId => {
    setSelectedChats(prevSelected =>
      prevSelected.includes(chatId)
        ? prevSelected.filter(id => id !== chatId)
        : [...prevSelected, chatId],
    )
  }

  const handleCopyArticleUrl = () => {
    playClick()
    const articleUrl = `https://www.rapidrecap.co.in/article/${articleToShare._id}`
    navigator.clipboard.writeText(articleUrl)
    toast({
      title: 'Link Copied',
      description: 'Article URL copied to clipboard',
      status: 'success',
      duration: 3000,
      isClosable: true,
    })
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
        <ModalBody
          maxH="60vh"
          overflowY="auto"
          w={'100%'}
          // hide scrollbar
          sx={{
            '&::-webkit-scrollbar': {
              display: 'none',
            },
            scrollbarWidth: 'none',
          }}
        >
          {loading ? (
            <Flex
              w={'100%'}
              h={'300px'}
              justifyContent={'center'}
              alignItems={'center'}
            >
              <Spinner />
            </Flex>
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
                  <Flex flexDirection={'column'}>
                    <Text fontWeight="bold" mb={'2px'}>
                      {chat.isGroupChat
                        ? chat.chatName
                        : chat.users.find(u => u?._id !== user?._id)?.name}
                    </Text>
                    {!chat.isGroupChat && (
                      <Text fontSize="xs" color={'gray.300'} mb={0}>
                        @
                        {chat.users.find(u => u?._id !== user?._id)?.inGameName}
                      </Text>
                    )}
                  </Flex>
                </Flex>
              ))}
            </VStack>
          )}
        </ModalBody>
        <Divider my={2} />
        <Box p={4} w={'75%'}>
          <Text mb={2}>Share on social media:</Text>
          <Flex justifyContent="space-around">
            {socialPlatforms.map(platform => (
              <Button
                key={platform.name}
                onClick={() => handleSocialShare(platform.name)}
                aria-label={`Share on ${platform.name}`}
                bg="transparent"
                _hover={{ bg: platform.color, opacity: 0.8 }}
                p={2}
              >
                <Image src={platform.logo} alt={platform.name} boxSize="32px" />
              </Button>
            ))}
          </Flex>
          <Flex justifyContent="center" mt={4}>
            <Button
              onClick={handleCopyArticleUrl}
              colorScheme="blue"
              leftIcon={<CopyIcon />}
            >
              Copy Article URL
            </Button>
          </Flex>
        </Box>
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
