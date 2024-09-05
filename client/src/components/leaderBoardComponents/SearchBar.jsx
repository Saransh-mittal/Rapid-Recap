import { Input, useColorModeValue, useToast } from '@chakra-ui/react'
import debounce from 'lodash.debounce'
import axios from 'axios'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

const debouncedSearch = debounce(async (query, callback) => {
  try {
    if (!query || query === '') return
    const response = await axios.get(`/api/user/search?query=${query}`)
    callback(response.data)
  } catch (error) {
    console.error('Error searching users:', error)
  }
}, 800)

const SearchBar = ({ setSearchResults, setSearchLoad, w = '50%' }) => {
  const toast = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const { t } = useTranslation('SearchBar')

  const handleSearch = async event => {
    setSearchLoad(true)
    const { value } = event.target
    setSearchQuery(value)
    if (value === '') {
      setSearchLoad(false)
      setSearchResults([])
      debouncedSearch.cancel()
      return
    }
    debouncedSearch(value, responseData => {
      if (!value || value === '') return
      setSearchResults([...responseData])
      if (responseData.length === 0)
        toast({
          title: 'No user found',
          status: 'info',
          duration: 3000,
          isClosable: true,
          position: 'top',
        })
      setSearchLoad(false)
    })
  }

  return (
    <Input
      w={w}
      placeholder={t('searchUser')}
      value={searchQuery}
      onChange={handleSearch}
      bg="whiteAlpha.200"
      border="none"
      _focus={{
        boxShadow: `0 0 0 1px ${useColorModeValue('purple.500', 'purple.300')}`,
      }}
      color={'white'}
    />
  )
}

export default SearchBar
