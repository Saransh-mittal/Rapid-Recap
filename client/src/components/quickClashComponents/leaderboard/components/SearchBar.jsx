// components/quickClashComponents/leaderboard/components/SearchBar.jsx
import React from 'react'
import {
  Box,
  Input,
  InputGroup,
  InputLeftElement,
  Icon,
  IconButton,
} from '@chakra-ui/react'
import { Search, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const SearchBar = React.memo(
  ({ searchQuery, setSearchQuery, handleClearSearch }) => {
    const { t } = useTranslation('QuickClash')

    return (
      <Box
        px={4}
        py={3}
        borderBottomWidth="1px"
        borderBottomColor="rgba(255, 255, 255, 0.03)"
        position="relative"
        zIndex={1}
      >
        <InputGroup size="sm">
          <InputLeftElement pointerEvents="none" h="32px">
            <Icon as={Search} color="whiteAlpha.500" boxSize={3.5} />
          </InputLeftElement>
          <Input
            placeholder={t('Search players...')}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            bg="rgba(24, 28, 44, 0.6)"
            border="1px solid rgba(255, 255, 255, 0.08)"
            color="white"
            _placeholder={{ color: 'whiteAlpha.500' }}
            _focus={{
              boxShadow: '0 0 0 1px rgba(138, 75, 255, 0.6)',
              borderColor: 'rgba(138, 75, 255, 0.6)',
              bg: 'rgba(24, 28, 44, 0.9)',
            }}
            borderRadius="full"
            h="32px"
            fontSize="sm"
          />
          {searchQuery && (
            <IconButton
              position="absolute"
              right={1}
              top={1}
              zIndex={2}
              h="24px"
              w="24px"
              minW="24px"
              borderRadius="full"
              onClick={handleClearSearch}
              aria-label="Clear search"
              icon={<X size={14} />}
              variant="ghost"
              color="whiteAlpha.600"
              _hover={{ bg: 'whiteAlpha.100' }}
            />
          )}
        </InputGroup>
      </Box>
    )
  },
)

SearchBar.displayName = 'SearchBar'

export default SearchBar
