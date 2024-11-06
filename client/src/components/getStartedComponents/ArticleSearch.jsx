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

const MotionBox = motion(Box)

const ArticleSearch = ({ COLORS }) => {
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

        if (page === 1) {
          setSearchResults(result.articles)
        } else {
          setSearchResults(prev => [...prev, ...result.articles])
        }

        setTotalPages(result.totalPages)
        setHasMore(result.hasMore)
        setCurrentPage(result.currentPage)
      } catch (error) {
        toast({
          title: 'Search Error',
          description: error.message || 'Failed to search articles',
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    },
    [dispatch, toast],
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
            placeholder="Search thousands of news articles..."
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
                aria-label="Search articles"
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
