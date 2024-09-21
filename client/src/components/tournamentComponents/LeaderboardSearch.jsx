import React, { useState, useCallback } from 'react'
import {
  Input,
  InputGroup,
  InputLeftElement,
  Box,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react'
import { Search2Icon } from '@chakra-ui/icons'
import debounce from 'lodash.debounce'
import axios from 'axios'
import { useTranslation } from 'react-i18next'

const LeaderboardSearch = ({
  onSearch,
  setSearchLoad,
  tournamentId,
  onEmptySearch,
  setIsSearchActive,
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const toast = useToast()
  const { t } = useTranslation('LeaderboardSearch')

  const debouncedSearch = useCallback(
    debounce(async query => {
      if (!query || query === '') {
        onEmptySearch()
        return
      }
      setSearchLoad(true)
      try {
        const response = await axios.get(`/api/tournament/leaderboard/search`, {
          params: { searchQuery: query, tournamentId },
        })

        onSearch(response.data.leaderboard)
        if (response.data.leaderboard.length === 0) {
          toast({
            title: t('No players found'),
            status: 'info',
            duration: 3000,
            isClosable: true,
            position: 'top',
          })
        }
      } catch (error) {
        console.error('Error searching players:', error)
        toast({
          title: t('Error searching players'),
          status: 'error',
          duration: 3000,
          isClosable: true,
          position: 'top',
        })
      } finally {
        setSearchLoad(false)
      }
    }, 500),
    [onSearch, setSearchLoad, toast, onEmptySearch],
  )

  const handleSearch = e => {
    const query = e.target.value
    setSearchQuery(query)
    if (query === '') {
      setSearchLoad(false)
      onEmptySearch()
      debouncedSearch.cancel()
      return
    }
    setIsSearchActive(true)
    debouncedSearch(query)
  }

  return (
    <Box mb={4}>
      <InputGroup>
        <InputLeftElement pointerEvents="none">
          <Search2Icon color="gray.300" />
        </InputLeftElement>
        <Input
          type="text"
          placeholder={t('searchPlayer')}
          value={searchQuery}
          onChange={handleSearch}
          bg="whiteAlpha.200"
          border="none"
          color="white"
          _placeholder={{ color: 'gray.400' }}
          _focus={{
            boxShadow: `0 0 0 1px ${useColorModeValue('pink.500', 'pink.300')}`,
          }}
        />
      </InputGroup>
    </Box>
  )
}

export default LeaderboardSearch
