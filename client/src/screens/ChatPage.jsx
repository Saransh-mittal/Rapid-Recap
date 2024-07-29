import React, { useEffect, useState } from 'react'
import {
  Box,
  Flex,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerBody,
  useDisclosure,
  DrawerHeader,
  DrawerCloseButton,
  Heading,
  useMediaQuery,
} from '@chakra-ui/react'
import UserChats from '../components/chatComponent/userChats'
import UserChatBox from '../components/chatComponent/userChatBox'
import { ChatState } from '../contextAPI/ChatProvider'
import { useNavigate } from 'react-router-dom'

const ChatPage = () => {
  const [fetchAgain, setFetchAgain] = useState(false)
  const { user, selectedChat, isChatOpen, closeChat, openChat, isLastRoute } =
    ChatState()
  const isScreenSmallerThan992px = useMediaQuery('(max-width: 992px)')[0]
  const navigate = useNavigate()

  const handleClose = () => {
    closeChat()
    // go to the previous page
    if (isLastRoute) navigate('/home')
    else navigate(-1)
  }

  useEffect(() => {
    if (
      isScreenSmallerThan992px &&
      location.pathname === '/chats' &&
      !isChatOpen
    ) {
      openChat()
    }
  }, [isScreenSmallerThan992px])

  return (
    <div
      style={{
        marginTop: '5rem',
        width: '100%',
        color: 'b',
      }}
    >
      <Box display="flex" justifyContent="center" w="100%" h="87vh" p="10px">
        {/* UserChats for larger screens */}
        <Flex
          display={{ base: 'none', lg: 'flex' }}
          flexDirection="column"
          w={{ base: '100%', md: '50%' }}
          mr={{ base: 0, md: 10 }}
          h="100%"
        >
          {user && <UserChats fetchAgain={fetchAgain} />}
        </Flex>

        {/* Drawer for smaller screens */}
        <Drawer
          placement="right"
          onClose={handleClose}
          isOpen={isChatOpen}
          size={'full'}
        >
          <DrawerOverlay />
          <DrawerContent
            p={0}
            style={{
              backgroundImage:
                'linear-gradient(-180deg, #201c2e, #13101d 88%, #13101d 99%)',
              boxShadow:
                'inset 0 0 10px rgba(255, 255, 255, 0.05), 0 4px 10px rgba(0, 0, 0, 0.3), 0 8px 20px rgba(0, 0, 0, 0.2)',
            }}
          >
            <DrawerBody p={0}>
              {!selectedChat && (
                <DrawerCloseButton
                  size={'lg'}
                  color={'white'}
                  right={'6%'}
                  top={'1.5%'}
                />
              )}
              <Flex
                display={{ base: !selectedChat ? 'flex' : 'none', lg: 'none' }}
                h={'92vh'}
                p={0}
              >
                {user && <UserChats fetchAgain={fetchAgain} />}
              </Flex>
              <Flex
                display={{ base: selectedChat ? 'flex' : 'none', lg: 'none' }}
                w="100%"
                h={'92vh'}
                className="userChatBox"
              >
                {user && (
                  <UserChatBox
                    selectedChat={selectedChat}
                    fetchAgain={fetchAgain}
                    setFetchAgain={setFetchAgain}
                  />
                )}
              </Flex>
            </DrawerBody>
          </DrawerContent>
        </Drawer>

        {/* UserChatBox */}
        <Flex
          display={{ base: selectedChat ? 'flex' : 'none', lg: 'flex' }}
          w="100%"
          className="userChatBox"
        >
          {user && (
            <UserChatBox
              selectedChat={selectedChat}
              fetchAgain={fetchAgain}
              setFetchAgain={setFetchAgain}
            />
          )}
        </Flex>
      </Box>
    </div>
  )
}

export default ChatPage
