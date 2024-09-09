import React, { useState, useCallback } from 'react'
import {
  Input,
  InputGroup,
  InputLeftElement,
  Box,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react'
import { Search } from 'lucide-react'
import debounce from 'lodash.debounce'
import axios from 'axios'

const LeaderboardSearch = ({
  onSearch,
  setSearchLoad,
  tournamentId,
  onEmptySearch,
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const toast = useToast()

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
            title: 'No players found',
            status: 'info',
            duration: 3000,
            isClosable: true,
            position: 'top',
          })
        }
      } catch (error) {
        console.error('Error searching players:', error)
        toast({
          title: 'Error searching players',
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
    debouncedSearch(query)
  }

  return (
    <Box mb={4}>
      <InputGroup>
        <InputLeftElement pointerEvents="none">
          <Search color="gray.300" />
        </InputLeftElement>
        <Input
          type="text"
          placeholder={'Search players'}
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
