import React from 'react'
import { IconButton } from '@chakra-ui/react'
import { Search, X } from 'lucide-react'

const SearchBarButton = React.memo(
  ({ handleSearch, handleClearSearch, isHovered, searchTerm }) => (
    <IconButton
      onClick={searchTerm ? handleClearSearch : handleSearch}
      aria-label={searchTerm ? 'Clear search' : 'Search'}
      icon={
        searchTerm ? (
          <X
            size={18}
            style={{
              transition: 'all 0.3s',
              transform: isHovered ? 'scale(1.1)' : 'scale(1)',
            }}
          />
        ) : (
          <Search
            size={18}
            style={{
              transition: 'all 0.3s',
              transform: isHovered ? 'scale(1.1)' : 'scale(1)',
            }}
          />
        )
      }
      ml={2}
      mr={1}
      bg="whiteAlpha.100"
      _hover={{ bg: 'whiteAlpha.200' }}
      _active={{ bg: 'whiteAlpha.300' }}
      borderRadius="full"
      w="36px"
      h="36px"
      color="white"
      transition="all 0.3s"
      transform={isHovered ? 'translateY(-1px)' : 'translateY(0)'}
    />
  ),
)

export default SearchBarButton
