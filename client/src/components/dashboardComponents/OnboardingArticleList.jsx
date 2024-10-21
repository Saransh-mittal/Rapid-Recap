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
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Input,
  VStack,
  useToast,
  Box,
  Text,
  Spinner,
  Center,
} from '@chakra-ui/react'
import axios from 'axios'
import OnboardingArticleAdd from './OnboardingArticleAdd'

const OnboardingArticleList = ({ isOpen, onClose }) => {
  const [articles, setArticles] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredArticles, setFilteredArticles] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedArticle, setSelectedArticle] = useState(null)
  const toast = useToast()

  useEffect(() => {
    if (isOpen) {
      fetchArticles()
    }
  }, [isOpen])

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setIsSearching(true)
      const filtered = articles.filter(
        article =>
          article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          article.hindiTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
          article.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
          article.hindiAuthor.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredArticles(filtered)
      setIsSearching(false)
    }, 300) // 300ms delay for debounce

    return () => clearTimeout(delayDebounceFn)
  }, [searchTerm, articles])

  const fetchArticles = async () => {
    try {
      const response = await axios.get('/api/admin/onboarding-articles')
      setArticles(response.data)
      setFilteredArticles(response.data)
    } catch (error) {
      console.error('Error fetching articles:', error)
      toast({
        title: 'Error fetching articles',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const handleEdit = article => {
    setSelectedArticle(article)
    setIsAddModalOpen(true)
  }

  const handleDelete = async id => {
    if (window.confirm('Are you sure you want to delete this article?')) {
      try {
        await axios.delete(`/api/admin/onboarding-article/${id}`)
        toast({
          title: 'Article deleted successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
        fetchArticles()
      } catch (error) {
        console.error('Error deleting article:', error)
        toast({
          title: 'Error deleting article',
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
      }
    }
  }

  const handleSearchChange = e => {
    setSearchTerm(e.target.value)
  }

  const handleAddModalClose = () => {
    setIsAddModalOpen(false)
    setSelectedArticle(null)
    fetchArticles()
  }

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="full">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Onboarding Articles</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Button
                onClick={() => {
                  setSelectedArticle(null)
                  setIsAddModalOpen(true)
                }}
              >
                Add New Article
              </Button>
              <Input
                placeholder="Search articles by title, Hindi title, author, or Hindi author..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
              {isSearching ? (
                <Center py={8}>
                  <Spinner size="xl" />
                </Center>
              ) : filteredArticles.length > 0 ? (
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Title</Th>
                      <Th>Hindi Title</Th>
                      <Th>Author</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredArticles.map(article => (
                      <Tr key={article._id}>
                        <Td>{article.title}</Td>
                        <Td>{article.hindiTitle}</Td>
                        <Td>{article.author}</Td>
                        <Td>
                          <Button onClick={() => handleEdit(article)} mr={2}>
                            Edit
                          </Button>
                          <Button onClick={() => handleDelete(article._id)}>
                            Delete
                          </Button>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              ) : (
                <Box>
                  <Text>No articles found matching your search.</Text>
                </Box>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <OnboardingArticleAdd
        isOpen={isAddModalOpen}
        onClose={handleAddModalClose}
        article={selectedArticle}
      />
    </>
  )
}

export default OnboardingArticleList
