import { useTranslation } from 'react-i18next'
import { Input } from '@chakra-ui/input'
import { Box } from '@chakra-ui/layout'
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  DrawerCloseButton,
} from '@chakra-ui/modal'
import { useNavigate } from 'react-router-dom'
import { useState, useCallback, lazy, Suspense } from 'react'
import axios from 'axios'
import { useToast } from '@chakra-ui/toast'
import { Spinner } from '@chakra-ui/spinner'
import { ChatState } from '../../contextAPI/ChatProvider'
import debounce from 'lodash.debounce'

// Lazy load UserListItem component
const UserListItem = lazy(() => import('./userAvatar/UserListItem'))

const ChatSideDrawer = ({ isOpen, onClose }) => {
  const { t } = useTranslation('ChatSideDrawer')
  const [search, setSearch] = useState('')
  const [searchResult, setSearchResult] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingChat, setLoadingChat] = useState(false)

  const {
    setSelectedChat,
    user,
    notification,
    setNotification,
    chats,
    setChats,
  } = ChatState()

  const toast = useToast()
  const history = useNavigate()

  const debouncedSearch = useCallback(
    debounce(async (query, callback) => {
      try {
        if (!query || query === '') return
        const response = await axios.get(`/api/user/search?query=${query}`)
        callback(response.data)
      } catch (error) {
        console.error('Error searching users:', error)
      }
    }, 800),
    [],
  )

  const handleSearch = useCallback(
    async event => {
      setLoading(true)
      const { value } = event.target
      setSearch(value)
      if (value === '') {
        setLoading(false)
        setSearchResult([])
        debouncedSearch.cancel()
        return
      }
      debouncedSearch(value, responseData => {
        if (!value || value === '') return
        setSearchResult(
          responseData.filter(u => {
            if (user._id === u._id) return false
            return !searchResult.find(sr => sr._id === u._id)
          }),
        )

        if (responseData.length === 0)
          toast({
            title: t('noUserFound'),
            status: 'info',
            duration: 3000,
            isClosable: true,
            position: 'top',
          })
        setLoading(false)
      })
    },
    [debouncedSearch, toast, t],
  )

  const accessChat = useCallback(
    async userId => {
      try {
        setLoadingChat(true)
        const { data } = await axios.post(`/api/chat`, { userId })

        if (!chats.find(c => c._id === data._id)) setChats([data, ...chats])
        setSelectedChat(data)
        setLoadingChat(false)
        onClose()
      } catch (error) {
        toast({
          title: t('errorFetchingChat'),
          description: error.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'bottom-left',
        })
      }
    },
    [chats, onClose, setChats, setSelectedChat, toast, t],
  )

  return (
    <>
      <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent
          style={{
            backgroundColor: '#0f0d15',
            backgroundImage:
              'linear-gradient(-180deg, #1a1527, #0e0c16 88%, #0e0c16 99%)',
            boxShadow:
              '0px 4px 8px rgba(0, 0, 0, 0.3), 0px 8px 16px rgba(0, 0, 0, 0.3), 0px 12px 24px rgba(0, 0, 0, 0.3)',
          }}
          color={'white'}
        >
          <DrawerCloseButton />
          <DrawerHeader>{t('searchUsers')}</DrawerHeader>
          <DrawerBody
            css={{
              '&::-webkit-scrollbar': {
                display: 'none',
              },
            }}
          >
            <Box display="flex" pb={2} gap={2}>
              <Input
                placeholder={t('searchPlaceholder')}
                mr={2}
                value={search}
                onChange={handleSearch}
              />
            </Box>
            {loading ? (
              <Spinner />
            ) : (
              <Suspense fallback={<Spinner />}>
                {searchResult?.map(user => (
                  <UserListItem
                    key={user._id}
                    user={user}
                    handleFunction={() => accessChat(user._id)}
                  />
                ))}
              </Suspense>
            )}
            {loadingChat && <Spinner ml="auto" d="flex" />}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  )
}

export default ChatSideDrawer
