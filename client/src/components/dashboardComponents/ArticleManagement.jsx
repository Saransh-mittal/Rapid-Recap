/* eslint-disable react/prop-types */
import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  lazy,
  Suspense,
} from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  VStack,
  useDisclosure,
  useToast,
} from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

// Lazy loaded components
const ArticleList = lazy(() => import('./ArticleManageComponents/ArticleList'))
const ArticleForm = lazy(() => import('./ArticleManageComponents/ArticleForm'))
const ArticleFilters = lazy(() =>
  import('./ArticleManageComponents/ArticleFilters'),
)
const DeleteArticleAlert = lazy(() =>
  import('./ArticleManageComponents/DeleteArticleAlert'),
)

const ArticleManagement = ({ isOpen, onOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [articles, setArticles] = useState([])
  const [filters, setFilters] = useState({
    category: '',
    author: '',
    startDate: '',
    endDate: '',
    hasQuiz: '',
    _id: '',
  })
  const [selectedArticle, setSelectedArticle] = useState(null)
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure()
  const {
    isOpen: isAddOpen,
    onOpen: onAddOpen,
    onClose: onAddClose,
  } = useDisclosure()
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false)
  const cancelRef = React.useRef()
  const toast = useToast()
  const navigate = useNavigate()

  const [newArticle, setNewArticle] = useState({
    dateTime: '',
    author: 'Rapid Recap Team',
    title: '',
    mainText: '',
    imgURL: [],
    category: 'General',
    avgReadTime: 0,
    url: '',
  })

  const fetchArticles = useCallback(async () => {
    try {
      const queryParams = new URLSearchParams({
        query: searchTerm,
        ...filters,
      }).toString()
      const response = await axios.get(
        `/api/admin/articles/search?${queryParams}`,
      )
      setArticles(response.data.searchResults)
    } catch (error) {
      console.error('Error fetching articles:', error)
      toast({
        title: 'Error fetching articles',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }, [searchTerm, filters, toast])

  useEffect(() => {
    fetchArticles()
  }, [])

  const handleEditArticle = useCallback(
    async id => {
      try {
        const response = await axios.get(`/api/admin/articles/${id}`)
        setSelectedArticle(response.data)
        onEditOpen()
        onClose()
      } catch (error) {
        console.error('Error fetching article details:', error)
        toast({
          title: 'Error fetching article details',
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
      }
    },
    [onEditOpen, onClose, toast],
  )

  const handleUpdateArticle = useCallback(
    async updatedData => {
      try {
        await axios.put(
          `/api/admin/articles/${selectedArticle._id}`,
          updatedData,
        )
        onEditClose()
        onOpen()
        fetchArticles()
        toast({
          title: 'Article updated successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
      } catch (error) {
        console.error('Error updating article:', error)
        toast({
          title: 'Error updating article',
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
      }
    },
    [selectedArticle, onEditClose, onOpen, fetchArticles, toast],
  )

  const handleAddArticle = useCallback(async () => {
    try {
      await axios.post('/api/admin/articles', newArticle)
      onAddClose()
      fetchArticles()
      toast({
        title: 'Article added successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
      setNewArticle({
        dateTime: '',
        author: 'Rapid Recap Team',
        title: '',
        mainText: '',
        imgURL: [],
        category: 'General',
        avgReadTime: 0,
        url: '',
      })
    } catch (error) {
      console.error('Error adding article:', error)
      toast({
        title: 'Error adding article',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }, [newArticle, onAddClose, fetchArticles, toast])

  const handleDeleteArticle = useCallback(async () => {
    try {
      await axios.delete(`/api/admin/articles/${selectedArticle._id}`)
      setIsDeleteAlertOpen(false)
      onEditClose()
      onOpen()
      fetchArticles()
      toast({
        title: 'Article deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      console.error('Error deleting article:', error)
      toast({
        title: 'Error deleting article',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }, [selectedArticle, onEditClose, onOpen, fetchArticles, toast])

  const memoizedArticleList = useMemo(
    () => (
      <ArticleList
        articles={articles}
        navigate={navigate}
        handleEditArticle={handleEditArticle}
      />
    ),
    [articles, navigate, handleEditArticle],
  )

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalOverlay />
        <ModalContent
          bg="#1a1527"
          backgroundImage="linear-gradient(135deg, #2d2a47 0%, #0e0c16 100%)"
          p={8}
          borderRadius="lg"
          boxShadow="0 10px 30px rgba(0, 0, 0, 0.3)"
          color="white"
          fontFamily="'Roboto', sans-serif"
        >
          <ModalHeader>Article Management</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Button
                colorScheme="blue"
                onClick={() => {
                  onAddOpen()
                  onClose()
                }}
              >
                Add a new article
              </Button>

              <Suspense fallback={<div>Loading filters...</div>}>
                <ArticleFilters
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  filters={filters}
                  setFilters={setFilters}
                  fetchArticles={fetchArticles}
                />
              </Suspense>

              <Suspense fallback={<div>Loading article list...</div>}>
                {memoizedArticleList}
              </Suspense>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Suspense fallback={<div>Loading article form...</div>}>
        <ArticleForm
          isOpen={isEditOpen}
          onClose={onEditClose}
          onManageArticleOpen={onOpen}
          article={selectedArticle}
          setArticle={setSelectedArticle}
          onSubmit={handleUpdateArticle}
          onDeleteAlertOpen={() => setIsDeleteAlertOpen(true)}
        />
      </Suspense>

      <Suspense fallback={<div>Loading article form...</div>}>
        <ArticleForm
          isOpen={isAddOpen}
          onClose={onAddClose}
          onManageArticleOpen={onOpen}
          article={newArticle}
          setArticle={setNewArticle}
          onSubmit={handleAddArticle}
        />
      </Suspense>

      <Suspense fallback={<div>Loading delete alert...</div>}>
        <DeleteArticleAlert
          isOpen={isDeleteAlertOpen}
          cancelRef={cancelRef}
          onClose={() => setIsDeleteAlertOpen(false)}
          onConfirm={handleDeleteArticle}
        />
      </Suspense>
    </>
  )
}

export default ArticleManagement
