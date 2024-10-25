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

const OnboardingArticleList = ({
  isOpen,
  onClose,
  setIsAddModalOpen,
  setSelectedArticle,
  articles,
  fetchArticles,
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredArticles, setFilteredArticles] = useState([])
  const [isSearching, setIsSearching] = useState(false)

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
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [searchTerm, articles])

  const handleEdit = article => {
    setSelectedArticle(article)
    setIsAddModalOpen(true)
    onClose()
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
          position: 'top',
          variant: 'solid',
          bg: 'blue.500',
        })
        fetchArticles()
      } catch (error) {
        console.error('Error deleting article:', error)
        toast({
          title: 'Error deleting article',
          status: 'error',
          duration: 3000,
          isClosable: true,
          position: 'top',
          variant: 'solid',
          bg: 'red.500',
        })
      }
    }
  }

  const handleSearchChange = e => {
    setSearchTerm(e.target.value)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={{ base: 'full', md: '5xl' }}>
      <ModalOverlay bg="blackAlpha.700" />
      <ModalContent bg="gray.800" color="whiteAlpha.900">
        <ModalHeader borderBottomWidth="1px" borderColor="whiteAlpha.200">
          Onboarding Articles
        </ModalHeader>
        <ModalCloseButton color="whiteAlpha.800" />
        <ModalBody>
          <VStack spacing={4}>
            <Button
              onClick={() => {
                setSelectedArticle(null)
                setIsAddModalOpen(true)
                onClose()
              }}
              colorScheme="blue"
              size="md"
              width="full"
              maxW="200px"
            >
              Add New Article
            </Button>
            <Input
              placeholder="Search articles by title, Hindi title, author, or Hindi author..."
              value={searchTerm}
              onChange={handleSearchChange}
              bg="gray.700"
              borderColor="whiteAlpha.300"
              _hover={{ borderColor: 'whiteAlpha.400' }}
              _focus={{
                borderColor: 'blue.300',
              }}
              color="whiteAlpha.900"
            />
            {isSearching ? (
              <Center py={8}>
                <Spinner size="xl" color="blue.400" />
              </Center>
            ) : filteredArticles.length > 0 ? (
              <Box overflowX="auto" width="100%">
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th color="whiteAlpha.700" borderColor="whiteAlpha.200">
                        Title
                      </Th>
                      <Th color="whiteAlpha.700" borderColor="whiteAlpha.200">
                        Hindi Title
                      </Th>
                      <Th color="whiteAlpha.700" borderColor="whiteAlpha.200">
                        Author
                      </Th>
                      <Th color="whiteAlpha.700" borderColor="whiteAlpha.200">
                        Actions
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredArticles.map(article => (
                      <Tr
                        key={article._id}
                        _hover={{ bg: 'gray.700' }}
                        transition="background-color 0.2s"
                      >
                        <Td borderColor="whiteAlpha.200">{article.title}</Td>
                        <Td borderColor="whiteAlpha.200">
                          {article.hindiTitle}
                        </Td>
                        <Td borderColor="whiteAlpha.200">{article.author}</Td>
                        <Td borderColor="whiteAlpha.200">
                          <Button
                            colorScheme="blue"
                            size="sm"
                            onClick={() => handleEdit(article)}
                            mr={2}
                          >
                            Edit
                          </Button>
                          <Button
                            colorScheme="red"
                            size="sm"
                            onClick={() => handleDelete(article._id)}
                          >
                            Delete
                          </Button>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            ) : (
              <Box
                p={4}
                bg="gray.700"
                borderRadius="md"
                width="100%"
                textAlign="center"
              >
                <Text color="whiteAlpha.800">
                  No articles found matching your search.
                </Text>
              </Box>
            )}
          </VStack>
        </ModalBody>
        <ModalFooter borderTopWidth="1px" borderColor="whiteAlpha.200">
          <Button
            variant="outline"
            color="whiteAlpha.900"
            borderColor="whiteAlpha.300"
            _hover={{ bg: 'whiteAlpha.100' }}
            onClick={onClose}
          >
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default OnboardingArticleList
