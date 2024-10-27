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
import { useTranslation } from 'react-i18next'
import { ChatState } from '../../../contextAPI/ChatProvider'

import { CopyIcon } from '@chakra-ui/icons'
import { useFeatureDetection } from '../../../utils/featureDetection'
import useSafeSound from '../../../customHooks/useSafeSound'

const socialPlatforms = [
  { name: 'whatsapp', logo: '/images/whatsapp-logo.png', color: '#25D366' },
  { name: 'twitter', logo: '/images/twitter-logo.png', color: '#1DA1F2' },
  { name: 'facebook', logo: '/images/facebook-logo.png', color: '#1877F2' },
  { name: 'linkedin', logo: '/images/linkedin-logo.png', color: '#0A66C2' },
]

const ShareChatModal = ({ isOpen, onClose, articleToShare, notLoggedIn }) => {
  const { t } = useTranslation('ShareChatModal')
  const [chats, setChats] = useState([])
  const [selectedChats, setSelectedChats] = useState([])
  const [loading, setLoading] = useState(true)
  // const { user, socket, socketConnected } = ChatState()
  const chatState = ChatState()
  const user = chatState ? chatState.user : null
  const socket = chatState ? chatState.socket : null

  const toast = useToast()
  const features = useFeatureDetection()
  const { playClick } = useSafeSound({
    enabled: features.hasAudioSupport,
    volume: 0.5,
  })

  useEffect(() => {
    if (isOpen) {
      const cachedChats = localStorage.getItem(`cachedChats_${user._id}`)
      if (cachedChats) {
        setChats(JSON.parse(cachedChats))
        setLoading(false)
      }
      fetchChats()
    }
  }, [notLoggedIn, articleToShare, isOpen, user?._id])

  const fetchChats = async () => {
    if (notLoggedIn || notLoggedIn === undefined) return
    try {
      const { data } = await axios.get('/api/chat')
      setChats(data)
      setLoading(false)
      localStorage.setItem(`cachedChats_${user._id}`, JSON.stringify(data))
    } catch (error) {
      toast({
        title: t('errorOccurred'),
        description: t('failedToLoadChats'),
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
    const articleUrl = `https://www.rapidrecap.co.in/article/${articleToShare._id}`
    const text = encodeURIComponent(
      `${t('checkOutArticle')}: ${articleToShare.title}`,
    )

    switch (platform) {
      case 'whatsapp':
        url = `https://api.whatsapp.com/send?text=${text} ${articleUrl}`
        break
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
      title: t('linkCopied'),
      description: t('articleUrlCopied'),
      status: 'success',
      duration: 3000,
      isClosable: true,
    })
  }

  const handleShare = async () => {
    if (selectedChats.length === 0) {
      toast({
        title: t('noChatsSelected'),
        description: t('selectAtLeastOneChat'),
        status: 'warning',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    try {
      onClose()
      const { data } = await axios.post('/api/chat/share', {
        articleId: articleToShare._id,
        chatIds: selectedChats,
        type: 'article_card',
      })

      data.forEach(message => {
        socket.emit('new message', message)
      })
    } catch (error) {
      toast({
        title: t('errorOccurred'),
        description: t('failedToShareArticle'),
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      })
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={{ base: 'full', md: 'sm' }}>
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
          {t('shareToChat')}
        </ModalHeader>
        <ModalCloseButton color="white" />
        <ModalBody
          overflowY="auto"
          w={'100%'}
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
            <VStack spacing={2} align="stretch" h={'sm'}>
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
        <ModalFooter>
          <Button
            colorScheme="green"
            mr={3}
            onClick={() => {
              playClick()
              handleShare()
            }}
            isDisabled={selectedChats.length === 0}
          >
            {t('send')}
          </Button>
          <Button
            variant="solid"
            colorScheme="red"
            onClick={() => {
              playClick()
              onClose()
            }}
          >
            {t('cancel')}
          </Button>
        </ModalFooter>
        <Box p={4} w={'75%'} borderTop="1px solid #3a3454">
          <Text mb={2} textAlign={'center'}>
            {t('shareOnSocialMedia')}
          </Text>
          <Flex justifyContent="space-around">
            {socialPlatforms.map(platform => (
              <Button
                key={platform.name}
                onClick={() => handleSocialShare(platform.name)}
                aria-label={t(`shareOn${platform.name}`)}
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
              {t('copyArticleUrl')}
            </Button>
          </Flex>
        </Box>
      </ModalContent>
    </Modal>
  )
}

export default ShareChatModal
