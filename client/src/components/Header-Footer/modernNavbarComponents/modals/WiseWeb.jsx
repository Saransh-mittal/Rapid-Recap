import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  forwardRef,
  Suspense,
  useTransition,
} from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Box,
  Flex,
  Text,
  VStack,
  useColorModeValue,
  Skeleton,
  SkeletonCircle,
  useToast,
  useMediaQuery,
} from '@chakra-ui/react'
import axios from 'axios'
import { ChatState } from '../../../../contextAPI/ChatProvider'
import { useTranslation } from 'react-i18next'

// Lazy load SVGs and other components
const UserPlusSVG = React.lazy(() =>
  import('../../../../assets/svg/UserPlusSVG'),
)
const UserFriendsSVG = React.lazy(() =>
  import('../../../../assets/svg/UserFriendsSVG'),
)

// Lazy load FriendItem and FriendRequestItem
const FriendItem = React.lazy(() =>
  import('../../navbarComponents/WiseSwebComponents/FriendItem'),
)
const FriendRequestItem = React.lazy(() =>
  import('../../navbarComponents/WiseSwebComponents/FriendRequestItem'),
)

const FriendList = forwardRef(
  (
    { items, startIndex = 0, openPopoverId, setOpenPopoverId, onSeverTies, t },
    ref,
  ) => {
    const onlineFriends = items
      .filter(friend => friend.isOnline)
      .sort((a, b) => b.IQ_score - a.IQ_score)

    const offlineFriends = items
      .filter(friend => !friend.isOnline)
      .sort((a, b) => b.IQ_score - a.IQ_score)

    return (
      <VStack
        ref={ref}
        spacing={0}
        align="stretch"
        maxH="300px"
        overflowY="auto"
        borderColor={useColorModeValue('#2a2438', '#2a2438')}
        borderWidth={1}
        borderRadius="md"
        p={2}
        css={{
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#1a1527',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#2a2438',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: '#3d355a',
          },
        }}
      >
        {onlineFriends.length > 0 && (
          <>
            <Text
              fontSize="sm"
              fontWeight="bold"
              color="#a49eb9"
              mb={2}
              textAlign={'center'}
            >
              {t('online_friends')}
            </Text>
            <Suspense
              fallback={<LoadingSkeleton count={onlineFriends.length} />}
            >
              {onlineFriends.map((item, index) => (
                <FriendItem
                  key={startIndex + index}
                  friend={item}
                  index={startIndex + index}
                  openPopoverId={openPopoverId}
                  setOpenPopoverId={setOpenPopoverId}
                  onSeverTies={onSeverTies}
                />
              ))}
            </Suspense>
          </>
        )}
        {offlineFriends.length > 0 && (
          <>
            <Text
              fontSize="sm"
              fontWeight="bold"
              color="#a49eb9"
              mt={4}
              mb={2}
              textAlign={'center'}
            >
              {t('leaderboard')}
            </Text>
            <Suspense
              fallback={<LoadingSkeleton count={offlineFriends.length} />}
            >
              {offlineFriends.map((item, index) => (
                <FriendItem
                  key={startIndex + onlineFriends.length + index}
                  friend={item}
                  index={startIndex + onlineFriends.length + index}
                  openPopoverId={openPopoverId}
                  setOpenPopoverId={setOpenPopoverId}
                  onSeverTies={onSeverTies}
                />
              ))}
            </Suspense>
          </>
        )}
      </VStack>
    )
  },
)

const LoadingSkeleton = ({ count = 3 }) => (
  <VStack spacing={4} align="stretch" width="100%">
    {[...Array(count)].map((_, index) => (
      <Flex key={index} alignItems="center" p={2}>
        <SkeletonCircle size="10" />
        <Box ml={4} width="100%">
          <Skeleton height="20px" width="60%" mb={1} />
          <Skeleton height="16px" width="40%" />
        </Box>
      </Flex>
    ))}
  </VStack>
)

