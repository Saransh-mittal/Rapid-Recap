import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  Suspense,
} from 'react'
import {
  Button,
  Flex,
  Grid,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  VStack,
  useToast,
} from '@chakra-ui/react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import useSound from '../../customHooks/useSound'
import slugify from 'slugify'

const ArticleCard = React.lazy(() => import('../miscellaneous/ArticleCard'))

const Bookmarks = ({ isOpen, onClose }) => {
  const [viewMode, setViewMode] = useState('grid')
  const [isLoading, setIsLoading] = useState(true)
  const [bookmarks, setBookmarks] = useState([])
  const [isMobileListView, setIsMobileListView] = useState(
    window.innerWidth <= 768,
  )
  const navigate = useNavigate()
  const toast = useToast()
  const { playClick } = useSound()

  const fetchBookmarks = useCallback(async () => {
    try {
      const response = await axios.get('/api/user/getBookmarks')
      setBookmarks(response.data.bookmarks)
    } catch (error) {
      console.error(error)
      onClose()
    } finally {
      setIsLoading(false)
    }
  }, [onClose])

  useEffect(() => {
    if (isOpen) fetchBookmarks()
  }, [isOpen, fetchBookmarks])

  const handleBookmarkClick = useCallback(
    (id, title) => {
      navigate(`/article/${id}/${slugify(title)}`)
    },
    [navigate],
  )

  const handleRemoveBookmark = useCallback(
    async articleId => {
      try {
        await axios.get(`/api/user/removeBookmark?articleId=${articleId}`)
        setBookmarks(prevBookmarks =>
          prevBookmarks.filter(bookmark => bookmark._id !== articleId),
        )
        toast({
          title: 'Bookmark removed',
          status: 'success',
          duration: 3000,
          isClosable: true,
          position: 'top',
        })
      } catch (error) {
        console.error(error)
        toast({
          title: 'Error removing bookmark',
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
      }
    },
    [toast],
  )

  useEffect(() => {
    const handleResize = () => {
      setIsMobileListView(window.innerWidth <= 768)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const renderedBookmarks = useMemo(
    () =>
      isLoading
        ? Array.from({ length: 6 }).map((_, index) => (
            <ArticleCard key={index} isLoading={true} viewMode={viewMode} />
          ))
        : bookmarks.map(bookmark => (
            <ArticleCard
              key={bookmark._id}
              article={bookmark}
              onClick={() => handleBookmarkClick(bookmark._id, bookmark.title)}
              onRemove={handleRemoveBookmark}
              viewMode={viewMode}
              isMobileListView={isMobileListView}
            />
          )),
    [
      isLoading,
      bookmarks,
      handleBookmarkClick,
      handleRemoveBookmark,
      viewMode,
      isMobileListView,
    ],
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={{ base: 'full', md: 'xl', lg: '3xl', xl: '4xl' }}
      scrollBehavior={'inside'}
    >
      <ModalOverlay />
      <ModalContent
        bg="rgba(15, 13, 21, 0.8)"
        borderRadius="xl"
        boxShadow="0 8px 32px 0 rgba(31, 38, 135, 0.37)"
        border="1px solid rgba(255, 255, 255, 0.18)"
      >
        <ModalHeader color="#ffffff">Your Bookmarks</ModalHeader>
        <ModalCloseButton color="#ffffff" />
        <ModalBody
          w={'100%'}
          css={{
            '&::-webkit-scrollbar': {
              display: 'none',
            },
          }}
          px={4}
        >
          <Flex align="center" mb="20px">
            <Button
              marginLeft={'auto'}
              onClick={() => {
                playClick()
                setViewMode(viewMode === 'grid' ? 'list' : 'grid')
              }}
              bg="#2a2438"
              color="#ffffff"
              _hover={{ bg: '#1f1b2e' }}
            >
              {viewMode === 'grid'
                ? 'Switch to List View'
                : 'Switch to Grid View'}
            </Button>
          </Flex>
          <Suspense fallback={<div>Loading...</div>}>
            {viewMode === 'grid' ? (
              <Grid
                templateColumns="repeat(auto-fill, minmax(250px, 1fr))"
                gap="20px"
              >
                {renderedBookmarks}
              </Grid>
            ) : (
              <VStack>{renderedBookmarks}</VStack>
            )}
          </Suspense>
        </ModalBody>
        <ModalFooter>
          <Button
            onClick={() => {
              playClick()
              onClose()
            }}
            bg="#2a2438"
            color="#ffffff"
            _hover={{ bg: '#1f1b2e' }}
          >
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default Bookmarks
