import React from 'react'
import {
  Box,
  Container,
  Heading,
  useMediaQuery,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  InputGroup,
  InputLeftElement,
  Input,
  VStack,
  Text,
  useDisclosure,
  Collapse,
  Button,
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ruleBookPages } from '../assets/ruleBookData' // Your existing data import
import { Helmet } from 'react-helmet'
import { SearchIcon, ChevronDownIcon } from '@chakra-ui/icons'

const MotionBox = motion(Box)

// Helper function to create a glassmorphism style
const glassmorphismStyle = (opacity = 0.1) => ({
  bg: `rgba(216, 180, 254, ${opacity})`,
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.18)',
  borderRadius: 'xl',
  boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
})

// --- Search Bar with Deep Search Logic ---
const StyledSearchBar = ({ searchableData, onSelectResult }) => {
  const { t } = useTranslation('rulebook')
  const [query, setQuery] = React.useState('')

  const filteredResults = React.useMemo(() => {
    if (!query.trim()) return []
    const queryLower = query.toLowerCase()
    // Filter the pre-compiled searchable data
    return searchableData.filter(item =>
      item.searchCorpus.toLowerCase().includes(queryLower),
    )
  }, [query, searchableData])

  return (
    <Box position="relative" mb={8}>
      <InputGroup>
        <InputLeftElement pointerEvents="none">
          <SearchIcon color="purple.300" />
        </InputLeftElement>
        <Input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={t('searchPlaceholder', 'Search manual...')}
          variant="filled"
          sx={{
            ...glassmorphismStyle(0.2),
            color: 'whiteAlpha.900',
            _hover: { bg: `rgba(216, 180, 254, 0.3)` },
            _focus: {
              borderColor: 'pink.400',
              boxShadow: '0 0 15px rgba(236, 72, 153, 0.5)',
            },
          }}
        />
      </InputGroup>
      <AnimatePresence>
        {query && (
          <MotionBox
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            sx={glassmorphismStyle(0.3)}
            position="absolute"
            top="100%"
            left="0"
            right="0"
            mt={2}
            p={2}
            zIndex={20}
            maxH="300px"
            overflowY="auto"
          >
            <VStack spacing={1}>
              {filteredResults.length > 0 ? (
                filteredResults.map((result, index) => (
                  <Box
                    key={`${result.pageId}-${index}`}
                    w="full"
                    p={3}
                    borderRadius="md"
                    cursor="pointer"
                    _hover={{ bg: 'purple.500' }}
                    onClick={() => {
                      onSelectResult(result)
                      setQuery('')
                    }}
                  >
                    <Text color="white" fontWeight="bold">
                      {result.itemText}
                    </Text>
                    <Text color="whiteAlpha.600" fontSize="sm">
                      {result.pageTitle} &gt; {result.sectionTitle}
                    </Text>
                  </Box>
                ))
              ) : (
                <Box w="full" p={3} borderRadius="md">
                  <Text color="whiteAlpha.600" textAlign="center">
                    No results found.
                  </Text>
                </Box>
              )}
            </VStack>
          </MotionBox>
        )}
      </AnimatePresence>
    </Box>
  )
}