const WiseWeb = ({
  isOpen,
  onClose,
  requestNotif,
  markRequestAsRead,
  setIsHamburgerOpen,
}) => {
  const { t } = useTranslation('WiseWeb')
  const [friends, setFriends] = useState([])
  const [requests, setRequests] = useState([])
  const [openPopoverId, setOpenPopoverId] = useState(null)
  const [activeTab, setActiveTab] = useState(requestNotif ? 1 : 0)
  const [isLoadingFriends, setIsLoadingFriends] = useState(true)
  const [isLoadingRequests, setIsLoadingRequests] = useState(true)
  const isScreenSmallerThan48em = useMediaQuery('(max-width: 48em)')[0]
  const [requestTabVisited, setRequestTabVisited] = useState(
    requestNotif ? true : false,
  )
  const [isCheckingOnlineStatus, setIsCheckingOnlineStatus] = useState(false)
  const chatState = ChatState()
  const socket = chatState ? chatState.socket : null

  const toast = useToast()

  const friendListRef = useRef(null)

  const checkOnlineStatus = useCallback(() => {
    if (socket && friends.length > 0) {
      setIsCheckingOnlineStatus(true)
      const friendIds = friends.map(friend => friend._id)
      socket.emit('check online status', friendIds)
    }
  }, [friends, socket])

  const fetchFriends = useCallback(async () => {
    setIsLoadingFriends(true)
    try {
      const response = await axios.get(`/api/friends/`)
      setFriends(response.data.map(friend => ({ ...friend })))
      checkOnlineStatus()
    } catch (error) {
      console.error('Error fetching friends:', error)
    } finally {
      setIsLoadingFriends(false)
    }
  }, [checkOnlineStatus])

  const handleSeverTies = useCallback(
    async friendId => {
      try {
        await axios.post('/api/friends/sever-ties', { friendId })
        fetchFriends()
        toast({
          title: t('ties_severed'),
          description: t('unfriended_message'),
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
      } catch (error) {
        console.error('Error severing ties:', error)
        toast({
          title: t('error_severing_ties'),
          description: t('sever_ties_error_message'),
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
      }
    },
    [fetchFriends, toast],
  )

  const handleTabChange = useCallback(
    index => {
      if (index === 1) {
        setRequestTabVisited(true)
      } else if (index === 0 && requestTabVisited) {
        markRequestAsRead()
        setRequestTabVisited(false)
      }
      setActiveTab(index)
    },
    [markRequestAsRead, requestTabVisited],
  )

  const handleClose = useCallback(() => {
    if (requestTabVisited) {
      markRequestAsRead()
      setRequestTabVisited(false)
    }
    onClose()
  }, [markRequestAsRead, onClose, requestTabVisited])

  useEffect(() => {
    const handleClickOutside = event => {
      if (
        friendListRef.current &&
        !friendListRef.current.contains(event.target) &&
        openPopoverId !== null
      ) {
        setOpenPopoverId(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [openPopoverId])

  const fetchRequests = useCallback(async () => {
    setIsLoadingRequests(true)
    try {
      const response = await axios.get(`/api/friends/get-requests`)
      setRequests(response.data)
    } catch (error) {
      console.error('Error fetching friend requests:', error)
    } finally {
      setIsLoadingRequests(false)
    }
  }, [])

  const handleAcceptRequest = useCallback(
    async requestId => {
      try {
        await axios.post('/api/friends/accept-request', { requestId })
        fetchRequests()
        fetchFriends()
      } catch (error) {
        console.error('Error accepting friend request:', error)
      }
    },
    [fetchFriends, fetchRequests],
  )

  const handleRejectRequest = useCallback(
    async requestId => {
      try {
        await axios.post('/api/friends/reject-request', { requestId })
        fetchRequests()
      } catch (error) {
        console.error('Error rejecting friend request:', error)
      }
    },
    [fetchRequests],
  )

  useEffect(() => {
    if (isOpen) {
      fetchRequests()
      fetchFriends()
    }
  }, [isOpen])

  useEffect(() => {
    if (socket) {
      socket.on('online status response', statuses => {
        setFriends(prevFriends =>
          prevFriends.map(friend => ({
            ...friend,
            isOnline: statuses[friend._id],
          })),
        )
        setIsCheckingOnlineStatus(false)
      })
      socket.on('user online', userId => {
        setFriends(prevFriends =>
          prevFriends.map(f =>
            f._id === userId ? { ...f, isOnline: true } : f,
          ),
        )
      })
      socket.on('user offline', userId => {
        setFriends(prevFriends =>
          prevFriends.map(f =>
            f._id === userId ? { ...f, isOnline: false } : f,
          ),
        )
      })
      // Cleanup function
      return () => {
        socket?.off('online status response')
        socket?.off('user online')
        socket?.off('user offline')
      }
    }
  }, [socket])

  const bgGradient = useColorModeValue(
    'linear(to-b, #1a1527, #0e0c16 88%, #0e0c16 99%)',
    'linear(to-b, #1a1527, #0e0c16 88%, #0e0c16 99%)',
  )

  const borderColor = useColorModeValue('#2a2438', '#2a2438')
  const textColor = useColorModeValue('white', 'white')
  const headerColor = useColorModeValue('#a49eb9', '#a49eb9')

  const tabStyle = useCallback(
    isActive => ({
      padding: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      backgroundColor: isActive ? '#2a2438' : 'transparent',
      color: isActive ? '#ffffff' : '#a49eb9',
      border: 'none',
      transition: 'all 0.3s ease',
      borderRadius: '4px',
      transform: isActive ? 'scale(1.05)' : 'scale(1)',
      boxShadow: isActive ? '0 2px 4px rgba(0,0,0,0.2)' : 'none',
    }),
    [],
  )

  const memoizedFriendList = useMemo(
    () =>
      isLoadingFriends ? (
        <LoadingSkeleton />
      ) : friends.length > 0 ? (
        <FriendList
          items={friends}
          openPopoverId={openPopoverId}
          setOpenPopoverId={setOpenPopoverId}
          ref={friendListRef}
          onSeverTies={handleSeverTies}
          t={t}
        />
      ) : (
        <Text>{t('no_friends')}</Text>
      ),
    [friends, openPopoverId, isLoadingFriends, handleSeverTies],
  )

  const memoizedRequestList = useMemo(
    () =>
      isLoadingRequests ? (
        <LoadingSkeleton />
      ) : requests.length > 0 ? (
        <VStack spacing={4}>
          {requests.map(request => (
            <Suspense
              fallback={<LoadingSkeleton count={1} />}
              key={request._id}
            >
              <FriendRequestItem
                request={request}
                onAccept={handleAcceptRequest}
                onReject={handleRejectRequest}
              />
            </Suspense>
          ))}
        </VStack>
      ) : (
        <Text>{t('no_friend_requests')}</Text>
      ),
    [requests, isLoadingRequests, handleAcceptRequest, handleRejectRequest],
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        handleClose()
        isScreenSmallerThan48em && setIsHamburgerOpen(true)
      }}
      onCloseComplete={() => setOpenPopoverId(null)}
      size={{ base: 'full', md: 'sm' }}
    >
      <ModalOverlay />
      <ModalContent
        bgGradient={bgGradient}
        color={textColor}
        borderColor={borderColor}
        borderWidth={1}
        borderRadius="md"
        maxW="400px"
        css={{ '&::-webkit-scrollbar': { display: 'none' } }}
      >
        <ModalHeader>{t('wise_web')}</ModalHeader>
        <ModalCloseButton />
        <ModalBody
          maxH="75vh"
          overflowY="auto"
          w={'100%'}
          position="relative"
          css={{ '&::-webkit-scrollbar': { display: 'none' } }}
          pb={'4rem'}
        >
          <Tabs
            isFitted
            variant="enclosed"
            index={activeTab}
            onChange={handleTabChange}
          >
            <TabList
              mb="1em"
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                backgroundColor: '#1a1527',
                borderRadius: '4px',
                overflow: 'hidden',
                padding: '4px',
              }}
            >
              <Suspense fallback={<Skeleton height="20px" width="60px" />}>
                <Tab style={tabStyle(activeTab === 0)}>
                  <UserFriendsSVG
                    width={'16px'}
                    height={'16px'}
                    fill={'#a49eb9'}
                    style={{ marginRight: '8px' }}
                  />
                  {t('friends')}
                </Tab>
              </Suspense>
              <Suspense fallback={<Skeleton height="20px" width="60px" />}>
                <Tab style={tabStyle(activeTab === 1)} position={'relative'}>
                  {requestNotif && (
                    <Box
                      h="8px"
                      w="8px"
                      bg={'red'}
                      borderRadius={'50%'}
                      position={'absolute'}
                      right={'20%'}
                      top={'25%'}
                      zIndex={2}
                    />
                  )}
                  <UserPlusSVG
                    width={'16px'}
                    height={'16px'}
                    fill={'#a49eb9'}
                    style={{ marginRight: '8px' }}
                  />
                  {t('requests')}
                </Tab>
              </Suspense>
            </TabList>
            <TabPanels>
              <TabPanel p={0}>
                <Text
                  fontSize="xl"
                  fontWeight="bold"
                  mb={4}
                  color={headerColor}
                >
                  {t('your_friends')}
                </Text>
                {memoizedFriendList}
              </TabPanel>
              <TabPanel p={0}>
                <Text
                  fontSize="xl"
                  fontWeight="bold"
                  mb={4}
                  color={headerColor}
                >
                  {t('friend_requests')}
                </Text>
                {memoizedRequestList}
              </TabPanel>
            </TabPanels>
          </Tabs>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default WiseWeb
