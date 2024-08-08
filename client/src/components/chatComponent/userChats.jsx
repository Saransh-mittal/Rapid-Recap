import {
  Box,
  Button as ChakraButton,
  Flex,
  useToast,
  Text,
  Stack,
  Avatar,
  Badge,
  useDisclosure,
  Tooltip,
  useBreakpointValue,
  Image,
  Heading,
} from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import { ChatState } from '../../contextAPI/ChatProvider'
import ChatSideDrawer from './ChatSideDrawer'
import ChatLoading from './ChatLoading'
import {
  getRecieverInGameName,
  getSender,
  getSenderFull,
  isSenderLoggedUser,
} from './config/ChatLogics'
import axios from 'axios'
import ButtonGradient from '../../assets/svg/ButtonGradient'
import Button from '../miscellaneous/ButtonComponent'
import { Search2Icon } from '@chakra-ui/icons'
import { useNavigate } from 'react-router-dom'
import useSound from '../../customHooks/useSound'
import { useSelector } from 'react-redux'

const UserChats = ({ fetchAgain }) => {
  const { playClick } = useSound()
  const { user: loggedInUser } = useSelector(state => state.auth)
  const [loggedUser, setLoggedUser] = useState()
  const [showRequestsTab, setShowRequestsTab] = useState(false)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const navigate = useNavigate()
  const buttonW = useBreakpointValue({
    base: '50px',
    md: '150px', // width for large screens (>= 62em or 992px)
  })

  const {
    selectedChat,
    setSelectedChat,
    user,
    chats,
    setChats,
    setMessagesFetched,
    setHasMore,
    setNotification,
    chatRequests,
    setChatRequests,
    socket,
  } = ChatState()

  const toast = useToast()

  const fetchChats = async () => {
    try {
      const { data } = await axios.get('/api/chat')
      setChats(data || [])
      const acceptedChats = data.filter(
        chat =>
          chat.status === 'accepted' ||
          chat.chatCreatedBy.toString() === user._id.toString(),
      )
      const pendingChatRequests = data.filter(
        chat =>
          chat.status === 'pending' &&
          chat.chatCreatedBy.toString() !== user._id.toString(),
      )

      setChats(acceptedChats || [])
      setChatRequests(pendingChatRequests || [])
      localStorage.setItem('chats', JSON.stringify(acceptedChats))
      localStorage.setItem('chatRequests', JSON.stringify(pendingChatRequests))
    } catch (error) {
      console.log(error)
      toast({
        title: 'Error Occurred!',
        description: 'Failed to Load the chats',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      })
    }
  }

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const chatId = params.get('chatId')

    if (chatId && chats) {
      const selectedChat = chats.find(chat => chat?._id === chatId)
      if (selectedChat) {
        setSelectedChat(selectedChat)
      }
    }
  }, [location, chats, setSelectedChat])

  useEffect(() => {
    setLoggedUser(loggedInUser)
    const cachedChats = JSON.parse(localStorage.getItem('chats'))
    const cachedChatRequests = JSON.parse(localStorage.getItem('chatRequests'))

    if (cachedChats && cachedChatRequests) {
      setChats(cachedChats)
      setChatRequests(cachedChatRequests)
    }

    fetchChats()
    // eslint-disable-next-line
  }, [fetchAgain])

  const getLatestMessageContent = chat => {
    if (!chat.latestMessage) return 'No messages yet'

    if (chat.latestMessage.isDeleted) {
      return 'This message was deleted'
    }

    if (
      chat?.latestMessage?.deletedFor &&
      chat?.latestMessage?.deletedFor.includes(loggedUser?._id)
    ) {
      return 'This message was deleted for you'
    }

    return chat.latestMessage.content
      ? chat.latestMessage.content.length > 50
        ? chat.latestMessage.content.substring(0, 51) + '...'
        : chat.latestMessage.content
      : chat.latestMessage.type === 'article_card'
      ? 'Shared an Article'
      : 'Score Card'
  }

  const handleChatClick = chat => {
    playClick()
    setSelectedChat(chat)
    setHasMore(true)
    setMessagesFetched(false)

    // Only update latestMessage if it exists
    if (chat.latestMessage) {
      setChats(prevChats => {
        return prevChats?.map(c => {
          if (c._id === chat._id) {
            return {
              ...c,
              latestMessage: {
                ...c.latestMessage,
                readBy: [...(c.latestMessage.readBy || []), user._id],
              },
            }
          }
          return c
        })
      })
    }

    setNotification(prev => prev.filter(c => c !== chat._id))
    navigate(`/chats?chatId=${chat._id}`)
  }

  const renderChatItem = chat => {
    const readByLoggedUser = chat.latestMessage
      ? chat.latestMessage.readBy.includes(user?._id) ||
        chat.latestMessage.sender._id.toString() === user?._id.toString()
      : true
    return (
      <Flex
        onClick={() => handleChatClick(chat)}
        cursor={'pointer'}
        bg={
          selectedChat &&
          selectedChat._id &&
          selectedChat?._id.toString() === chat?._id.toString()
            ? '#2D3748'
            : ''
        }
        color={'rgba(255, 255, 255, 0.7)'}
        boxShadow={
          '0px 4px 8px rgba(0, 0, 0, 0.3), 0px 8px 16px rgba(0, 0, 0, 0.3), 0px 12px 24px rgba(0, 0, 0, 0.3)'
        }
        px={3}
        py={2}
        my={1}
        borderRadius="lg"
        key={chat._id}
        gap={3}
        // flexDirection={'row'}
      >
        <Image
          borderRadius="full"
          boxSize={{ base: '35px', md: '45px' }}
          src={getSenderFull(loggedUser, chat.users).pic}
          alt={getSenderFull(loggedUser, chat.users).name}
        />
        <Flex flexDirection={'column'} w={'100%'}>
          <Flex
            justifyContent={'space-between'}
            alignItems={'center'}
            // w={'100%'}
          >
            <Flex gap={2}>
              <Text fontWeight={readByLoggedUser ? 'normal' : 'bold'} m={0}>
                {chat._id &&
                !chat.isGroupChat &&
                chat.users &&
                chat.users.length > 0
                  ? getSender(loggedUser, chat.users)
                  : chat.chatName}
              </Text>
              {/* {chat.status === 'pending' &&
                chat.chatCreatedBy !== loggedUser?._id && (
                  <Badge colorScheme="yellow">New Request</Badge>
                )}
              {chat.status === 'rejected' && (
                <Badge colorScheme="red">Rejected</Badge>
              )}{' '} */}
              {chat.new && (
                <Badge colorScheme="green" h={'fit-content'} mt={1}>
                  New
                </Badge>
              )}
            </Flex>
            <Flex>
              <Text
                m={0}
                fontSize="xs"
                color={readByLoggedUser ? '#9CAFAA' : 'white'}
              >
                {chat._id &&
                !chat.isGroupChat &&
                chat.users &&
                chat.users.length > 0
                  ? getRecieverInGameName(loggedUser, chat.users)
                  : null}
              </Text>
            </Flex>
          </Flex>
          {chat._id && chat.latestMessage && (
            <Text
              fontSize="xs"
              color={readByLoggedUser ? '#9CAFAA' : 'white'}
              display={'flex'}
              alignItems={'center'}
              fontWeight={readByLoggedUser ? 'normal' : 'bold'}
            >
              {isSenderLoggedUser(loggedUser, chat.latestMessage.sender)
                ? 'YOU'
                : chat.latestMessage.sender.name}{' '}
              {': '}
              {getLatestMessageContent(chat)}
              {!readByLoggedUser && (
                <Badge
                  colorScheme="blue"
                  borderRadius={'50%'}
                  h={'8px'}
                  w={'8px'}
                  top={'58%'}
                  right={'10%'}
                  marginLeft={'1rem'}
                />
              )}
            </Text>
          )}
        </Flex>
      </Flex>
    )
  }

  return (
    <Box
      display={{ base: selectedChat ? 'none' : 'flex', md: 'flex' }}
      flexDir="column"
      alignItems="center"
      p={3}
      w={'100%'}
      h={'100%'}
      borderRadius="lg"
      style={{
        backgroundImage:
          'linear-gradient(-180deg, rgba(32, 28, 46, 0.7), rgba(19, 16, 29, 0.7) 88%, rgba(19, 16, 29, 0.7) 99%)',
        boxShadow:
          'inset 0 0 10px rgba(255, 255, 255, 0.05), 0 4px 10px rgba(0, 0, 0, 0.3), 0 8px 20px rgba(0, 0, 0, 0.2)',
      }}
    >
      <Box
        pb={3}
        px={3}
        display="flex"
        w="100%"
        justifyContent={{ base: 'column', lg: 'space-between' }}
        alignItems="center"
      >
        <Flex>
          {user && (
            <>
              <ButtonGradient />
              <Tooltip
                label="Search Users to chat"
                hasArrow
                placement="bottom-end"
                color={'white'}
              >
                <Button onClick={onOpen} buttonW={buttonW} textColor={'white'}>
                  <Flex
                    alignItems={'center'}
                    marginTop={{ base: '5px', lg: '0' }}
                  >
                    <Search2Icon fontSize={{ base: '1.3rem', md: '1rem' }} />
                    <Text display={{ base: 'none', md: 'flex' }} px={2} m={0}>
                      Search User
                    </Text>
                  </Flex>
                </Button>
              </Tooltip>
              <ChatSideDrawer isOpen={isOpen} onClose={onClose} />
            </>
          )}
        </Flex>
        <Button
          onClick={() => setShowRequestsTab(!showRequestsTab)}
          white={showRequestsTab ? true : false}
          textColor={'white'}
        >
          {showRequestsTab ? 'Chats' : 'Requests'}
        </Button>
        {/* <GroupChatModal>
          <Flex position={"relative"}>
            <Button pl={"1.5rem"} textColor={"white"} buttonW="150px">
              New Group
            </Button>
            <Flex position={"absolute"} left={4} top={"0.4rem"}>
              <AddIcon w={"0.75rem"} />
            </Flex>
          </Flex>
        </GroupChatModal> */}
      </Box>
      <Box
        display="flex"
        flexDirection="column"
        p={3}
        // style={{
        //   backgroundColor: '#0f0d15',
        //   backgroundImage:
        //     'linear-gradient(-180deg, rgba(26, 21, 39, 0.6), rgba(14, 12, 22, 0.6) 88%, rgba(14, 12, 22, 0.6) 99%)',
        //   boxShadow:
        //     '0px 4px 8px rgba(0, 0, 0, 0.3), 0px 8px 16px rgba(0, 0, 0, 0.3), 0px 12px 24px rgba(0, 0, 0, 0.3)',
        // }}
        w="100%"
        h="90%"
        borderRadius="lg"
        overflowY="hidden"
      >
        <Heading size={'md'} pl={'5px'} color={'white'}>
          {showRequestsTab ? 'Requests' : 'Chats'}
        </Heading>
        {showRequestsTab ? (
          <Stack
            overflowY="auto"
            css={{ '&::-webkit-scrollbar': { display: 'none' } }}
          >
            {chatRequests.map(chat => renderChatItem(chat, true))}
          </Stack>
        ) : chats ? (
          <Stack
            overflowY="auto"
            css={{ '&::-webkit-scrollbar': { display: 'none' } }}
          >
            {chats.map(chat => renderChatItem(chat))}
          </Stack>
        ) : (
          <ChatLoading />
        )}
      </Box>
    </Box>
  )
}

export default UserChats
