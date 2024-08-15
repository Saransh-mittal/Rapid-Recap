import React, { useState } from 'react'
import {
  Input,
  InputGroup,
  InputRightElement,
  Box,
  Flex,
} from '@chakra-ui/react'
import { SearchIcon, CloseIcon } from '@chakra-ui/icons'
import { useDispatch, useSelector } from 'react-redux'
import {
  searchArticles,
  clearSearch,
  setSearchTerm,
} from '../../redux/articleSlice'

const ArticleSearchBar = () => {
  const [bgColor, setBgColor] = useState('rgba(26, 21, 39, 0.7)')
  const { searchTerm } = useSelector(state => state.articles)
  const dispatch = useDispatch()

  const handleSearch = () => {
    if (searchTerm.trim()) {
      dispatch(searchArticles({ query: searchTerm, page: 1, limit: 10 }))
    }
  }

  const handleClearSearch = () => {
    dispatch(setSearchTerm(''))
    dispatch(clearSearch())
  }

  const handleKeyDown = e => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <Flex
      width={{ base: '100%', lg: '50%' }}
      bg={bgColor}
      borderRadius="full"
      onFocus={() => setBgColor('rgba(26, 21, 39, 1)')}
      onBlur={() => setBgColor('rgba(26, 21, 39, 0.7)')}
      align="center"
    >
      <InputGroup>
        <Input
          fontFamily={'condensed'}
          placeholder="Search articles..."
          bg="transparent"
          border="none"
          borderRadius="full"
          color="white"
          _placeholder={{ color: 'whiteAlpha.500' }}
          _focus={{
            boxShadow: 'none',
          }}
          transition="all 0.3s ease"
          fontSize="16px"
          padding="12px 45px 12px 15px"
          value={searchTerm}
          onChange={e => dispatch(setSearchTerm(e.target.value))}
          onKeyDown={handleKeyDown}
        />
        <InputRightElement>
          {searchTerm && (
            <Box
              as="button"
              onClick={handleClearSearch}
              mr={2}
              _hover={{ opacity: 0.8 }}
            >
              <CloseIcon color="white" boxSize={3} />
            </Box>
          )}
        </InputRightElement>
      </InputGroup>
      <Flex
        as="button"
        onClick={handleSearch}
        bg="whiteAlpha.200"
        borderRadius="full"
        p={2}
        ml={2}
        _hover={{ bg: 'whiteAlpha.300' }}
      >
        <SearchIcon color="white" boxSize={5} />
      </Flex>
    </Flex>
  )
}

export default ArticleSearchBar
