import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
  lazy,
  Suspense,
} from 'react'
import {
  Box,
  Flex,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerBody,
  DrawerCloseButton,
  useMediaQuery,
  Spinner,
} from '@chakra-ui/react'
import { ChatState } from '../contextAPI/ChatProvider'
import { useNavigate } from 'react-router-dom'

//SSR images
const chatBg = '/images/hero-bg.webp'

// Lazy load components
const UserChats = lazy(() => import('../components/chatComponent/userChats'))
const UserChatBox = lazy(() =>
  import('../components/chatComponent/userChatBox'),
)

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

  const handleClose = useCallback(() => {
    closeChat()
    console.log(isLastRoute)
    if (isLastRoute) navigate('/home')
    else navigate(-1)
  }, [closeChat, isLastRoute, navigate])

  const updateHeight = useCallback(() => {
    if (contentRef.current) {
      const viewportHeight = window.innerHeight
      setContentHeight(`${viewportHeight}px`)
    }
  }, [])

  useEffect(() => {
    updateHeight()
    window.addEventListener('resize', updateHeight)
    window.addEventListener('orientationchange', updateHeight)
    return () => {
      window.removeEventListener('resize', updateHeight)
      window.removeEventListener('orientationchange', updateHeight)
    }
  }, [updateHeight])

  useEffect(() => {
    if (
      isScreenSmallerThan992px &&
      location.pathname === '/chats' &&
      !isChatOpen
    ) {
      openChat()
    }
  }, [isScreenSmallerThan992px, isChatOpen, openChat])

  const MemoizedUserChats = useMemo(() => {
    return user && <UserChats fetchAgain={fetchAgain} />
  }, [user, fetchAgain])

  const MemoizedUserChatBox = useMemo(() => {
    return (
      user && (
        <UserChatBox
          selectedChat={selectedChat}
          fetchAgain={fetchAgain}
          setFetchAgain={setFetchAgain}
        />
      )
    )
  }, [user, selectedChat, fetchAgain, setFetchAgain])

  return (
    <div
      ref={contentRef}
      style={{
        width: '100%',
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
          <Suspense fallback={<Spinner />}>{MemoizedUserChats}</Suspense>
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
            backgroundImage={chatBg}
            backgroundAttachment="fixed"
            backgroundPosition="center"
            backgroundRepeat="no-repeat"
            backgroundSize="cover"
            backfaceVisibility="hidden"
            perspective="1000"
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
                <Suspense fallback={<Spinner />}>{MemoizedUserChats}</Suspense>
              </Flex>
              <Flex
                display={{ base: selectedChat ? 'flex' : 'none', lg: 'none' }}
                w="100%"
                h={contentHeight}
                className="userChatBox"
              >
                <Suspense fallback={<Spinner />}>
                  {MemoizedUserChatBox}
                </Suspense>
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
          <Suspense fallback={<Spinner />}>{MemoizedUserChatBox}</Suspense>
        </Flex>
      </Box>
    </div>
  )
}

export default ChatPage
