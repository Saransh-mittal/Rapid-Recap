import React, { useState, useEffect, useRef } from 'react'
import {
  Box,
  Heading,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Switch,
  FormHelperText,
  useToast,
  Flex,
  Text,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Tooltip,
  Spinner,
  Alert,
  AlertIcon,
  useDisclosure,
  Stack,
  useMediaQuery,
  useColorModeValue,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Divider,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Code,
  Radio,
  RadioGroup,
} from '@chakra-ui/react'
import {
  AddIcon,
  EditIcon,
  DeleteIcon,
  ChevronDownIcon,
  RepeatIcon,
  LinkIcon,
  ViewIcon,
  ArrowBackIcon,
  PlusSquareIcon,
} from '@chakra-ui/icons'
import axios from 'axios'

const SpecialCategoryManagement = ({ isOpen, onClose: parentOnClose }) => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [formMode, setFormMode] = useState('add') // 'add' or 'edit'
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [articles, setArticles] = useState([])
  const [articlesLoading, setArticlesLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(false)
  const [viewArticles, setViewArticles] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isMobile] = useMediaQuery('(max-width: 768px)')
  const [tempFormData, setTempFormData] = useState(null)
  const [addArticleLoading, setAddArticleLoading] = useState(false)

  // Article form states
  const [addArticleMethod, setAddArticleMethod] = useState('form') // 'form' or 'json'
  const [articleJsonInput, setArticleJsonInput] = useState(
    '[\n  {\n    "title": "Sample Article",\n    "mainText": "Article content goes here...",\n    "author": "Author Name",\n    "imgURL": ["https://example.com/image.jpg"]\n  }\n]',
  )
  const [articleFormData, setArticleFormData] = useState({
    title: '',
    mainText: '',
    author: 'Rapid Recap Team',
    imgURL: '',
    dateTime: new Date().toISOString().slice(0, 10),
  })

  const mainModalRef = useRef(null)
  const toast = useToast()

  // Main modal state
  const {
    isOpen: isMainModalOpen,
    onOpen: onMainModalOpen,
    onClose: onMainModalClose,
  } = useDisclosure({
    isOpen,
    onOpen: () => {},
    onClose: parentOnClose,
  })

  // Form modal state - separate from main modal
  const {
    isOpen: isFormOpen,
    onOpen: onFormOpen,
    onClose: onFormClose,
  } = useDisclosure()

  // Add Article modal
  const {
    isOpen: isAddArticleOpen,
    onOpen: onAddArticleOpen,
    onClose: onAddArticleClose,
  } = useDisclosure()

  // Store view state before opening form
  const [storedViewState, setStoredViewState] = useState({
    viewArticles: false,
    selectedCategory: null,
  })

  // Track if we need to refresh after form submission
  const [shouldRefresh, setShouldRefresh] = useState(false)

  // Dark theme colors
  const bgColor = useColorModeValue('gray.700', 'gray.800')
  const cardBgColor = useColorModeValue('gray.600', 'gray.700')
  const textColor = useColorModeValue('gray.100', 'white')
  const borderColor = useColorModeValue('gray.600', 'gray.500')
  const hoverBgColor = useColorModeValue('gray.500', 'gray.600')
  const buttonColorScheme = 'purple'

  const [formData, setFormData] = useState({
    name: '',
    key: '',
    description: '',
    icon: '🔥',
    startDate: '',
    endDate: '',
    isActive: true,
    apiEndpoint: '',
    apiKey: '',
    queryParams: '',
    badgeColor: 'purple.500',
    displayOrder: 0,
  })

  // Update our local isOpen state when the parent's isOpen changes
  useEffect(() => {
    if (isOpen && !isMainModalOpen) {
      onMainModalOpen()
    } else if (!isOpen && isMainModalOpen) {
      onMainModalClose()
    }
  }, [isOpen, isMainModalOpen])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      // Since we're in the admin panel, we should use the admin endpoint
      const response = await axios.get('/api/admin/special-categories/all')
      setCategories(response.data)
    } catch (error) {
      toast({
        title: 'Error fetching special categories',
        description: error.response?.data?.message || error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  // Function to fetch category articles
  const fetchCategoryArticles = async (categoryId, page = 1) => {
    try {
      setArticlesLoading(true)
      // Use the admin endpoint for articles
      const response = await axios.get(
        `/api/admin/special-categories/${categoryId}/articles`,
        {
          params: { page, limit: 10 },
        },
      )
      setArticles(response.data.articles)
      setTotalPages(response.data.totalPages)
      setCurrentPage(response.data.currentPage)
    } catch (error) {
      toast({
        title: 'Error fetching articles',
        description: error.response?.data?.message || error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setArticlesLoading(false)
    }
  }

  useEffect(() => {
    if (isMainModalOpen) {
      fetchCategories()
    }
  }, [isMainModalOpen])

  // If we need to refresh data after form submission
  useEffect(() => {
    if (shouldRefresh) {
      fetchCategories()

      // If we were viewing articles, refresh those too
      if (storedViewState.viewArticles && storedViewState.selectedCategory) {
        setViewArticles(true)
        setSelectedCategory(storedViewState.selectedCategory)
        fetchCategoryArticles(storedViewState.selectedCategory._id)
      }

      setShouldRefresh(false)
    }
  }, [shouldRefresh])

  const handleAddCategory = () => {
    setFormMode('add')
    setTempFormData({
      name: '',
      key: '',
      description: '',
      icon: '🔥',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 1))
        .toISOString()
        .split('T')[0],
      isActive: true,
      apiEndpoint: '',
      apiKey: '',
      queryParams: '',
      badgeColor: 'purple.500',
      displayOrder: 0,
    })

    // Store current view state
    setStoredViewState({
      viewArticles,
      selectedCategory,
    })

    // Close main modal and open form modal
    onMainModalClose()
    setTimeout(() => {
      onFormOpen()
    }, 100)
  }

  const handleEditCategory = category => {
    setFormMode('edit')
    setSelectedCategory(category)

    // Parse queryParams from object to string
    let queryParamsStr = ''
    if (category.apiConfig?.queryParams) {
      queryParamsStr = Object.entries(category.apiConfig.queryParams)
        .map(([key, value]) => `${key}=${value}`)
        .join('&')
    }

    // Store form data
    setTempFormData({
      name: category.name,
      key: category.key,
      description: category.description,
      icon: category.icon,
      startDate: new Date(category.startDate).toISOString().split('T')[0],
      endDate: new Date(category.endDate).toISOString().split('T')[0],
      isActive: category.isActive,
      apiEndpoint: category.apiEndpoint || '',
      apiKey: category.apiConfig?.apiKey || '',
      queryParams: queryParamsStr,
      badgeColor: category.badgeColor || 'purple.500',
      displayOrder: category.displayOrder || 0,
    })

    // Store current view state
    setStoredViewState({
      viewArticles,
      selectedCategory,
    })

    // Close main modal and open form modal
    onMainModalClose()
    setTimeout(() => {
      onFormOpen()
    }, 100)
  }

  const handleViewArticles = category => {
    setSelectedCategory(category)
    setViewArticles(true)
    fetchCategoryArticles(category._id)
  }

  const handleAddArticles = category => {
    setSelectedCategory(category)

    // Reset article form data
    setArticleFormData({
      title: '',
      mainText: '',
      author: 'Rapid Recap Team',
      imgURL: '',
      dateTime: new Date().toISOString().slice(0, 10),
    })

    // Reset JSON input
    setArticleJsonInput(
      '[\n  {\n    "title": "Sample Article",\n    "mainText": "Article content goes here...",\n    "author": "Author Name",\n    "imgURL": ["https://example.com/image.jpg"]\n  }\n]',
    )

    // Set default method
    setAddArticleMethod('form')

    // Store current view state
    setStoredViewState({
      viewArticles,
      selectedCategory,
    })

    // Close main modal and open add article modal
    onMainModalClose()
    setTimeout(() => {
      onAddArticleOpen()
    }, 100)
  }

  // Fetch articles from API
  const handleFetchArticles = async category => {
    try {
      setFetchLoading(true)
      // Use admin endpoint
      const response = await axios.post(
        `/api/admin/special-categories/${category._id}/fetch`,
      )
      toast({
        title: 'Articles fetched',
        description: `Successfully fetched ${response.data.articlesAdded} articles.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
      fetchCategories()
    } catch (error) {
      toast({
        title: 'Error fetching articles',
        description: error.response?.data?.message || error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setFetchLoading(false)
    }
  }

  const handleInputChange = e => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleArticleFormChange = e => {
    const { name, value } = e.target
    setArticleFormData({
      ...articleFormData,
      [name]: value,
    })
  }

  const handleSwitchChange = e => {
    setFormData({
      ...formData,
      isActive: e.target.checked,
    })
  }

  const handleNumberChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleFormOpen = () => {
    // Set form data from temp storage
    if (tempFormData) {
      setFormData(tempFormData)
      setTempFormData(null)
    }
  }

  // Create category
  const handleSubmit = async () => {
    try {
      // Parse queryParams from string to object
      const queryParamsObj = {}
      if (formData.queryParams) {
        formData.queryParams.split('&').forEach(param => {
          const [key, value] = param.split('=')
          if (key && value) queryParamsObj[key] = value
        })
      }

      const payload = {
        name: formData.name,
        key: formData.key,
        description: formData.description,
        icon: formData.icon,
        startDate: formData.startDate,
        endDate: formData.endDate,
        isActive: formData.isActive,
        apiEndpoint: formData.apiEndpoint,
        apiConfig: {
          apiKey: formData.apiKey,
          queryParams: queryParamsObj,
        },
        badgeColor: formData.badgeColor,
        displayOrder: parseInt(formData.displayOrder),
      }

      if (formMode === 'add') {
        // Use admin endpoint
        await axios.post('/api/admin/special-categories', payload)
        toast({
          title: 'Category created',
          description: 'The special category has been created successfully.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        })
      } else {
        // Use admin endpoint
        await axios.put(
          `/api/admin/special-categories/${selectedCategory._id}`,
          payload,
        )
        toast({
          title: 'Category updated',
          description: 'The special category has been updated successfully.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        })
      }

      // Close form and set flag to refresh data
      handleFormClose(true)
    } catch (error) {
      toast({
        title: `Error ${formMode === 'add' ? 'creating' : 'updating'} category`,
        description: error.response?.data?.message || error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }

  // Delete category
  const handleDeleteCategory = async category => {
    if (
      window.confirm(
        `Are you sure you want to delete the "${category.name}" category?`,
      )
    ) {
      try {
        // Use admin endpoint
        await axios.delete(`/api/admin/special-categories/${category._id}`)
        toast({
          title: 'Category deleted',
          description: 'The special category has been deleted successfully.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        })
        fetchCategories()
      } catch (error) {
        toast({
          title: 'Error deleting category',
          description: error.response?.data?.message || error.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      }
    }
  }

  // Function to submit articles - update to use the public batch endpoint
  const handleSubmitArticles = async () => {
    try {
      setAddArticleLoading(true)

      let articles = []

      if (addArticleMethod === 'form') {
        // Process form data
        const formArticle = {
          title: articleFormData.title,
          mainText: articleFormData.mainText,
          author: articleFormData.author || 'Rapid Recap Team',
          dateTime: new Date(articleFormData.dateTime).toISOString(),
          imgURL: [articleFormData.imgURL],
          category: selectedCategory.key,
        }

        articles = [formArticle]
      } else {
        // Process JSON data
        try {
          const parsedArticles = JSON.parse(articleJsonInput)

          if (!Array.isArray(parsedArticles)) {
            throw new Error('JSON input must be an array of articles')
          }

          // Add category to each article
          articles = parsedArticles.map(article => ({
            ...article,
            category: selectedCategory.key,
            // Ensure imgURL is array
            imgURL: Array.isArray(article.imgURL)
              ? article.imgURL
              : [article.imgURL],
            // Ensure dateTime is in ISO format
            dateTime: article.dateTime || new Date().toISOString(),
          }))
        } catch (error) {
          toast({
            title: 'Invalid JSON',
            description: error.message,
            status: 'error',
            duration: 5000,
            isClosable: true,
          })
          setAddArticleLoading(false)
          return
        }
      }

      // Submit articles using the public batch endpoint
      const response = await axios.post(
        '/api/admin/special-categories/articles/batch',
        {
          categoryId: selectedCategory._id,
          articles,
        },
      )

      toast({
        title: 'Articles added',
        description: `Successfully added ${response.data.articlesAdded} articles to the category. Highlights are being generated in the background.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      })

      // Close modal and refresh data
      handleAddArticleClose(true)
    } catch (error) {
      toast({
        title: 'Error adding articles',
        description: error.response?.data?.message || error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setAddArticleLoading(false)
    }
  }

  const handleFormClose = (needsRefresh = false) => {
    // Close form modal
    onFormClose()

    // Flag to refresh data when main modal reopens
    if (needsRefresh) {
      setShouldRefresh(true)
    }

    // Reopen main modal after a short delay
    setTimeout(() => {
      onMainModalOpen()
    }, 100)
  }

  const handleAddArticleClose = (needsRefresh = false) => {
    // Close add article modal
    onAddArticleClose()

    // Flag to refresh data when main modal reopens
    if (needsRefresh) {
      setShouldRefresh(true)
    }

    // Reopen main modal after a short delay
    setTimeout(() => {
      onMainModalOpen()
    }, 100)
  }

  const handleBackToCategories = () => {
    setViewArticles(false)
    setSelectedCategory(null)
    setArticles([])
  }

  const handlePageChange = newPage => {
    setCurrentPage(newPage)
    fetchCategoryArticles(selectedCategory._id, newPage)
  }

  // Mobile friendly category card
  const CategoryCard = ({ category }) => (
    <Card
      bg={cardBgColor}
      color={textColor}
      mb={4}
      borderColor={borderColor}
      borderWidth="1px"
    >
      <CardHeader pb={2}>
        <Flex justify="space-between" align="center">
          <Flex align="center">
            <Text fontSize="lg" mr={2}>
              {category.icon}
            </Text>
            <Heading size="md">{category.name}</Heading>
          </Flex>
          <Badge
            colorScheme={category.isActive ? 'green' : 'red'}
            fontSize="xs"
          >
            {category.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </Flex>
      </CardHeader>

      <CardBody py={2}>
        <Text fontSize="sm" mb={3} opacity={0.9}>
          Key: {category.key}
        </Text>
        <Flex justify="space-between" mb={2}>
          <Text fontSize="sm">
            {new Date(category.startDate).toLocaleDateString()} -{' '}
            {new Date(category.endDate).toLocaleDateString()}
          </Text>
          {category.apiEndpoint ? (
            <Badge colorScheme="blue" fontSize="xs">
              API Configured
            </Badge>
          ) : (
            <Badge colorScheme="gray" fontSize="xs">
              No API
            </Badge>
          )}
        </Flex>
      </CardBody>

      <CardFooter pt={0}>
        <Flex width="100%" justify="space-between" wrap="wrap" gap={2}>
          <Button
            size="sm"
            leftIcon={<EditIcon />}
            onClick={() => handleEditCategory(category)}
            colorScheme={buttonColorScheme}
            variant="outline"
          >
            Edit
          </Button>

          <Button
            size="sm"
            leftIcon={<ViewIcon />}
            onClick={() => handleViewArticles(category)}
            colorScheme={buttonColorScheme}
            variant="outline"
          >
            Articles
          </Button>

          <Button
            size="sm"
            leftIcon={<PlusSquareIcon />}
            onClick={() => handleAddArticles(category)}
            colorScheme="green"
            variant="outline"
          >
            Add Articles
          </Button>

          {category.apiEndpoint && (
            <Button
              size="sm"
              leftIcon={<RepeatIcon />}
              onClick={() => handleFetchArticles(category)}
              isDisabled={fetchLoading}
              colorScheme="blue"
              variant="outline"
            >
              Fetch
            </Button>
          )}

          <IconButton
            size="sm"
            icon={<DeleteIcon />}
            onClick={() => handleDeleteCategory(category)}
            colorScheme="red"
            variant="outline"
            aria-label="Delete category"
          />
        </Flex>
      </CardFooter>
    </Card>
  )

  // Mobile friendly article card
  const ArticleCard = ({ article }) => (
    <Card
      bg={cardBgColor}
      color={textColor}
      mb={4}
      borderColor={borderColor}
      borderWidth="1px"
    >
      <CardHeader pb={2}>
        <Heading size="sm" noOfLines={2}>
          {article.title}
        </Heading>
      </CardHeader>

      <CardBody py={2}>
        <Text fontSize="sm" mb={2}>
          Date: {new Date(article.dateTime).toLocaleDateString()}
        </Text>
      </CardBody>

      <CardFooter pt={0}>
        <Button
          size="sm"
          leftIcon={<ViewIcon />}
          onClick={() => window.open(`/article/${article._id}`, '_blank')}
          colorScheme={buttonColorScheme}
          variant="outline"
          width="100%"
        >
          View Article
        </Button>
      </CardFooter>
    </Card>
  )

  return (
    <>
      {/* Main Categories Modal */}
      <Modal
        isOpen={isMainModalOpen}
        onClose={onMainModalClose}
        size="xl"
        scrollBehavior="outside"
        isCentered
      >
        <ModalOverlay bg="blackAlpha.800" />
        <ModalContent
          maxWidth={{ base: '95vw', md: '90vw', lg: '80vw' }}
          bg={bgColor}
          color={textColor}
          ref={mainModalRef}
          minH={{ base: '70vh', md: 'unset' }}
        >
          <ModalHeader>
            {viewArticles
              ? `Articles in "${selectedCategory?.name}" Category`
              : 'Special Categories Management'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {viewArticles ? (
              <Box>
                <Button
                  leftIcon={<ArrowBackIcon />}
                  colorScheme={buttonColorScheme}
                  variant="outline"
                  mb={4}
                  onClick={handleBackToCategories}
                >
                  Back to Categories
                </Button>

                <Button
                  leftIcon={<PlusSquareIcon />}
                  colorScheme="green"
                  mb={4}
                  ml={4}
                  onClick={() => handleAddArticles(selectedCategory)}
                >
                  Add Articles
                </Button>

                {articlesLoading ? (
                  <Flex justify="center" align="center" minH="200px">
                    <Spinner size="xl" color="purple.400" />
                  </Flex>
                ) : articles.length === 0 ? (
                  <Alert status="info" variant="solid" bg="blue.600">
                    <AlertIcon />
                    No articles found for this category.
                  </Alert>
                ) : (
                  <Box>
                    {isMobile ? (
                      <Stack spacing={4}>
                        {articles.map(article => (
                          <ArticleCard key={article._id} article={article} />
                        ))}
                      </Stack>
                    ) : (
                      <Box overflowX="auto">
                        <Table variant="simple" size="sm">
                          <Thead>
                            <Tr>
                              <Th color="gray.300">Title</Th>
                              <Th color="gray.300">Date</Th>
                              <Th color="gray.300">Actions</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {articles.map(article => (
                              <Tr
                                key={article._id}
                                _hover={{ bg: hoverBgColor }}
                              >
                                <Td>{article.title}</Td>
                                <Td>
                                  {new Date(
                                    article.dateTime,
                                  ).toLocaleDateString()}
                                </Td>
                                <Td>
                                  <Tooltip label="View Article">
                                    <IconButton
                                      icon={<ViewIcon />}
                                      size="sm"
                                      mr={2}
                                      aria-label="View article"
                                      onClick={() =>
                                        window.open(
                                          `/article/${article._id}`,
                                          '_blank',
                                        )
                                      }
                                      colorScheme={buttonColorScheme}
                                    />
                                  </Tooltip>
                                </Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </Box>
                    )}

                    {/* Pagination */}
                    <Flex justify="center" mt={4}>
                      <Button
                        isDisabled={currentPage === 1}
                        onClick={() => handlePageChange(currentPage - 1)}
                        mr={2}
                        size={isMobile ? 'sm' : 'md'}
                        colorScheme={buttonColorScheme}
                        variant="outline"
                      >
                        Previous
                      </Button>
                      <Text alignSelf="center" mx={2} color={textColor}>
                        Page {currentPage} of {totalPages}
                      </Text>
                      <Button
                        isDisabled={currentPage === totalPages}
                        onClick={() => handlePageChange(currentPage + 1)}
                        ml={2}
                        size={isMobile ? 'sm' : 'md'}
                        colorScheme={buttonColorScheme}
                        variant="outline"
                      >
                        Next
                      </Button>
                    </Flex>
                  </Box>
                )}
              </Box>
            ) : (
              <Box>
                <Button
                  leftIcon={<AddIcon />}
                  colorScheme={buttonColorScheme}
                  mb={4}
                  onClick={handleAddCategory}
                  width={{ base: '100%', md: 'auto' }}
                >
                  Add Special Category
                </Button>

                {loading ? (
                  <Flex justify="center" align="center" minH="200px">
                    <Spinner size="xl" color="purple.400" />
                  </Flex>
                ) : categories.length === 0 ? (
                  <Alert status="info" variant="solid" bg="blue.600">
                    <AlertIcon />
                    No special categories found. Create one to get started.
                  </Alert>
                ) : isMobile ? (
                  <Stack spacing={4}>
                    {categories.map(category => (
                      <CategoryCard key={category._id} category={category} />
                    ))}
                  </Stack>
                ) : (
                  <Box overflowX="auto">
                    <Table variant="simple" size="sm" colorScheme="whiteAlpha">
                      <Thead>
                        <Tr>
                          <Th color="gray.300">Name</Th>
                          <Th color="gray.300">Key</Th>
                          <Th color="gray.300">Status</Th>
                          <Th color="gray.300">Date Range</Th>
                          <Th color="gray.300">API</Th>
                          <Th color="gray.300">Actions</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {categories.map(category => (
                          <Tr key={category._id} _hover={{ bg: hoverBgColor }}>
                            <Td>
                              <Flex align="center">
                                <Text mr={2}>{category.icon}</Text>
                                {category.name}
                              </Flex>
                            </Td>
                            <Td>{category.key}</Td>
                            <Td>
                              <Badge
                                colorScheme={
                                  category.isActive ? 'green' : 'red'
                                }
                              >
                                {category.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </Td>
                            <Td>
                              {new Date(
                                category.startDate,
                              ).toLocaleDateString()}{' '}
                              -{' '}
                              {new Date(category.endDate).toLocaleDateString()}
                            </Td>
                            <Td>
                              {category.apiEndpoint ? (
                                <Badge colorScheme="blue">Configured</Badge>
                              ) : (
                                <Badge colorScheme="gray">None</Badge>
                              )}
                            </Td>
                            <Td>
                              <Menu>
                                <MenuButton
                                  as={Button}
                                  rightIcon={<ChevronDownIcon />}
                                  size="sm"
                                  colorScheme={buttonColorScheme}
                                >
                                  Actions
                                </MenuButton>
                                <MenuList bg="gray.700" borderColor="gray.600">
                                  <MenuItem
                                    icon={<EditIcon />}
                                    onClick={() => handleEditCategory(category)}
                                    _hover={{ bg: 'gray.600' }}
                                  >
                                    Edit
                                  </MenuItem>
                                  <MenuItem
                                    icon={<ViewIcon />}
                                    onClick={() => handleViewArticles(category)}
                                    _hover={{ bg: 'gray.600' }}
                                  >
                                    View Articles
                                  </MenuItem>
                                  <MenuItem
                                    icon={<PlusSquareIcon />}
                                    onClick={() => handleAddArticles(category)}
                                    _hover={{ bg: 'gray.600' }}
                                  >
                                    Add Articles
                                  </MenuItem>
                                  {category.apiEndpoint && (
                                    <MenuItem
                                      icon={<RepeatIcon />}
                                      onClick={() =>
                                        handleFetchArticles(category)
                                      }
                                      isDisabled={fetchLoading}
                                      _hover={{ bg: 'gray.600' }}
                                    >
                                      Fetch New Articles
                                    </MenuItem>
                                  )}
                                  <MenuItem
                                    icon={<DeleteIcon />}
                                    onClick={() =>
                                      handleDeleteCategory(category)
                                    }
                                    color="red.300"
                                    _hover={{ bg: 'red.800' }}
                                  >
                                    Delete
                                  </MenuItem>
                                </MenuList>
                              </Menu>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </Box>
                )}
              </Box>
            )}
          </ModalBody>

          <ModalFooter>
            <Button colorScheme={buttonColorScheme} onClick={onMainModalClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Form Modal for Add/Edit - Completely separate */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => handleFormClose()}
        size="lg"
        scrollBehavior="inside"
        onOpen={handleFormOpen}
        isCentered
      >
        <ModalOverlay
          bg="blackAlpha.800"
          css={{ backdropFilter: 'blur(10px)' }}
        />
        <ModalContent bg={bgColor} color={textColor}>
          <ModalHeader>
            {formMode === 'add'
              ? 'Add Special Category'
              : 'Edit Special Category'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={4} isRequired>
              <FormLabel>Name</FormLabel>
              <Input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="E.g. IPL 2025"
                bg="gray.600"
                borderColor="gray.500"
                _hover={{ borderColor: 'gray.400' }}
                _focus={{
                  borderColor: 'purple.500',
                  boxShadow: '0 0 0 1px purple.500',
                }}
              />
            </FormControl>

            <FormControl mb={4} isRequired>
              <FormLabel>Key (URL Slug)</FormLabel>
              <Input
                name="key"
                value={formData.key}
                onChange={handleInputChange}
                placeholder="E.g. ipl"
                isReadOnly={formMode === 'edit'}
                bg="gray.600"
                borderColor="gray.500"
                _hover={{ borderColor: 'gray.400' }}
                _focus={{
                  borderColor: 'purple.500',
                  boxShadow: '0 0 0 1px purple.500',
                }}
              />
              <FormHelperText>
                Lowercase letters, numbers, and hyphens only. This will be used
                in URLs.
              </FormHelperText>
            </FormControl>

            <FormControl mb={4} isRequired>
              <FormLabel>Description</FormLabel>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Brief description of this special category"
                bg="gray.600"
                borderColor="gray.500"
                _hover={{ borderColor: 'gray.400' }}
                _focus={{
                  borderColor: 'purple.500',
                  boxShadow: '0 0 0 1px purple.500',
                }}
              />
            </FormControl>

            <Flex mb={4} gap={4} direction={{ base: 'column', md: 'row' }}>
              <FormControl>
                <FormLabel>Icon (Emoji)</FormLabel>
                <Input
                  name="icon"
                  value={formData.icon}
                  onChange={handleInputChange}
                  placeholder="🔥"
                  bg="gray.600"
                  borderColor="gray.500"
                  _hover={{ borderColor: 'gray.400' }}
                  _focus={{
                    borderColor: 'purple.500',
                    boxShadow: '0 0 0 1px purple.500',
                  }}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Badge Color</FormLabel>
                <Select
                  name="badgeColor"
                  value={formData.badgeColor}
                  onChange={handleInputChange}
                  bg="gray.600"
                  borderColor="gray.500"
                  _hover={{ borderColor: 'gray.400' }}
                  _focus={{
                    borderColor: 'purple.500',
                    boxShadow: '0 0 0 1px purple.500',
                  }}
                >
                  <option value="red.500">Red</option>
                  <option value="orange.500">Orange</option>
                  <option value="yellow.500">Yellow</option>
                  <option value="green.500">Green</option>
                  <option value="teal.500">Teal</option>
                  <option value="blue.500">Blue</option>
                  <option value="cyan.500">Cyan</option>
                  <option value="purple.500">Purple</option>
                  <option value="pink.500">Pink</option>
                </Select>
              </FormControl>
            </Flex>

            <Flex mb={4} gap={4} direction={{ base: 'column', md: 'row' }}>
              <FormControl isRequired>
                <FormLabel>Start Date</FormLabel>
                <Input
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  bg="gray.600"
                  borderColor="gray.500"
                  _hover={{ borderColor: 'gray.400' }}
                  _focus={{
                    borderColor: 'purple.500',
                    boxShadow: '0 0 0 1px purple.500',
                  }}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>End Date</FormLabel>
                <Input
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  bg="gray.600"
                  borderColor="gray.500"
                  _hover={{ borderColor: 'gray.400' }}
                  _focus={{
                    borderColor: 'purple.500',
                    boxShadow: '0 0 0 1px purple.500',
                  }}
                />
              </FormControl>
            </Flex>

            <FormControl mb={4}>
              <FormLabel>Display Order</FormLabel>
              <NumberInput
                min={0}
                max={1000}
                value={formData.displayOrder}
                onChange={(valueAsString, valueAsNumber) =>
                  handleNumberChange('displayOrder', valueAsNumber)
                }
                bg="gray.600"
                borderColor="gray.500"
              >
                <NumberInputField
                  _hover={{ borderColor: 'gray.400' }}
                  _focus={{
                    borderColor: 'purple.500',
                    boxShadow: '0 0 0 1px purple.500',
                  }}
                />
                <NumberInputStepper>
                  <NumberIncrementStepper color="gray.200" />
                  <NumberDecrementStepper color="gray.200" />
                </NumberInputStepper>
              </NumberInput>
              <FormHelperText>
                Higher numbers will appear first in the category list.
              </FormHelperText>
            </FormControl>

            <FormControl display="flex" alignItems="center" mb={6}>
              <FormLabel htmlFor="is-active" mb="0">
                Is Active
              </FormLabel>
              <Switch
                id="is-active"
                isChecked={formData.isActive}
                onChange={handleSwitchChange}
                colorScheme="green"
              />
            </FormControl>

            <Divider my={4} borderColor="gray.600" />

            <Heading size="sm" mb={2}>
              API Configuration (Optional)
            </Heading>

            <FormControl mb={4}>
              <FormLabel>API Endpoint</FormLabel>
              <Input
                name="apiEndpoint"
                value={formData.apiEndpoint}
                onChange={handleInputChange}
                placeholder="https://api.example.com/news"
                bg="gray.600"
                borderColor="gray.500"
                _hover={{ borderColor: 'gray.400' }}
                _focus={{
                  borderColor: 'purple.500',
                  boxShadow: '0 0 0 1px purple.500',
                }}
              />
              <FormHelperText>
                The endpoint to fetch articles for this category.
              </FormHelperText>
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>API Key</FormLabel>
              <Input
                name="apiKey"
                value={formData.apiKey}
                onChange={handleInputChange}
                placeholder="your-api-key"
                type="password"
                bg="gray.600"
                borderColor="gray.500"
                _hover={{ borderColor: 'gray.400' }}
                _focus={{
                  borderColor: 'purple.500',
                  boxShadow: '0 0 0 1px purple.500',
                }}
              />
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>Query Parameters</FormLabel>
              <Input
                name="queryParams"
                value={formData.queryParams}
                onChange={handleInputChange}
                placeholder="q=IPL&category=sports&language=en"
                bg="gray.600"
                borderColor="gray.500"
                _hover={{ borderColor: 'gray.400' }}
                _focus={{
                  borderColor: 'purple.500',
                  boxShadow: '0 0 0 1px purple.500',
                }}
              />
              <FormHelperText>
                Format: param1=value1&param2=value2
              </FormHelperText>
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button
              variant="outline"
              mr={3}
              onClick={() => handleFormClose()}
              borderColor="gray.500"
              _hover={{ bg: 'gray.600' }}
            >
              Cancel
            </Button>
            <Button colorScheme="purple" onClick={handleSubmit}>
              {formMode === 'add' ? 'Create' : 'Update'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Add Articles Modal */}
      <Modal
        isOpen={isAddArticleOpen}
        onClose={() => handleAddArticleClose()}
        size="xl"
        scrollBehavior="inside"
        isCentered
      >
        <ModalOverlay
          bg="blackAlpha.800"
          css={{ backdropFilter: 'blur(10px)' }}
        />
        <ModalContent bg={bgColor} color={textColor} maxHeight="90vh">
          <ModalHeader>Add Articles to {selectedCategory?.name}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Tabs isFitted variant="enclosed" colorScheme={buttonColorScheme}>
              <TabList mb="1em">
                <Tab
                  _selected={{ bg: 'purple.700' }}
                  onClick={() => setAddArticleMethod('form')}
                >
                  Form
                </Tab>
                <Tab
                  _selected={{ bg: 'purple.700' }}
                  onClick={() => setAddArticleMethod('json')}
                >
                  JSON
                </Tab>
              </TabList>
              <TabPanels>
                {/* Form Tab */}
                <TabPanel>
                  <FormControl mb={4} isRequired>
                    <FormLabel>Title</FormLabel>
                    <Input
                      name="title"
                      value={articleFormData.title}
                      onChange={handleArticleFormChange}
                      placeholder="Article title"
                      bg="gray.600"
                      borderColor="gray.500"
                      _hover={{ borderColor: 'gray.400' }}
                      _focus={{
                        borderColor: 'purple.500',
                        boxShadow: '0 0 0 1px purple.500',
                      }}
                    />
                  </FormControl>

                  <FormControl mb={4} isRequired>
                    <FormLabel>Main Text</FormLabel>
                    <Textarea
                      name="mainText"
                      value={articleFormData.mainText}
                      onChange={handleArticleFormChange}
                      placeholder="Article content..."
                      bg="gray.600"
                      borderColor="gray.500"
                      _hover={{ borderColor: 'gray.400' }}
                      _focus={{
                        borderColor: 'purple.500',
                        boxShadow: '0 0 0 1px purple.500',
                      }}
                      height="200px"
                    />
                  </FormControl>

                  <FormControl mb={4}>
                    <FormLabel>Author</FormLabel>
                    <Input
                      name="author"
                      value={articleFormData.author}
                      onChange={handleArticleFormChange}
                      placeholder="Article author"
                      bg="gray.600"
                      borderColor="gray.500"
                      _hover={{ borderColor: 'gray.400' }}
                      _focus={{
                        borderColor: 'purple.500',
                        boxShadow: '0 0 0 1px purple.500',
                      }}
                    />
                    <FormHelperText>
                      Defaults to "Rapid Recap Team" if empty
                    </FormHelperText>
                  </FormControl>

                  <FormControl mb={4}>
                    <FormLabel>Image URL</FormLabel>
                    <Input
                      name="imgURL"
                      value={articleFormData.imgURL}
                      onChange={handleArticleFormChange}
                      placeholder="https://example.com/image.jpg"
                      bg="gray.600"
                      borderColor="gray.500"
                      _hover={{ borderColor: 'gray.400' }}
                      _focus={{
                        borderColor: 'purple.500',
                        boxShadow: '0 0 0 1px purple.500',
                      }}
                    />
                  </FormControl>

                  <FormControl mb={4}>
                    <FormLabel>Date</FormLabel>
                    <Input
                      name="dateTime"
                      type="date"
                      value={articleFormData.dateTime}
                      onChange={handleArticleFormChange}
                      bg="gray.600"
                      borderColor="gray.500"
                      _hover={{ borderColor: 'gray.400' }}
                      _focus={{
                        borderColor: 'purple.500',
                        boxShadow: '0 0 0 1px purple.500',
                      }}
                    />
                    <FormHelperText>
                      Defaults to current date if empty
                    </FormHelperText>
                  </FormControl>
                </TabPanel>

                {/* JSON Tab */}
                <TabPanel>
                  <FormControl mb={4} isRequired>
                    <FormLabel>JSON Array of Articles</FormLabel>
                    <Textarea
                      value={articleJsonInput}
                      onChange={e => setArticleJsonInput(e.target.value)}
                      placeholder="[{ ... }]"
                      bg="gray.600"
                      borderColor="gray.500"
                      _hover={{ borderColor: 'gray.400' }}
                      _focus={{
                        borderColor: 'purple.500',
                        boxShadow: '0 0 0 1px purple.500',
                      }}
                      height="300px"
                      fontFamily="monospace"
                    />
                    <FormHelperText>
                      Enter a JSON array of article objects. Each object should
                      have at least title and mainText fields.
                    </FormHelperText>
                  </FormControl>

                  <Box mt={4} p={4} bg="gray.700" borderRadius="md">
                    <Heading size="sm" mb={2}>
                      Example Structure:
                    </Heading>
                    <Code
                      display="block"
                      whiteSpace="pre"
                      p={3}
                      bg="gray.800"
                      borderRadius="md"
                      overflowX="auto"
                    >
                      {`[
  {
    "title": "Article Title",
    "mainText": "Article content...",
    "author": "Author Name",
    "imgURL": ["https://example.com/image.jpg"],
    "dateTime": "2023-05-15T12:00:00.000Z"
  }
]`}
                    </Code>
                    <Text mt={2} fontSize="sm">
                      Note: The system will automatically add the category and
                      special category fields.
                    </Text>
                  </Box>
                </TabPanel>
              </TabPanels>
            </Tabs>

            <Alert status="info" mt={4}>
              <AlertIcon />
              Highlights will be automatically generated in the background for
              all added articles.
            </Alert>
          </ModalBody>

          <ModalFooter>
            <Button
              variant="outline"
              mr={3}
              onClick={() => handleAddArticleClose()}
              borderColor="gray.500"
              _hover={{ bg: 'gray.600' }}
            >
              Cancel
            </Button>
            <Button
              colorScheme="green"
              onClick={handleSubmitArticles}
              isLoading={addArticleLoading}
              loadingText="Adding..."
            >
              Add Articles
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default SpecialCategoryManagement
