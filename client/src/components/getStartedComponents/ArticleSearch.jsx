import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react'
import {
  Box,
  Input,
  InputGroup,
  InputRightElement,
  IconButton,
  useOutsideClick,
  Spinner,
  useDisclosure,
  useToast,
  Portal,
} from '@chakra-ui/react'
import { Search2Icon } from '@chakra-ui/icons'
import debounce from 'lodash/debounce'
import { useDispatch } from 'react-redux'
import { searchArticles } from '../../redux/articleSlice'
import { motion, AnimatePresence } from 'framer-motion'
import useScrollAwarePosition from '../../customHooks/useScrollAwarePosition'
import SearchResults from './SearchResults'
import { useTranslation } from 'react-i18next'

const MotionBox = motion(Box)

const ArticleSearch = ({ COLORS }) => {
  const { t, i18n } = useTranslation('GetStarted')
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const searchRef = useRef()
  const resultsRef = useRef()
  const inputRef = useRef()
  const dispatch = useDispatch()
  const toast = useToast()
  const { top, left, width } = useScrollAwarePosition(searchRef)
  const currentLanguage = i18n.language

  useEffect(() => {
    return () => {
      setSearchResults([])
      setSearchQuery('')
      setCurrentPage(1)
      setTotalPages(0)
      setHasMore(false)
      setIsSearching(false)
    }
  }, [])

  useOutsideClick({
    ref: searchRef,
    handler: e => {
      if (resultsRef.current?.contains(e.target)) return
      onClose()
    },
  })

  // Transform search results based on language
  const transformSearchResults = useCallback(
    articles => {
      return articles.map(article => ({
        ...article,
        title:
          currentLanguage === 'hi' && article.hindiTitle
            ? article.hindiTitle
            : article.title,
        mainText:
          currentLanguage === 'hi' && article.hindiMainText
            ? article.hindiMainText
            : article.mainText,
        author:
          currentLanguage === 'hi' && article.hindiAuthor
            ? article.hindiAuthor
            : article.author,
      }))
    },
    [currentLanguage],
  )

  const performSearch = useCallback(
    async (query, page = 1) => {
      if (!query.trim()) {
        setSearchResults([])
        return
      }

      setIsSearching(true)
      try {
        const result = await dispatch(
          searchArticles({ query, page, limit: 5 }),
        ).unwrap()

        const transformedArticles = transformSearchResults(result.articles)

        if (page === 1) {
          setSearchResults(transformedArticles)
        } else {
          setSearchResults(prev => [...prev, ...transformedArticles])
        }

        setTotalPages(result.totalPages)
        setHasMore(result.hasMore)
        setCurrentPage(result.currentPage)
      } catch (error) {
        toast({
          title: t('SearchResults.searchError'),
          description: error.message || t('SearchResults.searchFailed'),
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    },
    [dispatch, toast, t, transformSearchResults],
  )

  const debouncedSearch = useMemo(
    () => debounce(query => performSearch(query), 300),
    [performSearch],
  )

  useEffect(() => {
    return () => {
      debouncedSearch.cancel()
    }
  }, [debouncedSearch])

  // Refresh search results when language changes
  useEffect(() => {
    if (searchQuery.trim() && searchResults.length > 0) {
      performSearch(searchQuery, 1)
    }
  }, [currentLanguage])

  const handleSearchChange = useCallback(
    e => {
      const query = e.target.value
      setSearchQuery(query)
      setCurrentPage(1)

      if (query.trim()) {
        onOpen()
        debouncedSearch(query)
      } else {
        onClose()
      }
    },
    [debouncedSearch, onOpen, onClose],
  )

  const loadMore = useCallback(() => {
    if (hasMore && !isSearching) {
      return performSearch(searchQuery, currentPage + 1)
    }
  }, [hasMore, isSearching, searchQuery, currentPage, performSearch])

  const handleSearchSubmit = useCallback(
    e => {
      e.preventDefault()
      if (searchQuery.trim()) {
        debouncedSearch.flush()
      }
    },
    [searchQuery, debouncedSearch],
  )

  const scrollbarStyles = useMemo(
    () => ({
      '&::-webkit-scrollbar': {
        width: '4px',
      },
      '&::-webkit-scrollbar-track': {
        width: '6px',
      },
      '&::-webkit-scrollbar-thumb': {
        background: COLORS.accent,
        borderRadius: '24px',
      },
    }),
    [COLORS.accent],
  )

  return (
    <Box position="relative" ref={searchRef} maxW="500px" w="100%">
      <form onSubmit={handleSearchSubmit}>
        <InputGroup size="lg">
          <Input
            ref={inputRef}
            bg={COLORS.darkBg}
            border="1px solid"
            borderColor={COLORS.cardBorder}
            _hover={{ borderColor: COLORS.accent }}
            _focus={{
              borderColor: COLORS.accent,
              boxShadow: `0 0 0 1px ${COLORS.accent}`,
            }}
            placeholder={t('Header.searchPlaceholder')}
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => searchQuery.trim() && onOpen()}
          />
          <InputRightElement>
            {isSearching ? (
              <Spinner size="sm" color={COLORS.accent} />
            ) : (
              <IconButton
                icon={<Search2Icon />}
                variant="ghost"
                color={COLORS.accent}
                _hover={{ bg: 'transparent' }}
                type="submit"
                aria-label={t('SearchResults.searchArticles')}
              />
            )}
          </InputRightElement>
        </InputGroup>
      </form>

      <AnimatePresence>
        {isOpen && (
          <Portal>
            <MotionBox
              ref={resultsRef}
              position="absolute"
              style={{
                top: `${top}px`,
                left: `${left}px`,
                width: `${width}px`,
              }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              bg={COLORS.darkBg}
              border="1px solid"
              borderColor={COLORS.cardBorder}
              borderRadius="lg"
              boxShadow="xl"
              maxH="80vh"
              overflowY="auto"
              zIndex={1000}
              sx={scrollbarStyles}
              onMouseDown={e => e.stopPropagation()}
            >
              <SearchResults
                isSearching={isSearching}
                searchResults={searchResults}
                hasMore={hasMore}
                loadMore={loadMore}
                COLORS={COLORS}
              />
            </MotionBox>
          </Portal>
        )}
      </AnimatePresence>
    </Box>
  )
}

export default React.memo(ArticleSearch)
