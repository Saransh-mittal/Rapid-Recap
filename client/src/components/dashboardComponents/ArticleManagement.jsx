import React, { useState, useEffect } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Text,
  Input,
  VStack,
  HStack,
  Box,
  IconButton,
  useDisclosure,
  Select,
  FormControl,
  FormLabel,
  Textarea,
  useToast,
} from '@chakra-ui/react'
import { SearchIcon, EditIcon, ViewIcon } from '@chakra-ui/icons'
import axios from 'axios'

const ArticleManagement = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [articles, setArticles] = useState([])
  const [filters, setFilters] = useState({
    category: '',
    author: '',
    startDate: '',
    endDate: '',
    hasQuiz: '',
  })
  const [selectedArticle, setSelectedArticle] = useState(null)
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure()
  const toast = useToast()

  useEffect(() => {
    fetchArticles()
  }, [filters])

  const fetchArticles = async () => {
    try {
      const queryParams = new URLSearchParams({
        query: searchTerm,
        ...filters,
      }).toString()
      const response = await axios.get(
        `/api/admin/articles/search?${queryParams}`,
      )
      console.log('Articles:', response)
      const data = response
      setArticles(data)
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

  const handleEditArticle = async id => {
    try {
      const response = await axios.get(`/api/admin/articles/${id}`)
      const articleData = await response.json()
      setSelectedArticle(articleData)
      onEditOpen()
    } catch (error) {
      console.error('Error fetching article details:', error)
      toast({
        title: 'Error fetching article details',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const handleUpdateArticle = async updatedData => {
    try {
      const response = await axios.put(
        `/api/admin/articles/${selectedArticle._id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedData),
        },
      )
      const data = await response.json()
      console.log('Article updated:', data)
      onEditClose()
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
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Article Management</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <Button colorScheme="blue">Add a new article</Button>

            <HStack>
              <Input
                placeholder="Search articles..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <IconButton
                aria-label="Search articles"
                icon={<SearchIcon />}
                onClick={fetchArticles}
              />
            </HStack>

            <HStack>
              <Select
                placeholder="Category"
                value={filters.category}
                onChange={e =>
                  setFilters({ ...filters, category: e.target.value })
                }
              >
                {/* Add category options */}
              </Select>
              <Select
                placeholder="Author"
                value={filters.author}
                onChange={e =>
                  setFilters({ ...filters, author: e.target.value })
                }
              >
                {/* Add author options */}
              </Select>
              <Input
                placeholder="Start Date"
                type="date"
                value={filters.startDate}
                onChange={e =>
                  setFilters({ ...filters, startDate: e.target.value })
                }
              />
              <Input
                placeholder="End Date"
                type="date"
                value={filters.endDate}
                onChange={e =>
                  setFilters({ ...filters, endDate: e.target.value })
                }
              />
              <Select
                placeholder="Has Quiz"
                value={filters.hasQuiz}
                onChange={e =>
                  setFilters({ ...filters, hasQuiz: e.target.value })
                }
              >
                <option value="true">Yes</option>
                <option value="false">No</option>
              </Select>
            </HStack>

            {articles.map(article => (
              <Box key={article._id} p={4} borderWidth="1px" borderRadius="md">
                <HStack justify="space-between">
                  <VStack align="start" spacing={0}>
                    <Text fontWeight="bold">{article.title}</Text>
                    <Text fontSize="sm" color="gray.600">
                      by {article.author}
                    </Text>
                  </VStack>
                  <HStack>
                    <IconButton
                      aria-label="View article"
                      icon={<ViewIcon />}
                      onClick={() => handleEditArticle(article._id)}
                    />
                    <IconButton
                      aria-label="Edit article"
                      icon={<EditIcon />}
                      onClick={() => handleEditArticle(article._id)}
                    />
                  </HStack>
                </HStack>
              </Box>
            ))}
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>

      <Modal isOpen={isEditOpen} onClose={onEditClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Article</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedArticle && (
              <VStack spacing={4} align="stretch">
                <FormControl>
                  <FormLabel>Title</FormLabel>
                  <Input
                    value={selectedArticle.title}
                    onChange={e =>
                      setSelectedArticle({
                        ...selectedArticle,
                        title: e.target.value,
                      })
                    }
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Author</FormLabel>
                  <Input
                    value={selectedArticle.author}
                    onChange={e =>
                      setSelectedArticle({
                        ...selectedArticle,
                        author: e.target.value,
                      })
                    }
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Main Text</FormLabel>
                  <Textarea
                    value={selectedArticle.mainText}
                    onChange={e =>
                      setSelectedArticle({
                        ...selectedArticle,
                        mainText: e.target.value,
                      })
                    }
                  />
                </FormControl>
                {/* Add more fields for quiz, userQuizStatus, etc. */}
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="blue"
              mr={3}
              onClick={() => handleUpdateArticle(selectedArticle)}
            >
              Save Changes
            </Button>
            <Button variant="ghost" onClick={onEditClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Modal>
  )
}

export default ArticleManagement