// --- Content Display with Deep Linking Logic ---
const ManualContentDisplay = ({
  pages,
  currentPage,
  onSelectPage,
  isOpen,
  onToggle,
  onClose,
  deepLinkInfo,
}) => {
  const contentEntries = Object.entries(currentPage.content || {})

  const sectionDefaultIndex = React.useMemo(() => {
    if (!deepLinkInfo?.openSection) return [0]
    const index = contentEntries.findIndex(
      ([sectionTitle]) => sectionTitle === deepLinkInfo.openSection,
    )
    return index !== -1 ? [index] : [0]
  }, [contentEntries, deepLinkInfo])

  const itemDefaultIndex = React.useMemo(() => {
    if (!deepLinkInfo?.openItem) return []
    const sectionContent = contentEntries.find(
      ([sectionTitle]) => sectionTitle === deepLinkInfo.openSection,
    )?.[1]
    if (!sectionContent) return []
    const index = sectionContent.findIndex(
      item => item.text === deepLinkInfo.openItem,
    )
    return index !== -1 ? [index] : []
  }, [contentEntries, deepLinkInfo])

  const [highlightedItem, setHighlightedItem] = React.useState(null)
  React.useEffect(() => {
    if (deepLinkInfo?.openItem) {
      setHighlightedItem(deepLinkInfo.openItem)
      const timer = setTimeout(() => setHighlightedItem(null), 2500) // Highlight for 2.5 seconds
      return () => clearTimeout(timer)
    }
  }, [deepLinkInfo])

  return (
    <MotionBox
      sx={glassmorphismStyle()}
      p={{ base: 4, md: 6 }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Button
        w="100%"
        onClick={onToggle}
        justifyContent="space-between"
        p={4}
        height="auto"
        mb={4}
        borderRadius="lg"
        bg="rgba(0,0,0,0.2)"
        _hover={{ bg: 'rgba(0,0,0,0.3)' }}
        display="flex"
        alignItems="center"
      >
        <Heading
          size="md"
          color="white"
          py={1}
          flex="1"
          textAlign="left"
          whiteSpace="normal"
          wordBreak="break-word"
          mr={3}
        >
          {currentPage.title}
        </Heading>
        <ChevronDownIcon w={6} h={6} />
      </Button>

      <Collapse in={isOpen} animateOpacity>
        <VStack
          align="stretch"
          spacing={2}
          mb={6}
          p={2}
          bg="rgba(0,0,0,0.2)"
          borderRadius="lg"
        >
          {pages.map(page => (
            <MotionBox
              key={page.id}
              as="button"
              onClick={() => {
                onSelectPage(page.id)
                onClose()
              }}
              p={3}
              textAlign="left"
              borderRadius="md"
              bg={currentPage.id === page.id ? 'pink.500' : 'transparent'}
              color={currentPage.id === page.id ? 'white' : 'whiteAlpha.800'}
              fontWeight="bold"
              _hover={{
                bg: currentPage.id === page.id ? 'pink.600' : 'whiteAlpha.200',
              }}
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              <Text>{page.title}</Text>
            </MotionBox>
          ))}
        </VStack>
      </Collapse>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <Accordion allowMultiple defaultIndex={sectionDefaultIndex}>
            {contentEntries.map(([sectionTitle, items]) => (
              <AccordionItem
                key={sectionTitle}
                border="none"
                bg="rgba(0,0,0,0.2)"
                borderRadius="lg"
                mb={4}
              >
                <AccordionButton
                  _hover={{ bg: 'rgba(255,255,255,0.1)' }}
                  borderRadius="lg"
                  p={4}
                >
                  <Box flex="1" textAlign="left">
                    <Heading size="sm" color="white">
                      {sectionTitle}
                    </Heading>
                  </Box>
                  <AccordionIcon color="white" />
                </AccordionButton>
                <AccordionPanel p={4} pt={2}>
                  <Accordion allowMultiple defaultIndex={itemDefaultIndex}>
                    {items.map((item, index) => {
                      const isHighlighted = highlightedItem === item.text
                      return (
                        <AccordionItem
                          key={index}
                          border="none"
                          bg="rgba(0,0,0,0.15)"
                          borderRadius="md"
                          mb={2}
                          boxShadow={
                            isHighlighted
                              ? '0 0 15px rgba(236, 72, 153, 0.6)'
                              : 'none'
                          }
                          transition="box-shadow 0.5s ease-in-out"
                        >
                          <AccordionButton
                            _hover={{ bg: 'rgba(255,255,255,0.1)' }}
                            borderRadius="md"
                            p={3}
                          >
                            <Box
                              flex="1"
                              textAlign="left"
                              fontWeight="bold"
                              color="pink.300"
                            >
                              {item.text}
                            </Box>
                            {item.hasDetails && (
                              <AccordionIcon color="pink.300" />
                            )}
                          </AccordionButton>
                          {item.hasDetails && (
                            <AccordionPanel
                              pb={4}
                              px={3}
                              borderTop="1px solid"
                              borderColor="rgba(236, 72, 153, 0.3)"
                            >
                              <Text mt={2} fontSize="sm" color="whiteAlpha.800">
                                {item.explanation}
                              </Text>
                            </AccordionPanel>
                          )}
                        </AccordionItem>
                      )
                    })}
                  </Accordion>
                </AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </AnimatePresence>
    </MotionBox>
  )
}

const RuleBook = () => {
  const { pageId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [isLargerThan768] = useMediaQuery('(min-width: 768px)')
  const { t, i18n } = useTranslation('rulebook')
  const { isOpen, onToggle, onClose } = useDisclosure()

  const pages = React.useMemo(() => ruleBookPages(), [i18n.language])

  // --- Create a flat, deeply searchable data structure for the entire manual ---
  const searchableData = React.useMemo(() => {
    const flatData = []
    pages.forEach(page => {
      Object.entries(page.content).forEach(([sectionTitle, items]) => {
        items.forEach(item => {
          // Combine all text into one string for simple, effective searching.
          const searchCorpus = [
            page.title,
            sectionTitle,
            item.text,
            item.explanation,
          ].join(' ')

          flatData.push({
            pageId: page.id,
            pageTitle: page.title,
            sectionTitle: sectionTitle,
            itemText: item.text,
            searchCorpus: searchCorpus,
          })
        })
      })
    })
    return flatData
  }, [pages])

  const currentPage = React.useMemo(
    () => pages.find(p => p.id === pageId) || pages[0],
    [pageId, pages],
  )

  React.useEffect(() => {
    if (!pageId || !pages.find(p => p.id === pageId)) {
      navigate(`/manual/${pages[0].id}`, { replace: true })
    }
  }, [pageId, navigate, pages])

  // Handle navigation from search results
  const handleSelectSearchResult = result => {
    navigate(`/manual/${result.pageId}`, {
      state: {
        openSection: result.sectionTitle,
        openItem: result.itemText,
        timestamp: Date.now(), // Force re-render on same-page navigation
      },
    })
  }

  return (
    <Box
      minH="100vh"
      w="full"
      pt={20}
      pb={10}
      bg="gray.900"
      bgImage="url('/path/to/your/space-background.png')"
    >
      <Helmet>
        <title>{t('meta.title')}</title>
        <meta name="description" content={t('meta.description')} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="true"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Orbitron:wght@700&family=Rajdhani:wght@400;600&display=swap"
          rel="stylesheet"
        />
      </Helmet>
      <Container
        maxW={isLargerThan768 ? 'container.md' : 'container.sm'}
        px={4}
        fontFamily="'Rajdhani', sans-serif"
      >
        <MotionBox
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          mb={8}
          textAlign="center"
        >
          <Heading
            fontSize={{ base: '4xl', md: '5xl' }}
            fontWeight="bold"
            color="white"
            letterSpacing="tight"
            fontFamily="'Orbitron', sans-serif"
            textShadow="0 0 10px #EC4899, 0 0 20px #EC4899"
          >
            {t('heading')}
          </Heading>
        </MotionBox>
        <Box position="relative" zIndex={10}>
          <StyledSearchBar
            searchableData={searchableData}
            onSelectResult={handleSelectSearchResult}
          />
          {currentPage && (
            <ManualContentDisplay
              pages={pages}
              currentPage={currentPage}
              onSelectPage={id => navigate(`/manual/${id}`)}
              isOpen={isOpen}
              onToggle={onToggle}
              onClose={onClose}
              deepLinkInfo={location.state}
            />
          )}
        </Box>
      </Container>
    </Box>
  )
}

export default RuleBook
