import React, { useState } from 'react'
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
} from '@chakra-ui/react'
import { SearchIcon, EditIcon } from '@chakra-ui/icons'

// Dummy data for articles
const dummyArticles = [
  {
    id: 1,
    title: 'React Hooks',
    author: 'John Doe',
    mainText:
      'React Hooks are a great way to use state and other React features without writing a class.',
  },
  {
    id: 2,
    title: 'CSS Grid',
    author: 'Jane Smith',
    mainText:
      'CSS Grid is a powerful tool for creating complex layouts with ease.',
  },
  {
    id: 3,
    title: 'JavaScript Promises',
    author: 'Bob Johnson',
    mainText:
      'Promises provide a cleaner way to handle asynchronous operations in JavaScript.',
  },
]

const ArticleManagement = ({ isOpen, onClose }) => {
  // const { isOpen, onOpen, onClose } = useDisclosure()
  const [searchTerm, setSearchTerm] = useState('')
  const [articles, setArticles] = useState(dummyArticles)

  const filteredArticles = articles.filter(
    article =>
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.author.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleEditArticle = id => {
    // Placeholder for edit functionality
    console.log(`Editing article with id: ${id}`)
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
                onClick={() => console.log('Searching...')}
              />
            </HStack>

            {filteredArticles.map(article => (
              <Box key={article.id} p={4} borderWidth="1px" borderRadius="md">
                <HStack justify="space-between">
                  <VStack align="start" spacing={0}>
                    <Text fontWeight="bold">{article.title}</Text>
                    <Text fontSize="sm" color="gray.600">
                      by {article.author}
                    </Text>
                  </VStack>
                  <IconButton
                    aria-label="Edit article"
                    icon={<EditIcon />}
                    onClick={() => handleEditArticle(article.id)}
                  />
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
    </Modal>
  )
}

export default ArticleManagement
