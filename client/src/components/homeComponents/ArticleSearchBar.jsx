import React, { useState, useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  searchArticles,
  clearSearch,
  setSearchTerm,
} from '../../redux/articleSlice'
import SearchBarInput from './ArticleSearchComponent/SearchBarInput'
import SearchBarButton from './ArticleSearchComponent/SearchBarButton'
import { Flex, Box } from '@chakra-ui/react'

const ArticleSearchBar = () => {
  const [isHovered, setIsHovered] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const { searchTerm } = useSelector(state => state.articles)
  const dispatch = useDispatch()

  const handleSearch = useCallback(() => {
    if (searchTerm.trim()) {
      dispatch(searchArticles({ query: searchTerm, page: 1, limit: 10 }))
    } else {
      dispatch(clearSearch())
    }
  }, [searchTerm, dispatch])

  const handleClearSearch = useCallback(() => {
    dispatch(setSearchTerm(''))
    dispatch(clearSearch())
  }, [dispatch])

  const handleKeyDown = useCallback(
    e => {
      if (e.key === 'Enter') {
        handleSearch()
      }
    },
    [handleSearch],
  )

  const handleInputChange = useCallback(
    e => {
      const newSearchTerm = e.target.value
      dispatch(setSearchTerm(newSearchTerm))
      if (newSearchTerm === '') {
        dispatch(clearSearch())
      }
    },
    [dispatch],
  )

  const memoizedSearchBarInput = useMemo(
    () => (
      <SearchBarInput
        searchTerm={searchTerm}
        handleInputChange={handleInputChange}
        handleKeyDown={handleKeyDown}
        handleClearSearch={handleClearSearch}
        isHovered={isHovered}
        isFocused={isFocused}
      />
    ),
    [
      searchTerm,
      handleInputChange,
      handleKeyDown,
      handleClearSearch,
      isHovered,
      isFocused,
    ],
  )

  return (
    <Flex
      width={{ base: '100%', lg: '50%' }}
      position="relative"
      bg={isFocused ? 'rgba(26, 21, 39, 0.95)' : 'rgba(26, 21, 39, 0.7)'}
      borderRadius="full"
      alignItems="center"
      transition="all 0.3s ease"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      boxShadow={
        isFocused
          ? '0 0 0 1px rgba(255,255,255,0.15), 0 4px 20px rgba(0,0,0,0.3)'
          : isHovered
          ? '0 0 0 1px rgba(255,255,255,0.1), 0 4px 15px rgba(0,0,0,0.2)'
          : 'none'
      }
      _hover={{
        bg: 'rgba(26, 21, 39, 0.85)',
      }}
    >
      <Box
        position="absolute"
        inset="0"
        borderRadius="full"
        pointerEvents="none"
        bg="linear-gradient(45deg, transparent 0%, rgba(255,255,255,0.03) 100%)"
        opacity={isHovered ? 1 : 0}
        transition="opacity 0.3s ease"
      />
      {memoizedSearchBarInput}
      <SearchBarButton
        handleSearch={handleSearch}
        handleClearSearch={handleClearSearch}
        isHovered={isHovered}
        searchTerm={searchTerm}
      />
    </Flex>
  )
}

export default React.memo(ArticleSearchBar)
