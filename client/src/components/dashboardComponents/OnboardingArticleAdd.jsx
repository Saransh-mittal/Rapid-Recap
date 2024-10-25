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
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useToast,
  Box,
  Switch,
} from '@chakra-ui/react'
import axios from 'axios'
import { onBoardingArticlePlaceholder } from '../../assets/onBoardingArticlePlaceholder.js'

const initialArticleState = {
  dateTime: new Date().toISOString(),
  author: '',
  hindiAuthor: '',
  title: '',
  hindiTitle: '',
  mainText: '',
  hindiMainText: [''],
  imgURL: '',
  avgReadTime: '',
  category: 'onBoardingArticle',
}

const initialQuizzesState = [
  {
    overAllDifficulty: '0.50',
    language: 'en',
    para1: {
      questions: [
        {
          question: '',
          options: { a: '', b: '', c: '', d: '' },
          answer: '',
          explanation: '',
          difficulty: '0.50',
        },
      ],
    },
  },
  {
    overAllDifficulty: '0.50',
    language: 'hi',
    para1: {
      questions: [
        {
          question: '',
          options: { a: '', b: '', c: '', d: '' },
          answer: '',
          explanation: '',
          difficulty: '0.50',
        },
      ],
    },
  },
]

const OnboardingArticleAdd = ({ isOpen, onClose, article }) => {
  const [useJsonInput, setUseJsonInput] = useState(false)
  const [jsonData, setJsonData] = useState('')
  const [articleData, setArticleData] = useState(initialArticleState)
  const [quizzes, setQuizzes] = useState(initialQuizzesState)

  const toast = useToast()

  useEffect(() => {
    if (isOpen) {
      if (article) {
        setArticleData(article)
        setQuizzes(article.quiz || initialQuizzesState)
        setJsonData(JSON.stringify({ article, quizzes: article.quiz }, null, 2))
      } else {
        resetForm()
      }
    }
  }, [isOpen, article])

  const resetForm = () => {
    setArticleData(initialArticleState)
    setQuizzes(initialQuizzesState)
    setJsonData('')
    setUseJsonInput(false)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleArticleChange = e => {
    const { name, value } = e.target
    setArticleData(prev => ({ ...prev, [name]: value }))
  }

  const handleHindiMainTextChange = (index, value) => {
    setArticleData(prev => ({
      ...prev,
      hindiMainText: prev.hindiMainText.map((text, i) =>
        i === index ? value : text,
      ),
    }))
  }

  const addHindiParagraph = () => {
    setArticleData(prev => ({
      ...prev,
      hindiMainText: [...prev.hindiMainText, ''],
    }))
  }

  const handleQuizChange = (lang, index, field, value) => {
    setQuizzes(prev =>
      prev.map(quiz =>
        quiz.language === lang
          ? {
              ...quiz,
              para1: {
                ...quiz.para1,
                questions: quiz.para1.questions.map((q, i) =>
                  i === index ? { ...q, [field]: value } : q,
                ),
              },
            }
          : quiz,
      ),
    )
  }

  const handleOptionChange = (lang, index, option, value) => {
    setQuizzes(prev =>
      prev.map(quiz =>
        quiz.language === lang
          ? {
              ...quiz,
              para1: {
                ...quiz.para1,
                questions: quiz.para1.questions.map((q, i) =>
                  i === index
                    ? { ...q, options: { ...q.options, [option]: value } }
                    : q,
                ),
              },
            }
          : quiz,
      ),
    )
  }

  const handleOverallDifficultyChange = (lang, value) => {
    setQuizzes(prev =>
      prev.map(quiz =>
        quiz.language === lang ? { ...quiz, overAllDifficulty: value } : quiz,
      ),
    )
  }

  const addQuestion = lang => {
    setQuizzes(prev =>
      prev.map(quiz =>
        quiz.language === lang
          ? {
              ...quiz,
              para1: {
                ...quiz.para1,
                questions: [
                  ...quiz.para1.questions,
                  {
                    question: '',
                    options: { a: '', b: '', c: '', d: '' },
                    answer: '',
                    explanation: '',
                    difficulty: '0.50',
                  },
                ],
              },
            }
          : quiz,
      ),
    )
  }

  const handleJsonChange = e => {
    setJsonData(e.target.value)
  }

  const handleSubmit = async () => {
    try {
      let data
      if (useJsonInput) {
        data = JSON.parse(jsonData)
      } else {
        data = {
          article: articleData,
          quizzes: quizzes,
        }
      }

      let response
      if (article) {
        response = await axios.put(
          `/api/admin/onboarding-article/${article._id}`,
          data,
        )
      } else {
        response = await axios.post('/api/admin/onboarding-article', data)
      }

      if (response.data.success) {
        toast({
          title: article
            ? 'Article updated successfully'
            : 'Article added successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
        handleClose()
      }
    } catch (error) {
      console.error('Error saving onboarding article:', error)
      toast({
        title: 'Error saving article',
        description: error.response?.data?.message || 'An error occurred',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="xl"
      scrollBehavior="inside"
    >
      <ModalOverlay />
      <ModalContent maxWidth="90vw" maxHeight="90vh">
        <ModalHeader>
          {article ? 'Edit Onboarding Article' : 'Add Onboarding Article'}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody maxWidth="90vw" maxHeight="90vh">
          <FormControl display="flex" alignItems="center" mb={4}>
            <FormLabel htmlFor="json-switch" mb="0">
              Use JSON Input
            </FormLabel>
            <Switch
              id="json-switch"
              isChecked={useJsonInput}
              onChange={e => setUseJsonInput(e.target.checked)}
            />
          </FormControl>

          {useJsonInput ? (
            <Textarea
              value={jsonData}
              onChange={handleJsonChange}
              height="500px"
              placeholder={onBoardingArticlePlaceholder}
            />
          ) : (
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel>Title</FormLabel>
                <Input
                  name="title"
                  value={articleData.title}
                  onChange={handleArticleChange}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Hindi Title</FormLabel>
                <Input
                  name="hindiTitle"
                  value={articleData.hindiTitle}
                  onChange={handleArticleChange}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Author</FormLabel>
                <Input
                  name="author"
                  value={articleData.author}
                  onChange={handleArticleChange}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Hindi Author</FormLabel>
                <Input
                  name="hindiAuthor"
                  value={articleData.hindiAuthor}
                  onChange={handleArticleChange}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Main Text</FormLabel>
                <Textarea
                  name="mainText"
                  value={articleData.mainText}
                  onChange={handleArticleChange}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Hindi Main Text</FormLabel>
                {articleData.hindiMainText.map((text, index) => (
                  <Textarea
                    key={index}
                    value={text}
                    onChange={e =>
                      handleHindiMainTextChange(index, e.target.value)
                    }
                    mb={2}
                  />
                ))}
                <Button onClick={addHindiParagraph} size="sm">
                  Add Paragraph
                </Button>
              </FormControl>
              <FormControl>
                <FormLabel>Image URL</FormLabel>
                <Input
                  name="imgURL"
                  value={articleData.imgURL}
                  onChange={handleArticleChange}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Average Read Time (minutes)</FormLabel>
                <Input
                  name="avgReadTime"
                  type="number"
                  value={articleData.avgReadTime}
                  onChange={handleArticleChange}
                />
              </FormControl>

              <Tabs>
                <TabList>
                  <Tab>English Quiz</Tab>
                  <Tab>Hindi Quiz</Tab>
                </TabList>
                <TabPanels>
                  {['en', 'hi'].map(lang => (
                    <TabPanel key={lang}>
                      <FormControl>
                        <FormLabel>Overall Difficulty</FormLabel>
                        <Input
                          type="number"
                          step="0.01"
                          min="0.01"
                          max="0.99"
                          value={
                            quizzes.find(q => q.language === lang)
                              .overAllDifficulty
                          }
                          onChange={e =>
                            handleOverallDifficultyChange(lang, e.target.value)
                          }
                        />
                      </FormControl>
                      {quizzes
                        .find(q => q.language === lang)
                        .para1.questions.map((question, index) => (
                          <Box
                            key={index}
                            borderWidth={1}
                            borderRadius="lg"
                            p={4}
                            mb={4}
                          >
                            <FormControl>
                              <FormLabel>Question {index + 1}</FormLabel>
                              <Input
                                value={question.question}
                                onChange={e =>
                                  handleQuizChange(
                                    lang,
                                    index,
                                    'question',
                                    e.target.value,
                                  )
                                }
                              />
                            </FormControl>
                            {['a', 'b', 'c', 'd'].map(option => (
                              <FormControl key={option}>
                                <FormLabel>
                                  Option {option.toUpperCase()}
                                </FormLabel>
                                <Input
                                  value={question.options[option]}
                                  onChange={e =>
                                    handleOptionChange(
                                      lang,
                                      index,
                                      option,
                                      e.target.value,
                                    )
                                  }
                                />
                              </FormControl>
                            ))}
                            <FormControl>
                              <FormLabel>Answer</FormLabel>
                              <Input
                                value={question.answer}
                                onChange={e =>
                                  handleQuizChange(
                                    lang,
                                    index,
                                    'answer',
                                    e.target.value,
                                  )
                                }
                              />
                            </FormControl>
                            <FormControl>
                              <FormLabel>Explanation</FormLabel>
                              <Textarea
                                value={question.explanation}
                                onChange={e =>
                                  handleQuizChange(
                                    lang,
                                    index,
                                    'explanation',
                                    e.target.value,
                                  )
                                }
                              />
                            </FormControl>
                            <FormControl>
                              <FormLabel>Difficulty</FormLabel>
                              <Input
                                type="number"
                                step="0.01"
                                min="0.01"
                                max="0.99"
                                value={question.difficulty}
                                onChange={e =>
                                  handleQuizChange(
                                    lang,
                                    index,
                                    'difficulty',
                                    e.target.value,
                                  )
                                }
                              />
                            </FormControl>
                          </Box>
                        ))}
                      <Button onClick={() => addQuestion(lang)}>
                        Add Question
                      </Button>
                    </TabPanel>
                  ))}
                </TabPanels>
              </Tabs>
            </VStack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={handleSubmit}>
            {article ? 'Update' : 'Save'}
          </Button>
          <Button onClick={handleClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default OnboardingArticleAdd
