import React, { useEffect, useRef, useState } from 'react'
import {
  Box,
  Flex,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerBody,
  DrawerCloseButton,
  useMediaQuery,
} from '@chakra-ui/react'
import UserChats from '../components/chatComponent/userChats'
import UserChatBox from '../components/chatComponent/userChatBox'
import { ChatState } from '../contextAPI/ChatProvider'
import { useNavigate } from 'react-router-dom'

const ChatPage = () => {
  const {
    user,
    selectedChat,
    isChatOpen,
    closeChat,
    openChat,
    isLastRoute,
    setFetchAgain,
    fetchAgain,
  } = ChatState()
  const isScreenSmallerThan992px = useMediaQuery('(max-width: 992px)')[0]
  const navigate = useNavigate()
  const [contentHeight, setContentHeight] = useState('100vh')
  const contentRef = useRef(null)

  const handleClose = () => {
    closeChat()
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

  useEffect(() => {
    const updateHeight = () => {
      if (contentRef.current) {
        const viewportHeight = window.innerHeight
        setContentHeight(`${viewportHeight}px`)
      }
    }

    updateHeight()
    window.addEventListener('resize', updateHeight)
    window.addEventListener('orientationchange', updateHeight)
    return () => {
      window.removeEventListener('resize', updateHeight)
      window.removeEventListener('orientationchange', updateHeight)
    }
  }, [])

  return (
    <div
      ref={contentRef}
      style={{
        width: '100%',
        color: 'b',
        height: '100vh',
        overflow: 'hidden',
        position: 'fixed',
        top: 0,
        left: 0,
      }}
    >
      <Box display="flex" justifyContent="center" w="100%" h="100%" p="10px">
        {/* UserChats for larger screens */}
        <Flex
          mt={{ md: '7%', lg: '10%', xl: '7%', '2xl': '5%' }}
          display={{ base: 'none', lg: 'flex' }}
          flexDirection="column"
          w={{ base: '100%', md: '50%' }}
          mr={{ base: 0, md: 10 }}
          h="85%"
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
                h={contentHeight}
                p={0}
              >
                {user && <UserChats fetchAgain={fetchAgain} />}
              </Flex>
              <Flex
                display={{ base: selectedChat ? 'flex' : 'none', lg: 'none' }}
                w="100%"
                h={contentHeight}
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
          mt={{ md: '7%', lg: '10%', xl: '7%', '2xl': '5%' }}
          display={{ base: selectedChat ? 'flex' : 'none', lg: 'flex' }}
          w="100%"
          h="85%"
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
