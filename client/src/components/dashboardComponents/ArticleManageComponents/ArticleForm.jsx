/* eslint-disable react/prop-types */
/* eslint-disable react/display-name */
import React, { useCallback, useMemo } from 'react'
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
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from '@chakra-ui/react'
import QuizEditor from './QuizEditor'
import { categories } from '../../../assets/Categories'

const ArticleForm = React.memo(
  ({
    isOpen,
    onClose,
    article,
    setArticle,
    onSubmit,
    onManageArticleOpen,
    onDeleteAlertOpen,
  }) => {
    const handleClose = useCallback(() => {
      onClose()
      onManageArticleOpen()
    }, [onClose, onManageArticleOpen])

    const handleSubmit = useCallback(() => {
      onSubmit(article)
      onManageArticleOpen()
    }, [article, onSubmit, onManageArticleOpen])

    const handleInputChange = useCallback(
      field => e => {
        setArticle(prevArticle => ({ ...prevArticle, [field]: e.target.value }))
      },
      [setArticle],
    )

    const handleNumberInputChange = useCallback(
      field => value => {
        setArticle(prevArticle => ({ ...prevArticle, [field]: Number(value) }))
      },
      [setArticle],
    )

    const handleImageURLChange = useCallback(
      e => {
        setArticle(prevArticle => ({
          ...prevArticle,
          imgURL: e.target.value.split(', '),
        }))
      },
      [setArticle],
    )

    const memoizedCategoryOptions = useMemo(
      () =>
        categories.map(
          category =>
            category !== 'all' && (
              <option
                key={category}
                value={category}
                style={{ background: '#1a1527' }}
              >
                {category}
              </option>
            ),
        ),
      [],
    )

    return (
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        size="xl"
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
          <ModalHeader>
            {article?._id ? 'Edit Article' : 'Add New Article'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={6} align="stretch">
              <FormControl>
                <FormLabel>Date and Time</FormLabel>
                <Input
                  type="datetime-local"
                  value={article?.dateTime}
                  onChange={handleInputChange('dateTime')}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Author</FormLabel>
                <Input
                  value={article?.author}
                  onChange={handleInputChange('author')}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Title</FormLabel>
                <Input
                  value={article?.title}
                  onChange={handleInputChange('title')}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Main Text</FormLabel>
                <Textarea
                  value={article?.mainText}
                  onChange={handleInputChange('mainText')}
                  minHeight="200px"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Image URL</FormLabel>
                <Input
                  value={article?.imgURL.join(', ')}
                  onChange={handleImageURLChange}
                  placeholder="Enter comma-separated URLs"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Category</FormLabel>
                <Select
                  value={article?.category}
                  onChange={handleInputChange('category')}
                >
                  {memoizedCategoryOptions}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Average Read Time (minutes)</FormLabel>
                <NumberInput
                  value={article?.avgReadTime}
                  onChange={handleNumberInputChange('avgReadTime')}
                  min={0}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              {article?._id && (
                <QuizEditor article={article} setArticle={setArticle} />
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            {article?._id && (
              <Button colorScheme="red" mr={3} onClick={onDeleteAlertOpen}>
                Delete Article
              </Button>
            )}
            <Button colorScheme="blue" mr={3} onClick={handleSubmit}>
              {article?._id ? 'Save Changes' : 'Add Article'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    )
  },
)

export default ArticleForm
