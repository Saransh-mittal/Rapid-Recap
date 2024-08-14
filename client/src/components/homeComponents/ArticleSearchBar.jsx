import React, { useState } from 'react'
import {
  Input,
  InputGroup,
  InputRightElement,
  Box,
  Button,
} from '@chakra-ui/react'
import SearchIcon from '../../assets/svg/SearchIcon'
import { useDispatch } from 'react-redux'
import { searchArticles, clearSearch } from '../../redux/articleSlice' // We'll create this slice later

const ArticleSearchBar = () => {
  const [bgColor, setBgColor] = useState('rgba(26, 21, 39, 0.7)')
  const [searchTerm, setSearchTerm] = useState('')
  const dispatch = useDispatch()

  const handleSearch = () => {
    if (searchTerm.trim()) {
      dispatch(searchArticles({ query: searchTerm, page: 1, limit: 10 }))
    }
  }

  const handleClearSearch = () => {
    setSearchTerm('')
    dispatch(clearSearch())
  }

  const handleKeyDown = e => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <InputGroup
      width={{ base: '80%', lg: '50%' }}
      bg={bgColor}
      borderRadius="full"
      onFocus={() => setBgColor('rgba(26, 21, 39, 1)')}
      onBlur={() => setBgColor('rgba(26, 21, 39, 0.7)')}
    >
      <Input
        placeholder="Search articles..."
        bg="whiteAlpha.100"
        border="none"
        borderRadius="full"
        color="white"
        _placeholder={{ color: 'whiteAlpha.500' }}
        _focus={{
          bg: 'whiteAlpha.200',
          boxShadow: '0 0 10px rgba(255, 255, 255, 0.1)',
        }}
        transition="all 0.3s ease"
        fontSize="16px"
        padding="12px 45px 12px 15px"
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <InputRightElement width="4.5rem">
        {searchTerm && (
          <Button h="1.75rem" size="sm" onClick={handleClearSearch} mr={2}>
            Clear
          </Button>
        )}
        <Box as="button" onClick={handleSearch}>
          <SearchIcon width="20px" height="20px" />
        </Box>
      </InputRightElement>
    </InputGroup>
  )
}

export default ArticleSearchBar
